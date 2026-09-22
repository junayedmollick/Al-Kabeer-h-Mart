import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useCatalog } from './CatalogContext';

const Context = createContext();

export function OrderProvider({ children }) {
  const { user } = useAuth(), { refreshCatalog, products } = useCatalog();
  const [result, setResult] = useState({ owner: null, orders: [] }), [error, setError] = useState('');
  const orders = result.owner === user?.id ? result.orders : [];

  const refreshOrders = useCallback(async () => {
    if (!user) { setResult({ owner: null, orders: [] }); setError(''); return; }
    try {
      const value = await api(user.role === 'admin' ? '/admin/data' : '/orders');
      setResult({ owner: user.id, orders: user.role === 'admin' ? value.orders : value });
      setError('');
    } catch (e) {
      try {
        if (isSupabaseConfigured && supabase) {
          const query = user.role === 'admin'
            ? supabase.from('orders').select('*').order('created_at', { ascending: false })
            : supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
          const { data, error: supaErr } = await query;
          if (!supaErr && data) {
            setResult({ owner: user.id, orders: data });
            setError('');
            return;
          }
        }
        const stored = JSON.parse(localStorage.getItem('alkabeer_orders') || '[]');
        setResult({ owner: user.id, orders: stored });
        setError('');
      } catch {
        setError(e.message);
      }
    }
  }, [user?.id, user?.role]);

  useEffect(() => {
    refreshOrders();
    const id = setInterval(refreshOrders, 10000);
    return () => clearInterval(id);
  }, [refreshOrders]);

  const addOrder = async (body, key) => {
    try {
      const order = await api('/orders', { method: 'POST', body, headers: { 'Idempotency-Key': key } });
      await Promise.all([refreshOrders(), refreshCatalog()]);
      return order;
    } catch {
      const fallbackOrder = {
        id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        createdAt: new Date().toISOString(),
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        deliveryAddress: body.deliveryAddress,
        pincode: body.pincode,
        paymentMethod: body.paymentMethod,
        paymentMode: 'preference',
        paymentStatus: 'Pending',
        status: 'Processing',
        items: (body.items || []).map(it => {
          const prod = (products || []).find(p => p.id === it.id);
          return {
            id: it.id,
            name: prod?.name || 'Item',
            price: prod?.price || 0,
            quantity: it.quantity,
            weight: prod?.weight || ''
          };
        }),
        subtotal: body.expectedTotal || 0,
        deliveryFee: 10,
        discount: 0,
        total: body.expectedTotal || 0,
        history: [{ status: 'Processing', at: new Date().toISOString() }],
      };

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('orders').insert({
            id: fallbackOrder.id,
            user_id: user?.id || null,
            request_key: key,
            status: 'Processing',
            items: fallbackOrder.items,
            customer_name: body.customerName,
            customer_phone: body.customerPhone,
            delivery_address: body.deliveryAddress,
            pincode: body.pincode,
            payment_method: body.paymentMethod,
            payment_status: 'Pending',
            subtotal: fallbackOrder.subtotal,
            delivery_fee: fallbackOrder.deliveryFee,
            discount: fallbackOrder.discount,
            total: fallbackOrder.total,
          });
        } catch {}
      }

      try {
        const stored = JSON.parse(localStorage.getItem('alkabeer_orders') || '[]');
        localStorage.setItem('alkabeer_orders', JSON.stringify([fallbackOrder, ...stored]));
      } catch {}

      await refreshOrders();
      return fallbackOrder;
    }
  };

  const cancelOrder = async id => {
    try {
      const order = await api('/orders/' + encodeURIComponent(id) + '/cancel', { method: 'POST', body: {} });
      await Promise.all([refreshOrders(), refreshCatalog()]);
      return order;
    } catch {
      try {
        const stored = JSON.parse(localStorage.getItem('alkabeer_orders') || '[]');
        const updated = stored.map(o => o.id === id ? { ...o, status: 'Cancelled', paymentStatus: 'Cancelled' } : o);
        localStorage.setItem('alkabeer_orders', JSON.stringify(updated));
        await refreshOrders();
      } catch {}
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      const order = await api('/admin/orders/' + encodeURIComponent(id) + '/status', { method: 'PATCH', body: { status } });
      await Promise.all([refreshOrders(), refreshCatalog()]);
      return order;
    } catch (e) {
      try {
        const stored = JSON.parse(localStorage.getItem('alkabeer_orders') || '[]');
        const updatedList = stored.map(o => o.id === id ? { ...o, status } : o);
        localStorage.setItem('alkabeer_orders', JSON.stringify(updatedList));
        await refreshOrders();
        return updatedList.find(o => o.id === id) || { id, status };
      } catch {
        throw e;
      }
    }
  };

  return (
    <Context.Provider value={{
      orders,
      addOrder,
      cancelOrder,
      updateOrderStatus,
      refreshOrders,
      getOrder: id => orders.find(o => o.id === id) || (JSON.parse(localStorage.getItem('alkabeer_orders') || '[]')).find(o => o.id === id)
    }}>
      {error && user && <div role="alert" className="p-3 bg-red-50 text-red-700">Orders: {error} <button onClick={refreshOrders}>Retry</button></div>}
      {children}
    </Context.Provider>
  );
}

export const useOrders = () => useContext(Context);
