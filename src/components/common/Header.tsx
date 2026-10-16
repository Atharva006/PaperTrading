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
    <header className="h-14 bg-[#080808] border-b border-[#242424] px-4 flex items-center justify-between gap-4 sticky top-0 z-30 select-none">
      {/* ── Top Market Indices Ticker ───────────────────────────────────── */}
      <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide py-1">
        {/* NIFTY 50 */}
        <div className="flex items-center gap-2 text-xs whitespace-nowrap">
          <span className="font-semibold text-[#A1A1AA] tracking-wide">NIFTY 50</span>
          <span className="font-mono text-[#F5F5F5] font-semibold">
            {niftyQuote ? fmt(niftyQuote.last_price) : '24,520.50'}
          </span>
          {niftyQuote && (
            <span className={`flex items-center text-[11px] font-mono font-medium ${niftyQuote.change >= 0 ? 'text-[#00C087]' : 'text-[#FF4D67]'}`}>
              {niftyQuote.change >= 0 ? '+' : ''}{fmt(niftyQuote.change)} ({niftyQuote.change_percent.toFixed(2)}%)
            </span>
          )}
        </div>

        {/* BANK NIFTY */}
        <div className="flex items-center gap-2 text-xs whitespace-nowrap border-l border-[#242424] pl-4">
          <span className="font-semibold text-[#A1A1AA] tracking-wide">BANK NIFTY</span>
          <span className="font-mono text-[#F5F5F5] font-semibold">
            {bankNiftyQuote ? fmt(bankNiftyQuote.last_price) : '52,140.25'}
          </span>
          {bankNiftyQuote && (
            <span className={`flex items-center text-[11px] font-mono font-medium ${bankNiftyQuote.change >= 0 ? 'text-[#00C087]' : 'text-[#FF4D67]'}`}>
              {bankNiftyQuote.change >= 0 ? '+' : ''}{fmt(bankNiftyQuote.change)} ({bankNiftyQuote.change_percent.toFixed(2)}%)
            </span>
          )}
        </div>

        {/* SENSEX */}
        <div className="hidden lg:flex items-center gap-2 text-xs whitespace-nowrap border-l border-[#242424] pl-4">
          <span className="font-semibold text-[#A1A1AA] tracking-wide">SENSEX</span>
          <span className="font-mono text-[#F5F5F5] font-semibold">
            {sensexQuote ? fmt(sensexQuote.last_price) : '80,500.10'}
          </span>
          {sensexQuote && (
            <span className={`flex items-center text-[11px] font-mono font-medium ${sensexQuote.change >= 0 ? 'text-[#00C087]' : 'text-[#FF4D67]'}`}>
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
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0D0D0D] hover:bg-[#131313] border border-[#242424] text-[#A1A1AA] hover:text-[#F5F5F5] text-xs transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-[#D4AF65]" />
          <span className="hidden sm:inline">Search instruments</span>
          <kbd className="hidden md:inline-block text-[10px] bg-[#131313] px-1.5 py-0.5 rounded text-[#71717A] font-mono border border-[#242424]">⌘K</kbd>
        </button>

        {/* Live Feed Mode Capsule */}
        <div className="flex items-center gap-2 px-2.5 py-1 bg-[#0D0D0D] border border-[#242424] rounded-lg text-xs font-mono">
          <span className={`w-2 h-2 rounded-full bg-[#00C087] animate-pulse`} />
          <span className="text-[11px] font-bold text-[#F5F5F5]">
            {providerMode === 'LIVE' ? (marketDataService.isConfigured() ? 'EXCHANGE LIVE' : 'LIVE FEED') : 'SIMULATION'}
          </span>
        </div>

        {/* Quick Buy/Sell Order Button */}
        <button
          onClick={() => openOrderTicket()}
          className="btn-cendrix-gold py-1.5 px-3.5 text-xs font-bold"
        >
          <PlusCircle className="w-3.5 h-3.5 mr-1 text-[#030303]" />
          <span>New Order</span>
        </button>
      </div>
    </header>
  );
};
