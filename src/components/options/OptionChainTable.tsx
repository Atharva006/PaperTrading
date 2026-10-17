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
    <div className="w-full flex flex-col select-none text-[#f0f3f8] font-sans">
      {/* ── 1. Top Institutional Control Strip ───────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1e2638]">
        <div className="flex flex-wrap items-center gap-3">
          {/* Title */}
          <h1 className="text-lg sm:text-xl font-medium tracking-tight text-[#f0f3f8]">
            Option Chain
          </h1>

          {/* Underlying Selector */}
          <select
            value={selectedUnderlying}
            onChange={(e) => {
              setSelectedUnderlying(e.target.value);
              setSelectedExpiry('');
            }}
            className="bg-[#121722] border border-[#1e2638] text-xs font-semibold text-[#f0f3f8] rounded px-2.5 py-1 focus:outline-none focus:border-[#387ed1]"
          >
            {underlyings.map((u) => (
              <option key={u.key} value={u.key}>
                {u.name}
              </option>
            ))}
          </select>

          {/* Expiry Selector */}
          <select
            value={selectedExpiry}
            onChange={(e) => setSelectedExpiry(e.target.value)}
            className="bg-[#121722] border border-[#1e2638] text-xs font-semibold text-[#f0f3f8] rounded px-2.5 py-1 focus:outline-none focus:border-[#387ed1]"
          >
            {chainData?.available_expiries.map((exp) => (
              <option key={exp} value={exp}>
                {new Date(exp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </option>
            ))}
          </select>

          {/* Spot Price Display */}
          <div className="flex items-baseline gap-1.5 pl-3 border-l border-[#1e2638] font-mono">
            <span className="text-[11px] text-[#788296]">Spot:</span>
            <span className="text-xs sm:text-sm font-bold text-[#f0f3f8]">
              ₹{spot.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* PCR, Max Pain & Greeks Toggle */}
        <div className="flex items-center gap-2.5">
          {chainData && (
            <div className="flex items-center gap-2 text-xs">
              <div className="px-2 py-0.5 rounded border border-[#1e2638] bg-[#121722]">
                <span className="text-[#788296] text-[10px] mr-1">PCR:</span>
                <span className={`font-mono font-semibold ${chainData.pcr >= 1 ? 'text-[#00c087]' : 'text-[#df514c]'}`}>
                  {chainData.pcr.toFixed(2)}
                </span>
              </div>
              <div className="px-2 py-0.5 rounded border border-[#1e2638] bg-[#121722] hidden sm:block">
                <span className="text-[#788296] text-[10px] mr-1">Max Pain:</span>
                <span className="font-mono font-semibold text-[#387ed1]">
                  {chainData.max_pain || 'ATM'}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={() => setShowGreeks(!showGreeks)}
            className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              showGreeks
                ? 'bg-[#387ed1]/15 border-[#387ed1] text-[#387ed1]'
                : 'bg-[#121722] border-[#1e2638] text-[#788296] hover:text-[#f0f3f8]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Greeks {showGreeks ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={fetchChain}
            className="p-1 rounded text-[#788296] hover:text-[#387ed1] border border-[#1e2638] bg-[#121722] transition-colors"
            title="Refresh Option Chain"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#387ed1]' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── 2. Full-Width Option Chain Table (Edge-to-Edge Single Screen Fit) ── */}
      <div className="w-full overflow-hidden border border-[#1e2638] rounded-lg bg-[#0c1018] mt-2 shadow-xl">
        <div className="w-full overflow-y-auto max-h-[calc(100vh-210px)] overflow-x-hidden">
          <table className="w-full table-fixed text-left border-collapse text-xs">
            <thead className="bg-[#0c1018] sticky top-0 z-20 border-b border-[#1e2638] text-[11px] font-medium text-[#788296]">
              <tr>
                {/* CALLS HEADER */}
                <th colSpan={showGreeks ? 5 : 3} className="text-center py-1.5 px-1 border-r border-[#1e2638] bg-[#387ed1]/10 text-[#387ed1] font-mono tracking-wider">
                  CALLS (CE)
                </th>
                {/* STRIKE HEADER */}
                <th className="text-center py-1.5 px-1 bg-[#121722] text-[#f0f3f8] font-bold tracking-wider">
                  STRIKE
                </th>
                {/* PUTS HEADER */}
                <th colSpan={showGreeks ? 5 : 3} className="text-center py-1.5 px-1 border-l border-[#1e2638] bg-[#df514c]/10 text-[#df514c] font-mono tracking-wider">
                  PUTS (PE)
                </th>
              </tr>
              <tr className="border-b border-[#1e2638] text-[9.5px] uppercase font-mono text-[#788296] bg-[#0c1018]">
                {/* CALL SUBHEADERS */}
                {showGreeks ? (
                  <>
                    <th className="py-1 px-1 text-right w-[8%]">OI</th>
                    <th className="py-1 px-1 text-right w-[8%]">Vol</th>
                    <th className="py-1 px-1 text-right w-[7%]">IV</th>
                    <th className="py-1 px-1 text-right w-[7%]">Delta</th>
                    <th className="py-1 px-1.5 text-right w-[12%] border-r border-[#1e2638]">LTP (₹)</th>
                  </>
                ) : (
                  <>
                    <th className="py-1 px-1.5 text-right w-[14%]">OI</th>
                    <th className="py-1 px-1.5 text-right w-[14%]">Volume</th>
                    <th className="py-1 px-1.5 text-right w-[14%] border-r border-[#1e2638]">LTP (₹)</th>
                  </>
                )}

                {/* STRIKE */}
                <th className="py-1 px-1 text-center bg-[#121722] text-[#f0f3f8] w-[16%]">Strike</th>

                {/* PUT SUBHEADERS */}
                {showGreeks ? (
                  <>
                    <th className="py-1 px-1.5 text-left w-[12%] border-l border-[#1e2638]">LTP (₹)</th>
                    <th className="py-1 px-1 text-left w-[7%]">Delta</th>
                    <th className="py-1 px-1 text-left w-[7%]">IV</th>
                    <th className="py-1 px-1 text-left w-[8%]">Vol</th>
                    <th className="py-1 px-1 text-left w-[8%]">OI</th>
                  </>
                ) : (
                  <>
                    <th className="py-1 px-1.5 text-left w-[14%] border-l border-[#1e2638]">LTP (₹)</th>
                    <th className="py-1 px-1.5 text-left w-[14%]">Volume</th>
                    <th className="py-1 px-1.5 text-left w-[14%]">OI</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2638]/60 font-mono text-[10.5px]">
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
                    className={`hover:bg-[#121724] transition-colors ${
                      isAtm ? 'bg-[#387ed1]/10 font-bold' : ''
                    }`}
                  >
                    {/* CALL: OI */}
                    <td className={`py-1 px-1 text-right truncate text-[#788296] ${isCallItm ? 'bg-[#387ed1]/5' : ''}`}>
                      {call ? fmtCompact(call.oi) : '-'}
                    </td>

                    {/* CALL: Volume */}
                    <td className={`py-1 px-1 text-right truncate text-[#58647a] ${isCallItm ? 'bg-[#387ed1]/5' : ''}`}>
                      {call ? fmtCompact(call.volume) : '-'}
                    </td>

                    {/* CALL: IV */}
                    {showGreeks && (
                      <td className={`py-1 px-1 text-right truncate text-[#788296] ${isCallItm ? 'bg-[#387ed1]/5' : ''}`}>
                        {call?.greeks ? `${call.greeks.iv.toFixed(1)}%` : '-'}
                      </td>
                    )}

                    {/* CALL: Delta */}
                    {showGreeks && (
                      <td className={`py-1 px-1 text-right truncate text-[#387ed1] ${isCallItm ? 'bg-[#387ed1]/5' : ''}`}>
                        {call?.greeks ? call.greeks.delta.toFixed(2) : '-'}
                      </td>
                    )}

                    {/* CALL: LTP (Interactive Trade Button) */}
                    <td className={`py-1 px-1.5 text-right border-r border-[#1e2638] ${isCallItm ? 'bg-[#387ed1]/10 font-bold text-[#f0f3f8]' : 'text-[#387ed1]'}`}>
                      {call ? (
                        <button
                          onClick={() => handleTradeOption(call, 'BUY')}
                          className="w-full py-0.5 px-1 rounded bg-[#387ed1]/20 hover:bg-[#387ed1] text-[#387ed1] hover:text-white transition-colors font-bold text-[10.5px] truncate block text-center"
                          title={`Buy ${call.tradingsymbol}`}
                        >
                          ₹{call.ltp.toFixed(1)}
                        </button>
                      ) : (
                        '-'
                      )}
                    </td>

                    {/* CENTER: STRIKE PRICE */}
                    <td className={`py-1 px-1 text-center font-bold font-mono text-xs ${isAtm ? 'bg-[#387ed1] text-white shadow-sm' : 'bg-[#121722] text-[#f0f3f8]'}`}>
                      {strike}
                    </td>

                    {/* PUT: LTP (Interactive Trade Button) */}
                    <td className={`py-1 px-1.5 text-left border-l border-[#1e2638] ${isPutItm ? 'bg-[#df514c]/10 font-bold text-[#f0f3f8]' : 'text-[#df514c]'}`}>
                      {put ? (
                        <button
                          onClick={() => handleTradeOption(put, 'BUY')}
                          className="w-full py-0.5 px-1 rounded bg-[#df514c]/20 hover:bg-[#df514c] text-[#df514c] hover:text-white transition-colors font-bold text-[10.5px] truncate block text-center"
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
                      <td className={`py-1 px-1 text-left truncate text-[#df514c] ${isPutItm ? 'bg-[#df514c]/5' : ''}`}>
                        {put?.greeks ? put.greeks.delta.toFixed(2) : '-'}
                      </td>
                    )}

                    {/* PUT: IV */}
                    {showGreeks && (
                      <td className={`py-1 px-1 text-left truncate text-[#788296] ${isPutItm ? 'bg-[#df514c]/5' : ''}`}>
                        {put?.greeks ? `${put.greeks.iv.toFixed(1)}%` : '-'}
                      </td>
                    )}

                    {/* PUT: Volume */}
                    <td className={`py-1 px-1 text-left truncate text-[#58647a] ${isPutItm ? 'bg-[#df514c]/5' : ''}`}>
                      {put ? fmtCompact(put.volume) : '-'}
                    </td>

                    {/* PUT: OI */}
                    <td className={`py-1 px-1 text-left truncate text-[#788296] ${isPutItm ? 'bg-[#df514c]/5' : ''}`}>
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
