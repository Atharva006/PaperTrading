import { v4 as uuidv4 } from 'uuid';

export type TradeDirection = 'Long' | 'Short';
export type TradeResult = 'Win' | 'Loss' | 'Break Even';
export type ExecutionQuality = 'Poor' | 'Average' | 'Good' | 'Excellent';

export interface Trade {
  id: string;
  date: string;
  instrument: string;
  direction: TradeDirection;
  setup: string;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  exit: number;
  riskAmount: number;
  pnl: number;
  rr: number;
  result: TradeResult;
  notes: string;
  
  // Trade Details
  quantity?: number;
  commission?: number;
  fees?: number;
  pointValue?: number;
  strategy?: string;
  timeframe?: string;
  session?: string;
  tags?: string;
  entryTime?: string;
  exitTime?: string;
  accountId?: string;

  // Psychology & Review
  emotionBefore?: string;
  emotionDuring?: string;
  emotionAfter?: string;
  confidence?: number;
  executionQuality?: ExecutionQuality;
  preTradeThesis?: string;
  postTradeReview?: string;
  mistakes?: string;
  lesson?: string;

  // Screenshots (storing data URLs or just file names for demo)
  screenshotBefore?: string;
  screenshotDuring?: string;
  screenshotAfter?: string;
}

export interface Account {
  id: string;
  name: string;
  firm: string;
  size: number;
  startingBalance: number;
  currentBalance: number;
  profitTarget: number;
  dailyLossLimit: number;
  maxDrawdown: number;
  status: 'Funded' | 'Challenge' | 'Failed';
}

export const initialAccounts: Account[] = [];

export const mockTrades: Trade[] = []; // Empty demo data
