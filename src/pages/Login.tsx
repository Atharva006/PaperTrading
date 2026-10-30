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
  ExternalLink,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useTradingStore } from '../store/useTradingStore';
import { SEO } from '../components/common/SEO';

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
          'Supabase credentials are not configured. Please add your Supabase project keys to enable live Google OAuth, or use the 1-Click Institutional Demo below.'
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
    } catch (err: any) {
      setError(err.message || 'Google authentication encountered an unexpected error.');
      setGoogleLoading(false);
    }
  };

  // Method 2: Custom Email & Password
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

        const { error: updateErr } = await supabase.auth.updateUser({ password });
        if (updateErr) throw updateErr;

        setSuccessMessage('Password successfully updated! You can now sign in with your new password.');
        setView('SIGN_IN');
        setPassword('');
        setConfirmPassword('');
      } catch (err: any) {
        setError(err.message || 'Failed to update password.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (view === 'FORGOT_PASSWORD') {
      if (!email) {
        setError('Please enter your email address to recover your password.');
        return;
      }

      setLoading(true);
      try {
        if (!isSupabaseConfigured) {
          throw new Error('Supabase is not configured.');
        }

        const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (resetErr) throw resetErr;

        setSuccessMessage(`Password recovery link has been sent to ${email}. Please check your inbox.`);
      } catch (err: any) {
        setError(err.message || 'Failed to request password reset.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (view === 'SIGN_UP') {
      if (!fullName.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!password || password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter your password.');
        return;
      }

      setLoading(true);
      try {
        if (!isSupabaseConfigured) {
          // Offline local mode simulation
          if (typeof window !== 'undefined') {
            localStorage.setItem('tradeedge_auth_logged_in', 'true');
          }
          await init(undefined, email, fullName);
          navigate('/dashboard');
          return;
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (signUpError) throw signUpError;

        if (data?.session) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('tradeedge_auth_logged_in', 'true');
          }
          await init(data.session.user.id, data.session.user.email, fullName);
          navigate('/dashboard');
        } else {
          setSuccessMessage(
            `Account created for ${email}! Please check your email for the confirmation link to complete sign-in.`
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
      const destination = (location.state as any)?.from?.pathname || '/dashboard';

      if (!isSupabaseConfigured) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('tradeedge_auth_logged_in', 'true');
        }
        await init(undefined, email, email.split('@')[0]);
        navigate(destination);
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (typeof window !== 'undefined') {
        localStorage.setItem('tradeedge_auth_logged_in', 'true');
      }

      if (data?.session?.user) {
        const userName = data.session.user.user_metadata?.full_name || email.split('@')[0];
        await init(data.session.user.id, data.session.user.email, userName);
        navigate(destination);
      } else {
        navigate(destination);
      }
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('invalid login credentials') || msg.toLowerCase().includes('invalid_grant')) {
        setError('Invalid login credentials or unconfirmed email. Please verify your email and password.');
      } else {
        setError(msg || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Method 3: 1-Click Institutional Demo Sandbox Access
  const handleLaunchDemo = async () => {
    setDemoLoading(true);
    setError('');
    const destination = (location.state as any)?.from?.pathname || '/dashboard';
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('tradeedge_auth_logged_in', 'true');
      }

      if (isSupabaseConfigured) {
        try {
          const { data, error: demoErr } = await supabase.auth.signInAnonymously();
          if (!demoErr && data?.session?.user) {
            await init(data.session.user.id, undefined, 'Cendrix Institutional Trader');
            navigate(destination);
            return;
          }
        } catch {
          // Fallback to local offline state
        }
      }

      await init();
      navigate(destination);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize demo sandbox.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFCFC] text-[#111114] relative overflow-x-hidden font-sans selection:bg-[#536CF0] selection:text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Institutional Login — Free Virtual Trading Platform | Cendrix Capital"
        description="Sign in to your Cendrix Capital virtual trading platform. Access real-time simulated order matching, portfolio risk analytics, and quantitative trading tools."
        canonical="https://cendrix-capital-stf.vercel.app/login"
        keywords="free paper trading platform login, virtual trading platform sign in, demo trading platform access, stock market simulator portal, Cendrix Capital login"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            {
              '@type': 'ListItem',
              'position': 1,
              'name': 'Home',
              'item': 'https://cendrix-capital-stf.vercel.app/'
            },
            {
              '@type': 'ListItem',
              'position': 2,
              'name': 'Institutional Login',
              'item': 'https://cendrix-capital-stf.vercel.app/login'
            }
          ]
        }}
      />
      {/* ── Background Subtle Aesthetics ──────────────────────────────────── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#D9E2F2_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#536CF0]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#00225A]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-[460px]">
        {/* ── Brand Wordmark Header ────────────────────────────────────────── */}
        <div className="flex flex-col items-center mb-6">
          <Link to="/" className="mb-4 group flex items-center gap-3 active:scale-98 transition-transform">
            <div className="w-12 h-12 rounded-2xl bg-[#00225A] flex items-center justify-center p-2.5 shadow-md shadow-[#00225A]/15 transition-transform group-hover:scale-105 duration-200">
              <img src="/cendrix-logo.png" alt="Cendrix Capital" className="w-full h-full object-contain brightness-0 invert" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-headline font-bold tracking-tight text-[#00225A]">
                CENDRIX CAPITAL
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[#536CF0] tracking-wider font-mono font-semibold uppercase">
                  FUNDED SIMULATOR
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A] animate-pulse" />
              </div>
            </div>
          </Link>

          <h1 className="text-center text-2xl font-headline font-bold text-[#00225A] tracking-tight">
            {view === 'SIGN_IN' && 'Institutional Desk Access'}
            {view === 'SIGN_UP' && 'Create Trader Account'}
            {view === 'FORGOT_PASSWORD' && 'Recover Credentials'}
            {view === 'RESET_PASSWORD' && 'Set New Password'}
          </h1>
          <p className="mt-1 text-center text-xs text-[#6B7A90] max-w-sm">
            {view === 'SIGN_IN' && 'Sign in using Google OAuth or your institutional email credentials.'}
            {view === 'SIGN_UP' && 'Instant access to live NSE & MCX simulation with ₹10,00,000 virtual capital.'}
            {view === 'FORGOT_PASSWORD' && 'Enter your verified email to receive a password recovery link.'}
            {view === 'RESET_PASSWORD' && 'Enter and confirm your new secure account password below.'}
          </p>
        </div>

        {/* ── Main Auth Card (FundingPips White Card) ────────────────────── */}
        <div className="bg-white border border-[#D9E2F2] py-8 px-6 sm:px-8 rounded-3xl shadow-[0_8px_30px_rgba(0,34,90,0.06)]">
          {/* Notification Alerts */}
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-[#FEF3F2] border border-[#D92D20]/25 flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-[#D92D20] shrink-0 mt-0.5" />
              <p className="text-xs text-[#D92D20] font-medium leading-relaxed">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-[#ECFDF3] border border-[#12B76A]/25 flex items-start gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-[#12B76A] shrink-0 mt-0.5" />
              <p className="text-xs text-[#12B76A] font-medium leading-relaxed">{successMessage}</p>
            </div>
          )}

          {!isSupabaseConfigured && (
            <div className="mb-4 p-3 rounded-xl bg-[#EEF3FF] border border-[#536CF0]/25 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#536CF0] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#00225A] leading-snug">
                <span className="font-bold">Offline / Sandbox Mode:</span> Cloud credentials not detected. You can test authentication or click below to launch the sandbox instantly.
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
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#F7F8FA] border border-[#D9E2F2] hover:border-[#536CF0] text-[#00225A] text-xs font-semibold tracking-wide transition-all shadow-2xs flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 cursor-pointer h-11"
              >
                {googleLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 text-[#536CF0] animate-spin" />
                    <span>Connecting Google Identity...</span>
                  </>
                ) : (
                  <>
                    {/* Google G SVG */}
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

              {/* ── Divider ───────────────────────────────────────────────── */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#D9E2F2]" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-widest">
                  <span className="bg-white px-3 text-[#6B7A90]">
                    Or continue with email
                  </span>
                </div>
              </div>

              {/* ── Segmented Control: Sign In vs Create Account ──────────── */}
              <div className="flex items-center gap-1 bg-[#F0F2F6] w-full mb-5 p-1 rounded-xl border border-[#D9E2F2]">
                <button
                  type="button"
                  onClick={() => {
                    setView('SIGN_IN');
                    setError('');
                    setSuccessMessage('');
                  }}
                  className={`flex-1 py-2 text-xs font-semibold text-center rounded-lg transition-all ${
                    view === 'SIGN_IN'
                      ? 'bg-[#00225A] text-white shadow-2xs font-bold'
                      : 'text-[#6B7A90] hover:text-[#00225A]'
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
                  className={`flex-1 py-2 text-xs font-semibold text-center rounded-lg transition-all ${
                    view === 'SIGN_UP'
                      ? 'bg-[#00225A] text-white shadow-2xs font-bold'
                      : 'text-[#6B7A90] hover:text-[#00225A]'
                  }`}
                >
                  CREATE ACCOUNT
                </button>
              </div>
            </>
          )}

          {/* ── Email & Password Form ─────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (Sign Up Only) */}
            {view === 'SIGN_UP' && (
              <div>
                <label className="block text-[11px] font-semibold text-[#00225A] uppercase tracking-wider mb-1 font-mono">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-[#94A3B8]" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Atharva Bhosale"
                    className="block w-full pl-9 pr-3 py-2.5 border border-[#D9E2F2] rounded-xl bg-[#FFFFFF] text-[#111114] focus:outline-none focus:border-[#536CF0] focus:ring-2 focus:ring-[#536CF0]/10 transition-all text-xs placeholder:text-[#94A3B8]"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            {view !== 'RESET_PASSWORD' && (
              <div>
                <label className="block text-[11px] font-semibold text-[#00225A] uppercase tracking-wider mb-1 font-mono">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-[#94A3B8]" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="trader@cendrixcapital.com"
                    autoComplete="email"
                    className="block w-full pl-9 pr-3 py-2.5 border border-[#D9E2F2] rounded-xl bg-[#FFFFFF] text-[#111114] focus:outline-none focus:border-[#536CF0] focus:ring-2 focus:ring-[#536CF0]/10 transition-all text-xs placeholder:text-[#94A3B8]"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            {view !== 'FORGOT_PASSWORD' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-[#00225A] uppercase tracking-wider font-mono">
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
                      className="text-[11px] text-[#536CF0] hover:text-[#00225A] transition-colors font-medium"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-[#94A3B8]" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete={view === 'SIGN_IN' ? 'current-password' : 'new-password'}
                    className="block w-full pl-9 pr-10 py-2.5 border border-[#D9E2F2] rounded-xl bg-[#FFFFFF] text-[#111114] focus:outline-none focus:border-[#536CF0] focus:ring-2 focus:ring-[#536CF0]/10 transition-all text-xs placeholder:text-[#94A3B8]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8] hover:text-[#00225A]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {(view === 'SIGN_UP' || view === 'RESET_PASSWORD') && (
                  <p className="text-[10px] text-[#6B7A90] mt-1 font-mono">
                    Must be at least 6 characters.
                  </p>
                )}
              </div>
            )}

            {/* Confirm Password */}
            {(view === 'SIGN_UP' || view === 'RESET_PASSWORD') && (
              <div>
                <label className="block text-[11px] font-semibold text-[#00225A] uppercase tracking-wider mb-1 font-mono">
                  Confirm {view === 'RESET_PASSWORD' ? 'New ' : ''}Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ShieldCheck className="h-4 w-4 text-[#94A3B8]" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="new-password"
                    className="block w-full pl-9 pr-10 py-2.5 border border-[#D9E2F2] rounded-xl bg-[#FFFFFF] text-[#111114] focus:outline-none focus:border-[#536CF0] focus:ring-2 focus:ring-[#536CF0]/10 transition-all text-xs placeholder:text-[#94A3B8]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8] hover:text-[#00225A]"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Remember Me Option */}
            {view === 'SIGN_IN' && (
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 text-[#6B7A90] cursor-pointer select-none font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-[#D9E2F2] text-[#00225A] focus:ring-[#536CF0] cursor-pointer"
                  />
                  <span>Keep session active</span>
                </label>
                <span className="text-[10px] text-[#6B7A90] font-mono">TLS 256-Bit</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full btn-primary py-2.5 text-xs font-semibold shadow-md flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 h-11"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
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
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Back to Sign In Button */}
          {(view === 'FORGOT_PASSWORD' || view === 'RESET_PASSWORD') && (
            <div className="mt-4 pt-3 border-t border-[#D9E2F2] text-center">
              <button
                type="button"
                onClick={() => {
                  setView('SIGN_IN');
                  setError('');
                  setSuccessMessage('');
                }}
                className="text-xs text-[#536CF0] hover:text-[#00225A] font-medium flex items-center justify-center gap-1.5 mx-auto transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
              </button>
            </div>
          )}

          {/* ── Method 3: 1-Click Institutional Demo Sandbox ──────────────── */}
          <div className="mt-6 pt-5 border-t border-[#D9E2F2]">
            <div className="p-4 rounded-2xl bg-[#F7F8FA] border border-[#D9E2F2] flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#12B76A] animate-pulse" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#00225A]">
                    Simulated Sandbox
                  </span>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#EEF3FF] text-[#00225A] border border-[#D9E2F2] font-semibold">
                  ₹10,00,000 VIRTUAL
                </span>
              </div>
              <p className="text-[11px] text-[#6B7A90] leading-relaxed">
                Want immediate access without logging in? Enter the sandbox loaded with live tick streams and virtual margin.
              </p>
              <button
                type="button"
                onClick={handleLaunchDemo}
                disabled={demoLoading}
                className="w-full btn-secondary py-2 px-3 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2 active:scale-[0.98] h-10"
              >
                {demoLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Initializing Trading Desk...</span>
                  </>
                ) : (
                  <>
                    <span>Launch 1-Click Sandbox</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#536CF0]" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Footer Back to Landing */}
          <div className="mt-5 pt-3 border-t border-[#D9E2F2] flex items-center justify-between text-xs text-[#6B7A90]">
            <Link
              to="/"
              className="hover:text-[#00225A] transition-colors flex items-center gap-1.5 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Platform Overview
            </Link>
            <span className="text-[10px] font-mono">Institutional Simulator</span>
          </div>
        </div>

        {/* Security Disclaimers */}
        <div className="mt-6 text-center space-y-1">
          <p className="text-[10px] text-[#6B7A90] font-mono">
            Protected by Cloud Authentication · 256-Bit TLS · Strict Transport Security
          </p>
          <p className="text-[10px] text-[#94A3B8]">
            For paper simulation & quantitative strategy testing only.
          </p>
        </div>
      </div>
    </div>
  );
}
