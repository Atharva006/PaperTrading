import { describe, it, expect } from 'vitest';
import { FinancialCalculations } from '../services/trading/FinancialCalculations';
import { GreeksCalculator } from '../services/trading/GreeksCalculator';

describe('FinancialCalculations - Indian Market P&L & Charges', () => {
  it('correctly calculates unrealized P&L for long positions', () => {
    // Bought 100 shares of Reliance @ 2500, current price 2550
    const pnl = FinancialCalculations.calculateUnrealizedPnL(100, 2500, 2550, 1);
    expect(pnl).toBe(5000);

    // Long position in loss: bought @ 2500, current @ 2450
    const loss = FinancialCalculations.calculateUnrealizedPnL(100, 2500, 2450, 1);
    expect(loss).toBe(-5000);
  });

  it('correctly calculates unrealized P&L for short positions', () => {
    // Sold short 50 shares of TCS @ 3500, current price 3400 (Profit of 100 per share)
    const pnl = FinancialCalculations.calculateUnrealizedPnL(-50, 3500, 3400, 1);
    expect(pnl).toBe(5000);

    // Short position in loss: sold @ 3500, current @ 3600 (Loss of 100 per share)
    const loss = FinancialCalculations.calculateUnrealizedPnL(-50, 3500, 3600, 1);
    expect(loss).toBe(-5000);
  });

  it('correctly handles contract multipliers for derivatives', () => {
    // NIFTY Future: 1 lot (50 qty), buy @ 24500, current @ 24600, multiplier 1
    const pnl = FinancialCalculations.calculateUnrealizedPnL(50, 24500, 24600, 1);
    expect(pnl).toBe(5000);
  });

  it('calculates realized P&L on closing fills', () => {
    // Long close: entered @ 100, exited @ 120, qty 50
    const gain = FinancialCalculations.calculateRealizedPnL(true, 100, 120, 50, 1);
    expect(gain).toBe(1000);

    // Short close: entered @ 200, exited @ 180, qty 30
    const shortGain = FinancialCalculations.calculateRealizedPnL(false, 200, 180, 30, 1);
    expect(shortGain).toBe(600);
  });

  it('calculates Indian regulatory charges accurately', () => {
    // Buy 100 shares of Infosys @ 1500 (Turnover: 1,50,000) CNC Delivery
    const cncBuy = FinancialCalculations.calculateCharges({
      instrumentType: 'EQUITY',
      product: 'CNC',
      transactionType: 'BUY',
      quantity: 100,
      price: 1500,
    });
    // Delivery brokerage: 0
    expect(cncBuy.brokerage).toBe(0);
    // STT: 0.1% on 150000 = 150
    expect(cncBuy.stt).toBe(150);
    // Stamp duty: 0.015% on 150000 = 22.5
    expect(cncBuy.stamp_duty).toBe(22.5);
    // Total charges should be positive
    expect(cncBuy.total_charges).toBeGreaterThan(170);

    // Intraday (MIS) Buy 100 shares @ 1500
    const misBuy = FinancialCalculations.calculateCharges({
      instrumentType: 'EQUITY',
      product: 'MIS',
      transactionType: 'BUY',
      quantity: 100,
      price: 1500,
    });
    // Max brokerage cap of ₹20
    expect(misBuy.brokerage).toBe(20);

    // Options Buy: Flat ₹20 brokerage
    const optBuy = FinancialCalculations.calculateCharges({
      instrumentType: 'OPTIDX',
      product: 'NRML',
      transactionType: 'BUY',
      quantity: 50,
      price: 120,
    });
    expect(optBuy.brokerage).toBe(20);
    expect(optBuy.gst).toBeGreaterThan(3.5); // 18% of brokerage + charges
  });

  it('calculates margin requirements accurately', () => {
    // Equity Delivery: 100% of value
    const deliveryMargin = FinancialCalculations.calculateRequiredMargin({
      instrumentType: 'EQUITY',
      product: 'CNC',
      transactionType: 'BUY',
      quantity: 10,
      price: 1000,
    });
    expect(deliveryMargin).toBe(10000);

    // Equity Intraday: 20% margin (5x leverage)
    const misMargin = FinancialCalculations.calculateRequiredMargin({
      instrumentType: 'EQUITY',
      product: 'MIS',
      transactionType: 'BUY',
      quantity: 10,
      price: 1000,
    });
    expect(misMargin).toBe(2000);

    // Option Buy: Premium only (50 qty * ₹100 premium = ₹5000)
    const optBuyMargin = FinancialCalculations.calculateRequiredMargin({
      instrumentType: 'OPTIDX',
      product: 'NRML',
      transactionType: 'BUY',
      quantity: 50,
      price: 100,
    });
    expect(optBuyMargin).toBe(5000);
  });

  it('applies simulated slippage with tick size rounding', () => {
    // Buy 2500 with 5 bps slippage (2500 * 0.0005 = 1.25 -> 2501.25)
    const buySlipped = FinancialCalculations.applySlippage(2500, 'BUY', 5);
    expect(buySlipped).toBe(2501.25);

    // Sell 2500 with 5 bps slippage (2500 - 1.25 = 2498.75)
    const sellSlipped = FinancialCalculations.applySlippage(2500, 'SELL', 5);
    expect(sellSlipped).toBe(2498.75);
  });
});

describe('GreeksCalculator - Black-Scholes Formula Verification', () => {
  it('correctly calculates option Greeks for ATM Call and Put', () => {
    const spot = 24500;
    const strike = 24500;
    const timeToExpiryYears = 7 / 365; // 7 days to expiry
    const iv = 15; // 15% IV

    const callGreeks = GreeksCalculator.calculateGreeks(spot, strike, timeToExpiryYears, iv, 0.065, 'CE');
    // ATM Call Delta should be approximately 0.50
    expect(callGreeks.delta).toBeGreaterThan(0.45);
    expect(callGreeks.delta).toBeLessThan(0.55);
    expect(callGreeks.gamma).toBeGreaterThan(0);
    expect(callGreeks.theta).toBeLessThan(0); // Option decay is negative
    expect(callGreeks.vega).toBeGreaterThan(0);

    const putGreeks = GreeksCalculator.calculateGreeks(spot, strike, timeToExpiryYears, iv, 0.065, 'PE');
    // ATM Put Delta should be approximately -0.50
    expect(putGreeks.delta).toBeGreaterThan(-0.55);
    expect(putGreeks.delta).toBeLessThan(-0.45);
  });

  it('inverts implied volatility correctly', () => {
    const spot = 24500;
    const strike = 24500;
    const timeToExpiryYears = 14 / 365;
    const theoreticalPrice = GreeksCalculator.blackScholesPrice(spot, strike, timeToExpiryYears, 0.16, 0.065, 'CE');

    const recoveredIv = GreeksCalculator.impliedVolatility(theoreticalPrice, spot, strike, timeToExpiryYears, 'CE');
    expect(Math.abs(recoveredIv - 16.0)).toBeLessThan(0.2);
  });
});
