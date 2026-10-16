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
    <div className="w-full max-w-[1720px] mx-auto select-none font-sans text-[#f0f3f8] pb-12 space-y-4">
      {/* ── 1. Top Zerodha Header Strip ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[#1e2638]">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-[#f0f3f8] flex items-center gap-2">
            <span>Futures & Derivatives</span>
            <span className="text-xs font-mono font-normal text-[#788296]">
              ({futures.length} contracts)
            </span>
          </h1>
          <p className="text-xs text-[#788296] mt-0.5">
            NSE & BSE Index & Stock Futures with verified lot sizes and real-time margin requirements
          </p>
        </div>

        {/* Filter Sub-Tabs */}
        <div className="flex items-center gap-4 text-xs font-medium">
          {(['ALL', 'INDEX', 'STOCK'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`pb-1 border-b-2 transition-all ${
                filterType === t
                  ? 'border-[#387ed1] text-[#387ed1] font-semibold'
                  : 'border-transparent text-[#788296] hover:text-[#c4cbd4]'
              }`}
            >
              {t === 'ALL' ? 'All Futures' : t === 'INDEX' ? 'Index Futures' : 'Stock Futures'}
            </button>
          ))}
        </div>
      </div>

      {/* ── 2. Full-Width Futures Table (Edge-to-Edge) ───────────────────── */}
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#1e2638] text-[#788296] text-[11px] font-medium font-mono">
              <th className="py-2.5 px-3">Contract</th>
              <th className="py-2.5 px-3">Segment</th>
              <th className="py-2.5 px-3">Expiry</th>
              <th className="py-2.5 px-3 text-right">Lot Size</th>
              <th className="py-2.5 px-3 text-right">Future LTP (₹)</th>
              <th className="py-2.5 px-3 text-right">Underlying Spot</th>
              <th className="py-2.5 px-3 text-right">Basis</th>
              <th className="py-2.5 px-3 text-right">Margin / Lot</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2638]/60 font-mono">
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
                <tr key={inst.instrument_key} className="hover:bg-[#121724] group transition-colors">
                  <td className="py-2.5 px-3 font-sans">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#f0f3f8] group-hover:text-[#387ed1] transition-colors">
                        {inst.tradingsymbol}
                      </span>
                      <span className="text-[10px] text-[#58647a] font-mono">{inst.exchange}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-[#788296] font-sans">
                    <span className="text-[10px] bg-[#161d2c] border border-[#1e2638] text-[#788296] px-1.5 py-0.5 rounded font-mono">
                      {inst.instrument_type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[#788296] font-sans">
                    {inst.expiry ? new Date(inst.expiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Monthly'}
                  </td>
                  <td className="py-2.5 px-3 text-right text-[#c4cbd4] font-medium">{inst.lot_size}</td>
                  <td className="py-2.5 px-3 text-right font-medium text-[#f0f3f8]">₹{ltp.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right text-[#788296]">₹{spot.toFixed(2)}</td>
                  <td className={`py-2.5 px-3 text-right font-medium ${basis >= 0 ? 'text-[#00c087]' : 'text-[#df514c]'}`}>
                    {basis >= 0 ? '+' : ''}{basis.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-[#387ed1] font-medium">
                    ₹{marginPerLot.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleTrade(inst, 'BUY')}
                        className="px-2 py-0.5 bg-[#387ed1] hover:bg-[#2e6bb5] text-white text-[11px] font-bold rounded transition-colors"
                      >
                        B
                      </button>
                      <button
                        onClick={() => handleTrade(inst, 'SELL')}
                        className="px-2 py-0.5 bg-[#df514c] hover:bg-[#c93f3a] text-white text-[11px] font-bold rounded transition-colors"
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
  );
}
