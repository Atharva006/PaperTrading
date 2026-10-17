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
    <div className="w-full max-w-full mx-auto select-none font-sans text-[#F5F5F2] pb-12 space-y-4">
      {/* ── 1. Top Cendrix Header Strip with Apple Segmented Control ────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-wider text-[#C6A15B] uppercase font-semibold">
              Quantitative Derivatives Desk · Margin Engine
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[#F5F5F2] flex items-center gap-2.5">
            <span>Futures & Derivatives</span>
            <span className="text-xs font-mono font-medium text-[#A1A8B3] px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] tabular-nums">
              {futures.length} contracts
            </span>
          </h1>
          <p className="text-xs text-[#A1A8B3] mt-1 font-mono">
            NSE & BSE Index & Stock Futures with real-time margin requirements
          </p>
        </div>

        {/* Filter Sub-Tabs in Apple Segmented Control */}
        <div className="apple-segmented-group p-1 rounded-xl inline-flex gap-1 self-start lg:self-auto overflow-x-auto">
          {(['ALL', 'INDEX', 'STOCK'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`apple-segmented-item px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all whitespace-nowrap ${
                filterType === t
                  ? 'apple-segmented-item-active text-[#C6A15B] shadow-sm'
                  : 'text-[#A1A8B3] hover:text-[#F5F5F2]'
              }`}
            >
              {t === 'ALL' ? 'All Futures' : t === 'INDEX' ? 'Index Futures' : 'Stock Futures'}
            </button>
          ))}
        </div>
      </div>

      {/* ── 2. Futures Table in Apple Glass Panel ───────────────────── */}
      <div className="apple-glass-panel rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] overflow-hidden mt-2">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/[0.06] text-[#A1A8B3] text-[10px] font-mono uppercase tracking-wider">
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
            <tbody className="divide-y divide-white/[0.04] font-mono">
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
                  <tr key={inst.instrument_key} className="hover:bg-white/[0.03] group transition-colors">
                    <td className="py-3 px-4 font-sans">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#F5F5F2] group-hover:text-[#C6A15B] transition-colors">
                          {inst.tradingsymbol}
                        </span>
                        <span className="text-[10px] text-[#A1A8B3] font-mono px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.06]">{inst.exchange}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[#A1A8B3] font-sans">
                      <span className="text-[10px] bg-white/[0.04] border border-white/[0.08] text-[#C6A15B] px-2 py-0.5 rounded-md font-mono font-semibold">
                        {inst.instrument_type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#A1A8B3] font-sans">
                      {inst.expiry ? new Date(inst.expiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Monthly'}
                    </td>
                    <td className="py-3 px-3 text-right text-[#F5F5F2] font-semibold tabular-nums">{inst.lot_size}</td>
                    <td className="py-3 px-3 text-right font-bold text-[#F5F5F2] tabular-nums">₹{ltp.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right text-[#A1A8B3] tabular-nums">₹{spot.toFixed(2)}</td>
                    <td className={`py-3 px-3 text-right font-semibold tabular-nums ${basis >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {basis >= 0 ? '+' : ''}{basis.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right text-[#E2C889] font-bold tabular-nums">
                      ₹{marginPerLot.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleTrade(inst, 'BUY')}
                          className="px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500 hover:text-white text-emerald-400 text-[11px] font-bold rounded-lg border border-emerald-500/30 transition-all active:scale-95 shadow-sm"
                        >
                          B
                        </button>
                        <button
                          onClick={() => handleTrade(inst, 'SELL')}
                          className="px-2.5 py-1 bg-rose-500/15 hover:bg-rose-500 hover:text-white text-rose-400 text-[11px] font-bold rounded-lg border border-rose-500/30 transition-all active:scale-95 shadow-sm"
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
