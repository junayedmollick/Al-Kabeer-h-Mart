import React from 'react';
export function VipTab({ onOpenVip }) { return <section className="p-8 bg-surface rounded-2xl border border-border"><h2 className="text-xl font-bold">VIP membership</h2><p className="my-4">You do not have an active online membership.</p><button className="text-primary font-bold" onClick={onOpenVip}>Contact the store about membership</button></section>; }
