import React, { useState } from 'react';
import { useTradingStore } from '../store/useTradingStore';
import { TradingViewChart } from '../components/trading/TradingViewChart';
import { INDIAN_INSTRUMENTS_MASTER } from '../services/market/indianInstruments';
import type { Instrument } from '../types/market';
import { 
  LineChart, PlusCircle, Search, Layers, Activity, ChevronRight, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';

export default function TerminalPage() {
  const { selectedInstrument, setSelectedInstrument, quotes, openOrderTicket, positions } = useTradingStore();
  const [searchOpen, setSearchOpen] = useState(false);

  const quote = quotes[selectedInstrument.instrument_key] || quotes[selectedInstrument.tradingsymbol];
  const depth = quote?.depth;

  const handleTrade = (type: 'BUY' | 'SELL') => {
    openOrderTicket({
      instrument_key: selectedInstrument.instrument_key,
      tradingsymbol: selectedInstrument.tradingsymbol,
      exchange: selectedInstrument.exchange,
      instrument_type: selectedInstrument.instrument_type,
      transaction_type: type,
      lot_size: selectedInstrument.lot_size,
    });
  };

  const openPositions = positions.filter(p => !p.is_closed && p.quantity !== 0);

  return (
    <div className="space-y-4 pb-12 max-w-7xl mx-auto select-none font-sans">
      {/* ── Terminal Instrument Header ──────────────────────────────────── */}
      <div className="p-4 rounded-xl bg-[#0E1728] border border-[rgba(198,161,91,0.22)] shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Instrument Dropdown */}
          <select
            value={selectedInstrument.instrument_key}
            onChange={(e) => {
              const inst = INDIAN_INSTRUMENTS_MASTER.find(i => i.instrument_key === e.target.value);
              if (inst) setSelectedInstrument(inst);
            }}
            className="bg-[#0B1424] border border-white/10 text-sm font-bold text-[#F5F5F2] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#C6A15B]"
          >
            {INDIAN_INSTRUMENTS_MASTER.map((i) => (
              <option key={i.instrument_key} value={i.instrument_key}>
                {i.tradingsymbol} ({i.exchange} · {i.instrument_type})
              </option>
            ))}
          </select>

          {quote && (
            <div className="flex items-center gap-3 pl-3 border-l border-white/10">
              <span className="text-lg font-mono font-bold text-[#F5F5F2]">
                ₹{quote.last_price.toFixed(2)}
              </span>
              <span className={`text-xs font-mono font-semibold ${quote.change >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)} ({quote.change_percent.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>

        {/* Quick Order Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTrade('BUY')}
            className="px-4 py-1.5 bg-[#10B981] hover:bg-[#059669] text-[#0B1424] text-xs font-bold rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all active:scale-95"
          >
            BUY (Market / Limit)
          </button>
          <button
            onClick={() => handleTrade('SELL')}
            className="px-4 py-1.5 bg-[#F43F5E] hover:bg-[#E11D48] text-white text-xs font-bold rounded-lg shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all active:scale-95"
          >
            SELL (Short / Exit)
          </button>
        </div>
      </div>

      {/* ── Main Layout: Chart (70%) + Market Depth & Info (30%) ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Interactive Chart */}
        <div className="lg:col-span-3 h-[540px]">
          <TradingViewChart
            instrumentKey={selectedInstrument.instrument_key}
            tradingsymbol={selectedInstrument.tradingsymbol}
          />
        </div>

        {/* Level 2 Market Depth & Details */}
        <div className="space-y-4">
          {/* Market Depth Box */}
          <div className="p-4 rounded-xl bg-[#0E1728] border border-[rgba(198,161,91,0.22)] shadow-[0_8px_30px_rgba(0,0,0,0.4)] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h4 className="text-xs font-bold text-[#F5F5F2] uppercase tracking-wider font-mono">Market Depth (L2)</h4>
              <span className="text-[10px] text-[#10B981] font-mono font-semibold">5 BID / 5 ASK</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              {/* Buy Bids */}
              <div>
                <div className="flex justify-between text-[#A1A8B3] text-[10px] pb-1 border-b border-white/5 uppercase">
                  <span>Bid ₹</span>
                  <span>Qty</span>
                </div>
                <div className="space-y-1 mt-1 text-[#10B981]">
                  {(depth?.buy || [
                    { price: (quote?.last_price || 100) - 0.05, quantity: 1500 },
                    { price: (quote?.last_price || 100) - 0.10, quantity: 2400 },
                    { price: (quote?.last_price || 100) - 0.15, quantity: 3800 },
                    { price: (quote?.last_price || 100) - 0.20, quantity: 5100 },
                    { price: (quote?.last_price || 100) - 0.25, quantity: 8200 },
                  ]).slice(0, 5).map((b, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{b.price.toFixed(2)}</span>
                      <span className="text-[#A1A8B3]">{b.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sell Asks */}
              <div>
                <div className="flex justify-between text-[#A1A8B3] text-[10px] pb-1 border-b border-white/5 uppercase">
                  <span>Ask ₹</span>
                  <span>Qty</span>
                </div>
                <div className="space-y-1 mt-1 text-[#F43F5E]">
                  {(depth?.sell || [
                    { price: (quote?.last_price || 100) + 0.05, quantity: 1200 },
                    { price: (quote?.last_price || 100) + 0.10, quantity: 2100 },
                    { price: (quote?.last_price || 100) + 0.15, quantity: 3500 },
                    { price: (quote?.last_price || 100) + 0.20, quantity: 4900 },
                    { price: (quote?.last_price || 100) + 0.25, quantity: 7600 },
                  ]).slice(0, 5).map((a, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{a.price.toFixed(2)}</span>
                      <span className="text-[#A1A8B3]">{a.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Instrument Stats Card */}
          <div className="p-4 rounded-xl bg-[#0E1728] border border-[rgba(198,161,91,0.22)] shadow-[0_8px_30px_rgba(0,0,0,0.4)] text-xs space-y-2">
            <h4 className="text-[11px] font-bold text-[#F5F5F2] uppercase tracking-wider mb-2 font-mono">Instrument Info</h4>
            <div className="flex justify-between text-[#A1A8B3]">
              <span>Lot Size:</span>
              <span className="font-mono text-[#F5F5F2] font-semibold">{selectedInstrument.lot_size}</span>
            </div>
            <div className="flex justify-between text-[#A1A8B3]">
              <span>Tick Size:</span>
              <span className="font-mono text-[#F5F5F2] font-semibold">₹{selectedInstrument.tick_size}</span>
            </div>
            <div className="flex justify-between text-[#A1A8B3]">
              <span>Day High / Low:</span>
              <span className="font-mono text-[#F5F5F2] font-semibold">
                ₹{quote ? quote.high.toFixed(1) : '-'} / ₹{quote ? quote.low.toFixed(1) : '-'}
              </span>
            </div>
            <div className="flex justify-between text-[#A1A8B3]">
              <span>Prev Close:</span>
              <span className="font-mono text-[#F5F5F2] font-semibold">
                ₹{quote ? quote.close.toFixed(2) : '-'}
              </span>
            </div>
            <div className="flex justify-between text-[#A1A8B3]">
              <span>Volume:</span>
              <span className="font-mono text-[#F5F5F2] font-semibold">
                {quote ? quote.volume.toLocaleString() : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
