
export interface Customer {
    id: string;
    name: string;
    store: string;
    contact: string;
    notes?: string;
    createdAt: string;
}

export interface Client {
  id: string;
  customerId?: string; // Link to the unique customer
  name: string; // Kept for display/caching purposes
  store: string; // Kept for display/caching purposes
  contact: string; // Kept for display/caching purposes
  inquiryType: '散客线路' | '单团报价' | '单订项目' | '其他';
  intentionLevel: '高' | '中' | '低';
  inquiryDate: string;
  inquiryDetails: string;
  status: '待跟进' | '跟进中' | '已成交' | '未成单' | '已失效';
  notes: string;
  followUpDate: string | null;
  createdAt: string;
  followUpCount: number;
}

export interface FollowUpRecord {
  id: string;
  clientId: string;
  date: string;
  status: Client['status'];
  nextFollowUpDate: string | null;
  notes: string;
  failureReason?: '价格原因' | '产品不符' | '竞争对手' | '客户计划变更' | '客户预算不足' | '沟通不畅' | '其他';
  failureReasonDetail?: string;
}

export interface FailureReason {
  reason: string;
  detail: string;
  date: string;
}

export interface Guide {
    prefix?: string;
    name: string;
    phone: string;
}

export interface Guest {
    name: string;
    phone: string;
    role?: '游客代表' | '领队' | '全陪' | '';
}

export interface Order {
    id: string;
    orderNumber: string;
    clientId: string;
    clientName?: string; // Added for convenience in search
    orderType: '单团定制' | '散客出行' | '单订项目';
    routeName: string;
    participantCount: number;
    adultCount?: number;
    childCount?: number;
    departureDate: string;
    returnDate?: string;
    departurePending: boolean;
    orderStatus: '待出行' | '行程中' | '已完成' | '已清账' | '已取消';
    customerSource: '同行' | '直客';
    platformSystem?: string;
    noSystemUpload?: boolean;
    paymentMethod?: string;
    contractSigned?: boolean;
    insurancePurchased?: boolean;
    groundOperator?: string;
    groundContact?: string;
    groundRoute?: string;
    confirmationSent?: boolean;
    rebateAmount?: number;
    storeSettlement?: number;
    groundSettlement?: number;
    cancellationReason?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    guides?: Guide[];
    guests?: Guest[];
    groupNoticeSent?: boolean;
    departureLocation?: string;
    returnLocation?: string;
    outboundTransportType?: string;
    outboundTransportDetails?: string;
    returnTransportType?: string;
    returnTransportDetails?: string;
    transportCost?: number;
    transportCostStatus?: '客人自理' | '';
}

export interface User {
    id: string;
    name: string;
    role: string;
    avatarUrl: string;
    email: string;
    about: string;
    phone: string;
    department: string;
    password?: string;
    // New Fields
    joinDate?: string;
    employeeId?: string;
    location?: string;
}

export interface Notification {
    id: string;
    messageKey: string;
    messageParams?: Record<string, string | number>;
    date: string;
    read: boolean;
    targetType?: 'client' | 'order';
    targetId?: string;
    isStarred?: boolean;
    isPinned?: boolean;
}

export interface CrmData {
  customers: Customer[];
  clients: Client[]; // This now represents Inquiries
  followUpHistory: FollowUpRecord[];
  failureReasons: { [key: string]: FailureReason };
  orders: Order[];
  user: User;
  notifications: Notification[];
}

// Type for global search result item
export type GlobalSearchResult = {
    type: 'client' | 'order' | 'customer';
    id: string;
    title: string;
    subtitle: string;
};

// Type for notification badge preference
export type NotificationBadgeType = 'unread' | 'total';

// App Settings Types
export type Currency = 'USD' | 'CNY';
export type DateFormat = 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'zh-CN';

export interface AppSettings {
    currency: Currency;
    dateFormat: DateFormat;
    compactMode: boolean;
}
