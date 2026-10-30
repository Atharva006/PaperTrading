import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Search,
  LineChart,
  TrendingUp,
  Receipt,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useTradingStore } from '../../store/useTradingStore';

export const BeginnerGuideModal: React.FC<{
  onOpenSearch?: () => void;
}> = ({ onOpenSearch }) => {
  const { isGuideOpen, closeGuide, openOrderTicket, addToast } = useTradingStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Auto-launch guide on first arrival if never seen before
  useEffect(() => {
    try {
      const hasSeen = localStorage.getItem('cnrx_intro_seen');
      if (!hasSeen) {
        useTradingStore.getState().openGuide();
      }
    } catch {
      // localStorage unavailable fallback
    }
  }, []);

  // Manage focus capture and restoration
  useEffect(() => {
    if (isGuideOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      const timer = setTimeout(() => {
        const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable && focusable.length > 0) {
          focusable[0].focus();
        } else {
          modalRef.current?.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    } else {
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus();
      }
    }
  }, [isGuideOpen]);

  // Keyboard navigation & Focus Trap
  useEffect(() => {
    if (!isGuideOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      } else if (e.key === 'ArrowRight') {
        if (currentStep < steps.length - 1) setCurrentStep((prev) => prev + 1);
      } else if (e.key === 'ArrowLeft') {
        if (currentStep > 0) setCurrentStep((prev) => prev - 1);
      } else if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (
            document.activeElement === first ||
            document.activeElement === modalRef.current ||
            !modalRef.current.contains(document.activeElement)
          ) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !modalRef.current.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGuideOpen, currentStep]);

  const handleDismiss = () => {
    try {
      localStorage.setItem('cnrx_intro_seen', 'true');
    } catch {
      // ignore
    }
    closeGuide();
  };

  const handleFinish = () => {
    handleDismiss();
    addToast('success', 'Ready to Trade', 'Welcome! Test strategies safely with your ₹10,00,000 virtual balance.');
  };

  const steps = [
    {
      badge: 'WELCOME TO TRADING',
      title: 'Your ₹10,00,000 Institutional Virtual Sandbox',
      subtitle: 'Master the Indian markets without risking a single rupee of real capital.',
      icon: Sparkles,
      iconColor: 'text-[#00225A]',
      iconBg: 'bg-[#EEF3FF] border-[#D9E2F2]',
      description:
        'Every new trader starts with an initial virtual grant of ₹10,00,000 (₹10 Lakhs INR). Trade NSE Equities, Index & Stock Derivatives, and MCX Commodities in live market conditions. If your balance drops or you want a fresh start, use the "Reset Virtual Funds" feature anytime.',
      highlights: [
        { label: 'Virtual Grant', value: '₹10,00,000 INR', desc: 'Credited automatically on start' },
        { label: 'Risk Factor', value: 'Zero Real Risk', desc: 'Strictly simulated execution' },
        { label: 'Fresh Start', value: '1-Click Reset', desc: 'Restore balance anytime in menu' },
      ],
      tip: 'Pro-Tip: Treat virtual capital like your personal savings to build realistic emotional discipline.',
    },
    {
      badge: 'STEP 1: MARKET FEEDS & SCRIPS',
      title: 'Live Exchange Ticks & Instant Scrip Search',
      subtitle: 'Stream real-time price action across NSE benchmark indices & commodities.',
      icon: Search,
      iconColor: 'text-[#536CF0]',
      iconBg: 'bg-[#EEF3FF] border-[#D9E2F2]',
      description:
        'The persistent panel on your left streams live price ticks for NIFTY 50, BANK NIFTY, SENSEX, leading blue-chips, and MCX Gold/Silver/Crude. Press ⌘K (or Ctrl+K) anywhere to search and trade any scrip instantly.',
      highlights: [
        { label: 'Scrip Lookup', value: 'Press ⌘K / Ctrl+K', desc: 'Instant universal search modal' },
        { label: 'Feeds', value: 'Direct Exchange', desc: 'Microsecond tick telemetry' },
        { label: 'Watchlists', value: 'Multi-Tabbed', desc: 'Indices, Equities & Commodities' },
      ],
      action: {
        text: 'Try ⌘K Search Now',
        onClick: () => {
          handleDismiss();
          if (onOpenSearch) onOpenSearch();
        },
      },
      tip: 'Click any ticker on the left market watch to instantly load its live chart and order book.',
    },
    {
      badge: 'STEP 2: TERMINAL & CHARTING',
      title: 'Interactive High-Precision Charts & 5-Level Depth',
      subtitle: 'Deep technical analysis and real-time market depth at your fingertips.',
      icon: LineChart,
      iconColor: 'text-[#12B76A]',
      iconBg: 'bg-[#12B76A]/10 border-[#12B76A]/20',
      description:
        'Head over to the Terminal tab to inspect live candlestick charts across multiple timeframes (1m, 5m, 15m, 1D). Analyze the Level 2 Market Depth (5 Bid & 5 Ask levels) to gauge institutional liquidity and support/resistance.',
      highlights: [
        { label: 'Chart Engine', value: 'Canvas High-Speed Engine', desc: 'Smooth responsive candlesticks' },
        { label: 'Order Depth', value: 'Level 2 (5x5)', desc: 'Inspect bid/ask size queues' },
        { label: 'Timeframes', value: '1m to 1D', desc: 'Intraday ticks to daily candles' },
      ],
      action: {
        text: 'Open Terminal Page',
        onClick: () => {
          handleDismiss();
          navigate('/dashboard/terminal');
        },
      },
      tip: 'Use the crosshair and drawing tools on the chart to map key support, resistance, and Fibonacci retracements.',
    },
    {
      badge: 'STEP 3: ORDER EXECUTION ENGINE',
      title: 'Realistic Fills, Leverage & Slippage Modeling',
      subtitle: 'Trade Market, Limit, and Stop-Loss orders with realistic execution physics.',
      icon: TrendingUp,
      iconColor: 'text-[#00225A]',
      iconBg: 'bg-[#EEF3FF] border-[#D9E2F2]',
      description:
        'Click the "Order" button or click Buy/Sell on any instrument. Choose between Delivery (CNC - 1x margin) and Intraday (MIS - 5x leverage). Test Market, Limit, and SL-M orders. Limit orders remain pending until live market prices trade through your trigger.',
      highlights: [
        { label: 'Leverage', value: '5x for MIS', desc: 'Intraday margin multiplier' },
        { label: 'Order Types', value: 'MKT / LMT / SL', desc: 'Simulated pending order queue' },
        { label: 'Fills', value: 'Tick-Accurate', desc: 'Slippage and tick-size (₹0.05)' },
      ],
      action: {
        text: 'Preview Order Ticket',
        onClick: () => {
          handleDismiss();
          openOrderTicket();
        },
      },
      tip: 'Stop-Loss Market (SL-M) orders trigger automatically when the live market crosses your price threshold.',
    },
    {
      badge: 'STEP 4: REGULATORY LEDGER & RISK ENGINE',
      title: 'Paise-Precision Indian Taxes & Quant Analytics',
      subtitle: 'Accurate STT, GST, and statutory fee deductions to reflect genuine net profitability.',
      icon: Receipt,
      iconColor: 'text-[#536CF0]',
      iconBg: 'bg-[#EEF3FF] border-[#D9E2F2]',
      description:
        'Unlike unrealistic paper trading apps that hide costs, the platform calculates Securities Transaction Tax (STT), GST (18%), Exchange turnover charges, Stamp Duty, and statutory regulatory fees on every trade. Track your Sharpe ratio, win rate, and peak drawdown in P&L Analytics.',
      highlights: [
        { label: 'Taxes', value: 'STT + GST (18%)', desc: 'Calculated down to the paise' },
        { label: 'P&L Split', value: 'Gross vs Net', desc: 'Clear view of real net profit' },
        { label: 'Quant Suite', value: 'Sharpe & Drawdown', desc: 'Institutional risk telemetry' },
      ],
      action: {
        text: 'View Analytics Suite',
        onClick: () => {
          handleDismiss();
          navigate('/dashboard/analytics');
        },
      },
      tip: 'Always monitor your Net P&L in the Trade Book to verify if your strategy remains profitable after statutory charges.',
    },
  ];

  if (!isGuideOpen) return null;

  const current = steps[currentStep];
  const StepIcon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#00225A]/35 backdrop-blur-md transition-opacity"
        onClick={handleDismiss}
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-modal-title"
        tabIndex={-1}
        className="relative w-full max-w-2xl bg-white border border-[#D9E2F2] rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col font-sans focus:outline-none text-[#111114]"
      >
        
        {/* Top Accent Strip */}
        <div className="h-1 bg-gradient-to-r from-[#00225A] via-[#536CF0] to-[#00225A] w-full" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-[#D9E2F2] flex items-start justify-between bg-[#F7F8FA]">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${current.iconBg} shadow-xs`}>
              <StepIcon className={`w-5 h-5 ${current.iconColor}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#536CF0] uppercase">
                  {current.badge}
                </span>
                <span className="text-[10px] text-[#6B7A90] font-mono">
                  · Step {currentStep + 1} of {steps.length}
                </span>
              </div>
              <h2 id="guide-modal-title" className="text-lg sm:text-xl font-display font-bold text-[#00225A] mt-0.5 tracking-tight">
                {current.title}
              </h2>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-[#6B7A90] hover:text-[#00225A] hover:bg-[#EEF3FF] transition-colors cursor-pointer"
            title="Close guide (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="px-6 py-2.5 bg-white border-b border-[#D9E2F2] flex items-center justify-between gap-1.5">
          {steps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`flex-1 h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentStep
                  ? 'bg-[#00225A] shadow-xs'
                  : idx < currentStep
                  ? 'bg-[#536CF0]'
                  : 'bg-[#D9E2F2]'
              }`}
              title={`Go to step ${idx + 1}`}
            />
          ))}
        </div>

        {/* Step Content Body */}
        <div className="p-5 sm:p-6 space-y-5 flex-1 overflow-y-auto max-h-[60vh] bg-white">
          <p className="text-xs sm:text-sm text-[#6B7A90] leading-relaxed">
            {current.description}
          </p>

          {/* 3 Metric / Feature Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {current.highlights.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#D9E2F2] hover:border-[#536CF0]/40 transition-colors shadow-xs"
              >
                <span className="text-[10px] text-[#6B7A90] font-mono uppercase tracking-wider block">
                  {item.label}
                </span>
                <span className="text-sm font-bold text-[#00225A] mt-0.5 block font-mono">
                  {item.value}
                </span>
                <span className="text-[10px] text-[#6B7A90] mt-1 block leading-tight">
                  {item.desc}
                </span>
              </div>
            ))}
          </div>

          {/* Optional Action Button (Direct Interactive Try) */}
          {current.action && (
            <div className="pt-1 flex items-center gap-3">
              <button
                onClick={current.action.onClick}
                className="bg-white hover:bg-[#F7F8FA] border border-[#D9E2F2] text-[#00225A] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <span>{current.action.text}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#536CF0]" />
              </button>
              <span className="text-[11px] text-[#6B7A90] italic">
                Opens the feature directly so you can try it now
              </span>
            </div>
          )}

          {/* Pro-Tip Box */}
          <div className="p-3.5 rounded-xl bg-[#EEF3FF] border border-[#D9E2F2] flex items-start gap-2.5 text-xs text-[#00225A]">
            <Zap className="w-4 h-4 text-[#536CF0] shrink-0 mt-0.5" />
            <p className="leading-relaxed">{current.tip}</p>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-[#D9E2F2] bg-[#F7F8FA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Quick Keyboard Hint */}
          <div className="flex items-center gap-2 text-[11px] text-[#6B7A90] font-mono">
            <span>Use keys:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#D9E2F2] text-[10px] text-[#00225A] shadow-xs">←</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#D9E2F2] text-[10px] text-[#00225A] shadow-xs">→</kbd>
            <span className="text-[10px] text-[#6B7A90]">or click Next</span>
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="bg-white hover:bg-[#F7F8FA] text-[#00225A] border border-[#D9E2F2] px-3.5 py-2 text-xs rounded-xl flex items-center gap-1.5 font-semibold shadow-xs cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="bg-[#00225A] hover:bg-[#536CF0] text-white px-5 py-2 text-xs rounded-xl font-bold flex items-center gap-1.5 shadow-xs active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Next Step</span>
                <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="bg-[#00225A] hover:bg-[#536CF0] text-white px-6 py-2 text-xs rounded-xl font-bold flex items-center gap-1.5 shadow-xs active:scale-[0.98] transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Launch Trading Desk</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};