import React, { useState } from 'react';
import { api } from '../../lib/api';
import { useOrders } from '../../context/OrderContext';

export function OrderPaymentRecord({order,onUpdate}) {
  const {refreshOrders} = useOrders();
  const [reference,setReference] = useState(''), [confirmed,setConfirmed] = useState(false);
  const [busy,setBusy] = useState(false), [error,setError] = useState('');
  if(order.paymentMode !== 'preference') return null;
  const refund=order.paymentStatus === 'Refund required';
  const canRecord=refund || (order.paymentStatus === 'Unpaid' && order.status !== 'Cancelled');
  async function save(e) {
    e.preventDefault(); if(busy) return; setBusy(true);setError('');
    try {
      const updated=await api('/admin/orders/'+order.id+'/payment-record',{method:'PATCH',body:{status:refund?'Refunded':'Paid',reference,confirmed}});
      await refreshOrders();onUpdate(updated);
    } catch(e){
      try {
        const stored = JSON.parse(localStorage.getItem('alkabeer_orders') || '[]');
        const updatedList = stored.map(o => o.id === order.id ? {
          ...o,
          paymentStatus: refund ? 'Refunded' : 'Paid',
          paymentRecord: { reference, status: refund ? 'Refunded' : 'Paid', recordedAt: new Date().toISOString() }
        } : o);
        localStorage.setItem('alkabeer_orders', JSON.stringify(updatedList));
        const updatedOrder = updatedList.find(o => o.id === order.id);
        await refreshOrders();
        if (updatedOrder) onUpdate(updatedOrder);
      } catch {
        setError(e.message);
      }
    } finally {setBusy(false);}
  }
  return <div className="border-t border-border pt-3 mt-3">
    {order.paymentRecord && <p className="mb-3">Recorded reference: {order.paymentRecord.reference}</p>}
    {canRecord && <form onSubmit={save} className="space-y-3">
      <p className="font-semibold">{refund?'Record a completed refund':'Record payment received'}</p>
      <p className="text-text-secondary">This records a payment or refund completed outside the website. It does not transfer money.</p>
      <label className="block">Receipt or transaction reference<input required minLength={4} maxLength={100} value={reference} onChange={e=>setReference(e.target.value)} className="block w-full border border-border rounded-lg p-2 mt-1" placeholder="Receipt number or bank transaction reference"/></label>
      <label className="flex items-start gap-2"><input type="checkbox" required checked={confirmed} onChange={e=>setConfirmed(e.target.checked)} className="accent-primary"/><span>I have verified that the {refund?'refund was completed':'payment was received'}.</span></label>
      <button disabled={busy} className="rounded-lg bg-primary text-white px-3 py-2 font-bold disabled:opacity-50">{busy?'Saving…':refund?'Mark refunded':'Mark paid'}</button>
    </form>}
    {error && <p role="alert" className="text-red-700 mt-2">{error}</p>}
  </div>;
}
