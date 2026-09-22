import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';
import { supabase, isSupabaseConfigured, uploadAvatarImage } from '../lib/supabase';

const Context = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingAction, setPendingAction] = useState(null);

  const load = async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          const authUser = {
            id: session.user.id,
            email: session.user.email,
            name: profile?.name || session.user.user_metadata?.name || session.user.email?.split('@')[0],
            phone: profile?.phone || session.user.user_metadata?.phone || '',
            role: profile?.role || session.user.user_metadata?.role || 'customer',
            avatarUrl: profile?.avatar_url || null,
            addresses: profile?.addresses || [],
          };
          setUser(authUser);
          setLoading(false);
          setError('');
          return;
        }
      }

      // Check stored admin session (for static deployments or offline admin access)
      const savedAdmin = localStorage.getItem('alkabeer_admin_session') || sessionStorage.getItem('alkabeer_admin_session');
      if (savedAdmin) {
        try {
          const parsed = JSON.parse(savedAdmin);
          if (parsed && parsed.role === 'admin') {
            setUser(parsed);
            setLoading(false);
            setError('');
            return;
          }
        } catch {}
      }

      // Fallback to store API session
      const res = await api('/auth/me');
      setUser(res.user);
      setLoading(false);
      setError('');
    } catch {
      setUser(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    localStorage.removeItem('alkabeer_user_auth');
    load();

    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          load();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      });
      return () => subscription?.unsubscribe?.();
    }
  }, []);

  const login = async credentials => {
    // 1. Admin login handling
    if (credentials.mode === 'admin') {
      const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL || 'admin@alkabeerhmart.com').trim().toLowerCase();
      const adminDefaultPass = import.meta.env.VITE_ADMIN_PASSWORD || 'alrKBVHWxQPBGr2dugSPfRdl';
      const customPass = localStorage.getItem('alkabeer_admin_custom_password');
      const inputId = (credentials.identifier || '').trim().toLowerCase();
      const inputPass = credentials.password || '';

      // Try Supabase auth first if configured
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
            email: inputId,
            password: inputPass,
          });
          if (!signInErr && signInData?.user) {
            await load();
            return user;
          }
        } catch {}
      }

      // Try store API backend
      try {
        const result = await api('/auth/admin/login', {
          method: 'POST',
          body: credentials,
        });
        if (result?.user) {
          const storage = credentials.rememberMe !== false ? localStorage : sessionStorage;
          storage.setItem('alkabeer_admin_session', JSON.stringify(result.user));
          setUser(result.user);
          return result.user;
        }
      } catch (apiErr) {
        // Fallback for static hosting (e.g. Vercel) where API is offline/HTML SPA rewrite
        const isEmailMatch = inputId === adminEmail || inputId === 'admin';
        const isPassMatch = inputPass === adminDefaultPass || (customPass && inputPass === customPass);

        if (isEmailMatch && isPassMatch) {
          const adminUser = {
            id: '70e3c10d-4f5a-4c54-9118-d49597eff531',
            email: adminEmail,
            identifier: adminEmail,
            name: 'Store Administrator',
            role: 'admin',
          };
          const storage = credentials.rememberMe !== false ? localStorage : sessionStorage;
          storage.setItem('alkabeer_admin_session', JSON.stringify(adminUser));
          setUser(adminUser);
          return adminUser;
        } else {
          throw new Error('Incorrect email/phone or password');
        }
      }
    }

    // 2. Customer login / signup
    if (isSupabaseConfigured && supabase) {
      if (credentials.mode === 'signup') {
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email: credentials.identifier,
          password: credentials.password,
          options: {
            data: {
              name: credentials.name || credentials.identifier.split('@')[0],
              role: 'customer',
            },
          },
        });
        if (signUpErr) throw new Error(signUpErr.message);
        if (data?.user) {
          const newUser = {
            id: data.user.id,
            email: data.user.email,
            name: credentials.name || data.user.email.split('@')[0],
            role: 'customer',
            addresses: [],
          };
          setUser(newUser);
          return newUser;
        }
      } else {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: credentials.identifier,
          password: credentials.password,
        });
        if (signInErr) throw new Error(signInErr.message);
        await load();
        return user;
      }
    }

    // Default customer login via store API
    const result = await api('/auth/' + (credentials.mode === 'signup' ? 'register' : 'login'), {
      method: 'POST',
      body: credentials,
    });
    setUser(result.user);
    return result.user;
  };

  const logout = async () => {
    localStorage.removeItem('alkabeer_admin_session');
    sessionStorage.removeItem('alkabeer_admin_session');
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    try {
      await api('/auth/logout', { method: 'POST', body: {} });
    } catch {}
    setUser(null);
    setPendingAction(null);
  };

  const updateProfile = async data => {
    if (isSupabaseConfigured && supabase && user) {
      await supabase
        .from('profiles')
        .update({
          name: data.name,
          phone: data.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
    }
    const result = await api('/account', { method: 'PATCH', body: data });
    setUser(result.user);
    return result.user;
  };

  const updateAvatar = async image => {
    if (isSupabaseConfigured && supabase && user && image) {
      try {
        const publicUrl = await uploadAvatarImage(user.id, image);
        await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
          .eq('id', user.id);
        setUser(u => ({ ...u, avatarUrl: publicUrl }));
      } catch (err) {
        console.warn('Supabase avatar upload notice:', err.message);
      }
    }
    const result = await api('/account/avatar', {
      method: image ? 'PUT' : 'DELETE',
      body: image ? { image } : undefined,
    });
    setUser(result.user);
    return result.user;
  };

  const saveAddresses = async items => {
    if (isSupabaseConfigured && supabase && user) {
      await supabase
        .from('profiles')
        .update({ addresses: items, updated_at: new Date().toISOString() })
        .eq('id', user.id);
    }
    const result = await api('/account/addresses', { method: 'PUT', body: { items } });
    setUser(result.user);
    return result.user.addresses;
  };

  if (loading) {
    return (
      <div className="p-12 text-center" role="status">
        {error || 'Loading your session…'}
        {error && <button onClick={load} className="block mx-auto mt-3 text-primary font-bold">Retry</button>}
      </div>
    );
  }

  return (
    <Context.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updateProfile,
        updateAvatar,
        saveAddresses,
        pendingAction,
        setPendingAction,
        clearPendingAction: () => setPendingAction(null),
      }}
    >
      {children}
    </Context.Provider>
  );
}

export const useAuth = () => useContext(Context);
