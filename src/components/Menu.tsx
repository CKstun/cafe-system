import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  X,
  Coffee,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Trash2,
  ChevronRight,
  Utensils,
  User,
  ShoppingBag,
  Info
} from 'lucide-react';
import { useCafe } from '../context/CafeContext';
import { MenuItem, AddOn, OrderType, PaymentMethod } from '../types/cafe';
import { CafeLogo } from './common/CafeLogo';
import {
  STORAGE_KEY_CUSTOMER_NAME,
  STORAGE_KEY_SESSION_ID,
  STORAGE_KEY_SESSION_TIMESTAMP,
  EIGHT_HOURS_MS,
  generateUUIDv4,
  isGuestSessionActive
} from '../hooks/useGuestSession';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export type CategoryTab = 'All' | 'Coffee' | 'Non-Coffee' | 'Food' | 'Add-ons';

export interface LocalCartItem {
  id: string;
  menu_item_id: number;
  item_name: string;
  price: number;
  quantity: number;
  size?: string;
  flavor?: string | null;
  milk_type?: 'regular' | 'oat';
  add_ons: { id: number; name: string; price: number }[];
  comments?: string;
  image_path?: string;
}

export interface MenuProps {
  onProceedToCheckout?: () => void;
  onOpenOrderTracker?: (token: string) => void;
  className?: string;
}

// Fallback Add-Ons if none loaded in context
const DEFAULT_ADDONS: AddOn[] = [
  { id: 101, name: 'Espresso Shot', price: 35, stock_quantity: 100, track_inventory: false },
  { id: 102, name: 'Caramel Drizzle', price: 20, stock_quantity: 100, track_inventory: false },
  { id: 103, name: 'Whipped Cream', price: 25, stock_quantity: 100, track_inventory: false },
  { id: 104, name: 'Coffee Jelly', price: 25, stock_quantity: 100, track_inventory: false },
  { id: 105, name: 'Vanilla Syrup', price: 20, stock_quantity: 100, track_inventory: false }
];

// Helper to determine if a menu category maps to high-level tabs
const mapItemToTab = (item: MenuItem): CategoryTab => {
  const cat = (item.category || '').toLowerCase();
  const name = (item.name || '').toLowerCase();

  if (cat.includes('add-on') || cat.includes('addon') || cat.includes('extra')) {
    return 'Add-ons';
  }
  if (
    cat.includes('coffee') ||
    cat.includes('espresso') ||
    cat.includes('blend') ||
    cat.includes('latte') ||
    cat.includes('americano') ||
    cat.includes('cappuccino') ||
    name.includes('espresso') ||
    name.includes('americano')
  ) {
    return 'Coffee';
  }
  if (
    cat.includes('non-espresso') ||
    cat.includes('refresher') ||
    cat.includes('tea') ||
    cat.includes('frappe') ||
    cat.includes('beverage') ||
    cat.includes('juice') ||
    cat.includes('smoothie')
  ) {
    return 'Non-Coffee';
  }
  if (
    cat.includes('food') ||
    cat.includes('breakfast') ||
    cat.includes('sandwich') ||
    cat.includes('burger') ||
    cat.includes('pasta') ||
    cat.includes('meal') ||
    cat.includes('pastry') ||
    cat.includes('snack') ||
    cat.includes('dessert')
  ) {
    return 'Food';
  }

  // Default fallback based on common beverage flags
  return 'Coffee';
};

// ==========================================
// MAIN COMPONENT: Menu
// ==========================================

export const Menu: React.FC<MenuProps> = ({
  onProceedToCheckout,
  onOpenOrderTracker,
  className = ''
}) => {
  // ----------------------------------------------------
  // Context Integration with safe fallback resilience
  // ----------------------------------------------------
  const cafeContext = useCafe();

  const menuItems: MenuItem[] = cafeContext?.menuItems || [];
  const contextAddOns: AddOn[] = cafeContext?.addOns?.length ? cafeContext.addOns : DEFAULT_ADDONS;
  const contextCart = cafeContext?.cart || [];
  const checkVariantAvailability = cafeContext?.checkVariantAvailability;
  const checkItemOverallAvailability = cafeContext?.checkItemOverallAvailability;
  const orderType = cafeContext?.orderType || 'dine-in';
  const customerName = cafeContext?.customerName || '';
  const setCustomerName = cafeContext?.setCustomerName;
  const saveCustomerNameAtCheckout = cafeContext?.saveCustomerNameAtCheckout;
  const setCustomerDetails = cafeContext?.setCustomerDetails;
  const placeOrder = cafeContext?.placeOrder;
  const navigate = cafeContext?.navigate;
  const setCustomerScreen = cafeContext?.setCustomerScreen;
  const guestSessionId = cafeContext?.guestSessionId || '';
  const activeOrders = useMemo(() => {
    return (cafeContext?.orders || []).filter(
      (o) =>
        (o.guest_session_id === guestSessionId || o.customer_name === customerName) &&
        ['pending', 'preparing', 'ready'].includes(o.order_status)
    );
  }, [cafeContext?.orders, guestSessionId, customerName]);

  // ----------------------------------------------------
  // Local UI State (Strict separation of browsing vs checkout)
  // ----------------------------------------------------
  const [selectedTab, setSelectedTab] = useState<CategoryTab>('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Item Customization Modal State (Opened upon clicking an item card)
  const [activeItemForModal, setActiveItemForModal] = useState<MenuItem | null>(null);

  // Cart Drawer / Review Modal State (Opened strictly from Cart icons/bottom bar)
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);

  // Guest Checkout Verification Modal (Opened ONLY after clicking "Proceed to Checkout" from Cart)
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);

  // Notification Toast when item is added to cart
  const [addedToast, setAddedToast] = useState<{ show: boolean; itemName: string } | null>(null);

  // ----------------------------------------------------
  // Item Customization Form State
  // ----------------------------------------------------
  const [modalSize, setModalSize] = useState<string>('12oz');
  const [modalFlavor, setModalFlavor] = useState<string | null>(null);
  const [modalMilk, setModalMilk] = useState<'regular' | 'oat'>('regular');
  const [modalAddOnIds, setModalAddOnIds] = useState<number[]>([]);
  const [modalComments, setModalComments] = useState<string>('');
  const [modalQuantity, setModalQuantity] = useState<number>(1);
  const [modalFlavorError, setModalFlavorError] = useState<boolean>(false);

  // ----------------------------------------------------
  // Guest Checkout Form State (8-hour persistent session)
  // ----------------------------------------------------
  const [checkoutName, setCheckoutName] = useState<string>('');
  const [checkoutOrderType, setCheckoutOrderType] = useState<OrderType>(orderType);
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<PaymentMethod>('cash');
  const [isSessionValid, setIsSessionValid] = useState<boolean>(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);
  const [orderSuccessData, setOrderSuccessData] = useState<{
    token: string;
    name: string;
    orderNumber: number;
  } | null>(null);

  // Auto-calculated incremental Order Number for counter disambiguation (e.g. #1042)
  const nextOrderNumber = useMemo(() => {
    const existingMax = (cafeContext?.orders || []).reduce(
      (max, ord) => Math.max(max, ord.order_number || 1040),
      1040
    );
    return existingMax + 1;
  }, [cafeContext?.orders]);

  // Check 8-hour guest session from localStorage on mount & when checkout opens
  const syncGuestSession = () => {
    try {
      const tsStr = localStorage.getItem(STORAGE_KEY_SESSION_TIMESTAMP);
      const ts = tsStr ? parseInt(tsStr, 10) : null;
      const active = isGuestSessionActive(ts);
      setIsSessionValid(active);

      if (active) {
        const savedName = localStorage.getItem(STORAGE_KEY_CUSTOMER_NAME) || customerName || '';
        setCheckoutName(savedName);
      } else {
        setCheckoutName(customerName || '');
      }
    } catch {
      setIsSessionValid(false);
    }
  };

  useEffect(() => {
    syncGuestSession();
  }, [customerName]);

  // ----------------------------------------------------
  // Category & Filter Derivation
  // ----------------------------------------------------
  const availableSubCategories = useMemo(() => {
    const set = new Set<string>();
    menuItems.forEach((item) => {
      if (item.category && item.category !== 'All') {
        set.add(item.category);
      }
    });
    return Array.from(set);
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Must be available
      if (!item.is_available) return false;

      // Tab Filter
      if (selectedTab !== 'All') {
        const tab = mapItemToTab(item);
        if (tab !== selectedTab) return false;
      }

      // Sub-category chip filter (if selected)
      if (selectedSubCategory) {
        if (item.category.toLowerCase() !== selectedSubCategory.toLowerCase()) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = (item.description || '').toLowerCase().includes(q);
        const matchesCat = item.category.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }

      return true;
    });
  }, [menuItems, selectedTab, selectedSubCategory, searchQuery]);

  // Cart Metrics
  const totalCartCount = useMemo(() => {
    return contextCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }, [contextCart]);

  const totalCartAmount = useMemo(() => {
    return contextCart.reduce((sum, item) => sum + Number(item.price || 0) * (item.quantity || 1), 0);
  }, [contextCart]);

  // ----------------------------------------------------
  // Handler: Open Customization Modal for Item
  // ----------------------------------------------------
  const handleOpenItemModal = (item: MenuItem) => {
    const isBeverage = mapItemToTab(item) === 'Coffee' || mapItemToTab(item) === 'Non-Coffee';
    const initialSize =
      item.available_sizes && item.available_sizes.length > 0
        ? item.available_sizes[0].size
        : item.size || (isBeverage ? '12oz' : 'Regular');

    setActiveItemForModal(item);
    setModalSize(initialSize);
    setModalFlavor(item.flavor || null);
    setModalMilk('regular');
    setModalAddOnIds([]);
    setModalComments('');
    setModalQuantity(1);
    setModalFlavorError(false);
  };

  // Close Customization Modal
  const handleCloseItemModal = () => {
    setActiveItemForModal(null);
  };

  // ----------------------------------------------------
  // Handler: Standard Cart Aggregation
  // Appends item into cart state without forced checkout popup!
  // ----------------------------------------------------
  const handleConfirmAddToCart = () => {
    if (!activeItemForModal) return;

    // Check flavor requirement
    if (
      activeItemForModal.available_flavors &&
      activeItemForModal.available_flavors.length > 0 &&
      !modalFlavor
    ) {
      setModalFlavorError(true);
      return;
    }

    const selectedAddOnObjects = contextAddOns.filter((a) => modalAddOnIds.includes(a.id));

    // Append to cart via context
    if (cafeContext?.addToCart) {
      cafeContext.addToCart(
        activeItemForModal,
        modalSize,
        modalFlavor,
        modalMilk,
        selectedAddOnObjects,
        modalComments.trim(),
        modalQuantity
      );
    }

    // Trigger brief, pleasant toast
    setAddedToast({
      show: true,
      itemName: `${activeItemForModal.name} (${modalSize})`
    });
    setTimeout(() => {
      setAddedToast(null);
    }, 2800);

    // Close modal cleanly
    handleCloseItemModal();
  };

  // ----------------------------------------------------
  // Handler: Proceed to Checkout from Cart Drawer
  // Dual-Behavior Separation: Verification occurs ONLY here!
  // ----------------------------------------------------
  const handleInitiateCheckout = () => {
    setIsCartDrawerOpen(false);
    syncGuestSession();
    setIsCheckoutModalOpen(true);
  };

  // Final Order Confirmation
  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = checkoutName.trim();
    if (!cleanName || cleanName.length < 2) return;

    setIsSubmittingOrder(true);

    try {
      // 1. Update 8-hour guest localStorage session
      const now = Date.now();
      localStorage.setItem(STORAGE_KEY_CUSTOMER_NAME, cleanName);
      localStorage.setItem(STORAGE_KEY_SESSION_TIMESTAMP, now.toString());
      let sid = localStorage.getItem(STORAGE_KEY_SESSION_ID);
      if (!sid) {
        sid = generateUUIDv4();
        localStorage.setItem(STORAGE_KEY_SESSION_ID, sid);
      }

      if (saveCustomerNameAtCheckout) {
        saveCustomerNameAtCheckout(cleanName);
      } else if (setCustomerName) {
        setCustomerName(cleanName);
      }

      if (setCustomerDetails) {
        setCustomerDetails(cleanName, checkoutOrderType, null);
      }

      // 2. Submit order through context
      let generatedToken = '';
      if (placeOrder) {
        generatedToken = placeOrder(checkoutPaymentMethod);
      } else {
        generatedToken = `${Math.floor(100000 + Math.random() * 900000)}`;
      }

      setIsSubmittingOrder(false);
      setIsCheckoutModalOpen(false);
      setOrderSuccessData({
        token: generatedToken,
        name: cleanName,
        orderNumber: nextOrderNumber
      });

      // If callback provided, notify parent
      if (onProceedToCheckout) {
        onProceedToCheckout();
      }
    } catch (err) {
      console.error('Failed to submit guest order:', err);
      setIsSubmittingOrder(false);
    }
  };

  // Dynamic modal unit price computation
  const modalCalculatedUnitPrice = useMemo(() => {
    if (!activeItemForModal) return 0;
    let base = activeItemForModal.price;

    if (activeItemForModal.available_sizes && activeItemForModal.available_sizes.length > 0) {
      const match = activeItemForModal.available_sizes.find((s) => s.size === modalSize);
      if (match) {
        if (modalMilk === 'oat' && match.oat_price) {
          base = match.oat_price;
        } else {
          base = match.price;
        }
      }
    } else if (modalMilk === 'oat' && activeItemForModal.sub_oat_price) {
      base = activeItemForModal.sub_oat_price;
    } else if (modalMilk === 'oat') {
      base += 30; // standard oat supplement
    }

    const addOnsCost = contextAddOns
      .filter((a) => modalAddOnIds.includes(a.id))
      .reduce((sum, curr) => sum + curr.price, 0);

    return base + addOnsCost;
  }, [activeItemForModal, modalSize, modalMilk, modalAddOnIds, contextAddOns]);

  return (
    <div
      className={`min-h-screen bg-[#FDFBF7] text-[#2B231F] flex flex-col font-sans selection:bg-[#4A2E19] selection:text-[#FDFBF7] ${className}`}
    >
      {/* ====================================================
          STICKY HEADER
          - Cream `#FDFBF7` background with subtle blur
          - Café Pepita Brand & Active Guest Identity
          - Search Bar
          - Active Order Tracker & Cart Counter Badge
      ==================================================== */}
      <header className="sticky top-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#EADBCE]/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Brand Identity */}
            <div
              onClick={() => {
                if (setCustomerScreen) setCustomerScreen(1);
                if (navigate) navigate('/welcome');
              }}
              className="flex items-center gap-3 cursor-pointer group select-none"
              title="Café Pepita · Fresh Brews & Homemade Comfort"
            >
              <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-[#EADBCE] flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform duration-200">
                <CafeLogo size={36} className="w-8 h-8" showBorder={false} />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-[#4A2E19] leading-tight group-hover:text-[#3D2514] transition-colors">
                  Café Pepita
                </h1>
                <p className="text-[11px] text-[#7A6253] font-medium leading-none mt-0.5">
                  {customerName ? (
                    <span className="font-semibold text-[#4A2E19]">{customerName}</span>
                  ) : (
                    'Guest'
                  )}{' '}
                  • {orderType === 'dine-in' ? 'Dine-In' : orderType === 'delivery' ? 'Delivery' : 'Take-Out'}
                </p>
              </div>
            </div>

            {/* Right: Quick Tracker & Floating Cart Launcher */}
            <div className="flex items-center gap-2.5">
              {/* Active Order Tracker Pill (if active order exists) */}
              {activeOrders.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const token = activeOrders[0]?.tracking_token;
                    if (onOpenOrderTracker && token) {
                      onOpenOrderTracker(token);
                    } else if (setCustomerScreen) {
                      setCustomerScreen(8);
                      if (navigate) navigate('/order-status');
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#4A2E19] text-white text-xs font-bold shadow-xs hover:bg-[#3D2514] transition active:scale-95 cursor-pointer"
                  title="View active order status"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">Track Order</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                </button>
              )}

              {/* Cart Drawer Button */}
              <button
                type="button"
                onClick={() => setIsCartDrawerOpen(true)}
                className="relative w-10 h-10 rounded-2xl bg-[#4A2E19] hover:bg-[#3D2514] active:scale-95 text-white flex items-center justify-center shadow-xs transition cursor-pointer"
                aria-label={`Cart with ${totalCartCount} items`}
              >
                <ShoppingCart className="w-5 h-5 text-[#FDFBF7]" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 border-2 border-[#FDFBF7] shadow-xs animate-in zoom-in-75">
                    {totalCartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search Bar & Category Controls */}
          <div className="mt-3.5 space-y-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search coffee, tea, meals, and snacks..."
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#EADBCE] rounded-2xl text-xs sm:text-sm text-[#2B231F] placeholder-[#9C8E82] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#4A2E19] focus:border-transparent transition"
              />
              <Search className="w-4 h-4 text-[#9C8E82] absolute left-3.5 top-3" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-[#9C8E82] hover:text-[#4A2E19] transition"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Primary Category Filter Tabs: Coffee, Non-Coffee, Food, Add-ons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
              {(['All', 'Coffee', 'Non-Coffee', 'Food', 'Add-ons'] as CategoryTab[]).map((tab) => {
                const isActive = selectedTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setSelectedTab(tab);
                      setSelectedSubCategory(null);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-[#4A2E19] text-[#FDFBF7] shadow-xs'
                        : 'bg-white text-[#7A6253] border border-[#EADBCE]/80 hover:bg-[#F4ECE1] hover:text-[#4A2E19]'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Secondary Sub-Category Chips (Optional granular filtering) */}
            {availableSubCategories.length > 0 && selectedTab === 'All' && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                <span className="text-[#8C7A6B] font-semibold uppercase tracking-wider text-[9px] shrink-0 mr-1">
                  Filters:
                </span>
                {availableSubCategories.map((subCat) => {
                  const isChipActive = selectedSubCategory === subCat;
                  return (
                    <button
                      key={subCat}
                      type="button"
                      onClick={() =>
                        setSelectedSubCategory((prev) => (prev === subCat ? null : subCat))
                      }
                      className={`px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap cursor-pointer ${
                        isChipActive
                          ? 'bg-[#83502E] text-white shadow-2xs font-bold'
                          : 'bg-[#F4ECE1] text-[#6B5548] hover:bg-[#EADBCE]'
                      }`}
                    >
                      {subCat}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ====================================================
          MENU ITEMS GRID
          - Standard browsing: Clicking item opens Customization Modal
          - Purely local actions: No forced guest registration
      ==================================================== */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 pb-28">
        {/* Results Info */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-[#7A6253]">
            Showing <span className="font-bold text-[#4A2E19]">{filteredItems.length}</span>{' '}
            {selectedTab !== 'All' ? selectedTab.toLowerCase() : 'menu'} items
          </p>
          {selectedSubCategory && (
            <button
              onClick={() => setSelectedSubCategory(null)}
              className="text-xs text-[#83502E] hover:underline font-bold"
            >
              Clear sub-filter
            </button>
          )}
        </div>

        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#EADBCE] shadow-2xs max-w-md mx-auto my-12">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#F4ECE1] text-[#83502E] flex items-center justify-center mb-3">
              <Coffee className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#4A2E19]">No Items Found</h3>
            <p className="text-xs text-[#7A6253] mt-1 leading-relaxed">
              We couldn't find any menu items matching "{searchQuery}". Try selecting another category tab or clearing your query.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedTab('All');
                setSelectedSubCategory(null);
              }}
              className="mt-4 px-5 py-2 bg-[#4A2E19] text-white text-xs font-bold rounded-xl hover:bg-[#3D2514] transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredItems.map((item) => {
              const availability = checkItemOverallAvailability
                ? checkItemOverallAvailability(item.id)
                : { isAvailable: item.is_available, missingItemName: undefined };
              const isSoldOut = !availability.isAvailable;

              return (
                <div
                  key={item.id}
                  onClick={() => !isSoldOut && handleOpenItemModal(item)}
                  className={`bg-white rounded-3xl p-3.5 sm:p-4 border border-[#EADBCE]/80 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-row sm:flex-col justify-between gap-3 group relative cursor-pointer ${
                    isSoldOut ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {/* Item Image */}
                  <div className="w-28 h-28 sm:w-full sm:h-44 rounded-2xl bg-[#F4ECE1] overflow-hidden relative shrink-0 flex items-center justify-center border border-[#EADBCE]/40">
                    {item.image_path ? (
                      <img
                        src={item.image_path}
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.nextElementSibling) {
                            (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-full h-full flex flex-col items-center justify-center text-[#A69485] ${
                        item.image_path ? 'hidden' : 'flex'
                      }`}
                    >
                      <Coffee className="w-8 h-8 stroke-1 text-[#C4B5A5]" />
                      <span className="text-[10px] font-semibold mt-1">Café Pepita</span>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-2 left-2 z-10">
                      <span className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[9px] font-bold text-[#4A2E19] shadow-2xs border border-[#EADBCE]/60">
                        {item.category}
                      </span>
                    </div>

                    {/* Sold Out Overlay */}
                    {isSoldOut && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex flex-col items-center justify-center p-2 text-center z-20">
                        <span className="px-2.5 py-1 bg-red-600 text-white text-[10px] font-extrabold uppercase rounded-full tracking-wider shadow-xs">
                          Sold Out
                        </span>
                        {availability.missingItemName && (
                          <span className="text-[9px] text-white/90 mt-1 font-medium line-clamp-1">
                            No {availability.missingItemName}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 flex flex-col justify-between self-stretch">
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-[#2B231F] leading-snug group-hover:text-[#4A2E19] transition-colors">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-[11px] text-[#7A6253] line-clamp-2 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Price and Add to Cart Trigger */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F4ECE1]">
                      <div>
                        <span className="text-[10px] text-[#8C7A6B] block font-medium leading-none">
                          {item.available_sizes?.length ? 'Starts at' : 'Price'}
                        </span>
                        <span className="font-mono font-bold text-sm sm:text-base text-[#4A2E19]">
                          ₱{item.price.toFixed(2)}
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={isSoldOut}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isSoldOut) handleOpenItemModal(item);
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer ${
                          isSoldOut
                            ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                            : 'bg-[#4A2E19] hover:bg-[#3D2514] text-[#FDFBF7]'
                        }`}
                        aria-label={`Customize and add ${item.name} to cart`}
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ====================================================
          FLOATING BOTTOM CART DRAWER TRIGGER
          - Appears when cart has items
          - Displays aggregated quantities & subtotal
          - Does NOT bypass to checkout directly; opens review drawer
      ==================================================== */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-xl mx-auto z-40 animate-in slide-in-from-bottom duration-200">
          <div className="bg-[#4A2E19] text-[#FDFBF7] p-3.5 sm:p-4 rounded-2xl shadow-xl flex items-center justify-between border border-[#3D2514]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center font-black text-xs text-white">
                {totalCartCount}
              </div>
              <div>
                <p className="text-xs font-bold text-[#FDFBF7]">Cart Aggregated</p>
                <p className="text-[11px] text-[#DDD3C7] font-mono">
                  Total: <strong className="text-white">₱{totalCartAmount.toFixed(2)}</strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCartDrawerOpen(true)}
              className="px-5 py-2.5 bg-[#FDFBF7] hover:bg-[#F4ECE1] text-[#4A2E19] font-bold text-xs sm:text-sm rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Cart</span>
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      {/* ====================================================
          CONFIRMATION TOAST (When item is appended to cart)
      ==================================================== */}
      {addedToast && (
        <div className="fixed top-20 right-4 z-50 bg-[#4A2E19] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-2 border border-[#3D2514]">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span>Added {addedToast.itemName} to your cart</span>
        </div>
      )}

      {/* ====================================================
          MODAL 1: ITEM DETAIL & CUSTOMIZATION MODAL
          - Opened upon tapping an item card
          - Customize size, milk type, flavors, add-ons, notes, quantity
          - Appends to cart without any forced guest popups
      ==================================================== */}
      {activeItemForModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
        >
          <div className="bg-[#FDFBF7] w-full max-w-lg rounded-t-[28px] sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl border border-[#EADBCE] overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Modal Header Banner */}
            <div className="relative h-44 sm:h-48 bg-[#4A2E19] shrink-0 overflow-hidden flex flex-col justify-between p-4">
              {activeItemForModal.image_path ? (
                <img
                  src={activeItemForModal.image_path}
                  alt={activeItemForModal.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/15" />

              {/* Close Button */}
              <div className="relative z-10 flex justify-end">
                <button
                  type="button"
                  onClick={handleCloseItemModal}
                  className="w-8 h-8 rounded-full bg-black/45 hover:bg-black/75 text-white flex items-center justify-center transition cursor-pointer"
                  aria-label="Close customization"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Title & Category on Banner */}
              <div className="relative z-10 text-white">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300">
                  {activeItemForModal.category}
                </span>
                <h3 className="text-lg sm:text-xl font-bold leading-tight drop-shadow-xs">
                  {activeItemForModal.name}
                </h3>
                {activeItemForModal.description && (
                  <p className="text-[11px] text-white/85 line-clamp-1 mt-0.5">
                    {activeItemForModal.description}
                  </p>
                )}
              </div>
            </div>

            {/* Scrollable Customization Body */}
            <div className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1">
              {/* SIZE SELECTION */}
              {activeItemForModal.available_sizes && activeItemForModal.available_sizes.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#4A2E19] mb-2">
                    Select Size
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {activeItemForModal.available_sizes.map((s) => {
                      const isSelected = modalSize === s.size;
                      const variantStock = checkVariantAvailability
                        ? checkVariantAvailability(activeItemForModal.id, s.size)
                        : { isAvailable: true };
                      const isAvailable = variantStock.isAvailable;
                      const displayPrice =
                        modalMilk === 'oat' && s.oat_price ? s.oat_price : s.price;

                      return (
                        <button
                          key={s.size}
                          type="button"
                          disabled={!isAvailable}
                          onClick={() => setModalSize(s.size)}
                          className={`py-3 px-3 rounded-2xl border text-center transition flex flex-col items-center justify-center cursor-pointer ${
                            isSelected
                              ? 'bg-[#4A2E19] text-[#FDFBF7] border-[#4A2E19] shadow-xs'
                              : isAvailable
                              ? 'bg-white text-[#2B231F] border-[#EADBCE] hover:border-[#4A2E19]'
                              : 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                          }`}
                        >
                          <span className="text-xs font-bold">{s.size}</span>
                          <span
                            className={`text-[11px] mt-0.5 font-mono ${
                              isSelected ? 'text-amber-200' : 'text-[#7A6253]'
                            }`}
                          >
                            ₱{displayPrice.toFixed(2)}
                          </span>
                          {!isAvailable && (
                            <span className="text-[9px] uppercase font-bold text-red-600 mt-0.5">
                              Out of stock
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* FLAVOR SELECTION (If available) */}
              {activeItemForModal.available_flavors && activeItemForModal.available_flavors.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#4A2E19] mb-2">
                    Select Flavor <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {activeItemForModal.available_flavors.map((flv) => {
                      const isSelected = modalFlavor === flv;
                      return (
                        <button
                          key={flv}
                          type="button"
                          onClick={() => {
                            setModalFlavor(flv);
                            setModalFlavorError(false);
                          }}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer border ${
                            isSelected
                              ? 'bg-[#4A2E19] text-white border-[#4A2E19] shadow-2xs'
                              : 'bg-white text-[#4A2E19] border-[#EADBCE] hover:bg-[#F4ECE1]'
                          }`}
                        >
                          {flv}
                        </button>
                      );
                    })}
                  </div>
                  {modalFlavorError && (
                    <p className="text-[11px] text-red-600 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Please select a flavor to continue.
                    </p>
                  )}
                </div>
              )}

              {/* MILK OPTION (for coffee / espresso blends) */}
              {(activeItemForModal.has_sub_oat ||
                activeItemForModal.category.toLowerCase().includes('blend') ||
                activeItemForModal.category.toLowerCase().includes('coffee') ||
                activeItemForModal.category.toLowerCase().includes('latte')) && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#4A2E19] mb-2">
                    Milk Preference
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setModalMilk('regular')}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition ${
                        modalMilk === 'regular'
                          ? 'bg-[#4A2E19] text-white border-[#4A2E19] shadow-xs'
                          : 'bg-white text-[#2B231F] border-[#EADBCE] hover:bg-[#F4ECE1]'
                      }`}
                    >
                      <p className="text-xs font-bold">Regular Dairy</p>
                      <p
                        className={`text-[10px] ${
                          modalMilk === 'regular' ? 'text-amber-200' : 'text-[#7A6253]'
                        }`}
                      >
                        Standard recipe
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setModalMilk('oat')}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition ${
                        modalMilk === 'oat'
                          ? 'bg-[#4A2E19] text-white border-[#4A2E19] shadow-xs'
                          : 'bg-white text-[#2B231F] border-[#EADBCE] hover:bg-[#F4ECE1]'
                      }`}
                    >
                      <p className="text-xs font-bold">Sub Oat Milk (+₱30)</p>
                      <p
                        className={`text-[10px] ${
                          modalMilk === 'oat' ? 'text-amber-200' : 'text-[#7A6253]'
                        }`}
                      >
                        Creamy plant-based
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* ADD-ONS SELECTION */}
              {contextAddOns.length > 0 && mapItemToTab(activeItemForModal) !== 'Food' && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#4A2E19] mb-2">
                    Add-ons & Extras
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {contextAddOns.map((addon) => {
                      const isSelected = modalAddOnIds.includes(addon.id);
                      return (
                        <button
                          key={addon.id}
                          type="button"
                          onClick={() => {
                            setModalAddOnIds((prev) =>
                              prev.includes(addon.id)
                                ? prev.filter((id) => id !== addon.id)
                                : [...prev, addon.id]
                            );
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs transition inline-flex items-center gap-1.5 cursor-pointer border ${
                            isSelected
                              ? 'bg-[#4A2E19] text-white border-[#4A2E19] shadow-2xs font-semibold'
                              : 'bg-white text-[#2B231F] border-[#EADBCE] hover:bg-[#F4ECE1]'
                          }`}
                        >
                          <span>{addon.name}</span>
                          <span
                            className={`text-[10px] ${
                              isSelected ? 'text-amber-200' : 'text-[#7A6253]'
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

              {/* SPECIAL INSTRUCTIONS */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#4A2E19] mb-2">
                  Special Instructions
                </label>
                <input
                  type="text"
                  value={modalComments}
                  onChange={(e) => setModalComments(e.target.value)}
                  placeholder="e.g. Less ice, no sugar, separate dressing..."
                  className="w-full px-4 py-2.5 bg-white border border-[#EADBCE] rounded-xl text-xs text-[#2B231F] placeholder-[#A6978A] focus:outline-none focus:ring-2 focus:ring-[#4A2E19]"
                />
              </div>

              {/* QUANTITY STEPPER & CONFIRM ADD BUTTON */}
              <div className="pt-2 border-t border-[#EADBCE] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#4A2E19]">
                    Quantity
                  </span>
                  <div className="flex items-center bg-white border border-[#EADBCE] rounded-xl p-1 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setModalQuantity((q) => Math.max(1, q - 1))}
                      className="w-7 h-7 rounded-lg bg-[#F4ECE1] text-[#4A2E19] font-bold flex items-center justify-center hover:bg-[#EADBCE] transition cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold font-mono text-[#2B231F]">
                      {modalQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setModalQuantity((q) => q + 1)}
                      className="w-7 h-7 rounded-lg bg-[#4A2E19] text-white font-bold flex items-center justify-center hover:bg-[#3D2514] transition cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmAddToCart}
                  className="w-full py-3.5 px-6 bg-[#4A2E19] hover:bg-[#3D2514] active:scale-98 text-[#FDFBF7] font-bold text-sm rounded-2xl shadow-md transition flex items-center justify-between cursor-pointer"
                >
                  <span>Add to Cart</span>
                  <span className="font-mono text-amber-200">
                    ₱{(modalCalculatedUnitPrice * modalQuantity).toFixed(2)}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          MODAL 2: CART DRAWER / REVIEW SCREEN
          - View itemized list, update quantities, remove items
          - Clear Order Summary
          - Contains "Proceed to Checkout" button which triggers the guest verification modal
      ==================================================== */}
      {isCartDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex justify-end"
        >
          <div className="bg-[#FDFBF7] w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 border-l border-[#EADBCE]">
            {/* Drawer Header */}
            <div className="px-5 py-4 bg-[#F8F4EE] border-b border-[#EADBCE] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#4A2E19]" />
                <h2 className="text-base font-bold text-[#4A2E19]">Your Cart</h2>
                <span className="text-xs bg-[#4A2E19] text-white px-2 py-0.5 rounded-full font-bold">
                  {totalCartCount}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCartDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-stone-100 text-stone-600 flex items-center justify-center border border-[#EADBCE] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
              {contextCart.length === 0 ? (
                <div className="text-center py-20 text-[#8C7A6B] space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-[#F4ECE1] text-[#83502E] flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-[#4A2E19]">Your cart is empty</h4>
                  <p className="text-xs max-w-xs mx-auto">
                    Select beverages or freshly prepared kitchen items from the catalog.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsCartDrawerOpen(false)}
                    className="mt-2 px-5 py-2.5 bg-[#4A2E19] text-white text-xs font-bold rounded-xl hover:bg-[#3D2514] transition cursor-pointer"
                  >
                    Browse Menu
                  </button>
                </div>
              ) : (
                contextCart.map((item) => {
                  const size = item.size || item.customizations?.size;
                  const flavor = item.flavor || item.customizations?.flavor;
                  const milk = item.customizations?.milk_type;
                  const addOnsList = item.customizations?.add_ons || [];
                  const notes = item.customizations?.comments;

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 bg-white rounded-2xl border border-[#EADBCE] shadow-2xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-[#2B231F] leading-tight truncate">
                            {item.item_name || item.name}
                          </h4>
                          <div className="flex flex-wrap gap-1 mt-1 text-[10px] text-[#7A6253]">
                            {size && (
                              <span className="bg-[#F4ECE1] text-[#4A2E19] px-2 py-0.5 rounded-md font-semibold">
                                {size}
                              </span>
                            )}
                            {flavor && (
                              <span className="bg-[#F4ECE1] text-[#4A2E19] px-2 py-0.5 rounded-md font-semibold">
                                {flavor}
                              </span>
                            )}
                            {milk === 'oat' && (
                              <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-semibold">
                                Oat Milk
                              </span>
                            )}
                            {addOnsList.map((a) => (
                              <span
                                key={a.id}
                                className="bg-[#FDFBF7] border border-[#EADBCE] text-[#4A2E19] px-1.5 py-0.5 rounded-md"
                              >
                                +{a.name}
                              </span>
                            ))}
                          </div>
                          {notes && (
                            <p className="text-[10px] italic text-[#8C7A6B] mt-1 bg-[#FDFBF7] px-2 py-0.5 rounded-md inline-block">
                              "{notes}"
                            </p>
                          )}
                        </div>

                        {/* Remove item button */}
                        <button
                          type="button"
                          onClick={() => cafeContext?.removeFromCart && cafeContext.removeFromCart(item.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Line Price & Quantity Steppers */}
                      <div className="flex items-center justify-between pt-1 border-t border-[#F8F4EE]">
                        <span className="font-mono font-bold text-xs text-[#4A2E19]">
                          ₱{(Number(item.price) * item.quantity).toFixed(2)}
                        </span>

                        <div className="flex items-center bg-[#F4ECE1] rounded-xl p-0.5">
                          <button
                            type="button"
                            onClick={() =>
                              cafeContext?.updateCartQuantity &&
                              cafeContext.updateCartQuantity(item.id, -1)
                            }
                            className="w-6 h-6 rounded-lg bg-white text-[#4A2E19] font-bold text-xs flex items-center justify-center hover:bg-[#EADBCE] transition cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-mono font-bold text-[#2B231F]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              cafeContext?.updateCartQuantity &&
                              cafeContext.updateCartQuantity(item.id, 1)
                            }
                            className="w-6 h-6 rounded-lg bg-[#4A2E19] text-white font-bold text-xs flex items-center justify-center hover:bg-[#3D2514] transition cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Drawer Footer & Checkout Launch */}
            {contextCart.length > 0 && (
              <div className="p-4 sm:p-5 bg-[#F8F4EE] border-t border-[#EADBCE] space-y-3 shrink-0">
                {/* Order Summary Box */}
                <div className="space-y-1.5 text-xs text-[#2B231F]">
                  <div className="flex justify-between">
                    <span className="text-[#7A6253]">Subtotal ({totalCartCount} items)</span>
                    <span className="font-mono font-bold">₱{totalCartAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-[#4A2E19] pt-1.5 border-t border-[#EADBCE]">
                    <span>Total:</span>
                    <span className="font-mono text-base">₱{totalCartAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Explicit Proceed to Checkout Button */}
                <button
                  type="button"
                  onClick={handleInitiateCheckout}
                  className="w-full py-3.5 px-6 bg-[#4A2E19] hover:bg-[#3D2514] active:scale-98 text-[#FDFBF7] font-bold text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================
          MODAL 3: ANONYMOUS NAME-ONLY GUEST CHECKOUT MODAL
          - Triggered ONLY when clicking "Proceed to Checkout" from Cart
          - Zero passwords, zero email addresses, zero accounts
          - Generates Order Number (e.g., #1042) for pickup clarity
          - 8-hour localStorage window with UUID v4 session isolation
      ==================================================== */}
      {isCheckoutModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="guest-checkout-title"
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        >
          <div className="bg-[#FDFBF7] text-[#2B231F] w-full max-w-md rounded-3xl shadow-2xl border border-[#EADBCE] overflow-hidden my-auto animate-in zoom-in-95 duration-150 flex flex-col">
            {/* Header */}
            <div className="px-5 py-4 bg-[#F8F4EE] border-b border-[#EADBCE] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#4A2E19] text-white flex items-center justify-center shadow-xs">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="guest-checkout-title" className="font-bold text-base text-[#4A2E19]">
                    Name for Your Order
                  </h3>
                  <p className="text-[11px] text-[#7A6253]">
                    No account or email needed · Fast guest counter pickup
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-[#4A2E19] text-amber-200 text-xs font-mono font-bold shadow-2xs">
                  Order #{nextOrderNumber}
                </span>
                <button
                  type="button"
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white hover:bg-stone-100 text-stone-600 flex items-center justify-center border border-[#EADBCE] transition cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmOrder} className="p-5 space-y-4">
              {/* 8-Hour Session Status Indicator */}
              {isSessionValid && checkoutName ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Welcome back, <strong>{checkoutName}</strong>! (8h session active)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCheckoutName('')}
                    className="text-[10px] text-emerald-700 underline font-semibold hover:text-emerald-900"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-[#F4ECE1] border border-[#EADBCE] rounded-2xl flex items-start gap-2.5 text-xs text-[#7A6253]">
                  <Info className="w-4 h-4 text-[#4A2E19] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#4A2E19] block font-bold">Friction-Free Guest Checkout</strong>
                    <p className="text-[11px] mt-0.5">
                      Simply enter your name below. We'll call your name at the counter when your coffee and food are ready.
                    </p>
                  </div>
                </div>
              )}

              {/* Customer Name Field (Strictly Name-Only, No Account / Email / Password) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4A2E19] mb-1.5">
                  Customer Name (For Order & Pickup) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={checkoutName}
                  onChange={(e) => setCheckoutName(e.target.value)}
                  placeholder="e.g. Mark or Cheska Kimberly"
                  required
                  autoFocus
                  className="w-full px-4 py-3 bg-white border border-[#EADBCE] rounded-xl text-sm font-semibold text-[#2B231F] placeholder-[#A6978A] focus:outline-none focus:ring-2 focus:ring-[#4A2E19] transition"
                />
                <div className="flex items-center justify-between mt-1 text-[11px] text-[#8C7A6B]">
                  <span>Saved locally for 8 hours • No password required</span>
                  <span className="font-mono text-[10px]">Session: {guestSessionId ? guestSessionId.slice(0, 8) : 'guest'}</span>
                </div>
              </div>

              {/* Same-Name Disambiguation Guarantee */}
              <div className="p-3 bg-[#FAF5EE] rounded-2xl border border-[#EADBCE] text-[11px] text-[#7A6253] space-y-1">
                <div className="flex items-center justify-between text-[#4A2E19] font-bold">
                  <span>Pickup Identifier:</span>
                  <span className="font-mono text-xs bg-white px-2 py-0.5 rounded-md border border-[#EADBCE]">
                    Order #{nextOrderNumber} — {checkoutName.trim() || 'Guest'}
                  </span>
                </div>
                <p className="text-[10px] text-[#8C7A6B]">
                  If multiple guests share your name, your order is disambiguated by your assigned Order Number (#{nextOrderNumber}) and unique session ID.
                </p>
              </div>

              {/* Dining Option */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4A2E19] mb-1.5">
                  Dining Preference
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['dine-in', 'take-out', 'delivery'] as OrderType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setCheckoutOrderType(type)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold capitalize transition border cursor-pointer ${
                        checkoutOrderType === type
                          ? 'bg-[#4A2E19] text-white border-[#4A2E19] shadow-2xs'
                          : 'bg-white text-[#7A6253] border-[#EADBCE] hover:bg-[#F4ECE1]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4A2E19] mb-1.5">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutPaymentMethod('cash')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition border text-left cursor-pointer ${
                      checkoutPaymentMethod === 'cash'
                        ? 'bg-[#4A2E19] text-white border-[#4A2E19] shadow-2xs'
                        : 'bg-white text-[#7A6253] border-[#EADBCE] hover:bg-[#F4ECE1]'
                    }`}
                  >
                    <span>Cash on Hand</span>
                    <span className="block text-[10px] opacity-80">Pay at counter / COD</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCheckoutPaymentMethod('online')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition border text-left cursor-pointer ${
                      checkoutPaymentMethod === 'online'
                        ? 'bg-[#4A2E19] text-white border-[#4A2E19] shadow-2xs'
                        : 'bg-white text-[#7A6253] border-[#EADBCE] hover:bg-[#F4ECE1]'
                    }`}
                  >
                    <span>GCash / Online</span>
                    <span className="block text-[10px] opacity-80">Instant QR transfer</span>
                  </button>
                </div>
              </div>

              {/* Order Total & Item Summary */}
              <div className="p-3 bg-white rounded-xl border border-[#EADBCE] flex justify-between items-center text-xs">
                <span className="font-bold text-[#4A2E19]">
                  Total ({totalCartCount} {totalCartCount === 1 ? 'item' : 'items'}):
                </span>
                <span className="font-mono font-bold text-sm text-[#4A2E19]">
                  ₱{totalCartAmount.toFixed(2)}
                </span>
              </div>

              {/* Confirm Order Action Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={checkoutName.trim().length < 2 || isSubmittingOrder}
                  className="w-full py-3.5 px-6 bg-[#4A2E19] hover:bg-[#3D2514] active:scale-98 text-white font-bold text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSubmittingOrder ? (
                    <span>Placing Order #{nextOrderNumber}...</span>
                  ) : (
                    <>
                      <span>Confirm Order (#{nextOrderNumber})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================
          ORDER SUCCESS MODAL
          - Displays Auto-Generated Order Number (e.g. #1042)
          - Prominent counter pickup callout with Customer Name
          - Live order tracking launcher
      ==================================================== */}
      {orderSuccessData && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center border border-[#EADBCE] animate-in zoom-in-95 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-[#4A2E19] text-amber-200 text-xs font-mono font-bold inline-block mb-2 shadow-2xs">
                Order #{orderSuccessData.orderNumber}
              </span>
              <h3 className="font-bold text-lg text-[#4A2E19]">Order Received!</h3>
              <p className="text-xs text-[#7A6253] mt-1">
                Thank you, <strong className="text-[#4A2E19]">{orderSuccessData.name}</strong>. Your order is sent straight to our kitchen & barista team.
              </p>
            </div>

            <div className="p-3.5 bg-[#FDFBF7] rounded-2xl border border-[#EADBCE] text-left space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#8C7A6B]">Pickup Name:</span>
                <span className="font-bold text-[#4A2E19]">{orderSuccessData.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#8C7A6B]">Order Number:</span>
                <span className="font-mono font-bold text-[#4A2E19]">#{orderSuccessData.orderNumber}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1 border-t border-[#EADBCE]/60">
                <span className="text-[#8C7A6B]">Tracking Token:</span>
                <span className="font-mono font-bold text-[#4A2E19]">{orderSuccessData.token}</span>
              </div>
            </div>

            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 text-center">
              Our barista will call out: <br />
              <strong className="text-[#4A2E19]">"Order #{orderSuccessData.orderNumber} for {orderSuccessData.name}!"</strong>
            </div>

            <button
              type="button"
              onClick={() => {
                setOrderSuccessData(null);
                if (onOpenOrderTracker) {
                  onOpenOrderTracker(orderSuccessData.token);
                } else if (setCustomerScreen) {
                  setCustomerScreen(8);
                  if (navigate) navigate('/order-status');
                }
              }}
              className="w-full py-3 bg-[#4A2E19] hover:bg-[#3D2514] active:scale-98 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              Track Live Order Status
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
