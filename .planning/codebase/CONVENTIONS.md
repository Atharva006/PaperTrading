# Coding Conventions

**Analysis Date:** 2026-10-17

## Naming Patterns

**Files:**
- React Components & Pages: `PascalCase.tsx` (e.g., `BeginnerGuideModal.tsx`, `Landing.tsx`)
- TypeScript Services & Classes: `PascalCase.ts` (e.g., `FinancialCalculations.ts`, `UpstoxProvider.ts`)
- Stores & Custom Hooks: `use[Name].ts` in `camelCase` (e.g., `useTradingStore.ts`, `useStore.ts`)
- Type definitions: `camelCase.ts` (e.g., `trading.ts`, `market.ts`)
- Test suites: `[Subject].test.ts` placed in `src/tests/`

**Functions & Methods:**
- Functions: `camelCase` (e.g., `calculateUnrealizedPnL`, `processNewOrder`)
- Event Handlers: `handle[Event]` or `on[Action]` (e.g., `handleClose`, `handleSelectInstrument`)
- Boolean getters/flags: `is[Condition]`, `has[Condition]` (e.g., `isSupabaseConfigured`, `isLoading`)

**Variables & Constants:**
- Variables & Properties: `camelCase` (e.g., `cashBalance`, `availableMargin`)
- Global Constants & Enums: `UPPER_SNAKE_CASE` (e.g., `INDIAN_INSTRUMENTS_MASTER`, `CACHE_TTL_MS`, `STORAGE_KEYS`)
- Domain database entities: `snake_case` matching PostgreSQL columns (e.g., `instrument_key`, `cash_balance`, `used_margin`)

**Types & Interfaces:**
- Types & Interfaces: `PascalCase` with no `I` prefix (e.g., `PaperAccount`, `MarketQuote`, `OrderSubmissionParams`)
- Union Literals: `UPPERCASE` strings for statuses and types (e.g., `'BUY' | 'SELL'`, `'CNC' | 'MIS' | 'NRML'`, `'MARKET' | 'LIMIT' | 'SL' | 'SL_M'`)

## Code Style

**Formatting:**
- Indentation: 2 spaces
- Quotes: Single quotes for TypeScript/JavaScript strings; double quotes for JSX attributes
- Semicolons: Required
- Line length: Clean wrapping around 100-120 characters where possible

**Linting:**
- Linter: Oxlint (`npm run lint`)
- Rules: Rust-based high-performance checking for unused variables, invalid hook calls, and syntax errors.

## Import Organization

**Order:**
1. React & Core Libraries (`import React, { useState, useEffect } from 'react'`, `import { create } from 'zustand'`)
2. Third-Party Libraries (`import { v4 as uuidv4 } from 'uuid'`, `import { TrendingUp, AlertTriangle } from 'lucide-react'`)
3. Internal Services & Utilities (`import { OrderExecutionEngine } from '../services/trading/OrderExecutionEngine'`)
4. Internal Components (`import { BeginnerGuideModal } from './BeginnerGuideModal'`)
5. Type Imports (`import type { PaperAccount, Order } from '../types/trading'`)

**Path Resolution:**
- Relative imports (`../services/...`, `./Header`) are standardized throughout `src/`.

## Error Handling

**Defensive Execution:**
- **Zero-Crash Resilience:** Fallback values are provided for all external service clients (e.g. Supabase fallback URL/key in `src/lib/supabase.ts`, local demo provider fallback in `MarketDataService.ts`).
- **Storage Protection:** `localStorage` read/write operations are wrapped in `try / catch` blocks to gracefully handle quota limits or private browsing restrictions.
- **User Notification:** User-facing execution or validation errors are dispatched to the toast bus (`toasts` array in `useTradingStore.ts`) rather than throwing unhandled exceptions.
- **Top-Level Fallback:** `src/components/common/ErrorBoundary.tsx` provides recovery buttons if rendering fails.

## Comments & Documentation

- **Preservation:** Invariants and architectural comments must be preserved during edits.
- **Formulas & Multipliers:** Math formulas (e.g., Indian tax percentages, commodity contract conversions, option Greeks) must be documented with explicit rationale explaining exchange specifications.

---

*Conventions analysis: 2026-10-17*
