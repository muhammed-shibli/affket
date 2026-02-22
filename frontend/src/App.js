import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Affiliate Pages
import AffiliateLayout from './components/layouts/AffiliateLayout';
import AffiliateDashboard from './pages/affiliate/Dashboard';
import ClicksReport from './pages/affiliate/ClicksReport';
import ConversionsReport from './pages/affiliate/ConversionsReport';
import BrowseOffers from './pages/affiliate/BrowseOffers';
import ApprovedOffers from './pages/affiliate/ApprovedOffers';
import OfferDetails from './pages/affiliate/OfferDetails';
import Postbacks from './pages/affiliate/Postbacks';
import Wallet from './pages/affiliate/Wallet';
import Profile from './pages/affiliate/Profile';
import CustomCampaign from './pages/affiliate/CustomCampaign';

// Admin Pages
import AdminLayout from './components/layouts/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminOffers from './pages/admin/Offers';
import AdminOfferForm from './pages/admin/OfferForm';
import AdminUsers from './pages/admin/Users';
import AdminUserDetails from './pages/admin/UserDetails';
import AdminWithdrawals from './pages/admin/Withdrawals';
import AdminGateways from './pages/admin/Gateways';
import AdminApplications from './pages/admin/Applications';

// Loading Component
const LoadingScreen = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f9fafb'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 40,
        height: 40,
        border: '3px solid #e5e7eb',
        borderTopColor: '#232323',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 16px'
      }} />
      <p style={{ color: '#6b7280' }}>Loading...</p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (!adminOnly && user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

      {/* Affiliate Routes */}
      <Route path="/" element={<ProtectedRoute><AffiliateLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<AffiliateDashboard />} />
        <Route path="reports/clicks" element={<ClicksReport />} />
        <Route path="reports/conversions" element={<ConversionsReport />} />
        <Route path="offers/browse" element={<BrowseOffers />} />
        <Route path="offers/approved" element={<ApprovedOffers />} />
        <Route path="offers/:id" element={<OfferDetails />} />
        <Route path="postbacks" element={<Postbacks />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="profile" element={<Profile />} />
        <Route path="custom-campaign" element={<CustomCampaign />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="offers" element={<AdminOffers />} />
        <Route path="offers/new" element={<AdminOfferForm />} />
        <Route path="offers/:id/edit" element={<AdminOfferForm />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="users/:id" element={<AdminUserDetails />} />
        <Route path="applications" element={<AdminApplications />} />
        <Route path="withdrawals" element={<AdminWithdrawals />} />
        <Route path="gateways" element={<AdminGateways />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
