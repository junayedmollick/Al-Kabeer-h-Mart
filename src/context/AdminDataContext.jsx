import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
const Context = createContext();
export function AdminDataProvider({ children }) {
  const [data, setData] = useState(null), [error, setError] = useState('');
  const refreshAdmin = useCallback(async () => { try { setData(await api('/admin/data')); setError(''); } catch(e) { setError(e.message); } }, []);
  useEffect(() => { refreshAdmin(); const id = setInterval(refreshAdmin, 10000); return () => clearInterval(id); }, [refreshAdmin]);
  if (!data) return <div className="p-12" role="status">{error || 'Loading administration…'}{error && <button onClick={refreshAdmin}>Retry</button>}</div>;
  return <Context.Provider value={{ ...data, refreshAdmin }}>{error && <div role="alert" className="p-3 bg-red-50 text-red-700">{error}</div>}{children}</Context.Provider>;
}
export const useAdminData = () => useContext(Context);
