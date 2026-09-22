import React, { createContext, useContext, useState, useEffect } from 'react';

import { useCatalog } from './CatalogContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { products, settings } = useCatalog();
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('alkabeer_cart');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.filter(i => i && i.id !== undefined && Number.isInteger(i.quantity) && i.quantity > 0 && Number.isFinite(i.price)) : [];
    } catch {
      return [];
    }
  });

  const isVip = false;
  const vipMember = null;
  const setIsVip = () => {};
  const setVipMember = () => {};

  useEffect(() => {
    try {
      localStorage.setItem('alkabeer_cart', JSON.stringify(cart));
    } catch {
      // Ignore storage errors
    }
  }, [cart]);

  const addToCart = (item) => {
    const product = products.find(p => String(p.id) === String(item.id));
    if (!product || product.stock <= 0 || product.pricePending || product.price <= 0 || product.archived) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: Math.min(product.stock, item.quantity + 1) } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev.filter((item) => item.id !== productId);
    });
  };

  const deleteFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getItemQuantity = (productId) => {
    const item = cart.find((i) => i.id === productId);
    return item ? item.quantity : 0;
  };

  useEffect(() => { setCart(prev => prev.filter(item=>products.some(p=>String(p.id)===String(item.id))).map(item => { const p = products.find(p => String(p.id) === String(item.id)); return p ? { ...item, ...p } : { ...item, stock: 0 }; })); }, [products]);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = cart.length === 0 ? 0 : settings.deliveryFee;
  const cartTotal = cartSubtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        deleteFromCart,
        clearCart,
        getItemQuantity,
        itemCount,
        cartSubtotal,
        deliveryFee,
        cartTotal,
        isVip,
        setIsVip,
        vipMember,
        setVipMember,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
