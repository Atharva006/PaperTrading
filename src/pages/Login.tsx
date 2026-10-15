import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Target, Mail, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(() => {
    try {
      const hash = window.location.hash;
      if (hash && hash.includes('error=')) {
        const params = new URLSearchParams(hash.substring(1));
        const errorDesc = params.get('error_description');
        if (errorDesc) {
          return decodeURIComponent(errorDesc).replace(/\+/g, ' ');
        }
      }
    } catch {
      // ignore
    }
    return '';
  });
  const navigate = useNavigate();

  // Fancy cursor logic
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setError('Check your email for the confirmation link, or try logging in if auto-confirm is enabled.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'trader@tradeedge.com',
        password: 'TradeEdge@2026',
      });
      if (!error && data?.session) {
        navigate('/dashboard');
        return;
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
      navigate('/dashboard');
    }
  };


  return (
    <div className="min-h-screen bg-[#0B1424] text-[#F5F5F2] relative overflow-hidden font-sans selection:bg-[#C6A15B] selection:text-[#0B1424] flex flex-col justify-center cursor-none">
      
      {/* Fancy Gold Cursor */}
      <div 
        className="pointer-events-none fixed top-0 left-0 w-8 h-8 rounded-full border border-[#C6A15B]/50 z-[100] transition-transform duration-75 ease-out flex items-center justify-center mix-blend-screen"
        style={{ transform: `translate(${mousePosition.x - 16}px, ${mousePosition.y - 16}px) scale(${isHovering ? 1.8 : 1})` }}
      >
        <div className="w-1.5 h-1.5 bg-[#C6A15B] rounded-full shadow-[0_0_10px_#C6A15B]" />
      </div>

      {/* Dynamic Background with Gold Radial Haze */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        
        <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] bg-[#C6A15B]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#C6A15B]/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-[440px] px-4">
        
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="mb-6 group flex items-center gap-3">
            {/* Cendrix Monogram */}
            <div className="w-12 h-12 rounded-xl bg-[#0E1728] border border-[rgba(198,161,91,0.4)] flex items-center justify-center shadow-[0_0_25px_rgba(198,161,91,0.25)] p-2 transition-transform group-hover:scale-105 duration-300">
              <img src="/monogram.svg" alt="CNRX" className="w-full h-full object-contain" />
            </div>
            {/* Brand Typography */}
            <div>
              <span className="text-3xl font-serif font-black tracking-wider text-[#F5F5F2] uppercase">
                CN<span className="text-[#C6A15B]">RX</span>
              </span>
              <p className="text-[10px] text-[#A1A8B3] uppercase tracking-widest font-mono font-medium">
                Cendrix Capital
              </p>
            </div>
          </Link>
          
          <h2 className="text-center text-2xl sm:text-3xl font-serif font-bold text-[#F5F5F2] tracking-tight">
            {isSignUp ? 'Create your institutional portfolio.' : 'Simulated Paper Trading'}
          </h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-[#A1A8B3] font-medium">
            {isSignUp ? 'Enter your details to open your paper trading terminal.' : 'Institutional grade simulation engine powered by live Upstox ticks.'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#0E1728]/90 backdrop-blur-2xl border border-[rgba(198,161,91,0.25)] py-8 px-6 sm:px-10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_25px_rgba(198,161,91,0.1)] transition-all">
          {/* 1-Click Virtual Paper Trading Button (Prominent) */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleDemoLogin}
              onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
              className="w-full btn-cendrix-gold py-3 text-xs tracking-wider font-bold shadow-[0_0_20px_rgba(198,161,91,0.3)] flex items-center justify-center gap-2"
            >
              <Target className="w-4 h-4" />
              <span>1-Click Virtual Trading (₹10,00,000)</span>
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.08]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#0E1728] px-3 text-[#A1A8B3] font-mono text-[11px]">OR SIGN IN WITH EMAIL</span>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleAuth}>
            <div>
              <label className="block text-xs font-semibold text-[#A1A8B3] uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-[#A1A8B3]" />
                </div>
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
                  placeholder="trader@cendrix.com"
                  className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-xl bg-[#0B1424] text-[#F5F5F2] focus:outline-none focus:border-[#C6A15B] focus:ring-1 focus:ring-[#C6A15B] transition-all text-xs placeholder:text-[#A1A8B3]/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A1A8B3] uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#A1A8B3]" />
                </div>
                <input
                  type="password" required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-xl bg-[#0B1424] text-[#F5F5F2] focus:outline-none focus:border-[#C6A15B] focus:ring-1 focus:ring-[#C6A15B] transition-all text-xs placeholder:text-[#A1A8B3]/40"
                />
              </div>
            </div>

            {error && (
              <div className="bg-[#F43F5E]/10 border border-[#F43F5E]/20 rounded-lg p-3">
                <p className="text-xs text-[#F43F5E] text-center font-medium">{error}</p>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
                className="w-full btn-cendrix-outline py-2.5 text-xs tracking-wider justify-center"
              >
                {loading ? 'Authenticating...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </button>
            </div>
          </form>
          
          <div className="mt-6 flex flex-col items-center gap-4">
            <button 
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }} 
              onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
              className="text-xs font-medium text-[#A1A8B3] hover:text-[#F5F5F2] transition-colors flex items-center gap-1"
            >
              {isSignUp ? 'Already have an account?' : "Don't have an account?"} 
              <span className="text-[#C6A15B] font-semibold">{isSignUp ? 'Sign In' : 'Create One'}</span>
            </button>
            <Link 
              to="/" 
              onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
              className="text-xs text-[#A1A8B3] hover:text-[#F5F5F2] transition-colors flex items-center justify-center gap-1.5 opacity-60 hover:opacity-100"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
