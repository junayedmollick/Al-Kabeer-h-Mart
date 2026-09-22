import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { CheckCircle2, ShoppingBag } from 'lucide-react';
import { api } from '../lib/api';
import { useLanguage } from '../context/LanguageContext';
import { OrderActions } from '../components/OrderActions';

export function OrderConfirmation() {
  const location = useLocation();
  const { orderId } = useParams();
  const { t } = useLanguage();
  const [order, setOrder] = useState(null), [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setOrder(null);
    setError('');
    const load = async () => {
      try {
        const saved = await api('/orders/' + encodeURIComponent(orderId));
        if (active) {
          setOrder(saved);
          setError('');
        }
      } catch (e) {
        try {
          const stored = JSON.parse(localStorage.getItem('alkabeer_orders') || '[]');
          const localOrder = stored.find(o => String(o.id) === String(orderId));
          if (localOrder && active) {
            setOrder(localOrder);
            setError('');
            return;
          }
        } catch {}
        if (active) setError(e.message);
      }
    };
    load();
    const timer = setInterval(load, 10000);
    window.addEventListener('pageshow', load);
    window.addEventListener('focus', load);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener('pageshow', load);
      window.removeEventListener('focus', load);
    };
  }, [orderId]);

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p role={error ? 'alert' : 'status'}>{error || t('orderConfirmation.loading')}</p>
        <Link to="/account?tab=orders" className="inline-block mt-5 text-primary font-bold">
          {t('orderConfirmation.viewMyOrders')}
        </Link>
      </div>
    );
  }

  const headingText =
    order.status === 'Cancelled'
      ? t('orderConfirmation.cancelled')
      : order.paymentStatus === 'Pending'
      ? t('orderConfirmation.completePayment')
      : t('orderConfirmation.successTitle');

  const descText =
    order.paymentStatus === 'Pending'
      ? t('orderConfirmation.paymentPendingDesc')
      : t('orderConfirmation.successDesc');

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
      <section className="bg-surface rounded-3xl p-6 sm:p-10 border border-border shadow-xl text-center">
        <div className="w-20 h-20 bg-primary-light text-primary rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-text-primary">{headingText}</h1>
        <p className="text-sm text-text-secondary mt-3 leading-relaxed">{descText}</p>
        <dl className="my-6 p-5 bg-surface-soft rounded-2xl text-left space-y-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt>{t('orderConfirmation.orderNumber')}</dt>
            <dd className="font-bold text-primary break-all">{order.id}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>{t('orderConfirmation.status')}</dt>
            <dd className="font-semibold">{order.status}</dd>
          </div>
          <div className="border-t border-border pt-4">
            <dt className="font-semibold mb-1">{t('orderConfirmation.deliveryAddress')}</dt>
            <dd>
              {order.customerName}
              <br />
              {order.deliveryAddress}, {order.pincode}
              <br />
              {order.customerPhone}
            </dd>
          </div>
        </dl>
        <ul className="space-y-3 text-left text-sm" aria-label={t('orderConfirmation.orderedItems')}>
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4">
              <span>
                {item.name} <span className="text-text-secondary">× {item.quantity}</span>
              </span>
              <strong className="whitespace-nowrap">₹{(item.price * item.quantity).toFixed(2)}</strong>
            </li>
          ))}
        </ul>
        <div className="flex justify-between items-center border-t border-border pt-4 mt-5 font-black">
          <span>{t('orderConfirmation.totalWithDelivery')}</span>
          <span className="text-xl text-primary">₹{order.total.toFixed(2)}</span>
        </div>
        {location.state?.paymentError && order.paymentStatus === 'Pending' && (
          <p role="alert" className="text-red-700 mt-4">
            {location.state.paymentError}
          </p>
        )}
        <OrderActions order={order} onUpdate={setOrder} showWhatsApp={false} />
        {error && (
          <p role="alert" className="text-red-700 text-sm mb-4">
            {error}
          </p>
        )}
        <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
          <Link
            to="/account?tab=orders"
            className="rounded-xl bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 transition-colors cursor-pointer"
          >
            {t('orderConfirmation.viewMyOrders')}
          </Link>
          <Link
            to="/"
            className="rounded-xl border border-border px-6 py-3 font-bold inline-flex justify-center items-center gap-2 hover:bg-surface-soft transition-colors cursor-pointer"
          >
            <ShoppingBag size={17} />
            <span>{t('orderConfirmation.continueShopping')}</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
