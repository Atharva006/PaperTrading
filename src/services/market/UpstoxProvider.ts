import type {
  Instrument,
  MarketQuote,
  OHLCV,
  OptionChainData,
  MarketStatus,
  CandleInterval,
  Exchange,
  InstrumentType,
  OptionContract,
  OptionChainStrikeRow
} from '../../types/market';
import type { MarketDataProvider } from './MarketDataProvider';
import type { UpstoxQuotesResponse, UpstoxHistoricalCandleResponse, UpstoxOptionChainResponse } from '../../types/upstox';
import { INDIAN_INSTRUMENTS_MASTER } from './indianInstruments';

export class UpstoxProvider implements MarketDataProvider {
  public readonly providerName = 'Upstox API v2';
  private baseUrl = 'https://api.upstox.com/v2';
  private apiKey: string;
  private apiSecret: string;
  private accessToken: string;
  private redirectUri: string;
  private activeWs: WebSocket | null = null;
  private wsSubscribers = new Map<string, Set<(quote: MarketQuote) => void>>();
  private pollInterval: any = null;
  private quoteCache = new Map<string, { quote: MarketQuote; fetchedAt: number }>();

  constructor(apiKey = '', apiSecret = '', accessToken = '', redirectUri = '') {
    this.apiKey = apiKey || import.meta.env.VITE_UPSTOX_API_KEY || '';
    this.apiSecret = apiSecret || import.meta.env.VITE_UPSTOX_API_SECRET || '';
    this.redirectUri = redirectUri || import.meta.env.VITE_UPSTOX_REDIRECT_URI || '';
    
    // Check passed token, localStorage, or env
    const savedToken = typeof window !== 'undefined' ? localStorage.getItem('tradeedge_upstox_access_token') : null;
    this.accessToken = accessToken || savedToken || import.meta.env.VITE_UPSTOX_ACCESS_TOKEN || '';
  }

  public isConfigured(): boolean {
    return Boolean(this.accessToken && this.accessToken.trim().length > 10 && !this.accessToken.includes('optional_'));
  }

  public setAccessToken(token: string): void {
    this.accessToken = token;
    if (typeof window !== 'undefined' && token) {
      localStorage.setItem('tradeedge_upstox_access_token', token);
    }
  }

  public setEnvironment(env: 'PRODUCTION' | 'SANDBOX'): void {
    this.baseUrl = env === 'SANDBOX' ? 'https://sandbox.upstox.com/v2' : 'https://api.upstox.com/v2';
  }

  public getLoginUrl(): string {
    const clientId = encodeURIComponent(this.apiKey);
    const redirectUri = encodeURIComponent(this.redirectUri);
    return `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
  }

  private getHeaders(): Record<string, string> {
    return {
      Accept: 'application/json',
      Authorization: `Bearer ${this.accessToken}`,
    };
  }

  public async searchInstruments(
    query: string,
    exchange?: Exchange,
    type?: InstrumentType
  ): Promise<Instrument[]> {
    const q = query.trim().toUpperCase();
    return INDIAN_INSTRUMENTS_MASTER.filter((inst) => {
      const matchQuery = !q || inst.tradingsymbol.toUpperCase().includes(q) || inst.name.toUpperCase().includes(q);
      const matchEx = !exchange || inst.exchange === exchange;
      const matchType = !type || inst.instrument_type === type;
      return matchQuery && matchEx && matchType;
    });
  }

  public async getQuote(instrumentKey: string): Promise<MarketQuote | null> {
    const quotes = await this.getQuotes([instrumentKey]);
    return quotes[instrumentKey] || null;
  }

  public async exchangeAuthCode(
    code: string,
    apiKeyOverride?: string,
    apiSecretOverride?: string,
    redirectUriOverride?: string
  ): Promise<{ success: boolean; access_token?: string; error?: string }> {
    const clientId = apiKeyOverride || this.apiKey;
    const clientSecret = apiSecretOverride || this.apiSecret;
    const redirectUri = redirectUriOverride || this.redirectUri;

    if (!clientId || !clientSecret) {
      return { success: false, error: 'Upstox API Key and Secret are required to exchange authorization code.' };
    }

    try {
      const body = new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      });

      const res = await fetch(`${this.baseUrl}/login/authorization/token`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Api-Version': '2.0',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      const json = await res.json();
      if (!res.ok || json.status === 'error' || !json.access_token) {
        const msg = json.errors?.[0]?.message || json.message || `Token exchange failed with status ${res.status}`;
        return { success: false, error: msg };
      }

      this.accessToken = json.access_token;
      return { success: true, access_token: json.access_token };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error connecting to Upstox' };
    }
  }

  public async testConnection(): Promise<{ success: boolean; latencyMs: number; message: string; ltp?: number; isAuthenticated?: boolean }> {
    const t0 = performance.now();
    const testKey = 'NSE_INDEX|Nifty 50';
    const encKey = encodeURIComponent(testKey);

    // 1. If configured with a token, try authenticated quote first
    if (this.isConfigured()) {
      try {
        const res = await fetch(`${this.baseUrl}/market-quote/quotes?instrument_key=${encKey}`, {
          headers: this.getHeaders(),
        });
        const latencyMs = Math.round(performance.now() - t0);

        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success' && json.data) {
            const firstQuote = Object.values(json.data)[0] as any;
            const ltp = firstQuote?.last_price ?? firstQuote?.depth?.last_price ?? firstQuote?.ohlc?.close ?? 0;
            return {
              success: true,
              latencyMs,
              message: `Upstox Full Live Exchange Feed Active (Authenticated)! Latency: ${latencyMs}ms.`,
              ltp,
              isAuthenticated: true,
            };
          }
        } else {
          // Token is invalid/expired — clear it so it doesn't loop on 401s
          this.accessToken = '';
          if (typeof window !== 'undefined') {
            localStorage.removeItem('tradeedge_upstox_access_token');
          }
        }
      } catch {
        // Fall through to public feed test
      }
    }

    // 2. Real-time Public Exchange Feed Test (Always accessible without token)
    try {
      const res = await fetch(`${this.baseUrl}/historical-candle/intraday/${encKey}/1minute`, {
        headers: { Accept: 'application/json' },
      });
      const latencyMs = Math.round(performance.now() - t0);

      if (res.ok) {
        const json = await res.json();
        const candles = json.data?.candles || [];
        if (candles.length > 0) {
          const ltp = Number(candles[0][4]);
          return {
            success: true,
            latencyMs,
            message: `Upstox Real-Time Public Exchange Feed Active! Latency: ${latencyMs}ms. Live tick fetched: NIFTY 50 @ ₹${ltp.toFixed(2)}. (Click 'Authorize 1-Click' anytime for full Level 2 Depth/WebSocket stream).`,
            ltp,
            isAuthenticated: false,
          };
        }
      }
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - t0);
      return {
        success: false,
        latencyMs,
        message: `Network error connecting to Upstox: ${err.message}`,
      };
    }

    return {
      success: false,
      latencyMs: 0,
      message: 'Could not connect to Upstox market feed.',
    };
  }

  public async getQuotes(instrumentKeys: string[]): Promise<Record<string, MarketQuote>> {
    if (instrumentKeys.length === 0) return {};

    // 1. Try Authenticated Upstox API quotes if configured
    if (this.isConfigured()) {
      try {
        const param = instrumentKeys.map(k => encodeURIComponent(k)).join(',');
        const res = await fetch(`${this.baseUrl}/market-quote/quotes?instrument_key=${param}`, {
          headers: this.getHeaders(),
        });

        if (res.ok) {
          const json: UpstoxQuotesResponse = await res.json();
          const results: Record<string, MarketQuote> = {};

          if (json.status === 'success' && json.data) {
            Object.entries(json.data).forEach(([key, item]) => {
              const lastPrice = item.last_price ?? item.depth?.last_price ?? item.ohlc?.close ?? 0;
              const open = item.ohlc?.open ?? item.open ?? lastPrice;
              const high = item.ohlc?.high ?? item.high ?? lastPrice;
              const low = item.ohlc?.low ?? item.low ?? lastPrice;
              const close = item.ohlc?.close ?? item.close ?? lastPrice;
              const volume = item.quotes?.volume ?? item.volume ?? 0;
              const avgPrice = item.quotes?.average_price ?? item.average_price ?? lastPrice;
              const oi = item.quotes?.oi ?? item.oi ?? 0;
              const change = item.quotes?.net_change ?? item.net_change ?? (close > 0 ? lastPrice - close : 0);
              const changePercent = close > 0 ? (change / close) * 100 : 0;

              const normKey = item.instrument_token || key.replace(':', '|');

              // Master lookup for proper tradingsymbol
              const master = INDIAN_INSTRUMENTS_MASTER.find(
                i => i.instrument_key === normKey || i.instrument_key === key || i.tradingsymbol === key
              );
              const symbol = master?.tradingsymbol || normKey.split('|')[1] || key.split(':')[1] || key;

              const quote: MarketQuote = {
                instrument_key: normKey,
                tradingsymbol: symbol,
                last_price: lastPrice,
                open,
                high,
                low,
                close,
                change: Math.round(change * 100) / 100,
                change_percent: Math.round(changePercent * 100) / 100,
                volume,
                average_price: avgPrice,
                oi,
                lower_circuit_limit: item.quotes?.lower_circuit_limit ?? item.lower_circuit_limit,
                upper_circuit_limit: item.quotes?.upper_circuit_limit ?? item.upper_circuit_limit,
                timestamp: item.timestamp || new Date().toISOString(),
                is_live: true,
                depth: item.depth ? {
                  buy: item.depth.buy || [],
                  sell: item.depth.sell || [],
                } : undefined,
              };

              results[key] = quote;
              results[normKey] = quote;
              results[symbol] = quote;
              if (item.instrument_token) {
                results[item.instrument_token] = quote;
              }
              if (key.includes('|')) results[key.replace('|', ':')] = quote;
              if (key.includes(':')) results[key.replace(':', '|')] = quote;
            });

            return results;
          }
        } else if (res.status === 401) {
          // Token expired or invalid — clear token so we seamlessly use public feed
          this.accessToken = '';
          if (typeof window !== 'undefined') {
            localStorage.removeItem('tradeedge_upstox_access_token');
          }
        }
      } catch (err) {
        console.warn('Authenticated Upstox quotes failed, falling back to public market feed:', err);
      }
    }

    // 2. Public Market Feed Fallback (No Bearer Token required)
    // Fetches genuine real-time 1-minute intraday candles from Upstox public endpoint with cache & throttle protection
    const results: Record<string, MarketQuote> = {};
    const uniqueKeys = Array.from(new Set(instrumentKeys));
    const now = Date.now();
    const CACHE_TTL_MS = 3500; // 3.5 seconds quote cache to prevent Cloudflare 429 rate limits

    const keysToFetch: string[] = [];

    uniqueKeys.forEach((key) => {
      const cached = this.quoteCache.get(key);
      if (cached && (now - cached.fetchedAt) < CACHE_TTL_MS) {
        results[key] = cached.quote;
        if (cached.quote.tradingsymbol) results[cached.quote.tradingsymbol] = cached.quote;
      } else {
        keysToFetch.push(key);
      }
    });

    if (keysToFetch.length > 0) {
      const chunkSize = 6;
      for (let i = 0; i < keysToFetch.length; i += chunkSize) {
        const chunk = keysToFetch.slice(i, i + chunkSize);
        await Promise.all(
          chunk.map(async (key) => {
            try {
              const encKey = encodeURIComponent(key);
              const res = await fetch(`${this.baseUrl}/historical-candle/intraday/${encKey}/1minute`, {
                headers: { Accept: 'application/json' },
              });
              if (!res.ok) {
                // Return last known cached quote on rate-limit or transient network hiccup
                const fallback = this.quoteCache.get(key);
                if (fallback) {
                  results[key] = fallback.quote;
                  if (fallback.quote.tradingsymbol) results[fallback.quote.tradingsymbol] = fallback.quote;
                }
                return;
              }

              const json = await res.json();
              const candles = json.data?.candles || [];
              if (candles.length === 0) return;

              // Upstox intraday candles: newest candle is index 0
              const latest = candles[0];
              const earliest = candles[candles.length - 1];
              const lastPrice = Number(latest[4]);
              const openPrice = Number(earliest[1]);

              let highPrice = -Infinity;
              let lowPrice = Infinity;
              let totalVol = 0;

              candles.forEach(([_, _o, h, l, _c, v]: any[]) => {
                if (Number(h) > highPrice) highPrice = Number(h);
                if (Number(l) < lowPrice) lowPrice = Number(l);
                totalVol += Number(v || 0);
              });

              const change = lastPrice - openPrice;
              const changePercent = openPrice > 0 ? (change / openPrice) * 100 : 0;

              // Resolve proper tradingsymbol from master instrument catalog
              const master = INDIAN_INSTRUMENTS_MASTER.find(
                inst => inst.instrument_key === key || 
                        inst.instrument_key.toLowerCase() === key.toLowerCase() ||
                        inst.tradingsymbol === key
              );
              const symbol = master?.tradingsymbol || (key.includes('|') ? key.split('|')[1] : key);

              const q: MarketQuote = {
                instrument_key: key,
                tradingsymbol: symbol,
                last_price: lastPrice,
                open: openPrice,
                high: highPrice,
                low: lowPrice,
                close: openPrice,
                change: Math.round(change * 100) / 100,
                change_percent: Math.round(changePercent * 100) / 100,
                volume: totalVol,
                average_price: Math.round(((openPrice + lastPrice) / 2) * 100) / 100,
                timestamp: latest[0] || new Date().toISOString(),
                is_live: true,
              };

              // Cache quote
              this.quoteCache.set(key, { quote: q, fetchedAt: Date.now() });
              if (master?.instrument_key) this.quoteCache.set(master.instrument_key, { quote: q, fetchedAt: Date.now() });
              if (symbol) this.quoteCache.set(symbol, { quote: q, fetchedAt: Date.now() });

              results[key] = q;
              results[symbol] = q;
              if (master?.instrument_key) {
                results[master.instrument_key] = q;
              }
              if (key.includes('|')) results[key.replace('|', ':')] = q;
              if (key.includes(':')) results[key.replace(':', '|')] = q;
            } catch {
              const fallback = this.quoteCache.get(key);
              if (fallback) {
                results[key] = fallback.quote;
              }
            }
          })
        );
      }
    }

    return results;
  }

  public async getHistoricalCandles(
    instrumentKey: string,
    interval: CandleInterval = 'day',
    toDate?: string,
    fromDate?: string
  ): Promise<OHLCV[]> {
    try {
      const now = new Date();
      const to = toDate || now.toISOString().split('T')[0];
      const past7 = fromDate || new Date(now.getTime() - 9 * 24 * 3600 * 1000).toISOString().split('T')[0];
      const past180 = fromDate || new Date(now.getTime() - 180 * 24 * 3600 * 1000).toISOString().split('T')[0];

      const encKey = encodeURIComponent(instrumentKey);

      const parseCandles = (rawArr: any[]): OHLCV[] => {
        return (rawArr || []).map(([ts, open, high, low, close, volume]) => ({
          time: Math.floor(new Date(ts).getTime() / 1000),
          open: Number(open),
          high: Number(high),
          low: Number(low),
          close: Number(close),
          volume: Number(volume || 0),
        }));
      };

      const aggregateCandles = (candles: OHLCV[], intervalMinutes: number): OHLCV[] => {
        if (candles.length === 0 || intervalMinutes <= 1) return candles;
        const intervalSeconds = intervalMinutes * 60;
        const groups = new Map<number, OHLCV[]>();

        candles.forEach((c) => {
          const bucket = Math.floor(c.time / intervalSeconds) * intervalSeconds;
          if (!groups.has(bucket)) groups.set(bucket, []);
          groups.get(bucket)!.push(c);
        });

        const aggregated: OHLCV[] = [];
        Array.from(groups.keys()).sort((a, b) => a - b).forEach((bucket) => {
          const g = groups.get(bucket)!;
          let high = -Infinity;
          let low = Infinity;
          let vol = 0;
          g.forEach((c) => {
            if (c.high > high) high = c.high;
            if (c.low < low) low = c.low;
            vol += (c.volume || 0);
          });
          aggregated.push({
            time: bucket,
            open: g[0].open,
            high,
            low,
            close: g[g.length - 1].close,
            volume: vol,
          });
        });
        return aggregated;
      };

      // 1. Day interval
      if (interval === 'day') {
        const url = `${this.baseUrl}/historical-candle/${encKey}/day/${to}/${past180}`;
        const headers = this.isConfigured() ? this.getHeaders() : { Accept: 'application/json' };
        const res = await fetch(url, { headers });
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success' && json.data?.candles) {
            return parseCandles(json.data.candles).reverse();
          }
        }
        return [];
      }

      // 2. Sub-daily intervals (1m, 5m, 15m, 30m, 1h)
      // Fetches multi-day historical candles (last 7-8+ days) PLUS today's live intraday candles
      const upstoxUnit = (interval === '30minute' || interval === '1hour') ? '30minute' : '1minute';
      const headers = this.isConfigured() ? this.getHeaders() : { Accept: 'application/json' };

      const [histRes, intraRes] = await Promise.all([
        fetch(`${this.baseUrl}/historical-candle/${encKey}/${upstoxUnit}/${to}/${past7}`, { headers }).catch(() => null),
        fetch(`${this.baseUrl}/historical-candle/intraday/${encKey}/${upstoxUnit}`, { headers }).catch(() => null),
      ]);

      const histJson = histRes && histRes.ok ? await histRes.json() : null;
      const intraJson = intraRes && intraRes.ok ? await intraRes.json() : null;

      const histCandles = histJson?.data?.candles ? parseCandles(histJson.data.candles).reverse() : [];
      const intraCandles = intraJson?.data?.candles ? parseCandles(intraJson.data.candles).reverse() : [];

      // Merge and deduplicate by timestamp
      const map = new Map<number, OHLCV>();
      histCandles.forEach((c) => map.set(c.time, c));
      intraCandles.forEach((c) => map.set(c.time, c));
      const merged = Array.from(map.values()).sort((a, b) => a.time - b.time);

      if (interval === '5minute') return aggregateCandles(merged, 5);
      if (interval === '15minute') return aggregateCandles(merged, 15);
      if (interval === '1hour') return aggregateCandles(merged, 60);

      return merged;
    } catch (err) {
      console.warn('Failed to fetch Upstox candles:', err);
      return [];
    }
  }

  public async getExpiries(underlyingKey: string): Promise<string[]> {
    if (!this.isConfigured()) return [];

    try {
      const encKey = encodeURIComponent(underlyingKey);
      const res = await fetch(`${this.baseUrl}/option/contract?instrument_key=${encKey}`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) return [];

      const json = await res.json();
      if (json.status === 'success' && Array.isArray(json.data)) {
        const expSet = new Set<string>();
        json.data.forEach((c: any) => {
          if (c.expiry) expSet.add(c.expiry);
        });
        return Array.from(expSet).sort();
      }
      return [];
    } catch {
      return [];
    }
  }

  public async getOptionChain(
    underlyingKey: string,
    expiry?: string
  ): Promise<OptionChainData | null> {
    if (!this.isConfigured()) return null;

    try {
      const expiries = await this.getExpiries(underlyingKey);
      const selectedExpiry = expiry || expiries[0] || '';

      const encKey = encodeURIComponent(underlyingKey);
      const url = `${this.baseUrl}/option/chain?instrument_key=${encKey}&expiry_date=${selectedExpiry}`;
      const res = await fetch(url, { headers: this.getHeaders() });
      if (!res.ok) throw new Error(`Option chain error: ${res.status}`);

      const json: UpstoxOptionChainResponse = await res.json();
      if (json.status !== 'success' || !Array.isArray(json.data)) return null;

      const strikeRows: OptionChainStrikeRow[] = [];
      let totalCallOi = 0;
      let totalPutOi = 0;
      let spotPrice = 0;

      json.data.forEach((item) => {
        if (!spotPrice && item.underlying_spot_price) {
          spotPrice = item.underlying_spot_price;
        }

        let callContract: OptionContract | undefined;
        let putContract: OptionContract | undefined;

        if (item.call_options) {
          const md = item.call_options.market_data;
          totalCallOi += md.oi || 0;
          callContract = {
            instrument_key: item.call_options.instrument_key,
            tradingsymbol: `${underlyingKey.split('|')[1]} ${item.strike_price} CE`,
            strike_price: item.strike_price,
            option_type: 'CE',
            expiry: item.expiry,
            lot_size: 25,
            ltp: md.ltp,
            change: md.ltp - md.close_price,
            change_percent: md.close_price > 0 ? ((md.ltp - md.close_price) / md.close_price) * 100 : 0,
            volume: md.volume,
            oi: md.oi,
            oi_change: 0,
            iv: item.call_options.option_greeks?.iv || 15,
            greeks: item.call_options.option_greeks ? {
              delta: item.call_options.option_greeks.delta,
              gamma: item.call_options.option_greeks.gamma,
              theta: item.call_options.option_greeks.theta,
              vega: item.call_options.option_greeks.vega,
              iv: item.call_options.option_greeks.iv,
            } : undefined,
            bid: md.bid_price || 0,
            ask: md.ask_price || 0,
          };
        }

        if (item.put_options) {
          const md = item.put_options.market_data;
          totalPutOi += md.oi || 0;
          putContract = {
            instrument_key: item.put_options.instrument_key,
            tradingsymbol: `${underlyingKey.split('|')[1]} ${item.strike_price} PE`,
            strike_price: item.strike_price,
            option_type: 'PE',
            expiry: item.expiry,
            lot_size: 25,
            ltp: md.ltp,
            change: md.ltp - md.close_price,
            change_percent: md.close_price > 0 ? ((md.ltp - md.close_price) / md.close_price) * 100 : 0,
            volume: md.volume,
            oi: md.oi,
            oi_change: 0,
            iv: item.put_options.option_greeks?.iv || 15,
            greeks: item.put_options.option_greeks ? {
              delta: item.put_options.option_greeks.delta,
              gamma: item.put_options.option_greeks.gamma,
              theta: item.put_options.option_greeks.theta,
              vega: item.put_options.option_greeks.vega,
              iv: item.put_options.option_greeks.iv,
            } : undefined,
            bid: md.bid_price || 0,
            ask: md.ask_price || 0,
          };
        }

        strikeRows.push({
          strike_price: item.strike_price,
          call: callContract,
          put: putContract,
        });
      });

      const pcr = totalCallOi > 0 ? Math.round((totalPutOi / totalCallOi) * 100) / 100 : 1.0;

      return {
        underlying_key: underlyingKey,
        underlying_symbol: underlyingKey.split('|')[1] || underlyingKey,
        underlying_price: spotPrice,
        expiry: selectedExpiry,
        available_expiries: expiries,
        strikes: strikeRows,
        total_call_oi: totalCallOi,
        total_put_oi: totalPutOi,
        pcr,
      };
    } catch (err) {
      console.warn('Failed to fetch Upstox option chain:', err);
      return null;
    }
  }

  public async getMarketStatus(): Promise<MarketStatus> {
    if (this.isConfigured()) {
      try {
        const res = await fetch(`${this.baseUrl}/market/status/NSE`, {
          headers: this.getHeaders(),
        });
        if (res.ok) {
          const json = await res.json();
          const status = json.data?.status?.toUpperCase?.();
          return {
            exchange: 'NSE',
            status: status === 'OPEN' ? 'OPEN' : 'CLOSED',
            message: json.data?.message || (status === 'OPEN' ? 'NSE Market Open' : 'NSE Market Closed'),
            last_updated: new Date().toISOString(),
          };
        }
      } catch {
        // Fallback to local IST calculation below
      }
    }

    // Compute Indian market hours (NSE is open Mon-Fri 09:15 to 15:30 IST)
    const now = new Date();
    const istTimeStr = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    const istDate = new Date(istTimeStr);
    const day = istDate.getDay(); // 0 = Sun, 6 = Sat
    const hour = istDate.getHours();
    const minute = istDate.getMinutes();
    const totalMinutes = hour * 60 + minute;
    const isWeekday = day >= 1 && day <= 5;
    const isTradingHours = totalMinutes >= 555 && totalMinutes <= 930;
    const isOpen = isWeekday && isTradingHours;

    return {
      exchange: 'NSE',
      status: isOpen ? 'OPEN' : 'CLOSED',
      message: isOpen ? 'NSE Market Live (09:15 - 15:30 IST)' : 'NSE Market Closed',
      last_updated: new Date().toISOString(),
    };
  }

  public subscribeQuotes(
    instrumentKeys: string[],
    onTick: (quote: MarketQuote) => void
  ): () => void {
    instrumentKeys.forEach((key) => {
      if (!this.wsSubscribers.has(key)) {
        this.wsSubscribers.set(key, new Set());
      }
      this.wsSubscribers.get(key)!.add(onTick);
    });

    const pollAll = async () => {
      const allActiveKeys = Array.from(this.wsSubscribers.keys());
      if (allActiveKeys.length === 0) return;

      try {
        const quotes = await this.getQuotes(allActiveKeys);
        Object.entries(quotes).forEach(([key, q]) => {
          this.wsSubscribers.get(key)?.forEach((cb) => cb(q));
          this.wsSubscribers.get(q.instrument_key)?.forEach((cb) => cb(q));
        });
      } catch (err) {
        console.warn('Upstox poll tick error:', err);
      }
    };

    // Initial immediate poll
    pollAll();

    // Start background stream polling interval (every 4s) if not already active
    if (!this.pollInterval) {
      this.pollInterval = setInterval(pollAll, 4000);
    }

    return () => {
      instrumentKeys.forEach((key) => {
        this.wsSubscribers.get(key)?.delete(onTick);
        if (this.wsSubscribers.get(key)?.size === 0) {
          this.wsSubscribers.delete(key);
        }
      });

      if (this.wsSubscribers.size === 0 && this.pollInterval) {
        clearInterval(this.pollInterval);
        this.pollInterval = null;
      }
    };
  }
}
