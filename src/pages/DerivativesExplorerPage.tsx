import React, { useState } from 'react';
import { useTradingStore } from '../store/useTradingStore';
import { INDIAN_INSTRUMENTS_MASTER } from '../services/market/indianInstruments';
import { FinancialCalculations } from '../services/trading/FinancialCalculations';
import { OptionChainTable } from '../components/options/OptionChainTable';
import type { Instrument } from '../types/market';

export default function DerivativesExplorerPage() {
  const { openOrderTicket, quotes, setSelectedInstrument } = useTradingStore();
  const [filterType, setFilterType] = useState<'ALL' | 'INDEX' | 'STOCK' | 'OPTIONS'>('ALL');

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
      {/* ── 1. Top Cendrix Header Strip ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#14223A]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-widest text-[#C6A15B] uppercase font-bold">
              Quantitative Derivatives Desk · Margin Engine
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif tracking-tight text-[#F5F5F2] flex items-center gap-2.5">
            <span>Futures & Derivatives</span>
            <span className="text-xs font-mono font-normal text-[#A1A8B3]">
              {filterType === 'OPTIONS' ? 'Option Chain' : `(${futures.length} contracts)`}
            </span>
          </h1>
          <p className="text-xs text-[#A1A8B3] mt-0.5">
            NSE & BSE Index & Stock Futures and Options with real-time margin requirements
          </p>
        </div>

        {/* Filter Sub-Tabs */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs font-mono flex-wrap">
          {(['ALL', 'INDEX', 'STOCK', 'OPTIONS'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`pb-1.5 px-1 border-b-2 transition-all font-semibold whitespace-nowrap ${
                filterType === t
                  ? 'border-[#C6A15B] text-[#C6A15B]'
                  : 'border-transparent text-[#6E7683] hover:text-[#F5F5F2]'
              }`}
            >
              {t === 'ALL' ? 'All Futures' : t === 'INDEX' ? 'Index Futures' : t === 'STOCK' ? 'Stock Futures' : 'Option Chain (CE/PE)'}
            </button>
          ))}
        </div>
      </div>

      {/* ── 2. Option Chain View OR Futures Table ───────────────────── */}
      {filterType === 'OPTIONS' ? (
        <OptionChainTable />
      ) : (
        <div className="w-full overflow-hidden mt-2 cendrix-card rounded-xl border border-[#14223A]">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#14223A] text-[#6E7683] text-[10.5px] font-mono uppercase bg-[#0B1424]">
                  <th className="py-2.5 px-3">Contract</th>
                  <th className="py-2.5 px-2.5">Segment</th>
                  <th className="py-2.5 px-2.5">Expiry</th>
                  <th className="py-2.5 px-2.5 text-right">Lot Size</th>
                  <th className="py-2.5 px-2.5 text-right">Future LTP (₹)</th>
                  <th className="py-2.5 px-2.5 text-right">Underlying Spot</th>
                  <th className="py-2.5 px-2.5 text-right">Basis</th>
                  <th className="py-2.5 px-2.5 text-right">Margin / Lot</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#14223A] font-mono">
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
                  <td className="py-3 px-4 font-sans">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#F5F5F2] group-hover:text-[#C6A15B] transition-colors">
                        {inst.tradingsymbol}
                      </span>
                      <span className="text-[10px] text-[#C6A15B] font-mono px-1 py-0.2 rounded bg-[#0B1424] border border-[#14223A]">{inst.exchange}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#A1A8B3] font-sans">
                    <span className="text-[10px] bg-[#0B1424] border border-[#14223A] text-[#A1A8B3] px-2 py-0.5 rounded font-mono">
                      {inst.instrument_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#A1A8B3] font-sans">
                    {inst.expiry ? new Date(inst.expiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Monthly'}
                  </td>
                  <td className="py-3 px-4 text-right text-[#F5F5F2] font-semibold">{inst.lot_size}</td>
                  <td className="py-3 px-4 text-right font-bold text-[#F5F5F2]">₹{ltp.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right text-[#A1A8B3]">₹{spot.toFixed(2)}</td>
                  <td className={`py-3 px-4 text-right font-semibold ${basis >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {basis >= 0 ? '+' : ''}{basis.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right text-[#E2C889] font-bold">
                    ₹{marginPerLot.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleTrade(inst, 'BUY')}
                        className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded transition-colors shadow-sm"
                      >
                        B
                      </button>
                      <button
                        onClick={() => handleTrade(inst, 'SELL')}
                        className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold rounded transition-colors shadow-sm"
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
      )}
    </div>
  );
}
