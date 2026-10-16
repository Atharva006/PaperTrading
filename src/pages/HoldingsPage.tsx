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
    <div className="w-full max-w-[1720px] mx-auto select-none font-sans text-[#f0f3f8] pb-12">
      {/* ── 1. Top Zerodha Header Strip ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1e2638]">
        {/* Title */}
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-medium tracking-tight text-[#f0f3f8] flex items-center gap-2">
            <span>Holdings</span>
            <span className="text-xs font-mono font-normal text-[#788296]">
              ({holdings.length})
            </span>
          </h1>

          {/* Search bar */}
          <div className="flex items-center gap-2 px-2.5 py-1 bg-[#121722] border border-[#1e2638] rounded focus-within:border-[#387ed1] w-44 sm:w-56 transition-colors">
            <Search className="w-3.5 h-3.5 text-[#58647a]" />
            <input
              type="text"
              placeholder="Search holdings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-[#f0f3f8] placeholder-[#58647a] focus:outline-none w-full"
            />
          </div>
        </div>

        {/* Right Financial Telemetry & Action Buttons */}
        <div className="flex flex-wrap items-center gap-6 text-xs">
          <div className="hidden sm:flex items-center gap-6">
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-[#788296] text-[11px]">Total investment:</span>
              <span className="text-[#c4cbd4] font-medium">
                ₹{totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-[#788296] text-[11px]">Current value:</span>
              <span className="text-[#f0f3f8] font-semibold">
                ₹{totalCurrent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-[#788296] text-[11px]">Total P&L:</span>
              <span className={`font-semibold ${totalPnL >= 0 ? 'text-[#00c087]' : 'text-[#df514c]'}`}>
                {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({totalPnLPct.toFixed(2)}%)
              </span>
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

      {/* ── 2. Full-Width Edge-to-Edge Holdings Table (No Outer Box) ─────── */}
      <div className="mt-2">
        {filteredHoldings.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#151b28] border border-[#1e2638] flex items-center justify-center text-[#788296] mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-[#c4cbd4]">You don't have any equity holdings yet</p>
            <p className="text-xs text-[#58647a] mt-1">
              Place CNC (Cash & Carry) buy orders on NSE/BSE stocks to hold them in your portfolio.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1e2638] text-[#788296] text-[11px] font-medium">
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
              <tbody className="divide-y divide-[#1e2638]/60 font-mono">
                {filteredHoldings.map((h) => {
                  const isProfit = h.pnl >= 0;
                  return (
                    <tr key={h.id} className="hover:bg-[#121724] transition-colors group">
                      <td className="py-2.5 px-3 font-sans">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#f0f3f8] group-hover:text-[#387ed1] transition-colors">
                            {h.tradingsymbol}
                          </span>
                          <span className="text-[10px] text-[#58647a] font-mono">{h.exchange}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#c4cbd4] font-medium">
                        {h.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#c4cbd4]">
                        {h.average_price.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#f0f3f8] font-medium">
                        {h.last_price.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#c4cbd4]">
                        {h.current_value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={`py-2.5 px-3 text-right font-semibold ${isProfit ? 'text-[#00c087]' : 'text-[#df514c]'}`}>
                        {isProfit ? '+' : ''}{h.pnl.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={`py-2.5 px-3 text-right ${isProfit ? 'text-[#00c087]' : 'text-[#df514c]'}`}>
                        {isProfit ? '+' : ''}{h.pnl_percentage.toFixed(2)}%
                      </td>
                      <td className="py-2.5 px-3 text-right space-x-1.5 font-sans">
                        <button
                          onClick={() => handleBuyMore(h)}
                          className="px-2 py-0.5 rounded text-[11px] font-medium text-[#387ed1] hover:bg-[#387ed1] hover:text-white border border-[#387ed1]/30 transition-colors"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => handleSellHolding(h)}
                          className="px-2 py-0.5 rounded text-[11px] font-medium text-[#df514c] hover:bg-[#df514c] hover:text-white border border-[#df514c]/30 transition-colors"
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
            <div className="flex items-center justify-between py-3 px-3 mt-4 border-t border-b border-[#1e2638] bg-[#0c1018]">
              <div className="flex items-center gap-6 text-xs text-[#788296] font-medium">
                <div>
                  Total invested: <span className="text-[#f0f3f8] font-bold">₹{totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div>
                  Current value: <span className="text-[#f0f3f8] font-bold">₹{totalCurrent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2 font-mono">
                <span className="text-xs text-[#788296]">Total P&L:</span>
                <span className={`text-base font-bold ${totalPnL >= 0 ? 'text-[#00c087]' : 'text-[#df514c]'}`}>
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
