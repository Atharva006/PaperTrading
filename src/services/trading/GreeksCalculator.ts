import type { OptionGreek, OptionType } from '../../types/market';

export class GreeksCalculator {
  // Standard Normal Cumulative Distribution Function approximation (Abramowitz & Stegun)
  private static cdf(x: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    const absX = Math.abs(x) / Math.SQRT2;

    const t = 1.0 / (1.0 + p * absX);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

    return 0.5 * (1.0 + sign * y);
  }

  // Standard Normal Probability Density Function
  private static pdf(x: number): number {
    return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
  }

  /**
   * Computes theoretical Black-Scholes price for an option contract.
   * @param spot Current spot price of underlying
   * @param strike Strike price of option
   * @param timeToExpiry Time to expiration in years (e.g. 7 days = 7/365)
   * @param volatility Annualized volatility (e.g. 0.15 for 15%)
   * @param riskFreeRate Risk-free interest rate (e.g. 0.07 for 7% RBI repo rate)
   * @param type 'CE' (Call) or 'PE' (Put)
   */
  public static blackScholesPrice(
    spot: number,
    strike: number,
    timeToExpiry: number,
    volatility: number,
    riskFreeRate = 0.065,
    type: OptionType = 'CE'
  ): number {
    if (timeToExpiry <= 0) {
      return type === 'CE' ? Math.max(0, spot - strike) : Math.max(0, strike - spot);
    }

    const sigma = Math.max(0.01, volatility);
    const sqrtT = Math.sqrt(timeToExpiry);
    const d1 = (Math.log(spot / strike) + (riskFreeRate + 0.5 * sigma * sigma) * timeToExpiry) / (sigma * sqrtT);
    const d2 = d1 - sigma * sqrtT;

    if (type === 'CE') {
      return spot * this.cdf(d1) - strike * Math.exp(-riskFreeRate * timeToExpiry) * this.cdf(d2);
    } else {
      return strike * Math.exp(-riskFreeRate * timeToExpiry) * this.cdf(-d2) - spot * this.cdf(-d1);
    }
  }

  /**
   * Calculates Black-Scholes Greeks: Delta, Gamma, Theta, Vega and IV.
   */
  public static calculateGreeks(
    spot: number,
    strike: number,
    timeToExpiryYears: number,
    volatilityPercent: number,
    riskFreeRate = 0.065,
    type: OptionType = 'CE'
  ): OptionGreek {
    const T = Math.max(0.0001, timeToExpiryYears);
    const sigma = Math.max(0.01, volatilityPercent / 100);
    const sqrtT = Math.sqrt(T);

    const d1 = (Math.log(spot / strike) + (riskFreeRate + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
    const d2 = d1 - sigma * sqrtT;

    const nd1 = this.cdf(d1);
    const n_prime_d1 = this.pdf(d1);

    // Delta
    let delta = type === 'CE' ? nd1 : nd1 - 1;

    // Gamma
    const gamma = n_prime_d1 / (spot * sigma * sqrtT);

    // Theta (in ₹ per calendar day)
    let theta: number;
    const term1 = -(spot * n_prime_d1 * sigma) / (2 * sqrtT);
    const discount = strike * riskFreeRate * Math.exp(-riskFreeRate * T);

    if (type === 'CE') {
      theta = (term1 - discount * this.cdf(d2)) / 365;
    } else {
      theta = (term1 + discount * this.cdf(-d2)) / 365;
    }

    // Vega (per 1% change in volatility)
    const vega = (spot * sqrtT * n_prime_d1) / 100;

    const round4 = (v: number) => Math.round(v * 10000) / 10000;
    const round2 = (v: number) => Math.round(v * 100) / 100;

    return {
      delta: round4(delta),
      gamma: round4(gamma),
      theta: round2(theta),
      vega: round2(vega),
      iv: round2(volatilityPercent),
    };
  }

  /**
   * Computes Implied Volatility (IV) from observed market premium using Newton-Raphson.
   */
  public static impliedVolatility(
    premium: number,
    spot: number,
    strike: number,
    timeToExpiryYears: number,
    type: OptionType = 'CE',
    riskFreeRate = 0.065
  ): number {
    if (premium <= 0 || spot <= 0 || strike <= 0 || timeToExpiryYears <= 0) return 15;

    let sigma = 0.20; // 20% starting point
    const maxIterations = 50;
    const tolerance = 0.01;

    for (let i = 0; i < maxIterations; i++) {
      const price = this.blackScholesPrice(spot, strike, timeToExpiryYears, sigma, riskFreeRate, type);
      const diff = price - premium;

      if (Math.abs(diff) < tolerance) {
        return Math.round(sigma * 10000) / 100; // Returns e.g. 15.25%
      }

      const sqrtT = Math.sqrt(timeToExpiryYears);
      const d1 = (Math.log(spot / strike) + (riskFreeRate + 0.5 * sigma * sigma) * timeToExpiryYears) / (sigma * sqrtT);
      const vega = spot * sqrtT * this.pdf(d1);

      if (Math.abs(vega) < 1e-6) break;

      sigma = sigma - diff / vega;
      if (sigma <= 0.001) sigma = 0.001;
      if (sigma > 3.0) sigma = 3.0;
    }

    return Math.round(sigma * 10000) / 100;
  }
}
