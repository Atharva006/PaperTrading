import React, { useState, useEffect } from 'react';
import { useTradingStore } from '../../store/useTradingStore';
import { marketDataService } from '../../services/market/MarketDataService';
import type { OptionChainData, OptionContract } from '../../types/market';
import { RefreshCw, Sliders } from 'lucide-react';

export const OptionChainTable: React.FC = () => {
  const { openOrderTicket, quotes } = useTradingStore();
  const [selectedUnderlying, setSelectedUnderlying] = useState<string>('NSE_INDEX|Nifty 50');
  const [selectedExpiry, setSelectedExpiry] = useState<string>('');
  const [chainData, setChainData] = useState<OptionChainData | null>(null);
  const [showGreeks, setShowGreeks] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Available underlyings that have F&O
  const underlyings = [
    { key: 'NSE_INDEX|Nifty 50', name: 'NIFTY 50' },
    { key: 'NSE_INDEX|Nifty Bank', name: 'BANK NIFTY' },
    { key: 'NSE_INDEX|Nifty Fin Service', name: 'FINNIFTY' },
    { key: 'BSE_INDEX|SENSEX', name: 'SENSEX' },
    { key: 'NSE_EQ|INE002A01018', name: 'RELIANCE' },
    { key: 'NSE_EQ|INE040A01034', name: 'HDFCBANK' },
    { key: 'NSE_EQ|INE467B01029', name: 'TCS' },
  ];

  // Fetch option chain
  const fetchChain = () => {
    setIsLoading(true);
    marketDataService
      .getOptionChain(selectedUnderlying, selectedExpiry)
      .then((data) => {
        setChainData(data);
        if (data && !selectedExpiry && data.available_expiries.length > 0) {
          setSelectedExpiry(data.available_expiries[0]);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load option chain:', err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchChain();
  }, [selectedUnderlying, selectedExpiry]);

  // Handle clicking on an option to launch order ticket
  const handleTradeOption = (contract: OptionContract, type: 'BUY' | 'SELL') => {
    openOrderTicket({
      instrument_key: contract.instrument_key,
      tradingsymbol: contract.tradingsymbol,
      exchange: 'NFO',
      instrument_type: 'OPTIDX',
      transaction_type: type,
      product: 'NRML',
      order_type: 'MARKET',
      quantity: contract.lot_size,
      lot_size: contract.lot_size,
      price: contract.ltp,
    });
  };

  const spot = chainData?.underlying_price || quotes[selectedUnderlying]?.last_price || 23000;
  const strikes = chainData?.strikes || [];

  const fmtCompact = (val: number) => {
    if (val >= 10000000) return `${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
    return val.toString();
  };

  return (
    <div className="w-full flex flex-col select-none text-[#F5F5F2] font-sans">
      {/* ── 1. Top Institutional Control Strip ───────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex flex-wrap items-center gap-3">
          {/* Title */}
          <h1 className="text-lg sm:text-xl font-bold tracking-[-0.02em] font-serif text-[#F5F5F2]">
            Option Chain
          </h1>

          {/* Underlying Selector */}
          <select
            value={selectedUnderlying}
            onChange={(e) => {
              setSelectedUnderlying(e.target.value);
              setSelectedExpiry('');
            }}
            className="apple-glass-panel border border-white/10 text-xs font-semibold text-[#F5F5F2] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#C6A15B] cursor-pointer shadow-sm"
          >
            {underlyings.map((u) => (
              <option key={u.key} value={u.key} className="bg-[#0B1424] text-[#F5F5F2]">
                {u.name}
              </option>
            ))}
          </select>

          {/* Expiry Selector */}
          <select
            value={selectedExpiry}
            onChange={(e) => setSelectedExpiry(e.target.value)}
            className="apple-glass-panel border border-white/10 text-xs font-semibold text-[#F5F5F2] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#C6A15B] cursor-pointer shadow-sm"
          >
            {chainData?.available_expiries.map((exp) => (
              <option key={exp} value={exp} className="bg-[#0B1424] text-[#F5F5F2]">
                {new Date(exp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </option>
            ))}
          </select>

          {/* Spot Price Display */}
          <div className="flex items-baseline gap-1.5 pl-3 border-l border-white/10 font-mono tabular-nums">
            <span className="text-[11px] text-[#A1A8B3]">Spot:</span>
            <span className="text-xs sm:text-sm font-bold text-[#F5F5F2]">
              ₹{spot.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* PCR, Max Pain & Greeks Toggle */}
        <div className="flex items-center gap-2.5">
          {chainData && (
            <div className="flex items-center gap-2 text-xs">
              <div className="px-2.5 py-0.5 rounded-full border border-white/10 bg-white/5">
                <span className="text-[#A1A8B3] text-[10px] mr-1">PCR:</span>
                <span className={`font-mono font-semibold ${chainData.pcr >= 1 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                  {chainData.pcr.toFixed(2)}
                </span>
              </div>
              <div className="px-2.5 py-0.5 rounded-full border border-white/10 bg-white/5 hidden sm:block">
                <span className="text-[#A1A8B3] text-[10px] mr-1">Max Pain:</span>
                <span className="font-mono font-semibold text-[#C6A15B]">
                  {chainData.max_pain || 'ATM'}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={() => setShowGreeks(!showGreeks)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all active:scale-[0.96] cursor-pointer flex items-center gap-1.5 ${
              showGreeks
                ? 'bg-[#C6A15B]/15 border-[#C6A15B] text-[#C6A15B] shadow-sm'
                : 'bg-white/5 border-white/10 text-[#A1A8B3] hover:text-[#F5F5F2]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Greeks {showGreeks ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={fetchChain}
            className="p-1.5 rounded-xl text-[#A1A8B3] hover:text-[#F5F5F2] border border-white/10 bg-white/5 active:scale-[0.92] transition-all cursor-pointer"
            title="Refresh Option Chain"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#C6A15B]' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── 2. Full-Width Option Chain Table (Apple Glass Panel) ── */}
      <div className="w-full overflow-hidden border border-white/10 rounded-2xl apple-glass-panel mt-2 shadow-2xl">
        <div className="w-full overflow-y-auto max-h-[calc(100vh-210px)] overflow-x-hidden">
          <table className="w-full table-fixed text-left border-collapse text-xs">
            <thead className="bg-[#0c1018]/90 backdrop-blur-md sticky top-0 z-20 border-b border-white/10 text-[11px] font-medium text-[#A1A8B3]">
              <tr>
                {/* CALLS HEADER */}
                <th colSpan={showGreeks ? 5 : 3} className="text-center py-2 px-1 border-r border-white/10 bg-[#10B981]/10 text-[#10B981] font-mono tracking-wider font-bold">
                  CALLS (CE)
                </th>
                {/* STRIKE HEADER */}
                <th className="text-center py-2 px-1 bg-white/5 text-[#F5F5F2] font-bold tracking-wider">
                  STRIKE
                </th>
                {/* PUTS HEADER */}
                <th colSpan={showGreeks ? 5 : 3} className="text-center py-2 px-1 border-l border-white/10 bg-[#EF4444]/10 text-[#EF4444] font-mono tracking-wider font-bold">
                  PUTS (PE)
                </th>
              </tr>
              <tr className="border-b border-white/10 text-[9.5px] uppercase font-mono text-[#A1A8B3] bg-white/[0.02]">
                {/* CALL SUBHEADERS */}
                {showGreeks ? (
                  <>
                    <th className="py-1.5 px-1 text-right w-[8%]">OI</th>
                    <th className="py-1.5 px-1 text-right w-[8%]">Vol</th>
                    <th className="py-1.5 px-1 text-right w-[7%]">IV</th>
                    <th className="py-1.5 px-1 text-right w-[7%]">Delta</th>
                    <th className="py-1.5 px-1.5 text-right w-[12%] border-r border-white/10">LTP (₹)</th>
                  </>
                ) : (
                  <>
                    <th className="py-1.5 px-1.5 text-right w-[14%]">OI</th>
                    <th className="py-1.5 px-1.5 text-right w-[14%]">Volume</th>
                    <th className="py-1.5 px-1.5 text-right w-[14%] border-r border-white/10">LTP (₹)</th>
                  </>
                )}

                {/* STRIKE */}
                <th className="py-1.5 px-1 text-center bg-white/5 text-[#F5F5F2] w-[16%]">Strike</th>

                {/* PUT SUBHEADERS */}
                {showGreeks ? (
                  <>
                    <th className="py-1.5 px-1.5 text-left w-[12%] border-l border-white/10">LTP (₹)</th>
                    <th className="py-1.5 px-1 text-left w-[7%]">Delta</th>
                    <th className="py-1.5 px-1 text-left w-[7%]">IV</th>
                    <th className="py-1.5 px-1 text-left w-[8%]">Vol</th>
                    <th className="py-1.5 px-1 text-left w-[8%]">OI</th>
                  </>
                ) : (
                  <>
                    <th className="py-1.5 px-1.5 text-left w-[14%] border-l border-white/10">LTP (₹)</th>
                    <th className="py-1.5 px-1.5 text-left w-[14%]">Volume</th>
                    <th className="py-1.5 px-1.5 text-left w-[14%]">OI</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[10.5px] tabular-nums">
              {strikes.map((row) => {
                const strike = row.strike_price;
                const call = row.call;
                const put = row.put;
                const isAtm = Math.abs(strike - spot) <= 35;
                const isCallItm = strike < spot;
                const isPutItm = strike > spot;

                return (
                  <tr
                    key={strike}
                    className={`hover:bg-white/[0.04] transition-colors ${
                      isAtm ? 'bg-[#C6A15B]/15 font-bold shadow-inner' : ''
                    }`}
                  >
                    {/* CALL: OI */}
                    <td className={`py-1.5 px-1 text-right truncate text-[#A1A8B3] ${isCallItm ? 'bg-[#10B981]/5' : ''}`}>
                      {call ? fmtCompact(call.oi) : '-'}
                    </td>

                    {/* CALL: Volume */}
                    <td className={`py-1.5 px-1 text-right truncate text-[#6E7683] ${isCallItm ? 'bg-[#10B981]/5' : ''}`}>
                      {call ? fmtCompact(call.volume) : '-'}
                    </td>

                    {/* CALL: IV */}
                    {showGreeks && (
                      <td className={`py-1.5 px-1 text-right truncate text-[#A1A8B3] ${isCallItm ? 'bg-[#10B981]/5' : ''}`}>
                        {call?.greeks ? `${call.greeks.iv.toFixed(1)}%` : '-'}
                      </td>
                    )}

                    {/* CALL: Delta */}
                    {showGreeks && (
                      <td className={`py-1.5 px-1 text-right truncate text-[#10B981] ${isCallItm ? 'bg-[#10B981]/5' : ''}`}>
                        {call?.greeks ? call.greeks.delta.toFixed(2) : '-'}
                      </td>
                    )}

                    {/* CALL: LTP (Interactive Tactile Trade Button) */}
                    <td className={`py-1 px-1.5 text-right border-r border-white/10 ${isCallItm ? 'bg-[#10B981]/10 font-bold text-[#F5F5F2]' : 'text-[#10B981]'}`}>
                      {call ? (
                        <button
                          onClick={() => handleTradeOption(call, 'BUY')}
                          className="w-full py-1 px-1.5 rounded-lg bg-[#10B981]/20 hover:bg-[#10B981] text-[#10B981] hover:text-white transition-all font-bold text-[10.5px] truncate block text-center active:scale-[0.92] cursor-pointer shadow-sm"
                          title={`Buy ${call.tradingsymbol}`}
                        >
                          ₹{call.ltp.toFixed(1)}
                        </button>
                      ) : (
                        '-'
                      )}
                    </td>

                    {/* CENTER: STRIKE PRICE */}
                    <td className={`py-1.5 px-1 text-center font-bold font-mono text-xs ${isAtm ? 'bg-[#C6A15B] text-[#070D18] shadow-md rounded-sm' : 'bg-white/5 text-[#F5F5F2]'}`}>
                      {strike}
                    </td>

                    {/* PUT: LTP (Interactive Tactile Trade Button) */}
                    <td className={`py-1 px-1.5 text-left border-l border-white/10 ${isPutItm ? 'bg-[#EF4444]/10 font-bold text-[#F5F5F2]' : 'text-[#EF4444]'}`}>
                      {put ? (
                        <button
                          onClick={() => handleTradeOption(put, 'BUY')}
                          className="w-full py-1 px-1.5 rounded-lg bg-[#EF4444]/20 hover:bg-[#EF4444] text-[#EF4444] hover:text-white transition-all font-bold text-[10.5px] truncate block text-center active:scale-[0.92] cursor-pointer shadow-sm"
                          title={`Buy ${put.tradingsymbol}`}
                        >
                          ₹{put.ltp.toFixed(1)}
                        </button>
                      ) : (
                        '-'
                      )}
                    </td>

                    {/* PUT: Delta */}
                    {showGreeks && (
                      <td className={`py-1.5 px-1 text-left truncate text-[#EF4444] ${isPutItm ? 'bg-[#EF4444]/5' : ''}`}>
                        {put?.greeks ? put.greeks.delta.toFixed(2) : '-'}
                      </td>
                    )}

                    {/* PUT: IV */}
                    {showGreeks && (
                      <td className={`py-1.5 px-1 text-left truncate text-[#A1A8B3] ${isPutItm ? 'bg-[#EF4444]/5' : ''}`}>
                        {put?.greeks ? `${put.greeks.iv.toFixed(1)}%` : '-'}
                      </td>
                    )}

                    {/* PUT: Volume */}
                    <td className={`py-1.5 px-1 text-left truncate text-[#6E7683] ${isPutItm ? 'bg-[#EF4444]/5' : ''}`}>
                      {put ? fmtCompact(put.volume) : '-'}
                    </td>

                    {/* PUT: OI */}
                    <td className={`py-1.5 px-1 text-left truncate text-[#A1A8B3] ${isPutItm ? 'bg-[#EF4444]/5' : ''}`}>
                      {put ? fmtCompact(put.oi) : '-'}
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
};
