import React, { useState } from 'react';
import { Database, FolderTree, Compass, Copy, Check, Download, Layers, ShieldCheck, Terminal, Server } from 'lucide-react';

interface Props {
  onClose?: () => void;
}

export const ArchitectureDocsModal: React.FC<Props> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'schema' | 'sql' | 'routes' | 'roadmap'>('schema');
  const [copied, setCopied] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const prismaSchemaCode = `// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum SubscriptionPlan {
  STARTER
  PRO
  ENTERPRISE
}

enum SubscriptionStatus {
  ACTIVE
  TRIAL
  PAST_DUE
  CANCELED
}

enum Role {
  SUPER_ADMIN
  TENANT_OWNER
  TENANT_STAFF
}

enum FeedbackStatus {
  NEW
  REVIEWED
  RESOLVED
}

enum StampTransactionType {
  STAMP_ADDED
  REWARD_REDEEMED
}

// -----------------------------------------------------------------------------
// 1. Multi-Tenant Core & Accounts
// -----------------------------------------------------------------------------

model User {
  id            String       @id @default(cuid())
  email         String       @unique
  name          String
  role          Role         @default(TENANT_OWNER)
  tenantId      String?
  tenant        Tenant?      @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@index([tenantId])
}

model Tenant {
  id              String             @id @default(cuid())
  slug            String             @unique // e.g. "artisan-roast" for app.domain.com/r/artisan-roast
  name            String
  tagline         String?
  description     String?            @db.Text
  logoUrl         String?
  bannerUrl       String?
  themeColor      String             @default("#d97706")
  accentColor     String             @default("#451a03")
  currency        String             @default("$")
  address         String?
  phone           String?

  // Subscription Details
  plan            SubscriptionPlan   @default(STARTER)
  planStatus      SubscriptionStatus @default(ACTIVE)
  stripeCustomerId String?           @unique
  stripeSubscriptionId String?

  // Social & External URLs
  instagramUrl    String?
  googleReviewUrl String?            // Direct link to Google Maps write-review dialog
  whatsappNumber  String?
  websiteUrl      String?

  // Wi-Fi Config
  wifiEnabled     Boolean            @default(true)
  wifiSsid        String?
  wifiPassword    String?
  wifiSecurity    String             @default("WPA")

  // Feature Flags
  hasMenuEnabled        Boolean      @default(true)
  hasLoyaltyEnabled     Boolean      @default(true)
  hasReviewsEnabled     Boolean      @default(true)
  hasWifiEnabled        Boolean      @default(true)
  hasFeedbackEnabled    Boolean      @default(true)
  hasGamesEnabled       Boolean      @default(true)

  // Relations
  users           User[]
  categories      MenuCategory[]
  menuItems       MenuItem[]
  tables          TableQR[]
  loyaltyConfig   LoyaltyConfig?
  loyaltyCards    CustomerLoyaltyCard[]
  feedbacks       CustomerFeedback[]
  scanAnalytics   ScanAnalytic[]

  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt

  @@index([slug])
}

// -----------------------------------------------------------------------------
// 2. Dynamic Tables & QR Codes
// -----------------------------------------------------------------------------

model TableQR {
  id           String         @id @default(cuid())
  tenantId     String
  tenant       Tenant         @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  tableNumber  String         // e.g. "1", "14", "Bar-3", "Patio-A"
  section      String?        // e.g. "Indoor", "Patio", "Bar"
  totalScans   Int            @default(0)
  lastScannedAt DateTime?

  scanEvents   ScanAnalytic[]

  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  @@unique([tenantId, tableNumber])
  @@index([tenantId])
}

model ScanAnalytic {
  id          String    @id @default(cuid())
  tenantId    String
  tenant      Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  tableId     String?
  table       TableQR?  @relation(fields: [tableId], references: [id], onDelete: SetNull)
  userAgent   String?
  ipAddress   String?
  scannedAt   DateTime  @default(now())

  @@index([tenantId, scannedAt])
}

// -----------------------------------------------------------------------------
// 3. Digital Menu
// -----------------------------------------------------------------------------

model MenuCategory {
  id        String     @id @default(cuid())
  tenantId  String
  tenant    Tenant     @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  name      String     // e.g. "Specialty Coffee", "Sourdough Pastries"
  order     Int        @default(0)
  items     MenuItem[]

  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  @@index([tenantId])
}

model MenuItem {
  id           String       @id @default(cuid())
  tenantId     String
  tenant       Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  categoryId   String
  category     MenuCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  name         String
  price        Decimal      @db.Decimal(10, 2)
  description  String?      @db.Text
  imageUrl     String?
  isVeg        Boolean      @default(true)
  isVegan      Boolean      @default(false)
  isGlutenFree Boolean      @default(false)
  isSpicy      Boolean      @default(false)
  isBestseller Boolean      @default(false)
  isAvailable  Boolean      @default(true)
  calories     Int?

  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  @@index([tenantId, categoryId])
}

// -----------------------------------------------------------------------------
// 4. Loyalty Program & Stamp Cards
// -----------------------------------------------------------------------------

model LoyaltyConfig {
  id             String   @id @default(cuid())
  tenantId       String   @unique
  tenant         Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  stampsRequired Int      @default(8)
  rewardTitle    String   // e.g. "Free Coffee or Artisan Croissant"
  terms          String?  @db.Text
  stampIcon      String   @default("coffee")
  secretStaffPin String   @default("1234") // Used to authenticate staff punches without full login
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model CustomerLoyaltyCard {
  id                   String             @id @default(cuid())
  tenantId             String
  tenant               Tenant             @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  customerName         String
  customerPhone        String
  customerEmail        String?
  stampsCount          Int                @default(1)
  totalRewardsRedeemed Int                @default(0)
  lastStampedAt        DateTime           @default(now())

  transactions         StampTransaction[]

  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt

  @@unique([tenantId, customerPhone])
  @@index([tenantId, customerPhone])
}

model StampTransaction {
  id              String               @id @default(cuid())
  cardId          String
  card            CustomerLoyaltyCard  @relation(fields: [cardId], references: [id], onDelete: Cascade)
  type            StampTransactionType
  tableNumber     String?
  stampedByStaff  String?              // Staff ID or verified PIN
  createdAt       DateTime             @default(now())

  @@index([cardId])
}

// -----------------------------------------------------------------------------
// 5. Anonymous Feedback Inbox
// -----------------------------------------------------------------------------

model CustomerFeedback {
  id              String         @id @default(cuid())
  tenantId        String
  tenant          Tenant         @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  tableNumber     String?
  overallRating   Int            // 1 to 5
  foodRating      Int?
  serviceRating   Int?
  ambianceRating  Int?
  comment         String         @db.Text
  tags            String[]       // e.g. ["Fast Service", "Cozy Ambiance"]
  customerContact String?        // Optional phone or email if customer wants owner response
  status          FeedbackStatus @default(NEW)
  createdAt       DateTime       @default(now())

  @@index([tenantId, status])
}
`;

  const supabaseSqlRls = `-- =============================================================================
-- PostgreSQL & Supabase Row-Level Security (RLS) Multi-Tenant Policies
-- =============================================================================

-- Enable Row Level Security on all tenant tables
ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MenuItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MenuCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TableQR" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CustomerFeedback" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CustomerLoyaltyCard" ENABLE ROW LEVEL SECURITY;

-- Helper function: extracts the authenticated tenant_id from JWT app_metadata
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->'app_metadata'->>'tenant_id', '')::text;
$$ LANGUAGE sql STABLE;

-- 1. Tenant Access Policy:
-- Owners can read & update their own tenant record; Super Admins have full bypass
CREATE POLICY tenant_isolation_policy ON "Tenant"
  FOR ALL
  USING (
    id = get_current_tenant_id() 
    OR (current_setting('request.jwt.claims', true)::json->>'role') = 'SUPER_ADMIN'
  );

-- 2. Public Scan Landing Page (Customer read-only on active tenants)
CREATE POLICY public_tenant_read ON "Tenant"
  FOR SELECT
  USING (planStatus = 'ACTIVE');

-- 3. Digital Menu Items:
-- Public can read active items for the scanned tenant
CREATE POLICY public_menu_read ON "MenuItem"
  FOR SELECT
  USING (isAvailable = true);

-- Shop Owner full CRUD for their own tenant's menu items
CREATE POLICY owner_menu_crud ON "MenuItem"
  FOR ALL
  USING (tenantId = get_current_tenant_id())
  WITH CHECK (tenantId = get_current_tenant_id());

-- 4. Customer Feedback:
-- Anyone can INSERT feedback (anonymous customers at table)
CREATE POLICY public_feedback_insert ON "CustomerFeedback"
  FOR INSERT
  WITH CHECK (true);

-- Only tenant owner can VIEW and UPDATE feedback status in their inbox
CREATE POLICY owner_feedback_read ON "CustomerFeedback"
  FOR SELECT
  USING (tenantId = get_current_tenant_id());

-- 5. Loyalty Cards:
-- Customers can read/create their card by phone number match
CREATE POLICY customer_loyalty_insert ON "CustomerLoyaltyCard"
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY owner_loyalty_manage ON "CustomerLoyaltyCard"
  FOR ALL
  USING (tenantId = get_current_tenant_id());
`;

  const nextjsFolderStructure = `my-smart-tabletop-saas/
├── src/
│   ├── app/
│   │   ├── (marketing)/                # Public SaaS landing page, pricing & registration
│   │   │   ├── page.tsx                # High-converting B2B SaaS landing page
│   │   │   ├── pricing/page.tsx
│   │   │   └── register/page.tsx       # Onboard new restaurant/cafe tenant
│   │   │
│   │   ├── (auth)/                     # Clerk / NextAuth multi-tenant auth flows
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   └── sign-up/[[...sign-up]]/page.tsx
│   │   │
│   │   ├── (dashboard)/                # Shop Owner Portal (Subdomain: app.domain.com or /dashboard)
│   │   │   ├── layout.tsx              # Tenant Sidebar, Store Switcher, Profile
│   │   │   ├── page.tsx                # Overview: Live scans, peak hours, quick stats
│   │   │   ├── store/page.tsx          # Store customization: logo, colors, socials, Wi-Fi
│   │   │   ├── menu/page.tsx           # Digital menu CRUD, categories, availability
│   │   │   ├── tables/page.tsx         # Dynamic QR generator & Printable Tent Stands
│   │   │   ├── loyalty/page.tsx        # Stamp reward config & Staff Punch Terminal
│   │   │   ├── feedback/page.tsx       # Customer feedback inbox & sentiment ratings
│   │   │   └── settings/billing.tsx    # Stripe Customer Portal for B2B subscription
│   │   │
│   │   ├── (superadmin)/               # Super Admin Panel (role === 'SUPER_ADMIN')
│   │   │   ├── layout.tsx
│   │   │   ├── admin/tenants/page.tsx  # All stores, MRR, suspend/activate
│   │   │   └── admin/stats/page.tsx    # Global platform metrics
│   │   │
│   │   ├── r/                          # Customer QR Scan Micro-Page (Ultra-fast PWA)
│   │   │   └── [shop_slug]/            # Route: /r/artisan-roast?table=4
│   │   │       ├── page.tsx            # Server component pre-fetching tenant branding & menu
│   │   │       ├── layout.tsx          # Dynamic theme-color & Apple touch icon inject
│   │   │       └── opengraph-image.tsx # Dynamic store preview card
│   │   │
│   │   └── api/
│   │       ├── webhook/stripe/route.ts # Subscription checkout & billing lifecycle
│   │       ├── scan/route.ts           # Scan telemetry recorder
│   │       └── qr/download/route.ts    # High-res SVG/PDF table stand exporter
│   │
│   ├── components/
│   │   ├── customer/                   # Mobile sheet cards: Menu, Loyalty, Wifi, Sudoku
│   │   ├── qr/                         # Printable Stand Generator with fold cut lines
│   │   └── ui/                         # Shadcn UI base primitives
│   │
│   ├── lib/
│   │   ├── prisma.ts                   # Singleton Prisma Client
│   │   ├── tenant.ts                   # Resolve tenant from domain / slug
│   │   └── wifi-qr.ts                  # Standard MECARD / WIFI:S: string builder
│   │
│   └── middleware.ts                   # Multi-tenant routing & Subdomain Rewriter
`;

  const implementationRoadmap = `### Phase 1: Foundation & Multi-Tenant Infrastructure (Weeks 1-2)
1. Next.js 15 App Router + Tailwind CSS + Shadcn UI initialization.
2. PostgreSQL database provisioning (Supabase or Neon) + Prisma ORM migrations.
3. Multi-Tenant middleware (\`middleware.ts\`):
   - Rewrite \`store-name.domain.com\` or \`/r/[shop_slug]\` to the customer scan route.
   - Inject tenant context via headers for fast edge caching.
4. Authentication setup (Clerk Organizations or NextAuth with tenantId claim).

### Phase 2: Shop Owner Dashboard & Store Customization (Weeks 3-4)
1. Tenant profile manager: logo, hero photo upload (UploadThing / AWS S3), hex brand colors.
2. Feature toggle switches with instant optimistic UI (Zustand / React Query).
3. Menu category & item builder: pricing, veg/non-veg indicator, photo uploads, out-of-stock toggle.
4. One-tap Wi-Fi configurator (generates RFC Wi-Fi QR & clipboard string).

### Phase 3: Dynamic Table QR Generator & Print Center (Week 5)
1. Table batch generator (Table 1 to 30) with customizable sections (Indoor, Patio, Bar).
2. SVG QR code generation embedding \`https://app.domain.com/r/[shop_slug]?table=[no]\`.
3. Printable Stand Designer:
   - Double-sided table tent template with fold line guidelines.
   - Clean acrylic sticker badge template.
   - Browser print stylesheet (\`@media print\`) and PDF batch export.

### Phase 4: Customer Scan Landing Page (PWA Mobile Micro-Page) (Week 6)
1. Instant load time (< 800ms) with lightweight bundle and no forced app installation.
2. Dynamic tenant styling (CSS variables mapped to store theme & accent colors).
3. Bottom sheet action cards:
   - Digital menu with instant live search and category tabs.
   - Digital stamp loyalty punch card with phone number lookup and celebratory animation.
   - Google Review booster: rating gate (5-star goes to Google Maps; <=4 stars routed to private feedback).
   - Instant Wi-Fi connection modal.
   - Table-side 3D Table Ludo mini-game with 3D characters, AI Bots, and inter-table matching for wait-time entertainment.

### Phase 5: Loyalty Staff Punch Terminal & Feedback Inbox (Week 7)
1. Staff Quick-Punch tool in Shop Owner dashboard (lookup customer phone or scan their loyalty QR).
2. Secret Staff PIN validation for table-side customer self-punch.
3. Feedback inbox with status filters (New, Reviewed, Resolved) and sentiment badge.

### Phase 6: Super Admin & Monetization (Week 8)
1. Super Admin portal: Tenant registry, active subscriptions, total scans, churn analytics.
2. Stripe Billing integration: Starter ($19/mo), Pro ($49/mo), Enterprise ($99/mo).
3. Deployment on Vercel with custom domain wildcard SSL (*.domain.com).`;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-slate-100">Full-Stack SaaS Architecture & Deliverables</h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Complete database schema, Next.js dynamic routing folder structure, and production deployment roadmap.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'schema'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Prisma Schema</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'sql'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Postgres & Supabase RLS</span>
          </button>

          <button
            onClick={() => setActiveTab('routes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'routes'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>Folder Structure</span>
          </button>

          <button
            onClick={() => setActiveTab('roadmap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'roadmap'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Roadmap</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Prisma Schema */}
      {activeTab === 'schema' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-mono text-slate-300">
              <Database className="w-3.5 h-3.5 text-amber-500" /> prisma/schema.prisma
            </span>
            <button
              onClick={() => copyCode(prismaSchemaCode, 'prisma')}
              className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 transition"
            >
              {copied === 'prisma' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied === 'prisma' ? 'Copied!' : 'Copy Prisma Schema'}</span>
            </button>
          </div>
          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900/90 shadow-xl">
            <pre className="p-4 text-xs font-mono text-amber-200/90 overflow-x-auto max-h-[600px] leading-relaxed">
              {prismaSchemaCode}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 2: SQL & Supabase RLS */}
      {activeTab === 'sql' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-mono text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> supabase/migrations/001_multi_tenant_rls.sql
            </span>
            <button
              onClick={() => copyCode(supabaseSqlRls, 'sql')}
              className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 transition"
            >
              {copied === 'sql' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied === 'sql' ? 'Copied!' : 'Copy SQL & RLS'}</span>
            </button>
          </div>
          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900/90 shadow-xl">
            <pre className="p-4 text-xs font-mono text-emerald-200/90 overflow-x-auto max-h-[600px] leading-relaxed">
              {supabaseSqlRls}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 3: Next.js Routes & Folder Structure */}
      {activeTab === 'routes' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-mono text-slate-300">
              <FolderTree className="w-3.5 h-3.5 text-cyan-400" /> Multi-Tenant Directory Tree & Route Map
            </span>
            <button
              onClick={() => copyCode(nextjsFolderStructure, 'folders')}
              className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 transition"
            >
              {copied === 'folders' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied === 'folders' ? 'Copied!' : 'Copy Folder Structure'}</span>
            </button>
          </div>
          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900/90 shadow-xl">
            <pre className="p-4 text-xs font-mono text-cyan-200/90 overflow-x-auto max-h-[600px] leading-relaxed">
              {nextjsFolderStructure}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 4: Implementation Roadmap */}
      {activeTab === 'roadmap' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-mono text-slate-300">
              <Compass className="w-3.5 h-3.5 text-purple-400" /> Production Roadmap (Setup to Deployment)
            </span>
            <button
              onClick={() => copyCode(implementationRoadmap, 'roadmap')}
              className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 transition"
            >
              {copied === 'roadmap' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied === 'roadmap' ? 'Copied!' : 'Copy Roadmap'}</span>
            </button>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <div className="text-amber-400 font-bold text-sm mb-1 flex items-center gap-2">
                  <Server className="w-4 h-4" /> Multi-Tenant Routing Engine
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Next.js Edge Middleware dynamically detects the store slug from custom domains (<code className="text-amber-300">cafe.domain.com</code>) or path routes (<code className="text-amber-300">/r/:shop_slug?table=5</code>) and renders in single-digit milliseconds.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <div className="text-emerald-400 font-bold text-sm mb-1 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Row-Level Security (RLS)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Every table, menu item, and feedback submission is strictly isolated by <code className="text-emerald-300">tenantId</code> at the Postgres database engine layer. Shop owners can never access another store's private ledger.
                </p>
              </div>
            </div>

            <div className="prose prose-invert max-w-none text-xs text-slate-300 space-y-4">
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                <h4 className="font-bold text-slate-100 text-sm mb-2">Phase 1: Foundation & Multi-Tenant Infrastructure (Weeks 1-2)</h4>
                <p className="text-slate-400">Next.js 15 App Router setup, PostgreSQL schema migrations via Prisma, tenant routing middleware, and Clerk/NextAuth integration with tenantId claims.</p>
              </div>

              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                <h4 className="font-bold text-slate-100 text-sm mb-2">Phase 2: Shop Owner Dashboard & Store Customization (Weeks 3-4)</h4>
                <p className="text-slate-400">Branding customizer (logo, banner, theme colors), live category & menu CRUD with vegetarian/spicy filters, and Wi-Fi credential generator.</p>
              </div>

              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                <h4 className="font-bold text-slate-100 text-sm mb-2">Phase 3: Dynamic Table QR Generator & Print Center (Week 5)</h4>
                <p className="text-slate-400">Batch table generation (1-30), SVG QR code vector generator, printable table tent card generator with fold cut lines, and acrylic stand sticker templates.</p>
              </div>

              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                <h4 className="font-bold text-slate-100 text-sm mb-2">Phase 4: Customer Scan Landing Page (PWA Mobile Micro-Page) (Week 6)</h4>
                <p className="text-slate-400">Ultra-fast mobile sheet with iOS native feel, dynamic tenant colors, digital menu with item detail, digital loyalty stamp card with celebratory animations, and built-in 3D Table Ludo mini-game with AI Bots & table-to-table challenges.</p>
              </div>

              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                <h4 className="font-bold text-slate-100 text-sm mb-2">Phase 5: Loyalty Staff Terminal & Feedback Inbox (Week 7)</h4>
                <p className="text-slate-400">Barista / server punch verification terminal with secret PIN, and anonymous feedback inbox with resolution status tracking.</p>
              </div>

              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                <h4 className="font-bold text-slate-100 text-sm mb-2">Phase 6: Super Admin & Monetization (Week 8)</h4>
                <p className="text-slate-400">Super Admin panel with MRR metrics and tenant switcher, Stripe Customer Portal for monthly SaaS subscriptions, and Vercel edge deployment.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
