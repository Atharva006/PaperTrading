# External Integrations

**Analysis Date:** 2026-10-17

## APIs & External Services

**Exchange Market Data & Brokerage Gateway:**
- Upstox API v2 / Direct Exchange Gateway - Indian market quotes, order routing protocol, market status, and historical OHLCV candles
  - Client Implementation: `src/services/market/UpstoxProvider.ts`
  - Integration Method: REST JSON APIs & WebSocket market feeds via `/upstox` proxy route
  - Auth: OAuth 2.0 Access Token, API Key, API Secret (`src/config/upstoxDefault.ts` or user custom credentials)
  - Endpoints used:
    - `/v2/market-quote/quotes` - Multi-instrument live quotes and depth
    - `/v2/historical-candle/{instrument_key}/{interval}/{to_date}/{from_date}` - OHLCV candlestick data
    - `/v2/market/status/{exchange}` - NSE, BSE, MCX market phase and trading hours
    - `/v2/option/chain` - Derivative strike chains, open interest, and contract metadata
  - Local Mock/Demo Fallback: `src/services/market/DemoMarketProvider.ts` and `src/services/market/indianInstruments.ts` generate simulated tick streams and Level 2 depth when live access credentials are omitted or exchange is offline.

**Economic Calendar & Macro News:**
- Fair Economy / Forex Factory Calendar API - Live economic calendar event schedule and impact levels
  - Integration Method: REST JSON via Vite proxy `/api/news` -> `https://nfs.faireconomy.media/ff_calendar_thisweek.json`
  - Auth: Public endpoint, no auth key required
  - Consumed in: `src/pages/Calendar.tsx`

**Live Quotation & Commodity Data Proxy:**
- Vite Server Live Market Middleware (`vite.config.ts:liveMarketPlugin`)
  - Integration Method: Local development middleware endpoint `/api/market/quotes`
  - Upstream Source: Yahoo Finance query endpoints with real-time conversion algorithms:
    - Gold (`GC=F`) converted to INR per 10 grams with Indian import duty multipliers
    - Silver (`SI=F`) converted to INR per kilogram
    - Crude Oil (`CL=F`) converted to INR per barrel
    - Natural Gas (`NG=F`) converted to INR per mmBtu
    - USDINR exchange rate auto-fetched via `USDINR=X`

## Data Storage

**Databases:**
- PostgreSQL on Supabase:
  - Connection: `@supabase/supabase-js` client in `src/lib/supabase.ts`
  - Tables:
    - `paper_accounts` - Virtual balance, initial cash, used margin, available margin, equity
    - `orders` - Order history, execution states, prices, quantities, product types
    - `trades` - Executed trades and journal entries
    - `positions` - Open intraday (MIS) and overnight (NRML) positions
    - `holdings` - Long-term equity delivery (CNC) holdings
    - `ledger_entries` - Immutable debits/credits, turnover, regulatory charges, realized P&L
    - `watchlists` - User-customized instrument lists
    - `user_settings` - Execution preferences, default slippage, leverage settings
  - Migrations: SQL migration scripts in `supabase/migrations/`

**Client-Side Fallback Storage:**
- Browser LocalStorage Repository (`src/services/storage/LocalTradingRepo.ts`):
  - Provides complete offline or non-Supabase paper trading capability
  - Implements the exact same `TradingRepository` interface as `SupabaseTradingRepo.ts`
  - Keys: `trade_edge_account`, `trade_edge_orders`, `trade_edge_trades`, `trade_edge_positions`, `trade_edge_holdings`, `trade_edge_ledger`, `trade_edge_watchlists`, `trade_edge_settings`

## Authentication & Identity

**Auth Provider:**
- Supabase Auth:
  - Client: `supabase.auth` in `src/lib/supabase.ts`
  - Session Management: JWT stored with `persistSession: true` and `autoRefreshToken: true`
  - Anonymous / Guest Mode: When Supabase is not configured or in guest mode, the app defaults to local demo user identity (`demo-user-local`) seamlessly without blocking access.

## Monitoring & Observability

**Error Tracking:**
- React Error Boundary (`src/components/common/ErrorBoundary.tsx`):
  - Catches runtime rendering failures, renders a fallback terminal recovery interface, and logs stack traces to console.
- Oxlint Linter:
  - Code analysis and rule enforcement configured via `npm run lint`.

## CI/CD & Deployment

**Hosting:**
- Static Hosting: Vercel / Netlify / Cloudflare Pages / GitHub Pages
- Build Command: `npm run build` (`vite build`)
- Output Directory: `dist/`

## Environment Configuration

**Development:**
- Required Variables (`.env.local`):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Optional Variables:
  - `VITE_UPSTOX_API_KEY`
  - `VITE_UPSTOX_API_SECRET`
  - `VITE_UPSTOX_ACCESS_TOKEN`

---

*Integrations analysis: 2026-10-17*
*Update when external dependencies or gateways change*
