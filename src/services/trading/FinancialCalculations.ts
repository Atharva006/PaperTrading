import type { RegulatoryCharges, TransactionType, ProductType, Position } from '../../types/trading';
import type { InstrumentType } from '../../types/market';

export interface ChargeCalculationParams {
  instrumentType: InstrumentType;
  product: ProductType;
  transactionType: TransactionType;
  quantity: number;
  price: number;
  multiplier?: number;
}

export interface MarginRequirementParams {
  instrumentType: InstrumentType;
  product: ProductType;
  transactionType: TransactionType;
  quantity: number;
  price: number;
  underlyingPrice?: number;
  multiplier?: number;
}

export class FinancialCalculations {
  /**
   * Calculates regulatory and broker charges for Indian stock and derivative markets.
   * Based on standard institutional exchange fee schedule.
   */
  public static calculateCharges(params: ChargeCalculationParams): RegulatoryCharges {
    const { instrumentType, product, transactionType, quantity, price, multiplier = 1 } = params;
    const turnover = quantity * price * multiplier;

    if (turnover <= 0 || quantity <= 0) {
      return {
        brokerage: 0,
        stt: 0,
        exchange_charges: 0,
        sebi_charges: 0,
        stamp_duty: 0,
        gst: 0,
        total_charges: 0,
      };
    }

    let brokerage = 0;
    let stt = 0;
    let exchange_charges = 0;
    let stamp_duty = 0;

    const isBuy = transactionType === 'BUY';
    const isSell = transactionType === 'SELL';

    switch (instrumentType) {
      case 'EQUITY':
        if (product === 'CNC') {
          // Delivery: ₹0 brokerage, 0.1% STT on both buy and sell
          brokerage = 0;
          stt = turnover * 0.001; // 0.1%
          exchange_charges = turnover * 0.0000297; // NSE 0.00297%
          stamp_duty = isBuy ? turnover * 0.00015 : 0; // 0.015% on buy
        } else {
          // Intraday (MIS): Min of ₹20 or 0.05%
          brokerage = Math.min(20, turnover * 0.0005);
          stt = isSell ? turnover * 0.00025 : 0; // 0.025% on sell only
          exchange_charges = turnover * 0.0000297;
          stamp_duty = isBuy ? turnover * 0.00003 : 0; // 0.003% on buy
        }
        break;

      case 'FUTIDX':
      case 'FUTSTK':
        // Futures: Min of ₹20 or 0.05%
        brokerage = Math.min(20, turnover * 0.0005);
        stt = isSell ? turnover * 0.0002 : 0; // 0.02% on sell
        exchange_charges = turnover * 0.0000173; // NSE Fut 0.00173%
        stamp_duty = isBuy ? turnover * 0.00002 : 0; // 0.002% on buy
        break;

      case 'OPTIDX':
      case 'OPTSTK':
        // Options: Flat ₹20 per order
        brokerage = 20;
        stt = isSell ? turnover * 0.001 : 0; // 0.1% on sell premium
        exchange_charges = turnover * 0.0003503; // NSE Opt 0.03503% on premium
        stamp_duty = isBuy ? turnover * 0.00003 : 0; // 0.003% on buy premium
        break;

      case 'COMMODITY':
      case 'FUTCOM':
        // Commodities (MCX / NCDEX): Min of ₹20 or 0.05%
        brokerage = Math.min(20, turnover * 0.0005);
        stt = isSell ? turnover * 0.0001 : 0; // CTT 0.01% on sell side
        exchange_charges = turnover * 0.000021; // MCX approx 0.0021%
        stamp_duty = isBuy ? turnover * 0.00002 : 0; // 0.002% on buy side
        break;

      case 'INDEX':
      default:
        brokerage = 0;
        break;
    }

    // Statutory Regulatory Charges: ₹10 per crore (0.0001% of turnover)
    const sebi_charges = turnover * 0.000001;

    // GST: 18% on (Brokerage + Exchange Charges + Statutory Charges)
    const taxable_services = brokerage + exchange_charges + sebi_charges;
    const gst = taxable_services * 0.18;

    const round2 = (val: number) => Math.round(val * 100) / 100;

    const b = round2(brokerage);
    const s = round2(stt);
    const ec = round2(exchange_charges);
    const sc = round2(sebi_charges);
    const sd = round2(stamp_duty);
    const g = round2(gst);
    const total = round2(b + s + ec + sc + sd + g);

    return {
      brokerage: b,
      stt: s,
      exchange_charges: ec,
      sebi_charges: sc,
      stamp_duty: sd,
      gst: g,
      total_charges: total,
    };
  }

  /**
   * Calculates unrealized P&L for a position.
   * For Long: (Current Price - Avg Entry Price) * Quantity * Multiplier
   * For Short: (Avg Entry Price - Current Price) * Quantity * Multiplier
   * NOTE: For Short positions, quantity in the position object is negative,
   * so Math.abs(quantity) is used with the short formula.
   */
  public static calculateUnrealizedPnL(
    quantity: number,
    averagePrice: number,
    currentPrice: number,
    multiplier = 1
  ): number {
    if (quantity === 0 || averagePrice <= 0 || currentPrice <= 0) return 0;

    let pnl = 0;
    if (quantity > 0) {
      // Long
      pnl = (currentPrice - averagePrice) * quantity * multiplier;
    } else {
      // Short
      pnl = (averagePrice - currentPrice) * Math.abs(quantity) * multiplier;
    }

    return Math.round(pnl * 100) / 100;
  }

  /**
   * Calculates realized P&L when closing (partially or fully) a position.
   * @param isLongClosing True if closing a long position (selling to close)
   * @param entryPrice Average entry price
   * @param exitPrice Execution fill price
   * @param closedQuantity Units closed (positive number)
   * @param multiplier Contract multiplier (default 1)
   */
  public static calculateRealizedPnL(
    isLongClosing: boolean,
    entryPrice: number,
    exitPrice: number,
    closedQuantity: number,
    multiplier = 1
  ): number {
    if (closedQuantity <= 0) return 0;

    let grossPnl = 0;
    if (isLongClosing) {
      grossPnl = (exitPrice - entryPrice) * closedQuantity * multiplier;
    } else {
      grossPnl = (entryPrice - exitPrice) * closedQuantity * multiplier;
    }

    return Math.round(grossPnl * 100) / 100;
  }

  /**
   * Calculates estimated margin required to enter an order or hold a position.
   */
  public static calculateRequiredMargin(params: MarginRequirementParams): number {
    const { instrumentType, product, transactionType, quantity, price, underlyingPrice, multiplier = 1 } = params;
    const notional = quantity * price * multiplier;

    if (quantity <= 0 || price <= 0) return 0;

    switch (instrumentType) {
      case 'EQUITY':
        if (product === 'CNC') {
          // Cash & carry requires 100% funds
          return Math.round(notional * 100) / 100;
        }
        // MIS Intraday (approx 20% margin / 5x leverage)
        return Math.round(notional * 0.2 * 100) / 100;

      case 'FUTIDX':
      case 'FUTSTK': {
        // Futures: approx 20% Span + Exposure margin
        const marginRate = product === 'MIS' ? 0.10 : 0.20;
        return Math.round(notional * marginRate * 100) / 100;
      }

      case 'OPTIDX':
      case 'OPTSTK': {
        if (transactionType === 'BUY') {
          // Buying option only requires full premium payment
          return Math.round(notional * 100) / 100;
        } else {
          // Selling (writing) option: Span + Exposure on underlying
          const spot = underlyingPrice && underlyingPrice > 0 ? underlyingPrice : price * 50;
          const underlyingNotional = quantity * spot;
          const marginRate = product === 'MIS' ? 0.12 : 0.22;
          return Math.round((underlyingNotional * marginRate + notional) * 100) / 100;
        }
      }

      case 'COMMODITY':
      case 'FUTCOM': {
        // MCX Commodity Futures: ~12% SPAN + Exposure margin (MIS: ~5%)
        const marginRate = product === 'MIS' ? 0.05 : 0.12;
        return Math.round(notional * marginRate * 100) / 100;
      }

      default:
        return Math.round(notional * 100) / 100;
    }
  }

  /**
   * Applies simulated slippage to order execution price based on order size and volatility.
   * Slippage increases execution price on BUY, decreases on SELL.
   */
  public static applySlippage(
    price: number,
    transactionType: TransactionType,
    slippageBps = 5
  ): number {
    const factor = slippageBps / 10000; // e.g. 5 bps = 0.0005
    const slippageAmount = price * factor;
    const executionPrice = transactionType === 'BUY' ? price + slippageAmount : price - slippageAmount;
    // Round to standard Indian market tick size of 0.05
    return Math.round(executionPrice * 20) / 20;
  }

  /**
   * Updates an existing position with a new fill and recalculates weighted average entry,
   * realized P&L (if closing), and remaining open quantity.
   */
  public static updatePositionWithFill(
    currentPosition: Position | null,
    fill: {
      account_id: string;
      user_id: string;
      instrument_key: string;
      tradingsymbol: string;
      exchange: any;
      instrument_type: InstrumentType;
      product: ProductType;
      transaction_type: TransactionType;
      quantity: number;
      price: number;
      multiplier?: number;
      lot_size?: number;
    }
  ): {
    updatedPosition: Position;
    realizedPnL: number;
    closedQuantity: number;
  } {
    const mult = fill.multiplier || currentPosition?.multiplier || 1;
    const lotSize = fill.lot_size || currentPosition?.lot_size || 1;

    let pos: Position = currentPosition
      ? { ...currentPosition }
      : {
          id: '',
          account_id: fill.account_id,
          user_id: fill.user_id,
          instrument_key: fill.instrument_key,
          tradingsymbol: fill.tradingsymbol,
          exchange: fill.exchange,
          instrument_type: fill.instrument_type,
          product: fill.product,
          quantity: 0,
          buy_quantity: 0,
          buy_value: 0,
          buy_price: 0,
          sell_quantity: 0,
          sell_value: 0,
          sell_price: 0,
          realized_pnl: 0,
          unrealized_pnl: 0,
          last_price: fill.price,
          close_price: fill.price,
          multiplier: mult,
          lot_size: lotSize,
          margin_required: 0,
          is_closed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

    let realizedPnL = 0;
    let closedQuantity = 0;

    const fillQty = fill.quantity;
    const fillPrice = fill.price;
    const fillValue = fillQty * fillPrice;

    if (fill.transaction_type === 'BUY') {
      if (pos.quantity < 0) {
        // Closing or reducing an existing SHORT position
        const currentShortQty = Math.abs(pos.quantity);
        closedQuantity = Math.min(currentShortQty, fillQty);
        realizedPnL = this.calculateRealizedPnL(false, pos.sell_price, fillPrice, closedQuantity, mult);

        pos.realized_pnl += realizedPnL;
        pos.quantity += fillQty; // Moves closer to zero or turns positive

        if (pos.quantity > 0) {
          // Position reversed from Short to Long!
          const remainingLongQty = pos.quantity;
          pos.buy_quantity = remainingLongQty;
          pos.buy_value = remainingLongQty * fillPrice;
          pos.buy_price = fillPrice;
          pos.sell_quantity = 0;
          pos.sell_value = 0;
          pos.sell_price = 0;
        }
      } else {
        // Increasing or creating a LONG position
        const newBuyQty = pos.buy_quantity + fillQty;
        const newBuyValue = pos.buy_value + fillValue;
        pos.buy_quantity = newBuyQty;
        pos.buy_value = newBuyValue;
        pos.buy_price = Math.round((newBuyValue / newBuyQty) * 100) / 100;
        pos.quantity += fillQty;
      }
    } else {
      // fill.transaction_type === 'SELL'
      if (pos.quantity > 0) {
        // Closing or reducing an existing LONG position
        const currentLongQty = pos.quantity;
        closedQuantity = Math.min(currentLongQty, fillQty);
        realizedPnL = this.calculateRealizedPnL(true, pos.buy_price, fillPrice, closedQuantity, mult);

        pos.realized_pnl += realizedPnL;
        pos.quantity -= fillQty; // Moves closer to zero or turns negative

        if (pos.quantity < 0) {
          // Position reversed from Long to Short!
          const remainingShortQty = Math.abs(pos.quantity);
          pos.sell_quantity = remainingShortQty;
          pos.sell_value = remainingShortQty * fillPrice;
          pos.sell_price = fillPrice;
          pos.buy_quantity = 0;
          pos.buy_value = 0;
          pos.buy_price = 0;
        }
      } else {
        // Increasing or creating a SHORT position
        const newSellQty = pos.sell_quantity + fillQty;
        const newSellValue = pos.sell_value + fillValue;
        pos.sell_quantity = newSellQty;
        pos.sell_value = newSellValue;
        pos.sell_price = Math.round((newSellValue / newSellQty) * 100) / 100;
        pos.quantity -= fillQty;
      }
    }

    pos.is_closed = pos.quantity === 0;
    pos.last_price = fillPrice;
    pos.unrealized_pnl = this.calculateUnrealizedPnL(
      pos.quantity,
      pos.quantity > 0 ? pos.buy_price : pos.sell_price,
      fillPrice,
      mult
    );
    pos.margin_required = pos.is_closed
      ? 0
      : this.calculateRequiredMargin({
          instrumentType: pos.instrument_type,
          product: pos.product,
          transactionType: pos.quantity > 0 ? 'BUY' : 'SELL',
          quantity: Math.abs(pos.quantity),
          price: fillPrice,
        });
    pos.updated_at = new Date().toISOString();

    return {
      updatedPosition: pos,
      realizedPnL,
      closedQuantity,
    };
  }
}
