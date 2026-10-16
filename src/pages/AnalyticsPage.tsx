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
    <div className="w-full max-w-[1720px] mx-auto select-none font-sans text-[#f0f3f8] pb-12 space-y-4">
      {/* ── 1. Top Zerodha Header Strip ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1e2638]">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-[#f0f3f8] flex items-center gap-2">
            <span>Reports & Performance</span>
          </h1>
          <p className="text-xs text-[#788296] mt-0.5">Audited mathematical edge, win-rate & session breakdown</p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-2.5 py-1 text-xs text-[#788296] hover:text-[#f0f3f8] border border-[#1e2638] hover:border-[#387ed1] rounded transition-colors flex items-center gap-1.5 self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Statement</span>
        </button>
      </div>

      {/* ── 2. Flat Inline KPI Strip ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 border-b border-[#1e2638] text-xs">
        <div>
          <span className="text-[#788296] text-[11px] block">Win Rate</span>
          <span className="text-lg font-bold font-mono text-[#00c087]">{metrics.win_rate}%</span>
          <span className="text-[10px] text-[#58647a] block mt-0.5">Profitable trade exits</span>
        </div>

        <div>
          <span className="text-[#788296] text-[11px] block">Profit Factor</span>
          <span className="text-lg font-bold font-mono text-[#f0f3f8]">{metrics.profit_factor}</span>
          <span className="text-[10px] text-[#58647a] block mt-0.5">Gross profit / loss</span>
        </div>

        <div>
          <span className="text-[#788296] text-[11px] block">Max Drawdown</span>
          <span className="text-lg font-bold font-mono text-[#df514c]">{metrics.max_drawdown_percent.toFixed(1)}%</span>
          <span className="text-[10px] text-[#58647a] block mt-0.5">Peak-to-trough drop</span>
        </div>

        <div>
          <span className="text-[#788296] text-[11px] block">Overall Return</span>
          <span className={`text-lg font-bold font-mono ${metrics.overall_return_percent >= 0 ? 'text-[#00c087]' : 'text-[#df514c]'}`}>
            {metrics.overall_return_percent >= 0 ? '+' : ''}{metrics.overall_return_percent.toFixed(2)}%
          </span>
          <span className="text-[10px] text-[#58647a] block mt-0.5">On ₹10L initial capital</span>
        </div>
      </div>

      {/* ── 3. Daily P&L Ledger (Edge-to-Edge Table) ────────────────────── */}
      <div className="pt-2">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1e2638]">
          <h2 className="text-sm font-semibold text-[#f0f3f8]">Daily Realized P&L</h2>
          <span className="text-xs text-[#788296] font-mono">
            {dailyData.length} Session{dailyData.length === 1 ? '' : 's'} Recorded
          </span>
        </div>

        {dailyData.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#58647a]">
            No completed trade exits recorded yet to generate daily P&L statements.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1e2638] text-[#788296] text-[11px] font-medium">
                  <th className="py-2.5 px-3">Trading Date</th>
                  <th className="py-2.5 px-3">Fills Executed</th>
                  <th className="py-2.5 px-3">Brokerage & Taxes</th>
                  <th className="py-2.5 px-3">Outcome</th>
                  <th className="py-2.5 px-3 text-right">Net Daily P&L (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2638]/60 font-mono">
                {dailyData.map((d, idx) => {
                  const isPos = d.pnl >= 0;
                  return (
                    <tr key={idx} className="hover:bg-[#121724] transition-colors">
                      <td className="py-2.5 px-3 font-sans font-medium text-[#f0f3f8]">{d.day}</td>
                      <td className="py-2.5 px-3 text-[#788296]">{d.count} fills</td>
                      <td className="py-2.5 px-3 text-[#788296]">₹{fmt(d.charges)}</td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isPos
                            ? 'bg-[#00c087]/15 text-[#00c087] border border-[#00c087]/30'
                            : 'bg-[#df514c]/15 text-[#df514c] border border-[#df514c]/30'
                        }`}>
                          {isPos ? 'PROFIT' : 'LOSS'}
                        </span>
                      </td>
                      <td className={`py-2.5 px-3 text-right font-semibold ${isPos ? 'text-[#00c087]' : 'text-[#df514c]'}`}>
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
      <div className="pt-4 border-t border-[#1e2638]">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1e2638]">
          <h2 className="text-sm font-semibold text-[#f0f3f8]">Monthly Breakdown</h2>
        </div>

        {monthlyData.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#58647a]">
            No monthly performance data yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1e2638] text-[#788296] text-[11px] font-medium font-mono">
                  <th className="py-2.5 px-3">Month</th>
                  <th className="py-2.5 px-3">Total Fills</th>
                  <th className="py-2.5 px-3">Net Return %</th>
                  <th className="py-2.5 px-3 text-right">Net P&L (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2638]/60 font-mono">
                {monthlyData.map((m, idx) => (
                  <tr key={idx} className="hover:bg-[#121724] transition-colors">
                    <td className="py-2.5 px-3 font-sans font-medium text-[#f0f3f8]">{m.month}</td>
                    <td className="py-2.5 px-3 text-[#788296]">{m.trades} trades</td>
                    <td className={`py-2.5 px-3 font-medium ${m.ret >= 0 ? 'text-[#00c087]' : 'text-[#df514c]'}`}>
                      {m.ret >= 0 ? '+' : ''}{m.ret.toFixed(2)}%
                    </td>
                    <td className={`py-2.5 px-3 text-right font-semibold ${m.pnl >= 0 ? 'text-[#00c087]' : 'text-[#df514c]'}`}>
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
