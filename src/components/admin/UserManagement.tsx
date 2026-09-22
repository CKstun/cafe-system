import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { User } from '../../types/cafe';

export const UserManagement: React.FC = () => {
  const { staffUsers, resetEmployeePassword } = useCafe();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenResetModal = (user: User) => {
    setSelectedUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setStatusMessage(null);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setNewPassword('');
    setConfirmPassword('');
    setStatusMessage(null);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (newPassword.length < 8) {
      setStatusMessage({ text: 'Password must be at least 8 characters in length.', isError: true });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage({ text: 'Passwords do not match.', isError: true });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const result = await resetEmployeePassword(selectedUser.id, newPassword);
      if (result.success) {
        setStatusMessage({ text: result.message || 'Password reset successfully.', isError: false });
        setTimeout(() => {
          handleCloseModal();
        }, 1400);
      } else {
        setStatusMessage({ text: result.error || 'Failed to reset password.', isError: true });
      }
    } catch {
      setStatusMessage({ text: 'An unexpected error occurred while resetting password.', isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif text-[#2C1D11]">User Management</h2>
          <p className="text-xs text-[#8C7A6B] mt-0.5">
            Admin-managed employee accounts and temporary credential resets.
          </p>
        </div>
      </div>

      {/* Streamlined Minimalist Employee Table */}
      <div className="bg-white border border-[#EADBCE]/70 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#EADBCE]/70 text-[#8C7A6B] uppercase tracking-wider text-[11px] bg-[#FDFBF7]">
              <th className="py-3.5 px-5 font-medium">Name</th>
              <th className="py-3.5 px-5 font-medium">Email</th>
              <th className="py-3.5 px-5 font-medium">Role</th>
              <th className="py-3.5 px-5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EADBCE]/40">
            {staffUsers.map((u) => (
              <tr key={u.id} className="hover:bg-[#FDFBF7]/50 transition-colors">
                <td className="py-3.5 px-5 font-medium text-[#2C1D11]">{u.name}</td>
                <td className="py-3.5 px-5 text-[#8C7A6B] font-mono">{u.email}</td>
                <td className="py-3.5 px-5">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                      u.role === 'admin'
                        ? 'bg-[#4A2E19] text-[#FDFBF7]'
                        : 'bg-[#F4EFEB] text-[#4A2E19]'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="py-3.5 px-5 text-right">
                  <button
                    type="button"
                    onClick={() => handleOpenResetModal(u)}
                    className="text-[#4A2E19] hover:text-[#2C1D11] hover:underline font-medium cursor-pointer transition text-xs"
                  >
                    Reset Password
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Password Reset Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white border border-[#EADBCE] rounded-2xl p-6 shadow-md animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-serif text-[#2C1D11]">
              Reset Password
            </h3>
            <p className="text-xs text-[#8C7A6B] mt-0.5 mb-5">
              Set a temporary password for <span className="text-[#2C1D11] font-medium">{selectedUser.name}</span>.
            </p>

            {statusMessage && (
              <div
                className={`mb-4 p-2.5 rounded-xl text-xs ${
                  statusMessage.isError
                    ? 'bg-red-50 text-red-700 border border-red-200/60'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                }`}
              >
                {statusMessage.text}
              </div>
            )}

            <form onSubmit={handleResetSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#2C1D11] mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#EADBCE] rounded-xl text-xs text-[#2C1D11] focus:outline-none focus:ring-2 focus:ring-[#4A2E19]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2C1D11] mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type password"
                  className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#EADBCE] rounded-xl text-xs text-[#2C1D11] focus:outline-none focus:ring-2 focus:ring-[#4A2E19]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-3.5 py-1.5 text-xs text-[#8C7A6B] hover:text-[#2C1D11] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-[#4A2E19] hover:bg-[#382212] text-white text-xs font-medium rounded-xl transition disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? 'Updating...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
