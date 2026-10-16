import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, Shield, Zap, TrendingUp, Crosshair, Activity, Lock, Database, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1424] text-[#F5F5F2] relative overflow-x-hidden font-sans selection:bg-[#C6A15B] selection:text-[#0B1424]">
      
      {/* Subtle Prestige Ambient Glow */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-[-15%] left-[20%] w-[60%] h-[40%] bg-[#C6A15B]/5 rounded-full blur-[160px]" />
      </div>

      {/* Institutional Top Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-200 ${scrolled ? 'bg-[#0B1424]/95 backdrop-blur-md border-b border-[#14223A] py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0E1728] border border-[rgba(198,161,91,0.25)] flex items-center justify-center p-1 overflow-hidden shadow-sm">
              <img src="/cendrix-logo.png" alt="Cendrix Capital" className="w-full h-full object-contain" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-cinzel font-bold tracking-wider text-[#F5F5F2]">
                CENDRIX CAPITAL
              </span>
              <span className="text-[10px] font-mono text-[#C6A15B] bg-[#C6A15B]/10 px-1.5 py-0.5 rounded border border-[#C6A15B]/30 uppercase font-semibold">
                CNRX
              </span>
            </div>
          </div>

          <div className="hidden md:flex gap-8 text-xs font-semibold text-[#A1A8B3]">
            <a href="#features" className="hover:text-[#F5F5F2] transition-colors">Features</a>
            <a href="#philosophy" className="hover:text-[#F5F5F2] transition-colors">Methodology</a>
            <a href="#metrics" className="hover:text-[#F5F5F2] transition-colors">Analytics</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-xs font-semibold text-[#A1A8B3] hover:text-[#F5F5F2] transition-colors px-3 py-1.5">
              Instant Access
            </Link>
            <Link to="/dashboard" className="btn-cendrix-gold text-xs py-2 px-4 shadow-sm">
              Launch Terminal
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10">
        
        {/* Section 1: Hero */}
        <section className="min-h-screen flex items-center justify-center pt-28 pb-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 bg-[#0E1728] border border-[rgba(198,161,91,0.25)] rounded-full text-[11px] font-semibold text-[#C6A15B] uppercase tracking-widest font-mono shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              Institutional Simulation Engine · Live Exchange Feeds
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-8xl font-cinzel font-bold text-[#F5F5F2] tracking-tight mb-8 leading-[1.08] max-w-5xl mx-auto">
              Precision. Discipline.<br/>
              <span className="text-[#C6A15B]">Institutional Execution.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#A1A8B3] mb-12 leading-relaxed max-w-2xl mx-auto font-normal">
              CNRX is an institutional simulated paper trading terminal for Indian equities, derivatives, and MCX commodities. Trade on live exchange ticks with statutory tax modeling, margin calculation, and double-entry portfolio telemetry.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/dashboard" 
                className="btn-cendrix-gold py-3.5 px-8 text-xs tracking-wider font-bold"
              >
                Launch Workstation (₹10L Virtual) <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <Link 
                to="/dashboard/terminal" 
                className="btn-cendrix-outline py-3.5 px-8 text-xs tracking-wider font-semibold"
              >
                Live Trading Desk
              </Link>
            </div>
          </div>
        </section>

        {/* Section 2: Metrics Strip */}
        <section id="metrics" className="py-12 border-y border-[#14223A] bg-[#0E1728]/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
              <div className="p-5 bg-[#0B1424] rounded-xl border border-[rgba(198,161,91,0.2)]">
                <p className="text-2xl sm:text-3xl font-mono font-bold text-[#F5F5F2] mb-1">₹10,00,000</p>
                <p className="text-[10px] uppercase tracking-wider text-[#A1A8B3] font-semibold">Virtual Starting Balance</p>
              </div>

              <div className="p-5 bg-[#0B1424] rounded-xl border border-[rgba(198,161,91,0.2)]">
                <p className="text-2xl sm:text-3xl font-mono font-bold text-[#10B981] mb-1">100% LIVE</p>
                <p className="text-[10px] uppercase tracking-wider text-[#A1A8B3] font-semibold">Upstox Real-Time Quotes</p>
              </div>

              <div className="p-5 bg-[#0B1424] rounded-xl border border-[rgba(198,161,91,0.2)]">
                <p className="text-2xl sm:text-3xl font-mono font-bold text-[#F5F5F2] mb-1">&lt; 1ms</p>
                <p className="text-[10px] uppercase tracking-wider text-[#A1A8B3] font-semibold">Matching Engine Latency</p>
              </div>

              <div className="p-5 bg-[#0B1424] rounded-xl border border-[rgba(198,161,91,0.2)]">
                <p className="text-2xl sm:text-3xl font-mono font-bold text-[#C6A15B] mb-1">NSE · BSE · MCX</p>
                <p className="text-[10px] uppercase tracking-wider text-[#C6A15B] font-semibold">Equities, F&O & Commodities</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Deep Dive */}
        <section id="philosophy" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-14 items-center">
              <div className="space-y-6">
                <div className="w-10 h-10 bg-[#0E1728] rounded-xl flex items-center justify-center border border-[rgba(198,161,91,0.25)] shadow-md">
                  <Database className="w-5 h-5 text-[#C6A15B]" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-cinzel font-bold text-[#F5F5F2] tracking-tight leading-[1.15]">
                  Zero Synthetic Drift.<br/>
                  <span className="text-[#A1A8B3]">Live Market Realities.</span>
                </h2>
                <p className="text-sm text-[#A1A8B3] leading-relaxed">
                  Institutional trading mastery requires executing against real order flows and true market prices. CNRX streams genuine NSE, BSE, and MCX market ticks via Upstox API v2, factoring in STT, GST, SEBI turnover charges, and realistic bid-ask slippage.
                </p>
                <ul className="space-y-3.5 pt-2">
                  {[
                    'Live Upstox streaming quotes with intraday public candles',
                    'Realistic margin requirements for Delivery (CNC), Intraday (MIS), and Normal (NRML)',
                    'Realized & Unrealized MTM computed live per market tick',
                    'Audited ledger recording every fill, transaction fee, and cash checkpoint'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-[#F5F5F2] text-xs font-medium">
                      <div className="w-4 h-4 rounded-full bg-[#10B981]/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 bg-[#0E1728] border border-[rgba(198,161,91,0.25)] rounded-2xl shadow-2xl">
                {/* Workstation Snapshot */}
                <div className="flex justify-between items-center border-b border-[#14223A] pb-4 mb-5">
                  <div>
                    <p className="text-[10px] text-[#A1A8B3] font-semibold uppercase tracking-wider mb-1 font-mono">Virtual Account Equity</p>
                    <p className="text-2xl font-mono font-bold text-[#F5F5F2]">₹10,24,550.00 <span className="text-xs text-[#10B981] font-semibold ml-2">+2.45%</span></p>
                  </div>
                  <Activity className="w-8 h-8 text-[#C6A15B]" />
                </div>
                <div className="space-y-3">
                  <div className="h-1.5 w-full bg-[#0B1424] rounded-full overflow-hidden border border-[#14223A]">
                    <div className="h-full bg-gradient-to-r from-[#C6A15B] to-[#10B981] w-[74%]" />
                  </div>
                  <div className="flex justify-between text-[11px] text-[#A1A8B3] font-mono">
                    <span>Cash Margin: ₹8,42,100</span>
                    <span className="text-[#10B981] font-semibold">Live Session Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Capabilities */}
        <section id="features" className="py-20 border-t border-[#14223A] bg-[#0E1728]/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-3xl font-cinzel font-bold text-[#F5F5F2] tracking-tight mb-3">CNRX Core Capabilities</h2>
              <p className="text-xs text-[#A1A8B3]">Engineered for serious market operators and quantitative strategy validation.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-5">
              <div className="cendrix-card p-6 rounded-xl border border-[rgba(198,161,91,0.2)]">
                <div className="w-10 h-10 bg-[#0F192B] rounded-lg flex items-center justify-center mb-4 border border-[rgba(198,161,91,0.25)]">
                  <Crosshair className="w-5 h-5 text-[#C6A15B]" />
                </div>
                <h3 className="text-sm font-cinzel font-bold text-[#F5F5F2] mb-2">Simulated Order Ticket</h3>
                <p className="text-[#A1A8B3] text-xs leading-relaxed">
                  Support for MARKET, LIMIT, SL, and SL-M order types across Delivery (CNC), Intraday (MIS), and Normal (NRML) contracts.
                </p>
              </div>
              
              <div className="cendrix-card p-6 rounded-xl border border-[rgba(198,161,91,0.2)]">
                <div className="w-10 h-10 bg-[#0F192B] rounded-lg flex items-center justify-center mb-4 border border-[rgba(198,161,91,0.25)]">
                  <TrendingUp className="w-5 h-5 text-[#C6A15B]" />
                </div>
                <h3 className="text-sm font-cinzel font-bold text-[#F5F5F2] mb-2">Portfolio Telemetry</h3>
                <p className="text-[#A1A8B3] text-xs leading-relaxed">
                  Consolidated tracking of live Unrealized MTM, Realized P&L, contract sizing, margin lock, and double-entry audited cash ledger.
                </p>
              </div>
              
              <div className="cendrix-card p-6 rounded-xl border border-[rgba(198,161,91,0.2)]">
                <div className="w-10 h-10 bg-[#0F192B] rounded-lg flex items-center justify-center mb-4 border border-[rgba(198,161,91,0.25)]">
                  <Zap className="w-5 h-5 text-[#C6A15B]" />
                </div>
                <h3 className="text-sm font-cinzel font-bold text-[#F5F5F2] mb-2">High-Speed Order Terminal</h3>
                <p className="text-[#A1A8B3] text-xs leading-relaxed">
                  Direct 1-click execution pad with Level 2 market depth, exact contract lot sizing, live tick telemetry, and zero charting clutter.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: The Final CTA */}
        <section className="py-24 relative overflow-hidden bg-[#0B1424]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl sm:text-4xl font-cinzel font-bold text-[#F5F5F2] mb-4 tracking-tight">
              Begin Paper Trading With Live Precision.
            </h2>
            <p className="text-xs sm:text-sm text-[#A1A8B3] mb-8 max-w-xl mx-auto">
              Test your edge against real market forces with zero capital at risk. ₹10,00,000 in virtual funds ready instantly.
            </p>
            <Link 
              to="/dashboard" 
              className="btn-cendrix-gold py-3 px-8 text-xs tracking-wider font-bold"
            >
              Launch CNRX Terminal <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </section>

        {/* Institutional Footer */}
        <footer className="border-t border-[#14223A] py-8 bg-[#070D18]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-[#0E1728] border border-[rgba(198,161,91,0.25)] flex items-center justify-center p-0.5 overflow-hidden">
                <img src="/cendrix-logo.png" alt="Cendrix Capital" className="w-full h-full object-contain" />
              </div>
              <span className="text-xs font-cinzel font-bold tracking-wider text-[#F5F5F2]">
                Cendrix Capital · <span className="text-[#C6A15B] font-mono">CNRX</span>
              </span>
            </div>

            <p className="text-[11px] text-[#A1A8B3]">© {new Date().getFullYear()} Cendrix Capital. Institutional Paper Trading Platform. All rights reserved.</p>

            <div className="flex flex-wrap justify-center gap-5 text-xs text-[#A1A8B3]">
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
