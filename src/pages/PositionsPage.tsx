import React, { useState } from 'react';
import { useTradingStore } from '../store/useTradingStore';
import { 
  Briefcase, TrendingUp, TrendingDown, XCircle, Download, CheckCircle2, AlertTriangle 
} from 'lucide-react';

export default function PositionsPage() {
  const { positions, closePosition, closeAllPositions, quotes } = useTradingStore();
  const [activeTab, setActiveTab] = useState<'OPEN' | 'CLOSED'>('OPEN');
  const [isClosingAll, setIsClosingAll] = useState(false);

  const openPositions = positions.filter((p) => !p.is_closed && p.quantity !== 0);
  const closedPositions = positions.filter((p) => p.is_closed || p.quantity === 0);

  const totalUnrealized = openPositions.reduce((s, p) => s + p.unrealized_pnl, 0);
  const totalRealized = positions.reduce((s, p) => s + p.realized_pnl, 0);
  const totalMarginLocked = openPositions.reduce((s, p) => s + p.margin_required, 0);

  // CSV Export
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
    <div className="space-y-6 pb-12 max-w-7xl mx-auto select-none">
      {/* ── Summary Ribbon ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#0B1424]/90 border border-[#C6A15B]/15 shadow-md">
          <span className="text-[10px] text-[#8F9BAE] uppercase font-bold tracking-wider">Unrealized MTM P&L</span>
          <p className={`text-xl font-mono font-bold mt-1 ${totalUnrealized >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
            {totalUnrealized >= 0 ? '+' : ''}₹{totalUnrealized.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0B1424]/90 border border-[#C6A15B]/15 shadow-md">
          <span className="text-[10px] text-[#8F9BAE] uppercase font-bold tracking-wider">Total Realized P&L</span>
          <p className={`text-xl font-mono font-bold mt-1 ${totalRealized >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
            {totalRealized >= 0 ? '+' : ''}₹{totalRealized.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0B1424]/90 border border-[#C6A15B]/15 shadow-md">
          <span className="text-[10px] text-[#8F9BAE] uppercase font-bold tracking-wider">Margin Blocked in Positions</span>
          <p className="text-xl font-mono font-bold text-[#C6A15B] mt-1">
            ₹{totalMarginLocked.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0B1424]/90 border border-[#C6A15B]/15 shadow-md">
          <span className="text-[10px] text-[#8F9BAE] uppercase font-bold tracking-wider">Open Positions</span>
          <p className="text-xl font-mono font-bold text-white mt-1">
            {openPositions.length} active
          </p>
        </div>
      </div>

      {/* ── Controls, Tabs & Actions ────────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-[#0E1728]/95 border border-[#C6A15B]/20 shadow-xl space-y-4 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-[#0B1424] p-1 rounded-xl border border-[#1F2D48]">
            <button
              onClick={() => setActiveTab('OPEN')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'OPEN'
                  ? 'bg-gradient-to-r from-[#C6A15B] to-[#E2C889] text-[#0B1424] shadow-md'
                  : 'text-[#8F9BAE] hover:text-white'
              }`}
            >
              Open Positions ({openPositions.length})
            </button>
            <button
              onClick={() => setActiveTab('CLOSED')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'CLOSED'
                  ? 'bg-gradient-to-r from-[#C6A15B] to-[#E2C889] text-[#0B1424] shadow-md'
                  : 'text-[#8F9BAE] hover:text-white'
              }`}
            >
              Closed Positions ({closedPositions.length})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg bg-[#14223A] hover:bg-[#1C2E4C] border border-[#C6A15B]/20 text-xs font-semibold text-[#C6A15B] hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            {activeTab === 'OPEN' && openPositions.length > 0 && (
              <button
                onClick={handleCloseAll}
                disabled={isClosingAll}
                className="px-3 py-1.5 rounded-lg bg-[#F43F5E]/20 hover:bg-[#F43F5E] border border-[#F43F5E]/40 text-[#FDA4AF] hover:text-white text-xs font-bold transition-colors"
              >
                {isClosingAll ? 'Squaring Off...' : 'Square Off All'}
              </button>
            )}
          </div>
        </div>

        {/* ── Positions Table ────────────────────────────────────────────── */}
        {activeTab === 'OPEN' ? (
          openPositions.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#8F9BAE]">
              No open paper positions.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#1F2D48] text-[#8F9BAE] text-[10px] uppercase font-semibold">
                    <th className="py-3 px-3">Instrument</th>
                    <th className="py-3 px-3">Product</th>
                    <th className="py-3 px-3">Net Qty</th>
                    <th className="py-3 px-3">Avg Price</th>
                    <th className="py-3 px-3">LTP</th>
                    <th className="py-3 px-3">Margin Blocked</th>
                    <th className="py-3 px-3">Unrealized P&L</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F2D48]/60 font-mono">
                  {openPositions.map((pos) => {
                    const isLong = pos.quantity > 0;
                    const avgPrice = isLong ? pos.buy_price : pos.sell_price;

                    return (
                      <tr key={pos.id} className="hover:bg-[#14223A]/40 transition-colors">
                        <td className="py-3 px-3 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <span>{pos.tradingsymbol}</span>
                            <span className="text-[10px] text-[#8F9BAE] font-normal">{pos.exchange}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-[#A1A8B3] font-sans">
                          <span className="text-[10px] bg-[#14223A] border border-[#1F2D48] px-1.5 py-0.5 rounded font-bold text-[#E2C889]">
                            {pos.product}
                          </span>
                        </td>
                        <td className={`py-3 px-3 font-bold ${isLong ? 'text-[#38BDF8]' : 'text-[#F43F5E]'}`}>
                          {isLong ? `+${pos.quantity}` : pos.quantity}
                        </td>
                        <td className="py-3 px-3 text-white">₹{avgPrice.toFixed(2)}</td>
                        <td className="py-3 px-3 text-white font-bold">₹{pos.last_price.toFixed(2)}</td>
                        <td className="py-3 px-3 text-[#C6A15B]">
                          ₹{pos.margin_required.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </td>
                        <td className={`py-3 px-3 font-bold ${pos.unrealized_pnl >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                          {pos.unrealized_pnl >= 0 ? '+' : ''}₹{pos.unrealized_pnl.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => closePosition(pos.id)}
                            className="px-2.5 py-1 rounded-lg bg-[#F43F5E]/20 hover:bg-[#F43F5E] text-[#FDA4AF] hover:text-white text-[11px] font-bold transition-colors"
                          >
                            Exit (MKT)
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : closedPositions.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#8F9BAE]">
            No closed positions yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1F2D48] text-[#8F9BAE] text-[10px] uppercase font-semibold">
                  <th className="py-3 px-3">Instrument</th>
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Buy Qty</th>
                  <th className="py-3 px-3">Buy Price</th>
                  <th className="py-3 px-3">Sell Qty</th>
                  <th className="py-3 px-3">Sell Price</th>
                  <th className="py-3 px-3 text-right">Realized P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2D48]/60 font-mono">
                {closedPositions.map((pos) => (
                  <tr key={pos.id} className="hover:bg-[#14223A]/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-white">{pos.tradingsymbol}</td>
                    <td className="py-3 px-3 text-[#A1A8B3] font-sans">
                      <span className="text-[10px] bg-[#14223A] border border-[#1F2D48] px-1.5 py-0.5 rounded font-bold text-[#E2C889]">
                        {pos.product}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-white">{pos.buy_quantity}</td>
                    <td className="py-3 px-3 text-white">₹{pos.buy_price.toFixed(2)}</td>
                    <td className="py-3 px-3 text-white">{pos.sell_quantity}</td>
                    <td className="py-3 px-3 text-white">₹{pos.sell_price.toFixed(2)}</td>
                    <td className={`py-3 px-3 text-right font-bold ${pos.realized_pnl >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                      {pos.realized_pnl >= 0 ? '+' : ''}₹{pos.realized_pnl.toFixed(2)}
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
