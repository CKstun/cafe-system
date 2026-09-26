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

  if (sessionType === 'staff') {
    /*
     * Staff routes require a staff session.
     *
     * If an admin session is active instead, deny access.
     * This prevents an admin session from automatically becoming
     * a staff session.
     */
    if (!hasStaffSession || hasAdminSession) {
      navigate('/staff/login', { force: true });

      return null;
    }

    return <>{children}</>;
  }

  // ============================================================
  // ADMIN ROUTE
  // ============================================================

  if (sessionType === 'admin') {
    /*
     * Admin routes require an admin session.
     *
     * If a staff session is active instead, deny access.
     * This prevents a staff session from accessing admin routes.
     */
    if (!hasAdminSession || hasStaffSession) {
      navigate('/admin/login', { force: true });

      return null;
    }

    return <>{children}</>;
  }

  // ============================================================
  // FAIL CLOSED
  // ============================================================

  return null;
};