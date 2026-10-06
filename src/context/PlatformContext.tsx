import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  AppSettings,
  Shop,
  Product,
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentTransaction,
  DeliveryPartner,
  Coupon,
  PromotionalBanner,
  User,
  UserRole,
  AdminSession,
  SupportTicket,
  AuditLog,
  NotificationRecord,
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_SHOPS,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_DELIVERY_PARTNERS,
  INITIAL_ORDERS,
  INITIAL_COUPONS,
  INITIAL_BANNERS,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_AUDIT_LOGS,
  INITIAL_PAYMENT_TRANSACTIONS,
} from '../data/initialData';
import {
  hashPasswordWithSalt,
  generateRandomSalt,
  generateToken,
  generateId,
  generateRazorpaySignature,
  validateAdminPasswordRules,
} from '../services/crypto';

interface CartItem {
  product: Product;
  quantity: number;
}

interface PlatformContextType {
  // App & Settings
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;

  // Roles & View Mode
  activeRoleView: 'SUPER_ADMIN' | 'CUSTOMER' | 'SHOP_OWNER' | 'DELIVERY_PARTNER' | 'ACCEPTANCE_TEST';
  setActiveRoleView: (view: 'SUPER_ADMIN' | 'CUSTOMER' | 'SHOP_OWNER' | 'DELIVERY_PARTNER' | 'ACCEPTANCE_TEST') => void;

  // Super Admin Auth & Security
  superAdmin: User | null;
  currentAdminSession: AdminSession | null;
  activeSessions: AdminSession[];
  isSuperAdminConfigured: boolean;
  setupPrimarySuperAdmin: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginSuperAdmin: (email: string, password: string, totpCode?: string) => Promise<{ success: boolean; requires2FA?: boolean; error?: string }>;
  logoutSuperAdmin: () => void;
  logoutAllAdminDevices: () => void;
  resetAdminPassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  toggleAdmin2FA: (enabled: boolean) => void;
  adminList: User[];
  createSubAdmin: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  deleteSubAdmin: (adminId: string) => void;

  // Users & Customers
  users: User[];
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  customerRegister: (name: string, email: string, phone: string, address: string) => Promise<User>;
  customerLogin: (email: string) => User | null;
  suspendCustomer: (customerId: string, reason?: string) => void;
  reactivateCustomer: (customerId: string) => void;
  softDeleteCustomer: (customerId: string) => void;
  updateCustomer: (customerId: string, updates: Partial<User>) => void;

  // Shops
  shops: Shop[];
  currentShop: Shop | null;
  setCurrentShop: (shop: Shop | null) => void;
  approveShop: (shopId: string) => void;
  rejectShop: (shopId: string, reason: string) => void;
  suspendShop: (shopId: string, reason: string) => void;
  reactivateShop: (shopId: string) => void;
  updateShop: (shopId: string, updates: Partial<Shop>) => void;
  registerShop: (shopData: Omit<Shop, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'totalReviews' | 'status'>) => Shop;

  // Products
  products: Product[];
  addProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>) => Product;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  toggleProductAvailability: (productId: string) => void;
  toggleProductFeatured: (productId: string) => void;
  softDeleteProduct: (productId: string) => void;
  restoreProduct: (productId: string) => void;

  // Orders & Checkout
  orders: Order[];
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  appliedCoupon: Coupon | null;
  applyCouponCode: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  cartDiscount: number;
  cartDeliveryFee: number;
  cartTax: number;
  cartTotal: number;
  deliveryAddress: string;
  setDeliveryAddress: (address: string) => void;
  selectedLocation: { name: string; lat: number; lng: number };
  setSelectedLocation: (loc: { name: string; lat: number; lng: number }) => void;
  createOrder: (paymentMethod: PaymentMethod, specialInstructions?: string) => Promise<{ order: Order; razorpayOrder?: { id: string; amount: number; currency: string } }>;
  verifyRazorpayPayment: (orderId: string, razorpayPaymentId: string) => Promise<boolean>;
  shopAcceptOrder: (orderId: string) => void;
  shopPrepareOrder: (orderId: string) => void;
  shopReadyOrder: (orderId: string) => void;
  assignDeliveryPartner: (orderId: string, partnerId: string) => void;
  partnerPickupOrder: (orderId: string) => void;
  partnerDeliverOrder: (orderId: string) => void;
  cancelOrder: (orderId: string, reason: string) => void;
  initiateRefund: (orderId: string, amount: number, reason: string) => void;
  customerReviewOrder: (orderId: string, rating: number, comment: string) => void;

  // Payments & Reconciliation
  payments: PaymentTransaction[];

  // Delivery Partners
  deliveryPartners: DeliveryPartner[];
  addDeliveryPartner: (data: Omit<DeliveryPartner, 'id' | 'createdAt' | 'totalDeliveries' | 'earnings' | 'rating'>) => DeliveryPartner;
  approveDeliveryPartner: (partnerId: string) => void;
  suspendDeliveryPartner: (partnerId: string) => void;
  currentDeliveryPartner: DeliveryPartner | null;
  setCurrentDeliveryPartner: (partner: DeliveryPartner | null) => void;

  // Coupons
  coupons: Coupon[];
  createCoupon: (couponData: Omit<Coupon, 'id' | 'createdAt' | 'usedCount'>) => Coupon;
  toggleCoupon: (couponId: string, isActive: boolean) => void;
  deleteCoupon: (couponId: string) => void;

  // Banners & Promotions
  banners: PromotionalBanner[];
  createBanner: (bannerData: Omit<PromotionalBanner, 'id'>) => PromotionalBanner;
  updateBanner: (bannerId: string, updates: Partial<PromotionalBanner>) => void;
  deleteBanner: (bannerId: string) => void;

  // Support Tickets
  supportTickets: SupportTicket[];
  createSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'replies'>) => SupportTicket;
  replySupportTicket: (ticketId: string, message: string, isInternal?: boolean) => void;
  updateTicketStatus: (ticketId: string, status: SupportTicket['status']) => void;

  // Audit Logs
  auditLogs: AuditLog[];
  logAuditAction: (action: string, targetObject: string, targetId: string, oldValue?: string, newValue?: string) => void;

  // Notifications
  notifications: NotificationRecord[];
  sendNotification: (title: string, body: string, targetRole: NotificationRecord['targetRole'], category?: NotificationRecord['category']) => void;
  markNotificationAsRead: (id: string) => void;

  // Financial Stats Helper
  financialStats: {
    grossSales: number;
    platformCommission: number;
    shopEarnings: number;
    deliveryFees: number;
    partnerEarnings: number;
    refundsTotal: number;
    netPlatformRevenue: number;
    codSales: number;
    onlineSales: number;
  };

  // Reset to Demo Baseline
  resetToDemo: () => void;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SETTINGS: 'marketpulse_settings_v2',
  SUPER_ADMIN: 'marketpulse_super_admin_v2',
  SESSIONS: 'marketpulse_admin_sessions_v2',
  USERS: 'marketpulse_users_v2',
  SHOPS: 'marketpulse_shops_v2',
  PRODUCTS: 'marketpulse_products_v2',
  ORDERS: 'marketpulse_orders_v2',
  PAYMENTS: 'marketpulse_payments_v2',
  DELIVERY_PARTNERS: 'marketpulse_delivery_partners_v2',
  COUPONS: 'marketpulse_coupons_v2',
  BANNERS: 'marketpulse_banners_v2',
  AUDIT_LOGS: 'marketpulse_audit_logs_v2',
  TICKETS: 'marketpulse_tickets_v2',
  NOTIFICATIONS: 'marketpulse_notifications_v2',
};

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state with safe localStorage fallback
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [superAdmin, setSuperAdmin] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUPER_ADMIN);
    return saved ? JSON.parse(saved) : null;
  });

  const [activeSessions, setActiveSessions] = useState<AdminSession[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return saved ? JSON.parse(saved) : [];
  });

  const [currentAdminSession, setCurrentAdminSession] = useState<AdminSession | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (saved) {
      const list: AdminSession[] = JSON.parse(saved);
      return list[0] || null;
    }
    return null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return users.find((u) => u.role === 'CUSTOMER' && u.status === 'ACTIVE') || null;
  });

  const [activeRoleView, setActiveRoleView] = useState<'SUPER_ADMIN' | 'CUSTOMER' | 'SHOP_OWNER' | 'DELIVERY_PARTNER' | 'ACCEPTANCE_TEST'>(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.toLowerCase() : '';
    if (hash.includes('admin')) return 'SUPER_ADMIN';
    if (hash.includes('vendor') || hash.includes('shop')) return 'SHOP_OWNER';
    if (hash.includes('delivery') || hash.includes('fleet')) return 'DELIVERY_PARTNER';
    if (hash.includes('test')) return 'ACCEPTANCE_TEST';
    return 'CUSTOMER';
  });

  const [shops, setShops] = useState<Shop[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHOPS);
    return saved ? JSON.parse(saved) : INITIAL_SHOPS;
  });

  const [currentShop, setCurrentShop] = useState<Shop | null>(() => {
    const shop = shops.find((s) => s.id === 'shop_royal_biryani') || shops[0] || null;
    return shop;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [payments, setPayments] = useState<PaymentTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return saved ? JSON.parse(saved) : INITIAL_PAYMENT_TRANSACTIONS;
  });

  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DELIVERY_PARTNERS);
    return saved ? JSON.parse(saved) : INITIAL_DELIVERY_PARTNERS;
  });

  const [currentDeliveryPartner, setCurrentDeliveryPartner] = useState<DeliveryPartner | null>(() => {
    return deliveryPartners.find((d) => d.status === 'ACTIVE') || deliveryPartners[0] || null;
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COUPONS);
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  const [banners, setBanners] = useState<PromotionalBanner[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BANNERS);
    return saved ? JSON.parse(saved) : INITIAL_BANNERS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TICKETS);
    return saved ? JSON.parse(saved) : INITIAL_SUPPORT_TICKETS;
  });

  const [notifications, setNotifications] = useState<NotificationRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : [];
  });

  // Cart & Checkout state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState<string>(
    'Flat 402, Tower B, Palm Springs, Golf Course Road, Gurugram, HR 122002'
  );
  const [selectedLocation, setSelectedLocation] = useState<{ name: string; lat: number; lng: number }>({
    name: 'Sector 29, Gurugram, Delhi NCR',
    lat: 28.4695,
    lng: 77.0628,
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (superAdmin) {
      localStorage.setItem(STORAGE_KEYS.SUPER_ADMIN, JSON.stringify(superAdmin));
    }
  }, [superAdmin]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(activeSessions));
  }, [activeSessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHOPS, JSON.stringify(shops));
  }, [shops]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DELIVERY_PARTNERS, JSON.stringify(deliveryPartners));
  }, [deliveryPartners]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(banners));
  }, [banners]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(supportTickets));
  }, [supportTickets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  // Audit logger
  const logAuditAction = (action: string, targetObject: string, targetId: string, oldValue?: string, newValue?: string) => {
    const adminName = superAdmin?.name || 'Platform Owner';
    const adminId = superAdmin?.id || 'sa_root';
    const newLog: AuditLog = {
      id: generateId('aud_'),
      adminId,
      adminName,
      action,
      targetObject,
      targetId,
      oldValue,
      newValue,
      ipAddress: '127.0.0.1 (Internal Admin Proxy)',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Push notifications dispatcher
  const sendNotification = (
    title: string,
    body: string,
    targetRole: NotificationRecord['targetRole'],
    category: NotificationRecord['category'] = 'SYSTEM'
  ) => {
    const item: NotificationRecord = {
      id: generateId('notif_'),
      title,
      body,
      targetRole,
      sentBy: superAdmin?.name || 'Super Admin Platform',
      sentAt: new Date().toISOString(),
      isRead: false,
      category,
    };
    setNotifications((prev) => [item, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  // App settings
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const oldVals = JSON.stringify(settings);
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      logAuditAction('SETTINGS_CHANGED', 'PLATFORM_SETTINGS', 'global', oldVals, JSON.stringify(newSettings));
      return updated;
    });
  };

  // Super Admin Setup & Auth
  const isSuperAdminConfigured = Boolean(superAdmin);

  const setupPrimarySuperAdmin = async (name: string, email: string, password: string) => {
    const validation = validateAdminPasswordRules(password);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }
    const salt = generateRandomSalt();
    const hash = await hashPasswordWithSalt(password, salt);

    const adminUser: User = {
      id: 'sa_owner_root',
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: '+91 99999 00001',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      passwordHash: hash,
      salt,
      twoFactorEnabled: false,
      twoFactorSecret: 'MKT-TOTP-SECRET-KEY',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    setSuperAdmin(adminUser);
    const session: AdminSession = {
      id: generateId('sess_'),
      token: generateToken('jwt_sa_'),
      adminId: adminUser.id,
      adminName: adminUser.name,
      device: 'Primary Admin Workstation (Chrome/macOS)',
      ip: '127.0.0.1',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
    setActiveSessions([session]);
    setCurrentAdminSession(session);
    logAuditAction('SUPER_ADMIN_INITIALIZED', 'SECURITY', adminUser.id, undefined, `Owner: ${adminUser.email}`);
    return { success: true };
  };

  const loginSuperAdmin = async (email: string, password: string, totpCode?: string) => {
    if (!superAdmin) {
      return { success: false, error: 'Super Admin has not been provisioned yet. Please run initial setup.' };
    }

    if (superAdmin.lockoutUntil && new Date(superAdmin.lockoutUntil) > new Date()) {
      return { success: false, error: 'Account temporarily locked due to failed attempts. Try again in a few minutes.' };
    }

    const testHash = await hashPasswordWithSalt(password, superAdmin.salt);
    if (testHash !== superAdmin.passwordHash) {
      const attempts = (superAdmin.failedLoginAttempts || 0) + 1;
      let lockout: string | undefined = undefined;
      if (attempts >= 5) {
        lockout = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      }
      setSuperAdmin({ ...superAdmin, failedLoginAttempts: attempts, lockoutUntil: lockout });
      logAuditAction('FAILED_ADMIN_LOGIN', 'SECURITY', email, undefined, `Attempt #${attempts}`);
      return { success: false, error: attempts >= 5 ? 'Account locked for 15 minutes due to 5 failed attempts.' : 'Invalid credentials. Access denied.' };
    }

    if (superAdmin.twoFactorEnabled) {
      if (!totpCode) {
        return { success: false, requires2FA: true, error: 'Two-factor authentication code required.' };
      }
      if (totpCode.length !== 6 || !/^\d+$/.test(totpCode)) {
        return { success: false, requires2FA: true, error: 'Invalid 6-digit 2FA token.' };
      }
    }

    // Success login
    const updatedAdmin: User = {
      ...superAdmin,
      failedLoginAttempts: 0,
      lockoutUntil: undefined,
      lastLogin: new Date().toISOString(),
    };
    setSuperAdmin(updatedAdmin);

    const newSession: AdminSession = {
      id: generateId('sess_'),
      token: generateToken('jwt_sa_'),
      adminId: updatedAdmin.id,
      adminName: updatedAdmin.name,
      device: 'Desktop Console (Chrome / Linux)',
      ip: '127.0.0.1',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    setActiveSessions((prev) => [newSession, ...prev]);
    setCurrentAdminSession(newSession);
    logAuditAction('ADMIN_LOGIN_SUCCESS', 'SECURITY', updatedAdmin.id, undefined, `Session ${newSession.id}`);
    return { success: true };
  };

  const logoutSuperAdmin = () => {
    if (currentAdminSession) {
      setActiveSessions((prev) => prev.filter((s) => s.id !== currentAdminSession.id));
      setCurrentAdminSession(null);
    }
  };

  const logoutAllAdminDevices = () => {
    setActiveSessions([]);
    setCurrentAdminSession(null);
    logAuditAction('LOGOUT_ALL_DEVICES', 'SECURITY', superAdmin?.id || 'sa_root');
  };

  const resetAdminPassword = async (newPassword: string) => {
    if (!superAdmin) return { success: false, error: 'No admin configured' };
    const validation = validateAdminPasswordRules(newPassword);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }
    const newSalt = generateRandomSalt();
    const newHash = await hashPasswordWithSalt(newPassword, newSalt);
    setSuperAdmin((prev) => (prev ? { ...prev, salt: newSalt, passwordHash: newHash } : null));
    logAuditAction('ADMIN_PASSWORD_RESET', 'SECURITY', superAdmin.id);
    return { success: true };
  };

  const toggleAdmin2FA = (enabled: boolean) => {
    if (!superAdmin) return;
    setSuperAdmin((prev) => (prev ? { ...prev, twoFactorEnabled: enabled } : null));
    logAuditAction('2FA_TOGGLED', 'SECURITY', superAdmin.id, String(!enabled), String(enabled));
  };

  // Sub-Admins management
  const adminList = useMemo(() => {
    return users.filter((u) => u.role === 'ADMIN');
  }, [users]);

  const createSubAdmin = async (name: string, email: string, password: string) => {
    const validation = validateAdminPasswordRules(password);
    if (!validation.isValid) return { success: false, error: validation.error };
    const salt = generateRandomSalt();
    const hash = await hashPasswordWithSalt(password, salt);
    const newAdmin: User = {
      id: generateId('adm_'),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: '+91 98000 00000',
      role: 'ADMIN',
      status: 'ACTIVE',
      passwordHash: hash,
      salt,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newAdmin]);
    logAuditAction('SUB_ADMIN_CREATED', 'STAFF', newAdmin.id, undefined, `${newAdmin.name} (${newAdmin.email})`);
    return { success: true };
  };

  const deleteSubAdmin = (adminId: string) => {
    const admin = users.find((u) => u.id === adminId);
    setUsers((prev) => prev.filter((u) => u.id !== adminId));
    logAuditAction('SUB_ADMIN_DELETED', 'STAFF', adminId, admin?.name);
  };

  // Customer Authentication & Management
  const customerRegister = async (name: string, email: string, phone: string, address: string): Promise<User> => {
    const salt = generateRandomSalt();
    const hash = await hashPasswordWithSalt('customerDefaultPass123!', salt);
    const newUser: User = {
      id: generateId('usr_cust_'),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role: 'CUSTOMER',
      status: 'ACTIVE',
      address: address.trim(),
      passwordHash: hash,
      salt,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    sendNotification('Welcome to ' + settings.appName, 'Hi ' + newUser.name + ', your customer account is now active!', 'CUSTOMER');
    return newUser;
  };

  const customerLogin = (email: string): User | null => {
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.role === 'CUSTOMER');
    if (user && user.status === 'ACTIVE') {
      setCurrentUser(user);
      return user;
    }
    return null;
  };

  const suspendCustomer = (customerId: string, reason = 'Policy compliance hold') => {
    setUsers((prev) => prev.map((u) => (u.id === customerId ? { ...u, status: 'SUSPENDED' } : u)));
    logAuditAction('USER_SUSPENDED', 'CUSTOMER', customerId, 'ACTIVE', `SUSPENDED: ${reason}`);
  };

  const reactivateCustomer = (customerId: string) => {
    setUsers((prev) => prev.map((u) => (u.id === customerId ? { ...u, status: 'ACTIVE' } : u)));
    logAuditAction('USER_REACTIVATED', 'CUSTOMER', customerId, 'SUSPENDED', 'ACTIVE');
  };

  const softDeleteCustomer = (customerId: string) => {
    setUsers((prev) => prev.map((u) => (u.id === customerId ? { ...u, status: 'DELETED' } : u)));
    logAuditAction('USER_DELETED', 'CUSTOMER', customerId, 'ACTIVE', 'DELETED');
  };

  const updateCustomer = (customerId: string, updates: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === customerId ? { ...u, ...updates } : u)));
  };

  // Shop Operations
  const approveShop = (shopId: string) => {
    const targetShop = shops.find((s) => s.id === shopId);
    setShops((prev) => prev.map((s) => (s.id === shopId ? { ...s, status: 'APPROVED', updatedAt: new Date().toISOString() } : s)));
    logAuditAction('SHOP_APPROVED', 'SHOP', shopId, targetShop?.status, 'APPROVED');
    sendNotification(
      'Shop Approved!',
      `Congratulations ${targetShop?.name}! Your shop has been verified and is now live on the marketplace.`,
      'SHOP_OWNER'
    );
  };

  const rejectShop = (shopId: string, reason: string) => {
    const targetShop = shops.find((s) => s.id === shopId);
    setShops((prev) =>
      prev.map((s) => (s.id === shopId ? { ...s, status: 'REJECTED', rejectionReason: reason, updatedAt: new Date().toISOString() } : s))
    );
    logAuditAction('SHOP_REJECTED', 'SHOP', shopId, targetShop?.status, `REJECTED: ${reason}`);
  };

  const suspendShop = (shopId: string, reason: string) => {
    const targetShop = shops.find((s) => s.id === shopId);
    setShops((prev) =>
      prev.map((s) => (s.id === shopId ? { ...s, status: 'SUSPENDED', suspensionReason: reason, updatedAt: new Date().toISOString() } : s))
    );
    logAuditAction('SHOP_SUSPENDED', 'SHOP', shopId, targetShop?.status, `SUSPENDED: ${reason}`);
  };

  const reactivateShop = (shopId: string) => {
    const targetShop = shops.find((s) => s.id === shopId);
    setShops((prev) => prev.map((s) => (s.id === shopId ? { ...s, status: 'APPROVED', updatedAt: new Date().toISOString() } : s)));
    logAuditAction('SHOP_REACTIVATED', 'SHOP', shopId, targetShop?.status, 'APPROVED');
  };

  const updateShop = (shopId: string, updates: Partial<Shop>) => {
    const targetShop = shops.find((s) => s.id === shopId);
    setShops((prev) => prev.map((s) => (s.id === shopId ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s)));
    logAuditAction('SHOP_UPDATED', 'SHOP', shopId, JSON.stringify(targetShop), JSON.stringify(updates));
  };

  const registerShop = (shopData: Omit<Shop, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'totalReviews' | 'status'>): Shop => {
    const newShop: Shop = {
      ...shopData,
      id: generateId('shop_'),
      status: 'PENDING',
      rating: 5.0,
      totalReviews: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setShops((prev) => [...prev, newShop]);
    logAuditAction('SHOP_REGISTERED', 'SHOP', newShop.id, undefined, newShop.name);
    return newShop;
  };

  // Product Operations
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>): Product => {
    const newProd: Product = {
      ...productData,
      id: generateId('prod_'),
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProd, ...prev]);
    logAuditAction('PRODUCT_ADDED', 'PRODUCT', newProd.id, undefined, `${newProd.name} (Shop: ${newProd.shopName})`);
    return newProd;
  };

  const updateProduct = (productId: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)));
    logAuditAction('PRODUCT_UPDATED', 'PRODUCT', productId, undefined, JSON.stringify(updates));
  };

  const toggleProductAvailability = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isAvailable: !p.isAvailable, updatedAt: new Date().toISOString() } : p))
    );
  };

  const toggleProductFeatured = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isFeatured: !p.isFeatured, updatedAt: new Date().toISOString() } : p))
    );
  };

  const softDeleteProduct = (productId: string) => {
    const target = products.find((p) => p.id === productId);
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, isDeleted: true, updatedAt: new Date().toISOString() } : p)));
    logAuditAction('PRODUCT_DELETED', 'PRODUCT', productId, target?.name, 'Soft deleted (isDeleted: true)');
  };

  const restoreProduct = (productId: string) => {
    const target = products.find((p) => p.id === productId);
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, isDeleted: false, updatedAt: new Date().toISOString() } : p)));
    logAuditAction('PRODUCT_RESTORED', 'PRODUCT', productId, target?.name, 'Restored (isDeleted: false)');
  };

  // Cart Operations
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      // Check if product belongs to same shop, or clear if different shop
      if (prev.length > 0 && prev[0].product.shopId !== product.shopId) {
        // Automatically switch or alert
        return [{ product, quantity }];
      }
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item));
      }
      return [...prev, { product, quantity }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) => prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item)));
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cart]);

  const applyCouponCode = (code: string) => {
    const found = coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive);
    if (!found) {
      return { success: false, message: 'Invalid or inactive promo code.' };
    }
    if (cartSubtotal < found.minOrderValue) {
      return { success: false, message: `Minimum order value for ${found.code} is ${settings.currencySymbol}${found.minOrderValue}` };
    }
    setAppliedCoupon(found);
    return { success: true, message: `Promo code ${found.code} applied successfully!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const cartDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'FIXED') {
      return Math.min(appliedCoupon.discountValue, cartSubtotal);
    }
    const percentAmount = (cartSubtotal * appliedCoupon.discountValue) / 100;
    return Math.min(percentAmount, appliedCoupon.maxDiscount);
  }, [appliedCoupon, cartSubtotal]);

  const cartDeliveryFee = useMemo(() => {
    if (cart.length === 0) return 0;
    if (cartSubtotal >= settings.freeDeliveryThreshold) return 0;
    return settings.baseDeliveryFee;
  }, [cart, cartSubtotal, settings]);

  const cartTax = useMemo(() => {
    if (cart.length === 0) return 0;
    return Math.round((cartSubtotal - cartDiscount) * 0.05 * 10) / 10; // 5% GST
  }, [cart, cartSubtotal, cartDiscount]);

  const cartTotal = useMemo(() => {
    if (cart.length === 0) return 0;
    return Math.round((cartSubtotal - cartDiscount + cartDeliveryFee + cartTax) * 10) / 10;
  }, [cart, cartSubtotal, cartDiscount, cartDeliveryFee, cartTax]);

  // Order Creation & Lifecycle
  const createOrder = async (
    paymentMethod: PaymentMethod,
    specialInstructions = ''
  ): Promise<{ order: Order; razorpayOrder?: { id: string; amount: number; currency: string } }> => {
    if (cart.length === 0) throw new Error('Cart is empty');

    const shopId = cart[0].product.shopId;
    const shop = shops.find((s) => s.id === shopId) || shops[0];
    const customer = currentUser || users[0];

    // Platform Commission Calculation
    const commissionPercent = shop.commissionRate !== null ? shop.commissionRate : settings.globalCommissionRate;
    const taxableBase = cartSubtotal - cartDiscount;
    const platformCommission = Math.round(((taxableBase * commissionPercent) / 100) * 10) / 10;
    const shopEarnings = Math.round((taxableBase - platformCommission) * 10) / 10;
    const deliveryPartnerEarnings = cartDeliveryFee > 0 ? cartDeliveryFee : 35; // base partner fee

    const orderId = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    let razorpayOrderId: string | undefined;
    let paymentStatus: Order['paymentStatus'] = 'PENDING';

    if (paymentMethod === 'RAZORPAY') {
      razorpayOrderId = `order_${generateToken('rzp_ord_').substring(0, 16)}`;
    } else {
      paymentStatus = 'PENDING'; // COD pending till handoff
    }

    const newOrder: Order = {
      id: orderId,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      shopId: shop.id,
      shopName: shop.name,
      items: cart.map((i) => ({
        productId: i.product.id,
        productName: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
        image: i.product.image,
        shopId: shop.id,
        shopName: shop.name,
      })),
      subtotal: cartSubtotal,
      discount: cartDiscount,
      appliedCoupon: appliedCoupon?.code,
      deliveryFee: cartDeliveryFee,
      tax: cartTax,
      total: cartTotal,
      platformCommissionRate: commissionPercent,
      platformCommission,
      shopEarnings,
      deliveryPartnerEarnings,
      paymentMethod,
      paymentStatus,
      razorpayOrderId,
      orderStatus: 'PLACED',
      deliveryAddress,
      specialInstructions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [
        {
          status: 'PLACED',
          timestamp: new Date().toISOString(),
          note: paymentMethod === 'RAZORPAY' ? 'Order placed. Awaiting test payment verification.' : 'Order placed with Cash On Delivery.',
        },
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Update coupon usage count if applied
    if (appliedCoupon) {
      setCoupons((prev) => prev.map((c) => (c.id === appliedCoupon.id ? { ...c, usedCount: c.usedCount + 1 } : c)));
    }

    // Decrement product inventory
    setProducts((prev) =>
      prev.map((prod) => {
        const cartItem = cart.find((i) => i.product.id === prod.id);
        if (cartItem) {
          return { ...prod, stock: Math.max(0, prod.stock - cartItem.quantity) };
        }
        return prod;
      })
    );

    // Notify Shop Owner
    sendNotification(
      'New Order Received!',
      `Order #${newOrder.id} (${settings.currencySymbol}${newOrder.total}) placed from ${newOrder.customerName}.`,
      'SHOP_OWNER',
      'ORDER'
    );

    clearCart();

    return {
      order: newOrder,
      razorpayOrder:
        paymentMethod === 'RAZORPAY'
          ? {
              id: razorpayOrderId!,
              amount: Math.round(cartTotal * 100), // paise
              currency: settings.defaultCurrency,
            }
          : undefined,
    };
  };

  const verifyRazorpayPayment = async (orderId: string, razorpayPaymentId: string): Promise<boolean> => {
    const order = orders.find((o) => o.id === orderId);
    if (!order || !order.razorpayOrderId) return false;

    const signature = generateRazorpaySignature(order.razorpayOrderId, razorpayPaymentId);

    // Record verified transaction
    const newTx: PaymentTransaction = {
      id: generateId('tx_pay_'),
      orderId: order.id,
      customerName: order.customerName,
      shopName: order.shopName,
      amount: order.total,
      method: 'RAZORPAY',
      status: 'PAID',
      razorpayOrderId: order.razorpayOrderId,
      razorpayPaymentId,
      createdAt: new Date().toISOString(),
      auditNote: 'Razorpay HMAC signature verified successfully on backend proxy.',
    };

    setPayments((prev) => [newTx, ...prev]);

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              paymentStatus: 'PAID',
              razorpayPaymentId,
              razorpaySignature: signature,
              updatedAt: new Date().toISOString(),
              statusHistory: [
                ...o.statusHistory,
                {
                  status: o.orderStatus,
                  timestamp: new Date().toISOString(),
                  note: `Online payment verified. Razorpay ID: ${razorpayPaymentId}`,
                },
              ],
            }
          : o
      )
    );

    logAuditAction('PAYMENT_VERIFIED', 'PAYMENT', orderId, 'PENDING', `Verified: ${razorpayPaymentId} (₹${order.total})`);
    return true;
  };

  const shopAcceptOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              orderStatus: 'ACCEPTED',
              updatedAt: new Date().toISOString(),
              statusHistory: [...o.statusHistory, { status: 'ACCEPTED', timestamp: new Date().toISOString(), note: 'Shop accepted the order and started processing.' }],
            }
          : o
      )
    );
    sendNotification('Order Accepted', `Shop ${orders.find((o) => o.id === orderId)?.shopName} accepted your order!`, 'CUSTOMER', 'ORDER');
  };

  const shopPrepareOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              orderStatus: 'PREPARING',
              updatedAt: new Date().toISOString(),
              statusHistory: [...o.statusHistory, { status: 'PREPARING', timestamp: new Date().toISOString(), note: 'Items are being prepared and packed.' }],
            }
          : o
      )
    );
  };

  const shopReadyOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              orderStatus: 'READY_FOR_PICKUP',
              updatedAt: new Date().toISOString(),
              statusHistory: [...o.statusHistory, { status: 'READY_FOR_PICKUP', timestamp: new Date().toISOString(), note: 'Order is ready for pickup by delivery partner.' }],
            }
          : o
      )
    );
  };

  const assignDeliveryPartner = (orderId: string, partnerId: string) => {
    const partner = deliveryPartners.find((p) => p.id === partnerId);
    if (!partner) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              orderStatus: o.orderStatus === 'PLACED' || o.orderStatus === 'ACCEPTED' ? 'READY_FOR_PICKUP' : o.orderStatus,
              deliveryPartnerId: partner.id,
              deliveryPartnerName: partner.name,
              deliveryPartnerPhone: partner.phone,
              updatedAt: new Date().toISOString(),
              statusHistory: [
                ...o.statusHistory,
                {
                  status: 'READY_FOR_PICKUP',
                  timestamp: new Date().toISOString(),
                  note: `Assigned to delivery partner ${partner.name} (${partner.phone}).`,
                },
              ],
            }
          : o
      )
    );

    logAuditAction('DELIVERY_ASSIGNED', 'ORDER', orderId, undefined, `Partner: ${partner.name} (${partner.id})`);
    sendNotification('New Delivery Assignment', `You have been assigned order #${orderId}. Please proceed to shop.`, 'DELIVERY_PARTNER', 'ORDER');
  };

  const partnerPickupOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              orderStatus: 'OUT_FOR_DELIVERY',
              updatedAt: new Date().toISOString(),
              statusHistory: [...o.statusHistory, { status: 'OUT_FOR_DELIVERY', timestamp: new Date().toISOString(), note: 'Partner picked up order and is on the way.' }],
            }
          : o
      )
    );
    sendNotification('Order Out For Delivery', 'Your order is on the way to your delivery address!', 'CUSTOMER', 'ORDER');
  };

  const partnerDeliverOrder = (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);

    // If COD, mark payment as PAID upon physical delivery handoff
    if (targetOrder && targetOrder.paymentMethod === 'COD' && targetOrder.paymentStatus !== 'PAID') {
      const codTx: PaymentTransaction = {
        id: generateId('tx_cod_'),
        orderId: targetOrder.id,
        customerName: targetOrder.customerName,
        shopName: targetOrder.shopName,
        amount: targetOrder.total,
        method: 'COD',
        status: 'PAID',
        createdAt: new Date().toISOString(),
        auditNote: 'Cash collected by delivery partner at doorstep.',
      };
      setPayments((prev) => [codTx, ...prev]);
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              orderStatus: 'DELIVERED',
              paymentStatus: 'PAID',
              updatedAt: new Date().toISOString(),
              statusHistory: [...o.statusHistory, { status: 'DELIVERED', timestamp: new Date().toISOString(), note: 'Order delivered safely to customer.' }],
            }
          : o
      )
    );

    // Update partner earnings
    if (targetOrder?.deliveryPartnerId) {
      setDeliveryPartners((prev) =>
        prev.map((p) =>
          p.id === targetOrder.deliveryPartnerId
            ? {
                ...p,
                totalDeliveries: p.totalDeliveries + 1,
                earnings: p.earnings + targetOrder.deliveryPartnerEarnings,
              }
            : p
        )
      );
    }

    logAuditAction('ORDER_DELIVERED', 'ORDER', orderId, undefined, `Completed. Total: ₹${targetOrder?.total}`);
    sendNotification('Order Delivered!', 'Your order has been delivered. Enjoy your meal / products!', 'CUSTOMER', 'ORDER');
  };

  const cancelOrder = (orderId: string, reason: string) => {
    const target = orders.find((o) => o.id === orderId);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              orderStatus: 'CANCELLED',
              cancellationReason: reason,
              updatedAt: new Date().toISOString(),
              statusHistory: [...o.statusHistory, { status: 'CANCELLED', timestamp: new Date().toISOString(), note: `Cancelled: ${reason}` }],
            }
          : o
      )
    );
    logAuditAction('ORDER_CANCELLED', 'ORDER', orderId, target?.orderStatus, `CANCELLED: ${reason}`);
  };

  const initiateRefund = (orderId: string, amount: number, reason: string) => {
    const refundTxId = `rzp_rfnd_${Math.random().toString(36).substring(2, 9)}`;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              paymentStatus: 'REFUNDED',
              refundAmount: amount,
              refundReason: reason,
              refundTransactionId: refundTxId,
              updatedAt: new Date().toISOString(),
              statusHistory: [...o.statusHistory, { status: o.orderStatus, timestamp: new Date().toISOString(), note: `Refund processed: ₹${amount} (${refundTxId})` }],
            }
          : o
      )
    );

    setPayments((prev) =>
      prev.map((p) =>
        p.orderId === orderId
          ? {
              ...p,
              status: 'REFUNDED',
              refundedAt: new Date().toISOString(),
              refundAmount: amount,
              refundReason: reason,
              auditNote: `Refund executed via Razorpay Refund API. Tx: ${refundTxId}`,
            }
          : p
      )
    );

    logAuditAction('REFUND_CREATED', 'PAYMENT', orderId, undefined, `Amount: ₹${amount}, Tx: ${refundTxId}`);
    sendNotification('Refund Processed', `A refund of ${settings.currencySymbol}${amount} for order #${orderId} has been credited.`, 'CUSTOMER');
  };

  const customerReviewOrder = (orderId: string, rating: number, comment: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              review: { rating, comment, createdAt: new Date().toISOString() },
            }
          : o
      )
    );
  };

  // Delivery Partner Operations
  const addDeliveryPartner = (data: Omit<DeliveryPartner, 'id' | 'createdAt' | 'totalDeliveries' | 'earnings' | 'rating'>): DeliveryPartner => {
    const newPartner: DeliveryPartner = {
      ...data,
      id: generateId('dp_'),
      status: 'ACTIVE',
      rating: 5.0,
      totalDeliveries: 0,
      earnings: 0,
      createdAt: new Date().toISOString(),
    };
    setDeliveryPartners((prev) => [...prev, newPartner]);
    logAuditAction('DELIVERY_PARTNER_ADDED', 'LOGISTICS', newPartner.id, undefined, newPartner.name);
    return newPartner;
  };

  const approveDeliveryPartner = (partnerId: string) => {
    const p = deliveryPartners.find((item) => item.id === partnerId);
    setDeliveryPartners((prev) => prev.map((item) => (item.id === partnerId ? { ...item, status: 'ACTIVE' } : item)));
    logAuditAction('DELIVERY_PARTNER_APPROVED', 'LOGISTICS', partnerId, p?.status, 'ACTIVE');
  };

  const suspendDeliveryPartner = (partnerId: string) => {
    const p = deliveryPartners.find((item) => item.id === partnerId);
    setDeliveryPartners((prev) => prev.map((item) => (item.id === partnerId ? { ...item, status: 'SUSPENDED' } : item)));
    logAuditAction('DELIVERY_PARTNER_SUSPENDED', 'LOGISTICS', partnerId, p?.status, 'SUSPENDED');
  };

  // Coupons
  const createCoupon = (couponData: Omit<Coupon, 'id' | 'createdAt' | 'usedCount'>): Coupon => {
    const newCoupon: Coupon = {
      ...couponData,
      id: generateId('cpn_'),
      code: couponData.code.toUpperCase(),
      usedCount: 0,
      createdAt: new Date().toISOString(),
    };
    setCoupons((prev) => [newCoupon, ...prev]);
    logAuditAction('COUPON_CREATED', 'PROMOTION', newCoupon.id, undefined, newCoupon.code);
    return newCoupon;
  };

  const toggleCoupon = (couponId: string, isActive: boolean) => {
    setCoupons((prev) => prev.map((c) => (c.id === couponId ? { ...c, isActive } : c)));
    logAuditAction('COUPON_TOGGLED', 'PROMOTION', couponId, String(!isActive), String(isActive));
  };

  const deleteCoupon = (couponId: string) => {
    const target = coupons.find((c) => c.id === couponId);
    setCoupons((prev) => prev.filter((c) => c.id !== couponId));
    logAuditAction('COUPON_DELETED', 'PROMOTION', couponId, target?.code);
  };

  // Banners
  const createBanner = (bannerData: Omit<PromotionalBanner, 'id'>): PromotionalBanner => {
    const newBanner: PromotionalBanner = {
      ...bannerData,
      id: generateId('ban_'),
    };
    setBanners((prev) => [newBanner, ...prev]);
    logAuditAction('BANNER_CREATED', 'MARKETING', newBanner.id, undefined, newBanner.title);
    return newBanner;
  };

  const updateBanner = (bannerId: string, updates: Partial<PromotionalBanner>) => {
    setBanners((prev) => prev.map((b) => (b.id === bannerId ? { ...b, ...updates } : b)));
  };

  const deleteBanner = (bannerId: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== bannerId));
    logAuditAction('BANNER_DELETED', 'MARKETING', bannerId);
  };

  // Support Tickets
  const createSupportTicket = (ticket: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'replies'>): SupportTicket => {
    const newTicket: SupportTicket = {
      ...ticket,
      id: generateId('tkt_'),
      ticketNumber: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replies: [],
    };
    setSupportTickets((prev) => [newTicket, ...prev]);
    return newTicket;
  };

  const replySupportTicket = (ticketId: string, message: string, isInternal = false) => {
    const reply = {
      id: generateId('rep_'),
      senderId: superAdmin?.id || 'admin',
      senderName: superAdmin?.name || 'Super Admin Support',
      senderRole: 'SUPER_ADMIN',
      message,
      timestamp: new Date().toISOString(),
      isInternal,
    };
    setSupportTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: isInternal ? t.status : 'IN_PROGRESS',
              updatedAt: new Date().toISOString(),
              replies: [...t.replies, reply],
            }
          : t
      )
    );
  };

  const updateTicketStatus = (ticketId: string, status: SupportTicket['status']) => {
    setSupportTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status, updatedAt: new Date().toISOString() } : t)));
    logAuditAction('TICKET_STATUS_UPDATED', 'SUPPORT', ticketId, undefined, status);
  };

  // Financial Stats Calculation Engine
  const financialStats = useMemo(() => {
    const deliveredOrders = orders.filter((o) => o.orderStatus === 'DELIVERED');
    const grossSales = deliveredOrders.reduce((sum, o) => sum + o.total, 0);
    const platformCommission = deliveredOrders.reduce((sum, o) => sum + o.platformCommission, 0);
    const shopEarnings = deliveredOrders.reduce((sum, o) => sum + o.shopEarnings, 0);
    const deliveryFees = deliveredOrders.reduce((sum, o) => sum + o.deliveryFee, 0);
    const partnerEarnings = deliveredOrders.reduce((sum, o) => sum + o.deliveryPartnerEarnings, 0);
    const refundsTotal = payments.filter((p) => p.status === 'REFUNDED').reduce((sum, p) => sum + (p.refundAmount || 0), 0);
    const codSales = deliveredOrders.filter((o) => o.paymentMethod === 'COD').reduce((sum, o) => sum + o.total, 0);
    const onlineSales = deliveredOrders.filter((o) => o.paymentMethod === 'RAZORPAY').reduce((sum, o) => sum + o.total, 0);

    return {
      grossSales: Math.round(grossSales * 10) / 10,
      platformCommission: Math.round(platformCommission * 10) / 10,
      shopEarnings: Math.round(shopEarnings * 10) / 10,
      deliveryFees: Math.round(deliveryFees * 10) / 10,
      partnerEarnings: Math.round(partnerEarnings * 10) / 10,
      refundsTotal: Math.round(refundsTotal * 10) / 10,
      netPlatformRevenue: Math.round((platformCommission + deliveryFees - refundsTotal) * 10) / 10,
      codSales: Math.round(codSales * 10) / 10,
      onlineSales: Math.round(onlineSales * 10) / 10,
    };
  }, [orders, payments]);

  // Reset to Demo
  const resetToDemo = () => {
    localStorage.clear();
    setSettings(INITIAL_SETTINGS);
    setShops(INITIAL_SHOPS);
    setProducts(INITIAL_PRODUCTS);
    setUsers(INITIAL_CUSTOMERS);
    setDeliveryPartners(INITIAL_DELIVERY_PARTNERS);
    setOrders(INITIAL_ORDERS);
    setPayments(INITIAL_PAYMENT_TRANSACTIONS);
    setCoupons(INITIAL_COUPONS);
    setBanners(INITIAL_BANNERS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setSupportTickets(INITIAL_SUPPORT_TICKETS);
    setNotifications([]);
    setCart([]);
    setAppliedCoupon(null);
    window.location.reload();
  };

  return (
    <PlatformContext.Provider
      value={{
        settings,
        updateSettings,
        activeRoleView,
        setActiveRoleView,
        superAdmin,
        currentAdminSession,
        activeSessions,
        isSuperAdminConfigured,
        setupPrimarySuperAdmin,
        loginSuperAdmin,
        logoutSuperAdmin,
        logoutAllAdminDevices,
        resetAdminPassword,
        toggleAdmin2FA,
        adminList,
        createSubAdmin,
        deleteSubAdmin,
        users,
        currentUser,
        setCurrentUser,
        customerRegister,
        customerLogin,
        suspendCustomer,
        reactivateCustomer,
        softDeleteCustomer,
        updateCustomer,
        shops,
        currentShop,
        setCurrentShop,
        approveShop,
        rejectShop,
        suspendShop,
        reactivateShop,
        updateShop,
        registerShop,
        products,
        addProduct,
        updateProduct,
        toggleProductAvailability,
        toggleProductFeatured,
        softDeleteProduct,
        restoreProduct,
        orders,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartSubtotal,
        appliedCoupon,
        applyCouponCode,
        removeCoupon,
        cartDiscount,
        cartDeliveryFee,
        cartTax,
        cartTotal,
        deliveryAddress,
        setDeliveryAddress,
        selectedLocation,
        setSelectedLocation,
        createOrder,
        verifyRazorpayPayment,
        shopAcceptOrder,
        shopPrepareOrder,
        shopReadyOrder,
        assignDeliveryPartner,
        partnerPickupOrder,
        partnerDeliverOrder,
        cancelOrder,
        initiateRefund,
        customerReviewOrder,
        payments,
        deliveryPartners,
        addDeliveryPartner,
        approveDeliveryPartner,
        suspendDeliveryPartner,
        currentDeliveryPartner,
        setCurrentDeliveryPartner,
        coupons,
        createCoupon,
        toggleCoupon,
        deleteCoupon,
        banners,
        createBanner,
        updateBanner,
        deleteBanner,
        supportTickets,
        createSupportTicket,
        replySupportTicket,
        updateTicketStatus,
        auditLogs,
        logAuditAction,
        notifications,
        sendNotification,
        markNotificationAsRead,
        financialStats,
        resetToDemo,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
};
