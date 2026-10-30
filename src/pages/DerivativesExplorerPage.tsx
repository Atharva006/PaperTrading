import React, { useState } from 'react';
import { useTradingStore } from '../store/useTradingStore';
import { INDIAN_INSTRUMENTS_MASTER } from '../services/market/indianInstruments';
import { FinancialCalculations } from '../services/trading/FinancialCalculations';
import type { Instrument } from '../types/market';

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
    <div className="w-full max-w-full mx-auto select-none font-sans text-[#111114] pb-12 space-y-4">
      {/* ── 1. Top Header Strip ─────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#D9E2F2]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-wider text-[#536CF0] uppercase font-bold">
              Quantitative Derivatives Desk · Margin Engine
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-[#00225A] flex items-center gap-2.5">
            <span>Futures & Derivatives</span>
            <span className="text-xs font-mono font-medium text-[#6B7A90] px-2 py-0.5 rounded-md bg-[#EEF3FF] border border-[#D9E2F2] tabular-nums font-bold">
              {futures.length} contracts
            </span>
          </h1>
          <p className="text-xs text-[#6B7A90] mt-1 font-mono">
            NSE & BSE Index & Stock Futures with real-time margin requirements
          </p>
        </div>

        {/* Filter Sub-Tabs */}
        <div className="bg-[#F7F8FA] border border-[#D9E2F2] p-1 rounded-xl inline-flex gap-1 self-start lg:self-auto overflow-x-auto">
          {(['ALL', 'INDEX', 'STOCK'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all whitespace-nowrap cursor-pointer ${
                filterType === t
                  ? 'bg-white text-[#00225A] font-bold shadow-sm border border-[#D9E2F2]'
                  : 'text-[#6B7A90] hover:text-[#00225A]'
              }`}
            >
              {t === 'ALL' ? 'All Futures' : t === 'INDEX' ? 'Index Futures' : 'Stock Futures'}
            </button>
          ))}
        </div>
      </div>

      {/* ── 2. Futures Table ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)] overflow-hidden mt-2">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F7F8FA] border-b border-[#D9E2F2] text-[#6B7A90] text-[10px] font-mono uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Contract</th>
                <th className="py-3 px-3 font-semibold">Segment</th>
                <th className="py-3 px-3 font-semibold">Expiry</th>
                <th className="py-3 px-3 font-semibold text-right">Lot Size</th>
                <th className="py-3 px-3 font-semibold text-right">Future LTP (₹)</th>
                <th className="py-3 px-3 font-semibold text-right">Underlying Spot</th>
                <th className="py-3 px-3 font-semibold text-right">Basis</th>
                <th className="py-3 px-3 font-semibold text-right">Margin / Lot</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E2F2] font-mono">
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
                  <tr key={inst.instrument_key} className="hover:bg-[#F7F8FA] group transition-colors">
                    <td className="py-3 px-4 font-sans">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#00225A] group-hover:text-[#536CF0] transition-colors">
                          {inst.tradingsymbol}
                        </span>
                        <span className="text-[10px] text-[#6B7A90] font-mono px-1.5 py-0.5 rounded bg-[#EEF3FF] border border-[#D9E2F2]">{inst.exchange}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[#6B7A90] font-sans">
                      <span className="text-[10px] bg-[#EEF3FF] border border-[#D9E2F2] text-[#00225A] px-2 py-0.5 rounded-full font-mono font-bold">
                        {inst.instrument_type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#6B7A90] font-sans">
                      {inst.expiry ? new Date(inst.expiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Monthly'}
                    </td>
                    <td className="py-3 px-3 text-right text-[#111114] font-semibold tabular-nums">{inst.lot_size}</td>
                    <td className="py-3 px-3 text-right font-bold text-[#111114] tabular-nums">₹{ltp.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right text-[#6B7A90] tabular-nums">₹{spot.toFixed(2)}</td>
                    <td className={`py-3 px-3 text-right font-semibold tabular-nums ${basis >= 0 ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
                      {basis >= 0 ? '+' : ''}{basis.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right text-[#00225A] font-bold tabular-nums">
                      ₹{marginPerLot.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleTrade(inst, 'BUY')}
                          className="px-2.5 py-1 bg-[#12B76A]/10 hover:bg-[#12B76A] hover:text-white text-[#12B76A] text-[11px] font-bold rounded-lg border border-[#12B76A]/30 transition-all active:scale-95 shadow-sm cursor-pointer"
                        >
                          B
                        </button>
                        <button
                          onClick={() => handleTrade(inst, 'SELL')}
                          className="px-2.5 py-1 bg-[#FEE4E2] hover:bg-[#D92D20] hover:text-white text-[#D92D20] text-[11px] font-bold rounded-lg border border-[#FECDCA] transition-all active:scale-95 shadow-sm cursor-pointer"
                        >
                          S
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
