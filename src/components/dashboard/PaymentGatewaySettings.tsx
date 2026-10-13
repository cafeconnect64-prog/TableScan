import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import QRCode from 'qrcode';
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Save,
  Zap,
  DollarSign,
  Smartphone,
  ExternalLink,
  Lock,
  Building,
  Percent,
} from 'lucide-react';

export const PaymentGatewaySettings: React.FC = () => {
  const { activeTenant, updateActiveTenant } = useStore();
  const [paymentsConfig, setPaymentsConfig] = useState({
    enabled: activeTenant.payments?.enabled ?? true,
    provider: activeTenant.payments?.provider ?? 'upi_direct',
    upiId: activeTenant.payments?.upiId || '',
    upiPayeeName: activeTenant.payments?.upiPayeeName || '',
    stripePublishableKey: activeTenant.payments?.stripePublishableKey || '',
    stripeAccountId: activeTenant.payments?.stripeAccountId || '',
    razorpayKeyId: activeTenant.payments?.razorpayKeyId || '',
    enableAppleGooglePay: activeTenant.payments?.enableAppleGooglePay ?? true,
    requirePrepayment: activeTenant.payments?.requirePrepayment ?? false,
    taxRatePercent: activeTenant.payments?.taxRatePercent ?? 8.0,
  });
  const [savedToast, setSavedToast] = useState(false);
  const [testUpiQrUrl, setTestUpiQrUrl] = useState('');

  // Sync payments configuration whenever active tenant changes
  useEffect(() => {
    setPaymentsConfig({
      enabled: activeTenant.payments?.enabled ?? true,
      provider: activeTenant.payments?.provider ?? 'upi_direct',
      upiId: activeTenant.payments?.upiId || '',
      upiPayeeName: activeTenant.payments?.upiPayeeName || '',
      stripePublishableKey: activeTenant.payments?.stripePublishableKey || '',
      stripeAccountId: activeTenant.payments?.stripeAccountId || '',
      razorpayKeyId: activeTenant.payments?.razorpayKeyId || '',
      enableAppleGooglePay: activeTenant.payments?.enableAppleGooglePay ?? true,
      requirePrepayment: activeTenant.payments?.requirePrepayment ?? false,
      taxRatePercent: activeTenant.payments?.taxRatePercent ?? 8.0,
    });
  }, [activeTenant]);

  // Sample dynamic UPI payload for Table 4 bill
  const sampleAmount = 12.8;
  const sampleUpiString = `upi://pay?pa=${paymentsConfig.upiId || 'artisanroast@okhdfcbank'}&pn=${encodeURIComponent(
    paymentsConfig.upiPayeeName || activeTenant.name
  )}&am=${sampleAmount.toFixed(2)}&cu=${activeTenant.currency === '₹' ? 'INR' : 'USD'}&tn=Table_4_Order_42`;

  useEffect(() => {
    QRCode.toDataURL(sampleUpiString, {
      width: 260,
      margin: 1.5,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setTestUpiQrUrl(url))
      .catch((err) => console.error(err));
  }, [sampleUpiString]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateActiveTenant({
      payments: paymentsConfig,
      features: {
        ...activeTenant.features,
        payments: paymentsConfig.enabled,
      },
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2200);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-100">Digital Payment Gateway & Settlement</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure direct UPI QR bank deposits, Stripe credit cards, Apple Pay / Google Pay, and table settlement rules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedToast && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Payment settings saved!
            </span>
          )}
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/20 transition active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Payment Settings</span>
          </button>
        </div>
      </div>

      {/* Master Enable/Disable Service Toggle */}
      <div className={`p-4 rounded-2xl border transition flex items-center justify-between ${
        paymentsConfig.enabled
          ? 'bg-emerald-950/30 border-emerald-500/40'
          : 'bg-rose-950/20 border-rose-500/30'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
            paymentsConfig.enabled
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
          }`}>
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-100">Payment Gateway Service Status</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                paymentsConfig.enabled
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {paymentsConfig.enabled ? 'Active / चालू' : 'Suspended / बंद'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {paymentsConfig.enabled
                ? 'Digital checkout is enabled. Guests can pay directly via UPI & Card at tables.'
                : 'Digital payment gateway is switched OFF. Online payment options are disabled at tables.'}
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={paymentsConfig.enabled}
            onChange={(e) => setPaymentsConfig({ ...paymentsConfig, enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-12 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Payment Provider Selection & Keys */}
        <div className="lg:col-span-7 space-y-4">
          {/* Gateway Provider Cards */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-200">1. Primary Payment Gateway</h3>
            <p className="text-xs text-slate-400">
              Select how customers at tables will settle their bill directly on their mobile device:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {/* UPI Direct */}
              <button
                type="button"
                onClick={() => setPaymentsConfig({ ...paymentsConfig, provider: 'upi_direct' })}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  paymentsConfig.provider === 'upi_direct'
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="font-bold text-xs text-slate-100 flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5 text-emerald-400" /> UPI / QR Direct
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    0% fees · Direct Bank Deposit (GPay, PhonePe, Paytm, BHIM)
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold mt-2">Instant Settlement</span>
              </button>

              {/* Stripe */}
              <button
                type="button"
                onClick={() => setPaymentsConfig({ ...paymentsConfig, provider: 'stripe' })}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  paymentsConfig.provider === 'stripe'
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="font-bold text-xs text-slate-100 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-indigo-400" /> Stripe Connect
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Global Cards, Apple Pay & Google Pay
                  </div>
                </div>
                <span className="text-[10px] text-indigo-400 font-semibold mt-2">Cards & Wallets</span>
              </button>

              {/* Cash at Counter */}
              <button
                type="button"
                onClick={() => setPaymentsConfig({ ...paymentsConfig, provider: 'cash_only' })}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  paymentsConfig.provider === 'cash_only'
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="font-bold text-xs text-slate-100 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-amber-400" /> Cash at Counter
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Customer places order and pays staff at register
                  </div>
                </div>
                <span className="text-[10px] text-amber-400 font-semibold mt-2">Manual Cash</span>
              </button>
            </div>
          </div>

          {/* UPI Direct Configuration */}
          {(paymentsConfig.provider === 'upi_direct' || paymentsConfig.provider === 'cash_only') && (
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3.5 text-xs">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-emerald-400" /> UPI Direct Bank Deposit Details
              </h3>
              <p className="text-slate-400 text-[11px]">
                Payments will be routed directly to your shop's bank account with zero platform fees.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Merchant VPA / UPI ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., storename@okhdfcbank"
                    value={paymentsConfig.upiId || ''}
                    onChange={(e) => setPaymentsConfig({ ...paymentsConfig, upiId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Business / Payee Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Artisan Roast & Bakery"
                    value={paymentsConfig.upiPayeeName || ''}
                    onChange={(e) =>
                      setPaymentsConfig({ ...paymentsConfig, upiPayeeName: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Stripe Configuration */}
          {paymentsConfig.provider === 'stripe' && (
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3.5 text-xs">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-indigo-400" /> Stripe API & Connected Account
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Stripe Publishable Key</label>
                  <input
                    type="text"
                    placeholder="pk_live_... or pk_test_..."
                    value={paymentsConfig.stripePublishableKey || ''}
                    onChange={(e) =>
                      setPaymentsConfig({ ...paymentsConfig, stripePublishableKey: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Stripe Connected Account ID</label>
                  <input
                    type="text"
                    placeholder="acct_1..."
                    value={paymentsConfig.stripeAccountId || ''}
                    onChange={(e) =>
                      setPaymentsConfig({ ...paymentsConfig, stripeAccountId: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Settlement Rules & Taxes */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-amber-400" /> Table Settlement Rules & Taxes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Prepayment toggle */}
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <div>
                  <div className="font-semibold text-slate-200">Require Pre-Payment</div>
                  <div className="text-[11px] text-slate-400">Order sent to kitchen only after payment</div>
                </div>
                <input
                  type="checkbox"
                  checked={paymentsConfig.requirePrepayment ?? false}
                  onChange={(e) =>
                    setPaymentsConfig({ ...paymentsConfig, requirePrepayment: e.target.checked })
                  }
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
              </label>

              {/* Tax rate */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">Tax / VAT / GST Rate</div>
                  <div className="text-[11px] text-slate-400">Calculated automatically on checkout</div>
                </div>
                <div className="flex items-center gap-1 w-20">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="30"
                    value={paymentsConfig.taxRatePercent ?? 8.0}
                    onChange={(e) =>
                      setPaymentsConfig({
                        ...paymentsConfig,
                        taxRatePercent: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-center text-amber-400 font-mono font-bold"
                  />
                  <span className="text-slate-400">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Payment QR & Receipt Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-400" /> Customer Payment Preview
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
                Live Intent
              </span>
            </div>

            {/* Simulated Table Bill Card */}
            <div className="p-4 rounded-xl bg-white text-slate-950 shadow-xl border-2 border-slate-200 text-center space-y-3">
              <div className="font-extrabold text-sm">{activeTenant.name}</div>
              <div className="text-[11px] text-slate-500 font-mono">
                Bill for Table 4 · Order #42
              </div>

              {/* High-res dynamic QR */}
              <div className="p-2 bg-white rounded-xl shadow-md inline-block border border-slate-200">
                {testUpiQrUrl ? (
                  <img src={testUpiQrUrl} alt="Sample Payment QR" className="w-44 h-44 object-contain" />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-slate-400">
                    Generating payment QR...
                  </div>
                )}
              </div>

              <div className="font-black text-xl text-slate-900 font-mono">
                {activeTenant.currency}{sampleAmount.toFixed(2)}
              </div>

              <div className="text-[10px] text-slate-500 font-mono bg-slate-100 p-2 rounded-lg break-all">
                VPA: {paymentsConfig.upiId || 'artisanroast@okhdfcbank'}
              </div>

              <div className="text-[11px] text-emerald-700 font-semibold flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Instant Direct Bank Settlement
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              💡 <strong>How it works for customers:</strong> When guests at Table 4 tap "Pay Bill" or place an order, they can simply point Google Pay, PhonePe, Paytm, or BHIM at this QR code or click 1-tap open on mobile!
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
