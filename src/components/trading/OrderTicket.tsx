import React, { useState, useEffect } from 'react';
import { useTradingStore } from '../../store/useTradingStore';
import { FinancialCalculations } from '../../services/trading/FinancialCalculations';
import { marketDataService } from '../../services/market/MarketDataService';
import { getExchangeContractSpec } from '../../services/market/indianInstruments';
import { INSTRUMENT_KEY_ALIASES } from '../../services/market/UpstoxProvider';
import type { TransactionType, ProductType, OrderType } from '../../types/trading';
import { X, RefreshCw, Minus, Plus } from 'lucide-react';

export const OrderTicket: React.FC = () => {
  const {
    isOrderTicketOpen,
    orderTicketInitialProps,
    closeOrderTicket,
    placeOrder,
    selectedInstrument,
    quotes,
    account,
    updateQuote,
  } = useTradingStore();

  const activeInstrument = orderTicketInitialProps?.instrument_key
    ? {
        instrument_key: orderTicketInitialProps.instrument_key,
        tradingsymbol: orderTicketInitialProps.tradingsymbol || 'INSTRUMENT',
        exchange: orderTicketInitialProps.exchange || 'NSE',
        instrument_type: orderTicketInitialProps.instrument_type || 'EQUITY',
        lot_size: orderTicketInitialProps.lot_size || 1,
      }
    : selectedInstrument;

  const realKey = INSTRUMENT_KEY_ALIASES[activeInstrument.instrument_key] || activeInstrument.instrument_key;
  const quote =
    quotes[activeInstrument.instrument_key] ||
    quotes[realKey] ||
    quotes[activeInstrument.tradingsymbol] ||
    (activeInstrument.instrument_key.includes('|') ? quotes[activeInstrument.instrument_key.replace('|', ':')] : undefined);
  const marketPrice = quote && quote.last_price > 0 ? quote.last_price : (orderTicketInitialProps?.price || 0);

  const contractSpec = getExchangeContractSpec(
    activeInstrument.tradingsymbol,
    activeInstrument.instrument_type,
    activeInstrument.exchange,
    activeInstrument.lot_size
  );

  const isCommodity =
    activeInstrument.instrument_type === 'COMMODITY' ||
    activeInstrument.instrument_type === 'FUTCOM' ||
    activeInstrument.exchange === 'MCX' ||
    activeInstrument.exchange === 'NCDEX';

  const isFandO =
    activeInstrument.instrument_type.startsWith('FUT') ||
    activeInstrument.instrument_type.startsWith('OPT') ||
    isCommodity;

  const defaultProduct: ProductType = isFandO ? 'NRML' : 'CNC';

  const [transactionType, setTransactionType] = useState<TransactionType>(
    orderTicketInitialProps?.transaction_type || 'BUY'
  );

  const [product, setProduct] = useState<ProductType>(
    orderTicketInitialProps?.product || defaultProduct
  );

  const [orderType, setOrderType] = useState<OrderType>(
    orderTicketInitialProps?.order_type || 'MARKET'
  );

  const [variety, setVariety] = useState<'REGULAR' | 'AMO'>('REGULAR');

  const [lots, setLots] = useState(1);
  const [quantity, setQuantity] = useState(contractSpec.lotSize);
  const [price, setPrice] = useState(marketPrice > 0 ? marketPrice : 0);
  const [triggerPrice, setTriggerPrice] = useState(marketPrice > 0 ? marketPrice : 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fetch live quote from exchange gateway
  useEffect(() => {
    if (!isOrderTicketOpen) return;
    marketDataService.getQuote(realKey).then((q) => {
      if (q && q.last_price > 0) {
        updateQuote(q);
        setPrice(q.last_price);
        setTriggerPrice(q.last_price);
      }
    });
  }, [isOrderTicketOpen, realKey]);

  // Keep price updated when live quote arrives
  useEffect(() => {
    if (quote && quote.last_price > 0 && (price === 0 || orderType === 'MARKET')) {
      setPrice(quote.last_price);
      setTriggerPrice(quote.last_price);
    }
  }, [quote?.last_price, orderType]);

  // Sync state when props change
  useEffect(() => {
    if (orderTicketInitialProps) {
      if (orderTicketInitialProps.transaction_type) setTransactionType(orderTicketInitialProps.transaction_type);
      if (orderTicketInitialProps.product) setProduct(orderTicketInitialProps.product);
      if (orderTicketInitialProps.order_type) setOrderType(orderTicketInitialProps.order_type);
      if (orderTicketInitialProps.quantity) {
        setQuantity(orderTicketInitialProps.quantity);
        setLots(Math.max(1, Math.round(orderTicketInitialProps.quantity / contractSpec.lotSize)));
      } else {
        setQuantity(contractSpec.lotSize);
        setLots(1);
      }
      if (orderTicketInitialProps.price) {
        setPrice(orderTicketInitialProps.price);
        setTriggerPrice(orderTicketInitialProps.price);
      } else if (marketPrice > 0) {
        setPrice(marketPrice);
        setTriggerPrice(marketPrice);
      }
    } else {
      setQuantity(contractSpec.lotSize);
      setLots(1);
      if (marketPrice > 0) {
        setPrice(marketPrice);
        setTriggerPrice(marketPrice);
      }
    }
  }, [orderTicketInitialProps, contractSpec.lotSize, marketPrice]);

  if (!isOrderTicketOpen) return null;

  const handleLotsChange = (newLots: number) => {
    const validLots = Math.max(1, newLots);
    setLots(validLots);
    setQuantity(validLots * contractSpec.lotSize);
  };

  const handleQuantityChange = (newQty: number) => {
    const validQty = Math.max(1, newQty);
    setQuantity(validQty);
    if (contractSpec.lotSize > 1) {
      setLots(Math.max(1, Math.ceil(validQty / contractSpec.lotSize)));
    }
  };

  const effectivePrice = orderType === 'MARKET' ? marketPrice : price;

  // Real margin requirement using exact exchange contract multiplier
  const requiredMargin = FinancialCalculations.calculateRequiredMargin({
    instrumentType: activeInstrument.instrument_type,
    product,
    transactionType,
    quantity,
    price: effectivePrice,
    multiplier: contractSpec.multiplier,
  });

  // Estimated regulatory and broker charges
  const charges = FinancialCalculations.calculateCharges({
    instrumentType: activeInstrument.instrument_type,
    product,
    transactionType,
    quantity,
    price: effectivePrice,
    multiplier: contractSpec.multiplier,
  });

  const availableCash = account ? account.cash_balance - account.used_margin : 0;
  const isInsufficientFunds = transactionType === 'BUY' && requiredMargin > availableCash;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isInsufficientFunds) return;

    setIsSubmitting(true);
    const success = await placeOrder({
      instrument_key: activeInstrument.instrument_key,
      tradingsymbol: activeInstrument.tradingsymbol,
      exchange: activeInstrument.exchange,
      instrument_type: activeInstrument.instrument_type,
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
      closeOrderTicket();
    }
  };

  const isDerivative = contractSpec.lotSize > 1 || isCommodity || isFandO;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl select-none font-sans">
      <div className="apple-glass-panel border-t border-white/20 border-l border-white/10 border-r border-white/10 border-b border-black/40 rounded-3xl max-w-[460px] w-full shadow-[0_32px_80px_-16px_rgba(0,0,0,0.85)] overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* ── Cendrix Capital Modal Header (Apple Frosted Glass) ─────────── */}
        <div className={`px-5 py-4 flex items-center justify-between border-b ${
          transactionType === 'BUY'
            ? 'bg-gradient-to-r from-[#0F192B]/90 via-[#0E201B]/80 to-[#0F192B]/90 border-emerald-500/25'
            : 'bg-gradient-to-r from-[#0F192B]/90 via-[#241217]/80 to-[#0F192B]/90 border-rose-500/25'
        }`}>
          <div className="flex items-center gap-3.5">
            {/* Buy / Sell Toggle Pill (Apple Segmented Group) */}
            <div className="apple-segmented-group p-0.5 rounded-xl">
              <button
                type="button"
                onClick={() => setTransactionType('BUY')}
                className={`px-3.5 py-1 text-xs font-bold rounded-lg transition-all active:scale-[0.96] ${
                  transactionType === 'BUY'
                    ? 'bg-emerald-600 text-white shadow-[0_2px_10px_rgba(16,185,129,0.45)]'
                    : 'text-[#A1A8B3] hover:text-[#F5F5F2]'
                }`}
              >
                BUY
              </button>
              <button
                type="button"
                onClick={() => setTransactionType('SELL')}
                className={`px-3.5 py-1 text-xs font-bold rounded-lg transition-all active:scale-[0.96] ${
                  transactionType === 'SELL'
                    ? 'bg-rose-600 text-white shadow-[0_2px_10px_rgba(239,68,68,0.45)]'
                    : 'text-[#A1A8B3] hover:text-[#F5F5F2]'
                }`}
              >
                SELL
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-base font-bold tracking-wide text-[#F5F5F2]">{activeInstrument.tradingsymbol}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0F192B] text-[#C6A15B] border border-[rgba(198,161,91,0.25)] font-semibold">
                  {activeInstrument.exchange}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono mt-0.5">
                <span className="text-[#F5F5F2] font-semibold">₹{marketPrice > 0 ? marketPrice.toFixed(2) : '—'}</span>
                {quote && (
                  <span className={`text-[11px] font-medium ${quote.change >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)} ({quote.change_percent.toFixed(2)}%)
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={closeOrderTicket}
            className="p-1.5 rounded-lg text-[#A1A8B3] hover:text-[#F5F5F2] hover:bg-[#14223A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Cendrix Capital Order Form Body ──────────────────────────── */}
        <form onSubmit={handleSubmit} noValidate className="p-5 space-y-4 text-xs">
          
          {/* Variety Tabs: Regular | AMO */}
          <div className="flex items-center gap-5 pb-3 border-b border-[#14223A] text-[#A1A8B3]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="order_variety"
                checked={variety === 'REGULAR'}
                onChange={() => setVariety('REGULAR')}
                className="accent-[#C6A15B] w-3.5 h-3.5"
              />
              <span className={`text-xs ${variety === 'REGULAR' ? 'text-[#C6A15B] font-bold' : ''}`}>Regular Session</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="order_variety"
                checked={variety === 'AMO'}
                onChange={() => setVariety('AMO')}
                className="accent-[#C6A15B] w-3.5 h-3.5"
              />
              <span className={`text-xs ${variety === 'AMO' ? 'text-[#C6A15B] font-bold' : ''}`}>AMO (After Market)</span>
            </label>
          </div>

          {/* Product Type (MIS vs CNC / NRML) */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-[#A1A8B3] uppercase font-semibold tracking-wider font-mono">Product Sizing</span>
            <div className="grid grid-cols-2 gap-2.5">
              {activeInstrument.instrument_type === 'EQUITY' ? (
                <>
                  <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    product === 'CNC' ? 'bg-[#14223A] border-[#C6A15B] text-[#F5F5F2] shadow-[0_0_12px_rgba(198,161,91,0.12)]' : 'bg-[#0B1424] border-[#14223A] text-[#A1A8B3] hover:border-[rgba(198,161,91,0.25)]'
                  }`}>
                    <input
                      type="radio"
                      name="product_type"
                      checked={product === 'CNC'}
                      onChange={() => setProduct('CNC')}
                      className="accent-[#C6A15B]"
                    />
                    <div>
                      <span className="font-bold text-xs block text-[#F5F5F2]">CNC</span>
                      <span className="text-[10px] text-[#A1A8B3]">Longterm (Delivery)</span>
                    </div>
                  </label>

                  <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    product === 'MIS' ? 'bg-[#14223A] border-[#C6A15B] text-[#F5F5F2] shadow-[0_0_12px_rgba(198,161,91,0.12)]' : 'bg-[#0B1424] border-[#14223A] text-[#A1A8B3] hover:border-[rgba(198,161,91,0.25)]'
                  }`}>
                    <input
                      type="radio"
                      name="product_type"
                      checked={product === 'MIS'}
                      onChange={() => setProduct('MIS')}
                      className="accent-[#C6A15B]"
                    />
                    <div>
                      <span className="font-bold text-xs block text-[#F5F5F2]">MIS</span>
                      <span className="text-[10px] text-[#A1A8B3]">Intraday (5x Leverage)</span>
                    </div>
                  </label>
                </>
              ) : (
                <>
                  <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    product === 'NRML' ? 'bg-[#14223A] border-[#C6A15B] text-[#F5F5F2] shadow-[0_0_12px_rgba(198,161,91,0.12)]' : 'bg-[#0B1424] border-[#14223A] text-[#A1A8B3] hover:border-[rgba(198,161,91,0.25)]'
                  }`}>
                    <input
                      type="radio"
                      name="product_type"
                      checked={product === 'NRML'}
                      onChange={() => setProduct('NRML')}
                      className="accent-[#C6A15B]"
                    />
                    <div>
                      <span className="font-bold text-xs block text-[#F5F5F2]">NRML</span>
                      <span className="text-[10px] text-[#A1A8B3]">Overnight / Carryforward</span>
                    </div>
                  </label>

                  <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    product === 'MIS' ? 'bg-[#14223A] border-[#C6A15B] text-[#F5F5F2] shadow-[0_0_12px_rgba(198,161,91,0.12)]' : 'bg-[#0B1424] border-[#14223A] text-[#A1A8B3] hover:border-[rgba(198,161,91,0.25)]'
                  }`}>
                    <input
                      type="radio"
                      name="product_type"
                      checked={product === 'MIS'}
                      onChange={() => setProduct('MIS')}
                      className="accent-[#C6A15B]"
                    />
                    <div>
                      <span className="font-bold text-xs block text-[#F5F5F2]">MIS</span>
                      <span className="text-[10px] text-[#A1A8B3]">Intraday Margin</span>
                    </div>
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Quantity & Lots Controls */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#A1A8B3] uppercase font-semibold font-mono tracking-wider">
                {isDerivative ? 'Contract Sizing & Lots' : 'Quantity'}
              </span>
              <span className="font-mono text-[#C6A15B] font-semibold">
                {contractSpec.lotDescription}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {isDerivative ? (
                <div>
                  <label className="block text-[10px] text-[#A1A8B3] mb-1 font-mono">Number of Lots</label>
                  <div className="flex items-center border border-[#14223A] rounded-lg bg-[#0B1424]">
                    <button
                      type="button"
                      onClick={() => handleLotsChange(lots - 1)}
                      className="px-2.5 py-1.5 text-[#A1A8B3] hover:text-[#C6A15B] hover:bg-[#14223A] transition-colors rounded-l-lg"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={lots}
                      onChange={(e) => handleLotsChange(parseInt(e.target.value) || 1)}
                      className="w-full bg-transparent text-center font-mono font-bold text-[#F5F5F2] text-xs focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleLotsChange(lots + 1)}
                      className="px-2.5 py-1.5 text-[#A1A8B3] hover:text-[#C6A15B] hover:bg-[#14223A] transition-colors rounded-r-lg"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : null}

              <div className={isDerivative ? '' : 'col-span-2'}>
                <label className="block text-[10px] text-[#A1A8B3] mb-1 font-mono">
                  Total {contractSpec.unit}
                </label>
                <div className="flex items-center border border-[#14223A] rounded-lg bg-[#0B1424] px-3 py-1.5">
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-full bg-transparent font-mono font-bold text-[#F5F5F2] text-xs focus:outline-none"
                  />
                  <span className="text-[11px] font-mono text-[#C6A15B] shrink-0 ml-1 font-semibold">
                    {contractSpec.unit}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Price & Trigger Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-[#A1A8B3] mb-1 font-mono">
                Price ({orderType === 'MARKET' ? 'Market' : 'Limit'})
              </label>
              <input
                type="number"
                step="any"
                disabled={orderType === 'MARKET'}
                value={orderType === 'MARKET' ? marketPrice : price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className={`w-full border rounded-lg px-3 py-1.5 font-mono text-xs focus:outline-none transition-colors ${
                  orderType === 'MARKET'
                    ? 'bg-[#070D18] border-[#14223A] text-[#6E7683] cursor-not-allowed'
                    : 'bg-[#0B1424] border-[#14223A] text-[#F5F5F2] focus:border-[#C6A15B]'
                }`}
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#A1A8B3] mb-1 font-mono">Trigger Price</label>
              <input
                type="number"
                step="any"
                disabled={orderType !== 'SL' && orderType !== 'SL_M'}
                value={triggerPrice}
                onChange={(e) => setTriggerPrice(parseFloat(e.target.value) || 0)}
                className={`w-full border rounded-lg px-3 py-1.5 font-mono text-xs focus:outline-none transition-colors ${
                  orderType !== 'SL' && orderType !== 'SL_M'
                    ? 'bg-[#070D18] border-[#14223A] text-[#6E7683] cursor-not-allowed'
                    : 'bg-[#0B1424] border-[#14223A] text-[#F5F5F2] focus:border-[#C6A15B]'
                }`}
              />
            </div>
          </div>

          {/* Order Type Radio Pills (Market, Limit, SL, SL-M) */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-[#A1A8B3] uppercase font-semibold font-mono tracking-wider">Execution Type</span>
            <div className="apple-segmented-group grid grid-cols-4 gap-1 w-full p-1 rounded-xl">
              {(['MARKET', 'LIMIT', 'SL', 'SL_M'] as OrderType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setOrderType(type)}
                  className={`apple-segmented-item py-1.5 text-xs font-semibold text-center rounded-lg transition-all active:scale-[0.96] ${
                    orderType === type
                      ? 'apple-segmented-item-active font-bold'
                      : ''
                  }`}
                >
                  {type === 'SL_M' ? 'SL-M' : type}
                </button>
              ))}
            </div>
          </div>

          {/* Insufficient Funds Warning */}
          {isInsufficientFunds && (
            <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-[11px] leading-relaxed">
              Insufficient virtual funds. Margin required: ₹{requiredMargin.toLocaleString('en-IN', { minimumFractionDigits: 2 })}, available cash: ₹{availableCash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}.
            </div>
          )}

          {/* ── Action Footer ─────────────────────────────────── */}
          <div className="pt-3.5 border-t border-white/10 flex items-center justify-between">
            <div className="text-[11px] font-mono leading-tight">
              <div className="text-[#A1A8B3]">
                Margin: <span className="text-[#E2C889] font-bold">₹{requiredMargin.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="text-[#6E7683] mt-0.5">
                Charges: ₹{charges.total_charges.toFixed(2)}
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={closeOrderTicket}
                className="btn-cendrix-outline px-4 py-2 text-xs rounded-xl font-semibold active:scale-[0.96]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || isInsufficientFunds || (orderType === 'MARKET' && marketPrice <= 0)}
                className={`px-6 py-2.5 text-xs font-bold rounded-xl shadow-lg active:scale-[0.96] transition-all disabled:opacity-50 cursor-pointer ${
                  transactionType === 'BUY'
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)]'
                    : 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white shadow-[0_4px_16px_rgba(239,68,68,0.35)]'
                }`}
              >
                {isSubmitting
                  ? 'Submitting...'
                  : (orderType === 'MARKET' && marketPrice <= 0)
                  ? 'Fetching Live Price...'
                  : transactionType === 'BUY'
                  ? 'Execute Buy'
                  : 'Execute Sell'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
