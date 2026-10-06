import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { Shop, Product, PaymentMethod } from '../../types';
import {
  MapPin,
  Search,
  ShoppingBag,
  Star,
  ChevronRight,
  Plus,
  Minus,
  Trash2,
  Tag,
  CreditCard,
  IndianRupee,
  AlertTriangle,
  Clock,
  Bike,
  CheckCircle2,
  User,
  ArrowLeft,
  X,
  Phone,
  Sparkles,
  Shield,
  Lock,
} from 'lucide-react';

export const CustomerApp: React.FC = () => {
  const {
    settings,
    shops,
    products,
    banners,
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartDiscount,
    cartDeliveryFee,
    cartTax,
    cartTotal,
    appliedCoupon,
    applyCouponCode,
    removeCoupon,
    deliveryAddress,
    setDeliveryAddress,
    selectedLocation,
    setSelectedLocation,
    createOrder,
    verifyRazorpayPayment,
    orders,
    currentUser,
    customerRegister,
    customerReviewOrder,
    setActiveRoleView,
  } = usePlatform();

  // Navigation state in mobile app
  // 'home' | 'shop_detail' | 'cart' | 'checkout' | 'order_tracking' | 'profile'
  const [currentScreen, setCurrentScreen] = useState<'home' | 'shop_detail' | 'cart' | 'checkout' | 'order_tracking' | 'profile'>('home');
  const [activeShop, setActiveShop] = useState<Shop | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('RAZORPAY');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);

  // Razorpay mock modal state
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [razorpayOrderData, setRazorpayOrderData] = useState<{ id: string; amount: number; currency: string } | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  // Review modal state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Register form for new customer
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');

  // MAINTENANCE MODE BARRIER:
  // If Super Admin enables Maintenance Mode, customer app stops and shows maintenance announcement!
  if (settings.isMaintenanceMode) {
    return (
      <div className="max-w-md mx-auto my-8 bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 text-center shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4 animate-pulse">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Platform Under Scheduled Maintenance</h2>
        <p className="text-xs text-amber-300/90 bg-amber-950/30 border border-amber-500/20 p-4 rounded-xl leading-relaxed mb-6">
          {settings.maintenanceMessage}
        </p>
        <div className="text-[11px] text-slate-400">
          Our engineering team is executing seamless system upgrades. The Super Admin Console remains operational.
        </div>
      </div>
    );
  }

  // Filter approved shops ONLY.
  // CRITICAL RULE: A suspended shop must immediately stop appearing in the customer application!
  const approvedShops = shops.filter((s) => s.status === 'APPROVED');

  const filteredShops = approvedShops.filter((s) => {
    const matchesCat = selectedCategory === 'ALL' || s.category === selectedCategory;
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const categories = ['ALL', 'Food & Dining', 'Groceries & Organics', 'Bakery & Desserts'];

  // Handle open shop
  const handleOpenShop = (shop: Shop) => {
    setActiveShop(shop);
    setCurrentScreen('shop_detail');
  };

  // Handle coupon apply
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    const res = applyCouponCode(couponInput);
    if (res.success) {
      setCouponSuccess(res.message);
    } else {
      setCouponError(res.message);
    }
  };

  // Handle Checkout Submission
  const handleProceedCheckout = async () => {
    try {
      const { order, razorpayOrder } = await createOrder(selectedPaymentMethod, specialInstructions);
      if (selectedPaymentMethod === 'RAZORPAY' && razorpayOrder) {
        setPendingOrderId(order.id);
        setRazorpayOrderData(razorpayOrder);
        setIsRazorpayModalOpen(true);
      } else {
        // COD order placed directly
        setActiveTrackingOrderId(order.id);
        setCurrentScreen('order_tracking');
      }
    } catch (err: any) {
      alert(err.message || 'Error processing checkout.');
    }
  };

  // Complete Razorpay Mock Payment
  const handleCompleteRazorpay = async () => {
    if (!pendingOrderId) return;
    const mockPaymentId = `pay_${Math.random().toString(36).substring(2, 10)}`;
    await verifyRazorpayPayment(pendingOrderId, mockPaymentId);
    setIsRazorpayModalOpen(false);
    setActiveTrackingOrderId(pendingOrderId);
    setCurrentScreen('order_tracking');
  };

  // Active tracking order
  const trackingOrder = orders.find((o) => o.id === activeTrackingOrderId) || orders[0];

  // Submit Review
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingOrder) return;
    customerReviewOrder(trackingOrder.id, reviewRating, reviewComment);
    alert('Thank you! Your feedback has been verified and published.');
    setReviewComment('');
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await customerRegister(regName, regEmail, regPhone, regAddress);
    alert(`Welcome ${regName}! Your customer profile is active.`);
    setCurrentScreen('home');
  };

  return (
    <div className="max-w-md mx-auto my-4 sm:my-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden min-h-[750px] flex flex-col justify-between text-slate-100">
      {/* Mobile Top Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        {currentScreen !== 'home' ? (
          <button
            onClick={() => {
              if (currentScreen === 'shop_detail') setCurrentScreen('home');
              else if (currentScreen === 'cart') setCurrentScreen(activeShop ? 'shop_detail' : 'home');
              else if (currentScreen === 'checkout') setCurrentScreen('cart');
              else setCurrentScreen('home');
            }}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <select
              value={selectedLocation.name}
              onChange={(e) => {
                const name = e.target.value;
                setSelectedLocation({ name, lat: 28.4695, lng: 77.0628 });
              }}
              className="bg-transparent text-xs font-bold text-white border-none focus:outline-none cursor-pointer max-w-[200px] truncate"
            >
              <option value="Sector 29, Gurugram, Delhi NCR" className="bg-slate-900">
                Sector 29, Gurugram
              </option>
              <option value="DLF Cyber City, Tower B, Gurugram" className="bg-slate-900">
                DLF Cyber City
              </option>
              <option value="Golf Course Road, Palm Springs" className="bg-slate-900">
                Golf Course Road
              </option>
              <option value="Sushant Lok Phase 1, Sector 43" className="bg-slate-900">
                Sushant Lok 1
              </option>
            </select>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentScreen('profile')}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="User Profile"
          >
            <User className="w-4 h-4" />
          </button>

          <button
            onClick={() => setCurrentScreen('cart')}
            className="relative p-1.5 rounded-full bg-emerald-600 text-white shadow-sm"
            title="Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Screen 1: Home Feed */}
      {currentScreen === 'home' && (
        <div className="p-4 space-y-5 flex-1 overflow-y-auto">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search dishes, groceries, approved shops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Promotional Banners Carousel (Dynamically loaded from Super Admin!) */}
          {banners.filter((b) => b.isActive).length > 0 && (
            <div className="space-y-2">
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
                {banners
                  .filter((b) => b.isActive)
                  .map((b) => (
                    <div
                      key={b.id}
                      onClick={() => {
                        const targetShop = shops.find((s) => s.id === b.targetValue && s.status === 'APPROVED');
                        if (targetShop) handleOpenShop(targetShop);
                      }}
                      className="min-w-[280px] h-36 rounded-2xl overflow-hidden relative snap-center cursor-pointer shrink-0 border border-slate-800 shadow-md group"
                    >
                      <img src={b.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-3.5 flex flex-col justify-end">
                        {b.badge && (
                          <span className="text-[9px] bg-amber-500 text-slate-950 font-extrabold px-2 py-0.5 rounded-full w-fit mb-1">
                            {b.badge}
                          </span>
                        )}
                        <h4 className="font-bold text-white text-xs drop-shadow">{b.title}</h4>
                        <p className="text-[10px] text-slate-200 line-clamp-1">{b.subtitle}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Category Filter Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {cat === 'ALL' ? 'All Categories' : cat}
              </button>
            ))}
          </div>

          {/* Approved Shops List */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-sm text-white">Verified Local Shops Nearby</h3>
              <span className="text-[11px] text-slate-400">{filteredShops.length} open</span>
            </div>

            {filteredShops.length === 0 ? (
              <div className="p-8 text-center bg-slate-800/40 rounded-2xl border border-slate-800 text-xs text-slate-400">
                No approved shops match your search.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredShops.map((shop) => (
                  <div
                    key={shop.id}
                    onClick={() => handleOpenShop(shop)}
                    className="p-3 bg-slate-800/50 hover:bg-slate-800/80 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={shop.logo}
                        alt=""
                        className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-white text-xs">{shop.name}</h4>
                          <span className="flex items-center gap-0.5 text-[10px] text-amber-400 font-bold">
                            <Star className="w-2.5 h-2.5 fill-amber-400" />
                            {shop.rating}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{shop.description}</p>
                        <div className="text-[10px] text-emerald-400 font-medium mt-1">
                          {shop.category} · Radius {shop.deliveryRadiusKm}km
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Screen 2: Shop Details & Menu */}
      {currentScreen === 'shop_detail' && activeShop && (
        <div className="flex-1 overflow-y-auto">
          {/* Shop Hero Banner */}
          <div className="relative h-36 bg-slate-800">
            <img src={activeShop.banner} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent p-4 flex flex-col justify-end">
              <h3 className="font-bold text-white text-base drop-shadow-md">{activeShop.name}</h3>
              <p className="text-xs text-slate-300 drop-shadow-xs">{activeShop.address}</p>
            </div>
          </div>

          {/* Products Catalog for this shop */}
          <div className="p-4 space-y-4">
            <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider">
              Available Items ({products.filter((p) => p.shopId === activeShop.id && !p.isDeleted && p.isAvailable).length})
            </h4>

            <div className="space-y-3">
              {products
                .filter((p) => p.shopId === activeShop.id && !p.isDeleted && p.isAvailable)
                .map((prod) => {
                  const cartItem = cart.find((i) => i.product.id === prod.id);
                  return (
                    <div
                      key={prod.id}
                      className="p-3 bg-slate-800/50 border border-slate-800 rounded-2xl flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.image}
                          alt=""
                          className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0"
                        />
                        <div>
                          <h5 className="font-bold text-white text-xs">{prod.name}</h5>
                          <p className="text-[10px] text-slate-400 line-clamp-1">{prod.description}</p>
                          <div className="font-bold text-white text-xs mt-1">
                            {settings.currencySymbol}{prod.price}
                          </div>
                        </div>
                      </div>

                      <div>
                        {cartItem ? (
                          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-2 py-1">
                            <button
                              onClick={() => updateCartQuantity(prod.id, cartItem.quantity - 1)}
                              className="text-slate-300 hover:text-white"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-bold text-xs text-white w-4 text-center">
                              {cartItem.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(prod.id, cartItem.quantity + 1)}
                              className="text-emerald-400 hover:text-emerald-300"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(prod, 1)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs"
                          >
                            Add +
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Screen 3: Cart View */}
      {currentScreen === 'cart' && (
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          <h3 className="font-bold text-base text-white">Your Order Basket</h3>

          {cart.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              Your cart is empty. Add items from an approved shop!
            </div>
          ) : (
            <>
              {/* Cart Items List */}
              <div className="space-y-2">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3 bg-slate-800/50 rounded-2xl border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={item.product.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <div className="font-bold text-white text-xs">{item.product.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {settings.currencySymbol}{item.product.price} each
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="text-slate-300"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold text-xs text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          className="text-emerald-400"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="font-bold text-white text-xs">
                        {settings.currencySymbol}{item.product.price * item.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon input */}
              <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-emerald-400" /> Have a Promo Coupon?
                  </span>
                  {appliedCoupon && (
                    <button onClick={removeCoupon} className="text-rose-400 text-[10px] hover:underline">
                      Remove
                    </button>
                  )}
                </div>

                {appliedCoupon ? (
                  <div className="p-2 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex justify-between items-center">
                    <span>Applied: <strong>{appliedCoupon.code}</strong></span>
                    <span>-{settings.currencySymbol}{cartDiscount}</span>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. WELCOME50, FLAT100"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {couponError && <p className="text-[11px] text-rose-400">{couponError}</p>}
                {couponSuccess && <p className="text-[11px] text-emerald-400">{couponSuccess}</p>}
              </div>

              {/* Order Cost Breakdown */}
              <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Item Subtotal:</span>
                  <span className="text-white">{settings.currencySymbol}{cartSubtotal}</span>
                </div>
                {cartDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Promo Discount:</span>
                    <span>-{settings.currencySymbol}{cartDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Delivery Fee:</span>
                  <span className="text-white">
                    {cartDeliveryFee === 0 ? 'FREE' : `${settings.currencySymbol}${cartDeliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Taxes (5% GST):</span>
                  <span className="text-white">{settings.currencySymbol}{cartTax}</span>
                </div>
                <div className="flex justify-between font-bold text-white text-sm pt-2 border-t border-slate-700">
                  <span>To Pay:</span>
                  <span className="text-emerald-400">{settings.currencySymbol}{cartTotal}</span>
                </div>
              </div>

              <button
                onClick={() => setCurrentScreen('checkout')}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs transition shadow-lg shadow-emerald-950 flex items-center justify-center gap-1.5"
              >
                <span>Proceed to Checkout ({settings.currencySymbol}{cartTotal})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Screen 4: Checkout (Payment & Address) */}
      {currentScreen === 'checkout' && (
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          <h3 className="font-bold text-base text-white">Confirm Delivery & Payment</h3>

          {/* Delivery Address */}
          <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-800 space-y-2">
            <label className="block text-xs font-semibold text-white flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Delivery Address</span>
            </label>
            <textarea
              rows={2}
              required
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>

          {/* Payment Method Selector */}
          <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-800 space-y-2.5">
            <span className="block text-xs font-semibold text-white">Select Payment Mode</span>

            {/* Razorpay Online */}
            {settings.isOnlinePaymentEnabled && (
              <label
                onClick={() => setSelectedPaymentMethod('RAZORPAY')}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  selectedPaymentMethod === 'RAZORPAY'
                    ? 'bg-emerald-950/20 border-emerald-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold">Online Payment (Razorpay)</div>
                    <div className="text-[10px] text-slate-400">Cards, UPI, Netbanking with Instant Refund Protection</div>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedPaymentMethod === 'RAZORPAY' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600'
                  }`}
                >
                  {selectedPaymentMethod === 'RAZORPAY' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
              </label>
            )}

            {/* Cash on Delivery */}
            {settings.isCodEnabled && (
              <label
                onClick={() => setSelectedPaymentMethod('COD')}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  selectedPaymentMethod === 'COD'
                    ? 'bg-emerald-950/20 border-emerald-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <IndianRupee className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-xs font-bold">Cash on Delivery (COD)</div>
                    <div className="text-[10px] text-slate-400">Pay cash upon doorstep courier handover</div>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedPaymentMethod === 'COD' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600'
                  }`}
                >
                  {selectedPaymentMethod === 'COD' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
              </label>
            )}
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Instructions for Courier (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Leave package at security / ring bell"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>

          {/* Place Order CTA */}
          <button
            onClick={handleProceedCheckout}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs transition shadow-lg shadow-emerald-950 flex items-center justify-center gap-2"
          >
            <span>
              {selectedPaymentMethod === 'RAZORPAY' ? 'Proceed to Razorpay Payment' : 'Confirm Cash on Delivery Order'}
            </span>
            <span className="font-mono">({settings.currencySymbol}{cartTotal})</span>
          </button>
        </div>
      )}

      {/* Screen 5: Live Order Tracking */}
      {currentScreen === 'order_tracking' && trackingOrder && (
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          <div className="text-center py-2">
            <span className="text-[10px] text-slate-400 font-mono block">TRACKING ID: {trackingOrder.id}</span>
            <h3 className="text-base font-bold text-white mt-0.5">Order Live Status</h3>
          </div>

          {/* Stepper Status Indicators */}
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-800 space-y-3">
            {[
              { status: 'PLACED', title: 'Order Confirmed', desc: 'Received by kitchen / store' },
              { status: 'ACCEPTED', title: 'Shop Accepted', desc: 'Merchant acknowledged order' },
              { status: 'PREPARING', title: 'Being Prepared', desc: 'Freshly cooked & packed' },
              { status: 'READY_FOR_PICKUP', title: 'Ready for Rider', desc: 'Courier assigned to pickup' },
              { status: 'OUT_FOR_DELIVERY', title: 'Out for Delivery', desc: 'Rider is on the way to you' },
              { status: 'DELIVERED', title: 'Delivered Safely', desc: 'Handed over at doorstep' },
            ].map((step, idx) => {
              const orderStatuses: any[] = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED'];
              const currentIdx = orderStatuses.indexOf(trackingOrder.orderStatus);
              const stepIdx = orderStatuses.indexOf(step.status);
              const isPastOrCurrent = stepIdx <= currentIdx;
              const isCurrent = stepIdx === currentIdx;

              return (
                <div key={step.status} className="flex items-start gap-3 text-xs">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                      isCurrent
                        ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20 animate-pulse'
                        : isPastOrCurrent
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {isPastOrCurrent ? '✓' : idx + 1}
                  </div>
                  <div>
                    <div className={`font-semibold ${isPastOrCurrent ? 'text-white' : 'text-slate-500'}`}>
                      {step.title}
                    </div>
                    <div className="text-[10px] text-slate-400">{step.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Assigned Delivery Partner Card */}
          {trackingOrder.deliveryPartnerName && (
            <div className="bg-indigo-950/20 border border-indigo-500/30 p-3.5 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{trackingOrder.deliveryPartnerName}</div>
                  <div className="text-[10px] text-indigo-300">Your Delivery Partner</div>
                </div>
              </div>
              <a
                href={`tel:${trackingOrder.deliveryPartnerPhone}`}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Rider</span>
              </a>
            </div>
          )}

          {/* Review Box once delivered */}
          {trackingOrder.orderStatus === 'DELIVERED' && !trackingOrder.review && (
            <form onSubmit={handleSubmitReview} className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white">Rate & Review Your Experience</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`text-sm ${star <= reviewRating ? 'text-amber-400' : 'text-slate-600'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                required
                placeholder="Leave feedback on food quality and courier speed..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
              />

              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition"
              >
                Submit Review
              </button>
            </form>
          )}

          <button
            onClick={() => setCurrentScreen('home')}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-xs font-medium"
          >
            Back to Home Feed
          </button>
        </div>
      )}

      {/* Screen 6: Customer Profile */}
      {currentScreen === 'profile' && (
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          <h3 className="font-bold text-base text-white">Customer Account</h3>

          {currentUser ? (
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover border border-slate-700"
                />
                <div>
                  <h4 className="font-bold text-white text-sm">{currentUser.name}</h4>
                  <div className="text-slate-400 text-[11px]">{currentUser.email}</div>
                  <div className="text-slate-400 text-[11px]">{currentUser.phone}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 block text-[10px] mb-0.5">Primary Delivery Address:</span>
                <p className="text-slate-200">{currentUser.address || deliveryAddress}</p>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="font-semibold text-white block mb-2">Order History</span>
                <div className="space-y-2">
                  {orders
                    .filter((o) => o.customerId === currentUser.id)
                    .map((ord) => (
                      <div
                        key={ord.id}
                        onClick={() => {
                          setActiveTrackingOrderId(ord.id);
                          setCurrentScreen('order_tracking');
                        }}
                        className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center cursor-pointer hover:border-slate-700"
                      >
                        <div>
                          <div className="font-mono text-white text-[11px]">{ord.id}</div>
                          <div className="text-[10px] text-slate-400">{ord.shopName} · {ord.orderStatus}</div>
                        </div>
                        <div className="font-bold text-white text-xs">{settings.currencySymbol}{ord.total}</div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Discreet Staff & Admin Entrance */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>{settings.appName} v2.4</span>
                <button
                  onClick={() => {
                    setActiveRoleView('SUPER_ADMIN');
                    window.location.hash = 'admin';
                  }}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white transition px-2 py-1 rounded-lg bg-slate-900 border border-slate-800"
                >
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>Platform Admin Portal</span>
                </button>
              </div>
            </div>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="bg-slate-800/50 p-4 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-xs font-semibold text-emerald-400 block mb-1">Quick Customer Registration</span>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Joydip Debnath"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="joydip@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Mobile Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 00000"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Delivery Address</label>
                <input
                  type="text"
                  required
                  placeholder="Flat, Tower, Society, City"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition"
              >
                Create Account
              </button>
            </form>
          )}
        </div>
      )}

      {/* RAZORPAY TEST PAYMENT MODAL */}
      {isRazorpayModalOpen && razorpayOrderData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                  RZP
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Razorpay Checkout (Test Mode)</h4>
                  <span className="text-[10px] text-slate-400 font-mono">Order ID: {razorpayOrderData.id}</span>
                </div>
              </div>
              <button
                onClick={() => setIsRazorpayModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-2xl text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Amount:</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {settings.currencySymbol}{(razorpayOrderData.amount / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Merchant:</span>
                <span className="text-white font-medium">{settings.appName} Marketplace</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-semibold text-slate-300 block">Select Test Payment Instrument:</span>
              <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700 flex items-center gap-2 text-white">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Test Debit Card (•••• 4242)</span>
              </div>
              <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700 flex items-center gap-2 text-white">
                <IndianRupee className="w-4 h-4 text-indigo-400" />
                <span>UPI ID: success@razorpay</span>
              </div>
            </div>

            <button
              onClick={handleCompleteRazorpay}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs transition shadow-lg shadow-blue-950 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simulate Successful Payment & Verify</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Footer Navigation */}
      <div className="bg-slate-900 border-t border-slate-800 p-2 flex items-center justify-around text-xs text-slate-400">
        <button
          onClick={() => setCurrentScreen('home')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            currentScreen === 'home' ? 'text-emerald-400 font-bold' : 'hover:text-white'
          }`}
        >
          <Search className="w-4 h-4" />
          <span className="text-[10px]">Explore</span>
        </button>

        <button
          onClick={() => setCurrentScreen('cart')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            currentScreen === 'cart' ? 'text-emerald-400 font-bold' : 'hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="text-[10px]">Cart ({cart.length})</span>
        </button>

        <button
          onClick={() => setCurrentScreen('order_tracking')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            currentScreen === 'order_tracking' ? 'text-emerald-400 font-bold' : 'hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span className="text-[10px]">Live Order</span>
        </button>

        <button
          onClick={() => setCurrentScreen('profile')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            currentScreen === 'profile' ? 'text-emerald-400 font-bold' : 'hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span className="text-[10px]">Account</span>
        </button>
      </div>
    </div>
  );
};
