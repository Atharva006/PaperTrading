import React, { useState } from 'react';
import { useTradingStore } from '../../store/useTradingStore';
import { INDIAN_INSTRUMENTS_MASTER, getZerodhaContractSpec } from '../../services/market/indianInstruments';
import type { Instrument } from '../../types/market';
import {
  Search,
  Plus,
  Trash2,
  Activity,
  Layers,
  ChevronDown,
  X,
  TrendingUp,
  TrendingDown,
  Pin,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ZerodhaMarketWatch: React.FC = () => {
  const {
    watchlists,
    activeWatchlistId,
    setActiveWatchlist,
    removeFromWatchlist,
    addToWatchlist,
    quotes,
    openOrderTicket,
    selectedInstrument,
    setSelectedInstrument,
  } = useTradingStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const navigate = useNavigate();

  // Current active watchlist
  const currentWl = watchlists.find((w) => w.id === activeWatchlistId) || watchlists[0];

  // Search results from master catalog
  const searchResults = searchQuery.trim()
    ? INDIAN_INSTRUMENTS_MASTER.filter(
        (i) =>
          i.tradingsymbol.toUpperCase().includes(searchQuery.toUpperCase()) ||
          i.name.toUpperCase().includes(searchQuery.toUpperCase())
      ).slice(0, 8)
    : [];

  const handleSelectInstrument = (inst: Instrument) => {
    setSelectedInstrument(inst);
  };

  const handleBuy = (inst: Instrument, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedInstrument(inst);
    const spec = getZerodhaContractSpec(inst.tradingsymbol, inst.instrument_type, inst.exchange, inst.lot_size);
    const q = quotes[inst.instrument_key] || quotes[inst.tradingsymbol];
    openOrderTicket({
      instrument_key: inst.instrument_key,
      tradingsymbol: inst.tradingsymbol,
      exchange: inst.exchange,
      instrument_type: inst.instrument_type,
      transaction_type: 'BUY',
      product: inst.instrument_type.startsWith('FUT') || inst.instrument_type === 'FUTCOM' ? 'NRML' : 'CNC',
      quantity: spec.lotSize,
      lot_size: spec.lotSize,
      price: q && q.last_price > 0 ? q.last_price : 0,
    });
  };

  const handleSell = (inst: Instrument, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedInstrument(inst);
    const spec = getZerodhaContractSpec(inst.tradingsymbol, inst.instrument_type, inst.exchange, inst.lot_size);
    const q = quotes[inst.instrument_key] || quotes[inst.tradingsymbol];
    openOrderTicket({
      instrument_key: inst.instrument_key,
      tradingsymbol: inst.tradingsymbol,
      exchange: inst.exchange,
      instrument_type: inst.instrument_type,
      transaction_type: 'SELL',
      product: inst.instrument_type.startsWith('FUT') || inst.instrument_type === 'FUTCOM' ? 'NRML' : 'CNC',
      quantity: spec.lotSize,
      lot_size: spec.lotSize,
      price: q && q.last_price > 0 ? q.last_price : 0,
    });
  };

  const handleOpenTerminal = (inst: Instrument, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedInstrument(inst);
    if (inst.exchange === 'MCX' || inst.exchange === 'NCDEX') {
      navigate('/dashboard/commodities');
    } else {
      navigate('/dashboard/terminal');
    }
  };

  const handleAddSearchResult = async (inst: Instrument) => {
    if (currentWl) {
      await addToWatchlist(currentWl.id, inst);
      setSearchQuery('');
    }
  };

  const fmt = (n: number) =>
    n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="flex flex-col h-full bg-[#10141e] text-[#f0f3f8] select-none font-sans text-xs border-r border-[#1e2638]">
      {/* ── 1. Search Bar at Top ────────────────────────────────────────── */}
      <div className="p-2.5 border-b border-[#1e2638] bg-[#0d111a] relative">
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[#141b27] border border-[#1e2638] rounded focus-within:border-[#387ed1] transition-colors">
          <Search className="w-3.5 h-3.5 text-[#5c687a] shrink-0" />
          <input
            type="text"
            className="w-full bg-transparent text-xs text-[#f0f3f8] placeholder-[#5c687a] focus:outline-none"
            placeholder="Search (eg: infy, bse, nifty, crudeoil)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[#5c687a] hover:text-[#f0f3f8]"
            >
              <X className="w-3 h-3" />
            </button>
          ) : (
            <span className="text-[10px] font-mono text-[#5c687a] shrink-0">
              {currentWl?.items.length || 0}/50
            </span>
          )}
        </div>

        {/* Live Search Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-[48px] left-2.5 right-2.5 z-50 bg-[#141b27] border border-[#1e2638] shadow-2xl rounded max-h-72 overflow-y-auto divide-y divide-[#1e2638]">
            {searchResults.map((inst) => {
              const alreadyAdded = currentWl?.items.some((i) => i.instrument_key === inst.instrument_key);
              const q = quotes[inst.instrument_key] || quotes[inst.tradingsymbol];
              const price = q ? q.last_price : 0;

              return (
                <div
                  key={inst.instrument_key}
                  onClick={() => !alreadyAdded && handleAddSearchResult(inst)}
                  className={`flex items-center justify-between p-2.5 cursor-pointer transition-colors ${
                    alreadyAdded ? 'opacity-50 cursor-default' : 'hover:bg-[#1a2334]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[#f0f3f8]">{inst.tradingsymbol}</span>
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#0d111a] text-[#387ed1] border border-[#1e2638]">
                        {inst.exchange}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#5c687a]">{inst.name}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    {price > 0 && (
                      <span className="font-mono text-xs font-bold text-[#f0f3f8]">
                        ₹{fmt(price)}
                      </span>
                    )}
                    <button
                      type="button"
                      disabled={alreadyAdded}
                      className={`p-1 rounded text-xs ${
                        alreadyAdded
                          ? 'text-[#5c687a]'
                          : 'bg-[#387ed1]/15 text-[#387ed1] hover:bg-[#387ed1] hover:text-white'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 2. Scrips List (Authentic Flat Zerodha Row Aesthetic) ──────── */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#171d2b]">
        {currentWl && currentWl.items.length > 0 ? (
          currentWl.items.map((item) => {
            const master =
              INDIAN_INSTRUMENTS_MASTER.find((i) => i.instrument_key === item.instrument_key) || {
                instrument_key: item.instrument_key,
                tradingsymbol: item.tradingsymbol,
                name: item.tradingsymbol,
                exchange: item.exchange,
                instrument_type: item.instrument_type,
                lot_size: 1,
                tick_size: 0.05,
              };

            const q = quotes[item.instrument_key] || quotes[item.tradingsymbol];
            const price = q ? q.last_price : 0;
            const change = q ? q.change : 0;
            const changePct = q ? q.change_percent : 0;
            const isPos = change >= 0;
            const isSelected = selectedInstrument.instrument_key === item.instrument_key;
            const isHovered = hoveredKey === item.instrument_key;

            return (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredKey(item.instrument_key)}
                onMouseLeave={() => setHoveredKey(null)}
                onClick={() => handleSelectInstrument(master as Instrument)}
                className={`flex items-center justify-between px-3 py-2.5 cursor-pointer transition-colors border-l-2 ${
                  isSelected
                    ? 'border-[#387ed1] bg-[#141b27]'
                    : isHovered
                    ? 'border-transparent bg-[#121824]'
                    : 'border-transparent hover:bg-[#121824]'
                }`}
              >
                {/* Symbol & Exchange */}
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`font-semibold text-xs truncate ${
                        isSelected ? 'text-[#387ed1]' : 'text-[#f0f3f8]'
                      }`}
                    >
                      {item.tradingsymbol}
                    </span>
                    <span className="text-[9px] font-mono text-[#5c687a] uppercase shrink-0">
                      {item.exchange}
                    </span>
                  </div>
                </div>

                {/* Center Hover Action Controls (Zerodha Style B / S Buttons) */}
                {isHovered ? (
                  <div className="flex items-center gap-1 animate-fadeIn shrink-0 pr-1">
                    <button
                      type="button"
                      title="Buy (B)"
                      onClick={(e) => handleBuy(master as Instrument, e)}
                      className="w-5 h-5 rounded bg-[#387ed1] hover:bg-[#2e6bb5] text-white font-bold text-[10px] flex items-center justify-center transition-colors shadow-sm"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      title="Sell (S)"
                      onClick={(e) => handleSell(master as Instrument, e)}
                      className="w-5 h-5 rounded bg-[#df514c] hover:bg-[#c93f3a] text-white font-bold text-[10px] flex items-center justify-center transition-colors shadow-sm"
                    >
                      S
                    </button>
                    <button
                      type="button"
                      title="Order Terminal / Depth"
                      onClick={(e) => handleOpenTerminal(master as Instrument, e)}
                      className="p-1 rounded text-[#9ca8ba] hover:text-[#f0f3f8] hover:bg-[#1e2638] transition-colors"
                    >
                      <Activity className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Delete from Watchlist"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWatchlist(currentWl.id, item.instrument_key);
                      }}
                      className="p-1 rounded text-[#9ca8ba] hover:text-[#df514c] hover:bg-[#1e2638] transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  /* Price & Change Telemetry (When not hovered) */
                  <div className="text-right font-mono shrink-0">
                    <div className="text-xs font-bold text-[#f0f3f8]">
                      {price > 0 ? fmt(price) : '—'}
                    </div>
                    {price > 0 && (
                      <div
                        className={`text-[10px] flex items-center justify-end gap-0.5 ${
                          isPos ? 'text-[#00c087]' : 'text-[#df514c]'
                        }`}
                      >
                        {isPos ? '+' : ''}
                        {fmt(change)} ({changePct.toFixed(2)}%)
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center text-[#5c687a] text-xs">
            No instruments in this watchlist.
            <div className="text-[11px] text-[#387ed1] mt-1">Search above to add scrips.</div>
          </div>
        )}
      </div>

      {/* ── 3. Numbered Watchlist Tabs at Bottom (1, 2, 3, 4, 5) ──────── */}
      <div className="border-t border-[#1e2638] bg-[#0d111a] flex items-center justify-between px-2 py-1.5 text-xs font-mono">
        <div className="flex items-center gap-1">
          {watchlists.map((wl, index) => {
            const isActive = activeWatchlistId === wl.id;
            return (
              <button
                key={wl.id}
                onClick={() => setActiveWatchlist(wl.id)}
                title={wl.name}
                className={`w-7 h-7 rounded text-xs font-bold transition-all flex items-center justify-center ${
                  isActive
                    ? 'bg-[#387ed1] text-white'
                    : 'text-[#9ca8ba] hover:text-[#f0f3f8] hover:bg-[#141b27]'
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        <div className="text-[11px] text-[#5c687a] truncate max-w-[140px] font-sans">
          {currentWl?.name || 'Watchlist'}
        </div>
      </div>
    </div>
  );
};
