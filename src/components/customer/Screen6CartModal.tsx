import React from 'react';
import { useCafe } from '../../context/CafeContext';
import { ChevronLeft, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export const Screen6CartModal: React.FC = () => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    setCustomerScreen,
    customerName,
    orderType,
    selectedTableId,
  } = useCafe();

  const subtotal = cart.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  return (
    <div className="flex-1 min-h-[560px] flex flex-col justify-between p-5 sm:p-6 bg-[#FDFBF7] text-[#2B231F]">
      <div>
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EFE8E1]">
          <button
            onClick={() => setCustomerScreen(3)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#8C7A6B] hover:text-[#5C4033] transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Add More Items</span>
          </button>
          <h2 className="font-display text-lg font-bold text-[#2B231F]">Your Cart</h2>
          <span className="text-[11px] text-[#8C7A6B] bg-[#EFE8E1] px-2.5 py-0.5 rounded-full font-semibold">
            {cart.reduce((acc, cur) => acc + cur.quantity, 0)} items
          </span>
        </div>

        {/* Customer Context Sub-header */}
        <div className="mt-3 px-3.5 py-2.5 bg-[#F4EFEB] rounded-xl border border-[#E6DDD4] flex justify-between items-center text-xs">
          <div>
            <span className="text-[10px] text-[#8C7A6B] block">Order for:</span>
            <span className="font-bold text-[#2B231F]">{customerName}</span>
          </div>
          <span className="text-[10px] uppercase font-bold text-[#5C4033] bg-[#FDFBF7] px-2.5 py-1 rounded-full border border-[#E6DDD4]">
            {orderType === 'dine-in' ? 'Dine-in' : orderType === 'delivery' ? 'Delivery' : 'Take-out'}
          </span>
        </div>

        {/* Cart Item Lines */}
        <div className="mt-4 space-y-3 max-h-[55vh] overflow-y-auto pr-1">
          {cart.map((line) => (
            <div
              key={line.id}
              className="p-3.5 bg-[#F4EFEB] rounded-2xl border border-[#E6DDD4] flex items-center justify-between gap-3 shadow-2xs"
            >
              <div className="flex-1">
                <h4 className="font-bold text-xs text-[#2B231F] leading-tight">
                  {line.item_name}
                </h4>

                {/* Customizations tags */}
                <div className="flex flex-wrap gap-1 mt-1 text-[10px] text-[#8C7A6B]">
                  {line.customizations.size && (
                    <span className="bg-[#EFE8E1] px-1.5 py-0.5 rounded text-[#5C4033] font-medium">
                      {line.customizations.size}
                    </span>
                  )}
                  {line.customizations.milk_type === 'oat' && (
                    <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-medium">
                      Oat Milk
                    </span>
                  )}
                  {line.customizations.add_ons?.map((a) => (
                    <span key={a.id} className="bg-[#EFE8E1] px-1.5 py-0.5 rounded">
                      +{a.name}
                    </span>
                  ))}
                </div>

                {/* Comments */}
                {line.customizations.comments && (
                  <p className="text-[10px] text-[#736357] italic mt-1 bg-white/50 px-2 py-0.5 rounded inline-block">
                    "{line.customizations.comments}"
                  </p>
                )}

                <p className="font-bold text-xs text-[#5C4033] mt-2">
                  ₱{(line.price * line.quantity).toFixed(2)}
                </p>
              </div>

              {/* Quantity Adjuster & Trash */}
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center bg-[#EFE8E1] rounded-full p-0.5 border border-[#E6DDD4]">
                  <button
                    onClick={() => updateCartQuantity(line.id, -1)}
                    className="w-6 h-6 rounded-full bg-[#FDFBF7] text-[#5C4033] font-bold text-xs flex items-center justify-center hover:bg-white transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-[#2B231F]">
                    {line.quantity}
                  </span>
                  <button
                    onClick={() => updateCartQuantity(line.id, 1)}
                    className="w-6 h-6 rounded-full bg-[#FDFBF7] text-[#5C4033] font-bold text-xs flex items-center justify-center hover:bg-white transition"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(line.id)}
                  className="p-1.5 text-[#DC2626] hover:bg-red-50 rounded-full transition"
                  title="Remove item"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {cart.length === 0 && (
            <div className="py-20 text-center text-xs text-[#8C7A6B] space-y-3">
              <ShoppingBag className="w-10 h-10 mx-auto text-[#D9CDC1]" />
              <p>Your cart is empty.</p>
              <button
                onClick={() => setCustomerScreen(3)}
                className="px-4 py-2 bg-[#5C4033] text-[#FDFBF7] font-semibold rounded-full text-xs"
              >
                Browse Menu
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cart Summary & Checkout Action */}
      {cart.length > 0 && (
        <div className="pt-4 border-t border-[#EFE8E1] space-y-3">
          <div className="space-y-1.5 text-xs text-[#736357]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₱{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-[#8C7A6B]">
              <span>Taxes & Service Charge</span>
              <span>Included</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-[#2B231F] pt-2 border-t border-[#EFE8E1]">
              <span>Total Amount</span>
              <span className="text-[#5C4033]">₱{subtotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => {
              if (orderType === 'delivery') {
                setCustomerScreen(9);
              } else {
                setCustomerScreen(7);
              }
            }}
            className="w-full py-4 bg-[#5C4033] hover:bg-[#4A3328] text-[#FDFBF7] font-bold rounded-full text-xs shadow-lg shadow-[#5C4033]/20 transition flex items-center justify-center gap-2 transform active:scale-98 cursor-pointer"
          >
            <span>{orderType === 'delivery' ? 'Continue to Delivery' : 'Proceed to Payment'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
