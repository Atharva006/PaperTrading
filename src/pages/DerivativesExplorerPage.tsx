import React, { useState } from 'react';
import { useTradingStore } from '../store/useTradingStore';
import { INDIAN_INSTRUMENTS_MASTER } from '../services/market/indianInstruments';
import { FinancialCalculations } from '../services/trading/FinancialCalculations';
import type { Instrument } from '../types/market';
import { Binary, PlusCircle, ArrowUpRight, ArrowDownRight, Info, ShieldCheck } from 'lucide-react';

export default function DerivativesExplorerPage() {
  const { openOrderTicket, quotes, setSelectedInstrument } = useTradingStore();
  const [filterType, setFilterType] = useState<'ALL' | 'INDEX' | 'STOCK'>('ALL');

  const futures = INDIAN_INSTRUMENTS_MASTER.filter((i) =>
    i.instrument_type === 'FUTIDX' || i.instrument_type === 'FUTSTK'
  ).filter((i) => {
    if (filterType === 'INDEX') return i.instrument_type === 'FUTIDX';
    if (filterType === 'STOCK') return i.instrument_type === 'FUTSTK';
    return true;
  });

  const handleTrade = (inst: Instrument, type: 'BUY' | 'SELL') => {
    setSelectedInstrument(inst);
    openOrderTicket({
      instrument_key: inst.instrument_key,
      tradingsymbol: inst.tradingsymbol,
      exchange: inst.exchange,
      instrument_type: inst.instrument_type,
      transaction_type: type,
      product: 'NRML',
      quantity: inst.lot_size,
      lot_size: inst.lot_size,
    });
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto select-none">
      {/* ── Header & Filters ───────────────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-[#0E1728]/95 border border-[#C6A15B]/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold font-serif text-white tracking-tight flex items-center gap-2">
            <Binary className="w-5 h-5 text-[#C6A15B]" />
            <span>Futures & Derivatives Explorer</span>
          </h2>
          <p className="text-xs text-[#8F9BAE] mt-0.5">
            NSE & BSE Index Futures & Single Stock Futures contracts with accurate lot sizes and margin calculation · CNRX
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 bg-[#0B1424] p-1 rounded-xl border border-[#1F2D48]">
          {(['ALL', 'INDEX', 'STOCK'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === t
                  ? 'bg-gradient-to-r from-[#C6A15B] to-[#E2C889] text-[#0B1424] font-bold shadow-md'
                  : 'text-[#8F9BAE] hover:text-white'
              }`}
            >
              {t === 'ALL' ? 'All Futures' : t === 'INDEX' ? 'Index Futures' : 'Stock Futures'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Futures Contracts Table ─────────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-[#0E1728]/95 border border-[#C6A15B]/20 shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1F2D48] text-[#8F9BAE] text-[10px] uppercase font-semibold">
                <th className="py-3 px-3">Contract</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Expiry</th>
                <th className="py-3 px-3">Lot Size</th>
                <th className="py-3 px-3">Future LTP</th>
                <th className="py-3 px-3">Underlying Spot</th>
                <th className="py-3 px-3">Basis (Spread)</th>
                <th className="py-3 px-3">Est. Margin / Lot</th>
                <th className="py-3 px-3 text-right">Simulated Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2D48]/60 font-mono">
              {futures.map((inst) => {
                const quote = quotes[inst.instrument_key];
                const underlyingQuote = inst.underlying_key ? quotes[inst.underlying_key] : null;

                const spot = underlyingQuote?.last_price || (quote ? quote.last_price * 0.998 : 24500);
                const ltp = quote?.last_price || (spot ? spot * 1.002 : 24550);
                const basis = ltp - spot;

                const marginPerLot = FinancialCalculations.calculateRequiredMargin({
                  instrumentType: inst.instrument_type,
                  product: 'NRML',
                  transactionType: 'BUY',
                  quantity: inst.lot_size,
                  price: ltp,
                });

                return (
                  <tr key={inst.instrument_key} className="hover:bg-[#14223A]/40 group transition-colors">
                    <td className="py-3 px-3 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <span>{inst.tradingsymbol}</span>
                        <span className="text-[10px] text-[#8F9BAE] font-normal">{inst.exchange}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[#A1A8B3] font-sans">
                      <span className="text-[10px] bg-[#14223A] border border-[#1F2D48] text-[#E2C889] px-1.5 py-0.5 rounded font-bold">
                        {inst.instrument_type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#A1A8B3] font-sans">
                      {inst.expiry ? new Date(inst.expiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Monthly'}
                    </td>
                    <td className="py-3 px-3 text-white font-bold">{inst.lot_size}</td>
                    <td className="py-3 px-3 font-bold text-white">₹{ltp.toFixed(2)}</td>
                    <td className="py-3 px-3 text-[#A1A8B3]">₹{spot.toFixed(2)}</td>
                    <td className={`py-3 px-3 font-bold ${basis >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                      {basis >= 0 ? '+' : ''}{basis.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-[#C6A15B] font-bold">
                      ₹{marginPerLot.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleTrade(inst, 'BUY')}
                          className="px-3 py-1 bg-[#38BDF8] hover:bg-[#0284C7] text-[#0B1424] text-xs font-bold rounded-lg transition-colors shadow-sm"
                        >
                          BUY
                        </button>
                        <button
                          onClick={() => handleTrade(inst, 'SELL')}
                          className="px-3 py-1 bg-[#F43F5E] hover:bg-[#E11D48] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                        >
                          SELL
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
