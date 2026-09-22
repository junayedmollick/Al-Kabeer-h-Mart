import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, ShoppingBag, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

export function MobileBottomNav() {
  const location = useLocation();
  const { itemCount } = useCart();
  const { t } = useLanguage();

  const navItems = [
    { key: 'home', label: t('nav.home'), path: '/', icon: Home },
    { key: 'categories', label: t('nav.categories'), path: '/category/snacks', icon: Grid },
    { key: 'orders', label: t('nav.orders'), path: '/account?tab=orders', icon: ShoppingBag },
    { key: 'cart', label: t('nav.cart'), path: '/cart', icon: ShoppingCart, badge: itemCount },
    { key: 'account', label: t('nav.account'), path: '/account', icon: User },
  ];

  const isOrders =
    location.pathname === '/orders' ||
    (location.pathname === '/account' && location.search.includes('tab=orders'));

  const isAccount =
    location.pathname === '/account' && !location.search.includes('tab=orders');

  const isCategoryPath =
    location.pathname.startsWith('/category') || location.pathname === '/categories';

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border shadow-lg py-1 px-2">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.key === 'categories'
              ? isCategoryPath
              : item.key === 'orders'
              ? isOrders
              : item.key === 'account'
              ? isAccount
              : item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          const targetUrl =
            item.key === 'categories' && isCategoryPath
              ? location.pathname
              : item.path;

          return (
            <Link
              key={item.key}
              to={targetUrl}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors relative ${
                isActive ? 'text-primary font-black' : 'text-text-primary'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-secondary text-gray-950 text-[9px] font-black rounded-full h-3.5 min-w-3.5 px-1 flex items-center justify-center border border-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-bold">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
