import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTradingStore } from '../../store/useTradingStore';
import { supabase } from '../../lib/supabase';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Activity, 
  Layers, 
  Binary, 
  Briefcase, 
  Clock, 
  ShieldCheck, 
  BookOpenCheck, 
  Receipt, 
  PieChart, 
  SlidersHorizontal,
  RotateCcw,
  LogOut,
  Flame
} from 'lucide-react';

interface SidebarProps {
  onOpenReset: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenReset }) => {
  const { account, positions, orders } = useTradingStore();
  const navigate = useNavigate();

  const openPositionsCount = positions.filter((p) => p.net_quantity !== 0).length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'PENDING' || o.status === 'TRIGGER_PENDING').length;

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('tradeedge_user_session_id');
      }
      useTradingStore.getState().init();
      navigate('/login');
    }
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Market Watch', path: '/dashboard/watchlist', icon: TrendingUp },
    { name: 'Terminal', path: '/dashboard/terminal', icon: Activity },
    { name: 'Commodities (MCX)', path: '/dashboard/commodities', icon: Flame, badge: 'MCX', badgeColor: 'bg-[#EEF3FF] text-[#00225A]' },
    { name: 'Futures Explorer', path: '/dashboard/derivatives', icon: Layers },
    { name: 'Positions', path: '/dashboard/positions', icon: Briefcase, badge: openPositionsCount || undefined, badgeColor: 'bg-[#12B76A]/10 text-[#12B76A]' },
    { name: 'Orders', path: '/dashboard/orders', icon: Clock, badge: pendingOrdersCount || undefined, badgeColor: 'bg-[#536CF0]/10 text-[#00225A]' },
    { name: 'Holdings', path: '/dashboard/holdings', icon: ShieldCheck },
    { name: 'Tradebook', path: '/dashboard/tradebook', icon: BookOpenCheck },
    { name: 'Portfolio Ledger', path: '/dashboard/portfolio', icon: Receipt },
    { name: 'Analytics', path: '/dashboard/analytics', icon: PieChart },
    { name: 'Settings', path: '/dashboard/settings', icon: SlidersHorizontal },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#D9E2F2] flex flex-col h-screen select-none relative z-30 text-[#111114]">
      {/* Brand & Monogram Header */}
      <div className="p-4 border-b border-[#D9E2F2] bg-[#F7F8FA]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white border border-[#D9E2F2] flex items-center justify-center p-1.5 overflow-hidden shadow-xs">
            <img src="/cendrix-logo.png" alt="Cendrix Capital" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display text-base font-bold tracking-tight text-[#00225A]">
                CENDRIX
              </span>
              <span className="text-[9px] font-mono font-bold tracking-widest text-[#00225A] bg-[#EEF3FF] border border-[#D9E2F2] px-1 py-0.2 rounded">
                CNRX
              </span>
            </div>
            <p className="text-[10px] text-[#6B7A90] uppercase tracking-wider font-semibold font-mono">
              Cendrix Capital
            </p>
          </div>
        </div>

        {/* Institutional Virtual Account Card */}
        {account && (
          <div className="mt-4 p-3.5 bg-white rounded-xl border border-[#D9E2F2] shadow-xs">
            <div className="flex items-center justify-between text-[11px] text-[#6B7A90] font-medium mb-1">
              <span>Virtual Available Cash</span>
              <span className="inline-flex items-center gap-1 text-[#12B76A] font-mono text-[9px] font-bold bg-[#12B76A]/10 px-1.5 py-0.5 rounded border border-[#12B76A]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A] animate-pulse" />
                ACTIVE
              </span>
            </div>
            <div className="text-base font-bold font-mono text-[#00225A]">
              ₹{account.cash_balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-2 pt-2 border-t border-[#D9E2F2] flex justify-between text-[10px] text-[#6B7A90]">
              <span>Used Margin:</span>
              <span className="font-mono text-[#00225A] font-semibold">
                ₹{account.used_margin.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-hide text-xs">
        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) => `
                flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors
                ${
                  isActive
                    ? 'bg-[#EEF3FF] text-[#00225A] font-bold border border-[#D9E2F2]'
                    : 'text-[#6B7A90] hover:text-[#00225A] hover:bg-[#F7F8FA] border border-transparent'
                }
              `}
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 text-[#00225A]" />
                <span className="tracking-wide">{item.name}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold ${item.badgeColor || 'bg-[#F7F8FA] text-[#6B7A90]'}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Controls: Reset Virtual Balance & Logout */}
      <div className="p-3 border-t border-[#D9E2F2] space-y-2 bg-[#F7F8FA]">
        {/* Reset Virtual Account Button */}
        <button
          onClick={onOpenReset}
          className="w-full bg-white hover:bg-[#F7F8FA] text-[#00225A] border border-[#D9E2F2] rounded-xl text-xs font-semibold justify-center py-2 flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          title="Reset your virtual funds back to ₹10,00,000"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#D92D20]" />
          <span>Reset Virtual ₹10L</span>
        </button>

        {/* User Info & Sign Out */}
        <div className="flex items-center justify-between pt-1 px-1">
          <div className="truncate text-[11px] text-[#6B7A90]">
            <p className="font-semibold text-[#00225A] truncate">Trader Account</p>
            <p className="truncate text-[9px] font-mono text-[#536CF0]">SIMULATOR</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-[#6B7A90] hover:text-[#D92D20] hover:bg-white transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};