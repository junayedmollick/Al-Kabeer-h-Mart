import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Home,
  Briefcase,
  Navigation,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';

const LOCAL_PRESETS = [
  { name: 'Mollar Chawk', street: 'Mollar Chawk, Sarkarpara More', city: 'Bhagabatipur, Hooghly', pincode: '712701' },
  { name: 'Sarkarpara More', street: 'Sarkarpara More, Rajar Road', city: 'Bhagabatipur, Hooghly', pincode: '712701' },
  { name: 'Bhagabatipur Hub', street: 'Bhagabatipur Rajar Road', city: 'Nawabpur, Chanditala', pincode: '712701' },
  { name: 'Chanditala Bazaar', street: 'Chanditala Bazaar, Main Road', city: 'Chanditala, Hooghly', pincode: '712701' },
];

export function AddressModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    type: 'home',
    name: '',
    phone: '',
    house: '',
    street: '',
    landmark: '',
    city: 'Bhagabatipur, Hooghly',
    pincode: '712701',
    isDefault: false,
  });

  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState('');
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type || 'home',
        name: initialData.name || '',
        phone: initialData.phone || '',
        house: initialData.house || '',
        street: initialData.street || '',
        landmark: initialData.landmark || '',
        city: initialData.city || 'Bhagabatipur, Hooghly',
        pincode: initialData.pincode || '712701',
        isDefault: Boolean(initialData.isDefault),
      });
    } else {
      setFormData({
        type: 'home',
        name: '',
        phone: '',
        house: '',
        street: '',
        landmark: '',
        city: 'Bhagabatipur, Hooghly',
        pincode: '712701',
        isDefault: false,
      });
    }
    setLocationSuccess('');
    setLocationError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Real-time GPS detection & OpenStreetMap Reverse Geocoding
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('GPS Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError('');
    setLocationSuccess('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        try {
          // Reverse geocoding via OpenStreetMap free API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'en',
              },
            }
          );

          if (!response.ok) throw new Error('Geocoding response failed');

          const data = await response.json();
          const addr = data.address || {};

          const road = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || '';
          const locality = addr.village || addr.town || addr.suburb || addr.city || 'Bhagabatipur';
          const district = addr.county || addr.state_district || 'Hooghly';
          const postcode = addr.postcode || '712701';

          const detectedStreet = [road, locality].filter(Boolean).join(', ') || `GPS Locality (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
          const detectedCity = `${locality}, ${district}`;

          setFormData((prev) => ({
            ...prev,
            house: prev.house || addr.house_number || '',
            street: detectedStreet,
            city: detectedCity,
            pincode: postcode,
            landmark: prev.landmark || `Near GPS location (±${Math.round(accuracy)}m)`,
          }));

          setLocationSuccess(`Location detected accurately (within ~${Math.round(accuracy)}m)!`);
        } catch (err) {
          // Fallback if network/reverse geocoding fails
          setFormData((prev) => ({
            ...prev,
            street: `GPS: ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`,
            city: 'Bhagabatipur Hub, Hooghly',
            pincode: '712701',
          }));
          setLocationSuccess('GPS coordinates captured successfully!');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location permission was denied. Please allow location access in browser or fill manually.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information is unavailable. Please select your locality below.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out. Please try again.');
            break;
          default:
            setLocationError('Could not fetch location. Please type manually.');
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  const handleApplyPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      street: preset.street,
      city: preset.city,
      pincode: preset.pincode,
    }));
    setLocationSuccess(`Applied preset for ${preset.name}!`);
    setLocationError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.street.trim()) {
      setLocationError('Please enter street or area address.');
      return;
    }
    if (await onSave(formData) === false) return;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-lg bg-surface text-text-primary rounded-3xl shadow-2xl border border-border overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-light text-primary flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-text-primary">
                {initialData ? 'Edit Delivery Address' : 'Add New Delivery Address'}
              </h3>
              <p className="text-[11px] text-text-secondary">
                Delivered fresh from Bhagabatipur hub in 10–15 mins
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-surface-soft text-text-muted hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto no-scrollbar">
          
          {/* GPS Auto-Detect Location Action Banner */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-primary-light/40 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 mt-0.5">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black text-text-primary block">
                  Auto-Detect Live Location
                </span>
                <span className="text-[11px] text-text-secondary leading-snug block">
                  Use your device GPS to fetch your street & pincode
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGetLocation}
              disabled={isLocating}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary-dark disabled:opacity-70 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0 whitespace-nowrap"
            >
              {isLocating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Locating...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get Location</span>
                </>
              )}
            </button>
          </div>

          {/* Success / Error Alerts */}
          {locationSuccess && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-bold animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{locationSuccess}</span>
            </div>
          )}

          {locationError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-danger text-xs font-bold animate-fade-in">
              <AlertCircle className="w-4 h-4 text-danger shrink-0" />
              <span>{locationError}</span>
            </div>
          )}

          {/* Local Hub Presets */}
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-text-muted block mb-1.5">
              Quick Select Locality
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {LOCAL_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="px-2.5 py-1 bg-surface-soft hover:bg-primary-light hover:text-primary border border-border text-[11px] font-bold text-text-secondary rounded-lg transition-colors shrink-0 cursor-pointer"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Address Type Tag (Home / Work / Other) */}
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1.5">
              Address Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'home', label: 'Home', icon: Home },
                { id: 'work', label: 'Work', icon: Briefcase },
                { id: 'other', label: 'Other', icon: MapPin },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = formData.type === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: item.id })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary-light/50 text-primary font-black shadow-2xs'
                        : 'border-border bg-surface-soft/60 text-text-secondary hover:bg-surface-soft'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contact Details: Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">
                Contact Person Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Tariq Ahmed"
                className="w-full bg-surface-soft border border-border focus:border-primary rounded-xl px-3.5 py-2 text-xs font-medium text-text-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. 9002461519"
                className="w-full bg-surface-soft border border-border focus:border-primary rounded-xl px-3.5 py-2 text-xs font-medium text-text-primary outline-none"
              />
            </div>
          </div>

          {/* House / Flat No. */}
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1">
              Flat / House / Floor / Building No.
            </label>
            <input
              type="text"
              value={formData.house}
              onChange={(e) => setFormData({ ...formData, house: e.target.value })}
              placeholder="e.g. House No. 42, Floor 1 or Near Sarkarpara Masjid"
              className="w-full bg-surface-soft border border-border focus:border-primary rounded-xl px-3.5 py-2 text-xs font-medium text-text-primary outline-none"
            />
          </div>

          {/* Street / Area / Locality */}
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1">
              Street / Area / Locality *
            </label>
            <input
              type="text"
              required
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              placeholder="e.g. Mollar Chawk, Sarkarpara More, Bhagabatipur Rajar Road"
              className="w-full bg-surface-soft border border-border focus:border-primary rounded-xl px-3.5 py-2 text-xs font-medium text-text-primary outline-none"
            />
          </div>

          {/* Landmark */}
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1">
              Landmark (Optional)
            </label>
            <input
              type="text"
              value={formData.landmark}
              onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
              placeholder="e.g. Opposite High Madrasah / Near Water Tank"
              className="w-full bg-surface-soft border border-border focus:border-primary rounded-xl px-3.5 py-2 text-xs font-medium text-text-primary outline-none"
            />
          </div>

          {/* City & Pincode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">
                City / District *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-surface-soft border border-border focus:border-primary rounded-xl px-3.5 py-2 text-xs font-medium text-text-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">
                Pincode *
              </label>
              <input
                type="text"
                required
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="712701"
                className="w-full bg-surface-soft border border-border focus:border-primary rounded-xl px-3.5 py-2 text-xs font-medium text-text-primary outline-none"
              />
            </div>
          </div>

          {/* Make Default Address Checkbox */}
          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-soft/60 border border-border cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
            />
            <div>
              <span className="text-xs font-black text-text-primary block">
                Make this my default delivery address
              </span>
              <span className="text-[11px] text-text-muted block">
                Used automatically for 1-click order now and instant checkout
              </span>
            </div>
          </label>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-3 border-t border-border">
            <button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary-dark text-white font-black text-xs py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              {initialData ? 'Update Address' : 'Save Address'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-surface-soft hover:bg-border text-text-secondary font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
