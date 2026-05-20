export type UserRole = "super_admin" | "business_owner" | "staff" | "customer";
export type BusinessStatus = "active" | "inactive" | "suspended";
export type ProductStatus = "active" | "inactive" | "out_of_stock";
export type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled";
export type InvoiceStatus = "draft" | "paid" | "unpaid" | "cancelled" | "refunded";
export type PaymentMethod = "cash" | "upi" | "card" | "razorpay" | "paytm" | "phonepe";
export type BusinessTheme = "grocery" | "cafe" | "bakery" | "restaurant" | "medical" | "salon" | "retail" | "minimal";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  businessId?: string;
  phone?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IBusiness {
  _id: string;
  name: string;
  slug: string;
  ownerId: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber?: string;
  logo?: string;
  favicon?: string;
  banner?: string;
  description?: string;
  descriptionGu?: string;
  tagline?: string;
  taglineGu?: string;
  theme: BusinessTheme;
  status: BusinessStatus;
  whatsappNumber?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
  };
  openingHours?: OpeningHours[];
  settings?: BusinessSettings;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OpeningHours {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

export interface BusinessSettings {
  currency: string;
  currencySymbol: string;
  taxEnabled: boolean;
  defaultGst: number;
  invoicePrefix: string;
  invoiceCounter: number;
  loyaltyEnabled: boolean;
  onlineOrderEnabled: boolean;
  whatsappOrderEnabled: boolean;
  language: string;
}

export interface IProduct {
  _id: string;
  businessId: string;
  name: string;
  nameGu?: string;
  description?: string;
  descriptionGu?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  sku?: string;
  barcode?: string;
  images: string[];
  categoryId?: string;
  category?: ICategory;
  stock: number;
  minStock?: number;
  status: ProductStatus;
  isFeatured: boolean;
  gstPercentage?: number;
  hsnCode?: string;
  unit?: string;
  weight?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ICategory {
  _id: string;
  businessId: string;
  name: string;
  nameGu?: string;
  description?: string;
  image?: string;
  slug: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IOrder {
  _id: string;
  businessId: string;
  orderNumber: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customer?: ICustomer;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  taxAmount: number;
  total: number;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentStatus: "pending" | "paid" | "refunded";
  notes?: string;
  whatsappOrder: boolean;
  tableNumber?: string;
  source?: "pos" | "online" | "whatsapp" | "qr";
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  product?: IProduct;
  name: string;
  price: number;
  quantity: number;
  discount: number;
  gst: number;
  total: number;
}

export interface IInvoice {
  _id: string;
  businessId: string;
  invoiceNumber: string;
  orderId?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customer?: ICustomer;
  business?: IBusiness;
  items: InvoiceItem[];
  subtotal: number;
  discountAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  status: InvoiceStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  dueDate?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  productId?: string;
  name: string;
  nameGu?: string;
  sku?: string;
  quantity: number;
  price: number;
  discount: number;
  gstPercentage: number;
  hsnCode?: string;
  total: number;
}

export interface ICustomer {
  _id: string;
  businessId: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  loyaltyPoints: number;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IInventoryLog {
  _id: string;
  businessId: string;
  productId: string;
  product?: IProduct;
  type: "restock" | "sale" | "adjustment" | "damage" | "return";
  quantity: number;
  previousStock: number;
  newStock: number;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface IAnalytics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueGrowth: number;
  ordersGrowth: number;
  avgOrderValue: number;
  topProducts: TopProduct[];
  revenueByDay: ChartData[];
  ordersByStatus: StatusData[];
  revenueByCategory: CategoryData[];
}

export interface TopProduct {
  _id: string;
  name: string;
  image?: string;
  totalSold: number;
  revenue: number;
}

export interface ChartData {
  date: string;
  value: number;
  label?: string;
}

export interface StatusData {
  status: string;
  count: number;
}

export interface CategoryData {
  category: string;
  revenue: number;
}

export interface CartItem {
  productId: string;
  name: string;
  nameGu?: string;
  price: number;
  quantity: number;
  discount: number;
  gst: number;
  image?: string;
  stock: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: PaginationMeta;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface SuperAdminStats {
  totalUsers: number;
  totalVerifiedUsers: number;
  totalBusinesses: number;
  statusBreakdown: {
    active: number;
    suspended: number;
  };
  subscriptionsBreakdown: {
    free: number;
    starter: number;
    pro: number;
    enterprise: number;
  };
}

export interface SuperAdminRecent {
  users: IUser[];
  businesses: IBusiness[];
}

export interface INotification {
  _id: string;
  title: string;
  message: string;
  type: "order" | "inventory" | "system";
  read: boolean;
  link?: string;
  createdAt: string;
}
