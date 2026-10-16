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
    <div className="w-full max-w-[1720px] mx-auto select-none font-sans text-[#f0f3f8] pb-12">
      {/* ── 1. Top Zerodha Header Strip with Tabs ────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1e2638]">
        {/* Title + Sub-tabs */}
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-medium tracking-tight text-[#f0f3f8] flex items-center gap-2">
            <span>Orders</span>
            <span className="text-xs font-mono font-normal text-[#788296]">
              ({orders.length})
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
              Open ({openOrdersCount})
            </button>
            <button
              onClick={() => setActiveTab('EXECUTED')}
              className={`pb-1 border-b-2 transition-all ${
                activeTab === 'EXECUTED'
                  ? 'border-[#387ed1] text-[#387ed1] font-semibold'
                  : 'border-transparent text-[#788296] hover:text-[#c4cbd4]'
              }`}
            >
              Executed ({executedOrdersCount})
            </button>
            <button
              onClick={() => setActiveTab('CANCELLED')}
              className={`pb-1 border-b-2 transition-all ${
                activeTab === 'CANCELLED'
                  ? 'border-[#387ed1] text-[#387ed1] font-semibold'
                  : 'border-transparent text-[#788296] hover:text-[#c4cbd4]'
              }`}
            >
              Cancelled / Rejected ({cancelledOrdersCount})
            </button>
            <button
              onClick={() => setActiveTab('ALL')}
              className={`pb-1 border-b-2 transition-all ${
                activeTab === 'ALL'
                  ? 'border-[#387ed1] text-[#387ed1] font-semibold'
                  : 'border-transparent text-[#788296] hover:text-[#c4cbd4]'
              }`}
            >
              All ({orders.length})
            </button>
          </div>
        </div>

        {/* Right Search & Download Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 bg-[#121722] border border-[#1e2638] rounded focus-within:border-[#387ed1] w-48 sm:w-64 transition-colors">
            <Search className="w-3.5 h-3.5 text-[#58647a]" />
            <input
              type="text"
              placeholder="Search symbol, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-[#f0f3f8] placeholder-[#58647a] focus:outline-none w-full"
            />
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

      {/* ── 2. Full-Width Orders Table (No Outer Boxes) ───────────────────── */}
      <div className="mt-2">
        {filteredOrders.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#151b28] border border-[#1e2638] flex items-center justify-center text-[#788296] mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-[#c4cbd4]">No orders found</p>
            <p className="text-xs text-[#58647a] mt-1">
              {activeTab === 'OPEN'
                ? 'You do not have any pending limit or trigger orders.'
                : 'No orders match your current filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1e2638] text-[#788296] text-[11px] font-medium">
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
              <tbody className="divide-y divide-[#1e2638]/60 font-mono">
                {filteredOrders.map((order) => {
                  const isBuy = order.transaction_type === 'BUY';
                  return (
                    <tr key={order.id} className="hover:bg-[#121724] transition-colors group">
                      <td className="py-2.5 px-3 text-[#788296]">
                        {new Date(order.created_at).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isBuy
                            ? 'bg-[#387ed1]/15 text-[#387ed1] border border-[#387ed1]/30'
                            : 'bg-[#df514c]/15 text-[#df514c] border border-[#df514c]/30'
                        }`}>
                          {order.transaction_type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-[#f0f3f8] group-hover:text-[#387ed1] transition-colors">
                            {order.tradingsymbol}
                          </span>
                          <span className="text-[10px] text-[#58647a] font-mono">{order.exchange}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className="text-[10px] bg-[#161d2c] border border-[#1e2638] text-[#788296] px-1.5 py-0.5 rounded font-mono font-medium">
                          {order.product}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#c4cbd4]">
                        {order.filled_quantity}/{order.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#788296]">
                        {order.order_type === 'MARKET' ? (
                          <span>MKT</span>
                        ) : (
                          <span>₹{order.price.toFixed(2)}</span>
                        )}
                        {order.trigger_price > 0 && (
                          <span className="text-[10px] text-[#58647a] ml-1">
                            (Trig ₹{order.trigger_price.toFixed(2)})
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#f0f3f8] font-medium">
                        {order.average_price > 0 ? `₹${order.average_price.toFixed(2)}` : '—'}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        {order.status === 'COMPLETED' && (
                          <span className="flex items-center gap-1 text-[11px] font-medium text-[#00c087]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>COMPLETE</span>
                          </span>
                        )}
                        {order.status === 'PENDING' && (
                          <span className="flex items-center gap-1 text-[11px] font-medium text-[#387ed1] animate-pulse">
                            <Clock className="w-3.5 h-3.5" />
                            <span>OPEN</span>
                          </span>
                        )}
                        {order.status === 'CANCELLED' && (
                          <span className="flex items-center gap-1 text-[11px] font-medium text-[#788296]">
                            <Ban className="w-3.5 h-3.5" />
                            <span>CANCELLED</span>
                          </span>
                        )}
                        {order.status === 'REJECTED' && (
                          <div>
                            <span className="flex items-center gap-1 text-[11px] font-medium text-[#df514c]">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>REJECTED</span>
                            </span>
                            {order.rejection_reason && (
                              <p className="text-[10px] text-[#df514c]/80 truncate max-w-[140px]">
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
                            className="px-2 py-0.5 rounded text-[11px] font-medium text-[#df514c] hover:bg-[#df514c] hover:text-white border border-[#df514c]/30 transition-colors"
                          >
                            Cancel
                          </button>
                        ) : (
                          <span className="text-[#58647a] text-[11px]">—</span>
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
