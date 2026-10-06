import React, { useState } from 'react';
import { usePlatform } from '../../../context/PlatformContext';
import { NotificationRecord } from '../../../types';
import {
  Bell,
  Send,
  Users,
  Store,
  Bike,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export const AdminNotificationsTab: React.FC = () => {
  const { notifications, sendNotification } = usePlatform();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetRole, setTargetRole] = useState<NotificationRecord['targetRole']>('ALL');
  const [category, setCategory] = useState<NotificationRecord['category']>('SYSTEM');
  const [isSent, setIsSent] = useState(false);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    sendNotification(title.trim(), body.trim(), targetRole, category);
    setIsSent(true);
    setTimeout(() => setIsSent(false), 3000);

    setTitle('');
    setBody('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white">Targeted Broadcast Push Notifications</h2>
          <p className="text-xs text-slate-400">
            Dispatch instant system alerts, flash sales, and operational updates across user segments
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Push Notification Composer */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-400" />
            <span>Compose Push Broadcast</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Push immediately to mobile inboxes and device heads-up banners.
          </p>

          {isSent && (
            <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Broadcast dispatched successfully!</span>
            </div>
          )}

          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Audience</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(
                  [
                    { id: 'ALL', label: 'All Users', icon: Users },
                    { id: 'CUSTOMER', label: 'Customers', icon: Users },
                    { id: 'SHOP_OWNER', label: 'Shop Owners', icon: Store },
                    { id: 'DELIVERY_PARTNER', label: 'Couriers', icon: Bike },
                  ] as const
                ).map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setTargetRole(role.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border transition ${
                        targetRole === role.id
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="font-semibold text-[11px]">{role.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Notification Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Flash 50% Off Biryani Night!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Message Content</label>
              <textarea
                rows={3}
                required
                placeholder="Message body sent to user notification drawer..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
              >
                <option value="SYSTEM">System & Platform Announcement</option>
                <option value="PROMO">Promotional Deal</option>
                <option value="ORDER">Operational Logistics</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-emerald-950 flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Now</span>
            </button>
          </form>
        </div>

        {/* Right: Broadcast History Stream */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-400" />
            <span>Dispatched History Log ({notifications.length})</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Record of recent push notifications delivered to user devices.
          </p>

          <div className="space-y-3 max-h-[480px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No notifications broadcasted yet. Send your first broadcast from the left form!
              </div>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className="p-3.5 bg-slate-800/50 border border-slate-800 rounded-xl text-xs">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-white text-xs">{notif.title}</span>
                    <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded-full text-slate-300 font-semibold uppercase">
                      To: {notif.targetRole}
                    </span>
                  </div>

                  <p className="text-slate-300 text-[11px] mb-2">{notif.body}</p>

                  <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-slate-800">
                    <span>Sender: {notif.sentBy}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(notif.sentAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
