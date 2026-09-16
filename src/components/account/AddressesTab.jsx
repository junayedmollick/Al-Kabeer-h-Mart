import { useAuth } from '../../context/AuthContext';
import React, { useState, useEffect } from 'react';
import {
  Home,
  Briefcase,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Navigation,
  Check
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { AddressModal } from './AddressModal';



export function AddressesTab({ phone }) {
  const { t } = useLanguage();
  const { user, saveAddresses } = useAuth();
  const addresses = user?.addresses || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [feedback, setFeedback] = useState('');



  const showFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => {
      setFeedback('');
    }, 4000);
  };

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingAddress(addr);
    setIsModalOpen(true);
  };

  const handleSaveAddress = async formData => {
    const item = { ...formData, id: editingAddress?.id || crypto.randomUUID() };
    let next = editingAddress ? addresses.map(a => a.id === item.id ? item : a) : [...addresses, item];
    if(item.isDefault) next = next.map(a => ({...a, isDefault:a.id === item.id}));
    try { await saveAddresses(next); showFeedback('Address saved.'); setIsModalOpen(false); return true; } catch(e) { showFeedback(e.message); return false; }
  };
  const handleSetDefault = async id => { try { await saveAddresses(addresses.map(a => ({...a,isDefault:a.id === id}))); showFeedback('Default address updated.'); } catch(e) { showFeedback(e.message); } };
  const handleDelete = async id => { if(!window.confirm('Delete this saved address?')) return; try { await saveAddresses(addresses.filter(a => a.id !== id)); showFeedback('Address deleted.'); } catch(e) { showFeedback(e.message); } };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'work':
        return <Briefcase className="w-4 h-4" />;
      case 'other':
        return <MapPin className="w-4 h-4" />;
      default:
        return <Home className="w-4 h-4" />;
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'work':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'other':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-primary-light text-primary border-emerald-200';
    }
  };

  return (
    <div className="bg-surface rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-border shadow-subtle space-y-6">
      
      {/* Toast Feedback Notification */}
      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-emerald-800 text-xs sm:text-sm font-bold animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback('')}
            className="text-text-muted hover:text-emerald-800 p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header with Title & "+ Add New Address" Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div>
          <h3 className="text-xl font-black text-text-primary">
            {t('account.savedAddresses')}
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Your delivery addresses in Bhagabatipur and nearby areas
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Quick GPS Geolocation Banner */}
      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-primary-light/30 border border-primary/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 mt-0.5">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black text-text-primary block">
              Instant 10–15 Min Delivery Hub
            </span>
            <span className="text-[11px] text-text-secondary">
              Use GPS location detection to auto-fill your exact street, building & pincode.
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-surface hover:bg-surface-soft text-primary font-bold text-xs rounded-xl border border-primary/30 shadow-2xs transition-all cursor-pointer shrink-0 whitespace-nowrap self-start sm:self-auto"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Detect My Location</span>
        </button>
      </div>

      {/* Address Cards List */}
      <div className="space-y-3.5">
        {addresses.map((addr) => {
          const isDefault = addr.isDefault;

          return (
            <div
              key={addr.id}
              className={`p-4 sm:p-5 rounded-2xl border-2 transition-all space-y-3 ${
                isDefault
                  ? 'border-primary bg-primary-light/20 shadow-2xs'
                  : 'border-border hover:border-primary/40 bg-surface'
              }`}
            >
              {/* Card Header: Type Badge, Default Badge, Hub Time */}
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isDefault ? 'bg-primary text-white' : 'bg-surface-soft text-text-secondary border border-border'
                    }`}
                  >
                    {getTypeIcon(addr.type)}
                  </div>

                  <span className="font-black text-sm text-text-primary capitalize">
                    {addr.type}
                  </span>

                  {isDefault && (
                    <span className="text-[10px] bg-primary text-white font-black px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                      <Check className="w-2.5 h-2.5" />
                      <span>Default</span>
                    </span>
                  )}

                  <span className="text-[10px] bg-surface-soft text-text-secondary font-bold px-2 py-0.5 rounded-full border border-border shrink-0">
                    {addr.hubTime || '10–15 Mins Hub'}
                  </span>
                </div>

                {/* Top Actions: Edit / Delete */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(addr)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-surface-soft transition-colors cursor-pointer"
                    title="Edit Address"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(addr.id)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete Address"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Address Details */}
              <div className="space-y-1 text-xs text-text-secondary">
                {addr.house && (
                  <div className="font-bold text-text-primary">{addr.house}</div>
                )}
                <p className="leading-relaxed text-text-primary">
                  {addr.street}
                </p>
                {addr.landmark && (
                  <div className="text-[11px] text-text-muted">
                    Landmark: <span className="text-text-secondary font-medium">{addr.landmark}</span>
                  </div>
                )}
                <div className="text-[11px] text-text-muted">
                  {addr.city} {addr.pincode && `— ${addr.pincode}`}
                </div>
              </div>

              {/* Card Footer: Contact & Set Default */}
              <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-3 flex-wrap text-xs">
                <div className="text-text-secondary">
                  Contact:{' '}
                  <span className="font-bold text-text-primary">
                    {addr.name ? `${addr.name} (${addr.phone})` : addr.phone || phone || '+91 9002461519'}
                  </span>
                </div>

                {!isDefault && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-xs font-bold text-primary hover:text-primary-dark underline cursor-pointer"
                  >
                    Set as Default
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Add / Edit Address Modal */}
      <AddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAddress}
        initialData={editingAddress}
      />
    </div>
  );
}
