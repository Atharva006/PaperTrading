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
  const { positions, orders, account, userName, quotes, openOrderTicket } = useTradingStore();
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
    { name: 'Options', path: '/dashboard/option-chain' },
    { name: 'Funds', path: '/dashboard/portfolio' },
    { name: 'Analytics', path: '/dashboard/analytics' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0c0f17] border-b border-[#1e293b] select-none shadow-md font-sans">
      <div className="max-w-[1920px] mx-auto px-4 h-14 flex items-center justify-between gap-4">
        
        {/* ── Left Side: Cendrix Brand & Zerodha Market Badges ─────────── */}
        <div className="flex items-center gap-6 shrink-0">
          {/* Brand Logo & Name */}
          <NavLink
            to="/dashboard"
            className="flex items-center gap-2.5 group transition-transform active:scale-95"
          >
            <div className="w-7 h-7 rounded bg-[#111622] border border-[#1e293b] flex items-center justify-center p-0.5 overflow-hidden">
              <img src="/cendrix-logo.png" alt="Cendrix" className="w-full h-full object-contain" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-wider text-[#f0f3f8]">
                CENDRIX
              </span>
              <span className="text-[10px] font-mono font-bold text-[#387ed1] bg-[#387ed1]/10 border border-[#387ed1]/30 px-1 py-0.2 rounded">
                CNRX
              </span>
            </div>
          </NavLink>

          {/* Zerodha Top Market Indices Badges */}
          <div className="hidden lg:flex items-center gap-4 text-xs font-mono border-l border-[#1e293b] pl-5">
            <div className="flex items-center gap-2">
              <span className="text-[#9ca8ba] font-medium font-sans text-[11px]">NIFTY 50</span>
              <span className="text-[#f0f3f8] font-bold">
                {niftyQuote ? fmt(niftyQuote.last_price) : '24,520.50'}
              </span>
              {niftyQuote && (
                <span className={`text-[10px] ${niftyQuote.change >= 0 ? 'text-[#00c087]' : 'text-[#df514c]'}`}>
                  {niftyQuote.change >= 0 ? '+' : ''}{niftyQuote.change.toFixed(2)} ({niftyQuote.change_percent.toFixed(2)}%)
                </span>
              )}
            </div>

            <div className="w-px h-3.5 bg-[#1e293b]" />

            <div className="flex items-center gap-2">
              <span className="text-[#9ca8ba] font-medium font-sans text-[11px]">SENSEX</span>
              <span className="text-[#f0f3f8] font-bold">
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

        {/* ── Center & Right: Zerodha Kite Nav Links ───────────────────── */}
        <nav className="hidden xl:flex items-center gap-6 text-xs font-medium">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`relative py-4 transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'text-[#387ed1] font-semibold'
                    : 'text-[#9ca8ba] hover:text-[#f0f3f8]'
                }`}
              >
                <span>{item.name}</span>
                {item.badge !== undefined && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-[#387ed1] text-white">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#387ed1]" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* ── Far Right: Search, Quick Order & User Profile ───────────── */}
        <div className="flex items-center gap-3">
          {/* Quick Search Shortcut */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-[#111622] hover:bg-[#151b2a] border border-[#1e293b] text-[#9ca8ba] hover:text-[#f0f3f8] text-xs transition-colors"
            title="Search Indian scrips, commodities, or options (⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-[#387ed1]" />
            <span className="hidden sm:inline text-[11px]">Search</span>
            <kbd className="hidden md:inline-block text-[9px] font-mono bg-[#1a2235] px-1 py-0.2 rounded border border-[#1e293b] text-[#9ca8ba]">
              ⌘K
            </kbd>
          </button>

          {/* Quick Order Trigger */}
          <button
            onClick={() => openOrderTicket()}
            className="btn-kite-blue py-1.5 px-3 text-xs font-semibold rounded"
            title="Open Zerodha Order Window"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1" />
            <span className="hidden sm:inline">Order</span>
          </button>

          {/* User Profile Avatar Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 rounded hover:bg-[#151b2a] border border-transparent hover:border-[#1e293b] transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-[#1e293b] border border-[#387ed1]/40 flex items-center justify-center text-xs font-bold font-mono text-[#387ed1]">
                {userName ? userName.slice(0, 2).toUpperCase() : 'CN'}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#9ca8ba]" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-[#111622] border border-[#1e293b] rounded-md shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 font-sans">
                <div className="px-3 py-2 border-b border-[#1e293b]">
                  <p className="text-xs font-bold text-[#f0f3f8] truncate">{userName || 'Cendrix Trader'}</p>
                  <p className="text-[10px] text-[#387ed1] font-mono">CNRX SIMULATOR</p>
                  {account && (
                    <div className="mt-1 pt-1 border-t border-[#1e293b]/60 flex justify-between text-[10px] font-mono text-[#9ca8ba]">
                      <span>Cash:</span>
                      <span className="text-[#f0f3f8] font-bold">₹{account.cash_balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                  )}
                </div>

                <div className="py-1 text-xs text-[#9ca8ba]">
                  <NavLink
                    to="/dashboard/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-[#151b2a] hover:text-[#f0f3f8] transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#387ed1]" />
                    <span>Settings & API</span>
                  </NavLink>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenReset();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#151b2a] hover:text-[#f0f3f8] transition-colors text-left"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#387ed1]" />
                    <span>Reset Account (₹10L)</span>
                  </button>

                  <NavLink
                    to="/dashboard/tradebook"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-[#151b2a] hover:text-[#f0f3f8] transition-colors"
                  >
                    <BookOpenCheck className="w-3.5 h-3.5 text-[#387ed1]" />
                    <span>Trade Book</span>
                  </NavLink>
                </div>

                <div className="border-t border-[#1e293b] pt-1 mt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#df514c] hover:bg-[#df514c]/10 transition-colors text-left font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={onToggleMobileNav}
            className="xl:hidden p-1.5 rounded text-[#9ca8ba] hover:text-[#f0f3f8] hover:bg-[#151b2a] border border-[#1e293b]"
          >
            {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>
    </header>
  );
};
