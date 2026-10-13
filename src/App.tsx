/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/common/Header';
import { CustomerPortal } from './components/customer/CustomerPortal';
import { ShopOwnerDashboard } from './components/dashboard/ShopOwnerDashboard';
import { SuperAdminDashboard } from './components/superadmin/SuperAdminDashboard';
import { ArchitectureDocsModal } from './components/docs/ArchitectureDocsModal';

const AppContent: React.FC = () => {
  const { currentView } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {currentView === 'customer' && <CustomerPortal />}
        {currentView === 'owner' && <ShopOwnerDashboard />}
        {currentView === 'superadmin' && <SuperAdminDashboard />}
        {currentView === 'docs' && <ArchitectureDocsModal />}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/90 py-4 px-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className="text-slate-400">TableTap B2B SaaS</strong> · Smart QR Table-Top Customer Portal & Operating System
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Multi-Tenant · No App Download Required · Zero NFC Needed
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
