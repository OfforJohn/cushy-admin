import api from './index';
import { StandardResponse, DashboardStats, OrderGraphData, VendorListItem, UserSummaryItem, DailyTransactionPercentage } from '../types/api.types';

export const adminApi = {
    // Dashboard Stats
    getDashboardStats: async (days?: string): Promise<StandardResponse<DashboardStats>> => {
        const response = await api.get('/api/v1/admin/dashboard-stats', {
            params: { days },
        });
        return response.data;
    },

    // Order Stats
    getOrderStats: async (from: string, to: string): Promise<StandardResponse<any>> => {
        const response = await api.get('/api/v1/admin/orders-stats', {
            params: { from, to },
        });
        return response.data;
    },

    // Order Graph
    getOrderGraph: async (year: number): Promise<StandardResponse<OrderGraphData[]>> => {
        const response = await api.get('/api/v1/admin/order-graph', {
            params: { year },
        });
        return response.data;
    },

    // Vendor Stats
    getVendorStats: async (month?: number, year?: number): Promise<StandardResponse<any>> => {
        const response = await api.get('/api/v1/admin/vendor-stats', {
            params: { month, year },
        });
        return response.data;
    },

    // Vendor List
    getVendorList: async (filters?: {
        type?: string;
        isVerified?: boolean;
        page?: number;
        limit?: number;
    }): Promise<StandardResponse<VendorListItem[]>> => {
        const response = await api.get('/api/v1/admin/vendor-list', {
            params: filters,
        });
        return response.data;
    },

    // Vendor Verification
    updateVendorVerification: async (
        vendorId: string,
        verificationFlag: { isVerified: boolean; reason?: string }
    ): Promise<StandardResponse<any>> => {
        const response = await api.post(`/api/v1/admin/vendor-verification`, verificationFlag, {
            params: { vendorId },
        });
        return response.data;
    },

    // Update User Role
    updateUserRole: async (userId: string, newRole: string): Promise<StandardResponse<any>> => {
        const response = await api.patch('/api/v1/admin/update-user-role', null, {
            params: { userId, newRole },
        });
        return response.data;
    },

    // User Summaries
    getUserSummaries: async (page = 1, size = 10): Promise<StandardResponse<UserSummaryItem[]>> => {
        const response = await api.get('/api/v1/admin/user-summaries', {
            params: { page, size },
        });
        return response.data;
    },

    // Daily Transaction Percentage
    getDailyTransactionPercentage: async (): Promise<StandardResponse<DailyTransactionPercentage>> => {
        const response = await api.get('/api/v1/admin/daily-transaction-percentage');
        return response.data;
    },

    // Riders
    getAllRiders: async (): Promise<StandardResponse<any[]>> => {
        const response = await api.get('/api/v1/admin/get-all-riders');
        return response.data;
    },

    createRider: async (riderData: {
        providerId: string;
        riderName: string;
        riderId: number;
        riderPhone: string;
        riderRate: number;
        vehicleType?: string;
    }): Promise<StandardResponse<any>> => {
        const response = await api.post('/api/v1/admin/create-rider', riderData);
        return response.data;
    },

    assignRiderToOrder: async (orderId: string, riderId: number): Promise<StandardResponse<any>> => {
        const response = await api.post('/api/v1/admin/assign-rider-to-order', null, {
            params: { orderId, riderId },
        });
        return response.data;
    },

    // Free Delivery Toggle
    toggleGlobalFreeDelivery: async (isActive: boolean): Promise<StandardResponse<any>> => {
        const response = await api.patch('/api/v1/admin/toggle-global-free-delivery', { isActive });
        return response.data;
    },

    getGlobalFreeDeliveryStatus: async (): Promise<StandardResponse<{ result: boolean }>> => {
        const response = await api.get('/api/v1/admin/get-global-free-delivery-status');
        return response.data;
    },
};

export default adminApi;
