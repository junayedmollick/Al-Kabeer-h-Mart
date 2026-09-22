import React from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { useLanguage } from '../../context/LanguageContext';

export function VipModal({ isOpen, onClose }) {
  const { settings } = useCatalog();
  const { t } = useLanguage();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-5" onClick={onClose}>
      <section role="dialog" aria-modal="true" aria-label="VIP membership" className="bg-surface p-8 rounded-3xl max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold">{t('account.vipMembership') || 'VIP membership'}</h2>
        <p className="my-4 text-text-secondary">{t('vip.modalSubtitle') || 'Membership enrolment is not available online yet. Contact the store for availability and terms.'}</p>
        <a className="text-primary font-bold" href={'tel:' + settings.phone}>{t('footer.callUs') || 'Call the store'}</a>
        <button className="ml-6 p-2 font-bold hover:text-primary cursor-pointer" onClick={onClose}>{t('admin.common.close') || 'Close'}</button>
      </section>
    </div>
  );
}
