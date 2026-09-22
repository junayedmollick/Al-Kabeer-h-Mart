import React, { useEffect } from 'react';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Crown
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export function CartDrawer({ isOpen, onClose, onOpenVip }) {
  const { t } = useLanguage();
  const {
    cart,
    addToCart,
    removeFromCart,
    deleteFromCart,
    itemCount,
    cartSubtotal,
    deliveryFee,
    cartTotal,
    isVip
  } = useCart();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background body scroll when open
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

  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;

    let message = `🛒 *New Order from Al Kabeer H Mart Website*\n`;
    message += `---------------------------------\n`;
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.name} (${item.weight}) x ${item.quantity} = ₹${item.price * item.quantity}\n`;
    });
    message += `---------------------------------\n`;
    message += `Item Total: ₹${cartSubtotal}\n`;
    message += `Delivery Fee: ₹${deliveryFee} ${isVip ? '(VIP Free)' : ''}\n`;
    message += `*Grand Total: ₹${cartTotal}*\n\n`;
    message += `Delivery Address: Bhagabatipur, Hooghly\n`;
    message += `Please confirm my order and dispatch time. Thank you!`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/919002461519?text=${encoded}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-surface">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h3 className="font-black text-text-primary text-base sm:text-lg">
                {t('cartDrawer.title') || 'Your Shopping Cart'}
              </h3>
              <span className="text-xs bg-primary-light text-primary font-bold px-2 py-0.5 rounded-full">
                {itemCount} {itemCount === 1 ? (t('cartDrawer.itemCountSingle') || 'item') : (t('cartDrawer.itemsCount') || 'items')}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-surface-soft text-text-muted hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 rounded-full bg-surface-soft flex items-center justify-center text-text-muted mb-4">
                  <ShoppingBag className="w-10 h-10 stroke-1" />
                </div>
                <h4 className="text-lg font-black text-text-primary mb-1">
                  {t('cart.emptyTitle')}
                </h4>
                <p className="text-xs text-text-secondary max-w-xs mb-6">
                  {t('cartDrawer.emptyDesc') || t('cart.emptySubtitle')}
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-primary hover:bg-primary-dark text-white font-black text-xs px-6 py-3 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  {t('cart.startShopping')}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* VIP Banner if not VIP */}
                {!isVip && (
                  <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-amber-900 font-medium">
                      <Crown className="w-4 h-4 text-secondary fill-secondary shrink-0" />
                      <span>{t('cartDrawer.vipNotice')}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenVip();
                      }}
                      className="text-xs font-black text-amber-900 underline hover:text-amber-700 shrink-0 cursor-pointer"
                    >
                      {t('cartDrawer.joinVip')}
                    </button>
                  </div>
                )}

                {/* Cart Items List */}
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 bg-surface-soft/60 p-3 rounded-2xl border border-border/60 hover:border-border transition-all"
                  >
                    {/* Item Image */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover bg-surface shrink-0"
                    />

                    {/* Item Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-text-primary truncate">
                        {item.name}
                      </h4>
                      <span className="text-[11px] text-text-muted block">
                        {item.weight}
                      </span>
                      <div className="text-xs font-black text-text-primary mt-1">
                        ₹{item.price * item.quantity}
                        {item.quantity > 1 && (
                          <span className="text-[10px] text-text-muted font-normal ml-1">
                            (₹{item.price} {t('cartDrawer.each') || 'each'})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls & Delete */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-surface border border-border rounded-xl shadow-2xs">
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="w-7 h-7 flex items-center justify-center text-text-secondary hover:text-primary transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-black px-1.5 min-w-[18px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => addToCart(item)}
                          className="w-7 h-7 flex items-center justify-center text-text-secondary hover:text-primary transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteFromCart(item.id)}
                        className="text-text-muted hover:text-danger p-1 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer & Checkout */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-border bg-surface shadow-lg">
              {/* Bill Details */}
              <div className="bg-surface-soft rounded-2xl p-3.5 mb-4 space-y-2 text-xs">
                <div className="flex justify-between text-text-secondary">
                  <span>{t('cart.itemTotal')}</span>
                  <span className="font-semibold text-text-primary">₹{cartSubtotal}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>{t('cart.deliveryFee')}</span>
                  <span className={`font-semibold ${isVip ? 'text-success font-bold' : 'text-text-primary'}`}>
                    {isVip ? (t('cart.vipFreeDelivery') || 'FREE (VIP)') : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between items-baseline font-black text-sm text-text-primary">
                  <span>{t('cart.grandTotal')}</span>
                  <span className="text-base text-primary">₹{cartTotal}</span>
                </div>
              </div>

              {/* Instant WhatsApp Order Button */}
              <button
                type="button"
                onClick={handleWhatsAppCheckout}
                className="w-full bg-[#25D366] hover:bg-[#1ebc5c] text-white font-black py-3.5 px-5 rounded-2xl flex items-center justify-between shadow-md transition-all hover:scale-[1.02] active:scale-98 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{t('cartDrawer.orderWhatsApp') || 'Order via WhatsApp'}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-black/15 px-3 py-1 rounded-xl text-xs">
                  <span>₹{cartTotal}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>

              <p className="text-[10px] text-center text-text-muted mt-2">
                {t('cartDrawer.dispatchNote') || '⚡ Orders dispatched within 10–15 minutes from Bhagabatipur hub.'}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
