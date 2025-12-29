export interface StandardResponse<T = unknown> {
    error: boolean;
    message: string;
    data: T;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface PaginationRequest {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface DashboardStats {
    usersCount: number;
    totalBalanceResult: {
        totalBalance: number;
    };
    activeUsersResult: {
        activeUsers: number;
        period: string;
    };
}

export interface OrderGraphData {
    month: string;
    orders: number;
    revenue: number;
}

export interface VendorListItem {
    id: string;
    name: string;
    category: string;
    city: string;
    isVerified: boolean;
    rating: number;
    ordersCount: number;
    walletBalance: number;
}

export interface UserSummaryItem {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    userRole: string;
    isVerified: boolean;
    createdAt: string;
    ordersCount: number;
    walletBalance: number;
    lastActive: string;
}

export interface DailyTransactionPercentage {
    date: string;
    deposits: number;
    withdrawals: number;
    payments: number;
    refunds: number;
}
