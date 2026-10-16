import React, { useState } from 'react';
import { useTradingStore } from '../store/useTradingStore';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Briefcase,
  PieChart,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Clock,
  Layers3,
  ExternalLink,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function Dashboard() {
  const {
    account,
    userName,
    positions,
    holdings,
    trades,
    orders,
    cancelOrder,
    getMetrics,
    openOrderTicket,
    closePosition,
  } = useTradingStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'POSITIONS' | 'HOLDINGS' | 'ORDERS' | 'TRADES'>('POSITIONS');

  const metrics = getMetrics();
  const openPositions = positions.filter((p) => !p.is_closed && p.quantity !== 0);
  const pendingOrders = orders.filter((o) => o.status === 'PENDING');

  const fmt = (n?: number | null) =>
    (typeof n === 'number' && !isNaN(n) ? n : 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const holdingsValue = holdings.reduce((s, h) => s + h.current_value, 0);
  const holdingsInvestment = holdings.reduce((s, h) => s + h.invested_value, 0);
  const holdingsPnL = holdingsValue - holdingsInvestment;
  const holdingsPnLPct = holdingsInvestment > 0 ? (holdingsPnL / holdingsInvestment) * 100 : 0;

  const usedMargin = metrics.used_margin;
  const availableMargin = metrics.available_margin;

  return (
    <div className="space-y-6 pb-12 w-full max-w-[1440px] mx-auto select-none font-sans text-xs text-[#f0f3f8]">
      
      {/* ── 1. Clean Zerodha Greeting Header ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1e2638]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#f0f3f8]">
              Hi, {userName?.split(' ')[0] || 'Trader'}
            </h1>
            <span className="w-2 h-2 rounded-full bg-[#00c087] animate-pulse" title="System Live" />
          </div>
          <div className="text-[11px] text-[#5c687a] mt-0.5 font-mono">
            Account: <span className="text-[#9ca8ba]">{account?.account_number || 'IN-PT-LIVE001'}</span> · Institutional Paper Trading
          </div>
        </div>

        {/* Quick Action Pill Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => openOrderTicket()}
            className="px-3 py-1.5 rounded bg-[#387ed1] hover:bg-[#2e6bb5] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Place Order</span>
          </button>
          <button
            onClick={() => navigate('/dashboard/terminal')}
            className="px-3 py-1.5 rounded bg-[#141b27] hover:bg-[#1a2334] text-[#9ca8ba] hover:text-[#f0f3f8] border border-[#1e2638] font-semibold text-xs transition-colors"
          >
            Order Terminal
          </button>
          <button
            onClick={() => navigate('/dashboard/commodities')}
            className="px-3 py-1.5 rounded bg-[#141b27] hover:bg-[#1a2334] text-[#9ca8ba] hover:text-[#f0f3f8] border border-[#1e2638] font-semibold text-xs transition-colors"
          >
            MCX Commodities
          </button>
        </div>
      </div>

      {/* ── 2. Authentic Zerodha Kite Two-Column Financial Overview ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-2">
        
        {/* Left Column: Equity Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#1e2638]">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#387ed1]" />
              <h2 className="text-sm font-bold text-[#f0f3f8]">Equity</h2>
            </div>
            <Link
              to="/dashboard/portfolio"
              className="text-[11px] text-[#387ed1] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>View statement</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex items-baseline gap-3">
            <div>
              <span className="text-[10px] text-[#5c687a] uppercase font-mono font-semibold block">Available margin</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#f0f3f8] mt-0.5">
                ₹{fmt(availableMargin)}
              </div>
            </div>
          </div>

          {/* Flat 2-Column Metrics Grid (No Cards!) */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 font-mono text-xs pt-1 border-t border-[#171d2b]">
            <div className="flex justify-between py-1 border-b border-[#171d2b]/60">
              <span className="text-[#5c687a]">Margin used:</span>
              <span className="font-bold text-[#387ed1]">₹{fmt(usedMargin)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#171d2b]/60">
              <span className="text-[#5c687a]">Available cash:</span>
              <span className="font-bold text-[#f0f3f8]">₹{fmt(availableMargin)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#171d2b]/60">
              <span className="text-[#5c687a]">Opening balance:</span>
              <span className="text-[#9ca8ba]">₹{fmt(account?.initial_balance || 1000000)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#171d2b]/60">
              <span className="text-[#5c687a]">Realized P&L:</span>
              <span className={`font-bold ${metrics.realized_pnl >= 0 ? 'text-[#00c087]' : 'text-[#df514c]'}`}>
                {metrics.realized_pnl >= 0 ? '+' : ''}₹{fmt(metrics.realized_pnl)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#171d2b]/60">
              <span className="text-[#5c687a]">Unrealized MTM:</span>
              <span className={`font-bold ${metrics.unrealized_pnl >= 0 ? 'text-[#00c087]' : 'text-[#df514c]'}`}>
                {metrics.unrealized_pnl >= 0 ? '+' : ''}₹{fmt(metrics.unrealized_pnl)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#171d2b]/60">
              <span className="text-[#5c687a]">Total Charges Paid:</span>
              <span className="text-[#9ca8ba]">₹{fmt(metrics.total_brokerage_paid)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Holdings & Portfolio Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#00c087]" />
              <h2 className="text-sm font-bold text-[#f0f3f8]">
                Holdings & Positions ({holdings.length + openPositions.length})
              </h2>
            </div>
            <Link
              to="/dashboard/holdings"
              className="text-[11px] text-[#387ed1] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>View analytics</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex items-baseline gap-3">
            <div>
              <span className="text-[10px] text-[#5c687a] uppercase font-mono font-semibold block">Total P&L</span>
              <div
                className={`text-2xl sm:text-3xl font-extrabold font-mono mt-0.5 flex items-center gap-2 ${
                  metrics.overall_net_pnl >= 0 ? 'text-[#00c087]' : 'text-[#df514c]'
                }`}
              >
                <span>
                  {metrics.overall_net_pnl >= 0 ? '+' : ''}₹{fmt(metrics.overall_net_pnl)}
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded font-bold font-mono bg-[#141b27] border border-[#1e2638]">
                  {metrics.overall_return_percent >= 0 ? '+' : ''}{metrics.overall_return_percent.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Flat 2-Column Metrics Grid (No Cards!) */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 font-mono text-xs pt-1 border-t border-[#171d2b]">
            <div className="flex justify-between py-1 border-b border-[#171d2b]/60">
              <span className="text-[#5c687a]">Current value:</span>
              <span className="font-bold text-[#f0f3f8]">₹{fmt(metrics.account_equity)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#171d2b]/60">
              <span className="text-[#5c687a]">Investment:</span>
              <span className="text-[#9ca8ba]">₹{fmt(metrics.initial_capital)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#171d2b]/60">
              <span className="text-[#5c687a]">Open Positions:</span>
              <span className="font-bold text-[#f0f3f8]">{openPositions.length} active</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#171d2b]/60">
              <span className="text-[#5c687a]">Pending Orders:</span>
              <span className="font-bold text-[#387ed1]">{pendingOrders.length} pending</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#171d2b]/60">
              <span className="text-[#5c687a]">Completed Fills:</span>
              <span className="text-[#9ca8ba]">{trades.length} fills</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#171d2b]/60">
              <span className="text-[#5c687a]">Win Rate %:</span>
              <span className="font-bold text-[#00c087]">{metrics.win_rate}%</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── 3. Flat Tabbed Trading Desk (Authentic Zerodha Tables) ───────── */}
      <div className="pt-2">
        {/* Flat Horizontal Tabs */}
        <div className="flex items-center gap-6 border-b border-[#1e2638] text-xs font-semibold">
          {[
            { id: 'POSITIONS', label: `Positions (${openPositions.length})` },
            { id: 'HOLDINGS', label: `Holdings (${holdings.length})` },
            { id: 'ORDERS', label: `Open Orders (${pendingOrders.length})` },
            { id: 'TRADES', label: `Executed Trades (${trades.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2.5 transition-colors relative ${
                activeTab === tab.id
                  ? 'text-[#387ed1] font-bold border-b-2 border-[#387ed1]'
                  : 'text-[#9ca8ba] hover:text-[#f0f3f8]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Positions Table */}
        {activeTab === 'POSITIONS' && (
          <div className="mt-2">
            {openPositions.length === 0 ? (
              <div className="py-16 text-center text-[#5c687a] text-xs">
                You have no open positions.
                <div className="mt-1 text-[11px] text-[#387ed1]">
                  Search instruments in the MarketWatch on the left to place buy/sell orders.
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#1e2638] text-[10px] text-[#5c687a] uppercase tracking-wider font-mono">
                      <th className="py-2.5 px-3">Product</th>
                      <th className="py-2.5 px-3">Instrument</th>
                      <th className="py-2.5 px-3 text-right">Qty.</th>
                      <th className="py-2.5 px-3 text-right">Avg. Price</th>
                      <th className="py-2.5 px-3 text-right">LTP</th>
                      <th className="py-2.5 px-3 text-right">P&L (MTM)</th>
                      <th className="py-2.5 px-3 text-right">Chg. %</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#171d2b] font-mono">
                    {openPositions.map((pos) => {
                      const pnl = pos.unrealized_pnl || 0;
                      const isPos = pnl >= 0;
                      const avgPrice = pos.quantity > 0 ? pos.buy_price : pos.sell_price;
                      const ltp = pos.last_price || avgPrice;
                      const chgPct = avgPrice > 0 ? ((ltp - avgPrice) / avgPrice) * 100 : 0;

                      return (
                        <tr key={pos.id} className="hover:bg-[#121824] transition-colors">
                          <td className="py-2.5 px-3">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#141b27] text-[#387ed1] border border-[#1e2638]">
                              {pos.product}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-[#f0f3f8] font-sans">
                            {pos.tradingsymbol}
                            <span className="text-[10px] text-[#5c687a] ml-1.5 font-mono">{pos.exchange}</span>
                          </td>
                          <td className={`py-2.5 px-3 text-right font-bold ${pos.quantity > 0 ? 'text-[#00c087]' : 'text-[#df514c]'}`}>
                            {pos.quantity > 0 ? `+${pos.quantity}` : pos.quantity}
                          </td>
                          <td className="py-2.5 px-3 text-right text-[#9ca8ba]">₹{fmt(avgPrice)}</td>
                          <td className="py-2.5 px-3 text-right text-[#f0f3f8]">₹{fmt(ltp)}</td>
                          <td className={`py-2.5 px-3 text-right font-bold ${isPos ? 'text-[#00c087]' : 'text-[#df514c]'}`}>
                            {isPos ? '+' : ''}₹{fmt(pnl)}
                          </td>
                          <td className={`py-2.5 px-3 text-right ${isPos ? 'text-[#00c087]' : 'text-[#df514c]'}`}>
                            {isPos ? '+' : ''}{chgPct.toFixed(2)}%
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => closePosition(pos.id)}
                              className="px-2.5 py-1 rounded bg-[#df514c]/15 hover:bg-[#df514c] text-[#df514c] hover:text-white font-bold text-[11px] border border-[#df514c]/30 transition-colors"
                            >
                              Square Off
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Total P&L Footer Summary */}
                <div className="flex items-center justify-between py-3 px-3 border-t border-[#1e2638] font-mono text-xs">
                  <span className="text-[#5c687a] font-semibold uppercase">Total Open Positions P&L</span>
                  <span className={`text-base font-bold ${metrics.unrealized_pnl >= 0 ? 'text-[#00c087]' : 'text-[#df514c]'}`}>
                    {metrics.unrealized_pnl >= 0 ? '+' : ''}₹{fmt(metrics.unrealized_pnl)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Holdings Table */}
        {activeTab === 'HOLDINGS' && (
          <div className="mt-2">
            {holdings.length === 0 ? (
              <div className="py-16 text-center text-[#5c687a] text-xs">
                You have no equity holdings.
                <div className="mt-1 text-[11px] text-[#387ed1]">
                  Buy equity scrips with product CNC (Cash & Carry) to build long-term holdings.
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#1e2638] text-[10px] text-[#5c687a] uppercase tracking-wider font-mono">
                      <th className="py-2.5 px-3">Instrument</th>
                      <th className="py-2.5 px-3 text-right">Qty.</th>
                      <th className="py-2.5 px-3 text-right">Avg. Price</th>
                      <th className="py-2.5 px-3 text-right">LTP</th>
                      <th className="py-2.5 px-3 text-right">Cur. Value</th>
                      <th className="py-2.5 px-3 text-right">P&L</th>
                      <th className="py-2.5 px-3 text-right">Net Chg. %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#171d2b] font-mono">
                    {holdings.map((h) => {
                      const isPos = h.pnl >= 0;
                      return (
                        <tr key={h.id} className="hover:bg-[#121824] transition-colors">
                          <td className="py-2.5 px-3 font-bold text-[#f0f3f8] font-sans">
                            {h.tradingsymbol}
                            <span className="text-[10px] text-[#5c687a] ml-1.5 font-mono">{h.exchange}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right text-[#f0f3f8]">{h.quantity}</td>
                          <td className="py-2.5 px-3 text-right text-[#9ca8ba]">₹{fmt(h.average_price)}</td>
                          <td className="py-2.5 px-3 text-right text-[#f0f3f8]">₹{fmt(h.last_price)}</td>
                          <td className="py-2.5 px-3 text-right text-[#f0f3f8]">₹{fmt(h.current_value)}</td>
                          <td className={`py-2.5 px-3 text-right font-bold ${isPos ? 'text-[#00c087]' : 'text-[#df514c]'}`}>
                            {isPos ? '+' : ''}₹{fmt(h.pnl)}
                          </td>
                          <td className={`py-2.5 px-3 text-right ${isPos ? 'text-[#00c087]' : 'text-[#df514c]'}`}>
                            {isPos ? '+' : ''}{h.pnl_percentage.toFixed(2)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Open Orders Table */}
        {activeTab === 'ORDERS' && (
          <div className="mt-2">
            {pendingOrders.length === 0 ? (
              <div className="py-16 text-center text-[#5c687a] text-xs">
                No pending or limit orders in the book.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#1e293b] text-[10px] text-[#5c687a] uppercase tracking-wider font-mono">
                      <th className="py-2.5 px-3">Time</th>
                      <th className="py-2.5 px-3">Side</th>
                      <th className="py-2.5 px-3">Instrument</th>
                      <th className="py-2.5 px-3">Product</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3 text-right">Qty</th>
                      <th className="py-2.5 px-3 text-right">Price</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#171d2b] font-mono">
                    {pendingOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-[#121824] transition-colors">
                        <td className="py-2.5 px-3 text-[#5c687a]">
                          {new Date(o.created_at).toLocaleTimeString()}
                        </td>
                        <td className="py-2.5 px-3 font-bold">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              o.transaction_type === 'BUY'
                                ? 'bg-[#387ed1]/15 text-[#387ed1]'
                                : 'bg-[#df514c]/15 text-[#df514c]'
                            }`}
                          >
                            {o.transaction_type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#f0f3f8] font-sans">
                          {o.tradingsymbol}
                        </td>
                        <td className="py-2.5 px-3 text-[#9ca8ba]">{o.product}</td>
                        <td className="py-2.5 px-3 text-[#9ca8ba]">{o.order_type}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-[#f0f3f8]">{o.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-[#f0f3f8]">
                          {o.price > 0 ? `₹${fmt(o.price)}` : 'MARKET'}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => cancelOrder(o.id)}
                            className="px-2 py-0.5 rounded bg-[#df514c]/15 hover:bg-[#df514c] text-[#df514c] hover:text-white font-bold text-[11px] border border-[#df514c]/30 transition-colors"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Executed Trades Table */}
        {activeTab === 'TRADES' && (
          <div className="mt-2">
            {trades.length === 0 ? (
              <div className="py-16 text-center text-[#5c687a] text-xs">
                No executed trades today yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#1e293b] text-[10px] text-[#5c687a] uppercase tracking-wider font-mono">
                      <th className="py-2.5 px-3">Time</th>
                      <th className="py-2.5 px-3">Trade ID</th>
                      <th className="py-2.5 px-3">Side</th>
                      <th className="py-2.5 px-3">Instrument</th>
                      <th className="py-2.5 px-3 text-right">Qty</th>
                      <th className="py-2.5 px-3 text-right">Price</th>
                      <th className="py-2.5 px-3 text-right">Charges</th>
                      <th className="py-2.5 px-3 text-right">Realized P&L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#171d2b] font-mono">
                    {trades.map((t) => {
                      const pnl = t.realized_pnl || 0;
                      const isPos = pnl >= 0;
                      return (
                        <tr key={t.id} className="hover:bg-[#121824] transition-colors">
                          <td className="py-2.5 px-3 text-[#5c687a]">
                            {new Date(t.trade_time).toLocaleTimeString()}
                          </td>
                          <td className="py-2.5 px-3 text-[#5c687a]">{t.trade_id.slice(-8)}</td>
                          <td className="py-2.5 px-3 font-bold">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] ${
                                t.transaction_type === 'BUY'
                                  ? 'bg-[#387ed1]/15 text-[#387ed1]'
                                  : 'bg-[#df514c]/15 text-[#df514c]'
                              }`}
                            >
                              {t.transaction_type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-[#f0f3f8] font-sans">
                            {t.tradingsymbol}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#f0f3f8]">{t.quantity}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#f0f3f8]">₹{fmt(t.price)}</td>
                          <td className="py-2.5 px-3 text-right text-[#5c687a]">₹{fmt(t.charges?.total_charges || 0)}</td>
                          <td className={`py-2.5 px-3 text-right font-bold ${isPos ? 'text-[#00c087]' : 'text-[#df514c]'}`}>
                            {pnl !== 0 ? `${isPos ? '+' : ''}₹${fmt(pnl)}` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
