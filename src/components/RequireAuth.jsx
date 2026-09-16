import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export function RequireAuth({ admin = false, children }) {
  const { user } = useAuth(), location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (admin && user.role !== 'admin') return <div className="p-12 text-center"><h1 className="text-2xl font-bold">Administrator access required</h1><p className="mt-3">Sign in with your store administrator account to manage this store.</p><a className="text-primary underline" href="/login">Sign in</a></div>;
  return children;
}
