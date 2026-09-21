import React, { useState, useMemo } from 'react';
import { useCafe } from '../../context/CafeContext';
import { MenuItem } from '../../types/cafe';
import { X, Plus, Minus, AlertCircle } from 'lucide-react';

interface Screen4ItemModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

const FOOD_CATEGORIES = [
  'All-day Breakfast',
  'Sandwich & Burger',
  'Pasta',
  'Rice Meals',
  'Snacks & Appetizers',
  'Kitchen Items',
];

export const Screen4ItemModal: React.FC<Screen4ItemModalProps> = ({ item, onClose }) => {
  const { addOns, addToCart, checkVariantAvailability } = useCafe();

  if (!item) return null;

  const isFood = FOOD_CATEGORIES.includes(item.category);
  const isPartyTray = item.category === 'Party Trays';
  const isBeverage = !isFood && !isPartyTray;
  const isRefresher =
    item.category.toLowerCase().includes('refresher') ||
    item.name.toLowerCase().includes('refresher');

  // Determine initial size
  const defaultSize =
    item.available_sizes && item.available_sizes.length > 0
      ? item.available_sizes[0].size
      : item.size || (isBeverage ? '12oz' : 'Regular');

  // States
  const [selectedSize, setSelectedSize] = useState<string>(defaultSize);
  // Default to null if available_flavors exists to show the initial prompt/warning like in the mockup
  const [selectedFlavor, setSelectedFlavor] = useState<string | null>(item.flavor || null);
  const [selectedMilk, setSelectedMilk] = useState<'regular' | 'oat'>('regular');
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<number[]>([]);
  const [comments, setComments] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [showFlavorError, setShowFlavorError] = useState<boolean>(false);

  // Can this item substitute oat milk?
  const allowsOatMilk = Boolean(
    !isRefresher &&
      (item.has_sub_oat ||
        item.sub_oat_price ||
        item.available_sizes?.some((s) => s.oat_price !== undefined) ||
        (['Classic Blend', 'Signature Blend', 'Hot Blend', 'Frappe', 'Non-Espresso'].includes(
          item.category
        ) &&
          !item.name.toLowerCase().includes('americano')))
  );

  const toggleAddOn = (id: number) => {
    if (isRefresher) return;
    setSelectedAddOnIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Calculate unit price dynamically based on exact size, oat substitution, and add-ons
  const calculatedUnitPrice = useMemo(() => {
    let base = item.price;

    if (item.available_sizes && item.available_sizes.length > 0) {
      const match = item.available_sizes.find((s) => s.size === selectedSize);
      if (match) {
        if (selectedMilk === 'oat' && match.oat_price) {
          base = match.oat_price;
        } else {
          base = match.price;
        }
      }
    } else if (selectedMilk === 'oat' && item.sub_oat_price) {
      base = item.sub_oat_price;
    } else if (selectedMilk === 'oat' && allowsOatMilk) {
      base += 30; // fallback if unspecified
    }

    const addOnsTotal = isRefresher
      ? 0
      : addOns
          .filter((a) => selectedAddOnIds.includes(a.id))
          .reduce((acc, curr) => acc + curr.price, 0);

    return base + addOnsTotal;
  }, [item, selectedSize, selectedMilk, selectedAddOnIds, addOns, allowsOatMilk, isRefresher]);

  const totalPrice = calculatedUnitPrice * quantity;

  const handleAddToCart = () => {
    // If flavors are available for this item and user hasn't selected one
    if (item.available_flavors && item.available_flavors.length > 0 && !selectedFlavor) {
      setShowFlavorError(true);
      return;
    }

    const selectedAddOnObjects = isRefresher
      ? []
      : addOns.filter((a) => selectedAddOnIds.includes(a.id));
    addToCart(
      item,
      selectedSize,
      selectedFlavor,
      selectedMilk,
      selectedAddOnObjects,
      comments.trim(),
      quantity
    );
    onClose();
  };

  const hasFlavors = Boolean(item.available_flavors && item.available_flavors.length > 0);

  return (
    <div className="fixed inset-0 z-[70] bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 transition-opacity">
      {/* Modal Container: responsive for phone, tablet, and desktop */}
      <div className="bg-[#FAF5EE] w-full max-w-md sm:max-w-lg rounded-t-[28px] sm:rounded-[28px] max-h-[92vh] sm:max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-[#EADBCE]/70 animate-in slide-in-from-bottom duration-200">
        {/* Banner / Image Area (Matching Mockup exactly) */}
        <div className="relative h-44 sm:h-48 bg-[#9C8F81] flex flex-col justify-between p-4 shrink-0 overflow-hidden">
          {/* Background image or fallback text */}
          {item.image_path ? (
            <img
              src={item.image_path}
              alt={item.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10 flex items-center justify-center">
            {!item.image_path && (
              <span className="text-[#DDD3C7] text-sm font-medium tracking-wide">
                No Image
              </span>
            )}
          </div>

          {/* Close button (round dark circle with white 'x') */}
          <div className="relative z-10 flex justify-end">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/45 hover:bg-black/70 text-white flex items-center justify-center transition"
              aria-label="Close modal"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Title on the bottom of the banner */}
          <div className="relative z-10">
            <h3 className="text-white font-bold text-lg sm:text-xl leading-tight drop-shadow-xs">
              {item.name}
            </h3>
            {item.description && (
              <p className="text-white/80 text-[11px] mt-0.5 line-clamp-1">
                {item.description}
              </p>
            )}
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="overflow-y-auto px-5 py-4 sm:px-6 sm:py-5 space-y-4 sm:space-y-5 flex-1">
          {/* SIZE Selection */}
          {item.available_sizes && item.available_sizes.length > 0 ? (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7C6656] mb-2">
                {isPartyTray ? 'TRAY SIZE' : 'SIZE'}
              </label>
              <div className={`grid gap-3 ${item.available_sizes.length === 2 ? 'grid-cols-2' : item.available_sizes.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
                {item.available_sizes.map((s) => {
                  const isSelected = selectedSize === s.size;
                  const displayPrice =
                    selectedMilk === 'oat' && s.oat_price ? s.oat_price : s.price;
                  const stockCheck = checkVariantAvailability(item.id, s.size);
                  const isAvailable = stockCheck.isAvailable;

                  return (
                    <button
                      key={s.size}
                      type="button"
                      onClick={() => setSelectedSize(s.size)}
                      className={`py-3.5 px-4 rounded-2xl text-center transition flex flex-col items-center justify-center relative ${
                        isSelected
                          ? 'bg-[#83502E] text-white shadow-md ring-2 ring-[#5C3D2E]'
                          : isAvailable
                          ? 'bg-white text-[#2B231F] border border-stone-200/70 hover:border-[#83502E]/60 shadow-2xs'
                          : 'bg-stone-100/80 text-stone-400 border border-stone-200 cursor-pointer'
                      }`}
                    >
                      <span className={`text-sm font-bold ${isSelected ? 'text-white' : isAvailable ? 'text-[#2B231F]' : 'text-stone-500'}`}>
                        {s.size}
                      </span>
                      <span
                        className={`text-xs mt-0.5 ${
                          isSelected ? 'text-white/90 font-medium' : isAvailable ? 'text-[#8C7A6B]' : 'text-stone-400 line-through'
                        }`}
                      >
                        ₱{displayPrice.toFixed(2)}
                      </span>
                      {!isAvailable && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase mt-1 ${
                          isSelected ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700'
                        }`}>
                          Out of Stock
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* FLAVOR Selection */}
          {hasFlavors && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7C6656] mb-2">
                FLAVOR
              </label>
              <div className="flex flex-wrap gap-2">
                {item.available_flavors!.map((flv) => {
                  const isSelected = selectedFlavor === flv;
                  return (
                    <button
                      key={flv}
                      type="button"
                      onClick={() => {
                        setSelectedFlavor(flv);
                        setShowFlavorError(false);
                      }}
                      className={`px-4 py-2 rounded-full text-xs font-medium transition ${
                        isSelected
                          ? 'bg-[#83502E] text-white font-semibold shadow-xs'
                          : 'bg-white text-[#2B231F] border border-stone-200/70 hover:border-[#83502E]/60 shadow-2xs'
                      }`}
                    >
                      {flv}
                    </button>
                  );
                })}
              </div>
              {/* Validation Warning matching Mockup */}
              {(!selectedFlavor || showFlavorError) && (
                <p className="text-[11px] text-[#D93829] font-medium mt-1.5">
                  Please select a flavor.
                </p>
              )}
            </div>
          )}

          {/* MILK OPTION (for beverages with oat milk substitution) */}
          {allowsOatMilk && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7C6656] mb-2">
                MILK OPTION
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMilk('regular')}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition ${
                    selectedMilk === 'regular'
                      ? 'bg-[#83502E] text-white font-semibold shadow-xs'
                      : 'bg-white text-[#2B231F] border border-stone-200/70 hover:border-[#83502E]/60 shadow-2xs'
                  }`}
                >
                  Regular Dairy
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMilk('oat')}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition ${
                    selectedMilk === 'oat'
                      ? 'bg-[#83502E] text-white font-semibold shadow-xs'
                      : 'bg-white text-[#2B231F] border border-stone-200/70 hover:border-[#83502E]/60 shadow-2xs'
                  }`}
                >
                  Sub-Oat Milk
                </button>
              </div>
            </div>
          )}

          {/* ADD-ONS Selection (Capsule pill size matching mockup ending in 950 - not shown for Refreshers) */}
          {isBeverage && !isRefresher && addOns.length > 0 && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7C6656] mb-2">
                ADD-ONS
              </label>
              <div className="flex flex-wrap gap-2">
                {addOns.map((addon) => {
                  const isSelected = selectedAddOnIds.includes(addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddOn(addon.id)}
                      className={`px-4 py-2 rounded-full text-xs transition inline-flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#83502E] text-white font-semibold shadow-xs'
                          : 'bg-white text-[#2B231F] border border-stone-200/70 hover:border-[#83502E]/60 shadow-2xs font-medium'
                      }`}
                    >
                      <span>{addon.name}</span>
                      <span
                        className={`text-[10px] ${
                          isSelected ? 'text-white/80' : 'text-[#8C7A6B]'
                        }`}
                      >
                        (+₱{addon.price})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* REQUEST (Special Instructions Input) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7C6656] mb-2">
              REQUEST
            </label>
            <input
              type="text"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="e.g. Less sugar, less ice, no ice..."
              className="w-full px-4 py-3 bg-white border border-stone-200/80 rounded-2xl text-xs text-[#2B231F] placeholder-[#B5A89E] focus:outline-none focus:ring-2 focus:ring-[#83502E] shadow-2xs transition"
            />
          </div>

          {/* QUANTITY Selection and Action Bar */}
          <div className="pt-2 space-y-3">
            {(() => {
              const currentStockCheck = checkVariantAvailability(item.id, selectedSize);
              if (!currentStockCheck.isAvailable) {
                return (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>
                      The <strong>{selectedSize}</strong> variant is currently unavailable due to limited {currentStockCheck.missingItemName || 'supplies'}. Please choose another size.
                    </span>
                  </div>
                );
              }
              return null;
            })()}

            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7C6656]">
              QUANTITY
            </label>
            <div className="flex items-center gap-3">
              {/* Stepper */}
              <div className="flex items-center bg-white border border-stone-200/80 rounded-full p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-full bg-[#F4ECE1] text-[#83502E] font-bold flex items-center justify-center hover:bg-[#EADBCE] active:scale-95 transition"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-bold text-[#2B231F]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 rounded-full bg-[#83502E] text-white font-bold flex items-center justify-center hover:bg-[#6F4224] active:scale-95 transition"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Order Button */}
              {(() => {
                const isAvail = checkVariantAvailability(item.id, selectedSize).isAvailable;
                return (
                  <button
                    type="button"
                    disabled={!isAvail}
                    onClick={handleAddToCart}
                    className={`flex-1 py-3.5 px-5 font-bold text-sm rounded-2xl shadow-md transition flex items-center justify-between ${
                      isAvail
                        ? 'bg-[#5C3D2E] hover:bg-[#4A2F22] active:bg-[#3D261B] text-white active:scale-98 cursor-pointer'
                        : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                    }`}
                  >
                    <span>{isAvail ? 'Add to Order' : 'Variant Out of Stock'}</span>
                    <span className="font-mono">₱{totalPrice.toFixed(2)}</span>
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
