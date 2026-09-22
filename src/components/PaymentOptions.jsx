import React from 'react';
import { Banknote, QrCode, CreditCard } from 'lucide-react';
const methods = [
  {id:'cod',name:'Cash on delivery',detail:'Pay cash to the delivery person when your order arrives.',Icon:Banknote},
  {id:'upi',name:'UPI',detail:'Pay securely using your UPI app or the QR code in checkout.',Icon:QrCode},
  {id:'card',name:'Card payment',detail:'Pay securely using your debit or credit card. Card details stay with the payment provider.',Icon:CreditCard},
];
export function PaymentOptions({value,onChange,onlineEnabled,testMode,paymentMode = 'online'}) {
  return <fieldset className="space-y-3"><legend className="sr-only">Payment method</legend>
    {methods.map(({id,name,detail,Icon}) => {
      const disabled = paymentMode === 'online' && id !== 'cod' && !onlineEnabled;
      return <label key={id} className={`flex items-start gap-3 p-4 rounded-2xl border transition-colors ${value === id ? 'border-primary bg-primary/5' : 'border-border'} ${disabled?'opacity-60':'cursor-pointer'}`}>
        <input type="radio" name="paymentMethod" value={id} checked={value === id} disabled={disabled} onChange={()=>onChange(id)} className="mt-1 accent-primary"/>
        <Icon className="text-primary shrink-0" size={22}/><span><span className="block font-bold">{name}</span><span className="block text-sm text-text-secondary mt-1">{disabled?'Online payment setup is pending. Please choose cash on delivery.':detail}</span></span>
      </label>;
    })}
    {paymentMode === 'preference' && <p className="text-sm bg-primary-light text-primary-dark p-3 rounded-xl">This is your payment preference only. No payment is collected on this website. Your choice will be included in the WhatsApp order.</p>}
    {paymentMode === 'online' && onlineEnabled && <p className="text-xs text-text-secondary">Secure checkout opens before WhatsApp. Your payment is verified by the website. Unpaid online orders reserve stock for 30 minutes.</p>}
    {paymentMode === 'online' && onlineEnabled && testMode && <p role="status" className="text-amber-800 bg-amber-50 p-3 rounded-xl text-sm">Test payments only — real money is not collected.</p>}
  </fieldset>;
}
