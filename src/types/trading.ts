import type { Exchange, InstrumentType } from './market';

export type TransactionType = 'BUY' | 'SELL';
export type ProductType = 'CNC' | 'MIS' | 'NRML'; // CNC: Cash & Carry (Delivery Stocks), MIS: Margin Intraday Square-off, NRML: Normal (Derivatives)
export type OrderType = 'MARKET' | 'LIMIT' | 'SL' | 'SL_M';
export type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
export type OrderValidity = 'DAY' | 'IOC';

export interface RegulatoryCharges {
  brokerage: number;
  stt: number;                  // Securities / Commodities Transaction Tax
  exchange_charges: number;     // Exchange turnover charges
  sebi_charges: number;         // SEBI turnover fee
  stamp_duty: number;           // State Stamp Duty
  gst: number;                  // 18% on (Brokerage + Exchange Charges + SEBI)
  total_charges: number;
}

export interface PaperAccount {
  id: string;
  user_id: string;
  account_number: string;
  account_name: string;
  currency: string;
  initial_balance: number;      // ₹10,00,000 default
  cash_balance: number;         // Available cash
  used_margin: number;          // Margin locked in open positions
  available_margin: number;     // cash_balance - used_margin
  account_equity: number;       // cash_balance + unrealized_pnl + holding_value
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  account_id: string;
  user_id: string;
  order_id: string;             // Human readable "ORD-20261015-XXX"
  idempotency_key?: string;
  instrument_key: string;
  tradingsymbol: string;
  exchange: Exchange;
  instrument_type: InstrumentType;
  transaction_type: TransactionType;
  product: ProductType;
  order_type: OrderType;
  quantity: number;             // Total units (e.g. 50 for 1 lot of NIFTY)
  lot_size: number;
  price: number;                // Specified limit price (0 for MARKET)
  trigger_price: number;        // Specified trigger price (for SL and SL_M)
  average_price: number;        // Actual filled average price
  filled_quantity: number;
  pending_quantity: number;
  status: OrderStatus;
  rejection_reason?: string;
  validity: OrderValidity;
  tag?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderEvent {
  id: string;
  order_id: string;
  event_type: 'PLACED' | 'TRIGGERED' | 'FILLED' | 'PARTIALLY_FILLED' | 'CANCELLED' | 'REJECTED';
  price?: number;
  quantity?: number;
  message?: string;
  created_at: string;
}

export interface Trade {
  id: string;
  account_id: string;
  user_id: string;
  order_id: string;
  trade_id: string;             // Human readable "TRD-20261015-XXX"
  instrument_key: string;
  tradingsymbol: string;
  exchange: Exchange;
  instrument_type: InstrumentType;
  transaction_type: TransactionType;
  product: ProductType;
  quantity: number;
  execution_price: number;
  charges: RegulatoryCharges;
  executed_at: string;
}

export interface Position {
  id: string;
  account_id: string;
  user_id: string;
  instrument_key: string;
  tradingsymbol: string;
  exchange: Exchange;
  instrument_type: InstrumentType;
  product: ProductType;
  quantity: number;             // Net quantity: positive = Long, negative = Short, 0 = Closed
  buy_quantity: number;
  buy_value: number;
  buy_price: number;            // Weighted average buy price
  sell_quantity: number;
  sell_value: number;
  sell_price: number;           // Weighted average sell price
  realized_pnl: number;
  unrealized_pnl: number;
  last_price: number;
  close_price: number;          // Previous day close
  multiplier: number;           // Default 1
  lot_size: number;
  margin_required: number;      // Margin tied to this position
  is_closed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Holding {
  id: string;
  account_id: string;
  user_id: string;
  instrument_key: string;
  tradingsymbol: string;
  exchange: Exchange;
  isin?: string;
  quantity: number;
  average_price: number;
  last_price: number;
  close_price: number;
  invested_value: number;       // quantity * average_price
  current_value: number;        // quantity * last_price
  pnl: number;                  // current_value - invested_value
  pnl_percentage: number;       // (pnl / invested_value) * 100
  day_change: number;           // (last_price - close_price) * quantity
  day_change_percent: number;
  created_at: string;
  updated_at: string;
}

export interface LedgerEntry {
  id: string;
  account_id: string;
  user_id: string;
  entry_type: 'INITIAL_CREDIT' | 'TRADE_DEBIT' | 'TRADE_CREDIT' | 'CHARGES' | 'PNL_REALIZED' | 'RESET';
  reference_id?: string;
  description: string;
  debit: number;
  credit: number;
  balance_after: number;
  created_at: string;
}

export interface AccountResetEvent {
  id: string;
  account_id: string;
  user_id: string;
  previous_balance: number;
  new_balance: number;
  reason: string;
  reset_at: string;
}

export interface Watchlist {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  sort_order: number;
  items: WatchlistItem[];
  created_at: string;
}

export interface WatchlistItem {
  id: string;
  watchlist_id: string;
  instrument_key: string;
  tradingsymbol: string;
  exchange: Exchange;
  instrument_type: InstrumentType;
  sort_order: number;
  added_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  upstox_api_key?: string;
  upstox_api_secret?: string;
  upstox_redirect_uri?: string;
  upstox_access_token?: string;
  upstox_token_expires_at?: string;
  market_data_mode: 'LIVE' | 'DEMO';
  simulated_slippage_bps: number;   // e.g. 5 bps = 0.05%
  allow_after_hours_fill: boolean;
  theme: 'dark' | 'light';
}
