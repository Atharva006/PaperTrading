import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTradingStore } from '../../store/useTradingStore';
import { supabase } from '../../lib/supabase';
import {
  LayoutDashboard,
  Eye,
  LineChart,
  Binary,
  Layers,
  Briefcase,
  Layers3,
  Clock,
  BookOpenCheck,
  Receipt,
  PieChart,
  Settings,
  RotateCcw,
  LogOut,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  onOpenReset: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenReset }) => {
  const { positions, orders, account, userName } = useTradingStore();
  const navigate = useNavigate();

  const openPositionsCount = positions.filter((p) => !p.is_closed && p.quantity !== 0).length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'PENDING').length;

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignored if offline
    }
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Market Watch', path: '/dashboard/watchlist', icon: Eye },
    { name: 'Terminal / Chart', path: '/dashboard/terminal', icon: LineChart },
    { name: 'F&O Explorer', path: '/dashboard/derivatives', icon: Binary },
    { name: 'Option Chain', path: '/dashboard/option-chain', icon: Layers },
    {
      name: 'Positions',
      path: '/dashboard/positions',
      icon: Briefcase,
      badge: openPositionsCount > 0 ? openPositionsCount : undefined,
      badgeColor: 'bg-gold text-midnight font-bold',
    },
    { name: 'Holdings', path: '/dashboard/holdings', icon: Layers3 },
    {
      name: 'Orders',
      path: '/dashboard/orders',
      icon: Clock,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      badgeColor: 'bg-blue-500/80 text-white',
    },
    { name: 'Trade Book', path: '/dashboard/tradebook', icon: BookOpenCheck },
    { name: 'Portfolio Statement', path: '/dashboard/portfolio', icon: Receipt },
    { name: 'P&L Analytics', path: '/dashboard/analytics', icon: PieChart },
    { name: 'Settings & API', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0B1424] border-r border-[rgba(198,161,91,0.18)] flex flex-col h-screen select-none relative z-30">
      {/* Brand & Monogram Header */}
      <div className="p-4 border-b border-[rgba(198,161,91,0.15)] bg-gradient-to-b from-[#0F192B] to-[#0B1424]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#0E1728] border border-[rgba(198,161,91,0.4)] flex items-center justify-center shadow-[0_0_15px_rgba(198,161,91,0.2)] p-1.5 overflow-hidden">
            <img src="/monogram.svg" alt="CNRX Monogram" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-lg font-bold tracking-wider text-[#F5F5F2] uppercase">
                CN<span className="text-[#C6A15B]">RX</span>
              </span>
              <span className="text-[9px] font-mono font-bold tracking-widest text-[#C6A15B] bg-[#C6A15B]/10 border border-[#C6A15B]/30 px-1 py-0.2 rounded">
                SIM
              </span>
            </div>
            <p className="text-[10px] text-[#A1A8B3] uppercase tracking-wider font-medium">
              Cendrix Capital
            </p>
          </div>
        </div>

        {/* Institutional Virtual Account Card */}
        {account && (
          <div className="mt-4 p-3 bg-[#0E1728] rounded-xl border border-[rgba(198,161,91,0.2)] shadow-[0_4px_20px_rgba(0,0,0,0.35)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(ellipse_at_top_right,rgba(198,161,91,0.15),transparent_70%)] pointer-events-none" />
            <div className="flex items-center justify-between text-[11px] text-[#A1A8B3] font-medium mb-1">
              <span>Virtual Available Cash</span>
              <span className="inline-flex items-center gap-1 text-[#10B981] font-mono text-[9px] font-bold bg-[#10B981]/10 px-1.5 py-0.5 rounded border border-[#10B981]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                ACTIVE
              </span>
            </div>
            <div className="text-base font-bold font-mono text-[#F5F5F2]">
              ₹{account.cash_balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-2 pt-2 border-t border-white/[0.06] flex justify-between text-[10px] text-[#A1A8B3]">
              <span>Used Margin:</span>
              <span className="font-mono text-[#C6A15B] font-semibold">
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
                flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-all duration-200
                ${
                  isActive
                    ? 'bg-gradient-to-r from-[rgba(198,161,91,0.16)] to-[rgba(198,161,91,0.04)] text-[#F5F5F2] border border-[rgba(198,161,91,0.4)] shadow-[0_0_15px_rgba(198,161,91,0.1)] font-semibold'
                    : 'text-[#A1A8B3] hover:text-[#F5F5F2] hover:bg-[#14223A]/50 border border-transparent hover:border-white/5'
                }
              `}
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 text-[#C6A15B]" />
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

      {/* Footer Controls: Reset Virtual Balance & Logout */}
      <div className="p-3 border-t border-[rgba(198,161,91,0.15)] space-y-2 bg-[#0B1424]">
        {/* Reset Virtual Account Button */}
        <button
          onClick={onOpenReset}
          className="w-full btn-cendrix-outline text-xs justify-center py-2"
          title="Reset your virtual funds back to ₹10,00,000"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#C6A15B]" />
          <span>Reset Virtual ₹10L</span>
        </button>

        {/* User Info & Sign Out */}
        <div className="flex items-center justify-between pt-1 px-1">
          <div className="truncate text-[11px] text-[#A1A8B3]">
            <p className="font-semibold text-[#F5F5F2] truncate">{userName}</p>
            <p className="truncate text-[9px] font-mono text-[#C6A15B]">CNRX SIMULATOR</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-[#A1A8B3] hover:text-[#F43F5E] hover:bg-[#14223A] transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

