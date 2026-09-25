import React, { useState, useEffect } from 'react';
import { useCafe } from '../../context/CafeContext';
import { useGuestSession } from '../../hooks/useGuestSession';
import {
  X,
  ShoppingBag,
  User,
  Utensils,
  MapPin,
  Banknote,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { PaymentMethod, OrderType } from '../../types/cafe';
import { PaymentGCash } from './PaymentGCash';
import { useUnsavedChangesGuard } from '../../hooks/useUnsavedChangesGuard';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess?: (trackingToken: string, orderNumber: number) => void;
}

/**
 * CheckoutModal Component for Café Pepita.
 * 
 * Implements:
 * 1. Guest Identity Lifecycle:
 *    - Automatically pre-fills "Customer Name" from localStorage key `cafe_pepita_customer_name`
 *      if an active 8-hour session is valid.
 *    - If no saved name exists or 8-hour session has expired, field starts completely blank.
 *    - Retains name across reloads and tab closes.
 *    - Saves to `cafe_pepita_customer_name` whenever guest enters name at checkout.
 * 2. Same-Name Disambiguation:
 *    - Attaches unique `guest_session_id` (UUID v4).
 *    - Assigns distinct, incremental `order_number` (e.g. Order #1042).
 *    - Submissions enforce button validation with `disabled:opacity-40 disabled:cursor-not-allowed`.
 */
export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const {
    cart,
    placeOrder,
    customerName: contextCustomerName,
    setCustomerName: setContextCustomerName,
    setCustomerDetails,
    orderType: contextOrderType,
    deliveryDetails: contextDeliveryDetails,
    setDeliveryDetails,
    selectedTableId,
    setCustomerScreen,
    navigate,
  } = useCafe();

  const {
    guestSessionId,
    customerName: storedGuestName,
    saveCustomerNameAtCheckout,
    isSessionActive,
    remainingHours,
  } = useGuestSession();

  // Form Pre-filling Behavior:
  // Pre-fill with stored name if present & 8h session is valid; else start blank and require entry.
  const [nameInput, setNameInput] = useState<string>(() => {
    return isSessionActive && storedGuestName ? storedGuestName : '';
  });

  const [orderTypeInput, setOrderTypeInput] = useState<OrderType>(contextOrderType || 'dine-in');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Delivery details state
  const [address, setAddress] = useState(contextDeliveryDetails?.address || '');
  const [cityRegion, setCityRegion] = useState(contextDeliveryDetails?.city_region || 'Cabanatuan City');
  const [postalCode, setPostalCode] = useState(contextDeliveryDetails?.postal_code || '3100');
  const [contactNumber, setContactNumber] = useState(contextDeliveryDetails?.contact_number || '');
  const [driverNotes, setDriverNotes] = useState(contextDeliveryDetails?.driver_notes || '');

  // Keep local nameInput synchronized whenever modal opens or storage changes
  useEffect(() => {
    if (isOpen) {
      if (isSessionActive && storedGuestName) {
        setNameInput(storedGuestName);
      } else if (!nameInput) {
        setNameInput('');
      }
    }
  }, [isOpen, isSessionActive, storedGuestName]);

  // Unsaved changes guard while modal is filling
  useUnsavedChangesGuard({
    when: isOpen && (nameInput.trim().length > 0 || cart.length > 0),
    role: 'customer',
    reason: 'Checkout form in progress',
  });

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  // Strict Validation Rules:
  // 1. Customer Name is required (minimum 2 characters)
  const isNameValid = nameInput.trim().length >= 2;

  // 2. If delivery, contact number must be valid Philippine format (^09\d{9}$) and address required
  const isContactValid = /^09\d{9}$/.test(contactNumber.trim());
  const isDeliveryValid = orderTypeInput !== 'delivery' || (address.trim().length >= 5 && isContactValid);

  // 3. If online GCash, proof of payment receipt image is mandatory
  const isPaymentValid = paymentMethod === 'cash' || (paymentMethod === 'online' && Boolean(receiptPreview));

  // Overall form validity
  const isFormValid = isNameValid && isDeliveryValid && isPaymentValid && cart.length > 0;

  const handleReceiptChange = (file: File | null, previewUrl: string | null) => {
    setReceiptPreview(previewUrl);
    if (previewUrl) {
      setUploadError(null);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    if (paymentMethod === 'online' && !receiptPreview) {
      setUploadError('Please upload your GCash payment confirmation screenshot.');
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanName = nameInput.trim();

      // 1. Store customerName in localStorage under key 'cafe_pepita_customer_name'
      // and renew the 8-hour session timestamp
      saveCustomerNameAtCheckout(cleanName);
      setContextCustomerName(cleanName);
      setCustomerDetails(cleanName, orderTypeInput, orderTypeInput === 'dine-in' ? selectedTableId : null);

      if (orderTypeInput === 'delivery') {
        setDeliveryDetails({
          address: address.trim(),
          city_region: cityRegion.trim(),
          postal_code: postalCode.trim(),
          contact_number: contactNumber.trim(),
          driver_notes: driverNotes.trim() || undefined,
        });
      }

      // Small async delay to simulate network latency
      await new Promise((resolve) => setTimeout(resolve, 350));

      // 2. Place Order (attaches unique guest_session_id UUID v4 and incremental order_number)
      const token = placeOrder(paymentMethod, receiptPreview || undefined);

      setIsSubmitting(false);
      onClose();

      if (onOrderSuccess) {
        onOrderSuccess(token, 1042);
      } else {
        setCustomerScreen(8);
        navigate('/order-status');
      }
    } catch (err) {
      console.error('Order submission failed:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-[#FDFBF7] text-[#2B231F] w-full max-w-xl rounded-3xl shadow-2xl border border-[#EADBCE] overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-[#F8F4EE] border-b border-[#EADBCE] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#5C4033] text-white flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 id="checkout-modal-title" className="font-serif text-lg font-bold text-[#2B231F]">
                Complete Checkout
              </h2>
              <p className="text-[11px] text-[#8C7A6B]">
                Café Pepita · Fast & Secure Guest Ordering
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-stone-100 text-stone-600 flex items-center justify-center border border-[#E6DDD4] transition cursor-pointer"
            aria-label="Close Checkout Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmitOrder} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* SECTION 1: CUSTOMER NAME & GUEST SESSION PERSISTENCE */}
          <div className="bg-white rounded-2xl p-4 border border-[#EADBCE] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="checkout-customer-name" className="text-xs font-bold uppercase tracking-wider text-[#5C4033] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#5C4033]" />
                <span>Customer Name</span>
                <span className="text-rose-600">*</span>
              </label>

              {isSessionActive && storedGuestName ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                  <span>Returning Guest · 8h Session Active</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                  <Clock className="w-2.5 h-2.5 text-amber-600" />
                  <span>New Guest · Requires Name</span>
                </span>
              )}
            </div>

            <div>
              <input
                id="checkout-customer-name"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Mark or Cheska Kimberly"
                className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E6DDD4] rounded-xl text-sm font-semibold text-[#2B231F] placeholder-[#A6978A] focus:outline-none focus:ring-2 focus:ring-[#5C4033] focus:bg-white transition"
                autoComplete="name"
                required
              />
              <div className="flex items-center justify-between mt-1.5 text-[11px] text-[#8C7A6B]">
                <span>Stored under <code className="font-mono text-[10px] text-[#5C4033]">cafe_pepita_customer_name</code></span>
                <span className="font-mono text-[10px] text-stone-500">Session ID: {guestSessionId.slice(0, 8)}...</span>
              </div>
            </div>

            {/* Same-name Disambiguation Guarantee Note */}
            <div className="p-2.5 bg-[#F4ECE1]/60 rounded-xl text-[11px] text-[#5C4033] flex items-start gap-2 border border-[#EADBCE]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
              <p>
                <strong>Duplicate Name Protection:</strong> If another customer has the same name, your order is disambiguated by your unique session ID and assigned a distinct incremental Order Number (e.g. <em>Mark — Order #1042</em>).
              </p>
            </div>
          </div>

          {/* SECTION 2: DINING PREFERENCE */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#5C4033] flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-[#5C4033]" />
              <span>Dining Preference</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['dine-in', 'take-out', 'delivery'] as OrderType[]).map((type) => {
                const isSelected = orderTypeInput === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setOrderTypeInput(type)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold capitalize transition border text-center cursor-pointer ${
                      isSelected
                        ? 'bg-[#5C4033] text-white border-[#5C4033] shadow-xs'
                        : 'bg-white text-[#736357] border-[#E6DDD4] hover:bg-[#F4EFEB]'
                    }`}
                  >
                    {type === 'dine-in' ? 'Dine-In' : type === 'take-out' ? 'Take-Out' : 'Delivery'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: DELIVERY DETAILS (if delivery selected) */}
          {orderTypeInput === 'delivery' && (
            <div className="bg-white rounded-2xl p-4 border border-[#EADBCE] shadow-2xs space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#5C4033]">
                <MapPin className="w-3.5 h-3.5 text-[#5C4033]" />
                <span>Delivery Address & Contact</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">Street Address *</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House/Unit #, Street, Barangay"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E6DDD4] rounded-xl text-xs text-[#2B231F] focus:outline-none focus:ring-2 focus:ring-[#5C4033]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">City / Municipality *</label>
                  <input
                    type="text"
                    value={cityRegion}
                    onChange={(e) => setCityRegion(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E6DDD4] rounded-xl text-xs text-[#2B231F] focus:outline-none focus:ring-2 focus:ring-[#5C4033]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E6DDD4] rounded-xl text-xs text-[#2B231F] focus:outline-none focus:ring-2 focus:ring-[#5C4033]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  Contact Mobile Number (Philippine 09XX) *
                </label>
                <input
                  type="tel"
                  maxLength={11}
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="09171234567"
                  className={`w-full px-3.5 py-2 bg-[#FAF7F2] border rounded-xl text-xs font-mono text-[#2B231F] focus:outline-none focus:ring-2 ${
                    contactNumber && !isContactValid
                      ? 'border-rose-400 focus:ring-rose-500'
                      : 'border-[#E6DDD4] focus:ring-[#5C4033]'
                  }`}
                  required
                />
                {contactNumber && !isContactValid && (
                  <p className="text-[10px] text-rose-600 mt-1 flex items-center gap-1 font-sans">
                    <AlertCircle className="w-3 h-3" />
                    <span>Please enter a valid 11-digit mobile number starting with 09.</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* SECTION 4: PAYMENT SELECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#5C4033] flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5 text-[#5C4033]" />
                <span>Payment Method</span>
              </label>
              <span className="text-xs font-bold text-[#5C4033]">
                Total: ₱{subtotal.toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3.5 rounded-2xl border-2 transition text-left cursor-pointer flex flex-col justify-between ${
                  paymentMethod === 'cash'
                    ? 'border-[#5C4033] bg-[#F4EFEB] shadow-xs'
                    : 'border-[#E6DDD4] bg-white hover:border-[#D9CDC1]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Banknote className="w-5 h-5 text-emerald-700" />
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'cash' ? 'border-[#5C4033]' : 'border-stone-300'
                    }`}
                  >
                    {paymentMethod === 'cash' && <span className="w-2 h-2 rounded-full bg-[#5C4033]" />}
                  </span>
                </div>
                <div className="mt-2">
                  <h4 className="font-bold text-xs text-[#2B231F]">
                    {orderTypeInput === 'delivery' ? 'Cash on Delivery (COD)' : 'Cash at Counter'}
                  </h4>
                  <p className="text-[10px] text-[#8C7A6B]">Pay barista / courier</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('online')}
                className={`p-3.5 rounded-2xl border-2 transition text-left cursor-pointer flex flex-col justify-between ${
                  paymentMethod === 'online'
                    ? 'border-[#007DFE] bg-blue-50/40 shadow-xs'
                    : 'border-[#E6DDD4] bg-white hover:border-[#D9CDC1]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-5 h-5 rounded bg-[#007DFE] text-white flex items-center justify-center font-black text-[10px]">
                    G
                  </div>
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'online' ? 'border-[#007DFE]' : 'border-stone-300'
                    }`}
                  >
                    {paymentMethod === 'online' && <span className="w-2 h-2 rounded-full bg-[#007DFE]" />}
                  </span>
                </div>
                <div className="mt-2">
                  <h4 className="font-bold text-xs text-[#2B231F]">GCash Online</h4>
                  <p className="text-[10px] text-[#8C7A6B]">Instant QR transfer</p>
                </div>
              </button>
            </div>

            {/* GCash Verification Form Component */}
            {paymentMethod === 'online' && (
              <div className="mt-3">
                <PaymentGCash
                  subtotal={subtotal}
                  receiptFile={receiptFile}
                  receiptPreview={receiptPreview}
                  onReceiptChange={handleReceiptChange}
                  uploadError={uploadError}
                  setUploadError={setUploadError}
                />
              </div>
            )}
          </div>

          {/* SECTION 5: CART ITEMS SUMMARY */}
          <div className="bg-[#FAF7F2] rounded-2xl p-3.5 border border-[#EADBCE] text-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B] mb-2">
              Order Items ({cart.reduce((sum, item) => sum + item.quantity, 0)})
            </p>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <span className="text-[#2B231F] truncate pr-2">
                    <strong className="text-[#5C4033]">{item.quantity}x</strong> {item.item_name}
                    {item.customizations?.size && (
                      <span className="text-[#8C7A6B] text-[10px]"> ({item.customizations.size})</span>
                    )}
                  </span>
                  <span className="font-bold text-[#5C4033] shrink-0">
                    ₱{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-5 py-4 bg-[#F8F4EE] border-t border-[#EADBCE] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#E6DDD4] bg-white text-xs font-bold text-stone-700 hover:bg-stone-100 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmitOrder}
            disabled={!isFormValid || isSubmitting}
            className="flex-1 py-3 px-5 rounded-2xl font-bold text-xs text-white bg-[#5C4033] hover:bg-[#4A3328] transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span>Submitting Order...</span>
            ) : (
              <>
                <span>Confirm Order — ₱{subtotal.toFixed(2)}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
