import React from 'react';
import { CafeProvider, useCafe } from './context/CafeContext';
import { CustomerApp } from './components/customer/CustomerApp';
import { StaffDashboard } from './components/staff/StaffDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { UnifiedLogin } from './components/auth/UnifiedLogin';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LaravelCodeViewer } from './components/laravel/LaravelCodeViewer';
import { QrCodeModal } from './components/common/QrCodeModal';
import { EchoOrderToast } from './components/common/EchoOrderToast';
import { DevRouteSwitcher } from './components/common/DevRouteSwitcher';

const AppContent: React.FC = () => {
  const { currentPath } = useCafe();

  const renderRoute = () => {
    // ============================================================
    // EMPLOYEE LOGIN
    // ============================================================

    if (
      currentPath === '/login' ||
      currentPath === '/staff/login' ||
      currentPath === '/admin/login'
    ) {
      return <UnifiedLogin />;
    }

    // ============================================================
    // STAFF ROUTES
    // Requires cp_staff_session only.
    // ============================================================

    if (currentPath.startsWith('/staff')) {
      return (
        <ProtectedRoute sessionType="staff">
          <StaffDashboard />
        </ProtectedRoute>
      );
    }

    // ============================================================
    // ADMIN ROUTES
    // Requires cp_admin_session only.
    // ============================================================

    if (currentPath.startsWith('/admin')) {
      return (
        <ProtectedRoute sessionType="admin">
          <AdminDashboard />
        </ProtectedRoute>
      );
    }

    // ============================================================
    // CODEBASE
    // ============================================================

    if (currentPath === '/codebase') {
      return <LaravelCodeViewer />;
    }

    // ============================================================
    // QR TABLES
    // ============================================================

    if (currentPath === '/qr-tables') {
      return <QrCodeModal />;
    }

    // ============================================================
    // CUSTOMER
    // Public customer experience
    // ============================================================

    return <CustomerApp />;
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2B231F] flex flex-col font-sans selection:bg-[#4A2E19] selection:text-[#FDFBF7]">
      {/* Real-Time Echo Notifications */}
      <EchoOrderToast />

      <main className="flex-1">
        {renderRoute()}
      </main>

      {/* Developer Route Inspector */}
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