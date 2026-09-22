import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function AdminLogin() {
  const { user, login } = useAuth(), location = useLocation(), navigate = useNavigate();
  const [identifier, setIdentifier] = useState(''), [password, setPassword] = useState('');
  const [show, setShow] = useState(false), [rememberMe, setRememberMe] = useState(false);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const from = location.state?.from;
  const destination = from?.pathname?.startsWith('/admin/') && from.pathname !== '/admin/login' ? from.pathname + (from.search || '') : '/admin';
  if (user?.role === 'admin') return <Navigate to={destination} replace />;
  async function submit(e) {
    e.preventDefault(); if (busy) return; setBusy(true); setError('');
    try { await login({identifier,password,rememberMe,mode:'admin'}); navigate(destination,{replace:true}); }
    catch(e) { setError(e.message); } finally { setBusy(false); }
  }
  return <main className="min-h-screen bg-background flex items-center justify-center p-5 sm:p-10">
    <div className="w-full max-w-5xl grid md:grid-cols-2 overflow-hidden rounded-3xl shadow-xl bg-white border border-border">
      <section className="bg-primary text-white p-8 sm:p-12 flex flex-col justify-between gap-12">
        <Link to="/" className="text-xl font-black tracking-tight">Al-Kabeer H Mart<span className="block text-white text-xs tracking-widest uppercase mt-2">Store administration</span></Link>
        <div><ShieldCheck size={48} className="text-white mb-6"/><h1 className="text-3xl sm:text-4xl font-black leading-tight">Your store.<br/>One place to manage it.</h1><p className="text-white/90 mt-5 leading-relaxed">Manage products, track orders, update stock, and keep your customers moving.</p></div>
        <p className="text-xs text-white/90">Access is limited to authorised store administrators.</p>
      </section>
      <section className="p-8 sm:p-12">
        <p className="text-xs uppercase tracking-widest text-primary font-bold">Admin panel</p>
        <h2 className="text-2xl font-black mt-3">Welcome back</h2><p className="text-sm text-slate-500 mt-2 mb-8">Sign in with your administrator account.</p>
        <form onSubmit={submit} className="space-y-5">
          <label className="block text-sm font-semibold">Email or phone<input autoComplete="username" required value={identifier} onChange={e=>setIdentifier(e.target.value)} className="mt-2 w-full border border-slate-300 rounded-xl px-4 py-3" /></label>
          <label className="block text-sm font-semibold">Password<span className="relative block mt-2"><input type={show?'text':'password'} autoComplete="current-password" required minLength={8} value={password} onChange={e=>setPassword(e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-3 pr-12"/><button type="button" aria-label={show?'Hide password':'Show password'} onClick={()=>setShow(!show)} className="absolute right-3 top-3 p-1 text-slate-500">{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></span></label>
          <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={rememberMe} onChange={e=>setRememberMe(e.target.checked)}/>Remember me on this device</label>
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button disabled={busy} className="w-full flex justify-center items-center gap-2 rounded-xl py-3.5 bg-primary hover:bg-primary-dark text-white font-bold disabled:opacity-60">{busy?'Signing in…':'Sign in to admin'}<ArrowRight size={18}/></button>
        </form>
        <p className="text-xs text-slate-500 mt-6">Need access? Ask the store owner to create or reset your administrator account.</p>
        <Link to="/" className="inline-block mt-8 text-sm font-semibold text-primary">← Back to the store</Link>
      </section>
    </div>
  </main>;
}
