import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { MasterNavbar } from '../components/navigation/MasterNavbar';
import { MobileNavDrawer } from '../components/navigation/MobileNavDrawer';
import { CommandPalette } from '../components/common/CommandPalette';
import { OrderTicket } from '../components/trading/OrderTicket';
import { ToastContainer } from '../components/common/ToastContainer';
import { ResetAccountModal } from '../components/common/ResetAccountModal';
import { MarketWatch } from '../components/trading/MarketWatch';
import { BeginnerGuideModal } from '../components/common/BeginnerGuideModal';

export default function DashboardLayout() {
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFCFC] text-[#111114] font-sans selection:bg-[#536CF0] selection:text-white overflow-x-hidden antialiased">
      {/* ── 1. FundingPips Top Navigation Bar ──────────────────────────────── */}
      <MasterNavbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenReset={() => setIsResetOpen(true)}
        onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
        isMobileNavOpen={isMobileNavOpen}
      />

      {/* ── 2. Split Layout: Persistent MarketWatch + Fluid Workspace ──────── */}
      <div className="flex-1 flex overflow-hidden w-full max-w-full">
        {/* Persistent Left MarketWatch on Desktop */}
        <aside className="hidden lg:block w-[320px] xl:w-[350px] shrink-0 h-[calc(100vh-56px)] sticky top-14 overflow-hidden border-r border-[#D9E2F2] bg-[#FFFFFF] z-10 shadow-[1px_0_4px_rgba(0,34,90,0.02)]">
          <MarketWatch />
        </aside>

        {/* Main Content Workspace */}
        <main className="flex-1 min-w-0 h-[calc(100vh-56px)] overflow-y-auto overflow-x-hidden px-4 sm:px-8 py-6 bg-[#FCFCFC]">
          <Outlet />
        </main>
      </div>

      {/* ── 3. Mobile Navigation Drawer ─────────────────────────────────── */}
      <MobileNavDrawer
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        onOpenReset={() => setIsResetOpen(true)}
      />

      {/* ── 4. Global Modals, Order Window & Command Palette ─────────────── */}
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
