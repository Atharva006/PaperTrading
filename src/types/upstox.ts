export interface UpstoxAuthTokenResponse {
  email: string;
  exchanges: string[];
  products: string[];
  broker: string;
  user_id: string;
  user_name: string;
  order_types: string[];
  user_type: string;
  poa: boolean;
  is_active: boolean;
  access_token: string;
  extended_token?: string;
}

export interface UpstoxQuoteDepthItem {
  quantity: number;
  price: number;
  orders: number;
}

export interface UpstoxQuoteItem {
  instrument_token?: string;
  timestamp?: string;
  last_price?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  average_price?: number;
  oi?: number;
  net_change?: number;
  lower_circuit_limit?: number;
  upper_circuit_limit?: number;
  ohlc?: {
    open: number;
    high: number;
    low: number;
    close: number;
  };
  quotes?: {
    volume?: number;
    average_price?: number;
    oi?: number;
    net_change?: number;
    lower_circuit_limit?: number;
    upper_circuit_limit?: number;
  };
  depth?: {
    buy: UpstoxQuoteDepthItem[];
    sell: UpstoxQuoteDepthItem[];
    last_price?: number;
  };
}

export interface UpstoxQuotesResponse {
  status: 'success' | 'error';
  data: Record<string, UpstoxQuoteItem>;
  errors?: Array<{ errorCode: string; message: string }>;
}

export interface UpstoxHistoricalCandleResponse {
  status: 'success' | 'error';
  data: {
    // Each candle is: [timestamp, open, high, low, close, volume, oi]
    candles: Array<[string, number, number, number, number, number, number]>;
  };
}

export interface UpstoxOptionChainItem {
  expiry: string;
  pcr: number;
  strike_price: number;
  underlying_key: string;
  underlying_spot_price: number;
  call_options?: {
    instrument_key: string;
    market_data: {
      ltp: number;
      volume: number;
      oi: number;
      close_price: number;
      bid_price: number;
      bid_qty: number;
      ask_price: number;
      ask_qty: number;
    };
    option_greeks?: {
      vega: number;
      theta: number;
      gamma: number;
      delta: number;
      iv: number;
    };
  };
  put_options?: {
    instrument_key: string;
    market_data: {
      ltp: number;
      volume: number;
      oi: number;
      close_price: number;
      bid_price: number;
      bid_qty: number;
      ask_price: number;
      ask_qty: number;
    };
    option_greeks?: {
      vega: number;
      theta: number;
      gamma: number;
      delta: number;
      iv: number;
    };
  };
}

export interface UpstoxOptionChainResponse {
  status: 'success' | 'error';
  data: UpstoxOptionChainItem[];
}
