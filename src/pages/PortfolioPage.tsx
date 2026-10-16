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
    <div className="w-full max-w-[1720px] mx-auto select-none font-sans text-[#f0f3f8] pb-12 space-y-4">
      {/* ── 1. Top Zerodha Header Strip ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1e2638]">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-[#f0f3f8] flex items-center gap-2">
            <span>Funds & Statement</span>
          </h1>
          <p className="text-xs text-[#788296] mt-0.5">Double-entry ledger & virtual equity balance</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenReset}
            className="px-2.5 py-1 rounded border border-[#1e2638] hover:border-[#df514c] text-xs font-medium text-[#788296] hover:text-[#df514c] flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Account</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-2.5 py-1 text-xs text-[#788296] hover:text-[#f0f3f8] border border-[#1e2638] hover:border-[#387ed1] rounded transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* ── 2. Flat Two-Column Account Balances ──────────────────────────── */}
      {account && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-3 border-b border-[#1e2638]">
          {/* Left: Equity Telemetry */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-[#788296] uppercase tracking-wider">Equity Funds</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-baseline py-1 border-b border-[#1e2638]/50">
                <span className="text-[#788296]">Available margin</span>
                <span className="text-base font-bold font-mono text-[#00c087]">
                  ₹{(account.cash_balance - account.used_margin).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-baseline py-1 border-b border-[#1e2638]/50">
                <span className="text-[#788296]">Used margin</span>
                <span className="font-mono text-[#f0f3f8] font-medium">
                  ₹{account.used_margin.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-baseline py-1 border-b border-[#1e2638]/50">
                <span className="text-[#788296]">Available cash</span>
                <span className="font-mono text-[#c4cbd4]">
                  ₹{account.cash_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Portfolio Summary */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-[#788296] uppercase tracking-wider">Account Value</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-baseline py-1 border-b border-[#1e2638]/50">
                <span className="text-[#788296]">Total account equity</span>
                <span className="text-base font-bold font-mono text-[#f0f3f8]">
                  ₹{account.account_equity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-baseline py-1 border-b border-[#1e2638]/50">
                <span className="text-[#788296]">Initial virtual capital</span>
                <span className="font-mono text-[#788296]">₹10,00,000.00</span>
              </div>
              <div className="flex justify-between items-baseline py-1 border-b border-[#1e2638]/50">
                <span className="text-[#788296]">Simulated execution</span>
                <span className="text-[11px] font-mono text-[#387ed1]">Instant fill @ Live LTP</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. Ledger Filter Tabs ────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <h2 className="text-sm font-semibold text-[#f0f3f8]">Financial Ledger</h2>

        <div className="flex items-center gap-3 text-xs">
          {(['ALL', 'TRADE_DEBIT', 'TRADE_CREDIT', 'CHARGES', 'PNL_REALIZED', 'RESET'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`pb-0.5 border-b-2 transition-all ${
                filterType === t
                  ? 'border-[#387ed1] text-[#387ed1] font-semibold'
                  : 'border-transparent text-[#788296] hover:text-[#c4cbd4]'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. Edge-to-Edge Ledger Table (No Outer Box) ───────────────────── */}
      <div className="mt-2">
        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#151b28] border border-[#1e2638] flex items-center justify-center text-[#788296] mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-[#c4cbd4]">No ledger entries</p>
            <p className="text-xs text-[#58647a] mt-1">Trades and account events will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1e2638] text-[#788296] text-[11px] font-medium">
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-right">Debit (₹)</th>
                  <th className="py-2.5 px-3 text-right">Credit (₹)</th>
                  <th className="py-2.5 px-3 text-right">Balance (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2638]/60 font-mono">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#121724] transition-colors">
                    <td className="py-2.5 px-3 text-[#788296]">
                      {new Date(item.created_at).toLocaleString('en-IN', {
                        dateStyle: 'short',
                        timeStyle: 'medium',
                      })}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="text-[10px] bg-[#161d2c] border border-[#1e2638] text-[#788296] px-1.5 py-0.5 rounded font-mono">
                        {item.entry_type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#f0f3f8] font-sans font-medium">
                      {item.description}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#df514c] font-medium">
                      {item.debit > 0 ? `-₹${item.debit.toFixed(2)}` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#00c087] font-medium">
                      {item.credit > 0 ? `+₹${item.credit.toFixed(2)}` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#c4cbd4] font-semibold">
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
