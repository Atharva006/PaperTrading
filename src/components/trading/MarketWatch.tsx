import React, { useState } from 'react';
import { useTradingStore } from '../../store/useTradingStore';
import { INDIAN_INSTRUMENTS_MASTER, getExchangeContractSpec } from '../../services/market/indianInstruments';
import type { Instrument } from '../../types/market';
import {
  Search,
  Plus,
  Trash2,
  Activity,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MarketWatch: React.FC = () => {
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
    if (inst.exchange === 'MCX' || inst.exchange === 'NCDEX' || inst.instrument_type === 'FUTCOM') {
      navigate('/dashboard/commodities');
    } else {
      navigate('/dashboard/terminal');
    }
  };

  const handleBuy = (inst: Instrument, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedInstrument(inst);
    const spec = getExchangeContractSpec(inst.tradingsymbol, inst.instrument_type, inst.exchange, inst.lot_size);
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
    const spec = getExchangeContractSpec(inst.tradingsymbol, inst.instrument_type, inst.exchange, inst.lot_size);
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
    <div className="flex flex-col h-full bg-[#FFFFFF] text-[#111114] select-none font-sans text-xs border-r border-[#D9E2F2]">
      {/* ── 1. Search Bar at Top ────────────────────────────────────────── */}
      <div className="p-3 border-b border-[#D9E2F2] bg-[#FFFFFF] relative">
        <div className="flex items-center gap-2 px-3 py-2 bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl focus-within:border-[#536CF0] focus-within:bg-white transition-all shadow-2xs">
          <Search className="w-4 h-4 text-[#6B7A90] shrink-0" />
          <input
            type="text"
            className="w-full bg-transparent text-xs text-[#111114] placeholder-[#94A3B8] focus:outline-none font-medium"
            placeholder="Search (eg: RELIANCE, NIFTY, GOLD)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[#6B7A90] hover:text-[#00225A]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="text-[10px] font-mono text-[#00225A] font-semibold shrink-0 bg-white px-1.5 py-0.5 rounded border border-[#D9E2F2]">
              {currentWl?.items.length || 0}/50
            </span>
          )}
        </div>

        {/* Live Search Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-[56px] left-3 right-3 z-50 bg-white border border-[#D9E2F2] shadow-xl rounded-2xl max-h-72 overflow-y-auto divide-y divide-[#EAEFF8]">
            {searchResults.map((inst) => {
              const alreadyAdded = currentWl?.items.some((i) => i.instrument_key === inst.instrument_key);
              const q = quotes[inst.instrument_key] || quotes[inst.tradingsymbol];
              const price = q ? q.last_price : 0;

              return (
                <div
                  key={inst.instrument_key}
                  onClick={() => !alreadyAdded && handleAddSearchResult(inst)}
                  className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                    alreadyAdded ? 'opacity-50 cursor-default' : 'hover:bg-[#F7F8FA]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[#00225A]">{inst.tradingsymbol}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#F7F8FA] text-[#6B7A90] border border-[#D9E2F2] font-semibold">
                        {inst.exchange}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#6B7A90] truncate max-w-[170px]">{inst.name}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    {price > 0 && (
                      <span className="font-mono text-xs font-bold text-[#111114]">
                        ₹{fmt(price)}
                      </span>
                    )}
                    <button
                      type="button"
                      disabled={alreadyAdded}
                      className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                        alreadyAdded
                          ? 'text-[#94A3B8] bg-[#F7F8FA]'
                          : 'bg-[#EEF3FF] text-[#00225A] hover:bg-[#00225A] hover:text-white border border-[#D9E2F2]'
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

      {/* ── 2. Scrips List ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#EAEFF8]">
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
                className={`flex items-center justify-between px-3 py-2.5 cursor-pointer transition-all border-l-3 ${
                  isSelected
                    ? 'border-[#00225A] bg-[#EEF3FF] shadow-2xs'
                    : isHovered
                    ? 'border-transparent bg-[#F7F8FA]'
                    : 'border-transparent hover:bg-[#F7F8FA]/60'
                }`}
              >
                {/* Symbol & Exchange */}
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`font-semibold text-xs truncate ${
                        isSelected ? 'text-[#00225A]' : 'text-[#111114]'
                      }`}
                    >
                      {item.tradingsymbol}
                    </span>
                    <span className="text-[9px] font-mono text-[#6B7A90] uppercase shrink-0 px-1 py-0.2 bg-[#F7F8FA] rounded border border-[#D9E2F2]">
                      {item.exchange}
                    </span>
                  </div>
                </div>

                {/* Center Hover Action Controls */}
                {isHovered ? (
                  <div className="flex items-center gap-1 animate-fadeIn shrink-0 pr-1">
                    <button
                      type="button"
                      title="Buy (B)"
                      onClick={(e) => handleBuy(master as Instrument, e)}
                      className="w-5 h-5 rounded-md bg-[#12B76A] hover:bg-[#0E9355] text-white font-bold text-[10px] flex items-center justify-center transition-all shadow-2xs active:scale-[0.92]"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      title="Sell (S)"
                      onClick={(e) => handleSell(master as Instrument, e)}
                      className="w-5 h-5 rounded-md bg-[#D92D20] hover:bg-[#B42318] text-white font-bold text-[10px] flex items-center justify-center transition-all shadow-2xs active:scale-[0.92]"
                    >
                      S
                    </button>
                    <button
                      type="button"
                      title="Order Terminal / Depth"
                      onClick={(e) => handleOpenTerminal(master as Instrument, e)}
                      className="p-1 rounded-md text-[#6B7A90] hover:text-[#00225A] hover:bg-white border border-transparent hover:border-[#D9E2F2] transition-colors active:scale-[0.92]"
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
                      className="p-1 rounded-md text-[#6B7A90] hover:text-[#D92D20] hover:bg-[#FEF3F2] transition-colors active:scale-[0.92]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  /* Price & Change Telemetry */
                  <div className="text-right font-mono shrink-0">
                    <div className="text-xs font-bold text-[#111114]">
                      {price > 0 ? fmt(price) : '—'}
                    </div>
                    {price > 0 && (
                      <div
                        className={`text-[10px] font-semibold flex items-center justify-end gap-0.5 ${
                          isPos ? 'text-[#12B76A]' : 'text-[#D92D20]'
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
          <div className="py-16 text-center text-[#6B7A90] text-xs">
            No instruments in this watchlist.
            <div className="text-[11px] text-[#536CF0] mt-1 font-mono font-medium">Search above to add scrips.</div>
          </div>
        )}
      </div>

      {/* ── 3. Numbered Watchlist Tabs at Bottom ───────────────────────── */}
      <div className="border-t border-[#D9E2F2] bg-[#FCFCFC] flex items-center justify-between px-3 py-2 text-xs font-mono">
        <div className="flex items-center gap-1 bg-[#F0F2F6] p-1 rounded-xl border border-[#D9E2F2]">
          {watchlists.map((wl, index) => {
            const isActive = activeWatchlistId === wl.id;
            return (
              <button
                key={wl.id}
                onClick={() => setActiveWatchlist(wl.id)}
                title={wl.name}
                className={`w-6 h-6 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center active:scale-[0.92] ${
                  isActive
                    ? 'bg-[#00225A] text-white shadow-2xs'
                    : 'text-[#6B7A90] hover:text-[#00225A] hover:bg-white'
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        <div className="text-[11px] text-[#6B7A90] truncate max-w-[140px] font-sans font-medium">
          {currentWl?.name || 'Watchlist'}
        </div>
      </div>
    </div>
  );
};
