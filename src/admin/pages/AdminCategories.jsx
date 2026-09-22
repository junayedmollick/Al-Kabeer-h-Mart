import { api } from '../../lib/api';
import { useCatalog } from '../../context/CatalogContext';
import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  Package,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { StatusBadge } from '../components/StatusBadge';
import { AdminModal } from '../components/AdminModal';
import { AdminTable } from '../components/AdminTable';

const STORAGE_KEY = 'alkabeer_admin_categories';

export function AdminCategories() {
  const { t } = useLanguage();

  const { categories: categoryList, products, refreshCatalog } = useCatalog();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    bengaliName: '',
    hindiName: '',
    tagline: '',
    subcategories: '',
    image: '',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Calculate product count per category
  const getProductCount = (slug) => {
    return products.filter((p) => p.category === slug).length;
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      bengaliName: '',
      hindiName: '',
      tagline: '',
      subcategories: 'All, Regular, Essentials',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCategory(c);
    setFormData({
      name: c.name || '',
      bengaliName: c.bengaliName || '',
      hindiName: c.hindiName || '',
      tagline: c.tagline || '',
      subcategories: Array.isArray(c.subcategories)
        ? c.subcategories.join(', ')
        : c.subcategories || '',
      image: c.image || '',
    });
    setIsModalOpen(true);
  };

  const [saving, setSaving] = useState(false);
  const handleSaveCategory = async e => {
    e.preventDefault(); if(saving) return; setSaving(true);
    try {
      const slug = editingCategory?.slug || formData.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      await api('/admin/categories' + (editingCategory ? '/' + encodeURIComponent(editingCategory.id) : ''), { method: editingCategory ? 'PUT' : 'POST', body: { revision: editingCategory?.revision, ...formData, slug, subcategories: formData.subcategories.split(',').map(s => s.trim()).filter(Boolean) } });
      await refreshCatalog(); setIsModalOpen(false); showToast('Category saved.');
    } catch(e) { showToast(e.message); } finally { setSaving(false); }
  };
  const handleDeleteCategory = async () => {
    if(!editingCategory || !window.confirm('Delete this category? Products must be moved first.')) return;
    try { await api('/admin/categories/' + encodeURIComponent(editingCategory.id), { method:'DELETE' }); await refreshCatalog(); setIsModalOpen(false); showToast('Category deleted.'); } catch(e) { showToast(e.message); }
  };

  const filteredCategories = categoryList.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.bengaliName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.hindiName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Alert */}
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
            {t('admin.categories.title')}
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            {t('admin.categories.subtitle')} ({filteredCategories.length} categories active)
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('admin.categories.addCategory')}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-surface border border-border shadow-subtle flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories in English, বাংলা, or हिन्दी..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-primary"
          />
        </div>
      </div>

      {/* Mobile Card View (screens < 768px) */}
      <div className="md:hidden space-y-3">
        {filteredCategories.length === 0 ? (
          <div className="p-8 text-center bg-surface rounded-2xl border border-border">
            <Layers className="w-8 h-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm font-bold text-text-primary">No categories found</p>
          </div>
        ) : (
          filteredCategories.map((c) => {
            const count = getProductCount(c.slug);

            return (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-surface border border-border shadow-subtle flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={c.image}
                      alt={c.name}
                      className="w-12 h-12 object-cover rounded-xl border border-border shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-black text-sm text-text-primary truncate">
                        {c.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-text-secondary mt-0.5 truncate">
                        {c.bengaliName && <span>{c.bengaliName}</span>}
                        {c.bengaliName && c.hindiName && <span>•</span>}
                        {c.hindiName && <span>{c.hindiName}</span>}
                      </div>
                      <span className="text-[10px] text-text-muted font-mono block mt-0.5">
                        /{c.slug}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(c)}
                      className="p-2 rounded-xl bg-surface-soft hover:bg-primary/10 text-text-secondary hover:text-primary transition-colors cursor-pointer"
                      title="Edit category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-border/60">
                  <span className="inline-flex items-center gap-1 text-xs font-black text-text-primary">
                    <Package className="w-3.5 h-3.5 text-primary shrink-0" />
                    {count} items
                  </span>
                  <StatusBadge status="Active" size="sm" />
                </div>

                {c.subcategories && c.subcategories.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(Array.isArray(c.subcategories) ? c.subcategories : [])
                      .slice(0, 4)
                      .map((sub, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-surface-soft text-[10px] font-bold text-text-secondary border border-border"
                        >
                          {sub}
                        </span>
                      ))}
                    {c.subcategories.length > 4 && (
                      <span className="text-[10px] text-text-muted font-bold self-center">
                        +{c.subcategories.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table View (screens >= 768px) */}
      <div className="hidden md:block">
        <AdminTable
          columns={[
            { title: t('admin.categories.categoryName') },
            { title: t('admin.categories.bengaliName') },
            { title: t('admin.categories.hindiName') },
            { title: t('admin.categories.productsCount') },
            { title: t('admin.categories.subcategories') },
            { title: t('admin.categories.status') },
            { title: t('admin.categories.actions'), align: 'right' },
          ]}
          isEmpty={filteredCategories.length === 0}
          totalCount={categoryList.length}
          currentCount={filteredCategories.length}
        >
          {filteredCategories.map((c) => {
            const count = getProductCount(c.slug);

            return (
              <tr
                key={c.id}
                className="hover:bg-surface-soft/60 transition-colors group"
              >
                {/* Name & Photo */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={c.image}
                      alt={c.name}
                      className="w-10 h-10 object-cover rounded-xl border border-border shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-text-primary truncate">
                        {c.name}
                      </p>
                      <span className="text-[10px] text-text-muted font-mono truncate block">
                        /{c.slug}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Bengali Name */}
                <td className="px-4 py-3 text-xs font-bold text-text-secondary">
                  {c.bengaliName || '—'}
                </td>

                {/* Hindi Name */}
                <td className="px-4 py-3 text-xs font-bold text-text-secondary">
                  {c.hindiName || '—'}
                </td>

                {/* Product Count */}
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 text-xs font-black text-text-primary">
                    <Package className="w-3.5 h-3.5 text-primary shrink-0" />
                    {count} items
                  </span>
                </td>

                {/* Subcategories tags */}
                <td className="px-4 py-3 max-w-xs">
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(c.subcategories) ? c.subcategories : [])
                      .slice(0, 3)
                      .map((sub, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded-md bg-surface-soft text-[10px] font-bold text-text-secondary border border-border"
                        >
                          {sub}
                        </span>
                      ))}
                    {c.subcategories && c.subcategories.length > 3 && (
                      <span className="text-[10px] text-text-muted font-bold self-center">
                        +{c.subcategories.length - 3} more
                      </span>
                    )}
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <StatusBadge status="Active" size="sm" />
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(c)}
                    className="p-1.5 rounded-lg bg-surface-soft hover:bg-primary/10 text-text-secondary hover:text-primary transition-colors cursor-pointer"
                    title="Edit category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </AdminTable>
      </div>

      {/* Add / Edit Category Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingCategory
            ? t('admin.categories.editCategory')
            : t('admin.categories.addCategory')
        }
        subtitle="Manage grocery department names across English, Bengali and Hindi."
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          {editingCategory && <button type="button" className="text-red-700 text-sm" onClick={handleDeleteCategory}>Delete category</button>}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">
                {t('admin.categories.categoryName')} *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Snacks & Namkeen"
                className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary focus:outline-hidden focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">
                  {t('admin.categories.bengaliName')}
                </label>
                <input
                  type="text"
                  value={formData.bengaliName}
                  onChange={(e) =>
                    setFormData({ ...formData, bengaliName: e.target.value })
                  }
                  placeholder="যেমন: ডেয়ারি ও ডিম"
                  className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary focus:outline-hidden focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">
                  {t('admin.categories.hindiName')}
                </label>
                <input
                  type="text"
                  value={formData.hindiName}
                  onChange={(e) =>
                    setFormData({ ...formData, hindiName: e.target.value })
                  }
                  placeholder="जैसे: डेयरी और अंडे"
                  className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary focus:outline-hidden focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">
                {t('admin.categories.tagline')}
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) =>
                  setFormData({ ...formData, tagline: e.target.value })
                }
                placeholder="Farm-fresh milk, butter and eggs in 10-15 mins"
                className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary focus:outline-hidden focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">
                {t('admin.categories.subcategories')} (comma separated)
              </label>
              <input
                type="text"
                value={formData.subcategories}
                onChange={(e) =>
                  setFormData({ ...formData, subcategories: e.target.value })
                }
                placeholder="All, Milk, Butter & Cheese, Eggs & Bread"
                className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary focus:outline-hidden focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">
                Banner / Thumbnail Image URL
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
              className="px-4 py-2 rounded-xl bg-surface-soft hover:bg-surface border border-border text-xs font-bold text-text-secondary cursor-pointer"
            >
              {t('admin.common.cancel')}
            </button>
            <button
              type="submit" disabled={saving}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-black shadow-xs cursor-pointer hover:scale-105 active:scale-95 transition-all"
            >
              {t('admin.common.save')}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
