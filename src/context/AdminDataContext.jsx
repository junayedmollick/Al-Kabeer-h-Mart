import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { initialCustomers, initialPromotions, storeSettings } from '../admin/data/adminMockData';

const Context = createContext();

const defaultFullSettings = {
  ...storeSettings,
  deliveryFee: 10,
  minimumOrder: 0,
  servicePincodes: ['712701'],
  acceptingOrders: true,
  checkoutPaymentMode: 'online',
  onlinePaymentsEnabled: false,
  paymentTestMode: false,
};

export function AdminDataProvider({ children }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const refreshAdmin = useCallback(async () => {
    try {
      const serverData = await api('/admin/data');
      setData({
        ...serverData,
        settings: {
          ...defaultFullSettings,
          ...(serverData?.settings || {}),
          servicePincodes: Array.isArray(serverData?.settings?.servicePincodes)
            ? serverData.settings.servicePincodes
            : defaultFullSettings.servicePincodes,
        },
      });
      setError('');
    } catch (e) {
      // Graceful fallback for static hosting (e.g. Vercel) or offline
      try {
        const storedOrders = JSON.parse(localStorage.getItem('alkabeer_orders') || '[]');
        const storedCustomers = JSON.parse(localStorage.getItem('alkabeer_customers') || 'null') || initialCustomers;
        const storedPromos = JSON.parse(localStorage.getItem('alkabeer_promotions') || 'null') || initialPromotions;
        const customSettings = JSON.parse(localStorage.getItem('alkabeer_settings') || 'null') || {};
        const storedSettings = {
          ...defaultFullSettings,
          ...customSettings,
          servicePincodes: Array.isArray(customSettings?.servicePincodes)
            ? customSettings.servicePincodes
            : defaultFullSettings.servicePincodes,
        };
        const storedPrefs = JSON.parse(localStorage.getItem('alkabeer_notification_prefs') || 'null') || { read: [], hidden: [] };

        setData({
          orders: storedOrders,
          customers: storedCustomers,
          promotions: storedPromos,
          settings: storedSettings,
          notificationPreferences: storedPrefs,
        });
        setError('');
      } catch {
        setError(e.message);
      }
    }
  }, []);

  useEffect(() => {
    refreshAdmin();
    const id = setInterval(refreshAdmin, 10000);
    return () => clearInterval(id);
  }, [refreshAdmin]);

  if (!data) {
    return (
      <div className="p-12 text-center" role="status">
        {error || 'Loading administration…'}
        {error && (
          <button onClick={refreshAdmin} className="block mx-auto mt-3 text-primary font-bold">
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <Context.Provider value={{ ...data, refreshAdmin }}>
      {children}
    </Context.Provider>
  );
}

export const useAdminData = () => useContext(Context);

