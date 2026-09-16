import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Zap, ShoppingBag, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export function ProductCard({ product }) {
  const { getItemQuantity, addToCart, removeFromCart } = useCart();
  const { isAuthenticated, setPendingAction } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const outOfStock = product.stock <= 0;
  const quantity = getItemQuantity(product.id);

  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;

  const handleDirectOrder = (e) => {
    e.stopPropagation();
    if (outOfStock) return;
    if (!isAuthenticated) {
      setPendingAction({
        type: 'direct_order',
        product,
        quantity: 1,
      });
      navigate('/login', {
        state: { from: { pathname: '/checkout' } },
      });
    } else {
      navigate('/checkout', {
        state: {
          source: 'direct',
          product,
          quantity: 1,
        },
      });
    }
  };

  return (
    <div className="group relative bg-surface rounded-2xl border border-border/70 hover:border-primary/50 p-2.5 sm:p-3 flex flex-col justify-between shadow-2xs hover:shadow-card transition-all duration-300 hover:-translate-y-1 h-full select-none overflow-hidden">
      
      {/* Top Media Area: Clean studio surface with smooth hover zoom */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#F8F9FA] p-2 sm:p-2.5 mb-2 sm:mb-2.5 flex items-center justify-center border border-border/30 group-hover:bg-[#F2F5F3] transition-colors duration-300">
        {imgError ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-text-muted bg-surface-soft/80 rounded-lg p-2">
            <Package className="w-7 h-7 text-primary/40 stroke-[1.5] mb-1" />
            <span className="text-[10px] font-bold text-text-muted text-center line-clamp-1">{product.name}</span>
          </div>
        ) : (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-106 transition-transform duration-300 drop-shadow-xs"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}

        {/* Top Badges: Discount or Special Tag */}
        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 items-start z-10 pointer-events-none">
          {discountPercent > 0 ? (
            <span className="bg-primary text-white text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-md shadow-2xs tracking-wider">
              {discountPercent}% {t('product.off')}
            </span>
          ) : product.tag ? (
            <span className="bg-secondary text-gray-950 text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-md shadow-2xs tracking-wider">
              {product.tag}
            </span>
          ) : null}
        </div>

        {/* Delivery Time Pill: Modern Frosted Glass Badge */}
        <div className="absolute bottom-1.5 left-1.5 bg-gray-950/75 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs z-10 pointer-events-none border border-white/10">
          <Zap className="w-2.5 h-2.5 text-secondary fill-secondary shrink-0" />
          <span className="tracking-tight">{product.deliveryTime || t('product.tenMin')}</span>
        </div>
      </div>

      {/* Product Information */}
      <div className="flex flex-col flex-grow">
        {/* Weight / Pack Size */}
        <span className="text-[10px] sm:text-[11px] font-bold text-text-secondary tracking-tight block mb-0.5 uppercase">
          {product.weight}
        </span>

        {/* Product Title */}
        <h4
          className="text-xs sm:text-[13px] font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-1.5 min-h-[32px] sm:min-h-[36px]"
          title={product.name}
        >
          {product.name}
        </h4>
      </div>

      {/* Price & Action Suite */}
      <div className="mt-auto">
        {/* Row 1: Price Details & Quick ADD Stepper */}
        <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-1.5">
          {/* Price */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-baseline gap-1">
              <span className="text-sm sm:text-base font-black text-text-primary tracking-tight">
                ₹{product.price}
              </span>
              {product.oldPrice && product.oldPrice > product.price && (
                <span className="text-[10px] sm:text-[11px] font-medium text-text-muted line-through">
                  ₹{product.oldPrice}
                </span>
              )}
            </div>
            {discountPercent > 0 && (
              <span className="text-[9px] font-bold text-success leading-none mt-0.5 truncate">
                {t('product.save')} ₹{product.oldPrice - product.price}
              </span>
            )}
          </div>

          {/* Quick ADD Button / Active Stepper */}
          <div className="shrink-0">
            {quantity === 0 ? (
              <button
                type="button"
                disabled={outOfStock || quantity >= product.stock} onClick={() => addToCart(product)}
                className="h-7 sm:h-8 px-3 sm:px-3.5 bg-primary-light hover:bg-primary text-primary hover:text-white border border-primary/50 hover:border-primary font-black text-[11px] sm:text-xs rounded-xl shadow-2xs transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer select-none active:scale-95"
                aria-label={`Add ${product.name} to cart`}
                title={outOfStock ? 'Out of stock' : t('product.add')}
              >
                <span>{outOfStock ? 'Out of stock' : t('product.add')}</span>
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            ) : (
              <div className="h-7 sm:h-8 flex items-center bg-primary text-white rounded-xl shadow-xs px-1 border border-primary-dark">
                <button
                  type="button"
                  onClick={() => removeFromCart(product.id)}
                  className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center hover:bg-primary-dark rounded-lg transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
                <span className="text-xs font-black px-1.5 min-w-[18px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={outOfStock || quantity >= product.stock} onClick={() => addToCart(product)}
                  className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center hover:bg-primary-dark rounded-lg transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Sleek 1-Click Instant Order Now Bar */}
        <button
          type="button"
          disabled={outOfStock} onClick={handleDirectOrder}
          className="w-full h-8 mt-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white text-[10px] sm:text-[11px] font-black rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer select-none tracking-wide uppercase"
          aria-label={`Order ${product.name} directly`}
          title={t('product.orderNow')}
        >
          <ShoppingBag className="w-3 h-3 shrink-0" />
          <span>{outOfStock ? 'Out of stock' : t('product.orderNow')}</span>
        </button>
      </div>

    </div>
  );
}
