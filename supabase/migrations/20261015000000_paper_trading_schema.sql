-- ====================================================================
-- INDIAN STOCK MARKET PAPER TRADING PLATFORM SCHEMA
-- Migration: 20261015000000_paper_trading_schema.sql
-- ====================================================================

-- 0. Clean up any conflicting legacy tables (e.g. older journal 'trades' table)
DROP TABLE IF EXISTS public.order_events CASCADE;
DROP TABLE IF EXISTS public.trades CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.positions CASCADE;
DROP TABLE IF EXISTS public.holdings CASCADE;
DROP TABLE IF EXISTS public.ledger_entries CASCADE;
DROP TABLE IF EXISTS public.performance_snapshots CASCADE;
DROP TABLE IF EXISTS public.watchlist_items CASCADE;
DROP TABLE IF EXISTS public.watchlists CASCADE;
DROP TABLE IF EXISTS public.account_reset_events CASCADE;
DROP TABLE IF EXISTS public.paper_accounts CASCADE;
DROP TABLE IF EXISTS public.user_settings CASCADE;

-- 1. Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Paper Trading Accounts Table
CREATE TABLE IF NOT EXISTS public.paper_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_number TEXT UNIQUE NOT NULL,
    account_name TEXT NOT NULL DEFAULT 'Primary Virtual Trading Account',
    currency TEXT NOT NULL DEFAULT 'INR',
    initial_balance NUMERIC(14, 2) NOT NULL DEFAULT 1000000.00,
    cash_balance NUMERIC(14, 2) NOT NULL DEFAULT 1000000.00,
    used_margin NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Account Reset Events Table (Audit Log)
CREATE TABLE IF NOT EXISTS public.account_reset_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES public.paper_accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    previous_balance NUMERIC(14, 2) NOT NULL,
    new_balance NUMERIC(14, 2) NOT NULL DEFAULT 1000000.00,
    reason TEXT NOT NULL DEFAULT 'User requested account reset',
    reset_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Watchlists Table
CREATE TABLE IF NOT EXISTS public.watchlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Watchlist Items Table
CREATE TABLE IF NOT EXISTS public.watchlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    watchlist_id UUID NOT NULL REFERENCES public.watchlists(id) ON DELETE CASCADE,
    instrument_key TEXT NOT NULL,
    tradingsymbol TEXT NOT NULL,
    exchange TEXT NOT NULL,
    instrument_type TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_watchlist_instrument UNIQUE (watchlist_id, instrument_key)
);

-- 7. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES public.paper_accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id TEXT UNIQUE NOT NULL,
    idempotency_key TEXT UNIQUE,
    instrument_key TEXT NOT NULL,
    tradingsymbol TEXT NOT NULL,
    exchange TEXT NOT NULL,
    instrument_type TEXT NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('BUY', 'SELL')),
    product TEXT NOT NULL CHECK (product IN ('CNC', 'MIS', 'NRML')),
    order_type TEXT NOT NULL CHECK (order_type IN ('MARKET', 'LIMIT', 'SL', 'SL_M')),
    quantity INT NOT NULL CHECK (quantity > 0),
    lot_size INT NOT NULL DEFAULT 1 CHECK (lot_size > 0),
    price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    trigger_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    average_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    filled_quantity INT NOT NULL DEFAULT 0,
    pending_quantity INT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED', 'REJECTED')),
    rejection_reason TEXT,
    validity TEXT NOT NULL DEFAULT 'DAY',
    tag TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Order Events Table
CREATE TABLE IF NOT EXISTS public.order_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('PLACED', 'TRIGGERED', 'FILLED', 'PARTIALLY_FILLED', 'CANCELLED', 'REJECTED')),
    price NUMERIC(12, 2),
    quantity INT,
    message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Trades (Executed Fills) Table
CREATE TABLE IF NOT EXISTS public.trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES public.paper_accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    trade_id TEXT UNIQUE NOT NULL,
    instrument_key TEXT NOT NULL,
    tradingsymbol TEXT NOT NULL,
    exchange TEXT NOT NULL,
    instrument_type TEXT NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('BUY', 'SELL')),
    product TEXT NOT NULL CHECK (product IN ('CNC', 'MIS', 'NRML')),
    quantity INT NOT NULL CHECK (quantity > 0),
    execution_price NUMERIC(12, 2) NOT NULL CHECK (execution_price > 0),
    brokerage NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    stt NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    exchange_charges NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    sebi_charges NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    stamp_duty NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    gst NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_charges NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Positions Table
CREATE TABLE IF NOT EXISTS public.positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES public.paper_accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    instrument_key TEXT NOT NULL,
    tradingsymbol TEXT NOT NULL,
    exchange TEXT NOT NULL,
    instrument_type TEXT NOT NULL,
    product TEXT NOT NULL CHECK (product IN ('CNC', 'MIS', 'NRML')),
    quantity INT NOT NULL DEFAULT 0,
    buy_quantity INT NOT NULL DEFAULT 0,
    buy_value NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    buy_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    sell_quantity INT NOT NULL DEFAULT 0,
    sell_value NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    sell_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    realized_pnl NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    unrealized_pnl NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    last_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    close_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    multiplier NUMERIC(10, 4) NOT NULL DEFAULT 1.0,
    lot_size INT NOT NULL DEFAULT 1,
    margin_required NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    is_closed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_account_position UNIQUE (account_id, instrument_key, product)
);

-- 11. Holdings Table (Equity Delivery CNC)
CREATE TABLE IF NOT EXISTS public.holdings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES public.paper_accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    instrument_key TEXT NOT NULL,
    tradingsymbol TEXT NOT NULL,
    exchange TEXT NOT NULL,
    isin TEXT,
    quantity INT NOT NULL DEFAULT 0,
    average_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    last_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    close_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_account_holding UNIQUE (account_id, instrument_key)
);

-- 12. Ledger Entries Table (Double-Entry Financial Book)
CREATE TABLE IF NOT EXISTS public.ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES public.paper_accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entry_type TEXT NOT NULL CHECK (entry_type IN ('INITIAL_CREDIT', 'TRADE_DEBIT', 'TRADE_CREDIT', 'CHARGES', 'PNL_REALIZED', 'RESET')),
    reference_id TEXT,
    description TEXT NOT NULL,
    debit NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    credit NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    balance_after NUMERIC(14, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Daily Performance Snapshots
CREATE TABLE IF NOT EXISTS public.performance_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES public.paper_accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    opening_balance NUMERIC(14, 2) NOT NULL,
    closing_balance NUMERIC(14, 2) NOT NULL,
    realized_pnl NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    unrealized_pnl NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    charges NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    net_pnl NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    equity NUMERIC(14, 2) NOT NULL,
    trades_count INT NOT NULL DEFAULT 0,
    win_trades INT NOT NULL DEFAULT 0,
    loss_trades INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_account_snapshot UNIQUE (account_id, snapshot_date)
);

-- 14. User Settings Table
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    upstox_api_key TEXT,
    upstox_api_secret TEXT,
    upstox_redirect_uri TEXT,
    upstox_access_token TEXT,
    upstox_token_expires_at TIMESTAMPTZ,
    market_data_mode TEXT NOT NULL DEFAULT 'DEMO' CHECK (market_data_mode IN ('LIVE', 'DEMO')),
    simulated_slippage_bps INT NOT NULL DEFAULT 5,
    allow_after_hours_fill BOOLEAN NOT NULL DEFAULT TRUE,
    theme TEXT NOT NULL DEFAULT 'dark',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- INDEXES FOR PERFORMANCE
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_paper_accounts_user ON public.paper_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_account ON public.orders(account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_trades_account ON public.trades(account_id, executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_positions_account ON public.positions(account_id, is_closed);
CREATE INDEX IF NOT EXISTS idx_holdings_account ON public.holdings(account_id);
CREATE INDEX IF NOT EXISTS idx_ledger_account ON public.ledger_entries(account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_watchlists_user ON public.watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_items_wl ON public.watchlist_items(watchlist_id);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paper_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_reset_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Helper RLS macro policies: Users can only read & write their own records
CREATE POLICY "Users can manage their profile" ON public.user_profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage their accounts" ON public.paper_accounts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their reset events" ON public.account_reset_events
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their watchlists" ON public.watchlists
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their watchlist items" ON public.watchlist_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.watchlists w
            WHERE w.id = watchlist_items.watchlist_id AND w.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their orders" ON public.orders
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view order events" ON public.order_events
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their trades" ON public.trades
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their positions" ON public.positions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their holdings" ON public.holdings
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their ledger" ON public.ledger_entries
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their snapshots" ON public.performance_snapshots
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their settings" ON public.user_settings
    FOR ALL USING (auth.uid() = user_id);

-- ====================================================================
-- AUTOMATIC NEW USER INITIALIZATION TRIGGER
-- Automatically provisions:
-- 1. User Profile
-- 2. Paper Trading Account with ₹10,00,000 initial virtual balance
-- 3. Initial Ledger Credit Entry of ₹10,00,000
-- 4. Default Watchlists ("Indices" & "Top Stocks")
-- 5. Default User Settings
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user_setup()
RETURNS TRIGGER AS $$
DECLARE
    new_account_id UUID;
    indices_wl_id UUID;
    stocks_wl_id UUID;
    acc_num TEXT;
BEGIN
    -- 1. Create User Profile
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1))
    );

    -- 2. Generate Account Number (e.g. IN-PT-2026-XXXX)
    acc_num := 'IN-PT-' || UPPER(SUBSTRING(NEW.id::TEXT FROM 1 FOR 8));

    -- 3. Create Paper Trading Account with ₹10,00,000
    INSERT INTO public.paper_accounts (
        user_id,
        account_number,
        account_name,
        currency,
        initial_balance,
        cash_balance,
        used_margin
    )
    VALUES (
        NEW.id,
        acc_num,
        'Paper Trading Account (₹10L)',
        'INR',
        1000000.00,
        1000000.00,
        0.00
    )
    RETURNING id INTO new_account_id;

    -- 4. Create Initial Ledger Credit
    INSERT INTO public.ledger_entries (
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
        new_account_id,
        NEW.id,
        'INITIAL_CREDIT',
        'INIT-' || acc_num,
        'Initial Virtual Trading Capital Grant (₹10,00,000)',
        0.00,
        1000000.00,
        1000000.00
    );

    -- 5. Create Default Watchlist: "Indices"
    INSERT INTO public.watchlists (user_id, name, is_default, sort_order)
    VALUES (NEW.id, 'Key Indian Indices', TRUE, 0)
    RETURNING id INTO indices_wl_id;

    -- Add items to Indices Watchlist
    INSERT INTO public.watchlist_items (watchlist_id, instrument_key, tradingsymbol, exchange, instrument_type, sort_order)
    VALUES
        (indices_wl_id, 'NSE_INDEX|Nifty 50', 'NIFTY 50', 'NSE', 'INDEX', 0),
        (indices_wl_id, 'NSE_INDEX|Nifty Bank', 'BANK NIFTY', 'NSE', 'INDEX', 1),
        (indices_wl_id, 'NSE_INDEX|Nifty Fin Service', 'FINNIFTY', 'NSE', 'INDEX', 2),
        (indices_wl_id, 'BSE_INDEX|SENSEX', 'SENSEX', 'BSE', 'INDEX', 3);

    -- 6. Create Default Watchlist: "Top Stocks"
    INSERT INTO public.watchlists (user_id, name, is_default, sort_order)
    VALUES (NEW.id, 'Top Liquid Stocks', FALSE, 1)
    RETURNING id INTO stocks_wl_id;

    INSERT INTO public.watchlist_items (watchlist_id, instrument_key, tradingsymbol, exchange, instrument_type, sort_order)
    VALUES
        (stocks_wl_id, 'NSE_EQ|INE002A01018', 'RELIANCE', 'NSE', 'EQUITY', 0),
        (stocks_wl_id, 'NSE_EQ|INE040A01034', 'HDFCBANK', 'NSE', 'EQUITY', 1),
        (stocks_wl_id, 'NSE_EQ|INE467B01029', 'TCS', 'NSE', 'EQUITY', 2),
        (stocks_wl_id, 'NSE_EQ|INE009A01021', 'INFY', 'NSE', 'EQUITY', 3),
        (stocks_wl_id, 'NSE_EQ|INE090A01021', 'ICICIBANK', 'NSE', 'EQUITY', 4);

    -- 7. Create User Settings
    INSERT INTO public.user_settings (
        user_id,
        market_data_mode,
        simulated_slippage_bps,
        allow_after_hours_fill,
        theme
    )
    VALUES (
        NEW.id,
        'DEMO',
        5,
        TRUE,
        'dark'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind Trigger to auth.users table
DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_setup();

-- ====================================================================
-- ATOMIC RESET ACCOUNT FUNCTION
-- Safely resets paper account to ₹10,00,000, closes positions, and logs audit
-- ====================================================================
CREATE OR REPLACE FUNCTION public.reset_paper_account(target_account_id UUID, reset_reason TEXT DEFAULT 'User requested account reset')
RETURNS JSONB AS $$
DECLARE
    acc RECORD;
    prev_bal NUMERIC(14,2);
BEGIN
    -- Verify ownership
    SELECT * INTO acc FROM public.paper_accounts 
    WHERE id = target_account_id AND user_id = auth.uid();

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Account not found or unauthorized';
    END IF;

    prev_bal := acc.cash_balance;

    -- 1. Cancel all pending orders
    UPDATE public.orders 
    SET status = 'CANCELLED', updated_at = NOW()
    WHERE account_id = target_account_id AND status = 'PENDING';

    -- 2. Clear positions
    DELETE FROM public.positions WHERE account_id = target_account_id;

    -- 3. Clear holdings
    DELETE FROM public.holdings WHERE account_id = target_account_id;

    -- 4. Reset balance
    UPDATE public.paper_accounts
    SET cash_balance = 1000000.00,
        used_margin = 0.00,
        updated_at = NOW()
    WHERE id = target_account_id;

    -- 5. Record reset audit event
    INSERT INTO public.account_reset_events (account_id, user_id, previous_balance, new_balance, reason)
    VALUES (target_account_id, auth.uid(), prev_bal, 1000000.00, reset_reason);

    -- 6. Add ledger entry
    INSERT INTO public.ledger_entries (account_id, user_id, entry_type, reference_id, description, debit, credit, balance_after)
    VALUES (
        target_account_id,
        auth.uid(),
        'RESET',
        'RST-' || target_account_id::TEXT,
        'Account Reset: Re-credited ₹10,00,000 virtual balance',
        0.00,
        1000000.00,
        1000000.00
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Account reset successfully to ₹10,00,000',
        'previous_balance', prev_bal,
        'new_balance', 1000000.00
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- AUTO-PROVISION TRADER ACCOUNT FOR trader@tradeedge.com
-- ====================================================================
DO $$
DECLARE
    u_id UUID;
    acc_id UUID;
    indices_wl UUID;
    stocks_wl UUID;
BEGIN
    SELECT id INTO u_id FROM auth.users WHERE email = 'trader@tradeedge.com' LIMIT 1;
    IF u_id IS NOT NULL THEN
        INSERT INTO public.user_profiles (id, email, full_name)
        VALUES (u_id, 'trader@tradeedge.com', 'Institutional Trader')
        ON CONFLICT (id) DO NOTHING;

        IF NOT EXISTS (SELECT 1 FROM public.paper_accounts WHERE user_id = u_id) THEN
            INSERT INTO public.paper_accounts (user_id, account_number, account_name, currency, initial_balance, cash_balance, used_margin)
            VALUES (u_id, 'IN-PT-DEMO001', 'Institutional Trading Account', 'INR', 1000000.00, 1000000.00, 0.00)
            RETURNING id INTO acc_id;

            INSERT INTO public.ledger_entries (account_id, user_id, entry_type, reference_id, description, debit, credit, balance_after)
            VALUES (acc_id, u_id, 'INITIAL_CREDIT', 'INIT-DEMO001', 'Initial Virtual Trading Capital Grant (₹10,00,000)', 0.00, 1000000.00, 1000000.00);

            INSERT INTO public.watchlists (user_id, name, is_default, sort_order)
            VALUES (u_id, 'Key Indian Indices', TRUE, 0)
            RETURNING id INTO indices_wl;

            INSERT INTO public.watchlist_items (watchlist_id, instrument_key, tradingsymbol, exchange, instrument_type, sort_order)
            VALUES
                (indices_wl, 'NSE_INDEX|Nifty 50', 'NIFTY 50', 'NSE', 'INDEX', 0),
                (indices_wl, 'NSE_INDEX|Nifty Bank', 'BANK NIFTY', 'NSE', 'INDEX', 1),
                (indices_wl, 'NSE_INDEX|Nifty Fin Service', 'FINNIFTY', 'NSE', 'INDEX', 2),
                (indices_wl, 'BSE_INDEX|SENSEX', 'SENSEX', 'BSE', 'INDEX', 3);

            INSERT INTO public.watchlists (user_id, name, is_default, sort_order)
            VALUES (u_id, 'Top Liquid Stocks', FALSE, 1)
            RETURNING id INTO stocks_wl;

            INSERT INTO public.watchlist_items (watchlist_id, instrument_key, tradingsymbol, exchange, instrument_type, sort_order)
            VALUES
                (stocks_wl, 'NSE_EQ|INE002A01018', 'RELIANCE', 'NSE', 'EQUITY', 0),
                (stocks_wl, 'NSE_EQ|INE040A01034', 'HDFCBANK', 'NSE', 'EQUITY', 1),
                (stocks_wl, 'NSE_EQ|INE467B01029', 'TCS', 'NSE', 'EQUITY', 2),
                (stocks_wl, 'NSE_EQ|INE009A01021', 'INFY', 'NSE', 'EQUITY', 3),
                (stocks_wl, 'NSE_EQ|INE090A01021', 'ICICIBANK', 'NSE', 'EQUITY', 4);

            INSERT INTO public.user_settings (user_id, market_data_mode, simulated_slippage_bps, allow_after_hours_fill, theme)
            VALUES (u_id, 'DEMO', 5, TRUE, 'dark')
            ON CONFLICT (user_id) DO NOTHING;
        END IF;
    END IF;
END $$;
