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
    <div className="space-y-6 pb-12 w-full max-w-full mx-auto select-none font-sans text-xs text-[#F5F5F2]">
      
      {/* ── 1. Cendrix Capital Greeting Header ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#14223A]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl font-bold tracking-wide text-[#F5F5F2]">
              Welcome, <span className="text-[#C6A15B]">{userName?.split(' ')[0] || 'Trader'}</span>
            </h1>
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" title="System Live · NSE & MCX Connected" />
          </div>
          <div className="text-[11px] text-[#A1A8B3] mt-1 font-mono flex items-center gap-2">
            <span>Portfolio Account: <span className="text-[#F5F5F2] font-semibold">{account?.account_number || 'CNRX-LIVE-001'}</span></span>
            <span className="text-[#14223A]">|</span>
            <span className="text-[#C6A15B] font-semibold tracking-wider uppercase text-[10px]">Cendrix Proprietary Simulation</span>
          </div>
        </div>

        {/* Quick Action Pill Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openOrderTicket()}
            className="btn-cendrix-gold px-4 py-2 rounded-lg text-[#070D18] font-bold text-xs flex items-center gap-1.5 shadow-[0_4px_16px_rgba(198,161,91,0.25)] hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Place Order</span>
          </button>
          <button
            onClick={() => navigate('/dashboard/terminal')}
            className="btn-cendrix-outline px-3.5 py-2 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-all"
          >
            Order Terminal
          </button>
          <button
            onClick={() => navigate('/dashboard/commodities')}
            className="btn-cendrix-outline px-3.5 py-2 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-all"
          >
            MCX Commodities
          </button>
        </div>
      </div>

      {/* ── Beginner Desk Quick Start Banner (Dismissible) ─────── */}
      {!isQuickStartDismissed && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#10192A] via-[#0E1728] to-[#10141C] border border-[rgba(198,161,91,0.25)] relative overflow-hidden shadow-lg animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#C6A15B]/10 border border-[#C6A15B]/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-[#C6A15B]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-[#C6A15B] uppercase">
                    Beginner Trading Desk Guide
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-[#10B981]/15 text-[#10B981] font-semibold border border-[#10B981]/30">
                    ₹10,00,000 Active Virtual Balance
                  </span>
                </div>
                <h3 className="font-serif text-sm sm:text-base font-bold text-[#F5F5F2] mt-0.5">
                  New to CNRX? Discover how to analyze, place orders, and manage virtual risk
                </h3>
                <p className="text-xs text-[#A1A8B3] mt-1 leading-relaxed">
                  1. Search scrips (⌘K) → 2. Inspect Candlestick Charts & Depth → 3. Place simulated orders (Market/Limit/SL) → 4. Track live MTM & Greeks.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
              <button
                onClick={openGuide}
                className="btn-cendrix-gold px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-[0.98] transition-all"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#070D18]" />
                <span>Start Walkthrough</span>
              </button>
              <button
                onClick={() => {
                  setIsQuickStartDismissed(true);
                  try {
                    localStorage.setItem('cnrx_quickstart_dismissed', 'true');
                  } catch {}
                }}
                className="p-2 rounded-lg text-[#A1A8B3] hover:text-[#F5F5F2] hover:bg-[#14223A] transition-colors"
                title="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. Cendrix Capital Two-Column Financial Overview ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-1">
        
        {/* Left Column: Equity Overview Card */}
        <div className="cendrix-card p-5 rounded-xl relative overflow-hidden space-y-4">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C6A15B]/50 to-transparent" />
          
          <div className="flex items-center justify-between pb-3 border-b border-[#14223A]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[rgba(198,161,91,0.12)] border border-[rgba(198,161,91,0.25)] flex items-center justify-center">
                <Briefcase className="w-3.5 h-3.5 text-[#C6A15B]" />
              </div>
              <div>
                <h2 className="font-serif text-sm font-bold tracking-wide text-[#F5F5F2]">Equity Desk</h2>
                <span className="text-[10px] text-[#A1A8B3] block font-mono">Real-time margin telemetry</span>
              </div>
            </div>
            <Link
              to="/dashboard/portfolio"
              className="text-[11px] text-[#C6A15B] hover:text-[#E2C889] flex items-center gap-1 font-semibold transition-colors"
            >
              <span>View statement</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex items-baseline gap-3">
            <div>
              <span className="text-[10px] text-[#A1A8B3] uppercase font-mono font-semibold tracking-wider block">Available Margin</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#F5F5F2] mt-0.5 tracking-tight">
                ₹{fmt(availableMargin)}
              </div>
            </div>
          </div>

          {/* Luxury 2-Column Metrics Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 font-mono text-xs pt-2 border-t border-[#14223A]">
            <div className="flex justify-between py-1.5 border-b border-[#14223A]/70">
              <span className="text-[#A1A8B3]">Margin used:</span>
              <span className="font-bold text-[#C6A15B]">₹{fmt(usedMargin)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#14223A]/70">
              <span className="text-[#A1A8B3]">Available cash:</span>
              <span className="font-bold text-[#F5F5F2]">₹{fmt(account?.cash_balance)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#14223A]/70">
              <span className="text-[#A1A8B3]">Opening balance:</span>
              <span className="text-[#F5F5F2]">₹{fmt(account?.initial_balance || 1000000)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#14223A]/70">
              <span className="text-[#A1A8B3]">Realized P&L:</span>
              <span className={`font-bold ${metrics.realized_pnl >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                {metrics.realized_pnl >= 0 ? '+' : ''}₹{fmt(metrics.realized_pnl)}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#14223A]/70">
              <span className="text-[#A1A8B3]">Unrealized MTM:</span>
              <span className={`font-bold ${metrics.unrealized_pnl >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                {metrics.unrealized_pnl >= 0 ? '+' : ''}₹{fmt(metrics.unrealized_pnl)}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#14223A]/70">
              <span className="text-[#A1A8B3]">Total Charges Paid:</span>
              <span className="text-[#A1A8B3]">₹{fmt(metrics.total_brokerage_paid)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Holdings & Portfolio Overview Card */}
        <div className="cendrix-card p-5 rounded-xl relative overflow-hidden space-y-4">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C6A15B]/50 to-transparent" />

          <div className="flex items-center justify-between pb-3 border-b border-[#14223A]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[rgba(198,161,91,0.12)] border border-[rgba(198,161,91,0.25)] flex items-center justify-center">
                <PieChart className="w-3.5 h-3.5 text-[#C6A15B]" />
              </div>
              <div>
                <h2 className="font-serif text-sm font-bold tracking-wide text-[#F5F5F2]">
                  Holdings & Positions ({holdings.length + openPositions.length})
                </h2>
                <span className="text-[10px] text-[#A1A8B3] block font-mono">Consolidated exposure</span>
              </div>
            </div>
            <Link
              to="/dashboard/holdings"
              className="text-[11px] text-[#C6A15B] hover:text-[#E2C889] flex items-center gap-1 font-semibold transition-colors"
            >
              <span>View analytics</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex items-baseline gap-3">
            <div>
              <span className="text-[10px] text-[#A1A8B3] uppercase font-mono font-semibold tracking-wider block">Total Consolidated P&L</span>
              <div
                className={`text-2xl sm:text-3xl font-extrabold font-mono mt-0.5 flex items-center gap-2.5 ${
                  metrics.overall_net_pnl >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                }`}
              >
                <span>
                  {metrics.overall_net_pnl >= 0 ? '+' : ''}₹{fmt(metrics.overall_net_pnl)}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md font-bold font-mono bg-[#0F192B] border border-[rgba(198,161,91,0.25)] text-[#E2C889]">
                  {metrics.overall_return_percent >= 0 ? '+' : ''}{metrics.overall_return_percent.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Luxury 2-Column Metrics Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 font-mono text-xs pt-2 border-t border-[#14223A]">
            <div className="flex justify-between py-1.5 border-b border-[#14223A]/70">
              <span className="text-[#A1A8B3]">Current value:</span>
              <span className="font-bold text-[#F5F5F2]">₹{fmt(metrics.account_equity)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#14223A]/70">
              <span className="text-[#A1A8B3]">Investment:</span>
              <span className="text-[#A1A8B3]">₹{fmt(metrics.initial_capital)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#14223A]/70">
              <span className="text-[#A1A8B3]">Open Positions:</span>
              <span className="font-bold text-[#F5F5F2]">{openPositions.length} active</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#14223A]/70">
              <span className="text-[#A1A8B3]">Pending Orders:</span>
              <span className="font-bold text-[#C6A15B]">{pendingOrders.length} pending</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#14223A]/70">
              <span className="text-[#A1A8B3]">Completed Fills:</span>
              <span className="text-[#A1A8B3]">{trades.length} fills</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#14223A]/70">
              <span className="text-[#A1A8B3]">Win Rate %:</span>
              <span className="font-bold text-[#10B981]">{metrics.win_rate}%</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── 3. Tabbed Trading Desk (Cendrix Capital Luxury Tables) ───────── */}
      <div className="cendrix-card p-4 rounded-xl border border-[rgba(198,161,91,0.18)]">
        {/* Horizontal Navigation Tabs */}
        <div className="flex items-center gap-6 border-b border-[#14223A] text-xs font-semibold">
          {[
            { id: 'POSITIONS', label: `Positions (${openPositions.length})` },
            { id: 'HOLDINGS', label: `Holdings (${holdings.length})` },
            { id: 'ORDERS', label: `Open Orders (${pendingOrders.length})` },
            { id: 'TRADES', label: `Executed Trades (${trades.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2.5 transition-all relative ${
                activeTab === tab.id
                  ? 'text-[#C6A15B] font-bold border-b-2 border-[#C6A15B] shadow-[0_1px_8px_rgba(198,161,91,0.25)]'
                  : 'text-[#A1A8B3] hover:text-[#F5F5F2]'
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
              <div className="py-16 text-center text-[#A1A8B3] text-xs">
                You have no open positions.
                <div className="mt-1.5 text-[11px] text-[#C6A15B]">
                  Search instruments in the MarketWatch on the left to place buy/sell orders.
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#14223A] text-[10px] text-[#6E7683] uppercase tracking-wider font-mono">
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
                  <tbody className="divide-y divide-[#14223A]/50 font-mono">
                    {openPositions.map((pos) => {
                      const pnl = pos.unrealized_pnl || 0;
                      const isPos = pnl >= 0;
                      const avgPrice = pos.quantity > 0 ? pos.buy_price : pos.sell_price;
                      const ltp = pos.last_price || avgPrice;
                      const chgPct = avgPrice > 0 ? ((ltp - avgPrice) / avgPrice) * 100 : 0;

                      return (
                        <tr key={pos.id} className="hover:bg-[#14223A]/40 transition-colors">
                          <td className="py-2.5 px-3">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#0F192B] text-[#C6A15B] border border-[rgba(198,161,91,0.25)]">
                              {pos.product}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-[#F5F5F2] font-sans">
                            {pos.tradingsymbol}
                            <span className="text-[10px] text-[#A1A8B3] ml-1.5 font-mono">{pos.exchange}</span>
                          </td>
                          <td className={`py-2.5 px-3 text-right font-bold ${pos.quantity > 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                            {pos.quantity > 0 ? `+${pos.quantity}` : pos.quantity}
                          </td>
                          <td className="py-2.5 px-3 text-right text-[#A1A8B3]">₹{fmt(avgPrice)}</td>
                          <td className="py-2.5 px-3 text-right text-[#F5F5F2]">₹{fmt(ltp)}</td>
                          <td className={`py-2.5 px-3 text-right font-bold ${isPos ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                            {isPos ? '+' : ''}₹{fmt(pnl)}
                          </td>
                          <td className={`py-2.5 px-3 text-right ${isPos ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                            {isPos ? '+' : ''}{chgPct.toFixed(2)}%
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => closePosition(pos.id)}
                              className="px-2.5 py-1 rounded bg-[#EF4444]/15 hover:bg-[#EF4444] text-[#EF4444] hover:text-white font-bold text-[11px] border border-[#EF4444]/30 transition-colors"
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
                <div className="flex items-center justify-between py-3 px-3 border-t border-[#14223A] font-mono text-xs">
                  <span className="text-[#A1A8B3] font-semibold uppercase">Total Open Positions P&L</span>
                  <span className={`text-base font-bold ${metrics.unrealized_pnl >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
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
              <div className="py-16 text-center text-[#A1A8B3] text-xs">
                You have no equity holdings.
                <div className="mt-1.5 text-[11px] text-[#C6A15B]">
                  Buy equity scrips with product CNC (Cash & Carry) to build long-term holdings.
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#14223A] text-[10px] text-[#6E7683] uppercase tracking-wider font-mono">
                      <th className="py-2.5 px-3">Instrument</th>
                      <th className="py-2.5 px-3 text-right">Qty.</th>
                      <th className="py-2.5 px-3 text-right">Avg. Price</th>
                      <th className="py-2.5 px-3 text-right">LTP</th>
                      <th className="py-2.5 px-3 text-right">Cur. Value</th>
                      <th className="py-2.5 px-3 text-right">P&L</th>
                      <th className="py-2.5 px-3 text-right">Net Chg. %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#14223A]/50 font-mono">
                    {holdings.map((h) => {
                      const isPos = h.pnl >= 0;
                      return (
                        <tr key={h.id} className="hover:bg-[#14223A]/40 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-[#F5F5F2] font-sans">
                            {h.tradingsymbol}
                            <span className="text-[10px] text-[#A1A8B3] ml-1.5 font-mono">{h.exchange}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right text-[#F5F5F2]">{h.quantity}</td>
                          <td className="py-2.5 px-3 text-right text-[#A1A8B3]">₹{fmt(h.average_price)}</td>
                          <td className="py-2.5 px-3 text-right text-[#F5F5F2]">₹{fmt(h.last_price)}</td>
                          <td className="py-2.5 px-3 text-right text-[#F5F5F2]">₹{fmt(h.current_value)}</td>
                          <td className={`py-2.5 px-3 text-right font-bold ${isPos ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                            {isPos ? '+' : ''}₹{fmt(h.pnl)}
                          </td>
                          <td className={`py-2.5 px-3 text-right ${isPos ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
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
              <div className="py-16 text-center text-[#A1A8B3] text-xs">
                No pending or limit orders in the book.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#14223A] text-[10px] text-[#6E7683] uppercase tracking-wider font-mono">
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
                  <tbody className="divide-y divide-[#14223A]/50 font-mono">
                    {pendingOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-[#14223A]/40 transition-colors">
                        <td className="py-2.5 px-3 text-[#A1A8B3]">
                          {new Date(o.created_at).toLocaleTimeString()}
                        </td>
                        <td className="py-2.5 px-3 font-bold">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              o.transaction_type === 'BUY'
                                ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                                : 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
                            }`}
                          >
                            {o.transaction_type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#F5F5F2] font-sans">
                          {o.tradingsymbol}
                        </td>
                        <td className="py-2.5 px-3 text-[#A1A8B3]">{o.product}</td>
                        <td className="py-2.5 px-3 text-[#A1A8B3]">{o.order_type}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-[#F5F5F2]">{o.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-[#F5F5F2]">
                          {o.price > 0 ? `₹${fmt(o.price)}` : 'MARKET'}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => cancelOrder(o.id)}
                            className="px-2 py-0.5 rounded bg-[#EF4444]/15 hover:bg-[#EF4444] text-[#EF4444] hover:text-white font-bold text-[11px] border border-[#EF4444]/30 transition-colors"
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
              <div className="py-16 text-center text-[#A1A8B3] text-xs">
                No executed trades today yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#14223A] text-[10px] text-[#6E7683] uppercase tracking-wider font-mono">
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
                  <tbody className="divide-y divide-[#14223A]/50 font-mono">
                    {trades.map((t) => {
                      const pnl = t.realized_pnl || 0;
                      const isPos = pnl >= 0;
                      return (
                        <tr key={t.id} className="hover:bg-[#14223A]/40 transition-colors">
                          <td className="py-2.5 px-3 text-[#A1A8B3]">
                            {new Date(t.trade_time).toLocaleTimeString()}
                          </td>
                          <td className="py-2.5 px-3 text-[#A1A8B3]">{t.trade_id.slice(-8)}</td>
                          <td className="py-2.5 px-3 font-bold">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] ${
                                t.transaction_type === 'BUY'
                                  ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                                  : 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
                              }`}
                            >
                              {t.transaction_type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-[#F5F5F2] font-sans">
                            {t.tradingsymbol}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#F5F5F2]">{t.quantity}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#F5F5F2]">₹{fmt(t.price)}</td>
                          <td className="py-2.5 px-3 text-right text-[#A1A8B3]">₹{fmt(t.charges?.total_charges || 0)}</td>
                          <td className={`py-2.5 px-3 text-right font-bold ${isPos ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
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
