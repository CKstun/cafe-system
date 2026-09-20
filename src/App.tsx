import React from 'react';
import { CafeProvider, useCafe } from './context/CafeContext';
import { CustomerApp } from './components/customer/CustomerApp';
import { StaffDashboard } from './components/staff/StaffDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StaffLogin } from './components/auth/StaffLogin';
import { AdminLogin } from './components/auth/AdminLogin';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LaravelCodeViewer } from './components/laravel/LaravelCodeViewer';
import { QrCodeModal } from './components/common/QrCodeModal';
import { SpatieUnauthorizedModal } from './components/common/SpatieUnauthorizedModal';
import { EchoOrderToast } from './components/common/EchoOrderToast';
import { DevRouteSwitcher } from './components/common/DevRouteSwitcher';

const AppContent: React.FC = () => {
  const { currentPath } = useCafe();

  const renderRoute = () => {
    // 1. Staff Authentication
    if (currentPath === '/staff/login') {
      return <StaffLogin />;
    }

    // 2. Staff Protected Routes
    if (currentPath.startsWith('/staff')) {
      return (
        <ProtectedRoute role="staff">
          <StaffDashboard />
        </ProtectedRoute>
      );
    }

    // 3. Admin Authentication
    if (currentPath === '/admin/login') {
      return <AdminLogin />;
    }

    // 4. Admin Protected Routes
    if (currentPath.startsWith('/admin')) {
      return (
        <ProtectedRoute role="admin">
          <AdminDashboard />
        </ProtectedRoute>
      );
    }

    // 5. Architecture & Physical QR Standees
    if (currentPath === '/codebase') {
      return <LaravelCodeViewer />;
    }
    if (currentPath === '/qr-tables') {
      return <QrCodeModal />;
    }

    // 6. Public Customer Experience (/welcome, /menu, /cart, /checkout, /order-status)
    return <CustomerApp />;
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2B231F] flex flex-col font-sans selection:bg-[#5C4033] selection:text-[#FDFBF7]">
      {/* Real-Time Echo Notifications & Spatie RBAC Interceptor */}
      <EchoOrderToast />
      <SpatieUnauthorizedModal />

      <main className="flex-1">
        {renderRoute()}
      </main>

      {/* Discreet Developer Route Inspector for testing */}
      <DevRouteSwitcher />
    </div>
  );
};

export default function App() {
  return (
    <CafeProvider>
      <AppContent />
    </CafeProvider>
  );
}
