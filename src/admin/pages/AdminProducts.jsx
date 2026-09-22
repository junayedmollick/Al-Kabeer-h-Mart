import { api } from '../../lib/api';
import { useCatalog } from '../../context/CatalogContext';
import React, { useState, useMemo } from 'react';
import {
  Plus, Search, Edit2, Trash2, LayoutGrid, List,
  Package, AlertCircle, Check, Upload, ArrowUpDown,
  PackageX, PackageCheck
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { StatusBadge } from '../components/StatusBadge';
import { AdminModal } from '../components/AdminModal';
import { AdminTable } from '../components/AdminTable';

const FORM_FIELDS = [
  { key: 'name', label: 'Product Name', required: true, placeholder: 'e.g. Amul Taaza Toned Fresh Milk', colSpan: 'sm:col-span-2' },
  { key: 'subcategory', label: 'Subcategory', placeholder: 'e.g. Milk, Atta, Cold Drinks' },
  { key: 'price', label: 'Price (₹)', required: true, type: 'number', min: '0.01', step: '0.01', placeholder: '27' },
  { key: 'oldPrice', label: 'MRP / Strike Price (₹)', type: 'number', min: '0.01', step: '0.01', placeholder: '30' },
  { key: 'weight', label: 'Weight / Packaging', placeholder: '500 ml, 1 kg, 6 pcs' },
  { key: 'tag', label: 'Tag / Badge', placeholder: 'Essential, Best Seller, Fresh Daily' },
  { key: 'deliveryTime', label: 'Delivery Time', placeholder: '10 min' },
];

const STOCK_PRESETS = [0, 10, 25, 50];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'priceAsc', label: 'Price: Low to High' },
  { value: 'priceDesc', label: 'Price: High to Low' },
  { value: 'stockAsc', label: 'Stock: Lowest First' },
];
const SAMPLE_IMAGES = [
  { label: 'Little Hearts', url: '/assets/products/IMG-20260921-WA0235.jpg' },
  { label: 'Cold Drink', url: '/assets/products/IMG-20260921-WA0034.jpg' },
  { label: 'Garam Masala', url: '/assets/products/IMG-20260921-WA0013.jpg' },
];

const ACTION_BTN = "p-1.5 rounded-lg bg-surface-soft hover:bg-primary/10 text-text-secondary hover:text-primary transition-colors cursor-pointer";
const DANGER_BTN = "p-1.5 rounded-lg bg-surface-soft hover:bg-danger/10 text-text-secondary hover:text-danger transition-colors cursor-pointer";

function ProductActions({ product, onToggleStock, onEdit, onDelete }) {
  const stockVal = product.stock ?? 20;
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onToggleStock(product, stockVal > 0 ? 0 : 20)}
        title={stockVal > 0 ? 'Mark Out of Stock' : 'Restock (20 units)'}
        className={ACTION_BTN}
      >
        {stockVal > 0 ? <PackageX className="w-3.5 h-3.5" /> : <PackageCheck className="w-3.5 h-3.5" />}
      </button>
      <button
        type="button"
        onClick={() => onEdit(product)}
        title="Edit"
        className={ACTION_BTN}
      >
        <Edit2 className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => onDelete(product)}
        title="Delete"
        className={DANGER_BTN}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function AdminProducts() {
  const { t } = useLanguage();
  const { products: productList, categories, shopCategories, refreshCatalog } = useCatalog();

  const realCategories = useMemo(() => {
    const list = shopCategories && shopCategories.length ? shopCategories : categories.filter(c => c.slug !== 'for-you');
    return list.length ? list : categories;
  }, [shopCategories, categories]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStockStatus, setSelectedStockStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('table');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [modalError, setModalError] = useState('');
  const [highlightId, setHighlightId] = useState(null);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  const initialForm = {
    name: '', category: realCategories[0]?.slug || 'food-grocery',
    subcategory: '', price: '', oldPrice: '', weight: '',
    stock: 20, deliveryTime: '10 min', tag: 'Fresh Daily',
    image: '', description: '',
  };
  const [formData, setFormData] = useState(initialForm);

  const showToast = ({ message, type = 'success' }) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setModalError('');
    setFormData({ ...initialForm, category: realCategories[0]?.slug || 'food-grocery' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setModalError('');
    setFormData({
      name: p.name || '', category: p.category || realCategories[0]?.slug || 'food-grocery',
      subcategory: p.subcategory || '', price: p.price ?? '', oldPrice: p.oldPrice ?? '',
      weight: p.weight || '', stock: p.stock ?? 20, deliveryTime: p.deliveryTime || '10 min',
      tag: p.tag || '', image: p.image || '', description: p.description || '',
    });
    setIsModalOpen(true);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setModalError('Please choose a valid image file (JPG, PNG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const maxDim = 600;
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = Math.round((height * maxDim) / width); width = maxDim; }
          else { width = Math.round((width * maxDim) / height); height = maxDim; }
        }
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        setFormData(prev => ({ ...prev, image: canvas.toDataURL('image/jpeg', 0.85) }));
        setModalError('');
      };
      img.onerror = () => setModalError('Could not process the selected image.');
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (saving) return;
    setModalError('');
    if (!formData.name.trim()) return setModalError('Please enter a product name.');
    const priceNum = Number(formData.price);
    if (!Number.isFinite(priceNum) || priceNum <= 0) return setModalError('Please enter a valid price greater than 0.');
    const stockNum = Number(formData.stock);
    if (!Number.isInteger(stockNum) || stockNum < 0) return setModalError('Please enter a valid stock count (0 or more).');

    setSaving(true);
    try {
      const body = {
        revision: editingProduct?.revision,
        ...formData,
        name: formData.name.trim(),
        price: priceNum,
        oldPrice: Number(formData.oldPrice || formData.price),
        stock: stockNum,
      };
      const result = await api(
        '/admin/products' + (editingProduct ? '/' + encodeURIComponent(editingProduct.id) : ''),
        { method: editingProduct ? 'PUT' : 'POST', body }
      );
      await refreshCatalog();
      setIsModalOpen(false);
      setHighlightId(result.id || editingProduct?.id);
      showToast({ message: editingProduct ? 'Product updated successfully.' : 'Product added successfully!', type: 'success' });
      setTimeout(() => setHighlightId(null), 6000);
    } catch (err) {
      setModalError(err.message || 'Failed to save product.');
      showToast({ message: err.message || 'Failed to save product.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStock = async (product, newStock) => {
    try {
      const body = {
        revision: product.revision,
        ...product,
        price: Number(product.price),
        oldPrice: Number(product.oldPrice || product.price),
        stock: Number(newStock),
      };
      await api('/admin/products/' + encodeURIComponent(product.id), { method: 'PUT', body });
      await refreshCatalog();
      setHighlightId(product.id);
      showToast({
        message: newStock === 0 ? `"${product.name}" marked as Out of Stock.` : `"${product.name}" restocked (${newStock} units).`,
        type: 'success',
      });
      setTimeout(() => setHighlightId(null), 4000);
    } catch (err) {
      showToast({ message: err.message || 'Failed to update stock.', type: 'error' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct || saving) return;
    setSaving(true);
    try {
      await api('/admin/products/' + encodeURIComponent(deletingProduct.id), { method: 'DELETE' });
      await refreshCatalog();
      setDeletingProduct(null);
      showToast({ message: 'Product deleted successfully.', type: 'success' });
    } catch (err) {
      showToast({ message: err.message || 'Failed to delete product.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const list = productList.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q) || p.tag?.toLowerCase().includes(q);
      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
      const s = p.stock ?? 20;
      const matchesStock = selectedStockStatus === 'all' ||
        (selectedStockStatus === 'inStock' && s >= 10) ||
        (selectedStockStatus === 'lowStock' && s > 0 && s < 10) ||
        (selectedStockStatus === 'outOfStock' && s === 0);
      return matchesSearch && matchesCat && matchesStock;
    });

    if (sortBy === 'newest') {
      const reversed = [...list].reverse();
      if (highlightId) {
        const idx = reversed.findIndex(p => p.id === highlightId);
        if (idx > 0) { const [item] = reversed.splice(idx, 1); reversed.unshift(item); }
      }
      return reversed;
    }
    return [...list].sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'priceAsc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'priceDesc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'stockAsc') return (a.stock ?? 0) - (b.stock ?? 0);
      return 0;
    });
  }, [productList, searchQuery, selectedCategory, selectedStockStatus, sortBy, highlightId]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[70] bg-surface border shadow-2xl rounded-2xl p-4 flex items-center gap-2.5 text-xs font-black animate-slide-up ${
          toast.type === 'error' ? 'border-danger/40 text-danger bg-rose-50/95 dark:bg-rose-950/95' : 'border-primary/30 text-text-primary bg-surface/95'
        }`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
            toast.type === 'error' ? 'bg-danger/20 text-danger' : 'bg-primary/20 text-primary'
          }`}>
            {toast.type === 'error' ? <AlertCircle className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
          </div>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-text-primary tracking-tight">{t('admin.products.title')}</h2>
          <p className="text-xs text-text-secondary mt-0.5">{t('admin.products.subtitle')} ({filteredProducts.length} {t('admin.products.itemsCount')})</p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="inline-flex items-center p-1 rounded-xl bg-surface border border-border">
            <button type="button" onClick={() => setViewMode('table')} className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'table' ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-text-primary'}`} title="Table View">
              <List className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-text-primary'}`} title="Grid Cards View">
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <button type="button" onClick={handleOpenAdd} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>{t('admin.products.addProduct')}</span>
          </button>
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <div className="p-4 rounded-2xl bg-surface border border-border shadow-subtle flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('admin.products.searchPlaceholder')} className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-primary transition-colors" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs font-bold text-text-primary focus:outline-hidden cursor-pointer">
            <option value="all">{t('admin.products.allCategories')}</option>
            {realCategories.map((c) => (<option key={c.id} value={c.slug}>{c.name}</option>))}
          </select>
          <select value={selectedStockStatus} onChange={(e) => setSelectedStockStatus(e.target.value)} className="px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs font-bold text-text-primary focus:outline-hidden cursor-pointer">
            <option value="all">{t('admin.products.allStock')}</option>
            <option value="inStock">{t('admin.products.inStockOnly')}</option>
            <option value="lowStock">{t('admin.products.lowStockOnly')}</option>
            <option value="outOfStock">{t('admin.products.outOfStockOnly')}</option>
          </select>
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-soft border border-border">
            <ArrowUpDown className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent text-xs font-bold text-text-primary focus:outline-hidden cursor-pointer">
              {SORT_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area: Responsive Table or Grid */}
      {viewMode === 'table' ? (
        <>
          {/* Mobile Card Stack (< md screens) */}
          <div className="md:hidden space-y-3">
            {filteredProducts.length === 0 ? (
              <div className="p-8 text-center bg-surface rounded-2xl border border-border">
                <Package className="w-8 h-8 text-text-muted mx-auto mb-2" />
                <p className="text-sm font-bold text-text-primary">No products found</p>
              </div>
            ) : (
              filteredProducts.map((p) => {
                const stockVal = p.stock ?? 20;
                const stockStatus = stockVal === 0 ? 'Out of Stock' : stockVal < 10 ? 'Low Stock' : 'In Stock';
                const isHighlighted = p.id === highlightId;
                return (
                  <div key={p.id} className={`p-4 rounded-2xl bg-surface border shadow-subtle flex flex-col gap-3 transition-all ${isHighlighted ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-border'}`}>
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-12 h-12 object-contain rounded-xl border border-border bg-white shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-surface-soft border border-border flex items-center justify-center text-text-muted shrink-0"><Package className="w-6 h-6" /></div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-xs text-text-primary truncate">{p.name}</p>
                          {isHighlighted && <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase shrink-0">Saved</span>}
                        </div>
                        <p className="text-[10px] text-text-muted capitalize mt-0.5">{p.category?.replace(/-/g, ' ')} • {p.weight || 'Std pack'}</p>
                      </div>
                      <StatusBadge status={stockStatus} size="sm" />
                    </div>
                    <div className="flex items-center justify-between pt-2.5 border-t border-border/60">
                      <div>
                        <span className="text-sm font-black text-text-primary">₹{p.price}</span>
                        {p.oldPrice && p.oldPrice > p.price && <span className="text-[10px] text-text-muted line-through ml-1.5">₹{p.oldPrice}</span>}
                        <span className="text-[11px] text-text-secondary ml-2 font-bold">({stockVal} units)</span>
                      </div>
                      <ProductActions product={p} onToggleStock={handleToggleStock} onEdit={handleOpenEdit} onDelete={setDeletingProduct} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table View (>= md screens) */}
          <div className="hidden md:block">
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
                const stockStatus = stockVal === 0 ? 'Out of Stock' : stockVal < 10 ? 'Low Stock' : 'In Stock';
                const isHighlighted = p.id === highlightId;
                return (
                  <tr key={p.id} className={`transition-colors group ${isHighlighted ? 'bg-emerald-500/10 ring-2 ring-primary ring-inset' : 'hover:bg-surface-soft/60'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-10 h-10 object-contain rounded-xl border border-border bg-white shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-surface-soft border border-border flex items-center justify-center text-text-muted shrink-0"><Package className="w-5 h-5" /></div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-xs text-text-primary truncate">{p.name}</p>
                            {isHighlighted && <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase shrink-0">Saved</span>}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-text-muted">
                            <span>{p.weight || 'Std pack'}</span>
                            {p.tag && <span className="px-1.5 py-0.2 rounded-md bg-surface-soft border border-border font-semibold text-text-secondary">{p.tag}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary font-medium capitalize">
                      {p.category ? p.category.replace(/-/g, ' ') : 'Grocery'}
                      {p.subcategory && <span className="text-[10px] text-text-muted block">{p.subcategory}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-black text-text-primary">₹{p.price}</span>
                        {p.oldPrice && p.oldPrice > p.price && <span className="text-[10px] text-text-muted line-through">₹{p.oldPrice}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-black ${stockVal === 0 ? 'text-rose-600 dark:text-rose-400' : stockVal < 10 ? 'text-amber-600 dark:text-amber-400' : 'text-text-primary'}`}>
                        {stockVal} units
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => handleToggleStock(p, stockVal > 0 ? 0 : 20)} title={`Click to mark ${stockVal > 0 ? 'Out of Stock' : 'In Stock'}`} className="cursor-pointer hover:opacity-80 transition-opacity">
                        <StatusBadge status={stockStatus} size="sm" />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end">
                        <ProductActions product={p} onToggleStock={handleToggleStock} onEdit={handleOpenEdit} onDelete={setDeletingProduct} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </AdminTable>
          </div>
        </>
      ) : (
        /* Grid Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((p) => {
            const stockVal = p.stock ?? 20;
            const stockStatus = stockVal === 0 ? 'Out of Stock' : stockVal < 10 ? 'Low Stock' : 'In Stock';
            const isHighlighted = p.id === highlightId;
            return (
              <div key={p.id} className={`rounded-2xl bg-surface border overflow-hidden shadow-subtle hover:shadow-card transition-all duration-200 flex flex-col h-full group ${isHighlighted ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-border'}`}>
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-soft shrink-0 flex items-center justify-center">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                  ) : (
                    <Package className="w-12 h-12 text-text-muted" />
                  )}
                  <div className="absolute top-2.5 right-2.5"><StatusBadge status={stockStatus} size="sm" /></div>
                  {p.tag && <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">{p.tag}</span>}
                  {isHighlighted && <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[9px] font-black uppercase">Saved</span>}
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted capitalize mb-1">{p.category?.replace(/-/g, ' ')}</p>
                    <h4 className="text-xs font-bold text-text-primary line-clamp-2 min-h-[2rem]" title={p.name}>{p.name}</h4>
                    <p className="text-[11px] text-text-muted mt-0.5">{p.weight || 'Std pack'}</p>
                  </div>
                  <div className="flex items-baseline justify-between pt-2 border-t border-border/60">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-black text-text-primary">₹{p.price}</span>
                      {p.oldPrice && p.oldPrice > p.price && <span className="text-[10px] text-text-muted line-through">₹{p.oldPrice}</span>}
                    </div>
                    <span className="text-xs font-bold text-text-secondary">Stock: <strong>{stockVal}</strong></span>
                  </div>
                </div>
                <div className="p-3 border-t border-border bg-surface-soft/40 flex items-center justify-between gap-2 shrink-0">
                  <span className="text-[10px] text-text-muted flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {p.deliveryTime || '10 min'}
                  </span>
                  <ProductActions product={p} onToggleStock={handleToggleStock} onEdit={handleOpenEdit} onDelete={setDeletingProduct} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? t('admin.products.editProduct') : t('admin.products.addProduct')}
        subtitle="Set accurate price, stock count, and grocery department info."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          {modalError && (
            <div role="alert" className="p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-bold flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Standard Array-driven Form Inputs */}
            {FORM_FIELDS.map((f) => (
              <div key={f.key} className={f.colSpan || ''}>
                <label className="block text-xs font-bold text-text-secondary mb-1">
                  {f.label} {f.required && '*'}
                </label>
                <input
                  type={f.type || 'text'}
                  required={f.required}
                  min={f.min}
                  step={f.step}
                  value={formData[f.key] ?? ''}
                  onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary focus:outline-hidden focus:border-primary"
                />
              </div>
            ))}

            {/* Category Select */}
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">
                {t('admin.products.category')} *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs font-bold text-text-primary focus:outline-hidden cursor-pointer"
              >
                {realCategories.map((c) => (<option key={c.id} value={c.slug}>{c.name}</option>))}
              </select>
            </div>

            {/* Stock Count with Manual Out-of-Stock Controls */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-text-secondary">
                  {t('admin.products.stock')} (units) *
                </label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, stock: Number(formData.stock) === 0 ? 20 : 0 })}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-lg cursor-pointer transition-colors ${
                    Number(formData.stock) === 0
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                  }`}
                >
                  {Number(formData.stock) === 0 ? '✓ Set In Stock (20)' : '✕ Mark Out of Stock (0)'}
                </button>
              </div>
              <input
                type="number"
                required
                min="0"
                step="1"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="20"
                className={`w-full px-3 py-2 rounded-xl border text-xs text-text-primary focus:outline-hidden transition-colors ${
                  Number(formData.stock) === 0
                    ? 'border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/30 font-bold text-rose-600 dark:text-rose-400'
                    : 'border-border bg-surface-soft focus:border-primary'
                }`}
              />
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className="text-[10px] text-text-muted">Quick:</span>
                {STOCK_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setFormData({ ...formData, stock: preset })}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                      Number(formData.stock) === preset
                        ? (preset === 0 ? 'bg-rose-600 text-white' : 'bg-primary text-white')
                        : 'bg-surface-soft hover:bg-surface text-text-secondary border border-border'
                    }`}
                  >
                    {preset === 0 ? '0 (Out of Stock)' : preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label htmlFor="product-description" className="block text-xs font-bold text-text-secondary mb-1">
                Product description
              </label>
              <textarea
                id="product-description"
                rows={3}
                maxLength={3000}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Product details, ingredients, and key features..."
                className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary focus:outline-hidden focus:border-primary"
              />
            </div>

            {/* Image URL & File Upload */}
            <div className="sm:col-span-2 space-y-2">
              <label className="block text-xs font-bold text-text-secondary">{t('admin.products.image')}</label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="/assets/products/IMG-...jpg, https://..., or upload photo"
                  className="flex-1 px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary focus:outline-hidden focus:border-primary"
                />
                <label className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-soft border border-border text-xs font-bold text-text-secondary hover:text-primary cursor-pointer transition-colors shrink-0 shadow-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                  <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                </label>
              </div>

              {formData.image ? (
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-soft border border-border">
                  <img src={formData.image} alt="Preview" className="w-12 h-12 object-contain rounded-lg border border-border bg-white shrink-0" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-text-primary truncate">Photo attached</p>
                    <p className="text-[10px] text-text-muted truncate">{formData.image.startsWith('data:') ? 'Uploaded image' : formData.image}</p>
                  </div>
                  <button type="button" onClick={() => setFormData({ ...formData, image: '' })} className="text-xs font-bold text-danger hover:underline px-2 py-1 cursor-pointer">Remove</button>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-wrap text-[11px] text-text-muted">
                  <span>Quick sample:</span>
                  {SAMPLE_IMAGES.map((s) => (
                    <button key={s.label} type="button" onClick={() => setFormData({ ...formData, image: s.url })} className="text-primary font-semibold hover:underline cursor-pointer">
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-surface-soft hover:bg-surface border border-border text-xs font-bold text-text-secondary transition-colors cursor-pointer">
              {t('admin.common.cancel')}
            </button>
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-black shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50">
              {saving ? 'Saving…' : t('admin.common.save')}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <AdminModal isOpen={!!deletingProduct} onClose={() => setDeletingProduct(null)} title={t('admin.products.deleteProduct')} maxWidth="max-w-md">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-xs font-bold">{t('admin.products.confirmDelete')}</p>
            </div>
            <p className="text-xs text-text-secondary">Product: <strong className="text-text-primary">{deletingProduct.name}</strong></p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button type="button" onClick={() => setDeletingProduct(null)} className="px-3 py-1.5 rounded-xl bg-surface-soft border border-border text-xs font-bold text-text-secondary cursor-pointer">
                {t('admin.common.cancel')}
              </button>
              <button type="button" onClick={handleConfirmDelete} className="px-3.5 py-1.5 rounded-xl bg-danger hover:bg-danger/90 text-white text-xs font-black cursor-pointer shadow-xs">
                {t('admin.common.delete')}
              </button>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
