import React, { useState } from 'react';
import { usePlatform } from '../../../context/PlatformContext';
import { Coupon } from '../../../types';
import {
  Tag,
  Plus,
  Trash2,
  Power,
  PowerOff,
  CheckCircle2,
  Calendar,
  Percent,
  IndianRupee,
} from 'lucide-react';

export const AdminCouponsTab: React.FC = () => {
  const { coupons, createCoupon, toggleCoupon, deleteCoupon, settings } = usePlatform();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('20');
  const [minOrderValue, setMinOrderValue] = useState('200');
  const [maxDiscount, setMaxDiscount] = useState('100');
  const [usageLimit, setUsageLimit] = useState('500');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createCoupon({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue) || 10,
      minOrderValue: Number(minOrderValue) || 0,
      maxDiscount: Number(maxDiscount) || 100,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      usageLimit: Number(usageLimit) || 100,
      perUserLimit: 1,
      applicableShopIds: [],
      applicableCategories: [],
      isActive: true,
    });
    setIsCreateModalOpen(false);
    setCode('');
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white">Coupon & Voucher Administration</h2>
          <p className="text-xs text-slate-400">
            Promotional discounts, minimum order constraints, usage limits, and immediate killswitch toggles
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Coupon Code</span>
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between transition-all ${
              coupon.isActive ? 'border-slate-800' : 'border-slate-800/50 opacity-60 bg-slate-950'
            }`}
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono font-bold text-sm text-white tracking-wider">
                      {coupon.code}
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      {coupon.discountType === 'PERCENTAGE'
                        ? `${coupon.discountValue}% OFF (Max ${settings.currencySymbol}${coupon.maxDiscount})`
                        : `Flat ${settings.currencySymbol}${coupon.discountValue} OFF`}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    coupon.isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {coupon.isActive ? 'Active' : 'Deactivated'}
                </span>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-3 space-y-1.5 text-xs text-slate-300 mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Min Order Value:</span>
                  <span className="font-semibold text-white">{settings.currencySymbol}{coupon.minOrderValue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Redemptions:</span>
                  <span className="font-semibold text-white">{coupon.usedCount} / {coupon.usageLimit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Valid Until:</span>
                  <span className="text-slate-300">{new Date(coupon.endDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <button
                onClick={() => toggleCoupon(coupon.id, !coupon.isActive)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition ${
                  coupon.isActive
                    ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {coupon.isActive ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                <span>{coupon.isActive ? 'Killswitch Deactivate' : 'Reactivate'}</span>
              </button>

              <button
                onClick={() => {
                  if (confirm(`Permanently remove coupon ${coupon.code}?`)) {
                    deleteCoupon(coupon.id);
                  }
                }}
                className="text-slate-500 hover:text-rose-400 transition p-1"
                title="Delete coupon"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Coupon Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Create Platform Coupon</h3>
            <p className="text-xs text-slate-400 mb-4">
              Configure promo discount rules and minimum purchase requirement.
            </p>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Coupon Promo Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE2026"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Value</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Usage Limit</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition"
                >
                  Save & Publish Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
