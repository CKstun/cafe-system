import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { ChevronLeft } from 'lucide-react';

export const ScreenDeliveryDetails: React.FC = () => {
  const {
    customerName,
    cart,
    deliveryDetails,
    setDeliveryDetails,
    setCustomerScreen,
  } = useCafe();

  const [address, setAddress] = useState(deliveryDetails?.address || '');
  const [cityRegion, setCityRegion] = useState(deliveryDetails?.city_region || '');
  const [postalCode, setPostalCode] = useState(deliveryDetails?.postal_code || '');
  const [contactNumber, setContactNumber] = useState(deliveryDetails?.contact_number || '');
  const [driverNotes, setDriverNotes] = useState(deliveryDetails?.driver_notes || '');

  // Calculate totals
  const totalItemCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalAmount = cart.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  // Validation: Address, City/Region, Postal Code, and Contact Number are required
  const isFormValid =
    address.trim().length > 0 &&
    cityRegion.trim().length > 0 &&
    postalCode.trim().length > 0 &&
    contactNumber.trim().length > 0;

  const handleContinue = () => {
    if (!isFormValid) return;

    setDeliveryDetails({
      address: address.trim(),
      city_region: cityRegion.trim(),
      postal_code: postalCode.trim(),
      contact_number: contactNumber.trim(),
      driver_notes: driverNotes.trim() || undefined,
    });

    // Advance to Payment Screen (Screen 7)
    setCustomerScreen(7);
  };

  return (
    <div className="flex-1 min-h-[560px] flex flex-col justify-between px-6 py-6 sm:px-8 sm:py-7 bg-[#FBF8F5] text-[#3B2215] select-none">
      <div>
        {/* Top Back Navigation */}
        <button
          type="button"
          onClick={() => setCustomerScreen(6)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#8C7A6B] hover:text-[#5A3825] mb-4 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </button>

        {/* Header & Subtitle matching design reference */}
        <div className="mb-5 text-left">
          <h1 className="font-serif text-2xl sm:text-[26px] font-bold text-[#2B1D16] tracking-tight leading-tight">
            Delivery Details
          </h1>
          <p className="text-xs text-[#7A6253] mt-1">
            Please enter your delivery information.
          </p>
        </div>

        {/* Delivery Form Fields */}
        <div className="space-y-3.5">
          {/* DELIVERY ADDRESS (Required) */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C7465] mb-1.5">
              DELIVERY ADDRESS
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Apartment, Suite, Unit, Street Number & Name"
              className="w-full rounded-2xl bg-[#F2EBE5] px-4 py-3 text-xs text-[#3B2215] placeholder-[#A8988B] border-0 focus:outline-none focus:ring-2 focus:ring-[#5A3825] transition resize-none leading-relaxed shadow-2xs"
            />
          </div>

          {/* CITY / REGION & POSTAL CODE (2-Column Grid matching reference) */}
          <div className="grid grid-cols-5 gap-2.5">
            <div className="col-span-3">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C7465] mb-1.5">
                CITY / REGION
              </label>
              <input
                type="text"
                value={cityRegion}
                onChange={(e) => setCityRegion(e.target.value)}
                placeholder="e.g. Metro Manila"
                className="w-full rounded-2xl bg-[#F2EBE5] px-4 py-3 text-xs text-[#3B2215] placeholder-[#A8988B] border-0 focus:outline-none focus:ring-2 focus:ring-[#5A3825] transition shadow-2xs"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C7465] mb-1.5">
                POSTAL CODE
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="e.g. 1200"
                className="w-full rounded-2xl bg-[#F2EBE5] px-4 py-3 text-xs text-[#3B2215] placeholder-[#A8988B] border-0 focus:outline-none focus:ring-2 focus:ring-[#5A3825] transition shadow-2xs"
              />
            </div>
          </div>

          {/* CONTACT NUMBER (Required) */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C7465] mb-1.5">
              CONTACT NUMBER
            </label>
            <input
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="e.g. +63 917 123 4567"
              className="w-full rounded-2xl bg-[#F2EBE5] px-4 py-3 text-xs text-[#3B2215] placeholder-[#A8988B] border-0 focus:outline-none focus:ring-2 focus:ring-[#5A3825] transition shadow-2xs"
            />
          </div>

          {/* DRIVER NOTES (OPTIONAL) */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C7465] mb-1.5">
              DRIVER NOTES (OPTIONAL)
            </label>
            <input
              type="text"
              value={driverNotes}
              onChange={(e) => setDriverNotes(e.target.value)}
              placeholder="e.g. Drop off at reception, ring bell #3"
              className="w-full rounded-2xl bg-[#F2EBE5] px-4 py-3 text-xs text-[#3B2215] placeholder-[#A8988B] border-0 focus:outline-none focus:ring-2 focus:ring-[#5A3825] transition shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Order Summary Footer & Action */}
      <div className="pt-4 mt-6 border-t border-[#EADBCE]/80">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#7A6253]">
              {customerName || 'Customer'} • For Delivery
            </p>
            <p className="text-xs font-bold text-[#3B2215] mt-0.5">
              {totalItemCount} {totalItemCount === 1 ? 'Item' : 'Items'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xl sm:text-2xl font-bold text-[#3B2215] tracking-tight">
              ₱{Math.round(totalAmount)}
            </span>
          </div>
        </div>

        {/* Continue to Payment Button */}
        <button
          type="button"
          disabled={!isFormValid}
          onClick={handleContinue}
          className={`w-full mt-4 py-3.5 sm:py-4 rounded-full text-xs font-bold transition duration-200 flex items-center justify-center shadow-xs ${
            isFormValid
              ? 'bg-[#5A3825] hover:bg-[#432717] text-white cursor-pointer active:scale-98 shadow-md'
              : 'bg-[#D8C7BA] text-white/90 cursor-not-allowed'
          }`}
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
};
