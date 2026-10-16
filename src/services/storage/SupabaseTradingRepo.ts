import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import type { 
  PaperAccount, 
  Order, 
  Trade, 
  Position, 
  Holding, 
  LedgerEntry, 
  Watchlist, 
  UserSettings 
} from '../../types/trading';
import type { TradingRepository } from './TradingRepository';
import { LocalTradingRepo } from './LocalTradingRepo';

const localRepo = new LocalTradingRepo();

const DEFAULT_INITIAL_WATCHLISTS: Watchlist[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    user_id: '00000000-0000-0000-0000-000000000001',
    name: 'Key Indian Indices',
    is_default: true,
    sort_order: 0,
    items: [
      { id: 'wli-idx-1', instrument_key: 'NSE_INDEX|Nifty 50', tradingsymbol: 'NIFTY 50', exchange: 'NSE', instrument_type: 'INDEX', sort_order: 0 },
      { id: 'wli-idx-2', instrument_key: 'NSE_INDEX|Nifty Bank', tradingsymbol: 'BANK NIFTY', exchange: 'NSE', instrument_type: 'INDEX', sort_order: 1 },
      { id: 'wli-idx-3', instrument_key: 'BSE_INDEX|SENSEX', tradingsymbol: 'SENSEX', exchange: 'BSE', instrument_type: 'INDEX', sort_order: 2 },
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    user_id: '00000000-0000-0000-0000-000000000001',
    name: 'Top Liquid Stocks',
    is_default: false,
    sort_order: 1,
    items: [
      { id: 'wli-eq-1', instrument_key: 'NSE_EQ|INE081A01020', tradingsymbol: 'TATASTEEL', exchange: 'NSE', instrument_type: 'EQUITY', sort_order: 0 },
      { id: 'wli-eq-2', instrument_key: 'NSE_EQ|INE002A01018', tradingsymbol: 'RELIANCE', exchange: 'NSE', instrument_type: 'EQUITY', sort_order: 1 },
      { id: 'wli-eq-3', instrument_key: 'NSE_EQ|INE040A01034', tradingsymbol: 'HDFCBANK', exchange: 'NSE', instrument_type: 'EQUITY', sort_order: 2 },
      { id: 'wli-eq-4', instrument_key: 'NSE_EQ|INE467B01029', tradingsymbol: 'TCS', exchange: 'NSE', instrument_type: 'EQUITY', sort_order: 3 },
      { id: 'wli-eq-5', instrument_key: 'NSE_EQ|INE009A01021', tradingsymbol: 'INFY', exchange: 'NSE', instrument_type: 'EQUITY', sort_order: 4 },
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    user_id: '00000000-0000-0000-0000-000000000001',
    name: 'MCX Commodities',
    is_default: false,
    sort_order: 2,
    items: [
      { id: 'wli-mcx-1', instrument_key: 'MCX_FO|571445', tradingsymbol: 'GOLDM26NOVFUT', exchange: 'MCX', instrument_type: 'FUTCOM', sort_order: 0 },
      { id: 'wli-mcx-2', instrument_key: 'MCX_FO|495213', tradingsymbol: 'GOLD26DECFUT', exchange: 'MCX', instrument_type: 'FUTCOM', sort_order: 1 },
      { id: 'wli-mcx-3', instrument_key: 'MCX_FO|483080', tradingsymbol: 'SILVERM26NOVFUT', exchange: 'MCX', instrument_type: 'FUTCOM', sort_order: 2 },
      { id: 'wli-mcx-4', instrument_key: 'MCX_FO|569900', tradingsymbol: 'CRUDEOIL26OCTFUT', exchange: 'MCX', instrument_type: 'FUTCOM', sort_order: 3 },
      { id: 'wli-mcx-5', instrument_key: 'MCX_FO|570750', tradingsymbol: 'NATURALGAS26OCTFUT', exchange: 'MCX', instrument_type: 'FUTCOM', sort_order: 4 },
      { id: 'wli-mcx-6', instrument_key: 'MCX_FO|574829', tradingsymbol: 'COPPER26OCTFUT', exchange: 'MCX', instrument_type: 'FUTCOM', sort_order: 5 },
      { id: 'wli-mcx-7', instrument_key: 'MCX_FO|574834', tradingsymbol: 'ZINC26OCTFUT', exchange: 'MCX', instrument_type: 'FUTCOM', sort_order: 6 },
    ],
    created_at: new Date().toISOString(),
  },
];

export class SupabaseTradingRepo implements TradingRepository {
  public async getAccount(userId: string): Promise<PaperAccount | null> {
    try {
      // 1. Try querying Supabase for user's account or ANY existing paper account in the database
      let { data, error } = await supabase
        .from('paper_accounts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!data && !error) {
        // Also check if any seeded account exists in the database
        const anyAccount = await supabase
          .from('paper_accounts')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle();
        if (anyAccount.data) {
          data = anyAccount.data;
        }
      }

      if (data) {
        const account: PaperAccount = {
          id: data.id,
          user_id: data.user_id,
          account_number: data.account_number,
          account_name: data.account_name,
          currency: data.currency,
          initial_balance: Number(data.initial_balance),
          cash_balance: Number(data.cash_balance),
          used_margin: Number(data.used_margin),
          available_margin: Math.max(0, Number(data.cash_balance) - Number(data.used_margin)),
          account_equity: Number(data.cash_balance),
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem('tradeedge_active_paper_account', JSON.stringify(account));
        }
        return account;
      }

      // Check local cache if Supabase query returned empty
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('tradeedge_active_paper_account');
        if (cached) {
          try {
            return JSON.parse(cached);
          } catch {}
        }
      }

      // Auto-provision initial paper account in live Supabase PostgreSQL
      const newAccount: PaperAccount = {
        id: 'a0000000-0000-0000-0000-000000000001',
        user_id: userId,
        account_number: 'IN-PT-LIVE001',
        account_name: 'Primary Virtual Trading Account',
        currency: 'INR',
        initial_balance: 1000000,
        cash_balance: 1000000,
        used_margin: 0,
        available_margin: 1000000,
        account_equity: 1000000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: inserted, error: insertErr } = await supabase
        .from('paper_accounts')
        .insert({
          id: newAccount.id,
          user_id: newAccount.user_id,
          account_number: newAccount.account_number,
          account_name: newAccount.account_name,
          currency: newAccount.currency,
          initial_balance: newAccount.initial_balance,
          cash_balance: newAccount.cash_balance,
          used_margin: newAccount.used_margin,
        })
        .select()
        .single();

      if (inserted && !insertErr) {
        // Add initial ledger grant entry
        await supabase.from('ledger_entries').insert({
          id: uuidv4(),
          account_id: inserted.id,
          user_id: userId,
          entry_type: 'INITIAL_CREDIT',
          reference_id: `INIT-${inserted.account_number}`,
          description: 'Initial Virtual Trading Capital Grant (₹10,00,000)',
          debit: 0,
          credit: 1000000,
          balance_after: 1000000,
        });

        if (typeof window !== 'undefined') {
          localStorage.setItem('tradeedge_active_paper_account', JSON.stringify(newAccount));
        }
        return newAccount;
      }

      // If Supabase insert blocked by RLS, cache locally so trader is NEVER blocked
      if (typeof window !== 'undefined') {
        localStorage.setItem('tradeedge_active_paper_account', JSON.stringify(newAccount));
      }
      return newAccount;
    } catch (err) {
      console.warn('Supabase getAccount fallback exception:', err);
      const fallbackAccount: PaperAccount = {
        id: 'a0000000-0000-0000-0000-000000000001',
        user_id: userId,
        account_number: 'IN-PT-LIVE001',
        account_name: 'Primary Virtual Trading Account',
        currency: 'INR',
        initial_balance: 1000000,
        cash_balance: 1000000,
        used_margin: 0,
        available_margin: 1000000,
        account_equity: 1000000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return fallbackAccount;
    }
  }

  public async saveAccount(account: PaperAccount): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tradeedge_active_paper_account', JSON.stringify(account));
    }
    try {
      const { error } = await supabase.from('paper_accounts').upsert({
        id: account.id,
        user_id: account.user_id,
        account_number: account.account_number,
        account_name: account.account_name,
        currency: account.currency,
        initial_balance: account.initial_balance,
        cash_balance: account.cash_balance,
        used_margin: account.used_margin,
        updated_at: new Date().toISOString(),
      });
      if (error) console.warn('Supabase saveAccount error:', error.message);
    } catch (err) {
      console.warn('Failed to upsert paper account to Supabase:', err);
    }
  }

  public async resetAccount(
    accountId: string,
    userId: string,
    previousBalance: number,
    reason = 'User requested account reset'
  ): Promise<PaperAccount> {
    const freshAccount: PaperAccount = {
      id: accountId,
      user_id: userId,
      account_number: `IN-PT-LIVE001`,
      account_name: 'Primary Virtual Trading Account',
      currency: 'INR',
      initial_balance: 1000000,
      cash_balance: 1000000,
      used_margin: 0,
      available_margin: 1000000,
      account_equity: 1000000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('tradeedge_active_paper_account', JSON.stringify(freshAccount));
      localStorage.removeItem(`tradeedge_orders_${accountId}`);
      localStorage.removeItem(`tradeedge_trades_${accountId}`);
      localStorage.removeItem(`tradeedge_positions_${accountId}`);
      localStorage.removeItem(`tradeedge_holdings_${accountId}`);
    }

    try {
      // 1. Cancel pending orders in live Supabase database
      await supabase
        .from('orders')
        .update({ status: 'CANCELLED', updated_at: new Date().toISOString() })
        .eq('account_id', accountId)
        .eq('status', 'PENDING');

      // 2. Clear positions
      await supabase.from('positions').delete().eq('account_id', accountId);

      // 3. Clear holdings
      await supabase.from('holdings').delete().eq('account_id', accountId);

      // 4. Reset balance
      await supabase
        .from('paper_accounts')
        .update({
          cash_balance: 1000000,
          used_margin: 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', accountId);

      // 5. Audit reset event
      await supabase.from('account_reset_events').insert({
        id: uuidv4(),
        account_id: accountId,
        user_id: userId,
        previous_balance: previousBalance,
        new_balance: 1000000,
        reason,
      });

      // 6. Add reset ledger credit
      await supabase.from('ledger_entries').insert({
        id: uuidv4(),
        account_id: accountId,
        user_id: userId,
        entry_type: 'RESET',
        reference_id: `RST-${accountId.slice(0, 8)}`,
        description: 'Account Reset: Restored ₹10,00,000 virtual capital',
        debit: 0,
        credit: 1000000,
        balance_after: 1000000,
      });

      const fresh = await this.getAccount(userId);
      if (fresh) return fresh;
    } catch (err) {
      console.error('Supabase reset failed:', err);
    }

    return freshAccount;
  }

  public async getOrders(accountId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('account_id', accountId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`tradeedge_orders_${accountId}`, JSON.stringify(data));
        }
        return data as Order[];
      }
    } catch {
      // fall through to local cache
    }

    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(`tradeedge_orders_${accountId}`);
      if (cached) {
        try { return JSON.parse(cached); } catch {}
      }
    }
    return [];
  }

  public async saveOrder(order: Order): Promise<void> {
    if (typeof window !== 'undefined') {
      const key = `tradeedge_orders_${order.account_id}`;
      const existing: Order[] = JSON.parse(localStorage.getItem(key) || '[]');
      const updated = [order, ...existing.filter(o => o.id !== order.id)];
      localStorage.setItem(key, JSON.stringify(updated));
    }
    try {
      await supabase.from('orders').upsert({
        id: order.id,
        account_id: order.account_id,
        user_id: order.user_id,
        order_id: order.order_id,
        idempotency_key: order.idempotency_key,
        instrument_key: order.instrument_key,
        tradingsymbol: order.tradingsymbol,
        exchange: order.exchange,
        instrument_type: order.instrument_type,
        transaction_type: order.transaction_type,
        product: order.product,
        order_type: order.order_type,
        quantity: order.quantity,
        lot_size: order.lot_size,
        price: order.price,
        trigger_price: order.trigger_price,
        average_price: order.average_price,
        filled_quantity: order.filled_quantity,
        pending_quantity: order.pending_quantity,
        status: order.status,
        rejection_reason: order.rejection_reason,
        validity: order.validity,
        tag: order.tag,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Failed to upsert order to Supabase:', err);
    }
  }

  public async updateOrder(order: Order): Promise<void> {
    return this.saveOrder(order);
  }

  public async getTrades(accountId: string): Promise<Trade[]> {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('account_id', accountId)
        .order('executed_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped = data.map((t: any) => ({
          id: t.id,
          account_id: t.account_id,
          user_id: t.user_id,
          order_id: t.order_id,
          trade_id: t.trade_id,
          instrument_key: t.instrument_key,
          tradingsymbol: t.tradingsymbol,
          exchange: t.exchange,
          instrument_type: t.instrument_type,
          transaction_type: t.transaction_type,
          product: t.product,
          quantity: t.quantity,
          execution_price: Number(t.execution_price),
          charges: {
            brokerage: Number(t.brokerage || 0),
            stt: Number(t.stt || 0),
            exchange_charges: Number(t.exchange_charges || 0),
            sebi_charges: Number(t.sebi_charges || 0),
            stamp_duty: Number(t.stamp_duty || 0),
            gst: Number(t.gst || 0),
            total_charges: Number(t.total_charges || 0),
          },
          executed_at: t.executed_at,
        }));
        if (typeof window !== 'undefined') {
          localStorage.setItem(`tradeedge_trades_${accountId}`, JSON.stringify(mapped));
        }
        return mapped;
      }
    } catch {
      // fall through
    }

    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(`tradeedge_trades_${accountId}`);
      if (cached) {
        try { return JSON.parse(cached); } catch {}
      }
    }
    return [];
  }

  public async saveTrade(trade: Trade): Promise<void> {
    if (typeof window !== 'undefined') {
      const key = `tradeedge_trades_${trade.account_id}`;
      const existing: Trade[] = JSON.parse(localStorage.getItem(key) || '[]');
      const updated = [trade, ...existing.filter(t => t.id !== trade.id)];
      localStorage.setItem(key, JSON.stringify(updated));
    }
    try {
      await supabase.from('trades').upsert({
        id: trade.id,
        account_id: trade.account_id,
        user_id: trade.user_id,
        order_id: trade.order_id,
        trade_id: trade.trade_id,
        instrument_key: trade.instrument_key,
        tradingsymbol: trade.tradingsymbol,
        exchange: trade.exchange,
        instrument_type: trade.instrument_type,
        transaction_type: trade.transaction_type,
        product: trade.product,
        quantity: trade.quantity,
        execution_price: trade.execution_price,
        brokerage: trade.charges.brokerage,
        stt: trade.charges.stt,
        exchange_charges: trade.charges.exchange_charges,
        sebi_charges: trade.charges.sebi_charges,
        stamp_duty: trade.charges.stamp_duty,
        gst: trade.charges.gst,
        total_charges: trade.charges.total_charges,
        executed_at: trade.executed_at,
      });
    } catch (err) {
      console.warn('Failed to upsert trade to Supabase:', err);
    }
  }

  public async getPositions(accountId: string): Promise<Position[]> {
    try {
      const { data, error } = await supabase
        .from('positions')
        .select('*')
        .eq('account_id', accountId)
        .order('updated_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped = data.map((p: any) => ({
          id: p.id,
          account_id: p.account_id,
          user_id: p.user_id,
          instrument_key: p.instrument_key,
          tradingsymbol: p.tradingsymbol,
          exchange: p.exchange,
          instrument_type: p.instrument_type,
          product: p.product,
          quantity: p.quantity,
          lot_size: p.lot_size,
          buy_quantity: p.buy_quantity,
          buy_price: Number(p.buy_price),
          buy_value: Number(p.buy_value),
          sell_quantity: p.sell_quantity,
          sell_price: Number(p.sell_price),
          sell_value: Number(p.sell_value),
          last_price: Number(p.last_price),
          close_price: Number(p.close_price),
          unrealized_pnl: Number(p.unrealized_pnl),
          realized_pnl: Number(p.realized_pnl),
          pnl: Number(p.pnl),
          pnl_percent: Number(p.pnl_percent),
          is_closed: p.is_closed,
          opened_at: p.opened_at,
          updated_at: p.updated_at,
        }));
        if (typeof window !== 'undefined') {
          localStorage.setItem(`tradeedge_positions_${accountId}`, JSON.stringify(mapped));
        }
        return mapped;
      }
    } catch {
      // fall through
    }

    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(`tradeedge_positions_${accountId}`);
      if (cached) {
        try { return JSON.parse(cached); } catch {}
      }
    }
    return [];
  }

  public async savePosition(position: Position): Promise<void> {
    if (typeof window !== 'undefined') {
      const key = `tradeedge_positions_${position.account_id}`;
      const existing: Position[] = JSON.parse(localStorage.getItem(key) || '[]');
      const updated = [position, ...existing.filter(p => p.id !== position.id)];
      localStorage.setItem(key, JSON.stringify(updated));
    }
    try {
      await supabase.from('positions').upsert({
        id: position.id,
        account_id: position.account_id,
        user_id: position.user_id,
        instrument_key: position.instrument_key,
        tradingsymbol: position.tradingsymbol,
        exchange: position.exchange,
        instrument_type: position.instrument_type,
        product: position.product,
        quantity: position.quantity,
        lot_size: position.lot_size,
        buy_quantity: position.buy_quantity,
        buy_price: position.buy_price,
        buy_value: position.buy_value,
        sell_quantity: position.sell_quantity,
        sell_price: position.sell_price,
        sell_value: position.sell_value,
        last_price: position.last_price,
        close_price: position.close_price,
        unrealized_pnl: position.unrealized_pnl,
        realized_pnl: position.realized_pnl,
        pnl: position.pnl,
        pnl_percent: position.pnl_percent,
        is_closed: position.is_closed,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Failed to upsert position to Supabase:', err);
    }
  }

  public async deletePosition(positionId: string): Promise<void> {
    if (!isSupabaseConfigured) {
      return localRepo.deletePosition(positionId);
    }
    try {
      await supabase.from('positions').delete().eq('id', positionId);
    } catch {
      // ignore
    }
    return localRepo.deletePosition(positionId);
  }

  public async getHoldings(accountId: string): Promise<Holding[]> {
    try {
      const { data, error } = await supabase
        .from('holdings')
        .select('*')
        .eq('account_id', accountId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped = data.map((h: any) => ({
          id: h.id,
          account_id: h.account_id,
          user_id: h.user_id,
          instrument_key: h.instrument_key,
          tradingsymbol: h.tradingsymbol,
          exchange: h.exchange,
          quantity: h.quantity,
          t1_quantity: h.t1_quantity,
          average_price: Number(h.average_price),
          last_price: Number(h.last_price),
          close_price: Number(h.close_price),
          pnl: Number(h.pnl),
          pnl_percent: Number(h.pnl_percent),
          current_value: Number(h.current_value),
          investment_value: Number(h.investment_value),
          updated_at: h.updated_at,
        }));
        if (typeof window !== 'undefined') {
          localStorage.setItem(`tradeedge_holdings_${accountId}`, JSON.stringify(mapped));
        }
        return mapped;
      }
    } catch {
      // fall through
    }

    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(`tradeedge_holdings_${accountId}`);
      if (cached) {
        try { return JSON.parse(cached); } catch {}
      }
    }
    return [];
  }

  public async saveHolding(holding: Holding): Promise<void> {
    if (typeof window !== 'undefined') {
      const key = `tradeedge_holdings_${holding.account_id}`;
      const existing: Holding[] = JSON.parse(localStorage.getItem(key) || '[]');
      const updated = [holding, ...existing.filter(h => h.id !== holding.id)];
      localStorage.setItem(key, JSON.stringify(updated));
    }
    try {
      await supabase.from('holdings').upsert({
        id: holding.id,
        account_id: holding.account_id,
        user_id: holding.user_id,
        instrument_key: holding.instrument_key,
        tradingsymbol: holding.tradingsymbol,
        exchange: holding.exchange,
        quantity: holding.quantity,
        t1_quantity: holding.t1_quantity,
        average_price: holding.average_price,
        last_price: holding.last_price,
        close_price: holding.close_price,
        pnl: holding.pnl,
        pnl_percent: holding.pnl_percent,
        current_value: holding.current_value,
        investment_value: holding.investment_value,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Failed to upsert holding to Supabase:', err);
    }
  }

  public async deleteHolding(holdingId: string): Promise<void> {
    if (!isSupabaseConfigured) {
      return localRepo.deleteHolding(holdingId);
    }
    try {
      await supabase.from('holdings').delete().eq('id', holdingId);
    } catch {
      // ignore
    }
    return localRepo.deleteHolding(holdingId);
  }

  public async getLedger(accountId: string): Promise<LedgerEntry[]> {
    try {
      const { data, error } = await supabase
        .from('ledger_entries')
        .select('*')
        .eq('account_id', accountId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped = data.map((l: any) => ({
          id: l.id,
          account_id: l.account_id,
          user_id: l.user_id,
          entry_type: l.entry_type,
          reference_id: l.reference_id,
          description: l.description,
          debit: Number(l.debit),
          credit: Number(l.credit),
          balance_after: Number(l.balance_after),
          created_at: l.created_at,
        }));
        if (typeof window !== 'undefined') {
          localStorage.setItem(`tradeedge_ledger_${accountId}`, JSON.stringify(mapped));
        }
        return mapped;
      }
    } catch {
      // fall through
    }

    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(`tradeedge_ledger_${accountId}`);
      if (cached) {
        try { return JSON.parse(cached); } catch {}
      }
    }
    return [];
  }

  public async saveLedgerEntry(entry: LedgerEntry): Promise<void> {
    if (typeof window !== 'undefined') {
      const key = `tradeedge_ledger_${entry.account_id}`;
      const existing: LedgerEntry[] = JSON.parse(localStorage.getItem(key) || '[]');
      const updated = [entry, ...existing.filter(l => l.id !== entry.id)];
      localStorage.setItem(key, JSON.stringify(updated));
    }
    try {
      await supabase.from('ledger_entries').insert({
        id: entry.id,
        account_id: entry.account_id,
        user_id: entry.user_id,
        entry_type: entry.entry_type,
        reference_id: entry.reference_id,
        description: entry.description,
        debit: entry.debit,
        credit: entry.credit,
        balance_after: entry.balance_after,
        created_at: entry.created_at,
      });
    } catch (err) {
      console.warn('Failed to insert ledger entry to Supabase:', err);
    }
  }

  public async getWatchlists(userId: string): Promise<Watchlist[]> {
    try {
      const { data: lists, error: lErr } = await supabase
        .from('watchlists')
        .select('*, items:watchlist_items(*)')
        .order('sort_order', { ascending: true });

      if (!lErr && lists && lists.length > 0) {
        const mapped = lists.map((l: any) => ({
          id: l.id,
          user_id: l.user_id,
          name: l.name,
          is_default: l.is_default,
          sort_order: l.sort_order,
          items: (l.items || []).map((i: any) => ({
            instrument_key: i.instrument_key,
            tradingsymbol: i.tradingsymbol,
            exchange: i.exchange,
            instrument_type: i.instrument_type,
            sort_order: i.sort_order,
          })),
          created_at: l.created_at,
        }));
        if (typeof window !== 'undefined') {
          localStorage.setItem('tradeedge_watchlists', JSON.stringify(mapped));
        }
        return mapped;
      }
    } catch {
      // fall through
    }

    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('tradeedge_watchlists');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
    }

    // Default initial watchlists with Indian Indices and Top Stocks (including TATASTEEL)
    if (typeof window !== 'undefined') {
      localStorage.setItem('tradeedge_watchlists', JSON.stringify(DEFAULT_INITIAL_WATCHLISTS));
    }
    return DEFAULT_INITIAL_WATCHLISTS;
  }

  public async saveWatchlist(watchlist: Watchlist): Promise<void> {
    if (typeof window !== 'undefined') {
      const existing: Watchlist[] = JSON.parse(localStorage.getItem('tradeedge_watchlists') || '[]');
      const updated = existing.some(w => w.id === watchlist.id)
        ? existing.map(w => (w.id === watchlist.id ? watchlist : w))
        : [...existing, watchlist];
      localStorage.setItem('tradeedge_watchlists', JSON.stringify(updated));
    }

    try {
      await supabase.from('watchlists').upsert({
        id: watchlist.id,
        user_id: watchlist.user_id,
        name: watchlist.name,
        is_default: watchlist.is_default,
        sort_order: watchlist.sort_order,
      });

      // Clear existing and re-insert items
      await supabase.from('watchlist_items').delete().eq('watchlist_id', watchlist.id);

      if (watchlist.items.length > 0) {
        await supabase.from('watchlist_items').insert(
          watchlist.items.map((i, idx) => ({
            watchlist_id: watchlist.id,
            instrument_key: i.instrument_key,
            tradingsymbol: i.tradingsymbol,
            exchange: i.exchange,
            instrument_type: i.instrument_type,
            sort_order: idx,
          }))
        );
      }
    } catch (err) {
      console.warn('Failed to save watchlist to Supabase:', err);
    }
  }

  public async deleteWatchlist(watchlistId: string): Promise<void> {
    if (typeof window !== 'undefined') {
      const existing: Watchlist[] = JSON.parse(localStorage.getItem('tradeedge_watchlists') || '[]');
      const updated = existing.filter(w => w.id !== watchlistId);
      localStorage.setItem('tradeedge_watchlists', JSON.stringify(updated));
    }
    try {
      await supabase.from('watchlists').delete().eq('id', watchlistId);
    } catch (err) {
      console.warn('Failed to delete watchlist from Supabase:', err);
    }
  }

  public async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data) {
        const settings: UserSettings = {
          id: data.id,
          user_id: data.user_id,
          market_data_mode: 'LIVE',
          simulated_slippage_bps: data.simulated_slippage_bps,
          allow_after_hours_fill: data.allow_after_hours_fill,
          theme: data.theme,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem('tradeedge_user_settings', JSON.stringify(settings));
        }
        return settings;
      }
    } catch {
      // fall through
    }

    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('tradeedge_user_settings');
      if (cached) {
        try { return JSON.parse(cached); } catch {}
      }
    }

    const defaultSettings: UserSettings = {
      user_id: userId,
      market_data_mode: 'LIVE',
      simulated_slippage_bps: 5,
      allow_after_hours_fill: true,
      theme: 'dark',
      upstox_api_key: import.meta.env.VITE_UPSTOX_API_KEY || '',
      upstox_api_secret: import.meta.env.VITE_UPSTOX_API_SECRET || '',
      upstox_redirect_uri: import.meta.env.VITE_UPSTOX_REDIRECT_URI || 'http://localhost:5173/dashboard/settings',
    };
    return defaultSettings;
  }

  public async saveUserSettings(settings: UserSettings): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tradeedge_user_settings', JSON.stringify(settings));
    }
    try {
      await supabase.from('user_settings').upsert({
        id: settings.id,
        user_id: settings.user_id,
        market_data_mode: 'LIVE',
        simulated_slippage_bps: settings.simulated_slippage_bps,
        allow_after_hours_fill: settings.allow_after_hours_fill,
        theme: settings.theme,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Failed to save user settings to Supabase:', err);
    }
  }
}

export const supabaseTradingRepo = new SupabaseTradingRepo();
export const localTradingRepo = localRepo;
export const tradingRepo: TradingRepository = isSupabaseConfigured ? supabaseTradingRepo : localRepo;
