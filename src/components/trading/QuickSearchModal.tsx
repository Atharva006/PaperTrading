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
        onClose();
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-[#030303]/80 backdrop-blur-sm select-none">
      <div className="bg-[#0D0D0D] border border-[#242424] rounded-xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#242424] bg-[#080808]">
          <Search className="w-4 h-4 text-[#D4AF65]" />
          <input
            autoFocus
            type="text"
            className="flex-1 bg-transparent text-xs sm:text-sm text-[#F5F5F5] placeholder-[#71717A] focus:outline-none"
            placeholder="Search Indian stocks (TATASTEEL, RELIANCE), indices (NIFTY), or derivatives..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            onClick={onClose}
            className="text-[#71717A] hover:text-[#F5F5F5] p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-[#191919]">
          {results.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#71717A]">
              No Indian instruments found matching "{query}"
            </div>
          ) : (
            results.map((inst) => {
              const quote = quotes[inst.instrument_key] || quotes[inst.tradingsymbol];
              return (
                <div
                  key={inst.instrument_key}
                  onClick={() => handleSelectInstrument(inst)}
                  className="flex items-center justify-between p-3 hover:bg-[#131313] cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#080808] text-[#71717A] border border-[#242424]">
                      {inst.exchange}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#F5F5F5] group-hover:text-[#D4AF65] transition-colors">
                          {inst.tradingsymbol}
                        </span>
                        <span className="text-[10px] text-[#71717A] font-medium">
                          {inst.instrument_type}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A1A1AA] truncate max-w-xs">{inst.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {quote && (
                      <div className="text-right font-mono">
                        <div className="text-xs font-bold text-[#F5F5F5]">
                          ₹{quote.last_price.toFixed(2)}
                        </div>
                        <div className={`text-[10px] ${quote.change >= 0 ? 'text-[#00C087]' : 'text-[#FF4D67]'}`}>
                          {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)} ({quote.change_percent.toFixed(2)}%)
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleAddWatchlist(e, inst)}
                        className="p-1.5 rounded bg-[#080808] hover:bg-[#131313] border border-[#242424] text-[#71717A] hover:text-[#D4AF65] transition-colors"
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
