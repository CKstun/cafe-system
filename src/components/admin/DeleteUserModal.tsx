import React from 'react';
import { User } from '../../types/cafe';
import { AlertTriangle, Trash2, X, ShieldAlert } from 'lucide-react';

export interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userId: number) => Promise<void> | void;
  user: User | null;
  currentAdminId?: number;
  isDeleting?: boolean;
}

export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  user,
  currentAdminId,
  isDeleting = false,
}) => {
  if (!isOpen || !user) return null;

  const isSelfAccount = currentAdminId !== undefined && currentAdminId === user.id;

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#FDFBF7] rounded-3xl border border-[#2C1D11]/15 shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-150 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Warning Icon */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 shadow-2xs">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-[#2C1D11] tracking-tight">
                Delete Account?
              </h3>
              <p className="text-xs text-[#8C7A6B]">
                Permanent credential & account deletion
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-[#2C1D11] hover:bg-[#4A2E19]/10 rounded-xl transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Self-Account Guard */}
        {isSelfAccount ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-red-800 font-bold text-xs">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>Self-Deletion Prevented by Security Policy</span>
            </div>
            <p className="text-xs text-red-700 leading-relaxed">
              You are currently logged in as <strong>{user.name}</strong>. The system protects administrator integrity by preventing self-deletion of active accounts.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-[#2C1D11] leading-relaxed">
              Are you sure you want to delete the account for{' '}
              <strong className="text-red-700 font-bold">{user.name}</strong> ({user.email})?
              This action cannot be undone.
            </p>
            <div className="p-3.5 bg-white border border-[#2C1D11]/10 rounded-2xl text-xs space-y-1">
              <div className="flex justify-between text-stone-600">
                <span>Account Role:</span>
                <span className="font-bold text-[#2C1D11] capitalize">{user.role}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Active Status:</span>
                <span className={`font-bold ${user.is_active !== false ? 'text-emerald-700' : 'text-stone-500'}`}>
                  {user.is_active !== false ? 'Active' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Sanctum Tokens:</span>
                <span className="font-bold text-red-600">Will be permanently revoked</span>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#2C1D11]/10">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 text-xs font-bold text-[#8C7A6B] hover:text-[#2C1D11] hover:bg-[#4A2E19]/5 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>

          {!isSelfAccount && (
            <button
              type="button"
              onClick={() => onConfirm(user.id)}
              disabled={isDeleting}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-2 disabled:opacity-40"
            >
              {isDeleting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Yes, Delete Account</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;
