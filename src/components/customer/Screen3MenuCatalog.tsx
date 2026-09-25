import React, { useState, useMemo } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Search, ShoppingCart, Plus, Clock } from 'lucide-react';
import { MenuItem } from '../../types/cafe';
import { CafeLogo } from '../common/CafeLogo';
import { CategorySlider } from './CategorySlider';

interface Screen3MenuCatalogProps {
  onSelectItem: (item: MenuItem) => void;
}

export const Screen3MenuCatalog: React.FC<Screen3MenuCatalogProps> = ({ onSelectItem }) => {
  const {
    customerName,
    guestSessionId,
    orderType,
    menuItems,
    categories,
    orders,
    cart,
    setCustomerScreen,
    setActiveTrackingToken,
    activeTrackingToken,
    navigate,
    checkItemOverallAvailability,
  } = useCafe();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const displayCategories = useMemo(() => {
    return categories.filter((cat) => cat.toLowerCase() !== 'all');
  }, [categories]);

  const handleCategoryClick = (cat: string) => {
    if (selectedCategory && selectedCategory.toLowerCase() === cat.toLowerCase()) {
      // Tapping the category selector 2 times deselects the category
      setSelectedCategory(null);
    } else {
      setSelectedCategory(cat);
    }
  };

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (!item.is_available) return false;
      // If no category is selected or filtered, always shows all items in the menu
      const matchesCategory =
        !selectedCategory ||
        selectedCategory === 'All' ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  const totalCartCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalCartAmount = cart.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  // Order Identifier Priority: Base all customer order lookups strictly on unique guest_session_id (UUID v4), NEVER on customer_name
  const customerOrders = orders.filter(
    (o) =>
      o.guest_session_id === guestSessionId ||
      (activeTrackingToken && o.tracking_token === activeTrackingToken)
  );
  const activeOrders = customerOrders.filter((o) =>
    ['pending', 'preparing', 'ready'].includes(o.order_status)
  );
  const latestActiveOrder = activeOrders[0];

  return (
    <div className="flex-1 min-h-[560px] pb-24 bg-[#F4ECE1] text-[#3B2215] relative select-none">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-[#F4ECE1]/98 backdrop-blur-md px-4 pt-3 pb-2 border-b border-[#EADBCE]/70 shadow-2xs">
        <div className="flex items-center justify-between">
          {/* Left Brand & Customer Info: Tapping Logo or Brand redirects to Welcome */}
          <div
            onClick={() => {
              setCustomerScreen(1);
              navigate('/welcome');
            }}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
            title="Café Pepita — Return to Welcome Screen"
          >
            {/* Round White Sticker Badge with Logo */}
            <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-[#EADBCE] flex items-center justify-center p-0.5 shrink-0 group-hover:scale-105 transition-transform">
              <CafeLogo size={36} className="w-8 h-8" showBorder={false} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#3B2215] leading-tight group-hover:text-[#5C3D2E] transition-colors">
                Café Pepita
              </h2>
              <p className="text-[11px] text-[#7A6253] font-medium mt-0.5">
                {customerName || 'Guest'} • {orderType === 'dine-in' ? 'Dine-in' : orderType === 'delivery' ? 'Delivery' : 'Take-out'}
              </p>
            </div>
          </div>

          {/* Right Action Icons: Active Order Tracker & Cart */}
          <div className="flex items-center gap-2">
            {customerOrders.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (latestActiveOrder) {
                    setActiveTrackingToken(latestActiveOrder.tracking_token);
                  }
                  setCustomerScreen(8);
                  navigate('/order-status');
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#5C3D2E] text-white text-[10px] font-bold shadow-xs hover:bg-[#4A2F22] transition cursor-pointer"
                title="Track your active orders"
              >
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                <span>Track</span>
                {activeOrders.length > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                )}
              </button>
            )}

            {/* Black Circular Shopping Cart Button */}
            <button
              type="button"
              onClick={() => {
                setCustomerScreen(6);
                navigate('/cart');
              }}
              className="w-10 h-10 rounded-full bg-black hover:bg-neutral-800 active:scale-95 text-white flex items-center justify-center shadow-xs transition relative cursor-pointer"
              aria-label="View Cart"
            >
              <ShoppingCart className="w-4 h-4 text-white" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#5C3D2E] text-white text-[9px] font-extrabold rounded-full flex items-center justify-center px-1 border border-white">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar matching screenshot */}
        <div className="mt-3 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Menu"
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl text-xs text-[#3B2215] placeholder-[#9C8E82] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#5C3D2E] border-0 transition"
          />
          <Search className="w-4 h-4 text-[#9C8E82] absolute left-3.5 top-3" />
        </div>

        {/* Adaptive Category Slider (Touch swipe on mobile/tablet, visible scrollbar on PC/laptop) */}
        <CategorySlider
          categories={displayCategories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategoryClick}
          className="mt-2.5"
        />
      </div>

      {/* Adaptive Menu Grid View (Breakpoint-based: mobile 1-col, tablet 2-3 col, desktop 4-col) */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item) => {
          const overallAvail = checkItemOverallAvailability(item.id);
          const isSoldOut = !overallAvail.isAvailable;

          return (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className={`bg-white rounded-3xl p-3.5 shadow-xs flex flex-row md:flex-col justify-between gap-3.5 transition duration-200 hover:shadow-md cursor-pointer border border-[#EADBCE]/50 group relative ${
                isSoldOut ? 'opacity-75' : ''
              }`}
            >
              {/* Left / Top Image */}
              <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-full md:h-44 rounded-2xl bg-[#EFE7DC] flex items-center justify-center shrink-0 overflow-hidden relative">
                {item.image_path ? (
                  <img
                    src={item.image_path}
                    alt={item.name}
                    loading="lazy"
                    className="w-full h-full object-cover rounded-2xl transition duration-300 group-hover:scale-105"
                    onError={(e) => {
                      // Fallback to "No Image" container on image error
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.nextElementSibling) {
                        (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div
                  className={`w-full h-full flex items-center justify-center ${
                    item.image_path ? 'hidden' : 'flex'
                  }`}
                >
                  <span className="text-xs font-medium text-[#A69485]">
                    No Image
                  </span>
                </div>

                {/* Sold Out Overlay */}
                {isSoldOut && (
                  <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px] flex flex-col items-center justify-center p-2 text-center">
                    <span className="px-2.5 py-1 bg-red-600 text-white text-[10px] font-extrabold uppercase rounded-full tracking-wider shadow-xs">
                      Sold Out
                    </span>
                    <span className="text-[9px] text-white/90 mt-1 font-medium line-clamp-1">
                      {overallAvail.missingItemName ? `No ${overallAvail.missingItemName}` : 'Unavailable'}
                    </span>
                  </div>
                )}
              </div>

              {/* Item Info & Price / Add CTA */}
              <div className="flex-1 flex flex-col justify-between self-stretch py-0.5">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#3B2215] leading-snug group-hover:text-[#5C3D2E] transition-colors">
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="text-[11px] text-[#8C7465] line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Price and Plus Button */}
                <div className="flex items-center justify-between mt-3 pt-1">
                  <span className="font-bold text-sm sm:text-base font-mono text-[#3B2215]">
                    ₱{item.price.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectItem(item);
                    }}
                    className={`w-11 h-9 rounded-2xl flex items-center justify-center shadow-xs transition cursor-pointer ${
                      isSoldOut
                        ? 'bg-stone-200 text-stone-400 hover:bg-stone-300'
                        : 'bg-[#5C3D2E] hover:bg-[#4A2F22] active:bg-[#3D261B] active:scale-95 text-white'
                    }`}
                    aria-label={`Add ${item.name}`}
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="col-span-full py-16 text-center px-4 bg-white rounded-3xl border border-[#EADBCE]/50">
            <p className="text-xs text-[#8C7465]">
              No menu items found in this section.
            </p>
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md sm:max-w-lg md:max-w-xl mx-auto z-40">
          <button
            onClick={() => setCustomerScreen(6)}
            className="w-full py-3.5 px-6 bg-[#5C3D2E] hover:bg-[#4A2F22] active:bg-[#3D261B] text-white rounded-2xl shadow-xl flex items-center justify-between font-bold text-xs sm:text-sm transition transform active:scale-98 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white text-[#5C3D2E] flex items-center justify-center text-[10px] font-extrabold">
                {totalCartCount}
              </span>
              <span>View Cart</span>
            </div>
            <span className="font-mono text-sm font-bold">₱{totalCartAmount.toFixed(2)}</span>
          </button>
        </div>
      )}
    </div>
  );
};
