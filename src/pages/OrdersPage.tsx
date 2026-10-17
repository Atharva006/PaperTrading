import React, { useState } from 'react';
import { useTradingStore } from '../store/useTradingStore';
import type { OrderStatus } from '../types/trading';
import { Search, Download, Clock, CheckCircle2, AlertCircle, Ban, Layers } from 'lucide-react';

export default function OrdersPage() {
  const { orders, cancelOrder } = useTradingStore();
  const [activeTab, setActiveTab] = useState<'OPEN' | 'EXECUTED' | 'CANCELLED' | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const openOrdersCount = orders.filter((o) => o.status === 'PENDING').length;
  const executedOrdersCount = orders.filter((o) => o.status === 'COMPLETED').length;
  const cancelledOrdersCount = orders.filter((o) => o.status === 'CANCELLED' || o.status === 'REJECTED').length;

  const filteredOrders = orders.filter((o) => {
    let matchTab = true;
    if (activeTab === 'OPEN') matchTab = o.status === 'PENDING';
    else if (activeTab === 'EXECUTED') matchTab = o.status === 'COMPLETED';
    else if (activeTab === 'CANCELLED') matchTab = o.status === 'CANCELLED' || o.status === 'REJECTED';

    const matchSearch =
      !searchQuery ||
      o.tradingsymbol.toUpperCase().includes(searchQuery.toUpperCase()) ||
      o.order_id.toUpperCase().includes(searchQuery.toUpperCase());

    return matchTab && matchSearch;
  });

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) return;
    const headers = ['Order ID', 'Time', 'Instrument', 'Exchange', 'Side', 'Type', 'Product', 'Quantity', 'Price', 'Avg Price', 'Status', 'Rejection Reason'];
    const rows = filteredOrders.map(o => [
      o.order_id,
      o.created_at,
      o.tradingsymbol,
      o.exchange,
      o.transaction_type,
      o.order_type,
      o.product,
      o.quantity,
      o.price,
      o.average_price,
      o.status,
      o.rejection_reason || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `cnrx_orders_${activeTab.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-full mx-auto select-none font-sans text-[#F5F5F2] pb-12">
      {/* ── 1. Top Cendrix Capital Header Strip with Apple Segmented Control ────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        {/* Title + Sub-tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <h1 className="font-serif text-2xl font-bold tracking-tight text-[#F5F5F2] flex items-center gap-2.5">
            <span>Order Book</span>
            <span className="text-xs font-mono font-medium text-[#A1A8B3] px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] tabular-nums">
              {orders.length} orders
            </span>
          </h1>

          {/* Apple Segmented Control for Order Filters */}
          <div className="apple-segmented-group p-1 rounded-xl inline-flex gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('OPEN')}
              className={`apple-segmented-item text-xs font-medium px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'OPEN' ? 'apple-segmented-item-active text-[#C6A15B] font-semibold shadow-sm' : 'text-[#A1A8B3] hover:text-[#F5F5F2]'
              }`}
            >
              <span>Open</span>
              <span className="text-[10px] font-mono tabular-nums opacity-80">({openOrdersCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('EXECUTED')}
              className={`apple-segmented-item text-xs font-medium px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'EXECUTED' ? 'apple-segmented-item-active text-[#C6A15B] font-semibold shadow-sm' : 'text-[#A1A8B3] hover:text-[#F5F5F2]'
              }`}
            >
              <span>Executed</span>
              <span className="text-[10px] font-mono tabular-nums opacity-80">({executedOrdersCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('CANCELLED')}
              className={`apple-segmented-item text-xs font-medium px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'CANCELLED' ? 'apple-segmented-item-active text-[#C6A15B] font-semibold shadow-sm' : 'text-[#A1A8B3] hover:text-[#F5F5F2]'
              }`}
            >
              <span>Cancelled</span>
              <span className="text-[10px] font-mono tabular-nums opacity-80">({cancelledOrdersCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('ALL')}
              className={`apple-segmented-item text-xs font-medium px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'ALL' ? 'apple-segmented-item-active text-[#C6A15B] font-semibold shadow-sm' : 'text-[#A1A8B3] hover:text-[#F5F5F2]'
              }`}
            >
              <span>All</span>
              <span className="text-[10px] font-mono tabular-nums opacity-80">({orders.length})</span>
            </button>
          </div>
        </div>

        {/* Right Search & Download Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded-xl focus-within:border-[#C6A15B]/60 focus-within:ring-2 focus-within:ring-[#C6A15B]/15 w-48 sm:w-64 transition-all">
            <Search className="w-3.5 h-3.5 text-[#A1A8B3]" />
            <input
              type="text"
              placeholder="Search symbol, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-[#F5F5F2] placeholder-[#6E7683] focus:outline-none w-full"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="apple-segmented-item px-3.5 py-1.5 text-xs rounded-xl transition-all active:scale-[0.96] flex items-center gap-1.5 font-semibold text-[#F5F5F2] hover:text-[#C6A15B] border border-white/[0.08]"
          >
            <Download className="w-3.5 h-3.5 text-[#C6A15B]" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* ── 2. Orders Table in Apple Glass Panel ───────────────────── */}
      <div className="apple-glass-panel rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] overflow-hidden mt-5">
        {filteredOrders.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#C6A15B] mb-3 shadow-inner">
              <Layers className="w-6 h-6" />
            </div>
            <p className="font-serif text-base font-bold text-[#F5F5F2] tracking-tight">No orders match the current filter</p>
            <p className="text-xs text-[#A1A8B3] mt-1.5 max-w-md mx-auto">
              {activeTab === 'OPEN'
                ? 'You do not have any pending limit or trigger orders.'
                : 'No historical orders recorded under this view.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/[0.06] text-[#A1A8B3] text-[10px] uppercase font-mono tracking-wider">
                  <th className="py-3 px-4 font-semibold">Time</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Instrument</th>
                  <th className="py-3 px-4 font-semibold">Product</th>
                  <th className="py-3 px-4 font-semibold text-right">Qty.</th>
                  <th className="py-3 px-4 font-semibold text-right">Price</th>
                  <th className="py-3 px-4 font-semibold text-right">Avg. price</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] font-mono">
                {filteredOrders.map((order) => {
                  const isBuy = order.transaction_type === 'BUY';
                  return (
                    <tr key={order.id} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="py-3 px-4 text-[#A1A8B3] tabular-nums">
                        {new Date(order.created_at).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider ${
                          isBuy
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}>
                          {order.transaction_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-[#F5F5F2] group-hover:text-[#C6A15B] transition-colors">
                            {order.tradingsymbol}
                          </span>
                          <span className="text-[10px] text-[#A1A8B3] font-mono px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.06]">{order.exchange}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span className="text-[10px] bg-white/[0.04] border border-white/[0.08] text-[#C6A15B] px-2 py-0.5 rounded-md font-mono font-semibold">
                          {order.product}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-[#F5F5F2] font-semibold tabular-nums">
                        {order.filled_quantity}/{order.quantity}
                      </td>
                      <td className="py-3 px-4 text-right text-[#A1A8B3] tabular-nums">
                        {order.order_type === 'MARKET' ? (
                          <span className="text-[#C6A15B] font-bold">MKT</span>
                        ) : (
                          <span>₹{order.price.toFixed(2)}</span>
                        )}
                        {order.trigger_price > 0 && (
                          <span className="text-[10px] text-[#A1A8B3] ml-1">
                            (Trig ₹{order.trigger_price.toFixed(2)})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-[#F5F5F2] font-semibold tabular-nums">
                        {order.average_price > 0 ? `₹${order.average_price.toFixed(2)}` : '—'}
                      </td>
                      <td className="py-3 px-4 font-sans">
                        {order.status === 'COMPLETED' && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>COMPLETE</span>
                          </span>
                        )}
                        {order.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#C6A15B] px-2 py-0.5 rounded-md bg-[#C6A15B]/10 border border-[#C6A15B]/20 animate-pulse">
                            <Clock className="w-3.5 h-3.5" />
                            <span>OPEN</span>
                          </span>
                        )}
                        {order.status === 'CANCELLED' && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#A1A8B3] px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06]">
                            <Ban className="w-3.5 h-3.5" />
                            <span>CANCELLED</span>
                          </span>
                        )}
                        {order.status === 'REJECTED' && (
                          <div>
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-400 px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>REJECTED</span>
                            </span>
                            {order.rejection_reason && (
                              <p className="text-[10px] text-rose-400/80 truncate max-w-[140px] mt-0.5 font-mono">
                                {order.rejection_reason}
                              </p>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-sans">
                        {order.status === 'PENDING' ? (
                          <button
                            onClick={() => cancelOrder(order.id)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-400 bg-rose-500/15 hover:bg-rose-500 hover:text-white border border-rose-500/30 transition-all active:scale-[0.95]"
                          >
                            Cancel
                          </button>
                        ) : (
                          <span className="text-[#6E7683] text-[11px]">—</span>
                        )}
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
