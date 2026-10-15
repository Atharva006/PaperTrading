import React from 'react';
import { useTradingStore } from '../store/useTradingStore';
import { Layers3, Download, TrendingUp, TrendingDown, PlusCircle } from 'lucide-react';

export default function HoldingsPage() {
  const { holdings, openOrderTicket, setSelectedInstrument } = useTradingStore();

  const totalInvested = holdings.reduce((s, h) => s + h.invested_value, 0);
  const totalCurrent = holdings.reduce((s, h) => s + h.current_value, 0);
  const totalPnL = totalCurrent - totalInvested;
  const totalPnLPct = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
  const totalDayChange = holdings.reduce((s, h) => s + h.day_change, 0);

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
    <div className="space-y-6 pb-12 max-w-7xl mx-auto select-none">
      {/* ── Summary Ribbon ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#0B1424]/90 border border-[#C6A15B]/15 shadow-md">
          <span className="text-[10px] text-[#8F9BAE] uppercase font-bold tracking-wider">Total Invested</span>
          <p className="text-xl font-mono font-bold text-white mt-1">
            ₹{totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0B1424]/90 border border-[#C6A15B]/15 shadow-md">
          <span className="text-[10px] text-[#8F9BAE] uppercase font-bold tracking-wider">Current Market Value</span>
          <p className="text-xl font-mono font-bold text-white mt-1">
            ₹{totalCurrent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0B1424]/90 border border-[#C6A15B]/15 shadow-md">
          <span className="text-[10px] text-[#8F9BAE] uppercase font-bold tracking-wider">Total Return / P&L</span>
          <p className={`text-xl font-mono font-bold mt-1 ${totalPnL >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
            {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({totalPnLPct.toFixed(2)}%)
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0B1424]/90 border border-[#C6A15B]/15 shadow-md">
          <span className="text-[10px] text-[#8F9BAE] uppercase font-bold tracking-wider">Day's Total Change</span>
          <p className={`text-xl font-mono font-bold mt-1 ${totalDayChange >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
            {totalDayChange >= 0 ? '+' : ''}₹{totalDayChange.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* ── Holdings Table Card ─────────────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-[#0E1728]/95 border border-[#C6A15B]/20 shadow-xl space-y-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold font-serif text-white tracking-wide">Equity Delivery Holdings (CNC)</h3>
            <span className="text-xs bg-[#14223A] border border-[#1F2D48] text-[#E2C889] px-2 py-0.5 rounded-full font-bold">
              {holdings.length} stocks
            </span>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 rounded-lg bg-[#14223A] hover:bg-[#1C2E4C] border border-[#C6A15B]/20 text-xs font-semibold text-[#C6A15B] hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        {holdings.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#8F9BAE]">
            No delivery holdings in your virtual account. Buy stocks with CNC product type to accumulate holdings.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1F2D48] text-[#8F9BAE] text-[10px] uppercase font-semibold">
                  <th className="py-3 px-3">Stock</th>
                  <th className="py-3 px-3">Quantity</th>
                  <th className="py-3 px-3">Avg Price</th>
                  <th className="py-3 px-3">LTP</th>
                  <th className="py-3 px-3">Invested Val</th>
                  <th className="py-3 px-3">Current Val</th>
                  <th className="py-3 px-3">Total P&L</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2D48]/60 font-mono">
                {holdings.map((h) => (
                  <tr key={h.id} className="hover:bg-[#14223A]/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <span>{h.tradingsymbol}</span>
                        <span className="text-[10px] text-[#8F9BAE] font-normal">{h.exchange}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-white font-bold">{h.quantity}</td>
                    <td className="py-3 px-3 text-white">₹{h.average_price.toFixed(2)}</td>
                    <td className="py-3 px-3 text-white font-bold">₹{h.last_price.toFixed(2)}</td>
                    <td className="py-3 px-3 text-[#A1A8B3]">₹{h.invested_value.toLocaleString()}</td>
                    <td className="py-3 px-3 text-white">₹{h.current_value.toLocaleString()}</td>
                    <td className={`py-3 px-3 font-bold ${h.pnl >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                      {h.pnl >= 0 ? '+' : ''}₹{h.pnl.toFixed(2)} ({h.pnl_percentage.toFixed(2)}%)
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleBuyMore(h)}
                          className="px-2.5 py-1 bg-[#10B981]/20 hover:bg-[#10B981] text-[#34D399] hover:text-white rounded-lg text-[11px] font-bold transition-colors"
                        >
                          + Buy More
                        </button>
                        <button
                          onClick={() => handleSellHolding(h)}
                          className="px-2.5 py-1 bg-[#F43F5E]/20 hover:bg-[#F43F5E] text-[#FDA4AF] hover:text-white rounded-lg text-[11px] font-bold transition-colors"
                        >
                          Sell
                        </button>
                      </div>
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
