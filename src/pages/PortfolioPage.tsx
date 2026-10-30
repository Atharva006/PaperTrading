import React, { useState } from 'react';
import { useTradingStore } from '../store/useTradingStore';
import { Download, RotateCcw, Layers } from 'lucide-react';

interface PortfolioPageProps {
  onOpenReset?: () => void;
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
    <div className="w-full max-w-full mx-auto select-none font-sans text-[#111114] pb-12 space-y-6">
      {/* ── 1. Top Header Strip ─────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#D9E2F2]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-wider text-[#536CF0] uppercase font-bold">
              Treasury & Settlement
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#00225A] flex items-center gap-2.5">
            <span>Capital Funds & Statement</span>
          </h1>
          <p className="text-xs text-[#6B7A90] mt-1 font-mono">Institutional double-entry ledger & portfolio telemetry</p>
        </div>

        <div className="flex items-center gap-3">
          {onOpenReset && (
            <button
              onClick={onOpenReset}
              className="btn-secondary px-3.5 py-1.5 text-xs rounded-xl flex items-center gap-1.5 transition-all active:scale-[0.96] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#00225A]" />
              <span>Reset Account</span>
            </button>
          )}
          <button
            onClick={handleExportCSV}
            className="btn-secondary px-3.5 py-1.5 text-xs rounded-xl transition-all active:scale-[0.96] flex items-center gap-1.5 font-semibold text-[#00225A] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#00225A]" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* ── 2. Account Balances Cards ───────────────────────────────────── */}
      {account && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left: Equity Telemetry */}
          <div className="bg-white p-6 rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-bold text-[#00225A]">Margin & Liquidity</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#12B76A]/10 text-[#12B76A] border border-[#12B76A]/30 font-bold uppercase">
                Active Tier
              </span>
            </div>
            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between items-baseline py-2 border-b border-[#D9E2F2]/60">
                <span className="text-[#6B7A90] font-sans">Available margin</span>
                <span className="text-xl font-bold text-[#12B76A] tabular-nums">
                  ₹{(account.cash_balance - account.used_margin).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-baseline py-2 border-b border-[#D9E2F2]/60">
                <span className="text-[#6B7A90] font-sans">Used margin</span>
                <span className="text-[#00225A] font-bold tabular-nums">
                  ₹{account.used_margin.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-baseline py-2">
                <span className="text-[#6B7A90] font-sans">Available cash balance</span>
                <span className="text-[#111114] font-bold tabular-nums">
                  ₹{account.cash_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Portfolio Summary */}
          <div className="bg-white p-6 rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-bold text-[#00225A]">Portfolio Valuation</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EEF3FF] text-[#00225A] border border-[#D9E2F2] font-bold uppercase">
                Audited
              </span>
            </div>
            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between items-baseline py-2 border-b border-[#D9E2F2]/60">
                <span className="text-[#6B7A90] font-sans">Account equity</span>
                <span className="text-xl font-bold text-[#00225A] tabular-nums">
                  ₹{account.account_equity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-baseline py-2 border-b border-[#D9E2F2]/60">
                <span className="text-[#6B7A90] font-sans">Initial starting capital</span>
                <span className="text-[#6B7A90] tabular-nums font-semibold">₹10,00,000.00</span>
              </div>
              <div className="flex justify-between items-baseline py-2">
                <span className="text-[#6B7A90] font-sans">Execution model</span>
                <span className="text-[11px] font-mono text-[#536CF0] font-bold">Cendrix Live Fill Engine</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. Ledger Filter Tabs ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <h2 className="font-display text-base font-bold text-[#00225A]">Ledger Transactions</h2>

        <div className="bg-[#F7F8FA] border border-[#D9E2F2] p-1 rounded-xl inline-flex gap-1 overflow-x-auto">
          {(['ALL', 'TRADE_DEBIT', 'TRADE_CREDIT', 'CHARGES', 'PNL_REALIZED', 'RESET'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterType === t
                  ? 'bg-white text-[#00225A] font-bold shadow-sm border border-[#D9E2F2]'
                  : 'text-[#6B7A90] hover:text-[#00225A]'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. Ledger Table ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#EEF3FF] border border-[#D9E2F2] flex items-center justify-center text-[#536CF0] mb-3 shadow-sm">
              <Layers className="w-6 h-6" />
            </div>
            <p className="font-display text-base font-bold text-[#00225A]">No ledger transactions recorded</p>
            <p className="text-xs text-[#6B7A90] mt-1.5 font-mono max-w-md mx-auto">Executed orders and margin settlements will be audited here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F7F8FA] border-b border-[#D9E2F2] text-[#6B7A90] text-[10px] uppercase font-mono tracking-wider">
                  <th className="py-3 px-4 font-semibold">Date & Time</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Description</th>
                  <th className="py-3 px-4 font-semibold text-right">Debit (₹)</th>
                  <th className="py-3 px-4 font-semibold text-right">Credit (₹)</th>
                  <th className="py-3 px-4 font-semibold text-right">Balance (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E2F2] font-mono">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F7F8FA] transition-colors">
                    <td className="py-3 px-4 text-[#6B7A90] tabular-nums">
                      {new Date(item.created_at).toLocaleString('en-IN', {
                        dateStyle: 'short',
                        timeStyle: 'medium',
                      })}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className="text-[10px] bg-[#EEF3FF] border border-[#D9E2F2] text-[#00225A] px-2 py-0.5 rounded-full font-mono font-bold">
                        {item.entry_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#111114] font-sans font-medium">
                      {item.description}
                    </td>
                    <td className="py-3 px-4 text-right text-[#D92D20] font-semibold tabular-nums">
                      {item.debit > 0 ? `-₹${item.debit.toFixed(2)}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right text-[#12B76A] font-semibold tabular-nums">
                      {item.credit > 0 ? `+₹${item.credit.toFixed(2)}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right text-[#00225A] font-bold tabular-nums">
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
