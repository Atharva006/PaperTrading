import React from 'react';
import { OptionChainTable } from '../components/options/OptionChainTable';

export default function OptionChainPage() {
  return (
    <div className="w-full max-w-full mx-auto select-none font-sans text-[#f0f3f8] pb-12 space-y-4">
      {/* ── Option Chain Table Component ────────────────────────────────── */}
      <OptionChainTable />
    </div>
  );
}
