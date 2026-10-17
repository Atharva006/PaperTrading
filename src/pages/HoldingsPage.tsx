import React, { useState } from 'react';
import { useTradingStore } from '../store/useTradingStore';
import { Download, Search, Layers } from 'lucide-react';

export default function HoldingsPage() {
  const { holdings, openOrderTicket } = useTradingStore();
  const [searchQuery, setSearchQuery] = useState('');

  const totalInvested = holdings.reduce((s, h) => s + h.invested_value, 0);
  const totalCurrent = holdings.reduce((s, h) => s + h.current_value, 0);
  const totalPnL = totalCurrent - totalInvested;
  const totalPnLPct = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
  const totalDayChange = holdings.reduce((s, h) => s + h.day_change, 0);

  const filteredHoldings = holdings.filter(
    (h) => !searchQuery || h.tradingsymbol.toUpperCase().includes(searchQuery.toUpperCase())
  );

  const handleExportCSV = () => {
    if (holdings.length === 0) return;
    const headers = ['Tradingsymbol', 'Quantity', 'Avg Price', 'LTP', 'Invested Value', 'Current Value', 'P&L', 'P&L %'];
    const rows = holdings.map(h => [
      h.tradingsymbol,
      h.quantity,
      h.average_price,
      h.last_price,
      h.invested_value,
      h.current_value,
      h.pnl,
      h.pnl_percentage.toFixed(2),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `cnrx_holdings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSellHolding = (h: any) => {
    openOrderTicket({
      instrument_key: h.instrument_key,
      tradingsymbol: h.tradingsymbol,
      exchange: h.exchange,
      instrument_type: 'EQUITY',
      transaction_type: 'SELL',
      product: 'CNC',
      quantity: h.quantity,
      lot_size: 1,
    });
  };

  const handleBuyMore = (h: any) => {
    openOrderTicket({
      instrument_key: h.instrument_key,
      tradingsymbol: h.tradingsymbol,
      exchange: h.exchange,
      instrument_type: 'EQUITY',
      transaction_type: 'BUY',
      product: 'CNC',
      quantity: h.quantity,
      lot_size: 1,
    });
  };

  return (
    <div className="w-full max-w-full mx-auto select-none font-sans text-[#F5F5F2] pb-12">
      {/* ── 1. Top Cendrix Capital Header Strip ─────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#14223A]">
        {/* Title */}
        <div className="flex items-center gap-6">
          <h1 className="font-serif text-2xl font-bold tracking-wide text-[#F5F5F2] flex items-center gap-2.5">
            <span>Portfolio Holdings</span>
            <span className="text-xs font-mono font-normal text-[#A1A8B3]">
              ({holdings.length} assets)
            </span>
          </h1>

          {/* Search bar */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0B1424] border border-[#14223A] rounded-lg focus-within:border-[#C6A15B] w-48 sm:w-64 transition-all">
            <Search className="w-3.5 h-3.5 text-[#A1A8B3]" />
            <input
              type="text"
              placeholder="Search holdings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-[#F5F5F2] placeholder-[#6E7683] focus:outline-none w-full"
            />
          </div>
        </div>

        {/* Right Financial Telemetry & Action Buttons */}
        <div className="flex flex-wrap items-center gap-6 text-xs">
          <div className="hidden sm:flex items-center gap-6">
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-[#A1A8B3] text-[11px]">Invested:</span>
              <span className="text-[#F5F5F2] font-medium">
                ₹{totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-[#A1A8B3] text-[11px]">Current value:</span>
              <span className="text-[#F5F5F2] font-semibold">
                ₹{totalCurrent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-[#A1A8B3] text-[11px]">Total P&L:</span>
              <span className={`font-bold ${totalPnL >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({totalPnLPct.toFixed(2)}%)
              </span>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className="btn-cendrix-outline px-3.5 py-1.5 text-xs rounded-lg transition-all flex items-center gap-1.5 font-semibold"
          >
            <Download className="w-3.5 h-3.5 text-[#C6A15B]" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* ── 2. Holdings Table ─────── */}
      <div className="cendrix-card p-5 rounded-xl border border-[rgba(198,161,91,0.2)] mt-5">
        {filteredHoldings.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-[#0F192B] border border-[rgba(198,161,91,0.25)] flex items-center justify-center text-[#C6A15B] mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <p className="font-serif text-base font-bold text-[#F5F5F2]">No equity holdings currently in portfolio</p>
            <p className="text-xs text-[#A1A8B3] mt-1.5 max-w-md mx-auto">
              Execute CNC (Cash & Carry) buy orders on NSE equities to accumulate long-term assets.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#14223A] text-[#6E7683] text-[10px] uppercase font-mono tracking-wider">
                  <th className="py-2.5 px-3">Instrument</th>
                  <th className="py-2.5 px-3 text-right">Qty.</th>
                  <th className="py-2.5 px-3 text-right">Avg. cost</th>
                  <th className="py-2.5 px-3 text-right">LTP</th>
                  <th className="py-2.5 px-3 text-right">Cur. val</th>
                  <th className="py-2.5 px-3 text-right">P&L</th>
                  <th className="py-2.5 px-3 text-right">Net chg.</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#14223A]/50 font-mono">
                {filteredHoldings.map((h) => {
                  const isProfit = h.pnl >= 0;
                  return (
                    <tr key={h.id} className="hover:bg-[#14223A]/40 transition-colors group">
                      <td className="py-2.5 px-3 font-sans">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#F5F5F2] group-hover:text-[#C6A15B] transition-colors">
                            {h.tradingsymbol}
                          </span>
                          <span className="text-[10px] text-[#A1A8B3] font-mono">{h.exchange}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#F5F5F2] font-semibold">
                        {h.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#A1A8B3]">
                        {h.average_price.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#F5F5F2] font-semibold">
                        {h.last_price.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#F5F5F2]">
                        {h.current_value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={`py-2.5 px-3 text-right font-bold ${isProfit ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {isProfit ? '+' : ''}{h.pnl.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={`py-2.5 px-3 text-right ${isProfit ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {isProfit ? '+' : ''}{h.pnl_percentage.toFixed(2)}%
                      </td>
                      <td className="py-2.5 px-3 text-right space-x-2 font-sans">
                        <button
                          onClick={() => handleBuyMore(h)}
                          className="px-2.5 py-1 rounded-md text-[11px] font-bold text-[#10B981] bg-[#10B981]/15 hover:bg-[#10B981] hover:text-white border border-[#10B981]/30 transition-all"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => handleSellHolding(h)}
                          className="px-2.5 py-1 rounded-md text-[11px] font-bold text-[#EF4444] bg-[#EF4444]/15 hover:bg-[#EF4444] hover:text-white border border-[#EF4444]/30 transition-all"
                        >
                          Exit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* ── 3. Sticky Bottom Total P&L Strip ─────────────────────── */}
            <div className="flex items-center justify-between py-3.5 px-4 mt-5 rounded-lg border border-[#14223A] bg-[#0B1424]">
              <div className="flex items-center gap-6 text-xs text-[#A1A8B3] font-medium font-mono">
                <div>
                  Total invested: <span className="text-[#F5F5F2] font-bold">₹{totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div>
                  Current value: <span className="text-[#F5F5F2] font-bold">₹{totalCurrent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2 font-mono">
                <span className="text-xs text-[#A1A8B3]">Total P&L:</span>
                <span className={`text-base font-bold ${totalPnL >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                  {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({totalPnLPct.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
