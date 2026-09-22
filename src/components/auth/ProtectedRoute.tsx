import React, { useEffect } from 'react';
import { useCafe } from '../../context/CafeContext';

interface ProtectedRouteProps {
  role?: 'staff' | 'admin';
  allowedRoles?: ('staff' | 'admin')[];
  children: React.ReactNode;
}

/**
 * Single unified Route Guard enforcing Sanctum authentication and role permissions.
 * - Intercepts unauthenticated users attempting /admin/* or /staff/* and routes them to /login
 * - Intercepts staff users attempting to access /admin/* and redirects to /staff/orders
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ role, allowedRoles, children }) => {
  const { currentAuthSession, staffSession, adminSession, navigate, setAuthRedirectNotice } = useCafe();

  // Normalize allowed roles
  const validRoles = allowedRoles || (role ? [role] : ['staff', 'admin']);

  const activeUser = currentAuthSession?.user;
  const userRole = activeUser?.role || (adminSession ? 'admin' : staffSession ? 'staff' : null);
  const isAuthenticated = Boolean(currentAuthSession?.token || adminSession?.token || staffSession?.token);

  useEffect(() => {
    if (!isAuthenticated) {
      setAuthRedirectNotice('Authentication required. Please sign in with your employee credentials.');
      navigate('/login');
      return;
    }

    // Role check: If employee is logged in as staff but attempts admin route, bounce to /staff/orders
    if (userRole === 'staff' && !validRoles.includes('staff')) {
      setAuthRedirectNotice('Access restricted: Administrator role required.');
      navigate('/staff/orders');
    }
  }, [isAuthenticated, userRole, validRoles, navigate, setAuthRedirectNotice]);

  // If unauthenticated, render minimal redirecting indicator
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#4A2E19] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If staff tries to access admin routes, prevent rendering
  if (userRole === 'staff' && !validRoles.includes('staff')) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#4A2E19] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
};
