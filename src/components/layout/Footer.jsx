import { useCatalog } from '../../context/CatalogContext';
import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  PhoneCall,
  Clock,
  Globe,
  Facebook,
  MessageCircle,
  Crown,
  ChevronRight,
  ShieldCheck,
  Zap,
  Truck
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function Footer({ onOpenVip }) {
  const { t } = useLanguage();
  const { settings } = useCatalog();
  const whatsappNumber = settings.whatsapp.replace(/\D/g, '');

  return (
    <footer className="relative bg-[#F8F9FA] text-text-primary pt-0 pb-28 sm:pb-16 border-t border-border mt-14 sm:mt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TOP CONTACT & CTA BANNER: Responsive Floating Card */}
        <div className="relative -mt-10 sm:-mt-14 xl:-mt-16 mb-8 sm:mb-12 z-20 bg-surface border border-border/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 xl:p-8 shadow-card-hover flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-5 sm:gap-6 overflow-hidden">
          
          {/* Ambient Decorative Glow */}
          <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-primary-light rounded-full blur-2xl pointer-events-none" />

          {/* Left: Store & Delivery Hub Details */}
          <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0 relative z-10">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center text-xl sm:text-2xl shrink-0 mt-0.5 border border-primary/20">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-black uppercase text-primary tracking-widest mb-0.5">
                <Truck className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{t('footer.deliveryHubLine')}</span>
              </div>
              <div className="text-xs sm:text-sm md:text-base font-black text-text-primary leading-snug">
                {settings.address}
              </div>
            </div>
          </div>

          {/* Center: Helpline & Support Phones */}
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 shrink-0 relative z-10 border-t xl:border-t-0 pt-3 xl:pt-0 border-border/60">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
              <PhoneCall className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="text-[10px] sm:text-[11px] font-black uppercase text-amber-700 tracking-wider">
                {t('footer.helplineTitle')}
              </div>
              <div className="text-xs sm:text-sm md:text-base font-black text-text-primary flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                <a href="tel:032122224080" className="hover:text-primary transition-colors whitespace-nowrap">
                  03212-2224080
                </a>
                <span className="text-border">|</span>
                <a href={'tel:' + settings.phone} className="hover:text-primary transition-colors whitespace-nowrap">{settings.phone}</a>
                <span className="text-border">|</span>
                <a href="tel:9635066178" className="hover:text-primary transition-colors whitespace-nowrap">
                  9635066178
                </a>
              </div>
              <div className="text-[10px] sm:text-[11px] text-text-muted font-medium flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-primary shrink-0" />
                <span>{t('footer.supportHours')}</span>
              </div>
            </div>
          </div>

          {/* Right: Instant Order Action */}
          <div className="w-full xl:w-auto flex shrink-0 relative z-10">
            <a
              href={'https://wa.me/' + whatsappNumber}
              target="_blank"
              rel="noreferrer"
              className="w-full xl:w-auto bg-[#25D366] hover:bg-[#1ebc5c] text-white font-black px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl shadow-sm transition-all hover:scale-105 active:scale-95 text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>{t('cart.orderOnWhatsApp')}</span>
            </a>
          </div>

        </div>

        {/* MAIN RESPONSIVE FOOTER GRID (2 Columns on Mobile, 3 on Tablet, 5 on Desktop) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 pb-10 sm:pb-12 border-b border-border/80">
          
          {/* COLUMN 1: AL KABEER H MART Brand with Real Logo (Full Width on Mobile) */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1 flex flex-col mb-2 sm:mb-0">
            <Link to="/" className="flex items-center gap-2.5 mb-3 select-none">
              <img
                src="/assets/logo.png"
                alt="AL KABEER H MART"
                className="h-9 w-9 sm:h-10 sm:w-10 object-contain rounded-xl"
              />
              <div className="flex flex-col">
                <div className="flex items-baseline leading-none font-black tracking-tight text-text-primary text-base">
                  <span>AL KABEER</span>
                  <span className="text-danger mx-0.5">h</span>
                  <span className="text-primary">MART</span>
                </div>
                <span className="text-[8px] sm:text-[9px] font-bold text-text-muted uppercase tracking-widest mt-0.5">
                  {t('brand.tagline')}
                </span>
              </div>
            </Link>

            <p className="text-xs text-text-secondary leading-relaxed mb-3 max-w-sm">
              {t('brand.name')} — {t('footer.quickOrder')}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
              <a
                href="http://www.alkabeerhmart.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">alkabeerhmart.com</span>
              </a>
              <span className="text-border">•</span>
              <a
                href="https://www.facebook.com/search/top?q=Al%20Kabeer%20H%20Mart"
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Facebook className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Al Kabeer H Mart</span>
              </a>
            </div>
          </div>

          {/* COLUMN 2: Shop Departments (Left Column on Mobile) */}
          <div className="col-span-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-text-primary mb-3.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <span>{t('footer.shopCol')}</span>
            </h4>
            <ul className="space-y-2 text-xs text-text-secondary font-medium">
              <li>
                <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-text-muted shrink-0" />
                  <span>For You</span>
                </Link>
              </li>
              <li>
                <Link to="/category/snacks" className="hover:text-primary transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-text-muted shrink-0" />
                  <span>{t('sections.snacks')}</span>
                </Link>
              </li>
              <li>
                <Link to="/category/spices-grocery" className="hover:text-primary transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-text-muted shrink-0" />
                  <span>Spices & Grocery</span>
                </Link>
              </li>
              <li>
                <Link to="/category/beverages" className="hover:text-primary transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-text-muted shrink-0" />
                  <span>Drinks & Beverages</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: Account & Orders (Right Column on Mobile - Sits Beside Departments!) */}
          <div className="col-span-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-text-primary mb-3.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <span>{t('footer.accountCol')}</span>
            </h4>
            <ul className="space-y-2 text-xs text-text-secondary font-medium">
              <li>
                <Link to="/account" className="hover:text-primary transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-text-muted shrink-0" />
                  <span>{t('account.profile')}</span>
                </Link>
              </li>
              <li>
                <Link to="/account?tab=orders" className="hover:text-primary transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-text-muted shrink-0" />
                  <span>{t('account.orders')}</span>
                </Link>
              </li>
              <li>
                <Link to="/account?tab=orders" className="hover:text-primary transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-text-muted shrink-0" />
                  <span>{t('account.orderHistory')}</span>
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-primary transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-text-muted shrink-0" />
                  <span>{t('cart.title')}</span>
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenVip}
                  className="text-amber-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Crown className="w-3 h-3 text-amber-600 fill-amber-600 shrink-0" />
                  <span>{t('nav.vipBtn')}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: Customer Support */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-1 border-t sm:border-t-0 pt-4 sm:pt-0 border-border/50">
            <h4 className="text-xs font-black uppercase tracking-wider text-text-primary mb-3.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <span>{t('footer.supportCol')}</span>
            </h4>
            <ul className="space-y-2 text-xs text-text-secondary font-medium">
              <li>
                <a href="tel:032122224080" className="hover:text-primary transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-text-muted shrink-0" />
                  <span>Landline: 03212-2224080</span>
                </a>
              </li>
              <li>
                <a href={'tel:' + settings.phone} className="hover:text-primary transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-text-muted shrink-0" />
                  <span>Mobile: {settings.phone}</span>
                </a>
              </li>
              <li>
                <a href="tel:9635066178" className="hover:text-primary transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-text-muted shrink-0" />
                  <span>Helpline: 9635066178</span>
                </a>
              </li>
              <li>
                <span className="flex items-center gap-1 text-text-muted">
                  <Clock className="w-3 h-3 text-primary shrink-0" />
                  <span>8:00 AM - 10:00 PM Daily</span>
                </span>
              </li>
            </ul>
          </div>

          {/* COLUMN 5: Instant WhatsApp Direct Hub */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1 lg:col-span-1 border-t sm:border-t-0 pt-4 sm:pt-0 border-border/50">
            <h4 className="text-xs font-black uppercase tracking-wider text-text-primary mb-3.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <span>{t('footer.instantWhatsAppHub')}</span>
            </h4>
            <p className="text-xs text-text-secondary mb-3 leading-relaxed">
              {t('footer.orderStockInquiry')}
            </p>
            <div className="flex flex-col sm:flex-row md:flex-col gap-2">
              <a
                href={'https://wa.me/' + whatsappNumber}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#1ebc5c] text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs transition-all shadow-xs cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                <span>WhatsApp: {settings.whatsapp}</span>
              </a>
              <a
                href="tel:9635066178"
                className="w-full bg-surface hover:bg-surface-soft text-text-primary font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-xs transition-colors border border-border cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Helpline: 9635066178</span>
              </a>
            </div>
          </div>

        </div>

        {/* BOTTOM COPYRIGHT BAR: Clean, Non-wrapping, Balanced */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted text-center sm:text-left">
          <div className="leading-relaxed">
            <span>© 2026 <strong className="text-text-primary font-bold">Al Kabeer H Mart</strong>. </span>
            <span className="inline-block">{t('footer.rights')}</span>
          </div>

          {/* Grouped Legal Links */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-3 gap-y-1 text-xs">
            <Link to="/privacy-policy" className="whitespace-nowrap hover:text-primary transition-colors">
              {t('footer.privacyPolicy')}
            </Link>
            <span className="text-border select-none">•</span>
            <Link to="/terms-of-service" className="whitespace-nowrap hover:text-primary transition-colors">
              {t('footer.termsOfService')}
            </Link>
            <span className="text-border select-none">•</span>
            <a
              href="https://www.facebook.com/search/top?q=Al%20Kabeer%20H%20Mart"
              target="_blank"
              rel="noreferrer"
              className="whitespace-nowrap hover:text-primary transition-colors"
            >
              Facebook
            </a>
            <span className="text-border select-none">•</span>
            <a
              href={'https://wa.me/' + whatsappNumber}
              target="_blank"
              rel="noreferrer"
              className="whitespace-nowrap hover:text-primary transition-colors"
            >
              WhatsApp
            </a>
            <span className="text-border select-none">•</span>
            <Link
              to="/admin"
              className="whitespace-nowrap font-bold text-primary hover:underline transition-colors"
            >
              Admin Portal
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
