import api from './index';
import { StandardResponse } from '../types/api.types';
import { Store, StoreCategory, VendorListFilters } from '../types/store.types';

export const storesApi = {
    // Get all stores (for dropdowns, etc) - uses public endpoint
    getAllStores: async (): Promise<any> => {
        const response = await api.get('/api/v1/stores');
        // API returns { data: [...stores...] }
        return response.data;
    },

    // Get stores by category
    getStores: async (category?: StoreCategory): Promise<StandardResponse<Store[]>> => {
        const response = await api.get('/api/v1/stores', {
            params: { category },
        });
        return response.data;
    },

    // Get single store
    getStore: async (storeId: string): Promise<StandardResponse<Store>> => {
        const response = await api.get(`/api/v1/stores/${storeId}`);
        return response.data;
    },

    // Update store
    updateStore: async (storeId: string, storeData: Partial<Store>): Promise<StandardResponse<Store>> => {
        const response = await api.put(`/api/v1/stores/${storeId}`, storeData);
        return response.data;
    },

    // Get opening schedule
    getOpeningSchedule: async (storeId: string): Promise<StandardResponse<any>> => {
        const response = await api.get(`/api/v1/stores/opening-schedule/${storeId}`);
        return response.data;
    },

    // Update opening schedule
    updateOpeningSchedule: async (storeId: string, schedule: any): Promise<StandardResponse<any>> => {
        const response = await api.put(`/api/v1/stores/opening-schedule/${storeId}`, schedule);
        return response.data;
    },

    // Get payment info
    getPaymentInfo: async (storeId: string): Promise<StandardResponse<any>> => {
        const response = await api.get(`/api/v1/stores/payment-info/${storeId}`);
        return response.data;
    },

    // Create/Update payment info
    updatePaymentInfo: async (storeId: string, paymentInfo: {
        bankName: string;
        accountNumber: string;
        accountName: string;
    }): Promise<StandardResponse<any>> => {
        const response = await api.post(`/api/v1/stores/payment-info/${storeId}`, paymentInfo);
        return response.data;
    },

    // Menu Items
    getMenuItems: async (storeId: string): Promise<StandardResponse<any[]>> => {
        const response = await api.get(`/api/v1/menu?storeId=${storeId}`);
        return response.data;
    },

    // Menu Categories
    getMenuCategories: async (storeId: string): Promise<StandardResponse<any[]>> => {
        const response = await api.get(`/api/v1/menu-category?storeId=${storeId}`);
        return response.data;
    },
};

export default storesApi;
