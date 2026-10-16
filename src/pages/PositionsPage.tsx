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
    <div className="w-full max-w-[1720px] mx-auto select-none font-sans text-[#f0f3f8] pb-12">
      {/* ── 1. Top Zerodha Header Strip ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1e2638]">
        {/* Title + Sub-tabs */}
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-medium tracking-tight text-[#f0f3f8] flex items-center gap-2">
            <span>Positions</span>
            <span className="text-xs font-mono font-normal text-[#788296]">
              ({openPositions.length})
            </span>
          </h1>

          <div className="flex items-center gap-4 text-xs font-medium">
            <button
              onClick={() => setActiveTab('OPEN')}
              className={`pb-1 border-b-2 transition-all ${
                activeTab === 'OPEN'
                  ? 'border-[#387ed1] text-[#387ed1] font-semibold'
                  : 'border-transparent text-[#788296] hover:text-[#c4cbd4]'
              }`}
            >
              Open ({openPositions.length})
            </button>
            <button
              onClick={() => setActiveTab('CLOSED')}
              className={`pb-1 border-b-2 transition-all ${
                activeTab === 'CLOSED'
                  ? 'border-[#387ed1] text-[#387ed1] font-semibold'
                  : 'border-transparent text-[#788296] hover:text-[#c4cbd4]'
              }`}
            >
              Closed ({closedPositions.length})
            </button>
          </div>
        </div>

        {/* Right Financial Telemetry & Action Buttons */}
        <div className="flex flex-wrap items-center gap-5 text-xs">
          {/* Flat financial figures */}
          <div className="hidden sm:flex items-center gap-5">
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-[#788296] text-[11px]">Unrealized:</span>
              <span className={`font-semibold ${totalUnrealized >= 0 ? 'text-[#00c087]' : 'text-[#df514c]'}`}>
                {totalUnrealized >= 0 ? '+' : ''}₹{totalUnrealized.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-[#788296] text-[11px]">Realized:</span>
              <span className={`font-semibold ${totalRealized >= 0 ? 'text-[#00c087]' : 'text-[#df514c]'}`}>
                {totalRealized >= 0 ? '+' : ''}₹{totalRealized.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-[#788296] text-[11px]">Margin:</span>
              <span className="text-[#387ed1] font-medium">
                ₹{totalMarginLocked.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-2.5 py-1 text-xs text-[#788296] hover:text-[#f0f3f8] border border-[#1e2638] hover:border-[#387ed1] rounded transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            {activeTab === 'OPEN' && openPositions.length > 0 && (
              <button
                onClick={handleCloseAll}
                disabled={isClosingAll}
                className="px-3 py-1 rounded bg-[#df514c]/10 hover:bg-[#df514c] border border-[#df514c]/30 text-[#df514c] hover:text-white text-xs font-medium transition-colors"
              >
                {isClosingAll ? 'Closing...' : 'Exit all'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. Full-Width Edge-to-Edge Positions Table (No Outer Box) ─────── */}
      <div className="mt-2">
        {activeTab === 'OPEN' ? (
          openPositions.length === 0 ? (
            <div className="py-24 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#151b28] border border-[#1e2638] flex items-center justify-center text-[#788296] mb-3">
                <Layers className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-[#c4cbd4]">You don't have any open positions yet</p>
              <p className="text-xs text-[#58647a] mt-1">
                Select an instrument from MarketWatch or use the search bar to place simulated trades.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#1e2638] text-[#788296] text-[11px] font-medium">
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
                <tbody className="divide-y divide-[#1e2638]/60 font-mono">
                  {openPositions.map((pos) => {
                    const isLong = pos.quantity > 0;
                    const avgPrice = isLong ? pos.buy_price : pos.sell_price;
                    const curVal = Math.abs(pos.quantity) * pos.last_price;
                    const isProfit = pos.unrealized_pnl >= 0;

                    return (
                      <tr key={pos.id} className="hover:bg-[#121724] transition-colors group">
                        <td className="py-2.5 px-3 font-sans">
                          <span className="text-[10px] bg-[#161d2c] border border-[#1e2638] text-[#788296] px-1.5 py-0.5 rounded font-mono font-medium">
                            {pos.product}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-sans">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#f0f3f8] group-hover:text-[#387ed1] transition-colors">
                              {pos.tradingsymbol}
                            </span>
                            <span className="text-[10px] text-[#58647a] font-mono">{pos.exchange}</span>
                          </div>
                        </td>
                        <td className={`py-2.5 px-3 text-right font-medium ${isLong ? 'text-[#387ed1]' : 'text-[#df514c]'}`}>
                          {isLong ? `+${pos.quantity}` : pos.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right text-[#c4cbd4]">
                          {avgPrice.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-[#f0f3f8] font-medium">
                          {pos.last_price.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-[#c4cbd4]">
                          {curVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className={`py-2.5 px-3 text-right font-semibold ${isProfit ? 'text-[#00c087]' : 'text-[#df514c]'}`}>
                          {isProfit ? '+' : ''}{pos.unrealized_pnl.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-sans">
                          <button
                            onClick={() => closePosition(pos.id)}
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
                <div className="text-xs text-[#788296] font-medium">
                  Total open positions: <span className="text-[#f0f3f8] font-bold">{openPositions.length}</span>
                </div>
                <div className="flex items-baseline gap-2 font-mono">
                  <span className="text-xs text-[#788296]">Total P&L:</span>
                  <span className={`text-base font-bold ${totalUnrealized >= 0 ? 'text-[#00c087]' : 'text-[#df514c]'}`}>
                    {totalUnrealized >= 0 ? '+' : ''}₹{totalUnrealized.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          )
        ) : closedPositions.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-sm font-medium text-[#788296]">No closed positions today</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1e2638] text-[#788296] text-[11px] font-medium">
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Instrument</th>
                  <th className="py-2.5 px-3 text-right">Buy Qty.</th>
                  <th className="py-2.5 px-3 text-right">Buy Price</th>
                  <th className="py-2.5 px-3 text-right">Sell Qty.</th>
                  <th className="py-2.5 px-3 text-right">Sell Price</th>
                  <th className="py-2.5 px-3 text-right">Realized P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2638]/60 font-mono">
                {closedPositions.map((pos) => {
                  const isProfit = pos.realized_pnl >= 0;
                  return (
                    <tr key={pos.id} className="hover:bg-[#121724] transition-colors">
                      <td className="py-2.5 px-3 font-sans">
                        <span className="text-[10px] bg-[#161d2c] border border-[#1e2638] text-[#788296] px-1.5 py-0.5 rounded font-mono font-medium">
                          {pos.product}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[#f0f3f8] font-sans">
                        {pos.tradingsymbol}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#c4cbd4]">{pos.buy_quantity}</td>
                      <td className="py-2.5 px-3 text-right text-[#c4cbd4]">₹{pos.buy_price.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right text-[#c4cbd4]">{pos.sell_quantity}</td>
                      <td className="py-2.5 px-3 text-right text-[#c4cbd4]">₹{pos.sell_price.toFixed(2)}</td>
                      <td className={`py-2.5 px-3 text-right font-semibold ${isProfit ? 'text-[#00c087]' : 'text-[#df514c]'}`}>
                        {isProfit ? '+' : ''}₹{pos.realized_pnl.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Closed P&L Total */}
            <div className="flex items-center justify-between py-3 px-3 mt-4 border-t border-b border-[#1e2638] bg-[#0c1018]">
              <div className="text-xs text-[#788296] font-medium">
                Total closed trades: <span className="text-[#f0f3f8] font-bold">{closedPositions.length}</span>
              </div>
              <div className="flex items-baseline gap-2 font-mono">
                <span className="text-xs text-[#788296]">Total Realized P&L:</span>
                <span className={`text-base font-bold ${totalRealized >= 0 ? 'text-[#00c087]' : 'text-[#df514c]'}`}>
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
