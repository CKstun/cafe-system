import React, { useState, useMemo } from 'react';
import { Sidebar, NavItem } from './Sidebar';
import { Header } from '../common/Header';
import { useCafe } from '../../context/CafeContext';
import {
  TrendingUp,
  Users,
  KeyRound,
  Coffee,
  Layers,
  Package,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tabId: string, path: string) => void;
  pageTitle?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  pageTitle,
}) => {
  const { inventoryItems, lowStockItemsCount } = useCafe();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Compute live low stock count for inventory badge
  const lowOrDepletedRawCount = useMemo(() => {
    if (!inventoryItems || inventoryItems.length === 0) return lowStockItemsCount;
    return inventoryItems.filter((it) => it.stock_quantity <= it.low_stock_threshold).length;
  }, [inventoryItems, lowStockItemsCount]);

  // Sidebar navigation items
  const navItems: NavItem[] = useMemo(() => [
    {
      id: 'analytics',
      label: 'Sales Reports & Analytics',
      icon: TrendingUp,
      path: '/admin/reports',
    },
    {
      id: 'staff',
      label: 'Staff Accounts CRUD',
      icon: Users,
      path: '/admin/staff',
    },
    {
      id: 'roles',
      label: 'Roles & Permissions',
      icon: KeyRound,
      path: '/admin/roles',
    },
    {
      id: 'products',
      label: 'Menu Catalog Management',
      icon: Coffee,
      path: '/admin/products',
    },
    {
      id: 'categories',
      label: 'Category Controls & Ordering',
      icon: Layers,
      path: '/admin/categories',
    },
    {
      id: 'inventory',
      label: 'Raw Inventory & Recipe BOM',
      icon: Package,
      path: '/admin/inventory',
      badge: lowOrDepletedRawCount,
    },
  ], [lowOrDepletedRawCount]);

  // Derive active label for header
  const currentTitle = useMemo(() => {
    if (pageTitle) return pageTitle;
    if (activeTab === 'recipes') return 'Raw Inventory & Recipe BOM';
    const current = navItems.find((item) => item.id === activeTab);
    return current ? current.label : 'Sales Reports & Analytics';
  }, [pageTitle, activeTab, navItems]);

  const handleSelectNav = (id: string, path: string) => {
    onTabChange(id, path);
    setMobileDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2B231F] flex flex-col font-sans selection:bg-[#4A2E19] selection:text-[#FDFBF7]">
      {/* ========================================================================= */}
      {/* 2. DESKTOP LEFT SIDEBAR NAVIGATION (SCREEN SIZES >= 1024px / lg:flex)     */}
      {/* Fixed left-side navigation sidebar: lg:w-64 min-h-screen bg-[#FDFBF7]     */}
      {/* ========================================================================= */}
      <aside className="lg:w-64 min-h-screen bg-[#FDFBF7] border-r border-[#2C1D11]/10 hidden lg:flex lg:flex-col fixed top-0 left-0 bottom-0 z-30 shadow-2xs">
        <Sidebar
          items={navItems}
          activeId={activeTab}
          onSelect={handleSelectNav}
        />
      </aside>

      {/* ========================================================================= */}
      {/* 3. TABLET/iPAD & MOBILE SLIDE-OUT DRAWER (< 1024px / < lg)                */}
      {/* Slide-out sidebar overlay opened via Header hamburger button              */}
      {/* ========================================================================= */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setMobileDrawerOpen(false)}
            aria-label="Close navigation overlay"
          />

          {/* Slide-out Sidebar Drawer */}
          <div className="relative w-72 max-w-[85vw] bg-[#FDFBF7] h-full shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200 border-r border-[#2C1D11]/10">
            <Sidebar
              items={navItems}
              activeId={activeTab}
              onSelect={handleSelectNav}
              onCloseMobile={() => setMobileDrawerOpen(false)}
              isMobileDrawer={true}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MAIN CONTENT AREA (Offset lg:ml-64 on desktop, full width on tablets)  */}
      {/* ========================================================================= */}
      <div className="lg:ml-64 w-full lg:w-[calc(100%-16rem)] flex-1 flex flex-col min-w-0">
        {/* Sticky Header with Hamburger (< lg), Cafe Pepita Logo (< lg), Title, & Right Controls */}
        <Header
          title={currentTitle}
          onHamburgerToggle={() => setMobileDrawerOpen(true)}
          showLowStockBadge={true}
          isAdmin={true}
        />

        {/* Content Container without Horizontal Scroll */}
        <main className="p-4 sm:p-6 lg:p-6 flex-1 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
