import React, { useState, useEffect } from 'react';
import { useTradingStore } from '../../store/useTradingStore';
import { FinancialCalculations } from '../../services/trading/FinancialCalculations';
import { marketDataService } from '../../services/market/MarketDataService';
import type { TransactionType, ProductType, OrderType } from '../../types/trading';
import { X, ArrowDownRight, ArrowUpRight, AlertCircle, ShieldAlert, RefreshCw } from 'lucide-react';

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

  const quote = quotes[activeInstrument.instrument_key] || quotes[activeInstrument.tradingsymbol];
  const marketPrice = quote && quote.last_price > 0 ? quote.last_price : (orderTicketInitialProps?.price || 0);

  const defaultProduct: ProductType =
    activeInstrument.instrument_type.startsWith('FUT') || activeInstrument.instrument_type.startsWith('OPT')
      ? 'NRML'
      : 'CNC';

  const [transactionType, setTransactionType] = useState<TransactionType>(
    orderTicketInitialProps?.transaction_type || 'BUY'
  );

  const [product, setProduct] = useState<ProductType>(
    orderTicketInitialProps?.product || defaultProduct
  );

  const [orderType, setOrderType] = useState<OrderType>(
    orderTicketInitialProps?.order_type || 'MARKET'
  );

  const lotSize = activeInstrument.lot_size || 1;
  const isDerivative = lotSize > 1;

  const [lots, setLots] = useState(1);
  const [quantity, setQuantity] = useState(lotSize);
  const [price, setPrice] = useState(marketPrice > 0 ? marketPrice : 0);
  const [triggerPrice, setTriggerPrice] = useState(marketPrice > 0 ? marketPrice : 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Immediately pre-fetch real live quote from Upstox if not yet in cache
  useEffect(() => {
    if (!isOrderTicketOpen) return;
    marketDataService.getQuote(activeInstrument.instrument_key).then((q) => {
      if (q && q.last_price > 0) {
        updateQuote(q);
        setPrice(q.last_price);
        setTriggerPrice(q.last_price);
      }
    });
  }, [isOrderTicketOpen, activeInstrument.instrument_key]);

  // Keep price updated when live quote arrives
  useEffect(() => {
    if (quote && quote.last_price > 0 && (price === 0 || orderType === 'MARKET')) {
      setPrice(quote.last_price);
      setTriggerPrice(quote.last_price);
    }
  }, [quote?.last_price, orderType]);

  // Sync state when orderTicketInitialProps changes
  useEffect(() => {
    if (orderTicketInitialProps) {
      if (orderTicketInitialProps.transaction_type) setTransactionType(orderTicketInitialProps.transaction_type);
      if (orderTicketInitialProps.product) setProduct(orderTicketInitialProps.product);
      if (orderTicketInitialProps.order_type) setOrderType(orderTicketInitialProps.order_type);
      if (orderTicketInitialProps.quantity) {
        setQuantity(orderTicketInitialProps.quantity);
        setLots(Math.max(1, Math.round(orderTicketInitialProps.quantity / lotSize)));
      }
      if (orderTicketInitialProps.price) {
        setPrice(orderTicketInitialProps.price);
        setTriggerPrice(orderTicketInitialProps.price);
      } else if (marketPrice > 0) {
        setPrice(marketPrice);
        setTriggerPrice(marketPrice);
      }
    } else {
      setQuantity(lotSize);
      setLots(1);
      if (marketPrice > 0) {
        setPrice(marketPrice);
        setTriggerPrice(marketPrice);
      }
    }
  }, [orderTicketInitialProps, lotSize, marketPrice]);

  if (!isOrderTicketOpen) return null;

  const handleLotsChange = (newLots: number) => {
    const validLots = Math.max(1, newLots);
    setLots(validLots);
    setQuantity(validLots * lotSize);
  };

  const handleQuantityChange = (newQty: number) => {
    const validQty = Math.max(1, newQty);
    setQuantity(validQty);
    if (lotSize > 1) {
      setLots(Math.ceil(validQty / lotSize));
    }
  };

  // Effective price used for calculations
  const effectivePrice = orderType === 'MARKET' ? marketPrice : price;

  // Margin calculation
  const requiredMargin = FinancialCalculations.calculateRequiredMargin({
    instrumentType: activeInstrument.instrument_type,
    product,
    transactionType,
    quantity,
    price: effectivePrice,
  });

  // Estimated regulatory charges
  const charges = FinancialCalculations.calculateCharges({
    instrumentType: activeInstrument.instrument_type,
    product,
    transactionType,
    quantity,
    price: effectivePrice,
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
      lot_size: lotSize,
      price: orderType === 'LIMIT' || orderType === 'SL' ? price : 0,
      trigger_price: orderType === 'SL' || orderType === 'SL_M' ? triggerPrice : 0,
    });
    setIsSubmitting(false);

    if (success) {
      closeOrderTicket();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1424]/80 backdrop-blur-md select-none">
      <div className="bg-[#0E1728] border border-[rgba(198,161,91,0.3)] rounded-2xl max-w-md w-full shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(198,161,91,0.15)] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Ticket Top Header */}
        <div className={`p-4 ${transactionType === 'BUY' ? 'bg-[#10B981]/10 border-b border-[#10B981]/25' : 'bg-[#F43F5E]/10 border-b border-[#F43F5E]/25'} flex items-center justify-between`}>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-[#0B1424] text-[#A1A8B3] border border-white/5">
                {activeInstrument.exchange}
              </span>
              <h3 className="text-sm font-bold text-[#F5F5F2] tracking-tight">
                {activeInstrument.tradingsymbol}
              </h3>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-[#A1A8B3] font-medium">LTP:</span>
              {marketPrice > 0 ? (
                <span className="text-xs font-mono font-bold text-[#F5F5F2]">
                  ₹{marketPrice.toFixed(2)}
                </span>
              ) : (
                <span className="text-[11px] text-[#C6A15B] font-medium flex items-center gap-1 font-mono">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Fetching Live Upstox...</span>
                </span>
              )}
              {quote && (
                <span className={`text-[11px] font-mono font-medium ${quote.change >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                  {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)} ({quote.change_percent.toFixed(2)}%)
                </span>
              )}
            </div>
          </div>
          <button
            onClick={closeOrderTicket}
            className="text-[#A1A8B3] hover:text-[#F5F5F2] p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* BUY / SELL Switch */}
          <div className="grid grid-cols-2 gap-2 bg-[#0B1424] p-1 rounded-xl border border-white/5">
            <button
              type="button"
              onClick={() => setTransactionType('BUY')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                transactionType === 'BUY'
                  ? 'bg-[#10B981] text-[#0B1424] shadow-[0_0_15px_rgba(16,185,129,0.35)] font-bold'
                  : 'text-[#A1A8B3] hover:text-[#F5F5F2]'
              }`}
            >
              BUY (Long)
            </button>
            <button
              type="button"
              onClick={() => setTransactionType('SELL')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                transactionType === 'SELL'
                  ? 'bg-[#F43F5E] text-white shadow-[0_0_15px_rgba(244,63,94,0.35)] font-bold'
                  : 'text-[#A1A8B3] hover:text-[#F5F5F2]'
              }`}
            >
              SELL (Short)
            </button>
          </div>

          {/* Product Type (CNC / MIS / NRML) */}
          <div>
            <label className="block text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wider mb-1.5">
              Product Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {activeInstrument.instrument_type === 'EQUITY' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setProduct('CNC')}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                      product === 'CNC'
                        ? 'bg-[#C6A15B]/20 border-[#C6A15B] text-[#E2C889] font-bold shadow-sm'
                        : 'bg-[#0B1424] border-[#1F2D48] text-[#8F9BAE] hover:text-white'
                    }`}
                  >
                    CNC (Delivery)
                  </button>
                  <button
                    type="button"
                    onClick={() => setProduct('MIS')}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                      product === 'MIS'
                        ? 'bg-[#C6A15B]/20 border-[#C6A15B] text-[#E2C889] font-bold shadow-sm'
                        : 'bg-[#0B1424] border-[#1F2D48] text-[#8F9BAE] hover:text-white'
                    }`}
                  >
                    MIS (Intraday 5x)
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setProduct('NRML')}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                      product === 'NRML'
                        ? 'bg-[#C6A15B]/20 border-[#C6A15B] text-[#E2C889] font-bold shadow-sm'
                        : 'bg-[#0B1424] border-[#1F2D48] text-[#8F9BAE] hover:text-white'
                    }`}
                  >
                    NRML (Overnight F&O)
                  </button>
                  <button
                    type="button"
                    onClick={() => setProduct('MIS')}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                      product === 'MIS'
                        ? 'bg-[#C6A15B]/20 border-[#C6A15B] text-[#E2C889] font-bold shadow-sm'
                        : 'bg-[#0B1424] border-[#1F2D48] text-[#8F9BAE] hover:text-white'
                    }`}
                  >
                    MIS (Intraday F&O)
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Order Type (MARKET / LIMIT / SL / SL-M) */}
          <div>
            <label className="block text-[11px] font-semibold text-[#8F9BAE] uppercase tracking-wider mb-1.5">
              Order Type
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['MARKET', 'LIMIT', 'SL', 'SL_M'] as OrderType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setOrderType(type)}
                  className={`py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    orderType === type
                      ? 'bg-gradient-to-r from-[#C6A15B] to-[#E2C889] text-[#0B1424] font-bold border-transparent shadow-sm'
                      : 'bg-[#0B1424] border-[#1F2D48] text-[#8F9BAE] hover:text-white'
                  }`}
                >
                  {type === 'SL_M' ? 'SL-M' : type}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Lots */}
          <div className="grid grid-cols-2 gap-3">
            {isDerivative ? (
              <div>
                <label className="block text-[11px] font-semibold text-[#8F9BAE] uppercase tracking-wider mb-1">
                  Lots (1 lot = {lotSize})
                </label>
                <input
                  type="number"
                  min="1"
                  value={lots}
                  onChange={(e) => handleLotsChange(parseInt(e.target.value) || 1)}
                  className="w-full bg-[#0B1424] border border-[#1F2D48] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#C6A15B]"
                />
              </div>
            ) : null}

            <div className={isDerivative ? '' : 'col-span-2'}>
              <label className="block text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wider mb-1">
                Total Quantity (Shares/Units)
              </label>
              <input
                type="number"
                min="1"
                step={lotSize > 1 ? lotSize : 1}
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                className="w-full bg-[#0B1424] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-[#F5F5F2] focus:outline-none focus:border-[#C6A15B]"
              />
            </div>
          </div>

          {/* Price & Trigger Price Inputs */}
          {(orderType === 'LIMIT' || orderType === 'SL') && (
            <div>
              <label className="block text-[11px] font-semibold text-[#A1A8B3] uppercase tracking-wider mb-1">
                Limit Price (₹)
              </label>
              <input
                type="number"
                step="0.05"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#0B1424] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-[#F5F5F2] focus:outline-none focus:border-[#C6A15B]"
              />
            </div>
          )}

          {(orderType === 'SL' || orderType === 'SL_M') && (
            <div>
              <label className="block text-[11px] font-semibold text-[#A1A8B3] uppercase tracking-wider mb-1">
                Trigger Price (₹)
              </label>
              <input
                type="number"
                step="0.05"
                value={triggerPrice}
                onChange={(e) => setTriggerPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#0B1424] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-[#F5F5F2] focus:outline-none focus:border-[#C6A15B]"
              />
            </div>
          )}

          {/* Financial Summary & Breakdown */}
          <div className="p-3 bg-[#0B1424] rounded-xl border border-[rgba(198,161,91,0.2)] text-xs space-y-1.5">
            <div className="flex justify-between text-[#A1A8B3]">
              <span>Required Margin / Funds:</span>
              <span className={`font-mono font-bold ${isInsufficientFunds ? 'text-[#F43F5E]' : 'text-[#F5F5F2]'}`}>
                ₹{requiredMargin.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-[#A1A8B3]">
              <span>Available Virtual Funds:</span>
              <span className="font-mono text-[#C6A15B]">
                ₹{availableCash.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-[#A1A8B3]/70 pt-1 border-t border-white/5 text-[11px]">
              <span>Est. Charges (Brokerage + STT + GST):</span>
              <span className="font-mono text-[#A1A8B3]">₹{charges.total_charges.toFixed(2)}</span>
            </div>
          </div>

          {/* Insufficient Funds Warning */}
          {isInsufficientFunds && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#F43F5E]/10 border border-[#F43F5E]/30 text-xs text-[#F43F5E]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Insufficient virtual funds to place this order.</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || isInsufficientFunds}
            className={`w-full py-3 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              transactionType === 'BUY'
                ? 'bg-[#10B981] hover:bg-[#059669] text-[#0B1424] shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                : 'bg-[#F43F5E] hover:bg-[#E11D48] text-white shadow-[0_0_20px_rgba(244,63,94,0.35)]'
            }`}
          >
            {isSubmitting
              ? 'Executing...'
              : `${transactionType} ${quantity} ${activeInstrument.tradingsymbol} (Simulated Paper Order)`}
          </button>
        </form>
      </div>
    </div>
  );
};
