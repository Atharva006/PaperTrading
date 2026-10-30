import React, { useState } from 'react';
import { useTradingStore } from '../../store/useTradingStore';
import { 
  TrendingUp, 
  TrendingDown, 
  PlusCircle, 
  LineChart, 
  Flame, 
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
        className={`pointer-events-auto transition-all duration-200 ease-out bg-white/95 backdrop-blur-2xl border border-[#D9E2F2] rounded-full shadow-[0_8px_30px_rgba(0,34,90,0.08)] text-[#111114] overflow-hidden ${
          isExpanded ? 'rounded-2xl max-w-3xl w-full p-4 border-[#D9E2F2]' : 'max-w-2xl px-4 py-2'
        }`}
      >
        {/* ── Compact Bar View ───────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 text-xs">
          {/* Left: Market Pulse */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#12B76A] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#12B76A]" />
            </span>
            <span className="font-semibold text-[#6B7A90] tracking-wide text-[11px] font-mono">NSE LIVE</span>
            {niftyQuote && (
              <span className="font-mono font-bold text-[#00225A] flex items-center gap-1">
                <span>{niftyQuote.last_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                <span className={`text-[10px] font-bold ${niftyQuote.change >= 0 ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
                  {niftyQuote.change >= 0 ? '▲' : '▼'}{Math.abs(niftyQuote.change_percent).toFixed(2)}%
                </span>
              </span>
            )}
          </div>

          {/* Center: Live Equity & Intraday MTM */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#6B7A90] font-semibold hidden sm:inline">Virtual Equity:</span>
            <span className="font-mono font-bold text-[#00225A] text-xs sm:text-sm">
              {fmtInt(metrics.account_equity)}
            </span>
            {metrics.unrealized_pnl !== 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                  metrics.unrealized_pnl >= 0 ? 'bg-[#12B76A]/10 text-[#12B76A] border border-[#12B76A]/25' : 'bg-[#D92D20]/10 text-[#D92D20] border border-[#D92D20]/25'
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
              className="bg-[#00225A] hover:bg-[#536CF0] text-white py-1 px-3 text-[11px] rounded-full font-semibold shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3 h-3" />
              <span className="hidden xs:inline">Order</span>
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-full hover:bg-[#F7F8FA] text-[#6B7A90] hover:text-[#00225A] transition-colors cursor-pointer"
              title={isExpanded ? 'Collapse' : 'Expand Dynamic Island telemetry'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ── Expanded Telemetry Drawer ──────────────────────────────── */}
        {isExpanded && (
          <div className="mt-4 pt-3 border-t border-[#D9E2F2] space-y-3 animate-in fade-in duration-150">
            {/* Metric Strips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#F7F8FA] border border-[#D9E2F2] shadow-xs">
                <span className="text-[10px] text-[#6B7A90] uppercase font-semibold tracking-wider font-mono">Available Cash</span>
                <p className="font-mono font-bold text-[#00225A] mt-0.5">{fmt(metrics.current_cash)}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F7F8FA] border border-[#D9E2F2] shadow-xs">
                <span className="text-[10px] text-[#6B7A90] uppercase font-semibold tracking-wider font-mono">Blocked Margin</span>
                <p className="font-mono font-bold text-[#536CF0] mt-0.5">{fmt(metrics.used_margin)}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F7F8FA] border border-[#D9E2F2] shadow-xs">
                <span className="text-[10px] text-[#6B7A90] uppercase font-semibold tracking-wider font-mono">Open Positions</span>
                <p className="font-mono font-bold text-[#00225A] mt-0.5">
                  {openPositions.length} Active {openPositions.length === 1 ? 'Contract' : 'Contracts'}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F7F8FA] border border-[#D9E2F2] shadow-xs">
                <span className="text-[10px] text-[#6B7A90] uppercase font-semibold tracking-wider font-mono">Charges Deducted</span>
                <p className="font-mono font-bold text-[#6B7A90] mt-0.5">₹{metrics.total_brokerage_paid.toFixed(2)}</p>
              </div>
            </div>

            {/* Margin Utilization Progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-[#6B7A90]">
                <span>Margin Headroom Utilization</span>
                <span className="font-mono text-[#00225A] font-bold">{marginUtilPercent}% used</span>
              </div>
              <div className="h-2 w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    marginUtilPercent > 80 ? 'bg-[#D92D20]' : marginUtilPercent > 50 ? 'bg-[#536CF0]' : 'bg-[#12B76A]'
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
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F7F8FA] border border-[#D9E2F2] text-[#00225A] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <LineChart className="w-3.5 h-3.5 text-[#536CF0]" />
                  <span>Terminal Chart</span>
                </button>
                <button
                  onClick={() => navigate('/dashboard/commodities')}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F7F8FA] border border-[#D9E2F2] text-[#00225A] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5 text-[#536CF0]" />
                  <span>Commodities</span>
                </button>
              </div>

              <span className="text-[10px] text-[#6B7A90] font-mono">
                Account ID: {account?.account_number || 'IN-PT-LIVE001'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};