import React, { useState } from 'react';
import { usePlatform } from '../../../context/PlatformContext';
import { Product } from '../../../types';
import {
  Package,
  Search,
  Filter,
  Eye,
  EyeOff,
  Star,
  Trash2,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Store,
  SlidersHorizontal,
} from 'lucide-react';

export const AdminProductsTab: React.FC = () => {
  const {
    products,
    shops,
    settings,
    toggleProductAvailability,
    toggleProductFeatured,
    softDeleteProduct,
    restoreProduct,
    updateProduct,
    addProduct,
  } = usePlatform();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShopFilter, setSelectedShopFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'DELETED'>('ALL');
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);

  // New product form
  const [newShopId, setNewShopId] = useState(shops[0]?.id || '');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('199');
  const [newCategory, setNewCategory] = useState('Grocery');
  const [newImage, setNewImage] = useState(
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'
  );
  const [newStock, setNewStock] = useState('50');

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.shopName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesShop = selectedShopFilter === 'ALL' || p.shopId === selectedShopFilter;

    let matchesStock = true;
    if (stockFilter === 'DELETED') matchesStock = p.isDeleted;
    else if (p.isDeleted) matchesStock = false;
    else if (stockFilter === 'LOW_STOCK') matchesStock = p.stock <= 10;
    else if (stockFilter === 'IN_STOCK') matchesStock = p.stock > 10;

    return matchesSearch && matchesShop && matchesStock;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const targetShop = shops.find((s) => s.id === newShopId);
    if (!targetShop) return;

    addProduct({
      shopId: targetShop.id,
      shopName: targetShop.name,
      name: newName,
      description: newDesc,
      price: Number(newPrice) || 99,
      category: newCategory,
      image: newImage,
      stock: Number(newStock) || 50,
      isAvailable: true,
      isFeatured: false,
    });

    setIsNewProductModalOpen(false);
    setNewName('');
    setNewDesc('');
  };

  const handleStockUpdate = (prod: Product) => {
    const newQty = prompt(`Update stock count for ${prod.name}:`, String(prod.stock));
    if (newQty !== null && !isNaN(Number(newQty))) {
      updateProduct(prod.id, { stock: Math.max(0, Number(newQty)) });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white">Platform Product Catalog</h2>
          <p className="text-xs text-slate-400">
            Unrestricted administrative catalog control, inventory audits, listing moderation, and soft-deletes
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search products, SKUs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Shop Filter */}
          <select
            value={selectedShopFilter}
            onChange={(e) => setSelectedShopFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
          >
            <option value="ALL">All Shops</option>
            {shops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
          >
            <option value="ALL">All Active</option>
            <option value="LOW_STOCK">Low Stock (&le;10)</option>
            <option value="IN_STOCK">In Stock (&gt;10)</option>
            <option value="DELETED">Soft-Deleted Items</option>
          </select>

          <button
            onClick={() => setIsNewProductModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Product List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Item & Details</th>
                <th className="py-3 px-4">Shop Vendor</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Inventory</th>
                <th className="py-3 px-4">Visibility</th>
                <th className="py-3 px-4 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No products found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => (
                  <tr
                    key={prod.id}
                    className={`hover:bg-slate-800/40 transition ${
                      prod.isDeleted ? 'opacity-50 bg-rose-950/10' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-800 shrink-0"
                        />
                        <div>
                          <div className="font-semibold text-white line-clamp-1">{prod.name}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">{prod.description}</div>
                          {prod.isFeatured && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-indigo-400 font-medium mt-0.5">
                              <Star className="w-2.5 h-2.5 fill-indigo-400" /> Featured on Homepage
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      <div className="font-medium text-white">{prod.shopName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: {prod.shopId}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-300">{prod.category}</td>

                    <td className="py-3 px-4 font-bold text-white">
                      {settings.currencySymbol}{prod.price}
                      {prod.originalPrice && (
                        <span className="line-through text-slate-400 text-[10px] ml-1.5 font-normal">
                          {settings.currencySymbol}{prod.originalPrice}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleStockUpdate(prod)}
                        title="Click to update stock"
                        className={`px-2 py-0.5 rounded text-[11px] font-bold inline-flex items-center gap-1 hover:ring-1 hover:ring-white transition ${
                          prod.stock <= 10
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {prod.stock <= 10 && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                        <span>{prod.stock} units</span>
                      </button>
                    </td>

                    <td className="py-3 px-4">
                      {prod.isDeleted ? (
                        <span className="text-rose-400 font-semibold text-[11px]">Soft Deleted</span>
                      ) : prod.isAvailable ? (
                        <span className="text-emerald-400 font-semibold text-[11px]">Available</span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Hidden</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!prod.isDeleted && (
                          <>
                            <button
                              onClick={() => toggleProductAvailability(prod.id)}
                              title={prod.isAvailable ? 'Disable Product' : 'Enable Product'}
                              className={`p-1.5 rounded-lg border transition ${
                                prod.isAvailable
                                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                                  : 'bg-amber-500/20 border-amber-500/30 text-amber-300'
                              }`}
                            >
                              {prod.isAvailable ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={() => toggleProductFeatured(prod.id)}
                              title={prod.isFeatured ? 'Remove Featured' : 'Feature Product'}
                              className={`p-1.5 rounded-lg border transition ${
                                prod.isFeatured
                                  ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300'
                                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                              }`}
                            >
                              <Star className={`w-3.5 h-3.5 ${prod.isFeatured ? 'fill-indigo-300' : ''}`} />
                            </button>

                            <button
                              onClick={() => {
                                if (confirm(`Soft-delete listing "${prod.name}"?`)) {
                                  softDeleteProduct(prod.id);
                                }
                              }}
                              title="Safe Soft Delete"
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        {prod.isDeleted && (
                          <button
                            onClick={() => restoreProduct(prod.id)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Restore Listing</span>
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

      {/* Add Product Modal */}
      {isNewProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Add Marketplace Product</h3>
            <p className="text-xs text-slate-400 mb-4">
              Add new product catalog item to any approved vendor shop.
            </p>

            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Vendor Shop</label>
                <select
                  value={newShopId}
                  onChange={(e) => setNewShopId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                >
                  {shops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kashmiri Saffron Box (1g)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Detailed product specification..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Stock</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Product Image URL</label>
                <input
                  type="url"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewProductModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition"
                >
                  Publish SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
