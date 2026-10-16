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
      useTradingStore.getState().init();
      navigate('/dashboard');
    }
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Market Watch', path: '/dashboard/watchlist', icon: TrendingUp },
    { name: 'Terminal', path: '/dashboard/terminal', icon: Activity },
    { name: 'Commodities (MCX)', path: '/dashboard/commodities', icon: Flame, badge: 'MCX', badgeColor: 'bg-[#D4AF65]/15 text-[#D4AF65]' },
    { name: 'Derivatives Explorer', path: '/dashboard/derivatives', icon: Binary },
    { name: 'Positions', path: '/dashboard/positions', icon: Briefcase, badge: openPositionsCount || undefined, badgeColor: 'bg-[#00C087]/20 text-[#00C087]' },
    { name: 'Orders', path: '/dashboard/orders', icon: Clock, badge: pendingOrdersCount || undefined, badgeColor: 'bg-[#D4AF65]/20 text-[#D4AF65]' },
    { name: 'Holdings', path: '/dashboard/holdings', icon: ShieldCheck },
    { name: 'Tradebook', path: '/dashboard/tradebook', icon: BookOpenCheck },
    { name: 'Portfolio Ledger', path: '/dashboard/portfolio', icon: Receipt },
    { name: 'Analytics', path: '/dashboard/analytics', icon: PieChart },
    { name: 'Settings', path: '/dashboard/settings', icon: SlidersHorizontal },
  ];

  return (
    <aside className="w-64 bg-[#080808] border-r border-[#242424] flex flex-col h-screen select-none relative z-30">
      {/* Brand & Monogram Header */}
      <div className="p-4 border-b border-[#242424] bg-[#030303]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#080808] border border-[#242424] flex items-center justify-center p-1 overflow-hidden">
            <img src="/cendrix-logo.png" alt="Cendrix Capital" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-cinzel text-base font-bold tracking-wider text-[#F5F5F5] uppercase">
                CENDRIX
              </span>
              <span className="text-[9px] font-mono font-bold tracking-widest text-[#D4AF65] bg-[#D4AF65]/10 border border-[#D4AF65]/30 px-1 py-0.2 rounded">
                CNRX
              </span>
            </div>
            <p className="text-[10px] text-[#71717A] uppercase tracking-wider font-medium">
              Cendrix Capital
            </p>
          </div>
        </div>

        {/* Institutional Virtual Account Card */}
        {account && (
          <div className="mt-4 p-3 bg-[#0D0D0D] rounded-xl border border-[#242424]">
            <div className="flex items-center justify-between text-[11px] text-[#A1A1AA] font-medium mb-1">
              <span>Virtual Available Cash</span>
              <span className="inline-flex items-center gap-1 text-[#00C087] font-mono text-[9px] font-bold bg-[#00C087]/10 px-1.5 py-0.5 rounded border border-[#00C087]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C087] animate-pulse" />
                ACTIVE
              </span>
            </div>
            <div className="text-base font-bold font-mono text-[#F5F5F5]">
              ₹{account.cash_balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-2 pt-2 border-t border-[#191919] flex justify-between text-[10px] text-[#71717A]">
              <span>Used Margin:</span>
              <span className="font-mono text-[#D4AF65] font-semibold">
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
                flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors
                ${
                  isActive
                    ? 'bg-[#131313] text-[#F5F5F5] border border-[#242424] font-semibold'
                    : 'text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#131313]/60 border border-transparent'
                }
              `}
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 text-[#D4AF65]" />
                <span className="tracking-wide">{item.name}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${item.badgeColor || 'bg-[#191919] text-[#71717A]'}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Controls: Reset Virtual Balance & Logout */}
      <div className="p-3 border-t border-[#242424] space-y-2 bg-[#080808]">
        {/* Reset Virtual Account Button */}
        <button
          onClick={onOpenReset}
          className="w-full btn-cendrix-outline text-xs justify-center py-2"
          title="Reset your virtual funds back to ₹10,00,000"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#D4AF65]" />
          <span>Reset Virtual ₹10L</span>
        </button>

        {/* User Info & Sign Out */}
        <div className="flex items-center justify-between pt-1 px-1">
          <div className="truncate text-[11px] text-[#A1A1AA]">
            <p className="font-semibold text-[#F5F5F5] truncate">Cendrix Trader</p>
            <p className="truncate text-[9px] font-mono text-[#D4AF65]">CNRX SIMULATOR</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-[#71717A] hover:text-[#FF4D67] hover:bg-[#131313] transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
