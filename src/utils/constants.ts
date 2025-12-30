// App constants
export const APP_NAME = 'Cushy Access Admin';
export const APP_VERSION = '1.0.0';

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.cushyaccess.com';

// Local storage keys
export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    USER: 'user',
    THEME: 'theme',
    SIDEBAR_COLLAPSED: 'sidebarCollapsed',
} as const;

// Pagination defaults
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    LIMIT_OPTIONS: [10, 25, 50, 100],
} as const;

// Date format strings
export const DATE_FORMATS = {
    DISPLAY: 'MMM dd, yyyy',
    DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
    API: 'yyyy-MM-dd',
    API_WITH_TIME: "yyyy-MM-dd'T'HH:mm:ss",
} as const;

// Status colors mapping
export const STATUS_COLORS = {
    // Order statuses
    PENDING: { bg: 'yellow.500', color: 'gray.900' },
    ACKNOWLEDGED: { bg: 'blue.500', color: 'white' },
    REJECTED: { bg: 'red.500', color: 'white' },
    PICKED_UP: { bg: 'purple.500', color: 'white' },
    DELIVERED: { bg: 'green.500', color: 'white' },
    CANCELLED: { bg: 'gray.500', color: 'white' },

    // Transaction statuses
    COMPLETED: { bg: 'green.500', color: 'white' },
    FAILED: { bg: 'red.500', color: 'white' },

    // Verification statuses
    VERIFIED: { bg: 'green.500', color: 'white' },
    UNVERIFIED: { bg: 'orange.500', color: 'white' },

    // Generic
    ACTIVE: { bg: 'green.500', color: 'white' },
    INACTIVE: { bg: 'gray.500', color: 'white' },
} as const;

// Store category labels
export const STORE_CATEGORY_LABELS = {
    super_market: 'Supermarket',
    med_tech: 'Pharmacy',
    grocery: 'Grocery',
    local_food: 'Local Food',
    restaurant: 'Restaurant',
    other: 'Other',
} as const;

// User role labels
export const USER_ROLE_LABELS = {
    THIRD_PARTY: 'Third Party',
    CUSTOMER: 'Customer',
    VENDOR: 'Vendor',
    ADMIN: 'Admin',
    DOCTOR: 'Health Professional',
} as const;

// Navigation items
export const NAV_ITEMS = [
    {
        label: 'Overview',
        path: '/',
        icon: 'LayoutDashboard',
    },
    {
        label: 'Merchants',
        icon: 'Store',
        children: [
            { label: 'All Merchants', path: '/merchants' },
            { label: 'Merchant Approval', path: '/merchants/merchant-approval' },
            { label: 'Orders', path: '/merchants/orders' },
            { label: 'Products', path: '/merchants/products' },
        ],
    },
    {
        label: 'Health',
        icon: 'Stethoscope',
        children: [
            { label: 'Professionals', path: '/health/professionals' },
            { label: 'Consultations', path: '/health/consultations' },
            { label: 'Licenses', path: '/health/licenses' },
        ],
    },
    {
        label: 'Logistics',
        icon: 'Truck',
        path: '/logistics',
    },
    {
        label: 'Users & Wallet',
        icon: 'Users',
        children: [
            { label: 'Users', path: '/users' },
            { label: 'Transactions', path: '/users/transactions' },
            { label: 'Refunds', path: '/users/refunds' },
            { label: 'Payouts', path: '/users/payouts' },
        ],
    },
    {
        label: 'Marketing',
        icon: 'Megaphone',
        children: [
            { label: 'Coupons', path: '/marketing/coupons' },
            { label: 'Announcements', path: '/marketing/announcements' },
            { label: 'Segments', path: '/marketing/segments' },
            { label: 'Referrals', path: '/marketing/referrals' },
        ],
    },
    {
        label: 'Support',
        icon: 'HeadphonesIcon',
        children: [
            { label: 'Tickets', path: '/support/tickets' },
            { label: 'Disputes', path: '/support/disputes' },
            { label: 'Reviews', path: '/support/reviews' },
        ],
    },
    {
        label: 'Analytics',
        path: '/analytics',
        icon: 'BarChart3',
    },
    {
        label: 'Settings',
        path: '/settings',
        icon: 'Settings',
    },
    {
        label: 'Audit Log',
        path: '/audit-log',
        icon: 'FileText',
    },
] as const;
