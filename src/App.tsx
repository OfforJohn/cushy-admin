import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { MainLayout } from './components/layout';
import theme from './theme';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { OverviewPage } from './pages/overview/OverviewPage';
import { MerchantsPage, ProductsPage, OrdersPage, MerchantApprovalPage } from './pages/merchants';
import { UsersPage } from './pages/users/UsersPage';
import { PayoutsPage } from './pages/users/PayoutsPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { HealthProfessionalsPage, ConsultationsPage, LicensesVerificationsPage } from './pages/health';
import { LogisticsPage } from './pages/logistics/LogisticsPage';
import { AdListingPage } from './pages/marketing/AdListingPage';
import { TransactionsPage } from './pages/users/TransactionsPage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import PremiumPushPage from './pages/marketing/PremiumPushPage';

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
        <Route path="merchants" element={<MerchantsPage />} />
        <Route path="merchants/merchant-approval" element={<MerchantApprovalPage />} />
        <Route path="merchants/orders" element={<OrdersPage title="Merchant Orders" />} />
        <Route path="merchants/products" element={<ProductsPage />} />

        {/* Legacy routes (redirect) */}
        <Route path="restaurants" element={<MerchantsPage />} />
        <Route path="restaurants/*" element={<MerchantsPage />} />
        <Route path="orders" element={<OrdersPage title="All Orders" />} />

        {/* Health */}
        <Route path="health/professionals" element={<HealthProfessionalsPage />} />
        <Route path="health/consultations" element={<ConsultationsPage />} />
        <Route path="health/licenses" element={<LicensesVerificationsPage />} />

        {/* Logistics - Single page with tabs */}
        <Route path="logistics" element={<LogisticsPage />} />

        {/* Users & Wallet */}
        <Route path="users" element={<UsersPage />} />
        <Route path="users/transactions" element={<TransactionsPage />} />
        <Route path="users/refunds" element={<PlaceholderPage title="Refunds" />} />
        <Route path="users/payouts" element={<PayoutsPage />} />

        {/* Marketing */}
        <Route path="marketing/ads" element={<AdListingPage />} />
        <Route path="marketing/push-in-app" element={<PremiumPushPage />} />
        <Route path="marketing/announcements" element={<PlaceholderPage title="Announcements" />} />
        <Route path="marketing/segments" element={<PlaceholderPage title="Segments & Campaigns" />} />
        <Route path="marketing/referrals" element={<PlaceholderPage title="Referrals" />} />

        {/* Support */}
        <Route path="support/tickets" element={<PlaceholderPage title="Support Tickets" />} />
        <Route path="support/disputes" element={<PlaceholderPage title="Disputes" />} />


        {/* Analytics */}
        <Route path="analytics" element={<AnalyticsPage />} />

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
            <LocationProvider>
              <AppRoutes />
            </LocationProvider>
          </AuthProvider>
        </BrowserRouter>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default App;
