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
    <div className="w-full max-w-[1720px] mx-auto select-none font-sans text-[#F5F5F2] pb-12">
      {/* ── 1. Top Cendrix Capital Header Strip with Tabs ────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#14223A]">
        {/* Title + Sub-tabs */}
        <div className="flex items-center gap-6">
          <h1 className="font-serif text-2xl font-bold tracking-wide text-[#F5F5F2] flex items-center gap-2.5">
            <span>Order Book</span>
            <span className="text-xs font-mono font-normal text-[#A1A8B3]">
              ({orders.length} total)
            </span>
          </h1>

          <div className="flex items-center gap-4 text-xs font-medium">
            <button
              onClick={() => setActiveTab('OPEN')}
              className={`pb-1.5 border-b-2 transition-all ${
                activeTab === 'OPEN'
                  ? 'border-[#C6A15B] text-[#C6A15B] font-bold shadow-[0_1px_8px_rgba(198,161,91,0.25)]'
                  : 'border-transparent text-[#A1A8B3] hover:text-[#F5F5F2]'
              }`}
            >
              Open ({openOrdersCount})
            </button>
            <button
              onClick={() => setActiveTab('EXECUTED')}
              className={`pb-1.5 border-b-2 transition-all ${
                activeTab === 'EXECUTED'
                  ? 'border-[#C6A15B] text-[#C6A15B] font-bold shadow-[0_1px_8px_rgba(198,161,91,0.25)]'
                  : 'border-transparent text-[#A1A8B3] hover:text-[#F5F5F2]'
              }`}
            >
              Executed ({executedOrdersCount})
            </button>
            <button
              onClick={() => setActiveTab('CANCELLED')}
              className={`pb-1.5 border-b-2 transition-all ${
                activeTab === 'CANCELLED'
                  ? 'border-[#C6A15B] text-[#C6A15B] font-bold shadow-[0_1px_8px_rgba(198,161,91,0.25)]'
                  : 'border-transparent text-[#A1A8B3] hover:text-[#F5F5F2]'
              }`}
            >
              Cancelled / Rejected ({cancelledOrdersCount})
            </button>
            <button
              onClick={() => setActiveTab('ALL')}
              className={`pb-1.5 border-b-2 transition-all ${
                activeTab === 'ALL'
                  ? 'border-[#C6A15B] text-[#C6A15B] font-bold shadow-[0_1px_8px_rgba(198,161,91,0.25)]'
                  : 'border-transparent text-[#A1A8B3] hover:text-[#F5F5F2]'
              }`}
            >
              All ({orders.length})
            </button>
          </div>
        </div>

        {/* Right Search & Download Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0B1424] border border-[#14223A] rounded-lg focus-within:border-[#C6A15B] w-48 sm:w-64 transition-all">
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
            className="btn-cendrix-outline px-3.5 py-1.5 text-xs rounded-lg transition-all flex items-center gap-1.5 font-semibold"
          >
            <Download className="w-3.5 h-3.5 text-[#C6A15B]" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* ── 2. Orders Table ───────────────────── */}
      <div className="cendrix-card p-5 rounded-xl border border-[rgba(198,161,91,0.2)] mt-5">
        {filteredOrders.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-[#0F192B] border border-[rgba(198,161,91,0.25)] flex items-center justify-center text-[#C6A15B] mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <p className="font-serif text-base font-bold text-[#F5F5F2]">No orders match the current filter</p>
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
                <tr className="border-b border-[#14223A] text-[#6E7683] text-[10px] uppercase font-mono tracking-wider">
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Instrument</th>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3 text-right">Qty.</th>
                  <th className="py-2.5 px-3 text-right">Price</th>
                  <th className="py-2.5 px-3 text-right">Avg. price</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#14223A]/50 font-mono">
                {filteredOrders.map((order) => {
                  const isBuy = order.transaction_type === 'BUY';
                  return (
                    <tr key={order.id} className="hover:bg-[#14223A]/40 transition-colors group">
                      <td className="py-2.5 px-3 text-[#A1A8B3]">
                        {new Date(order.created_at).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isBuy
                            ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                            : 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
                        }`}>
                          {order.transaction_type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#F5F5F2] group-hover:text-[#C6A15B] transition-colors">
                            {order.tradingsymbol}
                          </span>
                          <span className="text-[10px] text-[#A1A8B3] font-mono">{order.exchange}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className="text-[10px] bg-[#0F192B] border border-[rgba(198,161,91,0.25)] text-[#C6A15B] px-1.5 py-0.5 rounded font-mono font-bold">
                          {order.product}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#F5F5F2] font-semibold">
                        {order.filled_quantity}/{order.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#A1A8B3]">
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
                      <td className="py-2.5 px-3 text-right text-[#F5F5F2] font-semibold">
                        {order.average_price > 0 ? `₹${order.average_price.toFixed(2)}` : '—'}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        {order.status === 'COMPLETED' && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-[#10B981]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>COMPLETE</span>
                          </span>
                        )}
                        {order.status === 'PENDING' && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-[#C6A15B] animate-pulse">
                            <Clock className="w-3.5 h-3.5" />
                            <span>OPEN</span>
                          </span>
                        )}
                        {order.status === 'CANCELLED' && (
                          <span className="flex items-center gap-1 text-[11px] font-medium text-[#A1A8B3]">
                            <Ban className="w-3.5 h-3.5" />
                            <span>CANCELLED</span>
                          </span>
                        )}
                        {order.status === 'REJECTED' && (
                          <div>
                            <span className="flex items-center gap-1 text-[11px] font-bold text-[#EF4444]">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>REJECTED</span>
                            </span>
                            {order.rejection_reason && (
                              <p className="text-[10px] text-[#EF4444]/80 truncate max-w-[140px]">
                                {order.rejection_reason}
                              </p>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-sans">
                        {order.status === 'PENDING' ? (
                          <button
                            onClick={() => cancelOrder(order.id)}
                            className="px-2.5 py-1 rounded-md text-[11px] font-bold text-[#EF4444] bg-[#EF4444]/15 hover:bg-[#EF4444] hover:text-white border border-[#EF4444]/30 transition-all"
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
