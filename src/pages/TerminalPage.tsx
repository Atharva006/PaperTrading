import React, { useState, useEffect } from 'react';
import { useTradingStore } from '../store/useTradingStore';
import { INDIAN_INSTRUMENTS_MASTER, getExchangeContractSpec } from '../services/market/indianInstruments';
import { FinancialCalculations } from '../services/trading/FinancialCalculations';
import type { OrderType, ProductType, TransactionType } from '../types/trading';
import {
  Activity,
  Briefcase,
  CheckCircle2,
  Minus,
  Plus,
  ShieldCheck,
} from 'lucide-react';

export default function TerminalPage() {
  const {
    selectedInstrument,
    setSelectedInstrument,
    quotes,
    placeOrder,
    positions,
    closePosition,
    account,
  } = useTradingStore();

  const quote = quotes[selectedInstrument.instrument_key] || quotes[selectedInstrument.tradingsymbol];
  const depth = quote?.depth;
  const marketPrice = quote && quote.last_price > 0 ? quote.last_price : 0;

  const contractSpec = getExchangeContractSpec(
    selectedInstrument.tradingsymbol,
    selectedInstrument.instrument_type,
    selectedInstrument.exchange,
    selectedInstrument.lot_size
  );

  const isCommodity =
    selectedInstrument.instrument_type === 'COMMODITY' ||
    selectedInstrument.instrument_type === 'FUTCOM' ||
    selectedInstrument.exchange === 'MCX' ||
    selectedInstrument.exchange === 'NCDEX';

  const isFandO =
    selectedInstrument.instrument_type.startsWith('FUT') ||
    selectedInstrument.instrument_type.startsWith('OPT') ||
    isCommodity;

  const defaultProduct: ProductType = isFandO ? 'NRML' : 'CNC';

  // Order Pad State
  const [transactionType, setTransactionType] = useState<TransactionType>('BUY');
  const [product, setProduct] = useState<ProductType>(defaultProduct);
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [lots, setLots] = useState(1);
  const [quantity, setQuantity] = useState(contractSpec.lotSize);
  const [price, setPrice] = useState(marketPrice);
  const [triggerPrice, setTriggerPrice] = useState(marketPrice);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderFeedback, setOrderFeedback] = useState<string | null>(null);

  useEffect(() => {
    setLots(1);
    setQuantity(contractSpec.lotSize);
    setProduct(isFandO ? 'NRML' : 'CNC');
    if (marketPrice > 0) {
      setPrice(marketPrice);
      setTriggerPrice(marketPrice);
    }
  }, [selectedInstrument.instrument_key, contractSpec.lotSize, isFandO]);

  useEffect(() => {
    if (marketPrice > 0 && price === 0) {
      setPrice(marketPrice);
      setTriggerPrice(marketPrice);
    }
  }, [marketPrice]);

  const handleLotsChange = (newLots: number) => {
    const validLots = Math.max(1, newLots);
    setLots(validLots);
    setQuantity(validLots * contractSpec.lotSize);
  };

  const handleQuantityChange = (newQty: number) => {
    const validQty = Math.max(1, newQty);
    setQuantity(validQty);
    if (contractSpec.lotSize > 1) {
      setLots(Math.max(1, Math.round(validQty / contractSpec.lotSize)));
    }
  };

  const effectivePrice = orderType === 'MARKET' ? marketPrice : price;

  const requiredMargin = FinancialCalculations.calculateRequiredMargin({
    instrumentType: selectedInstrument.instrument_type,
    product,
    transactionType,
    quantity,
    price: effectivePrice,
    multiplier: contractSpec.multiplier,
  });

  const availableCash = account?.cash_balance ?? 0;
  const isInsufficientFunds = requiredMargin > availableCash;

  const handleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (effectivePrice <= 0) {
      setOrderFeedback('Error: Market price is unavailable. Set a limit price.');
      setTimeout(() => setOrderFeedback(null), 4000);
      return;
    }

    if (isInsufficientFunds) {
      setOrderFeedback(`Insufficient virtual margin: Need ₹${requiredMargin.toLocaleString('en-IN')}`);
      setTimeout(() => setOrderFeedback(null), 4000);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await placeOrder({
        instrument_key: selectedInstrument.instrument_key,
        tradingsymbol: selectedInstrument.tradingsymbol,
        exchange: selectedInstrument.exchange,
        instrument_type: selectedInstrument.instrument_type,
        transaction_type: transactionType,
        product,
        order_type: orderType,
        quantity,
        price: orderType === 'MARKET' ? 0 : price,
        trigger_price: orderType === 'SL' || orderType === 'SL_M' ? triggerPrice : 0,
        lot_size: contractSpec.lotSize,
      });

      if (res.status === 'REJECTED') {
        setOrderFeedback(`Order Rejected: ${res.rejection_reason || 'Exchange margin rejection'}`);
      } else {
        setOrderFeedback(`Order ${res.status}: ${transactionType} ${quantity} ${selectedInstrument.tradingsymbol} executed.`);
      }
    } catch (err: any) {
      setOrderFeedback(`Failed to place order: ${err?.message || 'Network error'}`);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setOrderFeedback(null), 4000);
    }
  };

  const instrumentPositions = positions.filter(
    (p) => !p.is_closed && p.quantity !== 0 && p.instrument_key === selectedInstrument.instrument_key
  );

  const quickChips = [
    { key: 'NSE_INDEX|Nifty 50', symbol: 'NIFTY 50' },
    { key: 'NSE_INDEX|Nifty Bank', symbol: 'BANK NIFTY' },
    { key: 'BSE_INDEX|SENSEX', symbol: 'SENSEX' },
    { key: 'NSE_EQ|INE081A01020', symbol: 'TATASTEEL' },
    { key: 'NSE_EQ|INE002A01018', symbol: 'RELIANCE' },
    { key: 'MCX_FO|571445', symbol: 'MCX GOLDM' },
    { key: 'MCX_FO|569900', symbol: 'MCX CRUDE' },
  ];

  return (
    <div className="w-full max-w-full mx-auto select-none font-sans text-xs text-[#111114] pb-12 space-y-5">
      {/* ── 1. Top Instrument Selector & Live Ticker ───────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#D9E2F2]">
        {/* Selector & Chips */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedInstrument.instrument_key}
            onChange={(e) => {
              const inst = INDIAN_INSTRUMENTS_MASTER.find((i) => i.instrument_key === e.target.value);
              if (inst) {
                setSelectedInstrument(inst);
                const spec = getExchangeContractSpec(inst.tradingsymbol, inst.instrument_type, inst.exchange, inst.lot_size);
                setQuantity(spec.lotSize);
                setLots(1);
              }
            }}
            className="bg-white border border-[#D9E2F2] text-xs font-semibold text-[#00225A] rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#536CF0] cursor-pointer shadow-sm"
          >
            {INDIAN_INSTRUMENTS_MASTER.map((i) => (
              <option key={i.instrument_key} value={i.instrument_key} className="bg-white text-[#111114]">
                {i.tradingsymbol} ({i.exchange} · {i.instrument_type})
              </option>
            ))}
          </select>

          {/* Quick Select Chips */}
          <div className="hidden sm:flex items-center">
            <div className="bg-[#F7F8FA] border border-[#D9E2F2] p-1 rounded-xl inline-flex gap-1">
              {quickChips.map((chip) => {
                const active = selectedInstrument.instrument_key === chip.key;
                return (
                  <button
                    key={chip.key}
                    onClick={() => {
                      const inst = INDIAN_INSTRUMENTS_MASTER.find((i) => i.instrument_key === chip.key);
                      if (inst) {
                        setSelectedInstrument(inst);
                        const spec = getExchangeContractSpec(inst.tradingsymbol, inst.instrument_type, inst.exchange, inst.lot_size);
                        setQuantity(spec.lotSize);
                        setLots(1);
                      }
                    }}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      active
                        ? 'bg-white text-[#00225A] shadow-sm font-bold border border-[#D9E2F2]'
                        : 'text-[#6B7A90] hover:text-[#00225A]'
                    }`}
                  >
                    {chip.symbol}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Quote Price Tag */}
          {quote && (
            <div className="flex items-center gap-2.5 pl-3 border-l border-[#D9E2F2]">
              <span className="text-lg font-mono font-bold text-[#111114] tabular-nums tracking-tight">
                ₹{quote.last_price.toFixed(2)}
              </span>
              <span
                className={`text-xs font-mono font-medium tabular-nums ${
                  quote.change >= 0 ? 'text-[#12B76A]' : 'text-[#D92D20]'
                }`}
              >
                {quote.change >= 0 ? '+' : ''}
                {quote.change.toFixed(2)} ({quote.change_percent.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>

        {/* Right: Contract Spec Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#00225A] bg-[#EEF3FF] px-3 py-1.5 rounded-xl border border-[#D9E2F2] font-semibold shadow-sm">
            {contractSpec.lotDescription}
          </span>
        </div>
      </div>

      {/* Feedback banner */}
      {orderFeedback && (
        <div className="p-3 bg-[#12B76A]/10 border border-[#12B76A]/30 rounded-2xl text-xs font-medium text-[#12B76A] flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{orderFeedback}</span>
        </div>
      )}

      {/* ── 2. Main Order Terminal Layout (Order Pad + Depth) ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Dedicated Fast Order Placement Pad */}
        <div className="bg-white p-6 rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)] flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#D9E2F2]">
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold text-[#00225A]">Direct Order Ticket</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EEF3FF] text-[#00225A] border border-[#D9E2F2] font-bold">
                {selectedInstrument.exchange}
              </span>
            </div>
            <span className="text-xs font-mono text-[#6B7A90] tabular-nums">
              LTP: <strong className="text-[#111114]">₹{marketPrice.toFixed(2)}</strong>
            </span>
          </div>

          <form onSubmit={handleDirectSubmit} noValidate className="space-y-4">
            {/* BUY / SELL Switcher */}
            <div className="bg-[#F7F8FA] border border-[#D9E2F2] p-1 rounded-xl grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setTransactionType('BUY')}
                className={`py-2 text-xs font-bold rounded-lg transition-all active:scale-[0.97] cursor-pointer ${
                  transactionType === 'BUY'
                    ? 'bg-[#12B76A] text-white shadow-sm'
                    : 'text-[#6B7A90] hover:text-[#00225A]'
                }`}
              >
                BUY
              </button>
              <button
                type="button"
                onClick={() => setTransactionType('SELL')}
                className={`py-2 text-xs font-bold rounded-lg transition-all active:scale-[0.97] cursor-pointer ${
                  transactionType === 'SELL'
                    ? 'bg-[#D92D20] text-white shadow-sm'
                    : 'text-[#6B7A90] hover:text-[#00225A]'
                }`}
              >
                SELL
              </button>
            </div>

            {/* Product Type (MIS vs CNC / NRML) */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-[#6B7A90] uppercase font-semibold font-mono tracking-wider">Product Type</span>
              <div className="grid grid-cols-2 gap-2.5">
                <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  product === (isFandO ? 'NRML' : 'CNC') ? 'bg-[#EEF3FF] border-[#00225A] text-[#00225A] shadow-sm' : 'bg-[#F7F8FA] border-[#D9E2F2] text-[#6B7A90] hover:border-[#536CF0]/40'
                }`}>
                  <input
                    type="radio"
                    name="terminal_product"
                    checked={product === (isFandO ? 'NRML' : 'CNC')}
                    onChange={() => setProduct(isFandO ? 'NRML' : 'CNC')}
                    className="accent-[#00225A]"
                  />
                  <div>
                    <span className="font-bold text-xs block text-[#00225A]">{isFandO ? 'NRML' : 'CNC'}</span>
                    <span className="text-[10px] text-[#6B7A90]">{isFandO ? 'Carryforward' : 'Longterm Delivery'}</span>
                  </div>
                </label>

                <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all active:scale-[0.98] ${
                  product === 'MIS' ? 'bg-[#EEF3FF] border-[#00225A] text-[#00225A] shadow-sm' : 'bg-[#F7F8FA] border-[#D9E2F2] text-[#6B7A90] hover:border-[#536CF0]/40'
                }`}>
                  <input
                    type="radio"
                    name="terminal_product"
                    checked={product === 'MIS'}
                    onChange={() => setProduct('MIS')}
                    className="accent-[#00225A]"
                  />
                  <div>
                    <span className="font-bold text-xs block text-[#00225A]">MIS</span>
                    <span className="text-[10px] text-[#6B7A90]">Intraday (5x)</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Lots & Quantity Sizing */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#6B7A90] uppercase font-semibold font-mono tracking-wider">Quantity</span>
                <span className="font-mono text-[#00225A] font-semibold">{contractSpec.lotDescription}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {contractSpec.lotSize > 1 ? (
                  <div>
                    <label className="block text-[10px] text-[#6B7A90] mb-1 font-mono">Lots</label>
                    <div className="flex items-center border border-[#D9E2F2] rounded-xl bg-[#F7F8FA] p-0.5">
                      <button
                        type="button"
                        onClick={() => handleLotsChange(lots - 1)}
                        className="px-3 py-1.5 text-[#6B7A90] hover:text-[#00225A] hover:bg-white rounded-lg active:scale-[0.90] transition-all cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        value={lots}
                        onChange={(e) => handleLotsChange(parseInt(e.target.value) || 1)}
                        className="w-full bg-transparent text-center font-mono font-bold text-[#111114] text-xs focus:outline-none tabular-nums"
                      />
                      <button
                        type="button"
                        onClick={() => handleLotsChange(lots + 1)}
                        className="px-3 py-1.5 text-[#6B7A90] hover:text-[#00225A] hover:bg-white rounded-lg active:scale-[0.90] transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className={contractSpec.lotSize > 1 ? '' : 'col-span-2'}>
                  <label className="block text-[10px] text-[#6B7A90] mb-1 font-mono">
                    Total {contractSpec.unit}
                  </label>
                  <div className="flex items-center border border-[#D9E2F2] rounded-xl bg-[#F7F8FA] px-3 py-1.5">
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      className="w-full bg-transparent font-mono font-bold text-[#111114] text-xs focus:outline-none tabular-nums"
                    />
                    <span className="text-[11px] font-mono text-[#00225A] shrink-0 ml-1 font-semibold">
                      {contractSpec.unit}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Price & Order Type */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-[#6B7A90] uppercase font-semibold font-mono tracking-wider">Order Execution Type</span>
              <div className="bg-[#F7F8FA] border border-[#D9E2F2] p-1 rounded-xl grid grid-cols-4 gap-1">
                {(['MARKET', 'LIMIT', 'SL', 'SL_M'] as OrderType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setOrderType(type)}
                    className={`py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                      orderType === type
                        ? 'bg-white text-[#00225A] font-bold shadow-sm border border-[#D9E2F2]'
                        : 'text-[#6B7A90] hover:text-[#00225A]'
                    }`}
                  >
                    {type === 'SL_M' ? 'SL-M' : type}
                  </button>
                ))}
              </div>
            </div>

            {orderType !== 'MARKET' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#6B7A90] mb-1 font-mono">Limit Price</label>
                  <input
                    type="number"
                    step="any"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl px-3 py-1.5 font-mono text-xs text-[#111114] focus:outline-none focus:border-[#00225A] transition-colors tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#6B7A90] mb-1 font-mono">Trigger Price</label>
                  <input
                    type="number"
                    step="any"
                    disabled={orderType !== 'SL' && orderType !== 'SL_M'}
                    value={triggerPrice}
                    onChange={(e) => setTriggerPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl px-3 py-1.5 font-mono text-xs text-[#111114] focus:outline-none focus:border-[#00225A] disabled:opacity-40 transition-colors tabular-nums"
                  />
                </div>
              </div>
            )}

            {/* Margin Calculation Telemetry */}
            <div className="p-3.5 bg-[#F7F8FA] rounded-xl border border-[#D9E2F2] flex items-center justify-between text-xs font-mono tabular-nums">
              <div>
                <span className="text-[#6B7A90] block text-[10px]">Margin Required</span>
                <span className="font-bold text-[#00225A]">₹{requiredMargin.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="text-right">
                <span className="text-[#6B7A90] block text-[10px]">Available Cash</span>
                <span className="font-bold text-[#111114]">₹{availableCash.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isInsufficientFunds}
              className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-[0.97] cursor-pointer ${
                isInsufficientFunds
                  ? 'bg-[#F7F8FA] text-[#6B7A90] border border-[#D9E2F2] cursor-not-allowed'
                  : transactionType === 'BUY'
                  ? 'bg-[#12B76A] hover:brightness-105 text-white shadow-sm'
                  : 'bg-[#D92D20] hover:brightness-105 text-white shadow-sm'
              }`}
            >
              {isSubmitting ? 'Executing Order...' : isInsufficientFunds ? 'Insufficient Available Margin' : `Execute ${transactionType} Order`}
            </button>
          </form>
        </div>

        {/* Right: Level 2 Market Depth & Contract Specifications */}
        <div className="space-y-4">
          {/* Level 2 Depth */}
          <div className="bg-white p-5 rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)] space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#D9E2F2]">
              <h3 className="text-xs font-semibold text-[#00225A] uppercase font-mono tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#536CF0]" />
                <span>Level 2 Market Depth</span>
              </h3>
              <span className="text-[10px] text-[#00225A] font-mono bg-[#EEF3FF] border border-[#D9E2F2] px-2.5 py-0.5 rounded-full font-bold">
                5 BID / 5 ASK
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[11px] font-mono tabular-nums">
              {/* Buy Bids */}
              <div>
                <div className="flex justify-between text-[#6B7A90] text-[10px] pb-1 border-b border-[#D9E2F2] uppercase font-mono">
                  <span>Bid ₹</span>
                  <span>Orders</span>
                </div>
                <div className="space-y-1 mt-1.5 text-[#12B76A]">
                  {(
                    depth?.buy || [
                      { price: marketPrice - 0.05, quantity: 1500 },
                      { price: marketPrice - 0.10, quantity: 2400 },
                      { price: marketPrice - 0.15, quantity: 3800 },
                      { price: marketPrice - 0.20, quantity: 5100 },
                      { price: marketPrice - 0.25, quantity: 8200 },
                    ]
                  )
                    .slice(0, 5)
                    .map((b, i) => (
                      <div key={i} className="flex justify-between hover:bg-[#F7F8FA] px-1.5 py-0.5 rounded-lg transition-colors">
                        <span className="font-semibold">{b.price.toFixed(2)}</span>
                        <span className="text-[#6B7A90]">{b.quantity}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Sell Asks */}
              <div>
                <div className="flex justify-between text-[#6B7A90] text-[10px] pb-1 border-b border-[#D9E2F2] uppercase font-mono">
                  <span>Ask ₹</span>
                  <span>Orders</span>
                </div>
                <div className="space-y-1 mt-1.5 text-[#D92D20]">
                  {(
                    depth?.sell || [
                      { price: marketPrice + 0.05, quantity: 1200 },
                      { price: marketPrice + 0.10, quantity: 2100 },
                      { price: marketPrice + 0.15, quantity: 3500 },
                      { price: marketPrice + 0.20, quantity: 4900 },
                      { price: marketPrice + 0.25, quantity: 7600 },
                    ]
                  )
                    .slice(0, 5)
                    .map((a, i) => (
                      <div key={i} className="flex justify-between hover:bg-[#F7F8FA] px-1.5 py-0.5 rounded-lg transition-colors">
                        <span className="font-semibold">{a.price.toFixed(2)}</span>
                        <span className="text-[#6B7A90]">{a.quantity}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contract Specifications */}
          <div className="bg-white p-5 rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)] text-xs space-y-2.5">
            <h3 className="text-[11px] font-semibold text-[#00225A] uppercase mb-1 flex items-center justify-between font-mono tracking-wider">
              <span>Contract Specifications</span>
              <span className="text-[#536CF0] font-mono font-bold">{selectedInstrument.exchange}</span>
            </h3>
            <div className="flex justify-between text-[#6B7A90] py-1 border-b border-[#D9E2F2]/60 font-mono text-[11px]">
              <span>Lot Specification:</span>
              <span className="text-[#00225A] font-semibold">{contractSpec.lotDescription}</span>
            </div>
            <div className="flex justify-between text-[#6B7A90] py-1 border-b border-[#D9E2F2]/60 font-mono text-[11px]">
              <span>Lot Size:</span>
              <span className="text-[#111114] font-semibold">{contractSpec.lotSize} {contractSpec.unit}</span>
            </div>
            <div className="flex justify-between text-[#6B7A90] py-1 border-b border-[#D9E2F2]/60 font-mono text-[11px]">
              <span>Quoted In:</span>
              <span className="text-[#111114] font-semibold">{contractSpec.pricePerUnit}</span>
            </div>
            <div className="flex justify-between text-[#6B7A90] py-1 border-b border-[#D9E2F2]/60 font-mono text-[11px]">
              <span>Tick Size:</span>
              <span className="text-[#111114] font-semibold">₹{selectedInstrument.tick_size}</span>
            </div>
            <div className="flex justify-between text-[#6B7A90] py-1 border-b border-[#D9E2F2]/60 font-mono text-[11px] tabular-nums">
              <span>Day High / Low:</span>
              <span className="text-[#111114] font-semibold">
                ₹{quote ? quote.high.toFixed(2) : '—'} / ₹{quote ? quote.low.toFixed(2) : '—'}
              </span>
            </div>
            <div className="flex justify-between text-[#6B7A90] py-1 border-b border-[#D9E2F2]/60 font-mono text-[11px] tabular-nums">
              <span>Prev Close:</span>
              <span className="text-[#111114] font-semibold">
                ₹{quote ? quote.close.toFixed(2) : '—'}
              </span>
            </div>
            <div className="flex justify-between text-[#6B7A90] py-1 font-mono text-[11px] tabular-nums">
              <span>Total Volume:</span>
              <span className="text-[#111114] font-semibold">
                {quote ? quote.volume.toLocaleString('en-IN') : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Active Positions Telemetry for Selected Instrument ──────────── */}
      {instrumentPositions.length > 0 && (
        <div className="border-t border-[#D9E2F2] pt-6 mt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#00225A]" />
              <h3 className="text-xs font-semibold text-[#00225A] uppercase font-mono tracking-wider">
                Active Position in {selectedInstrument.tradingsymbol}
              </h3>
            </div>
            <span className="text-xs text-[#6B7A90] font-mono">Live Mark-to-Market</span>
          </div>

          <div className="overflow-x-auto bg-white rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)]">
            <table className="w-full text-left text-xs font-mono border-collapse tabular-nums">
              <thead>
                <tr className="border-b border-[#D9E2F2] text-[10px] text-[#6B7A90] uppercase bg-[#F7F8FA]">
                  <th className="py-2.5 px-4">Side / Product</th>
                  <th className="py-2.5 px-4">Quantity</th>
                  <th className="py-2.5 px-4">Entry Price</th>
                  <th className="py-2.5 px-4">LTP</th>
                  <th className="py-2.5 px-4">Unrealized MTM</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E2F2]">
                {instrumentPositions.map((pos) => {
                  const isLong = pos.quantity > 0;
                  const isProfit = pos.unrealized_pnl >= 0;
                  return (
                    <tr key={pos.id} className="hover:bg-[#F7F8FA] transition-colors">
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isLong ? 'bg-[#12B76A]/10 text-[#12B76A] border border-[#12B76A]/30' : 'bg-[#D92D20]/10 text-[#D92D20] border border-[#D92D20]/30'
                          }`}
                        >
                          {isLong ? 'LONG' : 'SHORT'}
                        </span>{' '}
                        <span className="text-[#6B7A90] font-sans ml-1">{pos.product}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#111114]">{pos.quantity}</td>
                      <td className="py-3 px-4 text-[#6B7A90]">₹{pos.buy_price.toFixed(2)}</td>
                      <td className="py-3 px-4 font-semibold text-[#111114]">₹{pos.last_price.toFixed(2)}</td>
                      <td className={`py-3 px-4 font-bold ${isProfit ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
                        {isProfit ? '+' : ''}₹{pos.unrealized_pnl.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => closePosition(pos.id)}
                          className="px-3 py-1 rounded-lg bg-[#FEE4E2] hover:bg-[#D92D20] text-[#D92D20] hover:text-white font-sans text-xs font-semibold border border-[#FECDCA] active:scale-[0.92] transition-all cursor-pointer shadow-sm"
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
    </div>
  );
}
