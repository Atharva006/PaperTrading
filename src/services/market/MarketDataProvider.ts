import type { 
  Instrument, 
  MarketQuote, 
  OHLCV, 
  OptionChainData, 
  MarketStatus, 
  CandleInterval, 
  Exchange, 
  InstrumentType 
} from '../../types/market';

export interface MarketDataProvider {
  readonly providerName: string;
  isConfigured(): boolean;
  searchInstruments(query: string, exchange?: Exchange, type?: InstrumentType): Promise<Instrument[]>;
  getQuote(instrumentKey: string): Promise<MarketQuote | null>;
  getQuotes(instrumentKeys: string[]): Promise<Record<string, MarketQuote>>;
  getHistoricalCandles(
    instrumentKey: string, 
    interval: CandleInterval, 
    toDate?: string, 
    fromDate?: string
  ): Promise<OHLCV[]>;
  getOptionChain(underlyingKey: string, expiry?: string): Promise<OptionChainData | null>;
  getExpiries(underlyingKey: string): Promise<string[]>;
  getMarketStatus(): Promise<MarketStatus>;
  subscribeQuotes(
    instrumentKeys: string[], 
    onTick: (quote: MarketQuote) => void
  ): () => void;
}
