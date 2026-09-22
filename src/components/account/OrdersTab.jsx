import { OrderActions } from '../OrderActions';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  RotateCcw,
  MessageCircle,
  XCircle,
  PackageCheck,
  ArrowRight
} from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { CancelOrderModal } from '../modals/CancelOrderModal';

export function OrdersTab() {
  const [activeSubTab, setActiveSubTab] = useState('active'); // 'active' or 'history'
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelFeedback, setCancelFeedback] = useState('');
  const { orders, cancelOrder } = useOrders();
  const { t } = useLanguage();
  const { addToCart } = useCart();

  const filteredOrders = orders.filter((order) => {
    if (activeSubTab === 'active') {
      return order.status !== 'Cancelled' && order.status !== 'Delivered';
    } else {
      return order.status === 'Delivered' || order.status === 'Cancelled' || order.statusType === 'history';
    }
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Order Received':
        return (
          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black px-3 py-1 rounded-full whitespace-nowrap shrink-0">
            <PackageCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Order Received</span>
          </span>
        );
      case 'Out for Delivery':
        return (
          <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-black px-3 py-1 rounded-full whitespace-nowrap shrink-0">
            <Truck className="w-3.5 h-3.5 text-indigo-600 animate-pulse shrink-0" />
            <span>Out for Delivery</span>
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black px-3 py-1 rounded-full whitespace-nowrap shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Delivered</span>
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-black px-3 py-1 rounded-full whitespace-nowrap shrink-0">
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Processing</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 bg-rose-50 text-danger border border-rose-200 text-xs font-black px-3 py-1 rounded-full whitespace-nowrap shrink-0">
            <XCircle className="w-3.5 h-3.5 text-danger shrink-0" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-black px-3 py-1 rounded-full whitespace-nowrap shrink-0">
            {status}
          </span>
        );
    }
  };

  const isCancellable = status => status === 'Processing';
  const handleConfirmCancel = async orderId => {
    try { await cancelOrder(orderId); setOrderToCancel(null); setActiveSubTab('history'); setCancelFeedback('Order cancelled and stock restored.'); }
    catch(e) { setCancelFeedback(e.message); }
  };

  const handleReorder = (items) => {
    items.forEach((item) => {
      addToCart(item);
    });
    alert('Items added back to your cart!');
  };

  const activeOrdersCount = orders.filter(
    (order) => order.status !== 'Cancelled' && order.status !== 'Delivered'
  ).length;

  const historyOrdersCount = orders.filter(
    (order) => order.status === 'Delivered' || order.status === 'Cancelled' || order.statusType === 'history'
  ).length;

  return (
    <div className="bg-surface rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 border border-border shadow-subtle space-y-4 sm:space-y-6">
      
      {/* Cancellation Feedback Notification */}
      {cancelFeedback && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-danger text-xs sm:text-sm font-bold animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>{cancelFeedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setCancelFeedback('')}
            className="text-text-muted hover:text-danger p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Sub-Tab Switcher Header */}
      <div className="p-3 sm:p-4 rounded-2xl border border-border/80 bg-surface shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-text-primary truncate">
              {t('orders.title')}
            </h3>
          </div>
          <p className="text-[11px] text-text-secondary mt-0.5 hidden sm:block">
            Track active shipments, view order history, and reorder items
          </p>
        </div>

        {/* Sub-Tabs: Active Orders vs Order History with badge counts */}
        <div className="flex items-center bg-surface-soft p-1 rounded-xl border border-border/80 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('active')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none ${
              activeSubTab === 'active'
                ? 'bg-surface text-primary shadow-xs font-black'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>{t('orders.activeOrders')}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
              activeSubTab === 'active' ? 'bg-primary text-white' : 'bg-surface text-text-muted border border-border/60'
            }`}>
              {activeOrdersCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('history')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none ${
              activeSubTab === 'history'
                ? 'bg-surface text-primary shadow-xs font-black'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>{t('orders.orderHistory')}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
              activeSubTab === 'history' ? 'bg-primary text-white' : 'bg-surface text-text-muted border border-border/60'
            }`}>
              {historyOrdersCount}
            </span>
          </button>
        </div>
      </div>

      {/* Orders List / Empty State */}
      {filteredOrders.length === 0 ? (
        <div className="py-14 bg-surface-soft/40 rounded-3xl border border-border/80 text-center p-6 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-full bg-surface text-text-muted flex items-center justify-center mx-auto mb-3 shadow-2xs border border-border/60">
            <ShoppingBag className="w-7 h-7 stroke-1 text-primary" />
          </div>
          <h4 className="text-sm sm:text-base font-black text-text-primary mb-1">
            {activeSubTab === 'active' ? t('orders.noActiveOrders') : t('orders.noOrderHistory')}
          </h4>
          <p className="text-xs text-text-secondary mb-4 max-w-xs mx-auto">
            Order fresh dairy, groceries, bakery, and snacks delivered in 10–15 mins.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white font-black text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <span>Explore Store</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className={`bg-surface rounded-2xl p-3.5 sm:p-5 border shadow-2xs transition-all space-y-3 ${
                order.status === 'Cancelled'
                  ? 'border-border/60 opacity-90'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              {/* Order Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-border/60">
                <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 ${
                      order.status === 'Cancelled'
                        ? 'bg-rose-50 text-danger'
                        : 'bg-primary-light text-primary'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 shrink-0" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-sm text-text-primary font-mono whitespace-nowrap">
                        {order.id}
                      </span>
                      <span className="text-[11px] text-text-muted whitespace-nowrap">• {order.date}</span>
                      {order.paymentMethod && (
                        <span className="text-[10px] font-bold bg-surface-soft text-text-secondary px-2 py-0.5 rounded-md border border-border/80 shrink-0 whitespace-nowrap">
                          {order.paymentMethod}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-1">
                      <span className="font-semibold text-text-muted">Deliver to:</span> {order.deliveryAddress}
                    </p>
                  </div>
                </div>

                <div className="self-start sm:self-center shrink-0">
                  {getStatusBadge(order.status)}
                </div>
              </div>

              <OrderActions order={order} />
              {/* Order Item List - Clean Full Width Strip */}
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 bg-surface-soft/60 hover:bg-surface-soft p-2.5 rounded-xl border border-border/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-11 h-11 rounded-lg object-contain bg-surface p-1 shrink-0 border border-border/40 shadow-2xs"
                      />
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-text-primary truncate">
                          {item.name}
                        </h5>
                        <div className="text-[11px] text-text-muted mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span>{item.weight}</span>
                          <span>•</span>
                          <span>Qty: <strong className="text-text-primary font-bold">{item.quantity}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-text-primary">
                        ₹{item.price * item.quantity}
                      </div>
                      {item.quantity > 1 && (
                        <div className="text-[10px] text-text-muted">
                          ₹{item.price}/ea
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Card Footer */}
              <div className="pt-3 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center justify-between sm:justify-start gap-3 flex-wrap">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                      Total Bill
                    </span>
                    <span className="text-base font-black text-text-primary">
                      ₹{order.total}
                    </span>
                  </div>
                  {order.rider && (
                    <div className="text-[11px] text-text-secondary bg-surface-soft px-2.5 py-1 rounded-lg border border-border/60">
                      🚴 Rider: <span className="font-bold text-text-primary">{order.rider}</span>
                    </div>
                  )}
                  {order.status === 'Out for Delivery' && (
                    <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                      Dispatched • In Transit
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                  {/* Cancel Order */}
                  {isCancellable(order.status) && (
                    <button
                      type="button"
                      onClick={() => setOrderToCancel(order)}
                      className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1 px-3 py-2 sm:py-1.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-danger font-bold text-xs transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Cancel Order</span>
                    </button>
                  )}

                  {/* WhatsApp Support */}
                  <a
                    href={`https://wa.me/919002461519?text=Inquiry%20regarding%20order%20${order.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 bg-surface-soft hover:bg-surface border border-border hover:border-primary/40 text-text-secondary hover:text-primary font-bold rounded-xl transition-colors text-xs cursor-pointer whitespace-nowrap"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Support</span>
                  </a>

                  {/* Reorder Button */}
                  <button
                    type="button"
                    onClick={() => handleReorder(order.items)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:py-1.5 bg-primary hover:bg-primary-dark text-white font-black rounded-xl shadow-xs transition-all text-xs cursor-pointer whitespace-nowrap"
                  >
                    <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                    <span>{t('orders.orderAgain')}</span>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      <CancelOrderModal
        isOpen={!!orderToCancel}
        onClose={() => setOrderToCancel(null)}
        onConfirm={handleConfirmCancel}
        order={orderToCancel}
      />
    </div>
  );
}
