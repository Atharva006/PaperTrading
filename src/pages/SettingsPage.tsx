import React, { useState, useEffect } from 'react';
import { useTradingStore } from '../store/useTradingStore';
import { marketDataService } from '../services/market/MarketDataService';
import { tradingRepo } from '../services/storage/SupabaseTradingRepo';
import { 
  Settings, Key, ExternalLink, ShieldCheck, CheckCircle2, RotateCcw, AlertTriangle, Sliders, Server, Zap, Activity, RefreshCw 
} from 'lucide-react';

interface SettingsPageProps {
  onOpenReset: () => void;
}

export default function SettingsPage({ onOpenReset }: SettingsPageProps) {
  const { userSettings, addToast } = useTradingStore();

  const [apiKey, setApiKey] = useState(userSettings?.upstox_api_key || import.meta.env.VITE_UPSTOX_API_KEY || '');
  const [apiSecret, setApiSecret] = useState(userSettings?.upstox_api_secret || import.meta.env.VITE_UPSTOX_API_SECRET || '');
  const [accessToken, setAccessToken] = useState(userSettings?.upstox_access_token || import.meta.env.VITE_UPSTOX_ACCESS_TOKEN || '');
  const [redirectUri, setRedirectUri] = useState(userSettings?.upstox_redirect_uri || 'http://localhost:5173/dashboard/settings');

  const [mode, setMode] = useState<'LIVE' | 'DEMO'>(marketDataService.getMode());
  const [slippageBps, setSlippageBps] = useState(userSettings?.simulated_slippage_bps || 5);
  const [allowAfterHours, setAllowAfterHours] = useState(userSettings?.allow_after_hours_fill ?? true);

  const [environment, setEnvironment] = useState<'PRODUCTION' | 'SANDBOX'>(() => {
    return (localStorage.getItem('tradeedge_upstox_env') as 'PRODUCTION' | 'SANDBOX') || 'PRODUCTION';
  });

  const [isExchangingCode, setIsExchangingCode] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs: number; ltp?: number } | null>(null);

  const hasExchangedRef = React.useRef(false);

  // Automatically detect and exchange Upstox OAuth authorization code from URL redirect (?code=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (!code || hasExchangedRef.current) return;

    hasExchangedRef.current = true;
    // Immediately clear code from browser URL so it cannot be re-sent or re-exchanged on refresh
    window.history.replaceState({}, '', window.location.pathname);

    const exchangeCode = async () => {
      setIsExchangingCode(true);
      addToast('info', 'Upstox Authorization', 'Detected authorization code. Exchanging for live access token...');

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

        addToast('success', 'Upstox Live Connected!', 'Bearer access token generated. Live exchange quotes active.');
        handleTestConnection(res.access_token);
      } else {
        addToast('error', 'Token Exchange Failed', res.error || 'Could not exchange authorization code.');
      }
      setIsExchangingCode(false);
    };

    exchangeCode();
  }, []);

  const handleTestConnection = async (tokenToTest?: string) => {
    setIsTesting(true);
    setTestResult(null);

    const activeToken = tokenToTest || accessToken;
    marketDataService.setUpstoxCredentials(apiKey, apiSecret, activeToken);

    const result = await marketDataService.testUpstoxConnection();
    setTestResult(result);
    setIsTesting(false);

    if (result.success) {
      addToast('success', 'Connection Verified', `Connected to Upstox Live in ${result.latencyMs}ms! NIFTY 50 LTP: ₹${result.ltp?.toFixed(2)}`);
    } else {
      addToast('warning', 'Upstox Disconnected', result.message);
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

    addToast('success', 'Settings Saved', 'Market data configuration and simulation parameters updated.');

    if (mode === 'LIVE' && accessToken) {
      handleTestConnection();
    }
  };

  const handleOAuthConnect = () => {
    if (!apiKey) {
      addToast('error', 'API Key Required', 'Please enter your Upstox API Key (Client ID) before initiating authorization.');
      return;
    }
    const authUrl = `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${encodeURIComponent(apiKey)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = authUrl;
  };

  return (
    <div className="space-y-5 pb-12 max-w-4xl mx-auto select-none font-sans">
      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#242424] flex items-center justify-between">
        <div>
          <h2 className="text-lg font-cinzel font-bold text-[#F5F5F5] tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#D4AF65]" />
            <span>Settings & Market API Configuration</span>
          </h2>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Configure Upstox developer credentials, manage real-time feeds, and calibrate simulation slippage · CNRX
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#242424] bg-[#080808] text-xs">
          <Server className="w-3.5 h-3.5 text-[#D4AF65]" />
          <span className="text-[#71717A]">Active Provider:</span>
          <span className="font-bold text-[#F5F5F5] font-mono">{marketDataService.providerName}</span>
        </div>
      </div>

      {/* ── Upstox API Credentials Card ─────────────────────────────────── */}
      <div className="p-5 rounded-xl bg-[#0D0D0D] border border-[#242424] space-y-5">
        <div className="flex items-start justify-between pb-4 border-b border-[#242424]">
          <div>
            <h3 className="text-sm font-bold text-[#F5F5F5] flex items-center gap-2">
              <Key className="w-4 h-4 text-[#D4AF65]" />
              <span>Upstox API v2 Credentials</span>
            </h3>
            <p className="text-xs text-[#71717A] mt-0.5">
              Connect your official Upstox Developer App to stream live quotes, commodities, and option chains
            </p>
          </div>

          <a
            href="https://upstox.com/developer/api-documentation/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#D4AF65] hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Upstox Docs</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <form onSubmit={handleSaveCredentials} className="space-y-4">
          {/* Environment Selector (Production vs Sandbox) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-[#080808] rounded-lg border border-[#191919]">
            <div>
              <span className="text-xs font-semibold text-[#F5F5F5]">Upstox Environment</span>
              <p className="text-[11px] text-[#71717A]">Match your developer account app type (Live Account or Sandbox)</p>
            </div>
            <div className="flex gap-1.5 bg-[#0D0D0D] p-1 rounded-md border border-[#242424] self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setEnvironment('PRODUCTION');
                  marketDataService.setEnvironment('PRODUCTION');
                }}
                className={`px-3 py-1 text-xs font-bold rounded transition-colors ${environment === 'PRODUCTION' ? 'bg-[#D4AF65] text-[#030303]' : 'text-[#71717A] hover:text-[#F5F5F5]'}`}
              >
                Live Production
              </button>
              <button
                type="button"
                onClick={() => {
                  setEnvironment('SANDBOX');
                  marketDataService.setEnvironment('SANDBOX');
                }}
                className={`px-3 py-1 text-xs font-bold rounded transition-colors ${environment === 'SANDBOX' ? 'bg-[#60A5FA] text-[#030303]' : 'text-[#71717A] hover:text-[#F5F5F5]'}`}
              >
                Sandbox
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                Upstox API Key (Client ID)
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="e.g. 52f9a721-..."
                className="w-full bg-[#080808] border border-[#242424] rounded-lg px-3.5 py-2 text-xs font-mono text-[#F5F5F5] focus:outline-none focus:border-[#D4AF65]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                Upstox API Secret
              </label>
              <input
                type="password"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="••••••••••••••••••••••••"
                className="w-full bg-[#080808] border border-[#242424] rounded-lg px-3.5 py-2 text-xs font-mono text-[#F5F5F5] focus:outline-none focus:border-[#D4AF65]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
              Redirect URI (Configured in Upstox Developer Portal)
            </label>
            <input
              type="text"
              value={redirectUri}
              onChange={(e) => setRedirectUri(e.target.value)}
              className="w-full bg-[#080808] border border-[#242424] rounded-lg px-3.5 py-2 text-xs font-mono text-[#F5F5F5] focus:outline-none focus:border-[#D4AF65]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#A1A1AA]">
                Access Token (Bearer Token)
              </label>
              {accessToken && (
                <span className="text-[10px] text-[#00C087] flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00C087] animate-pulse" />
                  Token Loaded
                </span>
              )}
            </div>

            {isExchangingCode && (
              <div className="mb-3 p-3 bg-[#D4AF65]/10 border border-[#D4AF65]/30 rounded-lg flex items-center gap-2.5 text-xs text-[#D4AF65]">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Exchanging Upstox authorization code for live token...</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="eyJhbGciOiJSUzI1NiIsInR5cCI6..."
                className="flex-1 bg-[#080808] border border-[#242424] rounded-lg px-3.5 py-2 text-xs font-mono text-[#F5F5F5] focus:outline-none focus:border-[#D4AF65]"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleTestConnection()}
                  disabled={isTesting}
                  className="btn-cendrix-outline py-2 px-3 text-xs"
                  title="Test Upstox API connection"
                >
                  <Activity className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-[#D4AF65]' : 'text-[#00C087]'}`} />
                  <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOAuthConnect}
                  className="btn-cendrix-gold py-2 px-3 text-xs"
                  title="Login to Upstox and auto-generate Token"
                >
                  <span>Authorize 1-Click</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
            </div>

            <p className="text-[11px] text-[#71717A] mt-1.5">
              SEBI regulations require Upstox access tokens to be generated daily. Either click <strong>Authorize 1-Click</strong> or paste a token copied from your Upstox Developer Portal.
            </p>

            {/* Diagnostic Result Card */}
            {testResult && (
              <div className={`mt-3 p-3.5 rounded-lg border text-xs flex items-start gap-3 transition-all ${
                testResult.success 
                  ? 'bg-[#00C087]/10 border-[#00C087]/30 text-[#00C087]'
                  : 'bg-[#FF4D67]/10 border-[#FF4D67]/30 text-[#FF4D67]'
              }`}>
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{testResult.success ? 'Upstox Live Connected' : 'Upstox Connection Failed'}</span>
                    <span className="font-mono text-[11px] opacity-80">{testResult.latencyMs}ms</span>
                  </div>
                  <p className="text-[11px] mt-0.5 opacity-90">{testResult.message}</p>
                  {testResult.ltp && testResult.ltp > 0 && (
                    <p className="text-[11px] mt-1 font-mono text-[#F5F5F5]">
                      Live Sample Quote — NIFTY 50: <span className="font-bold text-[#00C087]">₹{testResult.ltp.toFixed(2)}</span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mode Switcher */}
          <div className="p-4 bg-[#080808] rounded-lg border border-[#191919] flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#F5F5F5]">Market Data Provider Mode</p>
              <p className="text-[11px] text-[#71717A]">
                When Demo mode is active, realistic deterministic Indian stock quotes and option chains will be simulated.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-[#0D0D0D] p-1 rounded-md border border-[#242424]">
              <button
                type="button"
                onClick={() => setMode('DEMO')}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                  mode === 'DEMO' ? 'bg-[#D4AF65] text-[#030303]' : 'text-[#71717A] hover:text-[#F5F5F5]'
                }`}
              >
                DEMO MODE
              </button>
              <button
                type="button"
                onClick={() => setMode('LIVE')}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                  mode === 'LIVE' ? 'bg-[#00C087] text-[#030303]' : 'text-[#71717A] hover:text-[#F5F5F5]'
                }`}
              >
                UPSTOX LIVE
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-cendrix-gold py-2.5 px-5 text-xs font-bold"
          >
            Save Settings & Reconnect
          </button>
        </form>
      </div>

      {/* ── Trading Simulator Tuning ─────────────────────────────────────── */}
      <div className="p-5 rounded-xl bg-[#0D0D0D] border border-[#242424] space-y-4">
        <h3 className="text-sm font-bold text-[#F5F5F5] flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#D4AF65]" />
          <span>Paper Trading Simulation Engine Tuning</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#080808] rounded-lg border border-[#191919] space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#F5F5F5]">Simulated Slippage (BPS)</span>
              <span className="font-mono text-[#D4AF65] font-bold">{slippageBps} bps ({(slippageBps * 0.01).toFixed(2)}%)</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={slippageBps}
              onChange={(e) => setSlippageBps(parseInt(e.target.value) || 0)}
              className="w-full accent-[#D4AF65]"
            />
            <p className="text-[10px] text-[#71717A]">Simulates order book depth impact on market order execution fills.</p>
          </div>

          <div className="p-4 bg-[#080808] rounded-lg border border-[#191919] flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#F5F5F5]">Allow After-Hours Market Fills</p>
              <p className="text-[10px] text-[#71717A]">Allows testing simulated market fills outside 9:15 - 15:30 IST.</p>
            </div>
            <input
              type="checkbox"
              checked={allowAfterHours}
              onChange={(e) => setAllowAfterHours(e.target.checked)}
              className="w-4 h-4 accent-[#D4AF65]"
            />
          </div>
        </div>
      </div>

      {/* ── Reset Paper Account Section ─────────────────────────────────── */}
      <div className="p-5 rounded-xl bg-[#0D0D0D] border border-[#FF4D67]/30 space-y-3">
        <h3 className="text-sm font-bold text-[#FF4D67] flex items-center gap-2">
          <RotateCcw className="w-4 h-4" />
          <span>Reset Virtual Paper Balance</span>
        </h3>
        <p className="text-xs text-[#A1A1AA] leading-relaxed">
          Restore your virtual balance back to the starting ₹10,00,000.00. This will square off all active open positions, cancel pending orders, and append an auditable reset event to your ledger.
        </p>
        <button
          onClick={onOpenReset}
          className="px-4 py-2 bg-[#FF4D67]/15 hover:bg-[#FF4D67] text-[#FF4D67] hover:text-white text-xs font-bold rounded-lg border border-[#FF4D67]/30 transition-colors"
        >
          Reset to ₹10,00,000 Virtual Funds
        </button>
      </div>
    </div>
  );
}
