import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export function RequireAuth({ admin = false, children }) {
  const { user } = useAuth(), location = useLocation();
  if (!user || (admin && user.role !== 'admin')) return <Navigate to={admin ? '/admin/login' : '/login'} state={{ from: location }} replace />;
  return children;
}
