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

// Comprehensive category translations for complete multi-language support (en, bn, hi)
const categoryTranslations = {
  'for-you': {
    en: 'For You',
    bn: 'আপনার জন্য',
    hi: 'आपके लिए',
    descEn: 'Curated Deals & Recommendations',
    descBn: 'নির্বাচিত অফার ও সুপারিশ',
    descHi: 'खास आपके लिए चुनिंदा डील्स',
  },
  'snacks': {
    en: 'Snacks & Namkeen',
    bn: 'স্ন্যাক্স ও চিপস',
    hi: 'स्नैक्स और नमकीन',
    descEn: 'Chips, popcorn and savoury favourites',
    descBn: 'চিপস, পপকর্ন ও মুখরোচক খাবার',
    descHi: 'चिप्स, नमकीन और स्वादिष्ट स्नैक्स',
  },
  'biscuits-cakes': {
    en: 'Biscuits & Cakes',
    bn: 'বিস্কুট ও কেক',
    hi: 'बिस्कुट और केक',
    descEn: 'Tea-time biscuits, cookies, cakes and rusks',
    descBn: 'চা-টাইম বিস্কুট, কুকিজ, কেক ও টোস্ট',
    descHi: 'चाय के बिस्कुट, कुकीज़, केक और रस्क',
  },
  'beverages': {
    en: 'Drinks & Beverages',
    bn: 'পানীয় ও কোল্ড ড্রিঙ্কস',
    hi: 'पेय और कोल्ड ड्रिंक्स',
    descEn: 'Soft drinks, fruit drinks, lassi and coffee',
    descBn: 'কোল্ড ড্রিঙ্কস, ফলের জুস, লাচ্ছি ও কফি',
    descHi: 'कोल्ड ड्रिंक्स, फलों का जूस, लस्सी और कॉफी',
  },
  'spices-grocery': {
    en: 'Spices & Grocery',
    bn: 'মশলা ও মুদিখানা',
    hi: 'मसाले और किराना',
    descEn: 'Whole spices, masalas and pantry essentials',
    descBn: 'গোটা মশলা, গুঁড়ো মশলা ও নিত্য মুদি সামগ্রী',
    descHi: 'साबुत मसाले, पाउडर मसाले और रोजमर्रा का राशन',
  },
  'chocolates-sweets': {
    en: 'Chocolates & Sweets',
    bn: 'চকলেট ও মিষ্টি',
    hi: 'चॉकलेट और मिठाई',
    descEn: 'Chocolate, candy and traditional sweets',
    descBn: 'চকলেট, ক্যান্ডি ও ঐতিহ্যবাহী মিষ্টি',
    descHi: 'चॉकलेट, कैंडी और पारंपरिक मिठाइयां',
  },
  'stationery': {
    en: 'Stationery & School',
    bn: 'স্টেশনারি ও স্কুল সামগ্রী',
    hi: 'स्टेशनरी और स्कूल',
    descEn: 'Pens, art supplies and school essentials',
    descBn: 'কলম, খাতা, আর্ট সামগ্রী ও স্কুলের সরঞ্জাম',
    descHi: 'पेन, नोटबुक, आर्ट और स्कूल का सामान',
  },
  'home-care': {
    en: 'Home & Laundry Care',
    bn: 'হোম ও লন্ড্রি কেয়ার',
    hi: 'होम और लॉन्ड्री केयर',
    descEn: 'Laundry products and room fresheners',
    descBn: 'কাপড় কাচার ডিটারজেন্ট ও রুম ফ্রেশনার',
    descHi: 'डिटर्जेंट, सफाई और रूम फ्रेशनर',
  },
  'personal-care': {
    en: 'Personal Care',
    bn: 'পার্সোনাল কেয়ার',
    hi: 'पर्सनल केयर',
    descEn: 'Handwash, fragrances and everyday care',
    descBn: 'হ্যান্ডওয়াশ, পারফিউম ও দৈনন্দিন যত্ন',
    descHi: 'हैंडवॉश, साबुन और रोजमर्रा की देखभाल',
  },
  'food-grocery': {
    en: 'Food & Grocery',
    bn: 'মুদি ও খাদ্যসামগ্রী',
    hi: 'किराना और राशन',
    descEn: 'Atta, Rice & Dals',
    descBn: 'আটা, চাল ও ডাল',
    descHi: 'आटा, दाल और चावल',
  },
  'quick-delivery': {
    en: 'Quick Delivery',
    bn: 'দ্রুত ডেলিভারি',
    hi: 'त्वरित डिलीवरी',
    descEn: '10–15 Mins Express',
    descBn: '১০–১৫ মিনিটে এক্সপ্রেস ডেলিভারি',
    descHi: '১০–১৫ मिनट में एक्सप्रेस डिलीवरी',
  },
  'fashion': {
    en: 'Fashion',
    bn: 'পোশাক ও ফ্যাশন',
    hi: 'फैशन व कपड़े',
    descEn: 'Clothing and fashion accessories',
    descBn: 'পোশাক ও ফ্যাশন সামগ্রী',
    descHi: 'कपड़े और फैशन सामग्री',
  },
  'mobiles': {
    en: 'Mobiles',
    bn: 'মোবাইল ও এক্সেসরিজ',
    hi: 'मोबाइल व गैजेट्स',
    descEn: 'Mobile phones & tech accessories',
    descBn: 'মোবাইল ফোন ও টেক এক্সেসরিজ',
    descHi: 'मोबाइल फोन और टेक सामान',
  },
  'electronics': {
    en: 'Electronics',
    bn: 'ইলেকট্রনিক্স',
    hi: 'इलेक्ट्रॉनिक्स',
    descEn: 'Electronics & home devices',
    descBn: 'ইলেকট্রনিক্স ও গৃহ সরঞ্জাম',
    descHi: 'इलेक्ट्रॉनिक्स और उपकरण',
  },
  'beauty': {
    en: 'Beauty',
    bn: 'সৌন্দর্য ও প্রসাধন',
    hi: 'ब्यूटी व केयर',
    descEn: 'Beauty & cosmetics',
    descBn: 'সৌন্দর্য ও প্রসাধন সামগ্রী',
    descHi: 'ब्यूटी व कॉस्मेटिक्स',
  },
  'home': {
    en: 'Home & Living',
    bn: 'হোম ও ক্লিনিং',
    hi: 'घर व सफाई',
    descEn: 'Home essentials & cleaning',
    descBn: 'গৃহস্থালি ও পরিষ্কার সামগ্রী',
    descHi: 'घर का सामान और सफाई',
  },
  'appliances': {
    en: 'Appliances',
    bn: 'গৃহস্থালি যন্ত্রপাতি',
    hi: 'होम अप्लायंसेज',
    descEn: 'Home & kitchen appliances',
    descBn: 'বাড়ি ও রান্নাঘরের যন্ত্রপাতি',
    descHi: 'घर और रसोई के उपकरण',
  },
  'toys-baby': {
    en: 'Toys & Baby',
    bn: 'খেলনা ও বেবি কেয়ার',
    hi: 'खिलौने व बेबी केयर',
    descEn: 'Toys and baby products',
    descBn: 'বাচ্চাদের খেলনা ও যত্ন',
    descHi: 'खिलौने और बेबी केयर',
  },
  'auto-accessories': {
    en: 'Auto Accessories',
    bn: 'গাড়ির এক্সেসরিজ',
    hi: 'ऑटोमोबाइल सामान',
    descEn: 'Vehicle care & accessories',
    descBn: 'যানবাহন ও গাড়ির এক্সেসরিজ',
    descHi: 'गाड़ी की देखभाल और सामान',
  },
  'sports': {
    en: 'Sports',
    bn: 'খেলাধুলা ও ফিটনেস',
    hi: 'खेल व फिटनेस',
    descEn: 'Sports and fitness gear',
    descBn: 'খেলাধুলা ও ফিটনেস সামগ্রী',
    descHi: 'खेलकूद और फिटनेस का सामान',
  },
  'furniture': {
    en: 'Furniture',
    bn: 'আসবাবপত্র',
    hi: 'फर्नीचर व सजावट',
    descEn: 'Furniture and living decor',
    descBn: 'আসবাবপত্র ও ঘরের সাজসজ্জা',
    descHi: 'फर्नीचर और घर की सजावट',
  },
  'books': {
    en: 'Books',
    bn: 'বই ও স্টেশনারি',
    hi: 'किताबें व स्टेशनरी',
    descEn: 'Books and study materials',
    descBn: 'বই ও পড়ার সামগ্রী',
    descHi: 'किताबें और अध्ययन सामग्री',
  },
};

export function CategoryNav() {
  const { categories } = useCatalog();
  const navigationCategories = [{id:'home-for-you',slug:'for-you',name:'For You',bengaliName:'আপনার জন্য',hindiName:'आपके लिए',shortDesc:'Your store homepage',iconName:'Sparkles'},...categories.filter(c=>!['for-you','dairy-eggs'].includes(c.slug))];
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
          aria-label={
            language === 'bn'
              ? 'ক্যাটেগরি বামে স্ক্রোল করুন'
              : language === 'hi'
              ? 'कैटेगरी बाएं स्क्रॉल करें'
              : 'Scroll categories left'
          }
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
          {navigationCategories.map((cat) => {
            const IconComponent = cat.slug === 'for-you' ? Sparkles : (iconMap[cat.iconName] || Sparkles);
            const targetUrl = cat.slug === 'for-you' ? '/' : `/category/${cat.slug}`;
            const isActive =
              cat.slug === 'for-you'
                ? location.pathname === '/'
                : location.pathname === `/category/${cat.slug}` ||
                  location.pathname.startsWith(`/category/${cat.slug}/`);

            const trans = categoryTranslations[cat.slug];
            const displayName =
              language === 'bn'
                ? (cat.bengaliName || trans?.bn || cat.name)
                : language === 'hi'
                ? (cat.hindiName || trans?.hi || cat.name)
                : (trans?.en || cat.name);

            const displayDesc =
              language === 'bn'
                ? (trans?.descBn || cat.shortDesc || '')
                : language === 'hi'
                ? (trans?.descHi || cat.shortDesc || '')
                : (trans?.descEn || cat.shortDesc || '');

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
                title={`${displayName}${displayDesc ? ` - ${displayDesc}` : ''}`}
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
          aria-label={
            language === 'bn'
              ? 'ক্যাটেগরি ডানে স্ক্রোল করুন'
              : language === 'hi'
              ? 'कैटेगरी दाएं स्क्रॉल करें'
              : 'Scroll categories right'
          }
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}