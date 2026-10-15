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
  const avatarUrl = user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=C6A15B&color=0B1424&size=128&bold=true`;
  const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently';

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 select-none pb-12">
      
      {/* Header Section */}
      <div className="bg-[#0E1728]/95 border border-[#C6A15B]/20 rounded-2xl p-8 relative overflow-hidden shadow-xl backdrop-blur-md">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#C6A15B]/10 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2" />
        
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
          <img 
            src={avatarUrl} 
            alt="Profile Avatar" 
            className="w-24 h-24 rounded-2xl border-2 border-[#C6A15B]/40 shadow-xl object-cover"
          />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-black font-serif text-white tracking-tight capitalize mb-1">{fullName}</h1>
            <p className="text-[#8F9BAE] font-medium flex items-center justify-center md:justify-start gap-2 text-sm">
              <Shield className="w-4 h-4 text-[#C6A15B]" /> Verified CNRX Operator &bull; Member since {joinDate}
            </p>
            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
              <span className="px-3 py-1 bg-[#0B1424] border border-[#1F2D48] rounded-lg text-xs font-semibold text-[#E5E7EB]">
                {user?.email}
              </span>
              <span className="px-3 py-1 bg-[#C6A15B]/15 border border-[#C6A15B]/30 rounded-lg text-xs font-semibold text-[#E2C889] flex items-center gap-1 font-mono">
                <Zap className="w-3 h-3 text-[#C6A15B]" /> INSTITUTIONAL SIMULATOR
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Lifetime Stats */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold font-serif text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#C6A15B]" /> Performance Overview
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0E1728]/95 border border-[#C6A15B]/20 rounded-2xl p-6 shadow-md backdrop-blur-md">
              <p className="text-sm font-semibold text-[#8F9BAE] mb-2 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#C6A15B]" /> Net P&L
              </p>
              <p className={`text-3xl font-black font-mono ${stats.netPnl >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                {stats.netPnl >= 0 ? '+' : '-'}₹{Math.abs(stats.netPnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            
            <div className="bg-[#0E1728]/95 border border-[#C6A15B]/20 rounded-2xl p-6 shadow-md backdrop-blur-md">
              <p className="text-sm font-semibold text-[#8F9BAE] mb-2 uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-[#C6A15B]" /> Win Rate
              </p>
              <p className="text-3xl font-black font-mono text-white">
                {stats.winRate.toFixed(1)}%
              </p>
            </div>
            
            <div className="bg-[#0E1728]/95 border border-[#C6A15B]/20 rounded-2xl p-6 shadow-md backdrop-blur-md">
              <p className="text-sm font-semibold text-[#8F9BAE] mb-2 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-[#C6A15B]" /> Profit Factor
              </p>
              <p className="text-3xl font-black font-mono text-white">
                {stats.profitFactor.toFixed(2)}
              </p>
            </div>

            <div className="bg-[#0E1728]/95 border border-[#C6A15B]/20 rounded-2xl p-6 shadow-md backdrop-blur-md">
              <p className="text-sm font-semibold text-[#8F9BAE] mb-2 uppercase tracking-wider flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[#C6A15B]" /> Virtual Capital
              </p>
              <p className="text-3xl font-black font-mono text-[#38BDF8]">
                ₹{stats.currentCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Account Insights */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold font-serif text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#C6A15B]" /> Portfolio Summary
          </h2>
          
          <div className="bg-[#0E1728]/95 border border-[#C6A15B]/20 rounded-2xl p-6 space-y-5 shadow-md backdrop-blur-md">
            <div className="pb-5 border-b border-[#1F2D48]">
              <p className="text-xs font-semibold text-[#8F9BAE] uppercase tracking-wider mb-1">Execution Mode</p>
              <p className="text-xl font-bold font-serif text-[#C6A15B]">CNRX Simulated Feed</p>
            </div>
            <div className="pb-5 border-b border-[#1F2D48]">
              <p className="text-xs font-semibold text-[#8F9BAE] uppercase tracking-wider mb-1">Total Trades Executed</p>
              <p className="text-2xl font-black font-mono text-white">{stats.totalTrades}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#8F9BAE] uppercase tracking-wider mb-1">Operator ID</p>
              <p className="text-xs font-mono text-[#E2C889] break-all">{user?.id || 'CNRX-VIRTUAL-OPERATOR'}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
