import React from 'react';
import { useCafe } from '../../context/CafeContext';
import { ChevronLeft, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { CafeLogo } from '../common/CafeLogo';

export const Cart: React.FC = () => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    setCustomerScreen,
    navigate,
    customerName,
    orderType,
  } = useCafe();

  const totalItemCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalAmount = cart.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  // Navigate back to menu catalog without losing cart items
  const handleBackToMenu = () => {
    setCustomerScreen(3);
    navigate('/menu');
  };

  // Logo navigation to Welcome screen
  const handleLogoClick = () => {
    setCustomerScreen(1);
    navigate('/welcome');
  };

  const handleProceed = () => {
    if (orderType === 'delivery') {
      setCustomerScreen(9); // Delivery details
      navigate('/delivery-details');
    } else {
      setCustomerScreen(7); // Payment
      navigate('/checkout');
    }
  };

  const orderTypeLabel =
    orderType === 'dine-in' ? 'Dine-in' : orderType === 'delivery' ? 'Delivery' : 'Take-out';
  const customerDisplay = customerName?.trim() || 'Guest';

  return (
    <div className="flex-1 min-h-[560px] flex flex-col justify-between bg-[#FDFBF7] text-[#2B231F] relative">
      {/* 
        1. STICKY CART HEADER DESIGN:
        - Locked at the top when scrolling through cart items (sticky top-0 z-50 bg-[#FDFBF7])
        - Left: Back arrow (<) + Title ("Your Cart")
        - Subtext: [Customer Name] • [Order Type] (e.g., "Cheska • Dine-in")
        - Right: Café Pepita Logo (tapping navigates to /welcome)
      */}
      <div className="sticky top-0 z-50 bg-[#FDFBF7] border-b border-[#EADBCE]/80 shadow-xs px-4 sm:px-6 py-3.5 transition-all">
        <div className="flex items-center justify-between">
          {/* Back Arrow & Header Title Group */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleBackToMenu}
              aria-label="Back to Menu"
              className="w-9 h-9 rounded-xl bg-[#F4EFEB] hover:bg-[#EADBCE] text-[#5C3D2E] flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            <div
              onClick={handleBackToMenu}
              className="cursor-pointer group select-none text-left"
              title="Click to return to menu"
            >
              <div className="flex items-center gap-2">
                <h1 className="font-display text-lg sm:text-xl font-bold text-[#2B231F] group-hover:text-[#5C3D2E] transition-colors leading-none">
                  Your Cart
                </h1>
                {totalItemCount > 0 && (
                  <span className="text-[10px] font-bold text-[#5C3D2E] bg-[#F4EFEB] px-2 py-0.5 rounded-full border border-[#EADBCE]">
                    {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#7A6253] font-medium mt-1 leading-tight">
                {customerDisplay} • {orderTypeLabel}
              </p>
            </div>
          </div>

          {/* Café Pepita Logo Badge: Clicking navigates to /welcome */}
          <button
            type="button"
            onClick={handleLogoClick}
            aria-label="Return to Welcome Screen"
            title="Café Pepita — Return to Welcome"
            className="w-10 h-10 rounded-full bg-white shadow-xs border border-[#EADBCE] flex items-center justify-center p-0.5 hover:scale-105 active:scale-95 transition cursor-pointer shrink-0"
          >
            <CafeLogo size={36} className="w-8 h-8" showBorder={false} />
          </button>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 px-4 sm:px-6 py-4 space-y-3">
        {cart.length === 0 ? (
          <div className="py-20 text-center text-xs text-[#8C7A6B] space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#F4EFEB] flex items-center justify-center text-[#A68A78]">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div>
              <p className="text-base font-bold text-[#2B231F]">Your cart is empty</p>
              <p className="text-xs text-[#7A6253] mt-1">
                Explore our freshly brewed specialties and kitchen items.
              </p>
            </div>
            {/* Unified CTA Button */}
            <div className="pt-2 max-w-xs mx-auto">
              <button
                type="button"
                onClick={handleBackToMenu}
                className="w-full py-3.5 px-6 bg-[#5C3D2E] hover:bg-[#4A2F22] active:bg-[#3D261B] text-white font-bold text-sm rounded-2xl shadow-sm transition active:scale-98 cursor-pointer text-center"
              >
                Browse Menu
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map((line) => (
              <div
                key={line.id}
                className="p-3.5 sm:p-4 bg-[#F4EFEB] rounded-2xl border border-[#E6DDD4] flex items-start sm:items-center justify-between gap-3 shadow-2xs transition hover:border-[#D8C7BA]"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-[#2B231F] leading-tight truncate">
                    {line.item_name}
                  </h4>

                  {/* Customizations tags */}
                  <div className="flex flex-wrap gap-1 mt-1.5 text-[10px] text-[#7A6253]">
                    {line.customizations.size && (
                      <span className="bg-[#EADBCE] text-[#5C3D2E] px-2 py-0.5 rounded-lg font-semibold">
                        {line.customizations.size}
                      </span>
                    )}
                    {line.customizations.flavor && (
                      <span className="bg-[#EADBCE] text-[#5C3D2E] px-2 py-0.5 rounded-lg font-semibold">
                        {line.customizations.flavor}
                      </span>
                    )}
                    {line.customizations.milk_type === 'oat' && (
                      <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-lg font-semibold">
                        Oat Milk
                      </span>
                    )}
                    {line.customizations.add_ons?.map((a) => (
                      <span key={a.id} className="bg-white/80 text-[#5C3D2E] px-2 py-0.5 rounded-lg border border-[#EADBCE]">
                        +{a.name}
                      </span>
                    ))}
                  </div>

                  {/* Comments */}
                  {line.customizations.comments && (
                    <p className="text-[11px] text-[#736357] italic mt-1.5 bg-white/60 px-2 py-0.5 rounded-lg inline-block border border-[#EADBCE]/50">
                      "{line.customizations.comments}"
                    </p>
                  )}

                  {/* Unit & Line Price */}
                  <p className="font-bold text-xs font-mono text-[#5C3D2E] mt-2">
                    ₱{(line.price * line.quantity).toFixed(2)}{' '}
                    {line.quantity > 1 && (
                      <span className="text-[10px] text-[#8C7A6B] font-normal">
                        (₱{line.price.toFixed(2)} each)
                      </span>
                    )}
                  </p>
                </div>

                {/* Quantity Adjuster & Trash */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                  <div className="flex items-center bg-white rounded-xl p-1 border border-[#E6DDD4] shadow-2xs">
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(line.id, -1)}
                      className="w-7 h-7 rounded-lg bg-[#F4EFEB] text-[#5C3D2E] font-bold text-xs flex items-center justify-center hover:bg-[#EADBCE] active:scale-95 transition cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-mono font-bold text-[#2B231F]">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(line.id, 1)}
                      className="w-7 h-7 rounded-lg bg-[#5C3D2E] text-white font-bold text-xs flex items-center justify-center hover:bg-[#4A2F22] active:scale-95 transition cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(line.id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    title="Remove item"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 
        3. ORDER SUMMARY (REMOVE TAXES) & 5. UNIFIED BUTTON STYLING:
        - Taxes completely removed (no VAT, service charge, extra fees)
        - Itemized "Order Summary" list directly above the total (e.g., "Cafe Americano × 1 — ₱109.00")
        - Clear, bold Total row (e.g., Total: ₱109.00)
        - Solid rectangular CTA button with soft rounded corners (rounded-2xl), deep coffee brown (bg-[#5C3D2E]), py-3.5, white text
      */}
      {cart.length > 0 && (
        <div className="sticky bottom-0 z-40 bg-[#FDFBF7] border-t border-[#EADBCE] p-4 sm:p-6 space-y-4 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
          {/* Itemized Order Summary Box */}
          <div className="bg-[#F4EFEB] rounded-2xl p-4 border border-[#E6DDD4] space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#E6DDD4]/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#736357]">
                Order Summary
              </span>
              <span className="text-[11px] font-medium text-[#8C7A6B]">
                {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
              </span>
            </div>

            {/* Itemized List Lines */}
            <div className="space-y-1.5 text-xs text-[#2B231F]">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <span className="truncate pr-2 font-medium text-[#3B2215]">
                    {item.item_name} × {item.quantity}
                  </span>
                  <span className="font-mono text-[#5C3D2E] font-semibold shrink-0">
                    ₱{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Clear Bold Total Row */}
            <div className="flex justify-between items-center font-bold text-sm sm:text-base text-[#2B231F] pt-2.5 border-t border-[#E6DDD4]">
              <span>Total:</span>
              <span className="text-[#5C3D2E] font-mono text-base sm:text-lg">
                ₱{totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Unified CTA Button (Solid rectangle, rounded-2xl, deep coffee brown #5C3D2E, py-3.5) */}
          <button
            type="button"
            onClick={handleProceed}
            className="w-full py-3.5 px-6 bg-[#5C3D2E] hover:bg-[#4A2F22] active:bg-[#3D261B] text-white font-bold text-sm sm:text-base rounded-2xl shadow-md transition duration-200 flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
          >
            <span>{orderType === 'delivery' ? 'Continue to Delivery' : 'Proceed to Checkout'}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      )}
    </div>
  );
};
