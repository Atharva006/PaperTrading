# Codebase Structure

**Analysis Date:** 2026-10-17

## Directory Layout

```
trade-edge/
├── public/                 # Static public assets (favicons, brand artwork, images)
├── src/                    # Primary application source code
│   ├── assets/             # SVG icons, logos, brand vectors
│   ├── components/         # Reusable React components
│   │   ├── common/         # Modals, headers, toasts, command palette, error boundary
│   │   ├── navigation/     # Master navbar, subnav, mobile drawer
│   │   ├── options/        # Option chain matrices and strike tables
│   │   └── trading/        # Order tickets, market watch, charts
│   ├── config/             # Default configurations, Upstox mock constants
│   ├── data/               # Mock fallback data and initial account seeds
│   ├── layouts/            # Page shell layouts (DashboardLayout, AuthLayout)
│   ├── lib/                # Low-level clients and utility helpers (Supabase, storage)
│   ├── pages/              # Top-level route pages and views
│   ├── services/           # Business logic, engines, repositories, market data
│   │   ├── market/         # Upstox and Demo market data providers
│   │   ├── storage/        # Supabase and LocalStorage repository implementations
│   │   └── trading/        # Order execution engine, P&L, Greeks calculators
│   ├── store/              # Zustand application stores (useTradingStore, useStore)
│   ├── tests/              # Vitest unit test suites
│   └── types/              # TypeScript interface definitions (trading, market, analytics)
├── supabase/               # Database migrations and schema definitions
├── .planning/              # Project planning, codebase maps, roadmap (GSD)
├── index.html              # HTML entry shell
├── package.json            # Dependencies and npm scripts
├── tailwind.config.js      # Tailwind CSS brand styling and tokens
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration and development proxies
```

## Directory Purposes

**`src/components/`:**
- Purpose: UI presentation building blocks.
- Subdirectories:
  - `common/`: Modals (`ResetAccountModal.tsx`, `BeginnerGuideModal.tsx`), `Header.tsx`, `Sidebar.tsx`, `ToastContainer.tsx`, `ErrorBoundary.tsx`.
  - `navigation/`: `MasterNavbar.tsx`, `ContextualSubnav.tsx`, `MobileNavDrawer.tsx`.
  - `trading/`: `OrderTicket.tsx`, `TradingViewChart.tsx`, `ZerodhaMarketWatch.tsx`, `QuickSearchModal.tsx`.
  - `options/`: `OptionChainTable.tsx`.

**`src/pages/`:**
- Purpose: Full-screen route views mapped in `App.tsx`.
- Key files:
  - `Landing.tsx`: Public institutional landing page with interactive terminal demo.
  - `Dashboard.tsx`: Account overview, equity curve, margin stats, active positions.
  - `TerminalPage.tsx`: Integrated multi-pane trading workstation (chart, market depth, order ticket).
  - `OrdersPage.tsx`: Order book and status history.
  - `PositionsPage.tsx`: Open intraday and overnight positions with live MTM P&L.
  - `HoldingsPage.tsx`: Long-term equity delivery portfolio.
  - `OptionChainPage.tsx`: Interactive options strike matrix with Greeks.
  - `CommoditiesPage.tsx`: MCX bullion, crude, and natural gas contracts.
  - `AnalyticsPage.tsx`: Performance metrics, Sharpe ratio, win/loss stats.
  - `Journal.tsx`: Post-trade logging, emotional ratings, trade review notes.
  - `Calendar.tsx`: Macroeconomic announcements and market news.
  - `SettingsPage.tsx`: Gateway credentials, default order configuration, theme.

**`src/services/`:**
- Purpose: Pure domain logic, market providers, and data access.
- Key files:
  - `trading/OrderExecutionEngine.ts`: Simulation of trade execution, fills, and position lifecycle.
  - `trading/FinancialCalculations.ts`: Margin requirements, charges/taxes, and P&L formulas.
  - `trading/GreeksCalculator.ts`: Black-Scholes analytical option pricing.
  - `market/MarketDataService.ts`: Gateway manager singleton.
  - `market/UpstoxProvider.ts`: Direct Exchange Gateway communication.
  - `market/DemoMarketProvider.ts`: Simulated market feed.
  - `storage/LocalTradingRepo.ts`: Browser storage persistence.
  - `storage/SupabaseTradingRepo.ts`: Supabase cloud persistence.

**`src/store/`:**
- Purpose: Reactive Zustand stores.
- Key files:
  - `useTradingStore.ts`: Primary store managing account, orders, positions, quotes, and active order tickets.
  - `useStore.ts`: Secondary store managing legacy journal trades and notes.

## Key File Locations

**Entry Points:**
- `src/main.tsx`: React DOM application bootstrapper.
- `src/App.tsx`: Route hierarchy and navigation shell.

**Configuration:**
- `vite.config.ts`: Dev server middlewares, proxies for Upstox & Yahoo Finance quotes.
- `tailwind.config.js`: Custom color palette and font definitions.
- `src/config/upstoxDefault.ts`: Default gateway credentials.

**Testing:**
- `src/tests/FinancialCalculations.test.ts`: Unit tests for regulatory charges and P&L.
- `src/tests/OrderExecutionEngine.test.ts`: Unit tests for order matching and position updates.

## Naming Conventions

**Files:**
- React Components & Pages: `PascalCase.tsx` (e.g., `OrderTicket.tsx`, `Dashboard.tsx`).
- TypeScript Services & Classes: `PascalCase.ts` (e.g., `OrderExecutionEngine.ts`).
- Hooks & Store files: `camelCase.ts` prefixed with `use` (e.g., `useTradingStore.ts`).
- Types & Interfaces: `camelCase.ts` (e.g., `trading.ts`, `market.ts`).
- Tests: `[Name].test.ts` placed in `src/tests/`.

**Directories:**
- Feature and category directories use `kebab-case` or lowercase (e.g., `components/trading/`, `services/market/`).

## Where to Add New Code

**New Trading Feature / Tool:**
- Domain logic: Add pure function in `src/services/trading/`.
- Unit tests: Add test suite in `src/tests/`.
- UI Component: Place in `src/components/trading/` or `src/components/common/`.
- Route view: Place in `src/pages/` and register route in `src/App.tsx`.

**New Market Data Source / Instrument:**
- Master catalog: Update `src/services/market/indianInstruments.ts`.
- Proxy mapping: Update `vite.config.ts` symbol mappings if adding new live feeds.
- Provider integration: Implement methods in `src/services/market/`.

---

*Structure analysis: 2026-10-17*
