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
  HelpCircle,
  Sparkles,
  X,
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
    openGuide,
  } = useTradingStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'POSITIONS' | 'HOLDINGS' | 'ORDERS' | 'TRADES'>('POSITIONS');
  const [isQuickStartDismissed, setIsQuickStartDismissed] = useState(() => {
    try {
      return localStorage.getItem('cnrx_quickstart_dismissed') === 'true';
    } catch {
      return false;
    }
  });

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
    <div className="space-y-6 pb-12 w-full max-w-full mx-auto select-none font-sans text-xs text-[#111114]">
      
      {/* ── 1. Greeting Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D9E2F2]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#00225A]">
              Welcome, <span className="text-[#536CF0]">{userName?.split(' ')[0] || 'Trader'}</span>
            </h1>
            <span className="w-2 h-2 rounded-full bg-[#12B76A] animate-pulse shadow-sm" title="System Live · NSE & MCX Connected" />
          </div>
          <div className="text-[11px] text-[#6B7A90] mt-1 font-mono flex items-center gap-2">
            <span>Portfolio Account: <span className="text-[#00225A] font-semibold">{account?.account_number || 'CNRX-LIVE-001'}</span></span>
            <span className="text-[#D9E2F2]">|</span>
            <span className="text-[#00225A] font-bold tracking-wider uppercase text-[10px] bg-[#EEF3FF] px-1.5 py-0.5 rounded border border-[#D9E2F2]">
              Simulated Fund
            </span>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openOrderTicket()}
            className="btn-primary px-4 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-[0.96] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Place Order</span>
          </button>
          <button
            onClick={() => navigate('/dashboard/terminal')}
            className="btn-secondary px-3.5 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 active:scale-[0.96] transition-all cursor-pointer"
          >
            Order Terminal
          </button>
          <button
            onClick={() => navigate('/dashboard/commodities')}
            className="btn-secondary px-3.5 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 active:scale-[0.96] transition-all cursor-pointer"
          >
            MCX Commodities
          </button>
        </div>
      </div>

      {/* ── Beginner Desk Quick Start Banner ─────────────────────────────── */}
      {!isQuickStartDismissed && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl relative overflow-hidden shadow-[0_2px_12px_rgba(0,34,90,0.04)] border border-[#D9E2F2] animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-[#EEF3FF] border border-[#D9E2F2] flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="w-5 h-5 text-[#536CF0]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-[#536CF0] uppercase">
                    Beginner Trading Desk Guide
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-[#12B76A]/10 text-[#12B76A] font-semibold border border-[#12B76A]/30">
                    ₹10,00,000 Active Virtual Balance
                  </span>
                </div>
                <h3 className="font-display text-sm sm:text-base font-bold text-[#00225A] mt-1">
                  New to CNRX? Discover how to analyze, place orders, and manage virtual risk
                </h3>
                <p className="text-xs text-[#6B7A90] mt-1 leading-relaxed">
                  1. Search scrips (⌘K) → 2. Inspect Candlestick Charts & Depth → 3. Place simulated orders (Market/Limit/SL) → 4. Track live MTM & Greeks.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
              <button
                onClick={openGuide}
                className="btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-[0.96] transition-all cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-white" />
                <span>Start Walkthrough</span>
              </button>
              <button
                onClick={() => {
                  setIsQuickStartDismissed(true);
                  try {
                    localStorage.setItem('cnrx_quickstart_dismissed', 'true');
                  } catch {}
                }}
                className="p-2 rounded-xl text-[#6B7A90] hover:text-[#00225A] hover:bg-[#F7F8FA] active:scale-[0.92] transition-all cursor-pointer"
                title="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. Two-Column Financial Overview ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-1">
        
        {/* Left Column: Equity Overview Card */}
        <div className="bg-white p-6 rounded-2xl relative overflow-hidden space-y-4 border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)]">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#D9E2F2]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#EEF3FF] border border-[#D9E2F2] flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-[#00225A]" />
              </div>
              <div>
                <h2 className="font-display text-sm font-bold text-[#00225A]">Equity Desk</h2>
                <span className="text-[10px] text-[#6B7A90] block font-mono">Real-time margin telemetry</span>
              </div>
            </div>
            <Link
              to="/dashboard/portfolio"
              className="text-[11px] text-[#536CF0] hover:text-[#00225A] flex items-center gap-1 font-semibold transition-colors active:scale-[0.96]"
            >
              <span>View statement</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex items-baseline gap-3">
            <div>
              <span className="text-[10px] text-[#6B7A90] uppercase font-mono font-semibold tracking-wider block">Available Margin</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#00225A] mt-0.5 tracking-tight tabular-nums">
                ₹{fmt(availableMargin)}
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 font-mono text-xs pt-3 border-t border-[#D9E2F2] tabular-nums">
            <div className="flex justify-between py-1.5 border-b border-[#D9E2F2]/60">
              <span className="text-[#6B7A90]">Margin used:</span>
              <span className="font-bold text-[#00225A]">₹{fmt(usedMargin)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#D9E2F2]/60">
              <span className="text-[#6B7A90]">Available cash:</span>
              <span className="font-bold text-[#111114]">₹{fmt(account?.cash_balance)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#D9E2F2]/60">
              <span className="text-[#6B7A90]">Opening balance:</span>
              <span className="text-[#111114]">₹{fmt(account?.initial_balance || 1000000)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#D9E2F2]/60">
              <span className="text-[#6B7A90]">Realized P&L:</span>
              <span className={`font-bold ${metrics.realized_pnl >= 0 ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
                {metrics.realized_pnl >= 0 ? '+' : ''}₹{fmt(metrics.realized_pnl)}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#D9E2F2]/60">
              <span className="text-[#6B7A90]">Unrealized MTM:</span>
              <span className={`font-bold ${metrics.unrealized_pnl >= 0 ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
                {metrics.unrealized_pnl >= 0 ? '+' : ''}₹{fmt(metrics.unrealized_pnl)}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#D9E2F2]/60">
              <span className="text-[#6B7A90]">Total Charges Paid:</span>
              <span className="text-[#6B7A90]">₹{fmt(metrics.total_brokerage_paid)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Holdings & Portfolio Overview Card */}
        <div className="bg-white p-6 rounded-2xl relative overflow-hidden space-y-4 border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)]">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#D9E2F2]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#EEF3FF] border border-[#D9E2F2] flex items-center justify-center">
                <PieChart className="w-4 h-4 text-[#00225A]" />
              </div>
              <div>
                <h2 className="font-display text-sm font-bold text-[#00225A]">
                  Holdings & Positions ({holdings.length + openPositions.length})
                </h2>
                <span className="text-[10px] text-[#6B7A90] block font-mono">Consolidated exposure</span>
              </div>
            </div>
            <Link
              to="/dashboard/holdings"
              className="text-[11px] text-[#536CF0] hover:text-[#00225A] flex items-center gap-1 font-semibold transition-colors active:scale-[0.96]"
            >
              <span>View analytics</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex items-baseline gap-3">
            <div>
              <span className="text-[10px] text-[#6B7A90] uppercase font-mono font-semibold tracking-wider block">Total Consolidated P&L</span>
              <div
                className={`text-2xl sm:text-3xl font-extrabold font-mono mt-0.5 flex items-center gap-2.5 tabular-nums ${
                  metrics.overall_net_pnl >= 0 ? 'text-[#12B76A]' : 'text-[#D92D20]'
                }`}
              >
                <span>
                  {metrics.overall_net_pnl >= 0 ? '+' : ''}₹{fmt(metrics.overall_net_pnl)}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold font-mono ${
                  metrics.overall_return_percent >= 0 ? 'bg-[#12B76A]/10 text-[#12B76A] border border-[#12B76A]/30' : 'bg-[#D92D20]/10 text-[#D92D20] border border-[#D92D20]/30'
                }`}>
                  {metrics.overall_return_percent >= 0 ? '+' : ''}{metrics.overall_return_percent.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 font-mono text-xs pt-3 border-t border-[#D9E2F2] tabular-nums">
            <div className="flex justify-between py-1.5 border-b border-[#D9E2F2]/60">
              <span className="text-[#6B7A90]">Current value:</span>
              <span className="font-bold text-[#00225A]">₹{fmt(metrics.account_equity)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#D9E2F2]/60">
              <span className="text-[#6B7A90]">Investment:</span>
              <span className="text-[#6B7A90]">₹{fmt(metrics.initial_capital)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#D9E2F2]/60">
              <span className="text-[#6B7A90]">Open Positions:</span>
              <span className="font-bold text-[#111114]">{openPositions.length} active</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#D9E2F2]/60">
              <span className="text-[#6B7A90]">Pending Orders:</span>
              <span className="font-bold text-[#00225A]">{pendingOrders.length} pending</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#D9E2F2]/60">
              <span className="text-[#6B7A90]">Completed Fills:</span>
              <span className="text-[#6B7A90]">{trades.length} fills</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#D9E2F2]/60">
              <span className="text-[#6B7A90]">Win Rate %:</span>
              <span className="font-bold text-[#12B76A]">{metrics.win_rate}%</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── 3. Tabbed Trading Desk ────────────────────────────────────────── */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)] space-y-4">
        {/* Segmented Control */}
        <div className="overflow-x-auto pb-1">
          <div className="bg-[#F7F8FA] border border-[#D9E2F2] p-1 rounded-xl inline-flex gap-1">
            {[
              { id: 'POSITIONS', label: `Positions (${openPositions.length})` },
              { id: 'HOLDINGS', label: `Holdings (${holdings.length})` },
              { id: 'ORDERS', label: `Open Orders (${pendingOrders.length})` },
              { id: 'TRADES', label: `Executed Trades (${trades.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-[#00225A] shadow-sm border border-[#D9E2F2] font-bold'
                    : 'text-[#6B7A90] hover:text-[#00225A]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Positions Table */}
        {activeTab === 'POSITIONS' && (
          <div className="mt-2">
            {openPositions.length === 0 ? (
              <div className="py-16 text-center text-[#6B7A90] text-xs">
                You have no open positions.
                <div className="mt-1.5 text-[11px] text-[#536CF0]">
                  Search instruments in the MarketWatch on the left to place buy/sell orders.
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#D9E2F2] text-[10px] text-[#6B7A90] uppercase tracking-wider font-mono bg-[#F7F8FA]">
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
                  <tbody className="divide-y divide-[#D9E2F2] font-mono tabular-nums">
                    {openPositions.map((pos) => {
                      const pnl = pos.unrealized_pnl || 0;
                      const isPos = pnl >= 0;
                      const avgPrice = pos.quantity > 0 ? pos.buy_price : pos.sell_price;
                      const ltp = pos.last_price || avgPrice;
                      const chgPct = avgPrice > 0 ? ((ltp - avgPrice) / avgPrice) * 100 : 0;

                      return (
                        <tr key={pos.id} className="hover:bg-[#F7F8FA] transition-colors">
                          <td className="py-2.5 px-3">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EEF3FF] text-[#00225A] border border-[#D9E2F2]">
                              {pos.product}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-[#00225A] font-sans">
                            {pos.tradingsymbol}
                            <span className="text-[10px] text-[#6B7A90] ml-1.5 font-mono">{pos.exchange}</span>
                          </td>
                          <td className={`py-2.5 px-3 text-right font-bold ${pos.quantity > 0 ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
                            {pos.quantity > 0 ? `+${pos.quantity}` : pos.quantity}
                          </td>
                          <td className="py-2.5 px-3 text-right text-[#6B7A90]">₹{fmt(avgPrice)}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#111114]">₹{fmt(ltp)}</td>
                          <td className={`py-2.5 px-3 text-right font-bold ${isPos ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
                            {isPos ? '+' : ''}₹{fmt(pnl)}
                          </td>
                          <td className={`py-2.5 px-3 text-right ${isPos ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
                            {isPos ? '+' : ''}{chgPct.toFixed(2)}%
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => closePosition(pos.id)}
                              className="px-2.5 py-1 rounded-lg bg-[#FEE4E2] hover:bg-[#D92D20] text-[#D92D20] hover:text-white font-bold text-[11px] border border-[#FECDCA] active:scale-[0.92] transition-all cursor-pointer"
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
                <div className="flex items-center justify-between py-3 px-3 border-t border-[#D9E2F2] font-mono text-xs tabular-nums bg-[#F7F8FA]">
                  <span className="text-[#6B7A90] font-semibold uppercase">Total Open Positions P&L</span>
                  <span className={`text-base font-bold ${metrics.unrealized_pnl >= 0 ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
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
              <div className="py-16 text-center text-[#6B7A90] text-xs">
                You have no equity holdings.
                <div className="mt-1.5 text-[11px] text-[#536CF0]">
                  Buy equity scrips with product CNC (Cash & Carry) to build long-term holdings.
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#D9E2F2] text-[10px] text-[#6B7A90] uppercase tracking-wider font-mono bg-[#F7F8FA]">
                      <th className="py-2.5 px-3">Instrument</th>
                      <th className="py-2.5 px-3 text-right">Qty.</th>
                      <th className="py-2.5 px-3 text-right">Avg. Price</th>
                      <th className="py-2.5 px-3 text-right">LTP</th>
                      <th className="py-2.5 px-3 text-right">Cur. Value</th>
                      <th className="py-2.5 px-3 text-right">P&L</th>
                      <th className="py-2.5 px-3 text-right">Net Chg. %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D9E2F2] font-mono tabular-nums">
                    {holdings.map((h) => {
                      const isPos = h.pnl >= 0;
                      return (
                        <tr key={h.id} className="hover:bg-[#F7F8FA] transition-colors">
                          <td className="py-2.5 px-3 font-bold text-[#00225A] font-sans">
                            {h.tradingsymbol}
                            <span className="text-[10px] text-[#6B7A90] ml-1.5 font-mono">{h.exchange}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right text-[#111114]">{h.quantity}</td>
                          <td className="py-2.5 px-3 text-right text-[#6B7A90]">₹{fmt(h.average_price)}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#111114]">₹{fmt(h.last_price)}</td>
                          <td className="py-2.5 px-3 text-right text-[#111114]">₹{fmt(h.current_value)}</td>
                          <td className={`py-2.5 px-3 text-right font-bold ${isPos ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
                            {isPos ? '+' : ''}₹{fmt(h.pnl)}
                          </td>
                          <td className={`py-2.5 px-3 text-right ${isPos ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
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
              <div className="py-16 text-center text-[#6B7A90] text-xs">
                No pending or limit orders in the book.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#D9E2F2] text-[10px] text-[#6B7A90] uppercase tracking-wider font-mono bg-[#F7F8FA]">
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
                  <tbody className="divide-y divide-[#D9E2F2] font-mono tabular-nums">
                    {pendingOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-[#F7F8FA] transition-colors">
                        <td className="py-2.5 px-3 text-[#6B7A90]">
                          {new Date(o.created_at).toLocaleTimeString()}
                        </td>
                        <td className="py-2.5 px-3 font-bold">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              o.transaction_type === 'BUY'
                                ? 'bg-[#12B76A]/10 text-[#12B76A] border border-[#12B76A]/30'
                                : 'bg-[#D92D20]/10 text-[#D92D20] border border-[#D92D20]/30'
                            }`}
                          >
                            {o.transaction_type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#00225A] font-sans">
                          {o.tradingsymbol}
                        </td>
                        <td className="py-2.5 px-3 text-[#6B7A90]">{o.product}</td>
                        <td className="py-2.5 px-3 text-[#6B7A90]">{o.order_type}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-[#111114]">{o.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-[#00225A]">
                          {o.price > 0 ? `₹${fmt(o.price)}` : 'MARKET'}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => cancelOrder(o.id)}
                            className="px-2.5 py-1 rounded-lg bg-[#FEE4E2] hover:bg-[#D92D20] text-[#D92D20] hover:text-white font-bold text-[11px] border border-[#FECDCA] active:scale-[0.92] transition-all cursor-pointer"
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
              <div className="py-16 text-center text-[#6B7A90] text-xs">
                No executed trades today yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#D9E2F2] text-[10px] text-[#6B7A90] uppercase tracking-wider font-mono bg-[#F7F8FA]">
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
                  <tbody className="divide-y divide-[#D9E2F2] font-mono tabular-nums">
                    {trades.map((t: any) => {
                      const pnl = t.realized_pnl || 0;
                      const isPos = pnl >= 0;
                      const tradeTime = t.trade_time || t.created_at;
                      const tradePrice = t.price ?? t.average_price ?? 0;
                      return (
                        <tr key={t.id} className="hover:bg-[#F7F8FA] transition-colors">
                          <td className="py-2.5 px-3 text-[#6B7A90]">
                            {tradeTime ? new Date(tradeTime).toLocaleTimeString() : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-[#6B7A90]">{(t.trade_id || t.id).slice(-8)}</td>
                          <td className="py-2.5 px-3 font-bold">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                t.transaction_type === 'BUY'
                                  ? 'bg-[#12B76A]/10 text-[#12B76A] border border-[#12B76A]/30'
                                  : 'bg-[#D92D20]/10 text-[#D92D20] border border-[#D92D20]/30'
                              }`}
                            >
                              {t.transaction_type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-[#00225A] font-sans">
                            {t.tradingsymbol}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#111114]">{t.quantity}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#00225A]">₹{fmt(tradePrice)}</td>
                          <td className="py-2.5 px-3 text-right text-[#6B7A90]">₹{fmt(t.charges?.total_charges || 0)}</td>
                          <td className={`py-2.5 px-3 text-right font-bold ${isPos ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
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
