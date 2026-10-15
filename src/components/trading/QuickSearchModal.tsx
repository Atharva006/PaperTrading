import React, { useState, useEffect } from 'react';
import { useTradingStore } from '../../store/useTradingStore';
import { marketDataService } from '../../services/market/MarketDataService';
import type { Instrument } from '../../types/market';
import { Search, Plus, LineChart, PlusCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Instrument[]>([]);
  const { setSelectedInstrument, openOrderTicket, watchlists, activeWatchlistId, addToWatchlist, quotes } = useTradingStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      marketDataService.searchInstruments(query).then(async (res) => {
        setResults(res);
        const topKeys = res.slice(0, 8).map(i => i.instrument_key);
        if (topKeys.length > 0) {
          const qs = await marketDataService.getQuotes(topKeys);
          Object.values(qs).forEach(q => useTradingStore.getState().updateQuote(q));
        }
      });
    }
  }, [isOpen, query]);

  // Handle Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectInstrument = (inst: Instrument) => {
    setSelectedInstrument(inst);
    onClose();
    navigate('/dashboard/terminal');
  };

  const handleTrade = (e: React.MouseEvent, inst: Instrument) => {
    e.stopPropagation();
    setSelectedInstrument(inst);
    openOrderTicket({
      instrument_key: inst.instrument_key,
      tradingsymbol: inst.tradingsymbol,
      exchange: inst.exchange,
      instrument_type: inst.instrument_type,
      lot_size: inst.lot_size,
    });
    onClose();
  };

  const handleAddWatchlist = async (e: React.MouseEvent, inst: Instrument) => {
    e.stopPropagation();
    const wlId = activeWatchlistId || watchlists[0]?.id || '';
    await addToWatchlist(wlId, inst);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-[#0B1424]/80 backdrop-blur-md select-none">
      <div className="bg-[#0E1728] border border-[rgba(198,161,91,0.3)] rounded-2xl max-w-xl w-full shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(198,161,91,0.15)] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[rgba(198,161,91,0.18)] bg-[#0B1424]">
          <Search className="w-4 h-4 text-[#C6A15B]" />
          <input
            autoFocus
            type="text"
            className="flex-1 bg-transparent text-sm text-[#F5F5F2] placeholder-[#A1A8B3]/50 focus:outline-none"
            placeholder="Search Indian stocks (TATASTEEL, RELIANCE), indices (NIFTY), or derivatives..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            onClick={onClose}
            className="text-[#A1A8B3] hover:text-[#F5F5F2] p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-white/[0.05]">
          {results.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#A1A8B3]">
              No Indian instruments found matching "{query}"
            </div>
          ) : (
            results.map((inst) => {
              const quote = quotes[inst.instrument_key] || quotes[inst.tradingsymbol];
              return (
                <div
                  key={inst.instrument_key}
                  onClick={() => handleSelectInstrument(inst)}
                  className="flex items-center justify-between p-3.5 hover:bg-[#14223A]/60 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#0B1424] text-[#A1A8B3] border border-white/5">
                      {inst.exchange}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#F5F5F2] group-hover:text-[#C6A15B] transition-colors">
                          {inst.tradingsymbol}
                        </span>
                        <span className="text-[10px] text-[#A1A8B3] font-medium">
                          {inst.instrument_type}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A1A8B3] truncate max-w-xs">{inst.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {quote && (
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-[#F5F5F2]">
                          ₹{quote.last_price.toFixed(2)}
                        </div>
                        <div className={`text-[10px] font-mono ${quote.change >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                          {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)} ({quote.change_percent.toFixed(2)}%)
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleAddWatchlist(e, inst)}
                        className="p-1.5 rounded-lg bg-[#0B1424] hover:bg-[#14223A] border border-[rgba(198,161,91,0.2)] text-[#A1A8B3] hover:text-[#C6A15B] transition-colors"
                        title="Add to Watchlist"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleTrade(e, inst)}
                        className="btn-cendrix-gold py-1 px-3 text-xs"
                        title="Open Order Ticket"
                      >
                        Trade
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
