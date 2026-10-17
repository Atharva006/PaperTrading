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
      {/* ── 1. Top Cendrix Header Strip ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#14223A]">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono tracking-widest text-[#C6A15B] uppercase font-bold">
                Audited Executions · Settlement Ledger
              </span>
            </div>
            <h1 className="text-2xl font-serif tracking-tight text-[#F5F5F2] flex items-center gap-2.5">
              <span>Tradebook</span>
              <span className="text-xs font-mono font-normal text-[#A1A8B3]">
                ({trades.length} trades)
              </span>
            </h1>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 bg-[#0E1728] border border-[#14223A] rounded-xl focus-within:border-[#C6A15B] w-48 sm:w-60 transition-colors shadow-sm">
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
        <div className="flex flex-wrap items-center gap-6 text-xs">
          <div className="hidden sm:flex items-center gap-6">
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-[#6E7683] text-[11px]">Brokerage:</span>
              <span className="text-[#F5F5F2] font-semibold">₹{totalBrokerage.toFixed(2)}</span>
            </div>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-[#6E7683] text-[11px]">STT/CTT:</span>
              <span className="text-[#F5F5F2] font-semibold">₹{totalStt.toFixed(2)}</span>
            </div>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-[#6E7683] text-[11px]">Total Charges:</span>
              <span className="text-[#C6A15B] font-bold">₹{totalCharges.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className="btn-cendrix-outline px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* ── 2. Full-Width Tradebook Table ────── */}
      <div className="mt-2">
        {filtered.length === 0 ? (
          <div className="py-24 text-center cendrix-card rounded-xl border border-[#14223A]">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#10141C] border border-[#14223A] flex items-center justify-center text-[#C6A15B] mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <p className="text-sm font-serif text-[#F5F5F2]">No executed trades</p>
            <p className="text-xs text-[#6E7683] mt-1 font-mono">Filled orders will automatically record here with verified regulatory charge breakdowns.</p>
          </div>
        ) : (
          <div className="overflow-x-auto cendrix-card rounded-xl border border-[#14223A]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#14223A] text-[#6E7683] text-[11px] font-mono uppercase bg-[#0B1424]">
                  <th className="py-3 px-4">Fill Time</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Instrument</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4 text-right">Qty.</th>
                  <th className="py-3 px-4 text-right">Price</th>
                  <th className="py-3 px-4 text-right">Charges</th>
                  <th className="py-3 px-4 text-right">Order Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#14223A] font-mono">
                {filtered.map((t) => {
                  const isBuy = t.transaction_type === 'BUY';
                  return (
                    <tr key={t.id || t.trade_id} className="hover:bg-[#14223A]/40 transition-colors group">
                      <td className="py-3 px-4 text-[#A1A8B3]">
                        {new Date(t.executed_at).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
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
                          <span className="text-[10px] text-[#C6A15B] font-mono px-1 py-0.2 rounded bg-[#0B1424] border border-[#14223A]">{t.exchange}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span className="text-[10px] bg-[#0B1424] border border-[#14223A] text-[#A1A8B3] px-2 py-0.5 rounded font-mono font-medium">
                          {t.product}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-[#F5F5F2] font-semibold">
                        {t.quantity}
                      </td>
                      <td className="py-3 px-4 text-right text-[#F5F5F2] font-bold">
                        ₹{t.execution_price.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-[#A1A8B3]">
                        ₹{t.charges.total_charges.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-[#6E7683] text-[11px]">
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
