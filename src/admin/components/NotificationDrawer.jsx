import { api } from '../../lib/api';
import { useAdminData } from '../../context/AdminDataContext';
import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  ShoppingBag,
  AlertTriangle,
  UserCheck,
  Check,
  Sparkles,
  Clock,
  Trash2,
  CheckCheck,
  Inbox,
  X,
} from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import { useCatalog } from '../../context/CatalogContext';

export function NotificationDrawer({ isOpen, onClose, onUnreadCountChange }) {
  const { orders } = useOrders(), { products } = useCatalog();
  const { notificationPreferences } = useAdminData();
  const [readIds, setReadIds] = useState(notificationPreferences?.read || []), [hiddenIds, setHiddenIds] = useState(notificationPreferences?.hidden || []);
  const savePreferences = async (read, hidden) => {
    try {
      const saved = await api('/admin/notifications/preferences', {method:'PUT',body:{read:[...new Set(read)].slice(-500),hidden:[...new Set(hidden)].slice(-500)}});
      setReadIds(saved.read);
      setHiddenIds(saved.hidden);
    } catch(e) {
      const prefs = { read: [...new Set(read)].slice(-500), hidden: [...new Set(hidden)].slice(-500) };
      localStorage.setItem('alkabeer_notification_prefs', JSON.stringify(prefs));
      setReadIds(prefs.read);
      setHiddenIds(prefs.hidden);
    }
  };
  const notifications = [...orders.filter(o => o.statusType === 'active').map(o => ({id:o.id,title:'Order ' + o.id,message:o.customerName + ' · ₹' + o.total + ' · ' + o.status,time:o.date,type:'order'})), ...products.filter(p => p.stock < 10).map(p => ({id:'stock-' + p.id,title:'Low stock',message:p.name + ': ' + p.stock + ' remaining',time:'Current inventory',type:'stock'}))].filter(n => !hiddenIds.includes(n.id)).map(n => ({...n,read:readIds.includes(n.id)}));
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread'
  const drawerRef = useRef(null);

  // Sync unread count to parent if callback exists
  useEffect(() => {
    const unreadCount = notifications.filter((n) => !n.read).length;
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadCount);
    }
  }, [notifications, onUnreadCountChange]);

  // Close on outside click / tap
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen, onClose]);

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

  const markAllRead = () => savePreferences(notifications.map(n => n.id), hiddenIds);
  const markItemRead = id => savePreferences([...readIds,id], hiddenIds);
  const deleteNotification = (e,id) => { e.stopPropagation(); savePreferences(readIds, [...hiddenIds,id]); };
  const clearReadNotifications = () => savePreferences(readIds, [...hiddenIds,...readIds]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications =
    activeFilter === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications;

  if (!isOpen) return null;

  return (
    <div
      ref={drawerRef}
      role="dialog"
      aria-label="Store Alerts"
      className="fixed inset-x-3 top-[68px] sm:absolute sm:inset-x-auto sm:left-auto sm:right-0 sm:top-12 sm:w-[410px] rounded-2xl bg-surface border border-border shadow-2xl overflow-hidden z-50 animate-fade-in divide-y divide-border/60"
    >
        {/* 1. Header with Title, Badge, and Mark All Read */}
        <div className="p-3 sm:p-4 bg-surface flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h4 className="text-xs sm:text-sm font-black text-text-primary tracking-tight truncate">
                  Store Alerts
                </h4>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-primary-light text-primary border border-primary/20 shrink-0">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-[10px] text-text-muted truncate">
                Live updates & store activity
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-surface-soft hover:bg-primary/10 text-text-secondary hover:text-primary text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 border border-border/80 hover:border-primary/30"
                title="Mark all notifications as read"
              >
                <CheckCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Mark all read</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close notification drawer"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-soft transition-colors cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      {/* 2. Filter Tabs: All vs Unread */}
      <div className="px-4 py-2 bg-surface-soft/60 flex items-center justify-between gap-2 border-b border-border/60">
        <div className="inline-flex items-center p-0.5 rounded-lg bg-surface border border-border">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-primary text-white shadow-2xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('unread')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
              activeFilter === 'unread'
                ? 'bg-primary text-white shadow-2xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {notifications.some((n) => n.read) && (
          <button
            type="button"
            onClick={clearReadNotifications}
            className="text-[10px] font-bold text-text-muted hover:text-danger transition-colors cursor-pointer flex items-center gap-1"
            title="Remove read notifications"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear read</span>
          </button>
        )}
      </div>

      {/* 3. Notification Items List with Custom Slim Scrollbar */}
      <div className="max-h-[340px] overflow-y-auto custom-scrollbar divide-y divide-border/50">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-surface-soft flex items-center justify-center text-text-muted mb-2.5">
              <Inbox className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-text-primary">
              {activeFilter === 'unread' ? 'No unread notifications' : 'No notifications'}
            </p>
            <p className="text-[11px] text-text-muted mt-0.5 max-w-xs">
              {activeFilter === 'unread'
                ? "You're all caught up! There are no pending unread alerts."
                : 'Your store notifications and activity logs will appear here.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => {
            const Icon =
              item.type === 'order'
                ? ShoppingBag
                : item.type === 'stock'
                ? AlertTriangle
                : item.type === 'user'
                ? UserCheck
                : Sparkles;

            const iconStyles =
              item.type === 'order'
                ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20'
                : item.type === 'stock'
                ? 'text-amber-600 bg-amber-500/10 border-amber-500/20'
                : item.type === 'user'
                ? 'text-blue-600 bg-blue-500/10 border-blue-500/20'
                : 'text-purple-600 bg-purple-500/10 border-purple-500/20';

            return (
              <div
                key={item.id}
                onClick={() => markItemRead(item.id)}
                className={`p-3.5 flex items-start gap-3 transition-all duration-150 cursor-pointer group ${
                  !item.read
                    ? 'bg-primary-light/35 hover:bg-primary-light/60 border-l-[3px] border-primary'
                    : 'bg-surface hover:bg-surface-soft border-l-[3px] border-transparent'
                }`}
              >
                {/* Type Icon Badge */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${iconStyles}`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-xs truncate ${
                        !item.read
                          ? 'font-black text-text-primary'
                          : 'font-semibold text-text-secondary'
                      }`}
                    >
                      {item.title}
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-text-muted flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {item.time}
                      </span>
                      {/* Delete notification button */}
                      <button
                        type="button"
                        onClick={(e) => deleteNotification(e, item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-danger/10 hover:text-danger text-text-muted transition-all cursor-pointer"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    {!item.read ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        Unread
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-text-muted">
                        <Check className="w-3 h-3 text-emerald-600" />
                        Read
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Footer with Live Status */}
      <div className="p-3 bg-surface-soft/60 px-4 flex items-center justify-between text-[10px] text-text-muted">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-text-secondary">
            Al Kabeer Hub Notifications
          </span>
        </div>
        <span>{filteredNotifications.length} items</span>
      </div>
    </div>
  );
}
