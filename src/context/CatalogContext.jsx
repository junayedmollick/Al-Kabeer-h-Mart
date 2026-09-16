import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

const Context = createContext();

export function CatalogProvider({ children }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const refreshCatalog = useCallback(async () => {
    try {
      const catalog = await api('/catalog');
      setData(catalog);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    refreshCatalog();
    const id = setInterval(refreshCatalog, 15000);
    window.addEventListener('focus', refreshCatalog);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', refreshCatalog);
    };
  }, [refreshCatalog]);

  if (!data) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center" role="status">
        {error ? (
          <div className="max-w-md p-6 bg-red-50 border border-red-200 rounded-2xl shadow-xs">
            <div className="w-12 h-12 mx-auto mb-3 text-red-500 flex items-center justify-center rounded-full bg-red-100 font-bold text-xl">!</div>
            <h2 className="text-base font-bold text-red-900 mb-1">Store Connection Issue</h2>
            <p className="text-sm text-red-700 mb-4">{error}</p>
            <button
              className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold text-sm rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
              onClick={refreshCatalog}
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-text-muted">Loading store…</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <Context.Provider value={{ ...data, shopCategories: data.categories.filter(c => c.slug !== 'for-you'), refreshCatalog }}>
      {error && (
        <div role="alert" className="p-2.5 bg-red-50 border-b border-red-200 text-xs sm:text-sm text-red-700 text-center flex items-center justify-center gap-2">
          <span>{error}</span>
          <button onClick={refreshCatalog} className="font-bold underline cursor-pointer">Retry</button>
        </div>
      )}
      {children}
    </Context.Provider>
  );
}

export const useCatalog = () => useContext(Context);
