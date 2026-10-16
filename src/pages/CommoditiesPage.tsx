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
    <div className="w-full max-w-[1720px] mx-auto select-none font-sans text-xs text-[#f0f3f8] pb-12 space-y-4">
      {/* ── 1. Top Zerodha Header Strip ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[#1e2638]">
        <div>
          <div className="flex items-center gap-2 text-xs mb-1 font-mono">
            <span className="w-2 h-2 rounded-full bg-[#00c087] animate-pulse" />
            <span className="text-[#387ed1] font-semibold text-[11px]">MCX COMMODITIES DESK</span>
            <span className="text-[#1e2638]">|</span>
            <span className="text-[#788296] text-[11px]">EVENING SESSION ACTIVE (09:00 - 23:30 IST)</span>
          </div>
          <h1 className="text-xl font-medium text-[#f0f3f8] flex items-center gap-2">
            <span>Commodities</span>
            <span className="text-xs font-mono font-normal text-[#788296]">
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
              className={`pb-1 border-b-2 transition-all ${
                activeCategory === cat.id
                  ? 'border-[#387ed1] text-[#387ed1] font-semibold'
                  : 'border-transparent text-[#788296] hover:text-[#c4cbd4]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 2. Flat High-Density Spotlight Scrips Ticker Strip ───────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-y sm:divide-y-0 divide-[#1e2638] border border-[#1e2638] bg-[#0c1018]">
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
              className={`p-2.5 transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-[#151c2a] border-l-2 border-l-[#387ed1]'
                  : 'hover:bg-[#121722]'
              }`}
            >
              <div className="flex items-center justify-between text-[#788296] text-[11px] mb-0.5">
                <span className="font-medium text-[#c4cbd4] truncate">{spot.label}</span>
                <span className="text-[10px] text-[#58647a]">{spot.unit}</span>
              </div>

              <div className="text-sm font-bold font-mono text-[#f0f3f8]">
                {price > 0 ? `₹${fmt(price)}` : '—'}
              </div>

              <div className="text-[10px] font-mono mt-0.5">
                <span className={isPos ? 'text-[#00c087] font-semibold' : 'text-[#df514c] font-semibold'}>
                  {price > 0 ? `${isPos ? '+' : ''}${fmt(change)} (${changePct.toFixed(2)}%)` : 'Live Feed'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 3. Active Workstation (Flat 2-Column Split: Order Pad + Depth) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
        {/* Left Column: Direct Fast Order Placement Pad */}
        <div className="border border-[#1e2638] bg-[#0c1018] p-4 flex flex-col justify-between space-y-4">
          <div>
            {/* Active Header & Live Tick */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1e2638]">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-[#f0f3f8]">
                    {activeCommodity.tradingsymbol}
                  </h2>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#161d2c] text-[#387ed1] border border-[#1e2638] font-bold">
                    {activeCommodity.exchange}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#121820] text-[#00c087] border border-[#1e2638]">
                    {activeSpec.lotDescription}
                  </span>
                </div>
                <p className="text-[11px] text-[#788296] mt-0.5">{activeCommodity.name}</p>
              </div>

              <div className="text-right font-mono">
                <div className="text-base font-bold text-[#f0f3f8]">
                  {marketPrice > 0 ? `₹${fmt(marketPrice)}` : 'Live Price'}
                </div>
                {currentQuote && (
                  <div
                    className={`text-[11px] ${
                      currentQuote.change >= 0 ? 'text-[#00c087] font-medium' : 'text-[#df514c] font-medium'
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
              <div className="mt-3 p-2 rounded bg-[#00c087]/10 border border-[#00c087]/30 text-[#00c087] text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{feedback}</span>
              </div>
            )}

            {/* Quick Lot Selector */}
            <div className="mt-3 space-y-1">
              <label className="text-[10px] font-medium uppercase text-[#788296]">
                Quick Contract Lots
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 5, 10].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => handleLotsChange(l)}
                    className={`py-1 text-xs font-mono font-medium rounded border transition-colors ${
                      lots === l
                        ? 'bg-[#387ed1] text-white border-[#387ed1]'
                        : 'bg-[#121722] text-[#788296] border-[#1e2638] hover:text-[#f0f3f8]'
                    }`}
                  >
                    {l} Lot{l > 1 ? 's' : ''} ({l * activeSpec.lotSize} {activeSpec.unit})
                  </button>
                ))}
              </div>
            </div>

            {/* Product Type & Order Type Selection */}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-medium uppercase text-[#788296] block mb-1">
                  Product Type
                </label>
                <div className="grid grid-cols-2 gap-1 bg-[#121722] p-1 rounded border border-[#1e2638]">
                  <button
                    type="button"
                    onClick={() => setProduct('NRML')}
                    className={`py-1 text-xs font-medium rounded ${
                      product === 'NRML' ? 'bg-[#387ed1] text-white' : 'text-[#788296]'
                    }`}
                  >
                    NRML
                  </button>
                  <button
                    type="button"
                    onClick={() => setProduct('MIS')}
                    className={`py-1 text-xs font-medium rounded ${
                      product === 'MIS' ? 'bg-[#387ed1] text-white' : 'text-[#788296]'
                    }`}
                  >
                    MIS (5x)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-medium uppercase text-[#788296] block mb-1">
                  Order Type
                </label>
                <div className="grid grid-cols-3 gap-1 bg-[#121722] p-1 rounded border border-[#1e2638]">
                  {(['MARKET', 'LIMIT', 'SL'] as OrderType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setOrderType(t)}
                      className={`py-1 text-[11px] font-medium rounded ${
                        orderType === t ? 'bg-[#387ed1] text-white' : 'text-[#788296]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quantity and Price Fields */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Quantity Counter */}
              <div>
                <div className="flex justify-between items-center mb-1 text-[10px] font-medium uppercase text-[#788296]">
                  <span>Quantity ({activeSpec.unit})</span>
                  <span className="text-[#387ed1] font-mono">{lots} Lot{lots > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center bg-[#121722] border border-[#1e2638] rounded">
                  <button
                    type="button"
                    onClick={() => handleLotsChange(lots - 1)}
                    className="px-3 py-1 text-sm font-bold text-[#788296] hover:text-[#f0f3f8] hover:bg-[#1a2235]"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    step="any"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(Number(e.target.value))}
                    className="w-full bg-transparent text-center font-mono font-bold text-[#f0f3f8] text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleLotsChange(lots + 1)}
                    className="px-3 py-1 text-sm font-bold text-[#788296] hover:text-[#f0f3f8] hover:bg-[#1a2235]"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Price / Limit Price */}
              <div>
                <label className="text-[10px] font-medium uppercase text-[#788296] block mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  step="any"
                  disabled={orderType === 'MARKET'}
                  value={orderType === 'MARKET' ? (marketPrice > 0 ? marketPrice : 'MARKET') : limitPrice}
                  onChange={(e) => setLimitPrice(Number(e.target.value))}
                  className="w-full bg-[#121722] border border-[#1e2638] rounded py-1 px-3 font-mono font-bold text-[#f0f3f8] text-xs focus:outline-none focus:border-[#387ed1] disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Margin Requirement Summary */}
            <div className="mt-3 p-2.5 rounded bg-[#121722] border border-[#1e2638] flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-[#788296] block text-[10px] uppercase">Margin Required</span>
                <span className="font-bold text-[#00c087] text-xs">₹{fmt(requiredMargin)}</span>
              </div>
              <div className="text-right">
                <span className="text-[#788296] block text-[10px] uppercase">Available Cash</span>
                <span className="font-bold text-[#f0f3f8] text-xs">₹{fmt(availableCash)}</span>
              </div>
            </div>

            {isInsufficientFunds && (
              <div className="mt-2 text-[11px] text-[#df514c] flex items-center gap-1.5 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Insufficient funds for this trade. Available: ₹{fmt(availableCash)}</span>
              </div>
            )}
          </div>

          {/* Action Execution Buttons */}
          <div className="space-y-2 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isSubmitting || isInsufficientFunds}
                onClick={() => handleDirectOrder('BUY')}
                className="py-2.5 px-4 rounded bg-[#387ed1] hover:bg-[#2e6bb5] active:bg-[#255896] text-white font-bold text-xs tracking-wide transition-all shadow flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>BUY {lots} LOT</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDirectOrder('SELL')}
                className="py-2.5 px-4 rounded bg-[#df514c] hover:bg-[#c93f3a] active:bg-[#a8332f] text-white font-bold text-xs tracking-wide transition-all shadow flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>SELL {lots} LOT</span>
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => handleOpenModal(activeCommodity, 'BUY')}
                className="text-[11px] text-[#387ed1] hover:underline font-medium"
              >
                Open Full Zerodha Kite Order Ticket Modal →
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Level 2 Market Depth & Exact Specifications */}
        <div className="space-y-4">
          {/* Level 2 Order Depth */}
          <div className="border border-[#1e2638] bg-[#0c1018] p-3.5">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1e2638]">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-[#387ed1]" />
                <h3 className="text-xs font-semibold text-[#f0f3f8]">Market Depth (5 Bid / 5 Ask)</h3>
              </div>
              <span className="text-[10px] text-[#00c087] font-mono bg-[#00c087]/10 px-1.5 py-0.5 rounded">
                LIVE TICKS
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 font-mono text-[11px]">
              {/* Bid Column */}
              <div>
                <div className="flex justify-between text-[#788296] text-[10px] pb-1 border-b border-[#1e2638] uppercase">
                  <span>Bid ₹</span>
                  <span>Orders</span>
                  <span>Qty</span>
                </div>
                <div className="space-y-1 mt-1 text-[#00c087]">
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
                        <div key={i} className="flex justify-between hover:bg-[#121722] px-1 py-0.5 rounded">
                          <span className="font-semibold">{b.price.toFixed(2)}</span>
                          <span className="text-[#788296]">{b.orders || 1}</span>
                          <span className="text-[#c4cbd4]">{b.quantity}</span>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-4 text-[#58647a] text-[10px]">Loading depth...</div>
                  )}
                </div>
              </div>

              {/* Ask Column */}
              <div>
                <div className="flex justify-between text-[#788296] text-[10px] pb-1 border-b border-[#1e2638] uppercase">
                  <span>Ask ₹</span>
                  <span>Orders</span>
                  <span>Qty</span>
                </div>
                <div className="space-y-1 mt-1 text-[#df514c]">
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
                        <div key={i} className="flex justify-between hover:bg-[#121722] px-1 py-0.5 rounded">
                          <span className="font-semibold">{a.price.toFixed(2)}</span>
                          <span className="text-[#788296]">{a.orders || 1}</span>
                          <span className="text-[#c4cbd4]">{a.quantity}</span>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-4 text-[#58647a] text-[10px]">Loading depth...</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Active Holding in Selected Commodity (if exists) */}
          {activeInstrumentPosition && (
            <div className="p-3 border border-[#387ed1]/40 bg-[#121722] flex items-center justify-between">
              {(() => {
                const activeAvgPrice = activeInstrumentPosition.quantity > 0 
                  ? activeInstrumentPosition.buy_price 
                  : activeInstrumentPosition.sell_price;
                return (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        activeInstrumentPosition.quantity > 0 ? 'bg-[#00c087]/20 text-[#00c087]' : 'bg-[#df514c]/20 text-[#df514c]'
                      }`}>
                        {activeInstrumentPosition.quantity > 0 ? 'LONG' : 'SHORT'}
                      </span>
                      <span className="font-bold text-[#f0f3f8]">
                        {Math.abs(activeInstrumentPosition.quantity)} {activeSpec.unit}
                      </span>
                      <span className="text-[#788296] text-[11px]">
                        @ ₹{fmt(activeAvgPrice)}
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-xs">
                      <span className="text-[#788296]">Unrealized P&L: </span>
                      <span className={`font-bold ${
                        (activeInstrumentPosition.unrealized_pnl || 0) >= 0 ? 'text-[#00c087]' : 'text-[#df514c]'
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
                className="px-2.5 py-1 rounded bg-[#df514c]/15 hover:bg-[#df514c] text-[#df514c] hover:text-white font-medium text-xs border border-[#df514c]/30 transition-colors"
              >
                Exit
              </button>
            </div>
          )}

          {/* Exact Zerodha Contract Specifications */}
          <div className="border border-[#1e2638] bg-[#0c1018] p-3 text-xs space-y-2">
            <h4 className="text-[11px] font-medium text-[#f0f3f8] uppercase mb-1 font-mono flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#387ed1]" />
                <span>Zerodha Contract Specifications</span>
              </span>
              <span className="text-[#387ed1]">{activeCommodity.exchange}</span>
            </h4>
            <div className="flex justify-between text-[#788296]">
              <span>Lot Size:</span>
              <span className="font-mono text-[#f0f3f8] font-medium">{activeSpec.lotDescription}</span>
            </div>
            <div className="flex justify-between text-[#788296]">
              <span>Unit of Trading:</span>
              <span className="font-mono text-[#f0f3f8] font-medium">{activeSpec.unit}</span>
            </div>
            <div className="flex justify-between text-[#788296]">
              <span>Price Quotation:</span>
              <span className="font-mono text-[#f0f3f8] font-medium">{activeSpec.pricePerUnit}</span>
            </div>
            <div className="flex justify-between text-[#788296]">
              <span>Contract Expiry:</span>
              <span className="font-mono text-[#387ed1] font-medium">
                {activeCommodity.expiry || 'Monthly'}
              </span>
            </div>
            <div className="flex justify-between text-[#788296]">
              <span>Margin Requirement:</span>
              <span className="font-mono text-[#00c087] font-medium">~12% (NRML) / ~5% (MIS)</span>
            </div>
            <div className="flex justify-between text-[#788296]">
              <span>Commodity Tax (CTT):</span>
              <span className="font-mono text-[#f0f3f8] font-medium">0.01% on Sell side</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Open Commodity Positions Desk (if any) ────────────────────── */}
      {commodityPositions.length > 0 && (
        <div className="border-t border-[#1e2638] pt-4 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-4 h-4 text-[#387ed1]" />
            <h3 className="text-sm font-medium text-[#f0f3f8]">
              Open Commodity Positions ({commodityPositions.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-[#1e2638] text-[11px] text-[#788296]">
                  <th className="py-2 px-3">Contract</th>
                  <th className="py-2 px-3">Product</th>
                  <th className="py-2 px-3 text-right">Net Qty</th>
                  <th className="py-2 px-3 text-right">Avg Entry</th>
                  <th className="py-2 px-3 text-right">LTP</th>
                  <th className="py-2 px-3 text-right">P&L (MTM)</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2638]/60">
                {commodityPositions.map((pos) => {
                  const pnl = pos.unrealized_pnl || 0;
                  const isPos = pnl >= 0;
                  const avgEntry = pos.quantity > 0 ? pos.buy_price : pos.sell_price;
                  const ltp = pos.last_price || avgEntry;

                  return (
                    <tr key={pos.id} className="hover:bg-[#121722]">
                      <td className="py-2.5 px-3 font-medium text-[#f0f3f8]">{pos.tradingsymbol}</td>
                      <td className="py-2.5 px-3 text-[#387ed1]">{pos.product}</td>
                      <td className={`py-2.5 px-3 text-right font-medium ${pos.quantity > 0 ? 'text-[#00c087]' : 'text-[#df514c]'}`}>
                        {pos.quantity > 0 ? `+${pos.quantity}` : pos.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#788296]">₹{fmt(avgEntry)}</td>
                      <td className="py-2.5 px-3 text-right text-[#f0f3f8]">₹{fmt(ltp)}</td>
                      <td className={`py-2.5 px-3 text-right font-semibold ${isPos ? 'text-[#00c087]' : 'text-[#df514c]'}`}>
                        {isPos ? '+' : ''}₹{fmt(pnl)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => closePosition(pos.id)}
                          className="px-2 py-0.5 rounded bg-[#df514c]/15 hover:bg-[#df514c] text-[#df514c] hover:text-white font-medium text-[11px] border border-[#df514c]/30 transition-colors"
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
      <div className="border-t border-[#1e2638] pt-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#387ed1]" />
            <h3 className="text-sm font-medium text-[#f0f3f8]">
              MCX Commodity Scrips & Lot Specifications
            </h3>
            <span className="text-[10px] text-[#788296] font-mono">
              ({filteredCommodities.length} Active)
            </span>
          </div>

          <span className="text-[11px] text-[#58647a] font-mono hidden sm:inline">
            Click row to select for order execution · Exact Zerodha lot sizes shown
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1e2638] text-[11px] text-[#788296] font-mono">
                <th className="py-2 px-3">Contract / Symbol</th>
                <th className="py-2 px-3">Segment</th>
                <th className="py-2 px-3">Zerodha Lot Size</th>
                <th className="py-2 px-3">Expiry</th>
                <th className="py-2 px-3 text-right">LTP (₹)</th>
                <th className="py-2 px-3 text-right">Day Change</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2638]/60 font-mono">
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
                      isSelected ? 'bg-[#151c2a]' : 'hover:bg-[#121722]'
                    }`}
                  >
                    <td className="py-2 px-3">
                      <div className="font-medium text-[#f0f3f8] text-xs font-sans">
                        {c.tradingsymbol}
                      </div>
                      <div className="text-[10px] text-[#58647a] font-normal">{c.name}</div>
                    </td>

                    <td className="py-2 px-3 text-[#788296] font-sans text-[11px]">
                      {c.segment?.replace('COMMODITY_', '') || 'GENERAL'}
                    </td>

                    <td className="py-2 px-3 text-[#387ed1] font-mono font-medium">
                      {spec.lotDescription}
                    </td>

                    <td className="py-2 px-3 text-[#788296]">{c.expiry || '-'}</td>

                    <td className="py-2 px-3 text-right font-medium text-[#f0f3f8]">
                      {price > 0 ? `₹${fmt(price)}` : 'Live Price'}
                    </td>

                    <td className="py-2 px-3 text-right">
                      {price > 0 ? (
                        <span
                          className={`font-medium ${isPos ? 'text-[#00c087]' : 'text-[#df514c]'}`}
                        >
                          {isPos ? '+' : ''}{fmt(change)} ({changePct.toFixed(2)}%)
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>

                    <td className="py-2 px-3 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleOpenModal(c, 'BUY')}
                        className="px-2 py-0.5 rounded bg-[#387ed1]/15 hover:bg-[#387ed1] text-[#387ed1] hover:text-white text-[11px] font-medium border border-[#387ed1]/30 transition-colors"
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenModal(c, 'SELL')}
                        className="px-2 py-0.5 rounded bg-[#df514c]/15 hover:bg-[#df514c] text-[#df514c] hover:text-white text-[11px] font-medium border border-[#df514c]/30 transition-colors"
                      >
                        S
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
