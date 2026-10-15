export interface AccountMetrics {
  initial_capital: number;
  current_cash: number;
  account_equity: number;
  realized_pnl: number;
  unrealized_pnl: number;
  today_pnl: number;
  overall_net_pnl: number;
  used_margin: number;
  available_margin: number;
  total_open_positions: number;
  total_completed_trades: number;
  win_rate: number;                // Percentage 0 - 100
  profit_factor: number;
  max_drawdown: number;            // Amount or percentage
  max_drawdown_percent: number;
  overall_return_percent: number;
  sharpe_ratio?: number;
  total_brokerage_paid: number;
}

export interface EquityCurvePoint {
  timestamp: string;               // ISO date or formatted
  equity: number;
  cash: number;
  pnl: number;
}

export interface DailyPerformance {
  date: string;
  realized_pnl: number;
  unrealized_pnl: number;
  net_pnl: number;
  trades_count: number;
  win_trades: number;
  loss_trades: number;
  charges: number;
}

export interface MonthlyPerformance {
  month: string;                   // "Jan 2026", "Feb 2026", etc.
  net_pnl: number;
  trades_count: number;
  return_percent: number;
}

export interface AssetAllocation {
  cash: number;
  equity_delivery: number;
  equity_intraday: number;
  futures_margin: number;
  options_premium: number;
}
