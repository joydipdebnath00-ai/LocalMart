export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'SHOP_OWNER' | 'DELIVERY_PARTNER' | 'CUSTOMER';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  avatar?: string;
  address?: string;
  passwordHash: string;
  salt: string;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  createdAt: string;
  lastLogin?: string;
  failedLoginAttempts?: number;
  lockoutUntil?: string;
}

export interface AdminSession {
  id: string;
  token: string;
  adminId: string;
  adminName: string;
  device: string;
  ip: string;
  createdAt: string;
  expiresAt: string;
}

export interface Shop {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  logo: string;
  banner: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  totalReviews: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  rejectionReason?: string;
  suspensionReason?: string;
  commissionRate: number | null; // null means platform default
  deliveryRadiusKm: number;
  minOrder: number;
  isOpen: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  shopId: string;
  shopName: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  stock: number;
  isFeatured: boolean;
  isAvailable: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image: string;
  shopId: string;
  shopName: string;
}

export type OrderStatus =
  | 'PLACED'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod = 'RAZORPAY' | 'COD';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shopId: string;
  shopName: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  appliedCoupon?: string;
  deliveryFee: number;
  tax: number;
  total: number;
  platformCommissionRate: number;
  platformCommission: number;
  shopEarnings: number;
  deliveryPartnerEarnings: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  orderStatus: OrderStatus;
  deliveryPartnerId?: string;
  deliveryPartnerName?: string;
  deliveryPartnerPhone?: string;
  deliveryAddress: string;
  specialInstructions?: string;
  cancellationReason?: string;
  refundAmount?: number;
  refundReason?: string;
  refundTransactionId?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note: string;
  }[];
  review?: {
    rating: number;
    comment: string;
    createdAt: string;
  };
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  customerName: string;
  shopName: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
  refundedAt?: string;
  refundAmount?: number;
  refundReason?: string;
  auditNote?: string;
}

export interface DeliveryPartner {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleType: 'BIKE' | 'SCOOTER' | 'VAN';
  vehicleNumber: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  rating: number;
  totalDeliveries: number;
  earnings: number;
  currentOrderId?: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  applicableShopIds: string[]; // empty means all
  applicableCategories: string[]; // empty means all
  isActive: boolean;
  createdAt: string;
}

export interface PromotionalBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  targetType: 'SHOP' | 'CATEGORY' | 'EXTERNAL';
  targetValue: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  badge?: string;
}

export interface AppSettings {
  appName: string;
  logoUrl: string;
  supportEmail: string;
  supportPhone: string;
  businessAddress: string;
  defaultCurrency: string;
  currencySymbol: string;
  baseDeliveryFee: number;
  perKmDeliveryFee: number;
  freeDeliveryThreshold: number;
  maxDeliveryRadiusKm: number;
  globalCommissionRate: number; // e.g. 8%
  minOrderValue: number;
  maxOrderValue: number;
  isCodEnabled: boolean;
  isOnlinePaymentEnabled: boolean;
  isMaintenanceMode: boolean;
  maintenanceMessage: string;
  allowShopRegistration: boolean;
  allowCustomerRegistration: boolean;
  reviewSystemEnabled: boolean;
  couponSystemEnabled: boolean;
  deliverySystemEnabled: boolean;
  twoFactorRequiredForAdmins: boolean;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetObject: string;
  targetId: string;
  oldValue?: string;
  newValue?: string;
  ipAddress: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  subject: string;
  message: string;
  category: 'ORDER' | 'PAYMENT' | 'DELIVERY' | 'ACCOUNT' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_USER' | 'RESOLVED' | 'CLOSED';
  assignedToAdminId?: string;
  assignedToAdminName?: string;
  replies: {
    id: string;
    senderId: string;
    senderName: string;
    senderRole: string;
    message: string;
    timestamp: string;
    isInternal: boolean;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationRecord {
  id: string;
  title: string;
  body: string;
  targetRole: 'ALL' | 'CUSTOMER' | 'SHOP_OWNER' | 'DELIVERY_PARTNER';
  sentBy: string;
  sentAt: string;
  scheduledFor?: string;
  isRead: boolean;
  category?: 'ORDER' | 'SYSTEM' | 'PROMO';
}
