import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTradingStore } from '../../store/useTradingStore';
import { INDIAN_INSTRUMENTS_MASTER } from '../../services/market/indianInstruments';
import {
  Compass,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export const ContextualSubnav: React.FC = () => {
  const { quotes, setSelectedInstrument } = useTradingStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine current market session (IST hours: 09:15 to 15:30, Mon-Fri, and MCX up to 23:30)
  const [sessionInfo, setSessionInfo] = useState<{
    label: string;
    isOpen: boolean;
  }>({ label: 'NSE REGULAR SESSION', isOpen: false });

  useEffect(() => {
    const checkMarketHours = () => {
      const now = new Date();
      // UTC to IST (+5:30)
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istDate = new Date(now.getTime() + istOffset + now.getTimezoneOffset() * 60 * 1000);
      const day = istDate.getDay();
      const hours = istDate.getHours();
      const minutes = istDate.getMinutes();
      const totalMinutes = hours * 60 + minutes;

      const isWeekday = day >= 1 && day <= 5;
      const isNSEOpen = isWeekday && totalMinutes >= 9 * 60 + 15 && totalMinutes <= 15 * 60 + 30;
      const isMCXOpen = isWeekday && totalMinutes >= 9 * 60 && totalMinutes <= 23 * 60 + 30;

      if (isNSEOpen) {
        setSessionInfo({ label: 'NSE / BSE LIVE SESSION', isOpen: true });
      } else if (isMCXOpen) {
        setSessionInfo({ label: 'MCX COMMODITIES LIVE SESSION', isOpen: true });
      } else {
        setSessionInfo({ label: 'MARKET POST-SESSION (LIVE UPSTOX FEEDS)', isOpen: false });
      }
    };

    checkMarketHours();
    const timer = setInterval(checkMarketHours, 30000);
    return () => clearInterval(timer);
  }, []);

  const fmt = (n: number) =>
    n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Key Benchmark Indices, Stocks and Commodities for Live Ribbon
  const tickers = [
    { key: 'NSE_INDEX|Nifty 50', altKey: 'NIFTY 50', label: 'NIFTY 50' },
    { key: 'NSE_INDEX|Nifty Bank', altKey: 'BANK NIFTY', label: 'BANK NIFTY' },
    { key: 'MCX_FO|495213', altKey: 'MCX_FO|GOLD', label: 'MCX GOLD' },
    { key: 'MCX_FO|495214', altKey: 'MCX_FO|SILVER', label: 'MCX SILVER' },
    { key: 'MCX_FO|569900', altKey: 'MCX_FO|CRUDEOIL', label: 'MCX CRUDE' },
    { key: 'MCX_FO|574829', altKey: 'MCX_FO|COPPER', label: 'MCX COPPER' },
    { key: 'NSE_EQ|INE081A01020', altKey: 'TATASTEEL', label: 'TATA STEEL' },
    { key: 'NSE_EQ|INE002A01018', altKey: 'RELIANCE', label: 'RELIANCE' },
  ];

  const handleTickerClick = (instKey: string, altKey?: string) => {
    const inst = INDIAN_INSTRUMENTS_MASTER.find(
      (i) => i.instrument_key === instKey || (altKey && i.instrument_key === altKey) || (altKey && i.tradingsymbol === altKey)
    );
    if (inst) {
      setSelectedInstrument(inst);
      if (inst.exchange === 'MCX' || inst.exchange === 'NCDEX') {
        if (location.pathname !== '/dashboard/commodities') {
          navigate('/dashboard/commodities');
        }
      } else if (location.pathname !== '/dashboard/terminal') {
        navigate('/dashboard/terminal');
      }
    }
  };

  const getContextLabel = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Institutional Overview';
    if (path.includes('commodities')) return 'MCX & NCDEX Commodities';
    if (path.includes('terminal')) return 'Trading Workstation';
    if (path.includes('watchlist')) return 'Market Watch & Depth';
    if (path.includes('derivatives')) return 'Futures & Derivatives';
    if (path.includes('positions')) return 'Active Positions & MTM';
    if (path.includes('orders')) return 'Order Book & Executions';
    if (path.includes('holdings')) return 'Equity Portfolio Holdings';
    if (path.includes('tradebook')) return 'Tradebook & Brokerage';
    if (path.includes('portfolio')) return 'Account Ledger & Audit';
    if (path.includes('analytics')) return 'Performance Analytics';
    if (path.includes('settings')) return 'Settings & API Feed';
    return 'Institutional Terminal';
  };

  return (
    <div className="bg-[#080808] border-b border-[#191919] select-none text-xs z-30">
      <div className="max-w-[1920px] mx-auto px-3 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-3">
        
        {/* ── Context Breadcrumb / Session Telemetry ────────────────────── */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                sessionInfo.isOpen ? 'bg-[#00C087] animate-pulse' : 'bg-[#D4AF65]'
              }`}
            />
            <span className="text-[10px] font-mono font-bold tracking-wider text-[#A1A1AA] uppercase">
              {sessionInfo.label}
            </span>
          </div>

          <span className="text-[#242424] hidden md:inline">|</span>

          <div className="hidden md:flex items-center gap-1.5 text-[10px] font-medium text-[#71717A]">
            <Compass className="w-3.5 h-3.5 text-[#D4AF65]" />
            <span className="font-semibold text-[#F5F5F5]">{getContextLabel()}</span>
          </div>
        </div>

        {/* ── Live Streaming Benchmark Ticker Ribbon ───────────────────── */}
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-hide py-0.5">
          {tickers.map((t) => {
            const q = quotes[t.key] || (t.altKey ? quotes[t.altKey] : undefined);
            const price = q ? q.last_price : 0;
            const change = q ? q.change : 0;
            const changePct = q ? q.change_percent : 0;
            const isPos = change >= 0;

            return (
              <div
                key={t.key}
                onClick={() => handleTickerClick(t.key, t.altKey)}
                className="flex items-center gap-2 cursor-pointer hover:bg-[#131313] px-2 py-0.5 rounded transition-colors group whitespace-nowrap border border-transparent hover:border-[#242424]"
                title={`Click to open ${t.label} on Trading Terminal`}
              >
                <span className="font-semibold text-[11px] text-[#A1A1AA] group-hover:text-[#F5F5F5] tracking-tight">
                  {t.label}
                </span>
                <span className="font-mono text-xs font-bold text-[#F5F5F5]">
                  {price > 0 ? `₹${fmt(price)}` : '...'}
                </span>
                {price > 0 && (
                  <span
                    className={`flex items-center text-[10px] font-mono font-bold ${
                      isPos ? 'text-[#00C087]' : 'text-[#FF4D67]'
                    }`}
                  >
                    {isPos ? '+' : ''}
                    {fmt(change)} ({changePct.toFixed(2)}%)
                  </span>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
