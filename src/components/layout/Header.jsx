import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, ShoppingCart, Crown, ChevronDown } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { SearchBar } from '../SearchBar';
import { LanguageSelector } from '../LanguageSelector';

export function Header({
  onOpenVip,
  searchQuery,
  onSearchChange,
}) {
  const { itemCount } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <header className="w-full bg-surface border-b border-border/80 transition-all">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5">
        
        {/* TOP ROW: Logo, Desktop Search, and Right Controls */}
        <div className="flex items-center justify-between gap-3 lg:gap-6">
          
          {/* LEFT: Real AL KABEER H MART Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-2.5 group cursor-pointer select-none min-w-0"
            aria-label="Al Kabeer H Mart Home"
          >
            <img
              src="/assets/logo.png"
              alt="AL KABEER H MART"
              className="h-9 sm:h-12 w-auto object-contain rounded-xl transition-transform group-hover:scale-105 duration-200 shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <div className="flex items-baseline leading-none font-black tracking-tight text-text-primary whitespace-nowrap">
                <span className="text-sm sm:text-lg lg:text-xl font-black">
                  AL KABEER
                </span>
                <span className="text-sm sm:text-lg lg:text-xl font-black text-danger mx-0.5 sm:mx-1">
                  h
                </span>
                <span className="text-sm sm:text-lg lg:text-xl font-black text-primary">
                  MART
                </span>
              </div>
              <span className="text-[8px] sm:text-[9px] font-bold text-text-secondary uppercase tracking-wider sm:tracking-widest mt-0.5 flex items-center gap-1 truncate max-w-[140px] sm:max-w-none">
                <span className="text-danger shrink-0">●</span> <span className="truncate">{t('brand.tagline')}</span>
              </span>
            </div>
          </Link>

          {/* CENTER: Large Modern Search Bar (Desktop / Tablet) */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <SearchBar searchQuery={searchQuery} onSearchChange={onSearchChange} />
          </div>

          {/* RIGHT: Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">

            {/* 1. 999 VIP Membership Button (Desktop / Tablet) */}
            <button
              type="button"
              onClick={onOpenVip}
              className="inline-flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-300 hover:from-amber-400 hover:via-amber-400 hover:to-amber-500 text-amber-950 font-black px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs shadow-2xs transition-all hover:scale-105 cursor-pointer border border-amber-400/40 select-none shrink-0 whitespace-nowrap"
              title="Open 999 VIP Membership"
            >
              <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-950 fill-amber-950 shrink-0" />
              <span className="tracking-wide whitespace-nowrap">{t('nav.vipBtn')}</span>
            </button>

            {/* 2. Language Selector (Globe Icon Only, Circular 40-44px) */}
            <LanguageSelector variant="header" />

            {/* 3. Improved Desktop Account Button */}
            <Link
              to={isAuthenticated ? '/account' : '/login'}
              className="hidden md:inline-flex items-center justify-center w-9 h-9 rounded-full bg-surface hover:bg-surface-soft border border-border/80 hover:border-primary/50 text-text-primary hover:text-primary transition-all duration-200 cursor-pointer select-none shadow-2xs hover:scale-105 active:scale-95 shrink-0"
              title={isAuthenticated ? (user?.name || t('nav.account')) : t('nav.account')}
              aria-label={isAuthenticated ? (user?.name || t('nav.account')) : t('nav.account')}
            >
              {isAuthenticated && user?.name ? (
                <span className="font-black text-xs text-primary">
                  {user.avatarUrl ? <img src={user.avatarUrl} alt="Your profile" className="w-full h-full object-cover rounded-full"/> : user.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="w-4 h-4" />
              )}
            </Link>

            {/* 4. Desktop Cart Button */}
            <Link
              to="/cart"
              className="hidden md:inline-flex relative items-center justify-center w-9 h-9 rounded-full bg-primary hover:bg-primary-dark text-white shadow-xs transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer select-none shrink-0"
              aria-label={`View Cart with ${itemCount} items`}
              title={t('nav.cart')}
            >
              <ShoppingCart className="w-4 h-4" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-gray-950 text-[10px] font-black rounded-full h-4 min-w-4 px-1 flex items-center justify-center shadow-xs border border-white leading-none">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>

        </div>

        {/* MOBILE ROW 2: Full-width Search Bar */}
        <div className="md:hidden mt-2 pt-1.5 border-t border-border/50">
          <SearchBar searchQuery={searchQuery} onSearchChange={onSearchChange} isMobile={true} />
        </div>

      </div>
    </header>
  );
}
