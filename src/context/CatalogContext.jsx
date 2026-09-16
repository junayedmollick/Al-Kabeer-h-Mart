import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
const Context = createContext();
export function CatalogProvider({ children }) {
  const [data, setData] = useState(null), [error, setError] = useState('');
  const refreshCatalog = useCallback(async () => { try { setData(await api('/catalog')); setError(''); } catch(e) { setError(e.message); } }, []);
  useEffect(() => { refreshCatalog(); const id = setInterval(refreshCatalog, 15000); window.addEventListener('focus', refreshCatalog); return () => { clearInterval(id); window.removeEventListener('focus', refreshCatalog); }; }, [refreshCatalog]);
  if (!data) return <div className="p-12 text-center" role="status">{error || 'Loading store…'}{error && <button className="block mx-auto mt-4 text-primary" onClick={refreshCatalog}>Retry</button>}</div>;
  return <Context.Provider value={{ ...data, shopCategories: data.categories.filter(c => c.slug !== 'for-you'), refreshCatalog }}>{error && <div role="alert" className="p-3 bg-red-50 text-red-700 text-center">{error} <button onClick={refreshCatalog}>Retry</button></div>}{children}</Context.Provider>;
}
export const useCatalog = () => useContext(Context);
