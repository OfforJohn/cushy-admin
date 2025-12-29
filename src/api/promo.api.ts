import api from './index';
import { StandardResponse } from '../types/api.types';

// Coupon Types matching backend
export type CouponType = 'PERCENT' | 'FIXED';

export interface Coupon {
    id: string;
    code: string;
    type: CouponType;
    value: number;
    appliesTo?: string; // 'SITE' or merchantId
    startDate?: string;
    endDate?: string;
    usageLimit?: number;
    usedCount?: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCouponDto {
    code: string;
    type: CouponType;
    value: number;
    appliesTo?: string; // 'SITE' or merchantId
    startDate?: string;
    endDate?: string;
    usageLimit?: number;
}

export interface PromoCode {
    id: string;
    code: string;
    description?: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    minOrderValue?: number;
    maxDiscountAmount?: number;
    usageLimit?: number;
    usageCount: number;
    startDate?: string;
    endDate?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export const promoApi = {
    // Get all promo codes
    getPromoCodes: async (page = 1, size = 50): Promise<StandardResponse<PromoCode[]>> => {
        const response = await api.get('/api/v1/promo-code', {
            params: { page, size },
        });
        return response.data;
    },

    // Get all coupons
    getAllCoupons: async (): Promise<StandardResponse<Coupon[]>> => {
        const response = await api.get('/api/v1/promo-code/get-all-coupon');
        return response.data;
    },

    // Get promo code by ID or code
    getPromoCode: async (idOrCode: string): Promise<StandardResponse<PromoCode>> => {
        const response = await api.get(`/api/v1/promo-code/${idOrCode}`);
        return response.data;
    },

    // Create coupon (admin)
    createCoupon: async (couponData: CreateCouponDto): Promise<StandardResponse<Coupon>> => {
        const response = await api.post('/api/v1/promo-code/create-coupon', couponData);
        return response.data;
    },

    // Update promo code
    updatePromoCode: async (idOrCode: string, promoData: Partial<CreateCouponDto>): Promise<StandardResponse<PromoCode>> => {
        const response = await api.put(`/api/v1/promo-code/${idOrCode}`, promoData);
        return response.data;
    },

    // Delete promo code
    deletePromoCode: async (id: string): Promise<StandardResponse<any>> => {
        const response = await api.delete(`/api/v1/promo-code/${id}`);
        return response.data;
    },

    // Deactivate coupon (admin)
    deactivateCoupon: async (id: string): Promise<StandardResponse<any>> => {
        const response = await api.patch(`/api/v1/promo-code/deactivate/${id}`);
        return response.data;
    },

    // Validate promo code
    validatePromoCode: async (codeValue: string, userId: string): Promise<StandardResponse<any>> => {
        const response = await api.post(`/api/v1/promo-code/validate/${codeValue}/${userId}`);
        return response.data;
    },

    // Validate coupon
    validateCoupon: async (code: string, storeId?: string): Promise<StandardResponse<any>> => {
        const response = await api.get(`/api/v1/promo-code/validate/${code}`, {
            params: { storeId },
        });
        return response.data;
    },
};

export default promoApi;
