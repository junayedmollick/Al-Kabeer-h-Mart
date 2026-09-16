import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  Bell,
  Store,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { NotificationDrawer } from './NotificationDrawer';
import { LanguageSelector } from '../../components/LanguageSelector';

export function AdminHeader({ onToggleMobile }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Dynamic breadcrumb / title based on pathname
  const getPageMeta = () => {
    const path = location.pathname;
    if (path === '/admin') {
      return { title: t('admin.dashboard.title'), section: t('admin.nav.main') };
    }
    if (path.startsWith('/admin/products')) {
      return { title: t('admin.products.title'), section: t('admin.nav.management') };
    }
    if (path.startsWith('/admin/categories')) {
      return { title: t('admin.categories.title'), section: t('admin.nav.management') };
    }
    if (path.startsWith('/admin/orders')) {
      return { title: t('admin.orders.title'), section: t('admin.nav.management') };
    }
    if (path.startsWith('/admin/customers')) {
      return { title: t('admin.customers.title'), section: t('admin.nav.management') };
    }
    if (path.startsWith('/admin/promotions')) {
      return { title: t('admin.promotions.title'), section: t('admin.nav.marketing') };
    }
    if (path.startsWith('/admin/settings')) {
      return { title: t('admin.settings.title'), section: t('admin.nav.system') };
    }
    return { title: t('admin.dashboard.title'), section: t('admin.nav.main') };
  };

  const { title, section } = getPageMeta();

  return (
    <header className="sticky top-0 z-20 h-16 w-full bg-surface/90 backdrop-blur-md border-b border-border px-4 sm:px-6 flex items-center justify-between gap-3">
      {/* LEFT: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleMobile}
          aria-label="Open navigation drawer"
          className="lg:hidden relative w-10 h-10 rounded-xl flex items-center justify-center bg-surface hover:bg-primary/10 text-text-primary hover:text-primary border border-border hover:border-primary/40 shadow-2xs hover:shadow-xs active:scale-90 transition-all duration-200 cursor-pointer shrink-0 group outline-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <div className="w-5 h-4 flex flex-col justify-between items-start">
            <span className="h-[2px] w-5 rounded-full bg-current transition-all duration-200 group-hover:w-3.5" />
            <span className="h-[2px] w-3.5 rounded-full bg-primary transition-all duration-200 group-hover:w-5" />
            <span className="h-[2px] w-4.5 rounded-full bg-current transition-all duration-200 group-hover:w-3" />
          </div>
        </button>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-text-muted">
            <span>{section}</span>
            <span>/</span>
            <span className="text-primary font-black">{title}</span>
          </div>
          <h1 className="text-sm sm:text-base font-black text-text-primary tracking-tight truncate leading-tight">
            {title}
          </h1>
        </div>
      </div>

      {/* RIGHT: Search, Notifications, Theme, Lang, Store Link */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Customer Store Front Quick Button */}
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-soft hover:bg-primary/10 text-text-secondary hover:text-primary border border-border hover:border-primary/40 text-xs font-bold transition-all outline-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          title={t('admin.nav.backToMart')}
        >
          <Store className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="hidden md:inline">{t('admin.nav.backToMart')}</span>
          <ExternalLink className="w-3 h-3 text-text-muted shrink-0" />
        </Link>

        {/* Language Dropdown */}
        <LanguageSelector variant="header" />

        {/* Notification Bell with Dropdown Drawer */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            aria-label="View notifications"
            aria-expanded={isNotificationsOpen}
            className={`relative w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200 hover:scale-105 cursor-pointer select-none outline-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary active:scale-95 ${
              isNotificationsOpen
                ? 'bg-primary-light/80 border-primary text-primary shadow-xs ring-2 ring-primary/40'
                : 'bg-surface hover:bg-surface-soft border-border text-text-primary hover:border-primary/50 hover:text-primary shadow-2xs'
            }`}
          >
            <Bell className={`w-4 h-4 transition-transform duration-200 ${isNotificationsOpen ? 'text-primary scale-110' : ''}`} />
            {unreadCount > 0 && (
              <>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger ring-2 ring-surface animate-ping" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger" />
              </>
            )}
          </button>

          <NotificationDrawer
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            onUnreadCountChange={setUnreadCount}
          />
        </div>

        {/* Admin Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-border/80">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-primary-dark text-white font-black text-xs flex items-center justify-center shadow-2xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
        </div>
      </div>
    </header>
  );
}
