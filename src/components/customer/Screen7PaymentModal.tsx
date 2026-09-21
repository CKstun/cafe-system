import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { ChevronLeft, Banknote, QrCode, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { PaymentMethod } from '../../types/cafe';
import { PaymentGCash } from './PaymentGCash';

export const Screen7PaymentModal: React.FC = () => {
  const { cart, placeOrder, setCustomerScreen, customerName, orderType, navigate } = useCafe();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const subtotal = cart.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  // Validation rules:
  // Cash is always valid
  // GCash (online) requires mandatory Proof of Payment image upload
  const isPaymentValid = paymentMethod === 'cash' || (paymentMethod === 'online' && Boolean(receiptPreview));

  const handleReceiptChange = (file: File | null, previewUrl: string | null) => {
    setReceiptFile(file);
    setReceiptPreview(previewUrl);
    if (previewUrl) {
      setUploadError(null);
    }
  };

  const handleConfirmOrder = () => {
    if (paymentMethod === 'online' && !receiptPreview) {
      setUploadError('Proof of Payment image upload is mandatory for GCash transactions.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      // Pass the uploaded receipt preview/dataURL or simulated storage path to placeOrder
      const receiptPath = receiptPreview || undefined;
      placeOrder(paymentMethod, receiptPath);
      setIsProcessing(false);
      navigate('/order-status');
    }, 400);
  };

  return (
    <div className="flex-1 min-h-[560px] flex flex-col justify-between p-5 sm:p-6 bg-[#FDFBF7] text-[#2B231F]">
      <div>
        {/* Navigation */}
        <button
          type="button"
          onClick={() => {
            if (orderType === 'delivery') {
              setCustomerScreen(9);
              navigate('/delivery-details');
            } else {
              setCustomerScreen(6);
              navigate('/cart');
            }
          }}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#8C7A6B] hover:text-[#5C3D2E] mb-4 transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{orderType === 'delivery' ? 'Back to Delivery Details' : 'Back to Cart'}</span>
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
                <h4 className="font-bold text-xs text-[#2B231F]">
                  {orderType === 'delivery' ? 'Cash on Delivery (COD)' : 'Cash at Counter'}
                </h4>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Cash
                </span>
              </div>
              <p className="text-[11px] text-[#736357] mt-0.5">
                {orderType === 'delivery'
                  ? 'Pay with physical cash to your delivery rider upon arrival.'
                  : 'Pay directly with physical cash at the barista counter.'}
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

        {/* Dedicated Centered QR and Proof of Payment Upload Dropzone for GCash */}
        {paymentMethod === 'online' && (
          <PaymentGCash
            subtotal={subtotal}
            receiptFile={receiptFile}
            receiptPreview={receiptPreview}
            onReceiptChange={handleReceiptChange}
            uploadError={uploadError}
            setUploadError={setUploadError}
          />
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-6 space-y-2">
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#8C7A6B]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>Encrypted Order Transmission to Kitchen Display</span>
        </div>

        {/* Unified CTA Button */}
        <button
          type="button"
          onClick={handleConfirmOrder}
          disabled={isProcessing || !isPaymentValid}
          className={`w-full py-3.5 px-6 font-bold rounded-2xl text-sm sm:text-base shadow-md transition flex items-center justify-center gap-2 transform active:scale-98 ${
            !isPaymentValid
              ? 'bg-[#D8C7BA] text-white/90 cursor-not-allowed shadow-none'
              : 'bg-[#5C3D2E] hover:bg-[#4A2F22] active:bg-[#3D261B] text-white cursor-pointer shadow-md'
          }`}
        >
          {isProcessing ? (
            <span>Transmitting Order...</span>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>
                {!isPaymentValid && paymentMethod === 'online'
                  ? 'Upload Proof of Payment to Continue'
                  : `Confirm & Place Order (₱${subtotal.toFixed(2)})`}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
