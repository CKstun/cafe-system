import React, { useState, useEffect } from 'react';
import { useCafe } from '../../context/CafeContext';
import {
  CheckCircle2,
  Clock,
  Coffee,
  AlertCircle,
  RotateCcw,
  XCircle,
  ArrowRight,
  ChevronLeft,
  PlusCircle,
  Volume2,
} from 'lucide-react';

export const Screen8LiveTracker: React.FC = () => {
  const {
    activeTrackingToken,
    setActiveTrackingToken,
    orders,
    requestOrderCancellation,
    setCustomerScreen,
    customerName,
    navigate,
  } = useCafe();

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [pollTick, setPollTick] = useState(0);

  // Simulated Livewire wire:poll.3s
  useEffect(() => {
    const timer = setInterval(() => {
      setPollTick((t) => t + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Filter orders related to this customer session (or all session orders)
  const customerOrders = orders.filter(
    (o) =>
      o.customer_name.toLowerCase() === (customerName || '').toLowerCase() ||
      orders.length <= 4
  );

  const currentOrder =
    orders.find((o) => o.tracking_token === activeTrackingToken) ||
    customerOrders[0] ||
    orders[0];

  if (!currentOrder) {
    return (
      <div className="flex-1 min-h-[560px] p-6 flex flex-col items-center justify-center text-center bg-[#FDFBF7]">
        <Coffee className="w-12 h-12 text-[#5C3D2E] mb-3 opacity-60" />
        <h3 className="font-display text-lg font-bold text-[#2B231F]">No Active Order Found</h3>
        <p className="text-xs text-[#8C7A6B] mt-1 mb-6">
          You haven't placed an order yet in this session.
        </p>
        <button
          type="button"
          onClick={() => {
            setCustomerScreen(3);
            navigate('/menu');
          }}
          className="px-6 py-3.5 bg-[#5C3D2E] hover:bg-[#4A2F22] text-white font-bold text-xs rounded-2xl shadow-sm transition active:scale-98 cursor-pointer"
        >
          View Menu Catalog
        </button>
      </div>
    );
  }

  const isPending = currentOrder.order_status === 'pending';
  const isPreparing = ['preparing', 'ready', 'completed'].includes(currentOrder.order_status);
  const isReady = ['ready', 'completed'].includes(currentOrder.order_status);
  const isCancelled = currentOrder.order_status === 'cancelled';

  const handleConfirmCancel = () => {
    requestOrderCancellation(currentOrder.tracking_token, cancelReason);
    setCancelModalOpen(false);
  };

  return (
    <div className="flex-1 min-h-[560px] pb-16 p-5 sm:p-6 bg-[#FDFBF7] text-[#2B231F] space-y-4">
      {/* Top Bar: Back to Menu & Live Polling Status */}
      <div className="flex items-center justify-between text-xs text-[#8C7A6B] pb-1 border-b border-[#EFE8E1]">
        <button
          type="button"
          onClick={() => {
            setCustomerScreen(3);
            navigate('/menu');
          }}
          className="inline-flex items-center gap-1 font-semibold text-[#5C3D2E] hover:text-[#4A2F22] transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Back to Menu</span>
        </button>

        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-medium text-[#5C4033]">Livewire Sync ({pollTick})</span>
        </div>
      </div>

      {/* Multi-Order Tabs Selector (Allows tracking multiple concurrent orders) */}
      {orders.length > 1 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
            Your Orders ({orders.length}) — Tap to track:
          </span>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {orders.map((ord) => {
              const isSelected = ord.tracking_token === currentOrder.tracking_token;
              return (
                <button
                  key={ord.id}
                  onClick={() => setActiveTrackingToken(ord.tracking_token)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-[#5C4033] text-[#FDFBF7] border-[#5C4033] shadow-xs'
                      : 'bg-[#F4EFEB] text-[#736357] border-[#E6DDD4] hover:border-[#5C4033]'
                  }`}
                >
                  <span>#{ord.tracking_token}</span>
                  <span
                    className={`text-[9px] uppercase px-1.5 py-0.2 rounded-full font-bold ${
                      ord.order_status === 'ready'
                        ? 'bg-emerald-500 text-white'
                        : ord.order_status === 'preparing'
                        ? 'bg-amber-400 text-black'
                        : 'bg-neutral-300 text-neutral-800'
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

      {/* Hero Banner */}
      <div className="text-center py-6 px-4 bg-[#F4EFEB] rounded-3xl border border-[#E6DDD4] shadow-xs">
        <div className="w-14 h-14 mx-auto rounded-full bg-[#5C4033] text-[#FDFBF7] flex items-center justify-center shadow-md ring-4 ring-[#EFE8E1]">
          {isCancelled ? (
            <XCircle className="w-7 h-7 text-white" />
          ) : isReady ? (
            <Coffee className="w-7 h-7 text-white" />
          ) : (
            <CheckCircle2 className="w-7 h-7 text-white" />
          )}
        </div>

        <h2 className="font-display text-2xl font-bold text-[#2B231F] mt-3">
          {isCancelled ? 'Order Cancelled' : isReady ? 'Ready for Pickup!' : 'Order Placed!'}
        </h2>
        <p className="text-[11px] text-[#8C7A6B] mt-0.5">Order Tracking Token:</p>
        <p className="font-mono text-base font-extrabold text-[#5C4033] tracking-widest mt-1">
          #{currentOrder.tracking_token}
        </p>

        {/* Prominent Name Calling Notification (No table number) */}
        <div className="mt-4 p-3 bg-[#FDFBF7] rounded-2xl border border-[#E6DDD4] flex items-center justify-center gap-2 text-xs text-[#5C4033] shadow-2xs">
          <Volume2 className="w-4 h-4 text-[#5C4033] shrink-0 animate-pulse" />
          <p className="leading-snug text-left">
            Staff will call: <strong className="font-bold text-[#2B231F]">"{currentOrder.customer_name}"</strong> over the counter once ready.
          </p>
        </div>
      </div>

      {/* Customer & Dining Specs (Without table number) */}
      <div className="p-3.5 bg-[#FDFBF7] rounded-2xl border border-[#EFE8E1] flex justify-between items-center text-xs shadow-2xs">
        <div>
          <span className="text-[10px] text-[#8C7A6B] block">Customer</span>
          <span className="font-bold text-[#2B231F]">{currentOrder.customer_name}</span>
        </div>
        <div>
          <span className="text-[10px] text-[#8C7A6B] block">Dining Type</span>
          <span className="font-bold text-[#2B231F] uppercase">
            {currentOrder.order_type === 'dine-in'
              ? 'Dine-in'
              : currentOrder.order_type === 'delivery'
              ? 'Delivery'
              : 'Take-out'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-[#8C7A6B] block">Payment</span>
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
              currentOrder.payment_status === 'paid'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {currentOrder.payment_status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Delivery Details Card (if Delivery Order) */}
      {currentOrder.order_type === 'delivery' && currentOrder.delivery_details && (
        <div className="p-4 bg-[#F4EFEB] rounded-2xl border border-[#E6DDD4] text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7465] block mb-1">
            Delivery Destination
          </span>
          <p className="font-bold text-[#2B231F] text-xs leading-snug">
            {currentOrder.delivery_details.address}
          </p>
          <p className="text-[11px] text-[#7A6253] mt-0.5">
            {currentOrder.delivery_details.city_region} • {currentOrder.delivery_details.postal_code}
          </p>
          <p className="text-[11px] text-[#5C4033] font-semibold mt-1">
            📞 {currentOrder.delivery_details.contact_number}
          </p>
          {currentOrder.delivery_details.driver_notes && (
            <p className="text-[10px] italic text-[#8C7A6B] mt-1.5 bg-white/70 p-2 rounded-lg border border-[#E6DDD4]">
              Note: "{currentOrder.delivery_details.driver_notes}"
            </p>
          )}
        </div>
      )}

      {/* VERTICAL PROGRESS PIPELINE */}
      <div className="p-5 bg-[#F4EFEB] rounded-3xl border border-[#E6DDD4] shadow-xs">
        <h3 className="text-xs uppercase tracking-wider font-bold text-[#5C4033] mb-5 flex items-center justify-between">
          <span>Live Kitchen Progress</span>
          <Clock className="w-3.5 h-3.5 text-[#8C7A6B]" />
        </h3>

        <div className="space-y-6 relative pl-6 border-l-2 border-[#D9CDC1] ml-3">
          {/* Step 1: Order Placed */}
          <div className="relative">
            <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full border-2 border-[#5C4033] bg-[#5C4033] text-[#FDFBF7] flex items-center justify-center text-[10px] shadow-xs">
              ✓
            </div>
            <div>
              <h4 className="font-bold text-xs text-[#2B231F]">Order Placed</h4>
              <p className="text-[10px] text-[#8C7A6B] mt-0.5">
                Received by POS system and assigned token #{currentOrder.tracking_token}.
              </p>
            </div>
          </div>

          {/* Step 2: Preparing */}
          <div className="relative">
            <div
              className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] transition ${
                isPreparing
                  ? 'border-[#5C4033] bg-[#5C4033] text-[#FDFBF7]'
                  : 'border-[#D9CDC1] bg-[#FDFBF7] text-[#8C7A6B]'
              } ${
                currentOrder.order_status === 'preparing'
                  ? 'ring-4 ring-[#5C4033]/25 animate-pulse'
                  : ''
              }`}
            >
              {isPreparing ? '✓' : '2'}
            </div>
            <div>
              <h4
                className={`font-bold text-xs ${
                  isPreparing ? 'text-[#2B231F]' : 'text-[#8C7A6B]'
                }`}
              >
                Preparing in Kitchen
              </h4>
              <p className="text-[10px] text-[#8C7A6B] mt-0.5">
                {currentOrder.order_status === 'preparing'
                  ? 'Baristas are actively crafting your drinks and heating meals.'
                  : isReady
                  ? 'Preparation completed.'
                  : 'Awaiting cash confirmation or barista queue start.'}
              </p>
            </div>
          </div>

          {/* Step 3: Ready for Pickup */}
          <div className="relative">
            <div
              className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] transition ${
                isReady
                  ? 'border-[#5C4033] bg-[#5C4033] text-[#FDFBF7]'
                  : 'border-[#D9CDC1] bg-[#FDFBF7] text-[#8C7A6B]'
              } ${
                currentOrder.order_status === 'ready'
                  ? 'ring-4 ring-emerald-500/30 animate-pulse'
                  : ''
              }`}
            >
              {isReady ? '✓' : '3'}
            </div>
            <div>
              <h4
                className={`font-bold text-xs ${
                  isReady ? 'text-[#2B231F]' : 'text-[#8C7A6B]'
                }`}
              >
                Ready for Pickup
              </h4>
              <p className="text-[10px] text-[#8C7A6B] mt-0.5">
                {isReady
                  ? `Your order is ready! Listen for "${currentOrder.customer_name}" at the counter.`
                  : `Cashier will announce "${currentOrder.customer_name}" once items are boxed.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Item List */}
      <div className="p-4 bg-[#FDFBF7] rounded-2xl border border-[#EFE8E1] space-y-2">
        <h4 className="text-[11px] uppercase tracking-wider font-bold text-[#5C4033] mb-2">
          Ordered Items ({currentOrder.items.length})
        </h4>
        {currentOrder.items.map((it, idx) => (
          <div
            key={idx}
            className="flex justify-between items-start text-xs py-1.5 border-b border-[#F4EFEB] last:border-none"
          >
            <div>
              <p className="font-bold text-[#2B231F]">
                {it.quantity}x {it.item_name}
              </p>
              <p className="text-[10px] text-[#8C7A6B]">
                {it.customizations.size}
                {it.customizations.milk_type === 'oat' ? ' • Oat Milk' : ''}
                {it.customizations.add_ons.map((a) => ` • +${a.name}`)}
              </p>
            </div>
            <span className="font-bold text-xs text-[#5C4033]">
              ₱{(it.price * it.quantity).toFixed(2)}
            </span>
          </div>
        ))}
        <div className="pt-2 flex justify-between font-bold text-xs text-[#2B231F]">
          <span>Total Amount</span>
          <span className="text-[#5C4033] text-sm">
            ₱{currentOrder.total_amount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Bottom Actions Container: Order Another Item (Placed above Cancel Order) & Cancellation */}
      <div className="space-y-3 pt-2">
        {/* Primary CTA: Order Another Item */}
        <button
          type="button"
          onClick={() => setCustomerScreen(3)}
          className="w-full py-3.5 bg-[#5C4033] hover:bg-[#4A3328] text-[#FDFBF7] font-bold text-xs rounded-full shadow-md shadow-[#5C4033]/20 transition flex items-center justify-center gap-2 transform active:scale-98 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Order Another Item</span>
        </button>

        {/* Cancellation Rules (Allowed ONLY while status is 'pending') */}
        <div>
          {isPending ? (
            currentOrder.cancellation_requested ? (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-1">
                <p className="text-xs font-bold text-amber-800">
                  Cancellation Request Pending
                </p>
                <p className="text-[10px] text-amber-700">
                  Waiting for staff on the KDS terminal to confirm and approve.
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCancelModalOpen(true)}
                className="w-full py-3 bg-red-50 hover:bg-red-100 text-[#DC2626] font-bold text-xs rounded-full border border-red-200 transition cursor-pointer active:scale-98"
              >
                Cancel Order
              </button>
            )
          ) : isCancelled ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-center text-xs text-[#DC2626] font-semibold">
              This order has been cancelled.
            </div>
          ) : (
            <div className="p-3 bg-[#F4EFEB] rounded-2xl border border-[#E6DDD4] text-center text-[11px] text-[#736357]">
              Order is in preparation or ready and can no longer be cancelled.
            </div>
          )}
        </div>
      </div>

      {/* Cancellation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-5">
          <div className="bg-[#FDFBF7] w-full max-w-sm rounded-3xl p-5 border border-[#EFE8E1] shadow-2xl">
            <h3 className="font-display text-base font-bold text-[#2B231F]">
              Cancel Order #{currentOrder.tracking_token}
            </h3>
            <p className="text-xs text-[#8C7A6B] mt-1">
              Orders can only be cancelled while status is pending. Please provide a reason:
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Changed dining plans, ordered wrong item..."
              className="w-full mt-3 p-3 bg-[#F4EFEB] border border-[#E6DDD4] rounded-xl text-xs text-[#2B231F] focus:outline-none focus:ring-1 focus:ring-[#5C4033]"
              rows={3}
            ></textarea>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="flex-1 py-2.5 bg-[#EFE8E1] text-[#736357] font-bold text-xs rounded-full"
              >
                Keep Order
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 bg-[#DC2626] text-white font-bold text-xs rounded-full shadow-xs"
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
