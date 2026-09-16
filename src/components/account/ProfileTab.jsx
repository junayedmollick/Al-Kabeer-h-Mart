import React, { useState } from 'react';
import { User, Phone, Mail, MapPin, Edit2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function ProfileTab({ profile, setProfile }) {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...profile });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try { await setProfile({ ...formData }); } catch(e) { alert(e.message); return; }
    setIsEditing(false);
  };

  return (
    <div className="bg-surface rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-border shadow-subtle space-y-6">
      <div className="flex items-start sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div className="min-w-0">
          <h3 className="text-xl font-black text-text-primary">
            {t('account.profile')}
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Manage your personal information and default delivery contact
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={() => {
              setFormData({ ...profile });
              setIsEditing(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-surface-soft hover:bg-primary-light text-primary font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0 whitespace-nowrap"
          >
            <Edit2 className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">{t('account.editProfile')}</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1">
              {t('account.fullName')}
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-surface-soft border border-border focus:border-primary rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1">
              {t('account.email')}
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-surface-soft border border-border focus:border-primary rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1">
              {t('account.phone')}
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-surface-soft border border-border focus:border-primary rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1">
              {t('account.address')}
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-surface-soft border border-border focus:border-primary rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              {t('account.saveChanges')}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-surface-soft hover:bg-border text-text-secondary font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              {t('account.cancel')}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-surface-soft p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-text-muted text-xs mb-1">
              <User className="w-3.5 h-3.5" />
              <span>{t('account.fullName')}</span>
            </div>
            <div className="font-bold text-sm text-text-primary">{profile.name}</div>
          </div>

          <div className="bg-surface-soft p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-text-muted text-xs mb-1">
              <Phone className="w-3.5 h-3.5" />
              <span>{t('account.phone')}</span>
            </div>
            <div className="font-bold text-sm text-text-primary">{profile.phone}</div>
          </div>

          <div className="bg-surface-soft p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-text-muted text-xs mb-1">
              <Mail className="w-3.5 h-3.5" />
              <span>{t('account.email')}</span>
            </div>
            <div className="font-bold text-sm text-text-primary">{profile.email}</div>
          </div>

          <div className="bg-surface-soft p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-text-muted text-xs mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>Primary Delivery Hub</span>
            </div>
            <div className="font-bold text-sm text-text-primary truncate">{profile.address}</div>
          </div>
        </div>
      )}
    </div>
  );
}
