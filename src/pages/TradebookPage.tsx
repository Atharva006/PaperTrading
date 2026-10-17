import React, { useState } from 'react';
import { useTradingStore } from '../store/useTradingStore';
import { Download, Search, Layers } from 'lucide-react';

export default function TradebookPage() {
  const { trades } = useTradingStore();
  const [search, setSearch] = useState('');

  const filtered = trades.filter((t) =>
    !search ||
    t.trade_id.toUpperCase().includes(search.toUpperCase()) ||
    t.tradingsymbol.toUpperCase().includes(search.toUpperCase())
  );

  const totalCharges = trades.reduce((s, t) => s + t.charges.total_charges, 0);
  const totalBrokerage = trades.reduce((s, t) => s + t.charges.brokerage, 0);
  const totalStt = trades.reduce((s, t) => s + t.charges.stt, 0);

  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    const headers = [
      'Trade ID', 'Executed At', 'Side', 'Instrument', 'Exchange', 'Product', 'Quantity', 'Fill Price',
      'Brokerage', 'STT', 'Exchange Charges', 'GST', 'Total Charges'
    ];
    const rows = filtered.map(t => [
      t.trade_id,
      t.executed_at,
      t.transaction_type,
      t.tradingsymbol,
      t.exchange,
      t.product,
      t.quantity,
      t.execution_price,
      t.charges.brokerage,
      t.charges.stt,
      t.charges.exchange_charges,
      t.charges.gst,
      t.charges.total_charges,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `cnrx_tradebook_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-full mx-auto select-none font-sans text-[#F5F5F2] pb-12 space-y-4">
      {/* ── 1. Top Cendrix Header Strip with Apple Frosted Controls ────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        {/* Title + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono tracking-wider text-[#C6A15B] uppercase font-semibold">
                Audited Executions · Settlement Ledger
              </span>
            </div>
            <h1 className="text-2xl font-serif tracking-tight text-[#F5F5F2] flex items-center gap-2.5">
              <span>Tradebook</span>
              <span className="text-xs font-mono font-medium text-[#A1A8B3] px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] tabular-nums">
                {trades.length} trades
              </span>
            </h1>
          </div>

          {/* Apple frosted search bar */}
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded-xl focus-within:border-[#C6A15B]/60 focus-within:ring-2 focus-within:ring-[#C6A15B]/15 w-48 sm:w-64 transition-all shadow-sm">
            <Search className="w-3.5 h-3.5 text-[#C6A15B]" />
            <input
              type="text"
              placeholder="Search trade ID or symbol..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-xs text-[#F5F5F2] placeholder-[#6E7683] focus:outline-none w-full font-sans"
            />
          </div>
        </div>

        {/* Right Financial Telemetry & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
          <div className="hidden sm:flex items-center gap-2 p-1 bg-white/[0.02] border border-white/[0.06] rounded-xl">
            <div className="flex items-baseline gap-1.5 font-mono px-2.5 py-1 text-xs">
              <span className="text-[#A1A8B3] text-[10px] uppercase font-medium">Brokerage:</span>
              <span className="text-[#F5F5F2] font-semibold tabular-nums">₹{totalBrokerage.toFixed(2)}</span>
            </div>
            <div className="w-px h-3.5 bg-white/10" />
            <div className="flex items-baseline gap-1.5 font-mono px-2.5 py-1 text-xs">
              <span className="text-[#A1A8B3] text-[10px] uppercase font-medium">STT/CTT:</span>
              <span className="text-[#F5F5F2] font-semibold tabular-nums">₹{totalStt.toFixed(2)}</span>
            </div>
            <div className="w-px h-3.5 bg-white/10" />
            <div className="flex items-baseline gap-1.5 font-mono px-2.5 py-1 text-xs">
              <span className="text-[#A1A8B3] text-[10px] uppercase font-medium">Total Charges:</span>
              <span className="text-[#C6A15B] font-bold tabular-nums">₹{totalCharges.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className="apple-segmented-item px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-[#F5F5F2] hover:text-[#C6A15B] border border-white/[0.08] transition-all active:scale-[0.96]"
          >
            <Download className="w-3.5 h-3.5 text-[#C6A15B]" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* ── 2. Full-Width Tradebook Table in Apple Glass Panel ────── */}
      <div className="mt-2">
        {filtered.length === 0 ? (
          <div className="py-24 text-center apple-glass-panel rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#C6A15B] mb-3 shadow-inner">
              <Layers className="w-6 h-6" />
            </div>
            <p className="text-base font-serif font-bold text-[#F5F5F2] tracking-tight">No executed trades</p>
            <p className="text-xs text-[#A1A8B3] mt-1.5 font-mono max-w-md mx-auto">
              Filled orders will automatically record here with verified regulatory charge breakdowns.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto apple-glass-panel rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/[0.06] text-[#A1A8B3] text-[10px] font-mono uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Fill Time</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Instrument</th>
                  <th className="py-3 px-4 font-semibold">Product</th>
                  <th className="py-3 px-4 font-semibold text-right">Qty.</th>
                  <th className="py-3 px-4 font-semibold text-right">Price</th>
                  <th className="py-3 px-4 font-semibold text-right">Charges</th>
                  <th className="py-3 px-4 font-semibold text-right">Order Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] font-mono">
                {filtered.map((t) => {
                  const isBuy = t.transaction_type === 'BUY';
                  return (
                    <tr key={t.id || t.trade_id} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="py-3 px-4 text-[#A1A8B3] tabular-nums">
                        {new Date(t.executed_at).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider ${
                          isBuy
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}>
                          {t.transaction_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-[#F5F5F2] group-hover:text-[#C6A15B] transition-colors">
                            {t.tradingsymbol}
                          </span>
                          <span className="text-[10px] text-[#A1A8B3] font-mono px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.06]">{t.exchange}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span className="text-[10px] bg-white/[0.04] border border-white/[0.08] text-[#C6A15B] px-2 py-0.5 rounded-md font-mono font-semibold">
                          {t.product}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-[#F5F5F2] font-semibold tabular-nums">
                        {t.quantity}
                      </td>
                      <td className="py-3 px-4 text-right text-[#F5F5F2] font-bold tabular-nums">
                        ₹{t.execution_price.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-[#A1A8B3] tabular-nums">
                        ₹{t.charges.total_charges.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-[#6E7683] text-[11px] font-mono">
                        {t.order_id || t.trade_id}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
