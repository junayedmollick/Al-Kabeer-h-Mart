import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  User,
  ShoppingBag,
  MapPin,
  Crown,
  Settings,
  LogOut,
  Globe,
  ChevronRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  OrdersTab,
  ProfileTab,
  AddressesTab,
  VipTab,
  LanguageTab,
  SettingsTab
} from '../components/account';

export function Account({ onOpenVip, defaultTab = 'profile' }) {
  const { isVip, vipMember } = useCart();
  const { user, logout, updateProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabQuery = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabQuery || defaultTab);

  useEffect(() => {
    if (tabQuery) {
      setActiveTab(tabQuery);
    } else if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [tabQuery, defaultTab]);

  const profile = user;
  const setProfile = updateProfile;

  const handleLogout = async () => {
    try { await logout(); } catch(e) { alert(e.message); return; }
    navigate('/');
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'profile') {
      searchParams.delete('tab');
      setSearchParams(searchParams, { replace: true });
    } else {
      setSearchParams({ tab: tabId }, { replace: true });
    }
  };

  const navTabs = [
    { id: 'profile', label: t('account.profile'), icon: User },
    { id: 'orders', label: t('account.orders'), icon: ShoppingBag },
    { id: 'addresses', label: t('account.savedAddresses'), icon: MapPin },
    { id: 'vip', label: t('account.vipMembership'), icon: Crown },
    { id: 'language', label: t('account.language'), icon: Globe },
    { id: 'settings', label: t('account.settings'), icon: Settings },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Top Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-text-secondary font-medium mb-6">
        <Link to="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3 h-3 text-text-muted" />
        <button
          type="button"
          onClick={() => handleTabChange('profile')}
          className="hover:text-primary transition-colors cursor-pointer"
        >
          {t('account.title')}
        </button>
        {activeTab !== 'profile' && (
          <>
            <ChevronRight className="w-3 h-3 text-text-muted" />
            <span className="text-primary font-bold">
              {navTabs.find((item) => item.id === activeTab)?.label || activeTab}
            </span>
          </>
        )}
      </nav>

      {/* Mobile User Profile Summary Strip */}
      <div className="lg:hidden bg-surface rounded-2xl p-3.5 border border-border shadow-2xs flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary text-white font-black text-base flex items-center justify-center shadow-2xs shrink-0">
            {profile.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-black uppercase tracking-wider text-text-muted block">
              Welcome back
            </span>
            <div className="text-sm font-black text-text-primary truncate">
              {profile.name}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isVip ? (
                <span className="bg-secondary/20 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Crown className="w-2.5 h-2.5 fill-amber-700 text-amber-700" />
                  <span>999 VIP</span>
                </span>
              ) : (
                <span className="text-[10px] text-text-muted font-medium">Standard Shopper</span>
              )}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="p-2 rounded-xl text-danger hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
          title={t('account.logout')}
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile Sticky Tab Navigation Bar */}
      <div className="lg:hidden sticky top-[58px] sm:top-[66px] z-30 -mx-4 px-4 sm:-mx-6 sm:px-6 py-2 bg-surface/95 backdrop-blur-md border-y border-border/80 shadow-2xs mb-4">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer whitespace-nowrap select-none ${
                  isActive
                    ? 'bg-primary text-white shadow-xs font-black'
                    : 'bg-surface-soft/80 hover:bg-surface-soft text-text-secondary hover:text-text-primary border border-border/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-text-muted'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modern Dashboard Layout: Desktop Sidebar + Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8 items-start">
        
        {/* DESKTOP SIDEBAR NAVIGATION (Sticky on scroll) */}
        <div className="hidden lg:flex lg:col-span-1 flex-col gap-4 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)]">
          
          {/* User Profile Summary Card */}
          <div className="bg-surface rounded-3xl p-5 border border-border shadow-subtle flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary text-white font-black text-xl flex items-center justify-center shadow-xs shrink-0">
              {profile.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">
                Welcome back
              </span>
              <h2 className="text-base font-black text-text-primary truncate">
                {profile.name}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                {isVip ? (
                  <span className="bg-secondary/20 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Crown className="w-2.5 h-2.5 fill-amber-700 text-amber-700" />
                    <span>999 VIP</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-text-muted font-medium">Standard Shopper</span>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Menu List */}
          <div className="bg-surface rounded-3xl p-2.5 border border-border shadow-subtle flex flex-col gap-1">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer text-left ${
                    isActive
                      ? 'bg-primary text-white shadow-xs font-black'
                      : 'text-text-secondary hover:text-primary hover:bg-surface-soft'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-text-muted'}`} />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold text-danger hover:bg-rose-50 transition-colors shrink-0 text-left cursor-pointer mt-1"
            >
              <LogOut className="w-4 h-4" />
              <span className="whitespace-nowrap">{t('account.logout')}</span>
            </button>
          </div>
        </div>

        {/* MAIN DASHBOARD CONTENT AREA */}
        <div className="lg:col-span-3 min-w-0 w-full">
          {activeTab === 'profile' && (
            <ProfileTab profile={profile} setProfile={setProfile} />
          )}

          {activeTab === 'orders' && <OrdersTab />}

          {activeTab === 'addresses' && (
            <AddressesTab phone={profile.phone} />
          )}

          {activeTab === 'vip' && (
            <VipTab onOpenVip={onOpenVip} userName={profile.name} />
          )}

          {activeTab === 'language' && <LanguageTab />}

          {activeTab === 'settings' && <SettingsTab />}
        </div>

      </div>
    </div>
  );
}
