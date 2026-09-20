import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { ChevronLeft, Banknote, QrCode, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { PaymentMethod } from '../../types/cafe';

export const Screen7PaymentModal: React.FC = () => {
  const { cart, placeOrder, setCustomerScreen, customerName } = useCafe();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [gcashRef, setGcashRef] = useState<string>('');
  const [touchedRef, setTouchedRef] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const subtotal = cart.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  // Validation rules for GCash reference:
  // Must be filled, 6-20 characters, NO spaces
  const trimmedRef = gcashRef.trim();
  const hasSpaces = /\s/.test(gcashRef);
  const isLengthValid = gcashRef.length >= 6 && gcashRef.length <= 20;
  const isGcashValid = paymentMethod === 'cash' || (gcashRef.length > 0 && isLengthValid && !hasSpaces);

  const getValidationError = () => {
    if (paymentMethod !== 'online') return null;
    if (!gcashRef) {
      return touchedRef ? 'GCash reference number is required to place your order.' : null;
    }
    if (hasSpaces) {
      return 'Reference number must not contain any spaces.';
    }
    if (gcashRef.length < 6) {
      return `Reference number is too short (${gcashRef.length}/6 characters minimum).`;
    }
    if (gcashRef.length > 20) {
      return `Reference number exceeds 20 characters maximum.`;
    }
    return null;
  };

  const validationError = getValidationError();

  const handleConfirmOrder = () => {
    setTouchedRef(true);
    if (!isGcashValid) return;

    setIsProcessing(true);
    setTimeout(() => {
      placeOrder(paymentMethod, gcashRef);
      setIsProcessing(false);
    }, 400);
  };

  return (
    <div className="flex-1 min-h-[560px] flex flex-col justify-between p-5 sm:p-6 bg-[#FDFBF7] text-[#2B231F]">
      <div>
        {/* Navigation */}
        <button
          onClick={() => setCustomerScreen(6)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#8C7A6B] hover:text-[#5C4033] mb-4 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </button>

        {/* Heading */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-display text-xl font-bold text-[#2B231F]">
              Select Payment Method
            </h2>
            <p className="text-xs text-[#8C7A6B] mt-0.5">
              Order Total:{' '}
              <strong className="text-[#5C4033] font-bold text-sm">
                ₱{subtotal.toFixed(2)}
              </strong>
            </p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 bg-[#EFE8E1] text-[#5C4033] rounded-full">
            {customerName}
          </span>
        </div>

        {/* Payment Selection Cards */}
        <div className="mt-5 space-y-3">
          {/* Option 1: Cash at Counter */}
          <div
            onClick={() => setPaymentMethod('cash')}
            className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-center gap-3.5 ${
              paymentMethod === 'cash'
                ? 'border-[#5C4033] bg-[#F4EFEB] shadow-xs'
                : 'border-[#E6DDD4] bg-[#FDFBF7] hover:border-[#D9CDC1]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition shrink-0 ${
                paymentMethod === 'cash' ? 'border-[#5C4033]' : 'border-[#A6978A]'
              }`}
            >
              {paymentMethod === 'cash' && (
                <div className="w-2.5 h-2.5 rounded-full bg-[#5C4033]"></div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-emerald-700 shrink-0" />
                <h4 className="font-bold text-xs text-[#2B231F]">Cash at Counter</h4>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Cash
                </span>
              </div>
              <p className="text-[11px] text-[#736357] mt-0.5">
                Pay directly with physical cash at the barista counter.
              </p>
            </div>
          </div>

          {/* Option 2: GCash E-Wallet */}
          <div
            onClick={() => setPaymentMethod('online')}
            className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-center gap-3.5 ${
              paymentMethod === 'online'
                ? 'border-[#5C4033] bg-[#F4EFEB] shadow-xs'
                : 'border-[#E6DDD4] bg-[#FDFBF7] hover:border-[#D9CDC1]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition shrink-0 ${
                paymentMethod === 'online' ? 'border-[#5C4033]' : 'border-[#A6978A]'
              }`}
            >
              {paymentMethod === 'online' && (
                <div className="w-2.5 h-2.5 rounded-full bg-[#5C4033]"></div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-blue-600 shrink-0" />
                <h4 className="font-bold text-xs text-[#2B231F]">GCash E-Wallet</h4>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  GCash
                </span>
              </div>
              <p className="text-[11px] text-[#736357] mt-0.5">
                Scan merchant QR code & provide reference number.
              </p>
            </div>
          </div>
        </div>

        {/* Dedicated Centered QR and Reference Code Section for GCash */}
        {paymentMethod === 'online' && (
          <div className="mt-4 p-5 bg-[#F4EFEB] rounded-3xl border border-[#E6DDD4] shadow-xs text-center space-y-3 animate-in fade-in duration-200">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#5C4033]">
                Official Merchant QR
              </span>
              <p className="text-xs font-bold text-[#2B231F]">
                Scan to Pay ₱{subtotal.toFixed(2)}
              </p>
            </div>

            {/* Centered QR Code */}
            <div className="flex flex-col items-center justify-center w-full py-1">
              <div className="w-44 h-44 bg-white mx-auto border-2 border-[#5C4033]/20 rounded-2xl flex items-center justify-center p-2 shadow-sm">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=GCASH-PAYMENT-CAFEPITA-ORDER"
                  alt="Café Pepita GCash QR Code"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <p className="text-[10px] text-[#8C7A6B] mt-1.5">
                Account: <strong className="text-[#2B231F]">Café Pepita (0917-XXX-4567)</strong>
              </p>
            </div>

            {/* Reference Number Field */}
            <div className="text-left pt-1">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5C4033]">
                  GCash Reference Number <span className="text-red-600">*</span>
                </label>
                <span className="text-[10px] text-[#8C7A6B] font-mono">
                  {gcashRef.length}/20 chars
                </span>
              </div>
              <input
                type="text"
                value={gcashRef}
                onBlur={() => setTouchedRef(true)}
                onChange={(e) => {
                  // Strip whitespace on paste/type
                  const val = e.target.value.replace(/\s+/g, '');
                  setGcashRef(val);
                  setTouchedRef(true);
                }}
                placeholder="6-20 characters, no spaces"
                className={`w-full px-4 py-3 bg-[#FDFBF7] border rounded-xl text-xs font-mono text-[#2B231F] placeholder-[#A6978A] focus:outline-none focus:ring-2 transition ${
                  validationError
                    ? 'border-red-400 focus:ring-red-500'
                    : 'border-[#E6DDD4] focus:ring-[#5C4033]'
                }`}
              />

              {/* Validation Feedback */}
              {validationError ? (
                <div className="flex items-center gap-1.5 text-xs text-[#DC2626] font-semibold mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{validationError}</span>
                </div>
              ) : (
                <p className="text-[10px] text-[#8C7A6B] mt-1">
                  Reference number is found on your GCash transaction receipt (6 to 20 digits/letters, no spaces).
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-6 space-y-2">
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#8C7A6B]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>Encrypted Order Transmission to Kitchen Display</span>
        </div>

        <button
          onClick={handleConfirmOrder}
          disabled={isProcessing || !isGcashValid}
          className={`w-full py-4 font-bold rounded-full text-xs shadow-lg transition flex items-center justify-center gap-2 transform active:scale-98 ${
            !isGcashValid
              ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed shadow-none'
              : 'bg-[#5C4033] hover:bg-[#4A3328] text-[#FDFBF7] shadow-[#5C4033]/20'
          }`}
        >
          {isProcessing ? (
            <span>Transmitting Order...</span>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {!isGcashValid && paymentMethod === 'online'
                  ? 'Enter Reference Number to Place Order'
                  : `Confirm & Place Order (₱${subtotal.toFixed(2)})`}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
