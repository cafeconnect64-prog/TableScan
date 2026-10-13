import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Users,
  CreditCard,
  QrCode,
  TrendingUp,
  Plus,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
  ArrowRight,
  Store,
  Power,
  Sliders,
  Bell,
  Wifi,
  BookOpen,
  MessageSquare,
  Gamepad2,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { SubscriptionPlan, Tenant } from '../../types';
import { SuperAdminBillingManager } from './SuperAdminBillingManager';

export const SuperAdminDashboard: React.FC = () => {
  const {
    tenants,
    setActiveTenantId,
    setCurrentView,
    createNewTenant,
    toggleTenantService,
    updateTenantById,
    resetToDefaultData,
  } = useStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<'tenants' | 'billing' | 'services'>('tenants');
  const [managingServicesTenantId, setManagingServicesTenantId] = useState<string | null>(null);
  const [serviceActionToast, setServiceActionToast] = useState<string | null>(null);

  const [newStoreData, setNewStoreData] = useState({
    name: '',
    slug: '',
    tagline: '',
    description: '',
    ownerName: '',
    ownerEmail: '',
    plan: 'pro' as SubscriptionPlan,
    themeColor: '#d97706',
    address: '',
    currency: '$',
  });

  // Calculate SaaS metrics
  const totalScans = tenants.reduce((acc, t) => acc + t.stats.totalScans, 0);
  const totalCards = tenants.reduce((acc, t) => acc + t.stats.loyaltyCardsIssued, 0);
  const totalFeedback = tenants.reduce((acc, t) => acc + t.stats.feedbackCount, 0);

  const planPricing: Record<SubscriptionPlan, number> = {
    starter: 19,
    pro: 49,
    enterprise: 99,
  };

  const estimatedMRR = tenants.reduce((acc, t) => acc + (planPricing[t.plan] || 0), 0);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreData.name || !newStoreData.slug) return;

    createNewTenant({
      name: newStoreData.name,
      slug: newStoreData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      tagline: newStoreData.tagline || 'Fresh flavors and cozy vibes',
      description: newStoreData.description || 'Welcome to our store!',
      logoUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=1200&auto=format&fit=crop&q=80',
      themeColor: newStoreData.themeColor,
      accentColor: '#0f172a',
      darkMode: true,
      plan: newStoreData.plan,
      planStatus: 'active',
      ownerName: newStoreData.ownerName || 'Store Manager',
      ownerEmail: newStoreData.ownerEmail || 'manager@example.com',
      address: newStoreData.address || '100 Main St',
      currency: newStoreData.currency || '$',
      features: {
        menu: true,
        ordering: true,
        loyalty: true,
        googleReviews: true,
        wifi: true,
        feedback: true,
        games: true,
      },
      socials: {
        instagram: '',
        googleMaps: '',
      },
      wifi: {
        enabled: true,
        ssid: `${newStoreData.name.replace(/\s+/g, '')}_Guest`,
        password: 'WelcomeGuest26',
        securityType: 'WPA',
        hidden: false,
      },
      loyalty: {
        enabled: true,
        stampsRequired: 8,
        rewardTitle: 'Free Signature Item or Beverage',
        terms: '1 stamp per purchase. Valid 90 days.',
        stampIcon: 'star',
        secretStaffPin: '1234',
      },
      payments: {
        enabled: true,
        provider: 'upi_direct',
        upiId: `${newStoreData.slug}@okhdfcbank`,
        upiPayeeName: newStoreData.name,
        enableAppleGooglePay: true,
        requirePrepayment: false,
        taxRatePercent: 8.0,
      },
      googleReviewUrl: 'https://maps.google.com',
    });

    setShowCreateModal(false);
    setNewStoreData({
      name: '',
      slug: '',
      tagline: '',
      description: '',
      ownerName: '',
      ownerEmail: '',
      plan: 'pro',
      themeColor: '#d97706',
      address: '',
      currency: '$',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950/60 border border-slate-700/60 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-100">Super Admin Multi-Tenant Control</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Global SaaS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live oversight across all B2B restaurant, café, and bar tenants. Manage subscriptions, table telemetry, and quotas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard New Tenant</span>
          </button>

          <button
            onClick={resetToDefaultData}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs border border-slate-700 transition"
            title="Reset to default mock dataset"
          >
            Reset Demo Data
          </button>
        </div>
      </div>

      {/* Global SaaS Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Active Tenants</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{tenants.length}</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
            <TrendingUp className="w-3 h-3" /> +100% platform uptime
          </div>
        </div>

        <div
          onClick={() => setActiveAdminTab('billing')}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md cursor-pointer hover:border-emerald-500/50 hover:bg-slate-900 transition group"
          title="Click to view full Billing & Plans Management"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="group-hover:text-emerald-300 font-medium transition">Monthly Recurring Revenue (MRR)</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">${estimatedMRR} <span className="text-xs font-normal text-slate-400">/mo</span></div>
          <div className="text-[11px] text-emerald-400/90 flex items-center justify-between mt-1">
            <span>Starter ($19) · Pro ($49) · Ent ($99)</span>
            <span className="text-[10px] underline text-indigo-300 group-hover:text-emerald-300">Manage Plans →</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total QR Table Scans</span>
            <QrCode className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{totalScans.toLocaleString()}</div>
          <div className="text-[11px] text-amber-400/90 mt-1">
            Real-time scans across table stands
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Customer Loyalty Cards Issued</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{totalCards.toLocaleString()}</div>
          <div className="text-[11px] text-purple-400/90 mt-1">
            {totalFeedback} customer feedback reviews
          </div>
        </div>
      </div>

      {/* Service Action Toast */}
      {serviceActionToast && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{serviceActionToast}</span>
          </div>
          <button
            onClick={() => setServiceActionToast(null)}
            className="text-emerald-400 hover:text-emerald-200 text-xs font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs: Tenants Registry vs Billing & API Limits vs Global Service Kill-Switch Control */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 flex-wrap">
        <button
          onClick={() => setActiveAdminTab('tenants')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeAdminTab === 'tenants'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Tenant Stores ({tenants.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('billing')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition relative ${
            activeAdminTab === 'billing'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <CreditCard className="w-4 h-4 text-emerald-300" />
          <span>Billing, Plans & API Limits (बिलिंग व API कोटा)</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-500/30 text-emerald-200 border border-emerald-500/40">
            Secure Passkey
          </span>
        </button>

        <button
          onClick={() => setActiveAdminTab('services')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition relative ${
            activeAdminTab === 'services'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Power className="w-4 h-4" />
          <span>Service Kill-Switch Terminal (सर्विस कंट्रोल)</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-rose-500/30 text-rose-200 border border-rose-500/40">
            Kill-Switch
          </span>
        </button>
      </div>

      {activeAdminTab === 'billing' ? (
        <SuperAdminBillingManager
          tenants={tenants}
          onUpdateTenant={updateTenantById}
          onSelectTenantForView={(tId) => {
            setActiveTenantId(tId);
            setCurrentView('owner');
          }}
        />
      ) : activeAdminTab === 'services' ? (
        /* Global Service Kill-Switch Matrix View */
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">
                  Super Admin Master Service Kill-Switch (एडमिन सर्विस बंद / चालू करने का अधिकार)
                </h3>
                <p className="text-xs text-slate-400">
                  Instantly disable Payment Gateway, Loyalty Punch Terminal, Waiter Bell, or Ordering for any tenant store.
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Live Control across all active restaurants
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tenants.map((t) => {
              const paymentActive = t.features?.payments ?? (t.payments?.enabled ?? true);
              const loyaltyActive = t.features?.loyalty ?? (t.loyalty?.enabled ?? true);
              const orderingActive = t.features?.ordering ?? true;
              const waiterBellActive = t.features?.serviceBell ?? true;
              const wifiActive = t.features?.wifi ?? (t.wifi?.enabled ?? true);
              const gamesActive = t.features?.games ?? true;
              const feedbackActive = t.features?.feedback ?? true;

              return (
                <div
                  key={t.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4 hover:border-slate-700 transition"
                >
                  {/* Store Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <img
                        src={t.logoUrl}
                        alt={t.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-100 text-sm">{t.name}</h4>
                          <span className="text-[10px] font-mono text-amber-400">/r/{t.slug}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {t.ownerName} · <span className="uppercase text-[10px] text-indigo-400 font-bold">{t.plan}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setActiveTenantId(t.id);
                          setCurrentView('owner');
                        }}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition"
                        title="Go to store dashboard"
                      >
                        Open Portal
                      </button>
                    </div>
                  </div>

                  {/* Individual Services Control Grid */}
                  <div className="space-y-2.5 text-xs">
                    {/* 1. Payment Gateway Service */}
                    <div className={`p-3 rounded-xl border transition flex items-center justify-between ${
                      paymentActive
                        ? 'bg-slate-950/70 border-slate-800'
                        : 'bg-rose-950/30 border-rose-500/40'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          paymentActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 font-semibold text-slate-200">
                            <span>Payment Gateway (ऑनलाइन पेमेंट)</span>
                            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                              paymentActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/30 text-rose-300 font-bold'
                            }`}>
                              {paymentActive ? 'Active' : 'Band (OFF)'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            UPI QR Direct, Cards & Apple/Google Pay table settlement
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          toggleTenantService(t.id, 'paymentGateway', !paymentActive);
                          setServiceActionToast(
                            `${t.name}: Payment Gateway service turned ${!paymentActive ? 'ON (चालू)' : 'OFF (बंद)'}`
                          );
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition active:scale-95 flex items-center gap-1 ${
                          paymentActive
                            ? 'bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40'
                            : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/30'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        <span>{paymentActive ? 'Band Karo' : 'Chalu Karo'}</span>
                      </button>
                    </div>

                    {/* 2. Loyalty & Punch Terminal */}
                    <div className={`p-3 rounded-xl border transition flex items-center justify-between ${
                      loyaltyActive
                        ? 'bg-slate-950/70 border-slate-800'
                        : 'bg-rose-950/30 border-rose-500/40'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          loyaltyActive ? 'bg-purple-500/20 text-purple-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 font-semibold text-slate-200">
                            <span>Loyalty & Punch Terminal (लॉयल्टी टर्मिनल)</span>
                            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                              loyaltyActive ? 'bg-purple-500/20 text-purple-300' : 'bg-rose-500/30 text-rose-300 font-bold'
                            }`}>
                              {loyaltyActive ? 'Active' : 'Band (OFF)'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Customer digital stamp cards & staff PIN punching
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          toggleTenantService(t.id, 'loyaltyTerminal', !loyaltyActive);
                          setServiceActionToast(
                            `${t.name}: Loyalty & Punch Terminal turned ${!loyaltyActive ? 'ON (चालू)' : 'OFF (बंद)'}`
                          );
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition active:scale-95 flex items-center gap-1 ${
                          loyaltyActive
                            ? 'bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40'
                            : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/30'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        <span>{loyaltyActive ? 'Band Karo' : 'Chalu Karo'}</span>
                      </button>
                    </div>

                    {/* 3. Table Ordering from Menu */}
                    <div className={`p-3 rounded-xl border transition flex items-center justify-between ${
                      orderingActive
                        ? 'bg-slate-950/70 border-slate-800'
                        : 'bg-rose-950/30 border-rose-500/40'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          orderingActive ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 font-semibold text-slate-200">
                            <span>Table-Side Ordering (टेबल से आर्डरिंग)</span>
                            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                              orderingActive ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/30 text-rose-300 font-bold'
                            }`}>
                              {orderingActive ? 'Active' : 'Band (OFF)'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Guests sending food orders directly to kitchen
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          toggleTenantService(t.id, 'ordering', !orderingActive);
                          setServiceActionToast(
                            `${t.name}: Table-side ordering turned ${!orderingActive ? 'ON (चालू)' : 'OFF (बंद)'}`
                          );
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition active:scale-95 flex items-center gap-1 ${
                          orderingActive
                            ? 'bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40'
                            : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/30'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        <span>{orderingActive ? 'Band Karo' : 'Chalu Karo'}</span>
                      </button>
                    </div>

                    {/* 4. Call Waiter & Service Bell */}
                    <div className={`p-3 rounded-xl border transition flex items-center justify-between ${
                      waiterBellActive
                        ? 'bg-slate-950/70 border-slate-800'
                        : 'bg-rose-950/30 border-rose-500/40'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          waiterBellActive ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          <Bell className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 font-semibold text-slate-200">
                            <span>Call Waiter & Service Bell (वेटर सर्विस घंटी)</span>
                            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                              waiterBellActive ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/30 text-rose-300 font-bold'
                            }`}>
                              {waiterBellActive ? 'Active' : 'Band (OFF)'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Water, bill, table cleaning request & audible chime
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          toggleTenantService(t.id, 'serviceBell', !waiterBellActive);
                          setServiceActionToast(
                            `${t.name}: Waiter Bell service turned ${!waiterBellActive ? 'ON (चालू)' : 'OFF (बंद)'}`
                          );
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition active:scale-95 flex items-center gap-1 ${
                          waiterBellActive
                            ? 'bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40'
                            : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/30'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        <span>{waiterBellActive ? 'Band Karo' : 'Chalu Karo'}</span>
                      </button>
                    </div>

                    {/* Quick Toggles: Wi-Fi, Games, Feedback */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Other Tenant Modules:</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleTenantService(t.id, 'wifi', !wifiActive)}
                          className={`px-2 py-1 rounded-lg border font-medium ${
                            wifiActive
                              ? 'bg-cyan-950/50 border-cyan-500/30 text-cyan-300'
                              : 'bg-slate-950 border-slate-800 text-slate-500 line-through'
                          }`}
                        >
                          Wi-Fi {wifiActive ? '✓' : '✗'}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleTenantService(t.id, 'games', !gamesActive)}
                          className={`px-2 py-1 rounded-lg border font-medium ${
                            gamesActive
                              ? 'bg-rose-950/50 border-rose-500/30 text-rose-300'
                              : 'bg-slate-950 border-slate-800 text-slate-500 line-through'
                          }`}
                        >
                          Games {gamesActive ? '✓' : '✗'}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleTenantService(t.id, 'feedback', !feedbackActive)}
                          className={`px-2 py-1 rounded-lg border font-medium ${
                            feedbackActive
                              ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300'
                              : 'bg-slate-950 border-slate-800 text-slate-500 line-through'
                          }`}
                        >
                          Feedback {feedbackActive ? '✓' : '✗'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Tenants Registry Table View */
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Tenant Store Registry</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage stores, monitor activity, or click "Manage Services" to turn off/on specific modules.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {tenants.length} Stores Provisioned
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Store / Brand</th>
                  <th className="py-3 px-4 font-semibold">Slug & URL</th>
                  <th className="py-3 px-4 font-semibold">Plan</th>
                  <th className="py-3 px-4 font-semibold">Owner</th>
                  <th className="py-3 px-4 font-semibold">Services Status (सर्विस स्थिति)</th>
                  <th className="py-3 px-4 font-semibold">Activity</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {tenants.map((tenant) => {
                  const paymentActive = tenant.features?.payments ?? (tenant.payments?.enabled ?? true);
                  const loyaltyActive = tenant.features?.loyalty ?? (tenant.loyalty?.enabled ?? true);
                  const orderingActive = tenant.features?.ordering ?? true;
                  const waiterBellActive = tenant.features?.serviceBell ?? true;

                  return (
                    <tr key={tenant.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={tenant.logoUrl}
                            alt={tenant.name}
                            className="w-8 h-8 rounded-lg object-cover border border-slate-700"
                          />
                          <div>
                            <div className="font-semibold text-slate-100">{tenant.name}</div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[180px]">{tenant.tagline}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        <span className="text-amber-400">/r/{tenant.slug}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => setActiveAdminTab('billing')}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition hover:scale-105 active:scale-95 ${
                            tenant.plan === 'enterprise'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:border-purple-400'
                              : tenant.plan === 'pro'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:border-blue-400'
                              : 'bg-slate-500/20 text-slate-300 border border-slate-500/30 hover:border-slate-400'
                          }`}
                          title="Click to manage subscription plan & quotas in Billing tab"
                        >
                          <span>{tenant.plan}</span>
                          <span className="text-[8px] opacity-70">⚙</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-200">{tenant.ownerName}</div>
                        <div className="text-[11px] text-slate-400">{tenant.ownerEmail}</div>
                      </td>

                      {/* Live Services Status Quick-Pills & Kill-Switch Trigger */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1.5 max-w-[240px]">
                          <button
                            type="button"
                            onClick={() => {
                              toggleTenantService(tenant.id, 'paymentGateway', !paymentActive);
                              setServiceActionToast(
                                `${tenant.name}: Payment Gateway turned ${!paymentActive ? 'ON' : 'OFF'}`
                              );
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition flex items-center gap-1 ${
                              paymentActive
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:border-emerald-400'
                                : 'bg-rose-500/20 border-rose-500/40 text-rose-300 font-bold'
                            }`}
                            title="Click to toggle Payment Gateway"
                          >
                            <CreditCard className="w-2.5 h-2.5" />
                            <span>Pay: {paymentActive ? 'ON' : 'OFF'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              toggleTenantService(tenant.id, 'loyaltyTerminal', !loyaltyActive);
                              setServiceActionToast(
                                `${tenant.name}: Loyalty Terminal turned ${!loyaltyActive ? 'ON' : 'OFF'}`
                              );
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition flex items-center gap-1 ${
                              loyaltyActive
                                ? 'bg-purple-500/10 border-purple-500/30 text-purple-300 hover:border-purple-400'
                                : 'bg-rose-500/20 border-rose-500/40 text-rose-300 font-bold'
                            }`}
                            title="Click to toggle Loyalty Terminal"
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>Loyalty: {loyaltyActive ? 'ON' : 'OFF'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              toggleTenantService(tenant.id, 'serviceBell', !waiterBellActive);
                              setServiceActionToast(
                                `${tenant.name}: Waiter Bell turned ${!waiterBellActive ? 'ON' : 'OFF'}`
                              );
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition flex items-center gap-1 ${
                              waiterBellActive
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:border-amber-400'
                                : 'bg-rose-500/20 border-rose-500/40 text-rose-300 font-bold'
                            }`}
                            title="Click to toggle Waiter Bell"
                          >
                            <Bell className="w-2.5 h-2.5" />
                            <span>Bell: {waiterBellActive ? 'ON' : 'OFF'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              toggleTenantService(tenant.id, 'ordering', !orderingActive);
                              setServiceActionToast(
                                `${tenant.name}: Table Ordering turned ${!orderingActive ? 'ON' : 'OFF'}`
                              );
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition flex items-center gap-1 ${
                              orderingActive
                                ? 'bg-blue-500/10 border-blue-500/30 text-blue-300 hover:border-blue-400'
                                : 'bg-rose-500/20 border-rose-500/40 text-rose-300 font-bold'
                            }`}
                            title="Click to toggle Table-Side Ordering"
                          >
                            <BookOpen className="w-2.5 h-2.5" />
                            <span>Order: {orderingActive ? 'ON' : 'OFF'}</span>
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div>{tenant.stats.totalScans.toLocaleString()} scans</div>
                        <div className="text-[11px] text-slate-400">{tenant.stats.loyaltyCardsIssued} loyalty cards</div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setActiveAdminTab('billing')}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 rounded-lg text-xs font-semibold border border-emerald-500/40 transition"
                            title="Manage subscription plans, invoices and API quotas"
                          >
                            <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Billing</span>
                          </button>

                          <button
                            onClick={() => setManagingServicesTenantId(tenant.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 rounded-lg text-xs font-semibold border border-rose-500/40 transition"
                            title="Manage & Suspend Services"
                          >
                            <Sliders className="w-3.5 h-3.5 text-rose-400" />
                            <span>Services</span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveTenantId(tenant.id);
                              setCurrentView('owner');
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
                            title="Open Shop Owner Dashboard"
                          >
                            <Store className="w-3.5 h-3.5 text-amber-400" />
                            <span>Manage</span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveTenantId(tenant.id);
                              setCurrentView('customer');
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded-lg text-xs font-medium border border-indigo-500/30 transition"
                            title="Test Customer Mobile Scan View"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Scan</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Onboard New Tenant Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-slate-100 text-base">Onboard New Restaurant / Café Tenant</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Business / Store Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Blue Bottle Roastery"
                  value={newStoreData.name || ''}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
                    setNewStoreData({ ...newStoreData, name, slug });
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Store URL Slug *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., blue-bottle"
                    value={newStoreData.slug || ''}
                    onChange={(e) => setNewStoreData({ ...newStoreData, slug: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">SaaS Subscription Tier</label>
                  <select
                    value={newStoreData.plan || 'pro'}
                    onChange={(e) => setNewStoreData({ ...newStoreData, plan: e.target.value as SubscriptionPlan })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="starter">Starter ($19/mo)</option>
                    <option value="pro">Pro ($49/mo)</option>
                    <option value="enterprise">Enterprise ($99/mo)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Owner Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Sarah Connor"
                    value={newStoreData.ownerName || ''}
                    onChange={(e) => setNewStoreData({ ...newStoreData, ownerName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Owner Email</label>
                  <input
                    type="email"
                    placeholder="sarah@example.com"
                    value={newStoreData.ownerEmail || ''}
                    onChange={(e) => setNewStoreData({ ...newStoreData, ownerEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Store Tagline</label>
                <input
                  type="text"
                  placeholder="e.g., Organic sourdough pizza & natural wines"
                  value={newStoreData.tagline || ''}
                  onChange={(e) => setNewStoreData({ ...newStoreData, tagline: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-md transition"
                >
                  Create & Launch Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Manage Services Detailed Modal */}
      {managingServicesTenantId && (() => {
        const tenant = tenants.find((t) => t.id === managingServicesTenantId);
        if (!tenant) return null;

        const paymentActive = tenant.features?.payments ?? (tenant.payments?.enabled ?? true);
        const loyaltyActive = tenant.features?.loyalty ?? (tenant.loyalty?.enabled ?? true);
        const orderingActive = tenant.features?.ordering ?? true;
        const waiterBellActive = tenant.features?.serviceBell ?? true;
        const wifiActive = tenant.features?.wifi ?? (tenant.wifi?.enabled ?? true);
        const gamesActive = tenant.features?.games ?? true;
        const feedbackActive = tenant.features?.feedback ?? true;
        const reviewsActive = tenant.features?.googleReviews ?? true;
        const menuActive = tenant.features?.menu ?? true;

        return (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                <div className="flex items-center gap-3">
                  <img
                    src={tenant.logoUrl}
                    alt={tenant.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-100 text-base">{tenant.name}</h3>
                      <span className="text-[10px] font-mono text-amber-400">/r/{tenant.slug}</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Super Admin Service Access & Kill-Switch Controls (एडमिन सर्विस कंट्रोल)
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setManagingServicesTenantId(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-800"
                >
                  ✕
                </button>
              </div>

              {/* Service Modules List */}
              <div className="p-5 overflow-y-auto space-y-3 flex-1 text-xs">
                {/* 1. Payment Gateway */}
                <div className={`p-4 rounded-xl border flex items-center justify-between transition ${
                  paymentActive
                    ? 'bg-slate-950/80 border-slate-800'
                    : 'bg-rose-950/20 border-rose-500/40'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      paymentActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100">Digital Payment Gateway</span>
                        <span className={`px-2 py-0.2 rounded text-[10px] font-extrabold uppercase ${
                          paymentActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {paymentActive ? 'CHALU / ACTIVE' : 'BAND / DISABLED'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        UPI QR Direct deposit, Cards, Stripe, and Apple/Google Pay online table bill payment.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      toggleTenantService(tenant.id, 'paymentGateway', !paymentActive);
                      setServiceActionToast(
                        `${tenant.name}: Payment Gateway turned ${!paymentActive ? 'ON' : 'OFF'}`
                      );
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 ${
                      paymentActive
                        ? 'bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{paymentActive ? 'Service Band Karein' : 'Service Chalu Karein'}</span>
                  </button>
                </div>

                {/* 2. Loyalty & Punch Terminal */}
                <div className={`p-4 rounded-xl border flex items-center justify-between transition ${
                  loyaltyActive
                    ? 'bg-slate-950/80 border-slate-800'
                    : 'bg-rose-950/20 border-rose-500/40'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      loyaltyActive ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100">Loyalty & Punch Terminal</span>
                        <span className={`px-2 py-0.2 rounded text-[10px] font-extrabold uppercase ${
                          loyaltyActive ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {loyaltyActive ? 'CHALU / ACTIVE' : 'BAND / DISABLED'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Customer digital stamp card registration and staff authorization PIN punch terminal.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      toggleTenantService(tenant.id, 'loyaltyTerminal', !loyaltyActive);
                      setServiceActionToast(
                        `${tenant.name}: Loyalty Terminal turned ${!loyaltyActive ? 'ON' : 'OFF'}`
                      );
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 ${
                      loyaltyActive
                        ? 'bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{loyaltyActive ? 'Service Band Karein' : 'Service Chalu Karein'}</span>
                  </button>
                </div>

                {/* 3. Table-Side Ordering */}
                <div className={`p-4 rounded-xl border flex items-center justify-between transition ${
                  orderingActive
                    ? 'bg-slate-950/80 border-slate-800'
                    : 'bg-rose-950/20 border-rose-500/40'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      orderingActive ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100">Table-Side Ordering</span>
                        <span className={`px-2 py-0.2 rounded text-[10px] font-extrabold uppercase ${
                          orderingActive ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {orderingActive ? 'CHALU / ACTIVE' : 'BAND / DISABLED'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Permits guests to add menu items to digital cart and send orders directly to the Kitchen KDS.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      toggleTenantService(tenant.id, 'ordering', !orderingActive);
                      setServiceActionToast(
                        `${tenant.name}: Table Ordering turned ${!orderingActive ? 'ON' : 'OFF'}`
                      );
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 ${
                      orderingActive
                        ? 'bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{orderingActive ? 'Service Band Karein' : 'Service Chalu Karein'}</span>
                  </button>
                </div>

                {/* 4. Call Waiter & Service Bell */}
                <div className={`p-4 rounded-xl border flex items-center justify-between transition ${
                  waiterBellActive
                    ? 'bg-slate-950/80 border-slate-800'
                    : 'bg-rose-950/20 border-rose-500/40'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      waiterBellActive ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100">Call Waiter & Service Bell</span>
                        <span className={`px-2 py-0.2 rounded text-[10px] font-extrabold uppercase ${
                          waiterBellActive ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {waiterBellActive ? 'CHALU / ACTIVE' : 'BAND / DISABLED'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Water, bill, cleaning, and assistance requests with audio alert chimes in Kitchen display.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      toggleTenantService(tenant.id, 'serviceBell', !waiterBellActive);
                      setServiceActionToast(
                        `${tenant.name}: Waiter Bell turned ${!waiterBellActive ? 'ON' : 'OFF'}`
                      );
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 ${
                      waiterBellActive
                        ? 'bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{waiterBellActive ? 'Service Band Karein' : 'Service Chalu Karein'}</span>
                  </button>
                </div>

                {/* Additional modules row */}
                <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-800">
                  {/* Wi-Fi */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-200">Guest Wi-Fi</div>
                      <div className="text-[10px] text-slate-400">1-Tap Wi-Fi card</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleTenantService(tenant.id, 'wifi', !wifiActive)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        wifiActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {wifiActive ? 'On' : 'Off'}
                    </button>
                  </div>

                  {/* Feedback */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-200">Customer Feedback</div>
                      <div className="text-[10px] text-slate-400">Private ratings</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleTenantService(tenant.id, 'feedback', !feedbackActive)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        feedbackActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {feedbackActive ? 'On' : 'Off'}
                    </button>
                  </div>

                  {/* Mini Games */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-200">Table Mini Games</div>
                      <div className="text-[10px] text-slate-400">3D Table Ludo & AI Bots</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleTenantService(tenant.id, 'games', !gamesActive)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        gamesActive ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {gamesActive ? 'On' : 'Off'}
                    </button>
                  </div>

                  {/* Google Reviews */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-200">Google Reviews</div>
                      <div className="text-[10px] text-slate-400">Review redirect</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleTenantService(tenant.id, 'googleReviews', !reviewsActive)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        reviewsActive ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {reviewsActive ? 'On' : 'Off'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/60">
                <span className="text-[11px] text-slate-400">
                  Changes take effect immediately across all customer table QR scans.
                </span>
                <button
                  type="button"
                  onClick={() => setManagingServicesTenantId(null)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
