import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';
const Context = createContext();
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null), [loading, setLoading] = useState(true), [error, setError] = useState('');
  const [pendingAction, setPendingAction] = useState(null);
  const load = async () => { try { setUser((await api('/auth/me')).user); setLoading(false); setError(''); } catch(e) { setError(e.message); } };
  useEffect(() => { localStorage.removeItem('alkabeer_user_auth'); load(); }, []);
  const login = async credentials => { const result = await api('/auth/' + (credentials.mode === 'signup' ? 'register' : 'login'), { method: 'POST', body: credentials }); setUser(result.user); return result.user; };
  const logout = async () => { await api('/auth/logout', { method: 'POST', body: {} }); setUser(null); setPendingAction(null); };
  const updateProfile = async data => { const result = await api('/account', { method: 'PATCH', body: data }); setUser(result.user); return result.user; };
  const saveAddresses = async items => { const result = await api('/account/addresses', { method: 'PUT', body: { items } }); setUser(result.user); return result.user.addresses; };
  if (loading) return <div className="p-12 text-center" role="status">{error || 'Loading your session…'}{error && <button onClick={load}>Retry</button>}</div>;
  return <Context.Provider value={{ user, isAuthenticated: !!user, login, logout, updateProfile, saveAddresses, pendingAction, setPendingAction, clearPendingAction: () => setPendingAction(null) }}>{children}</Context.Provider>;
}
export const useAuth = () => useContext(Context);
