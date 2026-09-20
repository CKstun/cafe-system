import React from 'react';
import { CafeProvider, useCafe } from './context/CafeContext';
import { HeaderNav } from './components/common/HeaderNav';
import { CustomerApp } from './components/customer/CustomerApp';
import { StaffDashboard } from './components/staff/StaffDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LaravelCodeViewer } from './components/laravel/LaravelCodeViewer';
import { QrCodeModal } from './components/common/QrCodeModal';
import { SpatieUnauthorizedModal } from './components/common/SpatieUnauthorizedModal';
import { EchoOrderToast } from './components/common/EchoOrderToast';

const AppContent: React.FC = () => {
  const { viewMode } = useCafe();

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2B231F] flex flex-col font-sans selection:bg-[#5C4033] selection:text-[#FDFBF7]">
      <HeaderNav />

      {/* Real-Time Echo Notifications & Spatie RBAC Interceptor */}
      <EchoOrderToast />
      <SpatieUnauthorizedModal />

      <main className="flex-1">
        {viewMode === 'customer' && <CustomerApp />}
        {viewMode === 'staff' && <StaffDashboard />}
        {viewMode === 'admin' && <AdminDashboard />}
        {viewMode === 'codebase' && <LaravelCodeViewer />}
        {viewMode === 'qr_tables' && <QrCodeModal />}
      </main>
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
