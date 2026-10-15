import { describe, it, expect } from 'vitest';
import { OrderExecutionEngine } from '../services/trading/OrderExecutionEngine';
import type { PaperAccount, Position, Holding } from '../types/trading';
import type { MarketQuote } from '../types/market';

describe('OrderExecutionEngine - Simulation Lifecycle', () => {
  const mockAccount: PaperAccount = {
    id: 'acc-123',
    user_id: 'usr-456',
    account_number: 'IN-PT-TEST',
    account_name: 'Test Virtual Account',
    currency: 'INR',
    initial_balance: 1000000,
    cash_balance: 1000000,
    used_margin: 0,
    available_margin: 1000000,
    account_equity: 1000000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockQuote: MarketQuote = {
    instrument_key: 'NSE_EQ|INE002A01018',
    tradingsymbol: 'RELIANCE',
    last_price: 2500,
    open: 2480,
    high: 2520,
    low: 2470,
    close: 2490,
    change: 10,
    change_percent: 0.4,
    volume: 1200000,
    average_price: 2495,
    timestamp: new Date().toISOString(),
    is_live: true,
  };

  it('rejects order if user has insufficient cash balance', () => {
    const brokeAccount: PaperAccount = {
      ...mockAccount,
      cash_balance: 1000,
      available_margin: 1000,
    };

    // Attempt to buy 100 shares @ 2500 (Requires ₹2,50,000)
    const result = OrderExecutionEngine.processNewOrder(
      {
        account: brokeAccount,
        instrument_key: 'NSE_EQ|INE002A01018',
        tradingsymbol: 'RELIANCE',
        exchange: 'NSE',
        instrument_type: 'EQUITY',
        transaction_type: 'BUY',
        product: 'CNC',
        order_type: 'MARKET',
        quantity: 100,
      },
      mockQuote,
      [],
      []
    );

    expect(result.order.status).toBe('REJECTED');
    expect(result.error).toContain('Insufficient funds');
    expect(result.trade).toBeUndefined();
  });

  it('successfully executes a simulated market order and creates holding and ledger', () => {
    const result = OrderExecutionEngine.processNewOrder(
      {
        account: mockAccount,
        instrument_key: 'NSE_EQ|INE002A01018',
        tradingsymbol: 'RELIANCE',
        exchange: 'NSE',
        instrument_type: 'EQUITY',
        transaction_type: 'BUY',
        product: 'CNC',
        order_type: 'MARKET',
        quantity: 10,
      },
      mockQuote,
      [],
      [],
      0 // 0 slippage for exact math
    );

    expect(result.order.status).toBe('COMPLETED');
    expect(result.trade).toBeDefined();
    expect(result.trade?.execution_price).toBe(2500);
    expect(result.updatedHoldings.length).toBe(1);
    expect(result.updatedHoldings[0].quantity).toBe(10);
    expect(result.updatedHoldings[0].invested_value).toBe(25000);
    expect(result.updatedAccount.cash_balance).toBeLessThan(1000000 - 25000); // deducted value + charges
    expect(result.ledgerEntries.length).toBe(2); // Trade debit + charges debit
  });

  it('places a limit order as PENDING when price condition is not satisfied', () => {
    // Current price is 2500. Limit buy placed at 2400 (below current price)
    const result = OrderExecutionEngine.processNewOrder(
      {
        account: mockAccount,
        instrument_key: 'NSE_EQ|INE002A01018',
        tradingsymbol: 'RELIANCE',
        exchange: 'NSE',
        instrument_type: 'EQUITY',
        transaction_type: 'BUY',
        product: 'CNC',
        order_type: 'LIMIT',
        quantity: 10,
        price: 2400,
      },
      mockQuote,
      [],
      []
    );

    expect(result.order.status).toBe('PENDING');
    expect(result.trade).toBeUndefined();
    // Reserved margin for pending buy
    expect(result.updatedAccount.used_margin).toBe(24000);
  });

  it('cancels pending order and releases reserved margin', () => {
    const pendingOrderResult = OrderExecutionEngine.processNewOrder(
      {
        account: mockAccount,
        instrument_key: 'NSE_EQ|INE002A01018',
        tradingsymbol: 'RELIANCE',
        exchange: 'NSE',
        instrument_type: 'EQUITY',
        transaction_type: 'BUY',
        product: 'CNC',
        order_type: 'LIMIT',
        quantity: 10,
        price: 2400,
      },
      mockQuote,
      [],
      []
    );

    expect(pendingOrderResult.updatedAccount.used_margin).toBe(24000);

    const cancelResult = OrderExecutionEngine.cancelOrder(
      pendingOrderResult.order,
      pendingOrderResult.updatedAccount
    );

    expect(cancelResult.cancelledOrder.status).toBe('CANCELLED');
    expect(cancelResult.updatedAccount.used_margin).toBe(0);
    expect(cancelResult.updatedAccount.available_margin).toBe(mockAccount.cash_balance);
  });
});
