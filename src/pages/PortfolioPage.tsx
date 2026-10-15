import React, { useState } from 'react';
import { useTradingStore } from '../store/useTradingStore';
import { Receipt, Download, RotateCcw, Wallet, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

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
    <div className="space-y-6 pb-12 max-w-7xl mx-auto select-none">
      {/* ── Page Header & Balance Cards ─────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-[#0E1728]/95 border border-[#C6A15B]/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold font-serif text-white tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#C6A15B]" />
            <span>Portfolio Account Statement & Ledger</span>
          </h2>
          <p className="text-xs text-[#8F9BAE] mt-0.5">
            Auditable double-entry ledger tracking virtual capital grants, trade debits/credits, realized P&L, charges, and resets · CNRX
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenReset}
            className="px-3.5 py-1.5 rounded-xl bg-[#14223A] hover:bg-[#1C2E4C] border border-[#C6A15B]/30 hover:border-[#C6A15B] text-xs font-bold text-[#E2C889] hover:text-white flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#C6A15B]" />
            <span>Reset Account</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#C6A15B] to-[#E2C889] hover:from-[#B38F46] hover:to-[#D4B774] text-[#0B1424] text-xs font-bold flex items-center gap-2 shadow-md transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-[#0B1424]" />
            <span>Export Statement CSV</span>
          </button>
        </div>
      </div>

      {/* ── Account Balances Summary ────────────────────────────────────── */}
      {account && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#0B1424]/90 border border-[#C6A15B]/15 shadow-md">
            <span className="text-[10px] text-[#8F9BAE] uppercase font-bold tracking-wider">Initial Virtual Capital</span>
            <p className="text-xl font-mono font-bold text-white mt-1">₹10,00,000.00</p>
          </div>
          <div className="p-4 rounded-xl bg-[#0B1424]/90 border border-[#C6A15B]/15 shadow-md">
            <span className="text-[10px] text-[#8F9BAE] uppercase font-bold tracking-wider">Current Available Cash</span>
            <p className="text-xl font-mono font-bold text-white mt-1">
              ₹{account.cash_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#0B1424]/90 border border-[#C6A15B]/15 shadow-md">
            <span className="text-[10px] text-[#8F9BAE] uppercase font-bold tracking-wider">Total Portfolio Equity</span>
            <p className="text-xl font-mono font-bold text-[#10B981] mt-1">
              ₹{account.account_equity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}

      {/* ── Ledger Entries Table ────────────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-[#0E1728]/95 border border-[#C6A15B]/20 shadow-xl space-y-4 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-bold font-serif text-white tracking-wide">Financial Transaction Ledger</h3>

          {/* Filter */}
          <div className="flex items-center gap-1.5 bg-[#0B1424] p-1 rounded-xl border border-[#1F2D48] text-xs">
            {(['ALL', 'TRADE_DEBIT', 'TRADE_CREDIT', 'CHARGES', 'PNL_REALIZED', 'RESET'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all ${
                  filterType === t
                    ? 'bg-gradient-to-r from-[#C6A15B] to-[#E2C889] text-[#0B1424] font-bold shadow-sm'
                    : 'text-[#8F9BAE] hover:text-white'
                }`}
              >
                {t === 'ALL' ? 'All Entries' : t.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#8F9BAE]">
            No ledger entries found for this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1F2D48] text-[#8F9BAE] text-[10px] uppercase font-semibold">
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Reference</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3 text-right">Debit (₹)</th>
                  <th className="py-3 px-3 text-right">Credit (₹)</th>
                  <th className="py-3 px-3 text-right">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2D48]/60 font-mono">
                {filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-[#14223A]/40 transition-colors">
                    <td className="py-3 px-3 text-[#8F9BAE] whitespace-nowrap">
                      {new Date(l.created_at).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className="text-[10px] bg-[#14223A] border border-[#1F2D48] px-2 py-0.5 rounded font-bold text-[#E2C889]">
                        {l.entry_type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#8F9BAE]">{l.reference_id || '-'}</td>
                    <td className="py-3 px-3 text-white font-sans max-w-xs truncate">{l.description}</td>
                    <td className="py-3 px-3 text-right text-[#F43F5E] font-bold">
                      {l.debit > 0 ? `-₹${l.debit.toFixed(2)}` : '-'}
                    </td>
                    <td className="py-3 px-3 text-right text-[#10B981] font-bold">
                      {l.credit > 0 ? `+₹${l.credit.toFixed(2)}` : '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-white">
                      ₹{l.balance_after.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
