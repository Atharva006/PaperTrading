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
    <div className="w-full max-w-[1720px] mx-auto select-none font-sans text-[#f0f3f8] pb-12 space-y-4">
      {/* ── 1. Top Zerodha Header Strip ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1e2638]">
        {/* Title */}
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-medium tracking-tight text-[#f0f3f8] flex items-center gap-2">
            <span>Tradebook</span>
            <span className="text-xs font-mono font-normal text-[#788296]">
              ({trades.length} trades)
            </span>
          </h1>

          {/* Search bar */}
          <div className="flex items-center gap-2 px-2.5 py-1 bg-[#121722] border border-[#1e2638] rounded focus-within:border-[#387ed1] w-44 sm:w-56 transition-colors">
            <Search className="w-3.5 h-3.5 text-[#58647a]" />
            <input
              type="text"
              placeholder="Search trade ID or symbol..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-xs text-[#f0f3f8] placeholder-[#58647a] focus:outline-none w-full"
            />
          </div>
        </div>

        {/* Right Financial Telemetry & Action Buttons */}
        <div className="flex flex-wrap items-center gap-6 text-xs">
          <div className="hidden sm:flex items-center gap-6">
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-[#788296] text-[11px]">Brokerage:</span>
              <span className="text-[#c4cbd4] font-medium">₹{totalBrokerage.toFixed(2)}</span>
            </div>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-[#788296] text-[11px]">STT/CTT:</span>
              <span className="text-[#c4cbd4] font-medium">₹{totalStt.toFixed(2)}</span>
            </div>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-[#788296] text-[11px]">Total Charges:</span>
              <span className="text-[#387ed1] font-semibold">₹{totalCharges.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-2.5 py-1 text-xs text-[#788296] hover:text-[#f0f3f8] border border-[#1e2638] hover:border-[#387ed1] rounded transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* ── 2. Full-Width Edge-to-Edge Tradebook Table (No Outer Box) ────── */}
      <div className="mt-2">
        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#151b28] border border-[#1e2638] flex items-center justify-center text-[#788296] mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-[#c4cbd4]">No executed trades</p>
            <p className="text-xs text-[#58647a] mt-1">Filled orders will automatically record here with verified regulatory charge breakdowns.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1e2638] text-[#788296] text-[11px] font-medium">
                  <th className="py-2.5 px-3">Fill Time</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Instrument</th>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3 text-right">Qty.</th>
                  <th className="py-2.5 px-3 text-right">Price</th>
                  <th className="py-2.5 px-3 text-right">Charges</th>
                  <th className="py-2.5 px-3 text-right">Order Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2638]/60 font-mono">
                {filtered.map((t) => {
                  const isBuy = t.transaction_type === 'BUY';
                  return (
                    <tr key={t.id || t.trade_id} className="hover:bg-[#121724] transition-colors group">
                      <td className="py-2.5 px-3 text-[#788296]">
                        {new Date(t.executed_at).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isBuy
                            ? 'bg-[#387ed1]/15 text-[#387ed1] border border-[#387ed1]/30'
                            : 'bg-[#df514c]/15 text-[#df514c] border border-[#df514c]/30'
                        }`}>
                          {t.transaction_type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-[#f0f3f8] group-hover:text-[#387ed1] transition-colors">
                            {t.tradingsymbol}
                          </span>
                          <span className="text-[10px] text-[#58647a] font-mono">{t.exchange}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className="text-[10px] bg-[#161d2c] border border-[#1e2638] text-[#788296] px-1.5 py-0.5 rounded font-mono font-medium">
                          {t.product}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#c4cbd4] font-medium">
                        {t.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#f0f3f8] font-medium">
                        ₹{t.execution_price.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#788296]">
                        ₹{t.charges.total_charges.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#58647a] text-[11px]">
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
