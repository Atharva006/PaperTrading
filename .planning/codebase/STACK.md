# Technology Stack

**Analysis Date:** 2026-10-17

## Languages

**Primary:**
- TypeScript ~6.0.2 - All frontend UI components, services, domain engines, state management, and type definitions (`src/**/*.ts`, `src/**/*.tsx`)

**Secondary:**
- JavaScript / ESM - Build scripts, Vite plugins, configuration files (`vite.config.ts`, `postcss.config.js`, `tailwind.config.js`)
- CSS - Tailwind CSS utilities and global design tokens (`src/index.css`, `src/App.css`)
- SQL - Supabase PostgreSQL migrations and schema setup (`supabase/migrations/`)

## Runtime

**Environment:**
- Node.js >= 20.x (LTS) - Local development tooling, testing, and Vite dev server
- Modern Evergreen Browsers (ES2022+ / Web APIs: WebSocket, LocalStorage, Web Workers, IndexedDB)

**Package Manager:**
- npm 10.x
- Lockfile: `package-lock.json` present and tracked in version control

## Frameworks

**Core:**
- React 19.2.8 - Component-based user interface (`react`, `react-dom`)
- React Router DOM 7.18.3 - Client-side declarative routing and layout hierarchies (`react-router-dom`)
- Zustand 5.0.15 - Minimal, reactive client state management (`useTradingStore.ts`, `useStore.ts`)

**Testing:**
- Vitest 5.0.4 - Next-generation unit and integration test runner (`vitest run`)

**Build/Dev:**
- Vite 8.2.0 - Fast HMR development server and production bundler
- @vitejs/plugin-react 6.0.4 - React Fast Refresh & JSX transformation
- Oxlint 1.75.0 - Rust-based ultra-fast linter
- PostCSS 8.5.28 & Autoprefixer 10.5.5 - CSS post-processing pipeline
- Tailwind CSS 3.4.19 - Utility-first styling engine with customized brand palettes

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` (^2.115.0) - Cloud database persistence, auth sessions, and real-time ledger sync
- `lightweight-charts` (^5.2.1) - TradingView financial candlestick, bar, area, and volume charting
- `recharts` (^3.10.1) - SVG-based data visualization for equity curves, drawdown series, and asset allocation
- `uuid` (^14.0.2) - RFC-compliant UUID generation for idempotency keys, accounts, orders, trades, and position tracking
- `lucide-react` (^1.41.0) - High-clarity SVG iconography for terminal navigation and order status badges

**Infrastructure & Utilities:**
- `clsx` (^2.1.1) & `tailwind-merge` (^3.6.0) - Dynamic and conflict-safe conditional class composition
- `date-fns` (^4.4.0) - Date calculations, market expiry formatting, and trade timestamps

## Configuration

**Environment:**
- `.env.local` / `.env` - Local environment secrets (gitignored)
- Required variables:
  - `VITE_SUPABASE_URL`: Supabase project URL
  - `VITE_SUPABASE_ANON_KEY`: Supabase anon public API key
- Fallback resilience: `src/lib/supabase.ts` implements dummy fallback endpoints to ensure zero-crash preview deployments even when environment variables are omitted.

**Build:**
- `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json` - TypeScript compiler configurations
- `vite.config.ts` - Custom development proxy, Vite server middlewares, and live quote proxy routes
- `tailwind.config.js` - Color schemes (Cendrix gold `#C6A15B`, navy `#0B1424`, slate `#10141C`)

## Platform Requirements

**Development:**
- macOS, Linux, or Windows with Node.js >= 20.x
- Port `5173` available for Vite dev server (or automatic increment)

**Production:**
- Static Single Page Application (SPA) deployable on Vercel, Netlify, Cloudflare Pages, or AWS S3 + CloudFront
- No Node.js runtime required in production if using pre-configured public exchange proxies or client-side direct gateways

---

*Stack analysis: 2026-10-17*
*Update after major dependency changes*
