import { useCatalog } from '../context/CatalogContext';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

export function SearchBar({ searchQuery, onSearchChange, isMobile = false }) {
  const { products } = useCatalog();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const trendingSearches = useMemo(() => {
    if (!products || products.length === 0) {
      return ['Milk', 'Bread', 'Mustard Oil', 'Atta', 'Chips', 'Eggs'];
    }
    const highlighted = products.filter(
      (p) => (p.stock ?? 20) > 0 && (p.tag === 'Best Seller' || p.tag === 'Popular' || p.tag === 'Essential')
    );
    const pool = highlighted.length >= 6 ? highlighted : products.filter((p) => (p.stock ?? 20) > 0);
    const names = (pool.length > 0 ? pool : products).slice(0, 12).map((p) => {
      return p.name.split(' - ')[0].split(' (')[0].trim();
    });
    return Array.from(new Set(names)).slice(0, 6);
  }, [products]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const matchedProducts = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const handleSelectSearch = (term) => {
    onSearchChange(term);
    setIsOpen(false);
    navigate('/');
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input Field */}
      <div className="relative w-full flex items-center">
        <Search className="w-4 h-4 text-text-muted absolute left-4 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={
            isMobile
              ? t('nav.mobileSearchPlaceholder')
              : t('nav.searchPlaceholder')
          }
          className={`w-full ${
            isMobile ? 'h-10 pl-9 pr-8 text-xs' : 'h-11 pl-11 pr-10 text-sm'
          } bg-surface-soft border border-border focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary-light/50 rounded-xl font-medium text-text-primary placeholder:text-text-muted outline-hidden transition-all`}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              onSearchChange('');
              setIsOpen(false);
            }}
            className="absolute right-3 text-text-muted hover:text-text-primary p-1 cursor-pointer"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete / Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface rounded-2xl shadow-xl border border-border z-50 overflow-hidden animate-fade-in text-left">
          
          {/* Recent & Trending Tags */}
          <div className="p-3.5 border-b border-border/70 bg-surface-soft/40">
            <div className="text-[11px] font-black uppercase text-text-muted tracking-wider flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              <span>{t('search.trending')}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {trendingSearches.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSearch(item)}
                  className="px-2.5 py-1 bg-surface hover:bg-primary-light hover:text-primary border border-border/80 rounded-lg text-xs font-semibold text-text-secondary transition-colors cursor-pointer"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Matched Products Preview */}
          {matchedProducts.length > 0 && (
            <div className="p-2 space-y-1">
              <div className="px-2 pt-1 text-[11px] font-black uppercase text-text-muted tracking-wider">
                {t('search.matching')}
              </div>
              {matchedProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="p-2 rounded-xl hover:bg-surface-soft flex items-center justify-between gap-3 transition-colors group cursor-pointer"
                  onClick={() => {
                    handleSelectSearch(prod.name);
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-9 h-9 rounded-lg object-contain bg-surface p-0.5 shrink-0 border border-border/60"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors truncate">
                        {prod.name}
                      </div>
                      <div className="text-[10px] text-text-muted">
                        {prod.weight} • ₹{prod.price}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(prod);
                    }}
                    className="px-2.5 py-1 bg-primary-light hover:bg-primary text-primary hover:text-white rounded-lg text-xs font-black transition-colors shrink-0 cursor-pointer"
                  >
                    {t('product.add')}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* View Full Catalog Link */}
          <div className="p-2.5 bg-surface-soft border-t border-border flex justify-between items-center text-xs">
            <span className="text-text-muted">{t('brand.deliveryTime')}</span>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/');
              }}
              className="text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{t('sections.viewAll')}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
