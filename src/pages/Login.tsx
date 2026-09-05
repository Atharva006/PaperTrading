import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Target, Mail, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fancy cursor logic
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', updateMousePosition);
    
    // Check for OAuth errors in URL
    const hash = window.location.hash;
    if (hash && hash.includes('error=')) {
      const params = new URLSearchParams(hash.substring(1));
      const errorDesc = params.get('error_description');
      if (errorDesc) {
        setError(decodeURIComponent(errorDesc).replace(/\+/g, ' '));
      }
    }
    
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

  const handleGoogleLogin = async () => {
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/dashboard' } });
    if (error) setError(error.message);
  };


  return (
    <div className="min-h-screen bg-[#09090b] text-[#e5e5e5] relative overflow-hidden font-sans selection:bg-[#d97757]/30 flex flex-col justify-center cursor-none">
      
      {/* Fancy Cursor */}
      <div 
        className="pointer-events-none fixed top-0 left-0 w-8 h-8 rounded-full border border-[#d97757]/40 z-[100] transition-transform duration-75 ease-out flex items-center justify-center mix-blend-screen"
        style={{ transform: `translate(${mousePosition.x - 16}px, ${mousePosition.y - 16}px) scale(${isHovering ? 1.8 : 1})` }}
      >
        <div className="w-1.5 h-1.5 bg-[#d97757] rounded-full shadow-[0_0_10px_#d97757]" />
      </div>

      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        
        <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] bg-[#d97757]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#d97757]/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-[420px] px-4">
        
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="mb-10 group flex items-center gap-3">
            {/* Sleek Custom Logo Mark */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d97757] to-[#9b4931] flex items-center justify-center shadow-[0_0_20px_rgba(217,119,87,0.4)] relative overflow-hidden transition-transform group-hover:scale-105 duration-300">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              {/* Abstract Edge/Chart Symbol */}
              <div className="relative w-4 h-4 border-t-[3px] border-r-[3px] border-white transform -rotate-45 translate-y-[2px]" />
              <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-white rounded-full" />
            </div>
            {/* Typography */}
            <span className="text-2xl font-black tracking-tighter text-white">TRADE<span className="text-[#d97757]">EDGE</span></span>
          </Link>
          
          <h2 className="text-center text-3xl font-black text-white tracking-tight leading-tight">
            {isSignUp ? 'Create your arsenal.' : 'Welcome back.'}
          </h2>
          <p className="mt-3 text-center text-sm text-[#8c8c8c] font-medium">
            {isSignUp ? 'Enter your details to start journaling your trades.' : 'Sign in to access your live performance metrics.'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#18181b]/60 backdrop-blur-2xl border border-white/5 py-8 px-6 sm:px-10 rounded-2xl shadow-2xl transition-all">
          <form className="space-y-5" onSubmit={handleAuth}>
            <div>
              <label className="block text-xs font-semibold text-[#8c8c8c] uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-[#8c8c8c]" />
                </div>
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
                  placeholder="trader@example.com"
                  className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-black/40 text-white focus:outline-none focus:border-[#d97757]/50 focus:ring-1 focus:ring-[#d97757]/50 transition-all text-sm placeholder:text-[#8c8c8c]/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8c8c8c] uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#8c8c8c]" />
                </div>
                <input
                  type="password" required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-black/40 text-white focus:outline-none focus:border-[#d97757]/50 focus:ring-1 focus:ring-[#d97757]/50 transition-all text-sm placeholder:text-[#8c8c8c]/50"
                />
              </div>
            </div>

            {error && (
              <div className="bg-[#d97757]/10 border border-[#d97757]/20 rounded-lg p-3">
                <p className="text-xs text-[#d97757] text-center font-medium">{error}</p>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
                className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-[0_0_15px_rgba(217,119,87,0.2)] text-sm font-bold text-[#131314] bg-[#d97757] hover:bg-[#c46547] hover:shadow-[0_0_25px_rgba(217,119,87,0.4)] focus:outline-none transition-all disabled:opacity-50 transform hover:-translate-y-0.5"
              >
                {loading ? 'Authenticating...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </button>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#18181b]/60 px-2 text-[#8c8c8c]">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={handleGoogleLogin}
                onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
                className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-white/10 rounded-xl shadow-sm bg-black/40 text-sm font-medium text-white hover:bg-white/5 transition-colors focus:outline-none"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>
            </div>
          </div>
          
          <div className="mt-8 flex flex-col items-center gap-5">
            <button 
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }} 
              onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
              className="text-xs font-medium text-[#8c8c8c] hover:text-white transition-colors flex items-center gap-1"
            >
              {isSignUp ? 'Already have an account?' : "Don't have an account?"} 
              <span className="text-[#d97757] font-semibold">{isSignUp ? 'Sign In' : 'Create One'}</span>
            </button>
            <Link 
              to="/" 
              onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
              className="text-xs text-[#8c8c8c] hover:text-white transition-colors flex items-center justify-center gap-1.5 opacity-60 hover:opacity-100"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
