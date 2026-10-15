import React from 'react';
import { OptionChainTable } from '../components/options/OptionChainTable';
import { Layers, ShieldAlert, Info } from 'lucide-react';

export default function OptionChainPage() {
  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto select-none">
      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-[#0E1728]/95 border border-[#C6A15B]/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold font-serif text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#C6A15B]" />
            <span>Indian Markets Option Chain</span>
          </h2>
          <p className="text-xs text-[#8F9BAE] mt-0.5">
            Real-time matrix for NIFTY, BANK NIFTY, FINNIFTY, SENSEX & Stock Options with Black-Scholes Greeks · CNRX
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#A1A8B3] bg-[#0B1424] px-3 py-1.5 rounded-xl border border-[#1F2D48]">
          <Info className="w-4 h-4 text-[#C6A15B]" />
          <span>Click any <strong className="text-white">Call or Put LTP</strong> to open simulated paper order ticket</span>
        </div>
      </div>

      {/* ── Option Chain Table Component ────────────────────────────────── */}
      <OptionChainTable />
    </div>
  );
}
