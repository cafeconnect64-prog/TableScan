import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  QrCode,
  Store,
  ShieldAlert,
  Layers,
  Smartphone,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { AppViewMode } from '../../types';

export const Header: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    activeTenant,
    tenants,
    setActiveTenantId,
    selectedTable,
  } = useStore();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
            <QrCode className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-100">
                Table<span className="text-amber-500">Tap</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 hidden sm:inline-block">
                B2B SaaS
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono hidden md:block">
              Multi-Tenant Table-Top QR Portal
            </div>
          </div>
        </div>

        {/* View / Role Switcher Tabs */}
        <nav className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
          <button
            onClick={() => setCurrentView('customer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              currentView === 'customer'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Customer Scan</span>
          </button>

          <button
            onClick={() => setCurrentView('owner')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              currentView === 'owner'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Shop Owner Portal</span>
          </button>

          <button
            onClick={() => setCurrentView('superadmin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              currentView === 'superadmin'
                ? 'bg-indigo-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
            <span>Super Admin</span>
          </button>

          <button
            onClick={() => setCurrentView('docs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              currentView === 'docs'
                ? 'bg-emerald-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-300" />
            <span>Architecture & Schema</span>
          </button>
        </nav>

        {/* Current Tenant Badge (Right) */}
        <div className="hidden lg:flex items-center gap-2 text-xs">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeTenant.themeColor }} />
          <span className="text-slate-300 font-medium truncate max-w-[140px]">{activeTenant.name}</span>
          <span className="text-slate-500 font-mono text-[11px]">(Tbl {selectedTable})</span>
        </div>
      </div>
    </header>
  );
};
