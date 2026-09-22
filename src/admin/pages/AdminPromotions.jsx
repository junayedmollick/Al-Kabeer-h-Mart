import { api } from '../../lib/api';
import { useAdminData } from '../../context/AdminDataContext';
import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Search,
  Check,
  Percent,
  Calendar,
  Sparkles,
  Power,
  Trash2
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { StatusBadge } from '../components/StatusBadge';
import { AdminModal } from '../components/AdminModal';
import { AdminTable } from '../components/AdminTable';

const STORAGE_KEY = 'alkabeer_admin_promotions';

export function AdminPromotions() {
  const { t } = useLanguage();

  const { promotions, refreshAdmin } = useAdminData();
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'expired'
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    discountType: 'Flat Discount',
    discountValue: '₹50 OFF',
    minOrder: 299,
    validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const [saving, setSaving] = useState(false);
  const toggleStatus = async id => {
    const p = promotions.find(p => p.id === id);
    try {
      await api('/admin/promotions/' + encodeURIComponent(id), { method: 'PUT', body: { ...p, status: p.status === 'Active' ? 'Expired' : 'Active' } });
    } catch(e) {
      const updated = promotions.map(item => item.id === id ? { ...item, status: item.status === 'Active' ? 'Expired' : 'Active' } : item);
      localStorage.setItem('alkabeer_promotions', JSON.stringify(updated));
    }
    await refreshAdmin();
    showToast('Promotion updated.');
  };
  const handleDeletePromo = async id => {
    if(!window.confirm('Delete this promotion?')) return;
    try {
      await api('/admin/promotions/' + encodeURIComponent(id), { method:'DELETE' });
    } catch(e) {
      const updated = promotions.filter(item => item.id !== id);
      localStorage.setItem('alkabeer_promotions', JSON.stringify(updated));
    }
    await refreshAdmin();
    showToast('Promotion deleted.');
  };
  const handleCreatePromo = async e => {
    e.preventDefault(); if(saving) return; setSaving(true);
    const newPromo = {
      id: 'PROMO-' + Math.floor(100 + Math.random() * 900),
      ...formData,
      title: formData.title || formData.code,
      status: 'Active',
      discountType: formData.discountValue.includes('%') ? 'Percentage' : 'Flat Discount',
      usageLimit: Number(formData.usageLimit) || 100,
      usageCount: 0,
      validUntil: formData.validUntil || '31 Dec 2025',
    };
    try {
      await api('/admin/promotions', { method:'POST', body: newPromo });
    } catch(e) {
      const current = JSON.parse(localStorage.getItem('alkabeer_promotions') || 'null') || promotions;
      localStorage.setItem('alkabeer_promotions', JSON.stringify([newPromo, ...current]));
    } finally {
      await refreshAdmin();
      setIsModalOpen(false);
      showToast('Coupon created.');
      setSaving(false);
    }
  };

  const filteredPromotions = promotions.filter((p) => {
    const matchesTab =
      activeTab === 'active' ? p.status === 'Active' : p.status === 'Expired';
    const matchesSearch =
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const activeCount = promotions.filter((p) => p.status === 'Active').length;
  const expiredCount = promotions.filter((p) => p.status === 'Expired').length;

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
            {t('admin.promotions.title')}
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            {t('admin.promotions.subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormData({
              code: '',
              title: '',
              description: '',
              discountType: 'Flat Discount',
              discountValue: '₹50 OFF',
              minOrder: 299,
              validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
            });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('admin.promotions.addPromotion')}</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="p-4 rounded-2xl bg-surface border border-border shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="inline-flex items-center p-1 rounded-xl bg-surface-soft border border-border w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex-1 sm:flex-initial ${
              activeTab === 'active'
                ? 'bg-surface text-primary shadow-2xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {t('admin.promotions.activeTab')} ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('expired')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex-1 sm:flex-initial ${
              activeTab === 'expired'
                ? 'bg-surface text-primary shadow-2xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {t('admin.promotions.expiredTab')} ({expiredCount})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search coupons..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-primary"
          />
        </div>
      </div>

      {/* Mobile Card View (screens < 768px) */}
      <div className="md:hidden space-y-3">
        {filteredPromotions.length === 0 ? (
          <div className="p-8 text-center bg-surface rounded-2xl border border-border">
            <Tag className="w-8 h-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm font-bold text-text-primary">No coupons found</p>
          </div>
        ) : (
          filteredPromotions.map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-2xl bg-surface border border-border shadow-subtle flex flex-col gap-3"
            >
              {/* Header: Code & Discount & Status */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
                      {p.code}
                    </span>
                    {p.badge && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-surface-soft text-text-secondary border border-border">
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-black text-text-primary mt-1.5">
                    {p.title}
                  </h4>
                  <p className="text-xs text-text-muted mt-0.5">{p.description}</p>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    {p.discountValue}
                  </span>
                  <StatusBadge status={p.status} size="sm" />
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-border/60 bg-surface-soft/40 p-2.5 rounded-xl">
                <div>
                  <span className="text-[10px] text-text-muted block uppercase font-bold">Min Order</span>
                  <span className="font-bold text-text-primary">
                    {p.minOrder === 0 ? 'No minimum' : `₹${p.minOrder}`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block uppercase font-bold">Valid Until</span>
                  <span className="font-bold text-text-primary">{p.validUntil}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block uppercase font-bold">Discount Type</span>
                  <span className="font-medium text-text-secondary">{p.discountType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block uppercase font-bold">Usage</span>
                  <span className="font-medium text-text-secondary">
                    <strong>{p.usageCount}</strong> / {p.usageLimit || '∞'}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => toggleStatus(p.id)}
                  className="px-3 py-1.5 rounded-xl bg-surface-soft hover:bg-primary/10 text-text-secondary hover:text-primary text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{p.status === 'Active' ? 'Mark Expired' : 'Reactivate'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePromo(p.id)}
                  className="p-1.5 rounded-xl bg-surface-soft hover:bg-danger/10 text-text-secondary hover:text-danger transition-colors cursor-pointer"
                  title="Delete coupon"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View (screens >= 768px) */}
      <div className="hidden md:block">
        <AdminTable
          columns={[
            { title: t('admin.promotions.code') },
            { title: t('admin.promotions.discount') },
            { title: t('admin.promotions.minOrder') },
            { title: t('admin.promotions.validUntil') },
            { title: t('admin.promotions.usage') },
            { title: t('admin.promotions.status') },
            { title: 'Actions', align: 'right' },
          ]}
          isEmpty={filteredPromotions.length === 0}
          totalCount={promotions.length}
          currentCount={filteredPromotions.length}
        >
          {filteredPromotions.map((p) => (
            <tr
              key={p.id}
              className="hover:bg-surface-soft/60 transition-colors group"
            >
              {/* Code & Title */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-xs px-2 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                    {p.code}
                  </span>
                  {p.badge && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-surface-soft text-text-secondary border border-border">
                      {p.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-text-primary mt-1">
                  {p.title}
                </p>
                <p className="text-[10px] text-text-muted">{p.description}</p>
              </td>

              {/* Discount Value */}
              <td className="px-4 py-3">
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  {p.discountValue}
                </span>
                <span className="text-[10px] text-text-muted block">
                  {p.discountType}
                </span>
              </td>

              {/* Min Order */}
              <td className="px-4 py-3 text-xs font-bold text-text-primary">
                {p.minOrder === 0 ? 'No minimum' : `₹${p.minOrder}`}
              </td>

              {/* Valid Until */}
              <td className="px-4 py-3 text-xs text-text-secondary">
                {p.validUntil}
              </td>

              {/* Usage */}
              <td className="px-4 py-3 text-xs text-text-secondary">
                <strong>{p.usageCount}</strong> / {p.usageLimit || '∞'}
              </td>

              {/* Status */}
              <td className="px-4 py-3">
                <StatusBadge status={p.status} size="sm" />
              </td>

              {/* Action Buttons */}
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggleStatus(p.id)}
                    title={p.status === 'Active' ? 'Mark Expired' : 'Reactivate'}
                    className="p-1.5 rounded-lg bg-surface-soft hover:bg-primary/10 text-text-secondary hover:text-primary transition-colors cursor-pointer"
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePromo(p.id)}
                    title="Delete coupon"
                    className="p-1.5 rounded-lg bg-surface-soft hover:bg-danger/10 text-text-secondary hover:text-danger transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      </div>

      {/* Add Coupon Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('admin.promotions.addPromotion')}
        subtitle="Create discount voucher for customers of Al-Kabeer h Mart."
      >
        <form onSubmit={handleCreatePromo} className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">
                {t('admin.promotions.code')} *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toUpperCase() })
                }
                placeholder="e.g. MART50, DISPATCH10"
                className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs font-mono font-bold text-text-primary focus:outline-hidden focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">
                {t('admin.promotions.titleLabel')}
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g. ₹50 Off on Daily Groceries"
                className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary focus:outline-hidden focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">
                  Discount Value *
                </label>
                <input
                  type="text"
                  required
                  value={formData.discountValue}
                  onChange={(e) =>
                    setFormData({ ...formData, discountValue: e.target.value })
                  }
                  placeholder="e.g. ₹50 OFF, 15% OFF"
                  className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary focus:outline-hidden focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">
                  {t('admin.promotions.minOrder')} (₹)
                </label>
                <input
                  type="number"
                  value={formData.minOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, minOrder: e.target.value })
                  }
                  placeholder="299"
                  className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary focus:outline-hidden focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">
                {t('admin.promotions.validUntil')}
              </label>
              <input
                type="text"
                value={formData.validUntil}
                onChange={(e) =>
                  setFormData({ ...formData, validUntil: e.target.value })
                }
                placeholder="30 Jun 2025"
                className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary focus:outline-hidden focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">
                {t('admin.promotions.description')}
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Terms & Conditions or description"
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
