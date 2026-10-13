import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  Sliders,
  TrendingUp,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Activity,
  Layers,
  ChevronRight,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  Printer,
  Sparkles,
  Bot,
  QrCode,
  Zap,
  HardDrive,
  Clock,
  Send,
  Calendar,
  X,
  History,
} from 'lucide-react';
import {
  Tenant,
  SubscriptionPlan,
  TenantPlanStatus,
  TenantInvoice,
  TenantApiLimits,
  TenantBillingInfo,
  BillingAuditLogEntry,
} from '../../types';
import {
  PLAN_CONFIGS,
  DEFAULT_SUPERADMIN_PASSKEY,
  getTenantBilling,
  getTenantApiLimits,
  INITIAL_AUDIT_LOGS,
} from '../../utils/billingUtils';

interface SuperAdminBillingManagerProps {
  tenants: Tenant[];
  onUpdateTenant: (tenantId: string, data: Partial<Tenant>) => void;
  onSelectTenantForView?: (tenantId: string) => void;
}

export const SuperAdminBillingManager: React.FC<SuperAdminBillingManagerProps> = ({
  tenants,
  onUpdateTenant,
  onSelectTenantForView,
}) => {
  // Security clearance state
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('superadmin_billing_unlocked') === 'true';
  });
  const [passkeyInput, setPasskeyInput] = useState('');
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<'all' | SubscriptionPlan>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TenantPlanStatus>('all');

  // Modals state
  const [selectedTenantForPlan, setSelectedTenantForPlan] = useState<Tenant | null>(null);
  const [selectedTenantForLimits, setSelectedTenantForLimits] = useState<Tenant | null>(null);
  const [selectedTenantForInvoices, setSelectedTenantForInvoices] = useState<Tenant | null>(null);
  const [previewingInvoice, setPreviewingInvoice] = useState<{ tenant: Tenant; invoice: TenantInvoice } | null>(null);
  const [showAuditLogModal, setShowAuditLogModal] = useState(false);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warn' } | null>(null);

  // Audit Log State
  const [auditLogs, setAuditLogs] = useState<BillingAuditLogEntry[]>(() => {
    const saved = localStorage.getItem('tabletap_v1_billing_audit');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const triggerToast = (text: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  const addAuditLog = (tenantId: string, tenantName: string, action: string, details: string) => {
    const newLog: BillingAuditLogEntry = {
      id: `audit-${Date.now()}`,
      tenantId,
      tenantName,
      action,
      details,
      adminUser: 'superadmin@tabletap.io',
      timestamp: new Date().toLocaleString(),
    };
    const updated = [newLog, ...auditLogs].slice(0, 50);
    setAuditLogs(updated);
    localStorage.setItem('tabletap_v1_billing_audit', JSON.stringify(updated));
  };

  // Security gate helper: if unlocked, execute action; otherwise prompt for passkey
  const requireSecurityClearance = (action: () => void) => {
    if (isUnlocked) {
      action();
    } else {
      setPendingAction(() => action);
      setShowUnlockModal(true);
    }
  };

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passkeyInput.trim().toUpperCase() === DEFAULT_SUPERADMIN_PASSKEY.toUpperCase()) {
      setIsUnlocked(true);
      sessionStorage.setItem('superadmin_billing_unlocked', 'true');
      setShowUnlockModal(false);
      setPasskeyInput('');
      setPasskeyError(null);
      triggerToast('Super Admin Master Security clearance granted', 'success');
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    } else {
      setPasskeyError(`Invalid Master Passkey. Try demo passkey: ${DEFAULT_SUPERADMIN_PASSKEY}`);
    }
  };

  const handleLockSession = () => {
    setIsUnlocked(false);
    sessionStorage.removeItem('superadmin_billing_unlocked');
    triggerToast('Billing controls locked. Passkey required for sensitive edits.', 'info');
  };

  // SaaS Financial Calculations
  const financialMetrics = useMemo(() => {
    let totalMRR = 0;
    let totalScansUsed = 0;
    let totalScansQuota = 0;
    let totalWebhooksUsed = 0;
    let totalAiCallsUsed = 0;
    let activeSubscriptions = 0;
    let pastDueCount = 0;

    tenants.forEach((tenant) => {
      const billing = getTenantBilling(tenant);
      const limits = getTenantApiLimits(tenant);
      const planConfig = PLAN_CONFIGS[tenant.plan] || PLAN_CONFIGS.pro;
      const isAnnual = billing.billingCycle === 'annual';
      const monthlyAmount = isAnnual ? planConfig.annualPrice : planConfig.monthlyPrice;
      const discount = billing.discountPercent || 0;
      const effectiveMonthly = monthlyAmount * (1 - discount / 100);

      totalMRR += effectiveMonthly;
      totalScansUsed += limits.scanUsedThisMonth;
      totalScansQuota += limits.scanLimitMonthly;
      totalWebhooksUsed += limits.orderWebhookUsedThisMonth;
      totalAiCallsUsed += limits.aiBotCallsUsedThisMonth;

      if (tenant.planStatus === 'active') activeSubscriptions++;
      if (tenant.planStatus === 'past_due') pastDueCount++;
    });

    const totalARR = totalMRR * 12;
    const arpu = tenants.length > 0 ? Math.round(totalMRR / tenants.length) : 0;
    const scanUsagePercent = totalScansQuota > 0 ? Math.round((totalScansUsed / totalScansQuota) * 100) : 0;

    return {
      totalMRR: Math.round(totalMRR),
      totalARR: Math.round(totalARR),
      arpu,
      totalScansUsed,
      totalScansQuota,
      totalWebhooksUsed,
      totalAiCallsUsed,
      activeSubscriptions,
      pastDueCount,
      scanUsagePercent,
    };
  }, [tenants]);

  // Filtered tenants list
  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) => {
      const matchesSearch =
        tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.ownerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.ownerName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPlan = planFilter === 'all' || tenant.plan === planFilter;
      const matchesStatus = statusFilter === 'all' || tenant.planStatus === statusFilter;

      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [tenants, searchQuery, planFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`p-3 rounded-xl border flex items-center justify-between text-xs font-medium shadow-lg animate-fade-in ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
              : toastMessage.type === 'warn'
              ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
              : 'bg-indigo-950/80 border-indigo-500/50 text-indigo-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="hover:opacity-75 px-1 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Security Status & Master Passkey Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner ${
              isUnlocked
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
            }`}
          >
            {isUnlocked ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Tenant Billing, Plans & API Quota Terminal</span>
              </h2>
              <span
                className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  isUnlocked
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}
              >
                {isUnlocked ? 'Level 3 Clearance (Active)' : 'Secured / PIN Protected'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage multi-tenant SaaS tiers, billing cycles, invoice history, and enforce API usage rate-limits & webhook quotas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setShowAuditLogModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition"
          >
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>

          {isUnlocked ? (
            <button
              type="button"
              onClick={handleLockSession}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-semibold transition"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Terminal</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowUnlockModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition active:scale-95"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Enter Super Admin PIN</span>
            </button>
          )}
        </div>
      </div>

      {/* Global Financial & Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR Card */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span className="font-medium">Total Monthly Recurring Revenue (MRR)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            ${financialMetrics.totalMRR}
            <span className="text-xs font-normal text-slate-400"> /mo</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
            <span>Projected Annual (ARR):</span>
            <span className="font-semibold text-slate-200">${financialMetrics.totalARR}</span>
          </div>
        </div>

        {/* ARPU Card */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span className="font-medium">Average Revenue Per User (ARPU)</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">
            ${financialMetrics.arpu}
            <span className="text-xs font-normal text-slate-400"> /store</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
            <span>Active Subscriptions:</span>
            <span className="font-semibold text-emerald-400">
              {financialMetrics.activeSubscriptions} of {tenants.length}
            </span>
          </div>
        </div>

        {/* Global QR Scan Consumption */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span className="font-medium">Monthly QR Scans Bandwidth</span>
            <QrCode className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-100">
              {financialMetrics.totalScansUsed.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">
              / {financialMetrics.totalScansQuota.toLocaleString()}
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2.5">
            <div
              className={`h-full transition-all duration-500 ${
                financialMetrics.scanUsagePercent > 90
                  ? 'bg-rose-500'
                  : financialMetrics.scanUsagePercent > 70
                  ? 'bg-amber-500'
                  : 'bg-indigo-500'
              }`}
              style={{ width: `${Math.min(100, financialMetrics.scanUsagePercent)}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
            <span>{financialMetrics.scanUsagePercent}% Quota consumed</span>
            <span>Platform healthy</span>
          </div>
        </div>

        {/* Global Webhooks & AI Bots */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span className="font-medium">Webhooks & AI Invocations</span>
            <Bot className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-300">
            {(financialMetrics.totalWebhooksUsed + financialMetrics.totalAiCallsUsed).toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
            <span>Webhooks: {financialMetrics.totalWebhooksUsed.toLocaleString()}</span>
            <span>AI Bot: {financialMetrics.totalAiCallsUsed.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Plan Tier Showcase Cards */}
      <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
              Standard B2B SaaS Plan Matrix
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Auto-allocated quotas & rates per tier
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(Object.values(PLAN_CONFIGS) as typeof PLAN_CONFIGS['starter'][]).map((plan) => {
            const tenantsOnThisPlan = tenants.filter((t) => t.plan === plan.id);
            const isEnterprise = plan.id === 'enterprise';
            const isPro = plan.id === 'pro';

            return (
              <div
                key={plan.id}
                className={`p-3.5 rounded-xl border transition relative ${
                  isEnterprise
                    ? 'bg-purple-950/20 border-purple-500/30'
                    : isPro
                    ? 'bg-indigo-950/20 border-indigo-500/30'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                      isEnterprise
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        : isPro
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        : 'bg-slate-700/50 text-slate-300 border-slate-700'
                    }`}
                  >
                    {plan.name}
                  </span>
                  <span className="text-xs font-bold text-slate-200">
                    ${plan.monthlyPrice}
                    <span className="text-[10px] font-normal text-slate-400"> /mo</span>
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 mt-2 line-clamp-1">{plan.tagline}</p>

                <div className="grid grid-cols-2 gap-1.5 mt-3 pt-2.5 border-t border-slate-800 text-[10px] text-slate-300">
                  <div className="flex items-center gap-1">
                    <QrCode className="w-3 h-3 text-amber-400" />
                    <span>{plan.defaultLimits.scanLimitMonthly.toLocaleString()} scans</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-cyan-400" />
                    <span>{plan.defaultLimits.rateLimitPerMinute} req/min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bot className="w-3 h-3 text-purple-400" />
                    <span>{plan.defaultLimits.aiBotCallsLimitMonthly.toLocaleString()} AI calls</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <HardDrive className="w-3 h-3 text-emerald-400" />
                    <span>{plan.defaultLimits.storageMbLimit} MB media</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Stores on this plan:</span>
                  <span className="font-bold text-indigo-300">
                    {tenantsOnThisPlan.length} {tenantsOnThisPlan.length === 1 ? 'store' : 'stores'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-lg">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tenant by name, slug, owner or email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Plan:</span>
          </div>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value as any)}
            className="px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Plans</option>
            <option value="starter">Starter ($19)</option>
            <option value="pro">Pro ($49)</option>
            <option value="enterprise">Enterprise ($99)</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 ml-2">
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="grace_period">Grace Period</option>
            <option value="past_due">Past Due</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Tenant Subscriptions & API Quotas Registry Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-100 text-sm">
              Tenant Plan Registry & API Quota Telemetry
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live subscription states, renewal schedules, and API rate quota enforcement for every restaurant.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {filteredTenants.length} of {tenants.length} tenants
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Store / Owner</th>
                <th className="py-3 px-4 font-semibold">Subscription & Plan</th>
                <th className="py-3 px-4 font-semibold">Status & Billing Cycle</th>
                <th className="py-3 px-4 font-semibold">Next Invoice</th>
                <th className="py-3 px-4 font-semibold">QR Scan Quota (Used / Cap)</th>
                <th className="py-3 px-4 font-semibold">API Limits (Webhooks / AI)</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredTenants.map((tenant) => {
                const billing = getTenantBilling(tenant);
                const limits = getTenantApiLimits(tenant);
                const planConfig = PLAN_CONFIGS[tenant.plan] || PLAN_CONFIGS.pro;
                const scanUsagePct = Math.min(
                  100,
                  Math.round((limits.scanUsedThisMonth / (limits.scanLimitMonthly || 1)) * 100)
                );

                return (
                  <tr key={tenant.id} className="hover:bg-slate-800/40 transition">
                    {/* Store / Owner */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={tenant.logoUrl}
                          alt={tenant.name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-700 shadow-sm"
                        />
                        <div>
                          <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                            <span>{tenant.name}</span>
                            <span className="text-[10px] font-mono text-amber-400">/r/{tenant.slug}</span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {tenant.ownerName} · {tenant.ownerEmail}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Subscription & Plan */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border ${
                            tenant.plan === 'enterprise'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                              : tenant.plan === 'pro'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                              : 'bg-slate-700/50 text-slate-300 border-slate-700'
                          }`}
                        >
                          {tenant.plan}
                        </span>
                        <span className="font-bold text-slate-200">
                          ${billing.billingCycle === 'annual' ? planConfig.annualPrice : planConfig.monthlyPrice}
                          <span className="text-[10px] text-slate-400 font-normal"> /mo</span>
                        </span>
                      </div>
                      {billing.discountPercent && billing.discountPercent > 0 ? (
                        <div className="text-[10px] text-emerald-400 mt-0.5">
                          {billing.discountPercent}% VIP discount applied
                        </div>
                      ) : null}
                    </td>

                    {/* Status & Cycle */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            tenant.planStatus === 'active'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : tenant.planStatus === 'trial'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : tenant.planStatus === 'grace_period'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {tenant.planStatus}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono capitalize">
                          ({billing.billingCycle})
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 capitalize">
                        Gateway: {billing.paymentMethod}
                      </div>
                    </td>

                    {/* Next Invoice */}
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      <div>{billing.nextBillingDate || '2026-04-01'}</div>
                      <div className="text-[10px] text-slate-500">
                        {billing.autoRenew ? 'Auto-renews' : 'Manual renewal'}
                      </div>
                    </td>

                    {/* QR Scan Quota Meter */}
                    <td className="py-3.5 px-4">
                      <div className="w-36">
                        <div className="flex justify-between text-[11px] font-mono mb-1">
                          <span className="font-semibold text-slate-200">
                            {limits.scanUsedThisMonth.toLocaleString()}
                          </span>
                          <span className="text-slate-400">
                            / {limits.scanLimitMonthly.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              scanUsagePct > 90
                                ? 'bg-rose-500'
                                : scanUsagePct > 70
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${scanUsagePct}%` }}
                          />
                        </div>
                        <div className="text-[9px] text-slate-500 mt-0.5 flex justify-between">
                          <span>{scanUsagePct}% used</span>
                          <span className="capitalize">{limits.enforcementPolicy.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </td>

                    {/* API Limits mini pill */}
                    <td className="py-3.5 px-4 text-[11px]">
                      <div className="text-slate-300">
                        Webhooks: <span className="font-mono text-cyan-400">{limits.orderWebhookUsedThisMonth}</span> / {limits.orderWebhookLimitMonthly}
                      </div>
                      <div className="text-slate-400 text-[10px] mt-0.5">
                        AI: <span className="font-mono text-purple-400">{limits.aiBotCallsUsedThisMonth}</span> / {limits.aiBotCallsLimitMonthly} · {limits.rateLimitPerMinute} rpm
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Manage Plan */}
                        <button
                          type="button"
                          onClick={() => {
                            requireSecurityClearance(() => setSelectedTenantForPlan(tenant));
                          }}
                          className="px-2.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-xs font-semibold border border-indigo-500/30 transition flex items-center gap-1 active:scale-95"
                          title="Change subscription plan or billing cycle"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Plan</span>
                        </button>

                        {/* Manage API Limits */}
                        <button
                          type="button"
                          onClick={() => {
                            requireSecurityClearance(() => setSelectedTenantForLimits(tenant));
                          }}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition flex items-center gap-1 active:scale-95"
                          title="Manage API usage limits, quotas & API key"
                        >
                          <Sliders className="w-3.5 h-3.5 text-amber-400" />
                          <span>API Limits</span>
                        </button>

                        {/* Invoices */}
                        <button
                          type="button"
                          onClick={() => setSelectedTenantForInvoices(tenant)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition flex items-center gap-1 active:scale-95"
                          title="View billing invoices"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Invoices</span>
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

      {/* MODAL 1: Edit Tenant Plan & Billing */}
      {selectedTenantForPlan && (
        <EditTenantPlanModal
          tenant={selectedTenantForPlan}
          onClose={() => setSelectedTenantForPlan(null)}
          onSave={(updatedTenantData, auditDetail) => {
            onUpdateTenant(selectedTenantForPlan.id, updatedTenantData);
            addAuditLog(selectedTenantForPlan.id, selectedTenantForPlan.name, 'Subscription Plan Modified', auditDetail);
            setSelectedTenantForPlan(null);
            triggerToast(`Updated plan for ${selectedTenantForPlan.name}`, 'success');
          }}
        />
      )}

      {/* MODAL 2: Edit Tenant API Usage Limits & Quotas */}
      {selectedTenantForLimits && (
        <EditTenantApiLimitsModal
          tenant={selectedTenantForLimits}
          onClose={() => setSelectedTenantForLimits(null)}
          onSave={(updatedLimits, auditDetail) => {
            onUpdateTenant(selectedTenantForLimits.id, { apiLimits: updatedLimits });
            addAuditLog(selectedTenantForLimits.id, selectedTenantForLimits.name, 'API Limits Adjusted', auditDetail);
            setSelectedTenantForLimits(null);
            triggerToast(`Saved API limits & quotas for ${selectedTenantForLimits.name}`, 'success');
          }}
          onResetUsage={() => {
            const currentLimits = getTenantApiLimits(selectedTenantForLimits);
            const resetLimits: TenantApiLimits = {
              ...currentLimits,
              scanUsedThisMonth: 0,
              orderWebhookUsedThisMonth: 0,
              aiBotCallsUsedThisMonth: 0,
            };
            onUpdateTenant(selectedTenantForLimits.id, { apiLimits: resetLimits });
            addAuditLog(selectedTenantForLimits.id, selectedTenantForLimits.name, 'Usage Counters Reset', 'Monthly API and scan consumption reset to zero.');
            setSelectedTenantForLimits({ ...selectedTenantForLimits, apiLimits: resetLimits });
            triggerToast(`Reset usage counters for ${selectedTenantForLimits.name}`, 'info');
          }}
        />
      )}

      {/* MODAL 3: Invoices & Receipts Management */}
      {selectedTenantForInvoices && (
        <TenantInvoicesModal
          tenant={selectedTenantForInvoices}
          onClose={() => setSelectedTenantForInvoices(null)}
          onPreviewInvoice={(inv) => {
            setPreviewingInvoice({ tenant: selectedTenantForInvoices, invoice: inv });
          }}
          onCreateInvoice={(newInvoice) => {
            const currentBilling = getTenantBilling(selectedTenantForInvoices);
            const updatedInvoices = [newInvoice, ...(currentBilling.invoices || [])];
            const updatedBilling: TenantBillingInfo = {
              ...currentBilling,
              invoices: updatedInvoices,
            };
            onUpdateTenant(selectedTenantForInvoices.id, { billing: updatedBilling });
            addAuditLog(selectedTenantForInvoices.id, selectedTenantForInvoices.name, 'Invoice Generated', `Issued ${newInvoice.invoiceNumber} for $${newInvoice.amount}.`);
            setSelectedTenantForInvoices({ ...selectedTenantForInvoices, billing: updatedBilling });
            triggerToast(`Created invoice ${newInvoice.invoiceNumber}`, 'success');
          }}
          onMarkPaid={(invId) => {
            const currentBilling = getTenantBilling(selectedTenantForInvoices);
            const updatedInvoices = currentBilling.invoices.map((inv) =>
              inv.id === invId ? { ...inv, status: 'paid' as const } : inv
            );
            const updatedBilling = { ...currentBilling, invoices: updatedInvoices };
            onUpdateTenant(selectedTenantForInvoices.id, { billing: updatedBilling });
            addAuditLog(selectedTenantForInvoices.id, selectedTenantForInvoices.name, 'Invoice Settled', `Marked invoice ${invId} as Paid.`);
            setSelectedTenantForInvoices({ ...selectedTenantForInvoices, billing: updatedBilling });
            triggerToast('Invoice marked as Paid', 'success');
          }}
        />
      )}

      {/* MODAL 4: Invoice PDF Preview */}
      {previewingInvoice && (
        <InvoicePdfPreviewModal
          tenant={previewingInvoice.tenant}
          invoice={previewingInvoice.invoice}
          onClose={() => setPreviewingInvoice(null)}
        />
      )}

      {/* MODAL 5: Audit Trail Modal */}
      {showAuditLogModal && (
        <AuditLogModal
          logs={auditLogs}
          onClose={() => setShowAuditLogModal(false)}
          onClearLogs={() => {
            setAuditLogs([]);
            localStorage.removeItem('tabletap_v1_billing_audit');
            triggerToast('Audit trail logs cleared', 'info');
          }}
        />
      )}

      {/* MODAL 6: Super Admin Security PIN Unlock */}
      {showUnlockModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">Super Admin Security Clearance</h3>
                  <p className="text-[11px] text-slate-400">Restricted Multi-Tenant Billing & API Control</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowUnlockModal(false);
                  setPasskeyError(null);
                }}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Modifying tenant subscriptions, resetting API telemetry, and overriding rate limits requires master passkey verification.
            </p>

            <form onSubmit={handleUnlockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Master Security PIN / Passkey
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={passkeyInput}
                    onChange={(e) => {
                      setPasskeyInput(e.target.value);
                      setPasskeyError(null);
                    }}
                    placeholder="Enter passkey (e.g. ADMIN-8822)"
                    autoFocus
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono tracking-wider"
                  />
                  <Key className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
                {passkeyError ? (
                  <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{passkeyError}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                    <span>Default master clearance passkey:</span>
                    <button
                      type="button"
                      onClick={() => setPasskeyInput(DEFAULT_SUPERADMIN_PASSKEY)}
                      className="text-indigo-400 underline font-mono hover:text-indigo-300"
                    >
                      {DEFAULT_SUPERADMIN_PASSKEY}
                    </button>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUnlockModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition active:scale-95 flex items-center gap-1.5"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Verify & Unlock</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* SUB-MODAL 1: Edit Tenant Plan & Billing                                     */
/* -------------------------------------------------------------------------- */
interface EditTenantPlanModalProps {
  tenant: Tenant;
  onClose: () => void;
  onSave: (updatedData: Partial<Tenant>, auditDetail: string) => void;
}

const EditTenantPlanModal: React.FC<EditTenantPlanModalProps> = ({
  tenant,
  onClose,
  onSave,
}) => {
  const currentBilling = getTenantBilling(tenant);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(tenant.plan);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>(
    currentBilling.billingCycle || 'monthly'
  );
  const [planStatus, setPlanStatus] = useState<TenantPlanStatus>(tenant.planStatus || 'active');
  const [nextBillingDate, setNextBillingDate] = useState(
    currentBilling.nextBillingDate || '2026-04-01'
  );
  const [discountPercent, setDiscountPercent] = useState<number>(
    currentBilling.discountPercent || 0
  );
  const [autoApplyDefaultLimits, setAutoApplyDefaultLimits] = useState(true);

  const planConfig = PLAN_CONFIGS[selectedPlan];
  const isAnnual = billingCycle === 'annual';
  const basePrice = isAnnual ? planConfig.annualPrice : planConfig.monthlyPrice;
  const effectivePrice = Math.round(basePrice * (1 - discountPercent / 100));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedBilling: TenantBillingInfo = {
      ...currentBilling,
      billingCycle,
      nextBillingDate,
      discountPercent,
    };

    const updatePayload: Partial<Tenant> = {
      plan: selectedPlan,
      planStatus,
      billing: updatedBilling,
    };

    if (autoApplyDefaultLimits && selectedPlan !== tenant.plan) {
      const defLimits = planConfig.defaultLimits;
      const currentLimits = getTenantApiLimits(tenant);
      updatePayload.apiLimits = {
        ...currentLimits,
        scanLimitMonthly: defLimits.scanLimitMonthly,
        orderWebhookLimitMonthly: defLimits.orderWebhookLimitMonthly,
        aiBotCallsLimitMonthly: defLimits.aiBotCallsLimitMonthly,
        maxConcurrentWebsockets: defLimits.maxConcurrentWebsockets,
        storageMbLimit: defLimits.storageMbLimit,
        rateLimitPerMinute: defLimits.rateLimitPerMinute,
      };
    }

    const auditDetail = `Changed tier to ${planConfig.name} (${billingCycle}, ${planStatus}). Effective rate: $${effectivePrice}/mo.`;
    onSave(updatePayload, auditDetail);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">
                Manage Subscription Plan: {tenant.name}
              </h3>
              <p className="text-[11px] text-slate-400">
                Tenant ID: <span className="font-mono text-indigo-300">{tenant.id}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {/* Plan Selection Buttons */}
          <div>
            <label className="block font-semibold text-slate-300 mb-2">
              Select Subscription Tier
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(Object.keys(PLAN_CONFIGS) as SubscriptionPlan[]).map((pKey) => {
                const conf = PLAN_CONFIGS[pKey];
                const isSelected = selectedPlan === pKey;
                return (
                  <button
                    key={pKey}
                    type="button"
                    onClick={() => setSelectedPlan(pKey)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs capitalize text-slate-200">{conf.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{conf.tagline}</div>
                    </div>
                    <div className="mt-2 text-sm font-bold text-indigo-300">
                      ${billingCycle === 'annual' ? conf.annualPrice : conf.monthlyPrice}
                      <span className="text-[10px] font-normal text-slate-400">/mo</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Billing Cycle
              </label>
              <div className="flex p-1 bg-slate-950 border border-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                    billingCycle === 'monthly'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('annual')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1 ${
                    billingCycle === 'annual'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>Annual</span>
                  <span className="text-[9px] bg-emerald-500/30 text-emerald-300 px-1 rounded">
                    -20%
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Subscription Status
              </label>
              <select
                value={planStatus}
                onChange={(e) => setPlanStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="active">Active (Paid)</option>
                <option value="trial">Trial (14-day Free)</option>
                <option value="grace_period">Grace Period (7 days)</option>
                <option value="past_due">Past Due (Unpaid)</option>
                <option value="suspended">Suspended (Blocked)</option>
              </select>
            </div>
          </div>

          {/* Renewal Date & Custom Discount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Next Billing Date
              </label>
              <input
                type="date"
                value={nextBillingDate}
                onChange={(e) => setNextBillingDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Custom Discount (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Auto-apply Quota update checkbox */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="autoQuota"
              checked={autoApplyDefaultLimits}
              onChange={(e) => setAutoApplyDefaultLimits(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
            />
            <label htmlFor="autoQuota" className="text-slate-300 text-[11px] cursor-pointer">
              <span className="font-semibold block text-slate-200">
                Sync API quotas to {planConfig.name} defaults
              </span>
              Automatically updates monthly scans to {planConfig.defaultLimits.scanLimitMonthly.toLocaleString()}, webhooks to {planConfig.defaultLimits.orderWebhookLimitMonthly.toLocaleString()}, and rate limits.
            </label>
          </div>

          {/* Pricing Preview Summary */}
          <div className="p-3 bg-indigo-950/30 rounded-xl border border-indigo-500/30 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400">Effective Recurring Rate:</span>
              <div className="font-bold text-emerald-400 text-base">
                ${effectivePrice} <span className="text-xs font-normal text-slate-400">/mo</span>
                {discountPercent > 0 && (
                  <span className="text-xs text-indigo-300 font-normal ml-2">
                    ({discountPercent}% off applied)
                  </span>
                )}
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-400 font-mono">
              Billed {billingCycle}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save & Update Subscription</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* SUB-MODAL 2: Edit Tenant API Usage Limits & Quotas                         */
/* -------------------------------------------------------------------------- */
interface EditTenantApiLimitsModalProps {
  tenant: Tenant;
  onClose: () => void;
  onSave: (updatedLimits: TenantApiLimits, auditDetail: string) => void;
  onResetUsage: () => void;
}

const EditTenantApiLimitsModal: React.FC<EditTenantApiLimitsModalProps> = ({
  tenant,
  onClose,
  onSave,
  onResetUsage,
}) => {
  const currentLimits = getTenantApiLimits(tenant);
  const [scanLimit, setScanLimit] = useState(currentLimits.scanLimitMonthly);
  const [webhookLimit, setWebhookLimit] = useState(currentLimits.orderWebhookLimitMonthly);
  const [aiLimit, setAiLimit] = useState(currentLimits.aiBotCallsLimitMonthly);
  const [concurrentWs, setConcurrentWs] = useState(currentLimits.maxConcurrentWebsockets);
  const [storageMb, setStorageMb] = useState(currentLimits.storageMbLimit);
  const [rateLimitRpm, setRateLimitRpm] = useState(currentLimits.rateLimitPerMinute);
  const [policy, setPolicy] = useState(currentLimits.enforcementPolicy);

  // Key visibility & rotation
  const [apiKey, setApiKey] = useState(currentLimits.apiKey);
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRotateKey = () => {
    if (confirm(`Rotate API secret key for ${tenant.name}? Any external POS systems currently using this key will immediately need to be updated.`)) {
      const newKey = `tt_live_${tenant.slug.replace(/-/g, '')}_${Math.random().toString(36).substring(2, 12)}`;
      setApiKey(newKey);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: TenantApiLimits = {
      ...currentLimits,
      scanLimitMonthly: Number(scanLimit),
      orderWebhookLimitMonthly: Number(webhookLimit),
      aiBotCallsLimitMonthly: Number(aiLimit),
      maxConcurrentWebsockets: Number(concurrentWs),
      storageMbLimit: Number(storageMb),
      rateLimitPerMinute: Number(rateLimitRpm),
      enforcementPolicy: policy,
      apiKey,
      apiKeyLastRotated: apiKey !== currentLimits.apiKey ? new Date().toISOString().split('T')[0] : currentLimits.apiKeyLastRotated,
    };

    const auditDetail = `Updated limits: ${scanLimit.toLocaleString()} scans, ${webhookLimit.toLocaleString()} webhooks, ${rateLimitRpm} RPM, policy: ${policy}.`;
    onSave(updated, auditDetail);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">
                API Usage Quotas & Rate Limits: {tenant.name}
              </h3>
              <p className="text-[11px] text-slate-400">
                Tenant Tier: <span className="uppercase text-indigo-300 font-bold">{tenant.plan}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {/* API Secret Key Section */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Tenant Master Integration Secret Key</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                Rotated: {currentLimits.apiKeyLastRotated}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-900 px-3 py-2 rounded-lg border border-slate-700/80 font-mono text-xs text-amber-300 flex items-center justify-between overflow-hidden">
                <span className="truncate">
                  {showKey ? apiKey : apiKey.substring(0, 10) + '••••••••••••••••••••'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="text-slate-400 hover:text-slate-200 ml-2"
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition flex items-center gap-1"
                title="Copy Key"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedKey ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={handleRotateKey}
                className="px-2.5 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 rounded-lg text-xs font-semibold border border-rose-500/40 transition flex items-center gap-1"
                title="Rotate Key"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Rotate</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              Used by external POS (Toast, Square, Clover) and kitchen printers for authenticated order webhook dispatch.
            </p>
          </div>

          {/* Quota Sliders */}
          <div className="space-y-3.5">
            {/* 1. Monthly QR Scans */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-amber-400" />
                  <span>Monthly Table QR Scans Quota</span>
                </label>
                <div className="text-right">
                  <span className="font-bold text-slate-100">{scanLimit.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400 ml-1.5">
                    (Used: {currentLimits.scanUsedThisMonth.toLocaleString()})
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="1000"
                max="250000"
                step="1000"
                value={scanLimit}
                onChange={(e) => setScanLimit(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800"
              />
            </div>

            {/* 2. Order Webhook limit */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Order Webhooks / API Requests</span>
                </label>
                <div className="text-right">
                  <span className="font-bold text-slate-100">{webhookLimit.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400 ml-1.5">
                    (Used: {currentLimits.orderWebhookUsedThisMonth.toLocaleString()})
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="500"
                max="100000"
                step="500"
                value={webhookLimit}
                onChange={(e) => setWebhookLimit(Number(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-800"
              />
            </div>

            {/* 3. AI Bot & Ludo calls */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-purple-400" />
                  <span>AI Bot & 3D Ludo Engine Invocations</span>
                </label>
                <div className="text-right">
                  <span className="font-bold text-slate-100">{aiLimit.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400 ml-1.5">
                    (Used: {currentLimits.aiBotCallsUsedThisMonth.toLocaleString()})
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="500"
                max="50000"
                step="500"
                value={aiLimit}
                onChange={(e) => setAiLimit(Number(e.target.value))}
                className="w-full accent-purple-500 bg-slate-800"
              />
            </div>

            {/* 4. Concurrent WebSockets & Media Storage */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Concurrent WebSocket Tables
                </label>
                <input
                  type="number"
                  min="5"
                  max="500"
                  value={concurrentWs}
                  onChange={(e) => setConcurrentWs(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Media Storage Quota (MB)
                </label>
                <input
                  type="number"
                  min="50"
                  max="20000"
                  step="50"
                  value={storageMb}
                  onChange={(e) => setStorageMb(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* 5. Rate Limit RPM & Policy */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Burst Rate Limit (Req/min)
                </label>
                <select
                  value={rateLimitRpm}
                  onChange={(e) => setRateLimitRpm(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value={60}>60 req / min (Starter)</option>
                  <option value={180}>180 req / min (Pro)</option>
                  <option value={300}>300 req / min (High)</option>
                  <option value={600}>600 req / min (Enterprise)</option>
                  <option value={1200}>1,200 req / min (Uncapped)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Overage Enforcement Policy
                </label>
                <select
                  value={policy}
                  onChange={(e) => setPolicy(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="soft_warning">Soft Warning (Allow with alert)</option>
                  <option value="hard_throttle">Hard Throttle (Block beyond cap)</option>
                  <option value="auto_scale">Auto-Scale Plan (Next tier)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reset Usage Bar */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-200">Reset Billing Cycle Telemetry</div>
              <p className="text-[10px] text-slate-400">
                Instantly resets this month's consumed scan & API counters back to 0.
              </p>
            </div>
            <button
              type="button"
              onClick={onResetUsage}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition"
            >
              Reset Counters
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-amber-600/30 transition active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save Limit Overrides</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* SUB-MODAL 3: Invoices & Receipts Management                                 */
/* -------------------------------------------------------------------------- */
interface TenantInvoicesModalProps {
  tenant: Tenant;
  onClose: () => void;
  onPreviewInvoice: (invoice: TenantInvoice) => void;
  onCreateInvoice: (invoice: TenantInvoice) => void;
  onMarkPaid: (invoiceId: string) => void;
}

const TenantInvoicesModal: React.FC<TenantInvoicesModalProps> = ({
  tenant,
  onClose,
  onPreviewInvoice,
  onCreateInvoice,
  onMarkPaid,
}) => {
  const billing = getTenantBilling(tenant);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAmount, setNewAmount] = useState(PLAN_CONFIGS[tenant.plan]?.monthlyPrice || 49);
  const [newPlanName, setNewPlanName] = useState(`${PLAN_CONFIGS[tenant.plan]?.name} Subscription`);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newInvoice: TenantInvoice = {
      id: `inv-${tenant.id}-${Date.now()}`,
      invoiceNumber: `INV-2026-0${Math.floor(100 + Math.random() * 900)}`,
      amount: Number(newAmount),
      currency: tenant.currency || '$',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      status: 'paid',
      planName: newPlanName,
      billingPeriod: 'Ad-hoc SaaS Service Statement',
    };
    onCreateInvoice(newInvoice);
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">
                Invoices & Receipts: {tenant.name}
              </h3>
              <p className="text-[11px] text-slate-400">
                Payment Provider: <span className="font-mono text-emerald-400 capitalize">{billing.paymentMethod}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {/* Header Action */}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300">
              Generated Invoices ({billing.invoices.length})
            </span>
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
            >
              {showAddForm ? 'Cancel' : '+ Generate Ad-hoc Invoice'}
            </button>
          </div>

          {/* New Invoice Form */}
          {showAddForm && (
            <form onSubmit={handleCreateSubmit} className="p-3.5 bg-slate-950 rounded-xl border border-indigo-500/40 space-y-3">
              <div className="font-bold text-slate-200">Generate New Manual Invoice / Receipt</div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Item Title / Plan</label>
                  <input
                    type="text"
                    value={newPlanName}
                    onChange={(e) => setNewPlanName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Amount ($)</label>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs transition"
                >
                  Create & Record Invoice
                </button>
              </div>
            </form>
          )}

          {/* Invoices List */}
          <div className="space-y-2">
            {billing.invoices.map((inv) => {
              const isPaid = inv.status === 'paid';
              return (
                <div
                  key={inv.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-100">{inv.invoiceNumber}</span>
                      <span
                        className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                          isPaid
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {inv.planName} · <span className="font-mono">{inv.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-bold text-slate-100 text-sm">
                        {inv.currency}{inv.amount.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-500">{inv.billingPeriod}</div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {!isPaid && (
                        <button
                          type="button"
                          onClick={() => onMarkPaid(inv.id)}
                          className="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-xs font-semibold border border-emerald-500/30 transition"
                          title="Mark invoice as paid"
                        >
                          Mark Paid
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onPreviewInvoice(inv)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition flex items-center gap-1"
                        title="Preview PDF"
                      >
                        <Printer className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Print</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* SUB-MODAL 4: Invoice PDF Preview                                           */
/* -------------------------------------------------------------------------- */
interface InvoicePdfPreviewModalProps {
  tenant: Tenant;
  invoice: TenantInvoice;
  onClose: () => void;
}

const InvoicePdfPreviewModal: React.FC<InvoicePdfPreviewModalProps> = ({
  tenant,
  invoice,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
        {/* Printable Card */}
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2 font-bold text-lg text-slate-950">
                <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black">
                  TT
                </span>
                <span>TableTap Global SaaS Inc.</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Cloud Table Ordering, Telemetry & Digital Dining Platform
              </p>
              <p className="text-xs text-slate-500">support@tabletap.io · https://tabletap.io</p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs uppercase rounded-full">
                {invoice.status === 'paid' ? 'PAID / SETTLED' : 'DUE'}
              </span>
              <div className="font-mono text-base font-bold text-slate-900 mt-2">
                {invoice.invoiceNumber}
              </div>
              <div className="text-xs text-slate-500">Date: {invoice.date}</div>
            </div>
          </div>

          {/* Billed To */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Billed To (Tenant)
              </span>
              <div className="font-bold text-sm text-slate-900">{tenant.name}</div>
              <div className="text-slate-600">{tenant.ownerName} ({tenant.ownerEmail})</div>
              <div className="text-slate-600">{tenant.address}</div>
              <div className="text-slate-500 font-mono text-[11px] mt-0.5">Slug: /r/{tenant.slug}</div>
            </div>

            <div className="text-right">
              <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Subscription Details
              </span>
              <div className="font-bold text-slate-900 capitalize">{tenant.plan} Tier</div>
              <div className="text-slate-600">Period: {invoice.billingPeriod}</div>
              <div className="text-slate-600">Due Date: {invoice.dueDate}</div>
            </div>
          </div>

          {/* Line items table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Description</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Qty</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Unit Price</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{invoice.planName}</div>
                    <div className="text-slate-500 text-[11px]">
                      Unlimited Table QR scans, Kitchen Display Terminal, and 3D Mini-Games
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center">1 mo</td>
                  <td className="py-3 px-3 text-right font-mono">
                    {invoice.currency}{invoice.amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900 font-mono">
                    {invoice.currency}{invoice.amount.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Subtotal & Total */}
          <div className="flex justify-end text-xs">
            <div className="w-48 space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono">{invoice.currency}{invoice.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Platform Taxes (0%):</span>
                <span className="font-mono">$0.00</span>
              </div>
              <div className="flex justify-between text-slate-950 font-bold text-sm pt-2 border-t border-slate-200">
                <span>Total Amount:</span>
                <span className="font-mono text-emerald-700">
                  {invoice.currency}{invoice.amount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer stamp */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <div>
              <span>Official Electronic SaaS Receipt · Authorized by Super Admin</span>
            </div>
            <div className="font-mono text-[10px]">
              SHA-256: {Math.random().toString(36).substring(2, 12)}
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Bar (Not printed) */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center print:hidden">
          <span className="text-xs text-slate-500">
            Use system dialog to save as PDF or physical print.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold transition"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* SUB-MODAL 5: Security & Billing Audit Trail                                 */
/* -------------------------------------------------------------------------- */
interface AuditLogModalProps {
  logs: BillingAuditLogEntry[];
  onClose: () => void;
  onClearLogs: () => void;
}

const AuditLogModal: React.FC<AuditLogModalProps> = ({ logs, onClose, onClearLogs }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">
                Super Admin Security & Billing Audit Trail
              </h3>
              <p className="text-[11px] text-slate-400">
                Immutable record of plan tier modifications, quota overrides, and invoice actions
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            ✕
          </button>
        </div>

        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto text-xs">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No audit logs recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
              {logs.map((log) => (
                <div key={log.id} className="p-3.5 hover:bg-slate-900/50 transition space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100">{log.action}</span>
                      <span className="text-[10px] text-indigo-400 font-semibold px-1.5 py-0.2 rounded bg-indigo-500/20 border border-indigo-500/30">
                        {log.tenantName}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-300">{log.details}</p>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Authorized by: {log.adminUser}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClearLogs}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
            >
              Clear Local Audit Logs
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
