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
    <header className="h-14 bg-[#0B1424] border-b border-[rgba(198,161,91,0.18)] px-4 flex items-center justify-between gap-4 sticky top-0 z-30 select-none shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
      {/* ── Top Market Indices Ticker ───────────────────────────────────── */}
      <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide py-1">
        {/* NIFTY 50 */}
        <div className="flex items-center gap-2 text-xs whitespace-nowrap">
          <span className="font-semibold text-[#A1A8B3] tracking-wide">NIFTY 50</span>
          <span className="font-mono text-[#F5F5F2] font-semibold">
            {niftyQuote ? fmt(niftyQuote.last_price) : '24,520.50'}
          </span>
          {niftyQuote && (
            <span className={`flex items-center text-[11px] font-mono font-medium ${niftyQuote.change >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
              {niftyQuote.change >= 0 ? '+' : ''}{fmt(niftyQuote.change)} ({niftyQuote.change_percent.toFixed(2)}%)
            </span>
          )}
        </div>

        {/* BANK NIFTY */}
        <div className="flex items-center gap-2 text-xs whitespace-nowrap border-l border-white/[0.08] pl-4">
          <span className="font-semibold text-[#A1A8B3] tracking-wide">BANK NIFTY</span>
          <span className="font-mono text-[#F5F5F2] font-semibold">
            {bankNiftyQuote ? fmt(bankNiftyQuote.last_price) : '52,140.25'}
          </span>
          {bankNiftyQuote && (
            <span className={`flex items-center text-[11px] font-mono font-medium ${bankNiftyQuote.change >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
              {bankNiftyQuote.change >= 0 ? '+' : ''}{fmt(bankNiftyQuote.change)} ({bankNiftyQuote.change_percent.toFixed(2)}%)
            </span>
          )}
        </div>

        {/* SENSEX */}
        <div className="flex items-center gap-2 text-xs whitespace-nowrap border-l border-white/[0.08] pl-4 hidden lg:flex">
          <span className="font-semibold text-[#A1A8B3] tracking-wide">SENSEX</span>
          <span className="font-mono text-[#F5F5F2] font-semibold">
            {sensexQuote ? fmt(sensexQuote.last_price) : '80,450.80'}
          </span>
          {sensexQuote && (
            <span className={`flex items-center text-[11px] font-mono font-medium ${sensexQuote.change >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
              {sensexQuote.change >= 0 ? '+' : ''}{fmt(sensexQuote.change)} ({sensexQuote.change_percent.toFixed(2)}%)
            </span>
          )}
        </div>
      </div>

      {/* ── Actions, Mode Badge & Quick Balance ──────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Search Bar / Cmd+K */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0E1728] hover:bg-[#14223A] border border-[rgba(198,161,91,0.22)] text-[#A1A8B3] hover:text-[#F5F5F2] text-xs transition-colors"
          title="Search all Indian stocks and derivatives (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5 text-[#C6A15B]" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="hidden md:inline-block text-[10px] bg-[#14223A] px-1.5 py-0.5 rounded text-[#A1A8B3] font-mono border border-white/5">⌘K</kbd>
        </button>

        {/* Market Mode Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-[#10B981]/30 bg-[#10B981]/10 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-[#10B981] font-mono text-[10px] tracking-wider">UPSTOX LIVE FEED</span>
        </div>

        {/* Paper Account Equity Pill */}
        {account && (
          <div className="hidden sm:flex items-center gap-2 bg-[#0E1728] border border-[rgba(198,161,91,0.2)] rounded-lg px-3 py-1">
            <span className="text-[11px] text-[#A1A8B3] font-medium">Virtual Equity:</span>
            <span className="text-xs font-mono font-bold text-[#F5F5F2]">
              ₹{account.account_equity.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
        )}

        {/* Place Order Button */}
        <button
          onClick={() => openOrderTicket()}
          className="btn-cendrix-gold text-xs py-1.5 px-3.5"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Trade</span>
        </button>
      </div>
    </header>
  );
};
