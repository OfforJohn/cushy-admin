export enum OrderStatus {
    PENDING = 'PENDING',
    ACKNOWLEDGED = 'ACKNOWLEDGED',
    REJECTED = 'REJECTED',
    PICKED_UP = 'PICKED_UP',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
}

export enum OrderTypes {
    Q_COMMERCE = 'q_commerce',
    LOGISTICS = 'logistics',
}

export interface OrderItem {
    id: string;
    menuItemId: string;
    name: string;
    quantity: number;
    price: number;
    totalPrice: number;
}

export interface OrderCharges {
    id: string;
    deliveryFee: number;
    serviceFee: number;
    packagingFee?: number;
    expressFee?: number;
    totalCharges: number;
}

export interface OrderTracking {
    id: string;
    status: OrderStatus;
    note?: string;
    timestamp: string;
}

export interface Order {
    id: string;
    userId: string;
    user?: {
        firstName: string;
        lastName: string;
        email: string;
        mobile: string;
    };
    orderItems: OrderItem[];
    pickUpLocationAddress?: string;
    dropOffLocationAddress?: string;
    type: OrderTypes;
    noteForRider?: string;
    noteForVendor?: string;
    noteForStore?: string;
    orderTracking: OrderTracking[];
    totalItems: number;
    totalAmount: number;
    totalAmountBeforeCharges: number;
    discountAmount?: number;
    appliedCouponCode?: string;
    Charges: number;
    storeId?: string;
    store?: {
        id: string;
        name: string;
        category: string;
        mobile?: string;
    };
    scheduleDelivery: boolean;
    scheduleDeliveryDate?: string;
    scheduleDeliveryTime?: string;
    buyForFriend: boolean;
    fullHouseAddress?: string;
    additionalPhoneNumber?: string;
    duration?: string;
    ttrRideId?: number;
    ttrTrackingCode?: string;
    ttrTrackingUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface OrderStats {
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
}

export interface OrderFilters {
    status?: OrderStatus;
    storeId?: string;
    storeCategory?: string;
    city?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
}
