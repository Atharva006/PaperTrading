import React, { useState, useEffect } from 'react';
import { useTradingStore } from '../../store/useTradingStore';
import { FinancialCalculations } from '../../services/trading/FinancialCalculations';
import { marketDataService } from '../../services/market/MarketDataService';
import { getZerodhaContractSpec } from '../../services/market/indianInstruments';
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

  const contractSpec = getZerodhaContractSpec(
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

  // Pre-fetch live quote from Upstox
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

  // Real margin requirement using exact Zerodha contract multiplier
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="bg-[#111622] border border-[#1e293b] rounded-lg max-w-[460px] w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 font-sans">
        
        {/* ── Zerodha Kite Banner Header ───────────────────────────────── */}
        <div className={`px-4 py-3 flex items-center justify-between text-white ${
          transactionType === 'BUY' ? 'bg-[#387ed1]' : 'bg-[#df514c]'
        }`}>
          <div className="flex items-center gap-3">
            {/* Buy / Sell Toggle Pill */}
            <div className="flex items-center bg-black/25 rounded p-0.5 border border-white/20">
              <button
                type="button"
                onClick={() => setTransactionType('BUY')}
                className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
                  transactionType === 'BUY' ? 'bg-white text-[#387ed1]' : 'text-white hover:text-white/80'
                }`}
              >
                BUY
              </button>
              <button
                type="button"
                onClick={() => setTransactionType('SELL')}
                className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
                  transactionType === 'SELL' ? 'bg-white text-[#df514c]' : 'text-white hover:text-white/80'
                }`}
              >
                SELL
              </button>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight">{activeInstrument.tradingsymbol}</span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-black/25 text-white/90">
                  {activeInstrument.exchange}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-white/80 font-medium">₹{marketPrice > 0 ? marketPrice.toFixed(2) : '—'}</span>
                {quote && (
                  <span className="text-[11px] text-white/90">
                    {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)} ({quote.change_percent.toFixed(2)}%)
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={closeOrderTicket}
            className="p-1 rounded text-white/80 hover:text-white hover:bg-black/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Zerodha Order Form Body ──────────────────────────────────── */}
        <form onSubmit={handleSubmit} noValidate className="p-4 space-y-4 text-xs">
          
          {/* Variety Tabs: Regular | AMO */}
          <div className="flex items-center gap-4 pb-2 border-b border-[#1e293b] text-[#9ca8ba]">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="order_variety"
                checked={variety === 'REGULAR'}
                onChange={() => setVariety('REGULAR')}
                className="accent-[#387ed1] w-3.5 h-3.5"
              />
              <span className={`text-xs ${variety === 'REGULAR' ? 'text-[#f0f3f8] font-semibold' : ''}`}>Regular</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="order_variety"
                checked={variety === 'AMO'}
                onChange={() => setVariety('AMO')}
                className="accent-[#387ed1] w-3.5 h-3.5"
              />
              <span className={`text-xs ${variety === 'AMO' ? 'text-[#f0f3f8] font-semibold' : ''}`}>AMO</span>
            </label>
          </div>

          {/* Product Type (MIS vs CNC / NRML) */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-[#5c687a] uppercase font-semibold">Product</span>
            <div className="grid grid-cols-2 gap-2">
              {activeInstrument.instrument_type === 'EQUITY' ? (
                <>
                  <label className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                    product === 'CNC' ? 'bg-[#151b2a] border-[#387ed1] text-[#f0f3f8]' : 'bg-[#0e131f] border-[#1e293b] text-[#9ca8ba]'
                  }`}>
                    <input
                      type="radio"
                      name="product_type"
                      checked={product === 'CNC'}
                      onChange={() => setProduct('CNC')}
                      className="accent-[#387ed1]"
                    />
                    <div>
                      <span className="font-bold text-xs block">CNC</span>
                      <span className="text-[10px] text-[#5c687a]">Longterm (Delivery)</span>
                    </div>
                  </label>

                  <label className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                    product === 'MIS' ? 'bg-[#151b2a] border-[#387ed1] text-[#f0f3f8]' : 'bg-[#0e131f] border-[#1e293b] text-[#9ca8ba]'
                  }`}>
                    <input
                      type="radio"
                      name="product_type"
                      checked={product === 'MIS'}
                      onChange={() => setProduct('MIS')}
                      className="accent-[#387ed1]"
                    />
                    <div>
                      <span className="font-bold text-xs block">MIS</span>
                      <span className="text-[10px] text-[#5c687a]">Intraday (5x)</span>
                    </div>
                  </label>
                </>
              ) : (
                <>
                  <label className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                    product === 'NRML' ? 'bg-[#151b2a] border-[#387ed1] text-[#f0f3f8]' : 'bg-[#0e131f] border-[#1e293b] text-[#9ca8ba]'
                  }`}>
                    <input
                      type="radio"
                      name="product_type"
                      checked={product === 'NRML'}
                      onChange={() => setProduct('NRML')}
                      className="accent-[#387ed1]"
                    />
                    <div>
                      <span className="font-bold text-xs block">NRML</span>
                      <span className="text-[10px] text-[#5c687a]">Overnight / Carryforward</span>
                    </div>
                  </label>

                  <label className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                    product === 'MIS' ? 'bg-[#151b2a] border-[#387ed1] text-[#f0f3f8]' : 'bg-[#0e131f] border-[#1e293b] text-[#9ca8ba]'
                  }`}>
                    <input
                      type="radio"
                      name="product_type"
                      checked={product === 'MIS'}
                      onChange={() => setProduct('MIS')}
                      className="accent-[#387ed1]"
                    />
                    <div>
                      <span className="font-bold text-xs block">MIS</span>
                      <span className="text-[10px] text-[#5c687a]">Intraday Margin</span>
                    </div>
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Quantity & Lots Controls */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#5c687a] uppercase font-semibold">
                {isDerivative ? 'Contract Sizing & Quantity' : 'Quantity'}
              </span>
              <span className="font-mono text-[#387ed1] font-semibold">
                {contractSpec.lotDescription}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {isDerivative ? (
                <div>
                  <label className="block text-[10px] text-[#9ca8ba] mb-1">Number of Lots</label>
                  <div className="flex items-center border border-[#1e293b] rounded bg-[#0e131f]">
                    <button
                      type="button"
                      onClick={() => handleLotsChange(lots - 1)}
                      className="px-2.5 py-1.5 text-[#9ca8ba] hover:text-white hover:bg-[#1a2235] transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={lots}
                      onChange={(e) => handleLotsChange(parseInt(e.target.value) || 1)}
                      className="w-full bg-transparent text-center font-mono font-bold text-[#f0f3f8] text-xs focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleLotsChange(lots + 1)}
                      className="px-2.5 py-1.5 text-[#9ca8ba] hover:text-white hover:bg-[#1a2235] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : null}

              <div className={isDerivative ? '' : 'col-span-2'}>
                <label className="block text-[10px] text-[#9ca8ba] mb-1">
                  Total {contractSpec.unit}
                </label>
                <div className="flex items-center border border-[#1e293b] rounded bg-[#0e131f] px-3 py-1.5">
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-full bg-transparent font-mono font-bold text-[#f0f3f8] text-xs focus:outline-none"
                  />
                  <span className="text-[11px] font-mono text-[#9ca8ba] shrink-0 ml-1">
                    {contractSpec.unit}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Price & Trigger Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-[#9ca8ba] mb-1">
                Price ({orderType === 'MARKET' ? 'Market' : 'Limit'})
              </label>
              <input
                type="number"
                step="any"
                disabled={orderType === 'MARKET'}
                value={orderType === 'MARKET' ? marketPrice : price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className={`w-full border rounded px-3 py-1.5 font-mono text-xs focus:outline-none ${
                  orderType === 'MARKET'
                    ? 'bg-[#0a0d14] border-[#1e293b] text-[#5c687a] cursor-not-allowed'
                    : 'bg-[#0e131f] border-[#1e293b] text-[#f0f3f8] focus:border-[#387ed1]'
                }`}
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#9ca8ba] mb-1">Trigger Price</label>
              <input
                type="number"
                step="any"
                disabled={orderType !== 'SL' && orderType !== 'SL_M'}
                value={triggerPrice}
                onChange={(e) => setTriggerPrice(parseFloat(e.target.value) || 0)}
                className={`w-full border rounded px-3 py-1.5 font-mono text-xs focus:outline-none ${
                  orderType !== 'SL' && orderType !== 'SL_M'
                    ? 'bg-[#0a0d14] border-[#1e293b] text-[#5c687a] cursor-not-allowed'
                    : 'bg-[#0e131f] border-[#1e293b] text-[#f0f3f8] focus:border-[#387ed1]'
                }`}
              />
            </div>
          </div>

          {/* Order Type Radio Pills (Market, Limit, SL, SL-M) */}
          <div className="space-y-1">
            <span className="text-[11px] text-[#5c687a] uppercase font-semibold">Order Type</span>
            <div className="grid grid-cols-4 gap-1.5">
              {(['MARKET', 'LIMIT', 'SL', 'SL_M'] as OrderType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setOrderType(type)}
                  className={`py-1.5 text-xs font-semibold rounded border transition-colors ${
                    orderType === type
                      ? 'bg-[#387ed1] text-white border-[#387ed1]'
                      : 'bg-[#0e131f] border-[#1e293b] text-[#9ca8ba] hover:text-white'
                  }`}
                >
                  {type === 'SL_M' ? 'SL-M' : type}
                </button>
              ))}
            </div>
          </div>

          {/* Insufficient Funds Warning */}
          {isInsufficientFunds && (
            <div className="p-2.5 rounded bg-[#df514c]/10 border border-[#df514c]/30 text-[#df514c] text-[11px] leading-relaxed">
              Insufficient virtual funds. Margin required: ₹{requiredMargin.toLocaleString('en-IN', { minimumFractionDigits: 2 })}, available cash: ₹{availableCash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}.
            </div>
          )}

          {/* ── Zerodha Action Footer ─────────────────────────────────── */}
          <div className="pt-3 border-t border-[#1e293b] flex items-center justify-between">
            <div className="text-[11px] font-mono leading-tight">
              <div className="text-[#9ca8ba]">
                Margin: <span className="text-[#f0f3f8] font-bold">₹{requiredMargin.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="text-[#5c687a]">
                Charges: ₹{charges.total_charges.toFixed(2)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeOrderTicket}
                className="btn-kite-outline px-3 py-1.5 text-xs"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || isInsufficientFunds || (orderType === 'MARKET' && marketPrice <= 0)}
                className={`px-5 py-1.5 text-xs font-bold rounded shadow transition-all ${
                  transactionType === 'BUY'
                    ? 'btn-kite-blue'
                    : 'btn-kite-red'
                } disabled:opacity-50`}
              >
                {isSubmitting
                  ? 'Submitting...'
                  : (orderType === 'MARKET' && marketPrice <= 0)
                  ? 'Fetching Live Price...'
                  : transactionType === 'BUY'
                  ? 'Buy'
                  : 'Sell'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
