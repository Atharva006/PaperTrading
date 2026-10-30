import React, { useState, useEffect } from 'react';
import { useTradingStore } from '../../store/useTradingStore';
import { marketDataService } from '../../services/market/MarketDataService';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  PlusCircle, 
  Activity, 
  ShieldCheck, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, onOpenReset }) => {
  const { quotes, account, openOrderTicket, marketStatus } = useTradingStore();
  const [providerMode, setProviderMode] = useState<'LIVE' | 'DEMO'>(marketDataService.getMode());

  useEffect(() => {
    const interval = setInterval(() => {
      setProviderMode(marketDataService.getMode());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const niftyQuote = quotes['NSE_INDEX|Nifty 50'] || quotes['NIFTY 50'];
  const bankNiftyQuote = quotes['NSE_INDEX|Nifty Bank'] || quotes['BANK NIFTY'];
  const sensexQuote = quotes['BSE_INDEX|SENSEX'] || quotes['SENSEX'];

  const fmt = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <header className="h-14 bg-white/95 backdrop-blur-md border-b border-[#D9E2F2] px-4 flex items-center justify-between gap-4 sticky top-0 z-30 select-none text-[#111114]">
      {/* ── Top Market Indices Ticker ───────────────────────────────────── */}
      <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide py-1">
        {/* NIFTY 50 */}
        <div className="flex items-center gap-2 text-xs whitespace-nowrap">
          <span className="font-semibold text-[#6B7A90] tracking-wide">NIFTY 50</span>
          <span className="font-mono text-[#00225A] font-bold">
            {niftyQuote ? fmt(niftyQuote.last_price) : '24,520.50'}
          </span>
          {niftyQuote && (
            <span className={`flex items-center text-[11px] font-mono font-bold ${niftyQuote.change >= 0 ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
              {niftyQuote.change >= 0 ? '+' : ''}{fmt(niftyQuote.change)} ({niftyQuote.change_percent.toFixed(2)}%)
            </span>
          )}
        </div>

        {/* BANK NIFTY */}
        <div className="flex items-center gap-2 text-xs whitespace-nowrap border-l border-[#D9E2F2] pl-4">
          <span className="font-semibold text-[#6B7A90] tracking-wide">BANK NIFTY</span>
          <span className="font-mono text-[#00225A] font-bold">
            {bankNiftyQuote ? fmt(bankNiftyQuote.last_price) : '52,140.25'}
          </span>
          {bankNiftyQuote && (
            <span className={`flex items-center text-[11px] font-mono font-bold ${bankNiftyQuote.change >= 0 ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
              {bankNiftyQuote.change >= 0 ? '+' : ''}{fmt(bankNiftyQuote.change)} ({bankNiftyQuote.change_percent.toFixed(2)}%)
            </span>
          )}
        </div>

        {/* SENSEX */}
        <div className="hidden lg:flex items-center gap-2 text-xs whitespace-nowrap border-l border-[#D9E2F2] pl-4">
          <span className="font-semibold text-[#6B7A90] tracking-wide">SENSEX</span>
          <span className="font-mono text-[#00225A] font-bold">
            {sensexQuote ? fmt(sensexQuote.last_price) : '80,500.10'}
          </span>
          {sensexQuote && (
            <span className={`flex items-center text-[11px] font-mono font-bold ${sensexQuote.change >= 0 ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
              {sensexQuote.change >= 0 ? '+' : ''}{fmt(sensexQuote.change)} ({sensexQuote.change_percent.toFixed(2)}%)
            </span>
          )}
        </div>
      </div>

      {/* ── Actions & Telemetry ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Search Trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F7F8FA] hover:bg-[#EEF3FF] border border-[#D9E2F2] text-[#6B7A90] hover:text-[#00225A] text-xs transition-colors cursor-pointer shadow-xs"
        >
          <Search className="w-3.5 h-3.5 text-[#00225A]" />
          <span className="hidden sm:inline">Search instruments</span>
          <kbd className="hidden md:inline-block text-[10px] bg-white px-1.5 py-0.5 rounded text-[#00225A] font-mono border border-[#D9E2F2]">⌘K</kbd>
        </button>

        {/* Live Feed Mode Capsule */}
        <div className="flex items-center gap-2 px-2.5 py-1 bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl text-xs font-mono shadow-xs">
          <span className={`w-2 h-2 rounded-full bg-[#12B76A] animate-pulse`} />
          <span className="text-[11px] font-bold text-[#00225A]">
            {providerMode === 'LIVE' ? (marketDataService.isConfigured() ? 'EXCHANGE LIVE' : 'LIVE FEED') : 'SIMULATION'}
          </span>
        </div>

        {/* Quick Buy/Sell Order Button */}
        <button
          onClick={() => openOrderTicket()}
          className="bg-[#00225A] hover:bg-[#536CF0] text-white py-1.5 px-3.5 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5 mr-1 inline" />
          <span>New Order</span>
        </button>
      </div>
    </header>
  );
};