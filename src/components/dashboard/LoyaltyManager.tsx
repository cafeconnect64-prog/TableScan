import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Gift,
  KeyRound,
  Search,
  Plus,
  Trophy,
  History,
  CheckCircle,
  Phone,
  Sparkles,
  Save,
  Coffee,
  Star,
  Utensils,
  Heart,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const LoyaltyManager: React.FC = () => {
  const {
    activeTenant,
    updateActiveTenant,
    loyaltyCards,
    getOrRegisterLoyaltyCard,
    punchStamp,
    claimReward,
  } = useStore();

  const [loyaltyConfig, setLoyaltyConfig] = useState({
    enabled: activeTenant.loyalty?.enabled ?? true,
    stampsRequired: activeTenant.loyalty?.stampsRequired ?? 8,
    rewardTitle: activeTenant.loyalty?.rewardTitle || '',
    terms: activeTenant.loyalty?.terms || '',
    secretStaffPin: activeTenant.loyalty?.secretStaffPin || '1234',
    stampIcon: activeTenant.loyalty?.stampIcon || 'coffee',
  });
  const [staffPinInput, setStaffPinInput] = useState(activeTenant.loyalty?.secretStaffPin || '1234');
  const [searchPhone, setSearchPhone] = useState('');
  const [customerNameInput, setCustomerNameInput] = useState('');
  const [activeCustomerCardId, setActiveCustomerCardId] = useState<string | null>(null);
  const [terminalMessage, setTerminalMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [savedSettingsToast, setSavedSettingsToast] = useState(false);

  // Sync state whenever active tenant changes
  React.useEffect(() => {
    setLoyaltyConfig({
      enabled: activeTenant.loyalty?.enabled ?? true,
      stampsRequired: activeTenant.loyalty?.stampsRequired ?? 8,
      rewardTitle: activeTenant.loyalty?.rewardTitle || '',
      terms: activeTenant.loyalty?.terms || '',
      secretStaffPin: activeTenant.loyalty?.secretStaffPin || '1234',
      stampIcon: activeTenant.loyalty?.stampIcon || 'coffee',
    });
    setStaffPinInput(activeTenant.loyalty?.secretStaffPin || '1234');
  }, [activeTenant]);

  const activeCard = loyaltyCards.find((c) => c.id === activeCustomerCardId);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateActiveTenant({
      loyalty: loyaltyConfig,
      features: {
        ...activeTenant.features,
        loyalty: loyaltyConfig.enabled,
      },
    });
    setSavedSettingsToast(true);
    setTimeout(() => setSavedSettingsToast(false), 2000);
  };

  const handleSearchOrRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPhone.trim()) return;
    const card = getOrRegisterLoyaltyCard(searchPhone.trim(), customerNameInput.trim());
    setActiveCustomerCardId(card.id);
    setTerminalMessage({ text: `Card loaded for ${card.customerName} (${card.customerPhone})` });
  };

  const handleStaffPunch = (cardId: string) => {
    const res = punchStamp(cardId, staffPinInput);
    if (res.success) {
      setTerminalMessage({ text: res.message });
      if (res.earnedReward) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    } else {
      setTerminalMessage({ text: res.message, isError: true });
    }
  };

  const handleRedeem = (cardId: string) => {
    const success = claimReward(cardId);
    if (success) {
      setTerminalMessage({ text: 'Reward successfully redeemed and stamp card reset!' });
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-400" /> Digital Loyalty Program & Staff Punch Terminal
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure stamp card rules, reward perks, staff authorization PIN, and punch customer cards in real-time.
          </p>
        </div>
      </div>

      {/* Master Enable/Disable Service Toggle */}
      <div className={`p-4 rounded-2xl border transition flex items-center justify-between ${
        loyaltyConfig.enabled
          ? 'bg-purple-950/30 border-purple-500/40'
          : 'bg-rose-950/20 border-rose-500/30'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
            loyaltyConfig.enabled
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
          }`}>
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-100">Loyalty Program & Punch Terminal Status</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                loyaltyConfig.enabled
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {loyaltyConfig.enabled ? 'Active / चालू' : 'Suspended / बंद'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {loyaltyConfig.enabled
                ? 'Customer loyalty stamp card and staff punch terminal are active.'
                : 'Loyalty program & stamp punching are switched OFF. Hidden from guest scan menu.'}
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={loyaltyConfig.enabled}
            onChange={(e) => {
              const nextEnabled = e.target.checked;
              const nextConfig = { ...loyaltyConfig, enabled: nextEnabled };
              setLoyaltyConfig(nextConfig);
              updateActiveTenant({
                loyalty: nextConfig,
                features: {
                  ...activeTenant.features,
                  loyalty: nextEnabled,
                },
              });
            }}
            className="sr-only peer"
          />
          <div className="w-12 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Staff Punch Terminal */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Barista / Staff Punch Terminal</h3>
                  <p className="text-[11px] text-slate-400">Lookup customer by phone or register on the spot</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-mono">Staff PIN:</span>
                <input
                  type="password"
                  maxLength={6}
                  value={staffPinInput || ''}
                  onChange={(e) => setStaffPinInput(e.target.value)}
                  className="w-16 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-center text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                  title="Enter secret staff PIN to punch stamps"
                />
              </div>
            </div>

            {/* Customer Search / Register Bar */}
            <form onSubmit={handleSearchOrRegister} className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
              <div className="sm:col-span-6 relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                <input
                  type="tel"
                  required
                  placeholder="Customer Phone (e.g. 206-555-0144)"
                  value={searchPhone || ''}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="sm:col-span-4">
                <input
                  type="text"
                  placeholder="Customer Name (optional)"
                  value={customerNameInput || ''}
                  onChange={(e) => setCustomerNameInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full h-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-md transition"
                >
                  Lookup
                </button>
              </div>
            </form>

            {/* Terminal Status Alert */}
            {terminalMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-center justify-between animate-fade-in ${
                  terminalMessage.isError
                    ? 'bg-rose-950/60 border border-rose-800/60 text-rose-300'
                    : 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-200'
                }`}
              >
                <span>{terminalMessage.text}</span>
                <button
                  onClick={() => setTerminalMessage(null)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Active Punch Terminal Card */}
            {activeCard ? (
              <div className="p-4 rounded-xl bg-slate-950 border-2 border-purple-500/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-100 text-sm flex items-center gap-2">
                      <span>{activeCard.customerName}</span>
                      <span className="text-[11px] text-purple-400 font-mono font-normal">
                        {activeCard.customerPhone}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Redeemed {activeCard.totalRewardsRedeemed} rewards so far · Last stamped:{' '}
                      {activeCard.lastStampedAt}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black text-amber-400 font-mono">
                      {activeCard.stampsCount}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      /{activeTenant.loyalty.stampsRequired}
                    </span>
                  </div>
                </div>

                {/* Stamp visual punches */}
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 py-1">
                  {Array.from({ length: activeTenant.loyalty.stampsRequired }).map((_, idx) => {
                    const isStamped = idx < activeCard.stampsCount;
                    return (
                      <div
                        key={idx}
                        className={`h-12 rounded-xl flex items-center justify-center border-2 transition-all ${
                          isStamped
                            ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md font-bold scale-100'
                            : 'bg-slate-900 text-slate-600 border-dashed border-slate-700'
                        }`}
                      >
                        {isStamped ? <Coffee className="w-5 h-5" /> : idx + 1}
                      </div>
                    );
                  })}
                </div>

                {/* Punch & Redeem Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleStaffPunch(activeCard.id)}
                    className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/20 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add 1 Stamp (Punch)</span>
                  </button>

                  <button
                    onClick={() => handleRedeem(activeCard.id)}
                    disabled={activeCard.stampsCount < activeTenant.loyalty.stampsRequired}
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Redeem Free Reward</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-xs text-slate-500">
                Search a customer's phone number above or click any card in the ledger below to punch stamps.
              </div>
            )}
          </div>

          {/* Customer Ledger Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">Customer Loyalty Ledger ({loyaltyCards.length})</span>
              <span className="text-slate-400">Click to select card</span>
            </div>

            <div className="divide-y divide-slate-800/60 max-h-[300px] overflow-y-auto">
              {loyaltyCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => setActiveCustomerCardId(card.id)}
                  className={`p-3 text-xs flex items-center justify-between hover:bg-slate-800/40 cursor-pointer transition ${
                    activeCustomerCardId === card.id ? 'bg-purple-500/10' : ''
                  }`}
                >
                  <div>
                    <div className="font-semibold text-slate-200">{card.customerName}</div>
                    <div className="text-[11px] font-mono text-slate-400">{card.customerPhone}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      {card.stampsCount}/{activeTenant.loyalty.stampsRequired} stamps
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStaffPunch(card.id);
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-300 rounded-lg text-[11px] font-semibold border border-slate-700 transition"
                    >
                      +1 Stamp
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Loyalty Program Rules & Setup */}
        <div className="lg:col-span-5 space-y-4">
          <form
            onSubmit={handleSaveSettings}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-200 text-sm">Loyalty Rules & Rewards</h3>
              {savedSettingsToast && (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Saved!
                </span>
              )}
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Stamps Required for Reward</label>
              <input
                type="number"
                min={3}
                max={20}
                value={loyaltyConfig.stampsRequired ?? 8}
                onChange={(e) =>
                  setLoyaltyConfig({
                    ...loyaltyConfig,
                    stampsRequired: parseInt(e.target.value) || 8,
                  })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-purple-500"
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Common settings: 6, 8, or 10 stamps.
              </span>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Free Reward Perk Title *</label>
              <input
                type="text"
                required
                placeholder="e.g., Free Specialty Pour-Over or Sourdough Croissant"
                value={loyaltyConfig.rewardTitle || ''}
                onChange={(e) =>
                  setLoyaltyConfig({ ...loyaltyConfig, rewardTitle: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Terms & Conditions</label>
              <textarea
                rows={2}
                value={loyaltyConfig.terms || ''}
                onChange={(e) => setLoyaltyConfig({ ...loyaltyConfig, terms: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Secret Staff PIN Code</label>
              <input
                type="text"
                maxLength={6}
                value={loyaltyConfig.secretStaffPin || ''}
                onChange={(e) =>
                  setLoyaltyConfig({ ...loyaltyConfig, secretStaffPin: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Customers can also ask the barista for this PIN to self-punch their phone card at the table.
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Update Loyalty Program</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
