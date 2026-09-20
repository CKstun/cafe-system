import React, { useEffect } from 'react';
import { useCafe } from '../../context/CafeContext';
import { ShieldAlert, LogIn, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  role: 'staff' | 'admin';
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ role, children }) => {
  const { staffSession, adminSession, navigate, setAuthRedirectNotice } = useCafe();

  const isStaffAuthenticated = Boolean(
    staffSession && staffSession.abilities && staffSession.abilities.includes('role:staff')
  );

  const isAdminAuthenticated = Boolean(
    adminSession && adminSession.abilities && adminSession.abilities.includes('role:admin')
  );

  const isAuthorized = role === 'staff' ? isStaffAuthenticated : isAdminAuthenticated;
  const redirectTarget = role === 'staff' ? '/staff/login' : '/admin/login';

  useEffect(() => {
    if (!isAuthorized) {
      setAuthRedirectNotice(
        role === 'admin'
          ? 'Administrator privileges required. Please authenticate via the Owner Portal.'
          : 'Staff credentials required. Please authenticate via the Barista / KDS Terminal.'
      );
    }
  }, [isAuthorized, role, setAuthRedirectNotice]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
        <div className="bg-stone-850 border border-stone-700/80 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-stone-100">
              {role === 'admin' ? 'Restricted Admin Access' : 'Restricted Staff Portal'}
            </h2>
            <p className="text-sm text-stone-400 leading-relaxed">
              Active Laravel Sanctum token with ability <code className="text-amber-400 font-mono bg-stone-800 px-1.5 py-0.5 rounded text-xs">{`role:${role}`}</code> is required to view this interface.
            </p>
          </div>

          <div className="p-3 bg-red-950/40 border border-red-800/40 rounded-xl flex items-center gap-3 text-left">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-xs text-red-300">
              HTTP 403 Forbidden: Unauthenticated session. Redirecting to dedicated login...
            </p>
          </div>

          <button
            id="protected-route-redirect-btn"
            onClick={() => navigate(redirectTarget)}
            className="w-full min-h-[44px] py-2.5 px-4 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-stone-950 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors text-sm shadow-md"
          >
            <LogIn className="w-4 h-4" />
            Proceed to {role === 'admin' ? 'Admin Login' : 'Staff Login'}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
