import React, { useState } from 'react';
import { usePlatform } from '../../../context/PlatformContext';
import { Order, OrderStatus } from '../../../types';
import {
  ShoppingBag,
  Search,
  Bike,
  CreditCard,
  IndianRupee,
  MapPin,
  Clock,
  RotateCcw,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Eye,
  Send,
  Phone,
  User,
  Store,
  DollarSign,
} from 'lucide-react';

export const AdminOrdersTab: React.FC = () => {
  const {
    orders,
    deliveryPartners,
    settings,
    assignDeliveryPartner,
    cancelOrder,
    initiateRefund,
  } = usePlatform();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [targetPartnerId, setTargetPartnerId] = useState('');

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.deliveryPartnerName && o.deliveryPartnerName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAssign = (order: Order) => {
    setSelectedOrder(order);
    const activePartners = deliveryPartners.filter((p) => p.status === 'ACTIVE');
    setTargetPartnerId(activePartners[0]?.id || '');
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssign = () => {
    if (!selectedOrder || !targetPartnerId) return;
    assignDeliveryPartner(selectedOrder.id, targetPartnerId);
    setIsAssignModalOpen(false);
  };

  const handleCancelOrder = (order: Order) => {
    const reason = prompt(`Enter cancellation reason for order ${order.id}:`, 'Customer requested cancellation prior to dispatch');
    if (reason) {
      cancelOrder(order.id, reason);
    }
  };

  const handleInitiateRefund = (order: Order) => {
    const refundAmountStr = prompt(`Initiate Razorpay refund for order ${order.id}. Enter amount:`, String(order.total));
    if (refundAmountStr && !isNaN(Number(refundAmountStr))) {
      const reason = prompt('Reason for refund:', 'Item quality concern / customer dispute resolution') || 'Dispute resolution';
      initiateRefund(order.id, Number(refundAmountStr), reason);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white">Central Order Orchestration</h2>
          <p className="text-xs text-slate-400">
            Real-time multi-shop order stream, delivery partner dispatch, disputes, and financial audit logs
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search order ID, buyer, shop..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
          >
            <option value="ALL">All Statuses ({orders.length})</option>
            <option value="PLACED">PLACED</option>
            <option value="ACCEPTED">ACCEPTED</option>
            <option value="PREPARING">PREPARING</option>
            <option value="READY_FOR_PICKUP">READY FOR PICKUP</option>
            <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Shop & Items</th>
                <th className="py-3 px-4">Financials</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status & Logistics</th>
                <th className="py-3 px-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No orders match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-white text-xs">{order.id}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      <div className="font-semibold text-white">{order.customerName}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5" /> {order.customerPhone}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1 max-w-[180px]">
                        {order.deliveryAddress}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{order.shopName}</div>
                      <div className="text-[11px] text-slate-400">
                        {order.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-xs">
                        {settings.currencySymbol}{order.total}
                      </div>
                      <div className="text-[10px] text-slate-400 space-y-0.5 mt-0.5">
                        <div>Subtotal: {settings.currencySymbol}{order.subtotal}</div>
                        {order.discount > 0 && (
                          <div className="text-emerald-400">Disc: -{settings.currencySymbol}{order.discount}</div>
                        )}
                        <div className="text-emerald-300">Platform Cut: {settings.currencySymbol}{order.platformCommission} ({order.platformCommissionRate}%)</div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-medium">
                        {order.paymentMethod === 'RAZORPAY' ? (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <CreditCard className="w-3 h-3" /> Razorpay
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-400">
                            <IndianRupee className="w-3 h-3" /> Cash on Delivery
                          </span>
                        )}
                      </div>
                      <span
                        className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          order.paymentStatus === 'PAID'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : order.paymentStatus === 'REFUNDED'
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                          order.orderStatus === 'DELIVERED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : order.orderStatus === 'CANCELLED'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : order.orderStatus === 'OUT_FOR_DELIVERY'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {order.orderStatus}
                      </span>

                      <div className="mt-1 text-[11px] text-slate-300 flex items-center gap-1">
                        <Bike className="w-3 h-3 text-slate-400" />
                        {order.deliveryPartnerName ? (
                          <span>{order.deliveryPartnerName}</span>
                        ) : (
                          <span className="text-amber-400 font-medium">Unassigned Rider</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Assign Delivery Partner button */}
                        {order.orderStatus !== 'DELIVERED' && order.orderStatus !== 'CANCELLED' && (
                          <button
                            onClick={() => handleOpenAssign(order)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white rounded-lg text-xs font-semibold border border-indigo-500/40 transition"
                          >
                            <Bike className="w-3 h-3" />
                            <span>{order.deliveryPartnerName ? 'Reassign' : 'Assign Rider'}</span>
                          </button>
                        )}

                        {/* View Order Details button */}
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
                          title="View Order Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Refund button */}
                        {order.paymentStatus === 'PAID' && (
                          <button
                            onClick={() => handleInitiateRefund(order)}
                            title="Initiate Razorpay Refund"
                            className="p-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/30 transition"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Cancel order button */}
                        {order.orderStatus !== 'DELIVERED' && order.orderStatus !== 'CANCELLED' && (
                          <button
                            onClick={() => handleCancelOrder(order)}
                            title="Administrative Order Cancel"
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-lg border border-rose-500/30 transition"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Delivery Partner Modal */}
      {isAssignModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              Assign Delivery Partner
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Dispatch fleet partner to pick up order <span className="text-white font-mono">{selectedOrder.id}</span> from {selectedOrder.shopName}.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Select Delivery Partner</label>
                <select
                  value={targetPartnerId}
                  onChange={(e) => setTargetPartnerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                >
                  {deliveryPartners
                    .filter((p) => p.status === 'ACTIVE')
                    .map((dp) => (
                      <option key={dp.id} value={dp.id}>
                        {dp.name} ({dp.vehicleType} · {dp.vehicleNumber}) - Rating {dp.rating}★
                      </option>
                    ))}
                </select>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-xl text-xs space-y-1 text-slate-300">
                <div>Pickup: <strong className="text-white">{selectedOrder.shopName}</strong></div>
                <div>Drop-off: <strong className="text-white">{selectedOrder.deliveryAddress}</strong></div>
                <div>Rider Compensation: <strong className="text-emerald-400">{settings.currencySymbol}{selectedOrder.deliveryPartnerEarnings}</strong></div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAssign}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <Bike className="w-3.5 h-3.5" />
                  <span>Confirm Dispatch</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Order Details Modal */}
      {selectedOrder && !isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Order Details: {selectedOrder.id}</h3>
                <span className="text-xs text-slate-400">Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Items Table */}
              <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
                <div className="font-semibold text-white mb-2">Order Line Items ({selectedOrder.items.length})</div>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-slate-300">
                      <div className="flex items-center gap-2">
                        <img src={item.image} alt="" className="w-8 h-8 rounded object-cover" />
                        <div>
                          <div className="text-white font-medium">{item.productName}</div>
                          <div className="text-[10px] text-slate-400">Qty: {item.quantity} × {settings.currencySymbol}{item.price}</div>
                        </div>
                      </div>
                      <div className="font-bold text-white">{settings.currencySymbol}{item.price * item.quantity}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 space-y-1.5">
                <div className="font-semibold text-white mb-1">Financial Reconciliation</div>
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span className="text-white">{settings.currencySymbol}{selectedOrder.subtotal}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount ({selectedOrder.appliedCoupon}):</span>
                    <span>-{settings.currencySymbol}{selectedOrder.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Delivery Fee:</span>
                  <span className="text-white">{settings.currencySymbol}{selectedOrder.deliveryFee}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>GST / Tax:</span>
                  <span className="text-white">{settings.currencySymbol}{selectedOrder.tax}</span>
                </div>
                <div className="flex justify-between font-bold text-white pt-1 border-t border-slate-700 text-sm">
                  <span>Gross Total:</span>
                  <span className="text-emerald-400">{settings.currencySymbol}{selectedOrder.total}</span>
                </div>

                <div className="pt-2 border-t border-slate-700 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-900/80 p-2 rounded-lg">
                    <span className="text-slate-400 block">Platform Commission:</span>
                    <strong className="text-emerald-300">{settings.currencySymbol}{selectedOrder.platformCommission} ({selectedOrder.platformCommissionRate}%)</strong>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg">
                    <span className="text-slate-400 block">Vendor Net Payout:</span>
                    <strong className="text-indigo-300">{settings.currencySymbol}{selectedOrder.shopEarnings}</strong>
                  </div>
                </div>
              </div>

              {/* Status History */}
              <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
                <div className="font-semibold text-white mb-2">Audit Status Timeline</div>
                <div className="space-y-2">
                  {selectedOrder.statusHistory.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px]">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shrink-0" />
                      <div>
                        <strong className="text-white uppercase">{h.status}: </strong>
                        <span className="text-slate-300">{h.note}</span>
                        <div className="text-[10px] text-slate-500">{new Date(h.timestamp).toLocaleTimeString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review if present */}
              {selectedOrder.review && (
                <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-xl p-3">
                  <div className="font-semibold text-indigo-300 mb-1 flex items-center gap-1">
                    <span>Verified Customer Review: {selectedOrder.review.rating} / 5 Stars</span>
                  </div>
                  <p className="text-slate-300 italic">"{selectedOrder.review.comment}"</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
