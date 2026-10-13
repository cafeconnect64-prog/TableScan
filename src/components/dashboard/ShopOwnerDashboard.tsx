import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { StoreCustomizer } from './StoreCustomizer';
import { QrGenerator } from './QrGenerator';
import { MenuManager } from './MenuManager';
import { LoyaltyManager } from './LoyaltyManager';
import { FeedbackInbox } from './FeedbackInbox';
import { AnalyticsOverview } from './AnalyticsOverview';
import { KitchenOrdersManager } from './KitchenOrdersManager';
import { PaymentGatewaySettings } from './PaymentGatewaySettings';
import {
  Store,
  Palette,
  QrCode,
  BookOpen,
  Gift,
  MessageSquare,
  TrendingUp,
  Eye,
  ExternalLink,
  Printer,
  ChevronDown,
  ChefHat,
  UtensilsCrossed,
  CreditCard,
} from 'lucide-react';

export const ShopOwnerDashboard: React.FC = () => {
  const {
    activeTenant,
    tenants,
    setActiveTenantId,
    setCurrentView,
    selectedTable,
    feedback,
    orders,
    serviceRequests,
  } = useStore();

  const [activeTab, setActiveTab] = useState<
    'orders' | 'payments' | 'store' | 'qr' | 'menu' | 'loyalty' | 'feedback' | 'analytics'
  >('orders');

  const unreadFeedbackCount = feedback.filter((f) => f.status === 'new').length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const pendingServiceCount = serviceRequests.filter((r) => r.status !== 'completed').length;
  const totalKitchenAlerts = pendingOrdersCount + pendingServiceCount;

  return (
    <div className="space-y-6">
      {/* Dashboard Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg no-print">
        <div className="flex items-center gap-3">
          <img
            src={activeTenant.logoUrl}
            alt={activeTenant.name}
            className="w-12 h-12 rounded-xl object-cover border border-slate-700 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-100">{activeTenant.name}</h1>
              <span
                className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider text-slate-950"
                style={{ backgroundColor: activeTenant.themeColor }}
              >
                {activeTenant.plan}
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>{activeTenant.tagline}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-amber-400">/r/{activeTenant.slug}</span>
            </div>
          </div>
        </div>

        {/* Store Switcher & Quick Scan Action */}
        <div className="flex items-center gap-2.5">
          {/* Tenant Switcher dropdown */}
          <div className="relative">
            <select
              value={activeTenant.id}
              onChange={(e) => setActiveTenantId(e.target.value)}
              className="appearance-none px-3 py-2 pr-8 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-medium cursor-pointer"
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  Store: {t.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-3 text-slate-400 pointer-events-none" />
          </div>

          <button
            onClick={() => setCurrentView('customer')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md transition active:scale-95"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Simulate Customer Scan</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto no-print">
        {/* Live Orders (KDS) */}
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition relative ${
            activeTab === 'orders'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <ChefHat className="w-4 h-4" />
          <span>Live Orders (KDS)</span>
          {totalKitchenAlerts > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-rose-600 text-white animate-pulse">
              {totalKitchenAlerts}
            </span>
          )}
        </button>

        {/* Digital Payment Gateway */}
        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'payments'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Digital Payment Gateway</span>
        </button>

        <button
          onClick={() => setActiveTab('store')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'store'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Store Customization</span>
        </button>

        <button
          onClick={() => setActiveTab('qr')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'qr'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>QR & Printable Stands</span>
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'menu'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Digital Menu</span>
        </button>

        <button
          onClick={() => setActiveTab('loyalty')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'loyalty'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Loyalty & Punch Terminal</span>
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition relative ${
            activeTab === 'feedback'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Feedback Inbox</span>
          {unreadFeedbackCount > 0 && (
            <span
              className={`w-2 h-2 rounded-full ${
                activeTab === 'feedback' ? 'bg-slate-950' : 'bg-rose-500'
              }`}
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'analytics'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Analytics</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'orders' && <KitchenOrdersManager />}
        {activeTab === 'payments' && <PaymentGatewaySettings />}
        {activeTab === 'store' && <StoreCustomizer />}
        {activeTab === 'qr' && <QrGenerator />}
        {activeTab === 'menu' && <MenuManager />}
        {activeTab === 'loyalty' && <LoyaltyManager />}
        {activeTab === 'feedback' && <FeedbackInbox />}
        {activeTab === 'analytics' && <AnalyticsOverview />}
      </div>
    </div>
  );
};
