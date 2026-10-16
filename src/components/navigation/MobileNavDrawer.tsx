import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTradingStore } from '../../store/useTradingStore';
import { supabase } from '../../lib/supabase';
import {
  LayoutDashboard,
  LineChart,
  Eye,
  Layers,
  Binary,
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
  const { positions, orders, account, userName } = useTradingStore();
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
    useTradingStore.getState().init();
    onClose();
    navigate('/dashboard');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Terminal / Chart', path: '/dashboard/terminal', icon: LineChart },
    { name: 'Market Watch', path: '/dashboard/watchlist', icon: Eye },
    { name: 'MCX Commodities', path: '/dashboard/commodities', icon: Flame },
    { name: 'Option Chain', path: '/dashboard/option-chain', icon: Layers },
    { name: 'F&O Explorer', path: '/dashboard/derivatives', icon: Binary },
    {
      name: 'Positions',
      path: '/dashboard/positions',
      icon: Briefcase,
      badge: openPositionsCount > 0 ? openPositionsCount : undefined,
      badgeColor: 'bg-[#D4AF65] text-[#030303] font-bold',
    },
    {
      name: 'Orders',
      path: '/dashboard/orders',
      icon: Clock,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      badgeColor: 'bg-[#60A5FA] text-[#030303] font-bold',
    },
    { name: 'Holdings', path: '/dashboard/holdings', icon: Layers3 },
    { name: 'Trade Book', path: '/dashboard/tradebook', icon: BookOpenCheck },
    { name: 'Portfolio Statement', path: '/dashboard/portfolio', icon: Receipt },
    { name: 'P&L Analytics', path: '/dashboard/analytics', icon: PieChart },
    { name: 'Settings & API', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 xl:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out Menu Panel */}
      <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-[#030303] border-l border-[#242424] shadow-2xl flex flex-col z-50 select-none animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#191919] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#080808] border border-[#242424] flex items-center justify-center p-1 overflow-hidden">
              <img src="/cendrix-logo.png" alt="Cendrix Capital" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-serif text-base font-bold tracking-wider text-[#F5F5F5] uppercase">
                CENDRIX <span className="text-[#D4AF65]">CAPITAL</span>
              </span>
              <p className="text-[9px] text-[#71717A] uppercase tracking-wider font-mono">
                CNRX Institutional
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#131313] transition-colors"
          >
            <X className="w-5 h-5 text-[#D4AF65]" />
          </button>
        </div>

        {/* Account Telemetry Summary */}
        {account && (
          <div className="m-3 p-3 bg-[#0D0D0D] rounded-xl border border-[#242424]">
            <div className="flex justify-between items-center text-[10px] text-[#71717A] font-mono uppercase font-bold">
              <span>Virtual Equity</span>
              <span className="text-[#00C087]">LIVE</span>
            </div>
            <div className="text-base font-bold font-mono text-[#F5F5F5] mt-0.5">
              ₹{account.account_equity.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <div className="mt-2 pt-2 border-t border-[#191919] flex justify-between text-[11px] font-mono text-[#A1A1AA]">
              <span>Cash: ₹{account.cash_balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              <span className="text-[#D4AF65]">Margin: ₹{account.used_margin.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
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
                  flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-all
                  ${
                    isActive
                      ? 'bg-[#131313] text-[#F5F5F5] font-bold border border-[#333333] shadow-sm'
                      : 'text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#0D0D0D]'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-[#D4AF65]" />
                  <span className="tracking-wide">{item.name}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${item.badgeColor || 'bg-white/10'}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-[#191919] space-y-2 bg-[#030303]">
          <button
            onClick={() => {
              onClose();
              onOpenReset();
            }}
            className="w-full btn-cendrix-outline text-xs justify-center py-2"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#D4AF65]" />
            <span>Reset Virtual Funds to ₹10L</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-[#FF4D67] hover:bg-[#131313] rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
};
