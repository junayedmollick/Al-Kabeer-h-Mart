import { ProductDetail } from './pages/ProductDetail';
import { CatalogProvider } from './context/CatalogContext';
import { AdminDataProvider } from './context/AdminDataContext';
import { RequireAuth } from './components/RequireAuth';
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import { Header, CategoryNav, Footer, MobileBottomNav } from './components/layout';
import { VipModal } from './components/modals';
import { Home } from './pages/Home';
import { CategoryPage } from './pages/CategoryPage';
import { Account } from './pages/Account';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Login } from './pages/Login';
import { OrderConfirmation } from './pages/OrderConfirmation';
const PrivacyPolicy = lazy(() => import('./pages/LegalPages').then(module => ({default:module.PrivacyPolicy})));
const TermsOfService = lazy(() => import('./pages/LegalPages').then(module => ({default:module.TermsOfService})));

// Modern Admin Panel imports
const AdminLogin = lazy(() => import('./admin/pages/AdminLogin').then(module => ({default:module.AdminLogin})));
const AdminLayout = lazy(() => import('./admin/components/AdminLayout').then(module => ({ default: module.AdminLayout })));
const AdminDashboard = lazy(() => import('./admin/pages/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const AdminProducts = lazy(() => import('./admin/pages/AdminProducts').then(module => ({ default: module.AdminProducts })));
const AdminCategories = lazy(() => import('./admin/pages/AdminCategories').then(module => ({ default: module.AdminCategories })));
const AdminOrders = lazy(() => import('./admin/pages/AdminOrders').then(module => ({ default: module.AdminOrders })));
const AdminCustomers = lazy(() => import('./admin/pages/AdminCustomers').then(module => ({ default: module.AdminCustomers })));
const AdminPromotions = lazy(() => import('./admin/pages/AdminPromotions').then(module => ({ default: module.AdminPromotions })));
const AdminSettings = lazy(() => import('./admin/pages/AdminSettings').then(module => ({ default: module.AdminSettings })));

// Scroll to top on page navigation
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function MainLayout() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isVipOpen, setIsVipOpen] = useState(false);
  const location = useLocation();

  const hideCategoryNav = ['/orders', '/cart', '/account', '/login', '/checkout', '/order-confirmation', '/privacy-policy', '/terms-of-service'].some(
    (path) => location.pathname === path || location.pathname.startsWith(path + '/')
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary selection:bg-primary-light selection:text-primary w-full max-w-full">
      <ScrollToTop />

      {/* Fixed Sticky Header & Dynamic Category Navigation Suite */}
      <div className="sticky top-0 z-40 w-full bg-surface shadow-subtle">
        <Header
          onOpenVip={() => setIsVipOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        {!hideCategoryNav && <CategoryNav />}
      </div>

      {/* Main Routed Content Area */}
      <main className="flex-1 w-full max-w-full overflow-x-clip">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onOpenVip={() => setIsVipOpen(true)}
              />
            }
          />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/account" element={<RequireAuth><Account onOpenVip={() => setIsVipOpen(true)} /></RequireAuth>} />
          <Route path="/cart" element={<Cart onOpenVip={() => setIsVipOpen(true)} />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:orderId" element={<RequireAuth><OrderConfirmation /></RequireAuth>} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/login" element={<Login />} />
          <Route path="/orders" element={<Navigate to="/account?tab=orders" replace />} />
          {/* Catch-all fallback route */}
          <Route
            path="*"
            element={
              <Home
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onOpenVip={() => setIsVipOpen(true)}
              />
            }
          />
        </Routes>
      </main>

      {/* Redesigned Light Modern Footer */}
      <Footer onOpenVip={() => setIsVipOpen(true)} />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* VIP Modal */}
      <VipModal isOpen={isVipOpen} onClose={() => setIsVipOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <Router><Suspense fallback={<div className="p-12 text-center">Loading page…</div>}>
      <LanguageProvider>
        <AuthProvider><CatalogProvider>
          <CartProvider>
            <OrderProvider>
              <Routes>
                {/* Modern Admin Dashboard Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<RequireAuth admin><AdminDataProvider><AdminLayout /></AdminDataProvider></RequireAuth>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="promotions" element={<AdminPromotions />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* Customer-Facing Store Routes */}
                <Route path="/*" element={<MainLayout />} />
              </Routes>
            </OrderProvider>
          </CartProvider>
        </CatalogProvider></AuthProvider>
      </LanguageProvider>
    </Suspense></Router>
  );
}
