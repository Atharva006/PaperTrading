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
import type { MarketDataProvider } from './MarketDataProvider';
import { UpstoxProvider } from './UpstoxProvider';

export class MarketDataService implements MarketDataProvider {
  private static instance: MarketDataService;
  private upstoxProvider: UpstoxProvider;
  private activeMode: 'LIVE' = 'LIVE';

  private constructor() {
    this.upstoxProvider = new UpstoxProvider();

    if (typeof window !== 'undefined') {
      localStorage.setItem('tradeedge_market_mode', 'LIVE');
      const savedEnv = localStorage.getItem('tradeedge_upstox_env') as 'PRODUCTION' | 'SANDBOX' | null;
      if (savedEnv) {
        this.upstoxProvider.setEnvironment(savedEnv);
      }
    }
  }

  public static getInstance(): MarketDataService {
    if (!MarketDataService.instance) {
      MarketDataService.instance = new MarketDataService();
    }
    return MarketDataService.instance;
  }

  public get providerName(): string {
    return 'Cendrix Institutional Live Exchange Feed';
  }

  public get activeProvider(): MarketDataProvider {
    return this.upstoxProvider;
  }

  public getMode(): 'LIVE' {
    return 'LIVE';
  }

  public setMode(_mode: 'LIVE' | 'DEMO'): void {
    this.activeMode = 'LIVE';
    if (typeof window !== 'undefined') {
      localStorage.setItem('tradeedge_market_mode', 'LIVE');
    }
  }

  public setEnvironment(env: 'PRODUCTION' | 'SANDBOX'): void {
    this.upstoxProvider.setEnvironment(env);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tradeedge_upstox_env', env);
    }
  }

  public setUpstoxCredentials(apiKey: string, apiSecret: string, accessToken: string): void {
    this.upstoxProvider = new UpstoxProvider(apiKey, apiSecret, accessToken);
    if (typeof window !== 'undefined') {
      const savedEnv = localStorage.getItem('tradeedge_upstox_env') as 'PRODUCTION' | 'SANDBOX' | null;
      if (savedEnv) this.upstoxProvider.setEnvironment(savedEnv);
    }
    if (accessToken && accessToken.length > 10 && !accessToken.includes('optional_')) {
      this.activeMode = 'LIVE';
      if (typeof window !== 'undefined') {
        localStorage.setItem('tradeedge_market_mode', 'LIVE');
        localStorage.setItem('tradeedge_upstox_access_token', accessToken);
      }
    }
  }

  public async exchangeUpstoxAuthCode(
    code: string,
    apiKey?: string,
    apiSecret?: string,
    redirectUri?: string
  ) {
    const res = await this.upstoxProvider.exchangeAuthCode(code, apiKey, apiSecret, redirectUri);
    if (res.success && res.access_token) {
      this.activeMode = 'LIVE';
    }
    return res;
  }

  public async testUpstoxConnection() {
    return this.upstoxProvider.testConnection();
  }

  public isConfigured(): boolean {
    return this.upstoxProvider.isConfigured();
  }

  public async searchInstruments(
    query: string,
    exchange?: Exchange,
    type?: InstrumentType
  ): Promise<Instrument[]> {
    return this.upstoxProvider.searchInstruments(query, exchange, type);
  }

  public async getQuote(instrumentKey: string): Promise<MarketQuote | null> {
    return this.upstoxProvider.getQuote(instrumentKey);
  }

  public async getQuotes(instrumentKeys: string[]): Promise<Record<string, MarketQuote>> {
    return this.upstoxProvider.getQuotes(instrumentKeys);
  }

  public async getHistoricalCandles(
    instrumentKey: string,
    interval: CandleInterval = 'day',
    toDate?: string,
    fromDate?: string
  ): Promise<OHLCV[]> {
    return this.upstoxProvider.getHistoricalCandles(instrumentKey, interval, toDate, fromDate);
  }

  public async getOptionChain(
    underlyingKey: string,
    expiry?: string
  ): Promise<OptionChainData | null> {
    return this.upstoxProvider.getOptionChain(underlyingKey, expiry);
  }

  public async getExpiries(underlyingKey: string): Promise<string[]> {
    return this.upstoxProvider.getExpiries(underlyingKey);
  }

  public async getMarketStatus(): Promise<MarketStatus> {
    return this.upstoxProvider.getMarketStatus();
  }

  public subscribeQuotes(
    instrumentKeys: string[],
    onTick: (quote: MarketQuote) => void
  ): () => void {
    return this.upstoxProvider.subscribeQuotes(instrumentKeys, onTick);
  }
}

export const marketDataService = MarketDataService.getInstance();
