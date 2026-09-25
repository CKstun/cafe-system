import React, { useState } from 'react';
import { Order } from '../../types/cafe';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Receipt,
  FileQuestion,
  User,
  ShoppingBag,
  Phone,
  MapPin,
  Banknote,
  Sparkles,
} from 'lucide-react';

interface OrderVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onConfirmPayment: (orderId: number) => void;
  onRejectOrder: (orderId: number, reason?: string) => void;
}

export const OrderVerificationModal: React.FC<OrderVerificationModalProps> = ({
  isOpen,
  onClose,
  order,
  onConfirmPayment,
  onRejectOrder,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showRejectForm, setShowRejectForm] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>('Invalid or illegible GCash proof of payment');
  const [imageError, setImageError] = useState<boolean>(false);

  if (!isOpen || !order) return null;

  const isGCash = order.payment_method === 'online';
  const hasReceipt = Boolean(order.gcash_receipt_path) && !imageError;

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.35, 3.0));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.35, 0.6));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const handleOpenInNewTab = () => {
    if (order.gcash_receipt_path) {
      window.open(order.gcash_receipt_path, '_blank', 'noopener,noreferrer');
    }
  };

  const handleConfirm = () => {
    onConfirmPayment(order.id);
    onClose();
  };

  const handleExecuteReject = () => {
    onRejectOrder(order.id, rejectReason);
    setShowRejectForm(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="verification-modal-title"
    >
      <div
        className="bg-[#FDFBF7] text-[#2B231F] w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl border border-[#EADBCE] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 sm:px-7 py-4 bg-[#F4EFEB] border-b border-[#E6DDD4] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5C4033] text-[#FDFBF7] flex items-center justify-center shadow-xs shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="verification-modal-title" className="font-display text-base sm:text-lg font-bold text-[#2B231F]">
                  Order Payment Verification
                </h2>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EADBCE] text-[#5C4033]">
                  Order #{order.order_number || (order.id % 10000)} · #{order.tracking_token}
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                  Pending Verification
                </span>
              </div>
              <p className="text-xs text-[#8C7A6B] mt-0.5">
                {isGCash
                  ? 'Verify customer’s uploaded GCash receipt before approving order for kitchen preparation.'
                  : 'Confirm physical counter cash receipt before approving order for kitchen preparation.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split view on Desktop (Receipt Preview + Order Summary) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 cols on lg): Receipt Inspection Viewport */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5C4033] flex items-center gap-1.5">
                {isGCash ? (
                  <>
                    <Receipt className="w-3.5 h-3.5" />
                    <span>GCash Proof of Payment</span>
                  </>
                ) : (
                  <>
                    <Banknote className="w-3.5 h-3.5" />
                    <span>Counter Cash Payment</span>
                  </>
                )}
              </span>

              {isGCash && hasReceipt && (
                <div className="flex items-center gap-1 bg-white border border-[#E6DDD4] rounded-xl p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    className="p-1.5 hover:bg-stone-100 text-stone-700 rounded-lg transition"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    className="p-1.5 hover:bg-stone-100 text-stone-700 rounded-lg transition"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleResetZoom}
                    className="p-1.5 hover:bg-stone-100 text-stone-700 rounded-lg transition"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <div className="w-px h-4 bg-[#E6DDD4] mx-0.5" />
                  <button
                    type="button"
                    onClick={handleOpenInNewTab}
                    className="p-1.5 hover:bg-stone-100 text-stone-700 rounded-lg transition flex items-center gap-1 text-[11px] font-semibold px-2"
                    title="Open high-res receipt in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">New Tab</span>
                  </button>
                </div>
              )}
            </div>

            {/* Inspection Stage */}
            <div className="flex-1 min-h-[300px] sm:min-h-[380px] bg-[#1E1916] rounded-2xl border border-[#3E332D] relative overflow-hidden flex items-center justify-center p-4">
              {isGCash ? (
                hasReceipt ? (
                  <div className="w-full h-full flex items-center justify-center overflow-auto max-h-[460px]">
                    <img
                      src={order.gcash_receipt_path}
                      alt={`GCash receipt for order #${order.tracking_token}`}
                      onError={() => setImageError(true)}
                      style={{
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: 'center center',
                        transition: 'transform 0.15s ease-out',
                      }}
                      className="max-h-[420px] max-w-full object-contain rounded-lg shadow-xl cursor-grab"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  /* Error / Missing Receipt Placeholder State */
                  <div className="p-6 text-center max-w-sm">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center mb-3">
                      <FileQuestion className="w-8 h-8" />
                    </div>
                    <h3 className="text-white font-bold text-sm">No proof of payment uploaded</h3>
                    <p className="text-xs text-[#A6978A] mt-1.5 leading-relaxed">
                      The customer submitted this order without attaching a valid GCash receipt image, or the image link is inaccessible.
                    </p>
                    <div className="mt-4 p-2.5 rounded-xl bg-[#2A221E] border border-[#3E332D] text-[11px] text-amber-200">
                      Recommendation: Inspect with customer at the counter or reject order so customer can re-submit with their GCash transaction screenshot.
                    </div>
                  </div>
                )
              ) : (
                /* Cash Payment Confirmation Instruction */
                <div className="p-6 text-center max-w-sm text-stone-200">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center mb-3">
                    <Banknote className="w-8 h-8" />
                  </div>
                  <h3 className="text-white font-bold text-sm">Physical Cash Collection</h3>
                  <p className="text-xs text-[#A6978A] mt-1.5 leading-relaxed">
                    Order was placed as Cash payment. Please collect the exact total at the cashier register or table before releasing this order to the kitchen.
                  </p>
                  <div className="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-200 font-semibold">
                    Amount to Collect: <span className="font-extrabold text-white text-base">₱{order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Watermark/Token pill */}
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-[#D4C5B9] border border-white/10">
                Token: #{order.tracking_token}
              </div>
            </div>
          </div>

          {/* Right Column (5 cols on lg): Customer & Order Summary Details */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Customer & Dining Info Card */}
              <div className="p-4 bg-white rounded-2xl border border-[#E6DDD4] shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#F4EFEB]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#F4EFEB] flex items-center justify-center text-[#5C4033]">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8C7A6B] block">Customer & Order</span>
                      <span className="text-xs font-bold text-[#2B231F]">
                        {order.customer_name} — Order #{order.order_number || (order.id % 10000)}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold uppercase text-[#5C4033] bg-[#EFE8E1] px-2.5 py-1 rounded-full border border-[#E6DDD4]">
                    {order.order_type === 'dine-in'
                      ? `Dine-in (Table ${order.table_id || '?'})`
                      : order.order_type === 'delivery'
                      ? 'Delivery'
                      : 'Take-out'}
                  </span>
                </div>

                {/* Delivery Information if Delivery */}
                {order.order_type === 'delivery' && order.delivery_details && (
                  <div className="text-xs space-y-1.5 pt-1">
                    <div className="flex items-start gap-1.5 text-[#736357]">
                      <MapPin className="w-3.5 h-3.5 text-[#5C4033] shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-tight">
                        {order.delivery_details.address}, {order.delivery_details.city_region} ({order.delivery_details.postal_code})
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#736357]">
                      <Phone className="w-3.5 h-3.5 text-[#5C4033] shrink-0" />
                      <span className="text-[11px] font-mono font-semibold text-[#2B231F]">
                        {order.delivery_details.contact_number}
                      </span>
                    </div>
                    {order.delivery_details.driver_notes && (
                      <p className="text-[10px] text-[#8C7A6B] italic bg-[#FDFBF7] p-1.5 rounded-lg border border-[#EFE8E1]">
                        Notes: "{order.delivery_details.driver_notes}"
                      </p>
                    )}
                  </div>
                )}

                {/* Amount Verification Row */}
                <div className="pt-2 border-t border-[#F4EFEB] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#8C7A6B] block uppercase tracking-wider font-semibold">
                      Total Order Amount
                    </span>
                    <span className="text-lg font-extrabold text-[#5C4033]">
                      ₱{order.total_amount.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                    {order.payment_method === 'online' ? 'GCash Online' : 'Cash on Hand'}
                  </span>
                </div>
              </div>

              {/* Order Items Breakdown */}
              <div className="p-4 bg-white rounded-2xl border border-[#E6DDD4] shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-2">
                  Items Ordered ({order.items.length})
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar pr-1">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-[#FDFBF7] border border-[#EFE8E1] text-xs flex justify-between items-start gap-2"
                    >
                      <div>
                        <span className="font-bold text-[#2B231F]">
                          {item.quantity}x {item.item_name}
                        </span>
                        <div className="flex flex-wrap gap-1 mt-0.5 text-[10px] text-[#736357]">
                          {item.customizations.size && (
                            <span className="bg-[#EADBCE]/60 text-[#5C4033] px-1.5 py-0.2 rounded font-semibold">
                              {item.customizations.size}
                            </span>
                          )}
                          {item.customizations.milk_type === 'oat' && (
                            <span className="bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-semibold">
                              Oat
                            </span>
                          )}
                          {item.customizations.add_ons?.map((a) => (
                            <span key={a.id} className="text-[#8C7A6B]">
                              +{a.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="font-bold text-[#5C4033] shrink-0">
                        ₱{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rejection Form Drawer if active */}
            {showRejectForm && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 animate-in fade-in duration-150">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-xs mb-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Reject Order Confirmation</span>
                </div>
                <label className="block text-[11px] text-rose-800 font-medium mb-1">
                  Reason for Rejection:
                </label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-rose-300 rounded-xl text-[#2B231F] focus:ring-2 focus:ring-rose-500 mb-3"
                >
                  <option value="Invalid or illegible GCash proof of payment">Invalid or illegible GCash proof of payment</option>
                  <option value="GCash amount does not match order total">GCash amount does not match order total</option>
                  <option value="Duplicate reference number / already claimed">Duplicate reference number / already claimed</option>
                  <option value="Customer did not complete payment at counter">Customer did not complete payment at counter</option>
                  <option value="Item(s) out of stock">Item(s) out of stock</option>
                </select>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleExecuteReject}
                    className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                  >
                    Confirm Rejection
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRejectForm(false)}
                    className="py-2 px-3 bg-white border border-rose-200 text-rose-800 font-bold text-xs rounded-xl hover:bg-rose-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 sm:px-7 py-4 bg-[#F4EFEB] border-t border-[#E6DDD4] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-stone-100 border border-[#E6DDD4] text-stone-700 font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Close / Return to Queue
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2.5">
            {!showRejectForm && (
              <button
                type="button"
                id="reject-order-btn"
                onClick={() => setShowRejectForm(true)}
                className="flex-1 sm:flex-none min-h-[44px] px-4 py-2.5 bg-white hover:bg-rose-50 border border-rose-300 text-rose-700 hover:text-rose-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>{isGCash ? 'Reject / Invalid Receipt' : 'Reject Order'}</span>
              </button>
            )}

            <button
              type="button"
              id="confirm-payment-accept-btn"
              onClick={handleConfirm}
              className="flex-1 sm:flex-none min-h-[44px] px-5 py-2.5 bg-[#5C4033] hover:bg-[#4A3328] text-[#FDFBF7] font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-98 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Confirm Payment & Accept</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
