import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './components/layout';
import theme from './theme';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { OverviewPage } from './pages/overview/OverviewPage';
import { OrdersPage } from './pages/orders/OrdersPage';
import { VendorsPage } from './pages/restaurants/RestaurantsPage';
import { UsersPage } from './pages/users/UsersPage';
import { SettingsPage } from './pages/settings/SettingsPage';

// Placeholder pages - will be implemented incrementally
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ color: '#fff', padding: '24px' }}>
    <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>{title}</h1>
    <p style={{ color: '#9ca3af' }}>This page is coming soon.</p>
  </div>
);

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0d1117',
        color: '#fff'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<OverviewPage />} />

        {/* Merchants */}
        <Route path="merchants" element={<VendorsPage />} />
        <Route path="merchants/orders" element={<OrdersPage title="Merchant Orders" />} />
        <Route path="merchants/products" element={<PlaceholderPage title="Products" />} />

        {/* Legacy routes (redirect) */}
        <Route path="restaurants" element={<VendorsPage />} />
        <Route path="restaurants/*" element={<VendorsPage />} />
        <Route path="orders" element={<OrdersPage title="All Orders" />} />

        {/* Health */}
        <Route path="health/professionals" element={<PlaceholderPage title="Health Professionals" />} />
        <Route path="health/consultations" element={<PlaceholderPage title="Consultations" />} />
        <Route path="health/licenses" element={<PlaceholderPage title="Licenses & Verification" />} />

        {/* Logistics */}
        <Route path="logistics/riders" element={<PlaceholderPage title="Riders" />} />
        <Route path="logistics/jobs" element={<PlaceholderPage title="Delivery Jobs" />} />
        <Route path="logistics/zones" element={<PlaceholderPage title="Zones & SLAs" />} />

        {/* Users & Wallet */}
        <Route path="users" element={<UsersPage />} />
        <Route path="users/transactions" element={<PlaceholderPage title="Transactions" />} />
        <Route path="users/refunds" element={<PlaceholderPage title="Refunds" />} />
        <Route path="users/payouts" element={<PlaceholderPage title="Payouts" />} />

        {/* Marketing */}
        <Route path="marketing/coupons" element={<PlaceholderPage title="Coupons & Promotions" />} />
        <Route path="marketing/announcements" element={<PlaceholderPage title="Announcements" />} />
        <Route path="marketing/segments" element={<PlaceholderPage title="Segments & Campaigns" />} />
        <Route path="marketing/referrals" element={<PlaceholderPage title="Referrals" />} />

        {/* Support */}
        <Route path="support/tickets" element={<PlaceholderPage title="Support Tickets" />} />
        <Route path="support/disputes" element={<PlaceholderPage title="Disputes" />} />
        <Route path="support/reviews" element={<PlaceholderPage title="Reviews & Reports" />} />

        {/* Analytics */}
        <Route path="analytics" element={<PlaceholderPage title="Analytics" />} />

        {/* Settings */}
        <Route path="settings" element={<SettingsPage />} />

        {/* Audit Log */}
        <Route path="audit-log" element={<PlaceholderPage title="Audit Log" />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default App;
