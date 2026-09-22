import { payForOrder } from '../lib/payments';
import { orderWhatsAppUrl } from '../lib/whatsapp';
import { flushSync } from 'react-dom';
import { api } from '../lib/api';
import { useCatalog } from '../context/CatalogContext';
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ShoppingBag,
  MapPin,
  Clock,
  CheckCircle2,
  Crown,
  CreditCard,
  Banknote,
  QrCode,
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  Truck,
  ExternalLink
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useLanguage } from '../context/LanguageContext';
import { PaymentOptions } from '../components/PaymentOptions';

export function Checkout() {
  const { settings } = useCatalog();
  const [quote, setQuote] = useState(null), [quoteError, setQuoteError] = useState(''), [orderError, setOrderError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [couponCode, setCouponCode] = useState('');
  const requestKey = useRef(crypto.randomUUID());
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, cartSubtotal, deliveryFee, isVip, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { addOrder } = useOrders();
  const { t } = useLanguage();

  // Determine checkout items based on navigation source
  const state = location.state || {};
  const isDirect = state.source === 'direct' && state.product;

  const checkoutItems = isDirect
    ? [{ ...state.product, quantity: state.quantity || 1 }]
    : cart;

  const def = user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];
  const initialAddr = { name: def?.name || user?.name || '', phone: def?.phone || user?.phone || '', address: def ? [def.house, def.street, def.landmark, def.city].filter(Boolean).join(', ') : user?.address || '', pincode: def?.pincode || settings.servicePincodes[0] || '' };
  const [name, setName] = useState(initialAddr.name);
  const [phone, setPhone] = useState(initialAddr.phone);
  const [address, setAddress] = useState(initialAddr.address);
  const [pincode, setPincode] = useState(initialAddr.pincode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Authentication Guard: if not authenticated, redirect to login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: { from: location },
        replace: true,
      });
    }
  }, [isAuthenticated, navigate, location]);

  // If no items in checkout and not in success view, redirect back
  useEffect(() => {
    if (checkoutItems.length === 0 && !orderSuccess && isAuthenticated && !isSubmitting) {
      navigate('/cart');
    }
  }, [checkoutItems, orderSuccess, isAuthenticated, isSubmitting, navigate]);

  const quoteInput = JSON.stringify({ items: checkoutItems.map(({id,quantity}) => ({id,quantity})), couponCode });
  useEffect(() => {
    let active = true;
    setQuote(null);
    setQuoteError('');
    if (isAuthenticated && checkoutItems.length && !orderSuccess) {
      api('/orders/quote', { method: 'POST', body: JSON.parse(quoteInput) })
        .then(q => { if (active) setQuote(q); })
        .catch(e => {
          if (active) {
            const subtotal = checkoutItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1), 0);
            const deliveryFee = Number(settings?.deliveryFee) || 10;
            const discount = 0;
            const total = Math.max(0, subtotal + deliveryFee - discount);
            setQuote({ subtotal, deliveryFee, discount, total });
          }
        });
    }
    return () => { active = false; };
  }, [quoteInput, isAuthenticated, orderSuccess, checkoutItems, settings?.deliveryFee]);
  const itemsTotal = quote?.subtotal ?? (isDirect ? (state.product?.price || 0) * (state.quantity || 1) : cartSubtotal);
  const currentDeliveryFee = quote?.deliveryFee ?? settings.deliveryFee;
  const finalTotal = quote?.total ?? itemsTotal + currentDeliveryFee;
  const handlePlaceOrder = async e => {
    e.preventDefault(); if (isSubmitting || !quote) return;
    setIsSubmitting(true); setOrderError('');
    let saved = false;
    try {
      let order = await addOrder({ ...JSON.parse(quoteInput), customerName: name, customerPhone: phone, deliveryAddress: address, pincode, paymentMethod, expectedTotal: quote.total }, requestKey.current);
      saved = true;
      if (order.paymentMode === 'online' && order.paymentCode !== 'cod') {
        try { order = await payForOrder(order); }
        catch(error) {
          if (!isDirect) clearCart();
          navigate('/order-confirmation/'+encodeURIComponent(order.id),{replace:true,state:{paymentError:error.message}});
          return;
        }
      }
      const whatsappUrl = orderWhatsAppUrl(order, settings.whatsapp, settings.storeName);
      // Save a reloadable confirmation URL before leaving this tab for WhatsApp.
      // Browser Back (or returning from the app) cannot re-submit the order.
      flushSync(() => {
        setOrderSuccess(order);
        if (!isDirect) clearCart();
        navigate('/order-confirmation/' + encodeURIComponent(order.id), {replace:true});
      });
      if (whatsappUrl) window.location.assign(whatsappUrl);
    } catch(e) {
      if (saved) return;
      setOrderError(e.message);
      try { setQuote(await api('/orders/quote', {method:'POST',body:JSON.parse(quoteInput)})); }
      catch(q) { setQuote(null); setQuoteError(q.message); }
    } finally { setIsSubmitting(false); }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Top Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-text-secondary font-medium mb-6">
        <Link to="/" className="hover:text-primary transition-colors">
          {t('nav.home')}
        </Link>
        <span className="text-text-muted">/</span>
        <Link to="/cart" className="hover:text-primary transition-colors">
          {t('cart.title')}
        </Link>
        <span className="text-text-muted">/</span>
        <span className="text-primary font-bold">{t('checkout.title')}</span>
      </nav>

      {/* Header Banner */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <div>
          <div className="flex items-center flex-wrap gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
              {t('checkout.title')}
            </h1>
            <span className="text-xs font-black bg-primary-light text-primary px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
              {isDirect ? t('checkout.directOrderBadge') : t('checkout.cartOrderBadge')}
            </span>
          </div>
          <p className="text-xs text-text-secondary">
            {t('checkout.deliveryAddressNote')}
          </p>
        </div>
      </div>

      {/* Main Grid: Form + Order Summary */}
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* LEFT COLUMN: Delivery Details & Payment Method */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Delivery Address */}
          <div className="bg-surface rounded-3xl p-5 sm:p-6 border border-border shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <h2 className="text-sm sm:text-base font-black text-text-primary truncate">
                  {t('checkout.deliveryAddress')}
                </h2>
              </div>
              <span className="text-[11px] font-bold text-success flex items-center gap-1 shrink-0 whitespace-nowrap">
                <Truck className="w-3.5 h-3.5 shrink-0" />
                <span>{t('brand.deliveryTime') || '10-15 Mins Delivery'}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-black text-text-primary mb-1">
                  {t('checkout.fullName')}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3.5 bg-surface-soft border border-border rounded-xl text-xs sm:text-sm font-medium focus:border-primary focus:bg-surface outline-hidden transition-all text-text-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-text-primary mb-1">
                  {t('checkout.phoneNumber')}
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 px-3.5 bg-surface-soft border border-border rounded-xl text-xs sm:text-sm font-medium focus:border-primary focus:bg-surface outline-hidden transition-all text-text-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-black text-text-primary mb-1">
                  {t('checkout.addressLine')}
                </label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-3 bg-surface-soft border border-border rounded-xl text-xs sm:text-sm font-medium focus:border-primary focus:bg-surface outline-hidden transition-all text-text-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-text-primary mb-1">
                  {t('checkout.pincode')}
                </label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full h-10 px-3.5 bg-surface-soft border border-border rounded-xl text-xs sm:text-sm font-medium focus:border-primary focus:bg-surface outline-hidden transition-all text-text-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-text-primary mb-1">
                  {t('checkout.deliverySlot')}
                </label>
                <div className="w-full h-10 px-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('checkout.instantDelivery')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Interactive Payment Method Accordion */}
          <div className="bg-surface rounded-3xl p-5 sm:p-6 border border-border shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h2 className="text-sm sm:text-base font-black text-text-primary">
                  {t('checkout.paymentMethod')}
                </h2>
              </div>
              <span className="text-[11px] text-text-muted font-medium">
                {t('checkout.paymentChoice') || 'Choose your preferred payment method'}
              </span>
            </div>

            {/* Reusable PaymentOptions Accordion Component */}
            <PaymentOptions value={paymentMethod} onChange={setPaymentMethod} onlineEnabled={settings.onlinePaymentsEnabled} testMode={settings.paymentTestMode} paymentMode={settings.checkoutPaymentMode} />
          </div>

        </div>

        {/* RIGHT COLUMN: Order Items & Pricing Breakdown */}
        <div className="lg:col-span-5">
          <div className="bg-surface rounded-3xl p-5 sm:p-6 border border-border shadow-subtle space-y-4 sticky top-28">
            <h2 className="text-base font-black text-text-primary pb-3 border-b border-border flex items-center justify-between">
              <span>{t('checkout.orderSummary')}</span>
              <span className="text-xs text-text-muted font-bold">
                {checkoutItems.length} {t('checkout.itemsCount')}
              </span>
            </h2>

            {/* Selected Products List */}
            <div className="space-y-3 max-h-64 overflow-y-auto no-scrollbar pr-1">
              {checkoutItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl bg-surface-soft/60"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-contain bg-surface p-1 shrink-0 border border-border/60"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-text-primary truncate">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-text-muted">
                        {item.weight} • Qty: {item.quantity}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-black text-text-primary shrink-0">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Bill Details */}
            <div className="space-y-2.5 text-xs text-text-secondary pt-3 border-t border-border">
              <div className="flex justify-between">
                <span>{t('cart.itemTotal')}</span>
                <span className="font-bold text-text-primary">₹{itemsTotal}</span>
              </div>

              <div className="flex justify-between">
                <span>{t('cart.deliveryFee')}</span>
                <span className={`font-bold ${isVip ? 'text-success' : 'text-text-primary'}`}>
                  {isVip ? t('cart.vipFreeDelivery') : `₹${currentDeliveryFee}`}
                </span>
              </div>

              <div className="flex justify-between text-success font-medium">
                <span>{t('cart.handlingFee')}</span>
                <span>{t('cart.free')}</span>
              </div>

              <div className="border-t border-dashed border-border pt-3 flex justify-between items-baseline font-black text-sm sm:text-base text-text-primary">
                <span>{t('cart.grandTotal')}</span>
                <span className="text-xl text-primary font-black">₹{finalTotal}</span>
              </div>
            </div>

            <div className="my-4"><label htmlFor="coupon-code" className="text-xs font-bold">Coupon code (optional)</label><input id="coupon-code" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} className="w-full border border-border rounded-xl p-3 mt-2" />{quote?.discount > 0 && <p className="text-primary">Discount: ₹{quote.discount}</p>}</div>
            {(quoteError || orderError) && <p role="alert" className="my-4 text-red-700">{orderError || quoteError}</p>}
            {!quote && !quoteError && <p role="status">Checking prices and availability…</p>}
            {/* Order confirmation */}
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/80 flex items-start gap-2.5 text-[11px] text-emerald-900">
              <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Confirm your order on WhatsApp</span>
                <p className="text-emerald-700 mt-0.5">
                  For online payments, complete secure checkout first. WhatsApp will then open automatically with your order details. Tap Send there, then return here to view your confirmation.
                </p>
              </div>
            </div>

            <p className="text-xs text-text-secondary">Placing your order shares its details with WhatsApp. Read our <Link to="/privacy-policy" className="text-primary underline">{t('footer.privacyPolicy')}</Link> and <Link to="/terms-of-service" className="text-primary underline">{t('footer.termsOfService')}</Link>.</p>
            {/* Submit CTA Button */}
            <button
              type="submit"
              disabled={isSubmitting || !quote || (paymentMethod!=='cod' && !settings.onlinePaymentsEnabled)}
              className="w-full bg-[#25D366] hover:bg-[#1ebc5c] active:scale-[0.99] text-white font-black py-4 px-5 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-75 text-sm"
            >
              {isSubmitting ? (
                <span>{t('checkout.placingOrder')}</span>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4" />
                  <span>{paymentMethod === 'cod' ? (t('checkout.placeOrderCod') || 'Place order & continue to WhatsApp') : (t('checkout.paySecurely') || 'Pay securely & continue to WhatsApp')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
