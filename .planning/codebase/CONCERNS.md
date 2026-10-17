# Codebase Concerns

**Analysis Date:** 2026-10-17

## Tech Debt

**Dual Zustand Stores (`useStore.ts` vs `useTradingStore.ts`):**
- Issue: Two separate Zustand stores exist. `useTradingStore.ts` handles all modern paper trading, order routing, positions, and live quotes. `useStore.ts` contains legacy trade journal records and mock accounts.
- Why: Evolutionary development where the journal feature was built prior to the full institutional execution engine.
- Impact: Potential confusion about which store manages trade data, requiring two different synchronization mechanisms.
- Fix approach: Unify journal entries into `useTradingStore.ts` and deprecate `useStore.ts`.

**Development Quote Proxy Dependency (`vite.config.ts`):**
- Issue: Real-time quotes for MCX commodities and NSE indices in local dev rely on a Vite development server middleware (`liveMarketPlugin`) querying Yahoo Finance endpoints.
- Why: Allows development without requiring an active Upstox gateway subscription or complex backend server.
- Impact: In a static production deployment (e.g. Vercel), this Vite server middleware does not run; production builds fall back to direct client-side Upstox API calls or the demo provider.
- Fix approach: Deploy a lightweight serverless Edge Function (Vercel/Cloudflare) or WebSocket bridge for production quote aggregation.

## Known Bugs & Edge Cases

**Exchange Token Expiration:**
- Symptoms: Live market quotes stop updating or Upstox returns HTTP 401 Unauthorized.
- Trigger: Indian broker access tokens typically expire daily at 3:30 AM IST per SEBI regulatory guidelines.
- Workaround: The platform automatically degrades gracefully to the simulated `DemoMarketProvider` and provides a manual token input modal in `SettingsPage.tsx`.
- Fix approach: Implement automated OAuth 2.0 refresh flow or headless auth webhook.

**After-Hours Quotations:**
- Symptoms: During weekends or outside 9:15 AM - 3:30 PM IST (equities) / 11:30 PM IST (commodities), live exchange feeds report stale or zero volume.
- Workaround: `allowAfterHours` flag in `OrderExecutionEngine.processNewOrder` permits paper trading execution even when exchange matching engines are closed.

## Security Considerations

**API Key & Access Token Storage:**
- Risk: Upstox credentials entered in `SettingsPage.tsx` are stored in browser `localStorage`.
- Current Mitigation: Keys never leave the user's browser, are never transmitted to third parties, and are excluded from git.
- Recommendations: For shared workstations, add a "Clear Credentials on Logout" feature and mask input fields by default.

**Supabase Anonymous Client:**
- Risk: Exposing `anon` key in client bundle.
- Current Mitigation: Protected by Supabase Row-Level Security (RLS) policies ensuring users can only read/write their own records (`auth.uid() = user_id`).

## Performance Bottlenecks

**Quote Polling Frequency:**
- Problem: Polling multi-instrument quotes every 1,000ms - 2,000ms creates continuous HTTP requests.
- Measurement: ~30-60 HTTP requests/minute during active trading sessions.
- Cause: HTTP REST polling used instead of full-duplex binary WebSocket stream.
- Improvement path: Migrate live quote feed to Upstox Market Data Feed V3 WebSocket (`protobuf` binary stream).

**Large Ledger List In-Memory:**
- Problem: Rendering hundreds of order fills and ledger entries without pagination can degrade DOM performance.
- Current Mitigation: Virtual accounts reset option cleans old ledger history.
- Improvement path: Introduce virtualized windowing (e.g. `@tanstack/react-virtual`) in `OrdersPage.tsx` and `Ledger`.

## Fragile Areas

**Contract Multipliers & Lot Sizes (`src/services/market/indianInstruments.ts`):**
- Why fragile: Indian exchanges periodically revise derivative lot sizes (e.g., NIFTY lot size revision from 50 to 25 to 75).
- Common failures: Hardcoded lot sizes or multipliers produce inaccurate P&L if not synced with current exchange circulars.
- Safe modification: Always check current NSE/BSE contract master specifications when updating `INDIAN_INSTRUMENTS_MASTER`.

## Scaling Limits

- Client memory handles ~5,000 historical candle bars per chart smoothly via `lightweight-charts`.
- LocalStorage quota is capped at 5MB across all browser domains; users with >10,000 trades should synchronize with Supabase.

---

*Concerns analysis: 2026-10-17*
