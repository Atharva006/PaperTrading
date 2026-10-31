import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Target, 
  Shield, 
  Zap, 
  TrendingUp, 
  Crosshair, 
  Activity, 
  Lock, 
  Database, 
  ChevronRight, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  Flame, 
  Scale, 
  ArrowUpRight, 
  ArrowDownRight, 
  Check, 
  X, 
  Sparkles,
  BarChart3,
  RefreshCw,
  Wallet,
  Clock,
  Award,
  Play,
  Menu,
  ChevronDown,
  HelpCircle
} from 'lucide-react';
import { useTradingStore } from '../store/useTradingStore';
import { INDIAN_INSTRUMENTS_MASTER } from '../services/market/indianInstruments';
import { SEO } from '../components/common/SEO';

// Spotlight ticker items for the continuous marquee
const TICKER_ITEMS = [
  { symbol: 'NIFTY 50', name: 'Nifty 50 Index', exchange: 'NSE', price: 24850.50, change: 145.20, pct: 0.59 },
  { symbol: 'BANKNIFTY', name: 'Bank Nifty Index', exchange: 'NSE', price: 51240.80, change: -112.40, pct: -0.22 },
  { symbol: 'GOLDM', name: 'Gold Mini (100g)', exchange: 'MCX', price: 76420.00, change: 380.00, pct: 0.50 },
  { symbol: 'SILVERM', name: 'Silver Mini (5kg)', exchange: 'MCX', price: 91540.00, change: 620.00, pct: 0.68 },
  { symbol: 'CRUDEOIL', name: 'Crude Oil (100 BBL)', exchange: 'MCX', price: 6185.00, change: -42.00, pct: -0.67 },
  { symbol: 'RELIANCE', name: 'Reliance Industries', exchange: 'NSE', price: 2985.40, change: 24.80, pct: 0.84 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', exchange: 'NSE', price: 1682.15, change: -8.30, pct: -0.49 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', exchange: 'NSE', price: 4210.00, change: 38.50, pct: 0.92 },
  { symbol: 'NATURALGAS', name: 'Natural Gas (1250 mmBtu)', exchange: 'MCX', price: 215.40, change: 4.80, pct: 2.28 },
  { symbol: 'TATASTEEL', name: 'Tata Steel Ltd', exchange: 'NSE', price: 158.90, change: 1.85, pct: 1.18 },
];

interface DemoSimPosition {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  qty: number;
  entryPrice: number;
  currentPrice: number;
  multiplier: number;
  pnl: number;
  pnlPct: number;
}

const DEMO_MULTIPLIERS: Record<string, number> = {
  RELIANCE: 1,
  NIFTY: 25,
  GOLDM: 10,
  SILVERM: 5,
};

const FAQ_ITEMS = [
  {
    question: 'What is Cendrix Capital?',
    answer:
      'Cendrix Capital is an institutional-grade free paper trading platform and live Indian stock market simulator for equities, F&O derivatives, and MCX commodities. It provides traders with ₹10,00,000 in virtual trading capital, real-time exchange ticks, authentic statutory tax modeling (STT, GST, Stamp Duty), and MIS 5x leverage in a zero-risk simulated environment.',
  },
  {
    question: 'Is Cendrix Capital a 100% free paper trading platform?',
    answer:
      'Yes. Cendrix Capital provides a completely free paper trading platform equipped with ₹10,00,000 in virtual trading capital. Traders can practice execution on Indian equities, options, and commodities without risking actual funds or paying subscription fees.',
  },
  {
    question: 'How does this live stock market simulator replicate authentic trading conditions?',
    answer:
      'Our live stock market simulator matches orders against real-time NSE and MCX tick feeds with sub-millisecond execution. Crucially, Cendrix Capital accounts for realistic exchange margin rules (MIS 5x Intraday, CNC/NRML) and statutory taxes including STT, CTT, GST, and Stamp Duty, ensuring your simulated edge reflects live trading reality.',
  },
  {
    question: 'Which market segments does this Indian stock market simulator cover?',
    answer:
      'The platform covers major Indian exchange segments: NSE Cash Equities (including NIFTY 50 and large-caps), NSE F&O index derivatives (NIFTY 50, BANKNIFTY), and MCX Commodities contracts (Gold Mini, Silver Mini, Crude Oil, and Natural Gas).',
  },
  {
    question: 'How does this virtual trading platform calculate margin leverage and risk?',
    answer:
      'Cendrix Capital implements institutional margin verification models. Intraday equity orders utilize standard MIS 5x margin leverage, while overnight and commodity positions enforce full exchange margin requirements. Real-time portfolio telemetry tracks Value-at-Risk (VaR), max drawdown, and margin utilization.',
  },
  {
    question: 'Do I need brokerage credentials or KYC to use this demo trading platform?',
    answer:
      'No. You do not need to connect external broker APIs or submit KYC documentation. Our demo trading platform features instant 1-click institutional auto-connect, allowing you to begin simulated trading immediately.',
  },
];

export default function Landing() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeAssetTab, setActiveAssetTab] = useState<'equities' | 'derivatives' | 'commodities'>('commodities');
  const { quotes } = useTradingStore();

  // Interactive Mini-Terminal Demo State
  const [demoSymbol, setDemoSymbol] = useState<'GOLDM' | 'NIFTY' | 'RELIANCE' | 'SILVERM'>('GOLDM');
  const [demoSide, setDemoSide] = useState<'BUY' | 'SELL'>('BUY');
  const [demoQty, setDemoQty] = useState(1);
  const [demoPositions, setDemoPositions] = useState<DemoSimPosition[]>([
    {
      id: 'demo-pos-1',
      symbol: 'GOLDM 05NOV FUT',
      side: 'BUY',
      qty: 1,
      entryPrice: 76180,
      currentPrice: 76420,
      multiplier: 10,
      pnl: 2400,
      pnlPct: 0.32,
    }
  ]);
  const [demoExecutedAlert, setDemoExecutedAlert] = useState<{ side: 'BUY' | 'SELL'; price: number } | null>(null);
  const demoAlertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (demoAlertTimerRef.current !== null) {
        clearTimeout(demoAlertTimerRef.current);
      }
    };
  }, []);

  // Ticking simulated price updates for demo positions
  useEffect(() => {
    const interval = setInterval(() => {
      setDemoPositions((prev) =>
        prev.map((pos) => {
          const delta = (Math.random() - 0.48) * (pos.symbol.includes('GOLD') ? 15 : 2.5);
          const newPrice = Math.max(1, pos.currentPrice + delta);
          const mult = pos.multiplier || 1;
          const pnl = pos.side === 'BUY' 
            ? (newPrice - pos.entryPrice) * pos.qty * mult
            : (pos.entryPrice - newPrice) * pos.qty * mult;
          const pnlPct = ((newPrice - pos.entryPrice) / pos.entryPrice) * (pos.side === 'BUY' ? 100 : -100);
          return {
            ...pos,
            currentPrice: Number(newPrice.toFixed(2)),
            pnl: Number(pnl.toFixed(2)),
            pnlPct: Number(pnlPct.toFixed(2)),
          };
        })
      );
    }, 2400);

    return () => clearInterval(interval);
  }, []);

  const handleSimulateTrade = (e: React.FormEvent) => {
    e.preventDefault();
    const keyMap: Record<string, string> = {
      GOLDM: INDIAN_INSTRUMENTS_MASTER.find((i) => i.tradingsymbol.startsWith('GOLDM'))?.instrument_key ?? 'MCX_FO|495213',
      NIFTY: INDIAN_INSTRUMENTS_MASTER.find((i) => i.tradingsymbol === 'NIFTY 50')?.instrument_key ?? 'NSE_INDEX|Nifty 50',
      RELIANCE: INDIAN_INSTRUMENTS_MASTER.find((i) => i.tradingsymbol === 'RELIANCE')?.instrument_key ?? 'NSE_EQ|INE002A01018',
      SILVERM: INDIAN_INSTRUMENTS_MASTER.find(
        (i) => i.tradingsymbol.startsWith('SILVERM') && !i.tradingsymbol.startsWith('SILVERMIC')
      )?.instrument_key ?? 'MCX_FO|495214',
    };
    const liveQ = quotes[keyMap[demoSymbol]];
    const fallbackPrices: Record<string, number> = {
      GOLDM: 76420,
      NIFTY: 24850,
      RELIANCE: 2985,
      SILVERM: 91540,
    };
    const fillPrice = (liveQ && liveQ.last_price > 0) ? liveQ.last_price : (fallbackPrices[demoSymbol] || 1000);
    const multiplier = DEMO_MULTIPLIERS[demoSymbol] || 1;

    const newPos: DemoSimPosition = {
      id: `demo-${Date.now()}`,
      symbol: demoSymbol === 'GOLDM' ? 'GOLDM 05NOV FUT' : demoSymbol === 'SILVERM' ? 'SILVERM 05DEC FUT' : demoSymbol,
      side: demoSide,
      qty: demoQty,
      entryPrice: fillPrice,
      currentPrice: fillPrice,
      multiplier,
      pnl: 0,
      pnlPct: 0,
    };
    setDemoPositions((prev) => [newPos, ...prev.slice(0, 3)]);
    if (demoAlertTimerRef.current !== null) {
      clearTimeout(demoAlertTimerRef.current);
    }
    setDemoExecutedAlert({ side: demoSide, price: fillPrice });
    demoAlertTimerRef.current = setTimeout(() => {
      setDemoExecutedAlert(null);
      demoAlertTimerRef.current = null;
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#FCFCFC] text-[#111114] relative overflow-x-hidden font-sans selection:bg-[#536CF0] selection:text-white">
      <SEO
        title="Cendrix Capital — Free Paper Trading Platform & Indian Stock Market Simulator"
        description="Experience Cendrix Capital: India's premier free paper trading platform & live stock market simulator. Trade NSE equities, NIFTY 50 options, and MCX commodities with ₹10,00,000 virtual capital in a zero-risk virtual trading platform."
        canonical="https://cendrix-capital-stf.vercel.app/"
        keywords="Free Paper Trading Platform, Live Stock Market Simulator, Indian Stock Market Simulator, Virtual Trading Platform, Demo Trading Platform, Nifty 50 simulator, Bank Nifty options paper trading, MCX commodities simulator, NSE trading simulator, mock trading India, Cendrix Capital"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          '@id': 'https://cendrix-capital-stf.vercel.app/#faq',
          'isPartOf': {
            '@id': 'https://cendrix-capital-stf.vercel.app/#website',
          },
          'about': {
            '@id': 'https://cendrix-capital-stf.vercel.app/#organization',
          },
          'mainEntity': FAQ_ITEMS.map((item) => ({
            '@type': 'Question',
            'name': item.question,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': item.answer,
            },
          })),
        }}
      />
      
      {/* Background Soft Mesh Tint */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00225A05_1px,transparent_1px),linear-gradient(to_bottom,#00225A05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-[-10%] left-[25%] w-[50%] h-[40%] bg-[#536CF0]/5 rounded-full blur-[140px]" />
        <div className="absolute top-[45%] right-[-10%] w-[40%] h-[40%] bg-[#00225A]/5 rounded-full blur-[140px]" />
      </div>

      {/* ── 1. Top Institutional Navigation Bar ─────────────────────────── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-[#D9E2F2] py-3' : 'bg-transparent py-4 sm:py-5'}`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Brand Lockup */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#EEF3FF] border border-[#D9E2F2] flex items-center justify-center p-1.5 overflow-hidden shadow-sm shrink-0">
              <img src="/cendrix-logo.png" alt="Cendrix Capital" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-display font-bold tracking-tight text-[#00225A] whitespace-nowrap">
                  CENDRIX CAPITAL
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono text-[#00225A] bg-[#EEF3FF] px-1.5 py-0.5 rounded border border-[#D9E2F2] uppercase font-bold shrink-0">
                  CNRX
                </span>
              </div>
              <p className="text-[8px] sm:text-[9px] font-mono tracking-wider text-[#6B7A90] uppercase whitespace-nowrap">
                Simulated Fund Workstation
              </p>
            </div>
          </div>

          {/* Desktop Nav Links (Full 6-Item Bar on Extra-Large Screens) */}
          <div className="hidden xl:flex items-center gap-1 text-xs font-semibold text-[#6B7A90] shrink-0 mx-2">
            <a href="#features" className="px-3 py-1.5 rounded-full hover:text-[#00225A] hover:bg-[#F7F8FA] transition-all whitespace-nowrap">What We Provide</a>
            <a href="#analytics-preview" className="px-3 py-1.5 rounded-full hover:text-[#00225A] hover:bg-[#F7F8FA] transition-all whitespace-nowrap">Risk Analytics</a>
            <a href="#advantage" className="px-3 py-1.5 rounded-full hover:text-[#00225A] hover:bg-[#F7F8FA] transition-all whitespace-nowrap">Our Advantage</a>
            <a href="#demo" className="px-3 py-1.5 rounded-full hover:text-[#00225A] hover:bg-[#F7F8FA] transition-all flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A] animate-pulse" />
              <span>Interactive Demo</span>
            </a>
            <a href="#pipeline" className="px-3 py-1.5 rounded-full hover:text-[#00225A] hover:bg-[#F7F8FA] transition-all whitespace-nowrap">Data Gateway</a>
            <a href="#commodities" className="px-3 py-1.5 rounded-full hover:text-[#00225A] hover:bg-[#F7F8FA] transition-all whitespace-nowrap">Commodities</a>
          </div>

          {/* Large Screen Nav Links (Curated 4-Item Bar on 1024px-1279px) */}
          <div className="hidden lg:flex xl:hidden items-center gap-1 text-xs font-semibold text-[#6B7A90] shrink-0">
            <a href="#features" className="px-2.5 py-1.5 rounded-full hover:text-[#00225A] hover:bg-[#F7F8FA] transition-all whitespace-nowrap">Platform</a>
            <a href="#analytics-preview" className="px-2.5 py-1.5 rounded-full hover:text-[#00225A] hover:bg-[#F7F8FA] transition-all whitespace-nowrap">Analytics</a>
            <a href="#demo" className="px-2.5 py-1.5 rounded-full hover:text-[#00225A] hover:bg-[#F7F8FA] transition-all whitespace-nowrap flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A] animate-pulse" />
              <span>Demo</span>
            </a>
            <a href="#commodities" className="px-2.5 py-1.5 rounded-full hover:text-[#00225A] hover:bg-[#F7F8FA] transition-all whitespace-nowrap">Commodities</a>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link 
              to="/login" 
              className="hidden sm:inline-flex text-xs font-semibold text-[#6B7A90] hover:text-[#00225A] transition-colors px-3 py-1.5 font-mono whitespace-nowrap"
            >
              Sign In / Register
            </Link>
            <Link 
              to="/dashboard" 
              className="btn-primary text-xs py-2 px-3.5 sm:px-4 shadow-sm flex items-center gap-1.5 active:scale-[0.97] whitespace-nowrap shrink-0"
            >
              <span>Launch Workstation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 text-[#6B7A90] hover:text-[#00225A] rounded-lg hover:bg-[#F7F8FA]"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-[#00225A]" /> : <Menu className="w-5 h-5 text-[#00225A]" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white/98 backdrop-blur-xl border-b border-[#D9E2F2] px-4 py-4 space-y-2 text-sm font-medium shadow-lg animate-fadeIn">
            <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-[#111114] hover:text-[#00225A] hover:bg-[#F7F8FA]">What We Provide</a>
            <a href="#analytics-preview" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-[#111114] hover:text-[#00225A] hover:bg-[#F7F8FA]">Risk Analytics</a>
            <a href="#advantage" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-[#111114] hover:text-[#00225A] hover:bg-[#F7F8FA]">Our Advantage</a>
            <a href="#demo" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-[#111114] hover:text-[#00225A] hover:bg-[#F7F8FA] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A] animate-pulse" />
              <span>Interactive Demo</span>
            </a>
            <a href="#pipeline" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-[#111114] hover:text-[#00225A] hover:bg-[#F7F8FA]">Data Gateway</a>
            <a href="#commodities" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-[#111114] hover:text-[#00225A] hover:bg-[#F7F8FA]">Commodities</a>
            <div className="pt-2 border-t border-[#D9E2F2]">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-[#00225A] font-bold font-mono">Sign In / Register</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── 2. Live Marquee Ticker Ribbon (Real-Time Motion) ─────────────── */}
      <div className="relative z-20 pt-24 sm:pt-28 border-b border-[#D9E2F2] bg-[#F7F8FA] overflow-hidden">
        <div className="flex items-center">
          <div className="px-4 py-2 bg-white border-r border-[#D9E2F2] text-[10px] font-mono text-[#00225A] uppercase font-bold shrink-0 flex items-center gap-2 z-20 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#12B76A] animate-ping" />
            <span className="tracking-wider whitespace-nowrap">Exchange Stream</span>
          </div>

          <div 
            className="overflow-hidden whitespace-nowrap flex-1 py-2 relative"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0px, black 32px, black calc(100% - 32px), transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0px, black 32px, black calc(100% - 32px), transparent 100%)'
            }}
          >
            <div className="animate-marquee gap-8 items-center text-xs font-mono pl-4">
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => {
                const tickerInstrument = INDIAN_INSTRUMENTS_MASTER.find(
                  (instrument) =>
                    instrument.tradingsymbol === item.symbol ||
                    instrument.tradingsymbol.replace(/\s+/g, '') === item.symbol ||
                    instrument.tradingsymbol.startsWith(item.symbol)
                );
                const liveQuote = tickerInstrument
                  ? quotes[tickerInstrument.instrument_key] ?? quotes[item.symbol]
                  : quotes[item.symbol];
                const displayPrice = liveQuote?.last_price || item.price;
                const displayChange = liveQuote?.change !== undefined ? liveQuote.change : item.change;
                const displayPct = liveQuote?.change_percent !== undefined ? liveQuote.change_percent : item.pct;
                const isPos = displayChange >= 0;

                return (
                  <div key={idx} className="inline-flex items-center gap-2.5 px-3 py-1 rounded-lg hover:bg-white transition-colors">
                    <span className="font-semibold text-[#00225A]">{item.symbol}</span>
                    <span className="text-[9px] text-[#6B7A90] px-1.5 py-0.5 rounded bg-[#EEF3FF] border border-[#D9E2F2] font-sans">
                      {item.exchange}
                    </span>
                    <span className="font-bold text-[#111114]">₹{displayPrice.toFixed(2)}</span>
                    <span className={`text-[11px] font-semibold flex items-center ${isPos ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
                      {isPos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {isPos ? '+' : ''}{displayChange.toFixed(2)} ({displayPct.toFixed(2)}%)
                    </span>
                    <span className="text-[#D9E2F2] mx-2">|</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10">

        {/* ── 3. Hero Section ────────────────────────────────────────────── */}
        <section className="pt-16 pb-24 md:pt-24 md:pb-32">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            
            {/* Live Indicator Pill */}
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 bg-[#EEF3FF] border border-[#D9E2F2] rounded-full text-[11px] font-semibold text-[#00225A] uppercase tracking-widest font-mono shadow-sm animate-float">
              <span className="w-2 h-2 rounded-full bg-[#12B76A] animate-pulse" />
              <span>Free Paper Trading Platform · Indian Stock Market Simulator</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-semibold text-[#00225A] tracking-[-0.04em] mb-8 leading-[1.05] max-w-5xl mx-auto">
              <span className="block text-xl sm:text-2xl md:text-3xl font-mono text-[#536CF0] uppercase tracking-widest mb-3 font-semibold">
                Cendrix Capital
              </span>
              Precision. Discipline.<br />
              <span className="text-[#536CF0]">
                Institutional Execution.
              </span>
            </h1>

            {/* Subtitle Value Proposition */}
            <p className="text-base sm:text-lg md:text-xl text-[#6B7A90] mb-10 leading-relaxed max-w-3xl mx-auto font-normal">
              Cendrix Capital is India’s premier <strong className="text-[#00225A] font-semibold">free paper trading platform</strong> and <strong className="text-[#00225A] font-semibold">live stock market simulator</strong> for NSE/BSE Equities, F&amp;O Options, and MCX Commodities. Experience a high-fidelity <strong className="text-[#00225A] font-semibold">virtual trading platform</strong> and <strong className="text-[#00225A] font-semibold">demo trading platform</strong> with verified statutory tax modeling, margin calculation, and an audited double-entry cash ledger.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
              <Link 
                to="/dashboard" 
                className="w-full sm:w-auto btn-primary py-3.5 px-8 text-xs tracking-wider font-bold shadow-md flex items-center justify-center gap-2 rounded-xl active:scale-[0.97]"
              >
                <span>Launch Workstation (₹10L Virtual)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a 
                href="#demo" 
                className="w-full sm:w-auto btn-secondary py-3.5 px-8 text-xs tracking-wider font-semibold flex items-center justify-center gap-2 rounded-xl active:scale-[0.97]"
              >
                <Play className="w-4 h-4 text-[#00225A]" />
                <span>Test Live Interactive Demo</span>
              </a>
              <Link 
                to="/dashboard/terminal" 
                className="w-full sm:w-auto px-6 py-3.5 text-xs font-mono font-semibold text-[#6B7A90] hover:text-[#00225A] transition-colors rounded-xl"
              >
                Level 2 Terminal →
              </Link>
            </div>

            {/* Workstation Showcase Graphic with Floating Light HUD */}
            <div className="relative mx-auto max-w-5xl rounded-3xl overflow-hidden border border-[#D9E2F2] shadow-[0_20px_60px_rgba(0,34,90,0.08)] bg-white p-2 sm:p-3 group">
              <img 
                src="/cendrix-terminal-hero.jpg" 
                alt="Cendrix Capital — Free Paper Trading Platform and Live Stock Market Simulator" 
                width={1200}
                height={630}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="w-full h-auto rounded-2xl object-cover transform transition-transform duration-700 group-hover:scale-[1.01]"
              />

              {/* Floating Live Telemetry HUD Overlays */}
              <div className="absolute top-6 left-6 sm:top-8 sm:left-8 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 text-left shadow-xl border border-[#D9E2F2] font-mono text-xs">
                <div className="flex items-center gap-2 text-[#00225A] text-[10px] font-bold uppercase tracking-wider mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#12B76A] animate-ping" />
                  <span>Direct Gateway Active</span>
                </div>
                <div className="text-sm sm:text-base font-bold text-[#00225A] font-display">Direct Exchange Binary Feed</div>
                <div className="text-[11px] text-[#6B7A90]">Latency: &lt; 1ms matching</div>
              </div>

              <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 text-right shadow-xl border border-[#D9E2F2] font-mono text-xs">
                <div className="text-[10px] text-[#6B7A90] uppercase tracking-wider mb-0.5">Virtual Equity Balance</div>
                <div className="text-base sm:text-lg font-bold text-[#12B76A]">₹10,00,000.00</div>
                <div className="text-[10px] text-[#00225A] font-semibold">100% Risk Free Paper Capital</div>
              </div>
            </div>

          </div>
        </section>

        {/* ── 4. Key Performance Metrics Bar ─────────────────────────────── */}
        <section className="py-12 border-y border-[#D9E2F2] bg-[#F7F8FA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
              <div className="bg-white p-6 rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)]">
                <p className="text-2xl sm:text-3xl font-mono font-bold text-[#00225A] mb-1">₹10,00,000</p>
                <p className="text-[10px] uppercase tracking-wider text-[#6B7A90] font-semibold font-mono">Virtual Starting Balance</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)]">
                <p className="text-2xl sm:text-3xl font-mono font-bold text-[#12B76A] mb-1">100% LIVE</p>
                <p className="text-[10px] uppercase tracking-wider text-[#6B7A90] font-semibold font-mono">Direct Exchange Market Feed</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)]">
                <p className="text-2xl sm:text-3xl font-mono font-bold text-[#00225A] mb-1">&lt; 1 ms</p>
                <p className="text-[10px] uppercase tracking-wider text-[#6B7A90] font-semibold font-mono">In-Memory Fill Speed</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)]">
                <p className="text-2xl sm:text-3xl font-mono font-bold text-[#536CF0] mb-1">NSE · BSE · MCX</p>
                <p className="text-[10px] uppercase tracking-wider text-[#6B7A90] font-semibold font-mono">Equities, F&O & Commodities</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. What Do We Provide (Core Pillars) ───────────────────────── */}
        <section id="features" className="py-24 bg-[#FCFCFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-[10px] font-mono tracking-widest text-[#536CF0] uppercase font-bold">
                  Institutional Architecture
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-display font-semibold text-[#00225A] tracking-[-0.03em] mb-4">
                What We Provide
              </h2>
              <p className="text-sm sm:text-base text-[#6B7A90] leading-relaxed">
                Everything required to simulate and validate professional trading strategies with mathematical precision and zero synthetic distortion.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="bg-white p-7 rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)] hover:shadow-[0_8px_24px_rgba(0,34,90,0.08)] hover:border-[#536CF0]/40 transition-all space-y-3.5">
                <div className="w-12 h-12 bg-[#EEF3FF] rounded-xl flex items-center justify-center border border-[#D9E2F2] text-[#00225A] shadow-sm">
                  <Activity className="w-5 h-5 text-[#536CF0]" />
                </div>
                <h3 className="text-base font-display font-bold text-[#00225A]">Genuine Exchange Ticks</h3>
                <p className="text-xs sm:text-sm text-[#6B7A90] leading-relaxed">
                  Real-time market quotes streamed directly from the exchange with microsecond binary feed. No synthetic curves or delayed mock prices.
                </p>
                <div className="text-[11px] font-mono text-[#536CF0] pt-1 font-semibold">NSE · BSE · MCX Active</div>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-7 rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)] hover:shadow-[0_8px_24px_rgba(0,34,90,0.08)] hover:border-[#536CF0]/40 transition-all space-y-3.5">
                <div className="w-12 h-12 bg-[#EEF3FF] rounded-xl flex items-center justify-center border border-[#D9E2F2] text-[#00225A] shadow-sm">
                  <Scale className="w-5 h-5 text-[#536CF0]" />
                </div>
                <h3 className="text-base font-display font-bold text-[#00225A]">Indian Regulatory Tax Engine</h3>
                <p className="text-xs sm:text-sm text-[#6B7A90] leading-relaxed">
                  Exact modeling of Securities Transaction Tax (STT/CTT), GST (18%), Stamp Duty, Exchange Fees, and Statutory Turnover charges computed per trade.
                </p>
                <div className="text-[11px] font-mono text-[#12B76A] pt-1 font-semibold">Accurate to the Paise</div>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-7 rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)] hover:shadow-[0_8px_24px_rgba(0,34,90,0.08)] hover:border-[#536CF0]/40 transition-all space-y-3.5">
                <div className="w-12 h-12 bg-[#EEF3FF] rounded-xl flex items-center justify-center border border-[#D9E2F2] text-[#00225A] shadow-sm">
                  <Flame className="w-5 h-5 text-[#536CF0]" />
                </div>
                <h3 className="text-base font-display font-bold text-[#00225A]">MCX Commodities Trading</h3>
                <p className="text-xs sm:text-sm text-[#6B7A90] leading-relaxed">
                  Full commodities desk covering Gold (100g/1kg/Mini), Silver (30kg/Mini/Micro), Crude Oil, and Natural Gas with authentic contract specs and lot sizing.
                </p>
                <div className="text-[11px] font-mono text-[#00225A] pt-1 font-semibold">Gold & Silver Bullion</div>
              </div>

              {/* Feature 4 */}
              <div className="bg-white p-7 rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)] hover:shadow-[0_8px_24px_rgba(0,34,90,0.08)] hover:border-[#536CF0]/40 transition-all space-y-3.5">
                <div className="w-12 h-12 bg-[#EEF3FF] rounded-xl flex items-center justify-center border border-[#D9E2F2] text-[#00225A] shadow-sm">
                  <Crosshair className="w-5 h-5 text-[#536CF0]" />
                </div>
                <h3 className="text-base font-display font-bold text-[#00225A]">Institutional Order Tickets</h3>
                <p className="text-xs sm:text-sm text-[#6B7A90] leading-relaxed">
                  Execute MARKET, LIMIT, SL (Stop-Loss Limit), and SL-M (Stop-Loss Market) across Delivery (CNC), Intraday (MIS 5x), and Carryforward (NRML).
                </p>
                <div className="text-[11px] font-mono text-[#536CF0] pt-1 font-semibold">Advanced Order Types</div>
              </div>

              {/* Feature 5 */}
              <div className="bg-white p-7 rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)] hover:shadow-[0_8px_24px_rgba(0,34,90,0.08)] hover:border-[#536CF0]/40 transition-all space-y-3.5">
                <div className="w-12 h-12 bg-[#EEF3FF] rounded-xl flex items-center justify-center border border-[#D9E2F2] text-[#00225A] shadow-sm">
                  <Database className="w-5 h-5 text-[#536CF0]" />
                </div>
                <h3 className="text-base font-display font-bold text-[#00225A]">Double-Entry Portfolio Ledger</h3>
                <p className="text-xs sm:text-sm text-[#6B7A90] leading-relaxed">
                  Live Mark-to-Market (MTM) calculation per tick, realized profit/loss, margin locks, and an immutable double-entry audited cash journal.
                </p>
                <div className="text-[11px] font-mono text-[#12B76A] pt-1 font-semibold">Real-Time MTM Ticks</div>
              </div>

              {/* Feature 6 */}
              <div className="bg-white p-7 rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)] hover:shadow-[0_8px_24px_rgba(0,34,90,0.08)] hover:border-[#536CF0]/40 transition-all space-y-3.5">
                <div className="w-12 h-12 bg-[#EEF3FF] rounded-xl flex items-center justify-center border border-[#D9E2F2] text-[#00225A] shadow-sm">
                  <BarChart3 className="w-5 h-5 text-[#536CF0]" />
                </div>
                <h3 className="text-base font-display font-bold text-[#00225A]">Quantitative Audit Suite</h3>
                <p className="text-xs sm:text-sm text-[#6B7A90] leading-relaxed">
                  Institutional analytics featuring win rates, profit factor, max peak-to-trough drawdown, session breakdown, and 1-click CSV statement export.
                </p>
                <div className="text-[11px] font-mono text-[#00225A] pt-1 font-semibold">Downloadable Statements</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. Dedicated Image Showcase: Audited Quantitative Analytics ──── */}
        <section id="analytics-preview" className="py-24 border-y border-[#D9E2F2] bg-[#F7F8FA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Left Column: Visual AI Graphic */}
              <div className="relative rounded-2xl overflow-hidden border border-[#D9E2F2] shadow-[0_16px_40px_rgba(0,34,90,0.08)] bg-white p-2.5 group order-2 lg:order-1">
                <img 
                  src="/cendrix-quant-analytics.jpg" 
                  alt="Cendrix Quantitative Risk & Analytics Suite" 
                  className="w-full h-auto rounded-xl object-cover transform transition-transform duration-700 group-hover:scale-105"
                />
                
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-[#D9E2F2] font-mono text-xs flex justify-between items-center shadow-lg">
                  <div>
                    <span className="text-[10px] text-[#536CF0] font-bold uppercase tracking-wider block">Quantum Risk Suite</span>
                    <span className="text-[#00225A] font-semibold">Value-at-Risk · Max Drawdown · Sharpe Telemetry</span>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-[#12B76A]/10 border border-[#12B76A]/30 text-[#12B76A] font-bold text-[11px]">
                    Live Audited
                  </span>
                </div>
              </div>

              {/* Right Column: Copy & Indicators */}
              <div className="space-y-6 order-1 lg:order-2">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono tracking-widest text-[#536CF0] uppercase font-bold">
                      Institutional Risk Protocol
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-display font-semibold text-[#00225A] tracking-[-0.03em]">
                    Audited Quantitative Risk &<br />
                    <span className="text-[#536CF0]">Real-Time Equity Telemetry.</span>
                  </h2>
                </div>

                <p className="text-sm sm:text-base text-[#6B7A90] leading-relaxed">
                  Professional trading demands more than a simple P&L number. Cendrix CNRX provides deep quantitative transparency into your trading edge, session volatility, win rate, and peak-to-trough drawdown — backed by double-entry accounting.
                </p>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-4 bg-white rounded-xl border border-[#D9E2F2] shadow-sm space-y-1">
                    <span className="text-[10px] text-[#6B7A90] uppercase block">Mathematical Win-Rate</span>
                    <span className="text-xl font-bold text-[#12B76A]">Audited per Exit</span>
                    <p className="text-[10px] text-[#6B7A90] font-sans">Every completed position fill is checked against entry execution.</p>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-[#D9E2F2] shadow-sm space-y-1">
                    <span className="text-[10px] text-[#6B7A90] uppercase block">Drawdown Engine</span>
                    <span className="text-xl font-bold text-[#D92D20]">Peak-to-Trough</span>
                    <p className="text-[10px] text-[#6B7A90] font-sans">Continuous tracking of margin preservation and capital safety.</p>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-[#D9E2F2] shadow-sm space-y-1">
                    <span className="text-[10px] text-[#6B7A90] uppercase block">Regulatory Ledger</span>
                    <span className="text-xl font-bold text-[#00225A]">Paise Precision</span>
                    <p className="text-[10px] text-[#6B7A90] font-sans">STT, CTT, GST and exchange charges audited per transaction.</p>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-[#D9E2F2] shadow-sm space-y-1">
                    <span className="text-[10px] text-[#6B7A90] uppercase block">CSV Statement Export</span>
                    <span className="text-xl font-bold text-[#00225A]">1-Click Download</span>
                    <p className="text-[10px] text-[#6B7A90] font-sans">Instant institutional statement export ready for strategy backchecks.</p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link 
                    to="/dashboard/analytics" 
                    className="btn-primary py-3 px-6 text-xs font-bold tracking-wider inline-flex items-center gap-2 rounded-xl"
                  >
                    <span>View Performance Analytics</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 7. Live Interactive Mini-Terminal Demo (Working On-Page) ────── */}
        <section id="demo" className="py-20 bg-[#FCFCFC] relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EEF3FF] border border-[#D9E2F2] rounded-full text-[10px] font-mono text-[#00225A] uppercase font-bold mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A] animate-ping" />
                <span>Live Interactive Sandbox</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-display font-semibold text-[#00225A] tracking-[-0.03em] mb-2">
                Test-Drive the Execution Pad
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7A90]">
                Experience instant in-memory matching and real-time P&L telemetry right now on this page.
              </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Interactive Order Pad */}
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#D9E2F2] shadow-[0_4px_20px_rgba(0,34,90,0.06)]">
                <div className="flex items-center justify-between pb-4 border-b border-[#D9E2F2] mb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#536CF0]" />
                    <span className="text-xs font-display font-bold text-[#00225A] uppercase tracking-wider">
                      Interactive Order Ticket
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#12B76A] bg-[#12B76A]/10 border border-[#12B76A]/30 px-2 py-0.5 rounded font-bold">
                    0ms Latency
                  </span>
                </div>

                <form onSubmit={handleSimulateTrade} className="space-y-4">
                  {/* Select Instrument */}
                  <div>
                    <label className="block text-[10px] text-[#6B7A90] uppercase font-mono mb-1.5">Select Scrip</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'GOLDM', label: 'GOLDM (MCX)', price: '₹76,420' },
                        { id: 'SILVERM', label: 'SILVERM (MCX)', price: '₹91,540' },
                        { id: 'NIFTY', label: 'NIFTY (F&O)', price: '₹24,850' },
                        { id: 'RELIANCE', label: 'RELIANCE (EQ)', price: '₹2,985' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setDemoSymbol(item.id as any)}
                          className={`p-2.5 rounded-xl border text-left transition-all font-mono text-xs ${
                            demoSymbol === item.id
                              ? 'bg-[#EEF3FF] border-[#00225A] text-[#00225A] font-bold shadow-sm'
                              : 'bg-[#F7F8FA] border-[#D9E2F2] text-[#6B7A90] hover:text-[#00225A] hover:bg-white'
                          }`}
                        >
                          <div className="font-bold text-[#00225A]">{item.id}</div>
                          <div className="text-[10px] text-[#536CF0] font-semibold">{item.price}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Buy / Sell Toggle */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDemoSide('BUY')}
                      className={`py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                        demoSide === 'BUY'
                          ? 'bg-[#12B76A] text-white shadow-sm'
                          : 'bg-[#F7F8FA] border border-[#D9E2F2] text-[#6B7A90] hover:text-[#00225A]'
                      }`}
                    >
                      BUY (Long)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDemoSide('SELL')}
                      className={`py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                        demoSide === 'SELL'
                          ? 'bg-[#D92D20] text-white shadow-sm'
                          : 'bg-[#F7F8FA] border border-[#D9E2F2] text-[#6B7A90] hover:text-[#00225A]'
                      }`}
                    >
                      SELL (Short)
                    </button>
                  </div>

                  {/* Quantity Sizing */}
                  <div>
                    <label className="block text-[10px] text-[#6B7A90] uppercase font-mono mb-1">
                      Quantity / Lots
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={demoQty}
                        onChange={(e) => setDemoQty(parseInt(e.target.value) || 1)}
                        className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-lg px-3 py-2 font-mono text-sm text-[#111114] focus:outline-none focus:border-[#00225A]"
                      />
                      <span className="text-xs text-[#00225A] font-mono font-bold shrink-0">
                        Lot x {demoQty}
                      </span>
                    </div>
                  </div>

                  {/* Execution Button */}
                  <button
                    type="submit"
                    className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 ${
                      demoSide === 'BUY'
                        ? 'bg-[#12B76A] hover:brightness-105 text-white shadow-sm'
                        : 'bg-[#D92D20] hover:brightness-105 text-white shadow-sm'
                    }`}
                  >
                    Simulate Instant {demoSide} Fill
                  </button>

                  {demoExecutedAlert && (
                    <div className="p-2.5 rounded-lg bg-[#12B76A]/10 border border-[#12B76A]/30 text-[#12B76A] text-xs font-mono text-center animate-bounce font-bold">
                      ✓ Simulated {demoExecutedAlert.side} Fill Executed @ ₹{demoExecutedAlert.price.toLocaleString('en-IN')}
                    </div>
                  )}
                </form>
              </div>

              {/* Right Column: Live Telemetry & Active Position Preview */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#536CF0]" />
                    <h3 className="text-xs font-display font-bold text-[#00225A] uppercase tracking-wider">
                      Live Simulated Position Telemetry
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-[#6B7A90]">
                    Updates in real-time
                  </span>
                </div>

                <div className="bg-white rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)] overflow-hidden">
                  <table className="w-full text-left text-xs font-mono border-collapse">
                    <thead>
                      <tr className="border-b border-[#D9E2F2] text-[10px] text-[#6B7A90] uppercase bg-[#F7F8FA]">
                        <th className="py-2.5 px-3">Contract</th>
                        <th className="py-2.5 px-3">Side</th>
                        <th className="py-2.5 px-3 text-right">Entry</th>
                        <th className="py-2.5 px-3 text-right">LTP</th>
                        <th className="py-2.5 px-3 text-right">Live MTM</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D9E2F2]">
                      {demoPositions.map((pos) => {
                        const isProfitable = pos.pnl >= 0;
                        return (
                          <tr key={pos.id} className="hover:bg-[#F7F8FA] transition-colors">
                            <td className="py-3 px-3 font-semibold text-[#00225A]">{pos.symbol}</td>
                            <td className="py-3 px-3 font-sans">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                pos.side === 'BUY'
                                  ? 'bg-[#12B76A]/10 text-[#12B76A] border border-[#12B76A]/30'
                                  : 'bg-[#D92D20]/10 text-[#D92D20] border border-[#D92D20]/30'
                              }`}>
                                {pos.side}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right text-[#6B7A90]">₹{pos.entryPrice.toFixed(2)}</td>
                            <td className="py-3 px-3 text-right font-bold text-[#111114]">₹{pos.currentPrice.toFixed(2)}</td>
                            <td className={`py-3 px-3 text-right font-bold ${isProfitable ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
                              {isProfitable ? '+' : ''}₹{pos.pnl.toFixed(2)} ({isProfitable ? '+' : ''}{pos.pnlPct.toFixed(2)}%)
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Explanation Card */}
                <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#D9E2F2] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-[#536CF0] shrink-0" />
                    <span className="text-[#6B7A90]">
                      Every position in the full workstation is recorded to the immutable ledger with audited regulatory charge breakdowns.
                    </span>
                  </div>
                  <Link 
                    to="/dashboard" 
                    className="text-xs font-semibold text-[#00225A] hover:text-[#536CF0] shrink-0 ml-4 font-mono flex items-center gap-1"
                  >
                    <span>Full Desk</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 8. Detailed Advantage Matrix (Cendrix vs Generic Simulators) ── */}
        <section id="advantage" className="py-24 border-y border-[#D9E2F2] bg-[#F7F8FA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-[10px] font-mono tracking-widest text-[#536CF0] uppercase font-bold">
                  The Institutional Standard
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-display font-semibold text-[#00225A] tracking-[-0.03em] mb-4">
                Why Cendrix CNRX Outperforms Generic Simulators
              </h2>
              <p className="text-sm sm:text-base text-[#6B7A90] leading-relaxed">
                Most paper trading apps deceive traders with synthetic curves, zero slippage, and zero regulatory charges. Cendrix replicates actual market conditions so your live performance matches your simulated edge.
              </p>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto bg-white rounded-2xl border border-[#D9E2F2] shadow-[0_4px_24px_rgba(0,34,90,0.06)]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#D9E2F2] bg-[#F7F8FA] text-xs font-mono uppercase">
                    <th className="py-4 px-6 text-[#00225A] font-display font-bold">Trading Dimension</th>
                    <th className="py-4 px-6 text-[#00225A] font-display font-bold bg-[#EEF3FF] border-x border-[#D9E2F2]">
                      Cendrix Capital (CNRX)
                    </th>
                    <th className="py-4 px-6 text-[#6B7A90]">Generic Paper Simulators</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E2F2]">
                  <tr className="hover:bg-[#F7F8FA] transition-colors">
                    <td className="py-4 px-6 font-semibold text-[#00225A]">Market Price Authenticity</td>
                    <td className="py-4 px-6 font-semibold text-[#12B76A] bg-[#EEF3FF]/40 border-x border-[#D9E2F2] flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#12B76A] shrink-0" />
                      <span>100% Genuine Direct Exchange Market Data Feeds</span>
                    </td>
                    <td className="py-4 px-6 text-[#6B7A90]">
                      Artificial synthetic random-walk curves or 15-min delayed quotes
                    </td>
                  </tr>

                  <tr className="hover:bg-[#F7F8FA] transition-colors">
                    <td className="py-4 px-6 font-semibold text-[#00225A]">Commodities & Bullion</td>
                    <td className="py-4 px-6 font-semibold text-[#12B76A] bg-[#EEF3FF]/40 border-x border-[#D9E2F2] flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#12B76A] shrink-0" />
                      <span>Dedicated MCX Desk (Gold, Silver, Crude Oil, Natural Gas)</span>
                    </td>
                    <td className="py-4 px-6 text-[#6B7A90]">
                      Equities only; no MCX commodity lot size modeling
                    </td>
                  </tr>

                  <tr className="hover:bg-[#F7F8FA] transition-colors">
                    <td className="py-4 px-6 font-semibold text-[#00225A]">Statutory Tax & Regulatory Deductions</td>
                    <td className="py-4 px-6 font-semibold text-[#12B76A] bg-[#EEF3FF]/40 border-x border-[#D9E2F2] flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#12B76A] shrink-0" />
                      <span>Full STT, CTT, GST, Stamp Duty & Statutory Turnover Charges</span>
                    </td>
                    <td className="py-4 px-6 text-[#6B7A90]">
                      ₹0 flat friction; distorts profit & loss expectations
                    </td>
                  </tr>

                  <tr className="hover:bg-[#F7F8FA] transition-colors">
                    <td className="py-4 px-6 font-semibold text-[#00225A]">Margin Leverage Sizing</td>
                    <td className="py-4 px-6 font-semibold text-[#12B76A] bg-[#EEF3FF]/40 border-x border-[#D9E2F2] flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#12B76A] shrink-0" />
                      <span>Verified Exchange Leverage: MIS (5x Intraday) & NRML/CNC</span>
                    </td>
                    <td className="py-4 px-6 text-[#6B7A90]">
                      Arbitrary or unlimited leverage; unrealistic risk habits
                    </td>
                  </tr>

                  <tr className="hover:bg-[#F7F8FA] transition-colors">
                    <td className="py-4 px-6 font-semibold text-[#00225A]">Order Execution Velocity</td>
                    <td className="py-4 px-6 font-semibold text-[#12B76A] bg-[#EEF3FF]/40 border-x border-[#D9E2F2] flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#12B76A] shrink-0" />
                      <span>&lt; 1ms In-Memory Matching with instant fill telemetry</span>
                    </td>
                    <td className="py-4 px-6 text-[#6B7A90]">
                      Delayed simulated HTTP requests with lag
                    </td>
                  </tr>

                  <tr className="hover:bg-[#F7F8FA] transition-colors">
                    <td className="py-4 px-6 font-semibold text-[#00225A]">Portfolio Accounting & Auditing</td>
                    <td className="py-4 px-6 font-semibold text-[#12B76A] bg-[#EEF3FF]/40 border-x border-[#D9E2F2] flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#12B76A] shrink-0" />
                      <span>Double-entry audited cash ledger with downloadable CSV</span>
                    </td>
                    <td className="py-4 px-6 text-[#6B7A90]">
                      Basic superficial P&L count without transaction ledger
                    </td>
                  </tr>

                  <tr className="hover:bg-[#F7F8FA] transition-colors">
                    <td className="py-4 px-6 font-semibold text-[#00225A]">Client Access & Onboarding</td>
                    <td className="py-4 px-6 font-semibold text-[#12B76A] bg-[#EEF3FF]/40 border-x border-[#D9E2F2] flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#12B76A] shrink-0" />
                      <span>1-Click Instant Institutional Auto-Connect (No KYC friction)</span>
                    </td>
                    <td className="py-4 px-6 text-[#6B7A90]">
                      Forced phone verification, advertisements, or paywalls
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── 9. Multi-Asset Ecosystem with 3D Visual ─────────────────────── */}
        <section id="commodities" className="py-24 bg-[#FCFCFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Left Column: Visual AI Asset Showcase */}
              <div className="relative rounded-2xl overflow-hidden border border-[#D9E2F2] shadow-[0_16px_40px_rgba(0,34,90,0.08)] bg-white p-2.5 group">
                <img 
                  src="/cendrix-multi-asset.jpg" 
                  alt="Cendrix Multi-Asset Suite (Equities, F&O, MCX Bullion)" 
                  className="w-full h-auto rounded-xl object-cover transform transition-transform duration-700 group-hover:scale-105"
                />
                
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-[#D9E2F2] font-mono text-xs flex justify-between items-center shadow-lg">
                  <div>
                    <span className="text-[10px] text-[#536CF0] font-bold uppercase tracking-wider block">Multi-Asset Engine</span>
                    <span className="text-[#00225A] font-semibold">NSE Cash · NFO Futures · MCX Bullion</span>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-[#EEF3FF] border border-[#D9E2F2] text-[#00225A] font-bold text-[11px]">
                    All-in-One
                  </span>
                </div>
              </div>

              {/* Right Column: Asset Class Selector & Details */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono tracking-widest text-[#536CF0] uppercase font-bold">
                      Unified Capital Desk
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-display font-semibold text-[#00225A] tracking-[-0.03em]">
                    One Capital Allocation.<br />
                    <span className="text-[#536CF0]">Three Premier Asset Classes.</span>
                  </h2>
                </div>

                {/* Sub-tabs for Asset Classes */}
                <div className="flex gap-2 p-1 bg-[#F7F8FA] rounded-xl border border-[#D9E2F2] font-mono text-xs">
                  {[
                    { id: 'commodities', label: 'MCX Commodities' },
                    { id: 'derivatives', label: 'Quantitative F&O' },
                    { id: 'equities', label: 'Indian Equities' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveAssetTab(tab.id as any)}
                      className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all ${
                        activeAssetTab === tab.id
                          ? 'bg-white text-[#00225A] border border-[#D9E2F2] shadow-sm font-bold'
                          : 'text-[#6B7A90] hover:text-[#00225A]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {activeAssetTab === 'commodities' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <p className="text-sm text-[#6B7A90] leading-relaxed">
                      Practice bullion, energy, and base metals trading on authentic MCX contract specifications with verified lot sizes, tick sizes, and margin leverage.
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                      <div className="p-3 bg-[#F7F8FA] rounded-xl border border-[#D9E2F2]">
                        <span className="text-[10px] text-[#6B7A90] block">GOLD MINI (GOLDM)</span>
                        <span className="font-bold text-[#00225A]">100 Grams Lot</span>
                      </div>
                      <div className="p-3 bg-[#F7F8FA] rounded-xl border border-[#D9E2F2]">
                        <span className="text-[10px] text-[#6B7A90] block">SILVER MINI (SILVERM)</span>
                        <span className="font-bold text-[#00225A]">5 Kilograms Lot</span>
                      </div>
                      <div className="p-3 bg-[#F7F8FA] rounded-xl border border-[#D9E2F2]">
                        <span className="text-[10px] text-[#6B7A90] block">CRUDE OIL</span>
                        <span className="font-bold text-[#00225A]">100 Barrels Lot</span>
                      </div>
                      <div className="p-3 bg-[#F7F8FA] rounded-xl border border-[#D9E2F2]">
                        <span className="text-[10px] text-[#6B7A90] block">NATURAL GAS</span>
                        <span className="font-bold text-[#00225A]">1250 mmBtu Lot</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeAssetTab === 'derivatives' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <p className="text-sm text-[#6B7A90] leading-relaxed">
                      Validate quantitative index and stock futures strategies with real-time underlying basis calculation, contract expiries, and SPAN margin locks.
                    </p>
                    <ul className="space-y-2 text-xs text-[#6B7A90]">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#12B76A]" />
                        <span>Nifty 50, Bank Nifty, and FinNifty Futures with exact lot sizing</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#12B76A]" />
                        <span>Single stock futures with realistic basis tracking</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#12B76A]" />
                        <span>Carryforward (NRML) vs Intraday (MIS) margin leverage modes</span>
                      </li>
                    </ul>
                  </div>
                )}

                {activeAssetTab === 'equities' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <p className="text-sm text-[#6B7A90] leading-relaxed">
                      Trade liquid blue-chip equities from the NSE and BSE with full Delivery (CNC) and Intraday (MIS 5x leverage) order routing.
                    </p>
                    <ul className="space-y-2 text-xs text-[#6B7A90]">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#12B76A]" />
                        <span>Reliance, TCS, HDFC Bank, Infosys, ICICI Bank, and Tata Steel</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#12B76A]" />
                        <span>Live Level 2 market depth (5 Bid / 5 Ask)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#12B76A]" />
                        <span>Instant MTM mark-to-market updates per tick</span>
                      </li>
                    </ul>
                  </div>
                )}

                <div className="pt-2">
                  <Link 
                    to="/dashboard/commodities" 
                    className="btn-primary py-3 px-6 text-xs font-bold tracking-wider inline-flex items-center gap-2 rounded-xl"
                  >
                    <span>Explore Commodities Desk</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 10. Real-Time Data Architecture Flowchart ──────────────────── */}
        <section id="pipeline" className="py-24 border-t border-[#D9E2F2] bg-[#F7F8FA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-[10px] font-mono tracking-widest text-[#536CF0] uppercase font-bold">
                  Zero Delay Protocol
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-display font-semibold text-[#00225A] tracking-[-0.03em] mb-4">
                Real-Time Data Pipeline Architecture
              </h2>
              <p className="text-sm sm:text-base text-[#6B7A90] leading-relaxed">
                How genuine direct exchange order flow connects to your simulated workstation in less than one millisecond.
              </p>
            </div>

            {/* Architecture Steps Grid */}
            <div className="grid md:grid-cols-4 gap-4 relative">
              <div className="bg-white p-6 rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)] space-y-3">
                <div className="text-[10px] font-mono text-[#536CF0] font-bold uppercase">01 / Exchange Feeds</div>
                <div className="text-base font-display font-bold text-[#00225A]">Direct Exchange Gateway</div>
                <p className="text-xs text-[#6B7A90] leading-relaxed">
                  Real-time binary WebSocket streaming from NSE, BSE, and MCX exchange servers.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)] space-y-3">
                <div className="text-[10px] font-mono text-[#536CF0] font-bold uppercase">02 / Telemetry Engine</div>
                <div className="text-base font-display font-bold text-[#00225A]">CNRX In-Memory Bus</div>
                <p className="text-xs text-[#6B7A90] leading-relaxed">
                  Sub-millisecond pub/sub streaming bus delivering ticks directly to trading state.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)] space-y-3">
                <div className="text-[10px] font-mono text-[#536CF0] font-bold uppercase">03 / Financial Engine</div>
                <div className="text-base font-display font-bold text-[#00225A]">SPAN & Tax Math</div>
                <p className="text-xs text-[#6B7A90] leading-relaxed">
                  Instant calculation of margin requirements, STT, CTT, GST, and statutory turnover fees.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)] space-y-3">
                <div className="text-[10px] font-mono text-[#536CF0] font-bold uppercase">04 / Terminal Output</div>
                <div className="text-base font-display font-bold text-[#00225A]">Client Workstation</div>
                <p className="text-xs text-[#6B7A90] leading-relaxed">
                  Level 2 market depth, order ticket fills, and audited double-entry portfolio ledger.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 11. Frequently Asked Questions (SEO & Knowledge Base) ──── */}
        <section id="faq" className="py-24 border-t border-[#D9E2F2] bg-[#FFFFFF]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 mb-3 px-3.5 py-1 bg-[#EEF3FF] border border-[#D9E2F2] rounded-full text-[10px] font-semibold text-[#00225A] uppercase tracking-widest font-mono">
                <HelpCircle className="w-3.5 h-3.5 text-[#536CF0]" />
                <span>Frequently Asked Questions</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-display font-semibold text-[#00225A] tracking-[-0.03em] mb-4">
                Everything About India's Leading Paper Trading Platform
              </h2>
              <p className="text-sm sm:text-base text-[#6B7A90] leading-relaxed">
                Clear, transparent answers about our free simulated trading environment, live exchange data feeds, and execution models.
              </p>
            </div>

            <div className="space-y-4">
              {FAQ_ITEMS.map((item, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="border border-[#D9E2F2] rounded-2xl bg-[#FCFCFC] transition-all overflow-hidden shadow-[0_2px_8px_rgba(0,34,90,0.02)]"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 hover:bg-[#F7F8FA] transition-colors focus:outline-none"
                      aria-expanded={isOpen}
                    >
                      <h3 className="text-sm sm:text-base font-display font-bold text-[#00225A] pr-2">
                        {item.question}
                      </h3>
                      <div className={`w-8 h-8 rounded-full border border-[#D9E2F2] flex items-center justify-center shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 bg-[#EEF3FF] text-[#536CF0]' : 'text-[#6B7A90]'}`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-[#6B7A90] leading-relaxed border-t border-[#D9E2F2]/60">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 12. The Final Call to Action ───────────────────────────────── */}
        <section className="py-24 relative overflow-hidden bg-gradient-to-b from-[#FCFCFC] via-[#EEF3FF]/40 to-[#FCFCFC] border-t border-[#D9E2F2]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white border border-[#D9E2F2] flex items-center justify-center p-2.5 mb-8 shadow-md">
              <img src="/cendrix-logo.png" alt="Cendrix Capital" className="w-full h-full object-contain" />
            </div>

            <h2 className="text-3xl sm:text-5xl font-display font-semibold text-[#00225A] mb-6 tracking-[-0.03em]">
              Begin Paper Trading With Live Precision.
            </h2>
            <p className="text-sm sm:text-base text-[#6B7A90] mb-10 max-w-2xl mx-auto leading-relaxed">
              Test your edge against real market forces with zero capital at risk. ₹10,00,000 in virtual funds is ready immediately with instant 1-click auto-connect.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link 
                to="/dashboard" 
                className="w-full sm:w-auto btn-primary py-3.5 px-10 text-xs tracking-wider font-bold shadow-md flex items-center justify-center gap-2 rounded-xl"
              >
                <span>Launch Cendrix Trading Desk</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link 
                to="/dashboard/commodities" 
                className="w-full sm:w-auto btn-secondary py-3.5 px-8 text-xs tracking-wider font-semibold rounded-xl"
              >
                Commodities Suite
              </Link>
            </div>
          </div>
        </section>

        {/* ── 12. Institutional Footer & Legal Disclosures ───────────────── */}
        <footer className="border-t border-[#D9E2F2] py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-8 border-b border-[#D9E2F2]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#EEF3FF] border border-[#D9E2F2] flex items-center justify-center p-1 overflow-hidden">
                  <img src="/cendrix-logo.png" alt="Cendrix Capital" className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="text-sm font-display font-bold tracking-tight text-[#00225A]">
                    CENDRIX CAPITAL · <span className="text-[#536CF0] font-mono">CNRX</span>
                  </span>
                  <p className="text-[10px] text-[#6B7A90] font-mono">
                    Simulated Fund Quantitative Workstation
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-6 text-xs text-[#6B7A90] font-medium">
                <Link to="/login" className="hover:text-[#00225A] transition-colors">Institutional Login</Link>
                <a href="#faq" className="hover:text-[#00225A] transition-colors">FAQ</a>
                <Link to="/privacy" className="hover:text-[#00225A] transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="hover:text-[#00225A] transition-colors">Terms of Service</Link>
                <a href="mailto:atharva.bhosale@yahoo.com" className="hover:text-[#00225A] transition-colors">Desk Support</a>
                <a href="https://www.linkedin.com/in/atharva--bhosale" target="_blank" rel="noopener noreferrer" className="hover:text-[#00225A] transition-colors">LinkedIn</a>
                <Link to="/dashboard" className="text-[#00225A] hover:text-[#536CF0] font-mono font-semibold">Terminal Access →</Link>
              </div>
            </div>

            <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-[#6B7A90] font-mono">
              <p>© {new Date().getFullYear()} Cendrix Capital. Institutional Paper Trading Platform. All rights reserved.</p>
              <p className="text-center md:text-right max-w-xl">
                Notice: CNRX is a simulated educational and research workstation. All funds are 100% virtual and cannot be redeemed for real currency. Not a registered brokerage firm or financial advisory.
              </p>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
