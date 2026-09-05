import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, BarChart2, Target, Calendar as CalendarIcon } from 'lucide-react';
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameDay, isToday, isWeekend, getDay
} from 'date-fns';

export default function Calendar() {
  const { trades, accounts, activeAccountId } = useStore();
  const account = accounts.find(a => a.id === activeAccountId) || accounts[0];
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad to start on Sunday
  const startPad = getDay(monthStart);
  const leadingBlanks = Array.from({ length: startPad });

  // Monthly aggregations
  const monthlyStats = useMemo(() => {
    const monthTrades = trades.filter(t => {
      const d = new Date(t.date);
      return d >= monthStart && d <= monthEnd;
    });
    const pnl = monthTrades.reduce((s, t) => s + t.pnl, 0);
    const wins = monthTrades.filter(t => t.result === 'Win').length;
    const losses = monthTrades.filter(t => t.result === 'Loss').length;
    const winDays = daysInMonth.filter(day => {
      const dayTrades = trades.filter(t => isSameDay(new Date(t.date), day));
      return dayTrades.length > 0 && dayTrades.reduce((s, t) => s + t.pnl, 0) > 0;
    }).length;
    const lossDays = daysInMonth.filter(day => {
      const dayTrades = trades.filter(t => isSameDay(new Date(t.date), day));
      return dayTrades.length > 0 && dayTrades.reduce((s, t) => s + t.pnl, 0) < 0;
    }).length;
    const winRate = (wins + losses) > 0 ? (wins / (wins + losses)) * 100 : 0;
    const avgWin = wins > 0 ? monthTrades.filter(t => t.result === 'Win').reduce((s, t) => s + t.pnl, 0) / wins : 0;
    const avgLoss = losses > 0 ? monthTrades.filter(t => t.result === 'Loss').reduce((s, t) => s + t.pnl, 0) / losses : 0;
    const grossWin = monthTrades.filter(t => t.result === 'Win').reduce((s, t) => s + t.pnl, 0);
    const grossLoss = Math.abs(monthTrades.filter(t => t.result === 'Loss').reduce((s, t) => s + t.pnl, 0));
    const pf = grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? Infinity : 0;
    return { pnl, wins, losses, winDays, lossDays, winRate, avgWin, avgLoss, pf, count: monthTrades.length };
  }, [trades, currentDate]);

  const selectedDayTrades = useMemo(() => {
    if (!selectedDay) return [];
    return trades.filter(t => isSameDay(new Date(t.date), selectedDay));
  }, [selectedDay, trades]);

  const getDayData = (day: Date) => {
    const dayTrades = trades.filter(t => isSameDay(new Date(t.date), day));
    const pnl = dayTrades.reduce((s, t) => s + t.pnl, 0);
    return { trades: dayTrades, pnl, count: dayTrades.length };
  };

  return (
    <div className="space-y-6 pb-12 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div>
          <p className="text-[10px] text-[#8c8c8c] uppercase tracking-wider font-semibold mb-1">Trading Calendar</p>
          <h1 className="text-2xl font-medium tracking-tight text-[#e5e5e5]">
            {format(currentDate, 'MMMM yyyy')}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 text-xs font-medium text-[#d97757] bg-[#d97757]/10 border border-[#d97757]/20 rounded-full">
            {account?.name || 'Evaluation'}
          </span>
          <div className="flex items-center gap-1 bg-[#18181b]/60 border border-white/5 rounded-xl p-1">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
              <ChevronLeft className="w-4 h-4 text-[#8c8c8c]" />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-xs font-medium text-[#8c8c8c] hover:text-white transition-colors">
              Today
            </button>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
              <ChevronRight className="w-4 h-4 text-[#8c8c8c]" />
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Stats Bar (Topstep style) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          {
            label: 'Monthly P&L',
            value: `${monthlyStats.pnl >= 0 ? '+' : ''}$${Math.abs(monthlyStats.pnl).toLocaleString(undefined, { minimumFractionDigits: 0 })}`,
            color: monthlyStats.pnl >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]',
            icon: monthlyStats.pnl >= 0 ? TrendingUp : TrendingDown,
            iconColor: monthlyStats.pnl >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]',
          },
          {
            label: 'Win Days',
            value: `${monthlyStats.winDays}`,
            sub: `vs ${monthlyStats.lossDays} loss days`,
            color: 'text-[#10b981]',
            icon: CalendarIcon,
            iconColor: 'text-[#10b981]',
          },
          {
            label: 'Win Rate',
            value: `${monthlyStats.winRate.toFixed(1)}%`,
            color: monthlyStats.winRate >= 50 ? 'text-[#10b981]' : 'text-[#ef4444]',
            icon: Target,
            iconColor: 'text-[#d97757]',
          },
          {
            label: 'Avg Win',
            value: monthlyStats.avgWin > 0 ? `+$${monthlyStats.avgWin.toFixed(0)}` : '—',
            color: 'text-[#10b981]',
            icon: BarChart2,
            iconColor: 'text-[#10b981]',
          },
          {
            label: 'Avg Loss',
            value: monthlyStats.avgLoss < 0 ? `-$${Math.abs(monthlyStats.avgLoss).toFixed(0)}` : '—',
            color: 'text-[#ef4444]',
            icon: BarChart2,
            iconColor: 'text-[#ef4444]',
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#18181b]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-4 flex flex-col gap-2 hover:bg-[#18181b]/60 transition-all">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-[#8c8c8c] uppercase tracking-wider font-semibold">{stat.label}</p>
              <stat.icon className={`w-4 h-4 ${stat.iconColor} opacity-60`} />
            </div>
            <p className={`text-2xl font-medium tracking-tight ${stat.color}`}>{stat.value}</p>
            {stat.sub && <p className="text-[10px] text-[#8c8c8c]">{stat.sub}</p>}
          </div>
        ))}
      </div>

      {/* Calendar Grid + Day Detail */}
      <div className="flex gap-6">
        {/* Calendar */}
        <div className="flex-1 bg-[#18181b]/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-white/5">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="py-3 text-center text-[10px] font-bold text-[#8c8c8c] uppercase tracking-widest">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {leadingBlanks.map((_, i) => (
              <div key={`blank-${i}`} className="aspect-[4/3] border-b border-r border-white/[0.04] bg-black/10" />
            ))}

            {daysInMonth.map((day) => {
              const { trades: dayTrades, pnl, count } = getDayData(day);
              const hasTrades = count > 0;
              const isProfit = pnl > 0;
              const isLoss = pnl < 0;
              const isTodayDay = isToday(day);
              const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
              const isWeekendDay = isWeekend(day);

              return (
                <div
                  key={day.toString()}
                  onClick={() => hasTrades ? setSelectedDay(isSelected ? null : day) : setSelectedDay(null)}
                  className={`
                    aspect-[4/3] border-b border-r border-white/[0.04] relative flex flex-col p-2 transition-all duration-200
                    ${hasTrades ? 'cursor-pointer' : 'cursor-default'}
                    ${isWeekendDay && !hasTrades ? 'bg-black/20' : ''}
                    ${isSelected ? 'ring-2 ring-[#d97757] ring-inset z-10' : ''}
                    ${!hasTrades ? 'hover:bg-white/[0.02]' : isProfit ? 'hover:brightness-110' : 'hover:brightness-110'}
                  `}
                  style={
                    hasTrades
                      ? isProfit
                        ? { backgroundColor: `rgba(16,185,129,${Math.min(0.15 + (pnl / 5000) * 0.3, 0.5)})` }
                        : { backgroundColor: `rgba(239,68,68,${Math.min(0.15 + (Math.abs(pnl) / 5000) * 0.3, 0.5)})` }
                      : {}
                  }
                >
                  {/* Date number */}
                  <div className="flex items-center justify-between mb-auto">
                    <span className={`
                      text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full
                      ${isTodayDay ? 'bg-[#d97757] text-[#131314] font-bold' : hasTrades ? (isProfit ? 'text-[#10b981]' : 'text-[#ef4444]') : 'text-[#8c8c8c]'}
                    `}>
                      {format(day, 'd')}
                    </span>
                    {count > 1 && (
                      <span className="text-[9px] font-bold text-[#8c8c8c] bg-black/20 px-1.5 py-0.5 rounded">
                        {count}t
                      </span>
                    )}
                  </div>

                  {/* P&L amount */}
                  {hasTrades && (
                    <div className="mt-auto">
                      <p className={`text-xs font-bold tracking-tight ${isProfit ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                        {isProfit ? '+' : '-'}${Math.abs(pnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Day Detail Panel */}
        <div className={`w-72 flex-shrink-0 transition-all duration-300 ${selectedDay ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {selectedDay && (
            <div className="bg-[#18181b]/60 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden sticky top-6">
              <div className="p-5 border-b border-white/5">
                <p className="text-[10px] text-[#8c8c8c] uppercase tracking-wider font-semibold mb-1">Day Detail</p>
                <h3 className="text-lg font-medium tracking-tight text-[#e5e5e5]">
                  {format(selectedDay, 'EEEE, MMM d')}
                </h3>
                <p className={`text-2xl font-medium tracking-tight mt-2 ${selectedDayTrades.reduce((s, t) => s + t.pnl, 0) >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                  {selectedDayTrades.reduce((s, t) => s + t.pnl, 0) >= 0 ? '+' : ''}${selectedDayTrades.reduce((s, t) => s + t.pnl, 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                </p>
              </div>

              <div className="divide-y divide-white/[0.04] max-h-[50vh] overflow-y-auto">
                {selectedDayTrades.map((trade) => (
                  <div key={trade.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-medium text-[#e5e5e5]">{trade.instrument}</p>
                        <p className="text-[10px] text-[#8c8c8c] mt-0.5">
                          {trade.direction} · {trade.strategy || '—'} · {format(new Date(trade.date), 'h:mm a')}
                        </p>
                      </div>
                      <span className={`text-xs font-bold ${trade.pnl >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                        {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        trade.result === 'Win'
                          ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20'
                          : trade.result === 'Loss'
                          ? 'bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20'
                          : 'bg-white/5 text-[#8c8c8c] border border-white/10'
                      }`}>
                        {trade.result}
                      </span>
                      <span className="text-[10px] text-[#8c8c8c]">{trade.rr}R</span>
                      {trade.executionQuality && (
                        <span className="text-[10px] text-[#8c8c8c]">· {trade.executionQuality}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
