import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play, Sparkles, Crown, Percent, Zap, Gift } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { useLanguage } from '../context/LanguageContext';

const slides = [
  { eyebrow: 'YOUR EVERYDAY FAVOURITES', title: 'Little cravings. Big happiness.', description: 'Your favourite snacks, biscuits and refreshing drinks, all from your neighbourhood store.', cta: 'Explore snacks', category: 'snacks', ids: ['photo-0133', 'photo-0034', 'photo-0175'], background: 'linear-gradient(115deg, #065e29, #0a8b39 65%, #28a748)', label: 'Snack time, sorted', number: '01' },
  { eyebrow: 'FOR BRIGHT IDEAS', title: 'A little colour. A lot of possibility.', description: 'From the first sketch to the last page — find pens, colours and school essentials in one place.', cta: 'Shop stationery', category: 'stationery', ids: ['photo-0094', 'photo-0051', 'photo-0018'], background: 'linear-gradient(115deg, #064e3b, #047857 60%, #10b981)', label: 'Create something new', number: '02' },
  { eyebrow: 'CARE FOR YOUR EVERYDAY', title: 'Fresh spaces. Happy homes.', description: 'Keep your home feeling its best with laundry care, room fresheners and everyday essentials.', cta: 'Explore home care', category: 'home-care', ids: ['photo-0125', 'photo-0185', 'photo-0220'], background: 'linear-gradient(115deg, #064420, #13753e 60%, #34d399)', label: 'Small essentials, big difference', number: '03' },
  { eyebrow: 'AL KABEER VIP PRIVILEGE', title: 'Unlock VIP perks. Save more every day.', description: 'Priority 10-minute delivery, extra member discounts, and exclusive surprise rewards on every grocery order.', cta: 'Join VIP Membership', isVip: true, background: 'linear-gradient(115deg, #713f12, #a16207 40%, #ca8a04 75%, #eab308)', label: 'Privilege club for loyal families', number: '04' }
];

const VIP_PERKS = [
  { icon: Percent, title: 'Extra 5% Off', desc: 'On all groceries', badge: 'SAVINGS' },
  { icon: Zap, title: 'Priority Dispatch', desc: '10-min fast track', badge: 'EXPRESS' },
  { icon: Gift, title: 'Surprise Gifts', desc: 'Monthly freebies', badge: 'REWARDS' }
];

export function HeroSlider({ onOpenVip }) {
  const { products } = useCatalog();
  const { t } = useLanguage();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchX = useRef(null);

  const currentSlides = [
    { ...slides[0], eyebrow: t('heroSlider.slide1.eyebrow') || slides[0].eyebrow, title: t('heroSlider.slide1.title') || slides[0].title, description: t('heroSlider.slide1.description') || slides[0].description, cta: t('heroSlider.slide1.cta') || slides[0].cta, label: t('heroSlider.slide1.label') || slides[0].label },
    { ...slides[1], eyebrow: t('heroSlider.slide2.eyebrow') || slides[1].eyebrow, title: t('heroSlider.slide2.title') || slides[1].title, description: t('heroSlider.slide2.description') || slides[1].description, cta: t('heroSlider.slide2.cta') || slides[1].cta, label: t('heroSlider.slide2.label') || slides[1].label },
    { ...slides[2], eyebrow: t('heroSlider.slide3.eyebrow') || slides[2].eyebrow, title: t('heroSlider.slide3.title') || slides[2].title, description: t('heroSlider.slide3.description') || slides[2].description, cta: t('heroSlider.slide3.cta') || slides[2].cta, label: t('heroSlider.slide3.label') || slides[2].label },
    { ...slides[3], eyebrow: t('heroSlider.slide4.eyebrow') || slides[3].eyebrow, title: t('heroSlider.slide4.title') || slides[3].title, description: t('heroSlider.slide4.description') || slides[3].description, cta: t('heroSlider.slide4.cta') || slides[3].cta, label: t('heroSlider.slide4.label') || slides[3].label },
  ];

  const currentVipPerks = [
    { icon: Percent, title: t('heroSlider.slide4.perk1Title') || VIP_PERKS[0].title, desc: t('heroSlider.slide4.perk1Desc') || VIP_PERKS[0].desc, badge: t('heroSlider.slide4.perk1Badge') || VIP_PERKS[0].badge },
    { icon: Zap, title: t('heroSlider.slide4.perk2Title') || VIP_PERKS[1].title, desc: t('heroSlider.slide4.perk2Desc') || VIP_PERKS[1].desc, badge: t('heroSlider.slide4.perk2Badge') || VIP_PERKS[1].badge },
    { icon: Gift, title: t('heroSlider.slide4.perk3Title') || VIP_PERKS[2].title, desc: t('heroSlider.slide4.perk3Desc') || VIP_PERKS[2].desc, badge: t('heroSlider.slide4.perk3Badge') || VIP_PERKS[2].badge },
  ];

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(media.matches);
    const update = () => setReducedMotion(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (paused || hovered || reducedMotion) return;
    const timer = setInterval(() => setActive((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [paused, hovered, reducedMotion, active]);

  const move = (step) => setActive((i) => (i + step + slides.length) % slides.length);

  return (
    <section aria-label="Store highlights" aria-roledescription="carousel" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-3"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current !== null) {
          const delta = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(delta) > 55) move(delta < 0 ? 1 : -1);
          touchX.current = null;
        }
      }}>
      <div className="rounded-[28px] sm:rounded-[32px] overflow-hidden shadow-lg border border-primary/10 bg-primary-dark">
        <div className="flex transition-transform duration-700 motion-reduce:transition-none" style={{ transform: `translateX(-${active * 100}%)` }}>
          {currentSlides.map((slide, index) => {
            const picks = (slide.ids || []).map((id) => products.find((p) => p.id === id)).filter(Boolean);
            return (
              <article key={slide.number} aria-label={`${index + 1} of ${currentSlides.length}`} aria-roledescription="slide" aria-hidden={index !== active} inert={index !== active ? '' : undefined} className="w-full shrink-0 relative overflow-hidden text-white" style={{ background: slide.background }}>
                <div aria-hidden="true" className={`absolute w-[540px] h-[540px] rounded-full border-[70px] -right-24 -top-32 pointer-events-none ${slide.isVip ? 'border-amber-300/10' : 'border-white/5'}`} />
                <div className="relative grid md:grid-cols-2 gap-6 sm:gap-10 items-center px-5 py-7 sm:px-10 lg:px-12 sm:py-12 min-h-[440px] md:min-h-[390px]">
                  <div>
                    <p className="flex items-center gap-2 text-[10px] sm:text-xs font-bold tracking-[0.18em] text-white/80">
                      {slide.isVip ? <Crown size={15} className="text-amber-300" /> : <Sparkles size={15} />}
                      {slide.eyebrow}
                    </p>
                    <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-[1.12] tracking-tight mt-3 sm:mt-4 max-w-lg">{slide.title}</h2>
                    <p className="text-xs sm:text-base text-white/85 leading-relaxed mt-2.5 sm:mt-4 max-w-md">{slide.description}</p>
                    {slide.isVip ? (
                      <button type="button" onClick={onOpenVip} tabIndex={active === index ? 0 : -1} className="inline-flex gap-2.5 items-center bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-300 hover:from-amber-400 hover:via-amber-400 hover:to-amber-500 text-amber-950 font-black rounded-xl px-5 py-3 text-xs sm:text-sm mt-5 sm:mt-6 shadow-md hover:scale-105 active:scale-95 cursor-pointer transition-all">
                        <Crown size={17} className="text-amber-900" /><span>{slide.cta}</span><ArrowRight size={17} />
                      </button>
                    ) : (
                      <Link to={'/category/' + slide.category} tabIndex={active === index ? 0 : -1} className="inline-flex gap-2.5 items-center bg-white text-primary-dark rounded-xl px-5 py-3 font-bold text-xs sm:text-sm mt-5 sm:mt-6 shadow-sm hover:scale-105 active:scale-95 transition-all">
                        <span>{slide.cta}</span><ArrowRight size={17} />
                      </Link>
                    )}
                  </div>
                  <div>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 items-center pt-3 pb-2">
                      {slide.isVip ? currentVipPerks.map((item, i) => (
                        <button key={item.title} type="button" onClick={onOpenVip} tabIndex={active === index ? 0 : -1} className={`block text-left rounded-2xl bg-white/95 backdrop-blur-xs text-text-primary p-2.5 sm:p-3.5 shadow-xl border border-amber-200/80 hover:bg-white hover:scale-105 hover:shadow-2xl transition-all cursor-pointer ${i === 1 ? '-translate-y-3 sm:-translate-y-4 ring-2 ring-amber-400' : 'translate-y-2'}`}>
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white mb-2 shadow-xs"><item.icon size={18} /></div>
                          <span className="inline-block px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[8px] sm:text-[9px] font-black uppercase tracking-wider mb-1">{item.badge}</span>
                          <p className="text-[11px] sm:text-xs font-black text-text-primary leading-tight line-clamp-1">{item.title}</p>
                          <p className="text-[9px] sm:text-[10px] text-text-muted mt-0.5 leading-snug line-clamp-2">{item.desc}</p>
                        </button>
                      )) : picks.map((p, i) => (
                        <Link key={p.id} to={'/product/' + p.id} tabIndex={active === index ? 0 : -1} className={`block rounded-2xl bg-white text-text-primary p-2 sm:p-3 shadow-xl hover:scale-105 hover:shadow-2xl transition-all cursor-pointer ${i === 1 ? '-translate-y-3 sm:-translate-y-4' : 'translate-y-2'}`}>
                          <div className="aspect-square bg-white rounded-xl overflow-hidden p-1"><img src={p.image} alt={p.name} className="w-full h-full object-contain" loading={index === 0 ? 'eager' : 'lazy'} /></div>
                          <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs leading-tight sm:leading-4 font-bold line-clamp-2 min-h-7 sm:min-h-8">{p.name}</p>
                        </Link>
                      ))}
                    </div>
                    <p className="text-center mt-3 sm:mt-4 text-[10px] sm:text-xs font-medium tracking-wide text-white/75 truncate">{slide.label}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <div className="flex items-center justify-between gap-2 px-3.5 sm:px-6 md:px-10 py-2.5 sm:py-3.5 bg-white/95 border-t border-border/40">
          <div className="flex items-center gap-1 sm:gap-2 shrink-0" aria-label="Choose a highlight">
            {slides.map((slide, i) => (
              <button type="button" key={slide.number} aria-label={'Show slide ' + (i + 1)} aria-current={active === i ? 'true' : undefined} onClick={() => setActive(i)} className="flex items-center justify-center h-6 w-6 sm:h-8 sm:w-8 rounded-full focus-visible:outline-primary cursor-pointer">
                <span className={`h-1.5 sm:h-2 rounded-full transition-all ${active === i ? (slide.isVip ? 'w-5 sm:w-7 bg-amber-500' : 'w-5 sm:w-7 bg-primary') : 'w-1.5 sm:w-2 bg-slate-300'}`} />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className="text-[11px] sm:text-xs font-bold text-text-secondary mr-1 tabular-nums shrink-0">{String(active + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
            {!reducedMotion && (
              <button type="button" aria-label={paused ? 'Resume slideshow' : 'Pause slideshow'} onClick={() => setPaused((p) => !p)} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-border text-text-secondary flex items-center justify-center cursor-pointer hover:bg-surface-soft transition-colors">
                {paused ? <Play size={12} className="sm:w-3.5 sm:h-3.5" /> : <Pause size={12} className="sm:w-3.5 sm:h-3.5" />}
              </button>
            )}
            <button type="button" aria-label="Previous slide" onClick={() => move(-1)} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-border flex items-center justify-center text-primary-dark cursor-pointer hover:bg-surface-soft transition-colors">
              <ChevronLeft size={15} className="sm:w-4 sm:h-4" />
            </button>
            <button type="button" aria-label="Next slide" onClick={() => move(1)} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer hover:bg-primary-dark transition-colors">
              <ChevronRight size={15} className="sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
