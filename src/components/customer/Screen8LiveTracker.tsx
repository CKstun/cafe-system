import React, { useState, useEffect } from 'react';
import { useCafe } from '../../context/CafeContext';
import { CafeLogo } from '../common/CafeLogo';
import { playOrderChime } from '../../utils/audioChime';
import {
  ChevronLeft,
  Volume2,
  Clock,
  PlusCircle,
  XCircle,
  Check,
  CheckCircle2,
  Utensils,
  ArrowRight,
  Coffee,
} from 'lucide-react';
import { OrderStatus } from '../../types/cafe';

export const Screen8LiveTracker: React.FC = () => {
  const {
    activeTrackingToken,
    setActiveTrackingToken,
    orders,
    requestOrderCancellation,
    updateOrderStatus,
    setCustomerScreen,
    navigate,
    customerName,
    menuItems,
  } = useCafe();

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Simulated Livewire poll / real-time heartbeat
  const [, setPollTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setPollTick((t) => t + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Filter ONLY active in-progress orders (completed, picked_up, and cancelled are removed)
  const activeOrders = orders.filter(
    (o) =>
      o.order_status !== 'completed' &&
      (o.order_status as string) !== 'picked_up' &&
      o.order_status !== 'cancelled'
  );

  // Current order being tracked
  const currentOrder =
    activeOrders.find((o) => o.tracking_token === activeTrackingToken) ||
    activeOrders[0];

  // Auto-sync active tracking token if current one was completed/removed
  useEffect(() => {
    if (activeTrackingToken && !activeOrders.some((o) => o.tracking_token === activeTrackingToken)) {
      if (activeOrders.length > 0) {
        setActiveTrackingToken(activeOrders[0].tracking_token);
      } else {
        setActiveTrackingToken(null);
      }
    } else if (!activeTrackingToken && activeOrders.length > 0) {
      setActiveTrackingToken(activeOrders[0].tracking_token);
    }
  }, [activeOrders, activeTrackingToken, setActiveTrackingToken]);

  // Clean empty state when all orders are completed or no active orders remain
  if (!currentOrder || activeOrders.length === 0) {
    return (
      <div className="flex-1 min-h-[560px] flex flex-col justify-between bg-[#FDFBF7] text-[#2B231F] relative font-sans select-none">
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 bg-[#FDFBF7] border-b border-[#2C1D11]/10 px-4 py-3">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <button
              type="button"
              onClick={() => {
                setCustomerScreen(3);
                navigate('/menu');
              }}
              className="p-1.5 -ml-1 text-[#5C3D2E] hover:bg-[#F4EFEB] rounded-full transition cursor-pointer"
              aria-label="Back to Menu"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            <div
              onClick={() => {
                setCustomerScreen(3);
                navigate('/menu');
              }}
              title="Café Pepita"
              className="cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-[#2C1D11]/10 flex items-center justify-center p-0.5">
                <CafeLogo size={34} className="w-7 h-7" showBorder={false} />
              </div>
            </div>

            <div className="w-6" />
          </div>
        </div>

        {/* Empty State Content */}
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#5C3D2E]/10 flex items-center justify-center mb-4 text-[#5C3D2E]">
            <Coffee className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#2B231F]">No Active Orders</h3>
          <p className="text-xs text-[#8C7A6B] mt-2 mb-6 leading-relaxed">
            All your orders have been completed and picked up. Ready for another handcrafted brew or artisan meal?
          </p>
          <button
            type="button"
            onClick={() => {
              setCustomerScreen(3);
              navigate('/menu');
            }}
            className="w-full py-3.5 bg-[#4A3328] hover:bg-[#3D251A] text-white font-bold text-xs rounded-full shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Order Another Item</span>
          </button>
        </div>
      </div>
    );
  }

  const isPending = currentOrder.order_status === 'pending';
  const isPreparing = currentOrder.order_status === 'preparing';
  const isReady = currentOrder.order_status === 'ready';

  const customerDisplayName = currentOrder.customer_name || customerName || 'Cheska Kimberly';

  // Format Dining Type
  const diningTypeDisplay =
    currentOrder.order_type === 'dine-in'
      ? currentOrder.table_id
        ? `DINE-IN (TABLE #${currentOrder.table_id})`
        : 'DINE-IN (COUNTER PICKUP)'
      : currentOrder.order_type === 'take-out'
      ? 'TAKE-OUT'
      : 'DELIVERY';

  const handleConfirmCancel = () => {
    requestOrderCancellation(currentOrder.tracking_token, cancelReason);
    setCancelModalOpen(false);
  };

  const handleClaimPickup = () => {
    updateOrderStatus(currentOrder.id, 'completed');
    playOrderChime();
  };

  // Helper to find image for item
  const getItemImage = (menuItemId: number, fallbackUrl?: string) => {
    if (fallbackUrl) return fallbackUrl;
    const found = menuItems.find((m) => m.id === menuItemId);
    if (found?.image_path) return found.image_path;
    return 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=300&auto=format&fit=crop&q=80';
  };

  return (
    <div className="flex-1 min-h-[560px] bg-[#FAF7F2] text-[#2B231F] font-sans relative pb-12 select-none">
      {/* Top Header matching exact screenshot */}
      <div className="sticky top-0 z-50 bg-[#FAF7F2]/95 backdrop-blur-xs border-b border-[#EAE3D9]/60 px-4 py-2.5">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setCustomerScreen(3);
              navigate('/menu');
            }}
            className="p-1 -ml-1 text-[#2B231F] hover:bg-black/5 rounded-full transition cursor-pointer"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>

          <div
            onClick={() => {
              setCustomerScreen(3);
              navigate('/menu');
            }}
            title="Café Pepita"
            className="cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-white shadow-xs border border-[#EAE3D9] flex items-center justify-center p-0.5">
              <CafeLogo size={32} className="w-6 h-6" showBorder={false} />
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-xs font-mono text-[#2B231F]">
                #{currentOrder.tracking_token}
              </span>
            </div>
            <p className="text-[10px] text-[#8C7A6B]">Live Order Tracking</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-3.5 space-y-3.5">
        {/* YOUR ORDERS (N) — TAP TO TRACK: */}
        {activeOrders.length > 0 && (
          <div>
            <p className="text-[10px] uppercase font-bold text-[#8C7A6B] tracking-wider mb-1.5">
              YOUR ORDERS ({activeOrders.length}) — TAP TO TRACK:
            </p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {activeOrders.map((ord) => {
                const isSelected = ord.tracking_token === currentOrder.tracking_token;
                return (
                  <button
                    key={ord.id}
                    type="button"
                    onClick={() => setActiveTrackingToken(ord.tracking_token)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 border cursor-pointer ${
                      isSelected
                        ? 'bg-[#4A3328] text-white border-[#4A3328] shadow-xs'
                        : 'bg-white text-[#736357] border-[#E8E1D5] hover:border-[#4A3328]'
                    }`}
                  >
                    <span>#{ord.tracking_token}</span>
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.2 rounded-full font-extrabold ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : ord.order_status === 'ready'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.order_status === 'preparing'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-stone-200 text-stone-800'
                      }`}
                    >
                      {ord.order_status}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* CARD 1: ORDER STATUS HERO BANNER */}
        <div className="bg-[#F4ECE1] rounded-3xl p-6 border border-[#EADBCE] text-center shadow-xs">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#4A3328] text-white flex items-center justify-center shadow-sm mb-3">
            {isReady ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : isPreparing ? (
              <Coffee className="w-6 h-6 animate-pulse" />
            ) : (
              <Check className="w-6 h-6 stroke-[2.5]" />
            )}
          </div>

          <h2 className="font-serif text-2xl font-bold text-[#2B231F]">
            {isReady ? 'Ready for Pickup!' : isPreparing ? 'Preparing in Kitchen...' : 'Order Placed!'}
          </h2>

          <p className="text-[11px] text-[#8C7A6B] mt-1">Order Tracking Token:</p>
          <p className="font-mono text-base font-extrabold text-[#2B231F] mt-0.5 tracking-wide">
            #{currentOrder.tracking_token}
          </p>

          {/* Announcement Callout */}
          <div className="mt-4 p-3 bg-white/80 rounded-2xl border border-[#E2D6C6] flex items-center justify-center gap-2 text-xs text-[#5C3D2E] shadow-2xs">
            <Volume2 className="w-4 h-4 text-[#5C3D2E] shrink-0" />
            <span>
              Staff will call: <strong className="font-bold">"{customerDisplayName}"</strong> over the counter once ready.
            </span>
          </div>
        </div>

        {/* CARD 2: CUSTOMER / DINING TYPE / PAYMENT */}
        <div className="bg-white rounded-2xl border border-[#EAE3D9] p-4 flex justify-between items-center text-xs shadow-2xs">
          <div>
            <p className="text-[10px] text-[#8C7A6B] uppercase font-bold">Customer</p>
            <p className="font-bold text-[#2B231F] mt-0.5">{customerDisplayName}</p>
          </div>

          <div className="text-center">
            <p className="text-[10px] text-[#8C7A6B] uppercase font-bold">Dining Type</p>
            <p className="font-bold text-[#2B231F] mt-0.5">{diningTypeDisplay}</p>
          </div>

          <div className="text-right">
            <p className="text-[10px] text-[#8C7A6B] uppercase font-bold">Payment</p>
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5 ${
                currentOrder.payment_status === 'paid'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-[#FEF3C7] text-[#92400E]'
              }`}
            >
              {currentOrder.payment_status?.toUpperCase() || 'UNPAID'}
            </span>
          </div>
        </div>

        {/* CARD 3: LIVE KITCHEN PROGRESS */}
        <div className="bg-[#F8F4EE] rounded-3xl border border-[#EAE3D9] p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-[11px] font-bold uppercase tracking-widest text-[#5C3D2E]">
              LIVE KITCHEN PROGRESS
            </h3>
            <Clock className="w-3.5 h-3.5 text-[#8C7A6B]" />
          </div>

          <div className="space-y-6 relative pl-7 border-l-2 border-[#D8C9B9] ml-2.5">
            {/* Step 1: Order Placed */}
            <div className="relative">
              <div className="absolute -left-[37px] top-0 w-6 h-6 rounded-full bg-[#4A3328] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                ✓
              </div>
              <div>
                <h4 className="font-bold text-xs text-[#2B231F]">Order Placed</h4>
                <p className="text-[11px] text-[#8C7A6B] mt-0.5">
                  Received by POS system and assigned token #{currentOrder.tracking_token}.
                </p>
              </div>
            </div>

            {/* Step 2: Preparing in Kitchen */}
            <div className="relative">
              <div
                className={`absolute -left-[37px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  isPreparing || isReady
                    ? 'bg-[#4A3328] text-white shadow-xs'
                    : 'border border-[#D8C9B9] bg-white text-[#8C7A6B]'
                } ${isPreparing ? 'ring-4 ring-[#4A3328]/20 animate-pulse' : ''}`}
              >
                {isReady ? '✓' : '2'}
              </div>
              <div>
                <h4 className={`font-bold text-xs ${isPreparing || isReady ? 'text-[#2B231F]' : 'text-[#8C7A6B]'}`}>
                  Preparing in Kitchen
                </h4>
                <p className="text-[11px] text-[#8C7A6B] mt-0.5">
                  {currentOrder.payment_status === 'paid'
                    ? 'Baristas are brewing and assembling your order items.'
                    : 'Awaiting cash confirmation or barista queue start.'}
                </p>
              </div>
            </div>

            {/* Step 3: Ready for Pickup */}
            <div className="relative">
              <div
                className={`absolute -left-[37px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  isReady
                    ? 'bg-emerald-600 text-white shadow-xs ring-4 ring-emerald-300/40 animate-bounce'
                    : 'border border-[#D8C9B9] bg-white text-[#8C7A6B]'
                }`}
              >
                3
              </div>
              <div>
                <h4 className={`font-bold text-xs ${isReady ? 'text-emerald-800' : 'text-[#8C7A6B]'}`}>
                  Ready for Pickup
                </h4>
                <p className="text-[11px] text-[#8C7A6B] mt-0.5">
                  Cashier will announce "{customerDisplayName}" once items are boxed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 4: ORDERED ITEMS */}
        <div className="bg-white rounded-3xl border border-[#EAE3D9] p-4 shadow-2xs space-y-3">
          <p className="font-bold text-[11px] uppercase tracking-wider text-[#5C3D2E]">
            ORDERED ITEMS ({currentOrder.items.length})
          </p>

          <div className="space-y-2">
            {currentOrder.items.map((it) => (
              <div key={it.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <img
                    src={getItemImage(it.menu_item_id, it.image_path)}
                    alt={it.item_name}
                    className="w-10 h-10 rounded-xl object-cover border border-[#EAE3D9] shrink-0"
                  />
                  <div>
                    <p className="font-bold text-[#2B231F]">
                      {it.quantity}x {it.item_name}
                    </p>
                    <p className="text-[10px] text-[#8C7A6B]">
                      {it.customizations?.size || 'Regular'}
                      {it.customizations?.milk_type ? ` · ${it.customizations.milk_type}` : ''}
                    </p>
                  </div>
                </div>

                <span className="font-bold font-mono text-xs text-[#2B231F]">
                  ₱{(it.price * it.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2.5 border-t border-[#F0EAE1] flex justify-between items-center text-xs font-bold">
            <span className="text-[#2B231F]">Total Amount</span>
            <span className="font-mono text-sm text-[#2B231F]">
              ₱{currentOrder.total_amount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* ACTION BUTTONS EXACTLY AS IN THE SCREENSHOT */}
        <div className="space-y-2 pt-1">
          {/* If ready, show Pickup Claim Confirmation button which removes order once claimed */}
          {isReady && (
            <button
              type="button"
              onClick={handleClaimPickup}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-full shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98 mb-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>I Have Picked Up My Order (Claim)</span>
            </button>
          )}

          {/* Button 1: Order Another Item (Dark Brown Pill) */}
          <button
            type="button"
            onClick={() => {
              setCustomerScreen(3);
              navigate('/menu');
            }}
            className="w-full py-3.5 bg-[#4A3328] hover:bg-[#3D251A] text-white font-bold text-xs rounded-full shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Order Another Item</span>
          </button>

          {/* Button 2: Cancel Order (Light Red Outlined Pill) */}
          {isPending && !currentOrder.cancellation_requested && (
            <button
              type="button"
              onClick={() => setCancelModalOpen(true)}
              className="w-full py-3 bg-[#FFF5F5] hover:bg-red-50 text-[#DC2626] font-bold text-xs rounded-full border border-red-200 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Cancel Order</span>
            </button>
          )}

          {currentOrder.cancellation_requested && (
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 text-center font-medium">
              Cancellation request submitted. Awaiting staff confirmation.
            </div>
          )}
        </div>
      </div>

      {/* Cancellation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#FDFBF7] w-full max-w-sm rounded-3xl p-6 border border-[#E6DDD4] shadow-2xl">
            <h4 className="font-serif text-base font-bold text-[#2B231F]">
              Cancel Order #{currentOrder.tracking_token}?
            </h4>
            <p className="text-xs text-[#8C7A6B] mt-1 mb-4">
              Please provide a reason. Staff will review and process your request immediately.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation..."
              rows={3}
              className="w-full p-3 bg-[#F4EFEB] border border-[#E6DDD4] rounded-xl text-xs text-[#2B231F] focus:outline-none focus:ring-2 focus:ring-[#5C4033] mb-4"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="flex-1 py-2.5 bg-[#EFE8E1] text-[#736357] font-bold text-xs rounded-full hover:bg-[#E6DDD4] transition cursor-pointer"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 bg-[#DC2626] text-white font-bold text-xs rounded-full shadow hover:bg-red-700 transition cursor-pointer"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Screen8LiveTracker;
