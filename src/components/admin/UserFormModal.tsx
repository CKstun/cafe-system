import React, { useState, useEffect, useMemo } from 'react';
import { User, Role } from '../../types/cafe';
import {
  X,
  User as UserIcon,
  Mail,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from 'lucide-react';

export interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    id?: number;
    name: string;
    email: string;
    role: Role;
    password?: string;
  }) => Promise<{ success: boolean; error?: string } | void>;
  userToEdit?: User | null;
  currentAdminId?: number;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  userToEdit,
  currentAdminId,
}) => {
  const isEditing = Boolean(userToEdit);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('staff');

  // Password fields
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [enablePasswordReset, setEnablePasswordReset] = useState(false);

  // Status feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate or reset form whenever modal opens or userToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (userToEdit) {
        setName(userToEdit.name || '');
        setEmail(userToEdit.email || '');
        setRole(userToEdit.role || 'staff');
        setPassword('');
        setConfirmPassword('');
        setEnablePasswordReset(false);
      } else {
        setName('');
        setEmail('');
        setRole('staff');
        setPassword('');
        setConfirmPassword('');
        setEnablePasswordReset(true);
      }
      setErrorMessage(null);
      setIsSubmitting(false);
    }
  }, [isOpen, userToEdit]);

  // Validation Logic
  const validation = useMemo(() => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

    if (!trimmedName) {
      return { isValid: false, reason: 'Full name is required.' };
    }
    if (!isEmailValid) {
      return { isValid: false, reason: 'A valid email address is required.' };
    }

    if (!isEditing) {
      // Create mode: password is required, min 8 chars
      if (!password) {
        return { isValid: false, reason: 'Initial password is required.' };
      }
      if (password.length < 8) {
        return { isValid: false, reason: 'Password must be at least 8 characters long.' };
      }
      if (password !== confirmPassword) {
        return { isValid: false, reason: 'Password and confirmation do not match.' };
      }
    } else {
      // Edit mode: password is optional. If enabled and typed, enforce rules
      if (enablePasswordReset || password.length > 0) {
        if (password.length < 8) {
          return { isValid: false, reason: 'New password must be at least 8 characters long.' };
        }
        if (password !== confirmPassword) {
          return { isValid: false, reason: 'New password and confirmation do not match.' };
        }
      }
    }

    return { isValid: true, reason: null };
  }, [name, email, isEditing, password, confirmPassword, enablePasswordReset]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.isValid || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload: {
        id?: number;
        name: string;
        email: string;
        role: Role;
        password?: string;
      } = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
      };

      if (isEditing && userToEdit) {
        payload.id = userToEdit.id;
        if ((enablePasswordReset || password.length > 0) && password.length >= 8) {
          payload.password = password;
        }
      } else {
        payload.password = password;
      }

      const result = await onSubmit(payload);
      if (result && result.error) {
        setErrorMessage(result.error);
        setIsSubmitting(false);
      } else {
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const isSelfAccount = isEditing && userToEdit && currentAdminId === userToEdit.id;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#FDFBF7] rounded-3xl border border-[#2C1D11]/15 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Modal Header */}
        <div className="bg-white px-6 py-5 border-b border-[#2C1D11]/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4A2E19]/10 text-[#4A2E19] flex items-center justify-center">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-[#2C1D11] tracking-tight">
                {isEditing ? 'Edit User Account' : 'Register New User Account'}
              </h3>
              <p className="text-xs text-[#8C7A6B]">
                {isEditing
                  ? `Update credentials & permissions for ${userToEdit?.name}`
                  : 'Add a new Barista or Manager with Laravel Sanctum credentials'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-[#2C1D11] hover:bg-[#4A2E19]/10 rounded-xl transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Self Edit Notice */}
          {isSelfAccount && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
              <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Authenticated Admin:</strong> You are editing your currently active session account.
              </span>
            </div>
          )}

          {/* Field: Name */}
          <div>
            <label className="block text-xs font-bold text-[#2C1D11] uppercase tracking-wider mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-[#8C7A6B] absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Cheska Kimberly"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#2C1D11]/15 rounded-2xl text-xs text-[#2B231F] placeholder:text-[#8C7A6B]/50 focus:outline-none focus:ring-2 focus:ring-[#4A2E19] font-medium"
              />
            </div>
          </div>

          {/* Field: Email */}
          <div>
            <label className="block text-xs font-bold text-[#2C1D11] uppercase tracking-wider mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8C7A6B] absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., cheska@cafepita.com"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#2C1D11]/15 rounded-2xl text-xs text-[#2B231F] placeholder:text-[#8C7A6B]/50 focus:outline-none focus:ring-2 focus:ring-[#4A2E19] font-mono"
              />
            </div>
          </div>

          {/* Field: Role */}
          <div>
            <label className="block text-xs font-bold text-[#2C1D11] uppercase tracking-wider mb-1.5">
              Account Role <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition ${
                  role === 'staff'
                    ? 'bg-amber-50/60 border-[#4A2E19] text-[#2C1D11] shadow-2xs'
                    : 'bg-white border-[#2C1D11]/15 text-stone-600 hover:bg-[#4A2E19]/5'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="staff"
                  checked={role === 'staff'}
                  onChange={() => setRole('staff')}
                  className="accent-[#4A2E19]"
                />
                <div>
                  <div className="text-xs font-bold">Staff / Barista</div>
                  <div className="text-[10px] text-[#8C7A6B]">KDS, Orders & Cashier</div>
                </div>
              </label>

              <label
                className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition ${
                  role === 'admin'
                    ? 'bg-amber-50/60 border-[#4A2E19] text-[#2C1D11] shadow-2xs'
                    : 'bg-white border-[#2C1D11]/15 text-stone-600 hover:bg-[#4A2E19]/5'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={role === 'admin'}
                  onChange={() => setRole('admin')}
                  className="accent-[#4A2E19]"
                />
                <div>
                  <div className="text-xs font-bold">Administrator</div>
                  <div className="text-[10px] text-[#8C7A6B]">Full Management & Reports</div>
                </div>
              </label>
            </div>
          </div>

          {/* Password Section */}
          <div className="pt-2 border-t border-[#2C1D11]/10">
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-[#4A2E19]" />
                    <span className="text-xs font-bold text-[#2C1D11] uppercase tracking-wider">
                      Reset Password
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEnablePasswordReset(!enablePasswordReset);
                      if (enablePasswordReset) {
                        setPassword('');
                        setConfirmPassword('');
                      }
                    }}
                    className="text-[11px] font-bold text-[#4A2E19] hover:underline cursor-pointer"
                  >
                    {enablePasswordReset ? 'Keep Existing Password' : '+ Overwrite / Reset Password'}
                  </button>
                </div>

                {enablePasswordReset ? (
                  <div className="p-4 bg-amber-50/50 border border-[#2C1D11]/15 rounded-2xl space-y-3">
                    <p className="text-[11px] text-[#8C7A6B]">
                      Enter a new password for this user. In accordance with Laravel Sanctum security, active sessions for this account will be automatically revoked upon password overwrite.
                    </p>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#2C1D11] mb-1">
                        New Password (min 8 chars)
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="w-full px-3.5 py-2 bg-white border border-[#2C1D11]/15 rounded-xl text-xs text-[#2B231F] focus:outline-none focus:ring-2 focus:ring-[#4A2E19]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2 text-[#8C7A6B] hover:text-[#2C1D11]"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#2C1D11] mb-1">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-type new password"
                          className="w-full px-3.5 py-2 bg-white border border-[#2C1D11]/15 rounded-xl text-xs text-[#2B231F] focus:outline-none focus:ring-2 focus:ring-[#4A2E19]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-2 text-[#8C7A6B] hover:text-[#2C1D11]"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {password.length > 0 && password.length < 8 && (
                      <p className="text-[11px] text-red-600 font-medium">
                        Password must be at least 8 characters long.
                      </p>
                    )}
                    {confirmPassword.length > 0 && password !== confirmPassword && (
                      <p className="text-[11px] text-red-600 font-medium">
                        Passwords do not match.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#8C7A6B] italic">
                    Existing password will be preserved.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#4A2E19]" />
                  <span className="text-xs font-bold text-[#2C1D11] uppercase tracking-wider">
                    Initial Credentials
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C1D11] uppercase tracking-wider mb-1.5">
                    Initial Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#2C1D11]/15 rounded-2xl text-xs text-[#2B231F] focus:outline-none focus:ring-2 focus:ring-[#4A2E19]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-2.5 text-[#8C7A6B] hover:text-[#2C1D11]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C1D11] uppercase tracking-wider mb-1.5">
                    Confirm Initial Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type password"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#2C1D11]/15 rounded-2xl text-xs text-[#2B231F] focus:outline-none focus:ring-2 focus:ring-[#4A2E19]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-2.5 text-[#8C7A6B] hover:text-[#2C1D11]"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {password.length > 0 && password.length < 8 && (
                  <p className="text-[11px] text-red-600 font-medium">
                    Password must be at least 8 characters long.
                  </p>
                )}
                {confirmPassword.length > 0 && password !== confirmPassword && (
                  <p className="text-[11px] text-red-600 font-medium">
                    Passwords do not match.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-[#2C1D11]/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-xs font-bold text-[#8C7A6B] hover:text-[#2C1D11] hover:bg-[#4A2E19]/5 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!validation.isValid || isSubmitting}
              className="px-5 py-2.5 bg-[#4A2E19] hover:bg-[#382212] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : isEditing ? (
                <span>Update Account Details</span>
              ) : (
                <span>Create Staff Account</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
