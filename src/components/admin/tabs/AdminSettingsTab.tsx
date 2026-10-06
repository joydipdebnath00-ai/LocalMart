import React, { useState } from 'react';
import { usePlatform } from '../../../context/PlatformContext';
import {
  Settings,
  Shield,
  AlertTriangle,
  Building,
  CreditCard,
  CheckCircle2,
  Lock,
  Globe,
  Sliders,
  Power,
  RotateCcw,
} from 'lucide-react';

export const AdminSettingsTab: React.FC = () => {
  const { settings, updateSettings, superAdmin, toggleAdmin2FA, resetToDemo } = usePlatform();

  // Local form state
  const [appName, setAppName] = useState(settings.appName);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);
  const [supportPhone, setSupportPhone] = useState(settings.supportPhone);
  const [businessAddress, setBusinessAddress] = useState(settings.businessAddress);
  const [defaultCurrency, setDefaultCurrency] = useState(settings.defaultCurrency);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [minOrder, setMinOrder] = useState(String(settings.minOrderValue));
  const [maxOrder, setMaxOrder] = useState(String(settings.maxOrderValue));
  const [maintenanceMessage, setMaintenanceMessage] = useState(settings.maintenanceMessage);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      appName,
      logoUrl,
      supportEmail,
      supportPhone,
      businessAddress,
      defaultCurrency,
      currencySymbol,
      minOrderValue: Number(minOrder) || 0,
      maxOrderValue: Number(maxOrder) || 50000,
      maintenanceMessage,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white">Platform Master Settings & Policy Engine</h2>
          <p className="text-xs text-slate-400">
            Control brand identity, financial thresholds, emergency maintenance mode, and registration gateways
          </p>
        </div>

        {savedSuccess && (
          <div className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center gap-1.5 animate-pulse font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Settings synced across all nodes!</span>
          </div>
        )}
      </div>

      {/* Critical Platform Controls: Maintenance Mode & Gateways */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Maintenance Mode Controller */}
        <div
          className={`border rounded-2xl p-5 transition-all ${
            settings.isMaintenanceMode
              ? 'bg-amber-950/20 border-amber-500/50'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                  settings.isMaintenanceMode
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Platform Maintenance Mode</h3>
                <span className="text-[11px] text-slate-400 block">
                  Instantly block customer app; admin panel remains fully operational
                </span>
              </div>
            </div>

            <button
              onClick={() => updateSettings({ isMaintenanceMode: !settings.isMaintenanceMode })}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                settings.isMaintenanceMode
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{settings.isMaintenanceMode ? 'DEACTIVATE' : 'ENABLE'}</span>
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Custom Maintenance Notice (Rendered to Mobile Users):
            </label>
            <input
              type="text"
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              onBlur={() => updateSettings({ maintenanceMessage })}
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Security & 2FA Enforcement */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Super Admin 2FA Protection</h3>
              <span className="text-[11px] text-slate-400 block">
                Time-based One-Time Password (TOTP) enforcement
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs">
            <div>
              <strong className="text-white block">Two-Factor Authentication:</strong>
              <span className="text-slate-400 text-[11px]">
                {superAdmin?.twoFactorEnabled ? 'Enabled for root account' : 'Currently Optional (Click to require 6-digit code)'}
              </span>
            </div>
            <button
              onClick={() => toggleAdmin2FA(!superAdmin?.twoFactorEnabled)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                superAdmin?.twoFactorEnabled
                  ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {superAdmin?.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA (TOTP)'}
            </button>
          </div>
        </div>
      </div>

      {/* Feature Toggles & Gateways Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <span>Operational Feature Toggles</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {[
            {
              key: 'isCodEnabled' as const,
              title: 'Cash on Delivery (COD)',
              desc: 'Permit users to pay with cash on delivery doorstep',
            },
            {
              key: 'isOnlinePaymentEnabled' as const,
              title: 'Razorpay Online Checkout',
              desc: 'Permit UPI, Netbanking & Credit/Debit cards',
            },
            {
              key: 'allowShopRegistration' as const,
              title: 'New Shop Onboarding',
              desc: 'Permit new merchant applications from registration page',
            },
            {
              key: 'allowCustomerRegistration' as const,
              title: 'New Buyer Registration',
              desc: 'Allow new consumers to sign up for accounts',
            },
            {
              key: 'reviewSystemEnabled' as const,
              title: 'Ratings & Reviews Engine',
              desc: 'Enable customer order reviews and star ratings',
            },
            {
              key: 'couponSystemEnabled' as const,
              title: 'Promo Coupon Engine',
              desc: 'Allow checkout promotional voucher applications',
            },
          ].map((toggle) => (
            <div
              key={toggle.key}
              className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-800"
            >
              <div>
                <strong className="text-white block font-semibold">{toggle.title}</strong>
                <span className="text-slate-400 text-[10px]">{toggle.desc}</span>
              </div>
              <button
                type="button"
                onClick={() => updateSettings({ [toggle.key]: !settings[toggle.key] })}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings[toggle.key] ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    settings[toggle.key] ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* General App Branding & Contacts Form */}
      <form onSubmit={handleSaveGeneral} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Building className="w-4 h-4 text-emerald-400" />
          <span>Brand Identity & Contact Details</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Application Name</label>
            <input
              type="text"
              required
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Support Email</label>
            <input
              type="email"
              required
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Support Helpline Phone</label>
            <input
              type="text"
              required
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Default Currency Code</label>
            <input
              type="text"
              required
              value={defaultCurrency}
              onChange={(e) => setDefaultCurrency(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Currency Symbol</label>
            <input
              type="text"
              required
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Min Order Value ({currencySymbol})</label>
            <input
              type="number"
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Registered Business Address</label>
          <input
            type="text"
            required
            value={businessAddress}
            onChange={(e) => setBusinessAddress(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
          />
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              if (confirm('Reset entire platform data to clean demo state?')) {
                resetToDemo();
              }
            }}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Database to Initial Fixtures</span>
          </button>

          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-emerald-950"
          >
            Save All Application Settings
          </button>
        </div>
      </form>
    </div>
  );
};
