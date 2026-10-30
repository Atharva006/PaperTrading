import React, { useState } from 'react';
import { useTradingStore } from '../store/useTradingStore';
import { Download, AlertTriangle, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';

export default function PositionsPage() {
  const { positions, closePosition, closeAllPositions, openOrderTicket } = useTradingStore();
  const [activeTab, setActiveTab] = useState<'OPEN' | 'CLOSED'>('OPEN');
  const [isClosingAll, setIsClosingAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const openPositions = positions.filter((p) => !p.is_closed && p.quantity !== 0);
  const closedPositions = positions.filter((p) => p.is_closed || p.quantity === 0);

  const displayedList = (activeTab === 'OPEN' ? openPositions : closedPositions).filter((p) =>
    !searchQuery || p.tradingsymbol.toUpperCase().includes(searchQuery.toUpperCase())
  );

  const totalUnrealized = openPositions.reduce((s, p) => s + p.unrealized_pnl, 0);
  const totalRealized = positions.reduce((s, p) => s + p.realized_pnl, 0);
  const totalMarginLocked = openPositions.reduce((s, p) => s + p.margin_required, 0);

  const handleExportCSV = () => {
    const list = activeTab === 'OPEN' ? openPositions : closedPositions;
    if (list.length === 0) return;

    const headers = ['Tradingsymbol', 'Product', 'Quantity', 'Buy Price', 'Sell Price', 'LTP', 'Realized P&L', 'Unrealized P&L'];
    const rows = list.map(p => [
      p.tradingsymbol,
      p.product,
      p.quantity,
      p.buy_price,
      p.sell_price,
      p.last_price,
      p.realized_pnl,
      p.unrealized_pnl,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cnrx_positions_${activeTab.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCloseAll = async () => {
    if (window.confirm(`Are you sure you want to square off all ${openPositions.length} open positions at market price?`)) {
      setIsClosingAll(true);
      await closeAllPositions();
      setIsClosingAll(false);
    }
  };

  return (
    <div className="w-full max-w-full mx-auto select-none font-sans text-[#111114] pb-12">
      {/* ── 1. Top Header Strip ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#D9E2F2]">
        {/* Title + Sub-tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#00225A] flex items-center gap-2.5">
            <span>Trading Positions</span>
            <span className="text-xs font-mono font-normal text-[#6B7A90]">
              ({openPositions.length} active)
            </span>
          </h1>

          <div className="bg-[#F7F8FA] border border-[#D9E2F2] p-1 rounded-xl inline-flex gap-1">
            <button
              onClick={() => setActiveTab('OPEN')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeTab === 'OPEN'
                  ? 'bg-white text-[#00225A] shadow-sm font-bold border border-[#D9E2F2]'
                  : 'text-[#6B7A90] hover:text-[#00225A]'
              }`}
            >
              Open Positions ({openPositions.length})
            </button>
            <button
              onClick={() => setActiveTab('CLOSED')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeTab === 'CLOSED'
                  ? 'bg-white text-[#00225A] shadow-sm font-bold border border-[#D9E2F2]'
                  : 'text-[#6B7A90] hover:text-[#00225A]'
              }`}
            >
              Closed Book ({closedPositions.length})
            </button>
          </div>
        </div>

        {/* Right Financial Telemetry & Action Buttons */}
        <div className="flex flex-wrap items-center gap-5 text-xs">
          {/* Flat financial figures */}
          <div className="hidden sm:flex items-center gap-5 tabular-nums">
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-[#6B7A90] text-[11px]">Unrealized:</span>
              <span className={`font-bold ${totalUnrealized >= 0 ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
                {totalUnrealized >= 0 ? '+' : ''}₹{totalUnrealized.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-[#6B7A90] text-[11px]">Realized:</span>
              <span className={`font-bold ${totalRealized >= 0 ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
                {totalRealized >= 0 ? '+' : ''}₹{totalRealized.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-[#6B7A90] text-[11px]">Margin:</span>
              <span className="text-[#00225A] font-bold">
                ₹{totalMarginLocked.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="btn-secondary px-3.5 py-1.5 text-xs rounded-xl transition-all flex items-center gap-1.5 font-semibold active:scale-[0.96] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#00225A]" />
              <span>Download CSV</span>
            </button>

            {activeTab === 'OPEN' && openPositions.length > 0 && (
              <button
                onClick={handleCloseAll}
                disabled={isClosingAll}
                className="px-3.5 py-1.5 rounded-xl bg-[#FEE4E2] hover:bg-[#D92D20] border border-[#FECDCA] text-[#D92D20] hover:text-white text-xs font-bold transition-all shadow-sm active:scale-[0.94] cursor-pointer"
              >
                {isClosingAll ? 'Closing...' : 'Square Off All'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. Positions Table ───────────────────────────────────────────── */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)] mt-5">
        {activeTab === 'OPEN' ? (
          openPositions.length === 0 ? (
            <div className="py-24 text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#EEF3FF] border border-[#D9E2F2] flex items-center justify-center text-[#536CF0] mb-3 shadow-sm">
                <Layers className="w-6 h-6" />
              </div>
              <p className="font-display text-base font-bold text-[#00225A]">No open positions in active portfolio</p>
              <p className="text-xs text-[#6B7A90] mt-1.5 max-w-md mx-auto">
                Select an instrument from MarketWatch or order terminal to execute leveraged trades.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#D9E2F2] text-[#6B7A90] text-[10px] uppercase font-mono tracking-wider bg-[#F7F8FA]">
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-3">Instrument</th>
                    <th className="py-2.5 px-3 text-right">Qty.</th>
                    <th className="py-2.5 px-3 text-right">Avg. price</th>
                    <th className="py-2.5 px-3 text-right">LTP</th>
                    <th className="py-2.5 px-3 text-right">Cur. val</th>
                    <th className="py-2.5 px-3 text-right">P&L</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E2F2] font-mono tabular-nums">
                  {openPositions.map((pos) => {
                    const isLong = pos.quantity > 0;
                    const avgPrice = isLong ? pos.buy_price : pos.sell_price;
                    const curVal = Math.abs(pos.quantity) * pos.last_price;
                    const isProfit = pos.unrealized_pnl >= 0;

                    return (
                      <tr key={pos.id} className="hover:bg-[#F7F8FA] transition-colors group">
                        <td className="py-2.5 px-3 font-sans">
                          <span className="text-[10px] bg-[#EEF3FF] border border-[#D9E2F2] text-[#00225A] px-2 py-0.5 rounded-full font-mono font-bold">
                            {pos.product}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-sans">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#00225A] group-hover:text-[#536CF0] transition-colors">
                              {pos.tradingsymbol}
                            </span>
                            <span className="text-[10px] text-[#6B7A90] font-mono">{pos.exchange}</span>
                          </div>
                        </td>
                        <td className={`py-2.5 px-3 text-right font-bold ${isLong ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
                          {isLong ? `+${pos.quantity}` : pos.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right text-[#6B7A90]">
                          {avgPrice.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-[#111114] font-semibold">
                          {pos.last_price.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-[#111114]">
                          {curVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className={`py-2.5 px-3 text-right font-bold ${isProfit ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
                          {isProfit ? '+' : ''}{pos.unrealized_pnl.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-sans">
                          <button
                            onClick={() => closePosition(pos.id)}
                            className="px-3 py-1 rounded-lg text-[11px] font-bold text-[#D92D20] bg-[#FEE4E2] hover:bg-[#D92D20] hover:text-white border border-[#FECDCA] active:scale-[0.92] transition-all cursor-pointer shadow-sm"
                          >
                            Square Off
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* ── 3. Bottom Total P&L Strip ───────────────────────────── */}
              <div className="flex items-center justify-between py-3.5 px-4 mt-5 rounded-xl border border-[#D9E2F2] bg-[#F7F8FA]">
                <div className="text-xs text-[#6B7A90] font-medium font-mono">
                  Total open positions: <span className="text-[#00225A] font-bold">{openPositions.length}</span>
                </div>
                <div className="flex items-baseline gap-2 font-mono tabular-nums">
                  <span className="text-xs text-[#6B7A90]">Total P&L:</span>
                  <span className={`text-base font-bold ${totalUnrealized >= 0 ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
                    {totalUnrealized >= 0 ? '+' : ''}₹{totalUnrealized.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          )
        ) : closedPositions.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display text-base font-bold text-[#6B7A90]">No closed positions today</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#D9E2F2] text-[#6B7A90] text-[10px] uppercase font-mono tracking-wider bg-[#F7F8FA]">
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Instrument</th>
                  <th className="py-2.5 px-3 text-right">Buy Qty.</th>
                  <th className="py-2.5 px-3 text-right">Buy Price</th>
                  <th className="py-2.5 px-3 text-right">Sell Qty.</th>
                  <th className="py-2.5 px-3 text-right">Sell Price</th>
                  <th className="py-2.5 px-3 text-right">Realized P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E2F2] font-mono tabular-nums">
                {closedPositions.map((pos) => {
                  const isProfit = pos.realized_pnl >= 0;
                  return (
                    <tr key={pos.id} className="hover:bg-[#F7F8FA] transition-colors">
                      <td className="py-2.5 px-3 font-sans">
                        <span className="text-[10px] bg-[#EEF3FF] border border-[#D9E2F2] text-[#00225A] px-2 py-0.5 rounded-full font-mono font-bold">
                          {pos.product}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-[#00225A] font-sans">
                        {pos.tradingsymbol}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#6B7A90]">{pos.buy_quantity}</td>
                      <td className="py-2.5 px-3 text-right text-[#6B7A90]">₹{pos.buy_price.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right text-[#6B7A90]">{pos.sell_quantity}</td>
                      <td className="py-2.5 px-3 text-right text-[#6B7A90]">₹{pos.sell_price.toFixed(2)}</td>
                      <td className={`py-2.5 px-3 text-right font-bold ${isProfit ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
                        {isProfit ? '+' : ''}₹{pos.realized_pnl.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Closed P&L Total */}
            <div className="flex items-center justify-between py-3.5 px-4 mt-5 rounded-xl border border-[#D9E2F2] bg-[#F7F8FA]">
              <div className="text-xs text-[#6B7A90] font-medium font-mono">
                Total closed trades: <span className="text-[#00225A] font-bold">{closedPositions.length}</span>
              </div>
              <div className="flex items-baseline gap-2 font-mono tabular-nums">
                <span className="text-xs text-[#6B7A90]">Total Realized P&L:</span>
                <span className={`text-base font-bold ${totalRealized >= 0 ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
                  {totalRealized >= 0 ? '+' : ''}₹{totalRealized.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
