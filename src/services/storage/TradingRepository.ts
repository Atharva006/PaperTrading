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

export interface TradingRepository {
  getAccount(userId: string): Promise<PaperAccount | null>;
  saveAccount(account: PaperAccount): Promise<void>;
  resetAccount(accountId: string, userId: string, previousBalance: number, reason?: string): Promise<PaperAccount>;

  getOrders(accountId: string): Promise<Order[]>;
  saveOrder(order: Order): Promise<void>;
  updateOrder(order: Order): Promise<void>;

  getTrades(accountId: string): Promise<Trade[]>;
  saveTrade(trade: Trade): Promise<void>;

  getPositions(accountId: string): Promise<Position[]>;
  savePosition(position: Position): Promise<void>;
  deletePosition(positionId: string): Promise<void>;

  getHoldings(accountId: string): Promise<Holding[]>;
  saveHolding(holding: Holding): Promise<void>;
  deleteHolding(holdingId: string): Promise<void>;

  getLedger(accountId: string): Promise<LedgerEntry[]>;
  saveLedgerEntry(entry: LedgerEntry): Promise<void>;

  getWatchlists(userId: string): Promise<Watchlist[]>;
  saveWatchlist(watchlist: Watchlist): Promise<void>;
  deleteWatchlist(watchlistId: string): Promise<void>;

  getUserSettings(userId: string): Promise<UserSettings | null>;
  saveUserSettings(settings: UserSettings): Promise<void>;
}
