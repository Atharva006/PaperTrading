import React, { useState, useEffect } from 'react';
import { useTradingStore } from '../store/useTradingStore';
import { INDIAN_INSTRUMENTS_MASTER, getExchangeContractSpec } from '../services/market/indianInstruments';
import { FinancialCalculations } from '../services/trading/FinancialCalculations';
import type { Instrument } from '../types/market';
import type { ProductType, OrderType, TransactionType } from '../types/trading';
import {
  Flame,
  Coins,
  Zap,
  Activity,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
} from 'lucide-react';

export default function CommoditiesPage() {
  const {
    quotes,
    account,
    openOrderTicket,
    placeOrder,
    selectedInstrument,
    setSelectedInstrument,
    positions,
    closePosition,
  } = useTradingStore();

  const [activeCategory, setActiveCategory] = useState<
    'ALL' | 'BULLION' | 'ENERGY' | 'METALS'
  >('ALL');

  // Filter master instruments to MCX and NCDEX commodities
  const commodities = INDIAN_INSTRUMENTS_MASTER.filter(
    (i) => i.instrument_type === 'FUTCOM' || i.exchange === 'MCX' || i.exchange === 'NCDEX'
  );

  const filteredCommodities = commodities.filter((c) => {
    if (activeCategory === 'ALL') return true;
    if (activeCategory === 'BULLION') return c.segment === 'COMMODITY_BULLION';
    if (activeCategory === 'ENERGY') return c.segment === 'COMMODITY_ENERGY';
    if (activeCategory === 'METALS') return c.segment === 'COMMODITY_METALS';
    return true;
  });

  const isCurrentCommodity =
    selectedInstrument.instrument_type === 'FUTCOM' ||
    selectedInstrument.exchange === 'MCX' ||
    selectedInstrument.exchange === 'NCDEX';

  const activeCommodity = isCurrentCommodity
    ? selectedInstrument
    : commodities.find((c) => c.instrument_key === 'MCX_FO|571445' || c.instrument_key === 'MCX_FO|495213') || commodities[0];

  const currentQuote = quotes[activeCommodity.instrument_key] || quotes[activeCommodity.tradingsymbol];
  const depth = currentQuote?.depth;
  const activeSpec = getExchangeContractSpec(
    activeCommodity.tradingsymbol,
    activeCommodity.instrument_type,
    activeCommodity.exchange,
    activeCommodity.lot_size
  );

  // Fast Order Pad State
  const [transactionType, setTransactionType] = useState<TransactionType>('BUY');
  const [product, setProduct] = useState<ProductType>('NRML');
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [lots, setLots] = useState(1);
  const [quantity, setQuantity] = useState(activeSpec.lotSize);
  const [limitPrice, setLimitPrice] = useState(currentQuote?.last_price || 0);
  const [triggerPrice, setTriggerPrice] = useState(currentQuote?.last_price || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setLots(1);
    setQuantity(activeSpec.lotSize);
    const q = quotes[activeCommodity.instrument_key] || quotes[activeCommodity.tradingsymbol];
    if (q?.last_price) {
      setLimitPrice(q.last_price);
      setTriggerPrice(q.last_price);
    }
  }, [activeCommodity.instrument_key, activeSpec.lotSize]);

  useEffect(() => {
    if (currentQuote?.last_price && limitPrice === 0) {
      setLimitPrice(currentQuote.last_price);
      setTriggerPrice(currentQuote.last_price);
    }
  }, [currentQuote?.last_price]);

  const handleSelectCommodity = (inst: Instrument) => {
    setSelectedInstrument(inst);
    const spec = getExchangeContractSpec(inst.tradingsymbol, inst.instrument_type, inst.exchange, inst.lot_size);
    setLots(1);
    setQuantity(spec.lotSize);
    const q = quotes[inst.instrument_key] || quotes[inst.tradingsymbol];
    if (q?.last_price) {
      setLimitPrice(q.last_price);
      setTriggerPrice(q.last_price);
    }
  };

  const handleLotsChange = (newL: number) => {
    const valid = Math.max(1, newL);
    setLots(valid);
    setQuantity(valid * activeSpec.lotSize);
  };

  const handleQuantityChange = (newQ: number) => {
    const valid = Math.max(1, newQ);
    setQuantity(valid);
    if (activeSpec.lotSize > 1) {
      setLots(Math.max(1, Math.round(valid / activeSpec.lotSize)));
    }
  };

  const marketPrice = currentQuote && currentQuote.last_price > 0 ? currentQuote.last_price : 0;
  const effectivePrice = orderType === 'MARKET' ? marketPrice : limitPrice;

  const requiredMargin = FinancialCalculations.calculateRequiredMargin({
    instrumentType: activeCommodity.instrument_type,
    product,
    transactionType,
    quantity,
    price: effectivePrice,
    multiplier: activeSpec.multiplier,
  });

  const availableCash = account?.cash_balance ?? 0;
  const isInsufficientFunds = requiredMargin > availableCash;

  const handleDirectOrder = async (side: TransactionType) => {
    if (isSubmitting) return;

    if (effectivePrice <= 0) {
      setFeedback('Error: Market price is unavailable. Enter a limit price.');
      setTimeout(() => setFeedback(null), 4000);
      return;
    }

    if (isInsufficientFunds) {
      setFeedback(`Insufficient funds: Need ₹${requiredMargin.toLocaleString('en-IN')}`);
      setTimeout(() => setFeedback(null), 4000);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await placeOrder({
        instrument_key: activeCommodity.instrument_key,
        tradingsymbol: activeCommodity.tradingsymbol,
        exchange: activeCommodity.exchange,
        instrument_type: activeCommodity.instrument_type,
        transaction_type: side,
        product,
        order_type: orderType,
        quantity,
        price: orderType === 'MARKET' ? 0 : limitPrice,
        trigger_price: orderType === 'SL' ? triggerPrice : 0,
        lot_size: activeSpec.lotSize,
      });

      if (res.status === 'REJECTED') {
        setFeedback(`Rejected: ${res.rejection_reason || 'Margin limit exceeded'}`);
      } else {
        setFeedback(`Executed: ${side} ${quantity} ${activeCommodity.tradingsymbol} (${lots} Lot) successfully filled.`);
      }
    } catch (err: any) {
      setFeedback(`Execution Failed: ${err?.message || 'Network error'}`);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleOpenModal = (inst: Instrument, side: TransactionType) => {
    openOrderTicket({
      instrument_key: inst.instrument_key,
      tradingsymbol: inst.tradingsymbol,
      exchange: inst.exchange,
      instrument_type: inst.instrument_type,
      transaction_type: side,
      product: 'NRML',
      quantity: activeSpec.lotSize,
      lot_size: activeSpec.lotSize,
    });
  };

  const commodityPositions = positions.filter(
    (p) =>
      !p.is_closed &&
      p.quantity !== 0 &&
      (p.instrument_type === 'FUTCOM' || p.exchange === 'MCX' || p.exchange === 'NCDEX')
  );

  const activeInstrumentPosition = commodityPositions.find(
    (p) => p.instrument_key === activeCommodity.instrument_key
  );

  // Key Spotlight Benchmarks
  const spotlights = [
    { key: 'MCX_FO|495213', altKey: 'MCX_FO|GOLD', label: 'GOLD (1kg)', unit: '₹ / 10g', icon: Coins },
    { key: 'MCX_FO|571445', altKey: 'MCX_FO|GOLDM', label: 'GOLD MINI (100g)', unit: '₹ / 10g', icon: Coins },
    { key: 'MCX_FO|495214', altKey: 'MCX_FO|SILVER', label: 'SILVER (30kg)', unit: '₹ / kg', icon: Coins },
    { key: 'MCX_FO|569900', altKey: 'MCX_FO|CRUDEOIL', label: 'CRUDE OIL (100 BBL)', unit: '₹ / BBL', icon: Flame },
    { key: 'MCX_FO|570750', altKey: 'MCX_FO|NATURALGAS', label: 'NATURAL GAS (1250)', unit: '₹ / mmBtu', icon: Zap },
    { key: 'MCX_FO|574829', altKey: 'MCX_FO|COPPER', label: 'COPPER (2.5 MT)', unit: '₹ / kg', icon: Activity },
  ];

  const fmt = (n?: number | null) =>
    (typeof n === 'number' && !isNaN(n) ? n : 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="w-full max-w-full mx-auto select-none font-sans text-xs text-[#111114] pb-12 space-y-5">
      {/* ── 1. Top Header Strip ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#D9E2F2]">
        <div>
          <div className="flex items-center gap-2 text-xs mb-1 font-mono">
            <span className="w-2 h-2 rounded-full bg-[#12B76A] animate-pulse" />
            <span className="text-[#00225A] font-bold text-[11px] tracking-wider uppercase font-mono">MCX COMMODITIES DESK</span>
            <span className="text-[#D9E2F2]">|</span>
            <span className="text-[#6B7A90] text-[11px]">EVENING SESSION ACTIVE (09:00 - 23:30 IST)</span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#00225A] flex items-center gap-2.5">
            <span>Commodities Workstation</span>
            <span className="text-xs font-mono font-normal text-[#6B7A90]">
              ({filteredCommodities.length} contracts)
            </span>
          </h1>
        </div>

        {/* Sub-tabs for commodity categories */}
        <div className="overflow-x-auto">
          <div className="bg-[#F7F8FA] border border-[#D9E2F2] p-1 rounded-xl inline-flex gap-1">
            {[
              { id: 'ALL', label: 'All Scrips' },
              { id: 'BULLION', label: 'Bullion (Gold/Silver)' },
              { id: 'ENERGY', label: 'Energy (Crude/Gas)' },
              { id: 'METALS', label: 'Base Metals' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  activeCategory === cat.id
                    ? 'bg-white text-[#00225A] font-bold shadow-sm border border-[#D9E2F2]'
                    : 'text-[#6B7A90] hover:text-[#00225A]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. Spotlight Scrips Ticker Strip ────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-y sm:divide-y-0 divide-[#D9E2F2] border border-[#D9E2F2] bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,34,90,0.04)]">
        {spotlights.map((spot) => {
          const q = quotes[spot.key] || (spot.altKey ? quotes[spot.altKey] : undefined);
          const price = q ? q.last_price : 0;
          const change = q ? q.change : 0;
          const changePct = q ? q.change_percent : 0;
          const isPos = change >= 0;
          const isSelected =
            activeCommodity.instrument_key === spot.key ||
            (spot.altKey && activeCommodity.instrument_key === spot.altKey);

          return (
            <div
              key={spot.key}
              onClick={() => {
                const target =
                  commodities.find((c) => c.instrument_key === spot.key) ||
                  (spot.altKey ? commodities.find((c) => c.instrument_key === spot.altKey) : null);
                if (target) handleSelectCommodity(target);
              }}
              className={`p-3.5 transition-all cursor-pointer active:scale-[0.98] ${
                isSelected
                  ? 'bg-[#EEF3FF] border-l-2 border-l-[#00225A]'
                  : 'hover:bg-[#F7F8FA]'
              }`}
            >
              <div className="flex items-center justify-between text-[#6B7A90] text-[11px] mb-0.5">
                <span className="font-semibold text-[#00225A] truncate">{spot.label}</span>
                <span className="text-[10px] text-[#6B7A90] font-mono">{spot.unit}</span>
              </div>

              <div className="text-sm font-bold font-mono text-[#111114] tabular-nums">
                {price > 0 ? `₹${fmt(price)}` : '—'}
              </div>

              <div className="text-[10px] font-mono mt-0.5 tabular-nums">
                <span className={isPos ? 'text-[#12B76A] font-semibold' : 'text-[#D92D20] font-semibold'}>
                  {price > 0 ? `${isPos ? '+' : ''}${fmt(change)} (${changePct.toFixed(2)}%)` : 'Live Feed'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 3. Active Workstation (Split: Direct Order Pad + Depth) ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-1">
        {/* Left Column: Direct Fast Order Placement Pad */}
        <div className="bg-white p-6 rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)] flex flex-col justify-between space-y-5">
          <div>
            {/* Active Header & Live Tick */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#D9E2F2]">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-lg font-bold text-[#00225A]">
                    {activeCommodity.tradingsymbol}
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EEF3FF] text-[#00225A] border border-[#D9E2F2] font-bold">
                    {activeCommodity.exchange}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#12B76A]/10 text-[#12B76A] border border-[#12B76A]/30 font-bold">
                    {activeSpec.lotDescription}
                  </span>
                </div>
                <p className="text-[11px] text-[#6B7A90] mt-0.5">{activeCommodity.name}</p>
              </div>

              <div className="text-right font-mono tabular-nums">
                <div className="text-lg font-bold text-[#111114] tracking-tight">
                  {marketPrice > 0 ? `₹${fmt(marketPrice)}` : 'Live Price'}
                </div>
                {currentQuote && (
                  <div
                    className={`text-[11px] ${
                      currentQuote.change >= 0 ? 'text-[#12B76A] font-medium' : 'text-[#D92D20] font-medium'
                    }`}
                  >
                    {currentQuote.change >= 0 ? '+' : ''}
                    {fmt(currentQuote.change)} ({currentQuote.change_percent.toFixed(2)}%)
                  </div>
                )}
              </div>
            </div>

            {/* Success Feedback Banner */}
            {feedback && (
              <div className="mt-3 p-3 rounded-xl bg-[#12B76A]/10 border border-[#12B76A]/30 text-[#12B76A] text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{feedback}</span>
              </div>
            )}

            {/* Quick Lot Selector */}
            <div className="mt-4 space-y-1.5">
              <label className="text-[10px] font-medium uppercase text-[#6B7A90] font-mono tracking-wider">
                Quick Contract Lots
              </label>
              <div className="bg-[#F7F8FA] border border-[#D9E2F2] p-1 rounded-xl grid grid-cols-4 gap-1">
                {[1, 2, 5, 10].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => handleLotsChange(l)}
                    className={`py-1.5 text-xs font-mono font-semibold rounded-lg cursor-pointer transition-all ${
                      lots === l
                        ? 'bg-white text-[#00225A] font-bold shadow-sm border border-[#D9E2F2]'
                        : 'text-[#6B7A90] hover:text-[#00225A]'
                    }`}
                  >
                    {l} Lot{l > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Type & Order Type Selection */}
            <div className="mt-3.5 grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-medium uppercase text-[#6B7A90] font-mono tracking-wider block mb-1">
                  Product Type
                </label>
                <div className="bg-[#F7F8FA] border border-[#D9E2F2] p-1 rounded-xl grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => setProduct('NRML')}
                    className={`py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                      product === 'NRML' ? 'bg-white text-[#00225A] font-bold shadow-sm border border-[#D9E2F2]' : 'text-[#6B7A90] hover:text-[#00225A]'
                    }`}
                  >
                    NRML
                  </button>
                  <button
                    type="button"
                    onClick={() => setProduct('MIS')}
                    className={`py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                      product === 'MIS' ? 'bg-white text-[#00225A] font-bold shadow-sm border border-[#D9E2F2]' : 'text-[#6B7A90] hover:text-[#00225A]'
                    }`}
                  >
                    MIS (5x)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-medium uppercase text-[#6B7A90] font-mono tracking-wider block mb-1">
                  Order Type
                </label>
                <div className="bg-[#F7F8FA] border border-[#D9E2F2] p-1 rounded-xl grid grid-cols-3 gap-1">
                  {(['MARKET', 'LIMIT', 'SL'] as OrderType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setOrderType(t)}
                      className={`py-1.5 text-[11px] font-semibold rounded-lg cursor-pointer transition-all ${
                        orderType === t ? 'bg-white text-[#00225A] font-bold shadow-sm border border-[#D9E2F2]' : 'text-[#6B7A90] hover:text-[#00225A]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quantity and Price Fields */}
            <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Quantity Counter */}
              <div>
                <div className="flex justify-between items-center mb-1 text-[10px] font-medium uppercase text-[#6B7A90] font-mono">
                  <span>Quantity ({activeSpec.unit})</span>
                  <span className="text-[#00225A] font-mono font-bold">{lots} Lot{lots > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl p-0.5">
                  <button
                    type="button"
                    onClick={() => handleLotsChange(lots - 1)}
                    className="px-3 py-1.5 text-sm font-bold text-[#6B7A90] hover:text-[#00225A] hover:bg-white rounded-lg active:scale-[0.90] transition-all cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    step="any"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(Number(e.target.value))}
                    className="w-full bg-transparent text-center font-mono font-bold text-[#111114] text-xs focus:outline-none tabular-nums"
                  />
                  <button
                    type="button"
                    onClick={() => handleLotsChange(lots + 1)}
                    className="px-3 py-1.5 text-sm font-bold text-[#6B7A90] hover:text-[#00225A] hover:bg-white rounded-lg active:scale-[0.90] transition-all cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Price / Limit Price */}
              <div>
                <label className="text-[10px] font-medium uppercase text-[#6B7A90] font-mono block mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  step="any"
                  disabled={orderType === 'MARKET'}
                  value={orderType === 'MARKET' ? (marketPrice > 0 ? marketPrice : 'MARKET') : limitPrice}
                  onChange={(e) => setLimitPrice(Number(e.target.value))}
                  className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl py-1.5 px-3 font-mono font-bold text-[#111114] text-xs focus:outline-none focus:border-[#00225A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors tabular-nums"
                />
              </div>
            </div>

            {/* Margin Requirement Summary */}
            <div className="mt-3.5 p-3.5 rounded-xl bg-[#F7F8FA] border border-[#D9E2F2] flex items-center justify-between text-xs font-mono tabular-nums">
              <div>
                <span className="text-[#6B7A90] block text-[10px] uppercase">Margin Required</span>
                <span className="font-bold text-[#00225A] text-xs">₹{fmt(requiredMargin)}</span>
              </div>
              <div className="text-right">
                <span className="text-[#6B7A90] block text-[10px] uppercase">Available Cash</span>
                <span className="font-bold text-[#111114] text-xs">₹{fmt(availableCash)}</span>
              </div>
            </div>

            {isInsufficientFunds && (
              <div className="mt-2 text-[11px] text-[#D92D20] flex items-center gap-1.5 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Insufficient funds for this trade. Available: ₹{fmt(availableCash)}</span>
              </div>
            )}
          </div>

          {/* Action Execution Buttons */}
          <div className="space-y-2.5 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isSubmitting || isInsufficientFunds}
                onClick={() => handleDirectOrder('BUY')}
                className="py-3 px-4 rounded-xl text-white font-bold text-xs tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.97] disabled:opacity-50 cursor-pointer bg-[#12B76A] hover:brightness-105"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>BUY {lots} LOT</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDirectOrder('SELL')}
                className="py-3 px-4 rounded-xl text-white font-bold text-xs tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.97] disabled:opacity-50 cursor-pointer bg-[#D92D20] hover:brightness-105"
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>SELL {lots} LOT</span>
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => handleOpenModal(activeCommodity, 'BUY')}
                className="text-[11px] text-[#536CF0] hover:text-[#00225A] font-semibold transition-colors cursor-pointer active:scale-[0.96] inline-block"
              >
                Open Full Order Ticket Modal →
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Level 2 Market Depth & Exact Specifications */}
        <div className="space-y-4">
          {/* Level 2 Order Depth */}
          <div className="bg-white p-5 rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)] space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9E2F2]">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-[#536CF0]" />
                <h3 className="font-display text-xs font-bold text-[#00225A]">Market Depth (5 Bid / 5 Ask)</h3>
              </div>
              <span className="text-[10px] text-[#12B76A] font-mono bg-[#12B76A]/10 px-2.5 py-0.5 rounded-full border border-[#12B76A]/30 font-bold">
                LIVE TICKS
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 font-mono text-[11px] tabular-nums">
              {/* Bid Column */}
              <div>
                <div className="flex justify-between text-[#6B7A90] text-[10px] pb-1 border-b border-[#D9E2F2] uppercase font-mono">
                  <span>Bid ₹</span>
                  <span>Orders</span>
                  <span>Qty</span>
                </div>
                <div className="space-y-1 mt-1.5 text-[#12B76A]">
                  {currentQuote && currentQuote.last_price > 0 ? (
                    (
                      depth?.buy || [
                        { price: currentQuote.last_price - 1, quantity: 25, orders: 3 },
                        { price: currentQuote.last_price - 2, quantity: 50, orders: 5 },
                        { price: currentQuote.last_price - 3, quantity: 80, orders: 7 },
                        { price: currentQuote.last_price - 4, quantity: 120, orders: 12 },
                        { price: currentQuote.last_price - 5, quantity: 200, orders: 18 },
                      ]
                    )
                      .slice(0, 5)
                      .map((b, i) => (
                        <div key={i} className="flex justify-between hover:bg-[#F7F8FA] px-1.5 py-0.5 rounded-lg transition-colors">
                          <span className="font-semibold">{b.price.toFixed(2)}</span>
                          <span className="text-[#6B7A90]">{b.orders || 1}</span>
                          <span className="text-[#111114]">{b.quantity}</span>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-4 text-[#6B7A90] text-[10px]">Loading depth...</div>
                  )}
                </div>
              </div>

              {/* Ask Column */}
              <div>
                <div className="flex justify-between text-[#6B7A90] text-[10px] pb-1 border-b border-[#D9E2F2] uppercase font-mono">
                  <span>Ask ₹</span>
                  <span>Orders</span>
                  <span>Qty</span>
                </div>
                <div className="space-y-1 mt-1.5 text-[#D92D20]">
                  {currentQuote && currentQuote.last_price > 0 ? (
                    (
                      depth?.sell || [
                        { price: currentQuote.last_price + 1, quantity: 20, orders: 2 },
                        { price: currentQuote.last_price + 2, quantity: 40, orders: 4 },
                        { price: currentQuote.last_price + 3, quantity: 65, orders: 6 },
                        { price: currentQuote.last_price + 4, quantity: 110, orders: 10 },
                        { price: currentQuote.last_price + 5, quantity: 160, orders: 15 },
                      ]
                    )
                      .slice(0, 5)
                      .map((a, i) => (
                        <div key={i} className="flex justify-between hover:bg-[#F7F8FA] px-1.5 py-0.5 rounded-lg transition-colors">
                          <span className="font-semibold">{a.price.toFixed(2)}</span>
                          <span className="text-[#6B7A90]">{a.orders || 1}</span>
                          <span className="text-[#111114]">{a.quantity}</span>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-4 text-[#6B7A90] text-[10px]">Loading depth...</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Active Holding in Selected Commodity */}
          {activeInstrumentPosition && (
            <div className="p-4 rounded-2xl border border-[#D9E2F2] bg-[#F7F8FA] shadow-sm flex items-center justify-between">
              {(() => {
                const activeAvgPrice = activeInstrumentPosition.quantity > 0 
                  ? activeInstrumentPosition.buy_price 
                  : activeInstrumentPosition.sell_price;
                return (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        activeInstrumentPosition.quantity > 0 ? 'bg-[#12B76A]/10 text-[#12B76A] border border-[#12B76A]/30' : 'bg-[#D92D20]/10 text-[#D92D20] border border-[#D92D20]/30'
                      }`}>
                        {activeInstrumentPosition.quantity > 0 ? 'LONG' : 'SHORT'}
                      </span>
                      <span className="font-bold text-[#00225A]">
                        {Math.abs(activeInstrumentPosition.quantity)} {activeSpec.unit}
                      </span>
                      <span className="text-[#6B7A90] text-[11px] font-mono tabular-nums">
                        @ ₹{fmt(activeAvgPrice)}
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-xs tabular-nums">
                      <span className="text-[#6B7A90]">Unrealized P&L: </span>
                      <span className={`font-bold ${
                        (activeInstrumentPosition.unrealized_pnl || 0) >= 0 ? 'text-[#12B76A]' : 'text-[#D92D20]'
                      }`}>
                        {(activeInstrumentPosition.unrealized_pnl || 0) >= 0 ? '+' : ''}
                        ₹{fmt(activeInstrumentPosition.unrealized_pnl || 0)}
                      </span>
                    </div>
                  </div>
                );
              })()}

              <button
                type="button"
                onClick={() => closePosition(activeInstrumentPosition.id)}
                className="px-3.5 py-1.5 rounded-xl bg-[#FEE4E2] hover:bg-[#D92D20] text-[#D92D20] hover:text-white font-bold text-xs border border-[#FECDCA] active:scale-[0.92] transition-all cursor-pointer shadow-sm"
              >
                Square Off
              </button>
            </div>
          )}

          {/* Contract Specifications */}
          <div className="bg-white p-5 rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)] text-xs space-y-2.5">
            <h4 className="text-[11px] font-semibold text-[#00225A] uppercase mb-1 font-mono flex items-center justify-between border-b border-[#D9E2F2] pb-2.5">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#536CF0]" />
                <span className="font-display font-bold">Contract Specifications</span>
              </span>
              <span className="text-[#536CF0] font-bold">{activeCommodity.exchange}</span>
            </h4>
            <div className="flex justify-between text-[#6B7A90] py-1 border-b border-[#D9E2F2]/60">
              <span>Lot Size:</span>
              <span className="font-mono text-[#00225A] font-semibold">{activeSpec.lotDescription}</span>
            </div>
            <div className="flex justify-between text-[#6B7A90] py-1 border-b border-[#D9E2F2]/60">
              <span>Unit of Trading:</span>
              <span className="font-mono text-[#111114] font-semibold">{activeSpec.unit}</span>
            </div>
            <div className="flex justify-between text-[#6B7A90] py-1 border-b border-[#D9E2F2]/60">
              <span>Price Quotation:</span>
              <span className="font-mono text-[#111114] font-semibold">{activeSpec.pricePerUnit}</span>
            </div>
            <div className="flex justify-between text-[#6B7A90] py-1 border-b border-[#D9E2F2]/60">
              <span>Contract Expiry:</span>
              <span className="font-mono text-[#00225A] font-semibold">
                {activeCommodity.expiry || 'Monthly'}
              </span>
            </div>
            <div className="flex justify-between text-[#6B7A90] py-1 border-b border-[#D9E2F2]/60">
              <span>Margin Requirement:</span>
              <span className="font-mono text-[#12B76A] font-semibold">~12% (NRML) / ~5% (MIS)</span>
            </div>
            <div className="flex justify-between text-[#6B7A90] py-1">
              <span>Commodity Tax (CTT):</span>
              <span className="font-mono text-[#111114] font-semibold">0.01% on Sell side</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Open Commodity Positions Desk ────────────────────────────── */}
      {commodityPositions.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)] mt-5">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="w-4 h-4 text-[#00225A]" />
            <h3 className="font-display text-sm font-bold text-[#00225A]">
              Open Commodity Positions ({commodityPositions.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono tabular-nums">
              <thead>
                <tr className="border-b border-[#D9E2F2] text-[10px] text-[#6B7A90] uppercase tracking-wider bg-[#F7F8FA]">
                  <th className="py-2.5 px-3">Contract</th>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3 text-right">Net Qty</th>
                  <th className="py-2.5 px-3 text-right">Avg Entry</th>
                  <th className="py-2.5 px-3 text-right">LTP</th>
                  <th className="py-2.5 px-3 text-right">P&L (MTM)</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E2F2]">
                {commodityPositions.map((pos) => {
                  const pnl = pos.unrealized_pnl || 0;
                  const isPos = pnl >= 0;
                  const avgEntry = pos.quantity > 0 ? pos.buy_price : pos.sell_price;
                  const ltp = pos.last_price || avgEntry;

                  return (
                    <tr key={pos.id} className="hover:bg-[#F7F8FA] transition-colors">
                      <td className="py-2.5 px-3 font-bold text-[#00225A] font-sans">{pos.tradingsymbol}</td>
                      <td className="py-2.5 px-3 text-[#00225A]">
                        <span className="px-2 py-0.5 rounded-full bg-[#EEF3FF] border border-[#D9E2F2] text-[10px] font-bold">
                          {pos.product}
                        </span>
                      </td>
                      <td className={`py-2.5 px-3 text-right font-bold ${pos.quantity > 0 ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
                        {pos.quantity > 0 ? `+${pos.quantity}` : pos.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#6B7A90]">₹{fmt(avgEntry)}</td>
                      <td className="py-2.5 px-3 text-right text-[#111114]">₹{fmt(ltp)}</td>
                      <td className={`py-2.5 px-3 text-right font-bold ${isPos ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
                        {isPos ? '+' : ''}₹{fmt(pnl)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => closePosition(pos.id)}
                          className="px-3 py-1 rounded-lg bg-[#FEE4E2] hover:bg-[#D92D20] text-[#D92D20] hover:text-white font-bold text-[11px] border border-[#FECDCA] active:scale-[0.92] transition-all cursor-pointer shadow-sm"
                        >
                          Exit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 5. Commodities Matrix Table ─────────────────────────────────── */}
      <div className="bg-white p-5 rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)] mt-5">
        <div className="flex items-center justify-between mb-3 border-b border-[#D9E2F2] pb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#536CF0]" />
            <h3 className="font-display text-sm font-bold text-[#00225A]">
              MCX Commodity Scrips & Specifications
            </h3>
            <span className="text-[10px] text-[#6B7A90] font-mono">
              ({filteredCommodities.length} Active)
            </span>
          </div>

          <span className="text-[11px] text-[#6B7A90] font-mono hidden sm:inline">
            Click row to select for order execution · Exact contract specifications
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#D9E2F2] text-[10px] text-[#6B7A90] uppercase tracking-wider font-mono bg-[#F7F8FA]">
                <th className="py-2.5 px-3">Contract / Symbol</th>
                <th className="py-2.5 px-3">Segment</th>
                <th className="py-2.5 px-3">Lot Sizing</th>
                <th className="py-2.5 px-3">Expiry</th>
                <th className="py-2.5 px-3 text-right">LTP (₹)</th>
                <th className="py-2.5 px-3 text-right">Day Change</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E2F2] font-mono tabular-nums">
              {filteredCommodities.map((c) => {
                const q = quotes[c.instrument_key] || quotes[c.tradingsymbol];
                const price = q ? q.last_price : 0;
                const change = q ? q.change : 0;
                const changePct = q ? q.change_percent : 0;
                const isPos = change >= 0;
                const isSelected = activeCommodity.instrument_key === c.instrument_key;
                const spec = getExchangeContractSpec(c.tradingsymbol, c.instrument_type, c.exchange, c.lot_size);

                return (
                  <tr
                    key={c.instrument_key}
                    onClick={() => handleSelectCommodity(c)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#EEF3FF]' : 'hover:bg-[#F7F8FA]'
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-[#00225A] text-xs font-sans">
                        {c.tradingsymbol}
                      </div>
                      <div className="text-[10px] text-[#6B7A90] font-normal">{c.name}</div>
                    </td>

                    <td className="py-2.5 px-3 text-[#6B7A90] font-sans text-[11px]">
                      {c.segment?.replace('COMMODITY_', '') || 'GENERAL'}
                    </td>

                    <td className="py-2.5 px-3 text-[#00225A] font-mono font-semibold">
                      {spec.lotDescription}
                    </td>

                    <td className="py-2.5 px-3 text-[#6B7A90]">{c.expiry || '-'}</td>

                    <td className="py-2.5 px-3 text-right font-bold text-[#111114]">
                      {price > 0 ? `₹${fmt(price)}` : 'Live Price'}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      {price > 0 ? (
                        <span
                          className={`font-semibold ${isPos ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}
                        >
                          {isPos ? '+' : ''}{fmt(change)} ({changePct.toFixed(2)}%)
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleOpenModal(c, 'BUY')}
                        className="px-3 py-1 rounded-lg bg-[#12B76A]/10 hover:bg-[#12B76A] text-[#12B76A] hover:text-white text-[11px] font-bold border border-[#12B76A]/30 active:scale-[0.92] transition-all cursor-pointer shadow-sm"
                      >
                        BUY
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenModal(c, 'SELL')}
                        className="px-3 py-1 rounded-lg bg-[#FEE4E2] hover:bg-[#D92D20] text-[#D92D20] hover:text-white text-[11px] font-bold border border-[#FECDCA] active:scale-[0.92] transition-all cursor-pointer shadow-sm"
                      >
                        SELL
                      </button>
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
