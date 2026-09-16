import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  MapPin,
  User,
  Phone,
  Calendar,
  Check
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useOrders } from '../../context/OrderContext';
import { StatusBadge } from '../components/StatusBadge';
import { AdminModal } from '../components/AdminModal';
import { AdminTable } from '../components/AdminTable';

export function AdminOrders() {
  const { t } = useLanguage();
  const { orders, updateOrderStatus } = useOrders();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewingOrder, setViewingOrder] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const statusOptions = [
    'Processing',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
  ];

  const handleStatusChange = async (orderId, newStatus) => {
    try { await updateOrderStatus(orderId, newStatus); } catch(e) { showToast(e.message); return; }
    showToast(`Order #${orderId} status changed to ${newStatus}`);
    if (viewingOrder && viewingOrder.id === orderId) {
      setViewingOrder((prev) => ({ ...prev, status: newStatus }));
    }
  };

  // Filter tabs
  const filterTabs = [
    { id: 'all', label: t('admin.orders.filterAll'), count: orders.length },
    {
      id: 'active',
      label: t('admin.orders.filterActive'),
      count: orders.filter((o) => o.status === 'Out for Delivery' || o.status === 'Processing').length,
    },
    {
      id: 'Delivered',
      label: t('admin.orders.filterDelivered'),
      count: orders.filter((o) => o.status === 'Delivered').length,
    },
    {
      id: 'Cancelled',
      label: t('admin.orders.filterCancelled'),
      count: orders.filter((o) => o.status === 'Cancelled').length,
    },
  ];

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        String(order.id).toLowerCase().includes(q) ||
        (order.deliveryAddress && order.deliveryAddress.toLowerCase().includes(q)) ||
        (order.rider && order.rider.toLowerCase().includes(q)) || order.customerName?.toLowerCase().includes(q) || order.customerPhone?.includes(q);

      let matchesFilter = true;
      if (selectedFilter === 'active') {
        matchesFilter = order.status === 'Out for Delivery' || order.status === 'Processing';
      } else if (selectedFilter !== 'all') {
        matchesFilter = order.status === selectedFilter;
      }

      return matchesSearch && matchesFilter;
    });
  }, [orders, searchQuery, selectedFilter]);

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
            {t('admin.orders.title')}
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            {t('admin.orders.subtitle')}
          </p>
        </div>

        {/* Live hub indicator */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-border shadow-2xs self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-bold text-text-primary">
            Bhagabatipur Hub: Active Dispatch
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-4 rounded-2xl bg-surface border border-border shadow-subtle space-y-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedFilter(tab.id)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                selectedFilter === tab.id
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-soft hover:bg-surface border border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                  selectedFilter === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-surface text-text-secondary'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('admin.orders.searchPlaceholder')}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-primary"
          />
        </div>
      </div>

      {/* Mobile Card View (screens < 768px) */}
      <div className="md:hidden space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center bg-surface rounded-2xl border border-border">
            <ShoppingBag className="w-8 h-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm font-bold text-text-primary">No orders found</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const itemCount = order.items ? order.items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 1;

            return (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-surface border border-border shadow-subtle flex flex-col gap-3"
              >
                {/* Header: Order ID & Date & Status */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-xs text-primary px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20">
                      {order.id}
                    </span>
                    <span className="text-[11px] text-text-muted font-bold">{order.date}</span>
                  </div>
                  <StatusBadge status={order.status} size="sm" />
                </div>

                {/* Customer Address & Rider */}
                <div>
                  <p className="font-bold text-xs text-text-primary">
                    {order.customerName || 'Customer'}
                  </p>
                  {order.rider && (
                    <p className="text-[11px] text-text-muted flex items-center gap-1 mt-0.5">
                      <Truck className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{order.rider.split('(')[0]}</span>
                    </p>
                  )}
                </div>

                {/* Total & Actions */}
                <div className="flex items-center justify-between pt-2.5 border-t border-border/60">
                  <div>
                    <span className="text-sm font-black text-text-primary">₹{order.total}</span>
                    <span className="text-[11px] text-text-muted ml-1.5">({itemCount} items)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="text-[11px] font-bold py-1.5 px-2 rounded-lg bg-surface-soft border border-border text-text-secondary focus:outline-hidden cursor-pointer"
                      title="Change status"
                    >
                      {statusOptions.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => setViewingOrder(order)}
                      className="p-1.5 rounded-lg bg-surface-soft hover:bg-primary/10 text-text-secondary hover:text-primary transition-colors cursor-pointer"
                      title="View receipt"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table View (screens >= 768px) */}
      <div className="hidden md:block">
        <AdminTable
          columns={[
            { title: t('admin.orders.orderId') },
            { title: t('admin.orders.customer') },
            { title: t('admin.orders.date') },
            { title: t('admin.orders.items') },
            { title: t('admin.orders.amount') },
            { title: t('admin.orders.status') },
            { title: t('admin.orders.actions'), align: 'right' },
          ]}
          isEmpty={filteredOrders.length === 0}
          totalCount={orders.length}
          currentCount={filteredOrders.length}
        >
          {filteredOrders.map((order) => {
            const itemCount = order.items ? order.items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 1;

            return (
              <tr
                key={order.id}
                className="hover:bg-surface-soft/60 transition-colors group"
              >
                {/* Order ID */}
                <td className="px-4 py-3 font-mono font-bold text-xs text-primary">
                  {order.id}
                </td>

                {/* Customer & Address */}
                <td className="px-4 py-3">
                  <p className="font-bold text-xs text-text-primary truncate max-w-xs">
                    {order.customerName || 'Customer'}
                  </p>
                  {order.rider && (
                    <p className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5">
                      <Truck className="w-3 h-3 text-primary shrink-0" />
                      {order.rider.split('(')[0]}
                    </p>
                  )}
                </td>

                {/* Date */}
                <td className="px-4 py-3 text-xs text-text-secondary whitespace-nowrap">
                  {order.date}
                </td>

                {/* Items Count */}
                <td className="px-4 py-3 text-xs text-text-secondary">
                  <span className="font-bold text-text-primary">{itemCount}</span> items
                </td>

                {/* Amount */}
                <td className="px-4 py-3">
                  <span className="font-black text-xs text-text-primary">
                    ₹{order.total}
                  </span>
                  <span className="text-[10px] text-emerald-600 block">
                    {order.deliveryFee === 0 ? 'Free Delivery' : `Includes ₹${order.deliveryFee} delivery`}
                  </span>
                </td>

                {/* Live Status Selector */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={order.status} size="sm" />
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="text-[10px] font-bold py-1 px-1.5 rounded-lg bg-surface-soft border border-border text-text-secondary focus:outline-hidden cursor-pointer"
                      title="Change status"
                    >
                      {statusOptions.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setViewingOrder(order)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-soft hover:bg-primary/10 text-text-secondary hover:text-primary text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Receipt</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </AdminTable>
      </div>

      {/* Order Detail Modal / Drawer */}
      {viewingOrder && (
        <AdminModal
          isOpen={!!viewingOrder}
          onClose={() => setViewingOrder(null)}
          title={`Order Receipt #${viewingOrder.id}`}
          subtitle={`Placed on: ${viewingOrder.date}`}
          maxWidth="max-w-2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-text-secondary">Update Status:</span>
                <select
                  value={viewingOrder.status}
                  onChange={(e) => handleStatusChange(viewingOrder.id, e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-surface border border-border text-xs font-bold text-text-primary focus:outline-hidden cursor-pointer"
                >
                  {statusOptions.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                className="px-4 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark cursor-pointer shadow-2xs"
              >
                Done
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {/* Status & Total Header Card */}
            <div className="p-4 rounded-2xl bg-surface-soft border border-border flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  Order Status
                </p>
                <div className="mt-1">
                  <StatusBadge status={viewingOrder.status} />
                </div>
              </div>

              <div className="text-right">
                <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  Grand Total
                </p>
                <p className="text-xl font-black text-primary mt-0.5">
                  ₹{viewingOrder.total}
                </p>
              </div>
            </div>

            {/* Delivery & Rider Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
                <div className="flex items-center gap-1.5 text-text-secondary font-bold text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>Delivery Address</span>
                </div>
                <p className="text-text-primary font-semibold">
                  {viewingOrder.deliveryAddress || 'Bhagabatipur Local Hub'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
                <div className="flex items-center gap-1.5 text-text-secondary font-bold text-[11px]">
                  <Truck className="w-3.5 h-3.5 text-primary" />
                  <span>Assigned Express Rider</span>
                </div>
                <p className="text-text-primary font-semibold">
                  {viewingOrder.rider || 'Express Attendant Dispatch'}
                </p>
                {viewingOrder.riderPhone && (
                  <p className="text-text-muted text-[10px] flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-500" />
                    {viewingOrder.riderPhone}
                  </p>
                )}
              </div>
            </div>

            {/* Order Items Breakdown */}
            <div>
              <p className="font-bold text-text-secondary text-xs mb-2">
                Order Items ({viewingOrder.items?.length || 0})
              </p>
              <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-surface">
                {viewingOrder.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-xl object-cover border border-border shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-text-primary truncate">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-text-muted">
                          {item.weight} • ₹{item.price} each
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-black text-xs text-text-primary">
                        ₹{item.price * (item.quantity || 1)}
                      </p>
                      <p className="text-[10px] text-text-muted">
                        Qty: {item.quantity || 1}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="p-3.5 rounded-xl bg-surface-soft border border-border space-y-1.5">
              <div className="flex items-center justify-between text-text-secondary">
                <span>Items Subtotal:</span>
                <span className="font-bold text-text-primary">
                  ₹{viewingOrder.subtotal}
                </span>
              </div>
              <div className="flex items-center justify-between text-text-secondary">
                <span>Delivery Charge:</span>
                <span className="font-bold text-emerald-600">
                  {viewingOrder.deliveryFee === 0 ? 'FREE (0₹)' : `₹${viewingOrder.deliveryFee}`}
                </span>
              </div>
              <div className="pt-2 border-t border-border flex items-center justify-between font-black text-text-primary text-sm">
                <span>Grand Total:</span>
                <span className="text-primary font-black">₹{viewingOrder.total}</span>
              </div>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
