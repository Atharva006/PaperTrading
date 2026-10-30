import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Activity, Target, TrendingUp, Award, Calendar, DollarSign, Wallet, Shield, Zap } from 'lucide-react';

export default function Profile() {
  const { user, trades, accounts } = useStore();

  const stats = useMemo(() => {
    const totalTrades = trades.length;
    const winningTrades = trades.filter(t => t.pnl > 0);
    const losingTrades = trades.filter(t => t.pnl < 0);
    
    const winCount = winningTrades.length;
    const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;
    
    const grossProfit = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0));
    
    const netPnl = grossProfit - grossLoss;
    const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss) : (grossProfit > 0 ? 99 : 0);
    
    // Calculate live equity across all accounts
    const initialCapital = accounts.reduce((sum, acc) => sum + acc.startingBalance, 0);
    const currentCapital = initialCapital + netPnl;

    return { totalTrades, winRate, netPnl, profitFactor, currentCapital };
  }, [trades, accounts]);

  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Institutional Trader';
  const avatarUrl = user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=00225A&color=FFFFFF&size=128&bold=true`;
  const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently';

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in select-none pb-12 font-sans text-[#111114]">
      
      {/* Header Section */}
      <div className="bg-white border border-[#D9E2F2] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-[0_2px_12px_rgba(0,34,90,0.04)]">
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
          <img 
            src={avatarUrl} 
            alt="Profile Avatar" 
            className="w-20 h-20 rounded-2xl border border-[#D9E2F2] shadow-xs object-cover bg-[#F7F8FA]"
          />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#00225A] tracking-tight capitalize mb-1">{fullName}</h1>
            <p className="text-[#6B7A90] font-medium flex items-center justify-center md:justify-start gap-2 text-xs">
              <Shield className="w-4 h-4 text-[#536CF0]" /> Verified Operator &bull; Member since {joinDate}
            </p>
            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2.5">
              <span className="px-3 py-1 bg-[#F7F8FA] border border-[#D9E2F2] rounded-lg text-xs font-semibold text-[#00225A]">
                {user?.email}
              </span>
              <span className="px-3 py-1 bg-[#EEF3FF] border border-[#D9E2F2] rounded-lg text-xs font-semibold text-[#00225A] flex items-center gap-1 font-mono">
                <Zap className="w-3 h-3 text-[#536CF0]" /> INSTITUTIONAL SIMULATOR
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Lifetime Stats */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold font-display text-[#00225A] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#536CF0]" /> Performance Overview
          </h2>
          
          <div className="grid grid-cols-2 gap-3.5">
            <div className="bg-white border border-[#D9E2F2] rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,34,90,0.04)]">
              <p className="text-xs font-semibold text-[#6B7A90] mb-1.5 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-[#536CF0]" /> Net P&L
              </p>
              <p className={`text-2xl font-bold font-mono ${stats.netPnl >= 0 ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
                {stats.netPnl >= 0 ? '+' : '-'}₹{Math.abs(stats.netPnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            
            <div className="bg-white border border-[#D9E2F2] rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,34,90,0.04)]">
              <p className="text-xs font-semibold text-[#6B7A90] mb-1.5 uppercase tracking-wider flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-[#536CF0]" /> Win Rate
              </p>
              <p className="text-2xl font-bold font-mono text-[#00225A]">
                {stats.winRate.toFixed(1)}%
              </p>
            </div>
            
            <div className="bg-white border border-[#D9E2F2] rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,34,90,0.04)]">
              <p className="text-xs font-semibold text-[#6B7A90] mb-1.5 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-[#536CF0]" /> Profit Factor
              </p>
              <p className="text-2xl font-bold font-mono text-[#00225A]">
                {stats.profitFactor.toFixed(2)}
              </p>
            </div>

            <div className="bg-white border border-[#D9E2F2] rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,34,90,0.04)]">
              <p className="text-xs font-semibold text-[#6B7A90] mb-1.5 uppercase tracking-wider flex items-center gap-2">
                <Wallet className="w-3.5 h-3.5 text-[#536CF0]" /> Virtual Capital
              </p>
              <p className="text-2xl font-bold font-mono text-[#00225A]">
                ₹{stats.currentCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Account Insights */}
        <div className="space-y-4">
          <h2 className="text-base font-bold font-display text-[#00225A] flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#536CF0]" /> Portfolio Summary
          </h2>
          
          <div className="bg-white border border-[#D9E2F2] rounded-2xl p-5 space-y-4 shadow-[0_2px_12px_rgba(0,34,90,0.04)]">
            <div className="pb-4 border-b border-[#D9E2F2]">
              <p className="text-[10px] font-semibold text-[#6B7A90] uppercase tracking-wider mb-1">Execution Mode</p>
              <p className="text-base font-bold font-display text-[#00225A]">Simulated Feed</p>
            </div>
            <div className="pb-4 border-b border-[#D9E2F2]">
              <p className="text-[10px] font-semibold text-[#6B7A90] uppercase tracking-wider mb-1">Total Trades Executed</p>
              <p className="text-2xl font-bold font-mono text-[#00225A]">{stats.totalTrades}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[#6B7A90] uppercase tracking-wider mb-1">Operator ID</p>
              <p className="text-xs font-mono text-[#6B7A90] break-all">{user?.id || 'VIRTUAL-OPERATOR'}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}