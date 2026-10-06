import React, { useState } from 'react';
import { usePlatform } from '../../../context/PlatformContext';
import {
  Percent,
  Sliders,
  DollarSign,
  TrendingUp,
  Store,
  CheckCircle2,
  Calculator,
  ShieldCheck,
} from 'lucide-react';

export const AdminCommissionsTab: React.FC = () => {
  const { settings, updateSettings, shops, updateShop, financialStats, orders } = usePlatform();

  const [globalRate, setGlobalRate] = useState(String(settings.globalCommissionRate));
  const [calculatorSales, setCalculatorSales] = useState('1000');
  const [calculatorRate, setCalculatorRate] = useState('5');

  const handleUpdateGlobalRate = (e: React.FormEvent) => {
    e.preventDefault();
    const rate = Number(globalRate);
    if (!isNaN(rate) && rate >= 0 && rate <= 50) {
      updateSettings({ globalCommissionRate: rate });
      alert(`Global Platform Commission updated to ${rate}%!`);
    }
  };

  const calcSalesNum = Number(calculatorSales) || 0;
  const calcRateNum = Number(calculatorRate) || 0;
  const calcPlatformFee = Math.round(((calcSalesNum * calcRateNum) / 100) * 10) / 10;
  const calcShopPayout = Math.round((calcSalesNum - calcPlatformFee) * 10) / 10;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-2 mb-1">
          <Percent className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-white">Platform Commission & Revenue Architecture</h2>
        </div>
        <p className="text-xs text-slate-400">
          Backend automated commission calculations, merchant overrides, and transparent financial ledger
        </p>
      </div>

      {/* Financial Ledger Big Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400">Total Gross Platform GMV</span>
          <div className="text-2xl font-bold text-white mt-1">
            {settings.currencySymbol}{financialStats.grossSales.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Customer paid checkouts</div>
        </div>

        <div className="bg-slate-900 border border-emerald-500/30 p-4 rounded-2xl bg-gradient-to-br from-emerald-950/30 to-slate-900">
          <span className="text-xs font-semibold text-emerald-300">Net Platform Commission Retained</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {settings.currencySymbol}{financialStats.platformCommission.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-300/80 mt-1">Platform take before delivery split</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400">Total Vendor Net Disbursed</span>
          <div className="text-2xl font-bold text-indigo-300 mt-1">
            {settings.currencySymbol}{financialStats.shopEarnings.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Directly credited to shop balances</div>
        </div>
      </div>

      {/* Global Commission Rule Configuration & Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Global Commission Setting Form */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            Global Platform Commission Rate
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Applied automatically to all shops unless a custom shop-specific rate override is configured.
          </p>

          <form onSubmit={handleUpdateGlobalRate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Default Commission Percentage (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  value={globalRate}
                  onChange={(e) => setGlobalRate(e.target.value)}
                  className="w-32 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none"
                />
                <span className="text-sm font-bold text-emerald-400">%</span>
                <button
                  type="submit"
                  className="ml-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition"
                >
                  Save Global Rate
                </button>
              </div>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl text-xs text-slate-300 border border-slate-700/60">
              <strong className="text-white block mb-1">Commission Rule Principles:</strong>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                <li>Deducted at the time of order placement on the order subtotal (after discount).</li>
                <li>Delivery fees collected belong strictly to logistics partners / platform.</li>
                <li>Refunds automatically reverse the commission ledger entry proportionally.</li>
              </ul>
            </div>
          </form>
        </div>

        {/* Live Calculation Simulator */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-indigo-400" />
            Commission Simulation Sandbox
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Test and verify backend mathematics for any order ticket value.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Sample Order Value (₹)</label>
              <input
                type="number"
                value={calculatorSales}
                onChange={(e) => setCalculatorSales(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Commission Cut (%)</label>
              <input
                type="number"
                value={calculatorRate}
                onChange={(e) => setCalculatorRate(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Customer Order Value:</span>
              <span className="font-bold text-white">{settings.currencySymbol}{calcSalesNum}</span>
            </div>
            <div className="flex justify-between text-emerald-400">
              <span>Platform Retained ({calcRateNum}%):</span>
              <span className="font-bold">+{settings.currencySymbol}{calcPlatformFee}</span>
            </div>
            <div className="flex justify-between text-indigo-300 pt-1.5 border-t border-slate-700">
              <span>Vendor Payout (95%):</span>
              <span className="font-bold">+{settings.currencySymbol}{calcShopPayout}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shop-Specific Override Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">Merchant-Specific Commission Overrides</h3>
          <span className="text-xs text-slate-400">Default fallback: {settings.globalCommissionRate}%</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Merchant Shop</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Configured Commission</th>
                <th className="py-3 px-4">Effective Cut</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {shops.map((shop) => (
                <tr key={shop.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-semibold text-white">
                    <div className="flex items-center gap-2">
                      <img src={shop.logo} alt="" className="w-7 h-7 rounded-lg object-cover" />
                      <span>{shop.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{shop.category}</td>
                  <td className="py-3 px-4">
                    {shop.commissionRate !== null ? (
                      <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 font-bold rounded">
                        {shop.commissionRate}% (Custom Override)
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Inherits Platform Default ({settings.globalCommissionRate}%)</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-400">
                    {shop.commissionRate !== null ? shop.commissionRate : settings.globalCommissionRate}%
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        const newRate = prompt(`Enter new commission % for ${shop.name} (or leave empty to reset to default):`, shop.commissionRate !== null ? String(shop.commissionRate) : '');
                        if (newRate !== null) {
                          const num = newRate.trim() === '' ? null : Number(newRate);
                          updateShop(shop.id, { commissionRate: num });
                        }
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
                    >
                      Change Rate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
