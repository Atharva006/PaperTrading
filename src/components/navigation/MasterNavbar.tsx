import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTradingStore } from '../../store/useTradingStore';
import { supabase } from '../../lib/supabase';
import {
  Search,
  PlusCircle,
  RotateCcw,
  LogOut,
  ChevronDown,
  Menu,
  X,
  HelpCircle,
  BookOpenCheck,
  Settings,
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tradeedge_user_session_id');
      localStorage.removeItem('tradeedge_auth_logged_in');
    }
    useTradingStore.getState().init();
    navigate('/login');
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
    <header className="sticky top-0 z-40 apple-glass-nav select-none font-sans bg-white/95 backdrop-blur-md border-b border-[#D9E2F2]">
      <div className="w-full mx-auto px-4 h-14 flex items-center justify-between gap-3">
        
        {/* ── Left Side: Brand Wordmark & Session Pill ─────────────────────── */}
        <div className="flex items-center gap-3 xl:gap-5 shrink-0">
          <NavLink
            to="/dashboard"
            className="flex items-center gap-2.5 group transition-transform active:scale-[0.98] shrink-0"
          >
            <div className="w-8 h-8 rounded-xl bg-[#00225A] flex items-center justify-center p-1.5 shadow-sm shadow-[#00225A]/15 group-hover:bg-[#536CF0] transition-colors">
              <img src="/cendrix-logo.png" alt="Cendrix" className="w-full h-full object-contain brightness-0 invert" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-headline font-bold text-sm tracking-tight text-[#00225A] whitespace-nowrap">
                  CENDRIX CAPITAL
                </span>
                <span className="w-2 h-2 rounded-full bg-[#12B76A] animate-pulse" title="Live Exchange Feeds Active" />
              </div>
              <span className="text-[9px] font-mono tracking-wider text-[#6B7A90] font-semibold uppercase whitespace-nowrap">
                FUNDED SIMULATOR
              </span>
            </div>
          </NavLink>

          {/* FundingPips Live Status Pill (Only on wide screens) */}
          <div className="hidden 3xl:flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7F8FA] border border-[#D9E2F2] text-[11px] font-mono text-[#00225A]">
            <span className="w-2 h-2 rounded-full bg-[#12B76A] animate-pulse" />
            <span className="tracking-wide uppercase font-semibold">LIVE NSE & MCX FEED</span>
          </div>

          {/* Top Market Indices Badges */}
          <div className="hidden 3xl:flex items-center gap-4 text-xs font-mono border-l border-[#D9E2F2] pl-5">
            <div className="flex items-center gap-2 bg-[#F7F8FA] px-2.5 py-1 rounded-lg border border-[#D9E2F2]">
              <span className="text-[#6B7A90] font-medium font-sans text-[11px]">NIFTY 50</span>
              <span className="text-[#00225A] font-bold">
                {niftyQuote ? fmt(niftyQuote.last_price) : '24,520.50'}
              </span>
              {niftyQuote && (
                <span className={`text-[10px] font-bold ${niftyQuote.change >= 0 ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
                  {niftyQuote.change >= 0 ? '+' : ''}{niftyQuote.change.toFixed(2)} ({niftyQuote.change_percent.toFixed(2)}%)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 bg-[#F7F8FA] px-2.5 py-1 rounded-lg border border-[#D9E2F2]">
              <span className="text-[#6B7A90] font-medium font-sans text-[11px]">SENSEX</span>
              <span className="text-[#00225A] font-bold">
                {sensexQuote ? fmt(sensexQuote.last_price) : '80,450.00'}
              </span>
              {sensexQuote && (
                <span className={`text-[10px] font-bold ${sensexQuote.change >= 0 ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
                  {sensexQuote.change >= 0 ? '+' : ''}{sensexQuote.change.toFixed(2)} ({sensexQuote.change_percent.toFixed(2)}%)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Center: FundingPips Nav Links ─────────────────────────────────── */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-medium shrink-0">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`relative px-3 py-1.5 rounded-xl transition-all duration-150 flex items-center gap-1.5 active:scale-[0.98] ${
                  isActive
                    ? 'bg-[#EEF3FF] text-[#00225A] font-semibold border border-[#D9E2F2] shadow-sm'
                    : 'text-[#6B7A90] hover:text-[#00225A] hover:bg-[#F7F8FA]'
                }`}
              >
                <span className="text-[12px] font-medium whitespace-nowrap">{item.name}</span>
                {item.badge !== undefined && (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-[#00225A] text-white">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* ── Far Right: Guide, Search, Quick Order & User Profile ───────────── */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Beginner Guide Walkthrough */}
          <button
            onClick={openGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F7F8FA] hover:bg-[#EEF3FF] border border-[#D9E2F2] text-[#6B7A90] hover:text-[#00225A] text-xs font-medium transition-all active:scale-[0.97]"
            title="Trading Desk Walkthrough & Guide"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#536CF0]" />
            <span className="hidden 2xl:inline text-[12px]">Guide</span>
          </button>

          {/* Quick Search Shortcut */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F7F8FA] hover:bg-[#EEF3FF] border border-[#D9E2F2] text-[#6B7A90] hover:text-[#00225A] text-xs transition-all active:scale-[0.97]"
            title="Search Indian scrips or MCX commodities (⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-[#536CF0]" />
            <span className="hidden 2xl:inline text-[12px] font-medium">Search</span>
            <kbd className="hidden sm:inline-block text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-[#D9E2F2] text-[#00225A] font-semibold shadow-2xs">
              ⌘K
            </kbd>
          </button>

          {/* Quick Order Trigger */}
          <button
            onClick={() => openOrderTicket()}
            className="btn-primary py-1.5 px-3 sm:px-4 text-xs font-semibold rounded-xl shadow-sm flex items-center gap-1.5 active:scale-[0.97] h-9"
            title="Open Order Window"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Order</span>
          </button>

          {/* User Profile Avatar Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-[#F7F8FA] border border-transparent hover:border-[#D9E2F2] transition-all active:scale-[0.97]"
            >
              <div className="w-7 h-7 rounded-xl bg-[#EEF3FF] border border-[#D9E2F2] flex items-center justify-center text-xs font-bold font-mono text-[#00225A] shadow-2xs">
                {userName ? userName.slice(0, 2).toUpperCase() : 'CN'}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#6B7A90]" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-[#D9E2F2] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 font-sans origin-top-right">
                <div className="px-4 py-3 border-b border-[#D9E2F2]">
                  <p className="text-xs font-bold text-[#00225A] truncate tracking-wide">{userName || 'Cendrix Institutional Client'}</p>
                  <p className="text-[10px] text-[#536CF0] font-mono tracking-wider font-semibold">FUNDED SIMULATOR</p>
                  {account && (
                    <div className="mt-2 pt-2 border-t border-[#D9E2F2] flex justify-between text-[11px] font-mono text-[#6B7A90]">
                      <span>Cash Balance:</span>
                      <span className="text-[#12B76A] font-bold">₹{account.cash_balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                  )}
                </div>

                <div className="py-1 text-xs text-[#6B7A90]">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      openGuide();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-[#F7F8FA] hover:text-[#00225A] transition-colors text-left text-xs font-medium"
                  >
                    <HelpCircle className="w-4 h-4 text-[#536CF0]" />
                    <span>Beginner Desk Walkthrough</span>
                  </button>

                  <NavLink
                    to="/dashboard/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-[#F7F8FA] hover:text-[#00225A] transition-colors font-medium"
                  >
                    <Settings className="w-4 h-4 text-[#536CF0]" />
                    <span>Settings & API</span>
                  </NavLink>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenReset();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-[#F7F8FA] hover:text-[#00225A] transition-colors text-left font-medium"
                  >
                    <RotateCcw className="w-4 h-4 text-[#536CF0]" />
                    <span>Reset Account (₹10L)</span>
                  </button>

                  <NavLink
                    to="/dashboard/tradebook"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-[#F7F8FA] hover:text-[#00225A] transition-colors font-medium"
                  >
                    <BookOpenCheck className="w-4 h-4 text-[#536CF0]" />
                    <span>Trade Book</span>
                  </NavLink>
                </div>

                <div className="border-t border-[#D9E2F2] pt-1 mt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-[#D92D20] hover:bg-[#FEF3F2] transition-colors text-left font-semibold"
                  >
                    <LogOut className="w-4 h-4 text-[#D92D20]" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={onToggleMobileNav}
            className="lg:hidden p-1.5 rounded-xl text-[#6B7A90] hover:text-[#00225A] hover:bg-[#F7F8FA] border border-[#D9E2F2]"
          >
            {isMobileNavOpen ? <X className="w-5 h-5 text-[#00225A]" /> : <Menu className="w-5 h-5 text-[#00225A]" />}
          </button>
        </div>

      </div>
    </header>
  );
};
