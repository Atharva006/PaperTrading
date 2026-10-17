# Testing Patterns

**Analysis Date:** 2026-10-17

## Test Framework

**Runner:**
- Vitest 5.0.4 - Native ESM and TypeScript test runner
- Configuration: Integrated directly into Vite pipeline

**Assertion Library:**
- Built-in `expect` from `vitest`
- Matchers used: `toBe`, `toEqual`, `toBeCloseTo`, `toBeGreaterThan`, `toBeNull`, `toBeDefined`

**Run Commands:**
```bash
npm test                                 # Run all test suites
npm test -- --run                        # Run all tests once (non-watch mode)
npm test -- src/tests/OrderExecutionEngine.test.ts   # Run specific test file
```

## Test File Organization

**Location:**
- Dedicated `src/tests/` directory:
  - `src/tests/FinancialCalculations.test.ts`
  - `src/tests/OrderExecutionEngine.test.ts`

**Naming:**
- Matches tested unit with `.test.ts` extension (e.g., `FinancialCalculations.test.ts`).

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect } from 'vitest';
import { FinancialCalculations } from '../services/trading/FinancialCalculations';

describe('FinancialCalculations - Indian Market P&L & Charges', () => {
  it('correctly calculates unrealized P&L for long positions', () => {
    // Arrange
    const qty = 100;
    const avgPrice = 2500;
    const currentPrice = 2550;
    const multiplier = 1;

    // Act
    const pnl = FinancialCalculations.calculateUnrealizedPnL(qty, avgPrice, currentPrice, multiplier);

    // Assert
    expect(pnl).toBe(5000);
  });
});
```

## Current Test Coverage

**1. `FinancialCalculations.test.ts`:**
- Unrealized P&L calculations for Long & Short positions.
- Derivative contract multipliers (NIFTY: 25/50, GOLDM: 10, SILVERM: 5).
- Realized P&L on closing and flipping positions.
- Exact Indian regulatory charges:
  - Securities Transaction Tax (STT) on delivery (0.1%) vs intraday equity (0.025% on sell).
  - Exchange transaction charges (NSE/BSE/MCX tiers).
  - SEBI turnover fees (₹10 per crore).
  - Stamp duty (0.015% on buy delivery, 0.003% on intraday, 0.002% on futures).
  - GST (18% on brokerage + exchange charges + SEBI charges).
- Option Greeks calculations: Delta, Gamma, Theta, Vega, Implied Volatility via Black-Scholes.

**2. `OrderExecutionEngine.test.ts`:**
- Market order processing with simulated slippage.
- Limit order queueing and validation.
- Stop-loss (SL) and Stop-loss Market (SL-M) triggers.
- Margin validation and rejection when required margin exceeds available cash.
- Position updates: Long-to-short and short-to-long flipping.
- Immutable ledger entry generation.

## Testing Guidelines for New Features

- Any modification to margin requirements, charges formulas, or matching logic **must** be accompanied by unit test assertions.
- Tests should execute without external network calls (pure in-memory evaluation).

---

*Testing analysis: 2026-10-17*
