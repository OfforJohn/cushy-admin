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

    // Change password (requires old password verification)
    changePassword: async (emailOrMobile: string, oldPassword: string, newPassword: string): Promise<StandardResponse<any>> => {
        const response = await api.post('/api/v1/auth/change-password', {
            emailOrMobile,
            oldPassword,
            newPassword,
        });
        return response.data;
    },

    // Send password reset OTP
    sendPasswordResetOTP: async (emailOrMobile: string, otpType: 'EMAIL' | 'MOBILE' = 'EMAIL'): Promise<StandardResponse<any>> => {
        const response = await api.post('/api/v1/auth/send-password-otp', {
            emailOrMobile,
            otpType,
        });
        return response.data;
    },

    // Reset password with OTP
    resetPassword: async (emailOrMobile: string, otp: string, password: string, otpType: 'EMAIL' | 'MOBILE' = 'EMAIL'): Promise<StandardResponse<any>> => {
        const response = await api.patch('/api/v1/auth/reset-password', {
            emailOrMobile,
            otp,
            password,
            otpType,
        });
        return response.data;
    },

    // Admin Login 2FA - Step 1: Validate credentials and send OTP
    adminLogin: async (email: string, password: string): Promise<StandardResponse<{ loginToken: string; message: string }>> => {
        const response = await api.post('/api/v1/auth/admin/login', { email, password });
        return response.data;
    },

    // Admin Login 2FA - Step 2: Verify OTP and complete login
    adminVerifyLogin: async (email: string, otp: string, loginToken: string): Promise<StandardResponse<any>> => {
        const response = await api.post('/api/v1/auth/admin/verify-login', { email, otp, loginToken });
        return response.data;
    },
};

export default usersApi;
