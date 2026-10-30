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
    <div className="space-y-6 pb-12 max-w-[1400px] mx-auto text-[#111114]">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#D9E2F2] pb-6">
        <div>
          <p className="text-[10px] text-[#536CF0] uppercase tracking-wider font-semibold font-mono mb-1">Trading Calendar</p>
          <h1 className="text-2xl font-bold font-display tracking-tight text-[#00225A]">
            {format(currentDate, 'MMMM yyyy')}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 text-xs font-semibold text-[#00225A] bg-[#EEF3FF] border border-[#D9E2F2] rounded-full font-mono">
            {account?.name || 'Evaluation'}
          </span>
          <div className="flex items-center gap-1 bg-white border border-[#D9E2F2] rounded-xl p-1 shadow-xs">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 rounded-lg hover:bg-[#F7F8FA] transition-colors cursor-pointer">
              <ChevronLeft className="w-4 h-4 text-[#6B7A90]" />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-xs font-semibold text-[#6B7A90] hover:text-[#00225A] transition-colors cursor-pointer">
              Today
            </button>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 rounded-lg hover:bg-[#F7F8FA] transition-colors cursor-pointer">
              <ChevronRight className="w-4 h-4 text-[#6B7A90]" />
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 font-mono">
        {[
          {
            label: 'Monthly P&L',
            value: `${monthlyStats.pnl >= 0 ? '+' : ''}$${Math.abs(monthlyStats.pnl).toLocaleString(undefined, { minimumFractionDigits: 0 })}`,
            color: monthlyStats.pnl >= 0 ? 'text-[#12B76A]' : 'text-[#D92D20]',
            icon: monthlyStats.pnl >= 0 ? TrendingUp : TrendingDown,
            iconColor: monthlyStats.pnl >= 0 ? 'text-[#12B76A]' : 'text-[#D92D20]',
          },
          {
            label: 'Win Days',
            value: `${monthlyStats.winDays}`,
            sub: `vs ${monthlyStats.lossDays} loss days`,
            color: 'text-[#12B76A]',
            icon: CalendarIcon,
            iconColor: 'text-[#12B76A]',
          },
          {
            label: 'Win Rate',
            value: `${monthlyStats.winRate.toFixed(1)}%`,
            color: monthlyStats.winRate >= 50 ? 'text-[#12B76A]' : 'text-[#D92D20]',
            icon: Target,
            iconColor: 'text-[#536CF0]',
          },
          {
            label: 'Avg Win',
            value: monthlyStats.avgWin > 0 ? `+$${monthlyStats.avgWin.toFixed(0)}` : '—',
            color: 'text-[#12B76A]',
            icon: BarChart2,
            iconColor: 'text-[#12B76A]',
          },
          {
            label: 'Avg Loss',
            value: monthlyStats.avgLoss < 0 ? `-$${Math.abs(monthlyStats.avgLoss).toFixed(0)}` : '—',
            color: 'text-[#D92D20]',
            icon: BarChart2,
            iconColor: 'text-[#D92D20]',
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-[#D9E2F2] rounded-2xl p-4 flex flex-col gap-2 shadow-[0_2px_12px_rgba(0,34,90,0.04)]">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-[#6B7A90] uppercase tracking-wider font-semibold font-mono">{stat.label}</p>
              <stat.icon className={`w-4 h-4 ${stat.iconColor} opacity-75`} />
            </div>
            <p className={`text-2xl font-bold tracking-tight ${stat.color}`}>{stat.value}</p>
            {stat.sub && <p className="text-[10px] text-[#6B7A90]">{stat.sub}</p>}
          </div>
        ))}
      </div>

      {/* Calendar Grid + Day Detail */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar */}
        <div className="flex-1 bg-white border border-[#D9E2F2] rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,34,90,0.04)]">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-[#D9E2F2] bg-[#F7F8FA]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="py-3 text-center text-[10px] font-bold text-[#6B7A90] uppercase tracking-widest font-mono">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 font-mono">
            {leadingBlanks.map((_, i) => (
              <div key={`blank-${i}`} className="aspect-[4/3] border-b border-r border-[#D9E2F2] bg-[#F7F8FA]/50" />
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
                    aspect-[4/3] border-b border-r border-[#D9E2F2] relative flex flex-col p-2 transition-all duration-200
                    ${hasTrades ? 'cursor-pointer' : 'cursor-default'}
                    ${isWeekendDay && !hasTrades ? 'bg-[#F7F8FA]/30' : ''}
                    ${isSelected ? 'ring-2 ring-[#00225A] ring-inset z-10' : ''}
                    ${!hasTrades ? 'hover:bg-[#F7F8FA]' : 'hover:brightness-95'}
                  `}
                  style={
                    hasTrades
                      ? isProfit
                        ? { backgroundColor: `rgba(18,183,106,${Math.min(0.08 + (pnl / 5000) * 0.15, 0.25)})` }
                        : { backgroundColor: `rgba(217,45,32,${Math.min(0.08 + (Math.abs(pnl) / 5000) * 0.15, 0.25)})` }
                      : {}
                  }
                >
                  {/* Date number */}
                  <div className="flex items-center justify-between mb-auto">
                    <span className={`
                      text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full
                      ${isTodayDay ? 'bg-[#00225A] text-white font-bold' : hasTrades ? (isProfit ? 'text-[#12B76A] font-bold' : 'text-[#D92D20] font-bold') : 'text-[#6B7A90]'}
                    `}>
                      {format(day, 'd')}
                    </span>
                    {count > 1 && (
                      <span className="text-[9px] font-bold text-[#6B7A90] bg-[#EEF3FF] border border-[#D9E2F2] px-1.5 py-0.5 rounded">
                        {count}t
                      </span>
                    )}
                  </div>

                  {/* P&L amount */}
                  {hasTrades && (
                    <div className="mt-auto">
                      <p className={`text-xs font-bold tracking-tight ${isProfit ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
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
        <div className={`w-full lg:w-72 flex-shrink-0 transition-all duration-300 ${selectedDay ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {selectedDay && (
            <div className="bg-white border border-[#D9E2F2] rounded-2xl overflow-hidden sticky top-6 shadow-[0_2px_12px_rgba(0,34,90,0.04)]">
              <div className="p-5 border-b border-[#D9E2F2] bg-[#F7F8FA]">
                <p className="text-[10px] text-[#536CF0] uppercase tracking-wider font-semibold font-mono mb-1">Day Detail</p>
                <h3 className="text-lg font-bold font-display tracking-tight text-[#00225A]">
                  {format(selectedDay, 'EEEE, MMM d')}
                </h3>
                <p className={`text-2xl font-bold font-mono tracking-tight mt-2 ${selectedDayTrades.reduce((s, t) => s + t.pnl, 0) >= 0 ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
                  {selectedDayTrades.reduce((s, t) => s + t.pnl, 0) >= 0 ? '+' : ''}${selectedDayTrades.reduce((s, t) => s + t.pnl, 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                </p>
              </div>

              <div className="divide-y divide-[#D9E2F2] max-h-[50vh] overflow-y-auto">
                {selectedDayTrades.map((trade) => (
                  <div key={trade.id} className="p-4 hover:bg-[#F7F8FA] transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-semibold text-[#00225A]">{trade.instrument}</p>
                        <p className="text-[10px] text-[#6B7A90] font-mono mt-0.5">
                          {trade.direction} · {trade.strategy || '—'} · {format(new Date(trade.date), 'h:mm a')}
                        </p>
                      </div>
                      <span className={`text-xs font-bold font-mono ${trade.pnl >= 0 ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
                        {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono ${
                        trade.result === 'Win'
                          ? 'bg-[#12B76A]/10 text-[#12B76A] border border-[#12B76A]/20'
                          : trade.result === 'Loss'
                          ? 'bg-[#D92D20]/10 text-[#D92D20] border border-[#D92D20]/20'
                          : 'bg-[#F7F8FA] text-[#6B7A90] border border-[#D9E2F2]'
                      }`}>
                        {trade.result}
                      </span>
                      <span className="text-[10px] text-[#6B7A90] font-mono">{trade.rr}R</span>
                      {trade.executionQuality && (
                        <span className="text-[10px] text-[#6B7A90] font-mono">· {trade.executionQuality}</span>
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