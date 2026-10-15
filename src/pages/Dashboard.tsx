import React from 'react';
import { useTradingStore } from '../store/useTradingStore';
import { 
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  PlusCircle, 
  LineChart, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  ShieldCheck, 
  Activity,
  Zap,
  Briefcase,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DynamicIsland } from '../components/common/DynamicIsland';
import { INDIAN_INSTRUMENTS_MASTER } from '../services/market/indianInstruments';

export default function Dashboard() {
  const { account, positions, holdings, trades, ledger, getMetrics, openOrderTicket, closePosition, quotes } = useTradingStore();
  const navigate = useNavigate();

  const metrics = getMetrics();
  const openPositions = positions.filter((p) => !p.is_closed && p.quantity !== 0);

  const fmt = (n: number) =>
    `₹${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const fmtInt = (n: number) =>
    `₹${Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  // ── Construct Real Dynamic Equity Curve from Ledger & Trades ──────────
  // Starts at account inception baseline (₹10,00,000) and plots real transaction checkpoints
  const initialCap = metrics.initial_capital || 1000000;
  const currentEq = metrics.account_equity;

  const equityData: { name: string; equity: number; cash: number }[] = [
    { name: 'Inception', equity: initialCap, cash: initialCap }
  ];

  // If user has ledger entries, map chronological balance progression
  if (ledger.length > 0) {
    const sortedLedger = [...ledger].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    sortedLedger.forEach((entry, idx) => {
      const timeStr = new Date(entry.created_at).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });
      equityData.push({
        name: `${entry.entry_type} #${idx + 1} (${timeStr})`,
        equity: entry.balance_after,
        cash: entry.balance_after,
      });
    });
  }

  // Always end with current real-time live equity
  equityData.push({
    name: 'Current Live',
    equity: Math.round(currentEq * 100) / 100,
    cash: Math.round(metrics.current_cash * 100) / 100,
  });

  // ── Asset Allocation ──────────────────────────────────────────────────
  const holdingsValue = holdings.reduce((s, h) => s + h.current_value, 0);
  const usedMargin = metrics.used_margin;
  const freeCash = Math.max(0, metrics.current_cash - usedMargin);

  const allocationData = [
    { name: 'Free Virtual Cash', value: freeCash > 0 ? freeCash : initialCap, color: '#3b82f6' },
    { name: 'Equity Holdings', value: holdingsValue, color: '#22c55e' },
    { name: 'F&O Margin Blocked', value: usedMargin, color: '#C6A15B' },
  ].filter(d => d.value > 0);

  // Top Key Instruments to Spotlight on Dashboard
  const spotlightKeys = [
    'NSE_INDEX|Nifty 50',
    'NSE_INDEX|Nifty Bank',
    'NSE_EQ|INE081A01020', // TATASTEEL
    'NSE_EQ|INE002A01018', // RELIANCE
    'NSE_EQ|INE040A01034', // HDFCBANK
    'NSE_EQ|INE467B01029', // TCS
  ];

  const spotlightInstruments = INDIAN_INSTRUMENTS_MASTER.filter(i =>
    spotlightKeys.includes(i.instrument_key)
  );

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto select-none font-sans">
      {/* ── Dynamic Island Floating Command Hub ────────────────────────── */}
      <DynamicIsland />

      {/* ── Institutional Portfolio Command Header ─────────────────────── */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#0E1728] via-[#101C30] to-[#0B1424] border border-[rgba(198,161,91,0.25)] shadow-[0_15px_40px_rgba(0,0,0,0.5),0_0_25px_rgba(198,161,91,0.08)] relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_top_right,rgba(198,161,91,0.12),transparent_70%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#A1A8B3] font-medium mb-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[#C6A15B] font-serif font-bold uppercase tracking-wider text-[11px]">
                CNRX SIMULATED PLATFORM · CENDRIX CAPITAL
              </span>
              <span className="text-white/20">|</span>
              <span className="font-mono text-[#A1A8B3]">{account?.account_number || 'IN-PT-LIVE001'}</span>
            </div>

            <div className="flex flex-wrap items-baseline gap-4">
              <h1 className="text-3xl sm:text-4xl font-extrabold font-mono text-[#F5F5F2] tracking-tight">
                {fmt(metrics.account_equity)}
              </h1>
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono ${
                  metrics.overall_net_pnl >= 0
                    ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                    : 'bg-[#F43F5E]/15 text-[#F43F5E] border border-[#F43F5E]/30'
                }`}
              >
                {metrics.overall_net_pnl >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>
                  {metrics.overall_net_pnl >= 0 ? '+' : '-'}{fmt(metrics.overall_net_pnl)} ({metrics.overall_return_percent.toFixed(2)}%)
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#A1A8B3] mt-3">
              <span>
                Initial Capital: <strong className="text-[#F5F5F2] font-mono">₹10,00,000.00</strong>
              </span>
              <span>
                Available Cash: <strong className="text-[#F5F5F2] font-mono">{fmt(metrics.current_cash)}</strong>
              </span>
              <span>
                Buying Power: <strong className="text-[#C6A15B] font-mono">{fmt(metrics.available_margin)}</strong>
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={() => navigate('/dashboard/terminal')}
              className="btn-cendrix-outline text-xs py-2 px-4"
            >
              <LineChart className="w-4 h-4 text-[#C6A15B]" />
              <span>Open Terminal</span>
            </button>
            <button
              onClick={() => openOrderTicket()}
              className="btn-cendrix-gold text-xs py-2 px-5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Place Order</span>
            </button>
          </div>
        </div>

        {/* ── Unified Metric Strip (Institutional Cendrix Layout) ── */}
        <div className="mt-8 pt-6 border-t border-[rgba(198,161,91,0.18)] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-[#0B1424]/60 border border-[rgba(198,161,91,0.15)]">
            <span className="text-[10px] text-[#A1A8B3] uppercase font-semibold tracking-wider">Unrealized MTM</span>
            <p className={`text-base font-mono font-bold mt-0.5 ${metrics.unrealized_pnl >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
              {metrics.unrealized_pnl >= 0 ? '+' : ''}{fmt(metrics.unrealized_pnl)}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#0B1424]/60 border border-[rgba(198,161,91,0.15)]">
            <span className="text-[10px] text-[#A1A8B3] uppercase font-semibold tracking-wider">Realized P&L</span>
            <p className={`text-base font-mono font-bold mt-0.5 ${metrics.realized_pnl >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
              {metrics.realized_pnl >= 0 ? '+' : ''}{fmt(metrics.realized_pnl)}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#0B1424]/60 border border-[rgba(198,161,91,0.15)]">
            <span className="text-[10px] text-[#A1A8B3] uppercase font-semibold tracking-wider">Blocked Margin</span>
            <p className="text-base font-mono font-bold text-[#C6A15B] mt-0.5">
              {fmt(metrics.used_margin)}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#0B1424]/60 border border-[rgba(198,161,91,0.15)]">
            <span className="text-[10px] text-[#A1A8B3] uppercase font-semibold tracking-wider">Win Rate</span>
            <p className="text-base font-mono font-bold text-[#10B981] mt-0.5">
              {metrics.win_rate}%
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#0B1424]/60 border border-[rgba(198,161,91,0.15)]">
            <span className="text-[10px] text-[#A1A8B3] uppercase font-semibold tracking-wider">Max Drawdown</span>
            <p className="text-base font-mono font-bold text-[#F43F5E] mt-0.5">
              {metrics.max_drawdown_percent.toFixed(1)}%
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#0B1424]/60 border border-[rgba(198,161,91,0.15)]">
            <span className="text-[10px] text-[#A1A8B3] uppercase font-semibold tracking-wider">Taxes & Fees</span>
            <p className="text-base font-mono font-bold text-[#A1A8B3] mt-0.5">
              ₹{metrics.total_brokerage_paid.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Live Market Spotlight Strip ─────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-bold text-[#A1A8B3] uppercase tracking-wider text-[11px] flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-[#C6A15B]" />
            <span>Live Market Spotlight (NSE / BSE)</span>
          </span>
          <button
            onClick={() => navigate('/dashboard/watchlist')}
            className="text-xs text-[#C6A15B] hover:text-[#E2C889] hover:underline font-semibold flex items-center gap-1"
          >
            <span>Full Market Watch</span>
            <span>→</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {spotlightInstruments.map((inst) => {
            const q = quotes[inst.instrument_key];
            const price = q ? q.last_price : 0;
            const change = q ? q.change : 0;
            const changePercent = q ? q.change_percent : 0;
            const isPos = change >= 0;

            return (
              <div
                key={inst.instrument_key}
                onClick={() => openOrderTicket({
                  instrument_key: inst.instrument_key,
                  tradingsymbol: inst.tradingsymbol,
                  exchange: inst.exchange,
                  instrument_type: inst.instrument_type,
                  lot_size: inst.lot_size,
                  price: price,
                })}
                className="p-3.5 rounded-xl bg-[#0E1728] hover:bg-[#132038] border border-[rgba(198,161,91,0.18)] hover:border-[rgba(198,161,91,0.45)] cursor-pointer transition-all duration-200 shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_25px_rgba(198,161,91,0.12)] group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#F5F5F2] text-xs tracking-tight group-hover:text-[#C6A15B] transition-colors">
                    {inst.tradingsymbol}
                  </span>
                  <span className="text-[9px] text-[#A1A8B3] font-mono px-1 py-0.5 rounded bg-white/[0.04]">
                    {inst.exchange}
                  </span>
                </div>

                <div className="mt-2 flex items-baseline justify-between">
                  <span className="font-mono font-bold text-[#F5F5F2] text-sm">
                    {price > 0 ? `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'Live...'}
                  </span>
                  {price > 0 && (
                    <span className={`text-[10px] font-mono font-bold ${isPos ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                      {isPos ? '+' : ''}{changePercent.toFixed(2)}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Charts Grid: Real Dynamic Equity Curve + Allocation ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real Dynamic Equity Growth Curve */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0E1728] border border-[rgba(198,161,91,0.2)] shadow-[0_8px_30px_rgba(0,0,0,0.4)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#F5F5F2] flex items-center gap-2">
                <span>Account Equity Performance</span>
                <span className="text-[10px] bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  TRANSACTION AUDITED
                </span>
              </h3>
              <p className="text-xs text-[#A1A8B3] mt-0.5">
                Real cumulative equity progression mapped from executed fills and live portfolio MTM
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#C6A15B]">
              ₹{metrics.account_equity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityData}>
                <defs>
                  <linearGradient id="eqGoldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C6A15B" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#C6A15B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#14223A" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#6E7683" fontSize={10} tickLine={false} />
                <YAxis
                  stroke="#6E7683"
                  fontSize={10}
                  domain={['auto', 'auto']}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1424', borderColor: 'rgba(198,161,91,0.3)', borderRadius: '8px', color: '#F5F5F2' }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Equity']}
                />
                <Area type="monotone" dataKey="equity" stroke="#C6A15B" strokeWidth={2.5} fill="url(#eqGoldGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Asset Allocation Donut */}
        <div className="p-6 rounded-2xl bg-[#0E1728] border border-[rgba(198,161,91,0.2)] shadow-[0_8px_30px_rgba(0,0,0,0.4)] space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#F5F5F2]">Portfolio Capital Allocation</h3>
            <p className="text-xs text-[#A1A8B3] mt-0.5">Cash vs Delivery vs F&O Margin</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => {
                    const colors = ['#C6A15B', '#10B981', '#3B82F6'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1424', borderColor: 'rgba(198,161,91,0.3)', borderRadius: '8px', color: '#F5F5F2' }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Allocation']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 text-xs">
            {allocationData.map((a, idx) => {
              const colors = ['#C6A15B', '#10B981', '#3B82F6'];
              const col = colors[idx % colors.length];
              return (
                <div key={a.name} className="flex items-center justify-between text-[#A1A8B3]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col }} />
                    <span>{a.name}</span>
                  </div>
                  <span className="font-mono text-[#F5F5F2] font-semibold">₹{a.value.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Active Open Positions Section ─────────────────────────────────── */}
      <div className="p-6 rounded-2xl bg-[#0E1728] border border-[rgba(198,161,91,0.2)] shadow-[0_8px_30px_rgba(0,0,0,0.4)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#F5F5F2]">Active Open Positions</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-[#C6A15B]/15 text-[#C6A15B] font-bold text-xs border border-[#C6A15B]/30 font-mono">
              {openPositions.length} Open
            </span>
          </div>
          <button
            onClick={() => navigate('/dashboard/positions')}
            className="text-xs text-[#C6A15B] hover:text-[#E2C889] hover:underline font-semibold"
          >
            Manage Positions →
          </button>
        </div>

        {openPositions.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#A1A8B3] border border-dashed border-[rgba(198,161,91,0.2)] rounded-xl bg-[#0B1424]/40">
            <Briefcase className="w-6 h-6 mx-auto mb-2 text-[#C6A15B]/60" />
            <p className="text-[#F5F5F2] font-medium">No active open positions currently.</p>
            <p className="text-[11px] text-[#A1A8B3] mt-0.5">Use the Place Order button or Terminal to enter simulated positions.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] text-[#A1A8B3] text-[10px] uppercase font-semibold">
                  <th className="py-2.5 px-3">Instrument</th>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3 text-right">Qty</th>
                  <th className="py-2.5 px-3 text-right">Avg Entry</th>
                  <th className="py-2.5 px-3 text-right">LTP</th>
                  <th className="py-2.5 px-3 text-right">Unrealized MTM</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] font-mono">
                {openPositions.map((p) => {
                  const isLong = p.quantity > 0;
                  const isProfit = p.unrealized_pnl >= 0;
                  const avgPrice = isLong ? p.buy_price : p.sell_price;

                  return (
                    <tr key={p.id} className="hover:bg-[#14223A]/50 transition-colors">
                      <td className="py-3 px-3 font-sans font-bold text-[#F5F5F2]">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${isLong ? 'bg-[#10B981]' : 'bg-[#F43F5E]'}`} />
                          <span>{p.tradingsymbol}</span>
                          <span className="text-[9px] bg-white/[0.05] text-[#A1A8B3] px-1 rounded font-normal font-mono">
                            {p.exchange}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[#A1A8B3] font-sans text-[11px]">{p.product}</td>
                      <td className="py-3 px-3 text-right font-bold text-[#F5F5F2]">
                        {p.quantity > 0 ? `+${p.quantity}` : p.quantity}
                      </td>
                      <td className="py-3 px-3 text-right text-[#F5F5F2]">₹{avgPrice.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right text-[#F5F5F2]">₹{p.last_price.toFixed(2)}</td>
                      <td className={`py-3 px-3 text-right font-bold ${isProfit ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                        {isProfit ? '+' : ''}₹{p.unrealized_pnl.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-sans">
                        <button
                          onClick={() => closePosition(p.id)}
                          className="px-2.5 py-1 rounded-md bg-[#F43F5E]/15 hover:bg-[#F43F5E]/30 text-[#F43F5E] text-[11px] font-bold border border-[#F43F5E]/30 transition-all"
                        >
                          Square Off
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Recent Executed Trades Stream ─────────────────────────────────── */}
      <div className="p-6 rounded-2xl bg-[#0E1728] border border-[rgba(198,161,91,0.2)] shadow-[0_8px_30px_rgba(0,0,0,0.4)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#F5F5F2]">Recent Trade Executions</h3>
            <span className="text-xs text-[#A1A8B3]">({trades.length} Total Executed)</span>
          </div>
          <button
            onClick={() => navigate('/dashboard/tradebook')}
            className="text-xs text-[#C6A15B] hover:text-[#E2C889] hover:underline font-semibold"
          >
            Full Trade Book →
          </button>
        </div>

        {trades.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#A1A8B3] border border-dashed border-[rgba(198,161,91,0.2)] rounded-xl bg-[#0B1424]/40">
            <Clock className="w-6 h-6 mx-auto mb-2 text-[#C6A15B]/60" />
            <p className="text-[#F5F5F2] font-medium">No executed trades recorded yet.</p>
            <p className="text-[11px] text-[#A1A8B3] mt-0.5">Orders filled by the simulation engine will stream here with full execution audit.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] text-[#A1A8B3] text-[10px] uppercase font-semibold">
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Instrument</th>
                  <th className="py-2.5 px-3">Side</th>
                  <th className="py-2.5 px-3 text-right">Qty</th>
                  <th className="py-2.5 px-3 text-right">Price</th>
                  <th className="py-2.5 px-3 text-right">Charges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] font-mono">
                {trades.slice(0, 5).map((t) => (
                  <tr key={t.id} className="hover:bg-[#14223A]/50 transition-colors">
                    <td className="py-3 px-3 text-[#A1A8B3] font-sans text-[11px]">
                      {new Date(t.trade_time).toLocaleTimeString('en-IN')}
                    </td>
                    <td className="py-3 px-3 font-sans font-bold text-[#F5F5F2]">{t.tradingsymbol}</td>
                    <td className="py-3 px-3 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.transaction_type === 'BUY' ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30' : 'bg-[#F43F5E]/15 text-[#F43F5E] border border-[#F43F5E]/30'
                      }`}>
                        {t.transaction_type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-[#F5F5F2] font-bold">{t.quantity}</td>
                    <td className="py-3 px-3 text-right text-[#F5F5F2] font-bold">₹{t.execution_price.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right text-[#A1A8B3]">₹{t.charges.total_charges.toFixed(2)}</td>
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
