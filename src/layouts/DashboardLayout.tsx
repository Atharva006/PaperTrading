import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { MasterNavbar } from '../components/navigation/MasterNavbar';
import { MobileNavDrawer } from '../components/navigation/MobileNavDrawer';
import { CommandPalette } from '../components/common/CommandPalette';
import { OrderTicket } from '../components/trading/OrderTicket';
import { ToastContainer } from '../components/common/ToastContainer';
import { ResetAccountModal } from '../components/common/ResetAccountModal';
import { ZerodhaMarketWatch } from '../components/trading/ZerodhaMarketWatch';

export default function DashboardLayout() {
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobileWatchlistOpen, setIsMobileWatchlistOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0d14] text-[#f0f3f8] font-sans selection:bg-[#387ed1] selection:text-[#ffffff]">
      {/* ── 1. Zerodha Kite Top Navigation Bar ────────────────────────────── */}
      <MasterNavbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenReset={() => setIsResetOpen(true)}
        onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
        isMobileNavOpen={isMobileNavOpen}
      />

      {/* ── 2. Authentic Zerodha Kite Split Layout: MarketWatch + Workspace ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Persistent Left MarketWatch on Desktop (lg+ screens) */}
        <aside className="hidden lg:block w-[360px] xl:w-[400px] shrink-0 h-[calc(100vh-56px)] sticky top-14 overflow-hidden border-r border-[#1e2638] bg-[#10141e] z-10">
          <ZerodhaMarketWatch />
        </aside>

        {/* Main Content Workspace (Scrolls independently) */}
        <main className="flex-1 min-w-0 h-[calc(100vh-56px)] overflow-y-auto px-4 sm:px-6 py-5 bg-[#0a0d14]">
          <Outlet />
        </main>
      </div>

      {/* ── 3. Mobile Navigation Drawer ─────────────────────────────────── */}
      <MobileNavDrawer
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        onOpenReset={() => setIsResetOpen(true)}
      />

      {/* ── 4. Global Modals, Zerodha Order Window & Command Palette ────── */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onOpenReset={() => setIsResetOpen(true)}
      />
      <OrderTicket />
      <ResetAccountModal isOpen={isResetOpen} onClose={() => setIsResetOpen(false)} />
      <ToastContainer />
    </div>
  );
}
