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
    <div className="w-full max-w-full mx-auto select-none font-sans text-[#111114] pb-12">
      {/* ── 1. Top Header Strip ─────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#D9E2F2]">
        {/* Title + Sub-tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#00225A] flex items-center gap-2.5">
            <span>Order Book</span>
            <span className="text-xs font-mono font-medium text-[#6B7A90] px-2 py-0.5 rounded-md bg-[#EEF3FF] border border-[#D9E2F2] tabular-nums font-bold">
              {orders.length} orders
            </span>
          </h1>

          {/* Segmented Control for Order Filters */}
          <div className="bg-[#F7F8FA] border border-[#D9E2F2] p-1 rounded-xl inline-flex gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('OPEN')}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'OPEN'
                  ? 'bg-white text-[#00225A] font-bold shadow-sm border border-[#D9E2F2]'
                  : 'text-[#6B7A90] hover:text-[#00225A]'
              }`}
            >
              <span>Open</span>
              <span className="text-[10px] font-mono tabular-nums opacity-80">({openOrdersCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('EXECUTED')}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'EXECUTED'
                  ? 'bg-white text-[#00225A] font-bold shadow-sm border border-[#D9E2F2]'
                  : 'text-[#6B7A90] hover:text-[#00225A]'
              }`}
            >
              <span>Executed</span>
              <span className="text-[10px] font-mono tabular-nums opacity-80">({executedOrdersCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('CANCELLED')}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'CANCELLED'
                  ? 'bg-white text-[#00225A] font-bold shadow-sm border border-[#D9E2F2]'
                  : 'text-[#6B7A90] hover:text-[#00225A]'
              }`}
            >
              <span>Cancelled</span>
              <span className="text-[10px] font-mono tabular-nums opacity-80">({cancelledOrdersCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('ALL')}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'ALL'
                  ? 'bg-white text-[#00225A] font-bold shadow-sm border border-[#D9E2F2]'
                  : 'text-[#6B7A90] hover:text-[#00225A]'
              }`}
            >
              <span>All</span>
              <span className="text-[10px] font-mono tabular-nums opacity-80">({orders.length})</span>
            </button>
          </div>
        </div>

        {/* Right Search & Download Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl focus-within:border-[#00225A] w-48 sm:w-64 transition-all">
            <Search className="w-3.5 h-3.5 text-[#6B7A90]" />
            <input
              type="text"
              placeholder="Search symbol, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-[#111114] placeholder-[#6B7A90] focus:outline-none w-full font-sans"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="btn-secondary px-3.5 py-1.5 text-xs rounded-xl transition-all active:scale-[0.96] flex items-center gap-1.5 font-semibold text-[#00225A] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#00225A]" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* ── 2. Orders Table ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)] overflow-hidden mt-5">
        {filteredOrders.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#EEF3FF] border border-[#D9E2F2] flex items-center justify-center text-[#536CF0] mb-3 shadow-sm">
              <Layers className="w-6 h-6" />
            </div>
            <p className="font-display text-base font-bold text-[#00225A]">No orders match the current filter</p>
            <p className="text-xs text-[#6B7A90] mt-1.5 max-w-md mx-auto">
              {activeTab === 'OPEN'
                ? 'You do not have any pending limit or trigger orders.'
                : 'No historical orders recorded under this view.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F7F8FA] border-b border-[#D9E2F2] text-[#6B7A90] text-[10px] uppercase font-mono tracking-wider">
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
              <tbody className="divide-y divide-[#D9E2F2] font-mono">
                {filteredOrders.map((order) => {
                  const isBuy = order.transaction_type === 'BUY';
                  return (
                    <tr key={order.id} className="hover:bg-[#F7F8FA] transition-colors group">
                      <td className="py-3 px-4 text-[#6B7A90] tabular-nums">
                        {new Date(order.created_at).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                          isBuy
                            ? 'bg-[#12B76A]/10 text-[#12B76A] border border-[#12B76A]/30'
                            : 'bg-[#D92D20]/10 text-[#D92D20] border border-[#D92D20]/30'
                        }`}>
                          {order.transaction_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-[#00225A] group-hover:text-[#536CF0] transition-colors">
                            {order.tradingsymbol}
                          </span>
                          <span className="text-[10px] text-[#6B7A90] font-mono px-1.5 py-0.5 rounded bg-[#EEF3FF] border border-[#D9E2F2]">{order.exchange}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span className="text-[10px] bg-[#EEF3FF] border border-[#D9E2F2] text-[#00225A] px-2 py-0.5 rounded-full font-mono font-bold">
                          {order.product}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-[#111114] font-semibold tabular-nums">
                        {order.filled_quantity}/{order.quantity}
                      </td>
                      <td className="py-3 px-4 text-right text-[#6B7A90] tabular-nums">
                        {order.order_type === 'MARKET' ? (
                          <span className="text-[#00225A] font-bold">MKT</span>
                        ) : (
                          <span className="font-semibold text-[#111114]">₹{order.price.toFixed(2)}</span>
                        )}
                        {order.trigger_price > 0 && (
                          <span className="text-[10px] text-[#6B7A90] ml-1">
                            (Trig ₹{order.trigger_price.toFixed(2)})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-[#111114] font-semibold tabular-nums">
                        {order.average_price > 0 ? `₹${order.average_price.toFixed(2)}` : '—'}
                      </td>
                      <td className="py-3 px-4 font-sans">
                        {order.status === 'COMPLETED' && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#12B76A] px-2 py-0.5 rounded-full bg-[#12B76A]/10 border border-[#12B76A]/30">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>COMPLETE</span>
                          </span>
                        )}
                        {order.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#00225A] px-2 py-0.5 rounded-full bg-[#EEF3FF] border border-[#D9E2F2] animate-pulse">
                            <Clock className="w-3.5 h-3.5 text-[#536CF0]" />
                            <span>OPEN</span>
                          </span>
                        )}
                        {order.status === 'CANCELLED' && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#6B7A90] px-2 py-0.5 rounded-full bg-[#F7F8FA] border border-[#D9E2F2]">
                            <Ban className="w-3.5 h-3.5" />
                            <span>CANCELLED</span>
                          </span>
                        )}
                        {order.status === 'REJECTED' && (
                          <div>
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#D92D20] px-2 py-0.5 rounded-full bg-[#FEE4E2] border border-[#FECDCA]">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>REJECTED</span>
                            </span>
                            {order.rejection_reason && (
                              <p className="text-[10px] text-[#D92D20] truncate max-w-[140px] mt-0.5 font-mono">
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
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#D92D20] bg-[#FEE4E2] hover:bg-[#D92D20] hover:text-white border border-[#FECDCA] transition-all active:scale-[0.95] cursor-pointer"
                          >
                            Cancel
                          </button>
                        ) : (
                          <span className="text-[#6B7A90] text-[11px]">—</span>
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
