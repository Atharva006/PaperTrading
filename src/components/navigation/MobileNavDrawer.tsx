import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTradingStore } from '../../store/useTradingStore';
import { supabase } from '../../lib/supabase';
import {
  LayoutDashboard,
  LineChart,
  Eye,
  Layers,
  Briefcase,
  Clock,
  Layers3,
  BookOpenCheck,
  Receipt,
  PieChart,
  Settings,
  Flame,
  RotateCcw,
  LogOut,
  X,
  HelpCircle,
} from 'lucide-react';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReset: () => void;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  onClose,
  onOpenReset,
}) => {
  const { positions, orders, account, openGuide } = useTradingStore();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const openPositionsCount = positions.filter((p) => !p.is_closed && p.quantity !== 0).length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'PENDING').length;

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignored
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tradeedge_user_session_id');
      localStorage.removeItem('tradeedge_auth_logged_in');
    }
    useTradingStore.getState().init();
    onClose();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Terminal / Chart', path: '/dashboard/terminal', icon: LineChart },
    { name: 'Market Watch', path: '/dashboard/watchlist', icon: Eye },
    { name: 'MCX Commodities', path: '/dashboard/commodities', icon: Flame },
    { name: 'Futures Explorer', path: '/dashboard/derivatives', icon: Layers },
    {
      name: 'Positions',
      path: '/dashboard/positions',
      icon: Briefcase,
      badge: openPositionsCount > 0 ? openPositionsCount : undefined,
      badgeColor: 'bg-[#EEF3FF] text-[#00225A] font-bold border border-[#D9E2F2]',
    },
    {
      name: 'Orders',
      path: '/dashboard/orders',
      icon: Clock,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      badgeColor: 'bg-[#EEF1FE] text-[#536CF0] font-bold border border-[#D9E2F2]',
    },
    { name: 'Holdings', path: '/dashboard/holdings', icon: Layers3 },
    { name: 'Trade Book', path: '/dashboard/tradebook', icon: BookOpenCheck },
    { name: 'Portfolio Statement', path: '/dashboard/portfolio', icon: Receipt },
    { name: 'P&L Analytics', path: '/dashboard/analytics', icon: PieChart },
    { name: 'Settings & API', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#00225A]/25 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-out Menu Panel (FundingPips Light) */}
      <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-[#FFFFFF] border-l border-[#D9E2F2] shadow-2xl flex flex-col z-50 select-none animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#D9E2F2] flex items-center justify-between bg-[#FCFCFC]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#00225A] flex items-center justify-center p-1.5 shadow-sm">
              <img src="/cendrix-logo.png" alt="Cendrix Capital" className="w-full h-full object-contain brightness-0 invert" />
            </div>
            <div>
              <span className="font-headline text-sm font-bold tracking-tight text-[#00225A] uppercase">
                CENDRIX CAPITAL
              </span>
              <p className="text-[9px] text-[#6B7A90] uppercase tracking-wider font-mono font-semibold">
                FUNDED SIMULATOR
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#6B7A90] hover:text-[#00225A] hover:bg-[#F7F8FA] border border-[#D9E2F2] transition-all active:scale-[0.92]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account Telemetry Summary */}
        {account && (
          <div className="m-3 p-3.5 bg-[#F7F8FA] rounded-2xl border border-[#D9E2F2] shadow-2xs">
            <div className="flex justify-between items-center text-[10px] text-[#6B7A90] font-mono uppercase font-bold">
              <span>Virtual Portfolio Equity</span>
              <span className="text-[#12B76A] flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A] animate-pulse" />
                LIVE
              </span>
            </div>
            <div className="text-base font-bold font-mono text-[#00225A] mt-0.5">
              ₹{account.account_equity.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <div className="mt-2 pt-2 border-t border-[#D9E2F2] flex justify-between text-[11px] font-mono text-[#6B7A90]">
              <span>Cash: ₹{account.cash_balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              <span className="text-[#536CF0] font-semibold">Margin: ₹{account.used_margin.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-hide text-xs">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all active:scale-[0.98]
                  ${
                    isActive
                      ? 'bg-[#EEF3FF] text-[#00225A] font-bold border border-[#D9E2F2] shadow-2xs'
                      : 'text-[#6B7A90] hover:text-[#00225A] hover:bg-[#F7F8FA]'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-[#536CF0]" />
                  <span className="tracking-wide text-xs">{item.name}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-[#D9E2F2] space-y-2 bg-[#FCFCFC]">
          <button
            onClick={() => {
              onClose();
              openGuide();
            }}
            className="w-full btn-primary text-xs justify-center py-2.5 rounded-xl font-semibold flex items-center gap-1.5 h-10"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Beginner Walkthrough</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenReset();
            }}
            className="w-full btn-secondary text-xs justify-center py-2 rounded-xl font-semibold flex items-center gap-1.5 h-9"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#536CF0]" />
            <span>Reset Funds to ₹10L</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-[#D92D20] hover:bg-[#FEF3F2] rounded-xl transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
};
