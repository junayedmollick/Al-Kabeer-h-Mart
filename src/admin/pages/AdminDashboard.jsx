import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  PlusCircle,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useOrders } from '../../context/OrderContext';
import { useCatalog } from '../../context/CatalogContext';
import { useAdminData } from '../../context/AdminDataContext';
import { StatCard } from '../components/StatCard';
import { ChartCard } from '../components/ChartCard';
import { StatusBadge } from '../components/StatusBadge';
import { AdminModal } from '../components/AdminModal';

export function AdminDashboard() {
  const { t } = useLanguage();
  const { orders } = useOrders();
  const { products, categories } = useCatalog();
  const { customers } = useAdminData();
  const [selectedOrder, setSelectedOrder] = useState(null);

  const delivered = orders.filter(o => o.status === 'Delivered');
  const totalRevenue = delivered.reduce((sum,o) => sum + o.total, 0);
  const topProducts = products.map(p => ({...p, sales:delivered.reduce((sum,o) => sum + o.items.filter(i => String(i.id) === String(p.id)).reduce((n,i) => n + i.quantity,0),0), status:p.stock === 0 ? 'Out of Stock' : p.stock < 10 ? 'Low Stock' : 'In Stock'})).filter(p => p.sales > 0).sort((a,b) => b.sales-a.sales).slice(0,5);
  const lowStockItems = products.filter(p => p.stock < 10).map(p => ({...p, remaining:p.stock, reorderPoint:10})).slice(0,5);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* 1. Dashboard Greeting & Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-primary/15 via-surface to-surface border border-primary/20 shadow-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-primary/20 text-primary border border-primary/30 uppercase tracking-wide">
              Bhagabatipur Hub Live
            </span>
            <span className="text-xs text-text-muted">
              {new Date().toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
            Store overview
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary">
            {t('admin.dashboard.subtitle')}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-xs transition-all hover:scale-105 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('admin.products.addProduct')}</span>
          </Link>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-soft border border-border text-text-primary font-bold text-xs transition-all hover:border-primary/40 shadow-2xs"
          >
            <ShoppingBag className="w-4 h-4 text-primary" />
            <span>{t('admin.dashboard.viewAllOrders')}</span>
          </Link>
        </div>
      </div>

      {/* 2. Key Statistics KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title={t('admin.dashboard.totalRevenue')}
          value={'₹' + totalRevenue.toLocaleString('en-IN')}
          isPositive={true}
          subtitle="From recorded store activity"
          icon={DollarSign}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-500"
        />
        <StatCard
          title={t('admin.dashboard.totalOrders')}
          value={String(orders.length)}
          isPositive={true}
          subtitle="From recorded store activity"
          icon={ShoppingBag}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-500"
        />
        <StatCard
          title={t('admin.dashboard.totalCustomers')}
          value={String(customers.length)}
          isPositive={true}
          subtitle="From recorded store activity"
          icon={Users}
          iconBg="bg-purple-500/10"
          iconColor="text-purple-500"
        />
        <StatCard
          title={t('admin.dashboard.totalProducts')}
          value={String(products.length)}
          badgeText={categories.length + ' Categories'}
          subtitle={t('admin.dashboard.catalogCount')}
          icon={Package}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-500"
        />
      </div>

      {/* 3. Analytics Chart & Low Stock Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main 2-column: Revenue Analytics Interactive Chart */}
        <div className="lg:col-span-2">
          <ChartCard
            title={t('admin.dashboard.revenueAnalytics')}
            subtitle="Real-time order volumes and sales trends across Bhagabatipur delivery zone."
          />
        </div>

        {/* 1-column: Low Stock Alert Card */}
        <div className="rounded-2xl bg-surface border border-border p-5 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-text-primary">
                  {t('admin.dashboard.lowStockAlert')}
                </h3>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                {lowStockItems.length} items
              </span>
            </div>
            <p className="text-xs text-text-secondary mb-4">
              {t('admin.dashboard.lowStockSubtitle')}
            </p>

            {/* Low stock items list */}
            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-surface-soft border border-border flex items-center justify-between gap-3 hover:border-amber-500/40 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-text-primary truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      {item.category} • ₹{item.price}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                      {item.remaining} left
                    </span>
                    <p className="text-[10px] text-text-muted">
                      Min: {item.reorderPoint}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-border/80">
            <Link
              to="/admin/products"
              className="w-full py-2 px-3 rounded-xl bg-surface-soft hover:bg-surface border border-border text-text-primary hover:text-primary text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Manage Inventory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Recent Orders & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Orders Table (2 Columns) */}
        <div className="lg:col-span-2 rounded-2xl bg-surface border border-border shadow-subtle overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-black text-text-primary tracking-tight">
                {t('admin.dashboard.recentOrders')}
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Latest customer grocery dispatches
              </p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 shrink-0"
            >
              <span>{t('admin.dashboard.viewAllOrders')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[580px]">
              <thead>
                <tr className="border-b border-border bg-surface-soft/60 text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {orders.slice(0, 5).map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-surface-soft/60 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-mono font-bold text-xs text-primary">
                      {order.id}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-text-primary text-xs">
                      {order.rider ? (
                        <div>
                          <p>{order.customerName || 'Customer'}</p>
                          <p className="text-[10px] text-text-muted">{order.date}</p>
                        </div>
                      ) : (
                        order.customerName || 'Customer'
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-text-secondary">
                      {order.items ? `${order.items.length} items` : '1 item'}
                    </td>
                    <td className="px-4 py-3.5 font-black text-xs text-text-primary">
                      ₹{order.total}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={order.status} size="sm" />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 rounded-lg bg-surface-soft hover:bg-primary/10 text-text-secondary hover:text-primary transition-colors cursor-pointer"
                        title="View order receipt"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Products List (1 Column) */}
        <div className="rounded-2xl bg-surface border border-border shadow-subtle p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-base font-black text-text-primary tracking-tight">
                {t('admin.dashboard.topProducts')}
              </h3>
              <Link
                to="/admin/products"
                className="text-xs font-bold text-primary hover:underline"
              >
                Catalog
              </Link>
            </div>
            <p className="text-xs text-text-secondary mb-4">
              Products from delivered orders
            </p>

            <div className="space-y-3.5">
              {topProducts.map((p, index) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-soft transition-colors"
                >
                  <span className="text-xs font-black text-text-muted w-4 text-center shrink-0">
                    #{index + 1}
                  </span>
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-10 h-10 object-cover rounded-xl border border-border shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-text-primary truncate">
                      {p.name}
                    </p>
                    <p className="text-[10px] text-text-muted">
                      {p.category} • ₹{p.price}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-text-primary">
                      {p.sales}
                    </span>
                    <p className="text-[10px] text-text-muted">sold</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Order Quick View Modal */}
      {selectedOrder && (
        <AdminModal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order Receipt ${selectedOrder.id}`}
          subtitle={`Placed: ${selectedOrder.date}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-surface-soft border border-border flex items-center justify-between">
              <div>
                <p className="font-bold text-text-primary">Status</p>
                <div className="mt-1">
                  <StatusBadge status={selectedOrder.status} />
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-text-primary">Total Amount</p>
                <p className="text-base font-black text-primary mt-0.5">
                  ₹{selectedOrder.total}
                </p>
              </div>
            </div>

            <div>
              <p className="font-bold text-text-secondary uppercase tracking-wider text-[10px] mb-1">
                Delivery Address
              </p>
              <p className="text-text-primary font-medium p-2.5 rounded-xl bg-surface-soft">
                {selectedOrder.deliveryAddress || 'Bhagabatipur Hub Delivery Address'}
              </p>
            </div>

            {selectedOrder.rider && (
              <div>
                <p className="font-bold text-text-secondary uppercase tracking-wider text-[10px] mb-1">
                  Assigned Rider
                </p>
                <p className="text-text-primary font-medium p-2.5 rounded-xl bg-surface-soft">
                  {selectedOrder.rider} ({selectedOrder.riderPhone || '+91 9002461519'})
                </p>
              </div>
            )}

            <div>
              <p className="font-bold text-text-secondary uppercase tracking-wider text-[10px] mb-1">
                Ordered Items ({selectedOrder.items?.length || 0})
              </p>
              <div className="divide-y divide-border/60 border border-border rounded-xl overflow-hidden">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between gap-3 bg-surface">
                    <div className="flex items-center gap-2 min-w-0">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-8 h-8 rounded-lg object-cover border border-border shrink-0"
                        />
                      )}
                      <div className="truncate">
                        <p className="font-bold text-text-primary truncate">{item.name}</p>
                        <p className="text-[10px] text-text-muted">{item.weight}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-text-primary">₹{item.price} × {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
