import React from 'react';
import { useTradingStore } from '../store/useTradingStore';
import { Download, Layers } from 'lucide-react';

export default function AnalyticsPage() {
  const { getMetrics, trades } = useTradingStore();
  const metrics = getMetrics();

  // Derive real daily realized P&L from executed trades
  const dailyMap = new Map<string, { pnl: number; count: number; charges: number }>();
  trades.forEach((t) => {
    const d = new Date(t.trade_time).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const net = (t.realized_pnl || 0) - (t.charges?.total_charges || 0);
    const curr = dailyMap.get(d) || { pnl: 0, count: 0, charges: 0 };
    curr.pnl += net;
    curr.count += 1;
    curr.charges += t.charges?.total_charges || 0;
    dailyMap.set(d, curr);
  });

  const dailyData: { day: string; pnl: number; count: number; charges: number }[] = [];
  dailyMap.forEach((val, day) => {
    dailyData.push({
      day,
      pnl: Math.round(val.pnl * 100) / 100,
      count: val.count,
      charges: Math.round(val.charges * 100) / 100,
    });
  });

  if (dailyData.length === 0 && metrics.today_pnl !== 0) {
    const todayLabel = new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) + ' (Today)';
    dailyData.push({
      day: todayLabel,
      pnl: Math.round((metrics.today_pnl || 0) * 100) / 100,
      count: trades.length,
      charges: Math.round((metrics.total_brokerage_paid || 0) * 100) / 100,
    });
  }

  // Monthly breakdown derived strictly from actual executed trades
  const monthMap = new Map<string, { pnl: number; count: number }>();
  trades.forEach((t) => {
    const m = new Date(t.trade_time).toLocaleDateString('en-IN', {
      month: 'short',
      year: 'numeric',
    });
    const curr = monthMap.get(m) || { pnl: 0, count: 0 };
    curr.pnl += (t.realized_pnl || 0) - (t.charges?.total_charges || 0);
    curr.count += 1;
    monthMap.set(m, curr);
  });

  const monthlyData = Array.from(monthMap.entries()).map(([month, data]) => ({
    month,
    pnl: Math.round(data.pnl * 100) / 100,
    trades: data.count,
    ret: metrics.initial_capital > 0 ? (data.pnl / metrics.initial_capital) * 100 : 0,
  }));

  const handleExportCSV = () => {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Initial Virtual Capital', `₹${metrics.initial_capital}`],
      ['Current Account Equity', `₹${metrics.account_equity}`],
      ['Overall Net P&L', `₹${metrics.overall_net_pnl}`],
      ['Overall Return %', `${metrics.overall_return_percent}%`],
      ['Win Rate %', `${metrics.win_rate}%`],
      ['Profit Factor', `${metrics.profit_factor}`],
      ['Max Drawdown %', `${metrics.max_drawdown_percent}%`],
      ['Total Completed Trades', `${metrics.total_completed_trades}`],
      ['Total Brokerage & Taxes Paid', `₹${metrics.total_brokerage_paid}`],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(',')).map(r => r)].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `cnrx_performance_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fmt = (n: number) =>
    n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="w-full max-w-full mx-auto select-none font-sans text-[#F5F5F2] pb-12 space-y-6">
      {/* ── 1. Top Cendrix Header Strip ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#14223A]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-widest text-[#C6A15B] uppercase font-bold">
              Audited Performance Suite · Quantitative Verification
            </span>
          </div>
          <h1 className="text-2xl font-serif tracking-tight text-[#F5F5F2] flex items-center gap-2">
            <span>Reports & Performance</span>
          </h1>
          <p className="text-xs text-[#A1A8B3] mt-0.5">Audited mathematical edge, win-rate & session breakdown</p>
        </div>

        <button
          onClick={handleExportCSV}
          className="btn-cendrix-outline px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Statement</span>
        </button>
      </div>

      {/* ── 2. Cendrix KPI Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="cendrix-card p-4 rounded-xl border border-[#14223A]">
          <span className="text-[#6E7683] text-[11px] block font-mono uppercase">Win Rate</span>
          <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">{metrics.win_rate}%</span>
          <span className="text-[10px] text-[#A1A8B3] block mt-1">Profitable trade exits</span>
        </div>

        <div className="cendrix-card p-4 rounded-xl border border-[#14223A]">
          <span className="text-[#6E7683] text-[11px] block font-mono uppercase">Profit Factor</span>
          <span className="text-2xl font-bold font-mono text-[#F5F5F2] mt-1 block">{metrics.profit_factor}</span>
          <span className="text-[10px] text-[#A1A8B3] block mt-1">Gross profit / loss</span>
        </div>

        <div className="cendrix-card p-4 rounded-xl border border-[#14223A]">
          <span className="text-[#6E7683] text-[11px] block font-mono uppercase">Max Drawdown</span>
          <span className="text-2xl font-bold font-mono text-rose-400 mt-1 block">{metrics.max_drawdown_percent.toFixed(1)}%</span>
          <span className="text-[10px] text-[#A1A8B3] block mt-1">Peak-to-trough drop</span>
        </div>

        <div className="cendrix-card p-4 rounded-xl border border-[#14223A]">
          <span className="text-[#6E7683] text-[11px] block font-mono uppercase">Overall Return</span>
          <span className={`text-2xl font-bold font-mono mt-1 block ${metrics.overall_return_percent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {metrics.overall_return_percent >= 0 ? '+' : ''}{metrics.overall_return_percent.toFixed(2)}%
          </span>
          <span className="text-[10px] text-[#A1A8B3] block mt-1">On ₹10L initial capital</span>
        </div>
      </div>

      {/* ── 3. Daily P&L Ledger ────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-serif text-[#F5F5F2]">Daily Realized P&L</h2>
          <span className="text-xs text-[#A1A8B3] font-mono">
            {dailyData.length} Session{dailyData.length === 1 ? '' : 's'} Recorded
          </span>
        </div>

        {dailyData.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#6E7683] cendrix-card rounded-xl border border-[#14223A] font-mono">
            No completed trade exits recorded yet to generate daily P&L statements.
          </div>
        ) : (
          <div className="overflow-x-auto cendrix-card rounded-xl border border-[#14223A]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#14223A] text-[#6E7683] text-[11px] font-mono uppercase bg-[#0B1424]">
                  <th className="py-3 px-4">Trading Date</th>
                  <th className="py-3 px-4">Fills Executed</th>
                  <th className="py-3 px-4">Brokerage & Taxes</th>
                  <th className="py-3 px-4">Outcome</th>
                  <th className="py-3 px-4 text-right">Net Daily P&L (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#14223A] font-mono">
                {dailyData.map((d, idx) => {
                  const isPos = d.pnl >= 0;
                  return (
                    <tr key={idx} className="hover:bg-[#14223A]/40 transition-colors">
                      <td className="py-3 px-4 font-sans font-medium text-[#F5F5F2]">{d.day}</td>
                      <td className="py-3 px-4 text-[#A1A8B3]">{d.count} fills</td>
                      <td className="py-3 px-4 text-[#A1A8B3]">₹{fmt(d.charges)}</td>
                      <td className="py-3 px-4 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isPos
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}>
                          {isPos ? 'PROFIT' : 'LOSS'}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPos ? '+' : ''}₹{fmt(d.pnl)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 4. Monthly Statement Breakdown Table ─────────────────────────── */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-serif text-[#F5F5F2]">Monthly Breakdown</h2>
        </div>

        {monthlyData.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#6E7683] cendrix-card rounded-xl border border-[#14223A] font-mono">
            No monthly performance data yet.
          </div>
        ) : (
          <div className="overflow-x-auto cendrix-card rounded-xl border border-[#14223A]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#14223A] text-[#6E7683] text-[11px] font-mono uppercase bg-[#0B1424]">
                  <th className="py-3 px-4">Month</th>
                  <th className="py-3 px-4">Total Fills</th>
                  <th className="py-3 px-4">Net Return %</th>
                  <th className="py-3 px-4 text-right">Net P&L (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#14223A] font-mono">
                {monthlyData.map((m, idx) => (
                  <tr key={idx} className="hover:bg-[#14223A]/40 transition-colors">
                    <td className="py-3 px-4 font-sans font-medium text-[#F5F5F2]">{m.month}</td>
                    <td className="py-3 px-4 text-[#A1A8B3]">{m.trades} trades</td>
                    <td className={`py-3 px-4 font-semibold ${m.ret >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {m.ret >= 0 ? '+' : ''}{m.ret.toFixed(2)}%
                    </td>
                    <td className={`py-3 px-4 text-right font-bold ${m.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {m.pnl >= 0 ? '+' : ''}₹{fmt(m.pnl)}
                    </td>
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
