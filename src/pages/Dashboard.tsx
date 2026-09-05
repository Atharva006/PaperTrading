import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { format, isToday, isThisWeek, isThisMonth } from 'date-fns';

export default function Dashboard() {
  const { trades, accounts, activeAccountId } = useStore();
  const navigate = useNavigate();
  const account = accounts.find(a => a.id === activeAccountId) || accounts[0];

  // ── All stats purely from live trade data ─────────────────────────────────
  const stats = useMemo(() => {
    const totalPnl  = trades.reduce((s, t) => s + t.pnl, 0);
    const todayPnl  = trades.filter(t => isToday(new Date(t.date))).reduce((s, t) => s + t.pnl, 0);
    const weekPnl   = trades.filter(t => isThisWeek(new Date(t.date), { weekStartsOn: 1 })).reduce((s, t) => s + t.pnl, 0);
    const monthPnl  = trades.filter(t => isThisMonth(new Date(t.date))).reduce((s, t) => s + t.pnl, 0);
    const wins      = trades.filter(t => t.result === 'Win').length;
    const losses    = trades.filter(t => t.result === 'Loss').length;
    const total     = wins + losses;
    const winRate   = total > 0 ? (wins / total) * 100 : 0;
    const grossWin  = trades.filter(t => t.result === 'Win').reduce((s, t) => s + t.pnl, 0);
    const grossLoss = Math.abs(trades.filter(t => t.result === 'Loss').reduce((s, t) => s + t.pnl, 0));
    const pf        = grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? Infinity : 0;
    const balance   = (account?.startingBalance ?? 0) + totalPnl;
    const avgR      = total > 0 ? trades.reduce((s, t) => s + (t.rr || 0), 0) / total : 0;
    return { totalPnl, todayPnl, weekPnl, monthPnl, winRate, pf, balance, wins, losses, total, avgR };
  }, [trades, account]);

  // ── Live Equity Curve — one data point per trading day ───────────────────
  const equityCurve = useMemo(() => {
    if (!account || trades.length === 0) return [];
    const sorted = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const dayMap = new Map<string, number>();
    let running = account.startingBalance;
    for (const trade of sorted) {
      const day = format(new Date(trade.date), 'MMM d');
      running += trade.pnl;
      dayMap.set(day, running);
    }
    // Prepend starting balance
    const entries = Array.from(dayMap.entries()).map(([date, balance]) => ({ date, balance }));
    return [{ date: 'Start', balance: account.startingBalance }, ...entries];
  }, [trades, account]);

  const fmt = (n: number, showSign = true) => {
    const sign = showSign ? (n >= 0 ? '+' : '') : '';
    return `${sign}$${Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };
  const fmtPf = (pf: number) => (pf === Infinity ? '∞' : pf.toFixed(2));

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#18181b]/60 border border-white/5 flex items-center justify-center mb-2">
          <TrendingUp className="w-8 h-8 text-[#d97757]/50" />
        </div>
        <p className="text-lg font-medium text-[#e5e5e5]">No account yet</p>
        <p className="text-sm text-[#8c8c8c]">Add your first account to start tracking your performance.</p>
        <button
          onClick={() => navigate('/dashboard/accounts')}
          className="mt-2 px-6 py-2.5 bg-[#d97757] hover:bg-[#c46547] text-[#131314] rounded-lg text-sm font-semibold transition-colors shadow-[0_0_15px_rgba(217,119,87,0.3)]"
        >
          Add Account
        </button>
      </div>
    );
  }

  const isGrowth = stats.totalPnl >= 0;

  return (
    <div className="space-y-5 pb-12 max-w-[1400px] mx-auto">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#18181b]/40 backdrop-blur-xl p-6 rounded-2xl border border-white/5">
        <div>
          <p className="text-[10px] text-[#8c8c8c] uppercase tracking-wider font-semibold mb-1">
            {account.firm} · {account.status}
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-medium tracking-tight text-[#e5e5e5]">{account.name}</h1>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <h2 className="text-4xl font-medium tracking-tight text-[#e5e5e5]">
              ${stats.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <span className={`flex items-center gap-1 text-sm font-semibold ${stats.todayPnl >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
              {stats.todayPnl >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {fmt(stats.todayPnl)} today
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/dashboard/accounts')}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-[#e5e5e5] hover:bg-white/10 transition-colors"
          >
            Switch Account
          </button>
          <button
            onClick={() => navigate('/dashboard/journal')}
            className="px-4 py-2 bg-[#d97757] hover:bg-[#c46547] text-[#131314] rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(217,119,87,0.3)]"
          >
            <Plus className="w-4 h-4" /> Log Trade
          </button>
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Today's P&L",  value: fmt(stats.todayPnl),  color: stats.todayPnl  >= 0 ? '#10b981' : '#ef4444' },
          { label: 'Week P&L',     value: fmt(stats.weekPnl),   color: stats.weekPnl   >= 0 ? '#10b981' : '#ef4444' },
          { label: 'Month P&L',    value: fmt(stats.monthPnl),  color: stats.monthPnl  >= 0 ? '#10b981' : '#ef4444' },
          { label: 'Win Rate',     value: `${stats.winRate.toFixed(1)}%`, color: stats.winRate >= 50 ? '#10b981' : '#ef4444' },
          { label: 'Profit Factor', value: fmtPf(stats.pf),     color: '#e5e5e5' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#18181b]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 hover:bg-[#18181b]/60 transition-all">
            <p className="text-[10px] text-[#8c8c8c] uppercase tracking-wider font-semibold mb-2">{stat.label}</p>
            <p className="text-2xl font-medium tracking-tight" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── Equity Curve ───────────────────────────────────────────────── */}
      <div className="bg-[#18181b]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-sm font-medium text-[#e5e5e5]">Equity Curve</h3>
            <p className="text-[10px] text-[#8c8c8c] mt-0.5">
              {stats.total} trades · Starting ${account.startingBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg border ${isGrowth ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20' : 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20'}`}>
              {isGrowth ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {fmt(stats.totalPnl)} all-time
            </span>
          </div>
        </div>

        <div className="h-[280px] w-full">
          {equityCurve.length >= 2 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityCurve} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={isGrowth ? '#10b981' : '#ef4444'} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={isGrowth ? '#10b981' : '#ef4444'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#8c8c8c"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={8}
                />
                <YAxis
                  stroke="#8c8c8c"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  width={70}
                  tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 14px' }}
                  formatter={(v: any) => [`$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 'Balance']}
                  labelStyle={{ color: '#8c8c8c', fontSize: '11px', marginBottom: '4px' }}
                  itemStyle={{ color: '#e5e5e5', fontWeight: 600 }}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke={isGrowth ? '#10b981' : '#ef4444'}
                  strokeWidth={2.5}
                  fill="url(#eqGrad)"
                  dot={equityCurve.length <= 10 ? { fill: isGrowth ? '#10b981' : '#ef4444', r: 3, strokeWidth: 0 } : false}
                  activeDot={{ r: 5, fill: isGrowth ? '#10b981' : '#ef4444', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#8c8c8c]" />
              </div>
              <p className="text-sm font-medium text-[#e5e5e5]">No trades logged yet</p>
              <p className="text-xs text-[#8c8c8c]">Your equity curve will appear here once you log trades.</p>
              <button
                onClick={() => navigate('/dashboard/journal')}
                className="mt-2 px-4 py-2 bg-[#d97757]/10 hover:bg-[#d97757]/20 border border-[#d97757]/20 text-[#d97757] rounded-lg text-xs font-semibold transition-colors"
              >
                Log First Trade
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Stats Row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Trades', value: stats.total.toString() },
          { label: 'Winning Trades', value: stats.wins.toString(), color: '#10b981' },
          { label: 'Losing Trades', value: stats.losses.toString(), color: '#ef4444' },
          { label: 'Avg R-Multiple', value: `${stats.avgR.toFixed(2)}R` },
        ].map((s, i) => (
          <div key={i} className="bg-[#18181b]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 hover:bg-[#18181b]/60 transition-all">
            <p className="text-[10px] text-[#8c8c8c] uppercase tracking-wider font-semibold mb-2">{s.label}</p>
            <p className="text-2xl font-medium tracking-tight" style={{ color: s.color || '#e5e5e5' }}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
