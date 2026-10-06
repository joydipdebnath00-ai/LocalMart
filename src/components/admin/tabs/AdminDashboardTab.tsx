import React, { useState } from 'react';
import { usePlatform } from '../../../context/PlatformContext';
import {
  Users,
  Store,
  Package,
  ShoppingBag,
  IndianRupee,
  Bike,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Percent,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

export const AdminDashboardTab: React.FC<{ onNavigateTab?: (tab: string) => void }> = ({ onNavigateTab }) => {
  const {
    users,
    shops,
    products,
    orders,
    payments,
    deliveryPartners,
    settings,
    financialStats,
  } = usePlatform();

  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | 'all'>('all');

  // Computed metrics
  const totalCustomers = users.filter((u) => u.role === 'CUSTOMER').length;
  const activeCustomers = users.filter((u) => u.role === 'CUSTOMER' && u.status === 'ACTIVE').length;

  const totalShops = shops.length;
  const pendingShops = shops.filter((s) => s.status === 'PENDING').length;
  const activeShops = shops.filter((s) => s.status === 'APPROVED').length;
  const suspendedShops = shops.filter((s) => s.status === 'SUSPENDED').length;

  const totalProducts = products.filter((p) => !p.isDeleted).length;
  const lowStockProducts = products.filter((p) => !p.isDeleted && p.stock <= 10).length;

  const totalOrders = orders.length;
  const todayOrders = orders.filter((o) => {
    const today = new Date().toISOString().slice(0, 10);
    return o.createdAt.slice(0, 10) === today;
  }).length;
  const pendingOrders = orders.filter((o) => ['PLACED', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP'].includes(o.orderStatus)).length;
  const completedOrders = orders.filter((o) => o.orderStatus === 'DELIVERED').length;
  const cancelledOrders = orders.filter((o) => o.orderStatus === 'CANCELLED').length;
  const cancellationRate = totalOrders > 0 ? Math.round((cancelledOrders / totalOrders) * 100) : 0;

  const successfulPayments = payments.filter((p) => p.status === 'PAID').length;
  const pendingPayments = payments.filter((p) => p.status === 'PENDING').length;
  const refundedPayments = payments.filter((p) => p.status === 'REFUNDED').length;
  const activeDeliveryPartners = deliveryPartners.filter((d) => d.status === 'ACTIVE').length;

  // Category counts
  const categoryCountMap: Record<string, number> = {};
  orders.forEach((o) => {
    o.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const cat = prod?.category || 'General';
      categoryCountMap[cat] = (categoryCountMap[cat] || 0) + item.quantity;
    });
  });

  return (
    <div className="space-y-6">
      {/* Top Welcome & Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Super Admin Master Overview</h1>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3" /> Live Feed
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time platform operations, database metrics, revenue flow, and marketplace health
          </p>
        </div>

        <div className="flex items-center gap-2">
          {pendingShops > 0 && (
            <button
              onClick={() => onNavigateTab && onNavigateTab('shops')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-medium hover:bg-amber-500/30 transition animate-pulse"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{pendingShops} Pending Shop Approval{pendingShops > 1 ? 's' : ''}</span>
            </button>
          )}

          <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700 text-xs">
            {(['today', '7d', '30d', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded-lg capitalize transition ${
                  timeRange === r ? 'bg-slate-700 text-white font-medium shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary Financial Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Gross Sales</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-white tracking-tight">
            {settings.currencySymbol}{financialStats.grossSales.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">Total customer checkouts</div>
        </div>

        <div className="bg-slate-900/90 border border-emerald-500/30 p-3.5 rounded-xl bg-gradient-to-br from-emerald-950/20 to-slate-900">
          <div className="flex items-center justify-between text-emerald-300 text-xs mb-1">
            <span className="font-semibold">Platform Revenue</span>
            <Percent className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-300 tracking-tight">
            {settings.currencySymbol}{financialStats.netPlatformRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{settings.globalCommissionRate}% base cut + fees</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Shop Earnings</span>
            <Store className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-lg font-bold text-white tracking-tight">
            {settings.currencySymbol}{financialStats.shopEarnings.toLocaleString()}
          </div>
          <div className="text-[11px] text-indigo-300 mt-1">Vendor net payable</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Delivery Fees</span>
            <Bike className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-white tracking-tight">
            {settings.currencySymbol}{financialStats.deliveryFees.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Collected from users</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Partner Payouts</span>
            <IndianRupee className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-lg font-bold text-white tracking-tight">
            {settings.currencySymbol}{financialStats.partnerEarnings.toLocaleString()}
          </div>
          <div className="text-[11px] text-blue-300 mt-1">Paid to riders</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Refunds Settled</span>
            <CreditCard className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-lg font-bold text-rose-300 tracking-tight">
            {settings.currencySymbol}{financialStats.refundsTotal.toLocaleString()}
          </div>
          <div className="text-[11px] text-rose-400 mt-1">Via Razorpay Refund API</div>
        </div>
      </div>

      {/* Operational 4-Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Shops Card */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Merchant Network</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Store className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-2">{totalShops} Shops</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active & Live:
                </span>
                <span className="font-semibold text-white">{activeShops}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Clock className="w-3.5 h-3.5" /> Pending Verification:
                </span>
                <span className="font-semibold text-amber-400">{pendingShops}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-rose-400">
                  <XCircle className="w-3.5 h-3.5" /> Suspended:
                </span>
                <span className="font-semibold text-rose-400">{suspendedShops}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab('shops')}
            className="mt-4 pt-3 border-t border-slate-800 text-xs text-indigo-400 hover:text-indigo-300 flex items-center justify-between"
          >
            <span>Manage All Shops</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Orders Card */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Order Volume</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-2">{totalOrders} Orders</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>In-Flight / Pending:</span>
                <span className="font-semibold text-amber-400">{pendingOrders}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Delivered Successfully:</span>
                <span className="font-semibold text-emerald-400">{completedOrders}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Cancelled / Returned:</span>
                <span className="font-semibold text-rose-400">{cancelledOrders} ({cancellationRate}%)</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab('orders')}
            className="mt-4 pt-3 border-t border-slate-800 text-xs text-emerald-400 hover:text-emerald-300 flex items-center justify-between"
          >
            <span>Review Live Orders</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Catalog & Inventory Card */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Product Inventory</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-2">{totalProducts} Listed SKUs</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>In Stock & Available:</span>
                <span className="font-semibold text-white">{totalProducts - lowStockProducts}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-amber-400">Low Stock Alert (&le;10 units):</span>
                <span className="font-semibold text-amber-400">{lowStockProducts} items</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Featured Promotions:</span>
                <span className="font-semibold text-white">{products.filter((p) => p.isFeatured && !p.isDeleted).length}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab('products')}
            className="mt-4 pt-3 border-t border-slate-800 text-xs text-blue-400 hover:text-blue-300 flex items-center justify-between"
          >
            <span>Audit Products Catalog</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Logistics & Users Card */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fleet & Consumers</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Bike className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-2">{activeDeliveryPartners} Active Riders</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Total Delivery Partners:</span>
                <span className="font-semibold text-white">{deliveryPartners.length}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Registered Customers:</span>
                <span className="font-semibold text-white">{totalCustomers} ({activeCustomers} Active)</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Payment Gateways:</span>
                <span className="font-semibold text-emerald-400">Razorpay + COD Online</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab('delivery')}
            className="mt-4 pt-3 border-t border-slate-800 text-xs text-purple-400 hover:text-purple-300 flex items-center justify-between"
          >
            <span>Configure Fleet & Rates</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Analytics Charts & Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Channels Breakdown */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-white">Payment Method & Settlement Split</h3>
            <span className="text-xs text-slate-400">Verified Gateways</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  Razorpay Online Payment (Cards/UPI)
                </span>
                <span className="text-white font-semibold">
                  {settings.currencySymbol}{financialStats.onlineSales.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2.5 rounded-full"
                  style={{
                    width: `${
                      financialStats.grossSales > 0
                        ? (financialStats.onlineSales / financialStats.grossSales) * 100
                        : 50
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-amber-400" />
                  Cash on Delivery (Doorstep COD)
                </span>
                <span className="text-white font-semibold">
                  {settings.currencySymbol}{financialStats.codSales.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-2.5 rounded-full"
                  style={{
                    width: `${
                      financialStats.grossSales > 0
                        ? (financialStats.codSales / financialStats.grossSales) * 100
                        : 50
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-800/60 p-2 rounded-xl">
                <div className="text-slate-400 text-[11px]">Successful</div>
                <div className="text-white font-bold">{successfulPayments}</div>
              </div>
              <div className="bg-slate-800/60 p-2 rounded-xl">
                <div className="text-slate-400 text-[11px]">Pending</div>
                <div className="text-amber-400 font-bold">{pendingPayments}</div>
              </div>
              <div className="bg-slate-800/60 p-2 rounded-xl">
                <div className="text-slate-400 text-[11px]">Refunds</div>
                <div className="text-rose-400 font-bold">{refundedPayments}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performing Shops */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-white">Top Marketplace Shops</h3>
            <span className="text-xs text-slate-400">By Sales & Commission</span>
          </div>

          <div className="space-y-3">
            {shops.slice(0, 3).map((shop) => {
              const shopOrders = orders.filter((o) => o.shopId === shop.id && o.orderStatus === 'DELIVERED');
              const shopSales = shopOrders.reduce((sum, o) => sum + o.total, 0);
              const shopCut = shop.commissionRate !== null ? shop.commissionRate : settings.globalCommissionRate;

              return (
                <div key={shop.id} className="flex items-center justify-between p-2.5 bg-slate-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <img src={shop.logo} alt={shop.name} className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <div className="text-xs font-semibold text-white">{shop.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>{shop.category}</span>
                        <span>·</span>
                        <span className="text-emerald-400 font-medium">{shopCut}% Comm.</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-white">
                      {settings.currencySymbol}{shopSales.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {shopOrders.length} order{shopOrders.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Low Stock Alerts & Recent Operational Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Watch */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Low Stock Inventory Monitor</h3>
            </div>
            <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full font-medium">
              &le; 10 Units Remaining
            </span>
          </div>

          {lowStockProducts === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">All product stocks are healthy.</p>
          ) : (
            <div className="space-y-2">
              {products
                .filter((p) => !p.isDeleted && p.stock <= 10)
                .slice(0, 4)
                .map((prod) => (
                  <div key={prod.id} className="flex items-center justify-between p-2.5 bg-slate-800/40 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <img src={prod.image} alt={prod.name} className="w-9 h-9 rounded-lg object-cover" />
                      <div>
                        <div className="text-xs font-medium text-white line-clamp-1">{prod.name}</div>
                        <div className="text-[10px] text-slate-400">{prod.shopName}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-xs font-bold rounded-md">
                        {prod.stock} in stock
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Live Orders Feed */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-white">Recent Order Submissions</h3>
            <button
              onClick={() => onNavigateTab && onNavigateTab('orders')}
              className="text-xs text-emerald-400 hover:underline"
            >
              View All ({orders.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {orders.slice(0, 4).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-2.5 bg-slate-800/40 rounded-xl border border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-2">
                    <span>{order.id}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                        order.orderStatus === 'DELIVERED'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : order.orderStatus === 'CANCELLED'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {order.customerName} · {order.shopName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-white">
                    {settings.currencySymbol}{order.total}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase">{order.paymentMethod}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
