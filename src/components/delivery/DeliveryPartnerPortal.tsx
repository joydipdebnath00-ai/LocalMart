import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { DeliveryPartner } from '../../types';
import {
  Bike,
  MapPin,
  CheckCircle2,
  Phone,
  Package,
  IndianRupee,
  Navigation,
  Star,
  Clock,
  Store,
} from 'lucide-react';

export const DeliveryPartnerPortal: React.FC = () => {
  const {
    deliveryPartners,
    currentDeliveryPartner,
    setCurrentDeliveryPartner,
    orders,
    partnerPickupOrder,
    partnerDeliverOrder,
    settings,
  } = usePlatform();

  // Active rider
  const rider = currentDeliveryPartner || deliveryPartners.find((d) => d.status === 'ACTIVE') || deliveryPartners[0];

  // Orders assigned to this partner
  const assignedOrders = orders.filter((o) => o.deliveryPartnerId === rider?.id);
  const activeDelivery = assignedOrders.find((o) => ['READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'].includes(o.orderStatus));

  return (
    <div className="max-w-md mx-auto p-4 space-y-5 text-slate-100">
      {/* Rider Profile Card & Switcher */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">{rider?.name}</h3>
              <div className="text-[11px] text-slate-400">
                {rider?.vehicleType} · {rider?.vehicleNumber}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" /> {rider?.rating}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">{rider?.totalDeliveries} Deliveries</span>
          </div>
        </div>

        {/* Rider Switcher */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Switch Rider:</span>
          <select
            value={rider?.id}
            onChange={(e) => {
              const p = deliveryPartners.find((item) => item.id === e.target.value);
              if (p) setCurrentDeliveryPartner(p);
            }}
            className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
          >
            {deliveryPartners.map((dp) => (
              <option key={dp.id} value={dp.id}>
                {dp.name} ({dp.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Trip Dispatch Card */}
      {activeDelivery ? (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
                Active Assigned Delivery
              </span>
              <h4 className="font-mono font-bold text-white text-base mt-1.5">{activeDelivery.id}</h4>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Payout Earnings</span>
              <span className="font-bold text-emerald-400 text-sm">
                +{settings.currencySymbol}{activeDelivery.deliveryPartnerEarnings}
              </span>
            </div>
          </div>

          {/* Route Map Simulation */}
          <div className="space-y-3 bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 text-xs">
            {/* Step 1: Shop Pickup */}
            <div className="flex items-start gap-2.5">
              <Store className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-400 block">PICK UP AT STORE:</span>
                <strong className="text-white text-xs">{activeDelivery.shopName}</strong>
              </div>
            </div>

            <div className="h-4 w-px bg-slate-700 ml-2" />

            {/* Step 2: Customer Delivery */}
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-400 block">DELIVER TO CUSTOMER:</span>
                <strong className="text-white text-xs">{activeDelivery.customerName}</strong>
                <p className="text-[11px] text-slate-300 mt-0.5">{activeDelivery.deliveryAddress}</p>
              </div>
            </div>
          </div>

          {/* COD Notice */}
          {activeDelivery.paymentMethod === 'COD' && (
            <div className="bg-amber-950/20 border border-amber-500/30 p-3 rounded-2xl text-xs text-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-amber-400" />
                <span>Collect Cash from Customer:</span>
              </div>
              <strong className="text-white font-bold text-sm">
                {settings.currencySymbol}{activeDelivery.total}
              </strong>
            </div>
          )}

          {/* Courier Action Buttons for Acceptance Test Steps */}
          <div className="space-y-2 pt-2">
            {activeDelivery.orderStatus === 'READY_FOR_PICKUP' && (
              <button
                onClick={() => partnerPickupOrder(activeDelivery.id)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs transition shadow-lg shadow-blue-950 flex items-center justify-center gap-2"
              >
                <Package className="w-4 h-4" />
                <span>Step 22: Pick Up Order from Shop</span>
              </button>
            )}

            {activeDelivery.orderStatus === 'OUT_FOR_DELIVERY' && (
              <button
                onClick={() => partnerDeliverOrder(activeDelivery.id)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs transition shadow-lg shadow-emerald-950 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  Step 25: Mark Order Delivered
                  {activeDelivery.paymentMethod === 'COD' ? ' & Collect Cash' : ''}
                </span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-xs text-slate-400 space-y-2">
          <Bike className="w-8 h-8 text-slate-600 mx-auto" />
          <p>No active delivery assigned to you right now.</p>
          <p className="text-[11px] text-slate-500">
            When the Super Admin assigns you an order in Step 20, it will appear here immediately!
          </p>
        </div>
      )}

      {/* Completed History & Earnings */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3">
        <h4 className="font-bold text-xs text-white">Your Delivery Earnings</h4>
        <div className="p-3 bg-slate-800/60 rounded-2xl flex justify-between items-center text-xs">
          <span className="text-slate-400">Total Lifetime Payout:</span>
          <span className="font-bold text-emerald-400 text-sm">
            {settings.currencySymbol}{rider?.earnings.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
