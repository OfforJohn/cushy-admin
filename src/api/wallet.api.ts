import api from './index';
import { StandardResponse, PaginationRequest } from '../types/api.types';
import { Transaction, PayoutTransaction, Wallet, CreatePayoutDto } from '../types/wallet.types';

export const walletApi = {
    // Get all transactions (admin)
    getAllTransactions: async (): Promise<StandardResponse<Transaction[]>> => {
        const response = await api.get('/api/v1/wallet/get-transactions');
        return response.data;
    },

    // Get transactions with pagination
    getTransactions: async (pagination?: PaginationRequest): Promise<StandardResponse<Transaction[]>> => {
        const response = await api.get('/api/v1/wallet/transactions', {
            params: pagination,
        });
        return response.data;
    },

    // Get transaction details
    getTransactionDetails: async (transactionIdOrReference: string): Promise<StandardResponse<Transaction>> => {
        const response = await api.get(`/api/v1/wallet/transactions/${transactionIdOrReference}`);
        return response.data;
    },

    // Get wallet by user ID
    getWallet: async (userId: string): Promise<StandardResponse<Wallet>> => {
        const response = await api.get('/api/v1/wallet/get-wallet', {
            params: { userId },
        });
        return response.data;
    },

    // Get all banks (Paystack)
    getAllBanks: async (): Promise<StandardResponse<{ name: string; code: string }[]>> => {
        const response = await api.get('/api/v1/wallet/get-all-banks');
        return response.data;
    },

    // Name enquiry
    nameEnquiry: async (accountNumber: string, bankCode: string): Promise<StandardResponse<{
        account_number: string;
        account_name: string;
        bank_id: number;
    }>> => {
        const response = await api.get('/api/v1/wallet/name-enquiry', {
            params: { account_number: accountNumber, bank_code: bankCode },
        });
        return response.data;
    },

    // Create manual payout
    createPayout: async (payoutData: CreatePayoutDto): Promise<StandardResponse<any>> => {
        const response = await api.post('/api/v1/wallet/create-payout', payoutData);
        return response.data;
    },

    // Get user payouts
    getUserPayouts: async (userId: string): Promise<StandardResponse<PayoutTransaction[]>> => {
        const response = await api.get(`/api/v1/wallet/user-payout/${userId}`);
        return response.data;
    },

    // Get payout status
    getPayoutStatus: async (reference: string): Promise<StandardResponse<any>> => {
        const response = await api.get(`/api/v1/wallet/payout-status/${reference}`);
        return response.data;
    },

    // Run daily payouts (admin)
    runPayouts: async (date?: string): Promise<StandardResponse<any>> => {
        const response = await api.post('/api/v1/wallet/run-payouts', null, {
            params: date ? { date } : undefined,
        });
        return response.data;
    },

    // Get all payouts (admin) - with filters
    getAllPayouts: async (filters?: {
        vendorId?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
        minAmount?: number;
        maxAmount?: number;
        bankName?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<StandardResponse<{ payouts: PayoutTransaction[]; total: number; page: number; limit: number }>> => {
        const response = await api.get('/api/v1/wallet/payouts', {
            params: filters,
        });
        return response.data;
    },

    // Fund wallet manually (admin)
    fundWallet: async (data: {
        userId: string;
        amount: number;
        description: string;
    }): Promise<StandardResponse<any>> => {
        const response = await api.post('/api/v1/wallet/fund-wallet', data);
        return response.data;
    },

    // Debit wallet manually (admin)
    debitWallet: async (data: {
        userId: string;
        amount: number;
        description: string;
    }): Promise<StandardResponse<any>> => {
        const response = await api.post('/api/v1/wallet/debit-wallet', data);
        return response.data;
    },

    // Get manual funding history (admin)
    getManualFundingHistory: async (filters?: {
        userId?: string;
        page?: number;
        limit?: number;
        startDate?: string;
        endDate?: string;
    }): Promise<StandardResponse<any>> => {
        const response = await api.get('/api/v1/wallet/manual-fundings', {
            params: filters,
        });
        return response.data;
    },

    // Reverse a manual funding (admin)
    reverseManualFunding: async (transactionReference: string, reason: string): Promise<StandardResponse<any>> => {
        const response = await api.post('/api/v1/wallet/reverse-manual-funding', {
            transactionReference,
            reason,
        });
        return response.data;
    },
};

export default walletApi;

