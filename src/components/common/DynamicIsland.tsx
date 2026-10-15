import React, { useState } from 'react';
import { useTradingStore } from '../../store/useTradingStore';
import { 
  TrendingUp, 
  TrendingDown, 
  PlusCircle, 
  LineChart, 
  Layers, 
  ShieldCheck, 
  Zap, 
  ChevronDown, 
  ChevronUp,
  Activity,
  Wallet
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
        className={`pointer-events-auto transition-all duration-300 ease-out bg-[#0B1424]/95 backdrop-blur-2xl border border-[rgba(198,161,91,0.28)] rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.6),0_0_20px_rgba(198,161,91,0.12)] text-[#F5F5F2] overflow-hidden ${
          isExpanded ? 'rounded-2xl max-w-3xl w-full p-4 border-[rgba(198,161,91,0.45)]' : 'max-w-2xl px-4 py-2'
        }`}
      >
        {/* ── Compact Bar View ───────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 text-xs">
          {/* Left: Market Pulse */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]" />
            </span>
            <span className="font-semibold text-[#A1A8B3] tracking-wide">NSE LIVE</span>
            {niftyQuote && (
              <span className="font-mono font-semibold text-[#F5F5F2] flex items-center gap-1">
                <span>{niftyQuote.last_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                <span className={`text-[10px] ${niftyQuote.change >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                  {niftyQuote.change >= 0 ? '▲' : '▼'}{Math.abs(niftyQuote.change_percent).toFixed(2)}%
                </span>
              </span>
            )}
          </div>

          {/* Center: Live Equity & Intraday MTM */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#A1A8B3] font-medium hidden sm:inline">Virtual Equity:</span>
            <span className="font-mono font-bold text-[#F5F5F2] text-xs sm:text-sm">
              {fmtInt(metrics.account_equity)}
            </span>
            {metrics.unrealized_pnl !== 0 && (
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                  metrics.unrealized_pnl >= 0 ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30' : 'bg-[#F43F5E]/15 text-[#F43F5E] border border-[#F43F5E]/30'
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
              className="p-1 rounded-full hover:bg-white/10 text-[#A1A8B3] hover:text-[#C6A15B] transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand Dynamic Island telemetry'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ── Expanded Telemetry Drawer ──────────────────────────────── */}
        {isExpanded && (
          <div className="mt-4 pt-3 border-t border-[rgba(198,161,91,0.18)] space-y-3 animate-in fade-in duration-200">
            {/* Metric Strips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#0E1728] border border-[rgba(198,161,91,0.18)]">
                <span className="text-[10px] text-[#A1A8B3] uppercase font-semibold tracking-wider">Available Cash</span>
                <p className="font-mono font-bold text-[#F5F5F2] mt-0.5">{fmt(metrics.current_cash)}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#0E1728] border border-[rgba(198,161,91,0.18)]">
                <span className="text-[10px] text-[#A1A8B3] uppercase font-semibold tracking-wider">Blocked Margin</span>
                <p className="font-mono font-bold text-[#C6A15B] mt-0.5">{fmt(metrics.used_margin)}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#0E1728] border border-[rgba(198,161,91,0.18)]">
                <span className="text-[10px] text-[#A1A8B3] uppercase font-semibold tracking-wider">Open Positions</span>
                <p className="font-mono font-bold text-[#F5F5F2] mt-0.5">
                  {openPositions.length} Active {openPositions.length === 1 ? 'Contract' : 'Contracts'}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#0E1728] border border-[rgba(198,161,91,0.18)]">
                <span className="text-[10px] text-[#A1A8B3] uppercase font-semibold tracking-wider">Charges Deducted</span>
                <p className="font-mono font-bold text-[#A1A8B3] mt-0.5">₹{metrics.total_brokerage_paid.toFixed(2)}</p>
              </div>
            </div>

            {/* Margin Utilization Progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-[#A1A8B3]">
                <span>Margin Headroom Utilization</span>
                <span className="font-mono text-[#F5F5F2] font-semibold">{marginUtilPercent}% used</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    marginUtilPercent > 80 ? 'bg-[#F43F5E]' : marginUtilPercent > 50 ? 'bg-[#F59E0B]' : 'bg-[#10B981]'
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
                  className="px-3 py-1.5 rounded-lg bg-[#0E1728] hover:bg-[#14223A] border border-[rgba(198,161,91,0.22)] text-[#F5F5F2] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <LineChart className="w-3.5 h-3.5 text-[#C6A15B]" />
                  <span>Terminal Chart</span>
                </button>
                <button
                  onClick={() => navigate('/dashboard/option-chain')}
                  className="px-3 py-1.5 rounded-lg bg-[#0E1728] hover:bg-[#14223A] border border-[rgba(198,161,91,0.22)] text-[#F5F5F2] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Layers className="w-3.5 h-3.5 text-[#E2C889]" />
                  <span>Option Chain</span>
                </button>
              </div>

              <span className="text-[10px] text-[#A1A8B3] font-mono">
                Account ID: {account?.account_number || 'IN-PT-LIVE001'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
