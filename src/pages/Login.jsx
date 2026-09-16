import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  Zap,
  Tag,
  Crown,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export function Login() {
  const { login, pendingAction, clearPendingAction } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError(t('login.identifierLabel') + ' is required');
      return;
    }
    if (!password.trim() || password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      setError('Full name is required');
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const signedIn = await login({ identifier, password, name, mode, rememberMe });
      setIsSubmitting(false);

      // Check if there was a pending order action
      if (pendingAction) {
        const action = pendingAction;
        clearPendingAction();

        if (action.type === 'direct_order') {
          navigate('/checkout', {
            state: {
              source: 'direct',
              product: action.product,
              quantity: action.quantity || 1,
            },
            replace: true,
          });
          return;
        } else if (action.type === 'cart_checkout') {
          navigate('/checkout', {
            state: { source: 'cart' },
            replace: true,
          });
          return;
        }
      }

      // Check if redirected from a specific route
      const fromPath = location.state?.from?.pathname || (signedIn.role === 'admin' ? '/admin' : '/account');
      navigate(fromPath, { replace: true });
    } catch(e) { setError(e.message); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8 bg-surface-soft/40">
      {/* Premium Split Card Container */}
      <div className="w-full max-w-4xl bg-surface rounded-3xl shadow-xl border border-border overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        
        {/* LEFT COLUMN (Desktop): Rich Brand Visual & Benefits Panel */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#063314] via-[#0AAD38] to-[#044c18] p-8 text-white flex-col justify-between relative overflow-hidden">
          {/* Subtle Decorative Ambient Circles */}
          <div className="absolute -right-16 -top-16 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-secondary/20 rounded-full blur-3xl pointer-events-none"></div>

          {/* Top: Real Brand Logo & Identity */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <img
                src="/assets/logo.png"
                alt="AL KABEER H MART"
                className="h-12 w-12 object-contain rounded-xl bg-white p-1 shadow-md group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <span className="font-black text-lg tracking-tight text-white leading-none">
                  AL KABEER <span className="text-secondary">h</span> MART
                </span>
                <span className="text-[10px] text-emerald-100 font-bold uppercase tracking-widest mt-1">
                  {t('brand.tagline')}
                </span>
              </div>
            </Link>

            <div className="mt-8">
              <span className="inline-flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-secondary border border-white/15">
                <Zap className="w-3.5 h-3.5 text-secondary fill-secondary" />
                <span>{t('login.brandBadge')}</span>
              </span>
              <h2 className="text-2xl font-black text-white mt-3 leading-snug">
                {t('brand.deliveryTime')}
              </h2>
              <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
                {t('footer.hubAddress')}
              </p>
            </div>
          </div>

          {/* Middle: Key Ecommerce Perks */}
          <div className="relative z-10 space-y-3 my-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-200">
              {t('login.perksTitle')}
            </h3>
            <div className="space-y-2 text-xs font-medium text-white/95">
              <div className="flex items-start gap-2 bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                <span>{t('login.perk1')}</span>
              </div>
              <div className="flex items-start gap-2 bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                <span>{t('login.perk2')}</span>
              </div>
              <div className="flex items-start gap-2 bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                <span>{t('login.perk3')}</span>
              </div>
            </div>
          </div>

          {/* Bottom Trust Badge */}
          <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-[11px] text-emerald-100">
            <span>© 2026 Al Kabeer H Mart</span>
            <span className="flex items-center gap-1 font-bold text-white">
              <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
              <span>100% Safe & Secure</span>
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Professional Login / Sign Up Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          
          {/* Mobile Header Brand Identity */}
          <div className="lg:hidden flex items-center justify-between pb-5 mb-5 border-b border-border">
            <Link to="/" className="flex items-center gap-2.5">
              <img
                src="/assets/logo.png"
                alt="AL KABEER H MART"
                className="h-10 w-10 object-contain rounded-xl bg-surface-soft p-0.5"
              />
              <div>
                <span className="font-black text-base text-text-primary leading-none block">
                  AL KABEER <span className="text-danger">h</span> MART
                </span>
                <span className="text-[10px] text-text-muted font-bold">
                  {t('brand.tagline')}
                </span>
              </div>
            </Link>
            <span className="text-[11px] font-black bg-primary-light text-primary px-2.5 py-1 rounded-full">
              {t('brand.deliveryTime')}
            </span>
          </div>

          {/* Form Header */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
                  {mode === 'signin' ? t('login.welcomeBack') : t('login.createWelcome')}
                </h1>
                <p className="text-xs text-text-secondary mt-1">
                  {mode === 'signin' ? t('login.subtitle') : t('login.createSubtitle')}
                </p>
              </div>
            </div>

            {/* Quick Mode Toggle Pills */}
            <div className="flex p-1 bg-surface-soft rounded-2xl border border-border/80 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError('');
                }}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-surface text-primary shadow-xs'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {t('nav.login')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError('');
                }}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-surface text-primary shadow-xs'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {t('login.createTitle')}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-danger border border-red-200 rounded-xl text-xs font-bold animate-shake">
                {error}
              </div>
            )}

            {/* Main Interactive Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name field if Sign Up */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-black text-text-primary mb-1">
                    {t('login.nameLabel')}
                  </label>
                  <input
                    type="text"
                    aria-label="Full name" autoComplete="name" required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('login.namePlaceholder')}
                    className="w-full h-11 px-4 bg-surface-soft border border-border rounded-xl text-sm font-medium focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary-light/50 outline-hidden transition-all text-text-primary"
                  />
                </div>
              )}

              {/* Identifier (Email / Mobile) */}
              <div>
                <label className="block text-xs font-black text-text-primary mb-1">
                  {t('login.identifierLabel')}
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    aria-label="Email or phone" autoComplete="username" required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={t('login.identifierPlaceholder')}
                    className="w-full h-11 pl-4 pr-10 bg-surface-soft border border-border rounded-xl text-sm font-medium focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary-light/50 outline-hidden transition-all text-text-primary"
                  />
                  <div className="absolute right-3.5 text-text-muted pointer-events-none">
                    {identifier.includes('@') ? (
                      <Mail className="w-4 h-4" />
                    ) : (
                      <Phone className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black text-text-primary">
                    {t('login.passwordLabel')}
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => setError('Contact the store administrator if you need help accessing your account.')}
                      className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                    >
                      {t('login.forgotPassword')}
                    </button>
                  )}
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    aria-label="Password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={8} required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('login.passwordPlaceholder')}
                    className="w-full h-11 pl-4 pr-11 bg-surface-soft border border-border rounded-xl text-sm font-medium focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary-light/50 outline-hidden transition-all text-text-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-text-muted hover:text-text-primary p-1 cursor-pointer"
                    aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-border cursor-pointer accent-primary"
                  />
                  <span className="text-xs text-text-secondary font-medium">
                    {t('login.rememberMe')}
                  </span>
                </label>
              </div>

              {/* Primary Submit CTA Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-primary hover:bg-primary-dark active:scale-[0.99] text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-75"
              >
                {isSubmitting ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>{mode === 'signin' ? t('login.signInBtn') : t('login.signUpBtn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Account help */}
            <div className="mt-4 p-3 bg-primary-light/50 border border-primary/20 rounded-xl text-[11px] text-text-secondary font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <span>Use your own account. New customers can create an account above.</span>
            </div>
          </div>

          {/* Bottom Switcher */}
          <div className="pt-6 border-t border-border mt-6 text-center text-xs text-text-secondary font-medium">
            {mode === 'signin' ? (
              <p>
                {t('login.noAccount')}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError('');
                  }}
                  className="text-primary font-black hover:underline cursor-pointer ml-1"
                >
                  {t('login.signUpLink')}
                </button>
              </p>
            ) : (
              <p>
                {t('login.haveAccount')}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError('');
                  }}
                  className="text-primary font-black hover:underline cursor-pointer ml-1"
                >
                  {t('login.signInLink')}
                </button>
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
