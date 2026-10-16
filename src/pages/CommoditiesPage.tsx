import React, { useState } from 'react';
import { useTradingStore } from '../store/useTradingStore';
import { INDIAN_INSTRUMENTS_MASTER, getZerodhaContractSpec } from '../services/market/indianInstruments';
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
  const activeSpec = getZerodhaContractSpec(
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

  const handleSelectCommodity = (inst: Instrument) => {
    setSelectedInstrument(inst);
    const spec = getZerodhaContractSpec(inst.tradingsymbol, inst.instrument_type, inst.exchange, inst.lot_size);
    setLots(1);
    setQuantity(spec.lotSize);
    const q = quotes[inst.instrument_key] || quotes[inst.tradingsymbol];
    if (q?.last_price) {
      setLimitPrice(q.last_price);
      setTriggerPrice(q.last_price);
    }
  };

  const handleLotsChange = (newLots: number) => {
    const validLots = Math.max(1, newLots);
    setLots(validLots);
    setQuantity(validLots * activeSpec.lotSize);
  };

  const handleQuantityChange = (newQty: number) => {
    const validQty = Math.max(1, newQty);
    setQuantity(validQty);
    if (activeSpec.lotSize > 0) {
      setLots(Math.max(1, Math.round(validQty / activeSpec.lotSize)));
    }
  };

  const marketPrice = currentQuote?.last_price || 0;
  const effectivePrice = orderType === 'MARKET' ? marketPrice : limitPrice;

  const requiredMargin = FinancialCalculations.calculateRequiredMargin({
    instrumentType: activeCommodity.instrument_type,
    product,
    transactionType,
    quantity,
    price: effectivePrice,
    multiplier: activeSpec.multiplier,
  });

  const availableCash = account ? account.cash_balance - account.used_margin : 0;
  const isInsufficientFunds = transactionType === 'BUY' && requiredMargin > availableCash;

  const handleDirectOrder = async (txType: TransactionType) => {
    if (isInsufficientFunds && txType === 'BUY') return;
    setIsSubmitting(true);
    const success = await placeOrder({
      instrument_key: activeCommodity.instrument_key,
      tradingsymbol: activeCommodity.tradingsymbol,
      exchange: activeCommodity.exchange,
      instrument_type: activeCommodity.instrument_type,
      transaction_type: txType,
      product,
      order_type: orderType,
      quantity,
      lot_size: activeSpec.lotSize,
      price: orderType === 'LIMIT' || orderType === 'SL' ? limitPrice : 0,
      trigger_price: orderType === 'SL' || orderType === 'SL_M' ? triggerPrice : 0,
    });
    setIsSubmitting(false);

    if (success) {
      setFeedback(`Order placed: ${txType} ${lots} Lot (${quantity} ${activeSpec.unit}) of ${activeCommodity.tradingsymbol}`);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleOpenModal = (inst: Instrument, type: 'BUY' | 'SELL') => {
    setSelectedInstrument(inst);
    const spec = getZerodhaContractSpec(inst.tradingsymbol, inst.instrument_type, inst.exchange, inst.lot_size);
    openOrderTicket({
      instrument_key: inst.instrument_key,
      tradingsymbol: inst.tradingsymbol,
      exchange: inst.exchange,
      instrument_type: inst.instrument_type,
      transaction_type: type,
      product: 'NRML',
      quantity: spec.lotSize,
      lot_size: spec.lotSize,
      price: quotes[inst.instrument_key]?.last_price || 0,
    });
  };

  // Open commodity positions
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
    <div className="w-full max-w-[1720px] mx-auto select-none font-sans text-xs text-[#F5F5F2] pb-12 space-y-5">
      {/* ── 1. Top Cendrix Capital Header Strip ─────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#14223A]">
        <div>
          <div className="flex items-center gap-2 text-xs mb-1 font-mono">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="text-[#C6A15B] font-semibold text-[11px] tracking-wider uppercase font-mono">MCX COMMODITIES DESK</span>
            <span className="text-[#14223A]">|</span>
            <span className="text-[#A1A8B3] text-[11px]">EVENING SESSION ACTIVE (09:00 - 23:30 IST)</span>
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-wide text-[#F5F5F2] flex items-center gap-2.5">
            <span>Commodities Workstation</span>
            <span className="text-xs font-mono font-normal text-[#A1A8B3]">
              ({filteredCommodities.length} contracts)
            </span>
          </h1>
        </div>

        {/* Sub-tabs for commodity categories */}
        <div className="flex items-center gap-4 text-xs font-medium">
          {[
            { id: 'ALL', label: 'All Scrips' },
            { id: 'BULLION', label: 'Bullion (Gold/Silver)' },
            { id: 'ENERGY', label: 'Energy (Crude/Gas)' },
            { id: 'METALS', label: 'Base Metals' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`pb-1.5 border-b-2 transition-all ${
                activeCategory === cat.id
                  ? 'border-[#C6A15B] text-[#C6A15B] font-bold shadow-[0_1px_8px_rgba(198,161,91,0.25)]'
                  : 'border-transparent text-[#A1A8B3] hover:text-[#F5F5F2]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 2. Cendrix High-Density Spotlight Scrips Ticker Strip ───────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-y sm:divide-y-0 divide-[#14223A] border border-[rgba(198,161,91,0.2)] bg-[#0E1728] rounded-xl overflow-hidden shadow-lg">
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
              className={`p-3 transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-[#14223A] border-l-2 border-l-[#C6A15B]'
                  : 'hover:bg-[#14223A]/40'
              }`}
            >
              <div className="flex items-center justify-between text-[#A1A8B3] text-[11px] mb-0.5">
                <span className="font-medium text-[#F5F5F2] truncate">{spot.label}</span>
                <span className="text-[10px] text-[#A1A8B3] font-mono">{spot.unit}</span>
              </div>

              <div className="text-sm font-bold font-mono text-[#F5F5F2]">
                {price > 0 ? `₹${fmt(price)}` : '—'}
              </div>

              <div className="text-[10px] font-mono mt-0.5">
                <span className={isPos ? 'text-[#10B981] font-semibold' : 'text-[#EF4444] font-semibold'}>
                  {price > 0 ? `${isPos ? '+' : ''}${fmt(change)} (${changePct.toFixed(2)}%)` : 'Live Feed'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 3. Active Workstation (Split: Direct Order Pad + Depth) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-1">
        {/* Left Column: Direct Fast Order Placement Pad */}
        <div className="cendrix-card p-5 rounded-xl border border-[rgba(198,161,91,0.2)] flex flex-col justify-between space-y-4">
          <div>
            {/* Active Header & Live Tick */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#14223A]">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-lg font-bold tracking-wide text-[#F5F5F2]">
                    {activeCommodity.tradingsymbol}
                  </h2>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0F192B] text-[#C6A15B] border border-[rgba(198,161,91,0.25)] font-bold">
                    {activeCommodity.exchange}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0F192B] text-[#10B981] border border-emerald-500/25">
                    {activeSpec.lotDescription}
                  </span>
                </div>
                <p className="text-[11px] text-[#A1A8B3] mt-0.5">{activeCommodity.name}</p>
              </div>

              <div className="text-right font-mono">
                <div className="text-lg font-bold text-[#F5F5F2]">
                  {marketPrice > 0 ? `₹${fmt(marketPrice)}` : 'Live Price'}
                </div>
                {currentQuote && (
                  <div
                    className={`text-[11px] ${
                      currentQuote.change >= 0 ? 'text-[#10B981] font-medium' : 'text-[#EF4444] font-medium'
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
              <div className="mt-3 p-2.5 rounded-lg bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{feedback}</span>
              </div>
            )}

            {/* Quick Lot Selector */}
            <div className="mt-3.5 space-y-1.5">
              <label className="text-[10px] font-medium uppercase text-[#A1A8B3] font-mono tracking-wider">
                Quick Contract Lots
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 5, 10].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => handleLotsChange(l)}
                    className={`py-1.5 text-xs font-mono font-medium rounded-lg border transition-all ${
                      lots === l
                        ? 'btn-cendrix-gold font-bold text-[#070D18] shadow-[0_2px_8px_rgba(198,161,91,0.25)]'
                        : 'bg-[#0B1424] text-[#A1A8B3] border-[#14223A] hover:text-[#F5F5F2] hover:border-[rgba(198,161,91,0.2)]'
                    }`}
                  >
                    {l} Lot{l > 1 ? 's' : ''} ({l * activeSpec.lotSize} {activeSpec.unit})
                  </button>
                ))}
              </div>
            </div>

            {/* Product Type & Order Type Selection */}
            <div className="mt-3.5 grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-medium uppercase text-[#A1A8B3] font-mono tracking-wider block mb-1">
                  Product Type
                </label>
                <div className="grid grid-cols-2 gap-1.5 bg-[#0B1424] p-1 rounded-lg border border-[#14223A]">
                  <button
                    type="button"
                    onClick={() => setProduct('NRML')}
                    className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                      product === 'NRML' ? 'bg-[#C6A15B] text-[#070D18] font-bold shadow-sm' : 'text-[#A1A8B3] hover:text-[#F5F5F2]'
                    }`}
                  >
                    NRML
                  </button>
                  <button
                    type="button"
                    onClick={() => setProduct('MIS')}
                    className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                      product === 'MIS' ? 'bg-[#C6A15B] text-[#070D18] font-bold shadow-sm' : 'text-[#A1A8B3] hover:text-[#F5F5F2]'
                    }`}
                  >
                    MIS (5x)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-medium uppercase text-[#A1A8B3] font-mono tracking-wider block mb-1">
                  Order Type
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-[#0B1424] p-1 rounded-lg border border-[#14223A]">
                  {(['MARKET', 'LIMIT', 'SL'] as OrderType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setOrderType(t)}
                      className={`py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                        orderType === t ? 'bg-[#C6A15B] text-[#070D18] font-bold shadow-sm' : 'text-[#A1A8B3] hover:text-[#F5F5F2]'
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
                <div className="flex justify-between items-center mb-1 text-[10px] font-medium uppercase text-[#A1A8B3] font-mono">
                  <span>Quantity ({activeSpec.unit})</span>
                  <span className="text-[#C6A15B] font-mono font-semibold">{lots} Lot{lots > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center bg-[#0B1424] border border-[#14223A] rounded-lg">
                  <button
                    type="button"
                    onClick={() => handleLotsChange(lots - 1)}
                    className="px-3 py-1.5 text-sm font-bold text-[#A1A8B3] hover:text-[#C6A15B] hover:bg-[#14223A] rounded-l-lg transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    step="any"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(Number(e.target.value))}
                    className="w-full bg-transparent text-center font-mono font-bold text-[#F5F5F2] text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleLotsChange(lots + 1)}
                    className="px-3 py-1.5 text-sm font-bold text-[#A1A8B3] hover:text-[#C6A15B] hover:bg-[#14223A] rounded-r-lg transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Price / Limit Price */}
              <div>
                <label className="text-[10px] font-medium uppercase text-[#A1A8B3] font-mono block mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  step="any"
                  disabled={orderType === 'MARKET'}
                  value={orderType === 'MARKET' ? (marketPrice > 0 ? marketPrice : 'MARKET') : limitPrice}
                  onChange={(e) => setLimitPrice(Number(e.target.value))}
                  className="w-full bg-[#0B1424] border border-[#14223A] rounded-lg py-1.5 px-3 font-mono font-bold text-[#F5F5F2] text-xs focus:outline-none focus:border-[#C6A15B] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                />
              </div>
            </div>

            {/* Margin Requirement Summary */}
            <div className="mt-3.5 p-3 rounded-lg bg-[#0B1424] border border-[#14223A] flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-[#A1A8B3] block text-[10px] uppercase">Margin Required</span>
                <span className="font-bold text-[#E2C889] text-xs">₹{fmt(requiredMargin)}</span>
              </div>
              <div className="text-right">
                <span className="text-[#A1A8B3] block text-[10px] uppercase">Available Cash</span>
                <span className="font-bold text-[#F5F5F2] text-xs">₹{fmt(availableCash)}</span>
              </div>
            </div>

            {isInsufficientFunds && (
              <div className="mt-2 text-[11px] text-[#EF4444] flex items-center gap-1.5 font-medium">
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
                className="py-3 px-4 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs tracking-wide transition-all shadow-[0_4px_16px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>BUY {lots} LOT</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDirectOrder('SELL')}
                className="py-3 px-4 rounded-lg bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs tracking-wide transition-all shadow-[0_4px_16px_rgba(239,68,68,0.3)] flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>SELL {lots} LOT</span>
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => handleOpenModal(activeCommodity, 'BUY')}
                className="text-[11px] text-[#C6A15B] hover:text-[#E2C889] hover:underline font-medium transition-colors"
              >
                Open Full Order Ticket Modal →
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Level 2 Market Depth & Exact Specifications */}
        <div className="space-y-4">
          {/* Level 2 Order Depth */}
          <div className="cendrix-card p-4 rounded-xl border border-[rgba(198,161,91,0.2)]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#14223A]">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-[#C6A15B]" />
                <h3 className="font-serif text-xs font-bold text-[#F5F5F2] tracking-wide">Market Depth (5 Bid / 5 Ask)</h3>
              </div>
              <span className="text-[10px] text-[#10B981] font-mono bg-[#10B981]/15 px-2 py-0.5 rounded border border-[#10B981]/30 font-semibold">
                LIVE TICKS
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 font-mono text-[11px]">
              {/* Bid Column */}
              <div>
                <div className="flex justify-between text-[#6E7683] text-[10px] pb-1 border-b border-[#14223A] uppercase">
                  <span>Bid ₹</span>
                  <span>Orders</span>
                  <span>Qty</span>
                </div>
                <div className="space-y-1 mt-1.5 text-[#10B981]">
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
                        <div key={i} className="flex justify-between hover:bg-[#14223A]/40 px-1 py-0.5 rounded transition-colors">
                          <span className="font-semibold">{b.price.toFixed(2)}</span>
                          <span className="text-[#A1A8B3]">{b.orders || 1}</span>
                          <span className="text-[#F5F5F2]">{b.quantity}</span>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-4 text-[#A1A8B3] text-[10px]">Loading depth...</div>
                  )}
                </div>
              </div>

              {/* Ask Column */}
              <div>
                <div className="flex justify-between text-[#6E7683] text-[10px] pb-1 border-b border-[#14223A] uppercase">
                  <span>Ask ₹</span>
                  <span>Orders</span>
                  <span>Qty</span>
                </div>
                <div className="space-y-1 mt-1.5 text-[#EF4444]">
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
                        <div key={i} className="flex justify-between hover:bg-[#14223A]/40 px-1 py-0.5 rounded transition-colors">
                          <span className="font-semibold">{a.price.toFixed(2)}</span>
                          <span className="text-[#A1A8B3]">{a.orders || 1}</span>
                          <span className="text-[#F5F5F2]">{a.quantity}</span>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-4 text-[#A1A8B3] text-[10px]">Loading depth...</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Active Holding in Selected Commodity (if exists) */}
          {activeInstrumentPosition && (
            <div className="p-4 rounded-xl border border-[rgba(198,161,91,0.3)] bg-[#0E1728] flex items-center justify-between">
              {(() => {
                const activeAvgPrice = activeInstrumentPosition.quantity > 0 
                  ? activeInstrumentPosition.buy_price 
                  : activeInstrumentPosition.sell_price;
                return (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        activeInstrumentPosition.quantity > 0 ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30' : 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30'
                      }`}>
                        {activeInstrumentPosition.quantity > 0 ? 'LONG' : 'SHORT'}
                      </span>
                      <span className="font-bold text-[#F5F5F2]">
                        {Math.abs(activeInstrumentPosition.quantity)} {activeSpec.unit}
                      </span>
                      <span className="text-[#A1A8B3] text-[11px] font-mono">
                        @ ₹{fmt(activeAvgPrice)}
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-xs">
                      <span className="text-[#A1A8B3]">Unrealized P&L: </span>
                      <span className={`font-bold ${
                        (activeInstrumentPosition.unrealized_pnl || 0) >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
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
                className="px-3 py-1.5 rounded-lg bg-[#EF4444]/15 hover:bg-[#EF4444] text-[#EF4444] hover:text-white font-bold text-xs border border-[#EF4444]/30 transition-colors"
              >
                Square Off
              </button>
            </div>
          )}

          {/* Exact Zerodha Contract Specifications */}
          <div className="cendrix-card p-4 rounded-xl border border-[rgba(198,161,91,0.2)] text-xs space-y-2">
            <h4 className="text-[11px] font-semibold text-[#F5F5F2] uppercase mb-1 font-mono flex items-center justify-between border-b border-[#14223A] pb-2">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C6A15B]" />
                <span className="font-serif tracking-wide">Contract Specifications</span>
              </span>
              <span className="text-[#C6A15B]">{activeCommodity.exchange}</span>
            </h4>
            <div className="flex justify-between text-[#A1A8B3] py-0.5">
              <span>Lot Size:</span>
              <span className="font-mono text-[#F5F5F2] font-semibold">{activeSpec.lotDescription}</span>
            </div>
            <div className="flex justify-between text-[#A1A8B3] py-0.5">
              <span>Unit of Trading:</span>
              <span className="font-mono text-[#F5F5F2] font-semibold">{activeSpec.unit}</span>
            </div>
            <div className="flex justify-between text-[#A1A8B3] py-0.5">
              <span>Price Quotation:</span>
              <span className="font-mono text-[#F5F5F2] font-semibold">{activeSpec.pricePerUnit}</span>
            </div>
            <div className="flex justify-between text-[#A1A8B3] py-0.5">
              <span>Contract Expiry:</span>
              <span className="font-mono text-[#C6A15B] font-semibold">
                {activeCommodity.expiry || 'Monthly'}
              </span>
            </div>
            <div className="flex justify-between text-[#A1A8B3] py-0.5">
              <span>Margin Requirement:</span>
              <span className="font-mono text-[#10B981] font-semibold">~12% (NRML) / ~5% (MIS)</span>
            </div>
            <div className="flex justify-between text-[#A1A8B3] py-0.5">
              <span>Commodity Tax (CTT):</span>
              <span className="font-mono text-[#F5F5F2] font-semibold">0.01% on Sell side</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Open Commodity Positions Desk (if any) ────────────────────── */}
      {commodityPositions.length > 0 && (
        <div className="cendrix-card p-5 rounded-xl border border-[rgba(198,161,91,0.2)] mt-5">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="w-4 h-4 text-[#C6A15B]" />
            <h3 className="font-serif text-sm font-bold text-[#F5F5F2]">
              Open Commodity Positions ({commodityPositions.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-[#14223A] text-[10px] text-[#6E7683] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Contract</th>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3 text-right">Net Qty</th>
                  <th className="py-2.5 px-3 text-right">Avg Entry</th>
                  <th className="py-2.5 px-3 text-right">LTP</th>
                  <th className="py-2.5 px-3 text-right">P&L (MTM)</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#14223A]/50">
                {commodityPositions.map((pos) => {
                  const pnl = pos.unrealized_pnl || 0;
                  const isPos = pnl >= 0;
                  const avgEntry = pos.quantity > 0 ? pos.buy_price : pos.sell_price;
                  const ltp = pos.last_price || avgEntry;

                  return (
                    <tr key={pos.id} className="hover:bg-[#14223A]/40 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-[#F5F5F2] font-sans">{pos.tradingsymbol}</td>
                      <td className="py-2.5 px-3 text-[#C6A15B]">
                        <span className="px-1.5 py-0.5 rounded bg-[#0F192B] border border-[rgba(198,161,91,0.25)] text-[10px] font-bold">
                          {pos.product}
                        </span>
                      </td>
                      <td className={`py-2.5 px-3 text-right font-bold ${pos.quantity > 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {pos.quantity > 0 ? `+${pos.quantity}` : pos.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#A1A8B3]">₹{fmt(avgEntry)}</td>
                      <td className="py-2.5 px-3 text-right text-[#F5F5F2]">₹{fmt(ltp)}</td>
                      <td className={`py-2.5 px-3 text-right font-bold ${isPos ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {isPos ? '+' : ''}₹{fmt(pnl)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => closePosition(pos.id)}
                          className="px-2.5 py-1 rounded bg-[#EF4444]/15 hover:bg-[#EF4444] text-[#EF4444] hover:text-white font-bold text-[11px] border border-[#EF4444]/30 transition-colors"
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
      <div className="cendrix-card p-5 rounded-xl border border-[rgba(198,161,91,0.2)] mt-5">
        <div className="flex items-center justify-between mb-3 border-b border-[#14223A] pb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#C6A15B]" />
            <h3 className="font-serif text-sm font-bold text-[#F5F5F2]">
              MCX Commodity Scrips & Specifications
            </h3>
            <span className="text-[10px] text-[#A1A8B3] font-mono">
              ({filteredCommodities.length} Active)
            </span>
          </div>

          <span className="text-[11px] text-[#A1A8B3] font-mono hidden sm:inline">
            Click row to select for order execution · Exact contract specifications
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#14223A] text-[10px] text-[#6E7683] uppercase tracking-wider font-mono">
                <th className="py-2.5 px-3">Contract / Symbol</th>
                <th className="py-2.5 px-3">Segment</th>
                <th className="py-2.5 px-3">Lot Sizing</th>
                <th className="py-2.5 px-3">Expiry</th>
                <th className="py-2.5 px-3 text-right">LTP (₹)</th>
                <th className="py-2.5 px-3 text-right">Day Change</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#14223A]/50 font-mono">
              {filteredCommodities.map((c) => {
                const q = quotes[c.instrument_key] || quotes[c.tradingsymbol];
                const price = q ? q.last_price : 0;
                const change = q ? q.change : 0;
                const changePct = q ? q.change_percent : 0;
                const isPos = change >= 0;
                const isSelected = activeCommodity.instrument_key === c.instrument_key;
                const spec = getZerodhaContractSpec(c.tradingsymbol, c.instrument_type, c.exchange, c.lot_size);

                return (
                  <tr
                    key={c.instrument_key}
                    onClick={() => handleSelectCommodity(c)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#14223A]' : 'hover:bg-[#14223A]/40'
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-[#F5F5F2] text-xs font-sans">
                        {c.tradingsymbol}
                      </div>
                      <div className="text-[10px] text-[#A1A8B3] font-normal">{c.name}</div>
                    </td>

                    <td className="py-2.5 px-3 text-[#A1A8B3] font-sans text-[11px]">
                      {c.segment?.replace('COMMODITY_', '') || 'GENERAL'}
                    </td>

                    <td className="py-2.5 px-3 text-[#C6A15B] font-mono font-semibold">
                      {spec.lotDescription}
                    </td>

                    <td className="py-2.5 px-3 text-[#A1A8B3]">{c.expiry || '-'}</td>

                    <td className="py-2.5 px-3 text-right font-bold text-[#F5F5F2]">
                      {price > 0 ? `₹${fmt(price)}` : 'Live Price'}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      {price > 0 ? (
                        <span
                          className={`font-semibold ${isPos ? 'text-[#10B981]' : 'text-[#EF4444]'}`}
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
                        className="px-2.5 py-1 rounded-md bg-[#10B981]/15 hover:bg-[#10B981] text-[#10B981] hover:text-white text-[11px] font-bold border border-[#10B981]/30 transition-all"
                      >
                        BUY
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenModal(c, 'SELL')}
                        className="px-2.5 py-1 rounded-md bg-[#EF4444]/15 hover:bg-[#EF4444] text-[#EF4444] hover:text-white text-[11px] font-bold border border-[#EF4444]/30 transition-all"
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
