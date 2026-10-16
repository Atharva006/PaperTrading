export type Exchange = 'NSE' | 'BSE' | 'NFO' | 'BFO' | 'MCX' | 'NCDEX';

export type InstrumentType = 
  | 'EQUITY' 
  | 'INDEX' 
  | 'FUTSTK' 
  | 'FUTIDX' 
  | 'OPTSTK' 
  | 'OPTIDX'
  | 'COMMODITY'
  | 'FUTCOM';

export type OptionType = 'CE' | 'PE';

export interface Instrument {
  instrument_key: string;       // e.g. "NSE_EQ|INE002A01018", "NSE_INDEX|Nifty 50", "NSE_FO|52345"
  tradingsymbol: string;        // e.g. "RELIANCE", "NIFTY 24OCT24500CE"
  name: string;                 // e.g. "Reliance Industries Ltd", "NIFTY 50"
  exchange: Exchange;
  instrument_type: InstrumentType;
  lot_size: number;             // e.g. 1 for equity, 25/50 for index
  tick_size: number;            // e.g. 0.05
  expiry?: string;              // ISO date string e.g. "2026-10-29"
  strike_price?: number;        // e.g. 25000
  option_type?: OptionType;     // "CE" or "PE"
  underlying_key?: string;      // e.g. "NSE_INDEX|Nifty 50"
  isin?: string;
  segment?: string;
}

export interface MarketQuote {
  instrument_key: string;
  tradingsymbol: string;
  last_price: number;
  open: number;
  high: number;
  low: number;
  close: number;                // Previous day close
  change: number;               // last_price - close
  change_percent: number;       // (change / close) * 100
  volume: number;
  average_price: number;
  oi?: number;                  // Open Interest
  oi_change?: number;
  total_buy_quantity?: number;
  total_sell_quantity?: number;
  lower_circuit_limit?: number;
  upper_circuit_limit?: number;
  depth?: MarketDepth;
  timestamp: string;
  is_live: boolean;
}

export interface MarketDepthEntry {
  price: number;
  quantity: number;
  orders: number;
}

export interface MarketDepth {
  buy: MarketDepthEntry[];
  sell: MarketDepthEntry[];
}

export interface OHLCV {
  time: number;                 // Unix timestamp in seconds for Lightweight Charts
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type CandleInterval = '1minute' | '5minute' | '15minute' | '30minute' | '1hour' | 'day';

export interface OptionGreek {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho?: number;
  iv: number;                   // Implied Volatility %
}

export interface OptionContract {
  instrument_key: string;
  tradingsymbol: string;
  strike_price: number;
  option_type: OptionType;
  expiry: string;
  lot_size: number;
  ltp: number;
  change: number;
  change_percent: number;
  volume: number;
  oi: number;
  oi_change: number;
  iv: number;
  greeks?: OptionGreek;
  bid: number;
  ask: number;
}

export interface OptionChainStrikeRow {
  strike_price: number;
  call?: OptionContract;
  put?: OptionContract;
}

export interface OptionChainData {
  underlying_key: string;
  underlying_symbol: string;
  underlying_price: number;
  expiry: string;
  available_expiries: string[];
  strikes: OptionChainStrikeRow[];
  total_call_oi: number;
  total_put_oi: number;
  pcr: number;                   // Put/Call Ratio = total_put_oi / total_call_oi
  max_pain?: number;
}

export interface MarketStatus {
  exchange: Exchange;
  status: 'OPEN' | 'CLOSED' | 'PRE_OPEN' | 'POST_CLOSE';
  message: string;
  last_updated: string;
}
