import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { AdminUserListItem } from '../../types';
import { Sidebar } from '../../components/common/Sidebar';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Users, Trash2, ShieldAlert, UserCheck } from 'lucide-react';

export const ManageUsersPage: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { success, error: toastError } = useToast();

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users', err);
      toastError('Failed to load user directory.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDeleteUser = async (u: AdminUserListItem) => {
    if (u.id === currentAdmin?.id) {
      toastError('Cannot delete your own active administrator account.');
      return;
    }

    if (!window.confirm(`Delete user account "${u.name}" (${u.email})?`)) return;

    try {
      await adminApi.deleteUser(u.id);
      success(`User "${u.name}" removed.`);
      loadUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete user.';
      toastError(msg);
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar type="admin" />

      <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            User Accounts Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Registered customer profiles, roles, reservation metrics, and account statuses.
          </p>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <LoadingSpinner message="Loading user accounts..." />
          ) : users.length === 0 ? (
            <div className="p-16 text-center text-slate-400 text-xs">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Bookings</th>
                    <th className="p-4">Total Spent</th>
                    <th className="p-4">Member Since</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {users.map((u) => {
                    const isSelf = u.id === currentAdmin?.id;

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-4">
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs uppercase">
                              {u.name.charAt(0)}
                            </div>
                            <span>{u.name}</span>
                            {isSelf && (
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">
                                You
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-slate-800">{u.email}</div>
                          <div className="text-[11px] text-slate-400">{u.phone}</div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              u.role === 'ADMIN'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-slate-900">{u.booking_count}</td>
                        <td className="p-4 font-black text-emerald-700">₹{u.total_spent}</td>
                        <td className="p-4 font-medium text-slate-500">
                          {new Date(u.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            disabled={isSelf}
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                            title={isSelf ? 'Cannot delete yourself' : 'Delete user'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
