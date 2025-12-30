import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRoles, LoginCredentials, AuthResponse } from '../types/user.types';
import { usersApi } from '../api/users.api';
import { STORAGE_KEYS } from '../utils/constants';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
    updateUser: (user: User) => void;
    hasRole: (roles: UserRoles[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check if user is admin (case-insensitive)
    const validateAdminAccess = (user: User): boolean => {
        const role = String(user.userRole).toUpperCase();
        return role === 'ADMIN';
    };

    // Initialize auth state from localStorage
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
                const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

                if (token && storedUser) {
                    const parsedUser = JSON.parse(storedUser) as User;

                    // Validate admin access
                    if (!validateAdminAccess(parsedUser)) {
                        throw new Error('Access denied. Admin privileges required.');
                    }

                    // Use stored user directly (skip API verification for now)
                    setUser(parsedUser);
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
                localStorage.removeItem(STORAGE_KEYS.USER);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
        setIsLoading(true);
        try {
            const response = await usersApi.login(credentials);

            if (response.error) {
                throw new Error(response.message || 'Login failed');
            }

            // Backend returns { user, access_token }
            const responseData = response.data as any;
            const accessToken = responseData.access_token;
            const userData = responseData.user as User;

            // Validate admin access
            if (!validateAdminAccess(userData)) {
                throw new Error('Access denied. Admin privileges required.');
            }

            // Store tokens and user
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

            setUser(userData);
        } catch (error: any) {
            // The error message should already be user-friendly from the API layer
            // Just re-throw it as-is
            const errorMessage = error.message || 'Login failed. Please try again.';
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        setUser(null);
        window.location.href = '/login';
    }, []);

    const updateUser = useCallback((updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    }, []);

    const hasRole = useCallback((roles: UserRoles[]): boolean => {
        if (!user) return false;
        return roles.includes(user.userRole);
    }, [user]);

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
        hasRole,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
