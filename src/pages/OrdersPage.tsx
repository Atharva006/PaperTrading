import React, { useState } from 'react';
import { useTradingStore } from '../store/useTradingStore';
import type { OrderStatus } from '../types/trading';
import { Clock, Search, Download, XCircle, CheckCircle2, AlertCircle, Ban } from 'lucide-react';

export default function OrdersPage() {
  const { orders, cancelOrder } = useTradingStore();
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter((o) => {
    const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchSearch =
      !searchQuery ||
      o.tradingsymbol.toUpperCase().includes(searchQuery.toUpperCase()) ||
      o.order_id.toUpperCase().includes(searchQuery.toUpperCase());
    return matchStatus && matchSearch;
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
    link.setAttribute('download', `cnrx_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto select-none">
      {/* ── Page Header & Tabs ─────────────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-[#0E1728]/95 border border-[#C6A15B]/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold font-serif text-white tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#C6A15B]" />
            <span>Order Book</span>
          </h2>
          <p className="text-xs text-[#8F9BAE] mt-0.5">
            Real-time simulated order book with limit and trigger order tracking · CNRX
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-[#0B1424] p-1 rounded-xl border border-[#1F2D48] overflow-x-auto scrollbar-hide">
          {(['ALL', 'PENDING', 'COMPLETED', 'CANCELLED', 'REJECTED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === s
                  ? 'bg-gradient-to-r from-[#C6A15B] to-[#E2C889] text-[#0B1424] font-bold shadow-md'
                  : 'text-[#8F9BAE] hover:text-white'
              }`}
            >
              {s === 'ALL' ? 'All Orders' : s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Search & Actions Bar ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-[#0B1424] border border-[#1F2D48] rounded-xl flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8F9BAE]" />
          <input
            type="text"
            className="flex-1 bg-transparent text-xs text-white placeholder-[#8F9BAE] focus:outline-none"
            placeholder="Search order ID or symbol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 rounded-xl bg-[#14223A] hover:bg-[#1C2E4C] border border-[#C6A15B]/20 text-xs font-semibold text-[#C6A15B] hover:text-white flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Orders CSV</span>
        </button>
      </div>

      {/* ── Orders Table ───────────────────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-[#0E1728]/95 border border-[#C6A15B]/20 shadow-xl backdrop-blur-md">
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#8F9BAE]">
            No orders found matching the filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1F2D48] text-[#8F9BAE] text-[10px] uppercase font-semibold">
                  <th className="py-3 px-3">Order ID / Time</th>
                  <th className="py-3 px-3">Side</th>
                  <th className="py-3 px-3">Instrument</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Quantity</th>
                  <th className="py-3 px-3">Limit / Trigger</th>
                  <th className="py-3 px-3">Avg Fill</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2D48]/60 font-mono">
                {filteredOrders.map((order) => {
                  return (
                    <tr key={order.id} className="hover:bg-[#14223A]/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{order.order_id}</div>
                        <div className="text-[10px] text-[#8F9BAE] font-sans">
                          {new Date(order.created_at).toLocaleTimeString('en-IN')}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${order.transaction_type === 'BUY' ? 'bg-[#38BDF8]/20 text-[#7DD3FC]' : 'bg-[#F43F5E]/20 text-[#FDA4AF]'}`}>
                          {order.transaction_type}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-white">
                        <div className="flex items-center gap-1.5">
                          <span>{order.tradingsymbol}</span>
                          <span className="text-[10px] text-[#8F9BAE] font-normal">{order.exchange}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[#A1A8B3] font-sans">{order.order_type}</td>
                      <td className="py-3 px-3 text-[#A1A8B3] font-sans">
                        <span className="text-[10px] bg-[#14223A] border border-[#1F2D48] text-[#E2C889] px-1.5 py-0.5 rounded font-bold">
                          {order.product}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-white">
                        {order.filled_quantity}/{order.quantity}
                      </td>
                      <td className="py-3 px-3 text-[#A1A8B3]">
                        {order.price > 0 ? `₹${order.price.toFixed(2)}` : 'MKT'}
                        {order.trigger_price > 0 ? ` (Trig ₹${order.trigger_price.toFixed(2)})` : ''}
                      </td>
                      <td className="py-3 px-3 font-bold text-white">
                        {order.average_price > 0 ? `₹${order.average_price.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-3 px-3 font-sans">
                        {order.status === 'COMPLETED' && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-[#10B981]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Executed</span>
                          </span>
                        )}
                        {order.status === 'PENDING' && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-[#38BDF8] animate-pulse">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Pending</span>
                          </span>
                        )}
                        {order.status === 'CANCELLED' && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-[#8F9BAE]">
                            <Ban className="w-3.5 h-3.5" />
                            <span>Cancelled</span>
                          </span>
                        )}
                        {order.status === 'REJECTED' && (
                          <div>
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-[#F43F5E]">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Rejected</span>
                            </span>
                            {order.rejection_reason && (
                              <p className="text-[10px] text-[#FDA4AF] truncate max-w-[150px]">
                                {order.rejection_reason}
                              </p>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-sans">
                        {order.status === 'PENDING' ? (
                          <button
                            onClick={() => cancelOrder(order.id)}
                            className="px-2.5 py-1 rounded-lg bg-[#F43F5E]/20 hover:bg-[#F43F5E] text-[#FDA4AF] hover:text-white text-[11px] font-bold transition-colors"
                          >
                            Cancel
                          </button>
                        ) : (
                          <span className="text-[#8F9BAE] text-[11px]">-</span>
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
