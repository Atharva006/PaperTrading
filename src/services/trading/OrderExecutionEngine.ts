import { v4 as uuidv4 } from 'uuid';
import type { 
  Order, 
  Trade, 
  Position, 
  Holding, 
  PaperAccount, 
  LedgerEntry, 
  OrderEvent,
  OrderStatus 
} from '../../types/trading';
import type { MarketQuote } from '../../types/market';
import { FinancialCalculations } from './FinancialCalculations';
import { getZerodhaContractSpec } from '../market/indianInstruments';

export interface OrderSubmissionParams {
  account: PaperAccount;
  instrument_key: string;
  tradingsymbol: string;
  exchange: any;
  instrument_type: any;
  transaction_type: 'BUY' | 'SELL';
  product: 'CNC' | 'MIS' | 'NRML';
  order_type: 'MARKET' | 'LIMIT' | 'SL' | 'SL_M';
  quantity: number;
  lot_size?: number;
  price?: number;
  trigger_price?: number;
  validity?: 'DAY' | 'IOC';
  idempotency_key?: string;
  tag?: string;
}

export interface ExecutionResult {
  order: Order;
  trade?: Trade;
  updatedAccount: PaperAccount;
  updatedPositions: Position[];
  updatedHoldings: Holding[];
  ledgerEntries: LedgerEntry[];
  events: OrderEvent[];
  error?: string;
}

export class OrderExecutionEngine {
  /**
   * Process a newly placed order request.
   */
  public static processNewOrder(
    params: OrderSubmissionParams,
    currentQuote: MarketQuote | null,
    existingPositions: Position[],
    existingHoldings: Holding[],
    slippageBps = 5,
    allowAfterHours = true
  ): ExecutionResult {
    const {
      account,
      instrument_key,
      tradingsymbol,
      exchange,
      instrument_type,
      transaction_type,
      product,
      order_type,
      quantity,
      lot_size = 1,
      price = 0,
      trigger_price = 0,
      validity = 'DAY',
      idempotency_key,
      tag,
    } = params;

    const updatedAccount = { ...account };
    const updatedPositions = [...existingPositions];
    const updatedHoldings = [...existingHoldings];
    const ledgerEntries: LedgerEntry[] = [];
    const events: OrderEvent[] = [];

    const orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    const newOrder: Order = {
      id: uuidv4(),
      account_id: account.id,
      user_id: account.user_id,
      order_id: orderId,
      idempotency_key,
      instrument_key,
      tradingsymbol,
      exchange,
      instrument_type,
      transaction_type,
      product,
      order_type,
      quantity,
      lot_size,
      price,
      trigger_price,
      average_price: 0,
      filled_quantity: 0,
      pending_quantity: quantity,
      status: 'PENDING',
      validity,
      tag,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    events.push({
      id: uuidv4(),
      order_id: newOrder.id,
      event_type: 'PLACED',
      quantity,
      price: order_type === 'MARKET' ? (currentQuote?.last_price || price) : price,
      message: `Order submitted: ${transaction_type} ${quantity} ${tradingsymbol} @ ${order_type}`,
      created_at: new Date().toISOString(),
    });

    // Determine reference price for margin and execution (never default to fake price)
    const marketPrice = (currentQuote && currentQuote.last_price > 0) ? currentQuote.last_price : (price > 0 ? price : 0);
    const referencePrice = marketPrice;
    const marginPrice = (order_type === 'LIMIT' && price > 0) ? price : marketPrice;

    if (marketPrice <= 0 && order_type === 'MARKET') {
      newOrder.status = 'REJECTED';
      newOrder.rejection_reason = 'Live market quote is currently loading. Please retry in a second or specify a limit price.';
      events.push({
        id: uuidv4(),
        order_id: newOrder.id,
        event_type: 'REJECTED',
        quantity,
        price: 0,
        message: newOrder.rejection_reason,
        created_at: new Date().toISOString(),
      });
      return {
        order: newOrder,
        updatedAccount,
        updatedPositions,
        updatedHoldings,
        ledgerEntries,
        events,
        error: newOrder.rejection_reason,
      };
    }

    const contractSpec = getZerodhaContractSpec(tradingsymbol, instrument_type, exchange, lot_size);
    const contractMultiplier = contractSpec.multiplier;

    // Calculate required margin
    const requiredMargin = FinancialCalculations.calculateRequiredMargin({
      instrumentType: instrument_type,
      product,
      transactionType: transaction_type,
      quantity,
      price: marginPrice,
      multiplier: contractMultiplier,
    });

    // 1. Check Cash and Margin
    const availableCash = updatedAccount.cash_balance - updatedAccount.used_margin;
    if (transaction_type === 'BUY' && requiredMargin > availableCash) {
      newOrder.status = 'REJECTED';
      newOrder.rejection_reason = `Insufficient funds. Required: ₹${requiredMargin.toLocaleString('en-IN', { minimumFractionDigits: 2 })}, Available: ₹${availableCash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      events.push({
        id: uuidv4(),
        order_id: newOrder.id,
        event_type: 'REJECTED',
        message: newOrder.rejection_reason,
        created_at: new Date().toISOString(),
      });
      return {
        order: newOrder,
        updatedAccount,
        updatedPositions,
        updatedHoldings,
        ledgerEntries,
        events,
        error: newOrder.rejection_reason,
      };
    }

    // 2. Validate SELL for Delivery (CNC): User must hold the shares to sell CNC
    if (transaction_type === 'SELL' && product === 'CNC' && instrument_type === 'EQUITY') {
      const holding = updatedHoldings.find(h => h.instrument_key === instrument_key);
      if (!holding || holding.quantity < quantity) {
        newOrder.status = 'REJECTED';
        newOrder.rejection_reason = `Insufficient holdings to sell delivery shares. Holding: ${holding ? holding.quantity : 0}, Attempted: ${quantity}`;
        events.push({
          id: uuidv4(),
          order_id: newOrder.id,
          event_type: 'REJECTED',
          message: newOrder.rejection_reason,
          created_at: new Date().toISOString(),
        });
        return {
          order: newOrder,
          updatedAccount,
          updatedPositions,
          updatedHoldings,
          ledgerEntries,
          events,
          error: newOrder.rejection_reason,
        };
      }
    }

    // 3. Execution Simulation Check
    const shouldFillImmediately = this.checkImmediateFillEligibility(
      newOrder,
      referencePrice,
      allowAfterHours
    );

    if (!shouldFillImmediately) {
      // Order stays PENDING in the order book.
      // Lock margin for pending BUY orders so funds can't be spent twice!
      if (transaction_type === 'BUY') {
        updatedAccount.used_margin += requiredMargin;
        updatedAccount.available_margin = Math.max(0, updatedAccount.cash_balance - updatedAccount.used_margin);
      }
      return {
        order: newOrder,
        updatedAccount,
        updatedPositions,
        updatedHoldings,
        ledgerEntries,
        events,
      };
    }

    // 4. Fill Order
    let fillPrice = referencePrice;
    if (order_type === 'MARKET' || order_type === 'SL_M') {
      fillPrice = FinancialCalculations.applySlippage(referencePrice, transaction_type, slippageBps);
    } else {
      fillPrice = price > 0 ? price : referencePrice;
    }

    const tradeId = `TRD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    const charges = FinancialCalculations.calculateCharges({
      instrumentType: instrument_type,
      product,
      transactionType: transaction_type,
      quantity,
      price: fillPrice,
      multiplier: contractMultiplier,
    });

    const trade: Trade = {
      id: uuidv4(),
      account_id: account.id,
      user_id: account.user_id,
      order_id: newOrder.id,
      trade_id: tradeId,
      instrument_key,
      tradingsymbol,
      exchange,
      instrument_type,
      transaction_type,
      product,
      quantity,
      execution_price: fillPrice,
      charges,
      executed_at: new Date().toISOString(),
    };

    newOrder.status = 'COMPLETED';
    newOrder.filled_quantity = quantity;
    newOrder.pending_quantity = 0;
    newOrder.average_price = fillPrice;
    newOrder.updated_at = new Date().toISOString();

    events.push({
      id: uuidv4(),
      order_id: newOrder.id,
      event_type: 'FILLED',
      price: fillPrice,
      quantity,
      message: `Order filled: ${quantity} shares @ ₹${fillPrice}`,
      created_at: new Date().toISOString(),
    });

    // 5. Update Positions or Holdings
    if (product === 'CNC' && instrument_type === 'EQUITY') {
      // Equity Delivery Holding
      const holdingIdx = updatedHoldings.findIndex(h => h.instrument_key === instrument_key);
      const grossTradeValue = quantity * fillPrice;

      if (transaction_type === 'BUY') {
        updatedAccount.cash_balance -= (grossTradeValue + charges.total_charges);

        ledgerEntries.push({
          id: uuidv4(),
          account_id: account.id,
          user_id: account.user_id,
          entry_type: 'TRADE_DEBIT',
          reference_id: trade.trade_id,
          description: `Bought ${quantity} ${tradingsymbol} (CNC Delivery) @ ₹${fillPrice}`,
          debit: grossTradeValue,
          credit: 0,
          balance_after: updatedAccount.cash_balance + charges.total_charges,
          created_at: new Date().toISOString(),
        });

        ledgerEntries.push({
          id: uuidv4(),
          account_id: account.id,
          user_id: account.user_id,
          entry_type: 'CHARGES',
          reference_id: trade.trade_id,
          description: `Charges for Buy ${tradingsymbol} (Brokerage, STT, GST, etc.)`,
          debit: charges.total_charges,
          credit: 0,
          balance_after: updatedAccount.cash_balance,
          created_at: new Date().toISOString(),
        });

        if (holdingIdx >= 0) {
          const exHolding = updatedHoldings[holdingIdx];
          const totalQty = exHolding.quantity + quantity;
          const totalInvested = (exHolding.quantity * exHolding.average_price) + grossTradeValue;
          const newAvgPrice = Math.round((totalInvested / totalQty) * 100) / 100;
          updatedHoldings[holdingIdx] = {
            ...exHolding,
            quantity: totalQty,
            average_price: newAvgPrice,
            last_price: fillPrice,
            invested_value: totalInvested,
            current_value: totalQty * fillPrice,
            pnl: (totalQty * fillPrice) - totalInvested,
            pnl_percentage: (((totalQty * fillPrice) - totalInvested) / totalInvested) * 100,
            updated_at: new Date().toISOString(),
          };
        } else {
          updatedHoldings.push({
            id: uuidv4(),
            account_id: account.id,
            user_id: account.user_id,
            instrument_key,
            tradingsymbol,
            exchange,
            quantity,
            average_price: fillPrice,
            last_price: fillPrice,
            close_price: fillPrice,
            invested_value: grossTradeValue,
            current_value: grossTradeValue,
            pnl: 0,
            pnl_percentage: 0,
            day_change: 0,
            day_change_percent: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      } else {
        // transaction_type === 'SELL' CNC Delivery
        const exHolding = updatedHoldings[holdingIdx];
        const realizedGain = (fillPrice - exHolding.average_price) * quantity;
        updatedAccount.cash_balance += (grossTradeValue - charges.total_charges);

        ledgerEntries.push({
          id: uuidv4(),
          account_id: account.id,
          user_id: account.user_id,
          entry_type: 'TRADE_CREDIT',
          reference_id: trade.trade_id,
          description: `Sold ${quantity} ${tradingsymbol} (CNC Delivery) @ ₹${fillPrice} (Realized: ${realizedGain >= 0 ? '+' : ''}₹${realizedGain.toFixed(2)})`,
          debit: 0,
          credit: grossTradeValue,
          balance_after: updatedAccount.cash_balance + charges.total_charges,
          created_at: new Date().toISOString(),
        });

        ledgerEntries.push({
          id: uuidv4(),
          account_id: account.id,
          user_id: account.user_id,
          entry_type: 'CHARGES',
          reference_id: trade.trade_id,
          description: `Charges for Sell ${tradingsymbol} (Brokerage, STT, GST, etc.)`,
          debit: charges.total_charges,
          credit: 0,
          balance_after: updatedAccount.cash_balance,
          created_at: new Date().toISOString(),
        });

        if (exHolding.quantity === quantity) {
          // Completely sold out
          updatedHoldings.splice(holdingIdx, 1);
        } else {
          const remainingQty = exHolding.quantity - quantity;
          const remainingInvested = remainingQty * exHolding.average_price;
          updatedHoldings[holdingIdx] = {
            ...exHolding,
            quantity: remainingQty,
            invested_value: remainingInvested,
            current_value: remainingQty * fillPrice,
            pnl: (remainingQty * fillPrice) - remainingInvested,
            pnl_percentage: (((remainingQty * fillPrice) - remainingInvested) / remainingInvested) * 100,
            updated_at: new Date().toISOString(),
          };
        }
      }
    } else {
      // Derivatives (FUT/OPT) or Intraday Equity (MIS) -> Updates Positions
      const posIdx = updatedPositions.findIndex(
        p => p.instrument_key === instrument_key && p.product === product
      );
      const existingPos = posIdx >= 0 ? updatedPositions[posIdx] : null;

      const { updatedPosition, realizedPnL, closedQuantity } = FinancialCalculations.updatePositionWithFill(
        existingPos,
        {
          account_id: account.id,
          user_id: account.user_id,
          instrument_key,
          tradingsymbol,
          exchange,
          instrument_type,
          product,
          transaction_type,
          quantity,
          price: fillPrice,
          multiplier: contractMultiplier,
          lot_size: contractSpec.lotSize,
        }
      );

      // Settle Realized P&L and Charges in Ledger & Cash Balance
      if (closedQuantity > 0) {
        if (realizedPnL >= 0) {
          updatedAccount.cash_balance += realizedPnL;
          ledgerEntries.push({
            id: uuidv4(),
            account_id: account.id,
            user_id: account.user_id,
            entry_type: 'PNL_REALIZED',
            reference_id: trade.trade_id,
            description: `Realized Profit on ${closedQuantity} ${tradingsymbol}: +₹${realizedPnL.toFixed(2)}`,
            debit: 0,
            credit: realizedPnL,
            balance_after: updatedAccount.cash_balance,
            created_at: new Date().toISOString(),
          });
        } else {
          const absLoss = Math.abs(realizedPnL);
          updatedAccount.cash_balance -= absLoss;
          ledgerEntries.push({
            id: uuidv4(),
            account_id: account.id,
            user_id: account.user_id,
            entry_type: 'PNL_REALIZED',
            reference_id: trade.trade_id,
            description: `Realized Loss on ${closedQuantity} ${tradingsymbol}: -₹${absLoss.toFixed(2)}`,
            debit: absLoss,
            credit: 0,
            balance_after: updatedAccount.cash_balance,
            created_at: new Date().toISOString(),
          });
        }
      }

      // Deduct regulatory charges
      updatedAccount.cash_balance -= charges.total_charges;
      ledgerEntries.push({
        id: uuidv4(),
        account_id: account.id,
        user_id: account.user_id,
        entry_type: 'CHARGES',
        reference_id: trade.trade_id,
        description: `Trading charges for ${transaction_type} ${quantity} ${tradingsymbol}`,
        debit: charges.total_charges,
        credit: 0,
        balance_after: updatedAccount.cash_balance,
        created_at: new Date().toISOString(),
      });

      if (posIdx >= 0) {
        updatedPositions[posIdx] = updatedPosition;
      } else {
        updatedPosition.id = uuidv4();
        updatedPositions.push(updatedPosition);
      }
    }

    // Reconcile total used margin across all remaining open positions
    updatedAccount.used_margin = updatedPositions
      .filter(p => !p.is_closed && p.quantity !== 0)
      .reduce((sum, p) => sum + p.margin_required, 0);

    updatedAccount.available_margin = Math.max(0, updatedAccount.cash_balance - updatedAccount.used_margin);

    // Reconcile account equity = Cash Balance + Unrealized P&L + Total Holding Value
    const totalUnrealizedPnL = updatedPositions
      .filter(p => !p.is_closed)
      .reduce((sum, p) => sum + p.unrealized_pnl, 0);
    const totalHoldingsValue = updatedHoldings.reduce((sum, h) => sum + h.current_value, 0);
    updatedAccount.account_equity = updatedAccount.cash_balance + totalUnrealizedPnL + totalHoldingsValue;

    return {
      order: newOrder,
      trade,
      updatedAccount,
      updatedPositions,
      updatedHoldings,
      ledgerEntries,
      events,
    };
  }

  /**
   * Evaluates pending orders against incoming market quotes.
   * Checks limit prices, stop triggers, and fills eligible orders.
   */
  public static evaluatePendingOrders(
    pendingOrders: Order[],
    quotes: Record<string, MarketQuote>,
    account: PaperAccount,
    positions: Position[],
    holdings: Holding[],
    slippageBps = 5
  ): {
    updatedOrders: Order[];
    newTrades: Trade[];
    updatedAccount: PaperAccount;
    updatedPositions: Position[];
    updatedHoldings: Holding[];
    newLedgerEntries: LedgerEntry[];
    newEvents: OrderEvent[];
  } {
    let currAccount = { ...account };
    let currPositions = [...positions];
    let currHoldings = [...holdings];
    const updatedOrders: Order[] = [];
    const newTrades: Trade[] = [];
    const newLedgerEntries: LedgerEntry[] = [];
    const newEvents: OrderEvent[] = [];

    for (const order of pendingOrders) {
      if (order.status !== 'PENDING') {
        updatedOrders.push(order);
        continue;
      }

      const quote = quotes[order.instrument_key];
      if (!quote || quote.last_price <= 0) {
        updatedOrders.push(order);
        continue;
      }

      const ltp = quote.last_price;
      let shouldFill = false;
      let fillPrice = ltp;

      if (order.order_type === 'LIMIT') {
        if (order.transaction_type === 'BUY' && ltp <= order.price) {
          shouldFill = true;
          fillPrice = order.price;
        } else if (order.transaction_type === 'SELL' && ltp >= order.price) {
          shouldFill = true;
          fillPrice = order.price;
        }
      } else if (order.order_type === 'SL') {
        // Trigger condition
        const isTriggered = order.transaction_type === 'BUY'
          ? ltp >= order.trigger_price
          : ltp <= order.trigger_price;

        if (isTriggered) {
          // Check limit price
          if (order.transaction_type === 'BUY' && ltp <= order.price) {
            shouldFill = true;
            fillPrice = order.price;
          } else if (order.transaction_type === 'SELL' && ltp >= order.price) {
            shouldFill = true;
            fillPrice = order.price;
          }
        }
      } else if (order.order_type === 'SL_M') {
        const isTriggered = order.transaction_type === 'BUY'
          ? ltp >= order.trigger_price
          : ltp <= order.trigger_price;

        if (isTriggered) {
          shouldFill = true;
          fillPrice = FinancialCalculations.applySlippage(ltp, order.transaction_type, slippageBps);
        }
      }

      if (shouldFill) {
        // Release previously reserved margin
        const prevReservedMargin = FinancialCalculations.calculateRequiredMargin({
          instrumentType: order.instrument_type,
          product: order.product,
          transactionType: order.transaction_type,
          quantity: order.quantity,
          price: order.price > 0 ? order.price : ltp,
        });
        if (order.transaction_type === 'BUY') {
          currAccount.used_margin = Math.max(0, currAccount.used_margin - prevReservedMargin);
        }

        // Execute fill
        const fillResult = this.processNewOrder(
          {
            account: currAccount,
            instrument_key: order.instrument_key,
            tradingsymbol: order.tradingsymbol,
            exchange: order.exchange,
            instrument_type: order.instrument_type,
            transaction_type: order.transaction_type,
            product: order.product,
            order_type: order.order_type,
            quantity: order.quantity,
            lot_size: order.lot_size,
            price: fillPrice,
            idempotency_key: order.idempotency_key,
            tag: order.tag,
          },
          quote,
          currPositions,
          currHoldings,
          slippageBps,
          true
        );

        if (fillResult.trade) {
          const completedOrder = {
            ...order,
            status: 'COMPLETED' as OrderStatus,
            filled_quantity: order.quantity,
            pending_quantity: 0,
            average_price: fillPrice,
            updated_at: new Date().toISOString(),
          };
          updatedOrders.push(completedOrder);
          newTrades.push(fillResult.trade);
          currAccount = fillResult.updatedAccount;
          currPositions = fillResult.updatedPositions;
          currHoldings = fillResult.updatedHoldings;
          newLedgerEntries.push(...fillResult.ledgerEntries);
          newEvents.push(...fillResult.events);
        } else {
          updatedOrders.push(order);
        }
      } else {
        updatedOrders.push(order);
      }
    }

    return {
      updatedOrders,
      newTrades,
      updatedAccount: currAccount,
      updatedPositions: currPositions,
      updatedHoldings: currHoldings,
      newLedgerEntries,
      newEvents,
    };
  }

  /**
   * Cancels a pending order and releases any reserved margin.
   */
  public static cancelOrder(
    order: Order,
    account: PaperAccount
  ): {
    cancelledOrder: Order;
    updatedAccount: PaperAccount;
    event: OrderEvent;
  } {
    const updatedAccount = { ...account };
    const cancelledOrder: Order = {
      ...order,
      status: 'CANCELLED',
      updated_at: new Date().toISOString(),
    };

    if (order.status === 'PENDING' && order.transaction_type === 'BUY') {
      const reservedMargin = FinancialCalculations.calculateRequiredMargin({
        instrumentType: order.instrument_type,
        product: order.product,
        transactionType: order.transaction_type,
        quantity: order.quantity,
        price: order.price > 0 ? order.price : 100,
      });
      updatedAccount.used_margin = Math.max(0, updatedAccount.used_margin - reservedMargin);
      updatedAccount.available_margin = Math.max(0, updatedAccount.cash_balance - updatedAccount.used_margin);
    }

    const event: OrderEvent = {
      id: uuidv4(),
      order_id: order.id,
      event_type: 'CANCELLED',
      message: `Order ${order.order_id} cancelled by user`,
      created_at: new Date().toISOString(),
    };

    return { cancelledOrder, updatedAccount, event };
  }

  /**
   * Helper to determine if an order qualifies for immediate fill.
   */
  private static checkImmediateFillEligibility(
    order: Order,
    currentPrice: number,
    allowAfterHours: boolean
  ): boolean {
    if (order.order_type === 'MARKET') {
      return true;
    }

    if (order.order_type === 'LIMIT') {
      if (order.transaction_type === 'BUY') {
        return currentPrice <= order.price;
      } else {
        return currentPrice >= order.price;
      }
    }

    return false;
  }
}
