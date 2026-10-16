import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { TrendingUp, Target, Brain, Compass, Clock, Activity, Zap, FileSpreadsheet } from 'lucide-react';
import type { Trade } from '../data/mockData';

// ─── Helpers ────────────────────────────────────────────────────────────────
function groupBy<T>(arr: T[], key: (item: T) => string) {
  return arr.reduce((acc, item) => {
    const k = key(item) || 'Unknown';
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

function computeStats(trades: Trade[]) {
  const closed = trades.filter(t => t.result !== 'Break Even' || t.pnl !== 0);
  const wins = closed.filter(t => t.result === 'Win');
  const losses = closed.filter(t => t.result === 'Loss');
  const totalPnl = closed.reduce((s, t) => s + t.pnl, 0);
  const avgWin = wins.length ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
  const avgLoss = losses.length ? losses.reduce((s, t) => s + t.pnl, 0) / losses.length : 0;
  const grossWin = wins.reduce((s, t) => s + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
  const profitFactor = grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? Infinity : 0;
  const winRate = closed.length ? (wins.length / closed.length) * 100 : 0;
  const avgR = closed.length ? closed.reduce((s, t) => s + (t.rr || 0), 0) / closed.length : 0;
  return { closed, wins, losses, totalPnl, avgWin, avgLoss, profitFactor, winRate, avgR };
}

function groupStats(trades: Trade[], key: (t: Trade) => string) {
  const groups = groupBy(trades, key);
  return Object.entries(groups).map(([name, ts]) => {
    const s = computeStats(ts);
    return { name, count: ts.length, ...s };
  }).sort((a, b) => b.totalPnl - a.totalPnl);
}

// ─── Reusable Group Table ────────────────────────────────────────────────────
function GroupTable({ data }: { data: ReturnType<typeof groupStats> }) {
  if (!data.length) return <EmptyState />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5">
            <th className="text-left px-4 py-3 text-[10px] font-bold text-[#8c8c8c] uppercase tracking-wider">Name</th>
            <th className="text-right px-4 py-3 text-[10px] font-bold text-[#8c8c8c] uppercase tracking-wider">Trades</th>
            <th className="text-right px-4 py-3 text-[10px] font-bold text-[#8c8c8c] uppercase tracking-wider">Win Rate</th>
            <th className="text-right px-4 py-3 text-[10px] font-bold text-[#8c8c8c] uppercase tracking-wider">Avg R</th>
            <th className="text-right px-4 py-3 text-[10px] font-bold text-[#8c8c8c] uppercase tracking-wider">Profit Factor</th>
            <th className="text-right px-4 py-3 text-[10px] font-bold text-[#8c8c8c] uppercase tracking-wider">Avg Win</th>
            <th className="text-right px-4 py-3 text-[10px] font-bold text-[#8c8c8c] uppercase tracking-wider">Avg Loss</th>
            <th className="text-right px-4 py-3 text-[10px] font-bold text-[#8c8c8c] uppercase tracking-wider">Net P&L</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {data.map(row => (
            <tr key={row.name} className="hover:bg-white/[0.02] transition-colors group">
              <td className="px-4 py-4 font-medium text-[#e5e5e5]">{row.name}</td>
              <td className="px-4 py-4 text-right text-[#8c8c8c]">{row.count}</td>
              <td className="px-4 py-4 text-right">
                <span className={`font-medium ${row.winRate >= 50 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                  {row.winRate.toFixed(1)}%
                </span>
              </td>
              <td className="px-4 py-4 text-right text-[#e5e5e5]">{row.avgR.toFixed(2)}R</td>
              <td className="px-4 py-4 text-right text-[#e5e5e5]">
                {row.profitFactor === Infinity ? '∞' : row.profitFactor.toFixed(2)}
              </td>
              <td className="px-4 py-4 text-right text-[#10b981]">
                {row.avgWin > 0 ? `+$${row.avgWin.toFixed(0)}` : '—'}
              </td>
              <td className="px-4 py-4 text-right text-[#ef4444]">
                {row.avgLoss < 0 ? `-$${Math.abs(row.avgLoss).toFixed(0)}` : '—'}
              </td>
              <td className={`px-4 py-4 text-right font-semibold ${row.totalPnl >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                {row.totalPnl >= 0 ? '+' : ''}${row.totalPnl.toFixed(0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-[#8c8c8c]">
      <LineChart className="w-10 h-10 mb-4 opacity-30" />
      <p className="text-sm font-medium text-[#e5e5e5] mb-1">No trade data yet</p>
      <p className="text-xs">Log trades in the Journal to unlock analytics.</p>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function Analysis() {
  const { trades, accounts, activeAccountId } = useStore();
  const account = accounts.find(a => a.id === activeAccountId) || accounts[0];
  const [activeTab, setActiveTab] = useState('Performance');

  const tabs = [
    { id: 'Performance', icon: TrendingUp },
    { id: 'Risk', icon: Target },
    { id: 'Execution', icon: Zap },
    { id: 'Psychology', icon: Brain },
    { id: 'Strategy', icon: Compass },
    { id: 'Session', icon: Clock },
    { id: 'Instrument', icon: Activity },
    { id: 'Timeframe', icon: LineChart },
  ];

  const overall = useMemo(() => computeStats(trades), [trades]);
  const byStrategy = useMemo(() => groupStats(trades, t => t.strategy || 'No Strategy'), [trades]);
  const bySession   = useMemo(() => groupStats(trades, t => t.session   || 'No Session'),   [trades]);
  const byInstrument = useMemo(() => groupStats(trades, t => t.instrument || 'Unknown'), [trades]);
  const byTimeframe  = useMemo(() => groupStats(trades, t => t.timeframe  || 'Unknown'), [trades]);
  const byExecution  = useMemo(() => groupStats(trades, t => t.executionQuality || 'Unknown'), [trades]);
  const byPsych      = useMemo(() => groupStats(trades, t => t.emotionBefore || 'Not Logged'), [trades]);

  const best = (arr: ReturnType<typeof groupStats>) => arr[0]?.name ?? '—';
  const worst = (arr: ReturnType<typeof groupStats>) => arr[arr.length - 1]?.name ?? '—';

  const renderTabContent = () => {
    switch (activeTab) {

      // ── Performance ──────────────────────────────────────────────────────
      case 'Performance': {
        if (!trades.length) return <EmptyState />;
        const kpis = [
          { label: 'Best Strategy',   value: best(byStrategy) },
          { label: 'Worst Strategy',  value: worst(byStrategy) },
          { label: 'Best Session',    value: best(bySession) },
          { label: 'Worst Session',   value: worst(bySession) },
          { label: 'Best Instrument', value: best(byInstrument) },
          { label: 'Worst Instrument',value: worst(byInstrument) },
          { label: 'Average R',       value: `${overall.avgR.toFixed(2)}R` },
          { label: 'Total Trades',    value: `${overall.closed.length}` },
          { label: 'Win Rate',        value: `${overall.winRate.toFixed(1)}%` },
          { label: 'Profit Factor',   value: overall.profitFactor === Infinity ? '∞' : overall.profitFactor.toFixed(2) },
          { label: 'Avg Win',         value: overall.avgWin > 0 ? `+$${overall.avgWin.toFixed(0)}` : '—' },
          { label: 'Avg Loss',        value: overall.avgLoss < 0 ? `-$${Math.abs(overall.avgLoss).toFixed(0)}` : '—' },
        ];
        return (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {kpis.map(k => (
                <div key={k.label} className="bg-[#18181b]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 hover:bg-[#18181b]/60 transition-all">
                  <p className="text-[10px] text-[#8c8c8c] uppercase tracking-wider font-semibold mb-2">{k.label}</p>
                  <p className="text-xl font-medium tracking-tight text-[#e5e5e5]">{k.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-[#18181b]/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5">
                <h3 className="text-sm font-medium text-[#8c8c8c]">Net P&amp;L by Strategy</h3>
              </div>
              <GroupTable data={byStrategy} />
            </div>
          </>
        );
      }

      // ── Risk ─────────────────────────────────────────────────────────────
      case 'Risk': {
        if (!trades.length) return <EmptyState />;
        const avgRisk = trades.length ? trades.reduce((s, t) => s + (t.riskAmount || 0), 0) / trades.length : 0;
        const maxDD = Math.min(...trades.map(t => t.pnl));
        return (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Avg Risk/Trade', value: `$${avgRisk.toFixed(0)}` },
                { label: 'Avg R Multiple', value: `${overall.avgR.toFixed(2)}R` },
                { label: 'Max Single Loss', value: `$${Math.abs(maxDD).toFixed(0)}` },
                { label: 'Profit Factor', value: overall.profitFactor === Infinity ? '∞' : overall.profitFactor.toFixed(2) },
              ].map(k => (
                <div key={k.label} className="bg-[#18181b]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 hover:bg-[#18181b]/60 transition-all">
                  <p className="text-[10px] text-[#8c8c8c] uppercase tracking-wider font-semibold mb-2">{k.label}</p>
                  <p className="text-xl font-medium tracking-tight text-[#e5e5e5]">{k.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-[#18181b]/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5">
                <h3 className="text-sm font-medium text-[#8c8c8c]">Risk breakdown by Instrument</h3>
              </div>
              <GroupTable data={byInstrument} />
            </div>
          </>
        );
      }

      // ── Execution ─────────────────────────────────────────────────────────
      case 'Execution': {
        if (!trades.length) return <EmptyState />;
        return (
          <div className="bg-[#18181b]/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h3 className="text-sm font-medium text-[#8c8c8c]">Performance by Execution Quality</h3>
            </div>
            <GroupTable data={byExecution} />
          </div>
        );
      }

      // ── Psychology ───────────────────────────────────────────────────────
      case 'Psychology': {
        if (!trades.length) return <EmptyState />;
        return (
          <div className="bg-[#18181b]/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h3 className="text-sm font-medium text-[#8c8c8c]">Performance by Pre-Trade Emotion</h3>
            </div>
            <GroupTable data={byPsych} />
          </div>
        );
      }

      // ── Strategy ─────────────────────────────────────────────────────────
      case 'Strategy':
        return (
          <div className="bg-[#18181b]/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h3 className="text-sm font-medium text-[#8c8c8c]">Performance by Strategy</h3>
            </div>
            <GroupTable data={byStrategy} />
          </div>
        );

      // ── Session ───────────────────────────────────────────────────────────
      case 'Session':
        return (
          <div className="bg-[#18181b]/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h3 className="text-sm font-medium text-[#8c8c8c]">Performance by Trading Session</h3>
            </div>
            <GroupTable data={bySession} />
          </div>
        );

      // ── Instrument ────────────────────────────────────────────────────────
      case 'Instrument':
        return (
          <div className="bg-[#18181b]/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h3 className="text-sm font-medium text-[#8c8c8c]">Performance by Instrument</h3>
            </div>
            <GroupTable data={byInstrument} />
          </div>
        );

      // ── Timeframe ─────────────────────────────────────────────────────────
      case 'Timeframe':
        return (
          <div className="bg-[#18181b]/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h3 className="text-sm font-medium text-[#8c8c8c]">Performance by Timeframe</h3>
            </div>
            <GroupTable data={byTimeframe} />
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <p className="text-[10px] text-[#8c8c8c] uppercase tracking-wider font-semibold mb-1">Deep Dive</p>
          <h1 className="text-2xl font-medium tracking-tight text-[#e5e5e5]">Analytics</h1>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-[#8c8c8c]">{trades.length} trades analysed</span>
          <span className="px-4 py-2 rounded-full text-xs font-medium bg-[#18181b]/50 border border-white/10 text-[#d97757] backdrop-blur-sm">
            {account?.name || 'Evaluation'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-lg whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#d97757]/10 text-[#d97757] border border-[#d97757]/20'
                : 'text-[#8c8c8c] border border-transparent hover:text-[#e5e5e5] hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.id}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="pt-2">{renderTabContent()}</div>
    </div>
  );
}
