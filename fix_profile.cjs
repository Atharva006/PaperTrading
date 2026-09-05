const fs = require('fs');

const content = `import React, { useMemo } from 'react';
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
    const initialCapital = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const currentCapital = initialCapital + netPnl;

    return { totalTrades, winRate, netPnl, profitFactor, currentCapital };
  }, [trades, accounts]);

  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Unknown Trader';
  const avatarUrl = user?.user_metadata?.avatar_url || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(fullName)}&background=d97757&color=fff&size=128&bold=true\`;
  const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently';

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#d97757]/5 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2" />
        
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
          <img 
            src={avatarUrl} 
            alt="Profile Avatar" 
            className="w-24 h-24 rounded-2xl border-2 border-[#27272a] shadow-xl object-cover"
          />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-black text-white tracking-tight capitalize mb-1">{fullName}</h1>
            <p className="text-[#8c8c8c] font-medium flex items-center justify-center md:justify-start gap-2 text-sm">
              <Shield className="w-4 h-4 text-[#d97757]" /> Verified Operator &bull; Member since {joinDate}
            </p>
            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
              <span className="px-3 py-1 bg-[#18181b] border border-[#27272a] rounded-lg text-xs font-semibold text-[#e5e5e5]">
                {user?.email}
              </span>
              <span className="px-3 py-1 bg-[#d97757]/10 border border-[#d97757]/20 rounded-lg text-xs font-semibold text-[#d97757] flex items-center gap-1">
                <Zap className="w-3 h-3" /> PRO PLAN ACTIVE
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Lifetime Stats */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#d97757]" /> Lifetime Performance
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-6">
              <p className="text-sm font-semibold text-[#8c8c8c] mb-2 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Net P&L
              </p>
              <p className={\`text-3xl font-black \${stats.netPnl >= 0 ? 'text-[#4ade80]' : 'text-[#f87171]'}\`}>
                {stats.netPnl >= 0 ? '+' : '-'}$\${Math.abs(stats.netPnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            
            <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-6">
              <p className="text-sm font-semibold text-[#8c8c8c] mb-2 uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4" /> Win Rate
              </p>
              <p className="text-3xl font-black text-white">
                {stats.winRate.toFixed(1)}%
              </p>
            </div>
            
            <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-6">
              <p className="text-sm font-semibold text-[#8c8c8c] mb-2 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4" /> Profit Factor
              </p>
              <p className="text-3xl font-black text-white">
                {stats.profitFactor.toFixed(2)}
              </p>
            </div>

            <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-6">
              <p className="text-sm font-semibold text-[#8c8c8c] mb-2 uppercase tracking-wider flex items-center gap-2">
                <Wallet className="w-4 h-4" /> Global Equity
              </p>
              <p className="text-3xl font-black text-[#60a5fa]">
                $\${stats.currentCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Account Insights */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#d97757]" /> Portfolio Summary
          </h2>
          
          <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-6 space-y-5">
            <div className="pb-5 border-b border-[#27272a]">
              <p className="text-xs font-semibold text-[#8c8c8c] uppercase tracking-wider mb-1">Total Connected Accounts</p>
              <p className="text-2xl font-black text-white">{accounts.length}</p>
            </div>
            <div className="pb-5 border-b border-[#27272a]">
              <p className="text-xs font-semibold text-[#8c8c8c] uppercase tracking-wider mb-1">Total Trades Logged</p>
              <p className="text-2xl font-black text-white">{stats.totalTrades}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#8c8c8c] uppercase tracking-wider mb-1">Account ID</p>
              <p className="text-xs font-mono text-[#d97757] break-all">{user?.id || 'LOCAL-GUEST-MODE'}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/pages/Profile.tsx', content);
