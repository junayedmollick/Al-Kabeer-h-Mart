import React, { useState } from 'react';
import { X, MapPin, Check, Search } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const presetLocations = [
  { id: '1', name: 'Bhagabatipur, Hooghly', time: '10–15 mins', tag: 'Primary Hub' },
  { id: '2', name: 'Sarkarpara More, Bhagabatipur', time: '10–15 mins', tag: 'Express' },
  { id: '3', name: 'Mollar Chawk, Nawabpur', time: '12–15 mins', tag: 'Active' },
  { id: '4', name: 'Chanditala - 712701, Hooghly', time: '15 mins', tag: 'Standard' },
];

export function LocationModal({ isOpen, onClose, selectedLocation, onSelectLocation }) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = presetLocations.filter((loc) =>
    loc.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-surface text-text-primary rounded-3xl shadow-2xl border border-border overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-light text-primary flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-text-primary">
                {t('locationModal.title') || 'Choose Delivery Location'}
              </h3>
              <p className="text-[11px] text-text-secondary">
                {t('locationModal.subtitle') || 'Delivering in 10–15 minutes across Bhagabatipur & Hooghly'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-surface-soft text-text-muted hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close location modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-border/60">
          <div className="relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('locationModal.searchPlaceholder') || 'Search delivery locality or street...'}
              className="w-full bg-surface-soft border border-border focus:border-primary rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-text-primary outline-none"
            />
          </div>
        </div>

        {/* Location List */}
        <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
          {filtered.map((loc) => {
            const isSelected = selectedLocation === loc.name;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => {
                  onSelectLocation(loc.name);
                  onClose();
                }}
                className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary-light/50 shadow-2xs'
                    : 'border-border hover:border-primary/40 hover:bg-surface-soft'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <MapPin
                    className={`w-4 h-4 mt-0.5 shrink-0 ${
                      isSelected ? 'text-primary' : 'text-text-muted'
                    }`}
                  />
                  <div>
                    <div className="text-xs font-bold text-text-primary">
                      {loc.name}
                    </div>
                    <div className="text-[10px] text-text-secondary mt-0.5 flex items-center gap-2">
                      <span className="text-primary font-bold">{loc.time}</span>
                      <span>•</span>
                      <span>{loc.tag}</span>
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-surface-soft border-t border-border text-center text-[11px] text-text-muted">
          {t('locationModal.footer') || 'Currently serving Bhagabatipur, Sarkarpara More, Mollar Chawk & Chanditala.'}
        </div>

      </div>
    </div>
  );
}
