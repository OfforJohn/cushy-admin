import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

// Date formatters
export const formatDate = (date: string | Date | undefined, formatStr = 'MMM dd, yyyy'): string => {
    if (!date) return '-';
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsedDate)) return '-';
    return format(parsedDate, formatStr);
};

export const formatDateTime = (date: string | Date | undefined): string => {
    return formatDate(date, 'MMM dd, yyyy HH:mm');
};

export const formatTime = (date: string | Date | undefined): string => {
    return formatDate(date, 'HH:mm');
};

export const formatRelativeTime = (date: string | Date | undefined): string => {
    if (!date) return '-';
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsedDate)) return '-';
    return formatDistanceToNow(parsedDate, { addSuffix: true });
};

// Currency formatter (Nigerian Naira)
export const formatCurrency = (amount: number | undefined | null, showSymbol = true): string => {
    if (amount === undefined || amount === null) return showSymbol ? '₦0.00' : '0.00';

    const formatted = new Intl.NumberFormat('en-NG', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);

    return showSymbol ? `₦${formatted}` : formatted;
};

// Compact currency for large numbers
export const formatCompactCurrency = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null) return '₦0';

    if (amount >= 1000000) {
        return `₦${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
        return `₦${(amount / 1000).toFixed(1)}K`;
    }
    return formatCurrency(amount);
};

// Number formatters
export const formatNumber = (num: number | undefined | null): string => {
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat('en-NG').format(num);
};

export const formatCompactNumber = (num: number | undefined | null): string => {
    if (num === undefined || num === null) return '0';

    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
    }
    return formatNumber(num);
};

// Percentage formatter
export const formatPercentage = (value: number | undefined | null, decimals = 1): string => {
    if (value === undefined || value === null) return '0%';
    return `${value.toFixed(decimals)}%`;
};

// Phone number formatter (Nigerian)
export const formatPhoneNumber = (phone: string | undefined): string => {
    if (!phone) return '-';
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // Nigerian phone number formatting
    if (cleaned.length === 11 && cleaned.startsWith('0')) {
        return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    if (cleaned.length === 13 && cleaned.startsWith('234')) {
        return `+234 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
    }

    return phone;
};

// Name formatter
export const formatFullName = (firstName?: string, lastName?: string): string => {
    return [firstName, lastName].filter(Boolean).join(' ') || '-';
};

// Truncate text
export const truncateText = (text: string | undefined, maxLength = 50): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
};

// Capitalize first letter
export const capitalize = (str: string | undefined): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Convert snake_case or SCREAMING_SNAKE_CASE to Title Case
export const formatEnumValue = (value: string | undefined): string => {
    if (!value) return '-';
    return value
        .toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

// Order ID formatter (show last 8 characters)
export const formatOrderId = (orderId: string | undefined): string => {
    if (!orderId) return '-';
    if (orderId.length <= 12) return orderId;
    return `...${orderId.slice(-8)}`;
};
