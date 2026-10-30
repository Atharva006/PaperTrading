import React, { useState, useEffect } from 'react';
import { useTradingStore } from '../../store/useTradingStore';
import { FinancialCalculations } from '../../services/trading/FinancialCalculations';
import { marketDataService } from '../../services/market/MarketDataService';
import { getExchangeContractSpec } from '../../services/market/indianInstruments';
import { INSTRUMENT_KEY_ALIASES } from '../../services/market/UpstoxProvider';
import type { TransactionType, ProductType, OrderType } from '../../types/trading';
import { X, Minus, Plus } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#00225A]/30 backdrop-blur-sm select-none font-sans">
      <div className="bg-[#FFFFFF] border border-[#D9E2F2] rounded-3xl max-w-[460px] w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* ── Modal Header ─────────────────────────────────────────────────── */}
        <div className={`px-5 py-4 flex items-center justify-between border-b ${
          transactionType === 'BUY'
            ? 'bg-[#ECFDF3] border-[#12B76A]/20'
            : 'bg-[#FEF3F2] border-[#D92D20]/20'
        }`}>
          <div className="flex items-center gap-3.5">
            {/* Buy / Sell Toggle Pill */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#D9E2F2] shadow-2xs">
              <button
                type="button"
                onClick={() => setTransactionType('BUY')}
                className={`px-3.5 py-1 text-xs font-bold rounded-lg transition-all active:scale-[0.96] ${
                  transactionType === 'BUY'
                    ? 'bg-[#12B76A] text-white shadow-xs'
                    : 'text-[#6B7A90] hover:text-[#00225A]'
                }`}
              >
                BUY
              </button>
              <button
                type="button"
                onClick={() => setTransactionType('SELL')}
                className={`px-3.5 py-1 text-xs font-bold rounded-lg transition-all active:scale-[0.96] ${
                  transactionType === 'SELL'
                    ? 'bg-[#D92D20] text-white shadow-xs'
                    : 'text-[#6B7A90] hover:text-[#00225A]'
                }`}
              >
                SELL
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline text-base font-bold tracking-tight text-[#00225A]">{activeInstrument.tradingsymbol}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-[#536CF0] border border-[#D9E2F2] font-semibold">
                  {activeInstrument.exchange}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono mt-0.5">
                <span className="text-[#111114] font-bold">₹{marketPrice > 0 ? marketPrice.toFixed(2) : '—'}</span>
                {quote && (
                  <span className={`text-[11px] font-semibold ${quote.change >= 0 ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
                    {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)} ({quote.change_percent.toFixed(2)}%)
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={closeOrderTicket}
            className="p-1.5 rounded-xl text-[#6B7A90] hover:text-[#00225A] hover:bg-white/80 border border-transparent hover:border-[#D9E2F2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Order Form Body ────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} noValidate className="p-5 space-y-4 text-xs">
          
          {/* Variety Tabs: Regular | AMO */}
          <div className="flex items-center gap-5 pb-3 border-b border-[#D9E2F2] text-[#6B7A90]">
            <label className="flex items-center gap-2 cursor-pointer font-medium">
              <input
                type="radio"
                name="order_variety"
                checked={variety === 'REGULAR'}
                onChange={() => setVariety('REGULAR')}
                className="accent-[#00225A] w-3.5 h-3.5"
              />
              <span className={`text-xs ${variety === 'REGULAR' ? 'text-[#00225A] font-bold' : ''}`}>Regular Session</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-medium">
              <input
                type="radio"
                name="order_variety"
                checked={variety === 'AMO'}
                onChange={() => setVariety('AMO')}
                className="accent-[#00225A] w-3.5 h-3.5"
              />
              <span className={`text-xs ${variety === 'AMO' ? 'text-[#00225A] font-bold' : ''}`}>AMO (After Market)</span>
            </label>
          </div>

          {/* Product Type (MIS vs CNC / NRML) */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-[#6B7A90] uppercase font-semibold tracking-wider font-mono">Product Sizing</span>
            <div className="grid grid-cols-2 gap-2.5">
              {activeInstrument.instrument_type === 'EQUITY' ? (
                <>
                  <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    product === 'CNC' ? 'bg-[#EEF3FF] border-[#536CF0] text-[#00225A] shadow-2xs font-semibold' : 'bg-[#F7F8FA] border-[#D9E2F2] text-[#6B7A90] hover:border-[#BCCAE0]'
                  }`}>
                    <input
                      type="radio"
                      name="product_type"
                      checked={product === 'CNC'}
                      onChange={() => setProduct('CNC')}
                      className="accent-[#00225A]"
                    />
                    <div>
                      <span className="font-bold text-xs block text-[#00225A]">CNC</span>
                      <span className="text-[10px] text-[#6B7A90]">Longterm (Delivery)</span>
                    </div>
                  </label>

                  <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    product === 'MIS' ? 'bg-[#EEF3FF] border-[#536CF0] text-[#00225A] shadow-2xs font-semibold' : 'bg-[#F7F8FA] border-[#D9E2F2] text-[#6B7A90] hover:border-[#BCCAE0]'
                  }`}>
                    <input
                      type="radio"
                      name="product_type"
                      checked={product === 'MIS'}
                      onChange={() => setProduct('MIS')}
                      className="accent-[#00225A]"
                    />
                    <div>
                      <span className="font-bold text-xs block text-[#00225A]">MIS</span>
                      <span className="text-[10px] text-[#6B7A90]">Intraday (5x Leverage)</span>
                    </div>
                  </label>
                </>
              ) : (
                <>
                  <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    product === 'NRML' ? 'bg-[#EEF3FF] border-[#536CF0] text-[#00225A] shadow-2xs font-semibold' : 'bg-[#F7F8FA] border-[#D9E2F2] text-[#6B7A90] hover:border-[#BCCAE0]'
                  }`}>
                    <input
                      type="radio"
                      name="product_type"
                      checked={product === 'NRML'}
                      onChange={() => setProduct('NRML')}
                      className="accent-[#00225A]"
                    />
                    <div>
                      <span className="font-bold text-xs block text-[#00225A]">NRML</span>
                      <span className="text-[10px] text-[#6B7A90]">Overnight / Carryforward</span>
                    </div>
                  </label>

                  <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    product === 'MIS' ? 'bg-[#EEF3FF] border-[#536CF0] text-[#00225A] shadow-2xs font-semibold' : 'bg-[#F7F8FA] border-[#D9E2F2] text-[#6B7A90] hover:border-[#BCCAE0]'
                  }`}>
                    <input
                      type="radio"
                      name="product_type"
                      checked={product === 'MIS'}
                      onChange={() => setProduct('MIS')}
                      className="accent-[#00225A]"
                    />
                    <div>
                      <span className="font-bold text-xs block text-[#00225A]">MIS</span>
                      <span className="text-[10px] text-[#6B7A90]">Intraday Margin</span>
                    </div>
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Quantity & Lots Controls */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#6B7A90] uppercase font-semibold font-mono tracking-wider">
                {isDerivative ? 'Contract Sizing & Lots' : 'Quantity'}
              </span>
              <span className="font-mono text-[#536CF0] font-semibold">
                {contractSpec.lotDescription}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {isDerivative ? (
                <div>
                  <label className="block text-[10px] text-[#6B7A90] mb-1 font-mono font-medium">Number of Lots</label>
                  <div className="flex items-center border border-[#D9E2F2] rounded-xl bg-[#F7F8FA]">
                    <button
                      type="button"
                      onClick={() => handleLotsChange(lots - 1)}
                      className="px-2.5 py-1.5 text-[#6B7A90] hover:text-[#00225A] hover:bg-[#EEF3FF] transition-colors rounded-l-xl"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={lots}
                      onChange={(e) => handleLotsChange(parseInt(e.target.value) || 1)}
                      className="w-full bg-transparent text-center font-mono font-bold text-[#00225A] text-xs focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleLotsChange(lots + 1)}
                      className="px-2.5 py-1.5 text-[#6B7A90] hover:text-[#00225A] hover:bg-[#EEF3FF] transition-colors rounded-r-xl"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : null}

              <div className={isDerivative ? '' : 'col-span-2'}>
                <label className="block text-[10px] text-[#6B7A90] mb-1 font-mono font-medium">
                  Total {contractSpec.unit}
                </label>
                <div className="flex items-center border border-[#D9E2F2] rounded-xl bg-[#F7F8FA] px-3 py-1.5">
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-full bg-transparent font-mono font-bold text-[#00225A] text-xs focus:outline-none"
                  />
                  <span className="text-[11px] font-mono text-[#536CF0] shrink-0 ml-1 font-semibold">
                    {contractSpec.unit}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Price & Trigger Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-[#6B7A90] mb-1 font-mono font-medium">
                Price ({orderType === 'MARKET' ? 'Market' : 'Limit'})
              </label>
              <input
                type="number"
                step="any"
                disabled={orderType === 'MARKET'}
                value={orderType === 'MARKET' ? marketPrice : price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className={`w-full border rounded-xl px-3 py-2 font-mono text-xs focus:outline-none transition-colors ${
                  orderType === 'MARKET'
                    ? 'bg-[#F0F2F6] border-[#D9E2F2] text-[#94A3B8] cursor-not-allowed'
                    : 'bg-[#FFFFFF] border-[#D9E2F2] text-[#00225A] font-bold focus:border-[#536CF0]'
                }`}
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#6B7A90] mb-1 font-mono font-medium">Trigger Price</label>
              <input
                type="number"
                step="any"
                disabled={orderType !== 'SL' && orderType !== 'SL_M'}
                value={triggerPrice}
                onChange={(e) => setTriggerPrice(parseFloat(e.target.value) || 0)}
                className={`w-full border rounded-xl px-3 py-2 font-mono text-xs focus:outline-none transition-colors ${
                  orderType !== 'SL' && orderType !== 'SL_M'
                    ? 'bg-[#F0F2F6] border-[#D9E2F2] text-[#94A3B8] cursor-not-allowed'
                    : 'bg-[#FFFFFF] border-[#D9E2F2] text-[#00225A] font-bold focus:border-[#536CF0]'
                }`}
              />
            </div>
          </div>

          {/* Order Type Radio Pills (Market, Limit, SL, SL-M) */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-[#6B7A90] uppercase font-semibold font-mono tracking-wider">Execution Type</span>
            <div className="grid grid-cols-4 gap-1 w-full p-1 bg-[#F0F2F6] rounded-xl border border-[#D9E2F2]">
              {(['MARKET', 'LIMIT', 'SL', 'SL_M'] as OrderType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setOrderType(type)}
                  className={`py-1.5 text-xs font-semibold text-center rounded-lg transition-all active:scale-[0.96] ${
                    orderType === type
                      ? 'bg-[#00225A] text-white shadow-2xs font-bold'
                      : 'text-[#6B7A90] hover:text-[#00225A]'
                  }`}
                >
                  {type === 'SL_M' ? 'SL-M' : type}
                </button>
              ))}
            </div>
          </div>

          {/* Insufficient Funds Warning */}
          {isInsufficientFunds && (
            <div className="p-3 rounded-xl bg-[#FEF3F2] border border-[#D92D20]/30 text-[#D92D20] text-[11px] leading-relaxed font-medium">
              Insufficient virtual funds. Margin required: ₹{requiredMargin.toLocaleString('en-IN', { minimumFractionDigits: 2 })}, available cash: ₹{availableCash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}.
            </div>
          )}

          {/* ── Action Footer ─────────────────────────────────────────── */}
          <div className="pt-3.5 border-t border-[#D9E2F2] flex items-center justify-between">
            <div className="text-[11px] font-mono leading-tight">
              <div className="text-[#6B7A90]">
                Margin: <span className="text-[#00225A] font-bold">₹{requiredMargin.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="text-[#94A3B8] mt-0.5">
                Charges: ₹{charges.total_charges.toFixed(2)}
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={closeOrderTicket}
                className="btn-secondary px-4 py-2 text-xs rounded-xl font-semibold active:scale-[0.96] h-10"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || isInsufficientFunds || (orderType === 'MARKET' && marketPrice <= 0)}
                className={`px-6 py-2 text-xs font-bold rounded-xl shadow-md active:scale-[0.96] transition-all disabled:opacity-50 cursor-pointer h-10 flex items-center justify-center ${
                  transactionType === 'BUY'
                    ? 'bg-[#12B76A] hover:bg-[#0E9355] text-white shadow-[#12B76A]/20'
                    : 'bg-[#D92D20] hover:bg-[#B42318] text-white shadow-[#D92D20]/20'
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
