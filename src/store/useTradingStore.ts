import { create } from 'zustand';
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
} from '../types/trading';
import type { Instrument, MarketQuote, MarketStatus } from '../types/market';
import type { AccountMetrics } from '../types/analytics';
import { tradingRepo } from '../services/storage/SupabaseTradingRepo';
import { OrderExecutionEngine, type OrderSubmissionParams } from '../services/trading/OrderExecutionEngine';
import { FinancialCalculations } from '../services/trading/FinancialCalculations';
import { marketDataService } from '../services/market/MarketDataService';
import { INDIAN_INSTRUMENTS_MASTER } from '../services/market/indianInstruments';
import { INSTRUMENT_KEY_ALIASES } from '../services/market/UpstoxProvider';
import {
  DEFAULT_UPSTOX_ACCESS_TOKEN,
  DEFAULT_UPSTOX_API_KEY,
  DEFAULT_UPSTOX_API_SECRET,
} from '../config/upstoxDefault';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: number;
}

interface TradingStoreState {
  userId: string;
  userEmail: string;
  userName: string;
  account: PaperAccount | null;
  orders: Order[];
  trades: Trade[];
  positions: Position[];
  holdings: Holding[];
  ledger: LedgerEntry[];
  watchlists: Watchlist[];
  activeWatchlistId: string | null;
  quotes: Record<string, MarketQuote>;
  marketStatus: MarketStatus | null;
  selectedInstrument: Instrument;
  userSettings: UserSettings | null;
  isLoading: boolean;
  toasts: ToastMessage[];

  // Order ticket state
  isOrderTicketOpen: boolean;
  orderTicketInitialProps: Partial<OrderSubmissionParams> | null;

  // Actions
  init: (userId?: string, email?: string, name?: string) => Promise<void>;
  placeOrder: (params: Omit<OrderSubmissionParams, 'account'>) => Promise<boolean>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  closePosition: (positionId: string) => Promise<boolean>;
  closeAllPositions: () => Promise<void>;
  resetAccount: (reason?: string) => Promise<boolean>;
  setSelectedInstrument: (instrument: Instrument) => void;
  openOrderTicket: (props?: Partial<OrderSubmissionParams>) => void;
  closeOrderTicket: () => void;
  addToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
  removeToast: (id: string) => void;
  updateQuote: (quote: MarketQuote) => void;
  updateQuotesBatch: (quotes: MarketQuote[]) => void;
  setActiveWatchlist: (watchlistId: string) => void;
  addToWatchlist: (watchlistId: string, instrument: Instrument) => Promise<void>;
  removeFromWatchlist: (watchlistId: string, instrumentKey: string) => Promise<void>;
  getMetrics: () => AccountMetrics;
}

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

const getInitialAccount = (): PaperAccount => {
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('tradeedge_active_paper_account');
      if (cached) return JSON.parse(cached);
    } catch {}
  }
  return {
    id: 'a0000000-0000-0000-0000-000000000001',
    user_id: DEFAULT_USER_ID,
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
};

export const useTradingStore = create<TradingStoreState>((set, get) => ({
  userId: DEFAULT_USER_ID,
  userEmail: 'amit@cendrixcapital.com',
  userName: 'Amit',
  account: getInitialAccount(),
  orders: [],
  trades: [],
  positions: [],
  holdings: [],
  ledger: [],
  watchlists: [],
  activeWatchlistId: null,
  quotes: {},
  marketStatus: {
    exchange: 'NSE',
    status: 'OPEN',
    message: 'Institutional Direct Exchange Feed Active',
    last_updated: new Date().toISOString(),
  },
  selectedInstrument: INDIAN_INSTRUMENTS_MASTER[0], // NIFTY 50 by default
  userSettings: null,
  isLoading: false,
  toasts: [],
  isOrderTicketOpen: false,
  orderTicketInitialProps: null,

  init: async (userId, email, name) => {
    const targetUserId = userId || (typeof window !== 'undefined' ? localStorage.getItem('tradeedge_user_session_id') : null) || DEFAULT_USER_ID;
    if (typeof window !== 'undefined') {
      localStorage.setItem('tradeedge_user_session_id', targetUserId);
    }
    const targetEmail = email || get().userEmail;
    const targetName = name || get().userName;

    try {
      const [account, watchlists, settings] = await Promise.all([
        tradingRepo.getAccount(targetUserId),
        tradingRepo.getWatchlists(targetUserId),
        tradingRepo.getUserSettings(targetUserId),
      ]);

      const effectiveAccount = account || get().account;
      const accountId = effectiveAccount?.id || '';

      const [orders, trades, positions, holdings, ledger] = accountId
        ? await Promise.all([
            tradingRepo.getOrders(accountId),
            tradingRepo.getTrades(accountId),
            tradingRepo.getPositions(accountId),
            tradingRepo.getHoldings(accountId),
            tradingRepo.getLedger(accountId),
          ])
        : [[], [], [], [], []];

      const activeWatchlist = watchlists[0]?.id || null;

      // Update state immediately so UI is 100% rendered and interactive
      set({
        userId: targetUserId,
        userEmail: targetEmail,
        userName: targetName,
        account: effectiveAccount,
        orders,
        trades,
        positions,
        holdings,
        ledger,
        watchlists,
        activeWatchlistId: activeWatchlist,
        userSettings: settings,
        isLoading: false,
      });

      // Initialize Upstox credentials — env token takes top priority, followed by default institutional token
      const envToken = import.meta.env.VITE_UPSTOX_ACCESS_TOKEN || DEFAULT_UPSTOX_ACCESS_TOKEN;
      const isEnvValid = Boolean(envToken && envToken.length > 20 && !envToken.includes('optional_'));
      const activeToken = isEnvValid
        ? envToken
        : (settings?.upstox_access_token || (typeof window !== 'undefined' ? localStorage.getItem('tradeedge_upstox_access_token') : null) || DEFAULT_UPSTOX_ACCESS_TOKEN);

      marketDataService.setUpstoxCredentials(
        settings?.upstox_api_key || import.meta.env.VITE_UPSTOX_API_KEY || DEFAULT_UPSTOX_API_KEY,
        settings?.upstox_api_secret || import.meta.env.VITE_UPSTOX_API_SECRET || DEFAULT_UPSTOX_API_SECRET,
        activeToken
      );
      marketDataService.setMode('LIVE');

      // Background non-blocking quote fetching & live subscriptions
      marketDataService.getMarketStatus().then((ms) => {
        if (ms) set({ marketStatus: ms });
      }).catch(() => {});

      const allKeys = new Set<string>();
      INDIAN_INSTRUMENTS_MASTER.forEach(i => allKeys.add(i.instrument_key));
      allKeys.add('NSE_EQ|INE081A01020'); // TATASTEEL
      watchlists.forEach(w => w.items.forEach(i => allKeys.add(i.instrument_key)));
      positions.forEach(p => allKeys.add(p.instrument_key));
      holdings.forEach(h => allKeys.add(h.instrument_key));

      marketDataService.getQuotes(Array.from(allKeys)).then((initialQuotes) => {
        get().updateQuotesBatch(Object.values(initialQuotes));
      }).catch(() => {});

      let pendingTicks: MarketQuote[] = [];
      let rafId: any = null;

      marketDataService.subscribeQuotes(Array.from(allKeys), (quote) => {
        pendingTicks.push(quote);
        if (!rafId) {
          rafId = requestAnimationFrame(() => {
            const batch = pendingTicks;
            pendingTicks = [];
            rafId = null;
            get().updateQuotesBatch(batch);
          });
        }
      });
    } catch (err) {
      console.warn('Initialization background warning:', err);
      set({ isLoading: false });
    }
  },

  updateQuotesBatch: (quotesList: MarketQuote[]) => {
    if (!quotesList || quotesList.length === 0) return;
    const prevQuotes = get().quotes;
    const newQuotes = { ...prevQuotes };
    quotesList.forEach((q) => {
      newQuotes[q.instrument_key] = q;
      if (q.tradingsymbol) newQuotes[q.tradingsymbol] = q;
    });

    const positions = get().positions.map((p) => {
      if (p.is_closed || p.quantity === 0) return p;
      const quote = newQuotes[p.instrument_key];
      if (quote) {
        const uPnL = FinancialCalculations.calculateUnrealizedPnL(
          p.quantity,
          p.quantity > 0 ? p.buy_price : p.sell_price,
          quote.last_price,
          p.multiplier
        );
        return {
          ...p,
          last_price: quote.last_price,
          unrealized_pnl: uPnL,
        };
      }
      return p;
    });

    const holdings = get().holdings.map((h) => {
      const quote = newQuotes[h.instrument_key];
      if (quote) {
        const currentVal = h.quantity * quote.last_price;
        const pnl = currentVal - h.invested_value;
        const pnlPct = h.invested_value > 0 ? (pnl / h.invested_value) * 100 : 0;
        return {
          ...h,
          last_price: quote.last_price,
          current_value: currentVal,
          pnl,
          pnl_percentage: pnlPct,
          day_change: (quote.last_price - h.close_price) * h.quantity,
          day_change_percent: quote.change_percent,
        };
      }
      return h;
    });

    const account = get().account;
    if (account) {
      const totalUnrealized = positions.filter((p) => !p.is_closed).reduce((s, p) => s + p.unrealized_pnl, 0);
      const totalHoldingsVal = holdings.reduce((s, h) => s + h.current_value, 0);
      account.account_equity = account.cash_balance + totalUnrealized + totalHoldingsVal;
    }

    set({ quotes: newQuotes, positions, holdings, account });

    // Check pending orders trigger conditions
    const pendingOrders = get().orders.filter((o) => o.status === 'PENDING');
    if (pendingOrders.length > 0 && account) {
      const evalResult = OrderExecutionEngine.evaluatePendingOrders(
        pendingOrders,
        newQuotes,
        account,
        positions,
        holdings
      );

      if (evalResult.newTrades.length > 0) {
        // Pending orders were filled!
        const allOrders = get().orders.map((o) => {
          const updated = evalResult.updatedOrders.find((uo) => uo.id === o.id);
          return updated || o;
        });

        // Persist to storage
        evalResult.updatedOrders.forEach((o) => tradingRepo.saveOrder(o));
        evalResult.newTrades.forEach((t) => tradingRepo.saveTrade(t));
        tradingRepo.saveAccount(evalResult.updatedAccount);
        evalResult.updatedPositions.forEach((p) => tradingRepo.savePosition(p));
        evalResult.updatedHoldings.forEach((h) => tradingRepo.saveHolding(h));
        evalResult.newLedgerEntries.forEach((l) => tradingRepo.saveLedgerEntry(l));

        set({
          orders: allOrders,
          trades: [...evalResult.newTrades, ...get().trades],
          account: evalResult.updatedAccount,
          positions: evalResult.updatedPositions,
          holdings: evalResult.updatedHoldings,
          ledger: [...evalResult.newLedgerEntries, ...get().ledger],
        });

        evalResult.newTrades.forEach((trade) => {
          get().addToast(
            'success',
            'Order Triggered & Executed',
            `Filled ${trade.quantity} ${trade.tradingsymbol} @ ₹${trade.execution_price.toFixed(2)}`
          );
        });
      }
    }
  },

  updateQuote: (quote: MarketQuote) => {
    get().updateQuotesBatch([quote]);
  },

  placeOrder: async (params) => {
    let { account, positions, holdings, quotes, userSettings } = get();
    if (!account) {
      const recoveredAccount = await tradingRepo.getAccount(get().userId);
      if (recoveredAccount) {
        set({ account: recoveredAccount });
        account = recoveredAccount;
      } else {
        get().addToast('error', 'Execution Error', 'No active paper trading account found');
        return false;
      }
    }

    const realKey = INSTRUMENT_KEY_ALIASES[params.instrument_key] || params.instrument_key;
    let quote =
      quotes[params.instrument_key] ||
      quotes[realKey] ||
      quotes[params.tradingsymbol] ||
      null;

    if (!quote && params.instrument_key.includes('|')) {
      quote = quotes[params.instrument_key.replace('|', ':')] || null;
    }
    if (!quote) {
      const fetched = await marketDataService.getQuote(realKey);
      if (fetched) {
        get().updateQuote(fetched);
        quote = fetched;
      }
    }
    const slippageBps = userSettings?.simulated_slippage_bps ?? 5;
    const allowAfterHours = userSettings?.allow_after_hours_fill ?? true;

    const result = OrderExecutionEngine.processNewOrder(
      { ...params, account },
      quote,
      positions,
      holdings,
      slippageBps,
      allowAfterHours
    );

    if (result.error || result.order.status === 'REJECTED') {
      get().addToast('error', 'Order Rejected', result.error || 'Order rejected by simulation engine');
      return false;
    }

    // Persist changes
    await Promise.all([
      tradingRepo.saveOrder(result.order),
      result.trade ? tradingRepo.saveTrade(result.trade) : Promise.resolve(),
      tradingRepo.saveAccount(result.updatedAccount),
      ...result.updatedPositions.map(p => tradingRepo.savePosition(p)),
      ...result.updatedHoldings.map(h => tradingRepo.saveHolding(h)),
      ...result.ledgerEntries.map(l => tradingRepo.saveLedgerEntry(l)),
    ]);

    set((state) => ({
      orders: [result.order, ...state.orders],
      trades: result.trade ? [result.trade, ...state.trades] : state.trades,
      account: result.updatedAccount,
      positions: result.updatedPositions,
      holdings: result.updatedHoldings,
      ledger: [...result.ledgerEntries, ...state.ledger],
    }));

    if (result.order.status === 'COMPLETED' && result.trade) {
      get().addToast(
        'success',
        'Order Executed',
        `Filled ${result.trade.quantity} ${result.trade.tradingsymbol} @ ₹${result.trade.execution_price.toFixed(2)}`
      );
    } else if (result.order.status === 'PENDING') {
      get().addToast(
        'info',
        'Order Placed (Pending)',
        `Limit/SL Order placed for ${result.order.quantity} ${result.order.tradingsymbol} @ ₹${result.order.price}`
      );
    }

    return true;
  },

  cancelOrder: async (orderId) => {
    const { orders, account } = get();
    const order = orders.find(o => o.id === orderId);
    if (!order || !account) return false;

    const { cancelledOrder, updatedAccount } = OrderExecutionEngine.cancelOrder(order, account);

    await Promise.all([
      tradingRepo.updateOrder(cancelledOrder),
      tradingRepo.saveAccount(updatedAccount),
    ]);

    set((state) => ({
      orders: state.orders.map(o => (o.id === orderId ? cancelledOrder : o)),
      account: updatedAccount,
    }));

    get().addToast('info', 'Order Cancelled', `Order ${order.order_id} has been cancelled`);
    return true;
  },

  closePosition: async (positionId) => {
    const { positions, quotes } = get();
    const pos = positions.find(p => p.id === positionId);
    if (!pos || pos.is_closed || pos.quantity === 0) return false;

    // Opposite transaction type
    const oppositeType = pos.quantity > 0 ? 'SELL' : 'BUY';
    const closeQty = Math.abs(pos.quantity);
    const quote = quotes[pos.instrument_key];
    const fillPrice = quote ? quote.last_price : pos.last_price;

    return get().placeOrder({
      instrument_key: pos.instrument_key,
      tradingsymbol: pos.tradingsymbol,
      exchange: pos.exchange,
      instrument_type: pos.instrument_type,
      transaction_type: oppositeType,
      product: pos.product,
      order_type: 'MARKET',
      quantity: closeQty,
      lot_size: pos.lot_size,
      price: fillPrice,
      tag: 'POSITION_SQUARE_OFF',
    });
  },

  closeAllPositions: async () => {
    const openPositions = get().positions.filter(p => !p.is_closed && p.quantity !== 0);
    for (const pos of openPositions) {
      await get().closePosition(pos.id);
    }
    get().addToast('info', 'Square Off Complete', `All ${openPositions.length} open positions squared off`);
  },

  resetAccount: async (reason = 'User requested virtual reset') => {
    const { account, userId } = get();
    if (!account) return false;

    const prevBalance = account.cash_balance;
    const resetAcc = await tradingRepo.resetAccount(account.id, userId, prevBalance, reason);

    set({
      account: resetAcc,
      positions: [],
      holdings: [],
      orders: get().orders.map(o => (o.status === 'PENDING' ? { ...o, status: 'CANCELLED' as const } : o)),
      ledger: [
        {
          id: uuidv4(),
          account_id: resetAcc.id,
          user_id: userId,
          entry_type: 'RESET',
          reference_id: `RST-${Date.now()}`,
          description: 'Account Reset: Re-credited ₹10,00,000 Virtual Capital',
          debit: 0,
          credit: 1000000,
          balance_after: 1000000,
          created_at: new Date().toISOString(),
        },
        ...get().ledger,
      ],
    });

    get().addToast(
      'success',
      'Account Reset Successful',
      'Your paper account has been restored to ₹10,00,000. Positions and holdings cleared.'
    );
    return true;
  },

  setSelectedInstrument: (instrument) => {
    set({ selectedInstrument: instrument });
  },

  openOrderTicket: (props) => {
    set({
      isOrderTicketOpen: true,
      orderTicketInitialProps: props || null,
    });
  },

  closeOrderTicket: () => {
    set({
      isOrderTicketOpen: false,
      orderTicketInitialProps: null,
    });
  },

  addToast: (type, title, message) => {
    const id = uuidv4();
    const newToast: ToastMessage = { id, type, title, message, timestamp: Date.now() };
    set((state) => ({ toasts: [...state.toasts, newToast] }));

    setTimeout(() => {
      get().removeToast(id);
    }, 4500);
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  },

  setActiveWatchlist: (watchlistId) => {
    set({ activeWatchlistId: watchlistId });
  },

  addToWatchlist: async (watchlistId, instrument) => {
    let { watchlists, userId } = get();
    let wl = watchlists.find(w => w.id === watchlistId) || watchlists[0];

    // If no watchlist exists in state or database, auto-create one
    if (!wl) {
      const defaultWl: Watchlist = {
        id: uuidv4(),
        user_id: userId,
        name: 'My Watchlist',
        is_default: true,
        sort_order: 0,
        items: [],
      };
      await tradingRepo.saveWatchlist(defaultWl);
      watchlists = [defaultWl];
      wl = defaultWl;
    }

    if (wl.items.some(i => i.instrument_key === instrument.instrument_key)) {
      get().addToast('warning', 'Already in Watchlist', `${instrument.tradingsymbol} is already in ${wl.name}`);
      return;
    }

    const newItem = {
      id: uuidv4(),
      watchlist_id: wl.id,
      instrument_key: instrument.instrument_key,
      tradingsymbol: instrument.tradingsymbol,
      exchange: instrument.exchange,
      instrument_type: instrument.instrument_type,
      sort_order: wl.items.length,
      added_at: new Date().toISOString(),
    };

    const updatedWl = { ...wl, items: [...wl.items, newItem] };
    await tradingRepo.saveWatchlist(updatedWl);

    // Fetch live quote immediately for the added instrument
    marketDataService.getQuote(instrument.instrument_key).then((q) => {
      if (q) get().updateQuote(q);
    });

    set((state) => ({
      watchlists: state.watchlists.some(w => w.id === updatedWl.id)
        ? state.watchlists.map(w => (w.id === updatedWl.id ? updatedWl : w))
        : [...state.watchlists, updatedWl],
      activeWatchlistId: updatedWl.id,
    }));

    // Subscribe to live ticks
    marketDataService.subscribeQuotes([instrument.instrument_key], (quote) => {
      get().updateQuote(quote);
    });

    get().addToast('success', 'Watchlist Updated', `Added ${instrument.tradingsymbol} to ${wl.name}`);
  },

  removeFromWatchlist: async (watchlistId, instrumentKey) => {
    const { watchlists } = get();
    const wl = watchlists.find(w => w.id === watchlistId);
    if (!wl) return;

    const updatedWl = {
      ...wl,
      items: wl.items.filter(i => i.instrument_key !== instrumentKey),
    };
    await tradingRepo.saveWatchlist(updatedWl);

    set((state) => ({
      watchlists: state.watchlists.map(w => (w.id === watchlistId ? updatedWl : w)),
    }));
  },

  getMetrics: (): AccountMetrics => {
    const { account, trades, positions, holdings } = get();
    const initialCapital = account?.initial_balance || 1000000;
    const currentCash = account?.cash_balance || 1000000;
    const usedMargin = account?.used_margin || 0;
    const availableMargin = account?.available_margin || currentCash;

    // Unrealized P&L
    const openPositions = positions.filter(p => !p.is_closed && p.quantity !== 0);
    const unrealizedPnL = openPositions.reduce((s, p) => s + p.unrealized_pnl, 0);

    // Total Holdings Value
    const holdingsVal = holdings.reduce((s, h) => s + h.current_value, 0);
    const accountEquity = currentCash + unrealizedPnL + holdingsVal;

    // Realized P&L
    const realizedPnL = positions.reduce((s, p) => s + p.realized_pnl, 0);
    const totalCharges = trades.reduce((s, t) => s + t.charges.total_charges, 0);
    const overallNetPnL = (accountEquity - initialCapital);
    const todayPnL = unrealizedPnL; // simplified intraday MTM

    // Win rate from completed trades
    // Group trades by trade/order or count winning position closes
    const winningPositions = positions.filter(p => p.realized_pnl > 0);
    const losingPositions = positions.filter(p => p.realized_pnl < 0);
    const totalClosed = winningPositions.length + losingPositions.length;
    const winRate = totalClosed > 0 ? (winningPositions.length / totalClosed) * 100 : 0;

    const grossProfit = winningPositions.reduce((s, p) => s + p.realized_pnl, 0);
    const grossLoss = Math.abs(losingPositions.reduce((s, p) => s + p.realized_pnl, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 99.9 : 0);

    const overallReturnPercent = ((accountEquity - initialCapital) / initialCapital) * 100;

    // Max drawdown estimate
    const peakEquity = Math.max(initialCapital, accountEquity);
    const maxDrawdown = peakEquity - accountEquity;
    const maxDrawdownPercent = peakEquity > 0 ? (maxDrawdown / peakEquity) * 100 : 0;

    return {
      initial_capital: initialCapital,
      current_cash: currentCash,
      account_equity: accountEquity,
      realized_pnl: realizedPnL,
      unrealized_pnl: unrealizedPnL,
      today_pnl: todayPnL,
      overall_net_pnl: overallNetPnL,
      used_margin: usedMargin,
      available_margin: availableMargin,
      total_open_positions: openPositions.length,
      total_completed_trades: trades.length,
      win_rate: Math.round(winRate * 10) / 10,
      profit_factor: Math.round(profitFactor * 100) / 100,
      max_drawdown: Math.round(maxDrawdown * 100) / 100,
      max_drawdown_percent: Math.round(maxDrawdownPercent * 10) / 10,
      overall_return_percent: Math.round(overallReturnPercent * 10) / 10,
      total_brokerage_paid: Math.round(totalCharges * 100) / 100,
    };
  },
}));
