const fs = require('fs');

const content = `import React, { useState, useEffect } from 'react';
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
    const updateMousePosition = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
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

  return (
    <div className="min-h-screen bg-[#09090b] text-[#e5e5e5] relative overflow-hidden font-sans selection:bg-[#d97757]/30 flex flex-col justify-center cursor-none">
      
      {/* Fancy Cursor */}
      <div 
        className="pointer-events-none fixed top-0 left-0 w-8 h-8 rounded-full border border-[#d97757]/40 z-[100] transition-transform duration-75 ease-out flex items-center justify-center mix-blend-screen"
        style={{ transform: \`translate(\${mousePosition.x - 16}px, \${mousePosition.y - 16}px) scale(\${isHovering ? 1.8 : 1})\` }}
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
          <Link to="/" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="mb-8">
            <span className="text-[13px] font-bold text-[#8c8c8c] hover:text-white transition-colors tracking-widest">[ TRADE EDGE ]</span>
          </Link>
          <div className="w-14 h-14 bg-[#18181b]/80 border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-2xl backdrop-blur-md">
            <Target className="w-7 h-7 text-[#d97757]" />
          </div>
          <h2 className="text-center text-3xl font-black text-white tracking-tight">
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
`;

fs.writeFileSync('src/pages/Login.tsx', content);
