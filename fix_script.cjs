const fs = require('fs');

const orig = `import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { Plus, CheckCircle, AlertTriangle, XCircle, X, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { Account } from '../data/mockData';

export default function Accounts() {
  const { accounts, addAccount, deleteAccount, setActiveAccount, trades } = useStore();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  
  // New account form state
  const [name, setName] = useState('');
  const [firm, setFirm] = useState('Tradeify');
  const [size, setSize] = useState(50000);
  const [customSize, setCustomSize] = useState('');
  const [status, setStatus] = useState('Challenge');
  const [targetPercent, setTargetPercent] = useState(10);
  const [drawdownPercent, setDrawdownPercent] = useState(8);

  const KNOWN_FIRMS = ['Tradeify', 'Topstep', 'Apex', 'MyFundedFutures'];
  const isOther = firm === 'Other';

  const PRESET_SIZES = [25000, 50000, 100000, 150000, 200000];
  const KNOWN_STATUSES = ['Challenge', 'Funded'];
  const OTHER_STATUSES = ['Phase 1', 'Phase 2', 'Master'];

  const effectiveSize = isOther ? (Number(customSize) || 0) : size;
  const effectiveStatus = status;

  const handleFirmChange = (newFirm) => {
    setFirm(newFirm);
    if (newFirm === 'Other') {
      setStatus('Phase 1');
    } else {
      setStatus('Challenge');
    }
  };

  const handleAddAccount = (e) => {
    e.preventDefault();
    const sz = effectiveSize;
    const pTarget = isOther ? targetPercent : 10;
    const maxDd = isOther ? drawdownPercent : 8;

    const newAccount = {
      id: uuidv4(),
      name: name || \`\${firm === 'Other' ? 'Custom' : firm} \${sz >= 1000 ? sz / 1000 + 'K' : sz} \${effectiveStatus}\`,
      firm,
      size: sz,
      status: effectiveStatus,
      startingBalance: sz,
      currentBalance: sz,
      profitTarget: sz + (sz * (pTarget / 100)),
      dailyLossLimit: sz - (sz * 0.04),
      maxDrawdown: sz - (sz * (maxDd / 100)),
    };
    addAccount(newAccount);
    setIsAdding(false);
    setName('');
    setCustomSize('');
  };

  const handleViewDetails = (id) => {
    setActiveAccount(id);
    navigate('/dashboard');
  };

  return (
    <div className="space-y-6 pb-12 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <p className="text-[10px] text-textMuted uppercase tracking-wider font-semibold mb-1">Portfolio</p>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-[#e5e5e5]">Accounts</h1>
          </div>
        </div>
        <div className="ml-auto flex gap-3">
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-[#d97757] hover:bg-[#c46547] text-[#131314] px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(217,119,87,0.3)]"
          >
            <Plus className="w-4 h-4" /> Add Account
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {accounts.map(account => {
          const accountTrades = trades.filter(t => t.accountId === account.id);
          const totalPnl = accountTrades.reduce((s, t) => s + t.pnl, 0);
          const liveBalance = account.startingBalance + totalPnl;
          return (
          <div key={account.id} className="bg-[#18181b]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 relative overflow-hidden flex flex-col group transition-all duration-300 hover:bg-[#18181b]/60 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
            <div className={\`absolute top-0 left-0 w-1 h-full \${account.status === 'Funded' ? 'bg-success/50' : account.status === 'Challenge' ? 'bg-[#3b82f6]/50' : 'bg-danger/50'}\`} />
            
            <div className="flex justify-between items-start mb-6 pl-2">
              <div>
                <h3 className="text-lg font-medium text-[#e5e5e5] flex items-center gap-2 tracking-tight">
                  {account.name}
                  {account.status === 'Funded' && <CheckCircle className="w-4 h-4 text-success/70" />}
                  {account.status === 'Challenge' && <AlertTriangle className="w-4 h-4 text-[#3b82f6]/70" />}
                  {account.status === 'Failed' && <XCircle className="w-4 h-4 text-danger/70" />}
                </h3>
                <p className="text-[#8c8c8c] text-xs mt-1 font-medium">{account.firm} • \${(account.size / 1000)}k Size</p>
              </div>
              <span className={\`px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider border \${
                account.status === 'Funded' ? 'bg-success/5 text-success/80 border-success/10' : 
                account.status === 'Challenge' ? 'bg-[#3b82f6]/5 text-[#3b82f6]/80 border-[#3b82f6]/10' : 
                'bg-danger/5 text-danger/80 border-danger/10'
              }\`}>
                {account.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6 pl-2">
              <div>
                <p className="text-[10px] text-[#8c8c8c] uppercase tracking-wider font-semibold mb-1">Current Balance</p>
                <p className={\`text-xl font-medium tracking-tight \${liveBalance >= account.startingBalance ? 'text-success/90' : 'text-danger/90'}\`}>
                  \${liveBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-[#8c8c8c] uppercase tracking-wider font-semibold mb-1">Profit Target</p>
                <p className="text-xl font-medium tracking-tight text-[#e5e5e5]">
                  \${account.profitTarget.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6 pl-2">
              <div>
                <div className="flex justify-between text-[10px] font-semibold text-[#8c8c8c] uppercase tracking-wider mb-2">
                  <span>Profit Progress</span>
                  <span className="text-[#e5e5e5]">
                    {Math.max(0, ((liveBalance - account.startingBalance) / (account.profitTarget - account.startingBalance)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[#d97757]/80 h-1.5 rounded-full shadow-[0_0_10px_rgba(217,119,87,0.5)]" style={{ width: \`\${Math.min(100, Math.max(0, ((liveBalance - account.startingBalance) / (account.profitTarget - account.startingBalance)) * 100))}%\` }}></div>
                </div>
              </div>
            </div>
            
            <div className="mt-auto pt-4 border-t border-white/5 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if(confirm('Are you sure you want to delete this account?')) {
                    deleteAccount(account.id);
                  }
                }}
                className="text-xs font-medium text-danger/70 hover:text-danger hover:bg-danger/10 transition-colors px-3 py-1.5 rounded flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
              <button 
                onClick={() => handleViewDetails(account.id)}
                className="text-xs font-medium text-[#d97757] hover:text-white transition-colors border border-[#d97757]/30 hover:border-[#d97757]/80 bg-[#d97757]/5 hover:bg-[#d97757]/20 px-4 py-1.5 rounded-lg backdrop-blur-sm"
              >
                View Dashboard
              </button>
            </div>
          </div>
        )}})}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#18181b]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-white/5">
              <h2 className="text-lg font-medium tracking-tight text-[#e5e5e5]">Add Account</h2>
              <button onClick={() => setIsAdding(false)} className="text-[#8c8c8c] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddAccount} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-medium text-[#8c8c8c] mb-1.5">Account Name (Optional)</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. My 50K Phase 1" className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#e5e5e5] focus:border-[#d97757]/50 focus:ring-1 focus:ring-[#d97757]/50 outline-none transition-all placeholder:text-[#8c8c8c]/50" />
              </div>

              {/* Firm */}
              <div>
                <label className="block text-xs font-medium text-[#8c8c8c] mb-1.5">Firm</label>
                <select value={firm} onChange={e => handleFirmChange(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#e5e5e5] focus:border-[#d97757]/50 focus:ring-1 focus:ring-[#d97757]/50 outline-none transition-all appearance-none">
                  <option value="Tradeify">Tradeify</option>
                  <option value="Topstep">Topstep</option>
                  <option value="Apex">Apex Funding</option>
                  <option value="MyFundedFutures">MyFundedFutures</option>
                  <option value="Other">Other (CFD / Custom)</option>
                </select>
              </div>

              {/* Account Size */}
              <div>
                <label className="block text-xs font-medium text-[#8c8c8c] mb-1.5">Account Size ($)</label>
                {isOther ? (
                  <input
                    type="number"
                    min={1}
                    value={customSize}
                    onChange={e => setCustomSize(e.target.value)}
                    placeholder="e.g. 10000"
                    required
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#e5e5e5] focus:border-[#d97757]/50 focus:ring-1 focus:ring-[#d97757]/50 outline-none transition-all placeholder:text-[#8c8c8c]/50"
                  />
                ) : (
                  <select value={size} onChange={e => setSize(Number(e.target.value))} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#e5e5e5] focus:border-[#d97757]/50 focus:ring-1 focus:ring-[#d97757]/50 outline-none transition-all appearance-none">
                    {PRESET_SIZES.map(s => (
                      <option key={s} value={s}>\${s.toLocaleString()}</option>
                    ))}
                  </select>
                )}
              </div>

              {isOther && (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-[#8c8c8c] mb-1.5 flex justify-between">
                      Profit Target <span>{targetPercent}%</span>
                    </label>
                    <input type="range" min="1" max="20" value={targetPercent} onChange={e => setTargetPercent(Number(e.target.value))} className="w-full accent-[#d97757]" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-[#8c8c8c] mb-1.5 flex justify-between">
                      Max Drawdown <span>{drawdownPercent}%</span>
                    </label>
                    <input type="range" min="1" max="20" value={drawdownPercent} onChange={e => setDrawdownPercent(Number(e.target.value))} className="w-full accent-[#d97757]" />
                  </div>
                </div>
              )}

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-[#8c8c8c] mb-1.5">Status</label>
                <div className="flex gap-2 flex-wrap">
                  {(isOther ? OTHER_STATUSES : KNOWN_STATUSES).map(s => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setStatus(s)}
                      className={\`flex-1 py-2.5 text-sm font-medium rounded-lg border transition-all \${
                        status === s
                          ? 'bg-[#d97757]/20 border-[#d97757]/60 text-[#d97757]'
                          : 'bg-black/20 border-white/10 text-[#8c8c8c] hover:border-white/20 hover:text-white'
                      }\`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {isOther && (
                  <p className="text-[10px] text-[#8c8c8c] mt-2">
                    <span className="text-[#d97757] font-semibold">Phase 1</span> = Evaluation &nbsp;·&nbsp;
                    <span className="text-[#d97757] font-semibold">Phase 2</span> = Verification &nbsp;·&nbsp;
                    <span className="text-[#10b981] font-semibold">Master</span> = Live Funded
                  </p>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-medium text-[#8c8c8c] hover:text-white transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-[#d97757] hover:bg-[#c46547] text-[#131314] rounded-lg text-sm font-semibold transition-all shadow-[0_0_15px_rgba(217,119,87,0.3)]">
                  Add Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync('src/pages/Accounts.tsx', orig);
