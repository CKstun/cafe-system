import React, { useState, useMemo } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Search, ShoppingCart, Plus, Clock } from 'lucide-react';
import { MenuItem } from '../../types/cafe';
import { CafeLogo } from '../common/CafeLogo';

interface Screen3MenuCatalogProps {
  onSelectItem: (item: MenuItem) => void;
}

export const Screen3MenuCatalog: React.FC<Screen3MenuCatalogProps> = ({ onSelectItem }) => {
  const {
    customerName,
    orderType,
    menuItems,
    categories,
    orders,
    cart,
    setCustomerScreen,
    setActiveTrackingToken,
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

  // Active customer orders in current session
  const customerOrders = orders.filter(
    (o) =>
      o.customer_name.toLowerCase() === (customerName || '').toLowerCase() ||
      ['pending', 'preparing', 'ready'].includes(o.order_status)
  );
  const activeOrders = customerOrders.filter((o) =>
    ['pending', 'preparing', 'ready'].includes(o.order_status)
  );
  const latestActiveOrder = activeOrders[0];

  return (
    <div className="flex-1 min-h-[560px] pb-24 bg-[#F4ECE1] text-[#3B2215] relative select-none">
      {/* Sticky Header */}
      <div className="sticky top-[101px] z-30 bg-[#F4ECE1]/98 backdrop-blur-md px-4 pt-3 pb-2 border-b border-[#EADBCE]/70 shadow-2xs">
        <div className="flex items-center justify-between">
          {/* Left Brand & Customer Info */}
          <div className="flex items-center gap-2.5">
            {/* Round White Sticker Badge with Logo */}
            <div className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center p-0.5 shrink-0">
              <CafeLogo size={36} className="w-8 h-8" showBorder={true} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#3B2215] leading-tight">
                Café Pepita
              </h2>
              <p className="text-[11px] text-[#7A6253] font-medium mt-0.5">
                {customerName || 'Guest'} • {orderType === 'dine-in' ? 'Dine-in' : 'Take-out'}
              </p>
            </div>
          </div>

          {/* Right Action Icons: Active Order Tracker & Cart */}
          <div className="flex items-center gap-2">
            {customerOrders.length > 0 && (
              <button
                onClick={() => {
                  if (latestActiveOrder) {
                    setActiveTrackingToken(latestActiveOrder.tracking_token);
                  }
                  setCustomerScreen(8);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#543929] text-white text-[10px] font-bold shadow-xs hover:bg-[#432C1D] transition"
                title="Track your active orders"
              >
                <Clock className="w-3 h-3" />
                <span>Track</span>
                {activeOrders.length > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                )}
              </button>
            )}

            {/* Black Circular Shopping Cart Button */}
            <button
              onClick={() => setCustomerScreen(6)}
              className="w-10 h-10 rounded-full bg-black hover:bg-neutral-800 active:scale-95 text-white flex items-center justify-center shadow-xs transition relative"
              aria-label="View Cart"
            >
              <ShoppingCart className="w-4 h-4 text-white" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#543929] text-white text-[9px] font-extrabold rounded-full flex items-center justify-center px-1 border border-white">
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
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl text-xs text-[#3B2215] placeholder-[#9C8E82] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#543929] border-0 transition"
          />
          <Search className="w-4 h-4 text-[#9C8E82] absolute left-3.5 top-3" />
        </div>

        {/* Category Pills Slider matching screenshot */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {categories.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap shadow-xs transition duration-150 active:scale-95 ${
                  isSelected
                    ? 'bg-[#543929] text-white'
                    : 'bg-white text-[#3B2215] border border-[#EADBCE] hover:bg-[#FAF6F0]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Order Banner if currently preparing */}
      {latestActiveOrder && (
        <div
          onClick={() => {
            setActiveTrackingToken(latestActiveOrder.tracking_token);
            setCustomerScreen(8);
          }}
          className="mx-4 mt-2 p-2.5 bg-[#543929] text-white rounded-2xl flex items-center justify-between cursor-pointer hover:bg-[#432C1D] transition shadow-xs text-xs"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0"></div>
            <div>
              <p className="font-bold text-[11px] leading-tight">
                Order #{latestActiveOrder.tracking_token} is {latestActiveOrder.order_status.toUpperCase()}
              </p>
              <p className="text-[10px] text-[#D4C5B9] mt-0.5">
                Staff will call "{latestActiveOrder.customer_name}" at counter
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-white text-[#543929] px-2.5 py-0.5 rounded-full whitespace-nowrap">
            View →
          </span>
        </div>
      )}

      {/* Menu Catalog List (Single Column Stack matching screenshot) */}
      <div className="p-4 space-y-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectItem(item)}
            className="bg-white rounded-3xl p-3 shadow-xs flex items-center gap-3.5 transition hover:shadow-md cursor-pointer border border-[#EADBCE]/40"
          >
            {/* Left Image / "No Image" Box */}
            <div className="w-32 h-28 sm:w-36 sm:h-32 rounded-2xl bg-[#EFE7DC] flex items-center justify-center shrink-0 overflow-hidden relative">
              {item.image_path ? (
                <img
                  src={item.image_path}
                  alt={item.name}
                  loading="lazy"
                  className="w-full h-full object-cover rounded-2xl"
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
            </div>

            {/* Right Item Info */}
            <div className="flex-1 flex flex-col justify-between self-stretch py-1">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-[#3B2215] leading-snug">
                  {item.name}
                </h3>
                {item.description && (
                  <p className="text-[10px] text-[#8C7465] line-clamp-1 mt-0.5">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Price and Plus Button matching screenshot */}
              <div className="flex items-center justify-between mt-2">
                <span className="font-bold text-sm sm:text-base text-[#3B2215]">
                  ₱{item.price.toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectItem(item);
                  }}
                  className="w-11 h-8 rounded-2xl bg-[#543929] hover:bg-[#432C1D] active:scale-95 text-white flex items-center justify-center shadow-xs transition"
                  aria-label={`Add ${item.name}`}
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="py-16 text-center px-4 bg-white rounded-3xl border border-[#EADBCE]/50">
            <p className="text-xs text-[#8C7465]">
              No menu items found in this section.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-3 px-4 py-2 rounded-2xl bg-[#543929] text-white text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md sm:max-w-lg md:max-w-xl mx-auto z-40">
          <button
            onClick={() => setCustomerScreen(6)}
            className="w-full py-3.5 px-5 bg-[#543929] hover:bg-[#432C1D] text-white rounded-2xl shadow-xl flex items-center justify-between font-bold text-xs transition transform active:scale-98"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white text-[#543929] flex items-center justify-center text-[10px] font-extrabold">
                {totalCartCount}
              </span>
              <span>View Cart</span>
            </div>
            <span className="text-sm">₱{totalCartAmount.toFixed(2)}</span>
          </button>
        </div>
      )}
    </div>
  );
};
