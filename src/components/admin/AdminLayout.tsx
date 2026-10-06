import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { AdminLogin } from './AdminLogin';
import { AdminDashboardTab } from './tabs/AdminDashboardTab';
import { AdminShopsTab } from './tabs/AdminShopsTab';
import { AdminProductsTab } from './tabs/AdminProductsTab';
import { AdminOrdersTab } from './tabs/AdminOrdersTab';
import { AdminPaymentsTab } from './tabs/AdminPaymentsTab';
import { AdminUsersTab } from './tabs/AdminUsersTab';
import { AdminDeliveryTab } from './tabs/AdminDeliveryTab';
import { AdminCommissionsTab } from './tabs/AdminCommissionsTab';
import { AdminCouponsTab } from './tabs/AdminCouponsTab';
import { AdminBannersTab } from './tabs/AdminBannersTab';
import { AdminAuditLogsTab } from './tabs/AdminAuditLogsTab';
import { AdminSupportTab } from './tabs/AdminSupportTab';
import { AdminNotificationsTab } from './tabs/AdminNotificationsTab';
import { AdminSettingsTab } from './tabs/AdminSettingsTab';
import {
  Shield,
  LayoutDashboard,
  Store,
  Package,
  ShoppingBag,
  CreditCard,
  Users,
  Bike,
  Percent,
  Tag,
  Image,
  FileText,
  LifeBuoy,
  Bell,
  Settings,
  LogOut,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  Menu,
  X,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const {
    superAdmin,
    currentAdminSession,
    activeSessions,
    logoutSuperAdmin,
    logoutAllAdminDevices,
    settings,
    orders,
    shops,
    supportTickets,
  } = usePlatform();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false);

  // If no admin session is active, show AdminLogin
  if (!currentAdminSession || !superAdmin) {
    return <AdminLogin />;
  }

  const pendingShops = shops.filter((s) => s.status === 'PENDING').length;
  const pendingOrders = orders.filter((o) => o.orderStatus === 'PLACED').length;
  const openTickets = supportTickets.filter((t) => t.status === 'OPEN').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard & KPIs', icon: LayoutDashboard },
    { id: 'shops', label: 'Shops & Vendors', icon: Store, badge: pendingShops > 0 ? pendingShops : undefined, badgeColor: 'bg-amber-500 text-slate-950 font-bold' },
    { id: 'products', label: 'Products & SKUs', icon: Package },
    { id: 'orders', label: 'Orders Hub', icon: ShoppingBag, badge: pendingOrders > 0 ? pendingOrders : undefined, badgeColor: 'bg-emerald-500 text-slate-950 font-bold' },
    { id: 'payments', label: 'Payments & Razorpay', icon: CreditCard },
    { id: 'users', label: 'Customers & Staff', icon: Users },
    { id: 'delivery', label: 'Logistics Fleet', icon: Bike },
    { id: 'commissions', label: 'Commissions Engine', icon: Percent },
    { id: 'coupons', label: 'Coupons & Vouchers', icon: Tag },
    { id: 'banners', label: 'Banners & Spotlights', icon: Image },
    { id: 'audit', label: 'Audit Trail Logs', icon: FileText },
    { id: 'support', label: 'Support Helpdesk', icon: LifeBuoy, badge: openTickets > 0 ? openTickets : undefined, badgeColor: 'bg-blue-500 text-white font-bold' },
    { id: 'notifications', label: 'Push Broadcasts', icon: Bell },
    { id: 'settings', label: 'Business & Maintenance', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Sidebar Toggle Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
            SA
          </div>
          <span className="font-bold text-sm text-white">Super Admin Command Center</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Left Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 transition-transform duration-200 md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Admin Identity Card */}
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-white text-xs truncate flex items-center gap-1.5">
                  <span>{superAdmin.name}</span>
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                  Platform Owner (ROOT)
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">{superAdmin.email}</div>
              </div>
            </div>
          </div>

          {/* Nav List */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-12rem)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-950'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${item.badgeColor || 'bg-slate-700 text-white'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer: Session Management & Logout */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <button
            onClick={() => setIsSessionsModalOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 bg-slate-800/60 hover:bg-slate-800 rounded-xl text-slate-300 text-xs transition"
          >
            <div className="flex items-center gap-2">
              <Laptop className="w-3.5 h-3.5 text-indigo-400" />
              <span>Active Sessions ({activeSessions.length})</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          <button
            onClick={logoutSuperAdmin}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-xl text-xs font-semibold transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {activeTab === 'dashboard' && <AdminDashboardTab onNavigateTab={(tab) => setActiveTab(tab)} />}
        {activeTab === 'shops' && <AdminShopsTab />}
        {activeTab === 'products' && <AdminProductsTab />}
        {activeTab === 'orders' && <AdminOrdersTab />}
        {activeTab === 'payments' && <AdminPaymentsTab />}
        {activeTab === 'users' && <AdminUsersTab />}
        {activeTab === 'delivery' && <AdminDeliveryTab />}
        {activeTab === 'commissions' && <AdminCommissionsTab />}
        {activeTab === 'coupons' && <AdminCouponsTab />}
        {activeTab === 'banners' && <AdminBannersTab />}
        {activeTab === 'audit' && <AdminAuditLogsTab />}
        {activeTab === 'support' && <AdminSupportTab />}
        {activeTab === 'notifications' && <AdminNotificationsTab />}
        {activeTab === 'settings' && <AdminSettingsTab />}
      </main>

      {/* Active Sessions Modal */}
      {isSessionsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Active Administrator Sessions</h3>
                <p className="text-xs text-slate-400">Authenticated devices and tokens under Super Admin account.</p>
              </div>
              <button
                onClick={() => setIsSessionsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 mb-5">
              {activeSessions.map((s) => (
                <div key={s.id} className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs">
                  <div className="flex justify-between font-semibold text-white">
                    <span>{s.device}</span>
                    {s.id === currentAdminSession.id && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                        THIS DEVICE
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">IP: {s.ip} · Created: {new Date(s.createdAt).toLocaleTimeString()}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">JWT: {s.token}</div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  logoutAllAdminDevices();
                  setIsSessionsModalOpen(false);
                }}
                className="px-3 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition"
              >
                Logout From All Devices
              </button>
              <button
                onClick={() => setIsSessionsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
