import React, { useState } from 'react';
import { useTradingStore } from '../store/useTradingStore';
import { BookOpenCheck, Download, Search, ShieldCheck } from 'lucide-react';

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
  const totalGst = trades.reduce((s, t) => s + t.charges.gst, 0);

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
    <div className="space-y-6 pb-12 max-w-7xl mx-auto select-none">
      {/* ── Summary Ribbon ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#0B1424]/90 border border-[#C6A15B]/15 shadow-md">
          <span className="text-[10px] text-[#8F9BAE] uppercase font-bold tracking-wider">Total Executions</span>
          <p className="text-xl font-mono font-bold text-white mt-1">{trades.length} fills</p>
        </div>
        <div className="p-4 rounded-xl bg-[#0B1424]/90 border border-[#C6A15B]/15 shadow-md">
          <span className="text-[10px] text-[#8F9BAE] uppercase font-bold tracking-wider">Total Brokerage Paid</span>
          <p className="text-xl font-mono font-bold text-white mt-1">₹{totalBrokerage.toFixed(2)}</p>
        </div>
        <div className="p-4 rounded-xl bg-[#0B1424]/90 border border-[#C6A15B]/15 shadow-md">
          <span className="text-[10px] text-[#8F9BAE] uppercase font-bold tracking-wider">Total STT / CTT Paid</span>
          <p className="text-xl font-mono font-bold text-white mt-1">₹{totalStt.toFixed(2)}</p>
        </div>
        <div className="p-4 rounded-xl bg-[#0B1424]/90 border border-[#C6A15B]/15 shadow-md">
          <span className="text-[10px] text-[#8F9BAE] uppercase font-bold tracking-wider">All Regulatory Charges</span>
          <p className="text-xl font-mono font-bold text-[#C6A15B] mt-1">₹{totalCharges.toFixed(2)}</p>
        </div>
      </div>

      {/* ── Trade Book Table Card ───────────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-[#0E1728]/95 border border-[#C6A15B]/20 shadow-xl space-y-4 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpenCheck className="w-5 h-5 text-[#C6A15B]" />
            <h3 className="text-base font-bold font-serif text-white tracking-wide">Execution Trade Book</h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0B1424] border border-[#1F2D48] rounded-xl text-xs">
              <Search className="w-3.5 h-3.5 text-[#8F9BAE]" />
              <input
                type="text"
                placeholder="Search fills..."
                className="bg-transparent text-white focus:outline-none text-xs w-36 placeholder-[#8F9BAE]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg bg-[#14223A] hover:bg-[#1C2E4C] border border-[#C6A15B]/20 text-xs font-semibold text-[#C6A15B] hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#8F9BAE]">
            No execution records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1F2D48] text-[#8F9BAE] text-[10px] uppercase font-semibold">
                  <th className="py-3 px-3">Trade ID / Time</th>
                  <th className="py-3 px-3">Side</th>
                  <th className="py-3 px-3">Instrument</th>
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Quantity</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">Brokerage</th>
                  <th className="py-3 px-3">STT</th>
                  <th className="py-3 px-3">GST</th>
                  <th className="py-3 px-3 text-right">Total Charges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2D48]/60 font-mono">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-[#14223A]/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{t.trade_id}</div>
                      <div className="text-[10px] text-[#8F9BAE] font-sans">
                        {new Date(t.executed_at).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.transaction_type === 'BUY' ? 'bg-[#38BDF8]/20 text-[#7DD3FC]' : 'bg-[#F43F5E]/20 text-[#FDA4AF]'}`}>
                        {t.transaction_type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-white">
                      <span>{t.tradingsymbol}</span>
                      <span className="text-[10px] text-[#8F9BAE] font-normal ml-1.5">{t.exchange}</span>
                    </td>
                    <td className="py-3 px-3 text-[#A1A8B3] font-sans">
                      <span className="text-[10px] bg-[#14223A] border border-[#1F2D48] text-[#E2C889] px-1.5 py-0.5 rounded font-bold">
                        {t.product}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-white font-bold">{t.quantity}</td>
                    <td className="py-3 px-3 font-bold text-white">₹{t.execution_price.toFixed(2)}</td>
                    <td className="py-3 px-3 text-[#A1A8B3]">₹{t.charges.brokerage.toFixed(2)}</td>
                    <td className="py-3 px-3 text-[#A1A8B3]">₹{t.charges.stt.toFixed(2)}</td>
                    <td className="py-3 px-3 text-[#A1A8B3]">₹{t.charges.gst.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right text-[#C6A15B] font-bold">
                      ₹{t.charges.total_charges.toFixed(2)}
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
