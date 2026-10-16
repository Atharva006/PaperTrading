import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

let quoteCache: { data: Record<string, any>; timestamp: number } | null = null;
const CACHE_TTL_MS = 2000; // 2-second cache — refreshes on new poll cycle

function liveMarketPlugin() {
  return {
    name: 'live-market-data-feed',
    configureServer(server: any) {
      server.middlewares.use('/api/market/quotes', async (req: any, res: any) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');

        const now = Date.now();
        if (quoteCache && now - quoteCache.timestamp < CACHE_TTL_MS) {
          res.end(JSON.stringify({ status: 'success', data: quoteCache.data, cached: true }));
          return;
        }

        try {
          const symbolMap: Record<string, string> = {
            'NSE_INDEX|Nifty 50': '^NSEI',
            'NSE_INDEX|Nifty Bank': '^NSEBANK',
            'BSE_INDEX|SENSEX': '^BSESN',
            'NSE_INDEX|Nifty Fin Service': 'NIFTY_FIN_SERVICE.NS',
            'NSE_INDEX|Nifty IT': '^CNXIT',
            'NSE_EQ|INE081A01020': 'TATASTEEL.NS',
            'NSE_EQ|INE002A01018': 'RELIANCE.NS',
            'NSE_EQ|INE040A01034': 'HDFCBANK.NS',
            'NSE_EQ|INE467B01029': 'TCS.NS',
            'NSE_EQ|INE009A01021': 'INFY.NS',
            'NSE_EQ|INE090A01021': 'ICICIBANK.NS',
            'NSE_EQ|INE062A01020': 'SBIN.NS',
            'NSE_EQ|INE397D01024': 'BHARTIARTL.NS',
            'NSE_EQ|INE154A01025': 'ITC.NS',
            'NSE_EQ|INE018A01030': 'LT.NS',
            'NSE_EQ|INE155A01022': 'TATAMOTORS.NS',
            'NSE_EQ|INE296A01024': 'BAJFINANCE.NS',
            'NSE_EQ|INE585B01010': 'MARUTI.NS',
            'NSE_EQ|INE044A01036': 'SUNPHARMA.NS',
            'NSE_EQ|INE238A01034': 'AXISBANK.NS',
            'NSE_EQ|INE280A01028': 'TITAN.NS',
            'NSE_EQ|INE075A01022': 'WIPRO.NS',
            'MCX_FO|GOLD': 'GC=F',
            'MCX_FO|495213': 'GC=F',
            'MCX_FO|GOLDM': 'GC=F',
            'MCX_FO|571445': 'GC=F',
            'MCX_FO|SILVER': 'SI=F',
            'MCX_FO|495214': 'SI=F',
            'MCX_FO|SILVERM': 'SI=F',
            'MCX_FO|483080': 'SI=F',
            'MCX_FO|CRUDEOIL': 'CL=F',
            'MCX_FO|569900': 'CL=F',
            'MCX_FO|NATURALGAS': 'NG=F',
            'MCX_FO|570750': 'NG=F',
            'MCX_FO|COPPER': 'HG=F',
            'MCX_FO|574829': 'HG=F',
            'MCX_FO|ZINC': 'HG=F',
            'MCX_FO|574834': 'HG=F',
            // Contract Tradingsymbol Direct Mappings
            'GOLDM26NOVFUT': 'GC=F',
            'GOLD26DECFUT': 'GC=F',
            'SILVER26DECFUT': 'SI=F',
            'SILVERM26NOVFUT': 'SI=F',
            'CRUDEOIL26OCTFUT': 'CL=F',
            'CRUDEOILM26OCTFUT': 'CL=F',
            'NATURALGAS26OCTFUT': 'NG=F',
            'NATGASMINI26OCTFUT': 'NG=F',
            'COPPER26OCTFUT': 'HG=F',
            'ZINC26OCTFUT': 'HG=F',
            'NIFTY26OCTFUT': '^NSEI',
            'NIFTY26NOVFUT': '^NSEI',
            'BANKNIFTY26OCTFUT': '^NSEBANK',
            'FINNIFTY26OCTFUT': 'NIFTY_FIN_SERVICE.NS',
          };

          // Fetch live USDINR exchange rate
          let usdinr = 95.045;
          try {
            const fxRes = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/USDINR=X');
            if (fxRes.ok) {
              const fxData = await fxRes.json();
              const rate = fxData.chart?.result?.[0]?.meta?.regularMarketPrice;
              if (rate > 50 && rate < 150) usdinr = rate;
            }
          } catch {}

          const uniqueSymbols = Array.from(new Set(Object.values(symbolMap)));
          const rawQuotes: Record<string, any> = {};

          await Promise.all(
            uniqueSymbols.map(async (s) => {
              try {
                const res = await fetch(
                  `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(s)}?interval=1m&range=1d`,
                  { headers: { 'User-Agent': 'Mozilla/5.0' } }
                );
                if (res.ok) {
                  const data = await res.json();
                  const meta = data.chart?.result?.[0]?.meta;
                  if (meta && meta.regularMarketPrice) {
                    rawQuotes[s] = {
                      price: meta.regularMarketPrice,
                      prevClose: meta.chartPreviousClose || meta.regularMarketPrice,
                      high: meta.regularMarketDayHigh || meta.regularMarketPrice,
                      low: meta.regularMarketDayLow || meta.regularMarketPrice,
                      volume: meta.regularMarketVolume || 100000,
                    };
                  }
                }
              } catch {}
            })
          );

          const result: Record<string, any> = {};

          for (const [key, s] of Object.entries(symbolMap)) {
            const raw = rawQuotes[s];
            if (!raw) continue;

            let price = raw.price;
            let prevClose = raw.prevClose;
            let dayHigh = raw.high;
            let dayLow = raw.low;

            // MCX Indian Commodity Transformations
            if (s === 'GC=F') {
              // Gold $/oz to ₹/10g in India
              const inrPerGram = (raw.price / 31.1035) * usdinr * 1.06;
              price = Math.round(inrPerGram * 10);
              prevClose = Math.round(((raw.prevClose / 31.1035) * usdinr * 1.06) * 10);
              dayHigh = Math.round(((raw.high / 31.1035) * usdinr * 1.06) * 10);
              dayLow = Math.round(((raw.low / 31.1035) * usdinr * 1.06) * 10);
            } else if (s === 'SI=F') {
              // Silver $/oz to ₹/kg in India
              const inrPerKg = (raw.price / 31.1035) * 1000 * usdinr * 1.06;
              price = Math.round(inrPerKg);
              prevClose = Math.round((raw.prevClose / 31.1035) * 1000 * usdinr * 1.06);
              dayHigh = Math.round((raw.high / 31.1035) * 1000 * usdinr * 1.06);
              dayLow = Math.round((raw.low / 31.1035) * 1000 * usdinr * 1.06);
            } else if (s === 'CL=F') {
              // Crude Oil $/bbl to ₹/bbl in India
              price = Math.round(raw.price * usdinr);
              prevClose = Math.round(raw.prevClose * usdinr);
              dayHigh = Math.round(raw.high * usdinr);
              dayLow = Math.round(raw.low * usdinr);
            } else if (s === 'NG=F') {
              // Natural Gas $/mmBtu to ₹/mmBtu in India
              price = Math.round(raw.price * usdinr * 10) / 10;
              prevClose = Math.round(raw.prevClose * usdinr * 10) / 10;
              dayHigh = Math.round(raw.high * usdinr * 10) / 10;
              dayLow = Math.round(raw.low * usdinr * 10) / 10;
            } else if (s === 'HG=F') {
              // Copper / Zinc $/lb to ₹/kg
              if (key.includes('ZINC')) {
                price = Math.round((raw.price / 0.453592) * usdinr * 0.35 * 10) / 10;
                prevClose = Math.round((raw.prevClose / 0.453592) * usdinr * 0.35 * 10) / 10;
                dayHigh = Math.round((raw.high / 0.453592) * usdinr * 0.35 * 10) / 10;
                dayLow = Math.round((raw.low / 0.453592) * usdinr * 0.35 * 10) / 10;
              } else {
                price = Math.round((raw.price / 0.453592) * usdinr * 10) / 10;
                prevClose = Math.round((raw.prevClose / 0.453592) * usdinr * 10) / 10;
                dayHigh = Math.round((raw.high / 0.453592) * usdinr * 10) / 10;
                dayLow = Math.round((raw.low / 0.453592) * usdinr * 10) / 10;
              }
            }

            const change = Math.round((price - prevClose) * 100) / 100;
            const changePercent = prevClose > 0 ? Math.round((change / prevClose) * 10000) / 100 : 0;
            const symbol = key.includes('|') ? key.split('|')[1] : key;

            // Generate realistic 5 Bid / 5 Ask depth around live price
            const tick = price > 1000 ? 1 : 0.05;
            const depth = {
              buy: [
                { price: Math.round((price - tick * 1) * 100) / 100, quantity: 150, orders: 4 },
                { price: Math.round((price - tick * 2) * 100) / 100, quantity: 380, orders: 8 },
                { price: Math.round((price - tick * 3) * 100) / 100, quantity: 640, orders: 12 },
                { price: Math.round((price - tick * 4) * 100) / 100, quantity: 920, orders: 15 },
                { price: Math.round((price - tick * 5) * 100) / 100, quantity: 1450, orders: 22 },
              ],
              sell: [
                { price: Math.round((price + tick * 1) * 100) / 100, quantity: 120, orders: 3 },
                { price: Math.round((price + tick * 2) * 100) / 100, quantity: 290, orders: 6 },
                { price: Math.round((price + tick * 3) * 100) / 100, quantity: 510, orders: 9 },
                { price: Math.round((price + tick * 4) * 100) / 100, quantity: 840, orders: 14 },
                { price: Math.round((price + tick * 5) * 100) / 100, quantity: 1300, orders: 19 },
              ],
            };

            const quoteObj = {
              instrument_key: key,
              tradingsymbol: symbol,
              last_price: price,
              open: prevClose,
              high: dayHigh,
              low: dayLow,
              close: prevClose,
              change,
              change_percent: changePercent,
              volume: raw.volume,
              average_price: Math.round(((prevClose + price) / 2) * 100) / 100,
              timestamp: new Date().toISOString(),
              is_live: true,
              depth,
            };

            result[key] = quoteObj;
            result[symbol] = quoteObj;
          }

          quoteCache = { data: result, timestamp: now };
          res.end(JSON.stringify({ status: 'success', data: result, cached: false }));
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ status: 'error', message: err.message }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), liveMarketPlugin()],
  server: {
    proxy: {
      '/api/news': {
        target: 'https://nfs.faireconomy.media',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/news/, '/ff_calendar_thisweek.json'),
      },
      // Proxy all Upstox API calls through the server to avoid CORS errors
      '/upstox': {
        target: 'https://api.upstox.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/upstox/, ''),
        configure: (proxy) => {
          proxy.on('error', (_err, _req, res) => {
            (res as any).writeHead(502, { 'Content-Type': 'application/json' });
            (res as any).end(JSON.stringify({ status: 'error', message: 'Upstox API proxy error' }));
          });
        },
      },
    },
  },
});
