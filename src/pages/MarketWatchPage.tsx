import React, { useState } from 'react';
import { useTradingStore } from '../store/useTradingStore';
import { INDIAN_INSTRUMENTS_MASTER } from '../services/market/indianInstruments';
import type { Instrument } from '../types/market';
import { 
  Eye, Plus, Search, Trash2, LineChart, PlusCircle, ArrowUpRight, ArrowDownRight, MoreVertical 
} from 'lucide-react';
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
  const [isAdding, setIsAdding] = useState(false);

  const currentWl = watchlists.find(w => w.id === activeWatchlistId) || watchlists[0];

  const searchResults = searchQuery.trim()
    ? INDIAN_INSTRUMENTS_MASTER.filter(
        i =>
          i.tradingsymbol.toUpperCase().includes(searchQuery.toUpperCase()) ||
          i.name.toUpperCase().includes(searchQuery.toUpperCase())
      )
    : [];

  const handleOpenChart = (inst: Instrument) => {
    setSelectedInstrument(inst);
    navigate('/dashboard/terminal');
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
    <div className="space-y-6 pb-12 max-w-7xl mx-auto select-none font-sans">
      {/* ── Top Header & Watchlist Tabs ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0E1728] border border-[rgba(198,161,91,0.22)] shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#F5F5F2] tracking-tight flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#C6A15B]" />
            <span>Market Watch</span>
          </h2>
          <p className="text-xs text-[#A1A8B3]">Live quotes & watchlist monitoring for NSE and BSE</p>
        </div>

        {/* Watchlist Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {watchlists.map((wl) => (
            <button
              key={wl.id}
              onClick={() => setActiveWatchlist(wl.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                activeWatchlistId === wl.id
                  ? 'bg-[#C6A15B] border-[#C6A15B] text-[#0B1424] font-bold shadow-[0_0_12px_rgba(198,161,91,0.3)]'
                  : 'bg-[#0B1424] border-white/10 text-[#A1A8B3] hover:text-[#F5F5F2]'
              }`}
            >
              {wl.name} ({wl.items.length})
            </button>
          ))}
        </div>
      </div>

      {/* ── Add Instrument Search Bar ───────────────────────────────────── */}
      <div className="relative">
        <div className="flex items-center gap-3 p-3 bg-[#0E1728] border border-[rgba(198,161,91,0.22)] rounded-xl">
          <Search className="w-4 h-4 text-[#C6A15B]" />
          <input
            type="text"
            className="flex-1 bg-transparent text-xs text-[#F5F5F2] placeholder-[#A1A8B3]/50 focus:outline-none"
            placeholder="Search and add stock, index, or derivative to this watchlist (e.g. TATASTEEL, RELIANCE, NIFTY 24500 CE)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {searchResults.length > 0 && (
          <div className="absolute top-12 left-0 right-0 z-30 bg-[#0B1424] border border-[rgba(198,161,91,0.3)] rounded-xl shadow-2xl max-h-64 overflow-y-auto divide-y divide-white/[0.05]">
            {searchResults.map((inst) => (
              <div
                key={inst.instrument_key}
                className="flex items-center justify-between p-3 hover:bg-[#14223A]/60 text-xs transition-colors"
              >
                <div>
                  <span className="font-bold text-[#F5F5F2] mr-2">{inst.tradingsymbol}</span>
                  <span className="text-[10px] text-[#A1A8B3] font-mono">{inst.exchange} · {inst.instrument_type}</span>
                  <p className="text-[11px] text-[#A1A8B3] truncate">{inst.name}</p>
                </div>
                <button
                  onClick={async () => {
                    await addToWatchlist(currentWl?.id || '', inst);
                    setSearchQuery('');
                  }}
                  className="btn-cendrix-gold py-1 px-3 text-xs"
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Watchlist Table ─────────────────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-[#0E1728] border border-[rgba(198,161,91,0.22)] shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
        {!currentWl || currentWl.items.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#71717a]">
            Watchlist is empty. Search above to add instruments.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#27272a] text-[#71717a] text-[10px] uppercase font-semibold">
                  <th className="py-3 px-3">Symbol</th>
                  <th className="py-3 px-3">Exchange</th>
                  <th className="py-3 px-3">LTP (₹)</th>
                  <th className="py-3 px-3">Change (₹)</th>
                  <th className="py-3 px-3">Change (%)</th>
                  <th className="py-3 px-3">High / Low</th>
                  <th className="py-3 px-3">Volume</th>
                  <th className="py-3 px-3 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a]/60 font-mono">
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

                  return (
                    <tr key={item.id} className="hover:bg-[#18181b]/50 group transition-colors">
                      <td className="py-3 px-3 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span>{item.tradingsymbol}</span>
                          <span className="text-[10px] font-normal text-[#71717a] hidden sm:inline">
                            {item.instrument_type}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[#a1a1aa] font-sans">
                        <span className="text-[10px] bg-[#27272a] px-1.5 py-0.5 rounded font-bold">
                          {item.exchange}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-white">
                        {quote ? `₹${quote.last_price.toFixed(2)}` : 'Loading...'}
                      </td>
                      <td className={`py-3 px-3 font-medium ${quote && quote.change >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                        {quote ? `${quote.change >= 0 ? '+' : ''}${quote.change.toFixed(2)}` : '-'}
                      </td>
                      <td className={`py-3 px-3 font-medium ${quote && quote.change >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                        {quote ? `${quote.change >= 0 ? '+' : ''}${quote.change_percent.toFixed(2)}%` : '-'}
                      </td>
                      <td className="py-3 px-3 text-[#71717a] text-[11px]">
                        {quote ? `₹${quote.high.toFixed(1)} / ₹${quote.low.toFixed(1)}` : '-'}
                      </td>
                      <td className="py-3 px-3 text-[#a1a1aa]">
                        {quote ? quote.volume.toLocaleString() : '-'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100">
                          <button
                            onClick={() => handleTrade(master, 'BUY')}
                            className="px-2.5 py-1 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-[11px] font-bold rounded-lg transition-colors"
                          >
                            B
                          </button>
                          <button
                            onClick={() => handleTrade(master, 'SELL')}
                            className="px-2.5 py-1 bg-[#ef4444] hover:bg-[#dc2626] text-white text-[11px] font-bold rounded-lg transition-colors"
                          >
                            S
                          </button>
                          <button
                            onClick={() => handleOpenChart(master)}
                            className="p-1 text-[#71717a] hover:text-white rounded-lg hover:bg-[#27272a] transition-colors"
                            title="Open Interactive Chart"
                          >
                            <LineChart className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeFromWatchlist(currentWl.id, item.instrument_key)}
                            className="p-1 text-[#71717a] hover:text-[#ef4444] rounded-lg hover:bg-[#27272a] transition-colors"
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
