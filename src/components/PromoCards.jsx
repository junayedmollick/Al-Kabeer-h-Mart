import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Cookie, Droplets, Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function PromoCards({ onScrollToSection }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const promoList = [
    {
      id: 'munchies',
      tag: t('promo.munchiesTag'),
      title: t('promo.munchiesTitle'),
      subtitle: t('promo.munchiesSub'),
      cta: t('promo.munchiesCta'),
      icon: Cookie,
      bgGradient: 'from-rose-500 via-rose-600 to-rose-700',
      targetRoute: '/category/snacks',
    },
    {
      id: 'refresh',
      tag: t('promo.refreshTag'),
      title: t('promo.refreshTitle'),
      subtitle: t('promo.refreshSub'),
      cta: t('promo.refreshCta'),
      icon: Droplets,
      bgGradient: 'from-teal-600 via-emerald-600 to-emerald-700',
      targetRoute: '/category/beverages',
    },
    {
      id: 'household',
      tag: t('promo.householdTag'),
      title: t('promo.householdTitle'),
      subtitle: t('promo.householdSub'),
      cta: t('promo.householdCta'),
      icon: Sparkles,
      bgGradient: 'from-amber-500 via-amber-600 to-amber-700',
      targetRoute: '/category/home-care',
    },
  ];

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {promoList.map((promo) => {
          const Icon = promo.icon;
          return (
            <div
              key={promo.id}
              onClick={() => navigate(promo.targetRoute)}
              className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${promo.bgGradient} p-5 sm:p-6 shadow-card hover:shadow-card-hover interactive-lift flex flex-col justify-between min-h-[180px] cursor-pointer group transition-all`}
            >
              <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

              {/* Watermark Icon */}
              <div className="absolute -right-3 -bottom-4 text-white/15 transform rotate-12 group-hover:rotate-[24deg] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                <Icon className="w-32 h-32" strokeWidth={1.5} />
              </div>

              {/* Content */}
              <div className="relative z-10 max-w-[85%]">
                <span className="text-[10px] font-black uppercase tracking-wider text-white/90 bg-black/20 px-2.5 py-0.5 rounded-full inline-block mb-2">
                  {promo.tag}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight mb-1 group-hover:translate-x-1 transition-transform">
                  {promo.title}
                </h3>
                <p className="text-xs text-white/85 font-medium leading-relaxed">
                  {promo.subtitle}
                </p>
              </div>

              {/* CTA Button */}
              <div className="relative z-10 pt-3">
                <button
                  type="button"
                  className="bg-white/20 hover:bg-white text-white hover:text-text-primary px-3.5 py-1.5 rounded-xl text-xs font-black backdrop-blur-md transition-all inline-flex items-center gap-1.5 shadow-xs group-hover:px-4 cursor-pointer"
                >
                  <span>{promo.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
