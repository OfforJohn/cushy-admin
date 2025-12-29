export enum StoreCategory {
    SUPER_MARKET = 'super_market',
    MED_TECH = 'med_tech',
    GROCERY = 'grocery',
    LOCAL_FOOD = 'local_food',
    RESTAURANT = 'restaurant',
    OTHER = 'other',
}

export interface OpeningSchedule {
    id: string;
    storeId: string;
    dayOfWeek: number; // 0 = Sunday, 6 = Saturday
    openTime: string;
    closeTime: string;
    isClosed: boolean;
}

export interface PaymentInfo {
    id: string;
    storeId: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
}

export interface MenuItem {
    id: string;
    storeId: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
    categoryId: string;
    isAvailable: boolean;
    preparationTime?: number;
}

export interface MenuCategory {
    id: string;
    storeId: string;
    name: string;
    description?: string;
    menuItems?: MenuItem[];
}

export interface Store {
    id: string;
    userId: string;
    name?: string;
    description?: string;
    coverImage?: string;
    email?: string;
    mobile?: string;
    addressId?: string;
    address?: {
        id: string;
        address: string;
        city: string;
        state: string;
        latitude?: number;
        longitude?: number;
    };
    category: StoreCategory;
    isVerified: boolean;
    openingSchedules?: OpeningSchedule;
    menuCategories?: MenuCategory[];
    menuItems?: MenuItem[];
    rating?: number;
    ordersCount?: number;
    walletBalance?: number;
    user?: {
        firstName: string;
        lastName: string;
        email: string;
        mobile: string;
    };
}

export interface VendorListFilters {
    category?: StoreCategory;
    isVerified?: boolean;
    city?: string;
    page?: number;
    limit?: number;
}

export interface VendorStats {
    totalVendors: number;
    verifiedVendors: number;
    pendingVendors: number;
    byCategory: {
        category: StoreCategory;
        count: number;
    }[];
}
