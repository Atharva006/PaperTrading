import React, { useState } from 'react';
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
    <div className="min-h-screen bg-[#030303] text-[#F5F5F5] relative overflow-hidden font-sans selection:bg-[#D4AF65] selection:text-[#030303] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        <div className="absolute top-[20%] left-[30%] w-[40%] h-[30%] bg-[#D4AF65]/5 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-[420px]">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="mb-5 group flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#080808] border border-[#242424] flex items-center justify-center p-1.5 shadow-md transition-transform group-hover:scale-105 duration-200 overflow-hidden">
              <img src="/cendrix-logo.png" alt="Cendrix Capital" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-xl font-cinzel font-bold tracking-wider text-[#F5F5F5]">
                CENDRIX CAPITAL
              </span>
              <p className="text-[10px] text-[#D4AF65] tracking-widest font-mono font-medium">
                CNRX PLATFORM
              </p>
            </div>
          </Link>
          
          <h2 className="text-center text-xl font-cinzel font-bold text-[#F5F5F5] tracking-tight">
            {isSignUp ? 'Create Institutional Portfolio' : 'Institutional Paper Trading'}
          </h2>
          <p className="mt-1 text-center text-xs text-[#71717A]">
            {isSignUp ? 'Enter your details to open your paper trading terminal.' : 'Institutional simulation engine powered by live Upstox ticks.'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#0D0D0D] border border-[#242424] py-7 px-6 sm:px-8 rounded-xl shadow-xl">
          {/* 1-Click Virtual Paper Trading Button */}
          <div className="mb-5">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full btn-cendrix-gold py-2.5 text-xs tracking-wider font-bold shadow-sm flex items-center justify-center gap-2"
            >
              <Target className="w-4 h-4 text-[#030303]" />
              <span>1-Click Virtual Trading (₹10,00,000)</span>
            </button>
          </div>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#191919]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#0D0D0D] px-3 text-[#71717A] font-mono text-[10px] uppercase">OR SIGN IN WITH EMAIL</span>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleAuth}>
            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-[#71717A]" />
                </div>
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="trader@cendrix.com"
                  className="block w-full pl-9 pr-3 py-2 border border-[#242424] rounded-lg bg-[#080808] text-[#F5F5F5] focus:outline-none focus:border-[#D4AF65] transition-all text-xs placeholder:text-[#71717A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#71717A]" />
                </div>
                <input
                  type="password" required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 border border-[#242424] rounded-lg bg-[#080808] text-[#F5F5F5] focus:outline-none focus:border-[#D4AF65] transition-all text-xs placeholder:text-[#71717A]"
                />
              </div>
            </div>

            {error && (
              <div className="bg-[#FF4D67]/10 border border-[#FF4D67]/25 rounded-lg p-2.5">
                <p className="text-xs text-[#FF4D67] text-center font-medium">{error}</p>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-cendrix-outline py-2.5 text-xs tracking-wider justify-center"
              >
                {loading ? 'Authenticating...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </button>
            </div>
          </form>
          
          <div className="mt-5 flex flex-col items-center gap-3">
            <button 
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }} 
              className="text-xs text-[#A1A1AA] hover:text-[#F5F5F5] transition-colors flex items-center gap-1"
            >
              {isSignUp ? 'Already have an account?' : "Don't have an account?"} 
              <span className="text-[#D4AF65] font-semibold">{isSignUp ? 'Sign In' : 'Create One'}</span>
            </button>
            <Link 
              to="/" 
              className="text-xs text-[#71717A] hover:text-[#F5F5F5] transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
