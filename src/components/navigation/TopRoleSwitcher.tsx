import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import {
  Shield,
  Smartphone,
  Store,
  Bike,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Globe,
  Lock,
  Eye,
  EyeOff,
  HelpCircle,
  X,
  ExternalLink,
} from 'lucide-react';

export const TopRoleSwitcher: React.FC = () => {
  const { activeRoleView, setActiveRoleView, settings, financialStats, orders, resetToDemo } = usePlatform();

  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // If collapsed (Pure Customer Mobile View mode)
  if (isCollapsed) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/90 hover:bg-slate-900 text-white rounded-full text-xs font-semibold shadow-2xl border border-slate-700 backdrop-blur-md transition group"
          title="Open Developer Role & Domain Switcher"
        >
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline text-[11px] text-slate-300">
            Preview Mode: <strong className="text-white">Customer App Only</strong>
          </span>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-full ml-1">
            Show Dev Bar
          </span>
        </button>
      </div>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2.5">
          {/* Brand & Security Notice */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-xs shadow-sm">
                MP
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-xs tracking-tight text-white">{settings.appName}</span>
                  <button
                    onClick={() => setIsSecurityModalOpen(true)}
                    className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium transition"
                  >
                    <Lock className="w-2.5 h-2.5" />
                    <span>Admin Isolation Info</span>
                  </button>
                </div>
              </div>
            </div>

            {settings.isMaintenanceMode && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-medium">
                <AlertTriangle className="w-3 h-3" />
                <span>Maintenance Active</span>
              </div>
            )}
          </div>

          {/* Multi-Role / Domain Switcher Tabs */}
          <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/60 overflow-x-auto text-xs">
            <button
              onClick={() => {
                setActiveRoleView('CUSTOMER');
                window.location.hash = 'customer';
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeRoleView === 'CUSTOMER'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Customer Mobile App</span>
            </button>

            <button
              onClick={() => {
                setActiveRoleView('SUPER_ADMIN');
                window.location.hash = 'admin';
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeRoleView === 'SUPER_ADMIN'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Super Admin Portal</span>
            </button>

            <button
              onClick={() => {
                setActiveRoleView('SHOP_OWNER');
                window.location.hash = 'vendor';
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeRoleView === 'SHOP_OWNER'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Shop Owner</span>
            </button>

            <button
              onClick={() => {
                setActiveRoleView('DELIVERY_PARTNER');
                window.location.hash = 'delivery';
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeRoleView === 'DELIVERY_PARTNER'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Delivery Fleet</span>
            </button>

            <button
              onClick={() => {
                setActiveRoleView('ACCEPTANCE_TEST');
                window.location.hash = 'test';
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeRoleView === 'ACCEPTANCE_TEST'
                  ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/50'
                  : 'text-indigo-300 hover:text-white hover:bg-indigo-950/60'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="font-semibold">28-Step Acceptance Test</span>
            </button>
          </div>

          {/* Right Controls: Hide Dev Bar & Reset */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveRoleView('CUSTOMER');
                setIsCollapsed(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-medium border border-slate-700 transition"
              title="Hide this top developer bar to view the standalone customer mobile app exactly as regular users see it"
            >
              <EyeOff className="w-3 h-3 text-slate-400" />
              <span className="hidden sm:inline">Preview As Real Customer</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Reset platform data to clean initial demo state?')) {
                  resetToDemo();
                }
              }}
              title="Reset demo data"
              className="flex items-center gap-1 text-slate-400 hover:text-slate-200 px-2 py-1 text-xs rounded hover:bg-slate-800 transition"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </header>

      {/* Security & Architecture Explanation Modal */}
      {isSecurityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Is the Admin Panel shown to everyone?</h3>
                  <span className="text-xs text-emerald-400 font-semibold">
                    No. The Admin Panel is strictly isolated and restricted.
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsSecurityModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-1">
                <strong className="text-white block font-semibold">1. Domain & Route Separation</strong>
                <p className="text-slate-400">
                  In production, the customer mobile app (Android/iOS/Web at <code className="text-emerald-300 font-mono">app.yourdomain.com</code>) does <strong>NOT</strong> include the Super Admin panel or this top bar. The Admin Dashboard is hosted on a separate sub-domain (<code className="text-emerald-300 font-mono">admin.yourdomain.com</code>).
                </p>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-1">
                <strong className="text-white block font-semibold">2. Role-Based Access Control (RBAC)</strong>
                <p className="text-slate-400">
                  Normal customers and shop owners who log in can <strong>NEVER</strong> access the Super Admin console. Any unauthorized attempt triggers an automatic <code className="text-rose-400 font-mono">403 Forbidden: Insufficient Permissions</code> block.
                </p>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-1">
                <strong className="text-white block font-semibold">3. Cryptographic Authentication & 2FA</strong>
                <p className="text-slate-400">
                  Accessing the Admin Portal requires authenticating with the master Super Admin credentials, salted and hashed via PBKDF2/SHA-256 with optional Time-based One-Time Password (TOTP 2FA) and account lockout protection.
                </p>
              </div>

              <div className="p-3 bg-indigo-950/20 border border-indigo-500/30 rounded-2xl space-y-1 text-indigo-200">
                <strong className="text-indigo-300 block font-semibold">4. Why do you see this top bar right now?</strong>
                <p className="text-slate-300 text-[11px]">
                  This top bar is a <em>development preview switcher</em> so that you, as the Platform Owner, can test all 4 platform roles (Admin, Customer, Vendor, Rider) and execute the 28-Step Acceptance Test directly in your browser.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setIsSecurityModalOpen(false);
                      setActiveRoleView('CUSTOMER');
                      setIsCollapsed(true);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
                  >
                    Switch to Pure Customer View Now
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsSecurityModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Got It, Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
