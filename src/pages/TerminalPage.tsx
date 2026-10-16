import React, { useState } from 'react';
import { useTradingStore } from '../store/useTradingStore';
import { INDIAN_INSTRUMENTS_MASTER, getZerodhaContractSpec } from '../services/market/indianInstruments';
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

  const contractSpec = getZerodhaContractSpec(
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

  const availableCash = account ? account.cash_balance - account.used_margin : 0;
  const isInsufficientFunds = transactionType === 'BUY' && requiredMargin > availableCash;

  const handleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isInsufficientFunds) return;

    setIsSubmitting(true);
    const success = await placeOrder({
      instrument_key: selectedInstrument.instrument_key,
      tradingsymbol: selectedInstrument.tradingsymbol,
      exchange: selectedInstrument.exchange,
      instrument_type: selectedInstrument.instrument_type,
      transaction_type: transactionType,
      product,
      order_type: orderType,
      quantity,
      lot_size: contractSpec.lotSize,
      price: orderType === 'LIMIT' || orderType === 'SL' ? price : 0,
      trigger_price: orderType === 'SL' || orderType === 'SL_M' ? triggerPrice : 0,
    });
    setIsSubmitting(false);

    if (success) {
      setOrderFeedback(
        `Order executed: ${transactionType} ${quantity} ${contractSpec.unit} of ${selectedInstrument.tradingsymbol}`
      );
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
    <div className="w-full max-w-[1720px] mx-auto select-none font-sans text-xs text-[#f0f3f8] pb-12 space-y-4">
      {/* ── 1. Top Flat Zerodha Instrument Selector & Live Ticker ─────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#1e2638]">
        {/* Selector & Chips */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedInstrument.instrument_key}
            onChange={(e) => {
              const inst = INDIAN_INSTRUMENTS_MASTER.find((i) => i.instrument_key === e.target.value);
              if (inst) {
                setSelectedInstrument(inst);
                const spec = getZerodhaContractSpec(inst.tradingsymbol, inst.instrument_type, inst.exchange, inst.lot_size);
                setQuantity(spec.lotSize);
                setLots(1);
              }
            }}
            className="bg-[#121722] border border-[#1e2638] text-xs font-semibold text-[#f0f3f8] rounded px-3 py-1.5 focus:outline-none focus:border-[#387ed1] cursor-pointer"
          >
            {INDIAN_INSTRUMENTS_MASTER.map((i) => (
              <option key={i.instrument_key} value={i.instrument_key}>
                {i.tradingsymbol} ({i.exchange} · {i.instrument_type})
              </option>
            ))}
          </select>

          {/* Quick Select Chips */}
          <div className="hidden sm:flex items-center gap-1.5">
            {quickChips.map((chip) => {
              const active = selectedInstrument.instrument_key === chip.key;
              return (
                <button
                  key={chip.key}
                  onClick={() => {
                    const inst = INDIAN_INSTRUMENTS_MASTER.find((i) => i.instrument_key === chip.key);
                    if (inst) {
                      setSelectedInstrument(inst);
                      const spec = getZerodhaContractSpec(inst.tradingsymbol, inst.instrument_type, inst.exchange, inst.lot_size);
                      setQuantity(spec.lotSize);
                      setLots(1);
                    }
                  }}
                  className={`px-2 py-0.5 text-xs rounded transition-all ${
                    active
                      ? 'bg-[#387ed1] text-white font-medium'
                      : 'bg-[#121722] text-[#788296] hover:text-[#f0f3f8] border border-[#1e2638]'
                  }`}
                >
                  {chip.symbol}
                </button>
              );
            })}
          </div>

          {/* Live Quote Price Tag */}
          {quote && (
            <div className="flex items-center gap-2 pl-3 border-l border-[#1e2638]">
              <span className="text-base font-mono font-bold text-[#f0f3f8]">
                ₹{quote.last_price.toFixed(2)}
              </span>
              <span
                className={`text-xs font-mono font-medium ${
                  quote.change >= 0 ? 'text-[#00c087]' : 'text-[#df514c]'
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
          <span className="text-xs font-mono text-[#387ed1] bg-[#387ed1]/10 px-2 py-0.5 rounded border border-[#387ed1]/30">
            {contractSpec.lotDescription}
          </span>
        </div>
      </div>

      {/* Feedback banner */}
      {orderFeedback && (
        <div className="p-2 bg-[#00c087]/10 border border-[#00c087]/30 rounded text-xs font-medium text-[#00c087] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{orderFeedback}</span>
        </div>
      )}

      {/* ── 2. Main Order Terminal Layout (Direct Order Pad + L2 Depth) ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Dedicated Fast Order Placement Pad */}
        <div className="border border-[#1e2638] bg-[#0c1018] p-4 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e2638]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#f0f3f8]">Place Order</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#161d2c] text-[#788296] border border-[#1e2638]">
                {selectedInstrument.exchange}
              </span>
            </div>
            <span className="text-xs font-mono text-[#788296]">
              LTP: <strong className="text-[#f0f3f8]">₹{marketPrice.toFixed(2)}</strong>
            </span>
          </div>

          <form onSubmit={handleDirectSubmit} noValidate className="space-y-3.5">
            {/* BUY / SELL Switcher */}
            <div className="grid grid-cols-2 gap-2 p-0.5 bg-[#121722] rounded border border-[#1e293b]">
              <button
                type="button"
                onClick={() => setTransactionType('BUY')}
                className={`py-1.5 text-xs font-bold rounded transition-all ${
                  transactionType === 'BUY'
                    ? 'bg-[#387ed1] text-white'
                    : 'text-[#788296] hover:text-[#f0f3f8]'
                }`}
              >
                BUY
              </button>
              <button
                type="button"
                onClick={() => setTransactionType('SELL')}
                className={`py-1.5 text-xs font-bold rounded transition-all ${
                  transactionType === 'SELL'
                    ? 'bg-[#df514c] text-white'
                    : 'text-[#788296] hover:text-[#f0f3f8]'
                }`}
              >
                SELL
              </button>
            </div>

            {/* Product Type (MIS vs CNC / NRML) */}
            <div className="space-y-1">
              <span className="text-[10px] text-[#788296] uppercase font-medium">Product</span>
              <div className="grid grid-cols-2 gap-2">
                <label className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                  product === (isFandO ? 'NRML' : 'CNC') ? 'bg-[#151c2a] border-[#387ed1] text-[#f0f3f8]' : 'bg-[#121722] border-[#1e2638] text-[#788296]'
                }`}>
                  <input
                    type="radio"
                    name="terminal_product"
                    checked={product === (isFandO ? 'NRML' : 'CNC')}
                    onChange={() => setProduct(isFandO ? 'NRML' : 'CNC')}
                    className="accent-[#387ed1]"
                  />
                  <div>
                    <span className="font-semibold text-xs block">{isFandO ? 'NRML' : 'CNC'}</span>
                    <span className="text-[10px] text-[#58647a]">{isFandO ? 'Carryforward' : 'Longterm Delivery'}</span>
                  </div>
                </label>

                <label className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                  product === 'MIS' ? 'bg-[#151c2a] border-[#387ed1] text-[#f0f3f8]' : 'bg-[#121722] border-[#1e2638] text-[#788296]'
                }`}>
                  <input
                    type="radio"
                    name="terminal_product"
                    checked={product === 'MIS'}
                    onChange={() => setProduct('MIS')}
                    className="accent-[#387ed1]"
                  />
                  <div>
                    <span className="font-semibold text-xs block">MIS</span>
                    <span className="text-[10px] text-[#58647a]">Intraday (5x)</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Lots & Quantity Sizing */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#788296] uppercase font-medium">Quantity</span>
                <span className="font-mono text-[#387ed1] font-semibold">{contractSpec.lotDescription}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {contractSpec.lotSize > 1 ? (
                  <div>
                    <label className="block text-[10px] text-[#788296] mb-1">Lots</label>
                    <div className="flex items-center border border-[#1e2638] rounded bg-[#121722]">
                      <button
                        type="button"
                        onClick={() => handleLotsChange(lots - 1)}
                        className="px-2.5 py-1 text-[#788296] hover:text-white transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        value={lots}
                        onChange={(e) => handleLotsChange(parseInt(e.target.value) || 1)}
                        className="w-full bg-transparent text-center font-mono font-bold text-[#f0f3f8] text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleLotsChange(lots + 1)}
                        className="px-2.5 py-1 text-[#788296] hover:text-white transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className={contractSpec.lotSize > 1 ? '' : 'col-span-2'}>
                  <label className="block text-[10px] text-[#788296] mb-1">
                    Total {contractSpec.unit}
                  </label>
                  <div className="flex items-center border border-[#1e2638] rounded bg-[#121722] px-3 py-1">
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      className="w-full bg-transparent font-mono font-bold text-[#f0f3f8] text-xs focus:outline-none"
                    />
                    <span className="text-[11px] font-mono text-[#788296] shrink-0 ml-1">
                      {contractSpec.unit}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Price & Order Type */}
            <div className="space-y-1">
              <span className="text-[10px] text-[#788296] uppercase font-medium">Order Execution Type</span>
              <div className="grid grid-cols-4 gap-1.5">
                {(['MARKET', 'LIMIT', 'SL', 'SL_M'] as OrderType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setOrderType(type)}
                    className={`py-1 text-xs font-medium rounded border transition-colors ${
                      orderType === type
                        ? 'bg-[#387ed1] border-[#387ed1] text-white'
                        : 'bg-[#121722] border-[#1e2638] text-[#788296] hover:text-white'
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
                  <label className="block text-[10px] text-[#788296] mb-1">Limit Price</label>
                  <input
                    type="number"
                    step="any"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#121722] border border-[#1e2638] rounded px-3 py-1 font-mono text-xs text-[#f0f3f8] focus:outline-none focus:border-[#387ed1]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#788296] mb-1">Trigger Price</label>
                  <input
                    type="number"
                    step="any"
                    disabled={orderType !== 'SL' && orderType !== 'SL_M'}
                    value={triggerPrice}
                    onChange={(e) => setTriggerPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#121722] border border-[#1e2638] rounded px-3 py-1 font-mono text-xs text-[#f0f3f8] focus:outline-none focus:border-[#387ed1] disabled:opacity-40"
                  />
                </div>
              </div>
            )}

            {/* Margin Calculation Telemetry */}
            <div className="p-2.5 bg-[#121722] rounded border border-[#1e2638] flex items-center justify-between text-xs">
              <div>
                <span className="text-[#788296] block text-[10px]">Margin Required</span>
                <span className="font-mono font-bold text-[#00c087]">₹{requiredMargin.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="text-right">
                <span className="text-[#788296] block text-[10px]">Available Cash</span>
                <span className="font-mono font-bold text-[#f0f3f8]">₹{availableCash.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isInsufficientFunds}
              className={`w-full py-2.5 rounded font-bold text-xs uppercase tracking-wide transition-all shadow ${
                isInsufficientFunds
                  ? 'bg-[#1e2638] text-[#58647a] cursor-not-allowed'
                  : transactionType === 'BUY'
                  ? 'bg-[#387ed1] hover:bg-[#2e6bb5] text-white'
                  : 'bg-[#df514c] hover:bg-[#c93f3a] text-white'
              }`}
            >
              {isSubmitting ? 'Placing Order...' : isInsufficientFunds ? 'Insufficient Available Margin' : `Place ${transactionType} Order`}
            </button>
          </form>
        </div>

        {/* Right: Level 2 Market Depth & Contract Specifications */}
        <div className="space-y-4">
          {/* Level 2 Depth */}
          <div className="border border-[#1e2638] bg-[#0c1018] p-3.5 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-[#1e2638]">
              <h3 className="text-xs font-semibold text-[#f0f3f8] uppercase flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#387ed1]" />
                <span>Level 2 Market Depth</span>
              </h3>
              <span className="text-[10px] text-[#00c087] font-mono bg-[#00c087]/10 px-1.5 py-0.5 rounded">
                5 BID / 5 ASK
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[11px] font-mono">
              {/* Buy Bids */}
              <div>
                <div className="flex justify-between text-[#788296] text-[10px] pb-1 border-b border-[#1e2638] uppercase">
                  <span>Bid ₹</span>
                  <span>Orders</span>
                </div>
                <div className="space-y-1 mt-1 text-[#00c087]">
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
                      <div key={i} className="flex justify-between hover:bg-[#121722] px-1 py-0.5 rounded">
                        <span className="font-semibold">{b.price.toFixed(2)}</span>
                        <span className="text-[#c4cbd4]">{b.quantity}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Sell Asks */}
              <div>
                <div className="flex justify-between text-[#788296] text-[10px] pb-1 border-b border-[#1e2638] uppercase">
                  <span>Ask ₹</span>
                  <span>Orders</span>
                </div>
                <div className="space-y-1 mt-1 text-[#df514c]">
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
                      <div key={i} className="flex justify-between hover:bg-[#121722] px-1 py-0.5 rounded">
                        <span className="font-semibold">{a.price.toFixed(2)}</span>
                        <span className="text-[#c4cbd4]">{a.quantity}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contract Specifications */}
          <div className="border border-[#1e2638] bg-[#0c1018] p-3 text-xs space-y-2">
            <h3 className="text-[11px] font-semibold text-[#f0f3f8] uppercase mb-1 flex items-center justify-between">
              <span>Contract Specifications</span>
              <span className="text-[#387ed1] font-mono">{selectedInstrument.exchange}</span>
            </h3>
            <div className="flex justify-between text-[#788296]">
              <span>Lot Specification:</span>
              <span className="font-mono text-[#387ed1] font-medium">{contractSpec.lotDescription}</span>
            </div>
            <div className="flex justify-between text-[#788296]">
              <span>Lot Size:</span>
              <span className="font-mono text-[#f0f3f8] font-medium">{contractSpec.lotSize} {contractSpec.unit}</span>
            </div>
            <div className="flex justify-between text-[#788296]">
              <span>Quoted In:</span>
              <span className="font-mono text-[#f0f3f8] font-medium">{contractSpec.pricePerUnit}</span>
            </div>
            <div className="flex justify-between text-[#788296]">
              <span>Tick Size:</span>
              <span className="font-mono text-[#f0f3f8] font-medium">₹{selectedInstrument.tick_size}</span>
            </div>
            <div className="flex justify-between text-[#788296]">
              <span>Day High / Low:</span>
              <span className="font-mono text-[#f0f3f8] font-medium">
                ₹{quote ? quote.high.toFixed(2) : '—'} / ₹{quote ? quote.low.toFixed(2) : '—'}
              </span>
            </div>
            <div className="flex justify-between text-[#788296]">
              <span>Prev Close:</span>
              <span className="font-mono text-[#f0f3f8] font-medium">
                ₹{quote ? quote.close.toFixed(2) : '—'}
              </span>
            </div>
            <div className="flex justify-between text-[#788296]">
              <span>Total Volume:</span>
              <span className="font-mono text-[#f0f3f8] font-medium">
                {quote ? quote.volume.toLocaleString('en-IN') : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Active Positions Telemetry for Selected Instrument ──────────── */}
      {instrumentPositions.length > 0 && (
        <div className="border-t border-[#1e2638] pt-4 mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#387ed1]" />
              <h3 className="text-xs font-semibold text-[#f0f3f8]">
                Active Position in {selectedInstrument.tradingsymbol}
              </h3>
            </div>
            <span className="text-xs text-[#788296] font-mono">Live Mark-to-Market</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-[#1e2638] text-[10px] text-[#788296] uppercase">
                  <th className="py-2">Side / Product</th>
                  <th className="py-2">Quantity</th>
                  <th className="py-2">Entry Price</th>
                  <th className="py-2">LTP</th>
                  <th className="py-2">Unrealized MTM</th>
                  <th className="py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2638]/60">
                {instrumentPositions.map((pos) => {
                  const isLong = pos.quantity > 0;
                  const isProfit = pos.unrealized_pnl >= 0;
                  return (
                    <tr key={pos.id} className="hover:bg-[#121722]">
                      <td className="py-2.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            isLong ? 'bg-[#00c087]/15 text-[#00c087]' : 'bg-[#df514c]/15 text-[#df514c]'
                          }`}
                        >
                          {isLong ? 'LONG' : 'SHORT'}
                        </span>{' '}
                        <span className="text-[#788296] font-sans">{pos.product}</span>
                      </td>
                      <td className="py-2.5 font-medium text-[#f0f3f8]">{pos.quantity}</td>
                      <td className="py-2.5 text-[#788296]">₹{pos.buy_price.toFixed(2)}</td>
                      <td className="py-2.5 font-medium text-[#f0f3f8]">₹{pos.last_price.toFixed(2)}</td>
                      <td className={`py-2.5 font-semibold ${isProfit ? 'text-[#00c087]' : 'text-[#df514c]'}`}>
                        {isProfit ? '+' : ''}₹{pos.unrealized_pnl.toFixed(2)}
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => closePosition(pos.id)}
                          className="px-2 py-0.5 rounded bg-[#df514c]/15 hover:bg-[#df514c] text-[#df514c] hover:text-white font-sans text-xs font-medium border border-[#df514c]/30 transition-colors"
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
