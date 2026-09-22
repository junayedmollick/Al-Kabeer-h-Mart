import React, { useEffect } from 'react';
import { AlertTriangle, X, XCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function CancelOrderModal({ isOpen, onClose, onConfirm, order }) {
  const { t } = useLanguage();
  // Lock background scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-surface rounded-3xl p-6 shadow-2xl border border-border space-y-4 animate-scale-up"
      >
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-danger border border-rose-200 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-text-primary">
                {t('cancelOrderModal.title') || 'Cancel this order?'}
              </h3>
              <span className="text-xs text-text-muted font-mono">
                Order #{order.id}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-soft hover:bg-surface text-text-muted hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs sm:text-sm text-text-secondary leading-relaxed space-y-2">
          <p>
            {t('cancelOrderModal.confirmPrompt') || 'Are you sure you want to cancel order'} <strong className="text-text-primary font-mono font-bold">#{order.id}</strong>?
          </p>
          <p className="text-text-muted text-xs">
            {t('cancelOrderModal.whatsappNotice') || 'A cancellation notification will also be sent to our Bhagabatipur store on WhatsApp to halt dispatch immediately.'}
          </p>

          <div className="p-3 bg-surface-soft rounded-2xl border border-border/80 text-xs">
            <div className="flex justify-between items-center text-text-secondary">
              <span>{t('cancelOrderModal.itemsInOrder') || 'Items in order:'}</span>
              <span className="font-bold text-text-primary">{order.items?.length || 0} item(s)</span>
            </div>
            <div className="flex justify-between items-center text-text-secondary mt-1">
              <span>{t('cancelOrderModal.totalValue') || 'Total value:'}</span>
              <span className="font-bold text-text-primary">₹{order.total}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-soft text-text-primary text-xs font-bold transition-colors cursor-pointer"
          >
            {t('cancelOrderModal.keepOrder') || 'Keep Order'}
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm(order.id);
              onClose();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-danger hover:bg-red-700 text-white text-xs font-black transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>{t('cancelOrderModal.confirmCancel') || 'Yes, Cancel Order'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
