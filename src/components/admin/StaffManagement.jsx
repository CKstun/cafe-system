import React, { useState, useMemo } from 'react';
import { useCafe } from '../../context/CafeContext';
import { UserFormModal } from './UserFormModal';
import { DeleteUserModal } from './DeleteUserModal';
import {
  Users,
  UserPlus,
  Search,
  CheckCircle2,
  Edit2,
  Trash2,
  ShieldCheck,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

/**
 * Complete Staff Account Management Module (/admin/staff)
 * Allows Admins to create, update, reset passwords, delete, and disable/enable accounts.
 * Palette: #FDFBF7 cream and #4A2E19 coffee brown
 */
export const StaffManagement = () => {
  const {
    staffUsers,
    adminSession,
    addStaffUser,
    updateStaffUser,
    deleteStaffUser,
    toggleStaffStatus,
  } = useCafe();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };

  const currentAdminId = adminSession?.user?.id;

  // Filtered staff list
  const filteredUsers = useMemo(() => {
    return staffUsers.filter((u) => {
      // Search match
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query);

      // Role match
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;

      // Status match
      const isActive = u.is_active !== false;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && isActive) ||
        (statusFilter === 'disabled' && !isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [staffUsers, searchQuery, roleFilter, statusFilter]);

  // Handlers
  const handleOpenCreateModal = () => {
    setUserToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setUserToEdit(user);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (data) => {
    if (data.id) {
      // Edit mode
      const result = updateStaffUser(data.id, {
        name: data.name,
        email: data.email,
        role: data.role,
        ...(data.password ? { password: data.password } : {}),
      });

      if (result.error) {
        return { success: false, error: result.error };
      }

      showToast(
        data.password
          ? `Account updated and password reset for ${data.name}. Active tokens revoked.`
          : `Account profile updated for ${data.name}.`
      );
      return { success: true };
    } else {
      // Create mode
      const result = addStaffUser(data.name, data.email, data.role, data.password);
      if (result.error) {
        return { success: false, error: result.error };
      }

      showToast(`Staff account for ${data.name} created successfully.`);
      return { success: true };
    }
  };

  const handleToggleStatus = (user) => {
    if (currentAdminId === user.id) {
      showToast('Security Guard: You cannot deactivate your currently logged-in admin account.', 'error');
      return;
    }

    const res = toggleStaffStatus(user.id);
    if (!res.success) {
      showToast(res.error || 'Failed to toggle account status.', 'error');
    } else {
      showToast(res.message || 'Account status updated.');
    }
  };

  const handleOpenDeleteModal = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (userId) => {
    setIsDeleting(true);
    try {
      const res = deleteStaffUser(userId);
      if (res && res.error) {
        showToast(res.error, 'error');
      } else {
        showToast('Account permanently removed.');
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
      }
    } catch {
      showToast('An error occurred during account deletion.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toast && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-md animate-in fade-in slide-in-from-top-2 duration-200 ${
            toast.type === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-stone-400 hover:text-stone-700 ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-[#2C1D11]/10 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#4A2E19]/10 text-[#4A2E19] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif text-[#2C1D11] tracking-tight font-bold">
                Staff Account Management
              </h2>
              <p className="text-xs text-[#8C7A6B]">
                Manage credentials, authentication guards, and Sanctum tokens for Café Pepita personnel
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 bg-[#4A2E19] hover:bg-[#382212] text-white text-xs font-bold rounded-2xl transition flex items-center gap-2 shadow-xs cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Create Account</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#2C1D11]/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8C7A6B] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by staff name or email address..."
            className="w-full pl-10 pr-4 py-2 bg-[#FDFBF7] border border-[#2C1D11]/10 rounded-xl text-xs text-[#2B231F] placeholder:text-[#8C7A6B]/60 focus:outline-none focus:ring-2 focus:ring-[#4A2E19]"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Role Filter */}
          <div className="flex items-center gap-1 bg-[#FDFBF7] p-1 rounded-xl border border-[#2C1D11]/10 text-xs">
            <button
              type="button"
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer text-[11px] ${
                roleFilter === 'all'
                  ? 'bg-[#4A2E19] text-white shadow-2xs'
                  : 'text-[#8C7A6B] hover:text-[#2C1D11]'
              }`}
            >
              All Roles
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('staff')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer text-[11px] ${
                roleFilter === 'staff'
                  ? 'bg-[#4A2E19] text-white shadow-2xs'
                  : 'text-[#8C7A6B] hover:text-[#2C1D11]'
              }`}
            >
              Staff Only
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('admin')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer text-[11px] ${
                roleFilter === 'admin'
                  ? 'bg-[#4A2E19] text-white shadow-2xs'
                  : 'text-[#8C7A6B] hover:text-[#2C1D11]'
              }`}
            >
              Admins
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-[#FDFBF7] p-1 rounded-xl border border-[#2C1D11]/10 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer text-[11px] ${
                statusFilter === 'all'
                  ? 'bg-[#4A2E19] text-white shadow-2xs'
                  : 'text-[#8C7A6B] hover:text-[#2C1D11]'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer text-[11px] ${
                statusFilter === 'active'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'text-[#8C7A6B] hover:text-[#2C1D11]'
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('disabled')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer text-[11px] ${
                statusFilter === 'disabled'
                  ? 'bg-stone-700 text-white shadow-2xs'
                  : 'text-[#8C7A6B] hover:text-[#2C1D11]'
              }`}
            >
              Disabled
            </button>
          </div>
        </div>
      </div>

      {/* Account Catalog Table */}
      <div className="bg-white border border-[#2C1D11]/10 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#2C1D11]/10 bg-[#FDFBF7] text-[#8C7A6B] uppercase tracking-wider text-[10px] font-bold">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2C1D11]/5">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Users className="w-8 h-8 text-stone-300 mx-auto" />
                      <p className="font-medium text-xs text-[#2C1D11]">No accounts found</p>
                      <p className="text-[11px] text-[#8C7A6B]">
                        Try adjusting your search criteria or create a new user account.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isActive = user.is_active !== false;
                  const isCurrentAdmin = currentAdminId === user.id;

                  return (
                    <tr
                      key={user.id}
                      className={`transition-colors ${
                        !isActive
                          ? 'bg-stone-50/70 opacity-75'
                          : 'hover:bg-[#FDFBF7]/60'
                      }`}
                    >
                      {/* Name Column */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              user.role === 'admin'
                                ? 'bg-[#4A2E19] text-[#FDFBF7]'
                                : 'bg-[#EADBCE] text-[#4A2E19]'
                            }`}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-[#2C1D11] flex items-center gap-2">
                              <span>{user.name}</span>
                              {isCurrentAdmin && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold uppercase tracking-wider">
                                  You (Active Session)
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#8C7A6B] flex items-center gap-1.5 mt-0.5">
                              <span>ID: #{user.id}</span>
                              {user.created_at && (
                                <>
                                  <span>•</span>
                                  <span>Joined {user.created_at}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email Column */}
                      <td className="py-4 px-6 font-mono text-stone-700">
                        {user.email}
                      </td>

                      {/* Role Column */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            user.role === 'admin'
                              ? 'bg-[#4A2E19] text-[#FDFBF7]'
                              : 'bg-[#F4EFEB] text-[#4A2E19] border border-[#EADBCE]'
                          }`}
                        >
                          {user.role === 'admin' ? (
                            <ShieldCheck className="w-3 h-3 text-amber-300" />
                          ) : (
                            <Users className="w-3 h-3 text-[#4A2E19]" />
                          )}
                          <span>{user.role === 'admin' ? 'Admin' : 'Staff'}</span>
                        </span>
                      </td>

                      {/* Status Column */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-stone-100 text-stone-600 border border-stone-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'
                            }`}
                          />
                          <span>{isActive ? 'Active' : 'Disabled'}</span>
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Disable / Enable Toggle Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(user)}
                            disabled={isCurrentAdmin}
                            title={
                              isCurrentAdmin
                                ? 'Security Guard: Cannot deactivate your own active admin account'
                                : isActive
                                ? 'Deactivate account and revoke active Sanctum tokens'
                                : 'Reactivate account'
                            }
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                              isCurrentAdmin
                                ? 'opacity-40 cursor-not-allowed text-stone-400'
                                : isActive
                                ? 'text-amber-800 hover:bg-amber-50 border border-amber-200/80'
                                : 'text-emerald-800 hover:bg-emerald-50 border border-emerald-200/80'
                            }`}
                          >
                            {isActive ? (
                              <>
                                <ToggleRight className="w-4 h-4 text-emerald-600" />
                                <span className="hidden sm:inline">Disable</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-4 h-4 text-stone-400" />
                                <span className="hidden sm:inline">Enable</span>
                              </>
                            )}
                          </button>

                          {/* Edit & Reset Password Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(user)}
                            title="Edit profile & reset password"
                            className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-[#4A2E19] hover:bg-[#4A2E19]/10 border border-[#2C1D11]/10 flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteModal(user)}
                            disabled={isCurrentAdmin}
                            title={
                              isCurrentAdmin
                                ? 'Security Guard: Cannot delete your own active admin account'
                                : 'Permanently remove account'
                            }
                            className={`p-1.5 rounded-xl text-xs font-bold transition ${
                              isCurrentAdmin
                                ? 'opacity-30 cursor-not-allowed text-stone-300'
                                : 'text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 cursor-pointer'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Summary */}
        <div className="bg-[#FDFBF7] px-6 py-3.5 border-t border-[#2C1D11]/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#8C7A6B] gap-2">
          <div>
            Showing <strong className="text-[#2C1D11]">{filteredUsers.length}</strong> of{' '}
            <strong className="text-[#2C1D11]">{staffUsers.length}</strong> total registered accounts
          </div>
          <div className="flex items-center gap-4 text-[10px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{staffUsers.filter((u) => u.is_active !== false).length} Active</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-stone-400" />
              <span>{staffUsers.filter((u) => u.is_active === false).length} Deactivated</span>
            </span>
          </div>
        </div>
      </div>

      {/* User Form Modal (Create / Edit & Password Reset) */}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        userToEdit={userToEdit}
        currentAdminId={currentAdminId}
      />

      {/* Delete User Confirmation Modal */}
      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        user={userToDelete}
        currentAdminId={currentAdminId}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default StaffManagement;
