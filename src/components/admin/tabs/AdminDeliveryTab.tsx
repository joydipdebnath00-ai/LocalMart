import React, { useState } from 'react';
import { usePlatform } from '../../../context/PlatformContext';
import { DeliveryPartner } from '../../../types';
import {
  Bike,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Search,
  Star,
  Settings,
  Shield,
  Phone,
  Mail,
  IndianRupee,
} from 'lucide-react';

export const AdminDeliveryTab: React.FC = () => {
  const {
    deliveryPartners,
    addDeliveryPartner,
    approveDeliveryPartner,
    suspendDeliveryPartner,
    settings,
    updateSettings,
    orders,
  } = usePlatform();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Delivery rate configuration form state
  const [baseFee, setBaseFee] = useState(String(settings.baseDeliveryFee));
  const [perKmFee, setPerKmFee] = useState(String(settings.perKmDeliveryFee));
  const [freeThreshold, setFreeThreshold] = useState(String(settings.freeDeliveryThreshold));
  const [maxRadius, setMaxRadius] = useState(String(settings.maxDeliveryRadiusKm));

  // New partner state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [vehicleType, setVehicleType] = useState<'BIKE' | 'SCOOTER' | 'VAN'>('BIKE');
  const [vehicleNumber, setVehicleNumber] = useState('');

  const filteredPartners = deliveryPartners.filter((p) => {
    return (
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      p.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      baseDeliveryFee: Number(baseFee) || 40,
      perKmDeliveryFee: Number(perKmFee) || 8,
      freeDeliveryThreshold: Number(freeThreshold) || 500,
      maxDeliveryRadiusKm: Number(maxRadius) || 15,
    });
    alert('Delivery fee & radius settings updated platform-wide!');
  };

  const handleAddPartner = (e: React.FormEvent) => {
    e.preventDefault();
    addDeliveryPartner({
      name: newName,
      email: newEmail,
      phone: newPhone,
      vehicleType,
      vehicleNumber,
      status: 'ACTIVE',
    });
    setIsAddModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setVehicleNumber('');
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white">Logistics & Delivery Fleet Management</h2>
          <p className="text-xs text-slate-400">
            Courier onboarding, verification status, zone dispatch rules, and per-km pricing models
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search rider, vehicle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none"
            />
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Onboard Rider</span>
          </button>
        </div>
      </div>

      {/* Fleet Configuration Settings Box */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Delivery Fee & Dispatch Distance Settings</h3>
        </div>

        <form onSubmit={handleSaveRates} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Base Delivery Fee ({settings.currencySymbol})
            </label>
            <input
              type="number"
              value={baseFee}
              onChange={(e) => setBaseFee(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">Applied to standard orders</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Per-Km Surcharge ({settings.currencySymbol}/km)
            </label>
            <input
              type="number"
              value={perKmFee}
              onChange={(e) => setPerKmFee(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">Beyond base radius</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Free Delivery Order Threshold ({settings.currencySymbol})
            </label>
            <input
              type="number"
              value={freeThreshold}
              onChange={(e) => setFreeThreshold(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">Cart total for free delivery</span>
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Max Delivery Radius (km)
              </label>
              <input
                type="number"
                value={maxRadius}
                onChange={(e) => setMaxRadius(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="mt-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition"
            >
              Update Pricing Rules
            </button>
          </div>
        </form>
      </div>

      {/* Delivery Partners Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Delivery Partner</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Vehicle Details</th>
                <th className="py-3 px-4">Performance & Rating</th>
                <th className="py-3 px-4">Total Earnings</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPartners.map((dp) => (
                <tr key={dp.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{dp.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">ID: {dp.id}</div>
                  </td>

                  <td className="py-3 px-4 text-slate-300">
                    <div className="flex items-center gap-1.5 text-white">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{dp.phone}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">{dp.email}</div>
                  </td>

                  <td className="py-3 px-4 text-slate-300">
                    <div className="font-medium text-white flex items-center gap-1.5">
                      <Bike className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{dp.vehicleType}</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">{dp.vehicleNumber}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{dp.rating}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">{dp.totalDeliveries} completed deliveries</div>
                  </td>

                  <td className="py-3 px-4 font-bold text-emerald-400">
                    {settings.currencySymbol}{dp.earnings.toLocaleString()}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-block text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        dp.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : dp.status === 'PENDING'
                          ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {dp.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {dp.status === 'PENDING' && (
                        <button
                          onClick={() => approveDeliveryPartner(dp.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                        >
                          Approve
                        </button>
                      )}

                      {dp.status === 'ACTIVE' && (
                        <button
                          onClick={() => suspendDeliveryPartner(dp.id)}
                          className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-medium"
                        >
                          Suspend
                        </button>
                      )}

                      {dp.status === 'SUSPENDED' && (
                        <button
                          onClick={() => approveDeliveryPartner(dp.id)}
                          className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium"
                        >
                          Reactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Partner Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Onboard Delivery Partner</h3>
            <p className="text-xs text-slate-400 mb-4">
              Add a verified logistics rider to the dispatch fleet.
            </p>

            <form onSubmit={handleAddPartner} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98000 11223"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="ramesh.delivery@marketpulse.in"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Vehicle Type</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="BIKE">Motorcycle</option>
                    <option value="SCOOTER">Scooter</option>
                    <option value="VAN">Van / Electric Cargo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">License Plate</label>
                  <input
                    type="text"
                    required
                    placeholder="HR-26-BQ-1234"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
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
                  Onboard Fleet Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
