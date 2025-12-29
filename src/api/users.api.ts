import api from './index';
import { StandardResponse } from '../types/api.types';
import { User, AuthResponse, LoginCredentials } from '../types/user.types';

export const usersApi = {
    // Auth
    login: async (credentials: LoginCredentials): Promise<StandardResponse<AuthResponse>> => {
        const response = await api.post('/api/v1/auth/login', {
            emailOrMobile: credentials.email,
            password: credentials.password,
        });
        return response.data;
    },

    // Get current user
    getMe: async (): Promise<StandardResponse<User>> => {
        const response = await api.get('/api/v1/users/me');
        return response.data;
    },

    // Get user by ID
    getUserById: async (userId: string): Promise<StandardResponse<User>> => {
        const response = await api.get(`/api/v1/users/info/${userId}`);
        return response.data;
    },

    // Update user location
    updateLocation: async (locationId: string): Promise<StandardResponse<any>> => {
        const response = await api.patch(`/api/v1/users/location/${locationId}`);
        return response.data;
    },

    // Update profile picture
    updateProfilePic: async (profilePic: string): Promise<StandardResponse<any>> => {
        const response = await api.patch('/api/v1/users/profile-pic', { profilePic });
        return response.data;
    },

    // Vendor payout details
    getVendorPayoutDetails: async (): Promise<StandardResponse<any>> => {
        const response = await api.get('/api/v1/users/get-vendor/payout-details');
        return response.data;
    },

    updateVendorPayoutDetails: async (payoutDetails: {
        bankName: string;
        accountNumber: string;
        accountName: string;
    }): Promise<StandardResponse<any>> => {
        const response = await api.put('/api/v1/users/vendor/payout-details', payoutDetails);
        return response.data;
    },

    // Password management
    setPassword: async (password: string): Promise<StandardResponse<any>> => {
        const response = await api.put('/api/v1/users/set-password-onboarding', { password });
        return response.data;
    },

    // Change password
    changePassword: async (currentPassword: string, newPassword: string): Promise<StandardResponse<any>> => {
        const response = await api.post('/api/v1/auth/change-password', {
            currentPassword,
            newPassword,
        });
        return response.data;
    },

    // Send password reset OTP
    sendPasswordResetOTP: async (email: string): Promise<StandardResponse<any>> => {
        const response = await api.post('/api/v1/auth/send-password-otp', { email });
        return response.data;
    },

    // Reset password
    resetPassword: async (email: string, otp: string, newPassword: string): Promise<StandardResponse<any>> => {
        const response = await api.patch('/api/v1/auth/reset-password', {
            email,
            otp,
            newPassword,
        });
        return response.data;
    },
};

export default usersApi;
