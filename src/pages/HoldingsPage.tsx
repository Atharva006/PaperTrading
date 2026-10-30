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
    <div className="w-full max-w-full mx-auto select-none font-sans text-[#111114] pb-12">
      {/* ── 1. Top Header Strip ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#D9E2F2]">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#00225A] flex items-center gap-2.5">
            <span>Portfolio Holdings</span>
            <span className="text-xs font-mono font-normal text-[#6B7A90]">
              ({holdings.length} assets)
            </span>
          </h1>

          {/* Search bar */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl focus-within:border-[#00225A] w-48 sm:w-64 transition-all">
            <Search className="w-3.5 h-3.5 text-[#6B7A90]" />
            <input
              type="text"
              placeholder="Search holdings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-[#111114] placeholder-[#6B7A90] focus:outline-none w-full font-sans"
            />
          </div>
        </div>

        {/* Right Financial Telemetry & Action Buttons */}
        <div className="flex flex-wrap items-center gap-6 text-xs">
          <div className="hidden sm:flex items-center gap-6 tabular-nums">
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-[#6B7A90] text-[11px]">Invested:</span>
              <span className="text-[#00225A] font-semibold">
                ₹{totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-[#6B7A90] text-[11px]">Current value:</span>
              <span className="text-[#111114] font-bold">
                ₹{totalCurrent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-[#6B7A90] text-[11px]">Total P&L:</span>
              <span className={`font-bold ${totalPnL >= 0 ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
                {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({totalPnLPct.toFixed(2)}%)
              </span>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className="btn-secondary px-3.5 py-1.5 text-xs rounded-xl transition-all flex items-center gap-1.5 font-semibold active:scale-[0.96] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#00225A]" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* ── 2. Holdings Table ───────────────────────────────────────────── */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)] mt-5">
        {filteredHoldings.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#EEF3FF] border border-[#D9E2F2] flex items-center justify-center text-[#536CF0] mb-3 shadow-sm">
              <Layers className="w-6 h-6" />
            </div>
            <p className="font-display text-base font-bold text-[#00225A]">No equity holdings currently in portfolio</p>
            <p className="text-xs text-[#6B7A90] mt-1.5 max-w-md mx-auto">
              Execute CNC (Cash & Carry) buy orders on NSE equities to accumulate long-term assets.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#D9E2F2] text-[#6B7A90] text-[10px] uppercase font-mono tracking-wider bg-[#F7F8FA]">
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
              <tbody className="divide-y divide-[#D9E2F2] font-mono tabular-nums">
                {filteredHoldings.map((h) => {
                  const isProfit = h.pnl >= 0;
                  return (
                    <tr key={h.id} className="hover:bg-[#F7F8FA] transition-colors group">
                      <td className="py-2.5 px-3 font-sans">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#00225A] group-hover:text-[#536CF0] transition-colors">
                            {h.tradingsymbol}
                          </span>
                          <span className="text-[10px] text-[#6B7A90] font-mono">{h.exchange}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#111114] font-semibold">
                        {h.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#6B7A90]">
                        {h.average_price.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#111114] font-semibold">
                        {h.last_price.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#111114]">
                        {h.current_value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={`py-2.5 px-3 text-right font-bold ${isProfit ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
                        {isProfit ? '+' : ''}{h.pnl.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={`py-2.5 px-3 text-right ${isProfit ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
                        {isProfit ? '+' : ''}{h.pnl_percentage.toFixed(2)}%
                      </td>
                      <td className="py-2.5 px-3 text-right space-x-2 font-sans">
                        <button
                          onClick={() => handleBuyMore(h)}
                          className="px-3 py-1 rounded-lg text-[11px] font-bold text-[#12B76A] bg-[#12B76A]/10 hover:bg-[#12B76A] hover:text-white border border-[#12B76A]/30 active:scale-[0.92] transition-all cursor-pointer shadow-sm"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => handleSellHolding(h)}
                          className="px-3 py-1 rounded-lg text-[11px] font-bold text-[#D92D20] bg-[#FEE4E2] hover:bg-[#D92D20] hover:text-white border border-[#FECDCA] active:scale-[0.92] transition-all cursor-pointer shadow-sm"
                        >
                          Exit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* ── 3. Bottom Total P&L Strip ───────────────────────────── */}
            <div className="flex items-center justify-between py-3.5 px-4 mt-5 rounded-xl border border-[#D9E2F2] bg-[#F7F8FA]">
              <div className="flex items-center gap-6 text-xs text-[#6B7A90] font-medium font-mono tabular-nums">
                <div>
                  Total invested: <span className="text-[#00225A] font-bold">₹{totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div>
                  Current value: <span className="text-[#111114] font-bold">₹{totalCurrent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2 font-mono tabular-nums">
                <span className="text-xs text-[#6B7A90]">Total P&L:</span>
                <span className={`text-base font-bold ${totalPnL >= 0 ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
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
