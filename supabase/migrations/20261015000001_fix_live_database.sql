-- ====================================================================
-- FIX LIVE SUPABASE DATABASE & DISABLE RLS BLOCKS FOR SIMULATOR
-- Migration: 20261015000001_fix_live_database.sql
-- Run this in Supabase Dashboard -> SQL Editor (https://supabase.com/dashboard/project/isjdvpmiipqxyhrhgqke/sql)
-- ====================================================================

-- 1. Drop trigger on auth.users that blocked GoTrue with 'Database error querying schema'
DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;

-- 2. Drop foreign key constraints linking simulator tables to auth.users
-- This allows paper trading sessions to persist directly without GoTrue authentication failures
ALTER TABLE public.paper_accounts DROP CONSTRAINT IF EXISTS paper_accounts_user_id_fkey;
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;
ALTER TABLE public.watchlists DROP CONSTRAINT IF EXISTS watchlists_user_id_fkey;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE public.positions DROP CONSTRAINT IF EXISTS positions_user_id_fkey;
ALTER TABLE public.holdings DROP CONSTRAINT IF EXISTS holdings_user_id_fkey;
ALTER TABLE public.trades DROP CONSTRAINT IF EXISTS trades_user_id_fkey;
ALTER TABLE public.ledger_entries DROP CONSTRAINT IF EXISTS ledger_entries_user_id_fkey;
ALTER TABLE public.user_settings DROP CONSTRAINT IF EXISTS user_settings_user_id_fkey;
ALTER TABLE public.account_reset_events DROP CONSTRAINT IF EXISTS account_reset_events_user_id_fkey;

-- 3. Disable Row-Level Security on all paper trading tables so the app can read/write live data
ALTER TABLE public.paper_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.holdings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_snapshots DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_reset_events DISABLE ROW LEVEL SECURITY;

-- 4. Grant all permissions to anon and authenticated roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, postgres, service_role;

-- 5. Seed default live institutional account (₹10,00,000)
INSERT INTO public.paper_accounts (
    id,
    user_id,
    account_number,
    account_name,
    currency,
    initial_balance,
    cash_balance,
    used_margin,
    is_active
)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'IN-PT-LIVE001',
    'Institutional Paper Trading Account',
    'INR',
    1000000.00,
    1000000.00,
    0.00,
    TRUE
)
ON CONFLICT (account_number) DO UPDATE
SET cash_balance = EXCLUDED.cash_balance,
    initial_balance = EXCLUDED.initial_balance;

-- 6. Seed initial ledger grant
INSERT INTO public.ledger_entries (
    id,
    account_id,
    user_id,
    entry_type,
    reference_id,
    description,
    debit,
    credit,
    balance_after
)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'INITIAL_CREDIT',
    'INIT-LIVE001',
    'Initial Virtual Trading Capital Grant (₹10,00,000)',
    0.00,
    1000000.00,
    1000000.00
)
ON CONFLICT (id) DO NOTHING;

-- 7. Seed live default watchlists
INSERT INTO public.watchlists (id, user_id, name, is_default, sort_order)
VALUES ('c0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Key Indian Indices', TRUE, 0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.watchlist_items (watchlist_id, instrument_key, tradingsymbol, exchange, instrument_type, sort_order)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'NSE_INDEX|Nifty 50', 'NIFTY 50', 'NSE', 'INDEX', 0),
    ('c0000000-0000-0000-0000-000000000001', 'NSE_INDEX|Nifty Bank', 'BANK NIFTY', 'NSE', 'INDEX', 1),
    ('c0000000-0000-0000-0000-000000000001', 'BSE_INDEX|SENSEX', 'SENSEX', 'BSE', 'INDEX', 2)
ON CONFLICT (watchlist_id, instrument_key) DO NOTHING;

INSERT INTO public.watchlists (id, user_id, name, is_default, sort_order)
VALUES ('c0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Top Liquid Stocks', FALSE, 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.watchlist_items (watchlist_id, instrument_key, tradingsymbol, exchange, instrument_type, sort_order)
VALUES
    ('c0000000-0000-0000-0000-000000000002', 'NSE_EQ|INE081A01020', 'TATASTEEL', 'NSE', 'EQUITY', 0),
    ('c0000000-0000-0000-0000-000000000002', 'NSE_EQ|INE002A01018', 'RELIANCE', 'NSE', 'EQUITY', 1),
    ('c0000000-0000-0000-0000-000000000002', 'NSE_EQ|INE040A01034', 'HDFCBANK', 'NSE', 'EQUITY', 2),
    ('c0000000-0000-0000-0000-000000000002', 'NSE_EQ|INE467B01029', 'TCS', 'NSE', 'EQUITY', 3)
ON CONFLICT (watchlist_id, instrument_key) DO NOTHING;

-- 8. Seed live user settings
INSERT INTO public.user_settings (user_id, market_data_mode, simulated_slippage_bps, allow_after_hours_fill, theme)
VALUES ('00000000-0000-0000-0000-000000000001', 'LIVE', 5, TRUE, 'dark')
ON CONFLICT (user_id) DO UPDATE SET market_data_mode = 'LIVE';

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
