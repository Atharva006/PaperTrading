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
      // fallback to offline account
    } finally {
      setLoading(false);
      navigate('/dashboard');
    }
  };

  // Auto-login instantly on mount without requiring PIN or password
  React.useEffect(() => {
    handleDemoLogin();
  }, []);

  const [showManualLogin, setShowManualLogin] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B1424] text-[#F5F5F2] relative overflow-hidden font-sans selection:bg-[#C6A15B] selection:text-[#0B1424] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        <div className="absolute top-[20%] left-[30%] w-[40%] h-[30%] bg-[#C6A15B]/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-[420px]">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="mb-5 group flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#10141C] border border-[#14223A] flex items-center justify-center p-1.5 shadow-md transition-transform group-hover:scale-105 duration-200 overflow-hidden">
              <img src="/cendrix-logo.png" alt="Cendrix Capital" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-xl font-serif font-bold tracking-wider text-[#F5F5F2]">
                CENDRIX CAPITAL
              </span>
              <p className="text-[10px] text-[#C6A15B] tracking-widest font-mono font-medium">
                CNRX PLATFORM
              </p>
            </div>
          </Link>
          
          <h2 className="text-center text-xl font-serif font-bold text-[#F5F5F2] tracking-tight">
            Institutional Paper Trading
          </h2>
          <p className="mt-1 text-center text-xs text-[#A1A8B3]">
            Auto-authenticating client terminal with live exchange ticks.
          </p>
        </div>

        {/* Auth Card */}
        <div className="cendrix-card py-7 px-6 sm:px-8 rounded-xl shadow-2xl border border-[#14223A]">
          {!showManualLogin ? (
            <div className="space-y-5 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#C6A15B]/10 border border-[#C6A15B]/30 flex items-center justify-center">
                <Target className="w-6 h-6 text-[#C6A15B] animate-pulse" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#F5F5F2]">Auto-Connecting Session</h3>
                <p className="text-xs text-[#A1A8B3] mt-1">
                  Loading institutional allocation of ₹10,00,000 & direct exchange market stream.
                </p>
              </div>

              <div className="p-3.5 bg-[#0B1424] border border-[#14223A] rounded-lg text-left text-xs space-y-1.5 font-mono">
                <div className="flex justify-between text-[#6E7683]">
                  <span>Account:</span>
                  <span className="text-[#F5F5F2] font-bold">Cendrix Institutional</span>
                </div>
                <div className="flex justify-between text-[#6E7683]">
                  <span>Allocation:</span>
                  <span className="text-emerald-400 font-bold">₹10,00,000</span>
                </div>
                <div className="flex justify-between text-[#6E7683]">
                  <span>Feed Provider:</span>
                  <span className="text-[#C6A15B] font-bold">Direct Exchange Gateway</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full btn-cendrix-gold py-2.5 text-xs tracking-wider font-bold shadow-sm flex items-center justify-center gap-2"
              >
                <span>Launch Trading Desk Now</span>
              </button>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualLogin(true)}
                  className="text-[11px] text-[#6E7683] hover:text-[#A1A8B3] transition-colors font-mono"
                >
                  Administrator / Custom Login Options
                </button>
              </div>
            </div>
          ) : (
            <>
              <form className="space-y-4" onSubmit={handleAuth}>
                <div>
                  <label className="block text-xs font-semibold text-[#A1A8B3] uppercase tracking-wider mb-1.5 font-mono">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-[#6E7683]" />
                    </div>
                    <input
                      type="email" required value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="trader@cendrixcapital.com"
                      className="block w-full pl-9 pr-3 py-2 border border-[#14223A] rounded-lg bg-[#0B1424] text-[#F5F5F2] focus:outline-none focus:border-[#C6A15B] transition-all text-xs placeholder:text-[#6E7683]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A1A8B3] uppercase tracking-wider mb-1.5 font-mono">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-[#6E7683]" />
                    </div>
                    <input
                      type="password" required value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-9 pr-3 py-2 border border-[#14223A] rounded-lg bg-[#0B1424] text-[#F5F5F2] focus:outline-none focus:border-[#C6A15B] transition-all text-xs placeholder:text-[#6E7683]"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/25 rounded-lg p-2.5">
                    <p className="text-xs text-rose-400 text-center font-medium">{error}</p>
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
                  onClick={() => setShowManualLogin(false)} 
                  className="text-xs text-[#C6A15B] hover:underline font-mono"
                >
                  ← Back to 1-Click Instant Login
                </button>
              </div>
            </>
          )}

          <div className="mt-5 pt-3 border-t border-[#14223A] flex justify-center">
            <Link 
              to="/dashboard" 
              className="text-xs text-[#6E7683] hover:text-[#F5F5F2] transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Terminal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
