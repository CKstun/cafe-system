import React from 'react';
import { useCafe } from '../../context/CafeContext';
import { ShieldAlert, KeyRound, ArrowRight, X, Terminal, CheckCircle2 } from 'lucide-react';
import { Role } from '../../types/cafe';

export const SpatieUnauthorizedModal: React.FC = () => {
  const {
    unauthorizedModal,
    closeUnauthorizedModal,
    currentUserRole,
    setCurrentUserRole,
    setViewMode,
  } = useCafe();

  if (!unauthorizedModal?.isOpen) return null;

  const handleSwitchAndProceed = (newRole: Role) => {
    setCurrentUserRole(newRole);
    closeUnauthorizedModal();
    if (newRole === 'staff') {
      setViewMode('staff');
    } else if (newRole === 'admin') {
      setViewMode('admin');
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FAF7F2] border border-[#E8DFD5] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Bar */}
        <div className="bg-[#2B231F] text-[#FDFBF7] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#E07A5F]" />
            <span className="font-mono text-xs font-semibold tracking-wide text-[#E07A5F]">
              403 FORBIDDEN • Spatie Role Middleware
            </span>
          </div>
          <button
            onClick={closeUnauthorizedModal}
            className="text-[#A6978A] hover:text-[#FDFBF7] transition p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-display text-lg font-bold text-[#2B231F]">
              Access Denied by Spatie Permission Middleware
            </h3>
            <p className="text-xs text-[#8C7A6B] mt-1 leading-relaxed">
              The requested route{' '}
              <code className="px-1.5 py-0.5 bg-[#EFE8DE] rounded text-[#5C4033] font-mono text-[11px]">
                {unauthorizedModal.attemptedView}
              </code>{' '}
              is protected by Laravel route middleware. Your current active session does not possess the required Spatie role or capability.
            </p>
          </div>

          {/* Diagnostic Inspection Box */}
          <div className="bg-[#F2ECE4] border border-[#E3D7C9] rounded-xl p-3.5 font-mono text-xs space-y-2 text-[#3D332D]">
            <div className="flex items-center justify-between">
              <span className="text-[#8C7A6B] text-[11px]">Exception:</span>
              <span className="text-[#C84B31] font-semibold text-[11px]">UnauthorizedException</span>
            </div>
            <div className="flex items-center justify-between border-t border-[#E3D7C9]/60 pt-1.5">
              <span className="text-[#8C7A6B] text-[11px]">Current User Role:</span>
              <span className="font-bold text-[#2B231F] capitalize bg-[#E5DCD1] px-2 py-0.5 rounded text-[11px]">
                {currentUserRole}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-[#E3D7C9]/60 pt-1.5">
              <span className="text-[#8C7A6B] text-[11px]">Required Spatie Role:</span>
              <span className="font-bold text-[#5C4033] text-[11px]">
                {unauthorizedModal.requiredRole || 'admin'}
              </span>
            </div>
            {unauthorizedModal.requiredPermission && (
              <div className="flex items-center justify-between border-t border-[#E3D7C9]/60 pt-1.5">
                <span className="text-[#8C7A6B] text-[11px]">Required Permission:</span>
                <span className="text-[#6D5447] text-[11px] font-semibold">
                  {unauthorizedModal.requiredPermission}
                </span>
              </div>
            )}
          </div>

          {/* Laravel Middleware Syntax Preview */}
          <div className="bg-[#1F1A17] text-[#D4C5B9] p-3 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto">
            <div className="flex items-center gap-1.5 text-[#8C7A6B] mb-1">
              <Terminal className="w-3.5 h-3.5" />
              <span>routes/web.php (Enforced)</span>
            </div>
            <span className="text-[#98C379]">Route</span>::
            <span className="text-[#61AFEF]">middleware</span>([
            <span className="text-[#E5C07B]">'auth'</span>,{' '}
            <span className="text-[#E5C07B]">'role:{unauthorizedModal.requiredRole?.replace(/'/g, '') || 'admin'}'</span>
            ])-&gt;<span className="text-[#61AFEF]">group</span>(function () &#123; ... &#125;);
          </div>

          {/* Role Elevation Quick Actions */}
          <div className="pt-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5C4033] mb-2">
              Elevate Role to Test Access:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSwitchAndProceed('staff')}
                className="flex items-center justify-between p-2.5 rounded-xl border border-[#D9CDC1] bg-[#FDFBF7] hover:bg-[#EFE8DE] transition text-left"
              >
                <div>
                  <div className="text-xs font-bold text-[#2B231F]">Switch to Staff</div>
                  <div className="text-[10px] text-[#8C7A6B]">Barista / KDS role</div>
                </div>
                <KeyRound className="w-3.5 h-3.5 text-[#5C4033]" />
              </button>

              <button
                type="button"
                onClick={() => handleSwitchAndProceed('admin')}
                className="flex items-center justify-between p-2.5 rounded-xl border border-[#5C4033] bg-[#5C4033] text-[#FDFBF7] hover:bg-[#4A3328] transition text-left shadow-xs"
              >
                <div>
                  <div className="text-xs font-bold text-[#FDFBF7]">Switch to Admin</div>
                  <div className="text-[10px] text-[#D4C5B9]">Full administrative rights</div>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4C5B9]" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#EFE8DE] px-6 py-3 border-t border-[#E3D7C9] flex items-center justify-between">
          <button
            onClick={() => {
              closeUnauthorizedModal();
              setViewMode('codebase');
            }}
            className="text-xs text-[#5C4033] font-semibold hover:underline flex items-center gap-1"
          >
            <span>View Spatie Architecture Code</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={closeUnauthorizedModal}
            className="px-4 py-1.5 rounded-lg bg-[#D9CDC1] text-[#2B231F] hover:bg-[#C9BCB0] text-xs font-semibold transition"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
