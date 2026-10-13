export type SubscriptionPlan = 'starter' | 'pro' | 'enterprise';

export type AppLanguage = 'en' | 'hi' | 'es' | 'fr' | 'ar';

export interface TenantSocials {
  instagram?: string;
  googleMaps?: string;
  whatsapp?: string;
  tiktok?: string;
  website?: string;
  phone?: string;
}

export interface WifiConfig {
  enabled: boolean;
  ssid: string;
  password: string;
  securityType: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export interface LoyaltyConfig {
  enabled: boolean;
  stampsRequired: number; // e.g., 8 stamps
  rewardTitle: string; // e.g., "Free Specialty Coffee or Artisan Croissant"
  terms: string;
  stampIcon: string; // 'coffee' | 'star' | 'gift' | 'utensils' | 'heart'
  secretStaffPin: string; // e.g., "1234" for shop staff to punch stamps
}

export interface PaymentGatewayConfig {
  enabled: boolean;
  provider: 'upi_direct' | 'stripe' | 'razorpay' | 'cash_only';
  upiId?: string; // e.g. "artisanroast@okhdfcbank"
  upiPayeeName?: string;
  stripePublishableKey?: string;
  stripeAccountId?: string;
  razorpayKeyId?: string;
  enableAppleGooglePay: boolean;
  requirePrepayment: boolean; // must pay before sending to kitchen
  taxRatePercent: number; // e.g. 5 or 8.25
}

export interface MenuItem {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  description: string;
  imageUrl?: string;
  isVeg: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isSpicy?: boolean;
  isBestseller?: boolean;
  isAvailable: boolean;
  calories?: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  order: number;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

export type OrderStatus = 'pending' | 'preparing' | 'served' | 'paid' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
export type PaymentMethod = 'upi' | 'card' | 'counter';

export interface TableOrder {
  id: string;
  orderNumber: number;
  tenantId: string;
  tableNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  paidAt?: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  createdAt: string;
  estimatedMinutes?: number;
}

export type ServiceRequestType = 'waiter' | 'water' | 'bill' | 'cleaning' | 'cutlery' | 'custom';

export interface ServiceRequest {
  id: string;
  tenantId: string;
  tableNumber: string;
  type: ServiceRequestType;
  title: string;
  note?: string;
  createdAt: string;
  status: 'pending' | 'acknowledged' | 'completed';
}

export interface CustomerFeedback {
  id: string;
  tenantId: string;
  tableNumber: string;
  overallRating: number; // 1-5
  foodRating: number;
  serviceRating: number;
  ambianceRating: number;
  comment: string;
  tags: string[]; // e.g. "Fast Service", "Great Music", "Cold Food"
  createdAt: string;
  customerContact?: string;
  status: 'new' | 'reviewed' | 'resolved';
}

export interface CustomerLoyaltyCard {
  id: string;
  tenantId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  stampsCount: number;
  totalRewardsRedeemed: number;
  lastStampedAt: string;
  history: {
    id: string;
    type: 'stamp_added' | 'reward_redeemed';
    date: string;
    tableNumber?: string;
    stampedByStaffPin?: string;
  }[];
}

export interface TableQR {
  id: string;
  tenantId: string;
  tableNumber: string;
  section?: string; // "Indoor", "Patio", "Bar", "Terrace"
  qrUrl: string;
  totalScans: number;
  lastScannedAt?: string;
}

export type TenantPlanStatus = 'active' | 'trial' | 'past_due' | 'grace_period' | 'suspended';

export interface TenantInvoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  date: string;
  dueDate: string;
  status: 'paid' | 'due' | 'void' | 'refunded';
  planName: string;
  billingPeriod: string;
  pdfUrl?: string;
}

export interface TenantBillingInfo {
  billingCycle: 'monthly' | 'annual';
  nextBillingDate: string;
  amountDue: number;
  paymentMethod: 'stripe' | 'razorpay' | 'wire' | 'manual';
  customerBillingId?: string;
  autoRenew: boolean;
  discountPercent?: number;
  invoices: TenantInvoice[];
}

export interface TenantApiLimits {
  scanLimitMonthly: number;
  scanUsedThisMonth: number;
  orderWebhookLimitMonthly: number;
  orderWebhookUsedThisMonth: number;
  aiBotCallsLimitMonthly: number;
  aiBotCallsUsedThisMonth: number;
  maxConcurrentWebsockets: number;
  currentConcurrentWebsockets: number;
  storageMbLimit: number;
  storageMbUsed: number;
  enforcementPolicy: 'hard_throttle' | 'soft_warning' | 'auto_scale';
  rateLimitPerMinute: number;
  apiKey: string;
  apiKeyLastRotated: string;
}

export interface BillingAuditLogEntry {
  id: string;
  tenantId: string;
  tenantName: string;
  action: string;
  details: string;
  adminUser: string;
  timestamp: string;
}

export interface Tenant {
  id: string;
  slug: string; // e.g., "artisan-roast"
  name: string;
  tagline: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  themeColor: string; // Hex color code e.g., #b45309 or #059669
  accentColor: string;
  darkMode: boolean;
  createdAt: string;
  plan: SubscriptionPlan;
  planStatus: TenantPlanStatus;
  ownerName: string;
  ownerEmail: string;
  address: string;
  currency: string; // "$", "€", "₹", "£"
  
  // Feature Toggles
  features: {
    menu: boolean;
    ordering: boolean; // Direct table ordering from menu
    loyalty: boolean;
    googleReviews: boolean;
    wifi: boolean;
    feedback: boolean;
    games: boolean;
    payments?: boolean; // Payment Gateway & Checkout settlement
    serviceBell?: boolean; // Call Waiter & Table Service Bell
  };
  
  socials: TenantSocials;
  wifi: WifiConfig;
  loyalty: LoyaltyConfig;
  payments: PaymentGatewayConfig;
  googleReviewUrl: string;

  // Billing & API usage limits
  billing?: TenantBillingInfo;
  apiLimits?: TenantApiLimits;
  
  // Totals for quick display
  stats: {
    totalScans: number;
    menuViews: number;
    loyaltyCardsIssued: number;
    feedbackCount: number;
    averageRating: number;
    totalOrdersCount?: number;
  };
}

export type AppViewMode = 'customer' | 'owner' | 'superadmin' | 'docs';

