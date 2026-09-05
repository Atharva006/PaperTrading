import { create } from 'zustand';
import type { Trade, Account } from '../data/mockData';
import { initialAccounts } from '../data/mockData';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AppState {
  user: User | null;
  accounts: Account[];
  trades: Trade[];
  activeAccountId: string | null;
  editingTradeId: string | null;
  isLoading: boolean;
  
  setUser: (user: User | null) => void;
  setActiveAccount: (id: string) => void;
  setEditingTradeId: (id: string | null) => void;
  fetchTrades: () => Promise<void>;
  addTrade: (trade: Trade) => void;
  deleteTrade: (id: string) => Promise<void>;
  updateTrade: (trade: Trade) => Promise<void>;
  addAccount: (acc: Account) => void;
  deleteAccount: (id: string) => void;
}

// Convert DB snake_case to camelCase
const mapDbToTrade = (dbTrade: any): Trade => ({
  id: dbTrade.id,
  date: dbTrade.date,
  instrument: dbTrade.instrument,
  direction: dbTrade.direction,
  entry: dbTrade.entry_price,
  exit: dbTrade.exit_price || 0,
  stopLoss: dbTrade.stop_loss || 0,
  takeProfit: dbTrade.take_profit || 0,
  quantity: dbTrade.quantity || 0,
  commission: dbTrade.commission || 0,
  fees: dbTrade.fees || 0,
  pointValue: dbTrade.point_value || 100,
  pnl: dbTrade.pnl || 0,
  accountId: dbTrade.account_id,

  riskAmount: dbTrade.risk_amount || 0,
  rr: dbTrade.rr || 0,
  result: dbTrade.result || 'Break Even',
  strategy: dbTrade.strategy,
  setup: dbTrade.setup,
  timeframe: dbTrade.timeframe,
  session: dbTrade.session,
  tags: dbTrade.tags,
  notes: dbTrade.notes || "",
  emotionBefore: dbTrade.emotion_before,
  emotionDuring: dbTrade.emotion_during,
  emotionAfter: dbTrade.emotion_after,
  confidence: dbTrade.confidence,
  executionQuality: dbTrade.execution_quality,
  preTradeThesis: dbTrade.pre_trade_thesis,
  postTradeReview: dbTrade.post_trade_review,
  mistakes: dbTrade.mistakes,
  lesson: dbTrade.lesson,
  screenshotBefore: dbTrade.screenshot_before,
  screenshotDuring: dbTrade.screenshot_during,
  screenshotAfter: dbTrade.screenshot_after,

});

export const useStore = create<AppState>((set, get) => ({
  user: null,
  accounts: initialAccounts,
  trades: [],
  activeAccountId: initialAccounts[0]?.id ?? null,
  editingTradeId: null,
  isLoading: true,
  
  setUser: (user) => {
    set({ user });
    if (user) {
      get().fetchTrades();
    } else {
      set({ trades: [], isLoading: false });
    }
  },
  
  setActiveAccount: (id) => set({ activeAccountId: id }),
  setEditingTradeId: (id) => set({ editingTradeId: id }),
  
  fetchTrades: async () => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .order('date', { ascending: false });
      
    if (!error && data) {
      set({ trades: data.map(mapDbToTrade) });
    }
    set({ isLoading: false });
  },
  
  addTrade: (trade) => {
    // Add locally immediately for fast UI response
    set((state) => ({ trades: [trade, ...state.trades] }));
  },
  
  addAccount: (acc) => set((state) => ({
    accounts: [...state.accounts, acc],
    activeAccountId: state.activeAccountId || acc.id,
  })),
  deleteAccount: (id) => set((state) => {
    const remaining = state.accounts.filter(a => a.id !== id);
    return {
      accounts: remaining,
      activeAccountId: state.activeAccountId === id ? (remaining[0]?.id ?? null) : state.activeAccountId,
    };
  }),
  updateTrade: async (trade) => {
    const { error } = await supabase.from('trades').update({ date: trade.date, instrument: trade.instrument, direction: trade.direction, entry_price: trade.entry, exit_price: trade.exit, stop_loss: trade.stopLoss, take_profit: trade.takeProfit, quantity: trade.quantity, commission: trade.commission, fees: trade.fees, point_value: trade.pointValue, pnl: trade.pnl, risk_amount: trade.riskAmount, rr: trade.rr, result: trade.result, strategy: trade.strategy, setup: trade.setup, timeframe: trade.timeframe, session: trade.session, tags: trade.tags, emotion_before: trade.emotionBefore, emotion_during: trade.emotionDuring, emotion_after: trade.emotionAfter, confidence: trade.confidence, execution_quality: trade.executionQuality, pre_trade_thesis: trade.preTradeThesis, post_trade_review: trade.postTradeReview, mistakes: trade.mistakes, lesson: trade.lesson, screenshot_before: trade.screenshotBefore, screenshot_during: trade.screenshotDuring, screenshot_after: trade.screenshotAfter }).eq('id', trade.id);
    if (!error) {
      set((state) => ({ trades: state.trades.map(t => t.id === trade.id ? trade : t) }));
    }
  },
  deleteTrade: async (id) => {
    const { error } = await supabase.from('trades').delete().eq('id', id);
    if (!error) {
      set((state) => ({ trades: state.trades.filter(t => t.id !== id) }));
    }
  },
}));
