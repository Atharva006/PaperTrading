import React, { useState } from 'react';
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
  const [firm, setFirm] = useState('FundingPips');
  const [size, setSize] = useState(50000);
  const [customSize, setCustomSize] = useState('');
  const [status, setStatus] = useState('Challenge');
  const [targetPercent, setTargetPercent] = useState(10);
  const [drawdownPercent, setDrawdownPercent] = useState(8);

  const KNOWN_FIRMS = ['FundingPips', 'Tradeify', 'Topstep', 'Apex', 'MyFundedFutures'];
  const isOther = firm === 'Other';

  const PRESET_SIZES = [25000, 50000, 100000, 150000, 200000];
  const KNOWN_STATUSES = ['Challenge', 'Funded'];
  const OTHER_STATUSES = ['Phase 1', 'Phase 2', 'Master'];

  const effectiveSize = isOther ? (Number(customSize) || 0) : size;
  const effectiveStatus = status;

  const handleFirmChange = (newFirm: string) => {
    setFirm(newFirm);
    if (newFirm === 'Other') {
      setStatus('Phase 1');
    } else {
      setStatus('Challenge');
    }
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const sz = effectiveSize;
    const pTarget = isOther ? targetPercent : 10;
    const maxDd = isOther ? drawdownPercent : 8;

    const newAccount = {
      id: uuidv4(),
      name: name || `${firm === 'Other' ? 'Custom' : firm} ${sz >= 1000 ? sz / 1000 + 'K' : sz} ${effectiveStatus}`,
      firm,
      size: sz,
      status: effectiveStatus as any,
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

  const handleViewDetails = (id: string) => {
    setActiveAccount(id);
    navigate('/dashboard');
  };

  return (
    <div className="space-y-6 pb-12 max-w-[1400px] mx-auto text-[#111114]">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-[#D9E2F2] pb-6">
        <div>
          <p className="text-[10px] text-[#536CF0] uppercase tracking-wider font-semibold font-mono mb-1">Portfolio</p>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold font-display text-[#00225A]">Accounts</h1>
          </div>
        </div>
        <div className="ml-auto flex gap-3">
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-[#00225A] hover:bg-[#536CF0] text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Account
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {accounts.map(account => {
          const accountTrades = trades; // No account_id in DB, use all trades
          const totalPnl = accountTrades.reduce((s, t) => s + t.pnl, 0);
          const liveBalance = account.startingBalance + totalPnl;
          return (
          <div key={account.id} className="bg-white border border-[#D9E2F2] rounded-2xl p-6 relative overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,34,90,0.06)]">
            <div className={`absolute top-0 left-0 w-1.5 h-full ${account.status === 'Funded' ? 'bg-[#12B76A]' : account.status === 'Challenge' ? 'bg-[#536CF0]' : 'bg-[#D92D20]'}`} />
            
            <div className="flex justify-between items-start mb-6 pl-2">
              <div>
                <h3 className="text-lg font-bold font-display text-[#00225A] flex items-center gap-2 tracking-tight">
                  {account.name}
                  {account.status === 'Funded' && <CheckCircle className="w-4 h-4 text-[#12B76A]" />}
                  {account.status === 'Challenge' && <AlertTriangle className="w-4 h-4 text-[#536CF0]" />}
                  {account.status === 'Failed' && <XCircle className="w-4 h-4 text-[#D92D20]" />}
                </h3>
                <p className="text-[#6B7A90] text-xs mt-1 font-mono">{account.firm} • ${(account.size / 1000)}k Size</p>
              </div>
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border font-mono ${
                account.status === 'Funded' ? 'bg-[#12B76A]/10 text-[#12B76A] border-[#12B76A]/20' : 
                account.status === 'Challenge' ? 'bg-[#536CF0]/10 text-[#00225A] border-[#536CF0]/25' : 
                'bg-[#D92D20]/10 text-[#D92D20] border-[#D92D20]/20'
              }`}>
                {account.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6 pl-2 font-mono">
              <div>
                <p className="text-[10px] text-[#6B7A90] uppercase tracking-wider font-semibold mb-1">Current Balance</p>
                <p className={`text-xl font-bold tracking-tight ${liveBalance >= account.startingBalance ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
                  ${liveBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-[#6B7A90] uppercase tracking-wider font-semibold mb-1">Profit Target</p>
                <p className="text-xl font-bold tracking-tight text-[#00225A]">
                  ${account.profitTarget.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6 pl-2">
              <div>
                <div className="flex justify-between text-[10px] font-semibold text-[#6B7A90] uppercase tracking-wider mb-2 font-mono">
                  <span>Profit Progress</span>
                  <span className="text-[#00225A] font-bold">
                    {Math.max(0, ((liveBalance - account.startingBalance) / (account.profitTarget - account.startingBalance)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-full h-2 overflow-hidden">
                  <div className="bg-[#00225A] h-2 rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(0, ((liveBalance - account.startingBalance) / (account.profitTarget - account.startingBalance)) * 100))}%` }}></div>
                </div>
              </div>
            </div>
            
            <div className="mt-auto pt-4 border-t border-[#D9E2F2] flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if(confirm('Are you sure you want to delete this account?')) {
                    deleteAccount(account.id);
                  }
                }}
                className="text-xs font-semibold text-[#D92D20] hover:bg-[#D92D20]/10 transition-colors px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
              <button 
                onClick={() => handleViewDetails(account.id)}
                className="text-xs font-semibold text-[#00225A] hover:bg-[#00225A] hover:text-white transition-all border border-[#D9E2F2] bg-white px-4 py-1.5 rounded-xl shadow-xs cursor-pointer"
              >
                View Dashboard
              </button>
            </div>
          </div>
        );})}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-[#00225A]/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-[#D9E2F2] rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden text-[#111114]">
            <div className="flex justify-between items-center p-5 border-b border-[#D9E2F2] bg-[#F7F8FA]">
              <h2 className="text-lg font-bold font-display tracking-tight text-[#00225A]">Add Account</h2>
              <button onClick={() => setIsAdding(false)} className="text-[#6B7A90] hover:text-[#00225A] transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddAccount} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#6B7A90] mb-1.5 uppercase font-mono">Account Name (Optional)</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. My 50K Phase 1" className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl px-3 py-2.5 text-sm text-[#111114] focus:border-[#536CF0] focus:bg-white outline-none transition-all placeholder:text-[#6B7A90]/50" />
              </div>

              {/* Firm */}
              <div>
                <label className="block text-xs font-semibold text-[#6B7A90] mb-1.5 uppercase font-mono">Firm</label>
                <select value={firm} onChange={e => handleFirmChange(e.target.value)} className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl px-3 py-2.5 text-sm text-[#111114] focus:border-[#536CF0] focus:bg-white outline-none transition-all">
                  <option value="FundingPips">FundingPips</option>
                  <option value="Tradeify">Tradeify</option>
                  <option value="Topstep">Topstep</option>
                  <option value="Apex">Apex Funding</option>
                  <option value="MyFundedFutures">MyFundedFutures</option>
                  <option value="Other">Other (CFD / Custom)</option>
                </select>
              </div>

              {/* Account Size */}
              <div>
                <label className="block text-xs font-semibold text-[#6B7A90] mb-1.5 uppercase font-mono">Account Size ($)</label>
                {isOther ? (
                  <input
                    type="number"
                    min={1}
                    value={customSize}
                    onChange={e => setCustomSize(e.target.value)}
                    placeholder="e.g. 10000"
                    required
                    className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl px-3 py-2.5 text-sm text-[#111114] focus:border-[#536CF0] focus:bg-white outline-none transition-all placeholder:text-[#6B7A90]/50"
                  />
                ) : (
                  <select value={size} onChange={e => setSize(Number(e.target.value))} className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl px-3 py-2.5 text-sm text-[#111114] focus:border-[#536CF0] focus:bg-white outline-none transition-all">
                    {PRESET_SIZES.map(s => (
                      <option key={s} value={s}>${s.toLocaleString()}</option>
                    ))}
                  </select>
                )}
              </div>

              {isOther && (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-[#6B7A90] mb-1.5 flex justify-between font-mono">
                      Profit Target <span>{targetPercent}%</span>
                    </label>
                    <input type="range" min="1" max="20" value={targetPercent} onChange={e => setTargetPercent(Number(e.target.value))} className="w-full accent-[#00225A]" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-[#6B7A90] mb-1.5 flex justify-between font-mono">
                      Max Drawdown <span>{drawdownPercent}%</span>
                    </label>
                    <input type="range" min="1" max="20" value={drawdownPercent} onChange={e => setDrawdownPercent(Number(e.target.value))} className="w-full accent-[#00225A]" />
                  </div>
                </div>
              )}

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-[#6B7A90] mb-1.5 uppercase font-mono">Status</label>
                <div className="flex gap-2 flex-wrap">
                  {(isOther ? OTHER_STATUSES : KNOWN_STATUSES).map(s => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`flex-1 py-2.5 text-sm font-semibold rounded-xl border transition-all cursor-pointer ${
                        status === s
                          ? 'bg-[#EEF3FF] border-[#00225A] text-[#00225A]'
                          : 'bg-[#F7F8FA] border-[#D9E2F2] text-[#6B7A90] hover:border-[#00225A] hover:text-[#00225A]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {isOther && (
                  <p className="text-[10px] text-[#6B7A90] mt-2 font-mono">
                    <span className="text-[#00225A] font-semibold">Phase 1</span> = Evaluation &nbsp;·&nbsp;
                    <span className="text-[#00225A] font-semibold">Phase 2</span> = Verification &nbsp;·&nbsp;
                    <span className="text-[#12B76A] font-semibold">Master</span> = Live Funded
                  </p>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-semibold text-[#6B7A90] hover:text-[#00225A] transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-[#00225A] hover:bg-[#536CF0] text-white rounded-xl text-sm font-semibold transition-all shadow-xs cursor-pointer">
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