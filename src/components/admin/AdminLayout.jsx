import React, { useState, useMemo } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from '../common/Header';
import { useCafe } from '../../context/CafeContext';
import {
  TrendingUp,
  Users,
  Coffee,
  Layers,
  Package,
  UtensilsCrossed,
} from 'lucide-react';

/**
 * Admin Shell Layout Component
 * Integrates Left Sidebar, Responsive Mobile Drawer, and Sticky Header
 * Palette: #FDFBF7 cream and #4A2E19 coffee brown
 */
export const AdminLayout = ({
  children,
  activeTab,
  onTabChange,
  pageTitle,
}) => {
  const { inventoryItems = [], lowStockItemsCount = 0 } = useCafe();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Compute live low stock count for raw inventory badge
  const lowOrDepletedRawCount = useMemo(() => {
    if (!inventoryItems || inventoryItems.length === 0) return lowStockItemsCount;
    return inventoryItems.filter((it) => it.stock_quantity <= it.low_stock_threshold).length;
  }, [inventoryItems, lowStockItemsCount]);

  // Distinct Admin Left Sidebar navigation items
  // Note: 'Roles & Permissions' is completely stripped out
  // 'Recipe / BOM Settings' is a dedicated standalone route & tab
  const navItems = useMemo(() => [
    {
      id: 'analytics',
      label: 'Sales Reports & Analytics',
      icon: TrendingUp,
      path: '/admin/reports',
    },
    {
      id: 'staff',
      label: 'Staff Account Management',
      icon: Users,
      path: '/admin/staff',
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
      label: 'Raw Inventory Management',
      icon: Package,
      path: '/admin/inventory',
      badge: lowOrDepletedRawCount,
    },
    {
      id: 'recipes',
      label: 'Recipe / BOM Settings',
      icon: UtensilsCrossed,
      path: '/admin/recipes',
    },
  ], [lowOrDepletedRawCount]);

  // Derive active title for sticky header
  const currentTitle = useMemo(() => {
    if (pageTitle) return pageTitle;
    if (activeTab === 'recipes') return 'Recipe / BOM Settings';
    if (activeTab === 'inventory') return 'Raw Inventory Management';
    const current = navItems.find((item) => item.id === activeTab);
    return current ? current.label : 'Sales Reports & Analytics';
  }, [pageTitle, activeTab, navItems]);

  const handleSelectNav = (id, path) => {
    onTabChange(id, path);
    setMobileDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2B231F] flex flex-col font-sans selection:bg-[#4A2E19] selection:text-[#FDFBF7]">
      {/* Desktop Left Sidebar (>= 1024px) */}
      <aside className="lg:w-64 min-h-screen bg-[#FDFBF7] border-r border-[#2C1D11]/10 hidden lg:flex lg:flex-col fixed top-0 left-0 bottom-0 z-30 shadow-2xs">
        <Sidebar
          items={navItems}
          activeId={activeTab}
          onSelect={handleSelectNav}
        />
      </aside>

      {/* Tablet & Mobile Slide-out Drawer (< 1024px) */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setMobileDrawerOpen(false)}
            aria-label="Close navigation overlay"
          />
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

      {/* Main Content Area */}
      <div className="lg:ml-64 w-full lg:w-[calc(100%-16rem)] flex-1 flex flex-col min-w-0">
        <Header
          title={currentTitle}
          onHamburgerToggle={() => setMobileDrawerOpen(true)}
          showLowStockBadge={true}
          isAdmin={true}
        />

        <main className="p-4 sm:p-6 lg:p-6 flex-1 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
