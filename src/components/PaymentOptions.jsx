import React from 'react';
import { Banknote, CheckCircle2 } from 'lucide-react';
export function PaymentOptions() { return <div className="rounded-2xl border border-primary bg-primary/5 p-5 flex gap-3"><Banknote className="text-primary"/><div><h3 className="font-bold">Cash on delivery</h3><p className="text-sm text-text-secondary mt-1">Pay the confirmed order total when your order arrives.</p></div><CheckCircle2 className="text-primary ml-auto"/></div>; }
