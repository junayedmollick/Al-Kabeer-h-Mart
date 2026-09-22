import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export function ProductCard({ product }) {
  const { getItemQuantity, addToCart, removeFromCart } = useCart();
  const { t } = useLanguage();
  const [imageError, setImageError] = useState(false);
  const quantity = getItemQuantity(product.id);
  const unavailable = product.stock <= 0 || product.pricePending || product.price <= 0;
  const discount = !product.pricePending && product.oldPrice > product.price ? Math.round((1-product.price/product.oldPrice)*100) : 0;
  return <article className="relative h-full min-w-0 flex flex-col bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
    <Link to={'/product/'+encodeURIComponent(product.id)} className="block p-3 pb-2 focus-visible:outline-primary" aria-label={'View '+product.name}>
      <div className="relative aspect-square bg-white rounded-xl flex items-center justify-center">
        {imageError ? <Package className="text-text-muted" size={48}/> : <img src={product.image} alt={product.name} loading="lazy" onError={()=>setImageError(true)} className="w-full h-full object-contain"/>}
      </div>
      <div className="mt-3 text-[10px] sm:text-xs text-text-secondary min-h-4">{product.weight || t('productDetail.packDetailsOnLabel') || 'Pack details on label'}</div>
      <h3 className="mt-1 font-bold text-sm leading-5 line-clamp-2 min-h-10 text-text-primary">{product.name}</h3>
    </Link>
    <div className="px-3 pb-3 mt-auto">
      <div className="min-h-14 py-2 border-t border-border/60">
        {product.pricePending || product.price<=0 ? <p className="text-xs text-text-secondary font-medium">{t('productDetail.priceComingSoon')}</p> : <>
          <div className="flex flex-wrap items-baseline gap-x-2"><strong className="text-lg tracking-tight">₹{product.price}</strong>{discount>0 && <del className="text-xs text-text-muted">₹{product.oldPrice}</del>}</div>
          {discount>0 && <p className="text-[10px] font-semibold text-primary">{discount}% {t('product.off')} · {t('product.save')} ₹{Number((product.oldPrice-product.price).toFixed(2))}</p>}
        </>}
      </div>
      {unavailable ? <div className="min-h-10 rounded-xl bg-surface-soft text-text-secondary text-xs font-semibold flex items-center justify-center px-2 text-center">{t('productDetail.outOfStock')}</div> : quantity===0 ?
        <button onClick={()=>addToCart(product)} className="w-full h-10 rounded-xl border border-primary/30 bg-primary-light text-primary font-bold text-sm flex items-center justify-center gap-2" aria-label={'Add '+product.name+' to cart'}>{t('product.add')} <Plus size={16}/></button> :
        <div className="w-full h-10 rounded-xl bg-primary text-white flex items-center justify-between px-1">
          <button className="w-10 h-10 flex items-center justify-center" onClick={()=>removeFromCart(product.id)} aria-label={'Decrease '+product.name+' quantity'}><Minus size={16}/></button>
          <span className="text-sm font-bold" aria-live="polite">{quantity}</span>
          <button className="w-10 h-10 flex items-center justify-center disabled:opacity-40" disabled={quantity>=product.stock} onClick={()=>addToCart(product)} aria-label={'Increase '+product.name+' quantity'}><Plus size={16}/></button>
        </div>}
    </div>
  </article>;
}
