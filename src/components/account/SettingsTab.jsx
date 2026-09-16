import React from 'react';
import { PasswordForm } from './PasswordForm';
import { useCatalog } from '../../context/CatalogContext';
import { useAuth } from '../../context/AuthContext';
export function SettingsTab() { const { settings } = useCatalog(), { user } = useAuth(); return <div className="space-y-6"><section className="bg-surface p-6 border border-border rounded-2xl"><h2 className="text-xl font-bold">Account settings</h2><p className="my-3 text-sm">Sign-in identifier: {user.identifier}</p><p className="text-sm">Order updates are available in My Orders.</p><a className="text-primary inline-block mt-4" href={'tel:' + settings.phone}>Call {settings.storeName}: {settings.phone}</a></section><PasswordForm/></div>; }
