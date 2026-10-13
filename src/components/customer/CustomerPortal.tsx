import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { TableLudoGame } from '../games/TableLudoGame';
import {
  BookOpen,
  Gift,
  Sparkles,
  Wifi,
  MessageSquare,
  Gamepad2,
  Instagram,
  Phone,
  Share2,
  Check,
  Copy,
  Star,
  ExternalLink,
  Search,
  Leaf,
  Flame,
  X,
  Trophy,
  Coffee,
  Heart,
  ChevronRight,
  Info,
  MapPin,
  Smartphone,
  Maximize2,
  KeyRound,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  UtensilsCrossed,
  ChefHat,
  Clock,
  Send,
  Receipt,
  CreditCard,
  Bell,
  Languages,
  ChevronDown,
  Droplets,
  Utensils,
  Banknote,
  Globe,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MenuItem, TableOrder, ServiceRequestType } from '../../types';
import { DigitalPaymentModal } from './DigitalPaymentModal';
import { t, SUPPORTED_LANGUAGES } from '../../utils/translations';

export const CustomerPortal: React.FC = () => {
  const {
    activeTenant,
    categories,
    items,
    selectedTable,
    setSelectedTable,
    tables,
    submitFeedback,
    getOrRegisterLoyaltyCard,
    punchStamp,
    claimReward,
    loyaltyCards,
    cart,
    cartTotal,
    cartItemCount,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    placeOrder,
    orders,
    language,
    setLanguage,
    callService,
    serviceRequests,
  } = useStore();

  const currentLangOption =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  // Active modal: 'menu' | 'cart' | 'order-tracker' | 'loyalty' | 'review' | 'wifi' | 'feedback' | 'game' | 'table-switch' | 'service' | 'language' | null
  const [activeModal, setActiveModal] = useState<
    'menu' | 'cart' | 'order-tracker' | 'loyalty' | 'review' | 'wifi' | 'feedback' | 'game' | 'table-switch' | 'service' | 'language' | null
  >('menu'); // Open menu by default so user can immediately test ordering!

  const [deviceFrame, setDeviceFrame] = useState<boolean>(true);

  // --- Menu State ---
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'vegan' | 'gf'>('all');
  const [selectedMenuItemDetail, setSelectedMenuItemDetail] = useState<MenuItem | null>(null);
  const [itemNoteInput, setItemNoteInput] = useState('');

  // --- Order & Checkout State ---
  const [orderGuestName, setOrderGuestName] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [orderPaymentPref, setOrderPaymentPref] = useState<'pay_at_counter' | 'card_online'>('card_online');
  const [orderToPay, setOrderToPay] = useState<TableOrder | null>(null);
  const [activeOrderTracking, setActiveOrderTracking] = useState<TableOrder | null>(() => {
    // Check if there is an active order for this table
    return orders.find((o) => o.tableNumber === selectedTable && o.status !== 'cancelled') || null;
  });

  // --- Loyalty State ---
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [currentCustomerCard, setCurrentCustomerCard] = useState(() => {
    return loyaltyCards[0] || null;
  });
  const [staffPinPrompt, setStaffPinPrompt] = useState(false);
  const [staffPinInput, setStaffPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // --- Wi-Fi State ---
  const [copiedWifi, setCopiedWifi] = useState(false);

  // --- Google Review Booster State ---
  const [boosterRating, setBoosterRating] = useState<number>(5);

  // --- Feedback State ---
  const [fbRating, setFbRating] = useState(5);
  const [fbFood, setFbFood] = useState(5);
  const [fbService, setFbService] = useState(5);
  const [fbAmbiance, setFbAmbiance] = useState(5);
  const [fbComment, setFbComment] = useState('');
  const [fbTags, setFbTags] = useState<string[]>(['Friendly Service']);
  const [fbContact, setFbContact] = useState('');
  const [fbSubmitted, setFbSubmitted] = useState(false);

  // --- Service / Waiter Call State ---
  const [serviceCustomNote, setServiceCustomNote] = useState('');
  const [serviceFeedbackSent, setServiceFeedbackSent] = useState(false);
  const [lastServiceSentTitle, setLastServiceSentTitle] = useState('');

  const handleSendServiceRequest = (type: ServiceRequestType, title: string) => {
    callService(type, title, serviceCustomNote.trim() || undefined);
    setLastServiceSentTitle(title);
    setServiceFeedbackSent(true);
    setServiceCustomNote('');
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
    setTimeout(() => {
      setServiceFeedbackSent(false);
      setActiveModal(null);
    }, 2500);
  };

  // Filter menu items
  const filteredMenuItems = items.filter((item) => {
    if (!item.isAvailable) return false;
    if (selectedCat !== 'all' && item.categoryId !== selectedCat) return false;
    if (dietFilter === 'veg' && !item.isVeg) return false;
    if (dietFilter === 'vegan' && !item.isVegan) return false;
    if (dietFilter === 'gf' && !item.isGlutenFree) return false;
    if (
      menuSearch.trim() &&
      !item.name.toLowerCase().includes(menuSearch.toLowerCase()) &&
      !item.description?.toLowerCase().includes(menuSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleCopyWifi = () => {
    navigator.clipboard.writeText(activeTenant.wifi.password);
    setCopiedWifi(true);
    setTimeout(() => setCopiedWifi(false), 2000);
  };

  const handleLoyaltyLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone.trim()) return;
    const card = getOrRegisterLoyaltyCard(customerPhone.trim(), customerName.trim());
    setCurrentCustomerCard(card);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  const handleSelfPunchWithPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomerCard) return;
    const res = punchStamp(currentCustomerCard.id, staffPinInput, selectedTable);
    if (res.success) {
      setStaffPinPrompt(false);
      setStaffPinInput('');
      setPinError('');
      const updated = loyaltyCards.find((c) => c.id === currentCustomerCard.id);
      if (updated) setCurrentCustomerCard(updated);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } else {
      setPinError(res.message);
    }
  };

  const handleRedeemCustomer = () => {
    if (!currentCustomerCard) return;
    claimReward(currentCustomerCard.id);
    const updated = loyaltyCards.find((c) => c.id === currentCustomerCard.id);
    if (updated) setCurrentCustomerCard(updated);
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
    });
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitFeedback({
      tenantId: activeTenant.id,
      tableNumber: selectedTable,
      overallRating: fbRating,
      foodRating: fbFood,
      serviceRating: fbService,
      ambianceRating: fbAmbiance,
      comment: fbComment || 'Great experience at Table ' + selectedTable,
      tags: fbTags,
      customerContact: fbContact || undefined,
    });
    setFbSubmitted(true);
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
    });
    setTimeout(() => {
      setFbSubmitted(false);
      setActiveModal(null);
      setFbComment('');
    }, 2000);
  };

  const handlePlaceTableOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (orderPaymentPref === 'card_online') {
      const newOrder = placeOrder({
        customerName: orderGuestName || 'Guest Table ' + selectedTable,
        notes: orderNotes,
        paymentMethod: 'upi',
      });
      setActiveOrderTracking(newOrder);
      setOrderToPay(newOrder);
      setActiveModal(null);
    } else {
      const newOrder = placeOrder({
        customerName: orderGuestName || 'Guest Table ' + selectedTable,
        notes: orderNotes,
        paymentMethod: 'counter',
      });
      setActiveOrderTracking(newOrder);
      setActiveModal('order-tracker');
    }

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.55 },
    });
  };

  const toggleTag = (tag: string) => {
    setFbTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Find recent order for this table
  const tableActiveOrder =
    orders.find((o) => o.tableNumber === selectedTable && o.status !== 'cancelled' && o.status !== 'paid') ||
    activeOrderTracking;

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh]">
      {/* Device Frame Viewport Controls (Desktop Bar) */}
      <div className="w-full max-w-md flex items-center justify-between mb-3 px-2 text-xs no-print">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Smartphone className="w-4 h-4 text-amber-500" />
          <span>Mobile Phone Scan View · <strong>Table {selectedTable}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveModal('table-switch')}
            className="text-amber-400 hover:text-amber-300 font-medium underline text-[11px]"
          >
            Switch Table #
          </button>
          <button
            onClick={() => setDeviceFrame(!deviceFrame)}
            className="p-1 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-md"
            title={deviceFrame ? 'View Full Screen' : 'View in iPhone Frame'}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mobile Shell / iPhone Chassis */}
      <div
        className={`w-full transition-all duration-300 overflow-hidden relative ${
          deviceFrame
            ? 'max-w-sm rounded-[42px] border-[8px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] bg-slate-950 ring-1 ring-slate-700/50 min-h-[720px]'
            : 'max-w-lg rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl min-h-[700px]'
        }`}
      >
        {/* iPhone Dynamic Island / Speaker notch */}
        {deviceFrame && (
          <div className="pt-2.5 pb-1 flex justify-center sticky top-0 z-40 bg-transparent">
            <div className="w-24 h-4 bg-black rounded-full flex items-center justify-center shadow-inner">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ml-auto mr-1.5" />
            </div>
          </div>
        )}

        {/* Content Container */}
        <div className="pb-16 text-slate-100 select-none">
          {/* Hero Banner with Store Backdrop */}
          <div className="relative h-44 w-full overflow-hidden bg-slate-900">
            <img
              src={activeTenant.bannerUrl}
              alt={activeTenant.name}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            {/* Top Bar with Table Pill, Language Toggle & Waiter Bell */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20">
              <button
                type="button"
                onClick={() => setActiveModal('table-switch')}
                className="px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-slate-700 text-[11px] font-bold text-slate-100 flex items-center gap-1.5 shadow-lg hover:border-amber-400 transition"
                title={t('tapToSwitchTable', language)}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{t('table', language)} {selectedTable}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              <div className="flex items-center gap-1.5">
                {/* Multi-language Selector Pill */}
                <button
                  type="button"
                  onClick={() => setActiveModal('language')}
                  className="px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-amber-500/40 text-[11px] font-bold text-amber-300 flex items-center gap-1.5 shadow-lg hover:border-amber-400 hover:bg-slate-900 transition active:scale-95"
                  title={t('switchLang', language)}
                >
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  <span>{currentLangOption.flag} {currentLangOption.nativeName}</span>
                  <ChevronDown className="w-2.5 h-2.5 text-amber-400/70" />
                </button>

                {(activeTenant.features.serviceBell ?? true) && (
                  <button
                    type="button"
                    onClick={() => setActiveModal('service')}
                    className="px-2.5 py-1 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] flex items-center gap-1 shadow-lg transition active:scale-95"
                    title={t('callWaiter', language)}
                  >
                    <Bell className="w-3 h-3" />
                    <span>{t('bell', language)}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Store logo badge */}
            <div className="absolute -bottom-5 left-5 flex items-end gap-3">
              <img
                src={activeTenant.logoUrl}
                alt={activeTenant.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-950 shadow-2xl"
              />
            </div>
          </div>

          {/* Store Info Header */}
          <div className="px-5 pt-7 pb-3">
            <h1 className="text-xl font-black text-slate-100 tracking-tight leading-snug">
              {activeTenant.name}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
              {activeTenant.tagline}
            </p>

            {/* Quick metadata */}
            <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                ★ {activeTenant.stats.averageRating}
              </span>
              <span aria-hidden="true">·</span>
              <span className="truncate">{activeTenant.address}</span>
            </div>
          </div>

          {/* Active Order Live Tracker Banner (If customer has an ongoing order) */}
          {tableActiveOrder && (
            <div className="px-4 mb-3 space-y-2">
              <div
                onClick={() => {
                  setActiveOrderTracking(tableActiveOrder);
                  setActiveModal('order-tracker');
                }}
                className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/40 border border-amber-500/40 shadow-lg cursor-pointer hover:border-amber-400 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-md">
                    <ChefHat className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <span>Order #{tableActiveOrder.orderNumber}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 uppercase">
                        {tableActiveOrder.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      {tableActiveOrder.items.length} {t('items', language)} · {t('total', language)}: {tableActiveOrder.currency}{tableActiveOrder.totalAmount.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {tableActiveOrder.paymentStatus === 'paid' ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-800/40">
                      ✓ {t('statusPaid', language)} ({tableActiveOrder.paymentMethod === 'counter' ? t('paidInCash', language) : tableActiveOrder.paymentMethod?.toUpperCase()})
                    </span>
                  ) : tableActiveOrder.paymentMethod === 'counter' ? (
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 px-2 py-1 rounded-lg border border-amber-600/40">
                        {t('cashAtCounter', language)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOrderToPay(tableActiveOrder);
                        }}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-[10px] border border-slate-700 transition"
                      >
                        {t('payBill', language)}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOrderToPay(tableActiveOrder);
                      }}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-[11px] flex items-center gap-1 shadow-md transition"
                    >
                      <CreditCard className="w-3 h-3" />
                      <span>{t('payBill', language)}</span>
                    </button>
                  )}
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                </div>
              </div>
            </div>
          )}

          {/* Action Cards Grid / Native iOS App Clip Action List */}
          <div className="px-4 space-y-2.5">
            {/* 1. Digital Menu & Table Ordering Card */}
            {activeTenant.features.menu && (
              <button
                onClick={() => setActiveModal('menu')}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-900/90 border border-slate-800 hover:border-slate-700 active:scale-[0.98] transition flex items-center justify-between group shadow-sm text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-950 shadow-md shrink-0"
                    style={{ backgroundColor: activeTenant.themeColor }}
                  >
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-100 group-hover:text-amber-400 transition flex items-center gap-1.5">
                      <span>{t('digitalMenu', language)}</span>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                        {t('tableSide', language)}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {t('digitalMenuDesc', language)}
                    </div>
                  </div>
                </div>
              </button>
            )}

            {/* 1.5 Call Waiter & Table Service Bell */}
            {(activeTenant.features.serviceBell ?? true) && (
              <button
                type="button"
                onClick={() => setActiveModal('service')}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 hover:border-amber-400/70 active:scale-[0.98] transition flex items-center justify-between group shadow-sm text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-md shrink-0">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-amber-300 group-hover:text-amber-200 transition flex items-center gap-1.5">
                      <span>{t('callWaiterService', language)}</span>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 animate-pulse">
                        {t('table', language)} {selectedTable}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {t('callWaiterServiceDesc', language)}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-400 group-hover:text-amber-200 transition" />
              </button>
            )}

            {/* 2. Loyalty Stamp Card */}
            {activeTenant.features.loyalty && (
              <button
                onClick={() => setActiveModal('loyalty')}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-800/40 hover:border-purple-600/60 active:scale-[0.98] transition flex items-center justify-between group shadow-sm text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shrink-0">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-purple-200 group-hover:text-purple-100 transition flex items-center gap-1.5">
                      <span>{t('collectLoyalty', language)}</span>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-purple-500/30 text-purple-300 rounded border border-purple-500/40">
                        Rewards
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {currentCustomerCard
                        ? `${currentCustomerCard.stampsCount}/${activeTenant.loyalty.stampsRequired} ${t('collectLoyaltyDesc', language)}`
                        : `${activeTenant.loyalty.stampsRequired} ${t('collectLoyaltyPrompt', language)}`}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-purple-400 group-hover:text-purple-200 transition" />
              </button>
            )}

            {/* 3. One-Tap Guest Wi-Fi */}
            {activeTenant.features.wifi && (
              <button
                onClick={() => setActiveModal('wifi')}
                className="w-full p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 active:scale-[0.98] transition flex items-center justify-between group shadow-sm text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center text-white shadow-md shrink-0">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-100 group-hover:text-cyan-300 transition">
                      {t('freeWifi', language)}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      SSID: {activeTenant.wifi.ssid}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-200 transition" />
              </button>
            )}

            {/* 4. Google Review Booster */}
            {activeTenant.features.googleReviews && (
              <button
                onClick={() => setActiveModal('review')}
                className="w-full p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 active:scale-[0.98] transition flex items-center justify-between group shadow-sm text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-md shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-100 group-hover:text-amber-400 transition">
                      {t('rateOnGoogle', language)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {t('rateOnGoogleDesc', language)}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-200 transition" />
              </button>
            )}

            {/* 5. Anonymous Table Feedback */}
            {activeTenant.features.feedback && (
              <button
                onClick={() => setActiveModal('feedback')}
                className="w-full p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 active:scale-[0.98] transition flex items-center justify-between group shadow-sm text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-100 group-hover:text-emerald-300 transition">
                      {t('privateFeedback', language)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {t('privateFeedbackDesc', language)}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-200 transition" />
              </button>
            )}

            {/* 6. Wait-Time Sudoku Game */}
            {activeTenant.features.games && (
              <button
                onClick={() => setActiveModal('game')}
                className="w-full p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 active:scale-[0.98] transition flex items-center justify-between group shadow-sm text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-md shrink-0">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-100 group-hover:text-rose-300 transition">
                      {t('tableSudoku', language)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {t('tableSudokuDesc', language)}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-200 transition" />
              </button>
            )}
          </div>

          {/* Social Icons & Footer */}
          <div className="px-5 pt-6 pb-2 text-center space-y-3">
            <div className="flex items-center justify-center gap-4 text-slate-400">
              {activeTenant.socials.instagram && (
                <a
                  href={activeTenant.socials.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-full bg-slate-900 border border-slate-800 hover:text-amber-400 hover:border-slate-700 transition"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {activeTenant.socials.phone && (
                <a
                  href={`tel:${activeTenant.socials.phone}`}
                  className="p-2 rounded-full bg-slate-900 border border-slate-800 hover:text-amber-400 hover:border-slate-700 transition"
                  title="Call Store"
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}
            </div>

            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
              Powered by TableTap · Instant PWA · Zero NFC Required
            </div>
          </div>
        </div>

        {/* =========================================================================
            BOTTOM SHEET MODALS
            ========================================================================= */}

        {/* 1. DIGITAL MENU & ORDERING BOTTOM SHEET */}
        {activeModal === 'menu' && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-end animate-fade-in">
            <div className="h-[94%] w-full bg-slate-900 border-t border-slate-800 rounded-t-3xl flex flex-col overflow-hidden shadow-2xl relative">
              {/* Sheet header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-500" />
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">Table Menu & Order</h3>
                    <span className="text-[10px] text-amber-400 font-mono">Table {selectedTable}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {cartItemCount > 0 && (
                    <button
                      onClick={() => setActiveModal('cart')}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs shadow-md"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{cartItemCount}</span>
                    </button>
                  )}
                  <button
                    onClick={() => setActiveModal(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Search & Category Pills */}
              <div className="p-3 border-b border-slate-800 space-y-2 shrink-0">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search menu items..."
                    value={menuSearch || ''}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Categories */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none text-xs">
                  <button
                    onClick={() => setSelectedCat('all')}
                    className={`px-3 py-1 rounded-lg whitespace-nowrap transition ${
                      selectedCat === 'all'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    All ({items.filter((i) => i.isAvailable).length})
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCat(c.id)}
                      className={`px-3 py-1 rounded-lg whitespace-nowrap transition ${
                        selectedCat === c.id
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
                {filteredMenuItems.map((item) => {
                  const inCart = cart.find((i) => i.menuItemId === item.id);

                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-3"
                    >
                      <div
                        onClick={() => setSelectedMenuItemDetail(item)}
                        className="flex-1 min-w-0 cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-slate-100 truncate">
                            {item.name}
                          </span>
                          {item.isVeg && <Leaf className="w-3 h-3 text-emerald-400 shrink-0" />}
                          {item.isSpicy && <Flame className="w-3 h-3 text-rose-400 shrink-0" />}
                        </div>

                        <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                          {item.description}
                        </div>

                        <div className="font-mono font-bold text-amber-400 text-xs mt-1.5">
                          {activeTenant.currency}{item.price.toFixed(2)}
                        </div>
                      </div>

                      {item.imageUrl && (
                        <div
                          onClick={() => setSelectedMenuItemDetail(item)}
                          className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 cursor-pointer"
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Direct In-Menu Order Button */}
                      <div className="shrink-0 flex items-center">
                        {inCart ? (
                          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-amber-500/50">
                            <button
                              onClick={() => updateCartQuantity(item.id, -1)}
                              className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-mono font-bold text-amber-400 text-xs px-1">
                              {inCart.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(item.id, 1)}
                              className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              addToCart(item, 1);
                              confetti({
                                particleCount: 20,
                                spread: 40,
                                origin: { y: 0.8 },
                              });
                            }}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Sticky Cart Checkout Bar */}
              {cartItemCount > 0 && (
                <div className="absolute bottom-3 left-3 right-3 p-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-2xl flex items-center justify-between z-30 animate-fade-in">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-black text-xs">
                      {cartItemCount}
                    </div>
                    <div>
                      <div className="font-extrabold text-xs leading-tight">
                        Table {selectedTable} Order Draft
                      </div>
                      <div className="font-mono font-black text-sm">
                        {activeTenant.currency}{cartTotal.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveModal('cart')}
                    className="px-3.5 py-2 bg-slate-950 hover:bg-slate-900 active:scale-95 text-slate-100 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
                  >
                    <span>Review Order</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. TABLE ORDER REVIEW & CHECKOUT BOTTOM SHEET */}
        {activeModal === 'cart' && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-end animate-fade-in">
            <div className="h-[94%] w-full bg-slate-900 border-t border-slate-800 rounded-t-3xl flex flex-col overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-500" />
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">Review Table Order</h3>
                    <div className="text-[10px] text-slate-400 font-mono">Sending directly to Kitchen for Table {selectedTable}</div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModal('menu')}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Items in Cart */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
                {cart.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 space-y-2">
                    <ShoppingBag className="w-8 h-8 mx-auto text-slate-600" />
                    <div>Your table order is empty.</div>
                    <button
                      onClick={() => setActiveModal('menu')}
                      className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
                    >
                      Browse Menu
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {cart.map((item) => (
                        <div
                          key={item.menuItemId}
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                        >
                          <div className="flex-1">
                            <div className="font-bold text-slate-100">{item.name}</div>
                            {item.specialInstructions && (
                              <div className="text-[11px] text-amber-300 italic mt-0.5">
                                Note: {item.specialInstructions}
                              </div>
                            )}
                            <div className="font-mono text-amber-400 text-xs mt-1">
                              {activeTenant.currency}{(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                            <button
                              onClick={() => updateCartQuantity(item.menuItemId, -1)}
                              className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-mono font-bold text-slate-200 text-xs px-1">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(item.menuItemId, 1)}
                              className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => removeFromCart(item.menuItemId)}
                              className="p-1 text-slate-500 hover:text-rose-400 ml-1"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Table Special Instructions */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <label className="block text-slate-300 font-semibold text-xs">
                        Special Notes for Kitchen
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Less ice in coffee, bring water first..."
                        value={orderNotes || ''}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Guest Name & Payment preference */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                      <div>
                        <label className="block text-slate-300 font-semibold text-xs mb-1">
                          Guest Name (optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Maya / Table 4 Guest"
                          value={orderGuestName || ''}
                          onChange={(e) => setOrderGuestName(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold text-xs mb-1">
                          Payment Mode
                        </label>
                        <div className={`grid gap-2 ${(activeTenant.features.payments ?? (activeTenant.payments?.enabled ?? true)) ? 'grid-cols-2' : 'grid-cols-1'}`}>
                          <button
                            type="button"
                            onClick={() => setOrderPaymentPref('pay_at_counter')}
                            className={`p-2 rounded-lg border text-center font-medium transition ${
                              orderPaymentPref === 'pay_at_counter'
                                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            Pay Later at Counter
                          </button>
                          {(activeTenant.features.payments ?? (activeTenant.payments?.enabled ?? true)) && (
                            <button
                              type="button"
                              onClick={() => setOrderPaymentPref('card_online')}
                              className={`p-2 rounded-lg border text-center font-medium transition ${
                                orderPaymentPref === 'card_online'
                                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                                  : 'bg-slate-900 border-slate-800 text-slate-400'
                              }`}
                            >
                              Online / UPI Card
                            </button>
                          )}
                        </div>
                        {!(activeTenant.features.payments ?? (activeTenant.payments?.enabled ?? true)) && (
                          <div className="text-[11px] text-amber-400/90 mt-1 flex items-center gap-1">
                            ℹ️ Digital payment gateway is currently suspended by administration. Settle at counter.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bill Breakdown */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Items Subtotal</span>
                        <span className="font-mono">{activeTenant.currency}{cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Taxes & Service (8%)</span>
                        <span className="font-mono">{activeTenant.currency}{(cartTotal * 0.08).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-100 font-bold pt-2 border-t border-slate-800 text-sm">
                        <span>Total to Pay</span>
                        <span className="font-mono text-amber-400 font-black">
                          {activeTenant.currency}{(cartTotal * 1.08).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Order Submit CTA */}
              {cart.length > 0 && (
                <div className="p-4 border-t border-slate-800 bg-slate-950/80 shrink-0">
                  <button
                    onClick={handlePlaceTableOrder}
                    className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Order to Kitchen (Table {selectedTable})</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. LIVE ORDER TRACKER BOTTOM SHEET */}
        {activeModal === 'order-tracker' && activeOrderTracking && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-end animate-fade-in">
            <div className="h-[92%] w-full bg-slate-900 border-t border-slate-800 rounded-t-3xl flex flex-col overflow-y-auto p-5 shadow-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">
                      Order #{activeOrderTracking.orderNumber} Status
                    </h3>
                    <div className="text-[10px] text-amber-400 font-mono">
                      Seated at Table {activeOrderTracking.tableNumber}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Live Status Progress Steps */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 space-y-4">
                <div className="text-center space-y-1">
                  <div className="text-2xl animate-bounce">
                    {activeOrderTracking.status === 'pending'
                      ? '🛎️'
                      : activeOrderTracking.status === 'preparing'
                      ? '👨‍🍳'
                      : activeOrderTracking.status === 'served'
                      ? '🍽️'
                      : '✅'}
                  </div>
                  <div className="font-extrabold text-sm text-slate-100">
                    {activeOrderTracking.status === 'pending' && 'Order Received by Kitchen!'}
                    {activeOrderTracking.status === 'preparing' && 'Chef is Preparing Your Food!'}
                    {activeOrderTracking.status === 'served' && 'Served at Your Table!'}
                    {activeOrderTracking.status === 'paid' && 'Bill Settled. Enjoy your day!'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Estimated prep time: ~{activeOrderTracking.estimatedMinutes || 10} minutes
                  </div>
                </div>

                {/* Progress tracker bar */}
                <div className="grid grid-cols-3 gap-1.5 pt-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      activeOrderTracking.status === 'pending' ||
                      activeOrderTracking.status === 'preparing' ||
                      activeOrderTracking.status === 'served'
                        ? 'bg-amber-500'
                        : 'bg-slate-800'
                    }`}
                  />
                  <div
                    className={`h-2 rounded-full transition-all ${
                      activeOrderTracking.status === 'preparing' ||
                      activeOrderTracking.status === 'served'
                        ? 'bg-amber-500'
                        : 'bg-slate-800'
                    }`}
                  />
                  <div
                    className={`h-2 rounded-full transition-all ${
                      activeOrderTracking.status === 'served'
                        ? 'bg-emerald-500'
                        : 'bg-slate-800'
                    }`}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  <span>Received</span>
                  <span>Cooking</span>
                  <span>Served</span>
                </div>
              </div>

              {/* Itemized summary */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-slate-200 text-xs">Ordered Items</div>
                <div className="space-y-1 text-slate-300">
                  {activeOrderTracking.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between text-xs py-1 border-b border-slate-900">
                      <span>{i.quantity}x {i.name}</span>
                      <span className="font-mono text-amber-400">
                        {activeOrderTracking.currency}{(i.price * i.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between font-bold text-slate-100 pt-2 text-xs">
                  <span>Total Amount</span>
                  <span className="font-mono text-amber-400">
                    {activeOrderTracking.currency}{activeOrderTracking.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Status & Action */}
              {activeOrderTracking.paymentStatus === 'paid' ? (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>
                      {activeOrderTracking.paymentMethod === 'counter'
                        ? 'Bill Settled in Cash (कैश भुगतान संपन्न)'
                        : `Bill Settled Online (${activeOrderTracking.paymentMethod?.toUpperCase()})`}
                    </span>
                  </span>
                  <button
                    onClick={() => setOrderToPay(activeOrderTracking)}
                    className="text-amber-300 hover:underline font-mono text-[11px] font-bold"
                  >
                    View Receipt
                  </button>
                </div>
              ) : activeOrderTracking.paymentMethod === 'counter' ? (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/50 to-slate-900 border border-amber-500/40 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                        <Banknote className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-100">
                          Cash Payment at Counter (कैश पेमेंट)
                        </div>
                        <div className="text-[11px] text-amber-300/90">
                          कृपया भोजन के बाद काउंटर पर कैश दें (Order #{activeOrderTracking.orderNumber})
                        </div>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Cash
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
                    <span className="text-slate-400">Want to pay digitally instead?</span>
                    <button
                      onClick={() => setOrderToPay(activeOrderTracking)}
                      className="text-emerald-400 hover:text-emerald-300 font-bold underline"
                    >
                      Pay via UPI / Card
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setOrderToPay(activeOrderTracking)}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 active:scale-95 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-600/25 transition text-xs flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pay Table Bill ({activeOrderTracking.currency}{activeOrderTracking.totalAmount.toFixed(2)}) via UPI / Card</span>
                </button>
              )}

              {/* Action buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => setActiveModal('menu')}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition text-xs"
                >
                  Order More Dishes / Drinks
                </button>

                <button
                  onClick={() => setActiveModal('game')}
                  className="w-full py-2.5 bg-gradient-to-r from-rose-950/60 via-amber-950/40 to-slate-900 hover:from-rose-900/60 text-amber-300 font-bold rounded-xl border border-amber-500/40 transition text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                >
                  <Gamepad2 className="w-4 h-4 text-amber-400" />
                  <span>Play 3D Table Ludo while Waiting (टेबल लूडो)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. LOYALTY STAMP BOTTOM SHEET */}
        {activeModal === 'loyalty' && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-end animate-fade-in">
            <div className="h-[92%] w-full bg-slate-900 border-t border-slate-800 rounded-t-3xl flex flex-col overflow-y-auto p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-purple-400" />
                  <h3 className="font-bold text-slate-100 text-sm">Loyalty Stamp Card</h3>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {currentCustomerCard ? (
                <div className="space-y-4 text-xs">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950 via-slate-950 to-indigo-950 border border-purple-500/40 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-extrabold text-sm text-purple-100">
                          {activeTenant.name}
                        </div>
                        <div className="text-[11px] text-purple-300/80">
                          Guest: {currentCustomerCard.customerName}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xl font-black text-amber-400 font-mono">
                          {currentCustomerCard.stampsCount}
                        </span>
                        <span className="text-xs text-purple-300 font-mono">
                          /{activeTenant.loyalty.stampsRequired}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2.5 py-1">
                      {Array.from({ length: activeTenant.loyalty.stampsRequired }).map((_, idx) => {
                        const isStamped = idx < currentCustomerCard.stampsCount;
                        return (
                          <div
                            key={idx}
                            className={`h-12 rounded-xl flex items-center justify-center border-2 transition-all ${
                              isStamped
                                ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md font-bold scale-100 animate-pulse-subtle'
                                : 'bg-slate-900/60 text-slate-600 border-dashed border-slate-700'
                            }`}
                          >
                            {isStamped ? <Coffee className="w-5 h-5" /> : idx + 1}
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-3 bg-purple-900/30 rounded-xl border border-purple-500/30 text-[11px] text-purple-200 flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        Reward:{' '}
                        <strong className="text-amber-300">
                          {activeTenant.loyalty.rewardTitle}
                        </strong>
                      </span>
                    </div>

                    {currentCustomerCard.stampsCount >= activeTenant.loyalty.stampsRequired && (
                      <button
                        onClick={handleRedeemCustomer}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/30 transition text-xs flex items-center justify-center gap-2 animate-bounce"
                      >
                        <Trophy className="w-4 h-4" />
                        <span>Redeem Free Reward Voucher</span>
                      </button>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="font-semibold text-slate-200 flex items-center justify-between">
                      <span>Add Stamp for Table {selectedTable}</span>
                      <button
                        onClick={() => setStaffPinPrompt(!staffPinPrompt)}
                        className="text-amber-400 hover:underline text-[11px] font-mono"
                      >
                        {staffPinPrompt ? 'Cancel' : 'Enter Staff PIN'}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      Ask your server for their 4-digit PIN (default demo: 1234) to punch your card.
                    </p>

                    {staffPinPrompt && (
                      <form onSubmit={handleSelfPunchWithPin} className="space-y-2 pt-1">
                        <div className="flex gap-2">
                          <input
                            type="password"
                            maxLength={6}
                            required
                            placeholder="Staff PIN (e.g. 1234)"
                            value={staffPinInput || ''}
                            onChange={(e) => setStaffPinInput(e.target.value)}
                            className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-amber-400 font-mono font-bold text-center focus:outline-none focus:border-amber-500"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition"
                          >
                            Punch
                          </button>
                        </div>
                        {pinError && <div className="text-rose-400 text-[11px]">{pinError}</div>}
                      </form>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleLoyaltyLookup} className="space-y-3 text-xs">
                  <div className="text-slate-300">
                    Enter your phone number to claim your digital punch card and get your first welcome stamp free!
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Mobile Phone # *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+1 (206) 555-0144"
                      value={customerPhone || ''}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Your Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Alex"
                      value={customerName || ''}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 transition text-xs"
                  >
                    Start Earning Stamps (Welcome Bonus)
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* 5. GOOGLE REVIEW BOOSTER */}
        {activeModal === 'review' && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-end animate-fade-in">
            <div className="h-[80%] w-full bg-slate-900 border-t border-slate-800 rounded-t-3xl flex flex-col overflow-y-auto p-5 shadow-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-slate-100 text-sm">Review Experience</h3>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
                <div className="font-bold text-slate-100 text-sm">How was your visit today?</div>
                <div className="flex justify-center gap-2 text-2xl text-amber-400 cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setBoosterRating(star)}
                      className="hover:scale-125 transition-transform"
                    >
                      {star <= boosterRating ? '★' : '☆'}
                    </button>
                  ))}
                </div>

                {boosterRating === 5 ? (
                  <div className="space-y-3 pt-2">
                    <p className="text-slate-300 text-xs">
                      We're thrilled you loved it! Supporting us with a 5-star Google review helps our small team immensely.
                    </p>
                    <a
                      href={activeTenant.googleReviewUrl || 'https://maps.google.com'}
                      target="_blank"
                      rel="noreferrer"
                      className="block w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 text-center transition"
                    >
                      Open Google Maps Review (5★)
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    <p className="text-slate-400 text-xs">
                      We want to make this right! Please tell our manager what we can improve before you leave.
                    </p>
                    <button
                      onClick={() => setActiveModal('feedback')}
                      className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition"
                    >
                      Send Message to Owner
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 6. ONE-TAP WI-FI */}
        {activeModal === 'wifi' && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-end animate-fade-in">
            <div className="h-[75%] w-full bg-slate-900 border-t border-slate-800 rounded-t-3xl flex flex-col overflow-y-auto p-5 shadow-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-bold text-slate-100 text-sm">Guest Wi-Fi</h3>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-center">
                <div>
                  <div className="text-slate-400 text-[11px]">Network SSID</div>
                  <div className="font-mono font-bold text-base text-slate-100">
                    {activeTenant.wifi.ssid}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-cyan-400 font-bold text-sm flex items-center justify-between">
                  <span>{activeTenant.wifi.password}</span>
                  <button
                    onClick={handleCopyWifi}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 bg-cyan-600/30 text-cyan-300 rounded border border-cyan-500/40 hover:bg-cyan-600/50 transition"
                  >
                    {copiedWifi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedWifi ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400">
                  Select <strong>{activeTenant.wifi.ssid}</strong> in your phone settings and paste password to connect.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 7. ANONYMOUS FEEDBACK */}
        {activeModal === 'feedback' && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-end animate-fade-in">
            <div className="h-[92%] w-full bg-slate-900 border-t border-slate-800 rounded-t-3xl flex flex-col overflow-y-auto p-5 shadow-2xl space-y-3.5 text-xs">
              <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-slate-100 text-sm">Table-Side Feedback</h3>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {fbSubmitted ? (
                <div className="p-8 text-center space-y-2">
                  <div className="text-3xl">🎉</div>
                  <div className="font-bold text-emerald-400 text-sm">Feedback Sent!</div>
                  <div className="text-slate-400 text-[11px]">Thank you for helping us improve.</div>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Overall Table Rating</label>
                    <div className="flex gap-2 text-2xl text-amber-400 cursor-pointer">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          type="button"
                          key={s}
                          onClick={() => setFbRating(s)}
                          className="hover:scale-110 transition"
                        >
                          {s <= fbRating ? '★' : '☆'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">What stood out?</label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Fast Service',
                        'Exceptional Coffee',
                        'Cozy Music',
                        'Great Ambiance',
                        'Slight Wait',
                        'Cold Food',
                      ].map((tag) => (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition ${
                            fbTags.includes(tag)
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-slate-950 text-slate-400 border-slate-800'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Private Note to Manager</label>
                    <textarea
                      rows={2}
                      placeholder="Share your thoughts..."
                      value={fbComment || ''}
                      onChange={(e) => setFbComment(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Optional Contact (Email/Phone)</label>
                    <input
                      type="text"
                      placeholder="Leave if you'd like a response"
                      value={fbContact || ''}
                      onChange={(e) => setFbContact(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition"
                  >
                    Submit Feedback
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* 8. 3D TABLE LUDO MINI-GAME */}
        {activeModal === 'game' && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-end animate-fade-in text-xs">
            <div className="h-[96%] w-full bg-slate-900 border-t border-slate-800 rounded-t-3xl flex flex-col overflow-y-auto p-4 shadow-2xl space-y-3">
              <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 via-amber-500 to-emerald-500 flex items-center justify-center text-white font-bold shadow-md">
                    <Gamepad2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                      <span>3D Table Ludo King (लूडो किंग)</span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Table {selectedTable}
                      </span>
                    </h3>
                    <div className="text-[10px] text-slate-400">
                      3D Characters · Smart AI 1 vs 1 · Table-to-Table Match
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <TableLudoGame />
            </div>
          </div>
        )}

        {/* 9. SWITCH TABLE NUMBER */}
        {activeModal === 'table-switch' && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3 text-xs">
              <div className="font-bold text-slate-100 text-sm">Select Table Number</div>
              <p className="text-slate-400 text-[11px]">
                Simulate scanning a different table stand in {activeTenant.name}:
              </p>

              <div className="grid grid-cols-4 gap-2 py-2">
                {tables.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTable(t.tableNumber);
                      setActiveModal(null);
                    }}
                    className={`py-2 rounded-lg font-bold transition ${
                      selectedTable === t.tableNumber
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {t.tableNumber}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-full py-2 bg-slate-800 text-slate-300 rounded-lg font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* 9.5 SERVICE / CALL WAITER BOTTOM SHEET */}
        {activeModal === 'service' && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-end animate-fade-in text-xs">
            <div className="h-[92%] w-full bg-slate-900 border-t border-slate-800 rounded-t-3xl flex flex-col overflow-y-auto p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">
                      {t('bellModalTitle', language)}
                    </h3>
                    <div className="text-[10px] text-amber-400 font-mono">
                      {t('table', language)} {selectedTable}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {serviceFeedbackSent ? (
                <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-center space-y-3 animate-fade-in">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <div className="font-bold text-slate-100 text-sm">
                    {t('bellAlertSent', language)}
                  </div>
                  <p className="text-emerald-300 text-xs">
                    {`"${lastServiceSentTitle}" ${t('bellAlertSub', language)} ${selectedTable}.`}
                  </p>
                  <div className="text-[10px] text-slate-400 font-mono pt-1">
                    {t('bellChimeSent', language)}
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-slate-400 text-xs">
                    {t('callWaiterServiceDesc', language)}
                  </p>

                  <div className="grid grid-cols-1 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleSendServiceRequest('waiter', t('serviceCallWaiter', language))}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 active:scale-95 transition flex items-center justify-between text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                          🛎️
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 group-hover:text-amber-300 transition">
                            {t('serviceCallWaiter', language)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {t('serviceCallWaiterDesc', language)}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendServiceRequest('water', t('serviceWater', language))}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500 active:scale-95 transition flex items-center justify-between text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                          💧
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 group-hover:text-cyan-300 transition">
                            {t('serviceWater', language)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {t('serviceWaterDesc', language)}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendServiceRequest('bill', t('serviceBill', language))}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 active:scale-95 transition flex items-center justify-between text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                          🧾
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 group-hover:text-emerald-300 transition">
                            {t('serviceBill', language)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {t('serviceBillDesc', language)}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendServiceRequest('cleaning', t('serviceCleaning', language))}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500 active:scale-95 transition flex items-center justify-between text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                          🧹
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 group-hover:text-purple-300 transition">
                            {t('serviceCleaning', language)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {t('serviceCleaningDesc', language)}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendServiceRequest('cutlery', t('serviceCutlery', language))}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 active:scale-95 transition flex items-center justify-between text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                          🥢
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 group-hover:text-amber-300 transition">
                            {t('serviceCutlery', language)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {t('serviceCutleryDesc', language)}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
                    </button>
                  </div>

                  {/* Custom Note Input */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 pt-3">
                    <label className="block text-slate-300 font-medium text-xs">
                      {t('customRequestLabel', language)}
                    </label>
                    <input
                      type="text"
                      placeholder={t('customRequestPlaceholder', language)}
                      value={serviceCustomNote || ''}
                      onChange={(e) => setServiceCustomNote(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      disabled={!serviceCustomNote.trim()}
                      onClick={() => handleSendServiceRequest('custom', serviceCustomNote.trim())}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold rounded-lg transition text-xs flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{t('sendRequestBtn', language)}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* 9.6 DEDICATED MULTI-CULTURAL LANGUAGE SELECTION MODAL */}
        {activeModal === 'language' && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-end animate-fade-in text-xs">
            <div className="h-auto max-h-[85%] w-full bg-slate-900 border-t border-slate-800 rounded-t-3xl flex flex-col p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">
                      {t('selectLanguageTitle', language)}
                    </h3>
                    <div className="text-[10px] text-slate-400">
                      {t('selectLanguageSubtitle', language)}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2 pt-1">
                {SUPPORTED_LANGUAGES.map((langOption) => {
                  const isSelected = language === langOption.code;
                  return (
                    <button
                      key={langOption.code}
                      type="button"
                      onClick={() => {
                        setLanguage(langOption.code);
                        setActiveModal(null);
                        confetti({
                          particleCount: 25,
                          spread: 45,
                          origin: { y: 0.7 },
                        });
                      }}
                      className={`p-3.5 rounded-2xl border transition flex items-center justify-between text-left group active:scale-[0.98] ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-md ring-1 ring-amber-500/40'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl shrink-0">{langOption.flag}</span>
                        <div>
                          <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                            <span>{langOption.nativeName}</span>
                            <span className="text-[11px] text-slate-400 font-normal">
                              ({langOption.name})
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                            Region / Code: {langOption.code.toUpperCase()}
                          </div>
                        </div>
                      </div>

                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-slate-700 flex items-center justify-center text-slate-500 group-hover:border-slate-500">
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 text-center text-[10px] text-slate-500 border-t border-slate-800/80">
                Dynamic dictionary automatically updates menu, table services, cart, and live order status.
              </div>
            </div>
          </div>
        )}

        {/* 10. MENU ITEM DETAIL MODAL */}
        {selectedMenuItemDetail && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl text-xs space-y-3">
              {selectedMenuItemDetail.imageUrl && (
                <div className="h-44 w-full relative">
                  <img
                    src={selectedMenuItemDetail.imageUrl}
                    alt={selectedMenuItemDetail.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setSelectedMenuItemDetail(null)}
                    className="absolute top-2.5 right-2.5 p-1 rounded-full bg-slate-950/80 text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-slate-100 text-base leading-tight">
                    {selectedMenuItemDetail.name}
                  </h4>
                  <span className="font-mono font-bold text-amber-400 text-base shrink-0">
                    {activeTenant.currency}{selectedMenuItemDetail.price.toFixed(2)}
                  </span>
                </div>

                <p className="text-slate-300 text-xs leading-relaxed">
                  {selectedMenuItemDetail.description}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
                  {selectedMenuItemDetail.isVeg && <span className="text-emerald-400">Vegetarian</span>}
                  {selectedMenuItemDetail.isVegan && <span>· 100% Vegan</span>}
                  {selectedMenuItemDetail.isGlutenFree && <span>· Gluten Free</span>}
                  {selectedMenuItemDetail.calories && <span>· {selectedMenuItemDetail.calories} kcal</span>}
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] mb-1 font-medium">
                    Special preparation note
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Oat milk / Extra hot / No sugar"
                    value={itemNoteInput || ''}
                    onChange={(e) => setItemNoteInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  onClick={() => {
                    addToCart(selectedMenuItemDetail, 1, itemNoteInput);
                    setSelectedMenuItemDetail(null);
                    setItemNoteInput('');
                    confetti({
                      particleCount: 25,
                      spread: 50,
                      origin: { y: 0.8 },
                    });
                  }}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition text-xs flex items-center justify-center gap-1.5 shadow-md mt-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Table {selectedTable} Order</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 11. DIGITAL PAYMENT & RECEIPT MODAL */}
        {orderToPay && (
          <DigitalPaymentModal
            order={orderToPay}
            onClose={() => setOrderToPay(null)}
            onPaymentSuccess={(paidOrder) => {
              setActiveOrderTracking(paidOrder);
            }}
          />
        )}
      </div>
    </div>
  );
};
