import React, { useEffect } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Bell, Radio, ArrowRight, X, Sparkles, Coffee } from 'lucide-react';

export const EchoOrderToast: React.FC = () => {
  const {
    latestBroadcast,
    clearLatestBroadcast,
    viewMode,
    navigateWithRoleCheck,
    soundEnabled,
    setSoundEnabled,
  } = useCafe();

  useEffect(() => {
    if (!latestBroadcast) return;
    const timer = setTimeout(() => {
      clearLatestBroadcast();
    }, 9000);
    return () => clearTimeout(timer);
  }, [latestBroadcast, clearLatestBroadcast]);

  if (!latestBroadcast) return null;

  const { payload } = latestBroadcast;

  const handleOpenKDS = () => {
    clearLatestBroadcast();
    navigateWithRoleCheck('staff');
  };

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="bg-[#2B231F] text-[#FDFBF7] rounded-2xl shadow-2xl border border-[#5C4033] p-4 relative overflow-hidden ring-1 ring-amber-500/30">
        {/* Glowing pulse bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4A373] via-[#FAEDCD] to-[#D4A373] animate-pulse" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#5C4033] flex items-center justify-center text-[#FAEDCD] animate-bounce">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#3E332D] text-[10px] font-mono font-medium text-[#D4C5B9]">
                  <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                  Echo: private-staff.orders
                </span>
              </div>
              <h4 className="text-xs font-bold text-[#FDFBF7] mt-1">
                New Order Received! #{payload.tracking_token}
              </h4>
            </div>
          </div>

          <button
            onClick={clearLatestBroadcast}
            className="text-[#A6978A] hover:text-[#FDFBF7] p-1 rounded-lg hover:bg-[#3E332D] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Order Details Body */}
        <div className="mt-3 bg-[#1F1A17] rounded-xl p-3 text-xs space-y-1.5 font-sans border border-[#3E332D]">
          <div className="flex items-center justify-between text-[#E5DCD1]">
            <span className="font-semibold text-white">{payload.customer_name}</span>
            <span className="font-mono text-emerald-400 font-bold">
              ₱{payload.total_amount.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#A6978A]">
            <span className="capitalize">
              {payload.order_type === 'dine-in'
                ? 'Dine-in (Counter Pickup)'
                : payload.order_type === 'delivery'
                ? 'Delivery Order'
                : 'Take-out Order'}
            </span>
            <span className="uppercase text-[10px] font-medium tracking-wide text-[#C4B5A5]">
              {payload.payment_method} • {payload.payment_status}
            </span>
          </div>

          {payload.items && payload.items.length > 0 && (
            <div className="pt-1 border-t border-[#2B231F] text-[11px] text-[#C4B5A5]">
              {payload.items.map((it, idx) => (
                <div key={idx} className="truncate">
                  • {it.quantity}x {it.name} {it.size ? `(${it.size})` : ''}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="mt-3 flex items-center justify-between gap-2">
          {viewMode !== 'staff' ? (
            <button
              onClick={handleOpenKDS}
              className="flex-1 py-1.5 px-3 rounded-xl bg-[#5C4033] hover:bg-[#6E4F3F] text-[#FDFBF7] text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>View in Staff KDS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="text-[11px] text-emerald-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Queue automatically updated</span>
            </div>
          )}

          <button
            onClick={clearLatestBroadcast}
            className="py-1.5 px-3 rounded-xl bg-[#3E332D] hover:bg-[#4D4039] text-[#D4C5B9] text-xs font-medium transition"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
