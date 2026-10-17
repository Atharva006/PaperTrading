# Architecture

**Analysis Date:** 2026-10-17

## Pattern Overview

**Overall:** Client-Side Single Page Application (SPA) with Layered Domain Architecture and Hexagonal/Repository Abstraction.

**Key Characteristics:**
- **Decoupled Domain Engine:** Pure TypeScript financial engine (`FinancialCalculations.ts`, `OrderExecutionEngine.ts`) isolated from React and external APIs, fully unit-tested with Vitest.
- **Pluggable Repository Pattern:** Interchangeable data persistence (`TradingRepository` interface) with both cloud PostgreSQL (`SupabaseTradingRepo`) and local browser storage (`LocalTradingRepo`).
- **Pluggable Market Data Gateway:** Unified market interface (`MarketDataProvider`) with runtime switching between live exchange feeds (`UpstoxProvider`) and high-fidelity demo simulations (`DemoMarketProvider`).
- **Reactive Zustand Stores:** Centralized unidirectional state management coordinating market quotes, account balances, open positions, order book, and UI modals.

## Layers

**1. Presentation Layer (`src/pages/`, `src/components/`, `src/layouts/`):**
- Purpose: Render institutional terminal views, interactive charts, order tickets, option chains, and analytics dashboards.
- Contains:
  - Layouts: `DashboardLayout.tsx`, `AuthLayout.tsx`
  - Core Pages: `Landing.tsx`, `Dashboard.tsx`, `TerminalPage.tsx`, `OrdersPage.tsx`, `PositionsPage.tsx`, `HoldingsPage.tsx`, `OptionChainPage.tsx`, `CommoditiesPage.tsx`, `AnalyticsPage.tsx`, `Journal.tsx`, `Calendar.tsx`, `SettingsPage.tsx`
  - Shared Components: `OrderTicket.tsx`, `TradingViewChart.tsx`, `ZerodhaMarketWatch.tsx`, `BeginnerGuideModal.tsx`, `DynamicIsland.tsx`, `CommandPalette.tsx`, `ToastContainer.tsx`
- Depends on: State Management layer (`useTradingStore.ts`, `useStore.ts`) and TypeScript domain types (`src/types/`).
- Used by: End users via web browser.

**2. State Management Layer (`src/store/`):**
- Purpose: Maintain client application state, coordinate async API interactions, and notify subscribers of state changes.
- Contains:
  - `useTradingStore.ts`: Primary store for virtual accounts, order routing, positions, live market quotes, watchlists, active modals, and user settings.
  - `useStore.ts`: Secondary store for trade journal logs, emotional ratings, trade setups, and review notes.
- Depends on: Trading Core services, Storage repositories, Market Data providers.
- Used by: Presentation layer components and pages.

**3. Trading Core & Financial Engine (`src/services/trading/`):**
- Purpose: Execute trade matching logic, calculate margins, enforce risk limits, compute Indian regulatory taxes/charges, and calculate option Greeks.
- Contains:
  - `OrderExecutionEngine.ts`: Deterministic matching engine handling MARKET, LIMIT, SL, and SL-M orders, slippage modeling, position flipping, and portfolio ledger creation.
  - `FinancialCalculations.ts`: Regulatory fee calculator (STT, GST, Exchange charges, SEBI turnover fees, Stamp duty) and P&L calculation across Equities, Futures, and Options.
  - `GreeksCalculator.ts`: Black-Scholes pricing model computing Delta, Gamma, Theta, Vega, Rho, and Implied Volatility.
- Depends on: Domain types only (`src/types/`).
- Used by: State management layer (`useTradingStore.ts`) and test suites (`src/tests/`).

**4. Market Data Provider Layer (`src/services/market/`):**
- Purpose: Abstract market quote acquisition, depth feeds, historical candles, and instrument specifications.
- Contains:
  - `MarketDataProvider.ts`: Common interface defining quote and candle retrieval contracts.
  - `MarketDataService.ts`: Singleton facade managing provider selection and configuration.
  - `UpstoxProvider.ts`: Implementation communicating with Direct Exchange Gateway protocol via Vite proxy.
  - `DemoMarketProvider.ts`: Synthetic tick generator with realistic Brownian random walks and 5 Bid / 5 Ask depth books.
  - `indianInstruments.ts`: Master metadata catalog for Indian indices, equities, futures, and MCX commodities.
- Depends on: External HTTP/WebSocket endpoints and domain types.
- Used by: State management layer.

**5. Storage & Persistence Layer (`src/services/storage/`):**
- Purpose: Provide durable storage for accounts, orders, positions, trades, and journal entries.
- Contains:
  - `TradingRepository.ts`: CRUD interface contract for trading domain entities.
  - `SupabaseTradingRepo.ts`: Supabase PostgreSQL client implementation with Row-Level Security compatibility.
  - `LocalTradingRepo.ts`: Browser LocalStorage implementation with auto-initialization of ₹10,00,000 virtual balance.
- Depends on: `@supabase/supabase-js` or browser `localStorage`.
- Used by: State management layer.

## Data Flow

**Order Execution Flow:**
1. **User Action:** Trader fills and submits order in `OrderTicket.tsx`.
2. **Store Action:** `useTradingStore.submitOrder()` is invoked with `OrderSubmissionParams`.
3. **Execution Engine:** `OrderExecutionEngine.processNewOrder()` is evaluated with current market quote, existing open positions, and account margin.
4. **Validation & Matching:**
   - Pre-trade margin check: Validates available cash/margin vs required margin + estimated regulatory charges.
   - Fill simulation: Calculates execution price with slippage and tick constraints.
   - Position mutation: Updates or closes existing positions (calculating realized P&L) or opens new positions.
   - Ledger entry creation: Generates an immutable credit/debit record in the account ledger.
5. **Persistence:** `useTradingStore` saves updated account, orders, trades, and positions to `TradingRepository` (Supabase or LocalStorage).
6. **UI Notification:** Toast notification dispatched to `ToastContainer.tsx` and UI re-renders with updated margins.

**Market Quote Polling Flow:**
1. `useTradingStore.initializeTrading()` starts periodic polling interval (every 1-2 seconds).
2. `MarketDataService.getInstance().getQuotes()` queries current quotes for all active watchlist instruments.
3. Live quotes update `quotes` dictionary in Zustand store.
4. Active positions recalculate unrealized mark-to-market (MTM) P&L in real-time.

## Key Abstractions

**`OrderExecutionEngine`:**
- Purpose: Pure functional simulation of an exchange matching engine.
- Pattern: Static service class with pure deterministic methods.

**`TradingRepository`:**
- Purpose: Abstract data access mechanism so UI and domain logic are storage-agnostic.
- Pattern: Repository Pattern with polymorphic implementations (`LocalTradingRepo`, `SupabaseTradingRepo`).

**`MarketDataProvider`:**
- Purpose: Abstract real-time price providers from UI consumers.
- Pattern: Strategy & Facade Pattern (`MarketDataService`).

## Entry Points

**Web Application Entry Point:**
- Location: `src/main.tsx` -> `src/App.tsx`
- Triggers: Browser loads `index.html`.
- Responsibilities: Mount React DOM root, attach React Router provider, wrap tree in `ErrorBoundary`, and initialize theme/store state.

## Error Handling

**Strategy:** Multi-tier defensive architecture:
1. **React Boundary:** `src/components/common/ErrorBoundary.tsx` catches catastrophic render crashes.
2. **Network Fail-safes:** Supabase and Upstox providers fail gracefully to local storage and demo providers if network requests time out or fail.
3. **User Feedback:** System warnings and validation errors surface via contextual toast messages (`ToastContainer.tsx`) and inline ticket warnings.

## Cross-Cutting Concerns

**Financial Accuracy:** All calculations use integer rounding to 2 decimal places for INR currency and apply contract-specific lot sizes and lot multipliers.
**Security & Privacy:** Sensitive exchange tokens and API secrets are never committed to git and are stored in client-side storage or environment variables.

---

*Architecture analysis: 2026-10-17*
