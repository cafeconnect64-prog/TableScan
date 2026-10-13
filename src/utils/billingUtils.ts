import { Tenant, SubscriptionPlan, TenantBillingInfo, TenantApiLimits, TenantInvoice, BillingAuditLogEntry } from '../types';

export interface PlanConfig {
  id: SubscriptionPlan;
  name: string;
  monthlyPrice: number;
  annualPrice: number; // billed annually, per month equivalent
  tagline: string;
  features: string[];
  defaultLimits: {
    scanLimitMonthly: number;
    orderWebhookLimitMonthly: number;
    aiBotCallsLimitMonthly: number;
    maxConcurrentWebsockets: number;
    storageMbLimit: number;
    rateLimitPerMinute: number;
  };
}

export const PLAN_CONFIGS: Record<SubscriptionPlan, PlanConfig> = {
  starter: {
    id: 'starter',
    name: 'Starter Plan',
    monthlyPrice: 19,
    annualPrice: 15,
    tagline: 'Ideal for single cafés, food trucks, and small dining bars',
    features: [
      'Digital Menu & Table QR stand generation',
      'Table Ordering & Service Call Bells',
      'Basic Customer Feedback collection',
      'Up to 5,000 monthly table scans',
      'Standard UPI Direct & Cash settlement',
      'Standard support (48h response)',
    ],
    defaultLimits: {
      scanLimitMonthly: 5000,
      orderWebhookLimitMonthly: 2500,
      aiBotCallsLimitMonthly: 1000,
      maxConcurrentWebsockets: 15,
      storageMbLimit: 250,
      rateLimitPerMinute: 60,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro Growth Plan',
    monthlyPrice: 49,
    annualPrice: 39,
    tagline: 'Best for busy restaurants, multi-room dining, and microbreweries',
    features: [
      'Everything in Starter',
      'Customer Digital Loyalty Stamp Terminal',
      '3D Table Ludo Mini-Games with AI Bot',
      'Up to 25,000 monthly table scans',
      'Direct Stripe & Razorpay checkout integration',
      'Kitchen Order Display with live chimes',
      'Priority email & chat support',
    ],
    defaultLimits: {
      scanLimitMonthly: 25000,
      orderWebhookLimitMonthly: 15000,
      aiBotCallsLimitMonthly: 5000,
      maxConcurrentWebsockets: 60,
      storageMbLimit: 2000,
      rateLimitPerMinute: 180,
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Ultra Plan',
    monthlyPrice: 99,
    annualPrice: 79,
    tagline: 'Engineered for high-volume restaurants, hotel chains, and franchises',
    features: [
      'Everything in Pro',
      'Unlimited Table QR scans & ordering capacity',
      'Table-to-Table multiplayer Ludo match duels',
      'Dedicated POS & webhook sync rate limit (600 rpm)',
      'Multi-unit tenant reporting & custom branding',
      'Service Kill-Switch master bypass',
      'Dedicated SLA & 24/7 account management',
    ],
    defaultLimits: {
      scanLimitMonthly: 100000,
      orderWebhookLimitMonthly: 60000,
      aiBotCallsLimitMonthly: 25000,
      maxConcurrentWebsockets: 250,
      storageMbLimit: 10000,
      rateLimitPerMinute: 600,
    },
  },
};

export const DEFAULT_SUPERADMIN_PASSKEY = 'ADMIN-8822';

/**
 * Returns populated billing information for a tenant, falling back to sensible defaults.
 */
export function getTenantBilling(tenant: Tenant): TenantBillingInfo {
  if (tenant.billing && Array.isArray(tenant.billing.invoices)) {
    return tenant.billing;
  }

  const plan = tenant.plan || 'pro';
  const planConfig = PLAN_CONFIGS[plan] || PLAN_CONFIGS.pro;
  const isAnnual = false;
  const price = isAnnual ? planConfig.annualPrice * 12 : planConfig.monthlyPrice;

  // Generate realistic initial invoice records
  const initialInvoices: TenantInvoice[] = [
    {
      id: `inv-${tenant.id}-01`,
      invoiceNumber: `INV-2026-0${tenant.id.replace(/\D/g, '') || '1'}01`,
      amount: price,
      currency: tenant.currency || '$',
      date: '2026-03-01',
      dueDate: '2026-03-01',
      status: 'paid',
      planName: planConfig.name,
      billingPeriod: 'Mar 1, 2026 - Mar 31, 2026',
    },
    {
      id: `inv-${tenant.id}-02`,
      invoiceNumber: `INV-2026-0${tenant.id.replace(/\D/g, '') || '1'}02`,
      amount: price,
      currency: tenant.currency || '$',
      date: '2026-02-01',
      dueDate: '2026-02-01',
      status: 'paid',
      planName: planConfig.name,
      billingPeriod: 'Feb 1, 2026 - Feb 28, 2026',
    },
  ];

  return {
    billingCycle: 'monthly',
    nextBillingDate: '2026-04-01',
    amountDue: 0,
    paymentMethod: tenant.payments?.provider === 'stripe' ? 'stripe' : 'razorpay',
    customerBillingId: `cus_${tenant.slug.replace(/-/g, '_')}_pay`,
    autoRenew: true,
    discountPercent: 0,
    invoices: initialInvoices,
  };
}

/**
 * Returns populated API limits and telemetry counters for a tenant.
 */
export function getTenantApiLimits(tenant: Tenant): TenantApiLimits {
  if (tenant.apiLimits && typeof tenant.apiLimits.scanLimitMonthly === 'number') {
    return tenant.apiLimits;
  }

  const plan = tenant.plan || 'pro';
  const planDefaults = PLAN_CONFIGS[plan]?.defaultLimits || PLAN_CONFIGS.pro.defaultLimits;

  // Use tenant stats to seed realistic usage metrics
  const totalScans = tenant.stats?.totalScans || 1200;
  const scansThisMonth = Math.min(planDefaults.scanLimitMonthly * 0.95, Math.max(450, Math.floor(totalScans * 0.45)));
  const webhooksThisMonth = Math.floor(scansThisMonth * 0.4);
  const aiCallsThisMonth = Math.floor(scansThisMonth * 0.15);
  const concurrentWs = Math.min(planDefaults.maxConcurrentWebsockets, Math.max(3, Math.floor(scansThisMonth / 200)));
  const storageUsed = Math.floor(planDefaults.storageMbLimit * 0.35);

  return {
    scanLimitMonthly: planDefaults.scanLimitMonthly,
    scanUsedThisMonth: scansThisMonth,
    orderWebhookLimitMonthly: planDefaults.orderWebhookLimitMonthly,
    orderWebhookUsedThisMonth: webhooksThisMonth,
    aiBotCallsLimitMonthly: planDefaults.aiBotCallsLimitMonthly,
    aiBotCallsUsedThisMonth: aiCallsThisMonth,
    maxConcurrentWebsockets: planDefaults.maxConcurrentWebsockets,
    currentConcurrentWebsockets: concurrentWs,
    storageMbLimit: planDefaults.storageMbLimit,
    storageMbUsed: storageUsed,
    enforcementPolicy: 'soft_warning',
    rateLimitPerMinute: planDefaults.rateLimitPerMinute,
    apiKey: `tt_live_${tenant.slug.replace(/-/g, '')}_${Math.random().toString(36).substring(2, 10)}`,
    apiKeyLastRotated: tenant.createdAt || '2026-01-15',
  };
}

export const INITIAL_AUDIT_LOGS: BillingAuditLogEntry[] = [
  {
    id: 'audit-01',
    tenantId: 'tenant-1',
    tenantName: 'Artisan Roast & Bakery',
    action: 'Plan Retained & Verified',
    details: 'Verified Pro Tier with 25,000 monthly scan capacity and UPI gateway.',
    adminUser: 'superadmin@tabletap.io',
    timestamp: '2026-03-15 10:24 AM',
  },
  {
    id: 'audit-02',
    tenantId: 'tenant-2',
    tenantName: 'Tokyo Umami Ramen Bar',
    action: 'Limit Auto-Scaling Enabled',
    details: 'Upgraded to Enterprise Ultra Plan with 100,000 QR scans and 600 RPM POS rate limit.',
    adminUser: 'superadmin@tabletap.io',
    timestamp: '2026-03-10 03:45 PM',
  },
  {
    id: 'audit-03',
    tenantId: 'tenant-3',
    tenantName: 'Bella Vista Trattoria',
    action: 'Invoice Settled',
    details: 'March subscription payment $19.00 processed via Stripe Customer Portal.',
    adminUser: 'billing-cron@tabletap.io',
    timestamp: '2026-03-01 00:01 AM',
  },
];
