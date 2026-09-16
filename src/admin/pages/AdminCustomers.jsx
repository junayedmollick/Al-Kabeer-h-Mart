import React, { useState } from 'react';
import {
  Users,
  Search,
  Crown,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShoppingBag,
  CreditCard
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAdminData } from '../../context/AdminDataContext';
import { StatusBadge } from '../components/StatusBadge';
import { AdminModal } from '../components/AdminModal';
import { AdminTable } from '../components/AdminTable';

export function AdminCustomers() {
  const { t } = useLanguage();
  const { customers } = useAdminData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewingCustomer, setViewingCustomer] = useState(null);

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.address.toLowerCase().includes(q);

    const matchesFilter =
      selectedFilter === 'all' || c.status === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-text-primary tracking-tight">
            {t('admin.customers.title')}
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            {t('admin.customers.subtitle')} ({customers.length} registered accounts)
          </p>
        </div>

        {/* Quick VIP Membership Stats pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 self-start sm:self-auto">
          <Crown className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-xs font-bold">
            {customers.filter((c) => c.status === 'VIP').length} 999 VIP Members Active
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-surface border border-border shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('admin.customers.searchPlaceholder')}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-soft border border-border text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-surface-soft border border-border text-xs font-bold text-text-primary focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Memberships</option>
            <option value="VIP">999 VIP Pass Only</option>
            <option value="Active">Active Regulars</option>
          </select>
        </div>
      </div>

      {/* Mobile Card View (screens < 768px) */}
      <div className="md:hidden space-y-3">
        {filteredCustomers.length === 0 ? (
          <div className="p-8 text-center bg-surface rounded-2xl border border-border">
            <Users className="w-8 h-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm font-bold text-text-primary">No customers found</p>
          </div>
        ) : (
          filteredCustomers.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-2xl bg-surface border border-border shadow-subtle flex flex-col gap-3"
            >
              {/* Header: Avatar, Name, Status & Action */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl ${c.avatarBg || 'bg-primary'} text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs`}
                  >
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black text-sm text-text-primary truncate">
                      {c.name}
                    </h4>
                    <span className="text-[10px] text-text-muted font-mono block">
                      {c.id}
                    </span>
                    <div className="mt-1">
                      <StatusBadge status={c.status} size="sm" />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setViewingCustomer(c)}
                  className="p-2 rounded-xl bg-surface-soft hover:bg-primary/10 text-text-secondary hover:text-primary transition-colors cursor-pointer shrink-0"
                  title="View profile"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              {/* Contact Info */}
              <div className="text-xs space-y-1 text-text-secondary pt-2 border-t border-border/60">
                <p className="flex items-center gap-1.5 truncate">
                  <Phone className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  <span className="font-semibold text-text-primary">{c.phone}</span>
                </p>
                <p className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  <span>{c.email}</span>
                </p>
                {c.address && (
                  <p className="flex items-center gap-1.5 truncate text-[11px] text-text-muted">
                    <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" />
                    <span>{c.address}</span>
                  </p>
                )}
              </div>

              {/* Stats Footer */}
              <div className="flex items-center justify-between pt-2.5 border-t border-border/60">
                <div>
                  <span className="text-xs font-bold text-text-primary">{c.totalOrders}</span>
                  <span className="text-[11px] text-text-muted ml-1">orders</span>
                </div>
                <div>
                  <span className="text-xs font-black text-primary">₹{c.totalSpent.toLocaleString('en-IN')}</span>
                  <span className="text-[11px] text-text-muted ml-1">spent</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View (screens >= 768px) */}
      <div className="hidden md:block">
        <AdminTable
          columns={[
            { title: t('admin.customers.name') },
            { title: t('admin.customers.contact') },
            { title: t('admin.customers.address') },
            { title: t('admin.customers.orders') },
            { title: t('admin.customers.spent') },
            { title: t('admin.customers.status') },
            { title: t('admin.customers.actions'), align: 'right' },
          ]}
          isEmpty={filteredCustomers.length === 0}
          totalCount={customers.length}
          currentCount={filteredCustomers.length}
        >
          {filteredCustomers.map((c) => (
            <tr
              key={c.id}
              className="hover:bg-surface-soft/60 transition-colors group"
            >
              {/* Customer Avatar & Name */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full ${c.avatarBg || 'bg-primary'} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}
                  >
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-xs text-text-primary">
                      {c.name}
                    </p>
                    <span className="text-[10px] text-text-muted font-mono">
                      {c.id}
                    </span>
                  </div>
                </div>
              </td>

              {/* Contact Details */}
              <td className="px-4 py-3">
                <p className="text-xs text-text-primary font-medium">{c.phone}</p>
                <p className="text-[10px] text-text-muted truncate max-w-[160px]">
                  {c.email}
                </p>
              </td>

              {/* Address */}
              <td className="px-4 py-3 text-xs text-text-secondary max-w-xs truncate">
                {c.address}
              </td>

              {/* Orders Count */}
              <td className="px-4 py-3">
                <span className="text-xs font-bold text-text-primary">
                  {c.totalOrders}
                </span>
                <span className="text-[10px] text-text-muted block">
                  Last: {c.lastOrderDate}
                </span>
              </td>

              {/* Spent */}
              <td className="px-4 py-3">
                <span className="text-xs font-black text-primary">
                  ₹{c.totalSpent.toLocaleString('en-IN')}
                </span>
              </td>

              {/* Membership Status */}
              <td className="px-4 py-3">
                <StatusBadge status={c.status} size="sm" />
              </td>

              {/* Actions */}
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => setViewingCustomer(c)}
                  className="p-1.5 rounded-lg bg-surface-soft hover:bg-primary/10 text-text-secondary hover:text-primary transition-colors cursor-pointer"
                  title="View customer profile"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </AdminTable>
      </div>

      {/* Customer Detail Profile Modal */}
      {viewingCustomer && (
        <AdminModal
          isOpen={!!viewingCustomer}
          onClose={() => setViewingCustomer(null)}
          title={t('admin.customers.customerProfile')}
          subtitle={`Member since ${viewingCustomer.joinedDate}`}
        >
          <div className="space-y-4 text-xs">
            {/* Header info */}
            <div className="p-4 rounded-2xl bg-surface-soft border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full ${viewingCustomer.avatarBg || 'bg-primary'} text-white flex items-center justify-center font-black text-base`}
                >
                  {viewingCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-black text-sm text-text-primary">
                    {viewingCustomer.name}
                  </h4>
                  <div className="mt-1">
                    <StatusBadge status={viewingCustomer.status} />
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  Lifetime Value
                </p>
                <p className="text-base font-black text-primary">
                  ₹{viewingCustomer.totalSpent.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-surface border border-border flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-[10px] text-text-muted font-bold uppercase">Phone</p>
                  <p className="font-bold text-text-primary">{viewingCustomer.phone}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface border border-border flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-text-muted font-bold uppercase">Email</p>
                  <p className="font-bold text-text-primary truncate">{viewingCustomer.email}</p>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="p-3 rounded-xl bg-surface border border-border flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-text-muted font-bold uppercase">Default Delivery Hub Address</p>
                <p className="font-medium text-text-primary mt-0.5">{viewingCustomer.address}</p>
              </div>
            </div>

            {/* Order History Summary */}
            <div className="p-3 rounded-xl bg-surface-soft border border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-primary" />
                <span className="font-bold text-text-primary">
                  {viewingCustomer.totalOrders} Orders placed
                </span>
              </div>
              <span className="text-[11px] text-text-muted">
                Last order: {viewingCustomer.lastOrder}
              </span>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
