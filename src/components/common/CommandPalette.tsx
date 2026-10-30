import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTradingStore } from '../../store/useTradingStore';
import { INDIAN_INSTRUMENTS_MASTER } from '../../services/market/indianInstruments';
import type { Instrument } from '../../types/market';
import { 
  Search, 
  LayoutDashboard, 
  Activity, 
  Layers, 
  Binary, 
  Briefcase, 
  Clock, 
  Receipt, 
  PieChart, 
  SlidersHorizontal, 
  ShieldCheck, 
  BookOpenCheck, 
  TrendingUp,
  PlusCircle,
  RotateCcw,
  Flame,
  ArrowRight,
  Sparkles,
  X,
  ExternalLink
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReset?: () => void;
}

interface NavItem {
  id: string;
  title: string;
  path: string;
  category: 'NAVIGATION' | 'ACTION' | 'INSTRUMENT';
  icon: React.ReactNode;
  subtitle?: string;
  action?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onOpenReset }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { setSelectedInstrument, openOrderTicket, quotes } = useTradingStore();

  const navigationItems: NavItem[] = useMemo(() => [
    { id: 'nav-dash', title: 'Main Trading Dashboard', path: '/dashboard', category: 'NAVIGATION', icon: <LayoutDashboard className="w-4 h-4 text-[#00225A]" />, subtitle: 'Command center & equity overview' },
    { id: 'nav-term', title: 'Advanced Trading Terminal', path: '/dashboard/terminal', category: 'NAVIGATION', icon: <Activity className="w-4 h-4 text-[#536CF0]" />, subtitle: 'Level 2 market depth & fast order execution pad' },
    { id: 'nav-watch', title: 'Market Watchlists', path: '/dashboard/watchlist', category: 'NAVIGATION', icon: <TrendingUp className="w-4 h-4 text-[#12B76A]" />, subtitle: 'Live tick feeds across Indian indices & equities' },
    { id: 'nav-commodities', title: 'Commodities Market Terminal (MCX & NCDEX)', path: '/dashboard/commodities', category: 'NAVIGATION', icon: <Flame className="w-4 h-4 text-[#536CF0]" />, subtitle: 'Trade Gold, Silver, Crude Oil, Natural Gas, Copper, Zinc' },
    { id: 'nav-deriv', title: 'Futures & Derivatives Explorer', path: '/dashboard/derivatives', category: 'NAVIGATION', icon: <Binary className="w-4 h-4 text-[#00225A]" />, subtitle: 'NSE Index & single stock futures contracts' },
    { id: 'nav-pos', title: 'Open & Closed Positions', path: '/dashboard/positions', category: 'NAVIGATION', icon: <Briefcase className="w-4 h-4 text-[#536CF0]" />, subtitle: 'Live MTM P&L & 1-click square-off' },
    { id: 'nav-orders', title: 'Order Book', path: '/dashboard/orders', category: 'NAVIGATION', icon: <Clock className="w-4 h-4 text-[#00225A]" />, subtitle: 'Pending, completed, cancelled & limit orders' },
    { id: 'nav-hold', title: 'Equity Delivery Holdings (CNC)', path: '/dashboard/holdings', category: 'NAVIGATION', icon: <ShieldCheck className="w-4 h-4 text-[#12B76A]" />, subtitle: 'Long-term equity investment portfolio' },
    { id: 'nav-trades', title: 'Execution Tradebook', path: '/dashboard/tradebook', category: 'NAVIGATION', icon: <BookOpenCheck className="w-4 h-4 text-[#00225A]" />, subtitle: 'Audited execution fills & statutory charges' },
    { id: 'nav-ledger', title: 'Financial Ledger & Statements', path: '/dashboard/portfolio', category: 'NAVIGATION', icon: <Receipt className="w-4 h-4 text-[#536CF0]" />, subtitle: 'Double-entry ledger & cash balance movements' },
    { id: 'nav-analytics', title: 'Performance Analytics', path: '/dashboard/analytics', category: 'NAVIGATION', icon: <PieChart className="w-4 h-4 text-[#12B76A]" />, subtitle: 'Win rate, profit factor, max drawdown & daily P&L' },
    { id: 'nav-settings', title: 'Settings & API Configuration', path: '/dashboard/settings', category: 'NAVIGATION', icon: <SlidersHorizontal className="w-4 h-4 text-[#6B7A90]" />, subtitle: 'Exchange Gateway keys, live/sim mode, slippage' },
  ], []);

  const actionItems: NavItem[] = useMemo(() => [
    {
      id: 'act-order',
      title: 'Open New Order Ticket',
      path: '',
      category: 'ACTION',
      icon: <PlusCircle className="w-4 h-4 text-[#00225A]" />,
      subtitle: 'Prepare simulated order for execution',
      action: () => openOrderTicket(),
    },
    {
      id: 'act-reset',
      title: 'Reset Virtual Account (₹10,00,000)',
      path: '',
      category: 'ACTION',
      icon: <RotateCcw className="w-4 h-4 text-[#D92D20]" />,
      subtitle: 'Restore virtual balance to ₹10 Lakhs INR',
      action: () => onOpenReset && onOpenReset(),
    },
  ], [openOrderTicket, onOpenReset]);

  // Search filtered items
  const filteredItems = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) {
      return [...actionItems, ...navigationItems];
    }

    const matchedNav = navigationItems.filter(
      item => item.title.toUpperCase().includes(q) || (item.subtitle && item.subtitle.toUpperCase().includes(q))
    );

    const matchedActions = actionItems.filter(
      item => item.title.toUpperCase().includes(q) || (item.subtitle && item.subtitle.toUpperCase().includes(q))
    );

    // Also match instruments
    const matchedInstruments: NavItem[] = INDIAN_INSTRUMENTS_MASTER
      .filter(i => i.tradingsymbol.toUpperCase().includes(q) || i.name.toUpperCase().includes(q))
      .slice(0, 8)
      .map(inst => ({
        id: `inst-${inst.instrument_key}`,
        title: `${inst.tradingsymbol} (${inst.exchange})`,
        subtitle: `${inst.name} · ${inst.instrument_type}`,
        path: '/dashboard/terminal',
        category: 'INSTRUMENT',
        icon: <Sparkles className="w-4 h-4 text-[#536CF0]" />,
        action: () => {
          setSelectedInstrument(inst);
          navigate('/dashboard/terminal');
        }
      }));

    return [...matchedActions, ...matchedNav, ...matchedInstruments];
  }, [query, navigationItems, actionItems, setSelectedInstrument, navigate]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }

      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const active = filteredItems[selectedIndex];
        if (active) {
          executeItem(active);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  const executeItem = (item: NavItem) => {
    onClose();
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-[#00225A]/30 backdrop-blur-sm select-none animate-in fade-in duration-100">
      <div 
        className="w-full max-w-2xl bg-white border border-[#D9E2F2] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-100 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#D9E2F2] bg-[#F7F8FA]">
          <Search className="w-4 h-4 text-[#00225A] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-sm text-[#111114] placeholder-[#6B7A90] focus:outline-none font-sans"
            placeholder="Search commands, instruments (TATASTEEL, NIFTY, GOLDM), or navigation..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-block text-[10px] font-mono font-semibold bg-white border border-[#D9E2F2] px-1.5 py-0.5 rounded text-[#6B7A90] shadow-xs">
              ESC
            </kbd>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#6B7A90] hover:text-[#00225A] hover:bg-[#EEF3FF] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results Stream */}
        <div className="max-h-[400px] overflow-y-auto p-2 divide-y divide-[#D9E2F2]/60 scrollbar-hide">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-xs text-[#6B7A90] font-medium">No results found for "{query}"</p>
              <p className="text-[11px] text-[#6B7A90] mt-1 font-mono">Try searching for symbols like <span className="text-[#00225A] font-bold">TATASTEEL</span>, <span className="text-[#00225A] font-bold">NIFTY</span>, or <span className="text-[#00225A] font-bold">Positions</span>.</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => executeItem(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#EEF3FF] border border-[#D9E2F2] shadow-xs'
                      : 'hover:bg-[#F7F8FA] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-xl border transition-colors ${
                      isSelected 
                        ? 'bg-white border-[#D9E2F2] text-[#00225A] shadow-xs' 
                        : 'bg-white border-[#D9E2F2] text-[#6B7A90]'
                    }`}>
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold truncate ${
                          isSelected ? 'text-[#00225A]' : 'text-[#111114]'
                        }`}>
                          {item.title}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md border uppercase font-bold tracking-wider text-[#00225A] border-[#D9E2F2] bg-[#F7F8FA]">
                          {item.category}
                        </span>
                      </div>
                      {item.subtitle && (
                        <p className="text-[11px] text-[#6B7A90] truncate font-sans">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pl-3">
                    {isSelected && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-[#536CF0] font-semibold">
                        <span>Execute</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2.5 bg-[#F7F8FA] border-t border-[#D9E2F2] flex items-center justify-between text-[11px] text-[#6B7A90] font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="bg-white px-1.5 py-0.5 rounded border border-[#D9E2F2] text-[#00225A] shadow-xs">↑</kbd>
              <kbd className="bg-white px-1.5 py-0.5 rounded border border-[#D9E2F2] text-[#00225A] shadow-xs">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-white px-1.5 py-0.5 rounded border border-[#D9E2F2] text-[#00225A] shadow-xs">↵</kbd>
              <span>to select</span>
            </span>
          </div>
          <span className="text-[#00225A] font-bold text-[10px] tracking-wider uppercase font-mono">Command Terminal</span>
        </div>
      </div>
    </div>
  );
};