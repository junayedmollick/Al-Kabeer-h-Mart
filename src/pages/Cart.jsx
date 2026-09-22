import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Crown,
  Clock,
  MessageCircle,
  ArrowLeft,
  CreditCard
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export function Cart({ onOpenVip }) {
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
  const { isAuthenticated, setPendingAction } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleProceedCheckout = () => {
    if (!isAuthenticated) {
      setPendingAction({ type: 'cart_checkout' });
      navigate('/login', {
        state: { from: { pathname: '/checkout' } },
      });
    } else {
      navigate('/checkout', {
        state: { source: 'cart' },
      });
    }
  };

  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;

    let message = `🛒 *New Order from Al Kabeer H Mart Website*\n`;
    message += `---------------------------------\n`;
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.name} (${item.weight}) x ${item.quantity} = ₹${
        item.price * item.quantity
      }\n`;
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

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-text-secondary font-medium mb-6">
        <Link to="/" className="hover:text-primary transition-colors">
          {t('nav.home')}
        </Link>
        <span className="text-text-muted">/</span>
        <span className="text-primary font-bold">{t('cart.title')}</span>
      </nav>

      <div className="flex items-baseline justify-between mb-6 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
            {t('cart.title')}
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            {t('cart.reviewDesc') || 'Review your groceries, pack quantities, and order bill'}
          </p>
        </div>

        {cart.length > 0 && (
          <span className="text-xs font-bold bg-primary-light text-primary px-3 py-1 rounded-full">
            {itemCount} {itemCount === 1 ? t('cart.item') : t('cart.items')}
          </span>
        )}
      </div>

      {cart.length === 0 ? (
        /* Empty State */
        <div className="py-20 bg-surface rounded-3xl border border-border text-center p-6 shadow-subtle max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-full bg-surface-soft text-text-muted flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-10 h-10 stroke-1" />
          </div>
          <h2 className="text-xl font-black text-text-primary mb-1">
            {t('cart.emptyTitle')}
          </h2>
          <p className="text-xs text-text-secondary max-w-xs mx-auto mb-6">
            {t('cart.emptySubtitle')}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-black text-xs px-6 py-3 rounded-xl transition-all shadow-xs"
          >
            <span>{t('cart.startShopping')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* LEFT COLUMN: Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* VIP Promo Bar if not VIP */}
            {!isVip && (
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/80 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Crown className="w-5 h-5 fill-amber-700" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-amber-900">
                      Save ₹10 Delivery Fee with 999 VIP Pass
                    </h3>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      Get unlimited free 10-15 min deliveries for 365 days.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenVip}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-black px-3.5 py-1.5 rounded-xl text-xs shrink-0 transition-colors cursor-pointer"
                >
                  Join VIP
                </button>
              </div>
            )}

            <div className="bg-surface rounded-3xl border border-border shadow-subtle divide-y divide-border/60 overflow-hidden">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-surface-soft/40 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-contain bg-surface-soft p-1 shrink-0 border border-border/60"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-text-primary truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        {item.weight}
                      </p>
                      <div className="text-xs sm:text-sm font-black text-text-primary mt-1">
                        ₹{item.price}
                      </div>
                    </div>
                  </div>

                  {/* Quantity Stepper & Remove */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center bg-surface-soft rounded-xl border border-border p-0.5">
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-surface rounded-lg transition-colors text-text-primary cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2.5 text-xs font-black min-w-[24px] text-center text-text-primary">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => addToCart(item)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-surface rounded-lg transition-colors text-text-primary cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteFromCart(item.id)}
                      className="text-text-muted hover:text-danger p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Shopping Link */}
            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('cart.addMoreItems')}</span>
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-surface rounded-3xl p-5 sm:p-6 border border-border shadow-subtle space-y-4 sticky top-28">
              <h2 className="text-base font-black text-text-primary pb-3 border-b border-border">
                {t('cart.billDetails')}
              </h2>

              <div className="space-y-2.5 text-xs text-text-secondary">
                <div className="flex justify-between">
                  <span>{t('cart.itemTotal')}</span>
                  <span className="font-bold text-text-primary">₹{cartSubtotal}</span>
                </div>

                <div className="flex justify-between">
                  <span>{t('cart.deliveryFee')}</span>
                  <span className={`font-bold ${isVip ? 'text-success' : 'text-text-primary'}`}>
                    {isVip ? t('cart.vipFreeDelivery') : `₹${deliveryFee}`}
                  </span>
                </div>

                <div className="flex justify-between text-success font-medium">
                  <span>{t('cart.handlingFee')}</span>
                  <span>{t('cart.free')}</span>
                </div>

                <div className="border-t border-dashed border-border pt-3 flex justify-between items-baseline font-black text-sm sm:text-base text-text-primary">
                  <span>{t('cart.grandTotal')}</span>
                  <span className="text-lg text-primary">₹{cartTotal}</span>
                </div>
              </div>

              {/* Delivery Hub Location Indicator */}
              <div className="p-3 bg-surface-soft rounded-2xl flex items-start gap-2.5 text-[11px] text-text-secondary">
                <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-text-primary">{t('cart.deliveryPromise')}</span>
                  <p className="text-text-muted mt-0.5">
                    {t('cart.deliveryPromiseSub')}
                  </p>
                </div>
              </div>

              {/* PRIMARY: Proceed to Checkout Button (with Auth Guard) */}
              <button
                type="button"
                onClick={handleProceedCheckout}
                className="w-full bg-primary hover:bg-primary-dark active:scale-[0.99] text-white font-black py-4 px-4 rounded-2xl flex items-center justify-between shadow-md transition-all cursor-pointer text-xs sm:text-sm"
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span>{t('cart.proceedCheckout')}</span>
                </div>
                <div className="bg-black/15 px-2.5 py-1 rounded-xl text-xs font-black">
                  ₹{cartTotal}
                </div>
              </button>

              {/* SECONDARY: WhatsApp Checkout Button */}
              <button
                type="button"
                onClick={handleWhatsAppCheckout}
                className="w-full bg-[#25D366] hover:bg-[#1ebc5c] text-white font-black py-3 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-xs transition-all hover:scale-[1.01] active:scale-98 cursor-pointer text-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t('cart.orderOnWhatsApp')}</span>
              </button>

              <p className="text-[10px] text-center text-text-muted leading-tight">
                {t('cart.dispatchedFrom')}
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
