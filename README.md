# CNRX — Institutional Simulated Paper Trading Platform | Cendrix Capital

A full-featured, responsive fintech paper-trading web application for the Indian financial markets (NSE & BSE). Trade stocks, futures, and options using virtual currency (₹10,00,000 initial grant) with realistic order execution simulation, double-entry financial ledger accounting, Indian regulatory tax calculations, real-time option chain with Black-Scholes Greeks, and TradingView charts.

---

## 1. Key Features

- **Virtual Capital Grant**: Every new user receives a configurable virtual trading capital of **₹10,00,000** (₹10 Lakhs INR).
- **Instruments Supported**:
  - **NSE & BSE Equities**: CNC (Delivery Cash & Carry) and MIS (Intraday with 5x leverage).
  - **Key Indian Indices**: NIFTY 50, BANK NIFTY, FINNIFTY, SENSEX, NIFTY IT, NIFTY AUTO.
  - **Index & Stock Futures**: Accurate contract multipliers, lot sizes, basis spreads, and Span + Exposure margin requirements.
  - **Index & Stock Options**: Full Call (CE) and Put (PE) option chains with strike selection, PCR (Put/Call Ratio), Max Pain, and Black-Scholes Greeks (Delta, Gamma, Theta, Vega, IV).
- **Simulated Order Execution Engine**:
  - Supports `MARKET`, `LIMIT`, `SL` (Stop-Loss Limit), and `SL_M` (Stop-Loss Market) orders.
  - Configurable simulated slippage model (in basis points) with tick-size rounding (₹0.05).
  - Limit and trigger orders remain `PENDING` until real-time market prices satisfy execution conditions.
  - Margin validation: Prevents orders if available funds are insufficient.
- **Indian Financial Accounting & Regulatory Tax Engine**:
  - Brokerage: ₹0 for Delivery CNC, flat ₹20 or 0.05% for Intraday & F&O.
  - Securities Transaction Tax (STT): 0.1% for Delivery, 0.025% on Intraday sell side, 0.02% for Futures sell, 0.1% on Option sell premium.
  - Exchange turnover charges (NSE/BSE).
  - Goods & Services Tax (GST): 18% on Brokerage + Exchange charges + SEBI charges.
  - Stamp duty & SEBI turnover charges.
  - Separation of Gross P&L vs Net P&L.
- **Dual-Mode Market Data Architecture**:
  - **Upstox API v2**: Official integration for live quotes, historical OHLCV candles, and option chains.
  - **Deterministic High-Fidelity Demo Data Mode**: Realistic Indian market simulation with live tick streaming and historical candles when API credentials are not supplied or markets are closed.
  - Adapter architecture allows easy addition of DhanHQ or other brokers later without changing the trading engine.
- **Auditable Double-Entry Ledger & Reset Feature**:
  - Every fill, fee deduction, cash release, and profit/loss creates an immutable ledger entry.
  - Users can reset their virtual balance back to ₹10,00,000, creating an auditable account reset event.
- **15 Integrated Pages**:
  1. Main Trading Dashboard (14 key metrics, equity curve, asset allocation, recent fills)
  2. Market Watch (customizable watchlists with live price streaming)
  3. Interactive Terminal (TradingView Lightweight Candlestick chart + 5-level Market Depth)
  4. F&O Explorer (Futures contracts by underlying, lot sizes, and margin estimates)
  5. Option Chain (Interactive matrix with Greeks, strike selector, and 1-click trade action)
  6. Open & Closed Positions (Real-time MTM P&L, square-off single, square-off all)
  7. Holdings (Long-term CNC equity portfolio with invested vs current market value)
  8. Order Book (Pending, Completed, Cancelled, and Rejected orders with cancel action)
  9. Trade Book (Detailed executed fills and regulatory fee breakdown)
  10. Portfolio Statement (Account ledger with double-entry audit records)
  11. P&L Performance Analytics (Win rate, Profit factor, Max drawdown, Daily P&L chart)
  12. Settings & API Configuration (Upstox API keys, OAuth login, mode toggle, slippage slider)
  13. Login & Registration (Supabase Auth + 1-Click Virtual Demo Trader Access)
  14. Quick Search Modal (Cmd+K / Ctrl+K keyboard shortcut across all NSE/BSE symbols)
  15. Legal (Terms of Service & Privacy Policy)

---

## 2. Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS (Dark financial terminal theme)
- **State Management**: Zustand
- **Backend & Database**: Supabase (PostgreSQL, Supabase Auth, Row Level Security)
- **Charts**: TradingView Lightweight Charts v5 & Recharts
- **Market Data**: Upstox API v2 + Deterministic Demo Provider (DhanHQ extensible)
- **Testing**: Vitest (Unit and integration tests for calculations and simulation engine)
- **Icons**: Lucide React
- **Deployment**: Vercel & Supabase

---

## 3. Project Structure

```
trade-edge/
├── public/
├── src/
│   ├── types/
│   │   ├── market.ts                  # Instruments, Quotes, Candles, Option Chain, Greeks
│   │   ├── trading.ts                 # Accounts, Orders, Trades, Positions, Holdings, Ledger
│   │   ├── analytics.ts               # Performance KPIs, Equity Curve, Daily/Monthly P&L
│   │   └── upstox.ts                  # Official Upstox v2 API schemas
│   ├── services/
│   │   ├── market/
│   │   │   ├── MarketDataProvider.ts  # Generic provider interface (Upstox / Dhan / Demo)
│   │   │   ├── UpstoxProvider.ts      # Upstox API v2 implementation & OAuth handler
│   │   │   ├── DemoMarketProvider.ts  # Deterministic Indian market data generator & ticker
│   │   │   ├── MarketDataService.ts   # Provider manager & caching service
│   │   │   └── indianInstruments.ts   # Master catalog of NSE/BSE stocks, indices, and F&O
│   │   ├── trading/
│   │   │   ├── FinancialCalculations.ts # P&L, Brokerage, STT, GST, Margin, Slippage
│   │   │   ├── GreeksCalculator.ts    # Black-Scholes Delta, Gamma, Theta, Vega, IV solver
│   │   │   └── OrderExecutionEngine.ts # Simulated order fills, SL/TP triggers, ledger
│   │   └── storage/
│   │       ├── TradingRepository.ts   # Repository interface
│   │       ├── SupabaseTradingRepo.ts # Supabase PostgreSQL implementation
│   │       └── LocalTradingRepo.ts    # Offline / local persistent storage implementation
│   ├── store/
│   │   └── useTradingStore.ts         # Central Zustand state management
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx             # Index ticker ribbon, mode badge, search trigger
│   │   │   ├── Sidebar.tsx            # Navigation sidebar with open position badges
│   │   │   ├── ToastContainer.tsx     # Floating trade fill & error notifications
│   │   │   └── ResetAccountModal.tsx  # Confirmation dialog for ₹10L virtual reset
│   │   ├── trading/
│   │   │   ├── OrderTicket.tsx        # Order panel (Market/Limit/SL/SL-M, CNC/MIS/NRML)
│   │   │   ├── TradingViewChart.tsx   # Candlestick & Volume chart (1m, 5m, 15m, 1h, 1D)
│   │   │   └── QuickSearchModal.tsx   # Cmd+K quick search modal
│   │   └── options/
│   │       └── OptionChainTable.tsx   # Interactive Option Chain with Greeks & trade action
│   ├── pages/
│   │   ├── Dashboard.tsx              # 14 financial metrics & equity curve
│   │   ├── MarketWatchPage.tsx        # Watchlist management
│   │   ├── TerminalPage.tsx           # Pro terminal (Chart + Market Depth + Trade)
│   │   ├── DerivativesExplorerPage.tsx # Stock & Index Futures explorer
│   │   ├── OptionChainPage.tsx        # Dedicated Option Chain page
│   │   ├── PositionsPage.tsx          # Open/closed positions & square-off
│   │   ├── HoldingsPage.tsx           # Delivery CNC portfolio holdings
│   │   ├── OrdersPage.tsx             # Order book & cancellation
│   │   ├── TradebookPage.tsx          # Executed fills & fee breakdown
│   │   ├── PortfolioPage.tsx          # Ledger statement & transaction audit
│   │   ├── AnalyticsPage.tsx          # Win rate, profit factor, drawdown
│   │   ├── SettingsPage.tsx           # Upstox API credentials & simulation settings
│   │   └── Login.tsx                  # Auth & 1-Click Demo Login
│   ├── layouts/
│   │   └── DashboardLayout.tsx        # Persistent shell
│   ├── tests/
│   │   ├── FinancialCalculations.test.ts # Tests for P&L, STT, margin, and Greeks
│   │   └── OrderExecutionEngine.test.ts  # Tests for simulation lifecycle & limits
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   └── migrations/
│       └── 20261015000000_paper_trading_schema.sql # Complete PostgreSQL schema & RLS
├── .env.example
├── package.json
└── README.md
```

---

## 4. Setup and Installation

### Prerequisites
- Node.js 18+ (tested with Node 20 & 24)
- npm or yarn

### Steps
1. Clone the repository and navigate to the project directory:
   ```bash
   git clone https://github.com/Atharva006/trade-edge.git
   cd trade-edge
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your environment configuration file:
   ```bash
   cp .env.example .env.local
   ```
4. Start the local development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 5. Required Environment Variables

Configure the following variables in `.env.local`:

```env
# 1. Supabase Backend
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-public-key

# 2. Upstox Developer API v2
VITE_UPSTOX_API_KEY=your_upstox_api_key_here
VITE_UPSTOX_API_SECRET=your_upstox_api_secret_here
VITE_UPSTOX_REDIRECT_URI=http://localhost:5173/dashboard/settings
VITE_UPSTOX_ACCESS_TOKEN=your_upstox_access_token_here

# 3. Application Defaults
VITE_DEFAULT_VIRTUAL_BALANCE=1000000
VITE_DEFAULT_SLIPPAGE_BPS=5
VITE_DEMO_MODE=false
```

*Note: If `VITE_UPSTOX_ACCESS_TOKEN` is not provided or `VITE_DEMO_MODE=true`, the application automatically operates in **DEMO DATA MODE** with high-fidelity realistic Indian market data.*

---

## 6. Supabase Database Migration Instructions

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor** in the left sidebar.
3. Click **New Query**.
4. Copy the entire contents of [`supabase/migrations/20261015000000_paper_trading_schema.sql`](./supabase/migrations/20261015000000_paper_trading_schema.sql).
5. Paste and click **Run**.

### What this migration provisions:
- 13 normalized tables: `user_profiles`, `paper_accounts`, `account_reset_events`, `watchlists`, `watchlist_items`, `orders`, `order_events`, `trades`, `positions`, `holdings`, `ledger_entries`, `performance_snapshots`, `user_settings`.
- Row Level Security (RLS) enabled on all tables ensuring users only read and write their own data.
- Trigger `trg_on_auth_user_created` that automatically creates a user profile, provisions a ₹10,00,000 virtual trading account, records the initial credit in the ledger, and sets up default watchlists.
- Atomic stored procedure `reset_paper_account(target_account_id, reason)` for verified resets.

---

## 7. Upstox API Authentication Setup

Upstox API v2 uses standard OAuth 2.0. Follow these steps to obtain API credentials:

1. Log in to the [Upstox Developer Console](https://developer.upstox.com/).
2. Create a new App:
   - **App Name**: `TradeEdge Paper Trading`
   - **Redirect URL**: `http://localhost:5173/dashboard/settings` (or your production Vercel URL)
3. Copy the **API Key** (Client ID) and **API Secret**.
4. Paste them into the **Settings & API** page (`/dashboard/settings`) in TradeEdge.
5. Click **Authorize**:
   - You will be redirected to the Upstox login dialog.
   - Upon logging in, Upstox will redirect back with an authorization `code`.
   - Exchange the `code` for an `access_token` via Upstox Token API (or generate a token in the Upstox Developer Portal).
6. Save the `access_token` in Settings. The platform will automatically switch the active provider to **UPSTOX LIVE**.
7. *SEBI Token Expiry Note*: Under Indian financial regulations, broker access tokens expire daily after 3:30 AM IST. Tokens must be renewed each trading morning.

---

## 8. Development and Testing Instructions

- **Run Dev Server**:
  ```bash
  npm run dev
  ```
- **Run Vitest Test Suite**:
  ```bash
  npm run test
  ```
- **Run Production Build**:
  ```bash
  npm run build
  ```
- **Preview Production Build**:
  ```bash
  npm run preview
  ```

---

## 9. Vercel Deployment Instructions

1. Push your repository to GitHub.
2. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import the `trade-edge` repository.
4. Set the Framework Preset to **Vite**.
5. Add the Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_UPSTOX_API_KEY`
   - `VITE_UPSTOX_API_SECRET`
   - `VITE_UPSTOX_REDIRECT_URI`
6. Click **Deploy**.
7. In the Upstox Developer Portal, add your production Vercel domain to the Redirect URIs.

---

## 10. Safety Notice

**THIS IS STRICTLY A PAPER TRADING PLATFORM.**
No orders placed through this web application are ever sent to an exchange or broker for real-money execution. All orders go exclusively to the internal simulation engine using virtual funds.
