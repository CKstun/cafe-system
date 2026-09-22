import React from 'react';
import { CafeProvider, useCafe } from './context/CafeContext';
import { CustomerApp } from './components/customer/CustomerApp';
import { StaffDashboard } from './components/staff/StaffDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { UnifiedLogin } from './components/auth/UnifiedLogin';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LaravelCodeViewer } from './components/laravel/LaravelCodeViewer';
import { QrCodeModal } from './components/common/QrCodeModal';
import { SpatieUnauthorizedModal } from './components/common/SpatieUnauthorizedModal';
import { EchoOrderToast } from './components/common/EchoOrderToast';
import { DevRouteSwitcher } from './components/common/DevRouteSwitcher';

const AppContent: React.FC = () => {
  const { currentPath } = useCafe();

  const renderRoute = () => {
    // 1. Unified Employee Authentication (/login, /staff/login, /admin/login)
    if (currentPath === '/login' || currentPath === '/staff/login' || currentPath === '/admin/login') {
      return <UnifiedLogin />;
    }

    // 2. Staff Protected Routes (/staff/*, /staff/orders, /staff/dashboard)
    if (currentPath.startsWith('/staff')) {
      return (
        <ProtectedRoute allowedRoles={['staff', 'admin']}>
          <StaffDashboard />
        </ProtectedRoute>
      );
    }

    // 3. Admin Protected Routes (/admin/*, /admin/dashboard, /admin/users)
    if (currentPath.startsWith('/admin')) {
      return (
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      );
    }

    // 4. Architecture & Physical QR Standees
    if (currentPath === '/codebase') {
      return <LaravelCodeViewer />;
    }
    if (currentPath === '/qr-tables') {
      return <QrCodeModal />;
    }

    // 5. Public Customer Experience (/welcome, /menu, /cart, /checkout, /order-status)
    return <CustomerApp />;
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2B231F] flex flex-col font-sans selection:bg-[#4A2E19] selection:text-[#FDFBF7]">
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
