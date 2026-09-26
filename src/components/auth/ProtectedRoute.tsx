import React from 'react';
import { useCafe } from '../../context/CafeContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  sessionType: 'staff' | 'admin';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  sessionType,
}) => {
  const {
    staffSession,
    adminSession,
    navigate,
  } = useCafe();

  const hasStaffSession = Boolean(staffSession);
  const hasAdminSession = Boolean(adminSession);

  // ============================================================
  // STAFF ROUTE
  // ============================================================

  React.useEffect(() => {
    if (sessionType === 'staff') {
      if (!hasStaffSession || hasAdminSession) {
        navigate('/staff/login', { force: true });
      }
    } else if (sessionType === 'admin') {
      if (!hasAdminSession || hasStaffSession) {
        navigate('/admin/login', { force: true });
      }
    }
  }, [sessionType, hasStaffSession, hasAdminSession, navigate]);

  if (sessionType === 'staff') {
    if (!hasStaffSession || hasAdminSession) {
      return null;
    }
    return <>{children}</>;
  }

  if (sessionType === 'admin') {
    if (!hasAdminSession || hasStaffSession) {
      return null;
    }
    return <>{children}</>;
  }

  // ============================================================
  // FAIL CLOSED
  // ============================================================

  return null;
};