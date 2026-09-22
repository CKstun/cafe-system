import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import {
  Compass,
  ChevronUp,
  ChevronDown,
  Coffee,
  ShieldCheck,
  ChefHat,
  Code2,
  QrCode,
  CheckCircle,
  XCircle,
  TrendingUp,
} from 'lucide-react';

export const DevRouteSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    currentPath,
    navigate,
    staffSession,
    adminSession,
    logoutStaff,
    logoutAdmin,
  } = useCafe();

  const isStaffAuthed = Boolean(staffSession?.token);
  const isAdminAuthed = Boolean(adminSession?.token);

  return (
    <div className="fixed bottom-4 right-4 z-50 select-none print:hidden">
      {/* Expanded Menu */}
      {isOpen && (
        <div className="mb-2 bg-stone-900/95 backdrop-blur-md border border-stone-700/80 rounded-2xl shadow-2xl p-4 w-72 text-stone-100 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-stone-300">
                Route Inspector
              </span>
            </div>
            <span className="text-[10px] font-mono bg-stone-800 px-2 py-0.5 rounded text-amber-300 truncate max-w-[130px]">
              {currentPath}
            </span>
          </div>

          {/* Session Status Badges */}
          <div className="space-y-1.5 text-[11px] bg-stone-950/70 p-2.5 rounded-xl border border-stone-800/80">
            <div className="flex items-center justify-between">
              <span className="text-stone-400">Staff Session:</span>
              {isStaffAuthed ? (
                <span className="flex items-center gap-1 text-emerald-400 font-mono text-[10px]">
                  <CheckCircle className="w-3 h-3" /> role:staff
                </span>
              ) : (
                <span className="flex items-center gap-1 text-stone-500 font-mono text-[10px]">
                  <XCircle className="w-3 h-3" /> unauthenticated
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-400">Admin Session:</span>
              {isAdminAuthed ? (
                <span className="flex items-center gap-1 text-rose-400 font-mono text-[10px]">
                  <CheckCircle className="w-3 h-3" /> role:admin
                </span>
              ) : (
                <span className="flex items-center gap-1 text-stone-500 font-mono text-[10px]">
                  <XCircle className="w-3 h-3" /> unauthenticated
                </span>
              )}
            </div>
          </div>

          {/* Quick Route Links */}
          <div className="space-y-1 text-xs">
            <div className="text-[10px] uppercase font-bold text-stone-400 px-1 pt-1">
              Public Customer
            </div>
            <button
              id="dev-nav-welcome"
              onClick={() => {
                navigate('/welcome');
                setIsOpen(false);
              }}
              className={`w-full min-h-[36px] flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                currentPath === '/' || currentPath === '/welcome'
                  ? 'bg-amber-500/20 text-amber-300 font-medium'
                  : 'hover:bg-stone-800 text-stone-300'
              }`}
            >
              <Coffee className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>/welcome (Landing)</span>
            </button>
            <button
              id="dev-nav-menu"
              onClick={() => {
                navigate('/menu');
                setIsOpen(false);
              }}
              className={`w-full min-h-[36px] flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                currentPath === '/menu'
                  ? 'bg-amber-500/20 text-amber-300 font-medium'
                  : 'hover:bg-stone-800 text-stone-300'
              }`}
            >
              <Coffee className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>/menu (Catalog)</span>
            </button>

            <div className="text-[10px] uppercase font-bold text-stone-400 px-1 pt-2">
              Employee Authentication
            </div>
            <button
              id="dev-nav-unified-login"
              onClick={() => {
                navigate('/login');
                setIsOpen(false);
              }}
              className={`w-full min-h-[36px] flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                currentPath === '/login' || currentPath === '/staff/login' || currentPath === '/admin/login'
                  ? 'bg-amber-500/20 text-amber-300 font-medium'
                  : 'hover:bg-stone-800 text-stone-300'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>/login (Unified Employee)</span>
            </button>

            <div className="text-[10px] uppercase font-bold text-stone-400 px-1 pt-2">
              Staff Portal
            </div>
            <button
              id="dev-nav-staff-dash"
              onClick={() => {
                navigate('/staff/orders');
                setIsOpen(false);
              }}
              className={`w-full min-h-[36px] flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                currentPath.startsWith('/staff')
                  ? 'bg-amber-500/20 text-amber-300 font-medium'
                  : 'hover:bg-stone-800 text-stone-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <ChefHat className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span>/staff/orders (POS/KDS)</span>
              </span>
              {isStaffAuthed ? (
                <span className="text-[10px] text-emerald-400">Authed</span>
              ) : (
                <span className="text-[10px] text-stone-500">Guard</span>
              )}
            </button>

            <div className="text-[10px] uppercase font-bold text-stone-400 px-1 pt-2">
              Admin Portal
            </div>
            <button
              id="dev-nav-admin-login"
              onClick={() => {
                navigate('/admin/login');
                setIsOpen(false);
              }}
              className={`w-full min-h-[36px] flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                currentPath === '/admin/login'
                  ? 'bg-rose-500/20 text-rose-300 font-medium'
                  : 'hover:bg-stone-800 text-stone-300'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>/admin/login</span>
            </button>
            <button
              id="dev-nav-admin-dash"
              onClick={() => {
                navigate('/admin/dashboard');
                setIsOpen(false);
              }}
              className={`w-full min-h-[36px] flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                currentPath === '/admin/dashboard'
                  ? 'bg-rose-500/20 text-rose-300 font-medium'
                  : 'hover:bg-stone-800 text-stone-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>/admin/dashboard</span>
              </span>
              {isAdminAuthed ? (
                <span className="text-[10px] text-emerald-400">Authed</span>
              ) : (
                <span className="text-[10px] text-stone-500">Guard</span>
              )}
            </button>
            <button
              id="dev-nav-admin-reports"
              onClick={() => {
                navigate('/admin/reports');
                setIsOpen(false);
              }}
              className={`w-full min-h-[36px] flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                currentPath === '/admin/reports'
                  ? 'bg-rose-500/20 text-rose-300 font-medium'
                  : 'hover:bg-stone-800 text-stone-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>/admin/reports</span>
              </span>
              {isAdminAuthed ? (
                <span className="text-[10px] text-emerald-400">Authed</span>
              ) : (
                <span className="text-[10px] text-stone-500">Guard</span>
              )}
            </button>

            <div className="text-[10px] uppercase font-bold text-stone-400 px-1 pt-2">
              Architecture & QR
            </div>
            <button
              id="dev-nav-codebase"
              onClick={() => {
                navigate('/codebase');
                setIsOpen(false);
              }}
              className={`w-full min-h-[36px] flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                currentPath === '/codebase'
                  ? 'bg-sky-500/20 text-sky-300 font-medium'
                  : 'hover:bg-stone-800 text-stone-300'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>/codebase (Laravel 13)</span>
            </button>
            <button
              id="dev-nav-qr"
              onClick={() => {
                navigate('/qr-tables');
                setIsOpen(false);
              }}
              className={`w-full min-h-[36px] flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                currentPath === '/qr-tables'
                  ? 'bg-amber-500/20 text-amber-300 font-medium'
                  : 'hover:bg-stone-800 text-stone-300'
              }`}
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>/qr-tables (Standees)</span>
            </button>
          </div>

          {/* Quick Logout Actions */}
          {(isStaffAuthed || isAdminAuthed) && (
            <div className="pt-2 border-t border-stone-800 flex gap-2">
              {isStaffAuthed && (
                <button
                  id="dev-quick-logout-staff"
                  onClick={() => logoutStaff()}
                  className="flex-1 py-1 px-2 text-[10px] font-medium bg-stone-800 hover:bg-stone-700 text-stone-300 rounded transition-colors"
                >
                  Logout Staff
                </button>
              )}
              {isAdminAuthed && (
                <button
                  id="dev-quick-logout-admin"
                  onClick={() => logoutAdmin()}
                  className="flex-1 py-1 px-2 text-[10px] font-medium bg-rose-950 hover:bg-rose-900 text-rose-300 rounded transition-colors"
                >
                  Logout Admin
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Toggle Button */}
      <button
        id="dev-route-switcher-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Route Inspector"
        className="min-h-[44px] min-w-[44px] px-3 py-2 bg-stone-900/90 hover:bg-stone-850 text-stone-200 border border-stone-700/80 rounded-full shadow-lg flex items-center gap-2 text-xs font-semibold backdrop-blur-sm cursor-pointer transition-all hover:scale-105 active:scale-95"
      >
        <Compass className="w-4 h-4 text-amber-400" />
        <span className="hidden sm:inline">Routes</span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};
