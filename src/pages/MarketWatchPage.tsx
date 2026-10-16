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
    <div className="w-full max-w-[1720px] mx-auto select-none font-sans text-[#f0f3f8] pb-12 space-y-4">
      {/* ── 1. Top Zerodha Header Strip ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[#1e2638]">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-[#f0f3f8] flex items-center gap-2">
            <span>Market Watch</span>
            <span className="text-xs font-mono font-normal text-[#788296]">
              ({currentWl?.items.length || 0}/50)
            </span>
          </h1>
          <p className="text-xs text-[#788296] mt-0.5">Live quotes for NSE, BSE, and MCX scrips</p>
        </div>

        {/* Watchlist Sub-Tabs (1, 2, 3, 4, 5) */}
        <div className="flex items-center gap-4 text-xs font-medium">
          {watchlists.map((wl, idx) => (
            <button
              key={wl.id}
              onClick={() => setActiveWatchlist(wl.id)}
              className={`pb-1 border-b-2 transition-all ${
                activeWatchlistId === wl.id
                  ? 'border-[#387ed1] text-[#387ed1] font-semibold'
                  : 'border-transparent text-[#788296] hover:text-[#c4cbd4]'
              }`}
            >
              {wl.name || `Watchlist ${idx + 1}`} ({wl.items.length})
            </button>
          ))}
        </div>
      </div>

      {/* ── 2. Search & Add Bar ─────────────────────────────────────────── */}
      <div className="relative">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#121722] border border-[#1e2638] rounded focus-within:border-[#387ed1] transition-colors">
          <Search className="w-4 h-4 text-[#58647a]" />
          <input
            type="text"
            className="flex-1 bg-transparent text-xs text-[#f0f3f8] placeholder-[#58647a] focus:outline-none font-sans"
            placeholder="Search and add stock, index, MCX commodity, or derivative (e.g. TATASTEEL, GOLD, RELIANCE, NIFTY 23000 CE)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {searchResults.length > 0 && (
          <div className="absolute top-10 left-0 right-0 z-30 bg-[#0c1018] border border-[#1e2638] rounded shadow-2xl max-h-64 overflow-y-auto divide-y divide-[#1e2638]">
            {searchResults.map((inst) => (
              <div
                key={inst.instrument_key}
                className="flex items-center justify-between p-2.5 hover:bg-[#121722] text-xs transition-colors"
              >
                <div>
                  <span className="font-semibold text-[#f0f3f8] mr-2">{inst.tradingsymbol}</span>
                  <span className="text-[10px] text-[#788296] font-mono">{inst.exchange} · {inst.instrument_type}</span>
                  <p className="text-[11px] text-[#788296] truncate">{inst.name}</p>
                </div>
                <button
                  onClick={async () => {
                    await addToWatchlist(currentWl?.id || '', inst);
                    setSearchQuery('');
                  }}
                  className="px-2.5 py-1 bg-[#387ed1] hover:bg-[#2e6bb5] text-white text-xs font-medium rounded transition-colors"
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 3. Watchlist Table (Flat Edge-to-Edge) ────────────────────────── */}
      <div className="mt-2">
        {!currentWl || currentWl.items.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#151b28] border border-[#1e2638] flex items-center justify-center text-[#788296] mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-[#c4cbd4]">Watchlist is empty</p>
            <p className="text-xs text-[#58647a] mt-1">
              Use the search bar above to add instruments to this watchlist.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1e2638] text-[#788296] text-[11px] font-medium">
                  <th className="py-2.5 px-3">Symbol</th>
                  <th className="py-2.5 px-3">Exchange</th>
                  <th className="py-2.5 px-3 text-right">LTP (₹)</th>
                  <th className="py-2.5 px-3 text-right">Change (₹)</th>
                  <th className="py-2.5 px-3 text-right">Change (%)</th>
                  <th className="py-2.5 px-3 text-right">High / Low</th>
                  <th className="py-2.5 px-3 text-right">Volume</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2638]/60 font-mono">
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
                    <tr key={item.id || item.instrument_key || item.tradingsymbol} className="hover:bg-[#121724] group transition-colors">
                      <td className="py-2.5 px-3 font-sans">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#f0f3f8] group-hover:text-[#387ed1] transition-colors">
                            {item.tradingsymbol}
                          </span>
                          <span className="text-[10px] text-[#58647a] hidden sm:inline font-mono">
                            {item.instrument_type}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-[#788296] font-sans">
                        <span className="text-[10px] bg-[#161d2c] border border-[#1e2638] px-1.5 py-0.5 rounded font-mono">
                          {item.exchange}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-[#f0f3f8]">
                        {quote && quote.last_price > 0 ? quote.last_price.toFixed(2) : '—'}
                      </td>
                      <td className={`py-2.5 px-3 text-right ${isPos ? 'text-[#00c087]' : 'text-[#df514c]'}`}>
                        {quote ? `${isPos ? '+' : ''}${quote.change.toFixed(2)}` : '—'}
                      </td>
                      <td className={`py-2.5 px-3 text-right ${isPos ? 'text-[#00c087]' : 'text-[#df514c]'}`}>
                        {quote ? `${isPos ? '+' : ''}${quote.change_percent.toFixed(2)}%` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#788296] text-[11px]">
                        {quote ? `${quote.high.toFixed(1)} / ${quote.low.toFixed(1)}` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#788296]">
                        {quote ? quote.volume.toLocaleString('en-IN') : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleTrade(master, 'BUY')}
                            className="px-2 py-0.5 bg-[#387ed1] hover:bg-[#2e6bb5] text-white text-[11px] font-bold rounded transition-colors"
                          >
                            B
                          </button>
                          <button
                            onClick={() => handleTrade(master, 'SELL')}
                            className="px-2 py-0.5 bg-[#df514c] hover:bg-[#c93f3a] text-white text-[11px] font-bold rounded transition-colors"
                          >
                            S
                          </button>
                          <button
                            onClick={() => handleOpenTerminal(master)}
                            className="p-1 text-[#788296] hover:text-[#387ed1] rounded hover:bg-[#1a2235] transition-colors"
                            title="Open Order Terminal"
                          >
                            <Zap className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeFromWatchlist(currentWl.id, item.instrument_key)}
                            className="p-1 text-[#788296] hover:text-[#df514c] rounded hover:bg-[#1a2235] transition-colors"
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
