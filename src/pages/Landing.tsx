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
    <div className="min-h-screen bg-[#09090b] text-[#e5e5e5] relative overflow-x-hidden font-sans selection:bg-[#d97757]/30 cursor-none">
      
      {/* Fancy Cursor */}
      <div 
        className="pointer-events-none fixed top-0 left-0 w-8 h-8 rounded-full border border-[#d97757]/40 z-[100] transition-transform duration-75 ease-out flex items-center justify-center mix-blend-screen"
        style={{ transform: `translate(${mousePosition.x - 16}px, ${mousePosition.y - 16}px) scale(${isHovering ? 1.8 : 1})` }}
      >
        <div className="w-1.5 h-1.5 bg-[#d97757] rounded-full shadow-[0_0_10px_#d97757]" />
      </div>

      {/* Dynamic Background / "Obstacles" */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#d97757]/15 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#d97757]/10 rounded-full blur-[150px]" />
        
        {/* Animated Beams */}
        <div className="absolute top-[20%] left-[-10%] w-[120%] h-px bg-gradient-to-r from-transparent via-[#d97757]/20 to-transparent transform rotate-[-3deg] opacity-50" />
        <div className="absolute top-[65%] left-[-10%] w-[120%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent transform rotate-[4deg] opacity-30" />
        <div className="absolute top-[85%] left-[-10%] w-[120%] h-px bg-gradient-to-r from-transparent via-[#d97757]/10 to-transparent transform rotate-[-1deg] opacity-40" />
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#09090b]/80 backdrop-blur-md border-b border-white/5 py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 group cursor-none">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#d97757] to-[#9b4931] flex items-center justify-center shadow-[0_0_10px_rgba(217,119,87,0.4)] relative overflow-hidden transition-transform group-hover:scale-105 duration-300">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className="relative w-2.5 h-2.5 border-t-[2px] border-r-[2px] border-white transform -rotate-45 translate-y-[1px]" />
              <div className="absolute bottom-1 left-1 w-1 h-1 bg-white rounded-full" />
            </div>
            <span className="text-sm font-black tracking-tighter text-white">TRADE<span className="text-[#d97757]">EDGE</span></span>
          </div>
          </div>
          <div className="hidden md:flex gap-10 text-[13px] font-medium text-[#8c8c8c]">
            <a href="#features" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="hover:text-white transition-colors">Features</a>
            <a href="#philosophy" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="hover:text-white transition-colors">Philosophy</a>
            <a href="#metrics" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="hover:text-white transition-colors">Metrics</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="text-[13px] font-medium text-[#8c8c8c] hover:text-white transition-colors">
              Log In
            </Link>
            <Link to="/login" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="px-5 py-2 bg-[#d97757] hover:bg-[#c46547] text-[#131314] text-xs font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(217,119,87,0.3)]">
              Start Journaling
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10">
        
        {/* Section 1: Hero */}
        <section className="min-h-screen flex items-center justify-center pt-20 pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 bg-[#18181b]/60 border border-[#d97757]/30 rounded-full text-[11px] font-semibold text-[#d97757] uppercase tracking-widest backdrop-blur-md shadow-[0_0_10px_rgba(217,119,87,0.1)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d97757] animate-pulse"></span>
              Built for Elite Performers
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-[#8c8c8c] tracking-tighter mb-8 leading-[1.05] max-w-5xl mx-auto">
              Conquer the Market.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d97757] to-[#e89a7f]">Forged by Discipline.</span>
            </h1>
            <p className="text-lg md:text-xl text-[#8c8c8c] mb-12 leading-relaxed max-w-2xl mx-auto font-medium">
              Trading is a game of psychology and execution. Bring absolute conviction to your strategy with deep analytics, structured journaling, and real-time risk tracking.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-5">
              <Link 
                to="/login" 
                onMouseEnter={handleMouseEnter} 
                onMouseLeave={handleMouseLeave}
                className="px-8 py-4 bg-[#d97757] hover:bg-[#c46547] text-[#131314] text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(217,119,87,0.3)] hover:shadow-[0_0_45px_rgba(217,119,87,0.5)] transform hover:-translate-y-1"
              >
                Start Building Conviction <ArrowRight className="w-4 h-4" />
              </Link>
              <a 
                href="#features" 
                onMouseEnter={handleMouseEnter} 
                onMouseLeave={handleMouseLeave}
                className="px-8 py-4 bg-[#18181b]/60 hover:bg-[#18181b] border border-white/5 hover:border-white/10 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center backdrop-blur-md"
              >
                Explore the Arsenal
              </a>
            </div>
          </div>
        </section>

        {/* Section 2: Social Proof / Conviction Banner */}
        <section className="py-12 border-y border-white/5 bg-[#09090b]/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center md:justify-between items-center gap-8 text-center md:text-left">
              <div>
                <p className="text-3xl font-black text-white mb-1">3.4x</p>
                <p className="text-[11px] uppercase tracking-wider text-[#8c8c8c] font-semibold">Higher Payout Rate</p>
              </div>
              <div className="hidden md:block w-px h-12 bg-white/10"></div>
              <div>
                <p className="text-3xl font-black text-white mb-1">100%</p>
                <p className="text-[11px] uppercase tracking-wider text-[#8c8c8c] font-semibold">Data Transparency</p>
              </div>
              <div className="hidden md:block w-px h-12 bg-white/10"></div>
              <div>
                <p className="text-3xl font-black text-white mb-1">&lt; 1ms</p>
                <p className="text-[11px] uppercase tracking-wider text-[#8c8c8c] font-semibold">Analytics Rendering</p>
              </div>
              <div className="hidden md:block w-px h-12 bg-white/10"></div>
              <div>
                <p className="text-3xl font-black text-white mb-1">0</p>
                <p className="text-[11px] uppercase tracking-wider text-[#d97757] font-semibold">Spreadsheets Needed</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Anti-Excel Deep Dive */}
        <section id="philosophy" className="py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="w-12 h-12 bg-[#d97757]/10 rounded-xl flex items-center justify-center border border-[#d97757]/20">
                  <Database className="w-6 h-6 text-[#d97757]" />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
                  Ditch the Spreadsheets.<br/>
                  <span className="text-[#8c8c8c]">Upgrade the Standard.</span>
                </h2>
                <p className="text-lg text-[#8c8c8c] leading-relaxed">
                  Stop fighting with clunky Excel formulas and breaking Notion templates. The modern trader requires speed, accuracy, and deep psychological insight. 
                </p>
                <ul className="space-y-4">
                  {[
                    'Automated metrics like Profit Factor & Expectancy',
                    'Zero manual math or formula breakages',
                    'Built specifically for prop-firm max drawdown tracking',
                    'Cloud-synced and instantly accessible anywhere'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-white text-sm font-medium">
                      <div className="w-5 h-5 rounded-full bg-[#d97757]/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-[#d97757]" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#d97757]/20 to-transparent rounded-2xl blur-3xl" />
                <div className="relative bg-[#18181b]/80 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
                  {/* Faux Dashboard UI Element */}
                  <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
                    <div>
                      <p className="text-xs text-[#8c8c8c] font-semibold uppercase tracking-wider mb-1">Live Profit Factor</p>
                      <p className="text-3xl font-black text-white">2.84<span className="text-lg text-success font-medium ml-2">Excellent</span></p>
                    </div>
                    <Activity className="w-10 h-10 text-[#d97757]" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
                      <div className="h-full bg-success w-[68%]" />
                    </div>
                    <p className="text-xs text-[#8c8c8c] font-medium text-right">68% Win Rate (Last 30 Days)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Detailed Features */}
        <section id="features" className="py-32 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">The Ultimate Arsenal</h2>
              <p className="text-lg text-[#8c8c8c]">Everything you need to turn raw data into a measurable trading edge.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div 
                onMouseEnter={handleMouseEnter} 
                onMouseLeave={handleMouseLeave}
                className="p-8 rounded-2xl bg-[#18181b]/40 backdrop-blur-xl border border-white/5 hover:bg-[#18181b]/80 hover:border-white/10 transition-all group"
              >
                <div className="w-12 h-12 bg-[#d97757]/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-[#d97757]/20">
                  <Crosshair className="w-6 h-6 text-[#d97757]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Surgical Precision</h3>
                <p className="text-[#8c8c8c] text-sm leading-relaxed">
                  Track multi-phase funded accounts flawlessly. Monitor exact profit targets, daily loss limits, and max drawdowns across any prop firm or live broker.
                </p>
              </div>
              
              <div 
                onMouseEnter={handleMouseEnter} 
                onMouseLeave={handleMouseLeave}
                className="p-8 rounded-2xl bg-[#18181b]/40 backdrop-blur-xl border border-white/5 hover:bg-[#18181b]/80 hover:border-white/10 transition-all group"
              >
                <div className="w-12 h-12 bg-[#d97757]/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-[#d97757]/20">
                  <TrendingUp className="w-6 h-6 text-[#d97757]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Unshakeable Metrics</h3>
                <p className="text-[#8c8c8c] text-sm leading-relaxed">
                  Live equity curves, dynamic win rates, and profit factors calculated in milliseconds. Know your mathematical edge so you can execute without hesitation.
                </p>
              </div>
              
              <div 
                onMouseEnter={handleMouseEnter} 
                onMouseLeave={handleMouseLeave}
                className="p-8 rounded-2xl bg-[#18181b]/40 backdrop-blur-xl border border-white/5 hover:bg-[#18181b]/80 hover:border-white/10 transition-all group"
              >
                <div className="w-12 h-12 bg-[#d97757]/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-[#d97757]/20">
                  <Zap className="w-6 h-6 text-[#d97757]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Master Your Psychology</h3>
                <p className="text-[#8c8c8c] text-sm leading-relaxed">
                  Log emotional states, execution quality, and upload chart screenshots. Turn your worst mistakes into your greatest assets and build a titanium mindset.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: The "No Excuses" Final CTA */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#d97757]/5" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-5xl font-black text-white mb-8 tracking-tight">Stop Gambling.<br/>Start Operating Like a Business.</h2>
            <p className="text-xl text-[#8c8c8c] mb-12">
              The top 1% of market operators don't guess their edge. They calculate it. Step up to institutional-grade analytics today.
            </p>
            <Link 
              to="/login" 
              onMouseEnter={handleMouseEnter} 
              onMouseLeave={handleMouseLeave}
              className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-[#d97757] hover:bg-[#c46547] text-[#131314] text-base font-bold rounded-2xl transition-all shadow-[0_0_40px_rgba(217,119,87,0.4)] hover:shadow-[0_0_60px_rgba(217,119,87,0.6)] transform hover:-translate-y-1"
            >
              Access Your Journal Now <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-12 bg-[#09090b]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
              <div className="w-5 h-5 rounded bg-[#d97757] flex items-center justify-center relative overflow-hidden">
                <div className="relative w-2 h-2 border-t-[1.5px] border-r-[1.5px] border-white transform -rotate-45 translate-y-[0.5px]" />
              </div>
              <span className="text-xs font-black tracking-tighter text-[#8c8c8c]">TRADE<span className="text-[#d97757]">EDGE</span></span>
            </div>
            </div>
            <p className="text-xs text-[#8c8c8c] font-medium">© {new Date().getFullYear()} Trade Edge. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-6 text-xs font-medium text-[#8c8c8c]">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <a href="mailto:atharva.bhosale@yahoo.com" className="hover:text-[#d97757] transition-colors">Support (atharva.bhosale@yahoo.com)</a>
              <a href="https://www.linkedin.com/in/atharva--bhosale" target="_blank" rel="noopener noreferrer" className="hover:text-[#0a66c2] transition-colors">LinkedIn</a>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
