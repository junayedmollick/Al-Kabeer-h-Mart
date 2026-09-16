import { api } from '../../lib/api';
import { useCatalog } from '../../context/CatalogContext';
import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  LayoutGrid,
  List,
  Sparkles,
  Package,
  AlertCircle,
  Clock,
  Tag,
  Check
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { StatusBadge } from '../components/StatusBadge';
import { AdminModal } from '../components/AdminModal';
import { AdminTable } from '../components/AdminTable';

const STORAGE_KEY = 'alkabeer_admin_products';

export function AdminProducts() {
  const { t } = useLanguage();

  const { products: productList, categories, refreshCatalog } = useCatalog();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStockStatus, setSelectedStockStatus] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'dairy-eggs',
    subcategory: '',
    price: '',
    oldPrice: '',
    weight: '',
    stock: 25,
    deliveryTime: '10 min',
    tag: 'Essential',
    image: '',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Open modal for add
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'dairy-eggs',
      subcategory: 'Milk',
      price: '',
      oldPrice: '',
      weight: '500 ml',
      stock: 25,
      deliveryTime: '10 min',
      tag: 'Fresh Daily',
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=400',
    });
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name || '',
      category: p.category || 'dairy-eggs',
      subcategory: p.subcategory || '',
      price: p.price || '',
      oldPrice: p.oldPrice || '',
      weight: p.weight || '',
      stock: p.stock ?? 25,
      deliveryTime: p.deliveryTime || '10 min',
      tag: p.tag || '',
      image: p.image || '',
    });
    setIsModalOpen(true);
  };

  const [saving, setSaving] = useState(false);
  const handleSaveProduct = async e => {
    e.preventDefault(); if(saving) return; setSaving(true);
    try {
      const body = { revision: editingProduct?.revision, ...formData, price: Number(formData.price), oldPrice: Number(formData.oldPrice || formData.price), stock: Number(formData.stock) };
      await api('/admin/products' + (editingProduct ? '/' + encodeURIComponent(editingProduct.id) : ''), { method: editingProduct ? 'PUT' : 'POST', body });
      await refreshCatalog(); setIsModalOpen(false); showToast('Product saved.');
    } catch(e) { showToast(e.message); } finally { setSaving(false); }
  };
  const handleConfirmDelete = async () => {
    if(!deletingProduct || saving) return; setSaving(true);
    try { await api('/admin/products/' + encodeURIComponent(deletingProduct.id), { method: 'DELETE' }); await refreshCatalog(); setDeletingProduct(null); showToast('Product deleted.'); }
    catch(e) { showToast(e.message); } finally { setSaving(false); }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return productList.filter((p) => {
      const matchesSearch =
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tag?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === 'all' || p.category === selectedCategory;

      let matchesStock = true;
      const stockVal = p.stock ?? 20;
      if (selectedStockStatus === 'inStock') {
        matchesStock = stockVal >= 10;
      } else if (selectedStockStatus === 'lowStock') {
        matchesStock = stockVal > 0 && stockVal < 10;
      } else if (selectedStockStatus === 'outOfStock') {
        matchesStock = stockVal === 0;
      }

      return matchesSearch && matchesCat && matchesStock;
    });
  }, [productList, searchQuery, selectedCategory, selectedStockStatus]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-surface border border-primary/30 shadow-2xl rounded-2xl p-4 flex items-center gap-2.5 text-xs font-black text-text-primary animate-slide-up">
          <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-text-primary tracking-tight">
            {t('admin.products.title')}
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            {t('admin.products.subtitle')} ({filteredProducts.length} {t('admin.products.itemsCount')})
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Table / Grid view switcher */}
          <div className="inline-flex items-center p-1 rounded-xl bg-surface border border-border">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('admin.products.addProduct')}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-surface border border-border shadow-subtle flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('admin.products.searchPlaceholder')}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-primary transition-colors"
          />
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs font-bold text-text-primary focus:outline-hidden cursor-pointer"
          >
            <option value="all">{t('admin.products.allCategories')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Stock Status Dropdown */}
          <select
            value={selectedStockStatus}
            onChange={(e) => setSelectedStockStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs font-bold text-text-primary focus:outline-hidden cursor-pointer"
          >
            <option value="all">{t('admin.products.allStock')}</option>
            <option value="inStock">{t('admin.products.inStockOnly')}</option>
            <option value="lowStock">{t('admin.products.lowStockOnly')}</option>
            <option value="outOfStock">{t('admin.products.outOfStockOnly')}</option>
          </select>
        </div>
      </div>

      {/* Content View: Table or Grid */}
      {viewMode === 'table' ? (
        <AdminTable
          columns={[
            { title: t('admin.products.productName') },
            { title: t('admin.products.category') },
            { title: t('admin.products.price') },
            { title: t('admin.products.stock') },
            { title: t('admin.products.status') },
            { title: t('admin.products.actions'), align: 'right' },
          ]}
          isEmpty={filteredProducts.length === 0}
          totalCount={productList.length}
          currentCount={filteredProducts.length}
        >
          {filteredProducts.map((p) => {
            const stockVal = p.stock ?? 20;
            const stockStatus =
              stockVal === 0
                ? 'Out of Stock'
                : stockVal < 10
                ? 'Low Stock'
                : 'In Stock';

            return (
              <tr
                key={p.id}
                className="hover:bg-surface-soft/60 transition-colors group"
              >
                {/* Product Name & Thumbnail */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-10 h-10 object-cover rounded-xl border border-border shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-text-primary truncate">
                        {p.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-text-muted">
                        <span>{p.weight || 'Std'}</span>
                        {p.tag && (
                          <span className="px-1.5 py-0.2 rounded-md bg-surface-soft border border-border font-semibold text-text-secondary">
                            {p.tag}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="px-4 py-3 text-xs text-text-secondary font-medium capitalize">
                  {p.category ? p.category.replace(/-/g, ' ') : 'Grocery'}
                  {p.subcategory && (
                    <span className="text-[10px] text-text-muted block">
                      {p.subcategory}
                    </span>
                  )}
                </td>

                {/* Price */}
                <td className="px-4 py-3">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs font-black text-text-primary">
                      ₹{p.price}
                    </span>
                    {p.oldPrice && p.oldPrice > p.price && (
                      <span className="text-[10px] text-text-muted line-through">
                        ₹{p.oldPrice}
                      </span>
                    )}
                  </div>
                </td>

                {/* Stock Count */}
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-black ${
                      stockVal === 0
                        ? 'text-rose-600 dark:text-rose-400'
                        : stockVal < 10
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-text-primary'
                    }`}
                  >
                    {stockVal} units
                  </span>
                </td>

                {/* Status Badge */}
                <td className="px-4 py-3">
                  <StatusBadge status={stockStatus} size="sm" />
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(p)}
                      title={t('admin.common.edit')}
                      className="p-1.5 rounded-lg bg-surface-soft hover:bg-primary/10 text-text-secondary hover:text-primary transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingProduct(p)}
                      title={t('admin.common.delete')}
                      className="p-1.5 rounded-lg bg-surface-soft hover:bg-danger/10 text-text-secondary hover:text-danger transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </AdminTable>
      ) : (
        /* Grid Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((p) => {
            const stockVal = p.stock ?? 20;
            const stockStatus =
              stockVal === 0
                ? 'Out of Stock'
                : stockVal < 10
                ? 'Low Stock'
                : 'In Stock';

            return (
              <div
                key={p.id}
                className="rounded-2xl bg-surface border border-border overflow-hidden shadow-subtle hover:shadow-card transition-all duration-200 flex flex-col h-full group"
              >
                {/* Image Container with strict 4:3 aspect ratio */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-soft shrink-0">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-2.5 right-2.5">
                    <StatusBadge status={stockStatus} size="sm" />
                  </div>
                  {p.tag && (
                    <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                      {p.tag}
                    </span>
                  )}
                </div>

                {/* Card Body with uniform vertical distribution */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted capitalize mb-1">
                      {p.category?.replace(/-/g, ' ')}
                    </p>
                    <h4
                      className="text-xs font-bold text-text-primary line-clamp-2 min-h-[2rem]"
                      title={p.name}
                    >
                      {p.name}
                    </h4>
                    <p className="text-[11px] text-text-muted mt-0.5">{p.weight}</p>
                  </div>

                  <div className="flex items-baseline justify-between pt-2 border-t border-border/60">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-black text-text-primary">
                        ₹{p.price}
                      </span>
                      {p.oldPrice && p.oldPrice > p.price && (
                        <span className="text-[10px] text-text-muted line-through">
                          ₹{p.oldPrice}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-text-secondary">
                      Stock: <strong>{stockVal}</strong>
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-3 border-t border-border bg-surface-soft/40 flex items-center justify-between gap-2 shrink-0">
                  <span className="text-[10px] text-text-muted flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {p.deliveryTime || '10 min'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 rounded-lg bg-surface hover:bg-primary/10 text-text-secondary hover:text-primary transition-colors cursor-pointer"
                      title="Edit product"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingProduct(p)}
                      className="p-1.5 rounded-lg bg-surface hover:bg-danger/10 text-text-secondary hover:text-danger transition-colors cursor-pointer"
                      title="Delete product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Product Modal Form */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingProduct
            ? t('admin.products.editProduct')
            : t('admin.products.addProduct')
        }
        subtitle="Provide accurate price, stock count, and grocery department info."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Product Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-text-secondary mb-1">
                {t('admin.products.productName')} *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Amul Taaza Toned Fresh Milk"
                className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary focus:outline-hidden focus:border-primary"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">
                {t('admin.products.category')} *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs font-bold text-text-primary focus:outline-hidden cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory */}
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">
                {t('admin.products.subcategory')}
              </label>
              <input
                type="text"
                value={formData.subcategory}
                onChange={(e) =>
                  setFormData({ ...formData, subcategory: e.target.value })
                }
                placeholder="e.g. Milk, Atta, Cold Drinks"
                className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary focus:outline-hidden focus:border-primary"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">
                {t('admin.products.price')} *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="27"
                className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary focus:outline-hidden focus:border-primary"
              />
            </div>

            {/* Old Price / MRP */}
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">
                {t('admin.products.oldPrice')}
              </label>
              <input
                type="number"
                min="1"
                value={formData.oldPrice}
                onChange={(e) =>
                  setFormData({ ...formData, oldPrice: e.target.value })
                }
                placeholder="30"
                className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary focus:outline-hidden focus:border-primary"
              />
            </div>

            {/* Weight / Packaging */}
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">
                {t('admin.products.weight')}
              </label>
              <input
                type="text"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: e.target.value })
                }
                placeholder="500 ml, 1 kg, 6 pcs"
                className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary focus:outline-hidden focus:border-primary"
              />
            </div>

            {/* Stock Count */}
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">
                {t('admin.products.stock')} *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                placeholder="25"
                className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary focus:outline-hidden focus:border-primary"
              />
            </div>

            {/* Tag / Badge */}
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">
                {t('admin.products.tag')}
              </label>
              <input
                type="text"
                value={formData.tag}
                onChange={(e) =>
                  setFormData({ ...formData, tag: e.target.value })
                }
                placeholder="Essential, Best Seller, Fresh Daily"
                className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary focus:outline-hidden focus:border-primary"
              />
            </div>

            {/* Delivery Time */}
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">
                {t('admin.products.deliveryTime')}
              </label>
              <input
                type="text"
                value={formData.deliveryTime}
                onChange={(e) =>
                  setFormData({ ...formData, deliveryTime: e.target.value })
                }
                placeholder="10 min"
                className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary focus:outline-hidden focus:border-primary"
              />
            </div>

            {/* Image URL */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-text-secondary mb-1">
                {t('admin.products.image')}
              </label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary focus:outline-hidden focus:border-primary"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-surface-soft hover:bg-surface border border-border text-xs font-bold text-text-secondary transition-colors cursor-pointer"
            >
              {t('admin.common.cancel')}
            </button>
            <button
              type="submit" disabled={saving}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-black shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              {t('admin.common.save')}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <AdminModal
          isOpen={!!deletingProduct}
          onClose={() => setDeletingProduct(null)}
          title={t('admin.products.deleteProduct')}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-xs font-bold">
                {t('admin.products.confirmDelete')}
              </p>
            </div>
            <p className="text-xs text-text-secondary">
              Product: <strong className="text-text-primary">{deletingProduct.name}</strong>
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="px-3 py-1.5 rounded-xl bg-surface-soft border border-border text-xs font-bold text-text-secondary cursor-pointer"
              >
                {t('admin.common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 rounded-xl bg-danger hover:bg-danger/90 text-white text-xs font-black cursor-pointer shadow-xs"
              >
                {t('admin.common.delete')}
              </button>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
