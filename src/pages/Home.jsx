import { useCatalog } from '../context/CatalogContext';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Tag, Milk, Cookie, Search } from 'lucide-react';
import { HeroSlider } from '../components/HeroSlider';
import { BenefitCards } from '../components/BenefitCards';
import { PromoCards } from '../components/PromoCards';
import { CategoryGrid } from '../components/CategoryGrid';
import { ProductSection } from '../components/ProductSection';
import { ProductCard } from '../components/ProductCard';
import { useLanguage } from '../context/LanguageContext';

export function Home({ searchQuery, onSearchChange, onOpenVip }) {
  const { products, categories } = useCatalog();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // Search filtered products
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.tag && p.tag.toLowerCase().includes(q))
    );
  }, [searchQuery, products]);

  const handleScrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex-1">
      {/* If Active Search Query, Show Live Search Results */}
      {searchQuery.trim() !== '' ? (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              <h2 className="text-xl sm:text-2xl font-black text-text-primary">
                {t('search.resultsFor')} "{searchQuery}"
              </h2>
              <span className="text-xs bg-primary-light text-primary font-bold px-2.5 py-0.5 rounded-full ml-1">
                {searchResults.length} {searchResults.length === 1 ? t('cart.item') : t('cart.items')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              {t('search.clearSearch')}
            </button>
          </div>

          {searchResults.length === 0 ? (
            <div className="py-16 bg-surface rounded-3xl border border-border text-center p-6 shadow-subtle">
              <Search className="w-12 h-12 text-text-muted mx-auto mb-3" />
              <h3 className="text-lg font-black text-text-primary mb-1">
                {t('search.noItemsFound')} "{searchQuery}"
              </h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto mb-6">
                {t('search.trySearching')}
              </p>
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="bg-primary hover:bg-primary-dark text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                {t('search.viewAllProducts')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
              {searchResults.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          {/* 1. Rich Hero Slider */}
          <HeroSlider
            onOpenVip={onOpenVip}
            onScrollToSection={handleScrollToSection}
          />

          {/* 2. Benefit / Trust Cards */}
          <BenefitCards />

          {/* 3. Promotional Cards */}
          <PromoCards onScrollToSection={handleScrollToSection} />

          {/* 4. Shop by Category Grid */}
          <CategoryGrid />

          {categories.filter(c=>products.some(p=>p.category===c.slug)).map((category) => {
            const catTitle = language === 'bn' ? (category.bengaliName || category.name) : language === 'hi' ? (category.hindiName || category.name) : category.name;
            return (
              <ProductSection
                key={category.id}
                id={category.slug}
                title={catTitle}
                subtitle={category.shortDesc || category.tagline}
                icon={Tag}
                products={products.filter(p=>p.category===category.slug).slice(0,6)}
                onViewAll={()=>navigate('/category/'+category.slug)}
              />
            );
          })}
        </>
      )}
    </div>
  );
}
