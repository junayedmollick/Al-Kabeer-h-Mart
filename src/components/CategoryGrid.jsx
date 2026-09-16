import { useCatalog } from '../context/CatalogContext';
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function CategoryGrid() {
  const { shopCategories } = useCatalog();
  const { t, language } = useLanguage();

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0"></span>
            <h2 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight truncate">
              {t('sections.shopCategory')}
            </h2>
          </div>
          <p className="text-xs text-text-secondary mt-0.5 font-medium truncate sm:whitespace-normal">
            {t('sections.shopCategorySub')}
          </p>
        </div>

        <Link
          to="/category/dairy-eggs"
          className="text-xs font-bold text-primary hover:text-primary-dark inline-flex items-center gap-1 hover:underline cursor-pointer shrink-0 whitespace-nowrap ml-2"
        >
          <span className="whitespace-nowrap">{t('sections.viewAll')}</span>
          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
        </Link>
      </div>

      {/* Grid of Category Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        {shopCategories.map((item) => {
          const displayName =
            language === 'bn' && item.bengaliName ? item.bengaliName : item.name;

          return (
            <Link
              key={item.id}
              to={`/category/${item.slug}`}
              className="group bg-surface rounded-2xl border border-border/80 p-3 hover:border-primary hover:shadow-card interactive-lift cursor-pointer flex flex-col items-center text-center transition-all"
            >
              {/* Image Container */}
              <div className="w-full aspect-square rounded-xl overflow-hidden mb-2.5 relative flex items-center justify-center bg-surface-soft">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
              </div>

              {/* Category Details */}
              <h3 className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                {displayName}
              </h3>
              <span className="text-[10px] text-text-muted mt-1 font-semibold">
                {item.shortDesc}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
