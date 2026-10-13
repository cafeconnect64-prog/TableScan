import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Palette,
  Wifi,
  Share2,
  Sliders,
  Check,
  Save,
  MapPin,
  ExternalLink,
  Sparkles,
  Phone,
  Instagram,
  QrCode,
  Gamepad2,
  MessageSquare,
  Gift,
  BookOpen,
  CreditCard,
  Bell,
} from 'lucide-react';

const PRESET_PALETTES = [
  { name: 'Warm Amber & Espresso', theme: '#d97706', accent: '#451a03' },
  { name: 'Tokyo Crimson & Slate', theme: '#e11d48', accent: '#0f172a' },
  { name: 'Emerald Bistro & Forest', theme: '#059669', accent: '#064e3b' },
  { name: 'Deep Indigo & Cobalt', theme: '#4f46e5', accent: '#1e1b4b' },
  { name: 'Terracotta & Rust', theme: '#ea580c', accent: '#431407' },
  { name: 'Matte Charcoal & Gold', theme: '#eab308', accent: '#18181b' },
];

export const StoreCustomizer: React.FC = () => {
  const { activeTenant, updateActiveTenant } = useStore();

  const sanitizeTenant = (tenant: typeof activeTenant) => ({
    ...tenant,
    name: tenant.name || '',
    slug: tenant.slug || '',
    tagline: tenant.tagline || '',
    description: tenant.description || '',
    logoUrl: tenant.logoUrl || '',
    bannerUrl: tenant.bannerUrl || '',
    themeColor: tenant.themeColor || '#d97706',
    accentColor: tenant.accentColor || '#451a03',
    currency: tenant.currency || '$',
    googleReviewUrl: tenant.googleReviewUrl || '',
    wifi: {
      enabled: tenant.wifi?.enabled ?? true,
      ssid: tenant.wifi?.ssid || '',
      password: tenant.wifi?.password || '',
      securityType: tenant.wifi?.securityType || 'WPA',
      hidden: tenant.wifi?.hidden ?? false,
    },
    socials: {
      instagram: tenant.socials?.instagram || '',
      googleMaps: tenant.socials?.googleMaps || '',
      whatsapp: tenant.socials?.whatsapp || '',
      tiktok: tenant.socials?.tiktok || '',
      website: tenant.socials?.website || '',
      phone: tenant.socials?.phone || '',
    },
    features: {
      menu: tenant.features?.menu ?? true,
      ordering: tenant.features?.ordering ?? true,
      loyalty: tenant.features?.loyalty ?? true,
      googleReviews: tenant.features?.googleReviews ?? true,
      wifi: tenant.features?.wifi ?? true,
      feedback: tenant.features?.feedback ?? true,
      games: tenant.features?.games ?? true,
      payments: tenant.features?.payments ?? (tenant.payments?.enabled ?? true),
      serviceBell: tenant.features?.serviceBell ?? true,
    },
  });

  const [formData, setFormData] = useState(() => sanitizeTenant(activeTenant));
  const [savedToast, setSavedToast] = useState(false);

  // Sync state if activeTenant changes from the dropdown
  useEffect(() => {
    setFormData(sanitizeTenant(activeTenant));
  }, [activeTenant]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateActiveTenant(formData);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      {/* Save bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Palette className="w-5 h-5 text-amber-500" /> Store Branding & Feature Controls
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Personalize your mobile scan micro-page, upload store photos, configure Wi-Fi, and toggle table-side features.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedToast && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 animate-fade-in">
              <Check className="w-4 h-4" /> Changes saved!
            </span>
          )}
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Store Profile</span>
          </button>
        </div>
      </div>

      {/* Basic Profile & Hero Photos */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-200">1. Store Profile & Photos</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Business / Shop Name</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Store URL Slug (QR URL)</label>
            <div className="flex items-center">
              <span className="px-2.5 py-2 bg-slate-800 border border-r-0 border-slate-700 text-slate-400 text-xs rounded-l-lg font-mono">
                /r/
              </span>
              <input
                type="text"
                value={formData.slug || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                  })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-r-lg text-amber-400 font-mono text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        <div className="text-xs">
          <label className="block text-slate-400 mb-1 font-medium">Tagline / Catchphrase</label>
          <input
            type="text"
            value={formData.tagline || ''}
            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="text-xs">
          <label className="block text-slate-400 mb-1 font-medium">Store Description / Story</label>
          <textarea
            rows={2}
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500 resize-none"
          />
        </div>

        {/* Media URLs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Store Logo Image URL</label>
            <div className="flex items-center gap-2">
              <img
                src={formData.logoUrl || ''}
                alt="Logo preview"
                className="w-9 h-9 rounded-lg object-cover border border-slate-700 shrink-0"
              />
              <input
                type="text"
                value={formData.logoUrl || ''}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Banner / Atmosphere Photo URL</label>
            <div className="flex items-center gap-2">
              <img
                src={formData.bannerUrl || ''}
                alt="Banner preview"
                className="w-12 h-9 rounded-lg object-cover border border-slate-700 shrink-0"
              />
              <input
                type="text"
                value={formData.bannerUrl || ''}
                onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Brand Color Theme Palette */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-200">2. Brand Theme & Colors</h3>
        <p className="text-xs text-slate-400">
          These colors will be dynamically applied to your customer mobile micro-page buttons, badges, and QR table stands.
        </p>

        {/* Preset Palettes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {PRESET_PALETTES.map((p) => {
            const isSelected = formData.themeColor === p.theme;
            return (
              <button
                type="button"
                key={p.name}
                onClick={() => setFormData({ ...formData, themeColor: p.theme, accentColor: p.accent })}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div className="flex -space-x-1">
                  <div className="w-5 h-5 rounded-full border border-slate-900 shadow-sm" style={{ backgroundColor: p.theme }} />
                  <div className="w-5 h-5 rounded-full border border-slate-900 shadow-sm" style={{ backgroundColor: p.accent }} />
                </div>
                <div className="text-[11px] font-medium text-slate-200 truncate">{p.name}</div>
              </button>
            );
          })}
        </div>

        {/* Custom Color Pickers */}
        <div className="grid grid-cols-2 gap-4 text-xs pt-2">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Primary Accent Color (Hex)</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.themeColor || '#d97706'}
                onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                className="w-9 h-9 rounded cursor-pointer border border-slate-700 bg-transparent"
              />
              <input
                type="text"
                value={formData.themeColor || '#d97706'}
                onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Currency Symbol</label>
            <input
              type="text"
              value={formData.currency || '$'}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
            />
          </div>
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-500" /> 3. Table-Side Feature Modules
        </h3>
        <p className="text-xs text-slate-400">
          Turn features on or off. Disabled features will be smoothly hidden from the customer scan landing page.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Menu */}
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <div>
                <div className="font-semibold text-slate-200">Digital Menu</div>
                <div className="text-[11px] text-slate-400">Categories, dietary filters & pricing</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.features?.menu ?? true}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  features: { ...formData.features, menu: e.target.checked },
                })
              }
              className="w-4 h-4 accent-amber-500 rounded"
            />
          </label>

          {/* Table Ordering */}
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="font-semibold text-slate-200">Table-Side Ordering</div>
                <div className="text-[11px] text-slate-400">Guests send orders directly from menu</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.features?.ordering ?? true}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  features: { ...formData.features, ordering: e.target.checked },
                })
              }
              className="w-4 h-4 accent-amber-500 rounded"
            />
          </label>

          {/* Loyalty */}
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition">
            <div className="flex items-center gap-2.5">
              <Gift className="w-4 h-4 text-purple-400" />
              <div>
                <div className="font-semibold text-slate-200">Loyalty Stamp Card</div>
                <div className="text-[11px] text-slate-400">Collect stamps for free food/drinks</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.features?.loyalty ?? true}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  features: { ...formData.features, loyalty: e.target.checked },
                })
              }
              className="w-4 h-4 accent-amber-500 rounded"
            />
          </label>

          {/* Google Reviews */}
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <div>
                <div className="font-semibold text-slate-200">Google Review Booster</div>
                <div className="text-[11px] text-slate-400">Direct 5-star Google Maps review redirect</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.features?.googleReviews ?? true}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  features: { ...formData.features, googleReviews: e.target.checked },
                })
              }
              className="w-4 h-4 accent-amber-500 rounded"
            />
          </label>

          {/* Wi-Fi */}
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition">
            <div className="flex items-center gap-2.5">
              <Wifi className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="font-semibold text-slate-200">One-Tap Wi-Fi Access</div>
                <div className="text-[11px] text-slate-400">Wi-Fi QR & easy password copy</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.features?.wifi ?? true}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  features: { ...formData.features, wifi: e.target.checked },
                })
              }
              className="w-4 h-4 accent-amber-500 rounded"
            />
          </label>

          {/* Feedback */}
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="font-semibold text-slate-200">Anonymous Feedback Form</div>
                <div className="text-[11px] text-slate-400">Private customer ratings directly to inbox</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.features?.feedback ?? true}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  features: { ...formData.features, feedback: e.target.checked },
                })
              }
              className="w-4 h-4 accent-amber-500 rounded"
            />
          </label>

          {/* Table Game */}
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition">
            <div className="flex items-center gap-2.5">
              <Gamepad2 className="w-4 h-4 text-rose-400" />
              <div>
                <div className="font-semibold text-slate-200">3D Table Ludo Game (टेबल लूडो)</div>
                <div className="text-[11px] text-slate-400">Interactive 3D character Ludo with AI Bots & Table-to-Table match</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.features?.games ?? true}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  features: { ...formData.features, games: e.target.checked },
                })
              }
              className="w-4 h-4 accent-amber-500 rounded"
            />
          </label>

          {/* Payment Gateway Service */}
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition">
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="font-semibold text-slate-200">Digital Payment Gateway</div>
                <div className="text-[11px] text-slate-400">UPI, cards & instant table checkout</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.features?.payments ?? (formData.payments?.enabled ?? true)}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  payments: { ...formData.payments, enabled: e.target.checked },
                  features: { ...formData.features, payments: e.target.checked },
                })
              }
              className="w-4 h-4 accent-amber-500 rounded"
            />
          </label>

          {/* Call Waiter & Service Bell */}
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-amber-400" />
              <div>
                <div className="font-semibold text-slate-200">Call Waiter & Service Bell</div>
                <div className="text-[11px] text-slate-400">Water, bill, cleaning & server chime</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.features?.serviceBell ?? true}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  features: { ...formData.features, serviceBell: e.target.checked },
                })
              }
              className="w-4 h-4 accent-amber-500 rounded"
            />
          </label>
        </div>
      </div>

      {/* One-Tap Wi-Fi & External Links */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Wifi className="w-4 h-4 text-cyan-400" /> 4. Guest Wi-Fi Credentials
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Wi-Fi Network SSID Name</label>
            <input
              type="text"
              value={formData.wifi?.ssid || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  wifi: { ...formData.wifi, ssid: e.target.value },
                })
              }
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Wi-Fi Password</label>
            <input
              type="text"
              value={formData.wifi?.password || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  wifi: { ...formData.wifi, password: e.target.value },
                })
              }
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Social Links & Google Review URL */}
        <div className="pt-2 border-t border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-300">Google Maps Review & Social Handles</h4>

          <div className="text-xs">
            <label className="block text-slate-400 mb-1 font-medium">
              Google Maps Review Direct Link (Write-Review URL)
            </label>
            <input
              type="url"
              placeholder="https://search.google.com/local/writereview?placeid=..."
              value={formData.googleReviewUrl || ''}
              onChange={(e) => setFormData({ ...formData, googleReviewUrl: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Instagram URL</label>
              <input
                type="text"
                placeholder="https://instagram.com/yourhandle"
                value={formData.socials?.instagram || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socials: { ...formData.socials, instagram: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Phone / WhatsApp</label>
              <input
                type="text"
                placeholder="+1 555-0199"
                value={formData.socials?.phone || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socials: { ...formData.socials, phone: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
