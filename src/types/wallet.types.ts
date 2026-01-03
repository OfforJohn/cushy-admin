// Transaction categories from backend
export enum TransactionCategory {
    CREDIT = 'CREDIT',
    LOGISTICS = 'LOGISTICS',
    Q_COMMERCE = 'Q_COMMERCE',
    ORDER = 'ORDER',
    DEBIT = 'DEBIT',
    FUND_WALLET = 'FUND_WALLET',
    ORDER_REFUND = 'ORDER_REFUND',
}

// Transaction statuses from backend
export enum TransactionStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    AWAITING_DELIVERY = 'await_delivery',
    FAILED = 'failed',
    REVERSED = 'reversed',
}

export enum PayoutStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    COMPLETED = 'COMPLETED',
}

export interface Wallet {
    id: string;
    userId: string;
    walletBalance: number;
    hasSetPin: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Transaction {
    id: string;
    userId: string;
    user?: {
        firstName: string;
        lastName: string;
        email: string;
    };
    senderUserId?: string;
    senderWalletId?: string;
    receipientUserId?: string;
    receipientWalletId?: string;
    transactionReference: string;
    thirdPartyTransactionReference?: string;
    walletId: string;
    amount: number;
    category: TransactionCategory;
    status: TransactionStatus;
    description?: string;
    ipAddress?: string;
    userDevice?: string;
    orderId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PayoutTransaction {
    id: string;
    vendorId: string;
    vendor?: {
        firstName: string;
        lastName: string;
        businessName?: string;
    };
    amount: number;
    bankName: string;
    accountNumber: string;
    accountName: string;
    reference: string;
    narration?: string;
    providerReference?: string;
    status: PayoutStatus;
    createdAt: string;
    updatedAt: string;
}

export interface WalletStats {
    totalBalance: number;
    totalInflow: number;
    totalOutflow: number;
    pendingPayouts: number;
    completedPayouts: number;
}

export interface CreatePayoutDto {
    vendorId: string;
    amount: number;
    bankName: string;
    accountNumber: string;
    accountName: string;
    reference: string;
    narration?: string;
    providerReference?: string;
}
