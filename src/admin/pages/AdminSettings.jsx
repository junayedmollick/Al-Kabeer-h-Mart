import { api } from '../../lib/api';
import { useAdminData } from '../../context/AdminDataContext';
import { useCatalog } from '../../context/CatalogContext';
import { PasswordForm } from '../../components/account/PasswordForm';
import React, { useState } from 'react';
import {
  Store,
  Palette,
  Bell,
  Shield,
  Save,
  Check,
  Globe2,
  Phone,
  MapPin,
  Sparkles
} from 'lucide-react';
import { useLanguage, availableLanguages } from '../../context/LanguageContext';

const STORAGE_KEY = 'alkabeer_admin_store_settings';

export function AdminSettings() {
  const { t, language, setLanguage } = useLanguage();

  const { settings: initialSettings, refreshAdmin } = useAdminData();
  const { refreshCatalog, settings: paymentConfig } = useCatalog();
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSave = async e => {
    e.preventDefault(); if(saving) return; setSaving(true);
    try { const saved = await api('/admin/settings', { method:'PUT', body:settings }); setSettings(saved); await Promise.all([refreshAdmin(), refreshCatalog()]); showToast('Settings saved.'); } catch(e) { showToast(e.message); } finally { setSaving(false); }
  };

  const tabs = [
    { id: 'general', label: t('admin.settings.tabGeneral'), icon: Store },
    { id: 'appearance', label: t('admin.settings.tabAppearance'), icon: Palette },
    { id: 'notifications', label: t('admin.settings.tabNotifications'), icon: Bell },
    { id: 'account', label: t('admin.settings.tabAccount'), icon: Shield },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-4xl">
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
      <div>
        <h2 className="text-xl font-black text-text-primary tracking-tight">
          {t('admin.settings.title')}
        </h2>
        <p className="text-xs text-text-secondary mt-0.5">
          {t('admin.settings.subtitle')}
        </p>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar p-1.5 rounded-2xl bg-surface border border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-primary text-white shadow-2xs font-black'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-soft'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Settings Form Container */}
      <form onSubmit={handleSave} className="rounded-2xl bg-surface border border-border p-6 shadow-subtle space-y-6">
        {activeTab === 'general' && <section className="p-5 rounded-2xl border border-border bg-surface space-y-4">
          <h3 className="font-bold">Delivery and checkout</h3>
          <div className="p-3 bg-surface-soft rounded-xl text-sm"><strong>Checkout: {paymentConfig.checkoutPaymentMode === 'preference' ? 'Payment selection only — no website payments' : 'Online payments'}</strong><p className="text-text-secondary mt-1">{paymentConfig.checkoutPaymentMode === 'preference' ? 'Customers can choose cash, UPI or card. Their choice is saved with the order and sent to WhatsApp. Record payments received outside the website from the order receipt.' : 'UPI and cards require Razorpay keys and a payment webhook. See the payment setup section in the project README.'}</p></div>
          <label className="block text-sm">Delivery fee (₹)<input aria-label="Delivery fee" type="number" min="0" step="0.01" value={settings.deliveryFee} onChange={e => setSettings({...settings,deliveryFee:Number(e.target.value)})} className="block border rounded-lg p-2 mt-1"/></label>
          <label className="block text-sm">Minimum order (₹)<input type="number" min="0" value={settings.minimumOrder} onChange={e => setSettings({...settings,minimumOrder:Number(e.target.value)})} className="block border rounded-lg p-2 mt-1"/></label>
          <label className="block text-sm">Service pincodes (comma separated)<input value={settings.servicePincodes.join(',')} onChange={e => setSettings({...settings,servicePincodes:e.target.value.split(',').map(p => p.trim())})} className="block border rounded-lg p-2 mt-1 w-full"/></label>
          <label className="flex gap-2 text-sm"><input type="checkbox" checked={settings.acceptingOrders} onChange={e => setSettings({...settings,acceptingOrders:e.target.checked})}/>Accept new orders</label>
        </section>}
        {/* GENERAL TAB */}
        {activeTab === 'general' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-sm font-black text-text-primary border-b border-border pb-2">
              Store Information & Hub Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">
                  {t('admin.settings.storeName')}
                </label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) =>
                    setSettings({ ...settings, storeName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary focus:outline-hidden focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">
                  {t('admin.settings.currency')}
                </label>
                <input
                  type="text"
                  value={settings.currency}
                  onChange={(e) =>
                    setSettings({ ...settings, currency: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary focus:outline-hidden focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">
                  {t('admin.settings.tagline')}
                </label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) =>
                    setSettings({ ...settings, tagline: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary focus:outline-hidden focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">
                  {t('admin.settings.bengaliSlogan')}
                </label>
                <input
                  type="text"
                  value={settings.bengaliSlogan}
                  onChange={(e) =>
                    setSettings({ ...settings, bengaliSlogan: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary focus:outline-hidden focus:border-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-text-secondary mb-1">
                  {t('admin.settings.address')}
                </label>
                <textarea
                  rows={2}
                  value={settings.address}
                  onChange={(e) =>
                    setSettings({ ...settings, address: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary focus:outline-hidden focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">
                  {t('admin.settings.phone')}
                </label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) =>
                    setSettings({ ...settings, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary focus:outline-hidden focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">
                  {t('admin.settings.whatsapp')}
                </label>
                <input
                  type="text"
                  value={settings.whatsapp}
                  onChange={(e) =>
                    setSettings({ ...settings, whatsapp: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary focus:outline-hidden focus:border-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* APPEARANCE TAB */}
        {activeTab === 'appearance' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-sm font-black text-text-primary border-b border-border pb-2">
              Language & Regional Settings
            </h3>

            <div className="max-w-md">
              {/* Language Selector */}
              <div className="p-4 rounded-2xl bg-surface-soft border border-border space-y-3">
                <p className="text-xs font-bold text-text-primary">
                  {t('admin.settings.language')}
                </p>
                <div className="space-y-1.5">
                  {availableLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setLanguage(lang.code)}
                      className={`w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${
                        language === lang.code
                          ? 'border-primary bg-surface text-primary shadow-2xs'
                          : 'border-border text-text-secondary hover:bg-surface'
                      }`}
                    >
                      <span>{lang.name} ({lang.native})</span>
                      {language === lang.code && <Check className="w-4 h-4 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-sm font-black text-text-primary border-b border-border pb-2">
              Alerts & System Notifications
            </h3>

            <div className="space-y-3">
              {[
                {
                  key: 'orderAlerts',
                  title: t('admin.settings.orderAlerts'),
                  desc: 'Receive immediate visual notification on express customer checkout',
                },
                {
                  key: 'stockAlerts',
                  title: t('admin.settings.stockAlerts'),
                  desc: 'Flag inventory when product remaining stock drops below 10 units',
                },
                {
                  key: 'soundAlerts',
                  title: t('admin.settings.soundAlerts'),
                  desc: 'Play audio sound effect when new order is received at Bhagabatipur Hub',
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="p-3.5 rounded-xl bg-surface-soft border border-border flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-xs font-bold text-text-primary">{item.title}</p>
                    <p className="text-[11px] text-text-muted">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!settings[item.key]}
                    onChange={(e) =>
                      setSettings({ ...settings, [item.key]: e.target.checked })
                    }
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACCOUNT TAB */}
        {activeTab === 'account' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-sm font-black text-text-primary border-b border-border pb-2">
              Admin Profile & Credentials
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">
                  Administrator Name
                </label>
                <input
                  type="text"
                  value={settings.adminName || 'Junayet Mollick'}
                  onChange={(e) =>
                    setSettings({ ...settings, adminName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary focus:outline-hidden focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">
                  Admin Email
                </label>
                <input
                  type="email"
                  value={settings.adminEmail || 'admin@alkabeerhmart.com'}
                  onChange={(e) =>
                    setSettings({ ...settings, adminEmail: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary focus:outline-hidden focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary focus:outline-hidden focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new strong password"
                  className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary focus:outline-hidden focus:border-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* Form Footer Save Button */}
        <div className="pt-4 border-t border-border flex items-center justify-end">
          <button
            type="submit" disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-black shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{t('admin.settings.saveChanges')}</span>
          </button>
        </div>
      </form>
      {activeTab === 'account' && <PasswordForm />}
    </div>
  );
}
