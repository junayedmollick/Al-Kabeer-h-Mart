import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { categories as defaultCategories } from '../data/categories';
import { products as defaultProducts } from '../data/products';
import { storeSettings as defaultStoreSettings } from '../admin/data/adminMockData';

const initialSettings = {
  ...defaultStoreSettings,
  deliveryFee: 10,
  minimumOrder: 0,
  servicePincodes: ['712701'],
  acceptingOrders: true,
  checkoutPaymentMode: 'online',
  onlinePaymentsEnabled: false,
  paymentTestMode: false,
};

const initialCatalog = {
  categories: defaultCategories,
  products: defaultProducts,
  settings: initialSettings,
  storeSettings: initialSettings,
};

const Context = createContext();

export function CatalogProvider({ children }) {
  const [data, setData] = useState(initialCatalog);
  const [error, setError] = useState('');

  const refreshCatalog = useCallback(async () => {
    try {
      // 1. Attempt to fetch from Supabase if configured and tables exist
      if (isSupabaseConfigured && supabase) {
        try {
          const [catRes, prodRes, settingsRes] = await Promise.all([
            supabase.from('categories').select('*').eq('archived', false),
            supabase.from('products').select('*').eq('archived', false),
            supabase.from('store_settings').select('*').eq('id', 1).maybeSingle(),
          ]);

          if (!catRes.error && !prodRes.error && catRes.data && catRes.data.length > 0) {
            const categories = catRes.data.map(c => ({
              id: c.id,
              slug: c.slug,
              name: c.name,
              bengaliName: c.bengali_name,
              hindiName: c.hindi_name,
              shortDesc: c.short_desc,
              tagline: c.tagline,
              image: c.image,
              iconName: c.icon_name || 'ShoppingBag',
              bannerGradient: c.banner_gradient,
              subcategories: c.subcategories || [],
            }));

            const products = (prodRes.data || []).map(p => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              category: p.category,
              price: Number(p.price) || 0,
              oldPrice: p.old_price ? Number(p.old_price) : null,
              stock: Number(p.stock) || 0,
              weight: p.weight,
              description: p.description,
              images: Array.isArray(p.images) ? p.images : (p.images ? [p.images] : []),
              image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null,
              pricePending: Boolean(p.price_pending),
              revision: p.revision,
            }));

            const storeSettings = {
              ...initialSettings,
              deliveryFee: Number(settingsRes.data?.delivery_fee) || 10,
              minimumOrder: Number(settingsRes.data?.minimum_order) || 0,
              servicePincodes: settingsRes.data?.service_pincodes || ['712701'],
              acceptingOrders: settingsRes.data?.accepting_orders !== false,
              ...(settingsRes.data?.store_details || {}),
            };

            setData({ categories, products, settings: storeSettings, storeSettings });
            setError('');
            return;
          }
        } catch {
          // Fall back gracefully to backend API or default catalog below
        }
      }

      // 2. Standard backend API fetch
      try {
        const catalogData = await api('/catalog');
        if (catalogData && catalogData.products && catalogData.categories) {
          const settings = {
            ...initialSettings,
            ...(catalogData.settings || {}),
          };
          setData({
            ...catalogData,
            settings,
            storeSettings: settings,
          });
          setError('');
          return;
        }
      } catch {
        // Fall back gracefully to built-in catalog data
      }
    } catch (e) {
      console.warn('Catalog refresh notice:', e.message);
    }
  }, []);

  useEffect(() => {
    refreshCatalog();
    const id = setInterval(refreshCatalog, 20000);
    window.addEventListener('focus', refreshCatalog);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', refreshCatalog);
    };
  }, [refreshCatalog]);

  if (!data) {
    return (
      <div className="p-12 text-center" role="status">
        {error || 'Loading store…'}
        {error && (
          <button className="block mx-auto mt-4 text-primary font-bold" onClick={refreshCatalog}>
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <Context.Provider
      value={{
        ...data,
        settings: data.settings || initialSettings,
        storeSettings: data.storeSettings || data.settings || initialSettings,
        shopCategories: (data.categories || []).filter(c => c.slug !== 'for-you'),
        refreshCatalog,
      }}
    >
      {error && (
        <div role="alert" className="p-3 bg-red-50 text-red-700 text-center">
          {error} <button onClick={refreshCatalog} className="font-bold underline ml-2">Retry</button>
        </div>
      )}
      {children}
    </Context.Provider>
  );
}

export const useCatalog = () => useContext(Context);
