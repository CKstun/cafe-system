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
    guestSessionId,
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

  // Filter ONLY active in-progress orders strictly based on unique guest_session_id (UUID v4)
  // NEVER on customer_name so same-name customers are strictly isolated
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
        <div className="sticky top-0 z-50 bg-[#FDFBF7] border-b border-[#2C1D11]/10 px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto">
            {/* LEFT: Back button + non-clickable logo, grouped together */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setCustomerScreen(3);
                  navigate('/menu');
                }}
                className="p-1.5 -ml-1 text-[#5C3D2E] hover:bg-[#F4EFEB] rounded-full transition cursor-pointer"
                aria-label="Back"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              </button>

              <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-[#2C1D11]/10 flex items-center justify-center p-0.5">
                <CafeLogo size={34} className="w-7 h-7" showBorder={false} />
              </div>
            </div>

            <div className="w-6" />
          </div>
        </div>

        {/* Empty State Content */}
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center max-w-sm sm:max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#5C3D2E]/10 flex items-center justify-center mb-4 text-[#5C3D2E]">
            <Coffee className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#2B231F]">No Active Orders</h3>
          <p className="text-xs text-[#8C7A6B] mt-2 mb-6 leading-relaxed">
            All your orders have been completed and picked up.
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

  const orderNumber = currentOrder.order_number || (currentOrder.id % 10000);
  const rawCustomerName = currentOrder.customer_name || customerName || 'Guest';
  // Prominent disambiguated label across all views (e.g., "Mark — Order #1042")
  const customerOrderLabel = `${rawCustomerName} — Order #${orderNumber}`;

  // Format Dining Type
  const diningTypeDisplay =
    currentOrder.order_type === 'dine-in'
      ? 'DINE-IN'
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
      <div className="sticky top-0 z-50 bg-[#FAF7F2]/95 backdrop-blur-xs border-b border-[#EAE3D9]/60 px-4 sm:px-6 py-2.5">
        <div className="max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto flex items-center justify-between">
          {/* LEFT: Back button + non-clickable logo, grouped together */}
          <div className="flex items-center gap-2">
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

            <div className="w-9 h-9 rounded-full bg-white shadow-xs border border-[#EAE3D9] flex items-center justify-center p-0.5">
              <CafeLogo size={32} className="w-6 h-6" showBorder={false} />
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-xs text-[#2B231F] max-w-[160px] truncate">
                {customerOrderLabel}
              </span>
            </div>
            <p className="text-[10px] font-mono text-[#8C7A6B]">#{currentOrder.order_number || currentOrder.tracking_token}</p>
          </div>
        </div>
      </div>

      <div className="max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-4 sm:px-6 pt-3.5 space-y-3.5">
        {/* YOUR ORDERS (N) — TAP TO TRACK: */}
        {activeOrders.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] uppercase font-bold text-[#8C7A6B] tracking-wider">
                YOUR ORDERS ({activeOrders.length}):
              </p>
              {/*<span className="text-[9px] text-[#5C3D2E] font-medium bg-[#F4ECE1] px-2 py-0.5 rounded-full border border-[#EADBCE]">
                Session ID: {guestSessionId.slice(0, 8)}...
              </span> */}
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {activeOrders.map((ord) => {
                const isSelected = ord.tracking_token === currentOrder.tracking_token;
                const ordNum = ord.order_number || (ord.id % 10000);
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
                    <span className="font-bold">Order #{ordNum}</span>

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

        {/* CARD 1: ORDER STATUS HERO BANNER
        <div className="bg-[#F4ECE1] rounded-3xl p-6 border border-[#EADBCE] text-center shadow-xs">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#4A3328] text-white flex items-center justify-center shadow-sm mb-2.5">
            {isReady ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : isPreparing ? (
              <Coffee className="w-6 h-6 animate-pulse" />
            ) : (
              <Check className="w-6 h-6 stroke-[2.5]" />
            )}
          </div>

          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#4A3328] text-white text-[11px] font-mono font-bold shadow-xs mb-2">
            <span>Order #{orderNumber}</span>
          </div>

          <h2 className="font-serif text-2xl font-bold text-[#2B231F]">
            {isReady ? 'Ready for Pickup!' : isPreparing ? 'Preparing' : 'Order Placed!'}
          </h2>

          <p className="text-[11px] text-[#8C7A6B] mt-1.5">Order Number:</p>
          <p className="font-mono text-base font-extrabold text-[#2B231F] mt-0.5 tracking-wide">
            #{currentOrder.order_number || currentOrder.tracking_token}
          </p>

          {/* Announcement Callout with Prominent Customer Order Label 
          <div className="mt-4 p-3 bg-white/90 rounded-2xl border border-[#E2D6C6] flex items-center justify-center gap-2 text-xs text-[#5C3D2E] shadow-2xs">
            <Volume2 className="w-4 h-4 text-[#5C3D2E] shrink-0" />
            {/*<span>
              Staff will call: <strong className="font-bold text-[#2B231F]">"{customerOrderLabel}"</strong> over the counter once ready.
            </span>
          </div>
        </div>  */}

        {/* CARD 2 + CARD 3: Order Status and Dining/Payment side-by-side on md+ so wide screens use the extra space */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-start">
          {/* CARD 2: LIVE KITCHEN PROGRESS */}
          <div className="bg-[#F8F4EE] rounded-3xl border border-[#EAE3D9] p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-[11px] font-bold uppercase tracking-widest text-[#5C3D2E]">
                ORDER STATUS
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
                  {/**<p className="text-[11px] text-[#8C7A6B] mt-0.5">
                    Received by POS system and assigned token #{currentOrder.tracking_token}.
                  </p> */}
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
                    Preparing...
                  </h4>
                  {/**<p className="text-[11px] text-[#8C7A6B] mt-0.5">
                    {currentOrder.payment_status === 'paid'
                      ? 'Baristas are brewing and assembling your order items.'
                      : 'Awaiting cash confirmation or barista queue start.'}
                  </p> */}
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
                  {/*<p className="text-[11px] text-[#8C7A6B] mt-0.5">
                    Cashier will announce "{customerOrderLabel}" once items are boxed.
                  </p> */}
                </div>
              </div>
            </div>
          </div>

          {/* CARD 3: CUSTOMER / DINING TYPE / PAYMENT */}
          <div className="bg-white rounded-2xl border border-[#EAE3D9] text-xs shadow-2xs grid grid-cols-2 divide-x divide-[#EAE3D9] h-fit">
            <div className="p-4 text-center">
              <p className="text-[10px] text-[#8C7A6B] uppercase font-bold">Dining Type</p>
              <p className="font-bold text-[#2B231F] mt-0.5">{diningTypeDisplay}</p>
            </div>

            <div className="p-4 text-center">
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
        </div>

        {/* CARD 4: ORDERED ITEMS */}
        <div className="bg-white rounded-3xl border border-[#EAE3D9] p-4 shadow-2xs space-y-3">
          <p className="font-bold text-[11px] uppercase tracking-wider text-[#5C3D2E]">
            ORDERED ITEMS ({currentOrder.items.length})
          </p>

          <div className="space-y-2 md:grid md:grid-cols-2 md:gap-x-4 md:space-y-0">
            {currentOrder.items.map((it) => (
              <div key={it.id} className="flex items-center justify-between text-xs py-1">
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

        {/* ACTION BUTTONS: stacked on mobile, row on md+ so they don't stretch full-width on desktop */}
        <div className="flex flex-col md:flex-row gap-2 pt-1">
          {/* If ready, show Pickup Claim Confirmation button which removes order once claimed */}
          {isReady && (
            <button
              type="button"
              onClick={handleClaimPickup}
              className="w-full md:flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-full shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Order Complete</span>
            </button>
          )}

          {/* Button 1: Order Another Item (Dark Brown Pill) */}
          <button
            type="button"
            onClick={() => {
              setCustomerScreen(3);
              navigate('/menu');
            }}
            className="w-full md:flex-1 py-3.5 bg-[#4A3328] hover:bg-[#3D251A] text-white font-bold text-xs rounded-full shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Order Another Item</span>
          </button>

          {/* Button 2: Cancel Order (Light Red Outlined Pill) */}
          {isPending && !currentOrder.cancellation_requested && (
            <button
              type="button"
              onClick={() => setCancelModalOpen(true)}
              className="w-full md:flex-1 py-3 bg-[#FFF5F5] hover:bg-red-50 text-[#DC2626] font-bold text-xs rounded-full border border-red-200 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Cancel Order</span>
            </button>
          )}

          {currentOrder.cancellation_requested && (
            <div className="w-full md:flex-1 p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 text-center font-medium">
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
              Cancel Order #{currentOrder.order_number || currentOrder.tracking_token}?
            </h4>
            <p className="text-xs text-[#8C7A6B] mt-1 mb-4">
              Staff will review and process your request immediately.
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