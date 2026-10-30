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
    <div className="w-full max-w-full mx-auto select-none font-sans text-[#111114] pb-12 space-y-4">
      {/* ── 1. Top Header Strip ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#D9E2F2]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-wider text-[#536CF0] uppercase font-bold">
              Institutional Feed · Multi-Asset Watchlist
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold tracking-tight text-[#00225A] flex items-center gap-2.5">
            <span>Market Watch</span>
            <span className="text-xs font-mono font-normal text-[#6B7A90]">
              ({currentWl?.items.length || 0}/50)
            </span>
          </h1>
          <p className="text-xs text-[#6B7A90] mt-0.5">Live real-time quotes for NSE, BSE equities and MCX commodities</p>
        </div>

        {/* Watchlist Sub-Tabs */}
        <div className="flex items-center gap-3 text-xs font-mono">
          {watchlists.map((wl, idx) => (
            <button
              key={wl.id}
              onClick={() => setActiveWatchlist(wl.id)}
              className={`pb-1.5 px-2 border-b-2 transition-all font-semibold cursor-pointer ${
                activeWatchlistId === wl.id
                  ? 'border-[#00225A] text-[#00225A]'
                  : 'border-transparent text-[#6B7A90] hover:text-[#00225A]'
              }`}
            >
              {wl.name || `Watchlist ${idx + 1}`} ({wl.items.length})
            </button>
          ))}
        </div>
      </div>

      {/* ── 2. Search & Add Bar ─────────────────────────────────────────── */}
      <div className="relative">
        <div className="flex items-center gap-2.5 px-3.5 py-2 bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl focus-within:border-[#00225A] transition-colors shadow-sm">
          <Search className="w-4 h-4 text-[#6B7A90]" />
          <input
            type="text"
            className="flex-1 bg-transparent text-xs text-[#111114] placeholder-[#6B7A90] focus:outline-none font-sans"
            placeholder="Search and add stock, index, MCX commodity, or derivative (e.g. TATASTEEL, GOLD, RELIANCE, NIFTY 23000 CE)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {searchResults.length > 0 && (
          <div className="absolute top-12 left-0 right-0 z-30 bg-white border border-[#D9E2F2] rounded-xl shadow-2xl max-h-64 overflow-y-auto divide-y divide-[#D9E2F2]">
            {searchResults.map((inst) => (
              <div
                key={inst.instrument_key}
                className="flex items-center justify-between p-3 hover:bg-[#F7F8FA] text-xs transition-colors"
              >
                <div>
                  <span className="font-semibold text-[#00225A] mr-2">{inst.tradingsymbol}</span>
                  <span className="text-[10px] text-[#00225A] font-mono px-1.5 py-0.5 rounded bg-[#EEF3FF] border border-[#D9E2F2] font-bold">{inst.exchange} · {inst.instrument_type}</span>
                  <p className="text-[11px] text-[#6B7A90] truncate mt-0.5">{inst.name}</p>
                </div>
                <button
                  onClick={async () => {
                    await addToWatchlist(currentWl?.id || '', inst);
                    setSearchQuery('');
                  }}
                  className="px-3 py-1 bg-[#EEF3FF] hover:bg-[#00225A] text-[#00225A] hover:text-white text-xs font-semibold rounded-lg border border-[#D9E2F2] transition-all shadow-sm cursor-pointer"
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 3. Watchlist Table ──────────────────────────────────────────── */}
      <div className="mt-2">
        {!currentWl || currentWl.items.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)]">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#EEF3FF] border border-[#D9E2F2] flex items-center justify-center text-[#536CF0] mb-3 shadow-sm">
              <Layers className="w-6 h-6" />
            </div>
            <p className="text-sm font-display font-bold text-[#00225A]">Watchlist is empty</p>
            <p className="text-xs text-[#6B7A90] mt-1 font-mono">
              Use the search bar above to add instruments to this watchlist.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#D9E2F2] text-[#6B7A90] text-[11px] font-mono uppercase bg-[#F7F8FA]">
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
              <tbody className="divide-y divide-[#D9E2F2] font-mono">
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
                    <tr key={item.id || item.instrument_key || item.tradingsymbol} className="hover:bg-[#F7F8FA] group transition-colors">
                      <td className="py-3 px-4 font-sans">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#00225A] group-hover:text-[#536CF0] transition-colors">
                            {item.tradingsymbol}
                          </span>
                          <span className="text-[10px] text-[#6B7A90] hidden sm:inline font-mono">
                            {item.instrument_type}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#6B7A90] font-sans">
                        <span className="text-[10px] bg-[#EEF3FF] border border-[#D9E2F2] text-[#00225A] px-1.5 py-0.5 rounded font-mono font-bold">
                          {item.exchange}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#111114]">
                        {quote && quote.last_price > 0 ? quote.last_price.toFixed(2) : '—'}
                      </td>
                      <td className={`py-3 px-4 text-right font-semibold ${isPos ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
                        {quote ? `${isPos ? '+' : ''}${quote.change.toFixed(2)}` : '—'}
                      </td>
                      <td className={`py-3 px-4 text-right font-semibold ${isPos ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
                        {quote ? `${isPos ? '+' : ''}${quote.change_percent.toFixed(2)}%` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right text-[#6B7A90] text-[11px]">
                        {quote ? `${quote.high.toFixed(1)} / ${quote.low.toFixed(1)}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right text-[#6B7A90]">
                        {quote ? quote.volume.toLocaleString('en-IN') : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleTrade(master, 'BUY')}
                            className="px-2 py-0.5 bg-[#12B76A] hover:brightness-105 text-white text-[11px] font-bold rounded shadow-sm cursor-pointer"
                          >
                            B
                          </button>
                          <button
                            onClick={() => handleTrade(master, 'SELL')}
                            className="px-2 py-0.5 bg-[#D92D20] hover:brightness-105 text-white text-[11px] font-bold rounded shadow-sm cursor-pointer"
                          >
                            S
                          </button>
                          <button
                            onClick={() => handleOpenTerminal(master)}
                            className="p-1 text-[#6B7A90] hover:text-[#00225A] rounded hover:bg-[#EEF3FF] transition-colors cursor-pointer"
                            title="Open Order Terminal"
                          >
                            <Zap className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeFromWatchlist(currentWl.id, item.instrument_key)}
                            className="p-1 text-[#6B7A90] hover:text-[#D92D20] rounded hover:bg-[#FEE4E2] transition-colors cursor-pointer"
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
