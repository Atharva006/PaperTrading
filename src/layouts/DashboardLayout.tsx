import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTradingStore } from '../store/useTradingStore';
import { Sidebar } from '../components/common/Sidebar';
import { Header } from '../components/common/Header';
import { OrderTicket } from '../components/trading/OrderTicket';
import { ToastContainer } from '../components/common/ToastContainer';
import { ResetAccountModal } from '../components/common/ResetAccountModal';
import { QuickSearchModal } from '../components/trading/QuickSearchModal';

export default function DashboardLayout() {
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0B1424] text-[#F5F5F2] font-sans selection:bg-[#C6A15B] selection:text-[#0B1424]">
      {/* Persistent Sidebar */}
      <Sidebar onOpenReset={() => setIsResetOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header Ticker Ribbon */}
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenReset={() => setIsResetOpen(true)}
        />

        {/* Scrollable Page Outlet */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide">
          <Outlet />
        </main>
      </div>

      {/* Modals & Portals */}
      <OrderTicket />
      <ResetAccountModal isOpen={isResetOpen} onClose={() => setIsResetOpen(false)} />
      <QuickSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <ToastContainer />
    </div>
  );
}
