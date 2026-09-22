import { useCatalog } from '../../context/CatalogContext';
import React from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Tag,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';

export function AdminSidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) {
  const { t } = useLanguage();
  const { products, categories } = useCatalog();
  const { user, logout } = useAuth();
  const { orders } = useOrders();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try { await logout(); } catch(e) { alert(e.message); return; }
    navigate('/admin/login');
  };

  // Count active / pending orders
  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'Out for Delivery' || o.status === 'Processing' || o.status === 'Pending'
  ).length;

  const navGroups = [
    {
      groupKey: 'main',
      label: t('admin.nav.main'),
      items: [
        {
          to: '/admin',
          exact: true,
          label: t('admin.nav.dashboard'),
          icon: LayoutDashboard,
        },
      ],
    },
    {
      groupKey: 'management',
      label: t('admin.nav.management'),
      items: [
        {
          to: '/admin/products',
          label: t('admin.nav.products'),
          icon: Package,
          badge: String(products.length),
        },
        {
          to: '/admin/categories',
          label: t('admin.nav.categories'),
          icon: Layers,
          badge: String(categories.length),
        },
        {
          to: '/admin/orders',
          label: t('admin.nav.orders'),
          icon: ShoppingBag,
          badge: pendingOrdersCount > 0 ? String(pendingOrdersCount) : null,
          badgeColor: 'bg-amber-500 text-white animate-pulse',
        },
        {
          to: '/admin/customers',
          label: t('admin.nav.customers'),
          icon: Users,
        },
      ],
    },
    {
      groupKey: 'marketing',
      label: t('admin.nav.marketing'),
      items: [
        {
          to: '/admin/promotions',
          label: t('admin.nav.promotions'),
          icon: Tag,
        },
      ],
    },
    {
      groupKey: 'system',
      label: t('admin.nav.system'),
      items: [
        {
          to: '/admin/settings',
          label: t('admin.nav.settings'),
          icon: Settings,
        },
      ],
    },
  ];

  const renderSidebarContent = (collapsed = isCollapsed, isMobile = false) => (
    <div className="flex flex-col h-full bg-surface border-r border-border select-none relative">
      {/* 1. Header & Brand Logo */}
      {collapsed && !isMobile ? (
        <div className="h-16 flex items-center justify-center border-b border-border/80 shrink-0 px-2">
          <Link
            to="/admin"
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:scale-105 transition-transform"
            title="Al Kabeer H Mart Admin"
          >
            <img
              src="/assets/logo.png"
              alt="Al Kabeer H Mart"
              className="w-9 h-9 object-contain rounded-xl drop-shadow-2xs"
            />
          </Link>
        </div>
      ) : (
        <div className="h-16 px-4 flex items-center justify-between border-b border-border/80 shrink-0">
          <Link
            to="/admin"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 min-w-0 group"
          >
            <img
              src="/assets/logo.png"
              alt="Al Kabeer H Mart"
              className="w-9 h-9 object-contain rounded-xl shrink-0 transition-transform duration-200 group-hover:scale-105"
            />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1 font-black text-sm tracking-tight text-text-primary truncate">
                <span>AL KABEER</span>
                <span className="text-danger font-black">h</span>
                <span className="text-primary font-black">MART</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary truncate">
                  {t('admin.nav.adminCenter')}
                </span>
              </div>
            </div>
          </Link>

          {/* Close button inside mobile drawer */}
          {isMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close navigation drawer"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-soft border border-border/80 active:scale-95 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* 2. Navigation Items */}
      {collapsed && !isMobile ? (
        /* UNEXPANDED (COLLAPSED) RAIL: Continuous compact buttons with comfortable Y-gap */
        <div className="flex-1 overflow-visible py-4 flex flex-col items-center gap-3 px-2">
          {navGroups.flatMap((g) => g.items).map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `group relative w-[38px] h-[38px] rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-primary-light text-primary font-black shadow-xs border border-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-soft border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? 'text-primary' : 'text-text-secondary group-hover:text-text-primary'
                      }`}
                    />

                    {/* Badge dot / counter for collapsed rail */}
                    {item.badge && (
                      <span
                        className={`absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 text-[8px] font-black rounded-full flex items-center justify-center ring-2 ring-surface shadow-xs ${
                          item.badgeColor || 'bg-surface-soft text-text-secondary border border-border'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* High-end Floating Tooltip on Hover */}
                    <div className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-neutral-900 text-white text-xs font-semibold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-150 translate-x-1 group-hover:translate-x-0 whitespace-nowrap z-50 flex items-center gap-2 border border-white/10">
                      <span>{item.label}</span>
                      {item.badge && (
                        <span
                          className={`px-1.5 py-0.5 text-[9px] font-black rounded-full ${
                            item.badgeColor || 'bg-white/10 text-neutral-300 border border-white/10'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-neutral-900" />
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      ) : (
        /* EXPANDED / MOBILE DRAWER: Sectioned navigation with larger icons and text */
        <div
          className="flex-1 overflow-y-auto no-scrollbar py-3.5 px-3 space-y-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {navGroups.map((group) => (
            <div key={group.groupKey} className="space-y-1">
              <p className="px-3.5 text-[11px] font-black uppercase tracking-wider text-text-muted mb-1.5">
                {group.label}
              </p>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.exact}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-primary-light text-primary font-black shadow-xs border border-primary'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-soft border border-transparent'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                            isActive ? 'text-primary' : 'text-text-secondary group-hover:text-text-primary'
                          }`}
                        />
                        <span className="truncate flex-1 text-sm font-bold">{item.label}</span>
                        {item.badge && (
                          <span
                            className={`px-2.5 py-0.5 text-xs font-black rounded-full shrink-0 ${
                              item.badgeColor || 'bg-surface-soft text-text-secondary border border-border'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-primary shrink-0 shadow-2xs" />
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* 3. Bottom Profile & System Controls */}
      {collapsed && !isMobile ? (
        <div className="p-2.5 pb-4 border-t border-border bg-surface-soft/30 flex flex-col items-center gap-2.5 shrink-0">
          {/* Avatar with Vertically Centered Tooltip */}
          <div className="relative group">
            <div className="w-[38px] h-[38px] rounded-xl bg-gradient-to-tr from-primary to-primary-dark text-white flex items-center justify-center font-black text-xs shadow-xs relative">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-surface" />
            </div>
            <div className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-neutral-900 text-white text-xs font-semibold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-150 translate-x-1 group-hover:translate-x-0 whitespace-nowrap z-50 border border-white/10 flex items-center gap-2">
              <span>{user?.name || 'Administrator'}</span>
              <span className="text-[10px] text-emerald-400 font-bold">Online</span>
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-neutral-900" />
            </div>
          </div>

          {/* Quick Logout Button with Vertically Centered Tooltip */}
          <div className="relative group">
            <button
              type="button"
              onClick={handleLogout}
              aria-label={t('admin.nav.logout')}
              className="w-[38px] h-[38px] rounded-xl flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger/10 border border-transparent hover:border-danger/20 active:scale-95 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <div className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-neutral-900 text-white text-xs font-semibold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-150 translate-x-1 group-hover:translate-x-0 whitespace-nowrap z-50 border border-white/10 flex items-center gap-1.5">
              <span className="text-danger font-bold">{t('admin.nav.logout')}</span>
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-neutral-900" />
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 border-t border-border bg-surface-soft/30 space-y-2 shrink-0">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-surface border border-border">
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-primary-dark text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-surface" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-text-primary truncate">
                {user?.name || 'Administrator'}
              </p>
              <p className="text-[10px] text-text-muted truncate flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500 inline shrink-0" />
                Store Admin
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title={t('admin.nav.logout')}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger/10 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Fixed / Sticky Sidebar */}
      <aside
        className={`hidden lg:block sticky top-0 h-screen transition-all duration-300 z-30 shrink-0 relative ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {renderSidebarContent(isCollapsed, false)}

        {/* Floating Collapse / Expand Toggle Button on Sidebar Border */}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden lg:flex absolute -right-3.5 top-5 z-40 w-7 h-7 rounded-full bg-surface border border-border shadow-md items-center justify-center text-text-secondary hover:text-primary hover:border-primary/50 hover:scale-110 active:scale-95 transition-all cursor-pointer"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5 transition-transform" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5 transition-transform" />
          )}
        </button>
      </aside>

      {/* Mobile Off-Canvas Drawer with Smooth Slide Transition */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
          isMobileOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
        }`}
        aria-hidden={!isMobileOpen}
      >
        {/* Backdrop Fade */}
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
            isMobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onCloseMobile}
          aria-hidden="true"
        />

        {/* Sliding Drawer Container */}
        <div
          className={`relative w-72 max-w-[85vw] h-full shadow-2xl z-10 transform transition-transform duration-300 ease-out ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {renderSidebarContent(false, true)}
        </div>
      </div>
    </>
  );
}
