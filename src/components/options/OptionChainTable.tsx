import React, { useState, useEffect } from 'react';
import { useTradingStore } from '../../store/useTradingStore';
import { marketDataService } from '../../services/market/MarketDataService';
import type { OptionChainData, OptionContract } from '../../types/market';
import { INDIAN_INSTRUMENTS_MASTER } from '../../services/market/indianInstruments';
import { RefreshCw, TrendingUp, TrendingDown, Eye, Sliders, ChevronDown } from 'lucide-react';

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

  const spot = chainData?.underlying_price || quotes[selectedUnderlying]?.last_price || 24500;
  const strikes = chainData?.strikes || [];

  return (
    <div className="flex flex-col bg-[#0E1728]/95 border border-[#C6A15B]/20 rounded-xl overflow-hidden select-none shadow-xl backdrop-blur-md">
      {/* ── Control Header ─────────────────────────────────────────────── */}
      <div className="p-4 border-b border-[#1F2D48] bg-[#0B1424]/90 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Underlying Selector */}
          <div>
            <label className="block text-[10px] text-[#8F9BAE] uppercase font-bold mb-1">
              Underlying
            </label>
            <select
              value={selectedUnderlying}
              onChange={(e) => {
                setSelectedUnderlying(e.target.value);
                setSelectedExpiry('');
              }}
              className="bg-[#14223A] border border-[#1F2D48] text-xs font-bold text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#C6A15B]"
            >
              {underlyings.map((u) => (
                <option key={u.key} value={u.key}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Expiry Selector */}
          <div>
            <label className="block text-[10px] text-[#8F9BAE] uppercase font-bold mb-1">
              Expiry Date
            </label>
            <select
              value={selectedExpiry}
              onChange={(e) => setSelectedExpiry(e.target.value)}
              className="bg-[#14223A] border border-[#1F2D48] text-xs font-bold text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#C6A15B]"
            >
              {chainData?.available_expiries.map((exp) => (
                <option key={exp} value={exp}>
                  {new Date(exp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </option>
              ))}
            </select>
          </div>

          {/* Spot Price Display */}
          <div className="pl-3 border-l border-[#1F2D48]">
            <span className="block text-[10px] text-[#8F9BAE] uppercase font-bold">Spot Price</span>
            <span className="text-sm font-bold font-mono text-white">
              ₹{spot.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* PCR, Max Pain & Greeks Toggle */}
        <div className="flex items-center gap-4">
          {chainData && (
            <div className="flex items-center gap-3 text-xs">
              <div className="bg-[#14223A] border border-[#1F2D48] px-2.5 py-1 rounded-lg">
                <span className="text-[#8F9BAE] text-[10px] mr-1.5 font-semibold">PCR:</span>
                <span className={`font-mono font-bold ${chainData.pcr >= 1 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                  {chainData.pcr.toFixed(2)}
                </span>
              </div>
              <div className="bg-[#14223A] border border-[#1F2D48] px-2.5 py-1 rounded-lg hidden sm:block">
                <span className="text-[#8F9BAE] text-[10px] mr-1.5 font-semibold">Max Pain:</span>
                <span className="font-mono font-bold text-[#E2C889]">
                  {chainData.max_pain || 'ATM'}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={() => setShowGreeks(!showGreeks)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
              showGreeks
                ? 'bg-[#C6A15B]/20 border-[#C6A15B] text-[#E2C889] font-bold'
                : 'bg-[#14223A] border-[#1F2D48] text-[#8F9BAE] hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Greeks {showGreeks ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={fetchChain}
            className="p-1.5 rounded-lg bg-[#14223A] border border-[#1F2D48] text-[#8F9BAE] hover:text-[#C6A15B] transition-colors"
            title="Refresh Option Chain"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#C6A15B]' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Option Chain Table ──────────────────────────────────────────── */}
      <div className="overflow-x-auto max-h-[600px] scrollbar-hide">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-[#0B1424] sticky top-0 z-20 border-b border-[#1F2D48] text-[11px] font-semibold text-[#8F9BAE]">
            <tr>
              {/* CALLS HEADER */}
              <th colSpan={showGreeks ? 5 : 3} className="text-center py-2 px-3 border-r border-[#1F2D48] bg-[#38BDF8]/10 text-[#7DD3FC]">
                CALLS (CE)
              </th>
              {/* STRIKE HEADER */}
              <th className="text-center py-2 px-4 bg-[#14223A] text-[#C6A15B] font-bold font-serif">
                STRIKE
              </th>
              {/* PUTS HEADER */}
              <th colSpan={showGreeks ? 5 : 3} className="text-center py-2 px-3 border-l border-[#1F2D48] bg-[#F43F5E]/10 text-[#FDA4AF]">
                PUTS (PE)
              </th>
            </tr>
            <tr className="border-b border-[#1F2D48] text-[10px] uppercase text-[#8F9BAE]">
              {/* CALL SUBHEADERS */}
              <th className="py-1.5 px-2">OI</th>
              <th className="py-1.5 px-2">Volume</th>
              {showGreeks && <th className="py-1.5 px-2">IV %</th>}
              {showGreeks && <th className="py-1.5 px-2">Delta</th>}
              <th className="py-1.5 px-2 text-right border-r border-[#1F2D48]">Call LTP (₹)</th>

              {/* STRIKE */}
              <th className="py-1.5 px-4 text-center bg-[#0B1424] text-[#C6A15B]">Price</th>

              {/* PUT SUBHEADERS */}
              <th className="py-1.5 px-2 text-left border-l border-[#1F2D48]">Put LTP (₹)</th>
              {showGreeks && <th className="py-1.5 px-2">Delta</th>}
              {showGreeks && <th className="py-1.5 px-2">IV %</th>}
              <th className="py-1.5 px-2">Volume</th>
              <th className="py-1.5 px-2">OI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2D48]/60 font-mono text-[11px]">
            {strikes.map((row) => {
              const strike = row.strike_price;
              const call = row.call;
              const put = row.put;
              const isAtm = Math.abs(strike - spot) <= 30;
              const isCallItm = strike < spot;
              const isPutItm = strike > spot;

              return (
                <tr
                  key={strike}
                  className={`hover:bg-[#14223A]/40 transition-colors ${
                    isAtm ? 'bg-[#C6A15B]/10 font-bold' : ''
                  }`}
                >
                  {/* CALL: OI */}
                  <td className={`py-1.5 px-2 text-[#A1A8B3] ${isCallItm ? 'bg-[#38BDF8]/5' : ''}`}>
                    {call ? call.oi.toLocaleString() : '-'}
                  </td>

                  {/* CALL: Volume */}
                  <td className={`py-1.5 px-2 text-[#8F9BAE] ${isCallItm ? 'bg-[#38BDF8]/5' : ''}`}>
                    {call ? call.volume.toLocaleString() : '-'}
                  </td>

                  {/* CALL: IV */}
                  {showGreeks && (
                    <td className={`py-1.5 px-2 text-[#A1A8B3] ${isCallItm ? 'bg-[#38BDF8]/5' : ''}`}>
                      {call?.greeks ? `${call.greeks.iv.toFixed(1)}%` : '-'}
                    </td>
                  )}

                  {/* CALL: Delta */}
                  {showGreeks && (
                    <td className={`py-1.5 px-2 text-[#38BDF8] ${isCallItm ? 'bg-[#38BDF8]/5' : ''}`}>
                      {call?.greeks ? call.greeks.delta.toFixed(2) : '-'}
                    </td>
                  )}

                  {/* CALL: LTP (Interactive Trade Button) */}
                  <td className={`py-1.5 px-2 text-right border-r border-[#1F2D48] ${isCallItm ? 'bg-[#38BDF8]/10 font-bold text-white' : 'text-[#7DD3FC]'}`}>
                    {call ? (
                      <button
                        onClick={() => handleTradeOption(call, 'BUY')}
                        className="px-2 py-0.5 rounded bg-[#38BDF8]/20 hover:bg-[#38BDF8] text-[#7DD3FC] hover:text-white transition-colors"
                        title={`Buy ${call.tradingsymbol}`}
                      >
                        ₹{call.ltp.toFixed(2)}
                      </button>
                    ) : (
                      '-'
                    )}
                  </td>

                  {/* CENTER: STRIKE PRICE */}
                  <td className={`py-1.5 px-4 text-center font-bold font-mono ${isAtm ? 'bg-gradient-to-r from-[#C6A15B] to-[#E2C889] text-[#0B1424] shadow-md' : 'bg-[#0B1424] text-white'}`}>
                    {strike}
                  </td>

                  {/* PUT: LTP (Interactive Trade Button) */}
                  <td className={`py-1.5 px-2 text-left border-l border-[#1F2D48] ${isPutItm ? 'bg-[#F43F5E]/10 font-bold text-white' : 'text-[#FDA4AF]'}`}>
                    {put ? (
                      <button
                        onClick={() => handleTradeOption(put, 'BUY')}
                        className="px-2 py-0.5 rounded bg-[#F43F5E]/20 hover:bg-[#F43F5E] text-[#FDA4AF] hover:text-white transition-colors"
                        title={`Buy ${put.tradingsymbol}`}
                      >
                        ₹{put.ltp.toFixed(2)}
                      </button>
                    ) : (
                      '-'
                    )}
                  </td>

                  {/* PUT: Delta */}
                  {showGreeks && (
                    <td className={`py-1.5 px-2 text-[#F43F5E] ${isPutItm ? 'bg-[#F43F5E]/5' : ''}`}>
                      {put?.greeks ? put.greeks.delta.toFixed(2) : '-'}
                    </td>
                  )}

                  {/* PUT: IV */}
                  {showGreeks && (
                    <td className={`py-1.5 px-2 text-[#A1A8B3] ${isPutItm ? 'bg-[#F43F5E]/5' : ''}`}>
                      {put?.greeks ? `${put.greeks.iv.toFixed(1)}%` : '-'}
                    </td>
                  )}

                  {/* PUT: Volume */}
                  <td className={`py-1.5 px-2 text-[#8F9BAE] ${isPutItm ? 'bg-[#F43F5E]/5' : ''}`}>
                    {put ? put.volume.toLocaleString() : '-'}
                  </td>

                  {/* PUT: OI */}
                  <td className={`py-1.5 px-2 text-[#A1A8B3] ${isPutItm ? 'bg-[#F43F5E]/5' : ''}`}>
                    {put ? put.oi.toLocaleString() : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
