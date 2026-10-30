import React from 'react';
import { useTradingStore } from '../store/useTradingStore';
import { Download, Layers } from 'lucide-react';

export default function AnalyticsPage() {
  const { getMetrics, trades } = useTradingStore();
  const metrics = getMetrics();

  // Derive real daily realized P&L from executed trades
  const dailyMap = new Map<string, { pnl: number; count: number; charges: number }>();
  trades.forEach((t: any) => {
    const tradeTime = t.trade_time || t.created_at || new Date().toISOString();
    const d = new Date(tradeTime).toLocaleDateString('en-IN', {
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
  trades.forEach((t: any) => {
    const tradeTime = t.trade_time || t.created_at || new Date().toISOString();
    const m = new Date(tradeTime).toLocaleDateString('en-IN', {
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
    <div className="w-full max-w-full mx-auto select-none font-sans text-[#111114] pb-12 space-y-6">
      {/* ── 1. Top Header Strip ─────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#D9E2F2]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-wider text-[#536CF0] uppercase font-bold">
              Audited Performance Suite · Quantitative Verification
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold tracking-tight text-[#00225A] flex items-center gap-2">
            <span>Reports & Performance</span>
          </h1>
          <p className="text-xs text-[#6B7A90] mt-1 font-mono">Audited mathematical edge, win-rate & session breakdown</p>
        </div>

        <button
          onClick={handleExportCSV}
          className="btn-secondary px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start lg:self-auto text-[#00225A] cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-[#00225A]" />
          <span>Download Statement</span>
        </button>
      </div>

      {/* ── 2. Bento KPI Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)] flex flex-col justify-between">
          <span className="text-[#6B7A90] text-[10px] font-mono uppercase tracking-wider font-semibold">Win Rate</span>
          <div className="my-2">
            <span className="text-3xl font-bold font-mono text-[#12B76A] tracking-tight tabular-nums block">{metrics.win_rate}%</span>
          </div>
          <span className="text-[11px] text-[#6B7A90] font-sans">Profitable trade exits</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)] flex flex-col justify-between">
          <span className="text-[#6B7A90] text-[10px] font-mono uppercase tracking-wider font-semibold">Profit Factor</span>
          <div className="my-2">
            <span className="text-3xl font-bold font-mono text-[#00225A] tracking-tight tabular-nums block">{metrics.profit_factor}</span>
          </div>
          <span className="text-[11px] text-[#6B7A90] font-sans">Gross profit / loss ratio</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)] flex flex-col justify-between">
          <span className="text-[#6B7A90] text-[10px] font-mono uppercase tracking-wider font-semibold">Max Drawdown</span>
          <div className="my-2">
            <span className="text-3xl font-bold font-mono text-[#D92D20] tracking-tight tabular-nums block">{metrics.max_drawdown_percent.toFixed(1)}%</span>
          </div>
          <span className="text-[11px] text-[#6B7A90] font-sans">Peak-to-trough drop</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)] flex flex-col justify-between">
          <span className="text-[#6B7A90] text-[10px] font-mono uppercase tracking-wider font-semibold">Overall Return</span>
          <div className="my-2">
            <span className={`text-3xl font-bold font-mono tracking-tight tabular-nums block ${metrics.overall_return_percent >= 0 ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
              {metrics.overall_return_percent >= 0 ? '+' : ''}{metrics.overall_return_percent.toFixed(2)}%
            </span>
          </div>
          <span className="text-[11px] text-[#6B7A90] font-sans">On ₹10L initial capital</span>
        </div>
      </div>

      {/* ── 3. Daily P&L Ledger ─────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-display font-bold text-[#00225A]">Daily Realized P&L</h2>
          <span className="text-xs text-[#00225A] font-mono px-2 py-0.5 rounded-md bg-[#EEF3FF] border border-[#D9E2F2] tabular-nums font-bold">
            {dailyData.length} Session{dailyData.length === 1 ? '' : 's'} Recorded
          </span>
        </div>

        {dailyData.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)]">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#EEF3FF] border border-[#D9E2F2] flex items-center justify-center text-[#536CF0] mb-3 shadow-sm">
              <Layers className="w-6 h-6" />
            </div>
            <p className="font-display text-base font-bold text-[#00225A]">No completed exits recorded</p>
            <p className="text-xs text-[#6B7A90] mt-1.5 font-mono max-w-md mx-auto">
              Completed trades will generate daily P&L statements with audited fee deductions.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)] overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F7F8FA] border-b border-[#D9E2F2] text-[#6B7A90] text-[10px] font-mono uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Trading Date</th>
                  <th className="py-3 px-4 font-semibold">Fills Executed</th>
                  <th className="py-3 px-4 font-semibold">Brokerage & Taxes</th>
                  <th className="py-3 px-4 font-semibold">Outcome</th>
                  <th className="py-3 px-4 font-semibold text-right">Net Daily P&L (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E2F2] font-mono">
                {dailyData.map((d, idx) => {
                  const isPos = d.pnl >= 0;
                  return (
                    <tr key={idx} className="hover:bg-[#F7F8FA] transition-colors">
                      <td className="py-3 px-4 font-sans font-medium text-[#00225A]">{d.day}</td>
                      <td className="py-3 px-4 text-[#6B7A90] tabular-nums">{d.count} fills</td>
                      <td className="py-3 px-4 text-[#6B7A90] tabular-nums">₹{fmt(d.charges)}</td>
                      <td className="py-3 px-4 font-sans">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                          isPos
                            ? 'bg-[#12B76A]/10 text-[#12B76A] border border-[#12B76A]/30'
                            : 'bg-[#FEE4E2] text-[#D92D20] border border-[#FECDCA]'
                        }`}>
                          {isPos ? 'PROFIT' : 'LOSS'}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right font-bold tabular-nums ${isPos ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
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
          <h2 className="text-base font-display font-bold text-[#00225A]">Monthly Breakdown</h2>
        </div>

        {monthlyData.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)]">
            <p className="text-xs text-[#6B7A90] font-mono">No monthly performance data yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)] overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F7F8FA] border-b border-[#D9E2F2] text-[#6B7A90] text-[10px] font-mono uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Month</th>
                  <th className="py-3 px-4 font-semibold">Total Fills</th>
                  <th className="py-3 px-4 font-semibold">Net Return %</th>
                  <th className="py-3 px-4 font-semibold text-right">Net P&L (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E2F2] font-mono">
                {monthlyData.map((m, idx) => (
                  <tr key={idx} className="hover:bg-[#F7F8FA] transition-colors">
                    <td className="py-3 px-4 font-sans font-medium text-[#00225A]">{m.month}</td>
                    <td className="py-3 px-4 text-[#6B7A90] tabular-nums">{m.trades} trades</td>
                    <td className={`py-3 px-4 font-semibold tabular-nums ${m.ret >= 0 ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
                      {m.ret >= 0 ? '+' : ''}{m.ret.toFixed(2)}%
                    </td>
                    <td className={`py-3 px-4 text-right font-bold tabular-nums ${m.pnl >= 0 ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
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
