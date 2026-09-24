import React from 'react';
import { CafeLogo } from '../common/CafeLogo';
import { useCafe } from '../../context/CafeContext';
import { LogOut, X } from 'lucide-react';

/**
 * Admin Left Navigation Sidebar & Mobile Drawer Component
 * Styled with Café Pepita Palette: #FDFBF7 cream and #4A2E19 coffee brown
 */
export const Sidebar = ({
  items = [],
  activeId,
  onSelect,
  onCloseMobile,
  isMobileDrawer = false,
}) => {
  const { logoutUnified, navigate } = useCafe();

  const handleLogout = async () => {
    if (onCloseMobile) onCloseMobile();
    await logoutUnified();
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#FDFBF7] text-[#2B231F] select-none">
      {/* Top Section: Branding & Navigation Items */}
      <div className="flex flex-col min-h-0">
        {/* Sidebar Brand Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-[#2C1D11]/10 shrink-0">
          <div
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              navigate('/admin/reports');
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-[#2C1D11]/10 flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform duration-150">
              <CafeLogo size={36} className="w-8 h-8" showBorder={false} />
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-black text-base text-[#2C1D11] tracking-tight truncate leading-tight group-hover:text-[#4A2E19] transition-colors">
                Café Pepita
              </h2>
              <p className="text-[11px] text-[#4A2E19]/70 font-medium">
                Admin Portal
              </p>
            </div>
          </div>

          {/* Close button for mobile slide-out drawer */}
          {isMobileDrawer && onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-[#2C1D11]/60 hover:text-[#2C1D11] hover:bg-[#4A2E19]/10 transition cursor-pointer"
              aria-label="Close Navigation Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Primary Vertical Navigation Links */}
        <nav className="p-3 space-y-1.5 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelect(item.id, item.path);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 text-xs font-semibold text-left transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#4A2E19] text-white rounded-xl shadow-sm'
                    : 'text-[#2C1D11] hover:bg-[#4A2E19]/10 rounded-xl'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {Icon && (
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-amber-200' : 'text-[#4A2E19]'
                      }`}
                    />
                  )}
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && item.badge > 0 ? (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full ml-2 shrink-0 ${
                      isActive
                        ? 'bg-amber-300 text-stone-900'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Single Minimalist Logout Button */}
      <div className="p-3 border-t border-[#2C1D11]/10 bg-[#FDFBF7] shrink-0">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full text-red-600 hover:bg-red-50 rounded-xl p-3 flex items-center gap-2 text-xs font-semibold transition-colors cursor-pointer"
          title="Logout Session"
          aria-label="Logout"
        >
          <LogOut className="w-4 h-4 text-red-600 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
