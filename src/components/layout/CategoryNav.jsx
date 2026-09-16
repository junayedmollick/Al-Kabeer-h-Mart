import { useCatalog } from '../../context/CatalogContext';
import React, { useRef, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Egg,
  Cookie,
  ShoppingBag,
  Zap,
  Shirt,
  Smartphone,
  Headphones,
  Heart,
  Home,
  Cpu,
  Smile,
  Gauge,
  Activity,
  Armchair,
  BookOpen
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const iconMap = {
  Sparkles,
  Egg,
  Cookie,
  ShoppingBag,
  Zap,
  Shirt,
  Smartphone,
  Headphones,
  Heart,
  Home,
  Cpu,
  Smile,
  Gauge,
  Activity,
  Armchair,
  BookOpen
};

export function CategoryNav() {
  const { categories } = useCatalog();
  const scrollRef = useRef(null);
  const location = useLocation();
  const { language } = useLanguage();
  const [showExpanded, setShowExpanded] = useState(true);
  const showExpandedRef = useRef(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const isTransitioning = useRef(false);
  const transitionTimeout = useRef(null);

  // Keep ref in sync with state for immediate checks without stale closure delays
  useEffect(() => {
    showExpandedRef.current = showExpanded;
  }, [showExpanded]);

  // Loop-proof scroll direction detection with hysteresis buffer and transition lock
  useEffect(() => {
    const COLLAPSE_MIN_Y = 120; // Only collapse after scrolling down past the header area
    const EXPAND_TOP_Y = 50;    // Always restore icons when near the very top of the page
    const SCROLL_DELTA_DOWN = 15; // Minimum downward delta to trigger collapse
    const SCROLL_DELTA_UP = 15;   // Minimum upward delta to trigger expansion

    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = Math.max(0, window.scrollY || document.documentElement.scrollTop || 0);

          // During height animation, ignore layout-induced reflow scroll events to prevent loops
          if (isTransitioning.current) {
            lastScrollY.current = currentScrollY;
            ticking.current = false;
            return;
          }

          // Case 1: Near the very top -> Always reveal expanded icon boxes
          if (currentScrollY <= EXPAND_TOP_Y) {
            if (!showExpandedRef.current) {
              setShowExpanded(true);
              isTransitioning.current = true;
              clearTimeout(transitionTimeout.current);
              transitionTimeout.current = setTimeout(() => {
                isTransitioning.current = false;
                lastScrollY.current = Math.max(0, window.scrollY || document.documentElement.scrollTop || 0);
              }, 300);
            }
          }
          // Case 2: Scrolling down past the top safe zone -> Smoothly collapse
          else if (
            currentScrollY > COLLAPSE_MIN_Y &&
            currentScrollY > lastScrollY.current + SCROLL_DELTA_DOWN &&
            showExpandedRef.current
          ) {
            setShowExpanded(false);
            isTransitioning.current = true;
            clearTimeout(transitionTimeout.current);
            transitionTimeout.current = setTimeout(() => {
              isTransitioning.current = false;
              lastScrollY.current = Math.max(0, window.scrollY || document.documentElement.scrollTop || 0);
            }, 300);
          }
          // Case 3: Scrolling upward -> Smoothly reveal expanded icon boxes
          else if (
            currentScrollY < lastScrollY.current - SCROLL_DELTA_UP &&
            !showExpandedRef.current
          ) {
            setShowExpanded(true);
            isTransitioning.current = true;
            clearTimeout(transitionTimeout.current);
            transitionTimeout.current = setTimeout(() => {
              isTransitioning.current = false;
              lastScrollY.current = Math.max(0, window.scrollY || document.documentElement.scrollTop || 0);
            }, 300);
          }

          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(transitionTimeout.current);
    };
  }, []);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Automatically scroll the active category into view smoothly
  useEffect(() => {
    if (scrollRef.current) {
      const activeEl = scrollRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [location.pathname]);

  // Hide CategoryNav specifically on orders, cart, account, login, and checkout pages
  const hideRoutes = ['/orders', '/cart', '/account', '/login', '/checkout'];
  const shouldHide = hideRoutes.some(
    (path) => location.pathname === path || location.pathname.startsWith(path + '/')
  );

  if (shouldHide) {
    return null;
  }

  return (
    <nav className="w-full bg-surface border-b border-border/70 shadow-xs transition-all duration-300 ease-out">
      <div className="max-w-[1440px] mx-auto px-2 sm:px-4 lg:px-6 relative flex items-center">
        {/* Left Arrow Button (Desktop) */}
        <button
          type="button"
          onClick={() => handleScroll('left')}
          className="hidden xl:flex items-center justify-center w-7 h-7 rounded-full bg-surface border border-border shadow-subtle hover:bg-surface-soft hover:border-primary text-text-secondary hover:text-primary transition-all mr-1 z-10 shrink-0 cursor-pointer"
          aria-label="Scroll categories left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Categories Strip */}
        <div
          ref={scrollRef}
          className={`flex items-center justify-start lg:justify-between gap-2 sm:gap-3 lg:gap-2 overflow-x-auto no-scrollbar scroll-smooth px-2 w-full transition-all duration-300 ease-out ${
            showExpanded ? 'py-2 sm:py-2.5' : 'py-1.5 sm:py-2'
          }`}
        >
          {categories.map((cat) => {
            const IconComponent = cat.slug === 'for-you' ? ShoppingBag : (iconMap[cat.iconName] || Sparkles);
            const targetUrl = cat.slug === 'for-you' ? '/' : `/category/${cat.slug}`;
            const isActive =
              cat.slug === 'for-you'
                ? location.pathname === '/'
                : location.pathname === `/category/${cat.slug}` ||
                  location.pathname.startsWith(`/category/${cat.slug}/`);

            const displayName =
              language === 'bn'
                ? (cat.bengaliName || cat.name)
                : language === 'hi'
                ? (cat.hindiName || cat.name)
                : cat.name;

            return (
              <Link
                key={cat.id}
                to={targetUrl}
                data-active={isActive}
                className={`group flex flex-col items-center justify-center shrink-0 select-none rounded-xl transition-all duration-300 ease-out cursor-pointer ${
                  showExpanded
                    ? 'py-1 px-1.5 sm:px-2'
                    : 'py-1.5 px-3 rounded-full border ' +
                      (isActive
                        ? 'bg-primary border-primary text-white shadow-xs'
                        : 'bg-surface-soft/80 hover:bg-surface-soft border-border/80 hover:border-primary/40 text-text-primary')
                }`}
                title={`${cat.name} - ${cat.shortDesc}`}
              >
                {/* Collapsible Icon Box with Butter-Smooth Transition (Replaces image with icon design from screenshot) */}
                <div
                  className={`relative transition-all duration-300 ease-out overflow-hidden rounded-xl flex items-center justify-center origin-center shrink-0 ${
                    showExpanded
                      ? 'w-9 h-9 sm:w-10 sm:h-10 opacity-100 scale-100 mb-0.5'
                      : 'w-0 h-0 opacity-0 scale-0 mb-0 pointer-events-none'
                  } ${
                    isActive
                      ? 'bg-primary-light text-primary'
                      : 'text-text-secondary group-hover:text-primary group-hover:bg-surface-soft/80'
                  }`}
                  style={isActive && showExpanded ? { backgroundColor: 'var(--primary-light, #EAF8EE)' } : undefined}
                >
                  <IconComponent className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[1.8] transition-transform duration-200 group-hover:scale-110" />
                </div>

                {/* Name Label with Inline Icon in Collapsed Mode */}
                <div className="flex items-center gap-1.5 whitespace-nowrap mt-0">
                  <IconComponent
                    className={`transition-all duration-300 ease-out shrink-0 ${
                      showExpanded
                        ? 'w-0 h-0 opacity-0 -mr-1.5 overflow-hidden'
                        : `w-3.5 h-3.5 opacity-100 ${isActive ? 'text-white' : 'text-primary'}`
                    }`}
                  />
                  <span
                    className={`text-[11px] sm:text-xs leading-tight whitespace-nowrap transition-colors duration-200 ${
                      !showExpanded && isActive
                        ? 'text-white font-black'
                        : isActive
                        ? 'text-primary font-black'
                        : 'text-text-primary group-hover:text-primary font-bold'
                    }`}
                  >
                    {displayName}
                  </span>
                </div>

                {/* Active Underline Pill (Only in expanded mode) */}
                {showExpanded && isActive && (
                  <span className="w-5 h-0.5 rounded-full bg-primary mt-1 animate-fade-in" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Arrow Button (Desktop) */}
        <button
          type="button"
          onClick={() => handleScroll('right')}
          className="hidden xl:flex items-center justify-center w-7 h-7 rounded-full bg-surface border border-border shadow-subtle hover:bg-surface-soft hover:border-primary text-text-secondary hover:text-primary transition-all ml-1 z-10 shrink-0 cursor-pointer"
          aria-label="Scroll categories right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}