import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTradingStore } from '../../store/useTradingStore';
import { marketDataService } from '../../services/market/MarketDataService';
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
  Search,
  Flame,
  PlusCircle,
  RotateCcw,
  LogOut,
  ChevronDown,
  Menu,
  X,
  User,
  HelpCircle,
} from 'lucide-react';

interface MasterNavbarProps {
  onOpenSearch: () => void;
  onOpenReset: () => void;
  onToggleMobileNav: () => void;
  isMobileNavOpen: boolean;
}

export const MasterNavbar: React.FC<MasterNavbarProps> = ({
  onOpenSearch,
  onOpenReset,
  onToggleMobileNav,
  isMobileNavOpen,
}) => {
  const { positions, orders, account, userName, quotes, openOrderTicket, openGuide } = useTradingStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openPositionsCount = positions.filter((p) => !p.is_closed && p.quantity !== 0).length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'PENDING').length;

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignored
    }
    useTradingStore.getState().init();
    navigate('/dashboard');
  };

  const niftyQuote = quotes['NSE_INDEX|Nifty 50'] || quotes['NIFTY 50'];
  const sensexQuote = quotes['BSE_INDEX|SENSEX'] || quotes['SENSEX'];

  const fmt = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    {
      name: 'Orders',
      path: '/dashboard/orders',
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
    },
    { name: 'Holdings', path: '/dashboard/holdings' },
    {
      name: 'Positions',
      path: '/dashboard/positions',
      badge: openPositionsCount > 0 ? openPositionsCount : undefined,
    },
    { name: 'Terminal', path: '/dashboard/terminal' },
    { name: 'Commodities', path: '/dashboard/commodities' },
    { name: 'Funds', path: '/dashboard/portfolio' },
    { name: 'Analytics', path: '/dashboard/analytics' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0B1424] border-b border-[rgba(198,161,91,0.22)] select-none shadow-xl shadow-black/40 font-sans">
      <div className="max-w-[1920px] mx-auto px-4 h-14 flex items-center justify-between gap-4">
        
        {/* ── Left Side: Cendrix Brand Wordmark & Session Pill ───────────── */}
        <div className="flex items-center gap-5 shrink-0">
          {/* Brand Logo & Name */}
          <NavLink
            to="/dashboard"
            className="flex items-center gap-3 group transition-transform active:scale-95"
          >
            <div className="w-8 h-8 rounded-lg bg-[#0F192B] border border-[rgba(198,161,91,0.35)] flex items-center justify-center p-1 overflow-hidden shadow-sm shadow-[#C6A15B]/10">
              <img src="/cendrix-logo.png" alt="Cendrix" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-sm tracking-[0.16em] text-[#F5F5F2]">
                CENDRIX CAPITAL
              </span>
              <span className="text-[8px] font-mono tracking-[0.22em] text-[#C6A15B] font-semibold uppercase">
                PROPRIETARY TRADING
              </span>
            </div>
          </NavLink>

          {/* Cendrix Live Status Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F192B] border border-[rgba(198,161,91,0.22)] text-[10px] font-mono text-[#C6A15B]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00c087] animate-pulse" />
            <span className="tracking-widest uppercase font-semibold">LIVE TICKS · NSE & MCX</span>
          </div>

          {/* Top Market Indices Badges */}
          <div className="hidden 2xl:flex items-center gap-4 text-xs font-mono border-l border-[rgba(198,161,91,0.18)] pl-5">
            <div className="flex items-center gap-2">
              <span className="text-[#A1A8B3] font-medium font-sans text-[11px]">NIFTY 50</span>
              <span className="text-[#F5F5F2] font-bold">
                {niftyQuote ? fmt(niftyQuote.last_price) : '24,520.50'}
              </span>
              {niftyQuote && (
                <span className={`text-[10px] ${niftyQuote.change >= 0 ? 'text-[#00c087]' : 'text-[#df514c]'}`}>
                  {niftyQuote.change >= 0 ? '+' : ''}{niftyQuote.change.toFixed(2)} ({niftyQuote.change_percent.toFixed(2)}%)
                </span>
              )}
            </div>

            <div className="w-px h-3.5 bg-[rgba(198,161,91,0.2)]" />

            <div className="flex items-center gap-2">
              <span className="text-[#A1A8B3] font-medium font-sans text-[11px]">SENSEX</span>
              <span className="text-[#F5F5F2] font-bold">
                {sensexQuote ? fmt(sensexQuote.last_price) : '80,450.00'}
              </span>
              {sensexQuote && (
                <span className={`text-[10px] ${sensexQuote.change >= 0 ? 'text-[#00c087]' : 'text-[#df514c]'}`}>
                  {sensexQuote.change >= 0 ? '+' : ''}{sensexQuote.change.toFixed(2)} ({sensexQuote.change_percent.toFixed(2)}%)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Center & Right: Cendrix Nav Links ────────────────────────── */}
        <nav className="hidden xl:flex items-center gap-6 text-xs font-medium">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`relative py-4 transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'text-[#C6A15B] font-semibold'
                    : 'text-[#A1A8B3] hover:text-[#F5F5F2]'
                }`}
              >
                <span className="tracking-wide uppercase text-[11px] font-semibold">{item.name}</span>
                {item.badge !== undefined && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-[#C6A15B] text-[#0B1424]">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C6A15B] shadow-sm shadow-[#C6A15B]/40" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* ── Far Right: Guide, Search, Quick Order & User Profile ───────────── */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Beginner Guide Walkthrough */}
          <button
            onClick={openGuide}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#0F192B] hover:bg-[#14223A] border border-[rgba(198,161,91,0.22)] text-[#A1A8B3] hover:text-[#C6A15B] text-xs transition-colors"
            title="Beginner Introduction & Trading Desk Guide"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#C6A15B]" />
            <span className="hidden md:inline text-[11px] font-medium">Guide</span>
          </button>

          {/* Quick Search Shortcut */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-[#0F192B] hover:bg-[#14223A] border border-[rgba(198,161,91,0.22)] text-[#A1A8B3] hover:text-[#F5F5F2] text-xs transition-colors"
            title="Search Indian scrips or MCX commodities (⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-[#C6A15B]" />
            <span className="hidden sm:inline text-[11px]">Search</span>
            <kbd className="hidden md:inline-block text-[9px] font-mono bg-[#14223A] px-1.5 py-0.2 rounded border border-[rgba(198,161,91,0.2)] text-[#C6A15B]">
              ⌘K
            </kbd>
          </button>

          {/* Quick Order Trigger */}
          <button
            onClick={() => openOrderTicket()}
            className="btn-cendrix-gold py-1.5 px-3.5 text-xs font-bold rounded shadow-sm flex items-center gap-1.5"
            title="Open Order Window"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Order</span>
          </button>

          {/* User Profile Avatar Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 rounded hover:bg-[#14223A] border border-transparent hover:border-[rgba(198,161,91,0.22)] transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-[#0F192B] border border-[#C6A15B]/50 flex items-center justify-center text-xs font-bold font-mono text-[#C6A15B]">
                {userName ? userName.slice(0, 2).toUpperCase() : 'CN'}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#A1A8B3]" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#0F192B] border border-[rgba(198,161,91,0.25)] rounded-md shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 font-sans">
                <div className="px-3 py-2 border-b border-[#14223A]">
                  <p className="text-xs font-bold text-[#F5F5F2] truncate font-serif tracking-wide">{userName || 'Cendrix Institutional Client'}</p>
                  <p className="text-[10px] text-[#C6A15B] font-mono tracking-wider font-semibold">CENDRIX CAPITAL</p>
                  {account && (
                    <div className="mt-1 pt-1 border-t border-[rgba(198,161,91,0.15)] flex justify-between text-[10px] font-mono text-[#A1A8B3]">
                      <span>Cash Balance:</span>
                      <span className="text-[#00c087] font-bold">₹{account.cash_balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                  )}
                </div>

                <div className="py-1 text-xs text-[#A1A8B3]">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      openGuide();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#14223A] hover:text-[#C6A15B] transition-colors text-left text-xs font-medium"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-[#C6A15B]" />
                    <span>Beginner Desk Walkthrough</span>
                  </button>

                  <NavLink
                    to="/dashboard/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-[#14223A] hover:text-[#F5F5F2] transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#C6A15B]" />
                    <span>Settings & API</span>
                  </NavLink>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenReset();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#14223A] hover:text-[#F5F5F2] transition-colors text-left"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#C6A15B]" />
                    <span>Reset Account (₹10L)</span>
                  </button>

                  <NavLink
                    to="/dashboard/tradebook"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-[#14223A] hover:text-[#F5F5F2] transition-colors"
                  >
                    <BookOpenCheck className="w-3.5 h-3.5 text-[#C6A15B]" />
                    <span>Trade Book</span>
                  </NavLink>
                </div>

                <div className="border-t border-[#14223A] pt-1 mt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#df514c] hover:bg-[#df514c]/10 transition-colors text-left font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Reset Session</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={onToggleMobileNav}
            className="xl:hidden p-1.5 rounded text-[#A1A8B3] hover:text-[#F5F5F2] hover:bg-[#14223A] border border-[rgba(198,161,91,0.2)]"
          >
            {isMobileNavOpen ? <X className="w-5 h-5 text-[#C6A15B]" /> : <Menu className="w-5 h-5 text-[#C6A15B]" />}
          </button>
        </div>

      </div>
    </header>
  );
};
