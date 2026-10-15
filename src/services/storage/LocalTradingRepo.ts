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

const STORAGE_KEYS = {
  ACCOUNT: 'trade_edge_account',
  ORDERS: 'trade_edge_orders',
  TRADES: 'trade_edge_trades',
  POSITIONS: 'trade_edge_positions',
  HOLDINGS: 'trade_edge_holdings',
  LEDGER: 'trade_edge_ledger',
  WATCHLISTS: 'trade_edge_watchlists',
  SETTINGS: 'trade_edge_settings',
  RESETS: 'trade_edge_resets',
};

export class LocalTradingRepo implements TradingRepository {
  private getJson<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setJson<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn('LocalStorage write failed:', err);
    }
  }

  public async getAccount(userId: string): Promise<PaperAccount | null> {
    const acc = this.getJson<PaperAccount | null>(`${STORAGE_KEYS.ACCOUNT}_${userId}`, null);
    if (acc) return acc;

    // Create default virtual account with ₹10,00,000
    const newAccount: PaperAccount = {
      id: uuidv4(),
      user_id: userId,
      account_number: `IN-PT-${userId.slice(0, 8).toUpperCase()}`,
      account_name: 'Virtual Trading Account (₹10,00,000)',
      currency: 'INR',
      initial_balance: 1000000,
      cash_balance: 1000000,
      used_margin: 0,
      available_margin: 1000000,
      account_equity: 1000000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.setJson(`${STORAGE_KEYS.ACCOUNT}_${userId}`, newAccount);

    // Initial Ledger Credit
    const initialLedger: LedgerEntry = {
      id: uuidv4(),
      account_id: newAccount.id,
      user_id: userId,
      entry_type: 'INITIAL_CREDIT',
      reference_id: `INIT-${newAccount.account_number}`,
      description: 'Initial Virtual Trading Capital Grant (₹10,00,000)',
      debit: 0,
      credit: 1000000,
      balance_after: 1000000,
      created_at: new Date().toISOString(),
    };
    await this.saveLedgerEntry(initialLedger);

    return newAccount;
  }

  public async saveAccount(account: PaperAccount): Promise<void> {
    account.updated_at = new Date().toISOString();
    this.setJson(`${STORAGE_KEYS.ACCOUNT}_${account.user_id}`, account);
  }

  public async resetAccount(
    accountId: string,
    userId: string,
    previousBalance: number,
    reason = 'User requested account reset'
  ): Promise<PaperAccount> {
    // 1. Reset orders: cancel pending
    const orders = await this.getOrders(accountId);
    const updatedOrders = orders.map((o) => (o.status === 'PENDING' ? { ...o, status: 'CANCELLED' as const } : o));
    this.setJson(`${STORAGE_KEYS.ORDERS}_${accountId}`, updatedOrders);

    // 2. Clear positions and holdings
    this.setJson(`${STORAGE_KEYS.POSITIONS}_${accountId}`, []);
    this.setJson(`${STORAGE_KEYS.HOLDINGS}_${accountId}`, []);

    // 3. Reset balance to ₹10,00,000
    const resetAccount: PaperAccount = {
      id: accountId,
      user_id: userId,
      account_number: `IN-PT-${userId.slice(0, 8).toUpperCase()}`,
      account_name: 'Virtual Trading Account (₹10,00,000)',
      currency: 'INR',
      initial_balance: 1000000,
      cash_balance: 1000000,
      used_margin: 0,
      available_margin: 1000000,
      account_equity: 1000000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await this.saveAccount(resetAccount);

    // 4. Save Reset Event
    const resetEvents = this.getJson<any[]>(`${STORAGE_KEYS.RESETS}_${userId}`, []);
    resetEvents.push({
      id: uuidv4(),
      account_id: accountId,
      user_id: userId,
      previous_balance: previousBalance,
      new_balance: 1000000,
      reason,
      reset_at: new Date().toISOString(),
    });
    this.setJson(`${STORAGE_KEYS.RESETS}_${userId}`, resetEvents);

    // 5. Add Ledger entry
    await this.saveLedgerEntry({
      id: uuidv4(),
      account_id: accountId,
      user_id: userId,
      entry_type: 'RESET',
      reference_id: `RST-${Date.now()}`,
      description: 'Account Reset: Re-credited ₹10,00,000 Virtual Funds',
      debit: 0,
      credit: 1000000,
      balance_after: 1000000,
      created_at: new Date().toISOString(),
    });

    return resetAccount;
  }

  public async getOrders(accountId: string): Promise<Order[]> {
    return this.getJson<Order[]>(`${STORAGE_KEYS.ORDERS}_${accountId}`, []);
  }

  public async saveOrder(order: Order): Promise<void> {
    const orders = await this.getOrders(order.account_id);
    const existingIdx = orders.findIndex((o) => o.id === order.id);
    if (existingIdx >= 0) {
      orders[existingIdx] = order;
    } else {
      orders.unshift(order);
    }
    this.setJson(`${STORAGE_KEYS.ORDERS}_${order.account_id}`, orders);
  }

  public async updateOrder(order: Order): Promise<void> {
    return this.saveOrder(order);
  }

  public async getTrades(accountId: string): Promise<Trade[]> {
    return this.getJson<Trade[]>(`${STORAGE_KEYS.TRADES}_${accountId}`, []);
  }

  public async saveTrade(trade: Trade): Promise<void> {
    const trades = await this.getTrades(trade.account_id);
    trades.unshift(trade);
    this.setJson(`${STORAGE_KEYS.TRADES}_${trade.account_id}`, trades);
  }

  public async getPositions(accountId: string): Promise<Position[]> {
    return this.getJson<Position[]>(`${STORAGE_KEYS.POSITIONS}_${accountId}`, []);
  }

  public async savePosition(position: Position): Promise<void> {
    const positions = await this.getPositions(position.account_id);
    const idx = positions.findIndex(
      (p) => p.instrument_key === position.instrument_key && p.product === position.product
    );
    if (idx >= 0) {
      positions[idx] = position;
    } else {
      positions.push(position);
    }
    this.setJson(`${STORAGE_KEYS.POSITIONS}_${position.account_id}`, positions);
  }

  public async deletePosition(_positionId: string): Promise<void> {
    // Soft mark closed or remove
  }

  public async getHoldings(accountId: string): Promise<Holding[]> {
    return this.getJson<Holding[]>(`${STORAGE_KEYS.HOLDINGS}_${accountId}`, []);
  }

  public async saveHolding(holding: Holding): Promise<void> {
    const holdings = await this.getHoldings(holding.account_id);
    const idx = holdings.findIndex((h) => h.instrument_key === holding.instrument_key);
    if (idx >= 0) {
      holdings[idx] = holding;
    } else {
      holdings.push(holding);
    }
    this.setJson(`${STORAGE_KEYS.HOLDINGS}_${holding.account_id}`, holdings);
  }

  public async deleteHolding(_holdingId: string): Promise<void> {
    // Handled in order execution engine
  }

  public async getLedger(accountId: string): Promise<LedgerEntry[]> {
    return this.getJson<LedgerEntry[]>(`${STORAGE_KEYS.LEDGER}_${accountId}`, []);
  }

  public async saveLedgerEntry(entry: LedgerEntry): Promise<void> {
    const entries = await this.getLedger(entry.account_id);
    entries.unshift(entry);
    this.setJson(`${STORAGE_KEYS.LEDGER}_${entry.account_id}`, entries);
  }

  public async getWatchlists(userId: string): Promise<Watchlist[]> {
    const lists = this.getJson<Watchlist[]>(`${STORAGE_KEYS.WATCHLISTS}_${userId}`, []);
    if (lists.length > 0) return lists;

    // Default Watchlists
    const defaultWatchlists: Watchlist[] = [
      {
        id: uuidv4(),
        user_id: userId,
        name: 'Key Indices',
        is_default: true,
        sort_order: 0,
        created_at: new Date().toISOString(),
        items: [
          {
            id: uuidv4(),
            watchlist_id: '',
            instrument_key: 'NSE_INDEX|Nifty 50',
            tradingsymbol: 'NIFTY 50',
            exchange: 'NSE',
            instrument_type: 'INDEX',
            sort_order: 0,
            added_at: new Date().toISOString(),
          },
          {
            id: uuidv4(),
            watchlist_id: '',
            instrument_key: 'NSE_INDEX|Nifty Bank',
            tradingsymbol: 'BANK NIFTY',
            exchange: 'NSE',
            instrument_type: 'INDEX',
            sort_order: 1,
            added_at: new Date().toISOString(),
          },
          {
            id: uuidv4(),
            watchlist_id: '',
            instrument_key: 'BSE_INDEX|SENSEX',
            tradingsymbol: 'SENSEX',
            exchange: 'BSE',
            instrument_type: 'INDEX',
            sort_order: 2,
            added_at: new Date().toISOString(),
          },
          {
            id: uuidv4(),
            watchlist_id: '',
            instrument_key: 'NSE_INDEX|Nifty Fin Service',
            tradingsymbol: 'FINNIFTY',
            exchange: 'NSE',
            instrument_type: 'INDEX',
            sort_order: 3,
            added_at: new Date().toISOString(),
          },
        ],
      },
      {
        id: uuidv4(),
        user_id: userId,
        name: 'Top Bluechips',
        is_default: false,
        sort_order: 1,
        created_at: new Date().toISOString(),
        items: [
          {
            id: uuidv4(),
            watchlist_id: '',
            instrument_key: 'NSE_EQ|INE002A01018',
            tradingsymbol: 'RELIANCE',
            exchange: 'NSE',
            instrument_type: 'EQUITY',
            sort_order: 0,
            added_at: new Date().toISOString(),
          },
          {
            id: uuidv4(),
            watchlist_id: '',
            instrument_key: 'NSE_EQ|INE040A01034',
            tradingsymbol: 'HDFCBANK',
            exchange: 'NSE',
            instrument_type: 'EQUITY',
            sort_order: 1,
            added_at: new Date().toISOString(),
          },
          {
            id: uuidv4(),
            watchlist_id: '',
            instrument_key: 'NSE_EQ|INE467B01029',
            tradingsymbol: 'TCS',
            exchange: 'NSE',
            instrument_type: 'EQUITY',
            sort_order: 2,
            added_at: new Date().toISOString(),
          },
          {
            id: uuidv4(),
            watchlist_id: '',
            instrument_key: 'NSE_EQ|INE009A01021',
            tradingsymbol: 'INFY',
            exchange: 'NSE',
            instrument_type: 'EQUITY',
            sort_order: 3,
            added_at: new Date().toISOString(),
          },
        ],
      },
    ];

    this.setJson(`${STORAGE_KEYS.WATCHLISTS}_${userId}`, defaultWatchlists);
    return defaultWatchlists;
  }

  public async saveWatchlist(watchlist: Watchlist): Promise<void> {
    const lists = await this.getWatchlists(watchlist.user_id);
    const idx = lists.findIndex((w) => w.id === watchlist.id);
    if (idx >= 0) {
      lists[idx] = watchlist;
    } else {
      lists.push(watchlist);
    }
    this.setJson(`${STORAGE_KEYS.WATCHLISTS}_${watchlist.user_id}`, lists);
  }

  public async deleteWatchlist(_watchlistId: string): Promise<void> {
    // remove
  }

  public async getUserSettings(userId: string): Promise<UserSettings | null> {
    const settings = this.getJson<UserSettings | null>(`${STORAGE_KEYS.SETTINGS}_${userId}`, null);
    if (settings) return settings;

    const defaultSettings: UserSettings = {
      id: uuidv4(),
      user_id: userId,
      market_data_mode: 'DEMO',
      simulated_slippage_bps: 5,
      allow_after_hours_fill: true,
      theme: 'dark',
    };
    this.setJson(`${STORAGE_KEYS.SETTINGS}_${userId}`, defaultSettings);
    return defaultSettings;
  }

  public async saveUserSettings(settings: UserSettings): Promise<void> {
    this.setJson(`${STORAGE_KEYS.SETTINGS}_${settings.user_id}`, settings);
  }
}

export const localTradingRepo = new LocalTradingRepo();
