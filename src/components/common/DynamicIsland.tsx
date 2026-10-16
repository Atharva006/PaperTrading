import React, { useState } from 'react';
import { useTradingStore } from '../../store/useTradingStore';
import { 
  TrendingUp, 
  TrendingDown, 
  PlusCircle, 
  LineChart, 
  Layers, 
  ChevronDown, 
  ChevronUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DynamicIsland: React.FC = () => {
  const { account, positions, quotes, getMetrics, openOrderTicket } = useTradingStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const metrics = getMetrics();
  const niftyQuote = quotes['NSE_INDEX|Nifty 50'] || quotes['NIFTY 50'];
  const openPositions = positions.filter((p) => !p.is_closed && p.quantity !== 0);

  const fmt = (n: number) =>
    `₹${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const fmtInt = (n: number) =>
    `₹${Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  const marginUtilPercent =
    account && account.cash_balance > 0
      ? Math.min(100, Math.round((account.used_margin / (account.cash_balance + account.used_margin)) * 100))
      : 0;

  return (
    <div className="w-full flex justify-center sticky top-2 z-40 px-2 sm:px-4 pointer-events-none select-none">
      <div
        className={`pointer-events-auto transition-all duration-200 ease-out bg-[#080808]/95 backdrop-blur-2xl border border-[#242424] rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.85)] text-[#F5F5F5] overflow-hidden ${
          isExpanded ? 'rounded-2xl max-w-3xl w-full p-4 border-[#333333]' : 'max-w-2xl px-4 py-2'
        }`}
      >
        {/* ── Compact Bar View ───────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 text-xs">
          {/* Left: Market Pulse */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C087] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C087]" />
            </span>
            <span className="font-semibold text-[#A1A1AA] tracking-wide">NSE LIVE</span>
            {niftyQuote && (
              <span className="font-mono font-semibold text-[#F5F5F5] flex items-center gap-1">
                <span>{niftyQuote.last_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                <span className={`text-[10px] ${niftyQuote.change >= 0 ? 'text-[#00C087]' : 'text-[#FF4D67]'}`}>
                  {niftyQuote.change >= 0 ? '▲' : '▼'}{Math.abs(niftyQuote.change_percent).toFixed(2)}%
                </span>
              </span>
            )}
          </div>

          {/* Center: Live Equity & Intraday MTM */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#71717A] font-medium hidden sm:inline">Virtual Equity:</span>
            <span className="font-mono font-bold text-[#F5F5F5] text-xs sm:text-sm">
              {fmtInt(metrics.account_equity)}
            </span>
            {metrics.unrealized_pnl !== 0 && (
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                  metrics.unrealized_pnl >= 0 ? 'bg-[#00C087]/15 text-[#00C087] border border-[#00C087]/30' : 'bg-[#FF4D67]/15 text-[#FF4D67] border border-[#FF4D67]/30'
                }`}
              >
                {metrics.unrealized_pnl >= 0 ? '+' : ''}{fmt(metrics.unrealized_pnl)}
              </span>
            )}
          </div>

          {/* Right: Quick Action & Expand Chevron */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => openOrderTicket()}
              className="btn-cendrix-gold py-1 px-3 text-[11px] rounded-full"
            >
              <PlusCircle className="w-3 h-3" />
              <span className="hidden xs:inline">Order</span>
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-full hover:bg-white/10 text-[#A1A1AA] hover:text-[#D4AF65] transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand Dynamic Island telemetry'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ── Expanded Telemetry Drawer ──────────────────────────────── */}
        {isExpanded && (
          <div className="mt-4 pt-3 border-t border-[#191919] space-y-3 animate-in fade-in duration-150">
            {/* Metric Strips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#0D0D0D] border border-[#242424]">
                <span className="text-[10px] text-[#71717A] uppercase font-semibold tracking-wider font-mono">Available Cash</span>
                <p className="font-mono font-bold text-[#F5F5F5] mt-0.5">{fmt(metrics.current_cash)}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#0D0D0D] border border-[#242424]">
                <span className="text-[10px] text-[#71717A] uppercase font-semibold tracking-wider font-mono">Blocked Margin</span>
                <p className="font-mono font-bold text-[#D4AF65] mt-0.5">{fmt(metrics.used_margin)}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#0D0D0D] border border-[#242424]">
                <span className="text-[10px] text-[#71717A] uppercase font-semibold tracking-wider font-mono">Open Positions</span>
                <p className="font-mono font-bold text-[#F5F5F5] mt-0.5">
                  {openPositions.length} Active {openPositions.length === 1 ? 'Contract' : 'Contracts'}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#0D0D0D] border border-[#242424]">
                <span className="text-[10px] text-[#71717A] uppercase font-semibold tracking-wider font-mono">Charges Deducted</span>
                <p className="font-mono font-bold text-[#A1A1AA] mt-0.5">₹{metrics.total_brokerage_paid.toFixed(2)}</p>
              </div>
            </div>

            {/* Margin Utilization Progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-[#A1A1AA]">
                <span>Margin Headroom Utilization</span>
                <span className="font-mono text-[#F5F5F5] font-semibold">{marginUtilPercent}% used</span>
              </div>
              <div className="h-1.5 w-full bg-[#1A1A1A] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    marginUtilPercent > 80 ? 'bg-[#FF4D67]' : marginUtilPercent > 50 ? 'bg-[#D4AF65]' : 'bg-[#00C087]'
                  }`}
                  style={{ width: `${marginUtilPercent}%` }}
                />
              </div>
            </div>

            {/* Fast Navigation Buttons */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/dashboard/terminal')}
                  className="px-3 py-1.5 rounded-lg bg-[#0D0D0D] hover:bg-[#141414] border border-[#242424] text-[#F5F5F5] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <LineChart className="w-3.5 h-3.5 text-[#D4AF65]" />
                  <span>Terminal Chart</span>
                </button>
                <button
                  onClick={() => navigate('/dashboard/option-chain')}
                  className="px-3 py-1.5 rounded-lg bg-[#0D0D0D] hover:bg-[#141414] border border-[#242424] text-[#F5F5F5] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Layers className="w-3.5 h-3.5 text-[#F0D79A]" />
                  <span>Option Chain</span>
                </button>
              </div>

              <span className="text-[10px] text-[#71717A] font-mono">
                Account ID: {account?.account_number || 'IN-PT-LIVE001'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
