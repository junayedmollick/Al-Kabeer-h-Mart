import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCatalog } from '../context/CatalogContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ProductReviews } from '../components/ProductReviews';

export function ProductDetail() {
  const { id } = useParams();
  const { products, categories } = useCatalog();
  const { t } = useLanguage();
  const product = products.find((p) => String(p.id) === id);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-bold">{t('productDetail.unavailable')}</h1>
        <Link to="/" className="text-primary underline">
          {t('productDetail.backToStore')}
        </Link>
      </div>
    );
  }

  return (
    <ProductContent
      key={id}
      product={product}
      category={categories.find((c) => c.slug === product.category)}
    />
  );
}

function ProductContent({ product, category }) {
  const navigate = useNavigate();
  const { isAuthenticated, setPendingAction } = useAuth();
  const { addToCart, getItemQuantity } = useCart();
  const { t, language } = useLanguage();

  const [selected, setSelected] = useState(product.image);
  const [quantity, setQuantity] = useState(1);
  const images = [...new Set([product.image, ...(product.images || [])])].filter(Boolean);
  const unavailable = product.stock <= 0 || product.pricePending || product.price <= 0;

  const categoryDisplayName = category
    ? language === 'bn' && category.bengaliName
      ? category.bengaliName
      : language === 'hi' && category.hindiName
      ? category.hindiName
      : category.name
    : t('nav.categories');

  function buy() {
    if (unavailable) return;
    const count = Math.max(1, Math.min(quantity, product.stock));
    if (!isAuthenticated) {
      setPendingAction({ type: 'direct_order', product, quantity: count });
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout', { state: { source: 'direct', product, quantity: count } });
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumbs */}
      <nav className="text-sm text-text-secondary flex flex-wrap gap-2 mb-7">
        <Link to="/" className="hover:text-primary transition-colors">{t('nav.home')}</Link>
        <span>/</span>
        <Link to={'/category/' + product.category} className="hover:text-primary transition-colors">{categoryDisplayName}</Link>
        <span>/</span>
        <span className="text-text-primary font-semibold">{product.name}</span>
      </nav>

      {/* Main Product Card */}
      <section className="grid md:grid-cols-2 gap-7 lg:gap-12 bg-surface rounded-3xl p-5 sm:p-8 border border-border">
        <div>
          <div className="aspect-square bg-white rounded-2xl overflow-hidden border border-border/50 flex items-center justify-center p-0">
            <img src={selected} alt={product.name} className="w-full h-full object-contain" />
          </div>
          {images.length > 1 && (
            <div className="flex flex-wrap gap-3 mt-4">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setSelected(src)}
                  aria-label={'View photo ' + (i + 1)}
                  aria-pressed={selected === src}
                  className={`w-16 h-16 p-2 bg-white border rounded-xl cursor-pointer ${
                    selected === src ? 'border-primary ring-2 ring-primary/30' : 'border-border'
                  }`}
                >
                  <img src={src} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-sm text-primary font-semibold mb-1">{categoryDisplayName}</p>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{product.name}</h1>
          <a href="#reviews-section" className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-500 hover:text-amber-600 mt-2 transition-colors">
            <span className="text-amber-400 font-bold">★★★★★</span>
            <span className="text-text-secondary hover:underline">{t('productDetail.ratingsAndReviews')}</span>
          </a>
          {product.weight && <p className="text-text-secondary mt-3">{product.weight}</p>}

          <div className="py-6 my-4 border-y border-border">
            {product.pricePending || product.price <= 0 ? (
              <p className="font-semibold text-text-secondary">{t('productDetail.priceComingSoon')}</p>
            ) : (
              <>
                <div className="flex items-baseline gap-2">
                  <strong className="text-3xl font-black text-text-primary">₹{product.price}</strong>
                  {product.oldPrice > product.price && (
                    <del className="text-text-muted ml-1 text-sm font-semibold">₹{product.oldPrice}</del>
                  )}
                </div>
                <p className="text-xs text-text-secondary mt-2">{t('productDetail.deliveryChargesNote')}</p>
              </>
            )}
          </div>

          <p className={`text-sm font-semibold mb-5 ${unavailable ? 'text-text-secondary' : 'text-primary'}`}>
            {unavailable ? t('productDetail.outOfStock') : t('productDetail.inStock')}
          </p>

          {!unavailable && (
            <label className="text-sm font-bold text-text-secondary mb-4 flex items-center">
              <span>{t('productDetail.quantity')}</span>
              <input
                aria-label={t('productDetail.quantity')}
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(Number(e.target.value) || 1, product.stock)))}
                className="ml-3 w-20 p-2 border border-border rounded-xl bg-surface-soft text-text-primary text-center font-bold"
              />
            </label>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={unavailable || getItemQuantity(product.id) >= product.stock}
              onClick={() => addToCart(product)}
              className="flex-1 min-w-32 rounded-xl py-3 px-4 border border-primary text-primary font-bold disabled:opacity-40 hover:bg-primary-light transition-colors cursor-pointer"
            >
              {getItemQuantity(product.id) > 0
                ? `${t('productDetail.addOneMore')} (${getItemQuantity(product.id)} ${t('productDetail.inCart')})`
                : t('productDetail.addToCart')}
            </button>
            <button
              type="button"
              disabled={unavailable}
              onClick={buy}
              className="flex-1 min-w-32 rounded-xl py-3 px-4 bg-primary text-white font-bold disabled:opacity-40 hover:bg-primary-dark transition-colors cursor-pointer"
            >
              {t('productDetail.buyNow')}
            </button>
          </div>

          <p className="text-xs text-text-secondary mt-5">{t('productDetail.paymentNote')}</p>
        </div>
      </section>

      {/* About this product */}
      <section className="mt-7 p-6 sm:p-8 bg-surface border border-border rounded-2xl">
        <h2 className="text-xl font-bold mb-3">{t('productDetail.aboutProduct')}</h2>
        <p className="text-sm text-text-secondary leading-7 whitespace-pre-wrap">
          {product.description || `${product.name} ${t('productDetail.defaultDesc')}`}
        </p>
        <dl className="mt-5 grid sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-text-secondary">{t('productDetail.category')}</dt>
            <dd className="font-semibold text-text-primary">{categoryDisplayName}</dd>
          </div>
          {product.subcategory && (
            <div>
              <dt className="text-text-secondary">{t('productDetail.productType')}</dt>
              <dd className="font-semibold text-text-primary">{product.subcategory}</dd>
            </div>
          )}
        </dl>
      </section>

      {/* Customer Ratings & Reviews */}
      <div id="reviews-section">
        <ProductReviews key={product.id} productId={product.id} />
      </div>
    </div>
  );
}
