import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { CafeLogo } from './CafeLogo';
import {
  AlertTriangle,
  LogOut,
  Menu,
  X,
  ShoppingBag,
} from 'lucide-react';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  onHamburgerToggle?: () => void;
  showLowStockBadge?: boolean;
  isAdmin?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onHamburgerToggle,
  showLowStockBadge = true,
  isAdmin = true,
}) => {
  const {
    currentPath,
    navigate,
    staffSession,
    adminSession,
    currentAuthSession,
    logoutUnified,
    lowStockItemsCount,
    lowStockAlerts,
    cart,
  } = useCafe();

  const [stockPopoverOpen, setStockPopoverOpen] = useState(false);

  // Derive title if not explicitly passed
  const getHeaderTitle = () => {
    if (title) return title;
    if (currentPath.includes('recipe')) return 'Raw Inventory & Recipe BOM';
    if (currentPath.includes('inventory')) return 'Raw Inventory & Recipe BOM';
    if (currentPath.includes('categories')) return 'Category Controls & Ordering';
    if (currentPath.includes('products') || currentPath.includes('menu')) return 'Menu Catalog Management';
    if (currentPath.includes('staff')) return 'Staff Accounts CRUD';
    if (currentPath.includes('roles')) return 'Roles & Permissions';
    if (currentPath.includes('analytics') || currentPath.includes('reports') || currentPath.startsWith('/admin')) {
      return 'Sales Reports & Analytics';
    }
    if (currentPath.startsWith('/staff')) return 'Staff & Kitchen KDS';
    if (currentPath === '/cart') return 'Your Cart';
    if (currentPath.startsWith('/order-status') || currentPath === '/tracking') return 'Order Tracking';
    return 'Café Pepita';
  };

  const handleLogout = async () => {
    await logoutUnified();
  };

  const isLoggedIn = !!(currentAuthSession || staffSession || adminSession);

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7] border-b border-[#2C1D11]/10 px-4 py-3 flex items-center justify-between">
      {/* ========================================================================= */}
      {/* LEFT ALIGNMENT SEQUENCE:                                                  */}
      {/* 1. Hamburger Menu Button (visible on smaller screens / tablets: < lg)      */}
      {/* 2. Café Pepita Logo (tablet and mobile viewports: block lg:hidden)         */}
      {/* 3. Active Page Title (e.g., "Sales Reports & Analytics")                   */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {/* 1. Hamburger Menu Button (visible on tablets/mobile: block lg:hidden) */}
        {onHamburgerToggle && (
          <button
            type="button"
            onClick={onHamburgerToggle}
            className="block lg:hidden p-1.5 -ml-1 text-[#2C1D11] hover:bg-[#4A2E19]/10 rounded-xl transition cursor-pointer"
            title="Open Navigation"
            aria-label="Open Navigation"
          >
            <Menu className="w-5 h-5 text-[#2C1D11]" />
          </button>
        )}

        {/* 2. Café Pepita Logo (placed directly after the Hamburger icon on tablets and mobile screens) */}
        <div
          onClick={() => navigate(isAdmin ? '/admin/reports' : '/menu')}
          className="block lg:hidden flex items-center cursor-pointer shrink-0"
          title="Café Pepita"
        >
          <div className="w-8 h-8 rounded-full bg-white shadow-2xs border border-[#2C1D11]/10 flex items-center justify-center p-0.5">
            <CafeLogo size={28} className="w-6 h-6" showBorder={false} />
          </div>
        </div>

        {/* 3. Active Page Title */}
        <h1 className="font-display font-bold text-sm sm:text-base md:text-lg text-[#2C1D11] truncate tracking-tight">
          {getHeaderTitle()}
        </h1>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT ALIGNMENT SEQUENCE:                                                 */}
      {/* 1. Low Stock Alert Badge / Icon                                           */}
      {/* 2. Logout Button (text-[#4A2E19] hover:opacity-80 font-medium)            */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Low Stock Alert Badge / Icon */}
        {showLowStockBadge && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setStockPopoverOpen(!stockPopoverOpen)}
              className={`p-1.5 sm:p-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 relative ${
                lowStockItemsCount > 0
                  ? 'bg-amber-50 text-amber-800 border border-amber-200/80 hover:bg-amber-100'
                  : 'text-[#4A2E19]/70 hover:bg-[#4A2E19]/5'
              }`}
              title={
                lowStockItemsCount > 0
                  ? `${lowStockItemsCount} low stock supply alert(s)`
                  : 'All inventory supplies optimal'
              }
              aria-label="Low Stock Supply Alerts"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              {lowStockItemsCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#DC2626] text-white rounded-full leading-none">
                  {lowStockItemsCount}
                </span>
              )}
            </button>

            {/* Low Stock Alert Dropdown Popover */}
            {stockPopoverOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setStockPopoverOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#FDFBF7] rounded-2xl p-4 shadow-xl border border-[#2C1D11]/15 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2C1D11]/10">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <h4 className="font-bold text-xs text-[#2C1D11]">
                        Low Stock Bottlenecks
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                      {lowStockItemsCount} alert{lowStockItemsCount !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {lowStockItemsCount === 0 ? (
                    <p className="text-xs text-[#2C1D11]/60 py-3 text-center">
                      All critical supplies and recipe ingredients are sufficiently stocked.
                    </p>
                  ) : (
                    <div className="max-h-60 overflow-y-auto space-y-2 divide-y divide-[#2C1D11]/5">
                      {lowStockAlerts.map((item) => (
                        <div
                          key={item.id}
                          className="pt-2 flex items-center justify-between text-xs"
                        >
                          <div className="truncate pr-2">
                            <p className="font-semibold text-[#2C1D11] truncate">{item.name}</p>
                            <p className="text-[10px] text-[#2C1D11]/60">
                              Threshold: {item.threshold} {item.unit || 'units'}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-red-100 text-[#DC2626] whitespace-nowrap">
                            {item.current} {item.unit || ''} left
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 pt-2 border-t border-[#2C1D11]/10 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setStockPopoverOpen(false);
                        navigate('/admin/inventory');
                      }}
                      className="text-[11px] font-bold text-[#4A2E19] hover:underline cursor-pointer"
                    >
                      Manage Inventory →
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Customer Cart Shortcut (if in customer view) */}
        {cart.length > 0 && !isLoggedIn && (
          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="relative p-1.5 sm:p-2 text-[#4A2E19] hover:bg-[#4A2E19]/5 rounded-xl transition cursor-pointer"
            title="View Cart"
            aria-label="View Cart"
          >
            <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            <span className="absolute -top-1 -right-1 bg-[#4A2E19] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
              {cart.length}
            </span>
          </button>
        )}

        {/* Logout Button */}
        {isLoggedIn && (
          <button
            type="button"
            onClick={handleLogout}
            className="text-[#4A2E19] hover:opacity-80 font-medium text-xs sm:text-sm flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-[#4A2E19]/5 transition cursor-pointer"
            title="Logout Session"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
