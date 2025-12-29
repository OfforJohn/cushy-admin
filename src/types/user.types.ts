export enum UserRoles {
    THIRD_PARTY = 'THIRD_PARTY',
    CUSTOMER = 'CUSTOMER',
    VENDOR = 'VENDOR',
    ADMIN = 'ADMIN',
    DOCTOR = 'DOCTOR',
}

// Extended admin roles (frontend only - for RBAC)
export enum AdminRoles {
    SUPER_ADMIN = 'SUPER_ADMIN',
    OPS_MANAGER = 'OPS_MANAGER',
    HEALTH_ADMIN = 'HEALTH_ADMIN',
    VENDOR_SUCCESS = 'VENDOR_SUCCESS',
    FINANCE = 'FINANCE',
    SUPPORT_AGENT = 'SUPPORT_AGENT',
    READ_ONLY_AUDITOR = 'READ_ONLY_AUDITOR',
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    completedOnboarding: boolean;
    userRole: UserRoles;
    locationId?: string;
    callingCode: string;
    countryCode: string;
    isVerified: boolean;
    promoCode?: string;
    profilePic?: string;
    username?: string;
    businessName?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UserSummary {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    userRole: UserRoles;
    isVerified: boolean;
    walletBalance?: number;
    ordersCount?: number;
    lastActive?: string;
    createdAt: string;
}

export interface VendorPayoutDetails {
    bankName: string;
    accountNumber: string;
    accountName: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken?: string;
    user: User;
}

export interface LoginCredentials {
    email: string;
    password: string;
}
