import React, { useState } from 'react';
import { useCatalog } from '../context/CatalogContext';
import { useOrders } from '../context/OrderContext';
import { orderWhatsAppUrl } from '../lib/whatsapp';
import { payForOrder } from '../lib/payments';

export function OrderActions({ order, onUpdate, blocked = false, showWhatsApp = true }) {
  const { settings } = useCatalog(), { refreshOrders } = useOrders();
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const href = orderWhatsAppUrl(order, settings.whatsapp, settings.storeName);
  const canPay = settings.checkoutPaymentMode === 'online' && order.paymentMode !== 'preference' && ['upi','card'].includes(order.paymentCode) && order.paymentStatus === 'Pending' && order.status === 'Processing';
  async function pay() {
    setBusy(true); setError('');
    try { const updated = await payForOrder(order); onUpdate?.(updated); await refreshOrders(); if(updated.paymentStatus === 'Paid') { const url=orderWhatsAppUrl(updated,settings.whatsapp,settings.storeName); if(url) window.location.assign(url); } }
    catch(e) { setError(e.message); await refreshOrders(); }
    finally { setBusy(false); }
  }
  return <div className="my-4 space-y-3 text-sm">
    <p className="font-semibold">Payment: {order.paymentMethod} · {order.paymentStatus}</p>
    {order.paymentMode === 'preference' && <p className="text-xs text-text-secondary">Your selection was saved. No payment is collected on this website.</p>}
    {canPay && <button type="button" disabled={blocked || busy || !settings.onlinePaymentsEnabled} onClick={pay} className="rounded-xl px-5 py-3 bg-primary text-white font-bold disabled:opacity-50">{blocked || busy ? 'Opening payment…' : 'Pay securely / retry payment'}</button>}
    {showWhatsApp && !canPay && order.status !== 'Cancelled' && (href ? <div><a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-xl bg-[#128C4A] text-white px-5 py-3 font-bold">Send order on WhatsApp</a><p className="text-xs text-text-secondary mt-2">WhatsApp opens with your order details. Tap Send there to contact the store.</p></div> : <p>Contact the store by phone to confirm your order.</p>)}
    {order.paymentStatus === 'Refund required' && <p>The store must arrange your refund. Contact the store with your order number.</p>}
    {error && <p role="alert" className="text-red-700">{error}</p>}
  </div>;
}
