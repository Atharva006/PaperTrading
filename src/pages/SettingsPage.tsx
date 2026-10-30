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

  // Security Vault 4-Digit Passcode State
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

  // Automatically detect and exchange gateway OAuth authorization code from URL redirect (?code=...)
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

  // Cryptographic Passcode Verification Logic
  const sha256 = async (str: string): Promise<string> => {
    try {
      const buffer = new TextEncoder().encode(str);
      const digest = await crypto.subtle.digest('SHA-256', buffer);
      return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    } catch {
      return '';
    }
  };

  const verifyPin = async (currentPin: string[]) => {
    const entered = currentPin.join('');
    if (entered.length === 4) {
      const enteredHash = await sha256(entered);
      const expectedHash = import.meta.env.VITE_GATEWAY_SECURITY_HASH;
      const expectedPin = import.meta.env.VITE_GATEWAY_SECURITY_PIN;

      // Default to passcode '0000' if no custom environment override is set
      const defaultHash = '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4';
      const defaultPin = '0000';

      let isValid: boolean;
      if (expectedHash || expectedPin) {
        isValid =
          (!!expectedHash && enteredHash === expectedHash) ||
          (!!expectedPin && entered === expectedPin);
      } else {
        isValid = enteredHash === defaultHash || entered === defaultPin;
      }

      if (isValid) {
        setIsGatewayUnlocked(true);
        setPinError(false);
        addToast('success', 'Clearance Granted', 'Direct Exchange Gateway credentials unlocked.');
      } else {
        setPinError(true);
        addToast('error', 'Access Denied', 'Invalid 4-digit security PIN. Authorization failed.');
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
    if (e.key === 'Backspace') {
      if (!pinDigits[index] && index > 0) {
        const updated = [...pinDigits];
        updated[index - 1] = '';
        setPinDigits(updated);
        pinInputRefs[index - 1].current?.focus();
      } else {
        const updated = [...pinDigits];
        updated[index] = '';
        setPinDigits(updated);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      pinInputRefs[index - 1].current?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      pinInputRefs[index + 1].current?.focus();
    }
  };

  const handlePinPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    const digits = pastedData.replace(/\D/g, '').slice(0, 4).split('');
    if (digits.length > 0) {
      const updated = ['', '', '', ''];
      digits.forEach((d, i) => {
        if (i < 4) updated[i] = d;
      });
      setPinDigits(updated);
      setPinError(false);
      const nextFocus = Math.min(digits.length, 3);
      pinInputRefs[nextFocus].current?.focus();
      if (updated.every((d) => d !== '')) {
        verifyPin(updated);
      }
    }
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

  const handleSaveSimulationSettings = async () => {
    if (userSettings) {
      await tradingRepo.saveUserSettings({
        ...userSettings,
        simulated_slippage_bps: slippageBps,
        allow_after_hours_fill: allowAfterHours,
      });
      addToast('success', 'Simulation Parameters Saved', 'Execution slippage and after-hours fill settings committed.');
    } else {
      addToast('info', 'Parameters Updated', 'Execution simulation parameters updated for active session.');
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
    <div className="w-full max-w-full mx-auto select-none font-sans text-[#111114] pb-14 space-y-6">
      {/* ── 1. Top Cendrix Capital Header Strip ─────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#D9E2F2]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-wider text-[#536CF0] uppercase font-semibold">
              Infrastructure Control · Security Vault
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-[#00225A] flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-[#00225A]" />
            <span>Platform Settings & Gateway Vault</span>
          </h1>
          <p className="text-xs text-[#6B7A90] mt-1 font-mono">
            Configure direct exchange telemetry, calibrate execution slippage, and manage virtual risk parameters
          </p>
        </div>

        {/* Status Chip */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#D9E2F2] text-xs font-mono shadow-xs">
            <Server className="w-3.5 h-3.5 text-[#536CF0]" />
            <span className="text-[#6B7A90]">Provider:</span>
            <span className="font-semibold text-[#00225A]">Cendrix Direct Exchange</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A] animate-pulse" />
          </div>
        </div>
      </div>

      {/* ── 2. Direct Exchange Gateway Card (PIN-Protected Vault) ────────── */}
      <div className="bg-white rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)] overflow-hidden transition-all duration-300">
        {/* Card Header */}
        <div className="p-5 sm:p-6 border-b border-[#D9E2F2] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F7F8FA]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#D9E2F2] flex items-center justify-center shrink-0 shadow-xs">
              <Key className="w-5 h-5 text-[#00225A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-display font-bold text-[#00225A] tracking-tight">
                  Direct Exchange Gateway Credentials
                </h2>
                {isGatewayUnlocked ? (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#12B76A]/10 text-[#12B76A] border border-[#12B76A]/30 flex items-center gap-1">
                    <Unlock className="w-3 h-3" /> UNLOCKED
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#536CF0]/10 text-[#00225A] border border-[#536CF0]/25 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-[#536CF0]" /> VAULT LOCKED
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B7A90] mt-0.5">
                Direct WebSocket & REST telemetry gateway for real-time market depth and interactive tick stream
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
              className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F7F8FA] text-[#6B7A90] hover:text-[#00225A] border border-[#D9E2F2] text-xs font-mono font-semibold flex items-center gap-1.5 transition-all active:scale-[0.96] shadow-xs cursor-pointer"
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
              <div className="w-16 h-16 rounded-2xl bg-[#F7F8FA] border border-[#D9E2F2] flex items-center justify-center shadow-xs">
                <Lock className="w-8 h-8 text-[#00225A]" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#00225A] border border-white flex items-center justify-center">
                <ShieldCheck className="w-3 h-3 text-white" />
              </div>
            </div>

            <div className="max-w-md space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#536CF0] font-semibold">
                Security Clearance Required
              </span>
              <h3 className="text-lg font-display font-bold text-[#00225A] tracking-tight">
                Restricted Gateway Vault
              </h3>
              <p className="text-xs text-[#6B7A90] leading-relaxed">
                Direct exchange gateway credentials, secret keys, and bearer tokens are restricted. Enter the 4-digit security PIN to unlock this console.
              </p>
            </div>

            {/* 4-Digit PIN Input Display (Keyboard & Paste Only) */}
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                {pinDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={pinInputRefs[idx]}
                    type="password"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(idx, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(idx, e)}
                    onPaste={handlePinPaste}
                    className={`w-12 h-14 text-center text-xl font-mono font-bold rounded-2xl transition-all focus:outline-none ${
                      pinError
                        ? 'border-[#D92D20] text-[#D92D20] bg-[#D92D20]/5 animate-shake'
                        : digit
                        ? 'border-[#00225A] text-[#00225A] bg-[#EEF3FF] shadow-xs'
                        : 'border-[#D9E2F2] bg-[#F7F8FA] text-[#00225A] focus:border-[#536CF0] focus:bg-white focus:ring-2 focus:ring-[#536CF0]/15'
                    }`}
                  />
                ))}
              </div>

              {/* Status Note */}
              <div className="pt-1">
                {pinError ? (
                  <span className="text-xs font-mono text-[#D92D20]">
                    Incorrect security PIN. Access denied.
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-[#6B7A90]">
                    Enter 4-digit authorization PIN using keyboard
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ── Unlocked Gateway Form ─────────────────────────────────────── */
          <form onSubmit={handleSaveCredentials} className="p-6 sm:p-8 space-y-6">
            {/* Top Unlocked Security Alert */}
            <div className="p-3.5 rounded-xl bg-[#12B76A]/10 border border-[#12B76A]/20 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-[#12B76A]">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-semibold">Clearance Verified: Direct Gateway Console Unlocked</span>
              </div>
              <span className="text-[10px] text-[#6B7A90]">Active Session</span>
            </div>

            {/* Gateway Environment (Production vs Sandbox) in Segmented Control */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#F7F8FA] rounded-xl border border-[#D9E2F2]">
              <div>
                <span className="text-xs font-bold text-[#00225A] uppercase font-mono tracking-wider">Gateway Environment</span>
                <p className="text-[11px] text-[#6B7A90] mt-0.5">Match your developer account app type (Live Production vs Sandbox)</p>
              </div>
              <div className="p-1 rounded-xl inline-flex gap-1 self-start sm:self-auto bg-white border border-[#D9E2F2] shadow-xs">
                <button
                  type="button"
                  onClick={() => {
                    setEnvironment('PRODUCTION');
                    marketDataService.setEnvironment('PRODUCTION');
                  }}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg font-mono transition-all cursor-pointer ${
                    environment === 'PRODUCTION' ? 'bg-[#00225A] text-white shadow-xs' : 'text-[#6B7A90] hover:text-[#00225A]'
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
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg font-mono transition-all cursor-pointer ${
                    environment === 'SANDBOX' ? 'bg-[#00225A] text-white shadow-xs' : 'text-[#6B7A90] hover:text-[#00225A]'
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
                  <label className="text-xs font-semibold text-[#6B7A90] uppercase font-mono tracking-wider">
                    API Key (Client ID)
                  </label>
                  {apiKey && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(apiKey, 'API Key')}
                      className="text-[10px] text-[#536CF0] hover:text-[#00225A] flex items-center gap-1 font-mono active:scale-95 transition-transform cursor-pointer"
                    >
                      {copiedField === 'API Key' ? <Check className="w-3 h-3 text-[#12B76A]" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="e.g. ad9cd1b6-0526-4024-..."
                  className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#111114] focus:outline-none focus:border-[#536CF0] focus:bg-white focus:ring-2 focus:ring-[#536CF0]/10 transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#6B7A90] uppercase font-mono tracking-wider">
                    API Secret
                  </label>
                  {apiSecret && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(apiSecret, 'API Secret')}
                      className="text-[10px] text-[#536CF0] hover:text-[#00225A] flex items-center gap-1 font-mono active:scale-95 transition-transform cursor-pointer"
                    >
                      {copiedField === 'API Secret' ? <Check className="w-3 h-3 text-[#12B76A]" /> : <Copy className="w-3 h-3" />}
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
                    className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl px-3.5 pr-10 py-2.5 text-xs font-mono text-[#111114] focus:outline-none focus:border-[#536CF0] focus:bg-white focus:ring-2 focus:ring-[#536CF0]/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6B7A90] hover:text-[#00225A] cursor-pointer"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Redirect URI */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#6B7A90] uppercase font-mono tracking-wider">
                  Redirect URI (Configured in Developer Portal)
                </label>
                <button
                  type="button"
                  onClick={() => copyToClipboard(redirectUri, 'Redirect URI')}
                  className="text-[10px] text-[#536CF0] hover:text-[#00225A] flex items-center gap-1 font-mono active:scale-95 transition-transform cursor-pointer"
                >
                  {copiedField === 'Redirect URI' ? <Check className="w-3 h-3 text-[#12B76A]" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              </div>
              <input
                type="text"
                value={redirectUri}
                onChange={(e) => setRedirectUri(e.target.value)}
                className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#111114] focus:outline-none focus:border-[#536CF0] focus:bg-white focus:ring-2 focus:ring-[#536CF0]/10 transition-all"
              />
            </div>

            {/* Access Token (Bearer Token) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-[#6B7A90] uppercase font-mono tracking-wider">
                    Access Token (Bearer Token)
                  </label>
                  {accessToken && (
                    <span className="text-[10px] text-[#12B76A] flex items-center gap-1.5 font-mono font-semibold bg-[#12B76A]/10 px-2 py-0.5 rounded-md border border-[#12B76A]/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A] animate-pulse" />
                      Active Token Loaded
                    </span>
                  )}
                </div>

                {accessToken && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(accessToken, 'Access Token')}
                    className="text-[10px] text-[#536CF0] hover:text-[#00225A] flex items-center gap-1 font-mono active:scale-95 transition-transform cursor-pointer"
                  >
                    {copiedField === 'Access Token' ? <Check className="w-3 h-3 text-[#12B76A]" /> : <Copy className="w-3 h-3" />}
                    <span>Copy Token</span>
                  </button>
                )}
              </div>

              {isExchangingCode && (
                <div className="mb-3 p-3 bg-[#EEF3FF] border border-[#D9E2F2] rounded-xl flex items-center gap-2.5 text-xs text-[#00225A]">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#536CF0]" />
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
                    className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl px-3.5 pr-10 py-2.5 text-xs font-mono text-[#111114] focus:outline-none focus:border-[#536CF0] focus:bg-white focus:ring-2 focus:ring-[#536CF0]/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6B7A90] hover:text-[#00225A] cursor-pointer"
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleTestConnection()}
                    disabled={isTesting}
                    className="py-2.5 px-3.5 text-xs font-semibold font-mono rounded-xl border border-[#D9E2F2] bg-white hover:bg-[#F7F8FA] text-[#00225A] active:scale-[0.96] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    title="Test gateway connection"
                  >
                    <Activity className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-[#536CF0]' : 'text-[#12B76A]'}`} />
                    <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOAuthConnect}
                    className="py-2.5 px-4 text-xs font-semibold font-mono rounded-xl bg-[#00225A] hover:bg-[#536CF0] text-white shadow-xs active:scale-[0.96] transition-transform flex items-center cursor-pointer"
                    title="Authorize and auto-generate Token"
                  >
                    <span>Authorize 1-Click</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-[#6B7A90] mt-2">
                Exchange security protocols require access tokens to be re-authorized periodically. Click <strong>Authorize 1-Click</strong> to auto-generate a daily session token or paste an existing token.
              </p>

              {/* Diagnostic Result Card */}
              {testResult && (
                <div
                  className={`mt-3.5 p-4 rounded-xl border text-xs flex items-start gap-3 transition-all animate-in fade-in duration-200 ${
                    testResult.success
                      ? 'bg-[#12B76A]/10 border-[#12B76A]/20 text-[#12B76A]'
                      : 'bg-[#D92D20]/10 border-[#D92D20]/20 text-[#D92D20]'
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
                      <span className="text-[11px] opacity-80 tabular-nums">{testResult.latencyMs}ms</span>
                    </div>
                    <p className="text-[11px] opacity-90">{testResult.message}</p>
                    {testResult.ltp && testResult.ltp > 0 && (
                      <p className="text-[11px] font-mono text-[#111114] pt-1 border-t border-[#D9E2F2]">
                        Live Sample Tick (NIFTY 50): <strong className="text-[#12B76A] tabular-nums">₹{testResult.ltp.toFixed(2)}</strong>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Market Data Mode Switcher in Segmented Control */}
            <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#D9E2F2] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-[#00225A] uppercase font-mono tracking-wider">
                  Market Data Provider Mode
                </p>
                <p className="text-[11px] text-[#6B7A90] mt-0.5">
                  Toggle between high-fidelity deterministic simulation or live direct exchange stream.
                </p>
              </div>

              <div className="p-1 rounded-xl inline-flex gap-1 self-start sm:self-auto bg-white border border-[#D9E2F2] shadow-xs">
                <button
                  type="button"
                  onClick={() => setMode('DEMO')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
                    mode === 'DEMO' ? 'bg-[#00225A] text-white shadow-xs' : 'text-[#6B7A90] hover:text-[#00225A]'
                  }`}
                >
                  DEMO MODE
                </button>
                <button
                  type="button"
                  onClick={() => setMode('LIVE')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
                    mode === 'LIVE' ? 'bg-[#00225A] text-white shadow-xs' : 'text-[#6B7A90] hover:text-[#00225A]'
                  }`}
                >
                  DIRECT LIVE
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="py-2.5 px-6 text-xs font-bold tracking-wider rounded-xl bg-[#00225A] hover:bg-[#536CF0] text-white shadow-xs active:scale-[0.96] transition-transform cursor-pointer"
              >
                Save Configuration & Reconnect
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── 3. Simulation Engine Tuning Card ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#D9E2F2] shadow-[0_2px_12px_rgba(0,34,90,0.04)] p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-[#D9E2F2]">
          <div className="w-10 h-10 rounded-2xl bg-[#F7F8FA] border border-[#D9E2F2] flex items-center justify-center shrink-0 shadow-xs">
            <Sliders className="w-5 h-5 text-[#00225A]" />
          </div>
          <div>
            <h2 className="text-base font-display font-bold text-[#00225A] tracking-tight">
              Simulation Engine Tuning
            </h2>
            <p className="text-xs text-[#6B7A90]">
              Calibrate simulated execution slippage and market fill parameters across Indian scrips
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Simulated Slippage Slider */}
          <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#D9E2F2] space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#00225A]">Simulated Slippage (BPS)</span>
              <span className="font-mono text-[#00225A] font-semibold px-2 py-0.5 rounded-md bg-white border border-[#D9E2F2] tabular-nums shadow-xs">
                {slippageBps} bps ({(slippageBps * 0.01).toFixed(2)}%)
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={slippageBps}
              onChange={(e) => setSlippageBps(parseInt(e.target.value) || 0)}
              className="w-full accent-[#00225A] cursor-pointer"
            />
            <p className="text-[10.5px] text-[#6B7A90]">
              Simulates realistic order book bid-ask spread impact on market order fills.
            </p>
          </div>

          {/* After-Hours Fills Toggle */}
          <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#D9E2F2] flex items-center justify-between">
            <div className="pr-4">
              <p className="text-xs font-bold text-[#00225A]">Allow After-Hours Market Fills</p>
              <p className="text-[10.5px] text-[#6B7A90] mt-0.5">
                Enables simulated paper fills outside standard 09:15 - 15:30 IST market hours for weekend strategy testing.
              </p>
            </div>
            <input
              type="checkbox"
              checked={allowAfterHours}
              onChange={(e) => setAllowAfterHours(e.target.checked)}
              className="w-4 h-4 rounded border-[#D9E2F2] text-[#00225A] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#00225A]"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleSaveSimulationSettings}
            className="py-2 px-5 text-xs font-semibold tracking-wider rounded-xl bg-[#00225A] hover:bg-[#536CF0] text-white shadow-xs active:scale-[0.96] transition-transform cursor-pointer"
          >
            Save Simulation Parameters
          </button>
        </div>
      </div>

      {/* ── 4. Virtual Capital & Portfolio Reset Card ───────────────────── */}
      <div className="bg-white rounded-2xl border border-[#D92D20]/25 shadow-[0_2px_12px_rgba(217,45,32,0.04)] p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#D92D20]/10 border border-[#D92D20]/20 flex items-center justify-center shrink-0 shadow-xs">
            <RotateCcw className="w-5 h-5 text-[#D92D20]" />
          </div>
          <div>
            <h2 className="text-base font-display font-bold text-[#D92D20] tracking-tight">
              Reset Virtual Portfolio Balance
            </h2>
            <p className="text-xs text-[#6B7A90]">
              Restore starting virtual margin back to ₹10,00,000 and clear simulated trading history
            </p>
          </div>
        </div>

        <p className="text-xs text-[#6B7A90] leading-relaxed">
          Resetting your account will square off all active positions, cancel pending orders, reset virtual cash to ₹10,00,000, and append an auditable reset event to your ledger statement.
        </p>

        <div className="pt-1">
          <button
            type="button"
            onClick={onOpenReset}
            className="px-4 py-2.5 rounded-xl bg-[#D92D20] hover:bg-[#B42318] text-white text-xs font-bold font-mono transition-all active:scale-[0.96] shadow-xs cursor-pointer"
          >
            Reset to ₹10,00,000 Virtual Funds
          </button>
        </div>
      </div>
    </div>
  );
}
