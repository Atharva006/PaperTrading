import React, { useState, useEffect, useRef } from 'react';
import { useTradingStore } from '../store/useTradingStore';
import { marketDataService } from '../services/market/MarketDataService';
import { tradingRepo } from '../services/storage/SupabaseTradingRepo';
import {
  Settings,
  Key,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  Sliders,
  Server,
  Activity,
  RefreshCw,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface SettingsPageProps {
  onOpenReset: () => void;
}

export default function SettingsPage({ onOpenReset }: SettingsPageProps) {
  const { userSettings, addToast } = useTradingStore();

  // Credentials State
  const [apiKey, setApiKey] = useState(userSettings?.upstox_api_key || import.meta.env.VITE_UPSTOX_API_KEY || '');
  const [apiSecret, setApiSecret] = useState(userSettings?.upstox_api_secret || import.meta.env.VITE_UPSTOX_API_SECRET || '');
  const [accessToken, setAccessToken] = useState(userSettings?.upstox_access_token || import.meta.env.VITE_UPSTOX_ACCESS_TOKEN || '');
  const [redirectUri, setRedirectUri] = useState(userSettings?.upstox_redirect_uri || 'http://localhost:5173/dashboard/settings');

  // Security Vault 4-Digit Passcode State (Passcode: 0000)
  const [isGatewayUnlocked, setIsGatewayUnlocked] = useState(false);
  const [pinDigits, setPinDigits] = useState(['', '', '', '']);
  const [pinError, setPinError] = useState(false);
  const pinInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Visibility Toggles
  const [showSecret, setShowSecret] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Simulation & Mode State
  const [mode, setMode] = useState<'LIVE' | 'DEMO'>(marketDataService.getMode());
  const [slippageBps, setSlippageBps] = useState(userSettings?.simulated_slippage_bps || 5);
  const [allowAfterHours, setAllowAfterHours] = useState(userSettings?.allow_after_hours_fill ?? true);

  const [environment, setEnvironment] = useState<'PRODUCTION' | 'SANDBOX'>(() => {
    return (localStorage.getItem('tradeedge_upstox_env') as 'PRODUCTION' | 'SANDBOX') || 'PRODUCTION';
  });

  const [isExchangingCode, setIsExchangingCode] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs: number; ltp?: number } | null>(null);

  const hasExchangedRef = useRef(false);

  // Automatically detect and exchange Upstox OAuth authorization code from URL redirect (?code=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (!code || hasExchangedRef.current) return;

    hasExchangedRef.current = true;
    window.history.replaceState({}, '', window.location.pathname);

    const exchangeCode = async () => {
      setIsExchangingCode(true);
      addToast('info', 'Gateway Authorization', 'Detected authorization code. Exchanging for live access token...');

      const effectiveApiKey = apiKey || import.meta.env.VITE_UPSTOX_API_KEY || '';
      const effectiveApiSecret = apiSecret || import.meta.env.VITE_UPSTOX_API_SECRET || '';

      const res = await marketDataService.exchangeUpstoxAuthCode(
        code,
        effectiveApiKey,
        effectiveApiSecret,
        redirectUri
      );

      if (res.success && res.access_token) {
        setAccessToken(res.access_token);
        setMode('LIVE');
        localStorage.setItem('tradeedge_upstox_access_token', res.access_token);
        localStorage.setItem('tradeedge_market_mode', 'LIVE');
        marketDataService.setUpstoxCredentials(effectiveApiKey, effectiveApiSecret, res.access_token);
        marketDataService.setMode('LIVE');

        if (userSettings) {
          await tradingRepo.saveUserSettings({
            ...userSettings,
            upstox_access_token: res.access_token,
            market_data_mode: 'LIVE',
          });
        }

        addToast('success', 'Exchange Gateway Connected!', 'Bearer access token generated. Live exchange quotes active.');
        handleTestConnection(res.access_token);
      } else {
        addToast('error', 'Token Exchange Failed', res.error || 'Could not exchange authorization code.');
      }
      setIsExchangingCode(false);
    };

    exchangeCode();
  }, []);

  // Passcode Verification Logic (Passcode: 0000)
  const verifyPin = (currentPin: string[]) => {
    const entered = currentPin.join('');
    if (entered.length === 4) {
      if (entered === '0000') {
        setIsGatewayUnlocked(true);
        setPinError(false);
        addToast('success', 'Clearance Granted', 'Direct Exchange Gateway credentials unlocked.');
      } else {
        setPinError(true);
        addToast('error', 'Access Denied', 'Invalid 4-digit security PIN. Passcode is 0000.');
        setTimeout(() => {
          setPinDigits(['', '', '', '']);
          pinInputRefs[0].current?.focus();
        }, 500);
      }
    }
  };

  const handlePinChange = (index: number, val: string) => {
    const digit = val.slice(-1);
    if (!/^\d*$/.test(digit)) return;

    const updated = [...pinDigits];
    updated[index] = digit;
    setPinDigits(updated);
    setPinError(false);

    if (digit && index < 3) {
      pinInputRefs[index + 1].current?.focus();
    }

    if (updated.every((d) => d !== '')) {
      verifyPin(updated);
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      pinInputRefs[index - 1].current?.focus();
    }
  };

  const handleKeypadPress = (val: string) => {
    const firstEmptyIndex = pinDigits.findIndex((d) => d === '');
    if (firstEmptyIndex !== -1) {
      handlePinChange(firstEmptyIndex, val);
    }
  };

  const handleKeypadClear = () => {
    setPinDigits(['', '', '', '']);
    setPinError(false);
    pinInputRefs[0].current?.focus();
  };

  const copyToClipboard = (text: string, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    addToast('info', 'Copied', `${field} copied to clipboard.`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleTestConnection = async (tokenToTest?: string) => {
    setIsTesting(true);
    setTestResult(null);

    const activeToken = tokenToTest || accessToken;
    marketDataService.setUpstoxCredentials(apiKey, apiSecret, activeToken);

    const result = await marketDataService.testUpstoxConnection();
    setTestResult(result);
    setIsTesting(false);

    if (result.success) {
      addToast('success', 'Connection Verified', `Connected to Direct Exchange Feed in ${result.latencyMs}ms! NIFTY 50 LTP: ₹${result.ltp?.toFixed(2)}`);
    } else {
      addToast('warning', 'Gateway Disconnected', result.message);
    }
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    marketDataService.setUpstoxCredentials(apiKey, apiSecret, accessToken);
    marketDataService.setMode(mode);

    if (userSettings) {
      await tradingRepo.saveUserSettings({
        ...userSettings,
        upstox_api_key: apiKey,
        upstox_api_secret: apiSecret,
        upstox_access_token: accessToken,
        upstox_redirect_uri: redirectUri,
        market_data_mode: mode,
        simulated_slippage_bps: slippageBps,
        allow_after_hours_fill: allowAfterHours,
      });
    }

    addToast('success', 'Settings Saved', 'Direct gateway credentials and parameters committed.');

    if (mode === 'LIVE' && accessToken) {
      handleTestConnection();
    }
  };

  const handleOAuthConnect = () => {
    if (!apiKey) {
      addToast('error', 'API Key Required', 'Please enter your Exchange Gateway API Key (Client ID) before initiating authorization.');
      return;
    }
    const authUrl = `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${encodeURIComponent(apiKey)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = authUrl;
  };

  return (
    <div className="w-full max-w-full mx-auto select-none font-sans text-[#F5F5F2] pb-14 space-y-6">
      {/* ── 1. Top Cendrix Capital Header Strip ─────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#14223A]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-widest text-[#C6A15B] uppercase font-bold">
              Infrastructure Control · Security Vault
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif tracking-tight text-[#F5F5F2] flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-[#C6A15B]" />
            <span>Platform Settings & Gateway Vault</span>
          </h1>
          <p className="text-xs text-[#A1A8B3] mt-0.5">
            Configure direct exchange telemetry, calibrate execution slippage, and manage virtual risk parameters
          </p>
        </div>

        {/* Status Chip */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0F192B] border border-[rgba(198,161,91,0.25)] text-xs font-mono">
            <Server className="w-3.5 h-3.5 text-[#C6A15B]" />
            <span className="text-[#A1A8B3]">Provider:</span>
            <span className="font-bold text-[#F5F5F2]">Cendrix Direct Exchange</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00c087] animate-pulse" />
          </div>
        </div>
      </div>

      {/* ── 2. Direct Exchange Gateway Card (PIN-Protected Vault) ────────── */}
      <div className="bg-[#0E1728]/80 backdrop-blur-xl rounded-2xl border border-[rgba(198,161,91,0.22)] shadow-2xl overflow-hidden transition-all duration-300">
        {/* Card Header */}
        <div className="p-5 sm:p-6 border-b border-[#14223A] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B1424]/60">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F192B] border border-[rgba(198,161,91,0.3)] flex items-center justify-center shrink-0 shadow-sm shadow-[#C6A15B]/10">
              <Key className="w-5 h-5 text-[#C6A15B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-serif font-bold text-[#F5F5F2] tracking-wide">
                  Direct Exchange Gateway Credentials
                </h2>
                {isGatewayUnlocked ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00c087]/15 text-[#00c087] border border-[#00c087]/30 flex items-center gap-1">
                    <Unlock className="w-3 h-3" /> UNLOCKED
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#C6A15B]/15 text-[#C6A15B] border border-[#C6A15B]/30 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> VAULT LOCKED
                  </span>
                )}
              </div>
              <p className="text-xs text-[#A1A8B3] mt-0.5">
                Upstox v2 WebSocket & REST API keys for real-time NSE & MCX market depth and interactive tick stream
              </p>
            </div>
          </div>

          {/* Vault Lock / Unlock Status Button */}
          {isGatewayUnlocked && (
            <button
              type="button"
              onClick={() => {
                setIsGatewayUnlocked(false);
                setPinDigits(['', '', '', '']);
                addToast('info', 'Vault Locked', 'Gateway credentials locked.');
              }}
              className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-[#0F192B] hover:bg-[#14223A] text-[#A1A8B3] hover:text-[#C6A15B] border border-[rgba(198,161,91,0.2)] text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Credentials</span>
            </button>
          )}
        </div>

        {/* ── Locked Security Vault View (Passcode Required) ──────────────── */}
        {!isGatewayUnlocked ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-[#0F192B] border border-[rgba(198,161,91,0.4)] flex items-center justify-center shadow-xl shadow-[#C6A15B]/15 animate-gold-pulse">
                <Lock className="w-8 h-8 text-[#C6A15B]" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#10141C] border border-[#C6A15B] flex items-center justify-center">
                <ShieldCheck className="w-3 h-3 text-[#C6A15B]" />
              </div>
            </div>

            <div className="max-w-md space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C6A15B] font-bold">
                Security Clearance Required
              </span>
              <h3 className="text-lg font-serif font-bold text-[#F5F5F2]">
                Restricted Gateway Vault
              </h3>
              <p className="text-xs text-[#A1A8B3] leading-relaxed">
                Direct exchange gateway credentials, secret keys, and bearer tokens are restricted. Enter the 4-digit security PIN to unlock this console.
              </p>
            </div>

            {/* 4-Digit PIN Input Display */}
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                {pinDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={pinInputRefs[idx]}
                    type="password"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(idx, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(idx, e)}
                    className={`w-12 h-14 text-center text-xl font-mono font-bold rounded-xl bg-[#0B1424] border transition-all focus:outline-none ${
                      pinError
                        ? 'border-rose-500 text-rose-400 bg-rose-500/10 animate-shake'
                        : digit
                        ? 'border-[#C6A15B] text-[#C6A15B] shadow-sm shadow-[#C6A15B]/20'
                        : 'border-[#14223A] text-[#F5F5F2] focus:border-[#C6A15B]'
                    }`}
                  />
                ))}
              </div>

              {/* On-Screen Touch / Click Pad */}
              <div className="grid grid-cols-3 gap-2 max-w-[210px] mx-auto pt-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleKeypadPress(num)}
                    className="h-10 rounded-lg bg-[#0F192B] hover:bg-[#14223A] border border-[#14223A] hover:border-[rgba(198,161,91,0.3)] text-[#F5F5F2] font-mono font-semibold text-sm transition-all active:scale-95"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleKeypadClear}
                  className="h-10 rounded-lg bg-[#0F192B] hover:bg-[#14223A] border border-[#14223A] text-[#A1A8B3] hover:text-white font-mono text-[10.5px] uppercase font-semibold transition-all active:scale-95"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  className="h-10 rounded-lg bg-[#0F192B] hover:bg-[#14223A] border border-[#14223A] hover:border-[rgba(198,161,91,0.3)] text-[#F5F5F2] font-mono font-semibold text-sm transition-all active:scale-95"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => verifyPin(pinDigits)}
                  className="h-10 rounded-lg btn-cendrix-gold font-mono font-bold text-xs transition-all active:scale-95 flex items-center justify-center"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-2">
                <span className="px-3 py-1 rounded-full bg-[#C6A15B]/10 border border-[#C6A15B]/20 text-[10.5px] font-mono text-[#E2C889]">
                  Default Administrator Passcode: <strong className="text-[#F5F5F2]">0000</strong>
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* ── Unlocked Gateway Form ─────────────────────────────────────── */
          <form onSubmit={handleSaveCredentials} className="p-6 sm:p-8 space-y-6">
            {/* Top Unlocked Security Alert */}
            <div className="p-3.5 rounded-xl bg-[#00c087]/10 border border-[#00c087]/30 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-[#00c087]">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-semibold">Clearance Verified: Direct Gateway Console Unlocked</span>
              </div>
              <span className="text-[10px] text-[#A1A8B3]">Active Session</span>
            </div>

            {/* Gateway Environment (Production vs Sandbox) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#0B1424] rounded-xl border border-[#14223A]">
              <div>
                <span className="text-xs font-bold text-[#F5F5F2] uppercase font-mono tracking-wider">Gateway Environment</span>
                <p className="text-[11px] text-[#A1A8B3] mt-0.5">Match your developer account app type (Live Production vs Sandbox)</p>
              </div>
              <div className="flex gap-1.5 bg-[#0E1728] p-1 rounded-lg border border-[rgba(198,161,91,0.2)] self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setEnvironment('PRODUCTION');
                    marketDataService.setEnvironment('PRODUCTION');
                  }}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-md font-mono transition-colors ${
                    environment === 'PRODUCTION' ? 'btn-cendrix-gold shadow-sm' : 'text-[#A1A8B3] hover:text-[#F5F5F2]'
                  }`}
                >
                  Live Production
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEnvironment('SANDBOX');
                    marketDataService.setEnvironment('SANDBOX');
                  }}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-md font-mono transition-colors ${
                    environment === 'SANDBOX' ? 'bg-[#387ed1] text-white shadow-sm' : 'text-[#A1A8B3] hover:text-[#F5F5F2]'
                  }`}
                >
                  Sandbox Mode
                </button>
              </div>
            </div>

            {/* API Key & API Secret */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#A1A8B3] uppercase font-mono tracking-wider">
                    API Key (Client ID)
                  </label>
                  {apiKey && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(apiKey, 'API Key')}
                      className="text-[10px] text-[#C6A15B] hover:text-[#E2C889] flex items-center gap-1 font-mono"
                    >
                      {copiedField === 'API Key' ? <Check className="w-3 h-3 text-[#00c087]" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="e.g. ad9cd1b6-0526-4024-..."
                  className="w-full bg-[#0B1424] border border-[#14223A] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#F5F5F2] focus:outline-none focus:border-[#C6A15B] transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#A1A8B3] uppercase font-mono tracking-wider">
                    API Secret
                  </label>
                  {apiSecret && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(apiSecret, 'API Secret')}
                      className="text-[10px] text-[#C6A15B] hover:text-[#E2C889] flex items-center gap-1 font-mono"
                    >
                      {copiedField === 'API Secret' ? <Check className="w-3 h-3 text-[#00c087]" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    placeholder="••••••••••••••••••••••••"
                    className="w-full bg-[#0B1424] border border-[#14223A] rounded-xl px-3.5 pr-10 py-2.5 text-xs font-mono text-[#F5F5F2] focus:outline-none focus:border-[#C6A15B] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6E7683] hover:text-[#A1A8B3]"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Redirect URI */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#A1A8B3] uppercase font-mono tracking-wider">
                  Redirect URI (Configured in Developer Portal)
                </label>
                <button
                  type="button"
                  onClick={() => copyToClipboard(redirectUri, 'Redirect URI')}
                  className="text-[10px] text-[#C6A15B] hover:text-[#E2C889] flex items-center gap-1 font-mono"
                >
                  {copiedField === 'Redirect URI' ? <Check className="w-3 h-3 text-[#00c087]" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              </div>
              <input
                type="text"
                value={redirectUri}
                onChange={(e) => setRedirectUri(e.target.value)}
                className="w-full bg-[#0B1424] border border-[#14223A] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#F5F5F2] focus:outline-none focus:border-[#C6A15B] transition-colors"
              />
            </div>

            {/* Access Token (Bearer Token) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-[#A1A8B3] uppercase font-mono tracking-wider">
                    Access Token (Bearer Token)
                  </label>
                  {accessToken && (
                    <span className="text-[10px] text-[#00c087] flex items-center gap-1 font-mono font-bold bg-[#00c087]/10 px-2 py-0.5 rounded border border-[#00c087]/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00c087] animate-pulse" />
                      Active Token Loaded
                    </span>
                  )}
                </div>

                {accessToken && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(accessToken, 'Access Token')}
                    className="text-[10px] text-[#C6A15B] hover:text-[#E2C889] flex items-center gap-1 font-mono"
                  >
                    {copiedField === 'Access Token' ? <Check className="w-3 h-3 text-[#00c087]" /> : <Copy className="w-3 h-3" />}
                    <span>Copy Token</span>
                  </button>
                )}
              </div>

              {isExchangingCode && (
                <div className="mb-3 p-3 bg-[#C6A15B]/10 border border-[#C6A15B]/30 rounded-xl flex items-center gap-2.5 text-xs text-[#E2C889]">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#C6A15B]" />
                  <span>Exchanging gateway authorization code for live token...</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    placeholder="eyJhbGciOiJSUzI1NiIsInR5cCI6..."
                    className="w-full bg-[#0B1424] border border-[#14223A] rounded-xl px-3.5 pr-10 py-2.5 text-xs font-mono text-[#F5F5F2] focus:outline-none focus:border-[#C6A15B] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6E7683] hover:text-[#A1A8B3]"
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleTestConnection()}
                    disabled={isTesting}
                    className="btn-cendrix-outline py-2.5 px-3.5 text-xs font-bold font-mono"
                    title="Test gateway connection"
                  >
                    <Activity className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-[#C6A15B]' : 'text-[#00c087]'}`} />
                    <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOAuthConnect}
                    className="btn-cendrix-gold py-2.5 px-4 text-xs font-bold font-mono shadow-sm"
                    title="Authorize and auto-generate Token"
                  >
                    <span>Authorize 1-Click</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-[#A1A8B3] mt-2">
                SEBI regulations require exchange access tokens to be re-authorized periodically. Click <strong>Authorize 1-Click</strong> to auto-generate a daily session token or paste an existing token.
              </p>

              {/* Diagnostic Result Card */}
              {testResult && (
                <div
                  className={`mt-3.5 p-4 rounded-xl border text-xs flex items-start gap-3 transition-all animate-in fade-in duration-200 ${
                    testResult.success
                      ? 'bg-[#00c087]/10 border-[#00c087]/30 text-[#00c087]'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold">
                        {testResult.success ? 'Exchange Gateway Connected' : 'Gateway Connection Failed'}
                      </span>
                      <span className="text-[11px] opacity-80">{testResult.latencyMs}ms</span>
                    </div>
                    <p className="text-[11px] opacity-90">{testResult.message}</p>
                    {testResult.ltp && testResult.ltp > 0 && (
                      <p className="text-[11px] font-mono text-[#F5F5F2] pt-1 border-t border-[#00c087]/20">
                        Live Sample Tick (NIFTY 50): <strong className="text-[#00c087]">₹{testResult.ltp.toFixed(2)}</strong>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Market Data Mode Switcher */}
            <div className="p-4 bg-[#0B1424] rounded-xl border border-[#14223A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-[#F5F5F2] uppercase font-mono tracking-wider">
                  Market Data Provider Mode
                </p>
                <p className="text-[11px] text-[#A1A8B3] mt-0.5">
                  Toggle between high-fidelity deterministic simulation or live direct exchange stream.
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-[#0E1728] p-1 rounded-lg border border-[rgba(198,161,91,0.2)]">
                <button
                  type="button"
                  onClick={() => setMode('DEMO')}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-bold font-mono transition-colors ${
                    mode === 'DEMO' ? 'btn-cendrix-gold shadow-sm' : 'text-[#A1A8B3] hover:text-[#F5F5F2]'
                  }`}
                >
                  DEMO MODE
                </button>
                <button
                  type="button"
                  onClick={() => setMode('LIVE')}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-bold font-mono transition-colors ${
                    mode === 'LIVE' ? 'bg-[#00c087] text-[#0B1424] shadow-sm' : 'text-[#A1A8B3] hover:text-[#F5F5F2]'
                  }`}
                >
                  DIRECT LIVE
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="btn-cendrix-gold py-2.5 px-6 text-xs font-bold tracking-wider shadow-md shadow-[#C6A15B]/15"
              >
                Save Configuration & Reconnect
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── 3. Simulation Engine Tuning Card ─────────────────────────────── */}
      <div className="bg-[#0E1728]/80 backdrop-blur-xl rounded-2xl border border-[rgba(198,161,91,0.22)] shadow-2xl p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-[#14223A]">
          <div className="w-10 h-10 rounded-xl bg-[#0F192B] border border-[rgba(198,161,91,0.3)] flex items-center justify-center shrink-0">
            <Sliders className="w-5 h-5 text-[#C6A15B]" />
          </div>
          <div>
            <h2 className="text-base font-serif font-bold text-[#F5F5F2]">
              Paper Trading Simulation Engine Tuning
            </h2>
            <p className="text-xs text-[#A1A8B3]">
              Calibrate simulated execution slippage and market fill parameters across Indian scrips
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Simulated Slippage Slider */}
          <div className="p-4 bg-[#0B1424] rounded-xl border border-[#14223A] space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#F5F5F2]">Simulated Slippage (BPS)</span>
              <span className="font-mono text-[#C6A15B] font-bold px-2 py-0.5 rounded bg-[#C6A15B]/10 border border-[#C6A15B]/30">
                {slippageBps} bps ({(slippageBps * 0.01).toFixed(2)}%)
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={slippageBps}
              onChange={(e) => setSlippageBps(parseInt(e.target.value) || 0)}
              className="w-full accent-[#C6A15B] cursor-pointer"
            />
            <p className="text-[10.5px] text-[#A1A8B3]">
              Simulates realistic order book bid-ask spread impact on market order fills.
            </p>
          </div>

          {/* After-Hours Fills Toggle */}
          <div className="p-4 bg-[#0B1424] rounded-xl border border-[#14223A] flex items-center justify-between">
            <div className="pr-4">
              <p className="text-xs font-bold text-[#F5F5F2]">Allow After-Hours Market Fills</p>
              <p className="text-[10.5px] text-[#A1A8B3] mt-0.5">
                Enables simulated paper fills outside standard 09:15 - 15:30 IST market hours for weekend strategy testing.
              </p>
            </div>
            <input
              type="checkbox"
              checked={allowAfterHours}
              onChange={(e) => setAllowAfterHours(e.target.checked)}
              className="w-4 h-4 rounded border-[#14223A] bg-[#0E1728] text-[#C6A15B] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#C6A15B]"
            />
          </div>
        </div>
      </div>

      {/* ── 4. Virtual Capital & Portfolio Reset Card ───────────────────── */}
      <div className="bg-[#0E1728]/80 backdrop-blur-xl rounded-2xl border border-rose-500/30 shadow-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h2 className="text-base font-serif font-bold text-rose-300">
              Reset Virtual Portfolio Balance
            </h2>
            <p className="text-xs text-[#A1A8B3]">
              Restore starting virtual margin back to ₹10,00,000 and clear simulated trading history
            </p>
          </div>
        </div>

        <p className="text-xs text-[#A1A8B3] leading-relaxed">
          Resetting your account will square off all active positions, cancel pending orders, reset virtual cash to ₹10,00,000, and append an auditable reset event to your ledger statement.
        </p>

        <div className="pt-1">
          <button
            type="button"
            onClick={onOpenReset}
            className="px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white text-xs font-bold font-mono border border-rose-500/30 transition-all active:scale-95 shadow-sm"
          >
            Reset to ₹10,00,000 Virtual Funds
          </button>
        </div>
      </div>
    </div>
  );
}
