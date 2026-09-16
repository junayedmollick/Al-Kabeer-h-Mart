import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';
import { useCatalog } from './CatalogContext';
const Context = createContext();
export function OrderProvider({ children }) {
  const { user } = useAuth(), { refreshCatalog } = useCatalog();
  const [result, setResult] = useState({ owner: null, orders: [] }), [error, setError] = useState('');
  const orders = result.owner === user?.id ? result.orders : [];
  const refreshOrders = useCallback(async () => {
    if (!user) { setResult({ owner: null, orders: [] }); setError(''); return; }
    try { const value = await api(user.role === 'admin' ? '/admin/data' : '/orders'); setResult({ owner: user.id, orders: user.role === 'admin' ? value.orders : value }); setError(''); } catch(e) { setError(e.message); }
  }, [user?.id, user?.role]);
  useEffect(() => { refreshOrders(); const id = setInterval(refreshOrders, 10000); return () => clearInterval(id); }, [refreshOrders]);
  const addOrder = async (body, key) => { const order = await api('/orders', { method: 'POST', body, headers: { 'Idempotency-Key': key } }); await Promise.all([refreshOrders(), refreshCatalog()]); return order; };
  const cancelOrder = async id => { const order = await api('/orders/' + encodeURIComponent(id) + '/cancel', { method: 'POST', body: {} }); await Promise.all([refreshOrders(), refreshCatalog()]); return order; };
  const updateOrderStatus = async (id, status) => { const order = await api('/admin/orders/' + encodeURIComponent(id) + '/status', { method: 'PATCH', body: { status } }); await Promise.all([refreshOrders(), refreshCatalog()]); return order; };
  return <Context.Provider value={{ orders, addOrder, cancelOrder, updateOrderStatus, refreshOrders, getOrder: id => orders.find(o => o.id === id) }}>{error && user && <div role="alert" className="p-3 bg-red-50 text-red-700">Orders: {error} <button onClick={refreshOrders}>Retry</button></div>}{children}</Context.Provider>;
}
export const useOrders = () => useContext(Context);
