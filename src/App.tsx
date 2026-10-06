import React from 'react';
import { PlatformProvider, usePlatform } from './context/PlatformContext';
import { TopRoleSwitcher } from './components/navigation/TopRoleSwitcher';
import { AdminLayout } from './components/admin/AdminLayout';
import { CustomerApp } from './components/customer/CustomerApp';
import { ShopOwnerPortal } from './components/shop/ShopOwnerPortal';
import { DeliveryPartnerPortal } from './components/delivery/DeliveryPartnerPortal';
import { AcceptanceTestRunner } from './components/testing/AcceptanceTestRunner';
import { Shield, Smartphone, Store, Bike, CheckCircle2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeRoleView } = usePlatform();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Platform Multi-Role Switcher Header */}
      <TopRoleSwitcher />

      {/* Main Viewport Router */}
      <div className="flex-1">
        {activeRoleView === 'SUPER_ADMIN' && <AdminLayout />}
        {activeRoleView === 'CUSTOMER' && <CustomerApp />}
        {activeRoleView === 'SHOP_OWNER' && <ShopOwnerPortal />}
        {activeRoleView === 'DELIVERY_PARTNER' && <DeliveryPartnerPortal />}
        {activeRoleView === 'ACCEPTANCE_TEST' && <AcceptanceTestRunner />}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <PlatformProvider>
      <AppContent />
    </PlatformProvider>
  );
}
