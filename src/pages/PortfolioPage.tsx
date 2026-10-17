import React, { useState } from 'react';
import { useTradingStore } from '../store/useTradingStore';
import { Download, RotateCcw, Layers } from 'lucide-react';

interface PortfolioPageProps {
  onOpenReset: () => void;
}

export default function PortfolioPage({ onOpenReset }: PortfolioPageProps) {
  const { ledger, account } = useTradingStore();
  const [filterType, setFilterType] = useState<string>('ALL');

  const filtered = ledger.filter((l) =>
    filterType === 'ALL' ? true : l.entry_type === filterType
  );

  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    const headers = ['Date', 'Entry Type', 'Reference ID', 'Description', 'Debit (₹)', 'Credit (₹)', 'Balance After (₹)'];
    const rows = filtered.map(l => [
      l.created_at,
      l.entry_type,
      l.reference_id || '',
      `"${l.description.replace(/"/g, '""')}"`,
      l.debit,
      l.credit,
      l.balance_after,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `cnrx_account_statement_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-full mx-auto select-none font-sans text-[#F5F5F2] pb-12 space-y-6">
      {/* ── 1. Top Cendrix Capital Header Strip ─────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-wider text-[#C6A15B] uppercase font-semibold">
              Treasury & Settlement
            </span>
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-[#F5F5F2] flex items-center gap-2.5">
            <span>Capital Funds & Statement</span>
          </h1>
          <p className="text-xs text-[#A1A8B3] mt-1 font-mono">Institutional double-entry ledger & portfolio telemetry</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenReset}
            className="px-3.5 py-1.5 rounded-xl border border-white/[0.08] hover:border-[#C6A15B]/50 text-xs font-semibold text-[#C6A15B] hover:text-[#F5F5F2] bg-white/[0.02] hover:bg-[#C6A15B]/10 flex items-center gap-1.5 transition-all active:scale-[0.96]"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#C6A15B]" />
            <span>Reset Account</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="apple-segmented-item px-3.5 py-1.5 text-xs rounded-xl transition-all active:scale-[0.96] flex items-center gap-1.5 font-semibold text-[#F5F5F2] hover:text-[#C6A15B] border border-white/[0.08]"
          >
            <Download className="w-3.5 h-3.5 text-[#C6A15B]" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* ── 2. Account Balances Cards ──────────────────────────── */}
      {account && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left: Equity Telemetry */}
          <div className="apple-glass-panel p-6 rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-sm font-bold text-[#F5F5F2] tracking-tight">Margin & Liquidity</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold uppercase">
                Active Tier
              </span>
            </div>
            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between items-baseline py-2 border-b border-white/[0.06]">
                <span className="text-[#A1A8B3] font-sans">Available margin</span>
                <span className="text-xl font-bold text-emerald-400 tabular-nums">
                  ₹{(account.cash_balance - account.used_margin).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-baseline py-2 border-b border-white/[0.06]">
                <span className="text-[#A1A8B3] font-sans">Used margin</span>
                <span className="text-[#C6A15B] font-bold tabular-nums">
                  ₹{account.used_margin.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-baseline py-2">
                <span className="text-[#A1A8B3] font-sans">Available cash balance</span>
                <span className="text-[#F5F5F2] font-semibold tabular-nums">
                  ₹{account.cash_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Portfolio Summary */}
          <div className="apple-glass-panel p-6 rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-sm font-bold text-[#F5F5F2] tracking-tight">Portfolio Valuation</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.03] text-[#C6A15B] border border-white/[0.08] font-semibold uppercase">
                Audited
              </span>
            </div>
            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between items-baseline py-2 border-b border-white/[0.06]">
                <span className="text-[#A1A8B3] font-sans">Account equity</span>
                <span className="text-xl font-bold text-[#F5F5F2] tabular-nums">
                  ₹{account.account_equity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-baseline py-2 border-b border-white/[0.06]">
                <span className="text-[#A1A8B3] font-sans">Initial starting capital</span>
                <span className="text-[#A1A8B3] tabular-nums">₹10,00,000.00</span>
              </div>
              <div className="flex justify-between items-baseline py-2">
                <span className="text-[#A1A8B3] font-sans">Execution model</span>
                <span className="text-[11px] font-mono text-[#C6A15B] font-semibold">Cendrix Live Fill Engine</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. Ledger Filter Tabs (Apple Segmented Control) ────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <h2 className="font-serif text-base font-bold text-[#F5F5F2] tracking-tight">Ledger Transactions</h2>

        <div className="apple-segmented-group p-1 rounded-xl inline-flex gap-1 overflow-x-auto">
          {(['ALL', 'TRADE_DEBIT', 'TRADE_CREDIT', 'CHARGES', 'PNL_REALIZED', 'RESET'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`apple-segmented-item text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                filterType === t
                  ? 'apple-segmented-item-active text-[#C6A15B] font-semibold shadow-sm'
                  : 'text-[#A1A8B3] hover:text-[#F5F5F2]'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. Ledger Table in Apple Glass Panel ───────────────────── */}
      <div className="apple-glass-panel rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#C6A15B] mb-3 shadow-inner">
              <Layers className="w-6 h-6" />
            </div>
            <p className="font-serif text-base font-bold text-[#F5F5F2] tracking-tight">No ledger transactions recorded</p>
            <p className="text-xs text-[#A1A8B3] mt-1.5 font-mono max-w-md mx-auto">Executed orders and margin settlements will be audited here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/[0.06] text-[#A1A8B3] text-[10px] uppercase font-mono tracking-wider">
                  <th className="py-3 px-4 font-semibold">Date & Time</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Description</th>
                  <th className="py-3 px-4 font-semibold text-right">Debit (₹)</th>
                  <th className="py-3 px-4 font-semibold text-right">Credit (₹)</th>
                  <th className="py-3 px-4 font-semibold text-right">Balance (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] font-mono">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 px-4 text-[#A1A8B3] tabular-nums">
                      {new Date(item.created_at).toLocaleString('en-IN', {
                        dateStyle: 'short',
                        timeStyle: 'medium',
                      })}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className="text-[10px] bg-white/[0.04] border border-white/[0.08] text-[#C6A15B] px-2 py-0.5 rounded-md font-mono font-semibold">
                        {item.entry_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#F5F5F2] font-sans font-medium">
                      {item.description}
                    </td>
                    <td className="py-3 px-4 text-right text-rose-400 font-medium tabular-nums">
                      {item.debit > 0 ? `-₹${item.debit.toFixed(2)}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-400 font-medium tabular-nums">
                      {item.credit > 0 ? `+₹${item.credit.toFixed(2)}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right text-[#F5F5F2] font-semibold tabular-nums">
                      ₹{item.balance_after.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
