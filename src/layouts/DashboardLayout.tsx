import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { MasterNavbar } from '../components/navigation/MasterNavbar';
import { MobileNavDrawer } from '../components/navigation/MobileNavDrawer';
import { CommandPalette } from '../components/common/CommandPalette';
import { OrderTicket } from '../components/trading/OrderTicket';
import { ToastContainer } from '../components/common/ToastContainer';
import { ResetAccountModal } from '../components/common/ResetAccountModal';
import { ZerodhaMarketWatch } from '../components/trading/ZerodhaMarketWatch';
import { BeginnerGuideModal } from '../components/common/BeginnerGuideModal';

export default function DashboardLayout() {
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobileWatchlistOpen, setIsMobileWatchlistOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1424] text-[#F5F5F2] font-sans selection:bg-[#C6A15B] selection:text-[#0B1424] overflow-x-hidden">
      {/* ── 1. Cendrix Institutional Top Navigation Bar ────────────────────── */}
      <MasterNavbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenReset={() => setIsResetOpen(true)}
        onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
        isMobileNavOpen={isMobileNavOpen}
      />

      {/* ── 2. Cendrix Split Layout: MarketWatch + Workspace ───────────────── */}
      <div className="flex-1 flex overflow-hidden w-full max-w-full">
        {/* Persistent Left MarketWatch on Desktop (lg+ screens) */}
        <aside className="hidden lg:block w-[320px] xl:w-[350px] shrink-0 h-[calc(100vh-56px)] sticky top-14 overflow-hidden border-r border-[#14223A] bg-[#10141C] z-10">
          <ZerodhaMarketWatch />
        </aside>

        {/* Main Content Workspace (Scrolls independently without horizontal overflow) */}
        <main className="flex-1 min-w-0 h-[calc(100vh-56px)] overflow-y-auto overflow-x-hidden px-3 sm:px-6 py-5 bg-[#0B1424]">
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
      <BeginnerGuideModal onOpenSearch={() => setIsSearchOpen(true)} />
      <ToastContainer />
    </div>
  );
}
