import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'sonner';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Courier Pages
import CourierDashboard from './pages/courier/CourierDashboard';
import CourierOrderDetail from './pages/courier/CourierOrderDetail';
import CourierHistory from './pages/courier/CourierHistory';
import CourierEarnings from './pages/courier/CourierEarnings';

// Restaurant Pages
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard';
import RestaurantOrders from './pages/restaurant/RestaurantOrders';
import RestaurantNewOrder from './pages/restaurant/RestaurantNewOrder';
import RestaurantAnalytics from './pages/restaurant/RestaurantAnalytics';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCouriers from './pages/admin/AdminCouriers';
import AdminRestaurants from './pages/admin/AdminRestaurants';
import AdminAnalytics from './pages/admin/AdminAnalytics';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    switch (user.role) {
      case 'courier':
        return <Navigate to="/courier/dashboard" replace />;
      case 'restaurant':
        return <Navigate to="/restaurant/dashboard" replace />;
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/courier/dashboard" element={<ProtectedRoute allowedRoles={['courier']}><CourierDashboard /></ProtectedRoute>} />
      <Route path="/courier/orders/:orderId" element={<ProtectedRoute allowedRoles={['courier']}><CourierOrderDetail /></ProtectedRoute>} />
      <Route path="/courier/history" element={<ProtectedRoute allowedRoles={['courier']}><CourierHistory /></ProtectedRoute>} />
      <Route path="/courier/earnings" element={<ProtectedRoute allowedRoles={['courier']}><CourierEarnings /></ProtectedRoute>} />

      <Route path="/restaurant/dashboard" element={<ProtectedRoute allowedRoles={['restaurant']}><RestaurantDashboard /></ProtectedRoute>} />
      <Route path="/restaurant/orders" element={<ProtectedRoute allowedRoles={['restaurant']}><RestaurantOrders /></ProtectedRoute>} />
      <Route path="/restaurant/orders/new" element={<ProtectedRoute allowedRoles={['restaurant']}><RestaurantNewOrder /></ProtectedRoute>} />
      <Route path="/restaurant/analytics" element={<ProtectedRoute allowedRoles={['restaurant']}><RestaurantAnalytics /></ProtectedRoute>} />

      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={['admin']}><AdminOrders /></ProtectedRoute>} />
      <Route path="/admin/couriers" element={<ProtectedRoute allowedRoles={['admin']}><AdminCouriers /></ProtectedRoute>} />
      <Route path="/admin/restaurants" element={<ProtectedRoute allowedRoles={['admin']}><AdminRestaurants /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalytics /></ProtectedRoute>} />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-center" richColors closeButton />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
