import React, { useState } from 'react';
import { usePlatform } from '../../../context/PlatformContext';
import { User } from '../../../types';
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Trash2,
  RotateCcw,
  Shield,
  Plus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Lock,
  ShoppingBag,
} from 'lucide-react';

export const AdminUsersTab: React.FC = () => {
  const {
    users,
    orders,
    suspendCustomer,
    reactivateCustomer,
    softDeleteCustomer,
    updateCustomer,
    createSubAdmin,
    deleteSubAdmin,
    adminList,
  } = usePlatform();

  const [activeSubTab, setActiveSubTab] = useState<'CUSTOMERS' | 'ADMINS'>('CUSTOMERS');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED' | 'DELETED'>('ALL');

  // New Sub-Admin Modal
  const [isNewAdminModalOpen, setIsNewAdminModalOpen] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  // Selected customer for details drawer
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const customers = users.filter((u) => u.role === 'CUSTOMER');

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm);

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateSubAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    const res = await createSubAdmin(adminName, adminEmail, adminPassword);
    if (res.success) {
      setIsNewAdminModalOpen(false);
      setAdminName('');
      setAdminEmail('');
      setAdminPassword('');
    } else {
      setAdminError(res.error || 'Failed to create sub-admin');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Sub-tab Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('CUSTOMERS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeSubTab === 'CUSTOMERS'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Registered Customers ({customers.length})
          </button>
          <button
            onClick={() => setActiveSubTab('ADMINS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeSubTab === 'ADMINS'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Platform Admins Hierarchy ({adminList.length + 1})</span>
          </button>
        </div>

        {activeSubTab === 'CUSTOMERS' ? (
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Users</option>
              <option value="SUSPENDED">Suspended Users</option>
              <option value="DELETED">Soft-Deleted</option>
            </select>
          </div>
        ) : (
          <button
            onClick={() => setIsNewAdminModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Secondary Admin</span>
          </button>
        )}
      </div>

      {/* Customers View */}
      {activeSubTab === 'CUSTOMERS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Delivery Address</th>
                  <th className="py-3 px-4">Order History</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">User Governance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No customer accounts matching filter.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => {
                    const custOrders = orders.filter((o) => o.customerId === c.id);
                    return (
                      <tr key={c.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={c.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                              alt=""
                              className="w-9 h-9 rounded-full object-cover border border-slate-700"
                            />
                            <div>
                              <div className="font-semibold text-white">{c.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">UID: {c.id}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-300">
                          <div className="flex items-center gap-1.5 text-white">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{c.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5">
                            <Phone className="w-3 h-3" />
                            <span>{c.phone}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-300 max-w-[220px]">
                          <div className="line-clamp-2 text-[11px]">
                            {c.address || 'No default address saved'}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{custOrders.length} orders</div>
                          <div className="text-[10px] text-slate-400">
                            Joined {new Date(c.createdAt).toLocaleDateString()}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-block text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              c.status === 'ACTIVE'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : c.status === 'SUSPENDED'
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-slate-700 text-slate-400'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {c.status === 'ACTIVE' && (
                              <button
                                onClick={() => {
                                  if (confirm(`Suspend user account for ${c.name}?`)) {
                                    suspendCustomer(c.id);
                                  }
                                }}
                                title="Suspend Customer Account"
                                className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-lg border border-rose-500/30 transition"
                              >
                                <UserX className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {c.status === 'SUSPENDED' && (
                              <button
                                onClick={() => reactivateCustomer(c.id)}
                                title="Reactivate Account"
                                className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30 transition"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {c.status !== 'DELETED' ? (
                              <button
                                onClick={() => {
                                  if (confirm(`Soft-delete user account ${c.name}?`)) {
                                    softDeleteCustomer(c.id);
                                  }
                                }}
                                title="Soft Delete Account"
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => reactivateCustomer(c.id)}
                                className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-medium"
                              >
                                Restore
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admins View */}
      {activeSubTab === 'ADMINS' && (
        <div className="space-y-4">
          <div className="bg-indigo-950/20 border border-indigo-500/30 p-4 rounded-2xl text-xs text-indigo-200">
            <strong className="block font-semibold text-indigo-300 mb-1">
              Role Permission Hierarchy
            </strong>
            <p className="text-slate-300">
              Only the root <code className="bg-indigo-900/60 px-1 py-0.5 rounded text-indigo-200">SUPER_ADMIN</code> can create secondary admins, revoke privileges, alter commissions, or toggle platform maintenance mode. Secondary administrators hold operational management rights.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Staff & Admin Users
              </span>
            </div>

            <div className="divide-y divide-slate-800/60">
              {/* Root Super Admin */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                    SA
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">Primary Platform Owner</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                        SUPER_ADMIN (ROOT)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">owner@marketpulse.platform · Unrestricted Access</div>
                  </div>
                </div>
                <div className="text-xs text-slate-500 italic">Immutable Root</div>
              </div>

              {/* Secondary Admins */}
              {adminList.map((admin) => (
                <div key={admin.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                      AD
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{admin.name}</span>
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold">
                          ADMIN
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">{admin.email}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Remove administrator privileges for ${admin.name}?`)) {
                        deleteSubAdmin(admin.id);
                      }
                    }}
                    className="px-3 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold transition"
                  >
                    Revoke Admin
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New Secondary Admin Modal */}
      {isNewAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Provision Secondary Admin</h3>
            <p className="text-xs text-slate-400 mb-4">
              Add a trusted staff administrator. Credentials will be securely hashed with salt.
            </p>

            {adminError && (
              <div className="p-2.5 mb-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                {adminError}
              </div>
            )}

            <form onSubmit={handleCreateSubAdmin} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Admin Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operations Manager"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Admin Email</label>
                <input
                  type="email"
                  required
                  placeholder="admin.ops@marketpulse.platform"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Password (min 8 chars, uppercase, number, symbol)
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewAdminModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
