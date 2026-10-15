import type { 
  Instrument, 
  MarketQuote, 
  OHLCV, 
  OptionChainData, 
  OptionChainStrikeRow,
  OptionContract,
  MarketStatus, 
  CandleInterval, 
  Exchange, 
  InstrumentType 
} from '../../types/market';
import type { MarketDataProvider } from './MarketDataProvider';
import { INDIAN_INSTRUMENTS_MASTER } from './indianInstruments';
import { GreeksCalculator } from '../trading/GreeksCalculator';

const BASE_PRICES: Record<string, number> = {
  'NSE_INDEX|Nifty 50': 24520.50,
  'NSE_INDEX|Nifty Bank': 52140.25,
  'NSE_INDEX|Nifty Fin Service': 23890.10,
  'BSE_INDEX|SENSEX': 80450.80,
  'NSE_INDEX|Nifty IT': 38240.00,
  'NSE_INDEX|Nifty Auto': 21950.00,
  'NSE_EQ|INE002A01018': 2548.70, // RELIANCE
  'NSE_EQ|INE040A01034': 1682.40, // HDFCBANK
  'NSE_EQ|INE467B01029': 3950.00, // TCS
  'NSE_EQ|INE009A01021': 1824.50, // INFY
  'NSE_EQ|INE090A01021': 1245.30, // ICICIBANK
  'NSE_EQ|INE062A01020': 822.60,  // SBIN
  'NSE_EQ|INE397D01024': 1485.00, // BHARTIARTL
  'NSE_EQ|INE154A01025': 492.20,  // ITC
  'NSE_EQ|INE018A01030': 3650.00, // LT
  'NSE_EQ|INE155A01022': 945.00,  // TATAMOTORS
  'NSE_EQ|INE296A01024': 7150.00, // BAJFINANCE
  'NSE_EQ|INE585B01010': 12400.0, // MARUTI
  'NSE_EQ|INE044A01036': 1780.00, // SUNPHARMA
  'NSE_EQ|INE238A01034': 1175.50, // AXISBANK
  'NSE_EQ|INE280A01028': 3450.00, // TITAN
  'NSE_EQ|INE075A01022': 510.40,  // WIPRO
  'NSE_EQ|INE081A01020': 158.20,  // TATASTEEL
};

export class DemoMarketProvider implements MarketDataProvider {
  public readonly providerName = 'Demo Market Provider';
  private quoteCache = new Map<string, MarketQuote>();
  private activeSubscriptions = new Map<string, Set<(quote: MarketQuote) => void>>();
  private tickerInterval: any = null;

  constructor() {
    this.initDefaultQuotes();
    this.startTickerSimulation();
  }

  public isConfigured(): boolean {
    return true; // Demo provider is always ready
  }

  private initDefaultQuotes(): void {
    INDIAN_INSTRUMENTS_MASTER.forEach((inst) => {
      const base = BASE_PRICES[inst.instrument_key] || 1000;
      const prevClose = Math.round(base * 0.992 * 20) / 20;
      const change = Math.round((base - prevClose) * 100) / 100;
      const changePercent = Math.round((change / prevClose) * 10000) / 100;

      const quote: MarketQuote = {
        instrument_key: inst.instrument_key,
        tradingsymbol: inst.tradingsymbol,
        last_price: base,
        open: Math.round((prevClose * 1.002) * 20) / 20,
        high: Math.round((base * 1.015) * 20) / 20,
        low: Math.round((base * 0.988) * 20) / 20,
        close: prevClose,
        change,
        change_percent: changePercent,
        volume: Math.floor(Math.random() * 5000000) + 500000,
        average_price: base,
        oi: inst.instrument_type.startsWith('FUT') || inst.instrument_type.startsWith('OPT')
          ? Math.floor(Math.random() * 2000000) + 100000
          : undefined,
        timestamp: new Date().toISOString(),
        is_live: false,
        depth: {
          buy: [
            { price: Math.round((base - 0.05) * 20) / 20, quantity: 1500, orders: 12 },
            { price: Math.round((base - 0.10) * 20) / 20, quantity: 2400, orders: 18 },
            { price: Math.round((base - 0.15) * 20) / 20, quantity: 3800, orders: 25 },
            { price: Math.round((base - 0.20) * 20) / 20, quantity: 5100, orders: 32 },
            { price: Math.round((base - 0.25) * 20) / 20, quantity: 8200, orders: 40 },
          ],
          sell: [
            { price: Math.round((base + 0.05) * 20) / 20, quantity: 1200, orders: 9 },
            { price: Math.round((base + 0.10) * 20) / 20, quantity: 2100, orders: 15 },
            { price: Math.round((base + 0.15) * 20) / 20, quantity: 3500, orders: 22 },
            { price: Math.round((base + 0.20) * 20) / 20, quantity: 4900, orders: 28 },
            { price: Math.round((base + 0.25) * 20) / 20, quantity: 7600, orders: 37 },
          ],
        },
      };

      this.quoteCache.set(inst.instrument_key, quote);
    });
  }

  private startTickerSimulation(): void {
    if (this.tickerInterval) return;

    this.tickerInterval = setInterval(() => {
      // Pick 3-5 random instruments and gently jitter price
      const keys = Array.from(this.quoteCache.keys());
      if (keys.length === 0) return;

      const count = Math.min(keys.length, 4);
      for (let i = 0; i < count; i++) {
        const randIdx = Math.floor(Math.random() * keys.length);
        const key = keys[randIdx];
        const quote = this.quoteCache.get(key);
        if (!quote) continue;

        const maxJitter = quote.last_price > 10000 ? 5.0 : quote.last_price > 1000 ? 0.75 : 0.25;
        const delta = (Math.random() - 0.49) * maxJitter;
        const newPrice = Math.round((quote.last_price + delta) * 20) / 20;

        quote.last_price = newPrice;
        quote.high = Math.max(quote.high, newPrice);
        quote.low = Math.min(quote.low, newPrice);
        quote.change = Math.round((newPrice - quote.close) * 100) / 100;
        quote.change_percent = Math.round((quote.change / quote.close) * 10000) / 100;
        quote.volume += Math.floor(Math.random() * 50) + 10;
        quote.timestamp = new Date().toISOString();

        // Notify subscribers
        const subs = this.activeSubscriptions.get(key);
        if (subs) {
          subs.forEach((cb) => cb(quote));
        }
      }
    }, 1500);
  }

  public async searchInstruments(
    query: string,
    exchange?: Exchange,
    type?: InstrumentType
  ): Promise<Instrument[]> {
    const q = query.trim().toUpperCase();
    return INDIAN_INSTRUMENTS_MASTER.filter((inst) => {
      const matchQuery = !q || inst.tradingsymbol.toUpperCase().includes(q) || inst.name.toUpperCase().includes(q);
      const matchEx = !exchange || inst.exchange === exchange;
      const matchType = !type || inst.instrument_type === type;
      return matchQuery && matchEx && matchType;
    });
  }

  public async getQuote(instrumentKey: string): Promise<MarketQuote | null> {
    const cached = this.quoteCache.get(instrumentKey);
    if (cached) return { ...cached };

    // Check if it's an option contract
    if (instrumentKey.startsWith('NSE_OPT|')) {
      return this.generateSyntheticOptionQuote(instrumentKey);
    }

    return null;
  }

  public async getQuotes(instrumentKeys: string[]): Promise<Record<string, MarketQuote>> {
    const result: Record<string, MarketQuote> = {};
    for (const key of instrumentKeys) {
      const quote = await this.getQuote(key);
      if (quote) {
        result[key] = quote;
      }
    }
    return result;
  }

  public async getHistoricalCandles(
    instrumentKey: string,
    interval: CandleInterval = 'day',
    _toDate?: string,
    _fromDate?: string
  ): Promise<OHLCV[]> {
    const quote = await this.getQuote(instrumentKey);
    const basePrice = quote ? quote.last_price : 2000;

    const candles: OHLCV[] = [];
    const count = interval === 'day' ? 60 : interval === '1hour' ? 70 : 100;
    const now = Math.floor(Date.now() / 1000);

    let stepSeconds = 86400; // 1 day
    if (interval === '1minute') stepSeconds = 60;
    else if (interval === '5minute') stepSeconds = 300;
    else if (interval === '15minute') stepSeconds = 900;
    else if (interval === '30minute') stepSeconds = 1800;
    else if (interval === '1hour') stepSeconds = 3600;

    let currPrice = basePrice * 0.94; // Start 6% lower to show slight uptrend
    const startTime = now - count * stepSeconds;

    for (let i = 0; i < count; i++) {
      const time = startTime + i * stepSeconds;
      const volatility = basePrice * 0.008;
      const drift = (Math.random() - 0.48) * volatility;
      const open = Math.round(currPrice * 20) / 20;
      const close = Math.round((open + drift) * 20) / 20;
      const high = Math.round((Math.max(open, close) + Math.random() * volatility * 0.8) * 20) / 20;
      const low = Math.round((Math.min(open, close) - Math.random() * volatility * 0.8) * 20) / 20;
      const volume = Math.floor(Math.random() * 80000) + 15000;

      candles.push({ time, open, high, low, close, volume });
      currPrice = close;
    }

    // Set the last candle close equal to current quote price
    if (quote && candles.length > 0) {
      const last = candles[candles.length - 1];
      last.close = quote.last_price;
      last.high = Math.max(last.high, quote.last_price);
      last.low = Math.min(last.low, quote.last_price);
    }

    return candles;
  }

  public async getExpiries(_underlyingKey: string): Promise<string[]> {
    // Return next 4 upcoming Thursdays
    const expiries: string[] = [];
    const today = new Date();
    const d = new Date(today);

    let added = 0;
    while (added < 4) {
      d.setDate(d.getDate() + 1);
      // Thursday is day 4 in JS
      if (d.getDay() === 4) {
        expiries.push(d.toISOString().split('T')[0]);
        added++;
      }
    }
    return expiries;
  }

  public async getOptionChain(
    underlyingKey: string,
    expiry?: string
  ): Promise<OptionChainData | null> {
    const underlyingQuote = await this.getQuote(underlyingKey);
    const spot = underlyingQuote ? underlyingQuote.last_price : 24500;
    const isBankNifty = underlyingKey.includes('Bank');
    const isSensex = underlyingKey.includes('SENSEX');
    const isStock = underlyingKey.startsWith('NSE_EQ|');

    const strikeStep = isBankNifty ? 100 : isSensex ? 100 : isStock ? (spot > 3000 ? 50 : 20) : 50;
    const lotSize = isBankNifty ? 15 : isSensex ? 10 : isStock ? 250 : 25;

    const availableExpiries = await this.getExpiries(underlyingKey);
    const selectedExpiry = expiry || availableExpiries[0] || '2026-10-29';

    // Calculate days to expiry
    const expDate = new Date(selectedExpiry);
    const diffDays = Math.max(1, Math.round((expDate.getTime() - Date.now()) / (1000 * 3600 * 24)));
    const timeToExpiryYears = diffDays / 365;

    // ATM strike rounded to strikeStep
    const atmStrike = Math.round(spot / strikeStep) * strikeStep;
    const strikesCount = 10; // 10 strikes ITM, 10 OTM
    const strikeRows: OptionChainStrikeRow[] = [];

    let totalCallOi = 0;
    let totalPutOi = 0;

    for (let i = -strikesCount; i <= strikesCount; i++) {
      const strikePrice = atmStrike + i * strikeStep;
      const iv = 14.5 + Math.abs(i) * 0.15; // Realistic volatility smile

      // Call Contract
      const callBS = GreeksCalculator.blackScholesPrice(spot, strikePrice, timeToExpiryYears, iv / 100, 0.065, 'CE');
      const callLtp = Math.max(0.5, Math.round(callBS * 20) / 20);
      const callGreeks = GreeksCalculator.calculateGreeks(spot, strikePrice, timeToExpiryYears, iv, 0.065, 'CE');
      const callOi = Math.floor(Math.random() * 800000) + 150000;
      totalCallOi += callOi;

      const callContract: OptionContract = {
        instrument_key: `NSE_OPT|${underlyingKey}_${strikePrice}_CE_${selectedExpiry}`,
        tradingsymbol: `${underlyingQuote?.tradingsymbol || 'NIFTY'} ${selectedExpiry.slice(5)} ${strikePrice} CE`,
        strike_price: strikePrice,
        option_type: 'CE',
        expiry: selectedExpiry,
        lot_size: lotSize,
        ltp: callLtp,
        change: Math.round((Math.random() * 8 - 4) * 100) / 100,
        change_percent: Math.round((Math.random() * 6 - 3) * 100) / 100,
        volume: Math.floor(Math.random() * 400000) + 50000,
        oi: callOi,
        oi_change: Math.floor(Math.random() * 50000) - 20000,
        iv,
        greeks: callGreeks,
        bid: Math.max(0.05, Math.round((callLtp - 0.10) * 20) / 20),
        ask: Math.round((callLtp + 0.10) * 20) / 20,
      };

      // Put Contract
      const putBS = GreeksCalculator.blackScholesPrice(spot, strikePrice, timeToExpiryYears, iv / 100, 0.065, 'PE');
      const putLtp = Math.max(0.5, Math.round(putBS * 20) / 20);
      const putGreeks = GreeksCalculator.calculateGreeks(spot, strikePrice, timeToExpiryYears, iv, 0.065, 'PE');
      const putOi = Math.floor(Math.random() * 800000) + 150000;
      totalPutOi += putOi;

      const putContract: OptionContract = {
        instrument_key: `NSE_OPT|${underlyingKey}_${strikePrice}_PE_${selectedExpiry}`,
        tradingsymbol: `${underlyingQuote?.tradingsymbol || 'NIFTY'} ${selectedExpiry.slice(5)} ${strikePrice} PE`,
        strike_price: strikePrice,
        option_type: 'PE',
        expiry: selectedExpiry,
        lot_size: lotSize,
        ltp: putLtp,
        change: Math.round((Math.random() * 8 - 4) * 100) / 100,
        change_percent: Math.round((Math.random() * 6 - 3) * 100) / 100,
        volume: Math.floor(Math.random() * 400000) + 50000,
        oi: putOi,
        oi_change: Math.floor(Math.random() * 50000) - 20000,
        iv,
        greeks: putGreeks,
        bid: Math.max(0.05, Math.round((putLtp - 0.10) * 20) / 20),
        ask: Math.round((putLtp + 0.10) * 20) / 20,
      };

      strikeRows.push({
        strike_price: strikePrice,
        call: callContract,
        put: putContract,
      });
    }

    const pcr = totalCallOi > 0 ? Math.round((totalPutOi / totalCallOi) * 100) / 100 : 1.0;

    return {
      underlying_key: underlyingKey,
      underlying_symbol: underlyingQuote?.tradingsymbol || 'NIFTY 50',
      underlying_price: spot,
      expiry: selectedExpiry,
      available_expiries: availableExpiries,
      strikes: strikeRows,
      total_call_oi: totalCallOi,
      total_put_oi: totalPutOi,
      pcr,
      max_pain: atmStrike,
    };
  }

  public async getMarketStatus(): Promise<MarketStatus> {
    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours();
    const mins = now.getMinutes();
    const totalMinutes = hours * 60 + mins;

    // Normal Indian market hours: 9:15 AM (555 min) to 3:30 PM (930 min), Mon-Fri
    const isWeekday = day >= 1 && day <= 5;
    const isMarketOpen = isWeekday && totalMinutes >= 555 && totalMinutes <= 930;

    return {
      exchange: 'NSE',
      status: isMarketOpen ? 'OPEN' : 'CLOSED',
      message: isMarketOpen
        ? 'NSE/BSE Indian Live Market is Open (Demo Simulation Active)'
        : 'Indian Markets Closed (Testing Mode Enabled - 24/7 Virtual Orders Allowed)',
      last_updated: now.toISOString(),
    };
  }

  public subscribeQuotes(
    instrumentKeys: string[],
    onTick: (quote: MarketQuote) => void
  ): () => void {
    instrumentKeys.forEach((key) => {
      if (!this.activeSubscriptions.has(key)) {
        this.activeSubscriptions.set(key, new Set());
      }
      this.activeSubscriptions.get(key)!.add(onTick);

      // Emit initial quote immediately
      const quote = this.quoteCache.get(key);
      if (quote) {
        onTick(quote);
      }
    });

    return () => {
      instrumentKeys.forEach((key) => {
        this.activeSubscriptions.get(key)?.delete(onTick);
      });
    };
  }

  private generateSyntheticOptionQuote(key: string): MarketQuote {
    // Extract info from key e.g. NSE_OPT|NSE_INDEX|Nifty 50_24500_CE_2026-10-29
    const parts = key.split('_');
    const type = parts[parts.length - 2] || 'CE';
    const strike = parseFloat(parts[parts.length - 3]) || 24500;
    const base = 120.50;

    return {
      instrument_key: key,
      tradingsymbol: `OPT ${strike} ${type}`,
      last_price: base,
      open: base * 0.98,
      high: base * 1.15,
      low: base * 0.85,
      close: base * 0.95,
      change: base * 0.05,
      change_percent: 5.26,
      volume: 320000,
      average_price: base,
      oi: 450000,
      timestamp: new Date().toISOString(),
      is_live: false,
    };
  }
}
