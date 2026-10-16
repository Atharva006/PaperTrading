import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { useTradingStore } from './store/useTradingStore';
import { marketDataService } from './services/market/MarketDataService';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Paper Trading Pages
import Dashboard from './pages/Dashboard';
import MarketWatchPage from './pages/MarketWatchPage';
import TerminalPage from './pages/TerminalPage';
import DerivativesExplorerPage from './pages/DerivativesExplorerPage';
import CommoditiesPage from './pages/CommoditiesPage';
import OptionChainPage from './pages/OptionChainPage';
import PositionsPage from './pages/PositionsPage';
import HoldingsPage from './pages/HoldingsPage';
import OrdersPage from './pages/OrdersPage';
import TradebookPage from './pages/TradebookPage';
import PortfolioPage from './pages/PortfolioPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

// Legacy pages preserved
import Journal from './pages/Journal';
import Calendar from './pages/Calendar';
import Accounts from './pages/Accounts';
import Screenshots from './pages/Screenshots';

function App() {
  const { init } = useTradingStore();
  const [isResetOpen, setIsResetOpen] = useState(false);

  useEffect(() => {
    let active = true;

    if (!isSupabaseConfigured) {
      init();
      return;
    }

    try {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!active) return;
        if (session?.user) {
          init(session.user.id, session.user.email, session.user.user_metadata?.full_name);
        } else {
          init();
        }
      }).catch(() => {
        if (active) init();
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          init(session.user.id, session.user.email, session.user.user_metadata?.full_name);
        }
      });

      return () => {
        active = false;
        subscription.unsubscribe();
      };
    } catch {
      init();
    }
  }, [init]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Layout for Landing and Login */}
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Paper Trading Terminal Dashboard Layout */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="watchlist" element={<MarketWatchPage />} />
          <Route path="terminal" element={<TerminalPage />} />
          <Route path="derivatives" element={<DerivativesExplorerPage />} />
          <Route path="commodities" element={<CommoditiesPage />} />
          <Route path="option-chain" element={<OptionChainPage />} />
          <Route path="positions" element={<PositionsPage />} />
          <Route path="holdings" element={<HoldingsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="tradebook" element={<TradebookPage />} />
          <Route path="portfolio" element={<PortfolioPage onOpenReset={() => setIsResetOpen(true)} />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage onOpenReset={() => setIsResetOpen(true)} />} />

          {/* Preserved legacy routes */}
          <Route path="journal" element={<Journal />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="screenshots" element={<Screenshots />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
