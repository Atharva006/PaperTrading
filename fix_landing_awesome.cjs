const fs = require('fs');

const content = `import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart2, Target, Shield, Zap, TrendingUp, Crosshair } from 'lucide-react';

export default function Landing() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  return (
    <div className="min-h-screen bg-[#09090b] text-[#e5e5e5] relative overflow-hidden font-sans selection:bg-[#d97757]/30 cursor-none">
      
      {/* Fancy Cursor */}
      <div 
        className="pointer-events-none fixed top-0 left-0 w-8 h-8 rounded-full border border-[#d97757]/40 z-[100] transition-transform duration-75 ease-out flex items-center justify-center mix-blend-screen"
        style={{ transform: \`translate(\${mousePosition.x - 16}px, \${mousePosition.y - 16}px) scale(\${isHovering ? 1.8 : 1})\` }}
      >
        <div className="w-1.5 h-1.5 bg-[#d97757] rounded-full shadow-[0_0_10px_#d97757]" />
      </div>

      {/* Dynamic Background / "Obstacles" */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* High-tech Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        {/* Glowing Orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#d97757]/15 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#d97757]/10 rounded-full blur-[150px]" />
        <div className="absolute top-[40%] right-[20%] w-[20%] h-[20%] bg-[#3b82f6]/5 rounded-full blur-[100px]" />

        {/* Abstract Market Angles / Obstacles */}
        <div className="absolute top-[25%] left-[-10%] w-[120%] h-px bg-gradient-to-r from-transparent via-[#d97757]/20 to-transparent transform rotate-[-3deg] opacity-50" />
        <div className="absolute top-[65%] left-[-10%] w-[120%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent transform rotate-[4deg] opacity-30" />
      </div>

      {/* Navbar */}
      <nav className="border-b border-white/5 bg-[#09090b]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-white tracking-widest">[ TRADE EDGE ]</span>
          </div>
          <div className="hidden md:flex gap-8 text-[13px] font-medium text-[#8c8c8c]">
            <a href="#features" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="hover:text-white transition-colors">Features</a>
            <a href="#analytics" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="hover:text-white transition-colors">Analytics</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="text-[13px] font-medium text-[#8c8c8c] hover:text-white transition-colors">
              Log In
            </Link>
            <Link to="/login" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="px-4 py-2 bg-[#d97757] hover:bg-[#c46547] text-[#131314] text-xs font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(217,119,87,0.3)]">
              Start Journaling
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-block mb-6 px-3 py-1 bg-[#18181b]/60 border border-[#d97757]/20 rounded-full text-[11px] font-medium text-[#d97757] uppercase tracking-widest backdrop-blur-md shadow-[0_0_10px_rgba(217,119,87,0.1)]">
            Built for Elite Performers
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-[#8c8c8c] tracking-tighter mb-8 leading-[1.05]">
            Conquer the Market.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d97757] to-[#e89a7f]">Forged by Discipline.</span>
          </h1>
          <p className="text-lg md:text-xl text-[#8c8c8c] mb-12 leading-relaxed max-w-3xl mx-auto font-medium">
            Trading is a game of psychology and execution. Bring absolute conviction to your strategy with deep analytics, structured journaling, and real-time risk tracking. Your edge starts here.
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

        {/* Anti-Excel Conviction Banner */}
        <div className="mt-32 max-w-5xl mx-auto relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#d97757]/0 via-[#d97757]/10 to-[#d97757]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl rounded-full" />
          <div className="bg-[#18181b]/60 border border-white/5 group-hover:border-white/10 rounded-2xl p-10 md:p-12 text-center relative overflow-hidden backdrop-blur-xl shadow-2xl transition-all duration-500 transform group-hover:scale-[1.01]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-[#d97757] rounded-b-full shadow-[0_0_20px_rgba(217,119,87,0.8)]" />
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
              Ditch the Spreadsheets. <br className="md:hidden" /><span className="text-[#8c8c8c] font-medium">Upgrade to the New Standard.</span>
            </h2>
            <p className="text-[#8c8c8c] text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
              Stop fighting with clunky Excel formulas and outdated Notion templates. Trade Edge introduces the next generation of trading technology—a seamless, automated, and visually stunning environment designed specifically to give you unwavering confidence in your execution.
            </p>
          </div>
        </div>

        {/* Dynamic Feature Grid */}
        <div id="features" className="mt-32 grid md:grid-cols-3 gap-6">
          <div 
            onMouseEnter={handleMouseEnter} 
            onMouseLeave={handleMouseLeave}
            className="p-8 rounded-2xl bg-[#18181b]/40 backdrop-blur-xl border border-white/5 hover:bg-[#18181b]/80 hover:border-white/10 transition-all group cursor-none"
          >
            <div className="w-12 h-12 bg-[#d97757]/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Crosshair className="w-6 h-6 text-[#d97757]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Surgical Precision</h3>
            <p className="text-[#8c8c8c] text-sm leading-relaxed">
              Track multi-phase funded accounts flawlessly. Monitor exact profit targets, daily loss limits, and max drawdowns for Apex, Topstep, and Tradeify without missing a beat.
            </p>
          </div>
          
          <div 
            onMouseEnter={handleMouseEnter} 
            onMouseLeave={handleMouseLeave}
            className="p-8 rounded-2xl bg-[#18181b]/40 backdrop-blur-xl border border-white/5 hover:bg-[#18181b]/80 hover:border-white/10 transition-all group cursor-none"
          >
            <div className="w-12 h-12 bg-[#d97757]/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
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
            className="p-8 rounded-2xl bg-[#18181b]/40 backdrop-blur-xl border border-white/5 hover:bg-[#18181b]/80 hover:border-white/10 transition-all group cursor-none"
          >
            <div className="w-12 h-12 bg-[#d97757]/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-[#d97757]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Master Your Psychology</h3>
            <p className="text-[#8c8c8c] text-sm leading-relaxed">
              Log emotional states, execution quality, and upload chart screenshots. Turn your worst mistakes into your greatest assets and build a titanium mindset.
            </p>
          </div>
        </div>
        
      </main>
    </div>
  );
}
`;

fs.writeFileSync('src/pages/Landing.tsx', content);
