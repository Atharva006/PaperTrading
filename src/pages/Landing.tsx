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
  Play
} from 'lucide-react';
import { useTradingStore } from '../store/useTradingStore';
import { INDIAN_INSTRUMENTS_MASTER } from '../services/market/indianInstruments';

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

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
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
    <div className="min-h-screen bg-[#0B1424] text-[#F5F5F2] relative overflow-x-hidden font-sans selection:bg-[#C6A15B] selection:text-[#0B1424]">
      
      {/* Background Prestige Radial Glow */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-[-10%] left-[25%] w-[50%] h-[40%] bg-[#C6A15B]/10 rounded-full blur-[160px]" />
        <div className="absolute top-[45%] right-[-10%] w-[40%] h-[40%] bg-[#0E1728] rounded-full blur-[140px]" />
      </div>

      {/* ── 1. Top Institutional Navigation Bar ─────────────────────────── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#0B1424]/95 backdrop-blur-md border-b border-[#14223A] py-3.5 shadow-lg' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#10141C] border border-[#14223A] flex items-center justify-center p-1.5 overflow-hidden shadow-sm">
              <img src="/cendrix-logo.png" alt="Cendrix Capital" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-serif font-bold tracking-wider text-[#F5F5F2]">
                  CENDRIX CAPITAL
                </span>
                <span className="text-[10px] font-mono text-[#C6A15B] bg-[#C6A15B]/10 px-1.5 py-0.5 rounded border border-[#C6A15B]/30 uppercase font-semibold">
                  CNRX
                </span>
              </div>
              <p className="text-[9px] font-mono tracking-widest text-[#6E7683] uppercase">
                Institutional Paper Trading
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#A1A8B3]">
            <a href="#features" className="hover:text-[#F5F5F2] transition-colors">What We Provide</a>
            <a href="#analytics-preview" className="hover:text-[#F5F5F2] transition-colors">Risk Analytics</a>
            <a href="#advantage" className="hover:text-[#F5F5F2] transition-colors">Our Advantage</a>
            <a href="#demo" className="hover:text-[#F5F5F2] transition-colors flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Interactive Demo</span>
            </a>
            <a href="#pipeline" className="hover:text-[#F5F5F2] transition-colors">Data Gateway</a>
            <a href="#commodities" className="hover:text-[#F5F5F2] transition-colors">Commodities</a>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              to="/dashboard" 
              className="hidden sm:inline-flex text-xs font-semibold text-[#A1A8B3] hover:text-[#F5F5F2] transition-colors px-3 py-1.5 font-mono"
            >
              1-Click Instant Enter
            </Link>
            <Link 
              to="/dashboard" 
              className="btn-cendrix-gold text-xs py-2 px-4 shadow-[0_2px_12px_rgba(198,161,91,0.25)] flex items-center gap-1.5"
            >
              <span>Launch Workstation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── 2. Live Marquee Ticker Ribbon (Real-Time Motion) ─────────────── */}
      <div className="relative z-20 pt-24 sm:pt-28 border-b border-[#14223A] bg-[#0E1728]/90 overflow-hidden backdrop-blur-md">
        <div className="flex items-center">
          <div className="px-4 py-2 bg-[#0B1424] border-r border-[#14223A] text-[10px] font-mono text-[#C6A15B] uppercase font-bold shrink-0 flex items-center gap-2 z-10 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Exchange Stream</span>
          </div>

          <div className="overflow-hidden whitespace-nowrap flex-1 py-2">
            <div className="animate-marquee gap-8 items-center text-xs font-mono">
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
                  <div key={idx} className="inline-flex items-center gap-2.5 px-3 py-0.5 rounded hover:bg-[#14223A]/60 transition-colors">
                    <span className="font-semibold text-[#F5F5F2]">{item.symbol}</span>
                    <span className="text-[9px] text-[#6E7683] px-1 py-0.2 rounded bg-[#0B1424] border border-[#14223A] font-sans">
                      {item.exchange}
                    </span>
                    <span className="font-bold text-[#F5F5F2]">₹{displayPrice.toFixed(2)}</span>
                    <span className={`text-[11px] font-semibold flex items-center ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {isPos ? '+' : ''}{displayChange.toFixed(2)} ({displayPct.toFixed(2)}%)
                    </span>
                    <span className="text-[#14223A] mx-2">|</span>
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
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 bg-[#0E1728] border border-[rgba(198,161,91,0.25)] rounded-full text-[11px] font-semibold text-[#C6A15B] uppercase tracking-widest font-mono shadow-[0_4px_20px_rgba(0,0,0,0.4)] animate-float">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Direct Exchange Market Stream · Zero Synthetic Drift</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-[#F5F5F2] tracking-tight mb-8 leading-[1.08] max-w-5xl mx-auto">
              Precision. Discipline.<br />
              <span className="text-[#C6A15B] bg-gradient-to-r from-[#D4B26F] via-[#C6A15B] to-[#A68037] bg-clip-text text-transparent">
                Institutional Execution.
              </span>
            </h1>

            {/* Subtitle Value Proposition */}
            <p className="text-base sm:text-lg md:text-xl text-[#A1A8B3] mb-10 leading-relaxed max-w-3xl mx-auto font-normal">
              CNRX is India’s bespoke institutional paper trading workstation for <strong className="text-[#F5F5F2]">NSE/BSE Equities</strong>, <strong className="text-[#F5F5F2]">F&O Derivatives</strong>, and <strong className="text-[#C6A15B]">MCX Commodities</strong>. Execute against genuine direct exchange order flows with verified statutory tax modeling, margin calculation, and an audited double-entry portfolio ledger.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
              <Link 
                to="/dashboard" 
                className="w-full sm:w-auto btn-cendrix-gold py-4 px-8 text-xs tracking-wider font-bold shadow-[0_4px_20px_rgba(198,161,91,0.3)] flex items-center justify-center gap-2"
              >
                <span>Launch Workstation (₹10L Virtual)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a 
                href="#demo" 
                className="w-full sm:w-auto btn-cendrix-outline py-4 px-8 text-xs tracking-wider font-semibold flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 text-[#C6A15B]" />
                <span>Test Live Interactive Demo</span>
              </a>
              <Link 
                to="/dashboard/terminal" 
                className="w-full sm:w-auto px-6 py-4 text-xs font-mono text-[#A1A8B3] hover:text-[#F5F5F2] transition-colors"
              >
                Level 2 Terminal →
              </Link>
            </div>

            {/* Workstation Showcase Graphic with Glass HUD */}
            <div className="relative mx-auto max-w-5xl rounded-2xl overflow-hidden border border-[rgba(198,161,91,0.3)] shadow-[0_25px_60px_rgba(0,0,0,0.8)] animate-gold-pulse group">
              <img 
                src="/cendrix-terminal-hero.jpg" 
                alt="Cendrix Capital Institutional Trading Terminal" 
                className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-[1.02]"
              />

              {/* Floating Live Telemetry HUD Overlays */}
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-[#0B1424]/85 backdrop-blur-md border border-[rgba(198,161,91,0.25)] rounded-xl p-3 sm:p-4 text-left shadow-2xl font-mono text-xs">
                <div className="flex items-center gap-2 text-[#C6A15B] text-[10px] font-bold uppercase tracking-wider mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Direct Gateway Active</span>
                </div>
                <div className="text-sm sm:text-base font-bold text-[#F5F5F2]">Direct Exchange Binary Feed</div>
                <div className="text-[11px] text-[#A1A8B3]">Latency: &lt; 1ms matching</div>
              </div>

              <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 bg-[#0B1424]/85 backdrop-blur-md border border-[rgba(198,161,91,0.25)] rounded-xl p-3 sm:p-4 text-right shadow-2xl font-mono text-xs">
                <div className="text-[10px] text-[#A1A8B3] uppercase tracking-wider mb-0.5">Virtual Equity Balance</div>
                <div className="text-base sm:text-lg font-bold text-emerald-400">₹10,00,000.00</div>
                <div className="text-[10px] text-[#C6A15B] font-semibold">100% Risk Free Paper Capital</div>
              </div>
            </div>

          </div>
        </section>

        {/* ── 4. Key Performance Metrics Bar ─────────────────────────────── */}
        <section className="py-12 border-y border-[#14223A] bg-[#0E1728]/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
              <div className="cendrix-card p-5 rounded-xl border border-[rgba(198,161,91,0.2)]">
                <p className="text-2xl sm:text-3xl font-mono font-bold text-[#F5F5F2] mb-1">₹10,00,000</p>
                <p className="text-[10px] uppercase tracking-wider text-[#A1A8B3] font-semibold font-mono">Virtual Starting Balance</p>
              </div>

              <div className="cendrix-card p-5 rounded-xl border border-[rgba(198,161,91,0.2)]">
                <p className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400 mb-1">100% LIVE</p>
                <p className="text-[10px] uppercase tracking-wider text-[#A1A8B3] font-semibold font-mono">Direct Exchange Market Feed</p>
              </div>

              <div className="cendrix-card p-5 rounded-xl border border-[rgba(198,161,91,0.2)]">
                <p className="text-2xl sm:text-3xl font-mono font-bold text-[#F5F5F2] mb-1">&lt; 1 ms</p>
                <p className="text-[10px] uppercase tracking-wider text-[#A1A8B3] font-semibold font-mono">In-Memory Fill Speed</p>
              </div>

              <div className="cendrix-card p-5 rounded-xl border border-[rgba(198,161,91,0.2)]">
                <p className="text-2xl sm:text-3xl font-mono font-bold text-[#C6A15B] mb-1">NSE · BSE · MCX</p>
                <p className="text-[10px] uppercase tracking-wider text-[#C6A15B] font-semibold font-mono">Equities, F&O & Commodities</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. What Do We Provide (Core Pillars) ───────────────────────── */}
        <section id="features" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-[10px] font-mono tracking-widest text-[#C6A15B] uppercase font-bold">
                  Institutional Architecture
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#F5F5F2] tracking-tight mb-4">
                What We Provide
              </h2>
              <p className="text-sm text-[#A1A8B3] leading-relaxed">
                Everything required to simulate and validate professional trading strategies with mathematical precision and zero synthetic distortion.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="cendrix-card p-6 rounded-xl border border-[#14223A] space-y-3">
                <div className="w-11 h-11 bg-[#0B1424] rounded-lg flex items-center justify-center border border-[rgba(198,161,91,0.25)] text-[#C6A15B]">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-base font-serif font-bold text-[#F5F5F2]">Genuine Exchange Ticks</h3>
                <p className="text-xs text-[#A1A8B3] leading-relaxed">
                  Real-time market quotes streamed directly from the exchange with microsecond binary feed. No synthetic curves or delayed mock prices.
                </p>
                <div className="text-[11px] font-mono text-[#C6A15B] pt-1">NSE · BSE · MCX Active</div>
              </div>

              {/* Feature 2 */}
              <div className="cendrix-card p-6 rounded-xl border border-[#14223A] space-y-3">
                <div className="w-11 h-11 bg-[#0B1424] rounded-lg flex items-center justify-center border border-[rgba(198,161,91,0.25)] text-[#C6A15B]">
                  <Scale className="w-5 h-5" />
                </div>
                <h3 className="text-base font-serif font-bold text-[#F5F5F2]">Indian Regulatory Tax Engine</h3>
                <p className="text-xs text-[#A1A8B3] leading-relaxed">
                  Exact modeling of Securities Transaction Tax (STT/CTT), GST (18%), Stamp Duty, Exchange Fees, and SEBI Turnover charges computed per trade.
                </p>
                <div className="text-[11px] font-mono text-emerald-400 pt-1">Accurate to the Paise</div>
              </div>

              {/* Feature 3 */}
              <div className="cendrix-card p-6 rounded-xl border border-[#14223A] space-y-3">
                <div className="w-11 h-11 bg-[#0B1424] rounded-lg flex items-center justify-center border border-[rgba(198,161,91,0.25)] text-[#C6A15B]">
                  <Flame className="w-5 h-5" />
                </div>
                <h3 className="text-base font-serif font-bold text-[#F5F5F2]">MCX Commodities Trading</h3>
                <p className="text-xs text-[#A1A8B3] leading-relaxed">
                  Full commodities desk covering Gold (100g/1kg/Mini), Silver (30kg/Mini/Micro), Crude Oil, and Natural Gas with authentic contract specs and lot sizing.
                </p>
                <div className="text-[11px] font-mono text-[#E2C889] pt-1">Gold & Silver Bullion</div>
              </div>

              {/* Feature 4 */}
              <div className="cendrix-card p-6 rounded-xl border border-[#14223A] space-y-3">
                <div className="w-11 h-11 bg-[#0B1424] rounded-lg flex items-center justify-center border border-[rgba(198,161,91,0.25)] text-[#C6A15B]">
                  <Crosshair className="w-5 h-5" />
                </div>
                <h3 className="text-base font-serif font-bold text-[#F5F5F2]">Institutional Order Tickets</h3>
                <p className="text-xs text-[#A1A8B3] leading-relaxed">
                  Execute MARKET, LIMIT, SL (Stop-Loss Limit), and SL-M (Stop-Loss Market) across Delivery (CNC), Intraday (MIS 5x), and Carryforward (NRML).
                </p>
                <div className="text-[11px] font-mono text-[#C6A15B] pt-1">Advanced Order Types</div>
              </div>

              {/* Feature 5 */}
              <div className="cendrix-card p-6 rounded-xl border border-[#14223A] space-y-3">
                <div className="w-11 h-11 bg-[#0B1424] rounded-lg flex items-center justify-center border border-[rgba(198,161,91,0.25)] text-[#C6A15B]">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="text-base font-serif font-bold text-[#F5F5F2]">Double-Entry Portfolio Ledger</h3>
                <p className="text-xs text-[#A1A8B3] leading-relaxed">
                  Live Mark-to-Market (MTM) calculation per tick, realized profit/loss, margin locks, and an immutable double-entry audited cash journal.
                </p>
                <div className="text-[11px] font-mono text-emerald-400 pt-1">Real-Time MTM Ticks</div>
              </div>

              {/* Feature 6 */}
              <div className="cendrix-card p-6 rounded-xl border border-[#14223A] space-y-3">
                <div className="w-11 h-11 bg-[#0B1424] rounded-lg flex items-center justify-center border border-[rgba(198,161,91,0.25)] text-[#C6A15B]">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-serif font-bold text-[#F5F5F2]">Quantitative Audit Suite</h3>
                <p className="text-xs text-[#A1A8B3] leading-relaxed">
                  Institutional analytics featuring win rates, profit factor, max peak-to-trough drawdown, session breakdown, and 1-click CSV statement export.
                </p>
                <div className="text-[11px] font-mono text-[#C6A15B] pt-1">Downloadable Statements</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. Dedicated Image Showcase: Audited Quantitative Analytics ──── */}
        <section id="analytics-preview" className="py-24 border-y border-[#14223A] bg-[#0E1728]/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Left Column: Visual AI Graphic */}
              <div className="relative rounded-2xl overflow-hidden border border-[rgba(198,161,91,0.3)] shadow-[0_20px_50px_rgba(0,0,0,0.8)] group order-2 lg:order-1">
                <img 
                  src="/cendrix-quant-analytics.jpg" 
                  alt="Cendrix Quantitative Risk & Analytics Suite" 
                  className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1424] via-transparent to-transparent opacity-60" />
                
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-[#0B1424]/90 backdrop-blur-md border border-[rgba(198,161,91,0.25)] font-mono text-xs flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-[#C6A15B] font-bold uppercase tracking-wider block">Quantum Risk Suite</span>
                    <span className="text-[#F5F5F2] font-semibold">Value-at-Risk · Max Drawdown · Sharpe Telemetry</span>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[11px]">
                    Live Audited
                  </span>
                </div>
              </div>

              {/* Right Column: Copy & Indicators */}
              <div className="space-y-6 order-1 lg:order-2">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono tracking-widest text-[#C6A15B] uppercase font-bold">
                      Institutional Risk Protocol
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#F5F5F2] tracking-tight">
                    Audited Quantitative Risk &<br />
                    <span className="text-[#C6A15B]">Real-Time Equity Telemetry.</span>
                  </h2>
                </div>

                <p className="text-sm text-[#A1A8B3] leading-relaxed">
                  Professional trading demands more than a simple P&L number. Cendrix CNRX provides deep quantitative transparency into your trading edge, session volatility, win rate, and peak-to-trough drawdown — backed by double-entry accounting.
                </p>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-4 bg-[#0B1424] rounded-xl border border-[#14223A] space-y-1">
                    <span className="text-[10px] text-[#6E7683] uppercase block">Mathematical Win-Rate</span>
                    <span className="text-xl font-bold text-emerald-400">Audited per Exit</span>
                    <p className="text-[10px] text-[#A1A8B3] font-sans">Every completed position fill is checked against entry execution.</p>
                  </div>

                  <div className="p-4 bg-[#0B1424] rounded-xl border border-[#14223A] space-y-1">
                    <span className="text-[10px] text-[#6E7683] uppercase block">Drawdown Engine</span>
                    <span className="text-xl font-bold text-rose-400">Peak-to-Trough</span>
                    <p className="text-[10px] text-[#A1A8B3] font-sans">Continuous tracking of margin preservation and capital safety.</p>
                  </div>

                  <div className="p-4 bg-[#0B1424] rounded-xl border border-[#14223A] space-y-1">
                    <span className="text-[10px] text-[#6E7683] uppercase block">Regulatory Ledger</span>
                    <span className="text-xl font-bold text-[#C6A15B]">Paise Precision</span>
                    <p className="text-[10px] text-[#A1A8B3] font-sans">STT, CTT, GST and exchange charges audited per transaction.</p>
                  </div>

                  <div className="p-4 bg-[#0B1424] rounded-xl border border-[#14223A] space-y-1">
                    <span className="text-[10px] text-[#6E7683] uppercase block">CSV Statement Export</span>
                    <span className="text-xl font-bold text-[#F5F5F2]">1-Click Download</span>
                    <p className="text-[10px] text-[#A1A8B3] font-sans">Instant institutional statement export ready for strategy backchecks.</p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link 
                    to="/dashboard/analytics" 
                    className="btn-cendrix-gold py-3 px-6 text-xs font-bold tracking-wider inline-flex items-center gap-2"
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
        <section id="demo" className="py-20 border-b border-[#14223A] bg-[#0B1424] relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[10px] font-mono text-emerald-400 uppercase font-bold mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Live Interactive Sandbox</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#F5F5F2] tracking-tight mb-2">
                Test-Drive the Execution Pad
              </h2>
              <p className="text-xs text-[#A1A8B3]">
                Experience instant in-memory matching and real-time P&L telemetry right now on this page.
              </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Interactive Order Pad */}
              <div className="lg:col-span-5 cendrix-card p-6 rounded-2xl border border-[rgba(198,161,91,0.25)] shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-[#14223A] mb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#C6A15B]" />
                    <span className="text-xs font-serif font-bold text-[#F5F5F2] uppercase tracking-wider">
                      Interactive Order Ticket
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                    0ms Latency
                  </span>
                </div>

                <form onSubmit={handleSimulateTrade} className="space-y-4">
                  {/* Select Instrument */}
                  <div>
                    <label className="block text-[10px] text-[#A1A8B3] uppercase font-mono mb-1.5">Select Scrip</label>
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
                          className={`p-2.5 rounded-lg border text-left transition-all font-mono text-xs ${
                            demoSymbol === item.id
                              ? 'bg-[#10141C] border-[#C6A15B] text-[#F5F5F2] shadow-[0_2px_10px_rgba(198,161,91,0.2)]'
                              : 'bg-[#0B1424] border-[#14223A] text-[#6E7683] hover:text-[#A1A8B3]'
                          }`}
                        >
                          <div className="font-bold text-[#F5F5F2]">{item.id}</div>
                          <div className="text-[10px] text-[#C6A15B]">{item.price}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Buy / Sell Toggle */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDemoSide('BUY')}
                      className={`py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
                        demoSide === 'BUY'
                          ? 'bg-emerald-600 text-white shadow-[0_2px_10px_rgba(16,185,129,0.3)]'
                          : 'bg-[#0B1424] border border-[#14223A] text-[#6E7683] hover:text-[#F5F5F2]'
                      }`}
                    >
                      BUY (Long)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDemoSide('SELL')}
                      className={`py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
                        demoSide === 'SELL'
                          ? 'bg-rose-600 text-white shadow-[0_2px_10px_rgba(239,68,68,0.3)]'
                          : 'bg-[#0B1424] border border-[#14223A] text-[#6E7683] hover:text-[#F5F5F2]'
                      }`}
                    >
                      SELL (Short)
                    </button>
                  </div>

                  {/* Quantity Sizing */}
                  <div>
                    <label className="block text-[10px] text-[#A1A8B3] uppercase font-mono mb-1">
                      Quantity / Lots
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={demoQty}
                        onChange={(e) => setDemoQty(parseInt(e.target.value) || 1)}
                        className="w-full bg-[#0B1424] border border-[#14223A] rounded-lg px-3 py-2 font-mono text-sm text-[#F5F5F2] focus:outline-none focus:border-[#C6A15B]"
                      />
                      <span className="text-xs text-[#C6A15B] font-mono shrink-0">
                        Lot x {demoQty}
                      </span>
                    </div>
                  </div>

                  {/* Execution Button */}
                  <button
                    type="submit"
                    className={`w-full py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 ${
                      demoSide === 'BUY'
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-[0_4px_16px_rgba(16,185,129,0.3)]'
                        : 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white shadow-[0_4px_16px_rgba(239,68,68,0.3)]'
                    }`}
                  >
                    Simulate Instant {demoSide} Fill
                  </button>

                  {demoExecutedAlert && (
                    <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono text-center animate-bounce">
                      ✓ Simulated {demoExecutedAlert.side} Fill Executed @ ₹{demoExecutedAlert.price.toLocaleString('en-IN')}
                    </div>
                  )}
                </form>
              </div>

              {/* Right Column: Live Telemetry & Active Position Preview */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#C6A15B]" />
                    <h3 className="text-xs font-serif font-bold text-[#F5F5F2] uppercase tracking-wider">
                      Live Simulated Position Telemetry
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-[#A1A8B3]">
                    Updates in real-time
                  </span>
                </div>

                <div className="cendrix-card rounded-xl border border-[#14223A] overflow-hidden">
                  <table className="w-full text-left text-xs font-mono border-collapse">
                    <thead>
                      <tr className="border-b border-[#14223A] text-[10px] text-[#6E7683] uppercase bg-[#0B1424]">
                        <th className="py-2.5 px-3">Contract</th>
                        <th className="py-2.5 px-3">Side</th>
                        <th className="py-2.5 px-3 text-right">Entry</th>
                        <th className="py-2.5 px-3 text-right">LTP</th>
                        <th className="py-2.5 px-3 text-right">Live MTM</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#14223A]">
                      {demoPositions.map((pos) => {
                        const isProfitable = pos.pnl >= 0;
                        return (
                          <tr key={pos.id} className="hover:bg-[#14223A]/40 transition-colors">
                            <td className="py-3 px-3 font-semibold text-[#F5F5F2]">{pos.symbol}</td>
                            <td className="py-3 px-3 font-sans">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                pos.side === 'BUY'
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              }`}>
                                {pos.side}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right text-[#A1A8B3]">₹{pos.entryPrice.toFixed(2)}</td>
                            <td className="py-3 px-3 text-right font-bold text-[#F5F5F2]">₹{pos.currentPrice.toFixed(2)}</td>
                            <td className={`py-3 px-3 text-right font-bold ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isProfitable ? '+' : ''}₹{pos.pnl.toFixed(2)} ({isProfitable ? '+' : ''}{pos.pnlPct.toFixed(2)}%)
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Explanation Card */}
                <div className="p-4 bg-[#0B1424] rounded-xl border border-[#14223A] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-[#C6A15B] shrink-0" />
                    <span className="text-[#A1A8B3]">
                      Every position in the full workstation is recorded to the immutable ledger with audited regulatory charge breakdowns.
                    </span>
                  </div>
                  <Link 
                    to="/dashboard" 
                    className="text-xs font-semibold text-[#C6A15B] hover:text-[#E2C889] shrink-0 ml-4 font-mono flex items-center gap-1"
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
        <section id="advantage" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-[10px] font-mono tracking-widest text-[#C6A15B] uppercase font-bold">
                  The Institutional Standard
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#F5F5F2] tracking-tight mb-4">
                Why Cendrix CNRX Outperforms Generic Simulators
              </h2>
              <p className="text-sm text-[#A1A8B3] leading-relaxed">
                Most paper trading apps deceive traders with synthetic curves, zero slippage, and zero regulatory charges. Cendrix replicates actual market conditions so your live performance matches your simulated edge.
              </p>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto cendrix-card rounded-2xl border border-[rgba(198,161,91,0.25)] shadow-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#14223A] bg-[#0B1424] text-xs font-mono uppercase">
                    <th className="py-4 px-6 text-[#F5F5F2] font-serif font-bold">Trading Dimension</th>
                    <th className="py-4 px-6 text-[#C6A15B] font-serif font-bold bg-[#C6A15B]/10 border-x border-[#14223A]">
                      Cendrix Capital (CNRX)
                    </th>
                    <th className="py-4 px-6 text-[#6E7683]">Generic Paper Simulators</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#14223A]">
                  <tr className="hover:bg-[#14223A]/30 transition-colors">
                    <td className="py-4 px-6 font-semibold text-[#F5F5F2]">Market Price Authenticity</td>
                    <td className="py-4 px-6 font-semibold text-emerald-400 bg-[#C6A15B]/5 border-x border-[#14223A] flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>100% Genuine Direct Exchange Market Data Feeds</span>
                    </td>
                    <td className="py-4 px-6 text-[#6E7683]">
                      Artificial synthetic random-walk curves or 15-min delayed quotes
                    </td>
                  </tr>

                  <tr className="hover:bg-[#14223A]/30 transition-colors">
                    <td className="py-4 px-6 font-semibold text-[#F5F5F2]">Commodities & Bullion</td>
                    <td className="py-4 px-6 font-semibold text-emerald-400 bg-[#C6A15B]/5 border-x border-[#14223A] flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Dedicated MCX Desk (Gold, Silver, Crude Oil, Natural Gas)</span>
                    </td>
                    <td className="py-4 px-6 text-[#6E7683]">
                      Equities only; no MCX commodity lot size modeling
                    </td>
                  </tr>

                  <tr className="hover:bg-[#14223A]/30 transition-colors">
                    <td className="py-4 px-6 font-semibold text-[#F5F5F2]">Statutory Tax & Regulatory Deductions</td>
                    <td className="py-4 px-6 font-semibold text-emerald-400 bg-[#C6A15B]/5 border-x border-[#14223A] flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Full STT, CTT, GST, Stamp Duty & SEBI Turnover Charges</span>
                    </td>
                    <td className="py-4 px-6 text-[#6E7683]">
                      ₹0 flat friction; distorts profit & loss expectations
                    </td>
                  </tr>

                  <tr className="hover:bg-[#14223A]/30 transition-colors">
                    <td className="py-4 px-6 font-semibold text-[#F5F5F2]">Margin Leverage Sizing</td>
                    <td className="py-4 px-6 font-semibold text-emerald-400 bg-[#C6A15B]/5 border-x border-[#14223A] flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Verified Exchange Leverage: MIS (5x Intraday) & NRML/CNC</span>
                    </td>
                    <td className="py-4 px-6 text-[#6E7683]">
                      Arbitrary or unlimited leverage; unrealistic risk habits
                    </td>
                  </tr>

                  <tr className="hover:bg-[#14223A]/30 transition-colors">
                    <td className="py-4 px-6 font-semibold text-[#F5F5F2]">Order Execution Velocity</td>
                    <td className="py-4 px-6 font-semibold text-emerald-400 bg-[#C6A15B]/5 border-x border-[#14223A] flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>&lt; 1ms In-Memory Matching with instant fill telemetry</span>
                    </td>
                    <td className="py-4 px-6 text-[#6E7683]">
                      Delayed simulated HTTP requests with lag
                    </td>
                  </tr>

                  <tr className="hover:bg-[#14223A]/30 transition-colors">
                    <td className="py-4 px-6 font-semibold text-[#F5F5F2]">Portfolio Accounting & Auditing</td>
                    <td className="py-4 px-6 font-semibold text-emerald-400 bg-[#C6A15B]/5 border-x border-[#14223A] flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Double-entry audited cash ledger with downloadable CSV</span>
                    </td>
                    <td className="py-4 px-6 text-[#6E7683]">
                      Basic superficial P&L count without transaction ledger
                    </td>
                  </tr>

                  <tr className="hover:bg-[#14223A]/30 transition-colors">
                    <td className="py-4 px-6 font-semibold text-[#F5F5F2]">Client Access & Onboarding</td>
                    <td className="py-4 px-6 font-semibold text-emerald-400 bg-[#C6A15B]/5 border-x border-[#14223A] flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>1-Click Instant Institutional Auto-Connect (No KYC friction)</span>
                    </td>
                    <td className="py-4 px-6 text-[#6E7683]">
                      Forced phone verification, advertisements, or paywalls
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── 9. Multi-Asset Ecosystem with 3D Holographic AI Visual ─────── */}
        <section id="commodities" className="py-24 border-t border-[#14223A] bg-[#0E1728]/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Left Column: Visual AI Asset Showcase */}
              <div className="relative rounded-2xl overflow-hidden border border-[rgba(198,161,91,0.3)] shadow-[0_20px_50px_rgba(0,0,0,0.8)] group">
                <img 
                  src="/cendrix-multi-asset.jpg" 
                  alt="Cendrix Multi-Asset Suite (Equities, F&O, MCX Bullion)" 
                  className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1424] via-transparent to-transparent opacity-60" />
                
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-[#0B1424]/90 backdrop-blur-md border border-[rgba(198,161,91,0.25)] font-mono text-xs flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-[#C6A15B] font-bold uppercase tracking-wider block">Multi-Asset Engine</span>
                    <span className="text-[#F5F5F2] font-semibold">NSE Cash · NFO Futures · MCX Bullion</span>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-[#C6A15B]/15 border border-[#C6A15B]/30 text-[#E2C889] font-bold text-[11px]">
                    All-in-One
                  </span>
                </div>
              </div>

              {/* Right Column: Asset Class Selector & Details */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono tracking-widest text-[#C6A15B] uppercase font-bold">
                      Unified Capital Desk
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#F5F5F2] tracking-tight">
                    One Capital Allocation.<br />
                    <span className="text-[#C6A15B]">Three Premier Asset Classes.</span>
                  </h2>
                </div>

                {/* Sub-tabs for Asset Classes */}
                <div className="flex gap-2 p-1 bg-[#0B1424] rounded-xl border border-[#14223A] font-mono text-xs">
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
                          ? 'bg-[#10141C] text-[#C6A15B] border border-[#C6A15B]/40 shadow-sm'
                          : 'text-[#6E7683] hover:text-[#A1A8B3]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {activeAssetTab === 'commodities' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <p className="text-sm text-[#A1A8B3] leading-relaxed">
                      Practice bullion, energy, and base metals trading on authentic MCX contract specifications with verified lot sizes, tick sizes, and margin leverage.
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                      <div className="p-3 bg-[#0B1424] rounded-lg border border-[#14223A]">
                        <span className="text-[10px] text-[#6E7683] block">GOLD MINI (GOLDM)</span>
                        <span className="font-bold text-[#F5F5F2]">100 Grams Lot</span>
                      </div>
                      <div className="p-3 bg-[#0B1424] rounded-lg border border-[#14223A]">
                        <span className="text-[10px] text-[#6E7683] block">SILVER MINI (SILVERM)</span>
                        <span className="font-bold text-[#F5F5F2]">5 Kilograms Lot</span>
                      </div>
                      <div className="p-3 bg-[#0B1424] rounded-lg border border-[#14223A]">
                        <span className="text-[10px] text-[#6E7683] block">CRUDE OIL</span>
                        <span className="font-bold text-[#F5F5F2]">100 Barrels Lot</span>
                      </div>
                      <div className="p-3 bg-[#0B1424] rounded-lg border border-[#14223A]">
                        <span className="text-[10px] text-[#6E7683] block">NATURAL GAS</span>
                        <span className="font-bold text-[#F5F5F2]">1250 mmBtu Lot</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeAssetTab === 'derivatives' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <p className="text-sm text-[#A1A8B3] leading-relaxed">
                      Validate quantitative index and stock futures strategies with real-time underlying basis calculation, contract expiries, and SPAN margin locks.
                    </p>
                    <ul className="space-y-2 text-xs text-[#A1A8B3]">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Nifty 50, Bank Nifty, and FinNifty Futures with exact lot sizing</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Single stock futures with realistic basis tracking</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Carryforward (NRML) vs Intraday (MIS) margin leverage options</span>
                      </li>
                    </ul>
                  </div>
                )}

                {activeAssetTab === 'equities' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <p className="text-sm text-[#A1A8B3] leading-relaxed">
                      Trade liquid blue-chip equities from the NSE and BSE with full Delivery (CNC) and Intraday (MIS 5x leverage) order routing.
                    </p>
                    <ul className="space-y-2 text-xs text-[#A1A8B3]">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Reliance, TCS, HDFC Bank, Infosys, ICICI Bank, and Tata Steel</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Live Level 2 market depth (5 Bid / 5 Ask)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Instant MTM mark-to-market updates per tick</span>
                      </li>
                    </ul>
                  </div>
                )}

                <div className="pt-2">
                  <Link 
                    to="/dashboard/commodities" 
                    className="btn-cendrix-gold py-3 px-6 text-xs font-bold tracking-wider inline-flex items-center gap-2"
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
        <section id="pipeline" className="py-24 border-t border-[#14223A] bg-[#0B1424]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-[10px] font-mono tracking-widest text-[#C6A15B] uppercase font-bold">
                  Zero Delay Protocol
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#F5F5F2] tracking-tight mb-4">
                Real-Time Data Pipeline Architecture
              </h2>
              <p className="text-sm text-[#A1A8B3] leading-relaxed">
                How genuine direct exchange order flow connects to your simulated workstation in less than one millisecond.
              </p>
            </div>

            {/* Architecture Steps Grid */}
            <div className="grid md:grid-cols-4 gap-4 relative">
              <div className="cendrix-card p-6 rounded-xl border border-[#14223A] space-y-3">
                <div className="text-[10px] font-mono text-[#C6A15B] font-bold uppercase">01 / Exchange Feeds</div>
                <div className="text-base font-serif font-bold text-[#F5F5F2]">Direct Exchange Gateway</div>
                <p className="text-xs text-[#A1A8B3] leading-relaxed">
                  Real-time binary WebSocket streaming from NSE, BSE, and MCX exchange servers.
                </p>
              </div>

              <div className="cendrix-card p-6 rounded-xl border border-[#14223A] space-y-3">
                <div className="text-[10px] font-mono text-[#C6A15B] font-bold uppercase">02 / Telemetry Engine</div>
                <div className="text-base font-serif font-bold text-[#F5F5F2]">CNRX In-Memory Bus</div>
                <p className="text-xs text-[#A1A8B3] leading-relaxed">
                  Sub-millisecond pub/sub streaming bus delivering ticks directly to trading state.
                </p>
              </div>

              <div className="cendrix-card p-6 rounded-xl border border-[#14223A] space-y-3">
                <div className="text-[10px] font-mono text-[#C6A15B] font-bold uppercase">03 / Financial Engine</div>
                <div className="text-base font-serif font-bold text-[#F5F5F2]">SPAN & Tax Math</div>
                <p className="text-xs text-[#A1A8B3] leading-relaxed">
                  Instant calculation of margin requirements, STT, CTT, GST, and SEBI turnover fees.
                </p>
              </div>

              <div className="cendrix-card p-6 rounded-xl border border-[#14223A] space-y-3">
                <div className="text-[10px] font-mono text-[#C6A15B] font-bold uppercase">04 / Terminal Output</div>
                <div className="text-base font-serif font-bold text-[#F5F5F2]">Client Workstation</div>
                <p className="text-xs text-[#A1A8B3] leading-relaxed">
                  Level 2 market depth, order ticket fills, and audited double-entry portfolio ledger.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 11. The Final Call to Action ───────────────────────────────── */}
        <section className="py-24 relative overflow-hidden bg-gradient-to-b from-[#0B1424] to-[#070D18] border-t border-[#14223A]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#0E1728] border border-[rgba(198,161,91,0.3)] flex items-center justify-center p-2.5 mb-8 shadow-2xl">
              <img src="/cendrix-logo.png" alt="Cendrix Capital" className="w-full h-full object-contain" />
            </div>

            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#F5F5F2] mb-6 tracking-tight">
              Begin Paper Trading With Live Precision.
            </h2>
            <p className="text-sm sm:text-base text-[#A1A8B3] mb-10 max-w-2xl mx-auto leading-relaxed">
              Test your edge against real market forces with zero capital at risk. ₹10,00,000 in virtual funds is ready immediately with instant 1-click auto-connect.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link 
                to="/dashboard" 
                className="w-full sm:w-auto btn-cendrix-gold py-4 px-10 text-xs tracking-wider font-bold shadow-[0_6px_25px_rgba(198,161,91,0.35)] flex items-center justify-center gap-2"
              >
                <span>Launch Cendrix Trading Desk</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link 
                to="/dashboard/commodities" 
                className="w-full sm:w-auto btn-cendrix-outline py-4 px-8 text-xs tracking-wider font-semibold"
              >
                Commodities Suite
              </Link>
            </div>
          </div>
        </section>

        {/* ── 12. Institutional Footer & Legal Disclosures ───────────────── */}
        <footer className="border-t border-[#14223A] py-12 bg-[#070D18]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-8 border-b border-[#14223A]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#0E1728] border border-[rgba(198,161,91,0.25)] flex items-center justify-center p-1 overflow-hidden">
                  <img src="/cendrix-logo.png" alt="Cendrix Capital" className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="text-sm font-serif font-bold tracking-wider text-[#F5F5F2]">
                    CENDRIX CAPITAL · <span className="text-[#C6A15B] font-mono">CNRX</span>
                  </span>
                  <p className="text-[10px] text-[#6E7683] font-mono">
                    Proprietary Quantitative Paper Trading Workstation
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-6 text-xs text-[#A1A8B3] font-medium">
                <Link to="/privacy" className="hover:text-[#F5F5F2] transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="hover:text-[#F5F5F2] transition-colors">Terms of Service</Link>
                <a href="mailto:atharva.bhosale@yahoo.com" className="hover:text-[#C6A15B] transition-colors">Desk Support</a>
                <a href="https://www.linkedin.com/in/atharva--bhosale" target="_blank" rel="noopener noreferrer" className="hover:text-[#C6A15B] transition-colors">LinkedIn</a>
                <Link to="/dashboard" className="text-[#C6A15B] hover:text-[#E2C889] font-mono font-semibold">Terminal Access →</Link>
              </div>
            </div>

            <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-[#6E7683] font-mono">
              <p>© {new Date().getFullYear()} Cendrix Capital. Institutional Paper Trading Platform. All rights reserved.</p>
              <p className="text-center md:text-right max-w-xl">
                Notice: CNRX is a simulated educational and research workstation. All funds are 100% virtual and cannot be redeemed for real currency. Not a SEBI-registered broker or financial advisor.
              </p>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
