import React, { useState } from 'react';
import { usePlatform } from '../../../context/PlatformContext';
import { Shop } from '../../../types';
import {
  Store,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Percent,
  Sliders,
  Eye,
  Package,
  ShoppingBag,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';

export const AdminShopsTab: React.FC = () => {
  const { shops, approveShop, rejectShop, suspendShop, reactivateShop, updateShop, products, orders, settings } = usePlatform();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED'>('ALL');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit Form state
  const [editCommission, setEditCommission] = useState<string>('');
  const [editCategory, setEditCategory] = useState<string>('');
  const [editDeliveryRadius, setEditDeliveryRadius] = useState<string>('');

  const filteredShops = shops.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenEdit = (shop: Shop) => {
    setSelectedShop(shop);
    setEditCommission(shop.commissionRate !== null ? String(shop.commissionRate) : '');
    setEditCategory(shop.category);
    setEditDeliveryRadius(String(shop.deliveryRadiusKm));
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShop) return;
    const comm = editCommission.trim() === '' ? null : Number(editCommission);
    updateShop(selectedShop.id, {
      category: editCategory,
      commissionRate: comm,
      deliveryRadiusKm: Number(editDeliveryRadius) || 10,
    });
    setIsEditModalOpen(false);
  };

  const handleRejectPrompt = (shopId: string) => {
    const reason = prompt('Enter shop rejection reason:', 'Incomplete documentation / non-compliant license');
    if (reason) {
      rejectShop(shopId, reason);
    }
  };

  const handleSuspendPrompt = (shopId: string) => {
    const reason = prompt('Enter shop suspension reason (Shop will immediately disappear from customer app):', 'Policy violation / unverified food safety complaint');
    if (reason) {
      suspendShop(shopId, reason);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white">Shops & Vendor Administration</h2>
          <p className="text-xs text-slate-400">
            Verify applications, toggle suspension, override commission rules, and inspect vendor performance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search shops, owners, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
            {(['ALL', 'PENDING', 'APPROVED', 'SUSPENDED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  statusFilter === st ? 'bg-slate-700 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Shops Table / Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredShops.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center text-slate-400 text-xs">
            No shops match the selected filter criteria.
          </div>
        ) : (
          filteredShops.map((shop) => {
            const shopProducts = products.filter((p) => p.shopId === shop.id && !p.isDeleted);
            const shopOrders = orders.filter((o) => o.shopId === shop.id);
            const shopSales = shopOrders.filter((o) => o.orderStatus === 'DELIVERED').reduce((sum, o) => sum + o.total, 0);
            const effectiveCommission = shop.commissionRate !== null ? shop.commissionRate : settings.globalCommissionRate;

            return (
              <div
                key={shop.id}
                className={`bg-slate-900 border rounded-2xl p-5 transition-all ${
                  shop.status === 'PENDING'
                    ? 'border-amber-500/50 bg-amber-950/10'
                    : shop.status === 'SUSPENDED'
                    ? 'border-rose-500/40 bg-rose-950/10'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Shop Info */}
                  <div className="flex items-start gap-4">
                    <img
                      src={shop.logo}
                      alt={shop.name}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-white">{shop.name}</h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            shop.status === 'APPROVED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : shop.status === 'PENDING'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                              : shop.status === 'SUSPENDED'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {shop.status}
                        </span>
                        {shop.isFeatured && (
                          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-medium">
                            Featured
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{shop.description}</p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
                        <span className="flex items-center gap-1 text-slate-300">
                          <Store className="w-3.5 h-3.5 text-slate-400" />
                          {shop.category}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {shop.address}
                        </span>
                        <span>·</span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <Percent className="w-3.5 h-3.5" />
                          {effectiveCommission}% Platform Commission
                          {shop.commissionRate !== null ? ' (Custom Override)' : ' (Default)'}
                        </span>
                      </div>

                      {/* Owner contact details */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-2 bg-slate-800/60 px-2.5 py-1 rounded-lg w-fit">
                        <span className="font-medium text-slate-300">Owner: {shop.ownerName}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {shop.ownerEmail}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {shop.ownerPhone}
                        </span>
                      </div>

                      {shop.status === 'SUSPENDED' && shop.suspensionReason && (
                        <div className="mt-2 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Suspension Reason: {shop.suspensionReason}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metrics & Action Buttons */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-3 w-full lg:w-auto shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800">
                    <div className="flex items-center gap-4 text-right text-xs">
                      <div>
                        <div className="text-slate-400 text-[10px]">Products</div>
                        <div className="font-bold text-white">{shopProducts.length} items</div>
                      </div>
                      <div className="h-6 w-px bg-slate-800" />
                      <div>
                        <div className="text-slate-400 text-[10px]">Total Sales</div>
                        <div className="font-bold text-emerald-400">
                          {settings.currencySymbol}{shopSales.toLocaleString()}
                        </div>
                      </div>
                      <div className="h-6 w-px bg-slate-800" />
                      <div>
                        <div className="text-slate-400 text-[10px]">Radius</div>
                        <div className="font-bold text-white">{shop.deliveryRadiusKm} km</div>
                      </div>
                    </div>

                    {/* Operational Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {shop.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => approveShop(shop.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-950 transition"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve Shop</span>
                          </button>
                          <button
                            onClick={() => handleRejectPrompt(shop.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}

                      {shop.status === 'APPROVED' && (
                        <button
                          onClick={() => handleSuspendPrompt(shop.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-medium transition"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Suspend Shop</span>
                        </button>
                      )}

                      {shop.status === 'SUSPENDED' && (
                        <button
                          onClick={() => reactivateShop(shop.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Reactivate Shop</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenEdit(shop)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Edit Settings</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Shop Modal */}
      {isEditModalOpen && selectedShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Edit Shop Operations: {selectedShop.name}</h3>
            <p className="text-xs text-slate-400 mb-4">
              Configure shop category, delivery dispatch distance, and vendor commission overrides.
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Shop Category</label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Commission Percentage (% Override)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  placeholder={`Leave blank to inherit default (${settings.globalCommissionRate}%)`}
                  value={editCommission}
                  onChange={(e) => setEditCommission(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Custom rate for this shop. Leave blank to inherit platform global rate of {settings.globalCommissionRate}%.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Max Delivery Radius (km)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={editDeliveryRadius}
                  onChange={(e) => setEditDeliveryRadius(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
