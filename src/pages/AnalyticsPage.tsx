import React from 'react';
import { useTradingStore } from '../store/useTradingStore';
import { 
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Cell 
} from 'recharts';
import { PieChart as PieIcon, Award, Percent, TrendingUp, TrendingDown, ShieldAlert, Download } from 'lucide-react';

export default function AnalyticsPage() {
  const { getMetrics, trades, positions } = useTradingStore();
  const metrics = getMetrics();

  // Derive real daily realized P&L from executed trades
  const dailyMap = new Map<string, number>();
  trades.forEach((t) => {
    const d = new Date(t.trade_time).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
    });
    const net = (t.realized_pnl || 0) - (t.charges?.total_charges || 0);
    dailyMap.set(d, (dailyMap.get(d) || 0) + net);
  });

  const dailyData: { day: string; pnl: number }[] = [];
  dailyMap.forEach((pnl, day) => {
    dailyData.push({ day, pnl: Math.round(pnl * 100) / 100 });
  });

  // If no historical closed trades yet, only show today if there is actual MTM
  if (dailyData.length === 0 && metrics.today_pnl !== 0) {
    const todayLabel = new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) + ' (Today)';
    dailyData.push({ day: todayLabel, pnl: Math.round((metrics.today_pnl || 0) * 100) / 100 });
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

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto select-none">
      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-[#0E1728]/95 border border-[#C6A15B]/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold font-serif text-white tracking-tight flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-[#C6A15B]" />
            <span>P&L Performance Analytics</span>
          </h2>
          <p className="text-xs text-[#8F9BAE] mt-0.5">
            Auditable breakdown of trading edge, win rate, expectancy, and drawdown · CNRX
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C6A15B] to-[#E2C889] hover:from-[#B38F46] hover:to-[#D4B774] text-[#0B1424] text-xs font-bold flex items-center gap-2 shadow-md transition-all active:scale-95 self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-[#0B1424]" />
          <span>Export Analytics Report</span>
        </button>
      </div>

      {/* ── Core KPI Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0B1424]/90 border border-[#C6A15B]/15 shadow-md">
          <span className="text-[10px] text-[#8F9BAE] uppercase font-bold tracking-wider">Win Rate</span>
          <p className="text-2xl font-mono font-bold text-[#10B981] mt-1">{metrics.win_rate}%</p>
          <span className="text-[10px] text-[#8F9BAE]">Percentage of profitable trade exits</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0B1424]/90 border border-[#C6A15B]/15 shadow-md">
          <span className="text-[10px] text-[#8F9BAE] uppercase font-bold tracking-wider">Profit Factor</span>
          <p className="text-2xl font-mono font-bold text-white mt-1">{metrics.profit_factor}</p>
          <span className="text-[10px] text-[#8F9BAE]">Gross Profits / Gross Losses</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0B1424]/90 border border-[#C6A15B]/15 shadow-md">
          <span className="text-[10px] text-[#8F9BAE] uppercase font-bold tracking-wider">Max Drawdown</span>
          <p className="text-2xl font-mono font-bold text-[#F43F5E] mt-1">{metrics.max_drawdown_percent.toFixed(1)}%</p>
          <span className="text-[10px] text-[#8F9BAE]">Peak-to-trough portfolio equity dip</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0B1424]/90 border border-[#C6A15B]/15 shadow-md">
          <span className="text-[10px] text-[#8F9BAE] uppercase font-bold tracking-wider">Overall Return %</span>
          <p className={`text-2xl font-mono font-bold mt-1 ${metrics.overall_return_percent >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
            {metrics.overall_return_percent >= 0 ? '+' : ''}{metrics.overall_return_percent.toFixed(2)}%
          </p>
          <span className="text-[10px] text-[#8F9BAE]">Net return on ₹10L initial capital</span>
        </div>
      </div>

      {/* ── Daily P&L Bar Chart ─────────────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-[#0E1728]/95 border border-[#C6A15B]/20 shadow-xl space-y-4 backdrop-blur-md">
        <div>
          <h3 className="text-sm font-bold font-serif text-white tracking-wide">Daily P&L Performance</h3>
          <p className="text-xs text-[#8F9BAE]">Daily verified trading gains and losses in Indian Rupees</p>
        </div>

        {dailyData.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#8F9BAE]">
            No completed trade exits recorded yet to generate daily P&L bars.
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid stroke="#1F2D48" strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="#8F9BAE" fontSize={11} />
                <YAxis
                  stroke="#8F9BAE"
                  fontSize={11}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1424', borderColor: 'rgba(198,161,91,0.25)', borderRadius: '10px', color: '#fff' }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'P&L']}
                />
                <Bar dataKey="pnl">
                  {dailyData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.pnl >= 0 ? '#10B981' : '#F43F5E'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── Monthly Performance Breakdown Table ─────────────────────────── */}
      <div className="p-5 rounded-2xl bg-[#0E1728]/95 border border-[#C6A15B]/20 shadow-xl space-y-4 backdrop-blur-md">
        <h3 className="text-sm font-bold font-serif text-white tracking-wide">Monthly Performance Statement</h3>

        {monthlyData.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#8F9BAE]">
            No monthly performance data yet. Execute and exit trades to build ledger history.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1F2D48] text-[#8F9BAE] text-[10px] uppercase font-semibold">
                  <th className="py-3 px-3">Month</th>
                  <th className="py-3 px-3">Total Fills</th>
                  <th className="py-3 px-3">Net Return %</th>
                  <th className="py-3 px-3 text-right">Net P&L (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2D48]/60 font-mono">
                {monthlyData.map((m, idx) => (
                  <tr key={idx} className="hover:bg-[#14223A]/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-white font-sans">{m.month}</td>
                    <td className="py-3 px-3 text-[#A1A8B3]">{m.trades} trades</td>
                    <td className={`py-3 px-3 font-bold ${m.ret >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                      {m.ret >= 0 ? '+' : ''}{m.ret.toFixed(2)}%
                    </td>
                    <td className={`py-3 px-3 text-right font-bold ${m.pnl >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                      {m.pnl >= 0 ? '+' : ''}₹{m.pnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
