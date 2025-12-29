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
    runPayouts: async (): Promise<StandardResponse<any>> => {
        const response = await api.get('/api/v1/wallet/run-payouts');
        return response.data;
    },
};

export default walletApi;
