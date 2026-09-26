import React, { useState } from 'react';
import { Order } from '../../types/cafe';
import {
  X,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Receipt,
  FileQuestion,
  Phone,
  MapPin,
  Banknote,
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

  const handleZoomIn = () => setZoomLevel((p) => Math.min(p + 0.35, 3.0));
  const handleZoomOut = () => setZoomLevel((p) => Math.max(p - 0.35, 0.6));

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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="verification-modal-title"
    >
      <div
        className="bg-[#FDFBF7] text-[#2B231F] w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl border border-[#EADBCE] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#EFE8E1] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <Receipt className="w-4.5 h-4.5 text-[#5C4033] shrink-0" />
            <h2 id="verification-modal-title" className="font-display text-sm font-bold text-[#2B231F] truncate">
              Verify Order #{order.order_number || (order.id % 10000)}
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold shrink-0">
              Pending
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-200/60 active:bg-stone-200 transition shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Body: only this region scrolls */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left: Receipt / Cash instruction */}
          <div className="md:col-span-6 flex flex-col">
            {isGCash && hasReceipt && (
              <div className="flex items-center justify-end gap-2 mb-2">
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="w-10 h-10 flex items-center justify-center hover:bg-stone-200 active:bg-stone-300 text-stone-600 rounded-lg transition"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="w-10 h-10 flex items-center justify-center hover:bg-stone-200 active:bg-stone-300 text-stone-600 rounded-lg transition"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleOpenInNewTab}
                  className="w-10 h-10 flex items-center justify-center hover:bg-stone-200 active:bg-stone-300 text-stone-600 rounded-lg transition"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* No independent scroll region here — sizes to its flex parent, only the modal body scrolls */}
            <div className="flex-1 min-h-[280px] bg-[#1E1916] rounded-xl overflow-hidden flex items-center justify-center p-3">
              {isGCash ? (
                hasReceipt ? (
                  <img
                    src={order.gcash_receipt_path}
                    alt={`GCash receipt for order #${order.order_number || order.tracking_token}`}
                    onError={() => setImageError(true)}
                    style={{
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: 'center center',
                      transition: 'transform 0.15s ease-out',
                    }}
                    className="max-h-[380px] max-w-full object-contain rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="p-5 text-center max-w-xs">
                    <FileQuestion className="w-8 h-8 mx-auto text-amber-400 mb-2" />
                    <h3 className="text-white font-bold text-xs">No proof of payment uploaded</h3>
                    <p className="text-[11px] text-[#A6978A] mt-1 leading-relaxed">
                      Ask the customer to show their GCash confirmation, or reject so they can resubmit.
                    </p>
                  </div>
                )
              ) : (
                <div className="p-5 text-center max-w-xs">
                  <Banknote className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                  <h3 className="text-white font-bold text-xs">Collect Cash at Counter</h3>
                  <p className="text-[11px] text-[#A6978A] mt-1 mb-3">Confirm the customer has paid before accepting.</p>
                  <div className="text-lg font-extrabold text-white">₱{order.total_amount.toFixed(2)}</div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Order details */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#2B231F]">{order.customer_name}</span>
                <span className="text-[10px] font-semibold text-[#8C7A6B]">
                  {order.order_type === 'dine-in'
                    ? `Dine-in · Table ${order.table_id || '?'}`
                    : order.order_type === 'delivery'
                    ? 'Delivery'
                    : 'Take-out'}
                  {' · '}
                  {isGCash ? 'GCash' : 'Cash'}
                </span>
              </div>

              {order.order_type === 'delivery' && order.delivery_details && (
                <div className="text-[11px] space-y-1 text-[#736357] bg-white rounded-lg border border-[#EFE8E1] p-2.5">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#5C4033] shrink-0 mt-0.5" />
                    <span>{order.delivery_details.address}, {order.delivery_details.city_region} ({order.delivery_details.postal_code})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#5C4033] shrink-0" />
                    <span className="font-mono font-semibold text-[#2B231F]">{order.delivery_details.contact_number}</span>
                  </div>
                  {order.delivery_details.driver_notes && (
                    <p className="italic text-[#8C7A6B]">Notes: "{order.delivery_details.driver_notes}"</p>
                  )}
                </div>
              )}

              {/* Items list: no independent scroll — grows with the shared modal-body scroll */}
              <div className="border-t border-[#EFE8E1] pt-3 space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start gap-2 text-xs">
                    <div>
                      <span className="font-semibold text-[#2B231F]">{item.quantity}x {item.item_name}</span>
                      <div className="flex flex-wrap gap-1 mt-0.5 text-[10px] text-[#8C7A6B]">
                        {item.customizations.size && <span>{item.customizations.size}</span>}
                        {item.customizations.milk_type === 'oat' && <span>· Oat</span>}
                        {item.customizations.add_ons?.map((a) => <span key={a.id}>· {a.name}</span>)}
                      </div>
                    </div>
                    <span className="font-semibold text-[#5C4033] shrink-0">₱{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#EFE8E1] pt-3 flex items-center justify-between">
                <span className="text-xs font-bold text-[#8C7A6B]">Total</span>
                <span className="text-base font-extrabold text-[#5C4033]">₱{order.total_amount.toFixed(2)}</span>
              </div>
            </div>

            {showRejectForm && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-xs mb-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Reason for rejection</span>
                </div>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full text-xs p-3 bg-white border border-rose-300 rounded-lg mb-3 min-h-[44px]"
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
                    className="flex-1 min-h-[44px] py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs rounded-lg transition"
                  >
                    Confirm Rejection
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRejectForm(false)}
                    className="min-h-[44px] py-2 px-4 bg-white border border-rose-200 text-rose-800 font-bold text-xs rounded-lg hover:bg-rose-100 active:bg-rose-200 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-[#EFE8E1] flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] px-4 py-2 text-stone-500 hover:text-stone-800 font-semibold text-xs transition"
          >
            Close
          </button>
          <div className="w-full sm:w-auto flex items-center gap-2">
            {!showRejectForm && (
              <button
                type="button"
                onClick={() => setShowRejectForm(true)}
                className="flex-1 sm:flex-none min-h-[44px] px-4 py-2 border border-rose-300 text-rose-700 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 hover:bg-rose-50 active:bg-rose-100 transition"
              >
                <XCircle className="w-3.5 h-3.5" />
                Reject
              </button>
            )}
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 sm:flex-none min-h-[44px] px-5 py-2 bg-[#5C4033] hover:bg-[#4A3328] active:bg-[#3A2820] text-[#FDFBF7] font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Confirm & Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};