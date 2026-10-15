import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, Shield, Zap, TrendingUp, Crosshair, Activity, Lock, Database, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function Landing() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    const handleScroll = () => setScrolled(window.scrollY > 50);
    
    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  return (
    <div className="min-h-screen bg-[#0B1424] text-[#F5F5F2] relative overflow-x-hidden font-sans selection:bg-[#C6A15B] selection:text-[#0B1424] cursor-none">
      
      {/* Fancy Gold Cursor */}
      <div 
        className="pointer-events-none fixed top-0 left-0 w-8 h-8 rounded-full border border-[#C6A15B]/50 z-[100] transition-transform duration-75 ease-out flex items-center justify-center mix-blend-screen"
        style={{ transform: `translate(${mousePosition.x - 16}px, ${mousePosition.y - 16}px) scale(${isHovering ? 1.8 : 1})` }}
      >
        <div className="w-1.5 h-1.5 bg-[#C6A15B] rounded-full shadow-[0_0_10px_#C6A15B]" />
      </div>

      {/* Dynamic Background with Gold Beams */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#C6A15B]/15 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#C6A15B]/10 rounded-full blur-[150px]" />
        
        {/* Animated Beams */}
        <div className="absolute top-[20%] left-[-10%] w-[120%] h-px bg-gradient-to-r from-transparent via-[#C6A15B]/30 to-transparent transform rotate-[-3deg] opacity-50" />
        <div className="absolute top-[65%] left-[-10%] w-[120%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent transform rotate-[4deg] opacity-30" />
        <div className="absolute top-[85%] left-[-10%] w-[120%] h-px bg-gradient-to-r from-transparent via-[#C6A15B]/20 to-transparent transform rotate-[-1deg] opacity-40" />
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#0B1424]/90 backdrop-blur-md border-b border-[rgba(198,161,91,0.2)] py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0E1728] border border-[rgba(198,161,91,0.4)] flex items-center justify-center p-1.5 shadow-[0_0_15px_rgba(198,161,91,0.2)]">
              <img src="/monogram.svg" alt="CNRX" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-xl font-serif font-bold tracking-wider text-[#F5F5F2] uppercase">
                CN<span className="text-[#C6A15B]">RX</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[9px] font-mono text-[#C6A15B] bg-[#C6A15B]/10 px-1.5 py-0.5 rounded border border-[#C6A15B]/30 uppercase">
                Simulated Trading
              </span>
            </div>
          </div>
          <div className="hidden md:flex gap-10 text-[13px] font-medium text-[#A1A8B3]">
            <a href="#features" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="hover:text-[#F5F5F2] transition-colors">Features</a>
            <a href="#philosophy" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="hover:text-[#F5F5F2] transition-colors">Methodology</a>
            <a href="#metrics" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="hover:text-[#F5F5F2] transition-colors">Analytics</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="text-[13px] font-medium text-[#A1A8B3] hover:text-[#F5F5F2] transition-colors">
              Sign In
            </Link>
            <Link to="/dashboard" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="btn-cendrix-gold text-xs py-2 px-4 shadow-[0_0_20px_rgba(198,161,91,0.3)]">
              Launch Platform
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10">
        
        {/* Section 1: Hero */}
        <section className="min-h-screen flex items-center justify-center pt-24 pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 bg-[#0E1728] border border-[rgba(198,161,91,0.3)] rounded-full text-[11px] font-semibold text-[#C6A15B] uppercase tracking-widest backdrop-blur-md shadow-[0_0_15px_rgba(198,161,91,0.15)] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
              Cendrix Capital Execution Engine
            </div>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#F5F5F2] via-[#E2C889] to-[#8F6E2C] tracking-tight mb-8 leading-[1.08] max-w-5xl mx-auto">
              Precision. Discipline.<br/>
              <span>Institutional Performance.</span>
            </h1>
            <p className="text-base sm:text-xl text-[#A1A8B3] mb-12 leading-relaxed max-w-2xl mx-auto font-normal">
              CNRX is an institutional simulated paper trading terminal. Master the Indian stock, futures, and options markets with live Upstox ticks, realistic margin models, and transaction-audited performance telemetry.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/dashboard" 
                onMouseEnter={handleMouseEnter} 
                onMouseLeave={handleMouseLeave}
                className="btn-cendrix-gold py-4 px-8 text-sm tracking-wider"
              >
                Enter Simulated Trading (₹10L Virtual) <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <Link 
                to="/login" 
                onMouseEnter={handleMouseEnter} 
                onMouseLeave={handleMouseLeave}
                className="btn-cendrix-outline py-4 px-8 text-sm tracking-wider"
              >
                Sign In With Account
              </Link>
            </div>
          </div>
        </section>

        {/* Section 2: Social Proof / Metrics Banner */}
        <section className="py-12 border-y border-[rgba(198,161,91,0.18)] bg-[#0E1728]/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center md:justify-between items-center gap-8 text-center md:text-left">
              <div>
                <p className="text-3xl font-mono font-bold text-[#F5F5F2] mb-1">₹10,00,000</p>
                <p className="text-[11px] uppercase tracking-wider text-[#A1A8B3] font-semibold">Virtual Starting Capital</p>
              </div>
              <div className="hidden md:block w-px h-12 bg-white/10"></div>
              <div>
                <p className="text-3xl font-mono font-bold text-[#10B981] mb-1">100% LIVE</p>
                <p className="text-[11px] uppercase tracking-wider text-[#A1A8B3] font-semibold">Upstox Public Market Feed</p>
              </div>
              <div className="hidden md:block w-px h-12 bg-white/10"></div>
              <div>
                <p className="text-3xl font-mono font-bold text-[#F5F5F2] mb-1">&lt; 1ms</p>
                <p className="text-[11px] uppercase tracking-wider text-[#A1A8B3] font-semibold">Order Matching Latency</p>
              </div>
              <div className="hidden md:block w-px h-12 bg-white/10"></div>
              <div>
                <p className="text-3xl font-mono font-bold text-[#C6A15B] mb-1">NSE & BSE</p>
                <p className="text-[11px] uppercase tracking-wider text-[#C6A15B] font-semibold">Equity, Futures & Options</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Deep Dive */}
        <section id="philosophy" className="py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="w-12 h-12 bg-[#0E1728] rounded-xl flex items-center justify-center border border-[rgba(198,161,91,0.3)] shadow-[0_0_15px_rgba(198,161,91,0.15)]">
                  <Database className="w-6 h-6 text-[#C6A15B]" />
                </div>
                <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#F5F5F2] tracking-tight leading-[1.15]">
                  Zero Mock Database.<br/>
                  <span className="text-[#A1A8B3]">Live Market Realities.</span>
                </h2>
                <p className="text-base text-[#A1A8B3] leading-relaxed">
                  Real traders do not practice on fake random-number price simulators. CNRX connects to live NSE and BSE intraday feeds, computing realistic slippage, statutory STT, exchange turnover fees, and SEBI charges.
                </p>
                <ul className="space-y-4">
                  {[
                    'Live Upstox streaming quotes with intraday public candles',
                    'Realistic margin calculations for Delivery, Intraday, and F&O',
                    'Realized & Unrealized MTM updated live per market tick',
                    'Audited ledger of every order fill, transaction fee, and cash checkpoint'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-[#F5F5F2] text-sm font-medium">
                      <div className="w-5 h-5 rounded-full bg-[#10B981]/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#C6A15B]/20 to-transparent rounded-2xl blur-3xl" />
                <div className="relative bg-[#0E1728] border border-[rgba(198,161,91,0.25)] rounded-2xl p-8 backdrop-blur-xl shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
                  {/* Faux Dashboard UI Element */}
                  <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
                    <div>
                      <p className="text-xs text-[#A1A8B3] font-semibold uppercase tracking-wider mb-1 font-mono">Virtual Account Equity</p>
                      <p className="text-3xl font-mono font-bold text-[#F5F5F2]">₹10,24,550.00 <span className="text-sm text-[#10B981] font-semibold ml-2">+2.45%</span></p>
                    </div>
                    <Activity className="w-10 h-10 text-[#C6A15B]" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 w-full bg-[#0B1424] rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-gradient-to-r from-[#C6A15B] to-[#10B981] w-[74%]" />
                    </div>
                    <p className="text-xs text-[#A1A8B3] font-mono text-right">NSE / BSE Live Session Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Detailed Features */}
        <section id="features" className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#F5F5F2] tracking-tight mb-4">CNRX Core Capabilities</h2>
              <p className="text-base text-[#A1A8B3]">Engineered for serious market operators and quantitative strategy testing.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div 
                onMouseEnter={handleMouseEnter} 
                onMouseLeave={handleMouseLeave}
                className="p-8 rounded-2xl bg-[#0E1728] border border-[rgba(198,161,91,0.2)] hover:border-[rgba(198,161,91,0.45)] transition-all duration-300 group shadow-lg"
              >
                <div className="w-12 h-12 bg-[#0B1424] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-[rgba(198,161,91,0.3)]">
                  <Crosshair className="w-6 h-6 text-[#C6A15B]" />
                </div>
                <h3 className="text-lg font-serif font-bold text-[#F5F5F2] mb-2">Simulated Execution Engine</h3>
                <p className="text-[#A1A8B3] text-sm leading-relaxed">
                  Support for MARKET, LIMIT, SL, and SL-M order types across Delivery (CNC), Intraday (MIS), and Normal (NRML) contracts.
                </p>
              </div>
              
              <div 
                onMouseEnter={handleMouseEnter} 
                onMouseLeave={handleMouseLeave}
                className="p-8 rounded-2xl bg-[#0E1728] border border-[rgba(198,161,91,0.2)] hover:border-[rgba(198,161,91,0.45)] transition-all duration-300 group shadow-lg"
              >
                <div className="w-12 h-12 bg-[#0B1424] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-[rgba(198,161,91,0.3)]">
                  <TrendingUp className="w-6 h-6 text-[#C6A15B]" />
                </div>
                <h3 className="text-lg font-serif font-bold text-[#F5F5F2] mb-2">Full Derivatives Chain</h3>
                <p className="text-[#A1A8B3] text-sm leading-relaxed">
                  Deep Option Chains with live Call/Put Open Interest, strike matrices, and real-time Greek calculations (Delta, Gamma, Theta, Vega).
                </p>
              </div>
              
              <div 
                onMouseEnter={handleMouseEnter} 
                onMouseLeave={handleMouseLeave}
                className="p-8 rounded-2xl bg-[#0E1728] border border-[rgba(198,161,91,0.2)] hover:border-[rgba(198,161,91,0.45)] transition-all duration-300 group shadow-lg"
              >
                <div className="w-12 h-12 bg-[#0B1424] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-[rgba(198,161,91,0.3)]">
                  <Zap className="w-6 h-6 text-[#C6A15B]" />
                </div>
                <h3 className="text-lg font-serif font-bold text-[#F5F5F2] mb-2">TradingView Terminal</h3>
                <p className="text-[#A1A8B3] text-sm leading-relaxed">
                  Interactive multi-interval candlestick charting powered by TradingView Lightweight Charts with live bar rendering and tick updates.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: The Final CTA */}
        <section className="py-24 relative overflow-hidden bg-gradient-to-b from-[#0B1424] to-[#0E1728]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-4xl sm:text-5xl font-serif font-bold text-[#F5F5F2] mb-6 tracking-tight">
              Begin Paper Trading With Live Precision.
            </h2>
            <p className="text-lg text-[#A1A8B3] mb-10 max-w-2xl mx-auto">
              Test your edge against real market forces with zero capital at risk. ₹10,00,000 in virtual funds ready instantly.
            </p>
            <Link 
              to="/dashboard" 
              onMouseEnter={handleMouseEnter} 
              onMouseLeave={handleMouseLeave}
              className="btn-cendrix-gold py-4 px-10 text-sm tracking-wider"
            >
              Launch CNRX Terminal <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[rgba(198,161,91,0.18)] py-12 bg-[#0B1424]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-[#0E1728] border border-[rgba(198,161,91,0.3)] flex items-center justify-center p-1">
                <img src="/monogram.svg" alt="CNRX" className="w-full h-full object-contain" />
              </div>
              <span className="text-sm font-serif font-bold tracking-wider text-[#F5F5F2]">
                CN<span className="text-[#C6A15B]">RX</span>
                <span className="text-xs text-[#A1A8B3] font-sans font-normal ml-2">by Cendrix Capital</span>
              </span>
            </div>
            <p className="text-xs text-[#A1A8B3] font-medium">© {new Date().getFullYear()} Cendrix Capital · CNRX Platform. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-6 text-xs font-medium text-[#A1A8B3]">
              <Link to="/privacy" className="hover:text-[#F5F5F2] transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-[#F5F5F2] transition-colors">Terms of Service</Link>
              <a href="mailto:atharva.bhosale@yahoo.com" className="hover:text-[#C6A15B] transition-colors">Contact</a>
              <a href="https://www.linkedin.com/in/atharva--bhosale" target="_blank" rel="noopener noreferrer" className="hover:text-[#C6A15B] transition-colors">LinkedIn</a>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
