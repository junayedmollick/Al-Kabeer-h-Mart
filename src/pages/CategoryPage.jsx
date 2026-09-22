import { useCatalog } from '../context/CatalogContext';
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronRight,
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  ShoppingBag,
  Clock,
  ArrowLeft,
  Zap,
  Tag
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useLanguage } from '../context/LanguageContext';

export function CategoryPage() {
  const { products, categories } = useCatalog();
  const { slug } = useParams();
  const { language, t } = useLanguage();
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  useEffect(()=>setSelectedSubcategory('All'),[slug]);
  const [sortBy, setSortBy] = useState('featured');

  // Find category details
  const currentCategory = useMemo(() => {
    if (slug === 'for-you') return {name:'All products',bengaliName:'সমস্ত পণ্য',hindiName:'सभी उत्पाद',slug:'for-you',tagline:'Browse everything in your neighbourhood store.',bannerGradient:'from-emerald-700 to-teal-800',subcategories:[]};
    return categories.find((c) => c.slug === slug) || null; // fallback to dairy
  }, [slug, categories]);

  // All products for this category (unfiltered, used for showcase & meta stats)
  const allCategoryProducts = useMemo(() => {
    return products.filter((p) => p.category === slug || (slug === 'for-you' && p));
  }, [slug, products]);

  const showcaseProduct1 = allCategoryProducts[0];
  const showcaseProduct2 = allCategoryProducts[1] || allCategoryProducts[0];

  const minPrice = useMemo(() => {
    const priced = allCategoryProducts.filter(p=>!p.pricePending && p.price>0);
    return priced.length ? Math.min(...priced.map(p=>p.price)) : null;
  }, [allCategoryProducts]);

  const maxDiscount = useMemo(() => {
    return allCategoryProducts.reduce((max, p) => {
      if (p.oldPrice && p.oldPrice > p.price) {
        const disc = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
        return Math.max(max, disc);
      }
      return max;
    }, 0);
  }, [allCategoryProducts]);

  // Filter products by category and subcategory
  const categoryProducts = useMemo(() => {
    let list = products.filter((p) => p.category === slug || (slug === 'for-you' && p));

    // If specific subcategory selected
    if (selectedSubcategory !== 'All') {
      list = list.filter((p) => p.subcategory === selectedSubcategory);
    }

    // Apply sorting
    if (sortBy === 'price_asc') {
      list = [...list].sort((a, b) => (a.pricePending ? Infinity : a.price) - (b.pricePending ? Infinity : b.price));
    } else if (sortBy === 'price_desc') {
      list = [...list].sort((a, b) => (b.pricePending ? -Infinity : b.price) - (a.pricePending ? -Infinity : a.price));
    } else if (sortBy === 'discount') {
      list = [...list].sort((a, b) => {
        const discA = a.oldPrice ? a.oldPrice - a.price : 0;
        const discB = b.oldPrice ? b.oldPrice - b.price : 0;
        return discB - discA;
      });
    }

    return list;
  }, [slug, selectedSubcategory, sortBy, products]);

  if (!currentCategory) return <div className="p-12">{t('productDetail.unavailable')}. <Link to="/">{t('productDetail.backToStore')}</Link></div>;

  const displayName =
    language === 'bn'
      ? (currentCategory.bengaliName || currentCategory.name)
      : language === 'hi'
      ? (currentCategory.hindiName || currentCategory.name)
      : currentCategory.name;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-text-secondary font-medium mb-4 flex-wrap">
        <Link to="/" className="hover:text-primary transition-colors">
          {t('nav.home')}
        </Link>
        <ChevronRight className="w-3 h-3 text-text-muted" />
        <span className="text-text-muted">{t('nav.categories')}</span>
        <ChevronRight className="w-3 h-3 text-text-muted" />
        <span className="text-primary font-bold">{displayName}</span>
      </nav>

      {/* 2. Redesigned Rich Category Hero Banner */}
      <div
        className={`relative rounded-3xl p-6 sm:p-8 md:p-10 mb-6 sm:mb-8 text-white bg-gradient-to-r ${currentCategory.bannerGradient} shadow-xl overflow-hidden border border-white/10 select-none`}
      >
        {/* Ambient Decorative Lighting */}
        <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-white/12 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-black/25 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Left Hero Content Column */}
          <div className="lg:col-span-7 flex flex-col items-start justify-center">
            
            {/* Top Catalog & Stock Badge */}
            <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 mb-3 sm:mb-4 shadow-sm text-xs font-black tracking-wide text-secondary">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
              </span>
              <span>{t('categoryPage.catalogTitle')}</span>
              <span className="text-white/40">•</span>
              <span className="text-white font-bold">{allCategoryProducts.length} {t('categoryPage.items')}</span>
            </div>

            {/* Main Category Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.15] mb-3 drop-shadow-sm">
              {displayName}
            </h1>

            {/* Tagline / Subtitle */}
            <p className="text-xs sm:text-sm md:text-base text-white/90 font-medium leading-relaxed mb-5 sm:mb-6 max-w-lg">
              {currentCategory.tagline}
            </p>

            {/* Value Proposition Pills (Speed, Price & Guarantee) */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <div className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-white border border-white/20 shadow-2xs transition-all">
                <Clock className="w-3.5 h-3.5 text-secondary shrink-0" />
                <span>{t('categoryPage.fastDelivery')}</span>
              </div>

              {minPrice !== null && (
                <div className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-white border border-white/20 shadow-2xs transition-all">
                  <Tag className="w-3.5 h-3.5 text-secondary shrink-0" />
                  <span>{t('categoryPage.startingAt')} ₹{minPrice}</span>
                </div>
              )}

              {maxDiscount > 0 ? (
                <div className="inline-flex items-center gap-1.5 bg-secondary text-gray-950 px-3 py-1.5 rounded-xl text-xs font-black shadow-xs">
                  <Zap className="w-3.5 h-3.5 fill-current shrink-0" />
                  <span>{t('categoryPage.upTo')} {maxDiscount}% {t('categoryPage.off')}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-white border border-white/20 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-secondary shrink-0" />
                  <span>{t('categoryPage.genuineQuality')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Hero Visual Column: 3D Floating Showcase (Fills the previous empty space!) */}
          <div className="hidden lg:flex lg:col-span-5 relative items-center justify-center">
            {showcaseProduct1 ? (
              <div className="relative w-full max-w-sm flex items-center justify-center py-4">
                
                {/* Main Floating Product Card */}
                <Link to={'/product/'+encodeURIComponent(showcaseProduct1.id)} className="relative z-20 bg-white text-gray-900 rounded-3xl p-4 shadow-2xl w-60 sm:w-64 transform -rotate-3 hover:rotate-0 transition-transform duration-300 border border-white/40 group/card">
                  <div className="relative w-full h-32 sm:h-36 rounded-2xl overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100 mb-2.5 p-2 flex items-center justify-center border border-gray-100">
                    <img
                      src={showcaseProduct1.image}
                      alt={showcaseProduct1.name}
                      className="w-full h-full object-contain group-hover/card:scale-106 transition-transform duration-300 drop-shadow-xs"
                      loading="lazy"
                    />
                    <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                      {showcaseProduct1.tag || t('categoryPage.popularBadge')}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm truncate">
                    {showcaseProduct1.name}
                  </h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[11px] text-gray-500 font-semibold">
                      {showcaseProduct1.weight}
                    </span>
                    <span className="font-black text-primary text-sm sm:text-base">
                      {showcaseProduct1.pricePending ? t('categoryPage.priceComingSoon') : '₹'+showcaseProduct1.price}
                    </span>
                  </div>
                </Link>

                {/* Secondary Overlapping Card */}
                {showcaseProduct2 && showcaseProduct2.id !== showcaseProduct1.id && (
                  <Link to={'/product/'+encodeURIComponent(showcaseProduct2.id)} className="absolute z-10 -right-2 -bottom-2 bg-white/95 backdrop-blur-md text-gray-900 rounded-2xl p-3 shadow-xl w-48 sm:w-52 transform rotate-5 hover:rotate-0 transition-transform duration-300 border border-white/50 group/card2">
                    <div className="w-full h-20 sm:h-24 rounded-xl overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100 mb-1.5 p-1 flex items-center justify-center border border-gray-100">
                      <img
                        src={showcaseProduct2.image}
                        alt={showcaseProduct2.name}
                        className="w-full h-full object-contain group-hover/card2:scale-106 transition-transform duration-300 drop-shadow-xs"
                        loading="lazy"
                      />
                    </div>
                    <h5 className="font-bold text-xs truncate">
                      {showcaseProduct2.name}
                    </h5>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[10px] text-gray-500 font-semibold">
                        {showcaseProduct2.weight}
                      </span>
                      <span className="font-black text-primary text-xs sm:text-sm">
                        {showcaseProduct2.pricePending ? t('categoryPage.priceComingSoon') : '₹'+showcaseProduct2.price}
                      </span>
                    </div>
                  </Link>
                )}

                {/* Fresh Hub Stock Floating Stamp */}
                <div className="absolute top-0 right-2 z-30 bg-black/65 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/20 shadow-md">
                  <Sparkles className="w-3 h-3 text-secondary" />
                  <span>{t('categoryPage.hubBadge')}</span>
                </div>

              </div>
            ) : (
              /* Fallback Category Hero Card */
              <div className="relative z-20 bg-white/15 backdrop-blur-md rounded-3xl p-3 border border-white/20 shadow-2xl max-w-xs overflow-hidden">
                <img
                  src={currentCategory.image}
                  alt={currentCategory.name}
                  className="w-full h-48 rounded-2xl object-cover"
                />
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 3. Subcategories Filter Pills & Sort Bar */}
      <div className="bg-surface rounded-2xl p-3 sm:p-4 border border-border shadow-subtle mb-6 sm:mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Subcategories Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-1 md:pb-0">
          {currentCategory.subcategories.map((sub) => {
            const isSubActive = selectedSubcategory === sub;
            const subLabel = sub === 'All' ? (language === 'bn' ? 'সব' : language === 'hi' ? 'सभी' : 'All') : sub;
            return (
              <button
                key={sub}
                type="button"
                onClick={() => setSelectedSubcategory(sub)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isSubActive
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-soft hover:bg-primary-light hover:text-primary text-text-secondary border border-border/80'
                }`}
              >
                {subLabel}
              </button>
            );
          })}
        </div>

        {/* Sort Functionality Dropdown */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0 text-xs font-semibold text-text-secondary">
          <ArrowUpDown className="w-3.5 h-3.5 text-primary" />
          <span>{t('categoryPage.sortBy')}</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-surface-soft border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-text-primary outline-none focus:border-primary cursor-pointer"
          >
            <option value="featured">{t('categoryPage.sortFeatured')}</option>
            <option value="price_asc">{t('categoryPage.sortPriceAsc')}</option>
            <option value="price_desc">{t('categoryPage.sortPriceDesc')}</option>
            <option value="discount">{t('categoryPage.sortDiscount')}</option>
          </select>
        </div>
      </div>

      {/* 4. Product Grid */}
      {categoryProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {categoryProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-16 bg-surface rounded-3xl border border-border text-center p-6 shadow-subtle">
          <div className="w-16 h-16 rounded-full bg-surface-soft text-text-muted flex items-center justify-center mx-auto mb-3">
            <ShoppingBag className="w-8 h-8 stroke-1" />
          </div>
          <h3 className="text-lg font-black text-text-primary mb-1">
            {t('categoryPage.noItemsIn')} "{selectedSubcategory}"
          </h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto mb-5">
            {t('categoryPage.trySwitching')}
          </p>
          <button
            type="button"
            onClick={() => setSelectedSubcategory('All')}
            className="bg-primary hover:bg-primary-dark text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            {t('categoryPage.showAllItems')}
          </button>
        </div>
      )}

      {/* Back to Home Button */}
      <div className="mt-10 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-primary-dark bg-surface-soft hover:bg-primary-light border border-border px-4 py-2 rounded-xl transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('categoryPage.backToAllCategories')}</span>
        </Link>
      </div>

    </div>
  );
}
