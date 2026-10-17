import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useTradingStore } from '../store/useTradingStore';

type AuthView = 'SIGN_IN' | 'SIGN_UP' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD';

export default function Login() {
  const [view, setView] = useState<AuthView>('SIGN_IN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const navigate = useNavigate();
  const location = useLocation();
  const { init } = useTradingStore();

  // Listen for Supabase auth state changes (e.g. verified PASSWORD_RECOVERY)
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setView('RESET_PASSWORD');
        setSuccessMessage('Recovery session verified. Please enter your new secure password below.');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Parse any OAuth error descriptions from the URL hash or query params
  useEffect(() => {
    try {
      const hash = window.location.hash || '';
      const search = window.location.search || '';

      if (hash && hash.includes('error=')) {
        const params = new URLSearchParams(hash.substring(1));
        const errorDesc = params.get('error_description');
        if (errorDesc) {
          setError(decodeURIComponent(errorDesc).replace(/\+/g, ' '));
        }
      } else if (search && search.includes('error=')) {
        const params = new URLSearchParams(search);
        const errorDesc = params.get('error_description');
        if (errorDesc) {
          setError(decodeURIComponent(errorDesc).replace(/\+/g, ' '));
        }
      }
    } catch {
      // Ignore URL parsing errors
    }
  }, [location]);

  // Method 1: Supabase Google OAuth
  const handleGoogleSignIn = async () => {
    setError('');
    setSuccessMessage('');
    setGoogleLoading(true);

    try {
      if (!isSupabaseConfigured) {
        throw new Error(
          'Supabase credentials are not configured in .env.local (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY). Please add your Supabase project keys to enable live Google OAuth, or use the 1-Click Institutional Demo below.'
        );
      }

      const redirectUrl = `${window.location.origin}/dashboard`;
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (authError) throw authError;
      // Google redirects the browser, loading state remains until redirect
    } catch (err: any) {
      setError(err.message || 'Google authentication encountered an unexpected error.');
      setGoogleLoading(false);
    }
  };

  // Method 2: Custom Email & Password (Sign In or Sign Up)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (view === 'RESET_PASSWORD') {
      if (!password || password.length < 6) {
        setError('New password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter your password.');
        return;
      }

      setLoading(true);
      try {
        if (!isSupabaseConfigured) {
          throw new Error('Supabase is not configured.');
        }

        const { data: updateData, error: updateErr } = await supabase.auth.updateUser({ password });
        if (updateErr) throw updateErr;

        if (updateData?.user) {
          await init(updateData.user.id, updateData.user.email, updateData.user.user_metadata?.full_name);
          navigate('/dashboard');
        } else {
          await supabase.auth.signOut();
          setSuccessMessage('Password successfully updated! You can now sign in with your new password.');
          setView('SIGN_IN');
          setPassword('');
          setConfirmPassword('');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to update password.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (view === 'FORGOT_PASSWORD') {
      setLoading(true);
      try {
        if (!isSupabaseConfigured) {
          throw new Error(
            'Supabase credentials are not configured in .env.local. Password reset emails require an active Supabase project.'
          );
        }

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });

        if (resetError) throw resetError;
        setSuccessMessage(`Password recovery instructions have been dispatched to ${email}. Please check your inbox.`);
      } catch (err: any) {
        setError(err.message || 'Failed to dispatch password reset email.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (view === 'SIGN_UP') {
      if (!fullName.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-type your password confirmation.');
        return;
      }

      setLoading(true);
      try {
        if (!isSupabaseConfigured) {
          // Offline fallback registration simulation
          await init('usr_' + Date.now(), email, fullName);
          navigate('/dashboard');
          return;
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (signUpError) throw signUpError;

        if (data?.session?.user) {
          // Auto-confirmed registration (Confirm email is OFF in Supabase)
          await init(data.session.user.id, data.session.user.email, fullName);
          navigate('/dashboard');
        } else {
          // Confirm email is ON in Supabase
          setSuccessMessage(
            `Account created for ${email}! If "Confirm email" is enabled in Supabase, please click the confirmation link sent to your inbox before signing in, or toggle off "Confirm email" in Supabase -> Authentication -> Providers -> Email for instant access.`
          );
          setView('SIGN_IN');
          setPassword('');
          setConfirmPassword('');
        }
      } catch (err: any) {
        setError(err.message || 'Account registration failed.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Default: SIGN_IN
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        // Offline demo account simulation when no Supabase backend is configured
        await init(undefined, email, email.split('@')[0]);
        navigate('/dashboard');
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data?.session?.user) {
        const userName = data.session.user.user_metadata?.full_name || email.split('@')[0];
        await init(data.session.user.id, data.session.user.email, userName);
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('invalid login credentials') || msg.toLowerCase().includes('invalid_grant')) {
        setError(
          'Invalid login credentials or unconfirmed email. If you just registered this account, please confirm it via the email link sent to you, or turn OFF "Confirm email" in Supabase (Authentication -> Providers -> Email) to allow immediate sign-in.'
        );
      } else if (msg.toLowerCase().includes('email not confirmed')) {
        setError(
          'Email not confirmed yet. Please check your inbox for the confirmation email from Supabase, or turn OFF "Confirm email" in your Supabase dashboard.'
        );
      } else {
        setError(msg || 'Authentication failed. Please verify your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Method 3: 1-Click Institutional Demo Sandbox Access
  const handleLaunchDemo = async () => {
    setDemoLoading(true);
    setError('');
    try {
      if (isSupabaseConfigured) {
        try {
          const { data, error: demoErr } = await supabase.auth.signInAnonymously();
          if (!demoErr && data?.session?.user) {
            await init(data.session.user.id, undefined, 'Cendrix Institutional Trader');
            navigate('/dashboard');
            return;
          }
        } catch {
          // Fallback to local offline state
        }
      }

      // Initialize default sandbox account
      await init();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to initialize demo sandbox.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1424] text-[#F5F5F2] relative overflow-x-hidden font-sans selection:bg-[#C6A15B] selection:text-[#0B1424] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* ── Background Aesthetics & Ambient Grid ──────────────────────────── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_45%,#000_70%,transparent_100%)]" />
        <div className="absolute top-[15%] left-[25%] w-[50%] h-[35%] bg-[#C6A15B]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[10%] right-[20%] w-[40%] h-[30%] bg-[#0E1728] rounded-full blur-[130px]" />
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-[450px]">
        {/* ── Brand Wordmark Header ────────────────────────────────────────── */}
        <div className="flex flex-col items-center mb-6">
          <Link to="/" className="mb-4 group flex items-center gap-3 active:scale-95 transition-transform">
            <div className="w-12 h-12 rounded-xl bg-[#0F192B] border border-[rgba(198,161,91,0.35)] flex items-center justify-center p-2 shadow-lg shadow-[#C6A15B]/10 transition-transform group-hover:scale-105 duration-200 overflow-hidden">
              <img src="/cendrix-logo.png" alt="Cendrix Capital" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-serif font-bold tracking-[0.16em] text-[#F5F5F2]">
                CENDRIX CAPITAL
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[8.5px] text-[#C6A15B] tracking-[0.24em] font-mono font-semibold uppercase">
                  SIMULATED FUND
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00c087] animate-pulse" />
              </div>
            </div>
          </Link>

          <h1 className="text-center text-lg sm:text-xl font-serif font-bold text-[#F5F5F2] tracking-tight">
            {view === 'SIGN_IN' && 'Institutional Desk Access'}
            {view === 'SIGN_UP' && 'Create Quantitative Account'}
            {view === 'FORGOT_PASSWORD' && 'Recover Terminal Credentials'}
            {view === 'RESET_PASSWORD' && 'Set New Password'}
          </h1>
          <p className="mt-1 text-center text-xs text-[#A1A8B3] max-w-sm">
            {view === 'SIGN_IN' && 'Authenticate using Google OAuth or your institutional email credentials.'}
            {view === 'SIGN_UP' && 'Instant access to real-time NSE & MCX simulation with ₹10,00,000 virtual capital.'}
            {view === 'FORGOT_PASSWORD' && 'Enter your verified email to receive a password recovery link.'}
            {view === 'RESET_PASSWORD' && 'Enter and confirm your new secure account password below.'}
          </p>
        </div>

        {/* ── Main Auth Card ──────────────────────────────────────────────── */}
        <div className="bg-[#0E1728]/90 backdrop-blur-xl py-6 px-6 sm:px-8 rounded-2xl shadow-2xl border border-[rgba(198,161,91,0.22)]">
          {/* Notification Alerts */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-300 font-medium leading-relaxed">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-300 font-medium leading-relaxed">{successMessage}</p>
            </div>
          )}

          {!isSupabaseConfigured && (
            <div className="mb-4 p-2.5 rounded-lg bg-[#C6A15B]/10 border border-[#C6A15B]/25 flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#C6A15B] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#E2C889] leading-snug">
                <span className="font-bold">Offline / Sandbox Mode:</span> Cloud Supabase keys are not set in <code className="text-[#F5F5F2] font-mono">.env.local</code>. You can test authentication or click below to launch the sandbox instantly.
              </p>
            </div>
          )}

          {view !== 'FORGOT_PASSWORD' && view !== 'RESET_PASSWORD' && (
            <>
              {/* ── Method 1: Google OAuth Button ──────────────────────────── */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0F192B] hover:bg-[#14223A] border border-[#14223A] hover:border-[rgba(198,161,91,0.4)] text-[#F5F5F2] text-xs font-semibold tracking-wide transition-all shadow-sm flex items-center justify-center gap-3 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {googleLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 text-[#C6A15B] animate-spin" />
                    <span>Connecting Google Identity...</span>
                  </>
                ) : (
                  <>
                    {/* Official Google G SVG */}
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              {/* ── Elegant Divider ───────────────────────────────────────── */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#14223A]" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-widest">
                  <span className="bg-[#0E1728] px-3 text-[#6E7683]">
                    Or continue with email
                  </span>
                </div>
              </div>

              {/* ── Mode Switcher: Sign In vs Create Account ────────────────── */}
              <div className="flex border-b border-[#14223A] mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setView('SIGN_IN');
                    setError('');
                    setSuccessMessage('');
                  }}
                  className={`flex-1 pb-2.5 text-xs font-semibold text-center border-b-2 transition-all font-mono tracking-wider ${
                    view === 'SIGN_IN'
                      ? 'border-[#C6A15B] text-[#C6A15B]'
                      : 'border-transparent text-[#6E7683] hover:text-[#A1A8B3]'
                  }`}
                >
                  SIGN IN
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setView('SIGN_UP');
                    setError('');
                    setSuccessMessage('');
                  }}
                  className={`flex-1 pb-2.5 text-xs font-semibold text-center border-b-2 transition-all font-mono tracking-wider ${
                    view === 'SIGN_UP'
                      ? 'border-[#C6A15B] text-[#C6A15B]'
                      : 'border-transparent text-[#6E7683] hover:text-[#A1A8B3]'
                  }`}
                >
                  CREATE ACCOUNT
                </button>
              </div>
            </>
          )}

          {/* ── Method 2: Custom Email & Password Form ─────────────────────── */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (Sign Up Only) */}
            {view === 'SIGN_UP' && (
              <div>
                <label className="block text-[11px] font-semibold text-[#A1A8B3] uppercase tracking-wider mb-1 font-mono">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-[#6E7683]" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Atharva Bhosale"
                    className="block w-full pl-9 pr-3 py-2 border border-[#14223A] rounded-xl bg-[#0B1424] text-[#F5F5F2] focus:outline-none focus:border-[#C6A15B] transition-all text-xs placeholder:text-[#6E7683]"
                  />
                </div>
              </div>
            )}

            {/* Email Address (Hide when resetting password) */}
            {view !== 'RESET_PASSWORD' && (
              <div>
                <label className="block text-[11px] font-semibold text-[#A1A8B3] uppercase tracking-wider mb-1 font-mono">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-[#6E7683]" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="trader@cendrixcapital.com"
                    autoComplete="email"
                    className="block w-full pl-9 pr-3 py-2 border border-[#14223A] rounded-xl bg-[#0B1424] text-[#F5F5F2] focus:outline-none focus:border-[#C6A15B] transition-all text-xs placeholder:text-[#6E7683]"
                  />
                </div>
              </div>
            )}

            {/* Password (Sign In, Sign Up, & Reset Password) */}
            {view !== 'FORGOT_PASSWORD' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-[#A1A8B3] uppercase tracking-wider font-mono">
                    {view === 'RESET_PASSWORD' ? 'New Password' : 'Password'}
                  </label>
                  {view === 'SIGN_IN' && (
                    <button
                      type="button"
                      onClick={() => {
                        setView('FORGOT_PASSWORD');
                        setError('');
                        setSuccessMessage('');
                      }}
                      className="text-[11px] text-[#C6A15B] hover:text-[#E2C889] transition-colors font-mono"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-[#6E7683]" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete={view === 'SIGN_IN' ? 'current-password' : 'new-password'}
                    className="block w-full pl-9 pr-10 py-2 border border-[#14223A] rounded-xl bg-[#0B1424] text-[#F5F5F2] focus:outline-none focus:border-[#C6A15B] transition-all text-xs placeholder:text-[#6E7683]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6E7683] hover:text-[#A1A8B3]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {(view === 'SIGN_UP' || view === 'RESET_PASSWORD') && (
                  <p className="text-[10px] text-[#6E7683] mt-1 font-mono">
                    Must be at least 6 characters.
                  </p>
                )}
              </div>
            )}

            {/* Confirm Password (Sign Up & Reset Password) */}
            {(view === 'SIGN_UP' || view === 'RESET_PASSWORD') && (
              <div>
                <label className="block text-[11px] font-semibold text-[#A1A8B3] uppercase tracking-wider mb-1 font-mono">
                  Confirm {view === 'RESET_PASSWORD' ? 'New ' : ''}Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ShieldCheck className="h-4 w-4 text-[#6E7683]" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="new-password"
                    className="block w-full pl-9 pr-10 py-2 border border-[#14223A] rounded-xl bg-[#0B1424] text-[#F5F5F2] focus:outline-none focus:border-[#C6A15B] transition-all text-xs placeholder:text-[#6E7683]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6E7683] hover:text-[#A1A8B3]"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Remember Me Option (Sign In Only) */}
            {view === 'SIGN_IN' && (
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 text-[#A1A8B3] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-[#14223A] bg-[#0B1424] text-[#C6A15B] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>Keep session active</span>
                </label>
                <span className="text-[10px] text-[#6E7683] font-mono">TLS 256-Bit</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full btn-cendrix-gold py-2.5 text-xs tracking-wider font-bold shadow-md shadow-[#C6A15B]/15 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#0B1424]" />
                    <span>Processing Authentication...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {view === 'SIGN_IN' && 'Sign In to Terminal'}
                      {view === 'SIGN_UP' && 'Create Trading Account'}
                      {view === 'FORGOT_PASSWORD' && 'Send Password Reset Link'}
                      {view === 'RESET_PASSWORD' && 'Update Password & Access Terminal'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Back to Sign In Button */}
          {(view === 'FORGOT_PASSWORD' || view === 'RESET_PASSWORD') && (
            <div className="mt-4 pt-3 border-t border-[#14223A] text-center">
              <button
                type="button"
                onClick={() => {
                  setView('SIGN_IN');
                  setError('');
                  setSuccessMessage('');
                }}
                className="text-xs text-[#C6A15B] hover:text-[#E2C889] font-mono flex items-center justify-center gap-1.5 mx-auto transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
              </button>
            </div>
          )}

          {/* ── Method 3: 1-Click Institutional Demo Sandbox ──────────────── */}
          <div className="mt-6 pt-5 border-t border-[#14223A]">
            <div className="p-3.5 rounded-xl bg-[#0B1424] border border-[#14223A] flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#00c087] animate-pulse" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#F5F5F2]">
                    Institutional Sandbox
                  </span>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#C6A15B]/15 text-[#C6A15B] border border-[#C6A15B]/30 font-semibold">
                  ₹10,00,000 VIRTUAL
                </span>
              </div>
              <p className="text-[11px] text-[#A1A8B3] leading-relaxed">
                Want immediate access without logging in? Enter the sandbox loaded with live tick streams and virtual margin.
              </p>
              <button
                type="button"
                onClick={handleLaunchDemo}
                disabled={demoLoading}
                className="w-full py-2 px-3 rounded-lg bg-[#14223A] hover:bg-[#182740] text-[#C6A15B] hover:text-[#E2C889] border border-[rgba(198,161,91,0.25)] text-xs font-semibold font-mono tracking-wide transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                {demoLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Initializing Trading Desk...</span>
                  </>
                ) : (
                  <>
                    <span>Launch 1-Click Sandbox</span>
                    <ExternalLink className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Footer Back to Landing */}
          <div className="mt-5 pt-3 border-t border-[#14223A] flex items-center justify-between text-xs text-[#6E7683]">
            <Link
              to="/"
              className="hover:text-[#F5F5F2] transition-colors flex items-center gap-1.5 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Platform Overview
            </Link>
            <span className="text-[10px] font-mono">Institutional Simulation Mode</span>
          </div>
        </div>

        {/* Security Disclaimers */}
        <div className="mt-6 text-center space-y-1">
          <p className="text-[10px] text-[#6E7683] font-mono">
            Protected by Supabase Cloud Authentication · 256-Bit TLS · Strict Transport Security
          </p>
          <p className="text-[10px] text-[#6E7683]/70">
            For institutional paper simulation & quantitative strategy testing only.
          </p>
        </div>
      </div>
    </div>
  );
}
