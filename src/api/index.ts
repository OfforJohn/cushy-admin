import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.cushyaccess.com';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
            // Use cushy-access-key header as expected by the backend
            config.headers['cushy-access-key'] = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ message?: string; error?: boolean }>) => {
        // Log 401 errors but don't auto-redirect (let the app handle it gracefully)
        if (error.response?.status === 401) {
            console.warn('API returned 401 Unauthorized:', error.config?.url);
        }

        // Extract meaningful error message from backend response
        const backendMessage = error.response?.data?.message;

        // Create a more user-friendly error
        const userFriendlyError = new Error(
            backendMessage || getDefaultErrorMessage(error.response?.status)
        );

        // Preserve original error properties for debugging
        (userFriendlyError as any).originalError = error;
        (userFriendlyError as any).statusCode = error.response?.status;

        return Promise.reject(userFriendlyError);
    }
);

// Helper function to get default error messages based on status code
function getDefaultErrorMessage(status?: number): string {
    switch (status) {
        case 400:
            return 'Invalid request. Please check your input.';
        case 401:
            return 'Invalid email or password. Please try again.';
        case 403:
            return 'You do not have permission to perform this action.';
        case 404:
            return 'The requested resource was not found.';
        case 422:
            return 'Validation failed. Please check your input.';
        case 429:
            return 'Too many requests. Please wait a moment and try again.';
        case 500:
            return 'Server error. Please try again later.';
        default:
            return 'An unexpected error occurred. Please try again.';
    }
}

export default api;
