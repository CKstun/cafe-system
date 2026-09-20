import React from 'react';
import { useCafe } from '../../context/CafeContext';
import { CafeLogo } from './CafeLogo';
import {
  Coffee,
  Smartphone,
  ChefHat,
  ShieldCheck,
  Code2,
  QrCode,
  RotateCcw,
  Radio,
  Volume2,
  VolumeX,
  Bell,
  UserCheck,
} from 'lucide-react';
import { Role } from '../../types/cafe';

export const HeaderNav: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    navigateWithRoleCheck,
    customerScreen,
    setCustomerScreen,
    currentUserRole,
    setCurrentUserRole,
    orders,
    bottlenecks,
    echoConnected,
    soundEnabled,
    setSoundEnabled,
    triggerTestEchoBroadcast,
    resetToSeederData,
  } = useCafe();

  const activeOrdersCount = orders.filter((o) =>
    ['pending', 'preparing', 'ready'].includes(o.order_status)
  ).length;

  const lowStockCount = bottlenecks.filter(
    (b) => b.current_stock <= b.minimum_threshold
  ).length;

  return (
    <header className="bg-[#2B231F]/98 backdrop-blur-md text-[#FDFBF7] border-b border-[#3E332D] sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 shrink-0">
            <CafeLogo size={42} className="w-10 h-10 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-lg tracking-tight text-[#FDFBF7]">Café Pepita</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#5C4033] text-[#F4EFEB] font-semibold uppercase tracking-wider hidden md:inline-block">
                  Laravel 11 + Livewire
                </span>
              </div>
              <p className="text-[11px] text-[#A6978A] hidden lg:block">QR Ordering, Kitchen POS & Inventory Control</p>
            </div>
          </div>

          {/* Module Switcher Buttons */}
          <nav className="flex items-center gap-1.5 overflow-x-auto py-1">
            <button
              onClick={() => navigateWithRoleCheck('customer')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                viewMode === 'customer'
                  ? 'bg-[#5C4033] text-[#FDFBF7] shadow'
                  : 'text-[#D4C5B9] hover:text-[#FDFBF7] hover:bg-[#3E332D]'
              }`}
            >
              <Coffee className="w-4 h-4" />
              <span>Customer Ordering</span>
            </button>

            <button
              onClick={() => navigateWithRoleCheck('staff')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition relative ${
                viewMode === 'staff'
                  ? 'bg-[#5C4033] text-[#FDFBF7] shadow'
                  : 'text-[#D4C5B9] hover:text-[#FDFBF7] hover:bg-[#3E332D]'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span>Staff KDS</span>
              {activeOrdersCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 bg-amber-500 text-black text-[10px] font-bold rounded-full">
                  {activeOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => navigateWithRoleCheck('admin')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition relative ${
                viewMode === 'admin'
                  ? 'bg-[#5C4033] text-[#FDFBF7] shadow'
                  : 'text-[#D4C5B9] hover:text-[#FDFBF7] hover:bg-[#3E332D]'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Panel</span>
              {lowStockCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              )}
            </button>

            <button
              onClick={() => navigateWithRoleCheck('codebase')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                viewMode === 'codebase'
                  ? 'bg-[#5C4033] text-[#FDFBF7] shadow'
                  : 'text-[#D4C5B9] hover:text-[#FDFBF7] hover:bg-[#3E332D]'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span className="hidden md:inline">Laravel Codebase</span>
              <span className="md:hidden">Code</span>
            </button>

            <button
              onClick={() => navigateWithRoleCheck('qr_tables')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                viewMode === 'qr_tables'
                  ? 'bg-[#5C4033] text-[#FDFBF7] shadow'
                  : 'text-[#D4C5B9] hover:text-[#FDFBF7] hover:bg-[#3E332D]'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">QR Tables</span>
            </button>
          </nav>

          {/* Quick Controls: RBAC Switcher, Echo Status, Sound Toggle, Reset */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Active Spatie Role Selector */}
            <div className="flex items-center gap-1.5 bg-[#1F1A17] border border-[#3E332D] rounded-full px-2.5 py-1 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-[#D4A373]" />
              <span className="text-[10px] text-[#A6978A] uppercase font-bold hidden sm:inline">Role:</span>
              <select
                value={currentUserRole}
                onChange={(e) => setCurrentUserRole(e.target.value as Role)}
                className="bg-transparent text-[#FDFBF7] text-xs font-bold focus:outline-none cursor-pointer capitalize"
                title="Switch active user role to test Spatie RBAC middleware"
              >
                <option value="admin" className="bg-[#2B231F] text-white">Admin</option>
                <option value="staff" className="bg-[#2B231F] text-white">Staff (Barista)</option>
                <option value="customer" className="bg-[#2B231F] text-white">Customer</option>
              </select>
            </div>

            {/* Test Echo Broadcast Button */}
            <button
              onClick={triggerTestEchoBroadcast}
              title="Trigger real-time Laravel Echo order broadcast (Simulates incoming order from web socket)"
              className="p-1.5 rounded-full text-[#FAEDCD] bg-[#3E332D] hover:bg-[#5C4033] transition text-xs flex items-center gap-1 px-2.5"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="hidden lg:inline text-[11px] font-medium">Test Echo</span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Order sound alert enabled' : 'Order sound muted'}
              className={`p-1.5 rounded-full transition ${
                soundEnabled
                  ? 'text-amber-300 hover:text-amber-200 bg-[#3E332D]'
                  : 'text-[#A6978A] hover:text-[#FDFBF7] bg-[#1F1A17]'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Reset Button */}
            <button
              onClick={resetToSeederData}
              title="Reset data to default database seeder values"
              className="p-1.5 rounded-full text-[#A6978A] hover:text-[#FDFBF7] hover:bg-[#3E332D] transition text-xs flex items-center"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Customer Screen Navigation Sub-bar when in Customer View */}
      {viewMode === 'customer' && (
        <div className="bg-[#1F1A17] border-t border-[#3E332D] px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto text-xs">
            <div className="flex items-center gap-1 text-[#A6978A] whitespace-nowrap font-medium text-[11px]">
              <span>Customer Mobile Screens:</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: 1, label: '1. Splash' },
                { id: 2, label: '2. Onboarding' },
                { id: 3, label: '3. Menu Catalog' },
                { id: 4, label: '4/5. Customize' },
                { id: 6, label: '6. Cart' },
                { id: 9, label: 'Delivery Details' },
                { id: 7, label: '7. Payment' },
                { id: 8, label: '8. Live Tracker' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setCustomerScreen(s.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition ${
                    customerScreen === s.id
                      ? 'bg-[#5C4033] text-[#FDFBF7] font-bold ring-1 ring-[#8C7A6B]'
                      : 'text-[#B8A89A] hover:bg-[#2B231F]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

