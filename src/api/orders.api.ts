import api from './index';
import { StandardResponse } from '../types/api.types';
import { Order, OrderFilters, OrderStatus } from '../types/order.types';

export const ordersApi = {
    // Get ALL orders (admin endpoint)
    getAllOrders: async (filters?: OrderFilters): Promise<StandardResponse<Order[]>> => {
        try {
            const response = await api.get('/api/v1/orders/get-all-orders');
            let orders = response.data || [];

            // Handle if response is wrapped in data property
            if (response.data?.data) {
                orders = response.data.data;
            }

            // Apply category filter if provided
            if (filters?.storeCategory && Array.isArray(orders)) {
                orders = orders.filter((order: Order) =>
                    order.store?.category?.toLowerCase() === filters.storeCategory?.toLowerCase()
                );
            }

            // Sort by createdAt desc
            if (Array.isArray(orders)) {
                orders.sort((a: Order, b: Order) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
            }

            return {
                error: false,
                message: 'ORDERS_FETCHED',
                data: orders,
            };
        } catch (error: any) {
            console.error('Error fetching orders:', error);
            return {
                error: true,
                message: error.message || 'Failed to fetch orders',
                data: [],
            };
        }
    },

    // Get orders by status (user endpoint with pagination)
    getOrdersByStatus: async (status: OrderStatus, filters?: OrderFilters): Promise<StandardResponse<Order[]>> => {
        const response = await api.get('/api/v1/orders', {
            params: {
                page: filters?.page || 1,
                size: filters?.limit || 50,
                'filter[status]': status,
            },
        });
        return response.data;
    },

    // Get orders by store ID
    getOrdersByStore: async (storeId: string): Promise<StandardResponse<Order[]>> => {
        const response = await api.get(`/api/v1/orders/get-orders-by-storeId/${storeId}`);
        return response.data;
    },

    // Get single order
    getOrder: async (orderId: string): Promise<StandardResponse<Order>> => {
        const response = await api.get(`/api/v1/orders/get-order/${orderId}`);
        return response.data;
    },

    // Get order tracking
    getOrderTracking: async (orderId: string): Promise<StandardResponse<any>> => {
        const response = await api.get(`/api/v1/orders/tracking/${orderId}`);
        return response.data;
    },

    // Update order tracking
    updateOrderTracking: async (orderId: string, status: { status: OrderStatus; note?: string }): Promise<StandardResponse<any>> => {
        const response = await api.put(`/api/v1/orders/tracking/${orderId}`, status);
        return response.data;
    },

    // Update order status (admin)
    updateOrderStatus: async (orderId: string, status: { status: OrderStatus; note?: string }): Promise<StandardResponse<any>> => {
        const response = await api.post('/api/v1/orders/update-order-status', status, {
            params: { orderId },
        });
        return response.data;
    },
};

export default ordersApi;
