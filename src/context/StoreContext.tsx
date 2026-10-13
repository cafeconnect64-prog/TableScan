import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Tenant,
  MenuItem,
  MenuCategory,
  CustomerFeedback,
  CustomerLoyaltyCard,
  TableQR,
  TableOrder,
  OrderItem,
  OrderStatus,
  AppViewMode,
  ServiceRequest,
  ServiceRequestType,
  AppLanguage,
} from '../types';
import {
  INITIAL_TENANTS,
  INITIAL_CATEGORIES,
  INITIAL_MENU_ITEMS,
  INITIAL_TABLES,
  INITIAL_FEEDBACK,
  INITIAL_LOYALTY_CARDS,
  INITIAL_ORDERS,
  INITIAL_SERVICE_REQUESTS,
} from '../data/mockData';

interface StoreContextType {
  tenants: Tenant[];
  activeTenantId: string;
  activeTenant: Tenant;
  setActiveTenantId: (id: string) => void;
  currentView: AppViewMode;
  setCurrentView: (view: AppViewMode) => void;
  selectedTable: string;
  setSelectedTable: (table: string) => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  serviceRequests: ServiceRequest[];
  callService: (type: ServiceRequestType, title: string, note?: string) => ServiceRequest;
  updateServiceRequestStatus: (id: string, status: 'acknowledged' | 'completed') => void;
  playNotificationSound: () => void;
  categories: MenuCategory[];
  items: MenuItem[];
  tables: TableQR[];
  feedback: CustomerFeedback[];
  loyaltyCards: CustomerLoyaltyCard[];
  orders: TableOrder[];
  cart: OrderItem[];
  cartTotal: number;
  cartItemCount: number;
  
  // Cart & Ordering actions
  addToCart: (item: MenuItem, qty?: number, instructions?: string) => void;
  updateCartQuantity: (menuItemId: string, delta: number) => void;
  removeFromCart: (menuItemId: string) => void;
  clearCart: () => void;
  placeOrder: (details?: {
    customerName?: string;
    customerPhone?: string;
    notes?: string;
    paymentMethod?: 'upi' | 'card' | 'counter';
    isPrepaid?: boolean;
    transactionId?: string;
  }) => TableOrder;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  payOrderOnline: (orderId: string, method: 'upi' | 'card', txnId?: string) => void;
  markOrderAsCashPaid: (orderId: string) => void;

  // Tenant actions
  updateActiveTenant: (data: Partial<Tenant>) => void;
  updateTenantById: (tenantId: string, data: Partial<Tenant>) => void;
  toggleTenantService: (tenantId: string, serviceKey: string, enabled: boolean) => void;
  createNewTenant: (tenant: Omit<Tenant, 'id' | 'createdAt' | 'stats'>) => void;
  
  // Menu actions
  addCategory: (name: string) => void;
  deleteCategory: (categoryId: string) => void;
  saveMenuItem: (item: Omit<MenuItem, 'id'> & { id?: string }) => void;
  deleteMenuItem: (itemId: string) => void;
  toggleItemAvailability: (itemId: string) => void;
  
  // Table & QR actions
  generateTableBatch: (start: number, end: number, section: string) => void;
  deleteTable: (tableId: string) => void;
  recordScan: (tenantId: string, tableNumber: string) => void;
  
  // Feedback actions
  submitFeedback: (data: Omit<CustomerFeedback, 'id' | 'createdAt' | 'status'>) => void;
  updateFeedbackStatus: (id: string, status: CustomerFeedback['status']) => void;
  
  // Loyalty actions
  getOrRegisterLoyaltyCard: (phone: string, name?: string) => CustomerLoyaltyCard;
  punchStamp: (cardId: string, staffPin: string, tableNum?: string) => { success: boolean; message: string; earnedReward?: boolean };
  claimReward: (cardId: string) => boolean;
  
  // Utilities
  resetToDefaultData: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEY_PREFIX = 'tabletap_v1_';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}tenants`);
    return saved ? JSON.parse(saved) : INITIAL_TENANTS;
  });

  const [activeTenantId, setActiveTenantId] = useState<string>(() => {
    return tenants[0]?.id || 'tenant-1';
  });

  const [currentView, setCurrentView] = useState<AppViewMode>('customer');
  const [selectedTable, setSelectedTable] = useState<string>('4');

  const [categoriesMap, setCategoriesMap] = useState<Record<string, MenuCategory[]>>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}categories`);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [itemsMap, setItemsMap] = useState<Record<string, MenuItem[]>>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}items`);
    return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
  });

  const [tablesMap, setTablesMap] = useState<Record<string, TableQR[]>>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}tables`);
    return saved ? JSON.parse(saved) : INITIAL_TABLES;
  });

  const [feedbackList, setFeedbackList] = useState<CustomerFeedback[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}feedback`);
    return saved ? JSON.parse(saved) : INITIAL_FEEDBACK;
  });

  const [loyaltyCards, setLoyaltyCards] = useState<CustomerLoyaltyCard[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}loyalty`);
    return saved ? JSON.parse(saved) : INITIAL_LOYALTY_CARDS;
  });

  const [orders, setOrders] = useState<TableOrder[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}orders`);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  // Table-side cart for the customer session
  const [cart, setCart] = useState<OrderItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}cart`);
    return saved ? JSON.parse(saved) : [];
  });

  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}services`);
    return saved ? JSON.parse(saved) : INITIAL_SERVICE_REQUESTS;
  });

  const [language, setLanguage] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}lang`) as AppLanguage | null;
    return saved && ['en', 'hi', 'es', 'fr', 'ar'].includes(saved) ? saved : 'en';
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}tenants`, JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}categories`, JSON.stringify(categoriesMap));
  }, [categoriesMap]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}items`, JSON.stringify(itemsMap));
  }, [itemsMap]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}tables`, JSON.stringify(tablesMap));
  }, [tablesMap]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}feedback`, JSON.stringify(feedbackList));
  }, [feedbackList]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}loyalty`, JSON.stringify(loyaltyCards));
  }, [loyaltyCards]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}orders`, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}cart`, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}services`, JSON.stringify(serviceRequests));
  }, [serviceRequests]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}lang`, language);
  }, [language]);

  const activeTenant = tenants.find((t) => t.id === activeTenantId) || tenants[0];
  const categories = categoriesMap[activeTenantId] || [];
  const items = itemsMap[activeTenantId] || [];
  const tables = tablesMap[activeTenantId] || [];
  const feedback = feedbackList.filter((f) => f.tenantId === activeTenantId);

  // Cart Calculations
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Cart Actions
  const addToCart = (item: MenuItem, qty: number = 1, instructions?: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item.id
            ? {
                ...i,
                quantity: i.quantity + qty,
                specialInstructions: instructions || i.specialInstructions,
              }
            : i
        );
      }
      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: qty,
          specialInstructions: instructions,
        },
      ];
    });
  };

  const updateCartQuantity = (menuItemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((i) => {
          if (i.menuItemId === menuItemId) {
            const nextQty = i.quantity + delta;
            return nextQty > 0 ? { ...i, quantity: nextQty } : null;
          }
          return i;
        })
        .filter(Boolean) as OrderItem[];
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setCart((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const playNotificationSound = () => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;

      // First chime
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.45);

      // Second chime
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1320, now + 0.12);
      gain2.gain.setValueAtTime(0.15, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.65);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  const callService = (type: ServiceRequestType, title: string, note?: string): ServiceRequest => {
    const newRequest: ServiceRequest = {
      id: `req-${Date.now()}`,
      tenantId: activeTenantId,
      tableNumber: selectedTable,
      type,
      title,
      note,
      createdAt: 'Just now',
      status: 'pending',
    };
    setServiceRequests((prev) => [newRequest, ...prev]);
    playNotificationSound();
    return newRequest;
  };

  const updateServiceRequestStatus = (id: string, status: 'acknowledged' | 'completed') => {
    setServiceRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  const placeOrder = (details?: {
    customerName?: string;
    customerPhone?: string;
    notes?: string;
    paymentMethod?: 'upi' | 'card' | 'counter';
    isPrepaid?: boolean;
    transactionId?: string;
  }): TableOrder => {
    const subtotal = cartTotal;
    const taxRate = activeTenant.payments?.taxRatePercent ?? 8.0;
    const tax = parseFloat(((subtotal * taxRate) / 100).toFixed(2));
    const totalAmount = parseFloat((subtotal + tax).toFixed(2));
    const nextOrderNum = (orders[0]?.orderNumber || 40) + 1;
    const isPaid = details?.isPrepaid === true;

    const newOrder: TableOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: nextOrderNum,
      tenantId: activeTenantId,
      tableNumber: selectedTable,
      items: [...cart],
      subtotal,
      tax,
      totalAmount,
      currency: activeTenant.currency,
      status: isPaid ? 'preparing' : 'pending',
      paymentStatus: isPaid ? 'paid' : 'unpaid',
      paymentMethod: details?.paymentMethod || 'counter',
      transactionId: isPaid ? details?.transactionId || `TXN-${Math.floor(100000 + Math.random() * 900000)}` : undefined,
      paidAt: isPaid ? 'Just now' : undefined,
      customerName: details?.customerName || 'Table Guest',
      customerPhone: details?.customerPhone,
      notes: details?.notes,
      createdAt: 'Just now',
      estimatedMinutes: Math.max(8, cart.length * 4),
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    playNotificationSound();

    // Increment tenant stats
    setTenants((prev) =>
      prev.map((t) =>
        t.id === activeTenantId
          ? {
              ...t,
              stats: {
                ...t.stats,
                totalOrdersCount: (t.stats.totalOrdersCount || 0) + 1,
              },
            }
          : t
      )
    );

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const payOrderOnline = (orderId: string, method: 'upi' | 'card', txnId?: string) => {
    const generatedTxn = txnId || `${method.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              paymentStatus: 'paid',
              paymentMethod: method,
              transactionId: generatedTxn,
              paidAt: 'Just now',
              status: o.status === 'pending' ? 'preparing' : o.status,
            }
          : o
      )
    );
  };

  const markOrderAsCashPaid = (orderId: string) => {
    const generatedTxn = `CASH-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              paymentStatus: 'paid',
              paymentMethod: 'counter',
              transactionId: generatedTxn,
              paidAt: 'Just now',
              status: o.status === 'served' ? 'paid' : o.status,
            }
          : o
      )
    );
  };

  // Tenant Actions
  const updateActiveTenant = (data: Partial<Tenant>) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === activeTenantId ? { ...t, ...data } : t))
    );
  };

  const updateTenantById = (tenantId: string, data: Partial<Tenant>) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === tenantId ? { ...t, ...data } : t))
    );
  };

  const toggleTenantService = (tenantId: string, serviceKey: string, enabled: boolean) => {
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id !== tenantId) return t;

        if (serviceKey === 'paymentGateway') {
          return {
            ...t,
            payments: {
              ...t.payments,
              enabled,
            },
            features: {
              ...t.features,
              payments: enabled,
            },
          };
        }

        if (serviceKey === 'loyaltyTerminal') {
          return {
            ...t,
            loyalty: {
              ...t.loyalty,
              enabled,
            },
            features: {
              ...t.features,
              loyalty: enabled,
            },
          };
        }

        if (serviceKey === 'wifi') {
          return {
            ...t,
            wifi: {
              ...t.wifi,
              enabled,
            },
            features: {
              ...t.features,
              wifi: enabled,
            },
          };
        }

        // Generic feature flag
        return {
          ...t,
          features: {
            ...t.features,
            [serviceKey]: enabled,
          },
        };
      })
    );
  };

  const createNewTenant = (tenantData: Omit<Tenant, 'id' | 'createdAt' | 'stats'>) => {
    const newId = `tenant-${Date.now()}`;
    const newTenant: Tenant = {
      ...tenantData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
      stats: {
        totalScans: 0,
        menuViews: 0,
        loyaltyCardsIssued: 0,
        feedbackCount: 0,
        averageRating: 5.0,
        totalOrdersCount: 0,
      },
    };
    setTenants((prev) => [...prev, newTenant]);
    setCategoriesMap((prev) => ({
      ...prev,
      [newId]: [
        { id: `cat-${newId}-1`, name: 'Specialties', order: 1 },
        { id: `cat-${newId}-2`, name: 'Drinks', order: 2 },
      ],
    }));
    setItemsMap((prev) => ({
      ...prev,
      [newId]: [],
    }));
    setTablesMap((prev) => ({
      ...prev,
      [newId]: [
        {
          id: `tbl-${newId}-1`,
          tenantId: newId,
          tableNumber: '1',
          section: 'Main',
          qrUrl: `https://tabletap.app/r/${newTenant.slug}?table=1`,
          totalScans: 0,
        },
      ],
    }));
    setActiveTenantId(newId);
  };

  // Menu Actions
  const addCategory = (name: string) => {
    if (!name.trim()) return;
    const newCat: MenuCategory = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      order: categories.length + 1,
    };
    setCategoriesMap((prev) => ({
      ...prev,
      [activeTenantId]: [...(prev[activeTenantId] || []), newCat],
    }));
  };

  const deleteCategory = (categoryId: string) => {
    setCategoriesMap((prev) => ({
      ...prev,
      [activeTenantId]: (prev[activeTenantId] || []).filter((c) => c.id !== categoryId),
    }));
    setItemsMap((prev) => ({
      ...prev,
      [activeTenantId]: (prev[activeTenantId] || []).filter((i) => i.categoryId !== categoryId),
    }));
  };

  const saveMenuItem = (itemData: Omit<MenuItem, 'id'> & { id?: string }) => {
    setItemsMap((prev) => {
      const currentItems = prev[activeTenantId] || [];
      if (itemData.id) {
        return {
          ...prev,
          [activeTenantId]: currentItems.map((i) =>
            i.id === itemData.id ? ({ ...itemData, id: itemData.id } as MenuItem) : i
          ),
        };
      } else {
        const newItem: MenuItem = {
          ...itemData,
          id: `item-${Date.now()}`,
        };
        return {
          ...prev,
          [activeTenantId]: [...currentItems, newItem],
        };
      }
    });
  };

  const deleteMenuItem = (itemId: string) => {
    setItemsMap((prev) => ({
      ...prev,
      [activeTenantId]: (prev[activeTenantId] || []).filter((i) => i.id !== itemId),
    }));
  };

  const toggleItemAvailability = (itemId: string) => {
    setItemsMap((prev) => ({
      ...prev,
      [activeTenantId]: (prev[activeTenantId] || []).map((i) =>
        i.id === itemId ? { ...i, isAvailable: !i.isAvailable } : i
      ),
    }));
  };

  // Table & QR Actions
  const generateTableBatch = (start: number, end: number, section: string) => {
    const existing = tablesMap[activeTenantId] || [];
    const newTables: TableQR[] = [];
    for (let i = start; i <= end; i++) {
      const tableNum = String(i);
      const existingTable = existing.find((t) => t.tableNumber === tableNum);
      if (!existingTable) {
        newTables.push({
          id: `tbl-${Date.now()}-${i}`,
          tenantId: activeTenantId,
          tableNumber: tableNum,
          section: section || 'Main',
          qrUrl: `https://tabletap.app/r/${activeTenant.slug}?table=${tableNum}`,
          totalScans: 0,
        });
      }
    }
    setTablesMap((prev) => ({
      ...prev,
      [activeTenantId]: [...(prev[activeTenantId] || []), ...newTables].sort(
        (a, b) => parseInt(a.tableNumber, 10) - parseInt(b.tableNumber, 10)
      ),
    }));
  };

  const deleteTable = (tableId: string) => {
    setTablesMap((prev) => ({
      ...prev,
      [activeTenantId]: (prev[activeTenantId] || []).filter((t) => t.id !== tableId),
    }));
  };

  const recordScan = (tenantId: string, tableNumber: string) => {
    setTenants((prev) =>
      prev.map((t) =>
        t.id === tenantId
          ? {
              ...t,
              stats: {
                ...t.stats,
                totalScans: t.stats.totalScans + 1,
              },
            }
          : t
      )
    );

    setTablesMap((prev) => {
      const tenantTables = prev[tenantId] || [];
      return {
        ...prev,
        [tenantId]: tenantTables.map((t) =>
          t.tableNumber === tableNumber
            ? { ...t, totalScans: t.totalScans + 1, lastScannedAt: 'Just now' }
            : t
        ),
      };
    });
  };

  // Feedback Actions
  const submitFeedback = (data: Omit<CustomerFeedback, 'id' | 'createdAt' | 'status'>) => {
    const newFeedback: CustomerFeedback = {
      ...data,
      id: `fb-${Date.now()}`,
      createdAt: 'Just now',
      status: 'new',
    };
    setFeedbackList((prev) => [newFeedback, ...prev]);

    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === data.tenantId) {
          const tenantFeedbacks = [newFeedback, ...feedbackList.filter((f) => f.tenantId === t.id)];
          const avg =
            tenantFeedbacks.reduce((sum, item) => sum + item.overallRating, 0) /
            tenantFeedbacks.length;
          return {
            ...t,
            stats: {
              ...t.stats,
              feedbackCount: tenantFeedbacks.length,
              averageRating: parseFloat(avg.toFixed(1)),
            },
          };
        }
        return t;
      })
    );
  };

  const updateFeedbackStatus = (id: string, status: CustomerFeedback['status']) => {
    setFeedbackList((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status } : f))
    );
  };

  // Loyalty Actions
  const getOrRegisterLoyaltyCard = (phone: string, name?: string): CustomerLoyaltyCard => {
    const normalizedPhone = phone.replace(/[^0-9]/g, '');
    const found = loyaltyCards.find(
      (c) =>
        c.tenantId === activeTenantId &&
        c.customerPhone.replace(/[^0-9]/g, '') === normalizedPhone
    );

    if (found) {
      if (name && !found.customerName) {
        const updated = { ...found, customerName: name };
        setLoyaltyCards((prev) => prev.map((c) => (c.id === found.id ? updated : c)));
        return updated;
      }
      return found;
    }

    const newCard: CustomerLoyaltyCard = {
      id: `loy-${Date.now()}`,
      tenantId: activeTenantId,
      customerName: name || 'Valued Guest',
      customerPhone: phone,
      stampsCount: 1,
      totalRewardsRedeemed: 0,
      lastStampedAt: 'Just now (Welcome Bonus)',
      history: [
        {
          id: `h-${Date.now()}`,
          type: 'stamp_added',
          date: 'Today',
          tableNumber: selectedTable,
        },
      ],
    };

    setLoyaltyCards((prev) => [newCard, ...prev]);
    setTenants((prev) =>
      prev.map((t) =>
        t.id === activeTenantId
          ? {
              ...t,
              stats: {
                ...t.stats,
                loyaltyCardsIssued: t.stats.loyaltyCardsIssued + 1,
              },
            }
          : t
      )
    );

    return newCard;
  };

  const punchStamp = (
    cardId: string,
    staffPin: string,
    tableNum?: string
  ): { success: boolean; message: string; earnedReward?: boolean } => {
    if (staffPin !== activeTenant.loyalty.secretStaffPin) {
      return { success: false, message: 'Invalid Staff PIN. Please ask your barista or server!' };
    }

    const card = loyaltyCards.find((c) => c.id === cardId);
    if (!card) return { success: false, message: 'Card not found' };

    const newStampCount = card.stampsCount + 1;
    const stampsReq = activeTenant.loyalty.stampsRequired;
    const earnedReward = newStampCount >= stampsReq;

    const updatedCard: CustomerLoyaltyCard = {
      ...card,
      stampsCount: earnedReward ? stampsReq : newStampCount,
      lastStampedAt: 'Just now',
      history: [
        {
          id: `h-${Date.now()}`,
          type: 'stamp_added',
          date: 'Just now',
          tableNumber: tableNum || selectedTable,
          stampedByStaffPin: staffPin,
        },
        ...card.history,
      ],
    };

    setLoyaltyCards((prev) => prev.map((c) => (c.id === cardId ? updatedCard : c)));
    return {
      success: true,
      message: earnedReward
        ? `🎉 Stamp added! Free Reward Unlocked: ${activeTenant.loyalty.rewardTitle}!`
        : `Stamp added! (${newStampCount}/${stampsReq})`,
      earnedReward,
    };
  };

  const claimReward = (cardId: string): boolean => {
    const card = loyaltyCards.find((c) => c.id === cardId);
    if (!card || card.stampsCount < activeTenant.loyalty.stampsRequired) return false;

    const updatedCard: CustomerLoyaltyCard = {
      ...card,
      stampsCount: 0,
      totalRewardsRedeemed: card.totalRewardsRedeemed + 1,
      lastStampedAt: 'Reward Redeemed',
      history: [
        {
          id: `h-${Date.now()}`,
          type: 'reward_redeemed',
          date: 'Today',
          tableNumber: selectedTable,
        },
        ...card.history,
      ],
    };

    setLoyaltyCards((prev) => prev.map((c) => (c.id === cardId ? updatedCard : c)));
    return true;
  };

  const resetToDefaultData = () => {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}tenants`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}categories`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}items`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}tables`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}feedback`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}loyalty`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}orders`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}cart`);
    setTenants(INITIAL_TENANTS);
    setActiveTenantId(INITIAL_TENANTS[0].id);
    setCategoriesMap(INITIAL_CATEGORIES);
    setItemsMap(INITIAL_MENU_ITEMS);
    setTablesMap(INITIAL_TABLES);
    setFeedbackList(INITIAL_FEEDBACK);
    setLoyaltyCards(INITIAL_LOYALTY_CARDS);
    setOrders(INITIAL_ORDERS);
    setCart([]);
  };

  return (
    <StoreContext.Provider
      value={{
        tenants,
        activeTenantId,
        activeTenant,
        setActiveTenantId,
        currentView,
        setCurrentView,
        selectedTable,
        setSelectedTable,
        language,
        setLanguage,
        serviceRequests: serviceRequests.filter((r) => r.tenantId === activeTenantId),
        callService,
        updateServiceRequestStatus,
        playNotificationSound,
        categories,
        items,
        tables,
        feedback,
        loyaltyCards: loyaltyCards.filter((c) => c.tenantId === activeTenantId),
        orders: orders.filter((o) => o.tenantId === activeTenantId),
        cart,
        cartTotal,
        cartItemCount,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        placeOrder,
        updateOrderStatus,
        payOrderOnline,
        markOrderAsCashPaid,
        updateActiveTenant,
        updateTenantById,
        toggleTenantService,
        createNewTenant,
        addCategory,
        deleteCategory,
        saveMenuItem,
        deleteMenuItem,
        toggleItemAvailability,
        generateTableBatch,
        deleteTable,
        recordScan,
        submitFeedback,
        updateFeedbackStatus,
        getOrRegisterLoyaltyCard,
        punchStamp,
        claimReward,
        resetToDefaultData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
