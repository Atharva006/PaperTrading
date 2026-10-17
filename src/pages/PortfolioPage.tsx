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
    <div className="w-full max-w-full mx-auto select-none font-sans text-[#F5F5F2] pb-12 space-y-5">
      {/* ── 1. Top Cendrix Capital Header Strip ─────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#14223A]">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-wide text-[#F5F5F2] flex items-center gap-2.5">
            <span>Capital Funds & Statement</span>
          </h1>
          <p className="text-xs text-[#A1A8B3] mt-1 font-mono">Institutional double-entry ledger & portfolio telemetry</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenReset}
            className="px-3.5 py-1.5 rounded-lg border border-[rgba(198,161,91,0.25)] hover:border-[#C6A15B] text-xs font-semibold text-[#C6A15B] hover:text-[#F5F5F2] hover:bg-[#14223A] flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#C6A15B]" />
            <span>Reset Account</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="btn-cendrix-outline px-3.5 py-1.5 text-xs rounded-lg transition-all flex items-center gap-1.5 font-semibold"
          >
            <Download className="w-3.5 h-3.5 text-[#C6A15B]" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* ── 2. Account Balances Cards ──────────────────────────── */}
      {account && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Equity Telemetry */}
          <div className="cendrix-card p-5 rounded-xl border border-[rgba(198,161,91,0.2)] space-y-3">
            <h3 className="font-serif text-sm font-bold text-[#F5F5F2] tracking-wide">Margin & Liquidity</h3>
            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between items-baseline py-1.5 border-b border-[#14223A]">
                <span className="text-[#A1A8B3]">Available margin</span>
                <span className="text-lg font-bold text-[#10B981]">
                  ₹{(account.cash_balance - account.used_margin).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-baseline py-1.5 border-b border-[#14223A]">
                <span className="text-[#A1A8B3]">Used margin</span>
                <span className="text-[#C6A15B] font-bold">
                  ₹{account.used_margin.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-baseline py-1.5 border-b border-[#14223A]">
                <span className="text-[#A1A8B3]">Available cash balance</span>
                <span className="text-[#F5F5F2] font-semibold">
                  ₹{account.cash_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Portfolio Summary */}
          <div className="cendrix-card p-5 rounded-xl border border-[rgba(198,161,91,0.2)] space-y-3">
            <h3 className="font-serif text-sm font-bold text-[#F5F5F2] tracking-wide">Portfolio Valuation</h3>
            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between items-baseline py-1.5 border-b border-[#14223A]">
                <span className="text-[#A1A8B3]">Account equity</span>
                <span className="text-lg font-bold text-[#F5F5F2]">
                  ₹{account.account_equity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-baseline py-1.5 border-b border-[#14223A]">
                <span className="text-[#A1A8B3]">Initial starting capital</span>
                <span className="text-[#A1A8B3]">₹10,00,000.00</span>
              </div>
              <div className="flex justify-between items-baseline py-1.5 border-b border-[#14223A]">
                <span className="text-[#A1A8B3]">Execution model</span>
                <span className="text-[11px] font-mono text-[#C6A15B] font-semibold">Cendrix Live Fill Engine</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. Ledger Filter Tabs ────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 pt-3">
        <h2 className="font-serif text-base font-bold text-[#F5F5F2]">Ledger Transactions</h2>

        <div className="flex items-center gap-4 text-xs font-medium">
          {(['ALL', 'TRADE_DEBIT', 'TRADE_CREDIT', 'CHARGES', 'PNL_REALIZED', 'RESET'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`pb-1.5 border-b-2 transition-all ${
                filterType === t
                  ? 'border-[#C6A15B] text-[#C6A15B] font-bold shadow-[0_1px_8px_rgba(198,161,91,0.25)]'
                  : 'border-transparent text-[#A1A8B3] hover:text-[#F5F5F2]'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. Ledger Table ───────────────────── */}
      <div className="cendrix-card p-5 rounded-xl border border-[rgba(198,161,91,0.2)]">
        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-[#0F192B] border border-[rgba(198,161,91,0.25)] flex items-center justify-center text-[#C6A15B] mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <p className="font-serif text-base font-bold text-[#F5F5F2]">No ledger transactions recorded</p>
            <p className="text-xs text-[#A1A8B3] mt-1.5">Executed orders and margin settlements will be audited here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#14223A] text-[#6E7683] text-[10px] uppercase font-mono tracking-wider">
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-right">Debit (₹)</th>
                  <th className="py-2.5 px-3 text-right">Credit (₹)</th>
                  <th className="py-2.5 px-3 text-right">Balance (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#14223A]/50 font-mono">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#14223A]/40 transition-colors">
                    <td className="py-2.5 px-3 text-[#A1A8B3]">
                      {new Date(item.created_at).toLocaleString('en-IN', {
                        dateStyle: 'short',
                        timeStyle: 'medium',
                      })}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="text-[10px] bg-[#0F192B] border border-[rgba(198,161,91,0.25)] text-[#C6A15B] px-1.5 py-0.5 rounded font-mono font-bold">
                        {item.entry_type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#F5F5F2] font-sans font-medium">
                      {item.description}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#EF4444] font-medium">
                      {item.debit > 0 ? `-₹${item.debit.toFixed(2)}` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#10B981] font-medium">
                      {item.credit > 0 ? `+₹${item.credit.toFixed(2)}` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#F5F5F2] font-semibold">
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
