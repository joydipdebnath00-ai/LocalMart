import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { Shop, Product, Order } from '../../types';
import {
  Store,
  Package,
  ShoppingBag,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Percent,
  Eye,
  UtensilsCrossed,
} from 'lucide-react';

export const ShopOwnerPortal: React.FC = () => {
  const {
    shops,
    currentShop,
    setCurrentShop,
    products,
    addProduct,
    orders,
    shopAcceptOrder,
    shopPrepareOrder,
    shopReadyOrder,
    settings,
  } = usePlatform();

  // If no shop selected, select Royal Spice Biryani (the shop used in acceptance test)
  const activeShop = currentShop || shops.find((s) => s.id === 'shop_royal_biryani') || shops[0];

  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'analytics'>('orders');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // New product form
  const [prodName, setProdName] = useState('Chicken Biryani Special');
  const [prodDesc, setProdDesc] = useState('Aromatic spiced basmati rice slow cooked with tender chicken.');
  const [prodPrice, setProdPrice] = useState('350');
  const [prodCategory, setProdCategory] = useState('Mains');
  const [prodImage, setProdImage] = useState('https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80');
  const [prodStock, setProdStock] = useState('30');

  const shopOrders = orders.filter((o) => o.shopId === activeShop?.id);
  const shopProducts = products.filter((p) => p.shopId === activeShop?.id && !p.isDeleted);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShop) return;

    addProduct({
      shopId: activeShop.id,
      shopName: activeShop.name,
      name: prodName,
      description: prodDesc,
      price: Number(prodPrice) || 199,
      category: prodCategory,
      image: prodImage,
      stock: Number(prodStock) || 20,
      isAvailable: true,
      isFeatured: false,
    });

    setIsAddProductOpen(false);
    alert(`Product "${prodName}" added successfully to your menu!`);
  };

  const effectiveCommission =
    activeShop?.commissionRate !== null ? activeShop?.commissionRate : settings.globalCommissionRate;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Shop Selector Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">{activeShop?.name}</h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  activeShop?.status === 'APPROVED'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : activeShop?.status === 'PENDING'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                    : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {activeShop?.status}
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Owner: {activeShop?.ownerName} ({activeShop?.ownerPhone})
            </div>
          </div>
        </div>

        {/* Switch Shop for Simulation */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Simulate Shop:</span>
          <select
            value={activeShop?.id}
            onChange={(e) => {
              const s = shops.find((item) => item.id === e.target.value);
              if (s) setCurrentShop(s);
            }}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
          >
            {shops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* PENDING APPROVAL WARNING BANNER */}
      {activeShop?.status === 'PENDING' && (
        <div className="bg-amber-950/20 border border-amber-500/40 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300 block font-semibold mb-0.5">
              Shop Application Awaiting Super Admin Approval
            </strong>
            Your merchant account has been submitted. The Platform Owner must approve this shop in the Super Admin Console before it becomes visible in the Customer Mobile App. (Acceptance Test Step 2).
          </div>
        </div>
      )}

      {/* SUSPENDED WARNING BANNER */}
      {activeShop?.status === 'SUSPENDED' && (
        <div className="bg-rose-950/20 border border-rose-500/40 rounded-2xl p-4 flex items-start gap-3 text-xs text-rose-200">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-rose-300 block font-semibold mb-0.5">
              Shop Suspended by Platform Administration
            </strong>
            Reason: {activeShop.suspensionReason || 'Compliance review'}. This shop is hidden from customers.
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'orders' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Live Incoming Orders ({shopOrders.filter((o) => ['PLACED', 'ACCEPTED', 'PREPARING'].includes(o.orderStatus)).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'products' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Menu & Catalog ({shopProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'analytics' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Merchant Payouts & Commission</span>
        </button>
      </div>

      {/* Tab 1: Orders Processing */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {shopOrders.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
              No orders placed for this shop yet. Place an order in the Customer App to test!
            </div>
          ) : (
            shopOrders.map((order) => (
              <div
                key={order.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-sm">{order.id}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          order.orderStatus === 'DELIVERED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Customer: <strong className="text-white">{order.customerName}</strong> ({order.customerPhone})
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-white text-sm">
                      {settings.currencySymbol}{order.total}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase">
                      Payment: {order.paymentMethod} ({order.paymentStatus})
                    </div>
                  </div>
                </div>

                {/* Items in order */}
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60 text-xs">
                  <div className="font-semibold text-slate-300 mb-1">Items Ordered:</div>
                  <div className="space-y-1">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-slate-300">
                        <span>{it.quantity}x {it.productName}</span>
                        <span className="font-mono">{settings.currencySymbol}{it.price * it.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons for Shop Status Progression */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  {order.orderStatus === 'PLACED' && (
                    <button
                      onClick={() => shopAcceptOrder(order.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
                    >
                      Step 17: Accept Order
                    </button>
                  )}

                  {order.orderStatus === 'ACCEPTED' && (
                    <button
                      onClick={() => shopPrepareOrder(order.id)}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
                    >
                      Step 18: Start Preparing Order
                    </button>
                  )}

                  {order.orderStatus === 'PREPARING' && (
                    <button
                      onClick={() => shopReadyOrder(order.id)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
                    >
                      Mark Ready for Courier Pickup
                    </button>
                  )}

                  {['READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.orderStatus) && (
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Courier Dispatched: {order.deliveryPartnerName || 'Assigned to Fleet'}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Products Catalog */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">Menu & Inventory</h3>
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Product (Step 4)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {shopProducts.map((p) => (
              <div key={p.id} className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
                <img src={p.image} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white text-xs truncate">{p.name}</h4>
                  <div className="text-[10px] text-slate-400 line-clamp-1">{p.description}</div>
                  <div className="flex justify-between items-center mt-1 text-xs">
                    <span className="font-bold text-white">{settings.currencySymbol}{p.price}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Stock: {p.stock}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Analytics & Payouts */}
      {activeTab === 'analytics' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white">Merchant Financial Statement</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-800/50 rounded-xl">
              <span className="text-slate-400 block text-[11px]">Total Delivered Orders:</span>
              <strong className="text-white text-base">
                {shopOrders.filter((o) => o.orderStatus === 'DELIVERED').length}
              </strong>
            </div>

            <div className="p-3 bg-slate-800/50 rounded-xl">
              <span className="text-slate-400 block text-[11px]">Gross Menu Sales:</span>
              <strong className="text-white text-base">
                {settings.currencySymbol}
                {shopOrders.filter((o) => o.orderStatus === 'DELIVERED').reduce((sum, o) => sum + o.total, 0).toLocaleString()}
              </strong>
            </div>

            <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl">
              <span className="text-emerald-300 block text-[11px]">Net Vendor Disbursed:</span>
              <strong className="text-emerald-400 text-base">
                {settings.currencySymbol}
                {shopOrders.filter((o) => o.orderStatus === 'DELIVERED').reduce((sum, o) => sum + o.shopEarnings, 0).toLocaleString()}
              </strong>
            </div>
          </div>

          <div className="p-3 bg-slate-800/40 rounded-xl text-slate-300">
            Platform Commission Applied to this Shop: <strong className="text-emerald-400">{effectiveCommission}%</strong>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Add Product to {activeShop.name}</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter product details and price to publish immediately.
            </p>

            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Stock</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Image URL</label>
                <input
                  type="url"
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition"
                >
                  Add Product (Step 4)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
