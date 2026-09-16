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
  const { products } = useCatalog();
  const { t } = useLanguage();
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

  // Section specific curated products
  const quickProducts = useMemo(
    () => products.filter((p) => p.category === 'quick-delivery' || p.category === 'dairy-eggs').slice(0, 6),
    [products]
  );

  const under99Products = useMemo(
    () => products.filter((p) => p.price < 100).slice(0, 6),
    [products]
  );

  const dairyProducts = useMemo(
    () => products.filter((p) => p.category === 'dairy-eggs').slice(0, 6),
    [products]
  );

  const snacksProducts = useMemo(
    () => products.filter((p) => p.category === 'snacks').slice(0, 6),
    [products]
  );

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
                Results for "{searchQuery}"
              </h2>
              <span className="text-xs bg-primary-light text-primary font-bold px-2.5 py-0.5 rounded-full ml-1">
                {searchResults.length} {searchResults.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              Clear Search
            </button>
          </div>

          {searchResults.length === 0 ? (
            <div className="py-16 bg-surface rounded-3xl border border-border text-center p-6 shadow-subtle">
              <Search className="w-12 h-12 text-text-muted mx-auto mb-3" />
              <h3 className="text-lg font-black text-text-primary mb-1">
                No items found matching "{searchQuery}"
              </h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto mb-6">
                Try searching for atta, milk, bread, butter, eggs, chips or cold drinks.
              </p>
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="bg-primary hover:bg-primary-dark text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                View All Products
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

          {/* 5. Quick Delivery Section */}
          <ProductSection
            id="quick-delivery"
            title={t('sections.quickDelivery')}
            subtitle={t('sections.quickDeliverySub')}
            icon={Zap}
            products={quickProducts}
            onViewAll={() => navigate('/category/quick-delivery')}
          />

          {/* 6. Under ₹99 Store Section (Warm Cream Surface with Golden Accent) */}
          <ProductSection
            id="under-99"
            title={t('sections.under99')}
            subtitle={t('sections.under99Sub')}
            icon={Tag}
            products={under99Products}
            isWarmSection={true}
            onViewAll={() => navigate('/category/snacks')}
          />

          {/* 7. Dairy, Bread & Eggs Section */}
          <ProductSection
            id="dairy-section"
            title={t('sections.dairy')}
            subtitle={t('sections.dairySub')}
            icon={Milk}
            products={dairyProducts}
            onViewAll={() => navigate('/category/dairy-eggs')}
          />

          {/* 8. Munchies & Snacks Section */}
          <ProductSection
            id="snacks-section"
            title={t('sections.snacks')}
            subtitle={t('sections.snacksSub')}
            icon={Cookie}
            products={snacksProducts}
            onViewAll={() => navigate('/category/snacks')}
          />
        </>
      )}
    </div>
  );
}
