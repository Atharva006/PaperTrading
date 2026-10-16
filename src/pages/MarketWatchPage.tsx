import React, { useState } from 'react';
import { useTradingStore } from '../store/useTradingStore';
import { INDIAN_INSTRUMENTS_MASTER } from '../services/market/indianInstruments';
import type { Instrument } from '../types/market';
import { Search, Trash2, Zap, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MarketWatchPage() {
  const { 
    watchlists, 
    activeWatchlistId, 
    setActiveWatchlist, 
    removeFromWatchlist, 
    addToWatchlist, 
    quotes, 
    openOrderTicket, 
    setSelectedInstrument 
  } = useTradingStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');

  const currentWl = watchlists.find(w => w.id === activeWatchlistId) || watchlists[0];

  const searchResults = searchQuery.trim()
    ? INDIAN_INSTRUMENTS_MASTER.filter(
        i =>
          i.tradingsymbol.toUpperCase().includes(searchQuery.toUpperCase()) ||
          i.name.toUpperCase().includes(searchQuery.toUpperCase())
      )
    : [];

  const handleOpenTerminal = (inst: Instrument) => {
    setSelectedInstrument(inst);
    if (inst.exchange === 'MCX' || inst.exchange === 'NCDEX') {
      navigate('/dashboard/commodities');
    } else {
      navigate('/dashboard/terminal');
    }
  };

  const handleTrade = (inst: Instrument, type: 'BUY' | 'SELL') => {
    setSelectedInstrument(inst);
    openOrderTicket({
      instrument_key: inst.instrument_key,
      tradingsymbol: inst.tradingsymbol,
      exchange: inst.exchange,
      instrument_type: inst.instrument_type,
      transaction_type: type,
      lot_size: inst.lot_size,
    });
  };

  return (
    <div className="w-full max-w-[1720px] mx-auto select-none font-sans text-[#F5F5F2] pb-12 space-y-4">
      {/* ── 1. Top Cendrix Header Strip ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#14223A]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-widest text-[#C6A15B] uppercase font-bold">
              Institutional Feed · Multi-Asset Watchlist
            </span>
          </div>
          <h1 className="text-2xl font-serif tracking-tight text-[#F5F5F2] flex items-center gap-2.5">
            <span>Market Watch</span>
            <span className="text-xs font-mono font-normal text-[#A1A8B3]">
              ({currentWl?.items.length || 0}/50)
            </span>
          </h1>
          <p className="text-xs text-[#A1A8B3] mt-0.5">Live real-time quotes for NSE, BSE equities and MCX commodities</p>
        </div>

        {/* Watchlist Sub-Tabs (1, 2, 3, 4, 5) */}
        <div className="flex items-center gap-3 text-xs font-mono">
          {watchlists.map((wl, idx) => (
            <button
              key={wl.id}
              onClick={() => setActiveWatchlist(wl.id)}
              className={`pb-1.5 px-1 border-b-2 transition-all font-semibold ${
                activeWatchlistId === wl.id
                  ? 'border-[#C6A15B] text-[#C6A15B]'
                  : 'border-transparent text-[#6E7683] hover:text-[#F5F5F2]'
              }`}
            >
              {wl.name || `Watchlist ${idx + 1}`} ({wl.items.length})
            </button>
          ))}
        </div>
      </div>

      {/* ── 2. Search & Add Bar ─────────────────────────────────────────── */}
      <div className="relative">
        <div className="flex items-center gap-2.5 px-3.5 py-2 bg-[#0E1728] border border-[#14223A] rounded-xl focus-within:border-[#C6A15B] transition-colors shadow-sm">
          <Search className="w-4 h-4 text-[#C6A15B]" />
          <input
            type="text"
            className="flex-1 bg-transparent text-xs text-[#F5F5F2] placeholder-[#6E7683] focus:outline-none font-sans"
            placeholder="Search and add stock, index, MCX commodity, or derivative (e.g. TATASTEEL, GOLD, RELIANCE, NIFTY 23000 CE)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {searchResults.length > 0 && (
          <div className="absolute top-12 left-0 right-0 z-30 bg-[#0E1728] border border-[rgba(198,161,91,0.25)] rounded-xl shadow-2xl max-h-64 overflow-y-auto divide-y divide-[#14223A]">
            {searchResults.map((inst) => (
              <div
                key={inst.instrument_key}
                className="flex items-center justify-between p-3 hover:bg-[#14223A]/50 text-xs transition-colors"
              >
                <div>
                  <span className="font-semibold text-[#F5F5F2] mr-2">{inst.tradingsymbol}</span>
                  <span className="text-[10px] text-[#C6A15B] font-mono px-1 py-0.5 rounded bg-[#0B1424] border border-[#14223A]">{inst.exchange} · {inst.instrument_type}</span>
                  <p className="text-[11px] text-[#A1A8B3] truncate mt-0.5">{inst.name}</p>
                </div>
                <button
                  onClick={async () => {
                    await addToWatchlist(currentWl?.id || '', inst);
                    setSearchQuery('');
                  }}
                  className="px-3 py-1 bg-[#C6A15B]/15 hover:bg-[#C6A15B] text-[#E2C889] hover:text-[#070D18] text-xs font-semibold rounded-lg border border-[#C6A15B]/30 transition-all shadow-sm"
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 3. Watchlist Table ────────────────────────── */}
      <div className="mt-2">
        {!currentWl || currentWl.items.length === 0 ? (
          <div className="py-24 text-center cendrix-card rounded-xl border border-[#14223A]">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#10141C] border border-[#14223A] flex items-center justify-center text-[#C6A15B] mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <p className="text-sm font-serif text-[#F5F5F2]">Watchlist is empty</p>
            <p className="text-xs text-[#6E7683] mt-1 font-mono">
              Use the search bar above to add instruments to this watchlist.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto cendrix-card rounded-xl border border-[#14223A]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#14223A] text-[#6E7683] text-[11px] font-mono uppercase bg-[#0B1424]">
                  <th className="py-3 px-4">Symbol</th>
                  <th className="py-3 px-4">Exchange</th>
                  <th className="py-3 px-4 text-right">LTP (₹)</th>
                  <th className="py-3 px-4 text-right">Change (₹)</th>
                  <th className="py-3 px-4 text-right">Change (%)</th>
                  <th className="py-3 px-4 text-right">High / Low</th>
                  <th className="py-3 px-4 text-right">Volume</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#14223A] font-mono">
                {currentWl.items.map((item) => {
                  const quote = quotes[item.instrument_key] || quotes[item.tradingsymbol];
                  const master = INDIAN_INSTRUMENTS_MASTER.find(i => i.instrument_key === item.instrument_key) || {
                    instrument_key: item.instrument_key,
                    tradingsymbol: item.tradingsymbol,
                    name: item.tradingsymbol,
                    exchange: item.exchange,
                    instrument_type: item.instrument_type,
                    lot_size: 1,
                    tick_size: 0.05,
                  };

                  const isPos = quote && quote.change >= 0;

                  return (
                    <tr key={item.id || item.instrument_key || item.tradingsymbol} className="hover:bg-[#14223A]/40 group transition-colors">
                      <td className="py-3 px-4 font-sans">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#F5F5F2] group-hover:text-[#C6A15B] transition-colors">
                            {item.tradingsymbol}
                          </span>
                          <span className="text-[10px] text-[#6E7683] hidden sm:inline font-mono">
                            {item.instrument_type}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#A1A8B3] font-sans">
                        <span className="text-[10px] bg-[#0B1424] border border-[#14223A] text-[#C6A15B] px-1.5 py-0.5 rounded font-mono font-semibold">
                          {item.exchange}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#F5F5F2]">
                        {quote && quote.last_price > 0 ? quote.last_price.toFixed(2) : '—'}
                      </td>
                      <td className={`py-3 px-4 text-right font-semibold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {quote ? `${isPos ? '+' : ''}${quote.change.toFixed(2)}` : '—'}
                      </td>
                      <td className={`py-3 px-4 text-right font-semibold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {quote ? `${isPos ? '+' : ''}${quote.change_percent.toFixed(2)}%` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right text-[#A1A8B3] text-[11px]">
                        {quote ? `${quote.high.toFixed(1)} / ${quote.low.toFixed(1)}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right text-[#A1A8B3]">
                        {quote ? quote.volume.toLocaleString('en-IN') : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleTrade(master, 'BUY')}
                            className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded transition-colors shadow-sm"
                          >
                            B
                          </button>
                          <button
                            onClick={() => handleTrade(master, 'SELL')}
                            className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold rounded transition-colors shadow-sm"
                          >
                            S
                          </button>
                          <button
                            onClick={() => handleOpenTerminal(master)}
                            className="p-1 text-[#A1A8B3] hover:text-[#C6A15B] rounded hover:bg-[#14223A] transition-colors"
                            title="Open Order Terminal"
                          >
                            <Zap className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeFromWatchlist(currentWl.id, item.instrument_key)}
                            className="p-1 text-[#6E7683] hover:text-rose-400 rounded hover:bg-[#14223A] transition-colors"
                            title="Remove from Watchlist"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
