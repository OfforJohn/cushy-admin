import api from './index';
import { StandardResponse } from '../types/api.types';

export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    image?: string;  // Single image string, not array
    images?: string[];  // Original entity has array
    isAvailable: boolean;
    isDiscountActive?: boolean;
    discountPrice?: number;
    discountPercentage?: number;
    discountStart?: string;
    discountEnd?: string;
    menuCategoryId?: string;
    menuCategory?: {
        id: string;
        name: string;
    };
    storeId?: string;
    store?: {
        id: string;
        name: string;
        category?: string;
        phone?: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

export interface MenuCategory {
    id: string;
    name: string;
    storeId: string;
    isPublished: boolean;
}

export const productsApi = {
    // Get all menu items for a store
    getProductsByStore: async (storeId: string): Promise<StandardResponse<Product[]>> => {
        const response = await api.get(`/api/v1/menu-items/${storeId}`);
        return response.data;
    },

    // Get menu categories for a store
    getMenuCategories: async (storeId: string): Promise<StandardResponse<MenuCategory[]>> => {
        const response = await api.get(`/api/v1/menu-categories/${storeId}`);
        return response.data;
    },

    // Get all products across all stores (by fetching from each store)
    getAllProducts: async (): Promise<Product[]> => {
        // First get all stores
        const storesResponse = await api.get('/api/v1/stores');
        const stores = storesResponse.data?.data || [];

        // Fetch products and categories from each store
        const allProducts: Product[] = [];
        const categoryMap = new Map<string, string>(); // categoryId -> categoryName

        for (const store of stores.slice(0, 20)) { // Limit to first 20 stores for performance
            try {
                // Fetch categories first
                try {
                    const categoriesResponse = await api.get(`/api/v1/menu-categories/${store.id}`);
                    const categories = categoriesResponse.data?.data || [];
                    categories.forEach((cat: any) => {
                        categoryMap.set(cat.id, cat.name);
                    });
                } catch (err) {
                    // Categories might fail, continue anyway
                }

                // Fetch products
                const productsResponse = await api.get(`/api/v1/menu-items/${store.id}`);
                const storeProducts = productsResponse.data?.data || [];

                // Add store info and resolve category to each product
                storeProducts.forEach((product: any) => {
                    allProducts.push({
                        ...product,
                        store: {
                            id: store.id,
                            name: store.name,
                            category: store.category,
                            phone: store.phone,
                        },
                        // Resolve category name from map if we have it
                        menuCategory: product.menuCategory || (product.menuCategoryId ? {
                            id: product.menuCategoryId,
                            name: categoryMap.get(product.menuCategoryId) || 'Unknown',
                        } : undefined),
                    });
                });
            } catch (err) {
                // Skip stores with errors
                console.warn(`Failed to fetch products for store ${store.id}`);
            }
        }

        return allProducts;
    },

    // Update product availability
    updateProductAvailability: async (storeId: string, productId: string, isAvailable: boolean): Promise<StandardResponse<any>> => {
        const response = await api.patch(`/api/v1/menu-items/${storeId}/${productId}/availability`, { isAvailable });
        return response.data;
    },

    // Mark product out of stock
    markOutOfStock: async (productId: string): Promise<StandardResponse<any>> => {
        const response = await api.patch(`/api/v1/menu-items/${productId}/out-of-stock`);
        return response.data;
    },

    // Mark product in stock
    markInStock: async (productId: string): Promise<StandardResponse<any>> => {
        const response = await api.patch(`/api/v1/menu-items/${productId}/in-stock`);
        return response.data;
    },
};

export default productsApi;
