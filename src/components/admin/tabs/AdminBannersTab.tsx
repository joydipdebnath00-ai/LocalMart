import React, { useState } from 'react';
import { usePlatform } from '../../../context/PlatformContext';
import { PromotionalBanner } from '../../../types';
import {
  Image,
  Plus,
  Trash2,
  Power,
  PowerOff,
  ExternalLink,
  Store,
  Layers,
} from 'lucide-react';

export const AdminBannersTab: React.FC = () => {
  const { banners, createBanner, updateBanner, deleteBanner, shops } = usePlatform();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [targetType, setTargetType] = useState<'SHOP' | 'CATEGORY' | 'EXTERNAL'>('SHOP');
  const [targetValue, setTargetValue] = useState(shops[0]?.id || '');
  const [badge, setBadge] = useState('HOT DEAL');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createBanner({
      title,
      subtitle,
      imageUrl:
        imageUrl ||
        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80',
      targetType,
      targetValue,
      badge,
      isActive: true,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
    setIsAddModalOpen(false);
    setTitle('');
    setSubtitle('');
    setImageUrl('');
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white">Promotional Banners & Spotlight Ads</h2>
          <p className="text-xs text-slate-400">
            Control dynamic homepage banners, sponsored vendor spotlights, and festive campaigns rendered in mobile app
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Banner</span>
        </button>
      </div>

      {/* Banner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className={`bg-slate-900 border rounded-2xl overflow-hidden transition-all flex flex-col justify-between ${
              banner.isActive ? 'border-slate-800' : 'border-slate-800/40 opacity-60'
            }`}
          >
            <div>
              <div className="relative h-36 bg-slate-800">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-4 flex flex-col justify-end">
                  {banner.badge && (
                    <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full w-fit uppercase mb-1">
                      {banner.badge}
                    </span>
                  )}
                  <h3 className="text-base font-bold text-white drop-shadow-md">{banner.title}</h3>
                  <p className="text-xs text-slate-200 drop-shadow-xs">{banner.subtitle}</p>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between text-xs text-slate-400 border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    Linked Target: <strong className="text-white">{banner.targetValue}</strong>
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    banner.isActive
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {banner.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between text-xs">
              <button
                onClick={() => updateBanner(banner.id, { isActive: !banner.isActive })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                  banner.isActive
                    ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {banner.isActive ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                <span>{banner.isActive ? 'Disable from App' : 'Publish Live'}</span>
              </button>

              <button
                onClick={() => {
                  if (confirm(`Delete banner "${banner.title}"?`)) {
                    deleteBanner(banner.id);
                  }
                }}
                className="text-slate-500 hover:text-rose-400 transition p-1.5 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Banner Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Create Promotional Banner</h3>
            <p className="text-xs text-slate-400 mb-4">
              Add responsive spotlight banner to customer mobile dashboard.
            </p>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Main Heading</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekend Biryani Carnival"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Subtitle / Promo Pitch</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Free gulab jamun with any bucket biryani"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Badge Tag</label>
                <input
                  type="text"
                  placeholder="e.g. LIMITED OFFER, CHEF SPECIAL"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Shop</label>
                <select
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                >
                  {shops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition"
                >
                  Publish Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
