import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  MenuItem,
  AddOn,
  Table,
  Order,
  OrderItem,
  InventoryLog,
  InventoryUnit,
  User,
  PaymentMethod,
  OrderStatus,
  OrderType,
  Role,
  Permission,
  SpatieRoleDefinition,
  EchoBroadcastEvent,
} from '../types/cafe';
import { RAW_MENU_ITEMS, INITIAL_ADDONS, INITIAL_BOTTLENECK_UNITS, INITIAL_CATEGORIES } from '../data/defaultMenu';
import { playOrderChime } from '../utils/audioChime';

export const INITIAL_SPATIE_ROLES: SpatieRoleDefinition[] = [
  {
    id: 1,
    name: 'admin',
    guard_name: 'web',
    display_name: 'Administrator',
    description: 'Complete unrestricted access across ordering, KDS, inventory, analytics, staff, and Spatie RBAC controls.',
    permissions: [
      'view-menu',
      'place-order',
      'view-order-tracker',
      'view-kds',
      'confirm-cash-payment',
      'update-order-status',
      'view-financial-analytics',
      'manage-menu-items',
      'manage-inventory-stock',
      'manage-staff-accounts',
      'manage-roles-permissions',
    ],
  },
  {
    id: 2,
    name: 'staff',
    guard_name: 'web',
    display_name: 'Barista / Kitchen Staff',
    description: 'Operational access to the live kitchen display, cash order approval, and preparation status updates.',
    permissions: [
      'view-menu',
      'place-order',
      'view-order-tracker',
      'view-kds',
      'confirm-cash-payment',
      'update-order-status',
    ],
  },
  {
    id: 3,
    name: 'customer',
    guard_name: 'web',
    display_name: 'Self-Ordering Customer',
    description: 'Public QR ordering persona permitted to browse the menu, customize items, and track personal orders.',
    permissions: [
      'view-menu',
      'place-order',
      'view-order-tracker',
    ],
  },
];

interface CafeContextType {
  // Navigation & View Mode
  viewMode: 'customer' | 'staff' | 'admin' | 'codebase' | 'qr_tables';
  setViewMode: (mode: 'customer' | 'staff' | 'admin' | 'codebase' | 'qr_tables') => void;
  navigateWithRoleCheck: (targetMode: 'customer' | 'staff' | 'admin' | 'codebase' | 'qr_tables') => void;
  customerScreen: number; // 1 to 8
  setCustomerScreen: (screen: number) => void;

  // Spatie RBAC Roles & Permissions
  currentUserRole: Role;
  setCurrentUserRole: (role: Role) => void;
  rolesList: SpatieRoleDefinition[];
  toggleRolePermission: (roleName: Role, permission: Permission) => void;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (roles: Role | Role[]) => boolean;
  unauthorizedModal: {
    isOpen: boolean;
    requiredRole?: string;
    requiredPermission?: string;
    attemptedView?: string;
  } | null;
  closeUnauthorizedModal: () => void;

  // Real-Time Laravel Echo & Pusher Broadcasting
  echoConnected: boolean;
  echoEvents: EchoBroadcastEvent[];
  latestBroadcast: EchoBroadcastEvent | null;
  clearLatestBroadcast: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  triggerTestEchoBroadcast: () => void;

  // Data Collections
  menuItems: MenuItem[];
  categories: string[];
  addOns: AddOn[];
  bottlenecks: InventoryUnit[];
  tables: Table[];
  orders: Order[];
  staffUsers: User[];
  inventoryLogs: InventoryLog[];

  // Customer Session State
  customerName: string;
  orderType: OrderType;
  selectedTableId: number | null;
  cart: OrderItem[];
  activeTrackingToken: string | null;
  setActiveTrackingToken: (token: string | null) => void;

  // Customer Actions
  setCustomerDetails: (name: string, type: OrderType, tableId: number | null) => void;
  addToCart: (
    item: MenuItem,
    size: string,
    flavor: string | null,
    milk: 'regular' | 'oat',
    selectedAddOns: AddOn[],
    comments: string,
    quantity: number
  ) => void;
  updateCartQuantity: (cartId: string, delta: number) => void;
  removeFromCart: (cartId: string) => void;
  clearCart: () => void;
  placeOrder: (paymentMethod: PaymentMethod, onlineRef?: string) => string;
  requestOrderCancellation: (token: string, reason: string) => void;
  viewOrderTracker: (token: string) => void;

  // Staff POS / Kitchen Actions
  approveCashPayment: (orderId: number) => void;
  updateOrderStatus: (orderId: number, status: OrderStatus) => void;
  handleCancellation: (orderId: number, approve: boolean) => void;

  // Admin Actions
  addStaffUser: (name: string, email: string, role?: Role) => void;
  updateStaffUser: (id: number, updates: Partial<User>) => void;
  deleteStaffUser: (id: number) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: number, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: number) => void;
  toggleMenuItemAvailability: (id: number) => void;
  restockUnit: (unitId: string, qty: number, notes: string) => void;
  restockMenuItem: (itemId: number, qty: number, notes: string) => void;

  // Global Utils
  resetToSeederData: () => void;
}

const CafeContext = createContext<CafeContextType | undefined>(undefined);

export const CafeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [viewMode, setViewMode] = useState<'customer' | 'staff' | 'admin' | 'codebase' | 'qr_tables'>('customer');
  const [customerScreen, setCustomerScreen] = useState<number>(1);

  // Spatie RBAC & Roles State
  const [currentUserRole, setCurrentUserRole] = useState<Role>('admin');
  const [rolesList, setRolesList] = useState<SpatieRoleDefinition[]>(() => {
    const saved = localStorage.getItem('cp_spatie_roles');
    return saved ? JSON.parse(saved) : INITIAL_SPATIE_ROLES;
  });

  const [unauthorizedModal, setUnauthorizedModal] = useState<{
    isOpen: boolean;
    requiredRole?: string;
    requiredPermission?: string;
    attemptedView?: string;
  } | null>(null);

  // Real-Time Echo / Pusher State
  const [echoConnected] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [latestBroadcast, setLatestBroadcast] = useState<EchoBroadcastEvent | null>(null);
  const [echoEvents, setEchoEvents] = useState<EchoBroadcastEvent[]>([
    {
      id: 'init-evt-1',
      event: 'App\\Events\\OrderPlaced',
      channel: 'private-staff.orders',
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      payload: {
        order_id: 1001,
        tracking_token: 'CP-849201',
        customer_name: 'Cheska Kimberly',
        order_type: 'dine-in',
        table_id: 2,
        total_amount: 320,
        items_count: 2,
        payment_method: 'cash',
        payment_status: 'unpaid',
        items: [
          { name: 'Spanish Latte', quantity: 1, size: '16oz' },
          { name: 'Pepita Prime Tapsilog', quantity: 1, size: 'Regular' },
        ],
      },
    },
  ]);

  useEffect(() => {
    localStorage.setItem('cp_spatie_roles', JSON.stringify(rolesList));
  }, [rolesList]);

  const hasRole = (roles: Role | Role[]): boolean => {
    if (Array.isArray(roles)) {
      return roles.includes(currentUserRole);
    }
    return currentUserRole === roles;
  };

  const hasPermission = (permission: Permission): boolean => {
    const roleDef = rolesList.find((r) => r.name === currentUserRole);
    if (!roleDef) return false;
    return roleDef.permissions.includes(permission);
  };

  const toggleRolePermission = (roleName: Role, permission: Permission) => {
    setRolesList((prev) =>
      prev.map((r) => {
        if (r.name === roleName) {
          const has = r.permissions.includes(permission);
          return {
            ...r,
            permissions: has
              ? r.permissions.filter((p) => p !== permission)
              : [...r.permissions, permission],
          };
        }
        return r;
      })
    );
  };

  const closeUnauthorizedModal = () => {
    setUnauthorizedModal(null);
  };

  const navigateWithRoleCheck = (targetMode: 'customer' | 'staff' | 'admin' | 'codebase' | 'qr_tables') => {
    if (targetMode === 'customer' || targetMode === 'codebase' || targetMode === 'qr_tables') {
      setViewMode(targetMode);
      return;
    }

    if (targetMode === 'staff') {
      // Requires role staff or admin OR view-kds permission
      if (hasRole(['staff', 'admin']) || hasPermission('view-kds')) {
        setViewMode('staff');
      } else {
        setUnauthorizedModal({
          isOpen: true,
          requiredRole: "'staff' or 'admin'",
          requiredPermission: 'view-kds',
          attemptedView: 'Barista Kitchen Display (KDS)',
        });
      }
      return;
    }

    if (targetMode === 'admin') {
      // Requires role admin OR view-financial-analytics permission
      if (hasRole('admin') || hasPermission('view-financial-analytics')) {
        setViewMode('admin');
      } else {
        setUnauthorizedModal({
          isOpen: true,
          requiredRole: "'admin'",
          requiredPermission: 'manage-roles-permissions / view-financial-analytics',
          attemptedView: 'Administrator Control Panel',
        });
      }
      return;
    }
  };

  // Entities
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('cp_menu_items_v3');
    if (saved) {
      try {
        const parsed: MenuItem[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map((m) => m.id));
        const missing = RAW_MENU_ITEMS.filter((m) => !existingIds.has(m.id));
        return [...parsed, ...missing];
      } catch {
        return RAW_MENU_ITEMS;
      }
    }
    localStorage.setItem('cp_menu_items_v3', JSON.stringify(RAW_MENU_ITEMS));
    return RAW_MENU_ITEMS;
  });

  const [categories] = useState<string[]>(INITIAL_CATEGORIES);

  const [addOns, setAddOns] = useState<AddOn[]>(() => {
    const saved = localStorage.getItem('cp_addons_v3');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_ADDONS;
      }
    }
    localStorage.setItem('cp_addons_v3', JSON.stringify(INITIAL_ADDONS));
    return INITIAL_ADDONS;
  });

  const [bottlenecks, setBottlenecks] = useState<InventoryUnit[]>(() => {
    const saved = localStorage.getItem('cp_bottlenecks');
    return saved ? JSON.parse(saved) : INITIAL_BOTTLENECK_UNITS;
  });

  const [tables, setTables] = useState<Table[]>([
    { id: 1, table_number: 1, status: 'available' },
    { id: 2, table_number: 2, status: 'occupied' },
    { id: 3, table_number: 3, status: 'available' },
    { id: 4, table_number: 4, status: 'available' },
    { id: 5, table_number: 5, status: 'available' },
    { id: 6, table_number: 6, status: 'available' },
    { id: 7, table_number: 7, status: 'available' },
    { id: 8, table_number: 8, status: 'available' },
    { id: 9, table_number: 9, status: 'available' },
    { id: 10, table_number: 10, status: 'available' },
  ]);

  const [staffUsers, setStaffUsers] = useState<User[]>([
    { id: 1, name: 'Admin Manager', email: 'admin@cafepita.com', role: 'admin', created_at: '2025-01-10' },
    { id: 2, name: 'Cheska Kimberly (Barista)', email: 'staff@cafepita.com', role: 'staff', created_at: '2025-02-01' },
    { id: 3, name: 'Marco Santos (Kitchen)', email: 'marco@cafepita.com', role: 'staff', created_at: '2025-02-15' },
  ]);

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('cp_orders');
    if (saved) return JSON.parse(saved);
    // Initial sample orders for immediate demonstration
    return [
      {
        id: 1001,
        tracking_token: 'CP-849201',
        table_id: 2,
        customer_name: 'Cheska Kimberly',
        order_type: 'dine-in',
        total_amount: 320,
        payment_method: 'cash',
        payment_status: 'unpaid',
        order_status: 'pending',
        created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        updated_at: new Date().toISOString(),
        items: [
          {
            id: 'item-1',
            menu_item_id: 101,
            item_name: 'Pepita Signature Spanish Latte',
            quantity: 1,
            price: 135,
            customizations: {
              size: '16oz',
              milk_type: 'regular',
              add_ons: [{ id: 5, name: 'Coffee Jelly', price: 25 }],
              comments: 'Less ice please',
            },
          },
          {
            id: 'item-2',
            menu_item_id: 801,
            item_name: 'Pepita Prime Tapsilog',
            quantity: 1,
            price: 185,
            customizations: {
              size: 'Regular',
              add_ons: [],
              comments: 'Egg sunny side up',
            },
          },
        ],
      },
      {
        id: 1002,
        tracking_token: 'CP-712493',
        table_id: null,
        customer_name: 'David Tan',
        order_type: 'take-out',
        total_amount: 275,
        payment_method: 'online',
        payment_status: 'paid',
        order_status: 'preparing',
        created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        updated_at: new Date().toISOString(),
        items: [
          {
            id: 'item-3',
            menu_item_id: 102,
            item_name: 'Dirty Matcha Espresso',
            quantity: 1,
            price: 145,
            customizations: {
              size: '16oz',
              milk_type: 'oat',
              add_ons: [{ id: 2, name: 'Oat Milk Sub', price: 40 }],
            },
          },
          {
            id: 'item-4',
            menu_item_id: 602,
            item_name: 'Belgian Signature Chocolate',
            quantity: 1,
            price: 120,
            customizations: {
              size: '16oz',
              milk_type: 'regular',
              add_ons: [],
            },
          },
        ],
      },
    ];
  });

  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>(() => {
    const saved = localStorage.getItem('cp_inv_logs');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 1,
        user_id: 1,
        user_name: 'System / Admin',
        menu_item_id: 102,
        add_on_id: null,
        item_name: 'Dirty Matcha Espresso',
        change_type: 'sale',
        quantity_changed: -1,
        notes: 'Order #CP-712493 online payment deduction',
        created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      },
      {
        id: 2,
        user_id: 1,
        user_name: 'Admin Manager',
        menu_item_id: null,
        add_on_id: 1,
        item_name: 'Espresso Shot (Beans)',
        change_type: 'restock',
        quantity_changed: 50,
        notes: 'Morning shipment arrival',
        created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      },
    ];
  });

  // Customer current session
  const [customerName, setCustomerName] = useState<string>('Cheska Kimberly');
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  const [selectedTableId, setSelectedTableId] = useState<number | null>(3);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [activeTrackingToken, setActiveTrackingToken] = useState<string | null>('CP-849201');

  // Persistence side-effects
  useEffect(() => {
    localStorage.setItem('cp_menu_items_v3', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('cp_addons_v3', JSON.stringify(addOns));
  }, [addOns]);

  useEffect(() => {
    localStorage.setItem('cp_bottlenecks', JSON.stringify(bottlenecks));
  }, [bottlenecks]);

  useEffect(() => {
    localStorage.setItem('cp_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('cp_inv_logs', JSON.stringify(inventoryLogs));
  }, [inventoryLogs]);

  // Customer Methods
  const setCustomerDetails = (name: string, type: OrderType, tableId: number | null) => {
    setCustomerName(name);
    setOrderType(type);
    setSelectedTableId(tableId);
  };

  const addToCart = (
    item: MenuItem,
    size: string,
    flavor: string | null,
    milk: 'regular' | 'oat',
    selectedAddOns: AddOn[],
    comments: string,
    quantity: number
  ) => {
    let unitPrice = item.price;

    if (item.available_sizes && item.available_sizes.length > 0) {
      const match = item.available_sizes.find((s) => s.size === size);
      if (match) {
        if (milk === 'oat' && match.oat_price) {
          unitPrice = match.oat_price;
        } else {
          unitPrice = match.price;
        }
      }
    } else if (milk === 'oat' && item.sub_oat_price) {
      unitPrice = item.sub_oat_price;
    }

    const addOnsCost = selectedAddOns.reduce((acc, curr) => acc + curr.price, 0);
    const itemTotalPrice = unitPrice + addOnsCost;

    const newItem: OrderItem = {
      id: 'cart-' + Math.random().toString(36).substring(2, 9),
      menu_item_id: item.id,
      item_name: flavor ? `${item.base_item || item.name} (${flavor})` : item.name,
      quantity,
      price: itemTotalPrice,
      customizations: {
        size,
        flavor,
        milk_type: milk,
        add_ons: selectedAddOns.map((a) => ({ id: a.id, name: a.name, price: a.price })),
        comments,
      },
    };

    setCart((prev) => [...prev, newItem]);
  };

  const updateCartQuantity = (cartId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === cartId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  const removeFromCart = (cartId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartId));
  };

  const clearCart = () => {
    setCart([]);
  };

  /**
   * Safe Atomic Inventory Deduction (simulating lockForUpdate() in Laravel)
   */
  const deductInventoryForOrder = (orderItems: OrderItem[], orderToken: string, staffUserId: number | null) => {
    const newLogs: InventoryLog[] = [];

    // Deduct MenuItem stocks
    setMenuItems((prevMenu) =>
      prevMenu.map((m) => {
        const matchingOrderItems = orderItems.filter((oi) => oi.menu_item_id === m.id);
        if (matchingOrderItems.length > 0 && m.track_inventory) {
          const totalQty = matchingOrderItems.reduce((acc, cur) => acc + cur.quantity, 0);
          newLogs.push({
            id: Date.now() + Math.floor(Math.random() * 1000),
            user_id: staffUserId,
            user_name: staffUserId ? 'Staff Barista' : 'Automated (Payment Confirmed)',
            menu_item_id: m.id,
            add_on_id: null,
            item_name: m.name,
            change_type: 'sale',
            quantity_changed: -totalQty,
            notes: `Order #${orderToken} paid deduction`,
            created_at: new Date().toISOString(),
          });
          return { ...m, stock_quantity: Math.max(0, m.stock_quantity - totalQty) };
        }
        return m;
      })
    );

    // Deduct Add-on stocks
    setAddOns((prevAddOns) =>
      prevAddOns.map((addon) => {
        let deductCount = 0;
        orderItems.forEach((oi) => {
          oi.customizations.add_ons.forEach((a) => {
            if (a.id === addon.id) {
              deductCount += oi.quantity;
            }
          });
        });

        if (deductCount > 0 && addon.track_inventory) {
          newLogs.push({
            id: Date.now() + Math.floor(Math.random() * 1000) + 1,
            user_id: staffUserId,
            user_name: staffUserId ? 'Staff Barista' : 'Automated (Payment Confirmed)',
            menu_item_id: null,
            add_on_id: addon.id,
            item_name: addon.name,
            change_type: 'sale',
            quantity_changed: -deductCount,
            notes: `Order #${orderToken} add-on usage`,
            created_at: new Date().toISOString(),
          });
          return { ...addon, stock_quantity: Math.max(0, addon.stock_quantity - deductCount) };
        }
        return addon;
      })
    );

    // Deduct container bottlenecks (e.g., 16oz or 22oz cups)
    setBottlenecks((prevBottlenecks) =>
      prevBottlenecks.map((unit) => {
        let unitDeduct = 0;
        if (unit.id === 'cup-16oz') {
          orderItems.forEach((oi) => {
            if (oi.customizations.size === '16oz') unitDeduct += oi.quantity;
          });
        } else if (unit.id === 'cup-22oz') {
          orderItems.forEach((oi) => {
            if (oi.customizations.size === '22oz') unitDeduct += oi.quantity;
          });
        } else if (unit.id === 'tapsilog-beef') {
          orderItems.forEach((oi) => {
            if (oi.menu_item_id === 801) unitDeduct += oi.quantity;
          });
        } else if (unit.id === 'party-tray-box') {
          orderItems.forEach((oi) => {
            if ([901, 902, 903].includes(oi.menu_item_id)) unitDeduct += oi.quantity;
          });
        }

        if (unitDeduct > 0) {
          return { ...unit, current_stock: Math.max(0, unit.current_stock - unitDeduct) };
        }
        return unit;
      })
    );

    if (newLogs.length > 0) {
      setInventoryLogs((prev) => [...newLogs, ...prev]);
    }
  };

  const placeOrder = (paymentMethod: PaymentMethod, onlineRef?: string): string => {
    const trackingToken = 'CP-' + Math.floor(100000 + Math.random() * 900000);
    const subtotal = cart.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

    const isOnlinePaid = paymentMethod === 'online';

    const newOrder: Order = {
      id: Date.now(),
      tracking_token: trackingToken,
      table_id: orderType === 'dine-in' ? selectedTableId : null,
      customer_name: customerName,
      order_type: orderType,
      total_amount: subtotal,
      payment_method: paymentMethod,
      payment_status: isOnlinePaid ? 'paid' : 'unpaid',
      order_status: isOnlinePaid ? 'preparing' : 'pending',
      items: [...cart],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Dispatch Real-Time Laravel Echo & Pusher Event
    const broadcastEvent: EchoBroadcastEvent = {
      id: 'echo-' + Math.random().toString(36).substring(2, 9),
      event: 'App\\Events\\OrderPlaced',
      channel: 'private-staff.orders',
      timestamp: new Date().toISOString(),
      payload: {
        order_id: newOrder.id,
        tracking_token: trackingToken,
        customer_name: customerName,
        order_type: orderType,
        table_id: orderType === 'dine-in' ? selectedTableId : null,
        total_amount: subtotal,
        items_count: cart.reduce((acc, curr) => acc + curr.quantity, 0),
        payment_method: paymentMethod,
        payment_status: isOnlinePaid ? 'paid' : 'unpaid',
        items: cart.map((i) => ({
          name: i.item_name,
          quantity: i.quantity,
          size: i.customizations.size || undefined,
        })),
      },
    };

    setEchoEvents((prev) => [broadcastEvent, ...prev.slice(0, 49)]);
    setLatestBroadcast(broadcastEvent);

    if (soundEnabled) {
      playOrderChime();
    }

    // If customer paid immediately online, deduct inventory right away!
    if (isOnlinePaid) {
      deductInventoryForOrder(cart, trackingToken, null);
    }

    // Set Table to occupied if dine-in
    if (orderType === 'dine-in' && selectedTableId) {
      setTables((prev) =>
        prev.map((t) => (t.id === selectedTableId ? { ...t, status: 'occupied' } : t))
      );
    }

    clearCart();
    setActiveTrackingToken(trackingToken);
    setCustomerScreen(8); // Navigate straight to Screen 8: Live Tracker
    return trackingToken;
  };

  const requestOrderCancellation = (token: string, reason: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.tracking_token === token && ord.order_status === 'pending') {
          return {
            ...ord,
            cancellation_requested: true,
            cancellation_reason: reason || 'Customer requested via mobile app',
            updated_at: new Date().toISOString(),
          };
        }
        return ord;
      })
    );
  };

  const viewOrderTracker = (token: string) => {
    setActiveTrackingToken(token);
    setCustomerScreen(8);
  };

  // Staff POS / Kitchen Actions
  const approveCashPayment = (orderId: number) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          if (ord.payment_status !== 'paid') {
            deductInventoryForOrder(ord.items, ord.tracking_token, 2);
          }
          return {
            ...ord,
            payment_status: 'paid',
            order_status: ord.order_status === 'pending' ? 'preparing' : ord.order_status,
            updated_at: new Date().toISOString(),
          };
        }
        return ord;
      })
    );
  };

  const updateOrderStatus = (orderId: number, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          // If status moved to completed and table was occupied, release table if no other active orders
          if (status === 'completed' && ord.table_id) {
            setTables((tbls) =>
              tbls.map((t) => (t.id === ord.table_id ? { ...t, status: 'available' } : t))
            );
          }
          return {
            ...ord,
            order_status: status,
            updated_at: new Date().toISOString(),
          };
        }
        return ord;
      })
    );
  };

  const handleCancellation = (orderId: number, approve: boolean) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          if (approve) {
            // If table was occupied, release it
            if (ord.table_id) {
              setTables((tbls) =>
                tbls.map((t) => (t.id === ord.table_id ? { ...t, status: 'available' } : t))
              );
            }
            return {
              ...ord,
              order_status: 'cancelled',
              cancellation_requested: false,
              updated_at: new Date().toISOString(),
            };
          } else {
            return {
              ...ord,
              cancellation_requested: false,
              updated_at: new Date().toISOString(),
            };
          }
        }
        return ord;
      })
    );
  };

  // Admin Actions
  const addStaffUser = (name: string, email: string, role: Role = 'staff') => {
    const newUser: User = {
      id: Date.now(),
      name,
      email,
      role,
      created_at: new Date().toISOString().split('T')[0],
    };
    setStaffUsers((prev) => [...prev, newUser]);
  };

  const updateStaffUser = (id: number, updates: Partial<User>) => {
    setStaffUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
  };

  const deleteStaffUser = (id: number) => {
    setStaffUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: Date.now(),
    };
    setMenuItems((prev) => [newItem, ...prev]);
  };

  const updateMenuItem = (id: number, updates: Partial<MenuItem>) => {
    setMenuItems((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const deleteMenuItem = (id: number) => {
    setMenuItems((prev) => prev.filter((m) => m.id !== id));
  };

  const toggleMenuItemAvailability = (id: number) => {
    setMenuItems((prev) =>
      prev.map((m) => (m.id === id ? { ...m, is_available: !m.is_available } : m))
    );
  };

  const restockUnit = (unitId: string, qty: number, notes: string) => {
    setBottlenecks((prev) =>
      prev.map((u) => (u.id === unitId ? { ...u, current_stock: u.current_stock + qty } : u))
    );

    const target = bottlenecks.find((b) => b.id === unitId);
    setInventoryLogs((prev) => [
      {
        id: Date.now(),
        user_id: 1,
        user_name: 'Administrator',
        menu_item_id: null,
        add_on_id: null,
        item_name: target?.name || unitId,
        change_type: 'restock',
        quantity_changed: qty,
        notes: notes || 'Admin unit restock',
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const restockMenuItem = (itemId: number, qty: number, notes: string) => {
    setMenuItems((prev) =>
      prev.map((m) => (m.id === itemId ? { ...m, stock_quantity: m.stock_quantity + qty } : m))
    );

    const target = menuItems.find((m) => m.id === itemId);
    setInventoryLogs((prev) => [
      {
        id: Date.now(),
        user_id: 1,
        user_name: 'Administrator',
        menu_item_id: itemId,
        add_on_id: null,
        item_name: target?.name || 'Menu Item',
        change_type: 'restock',
        quantity_changed: qty,
        notes: notes || 'Batch inventory restock',
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const clearLatestBroadcast = () => {
    setLatestBroadcast(null);
  };

  const triggerTestEchoBroadcast = () => {
    const randomToken = 'CP-' + Math.floor(100000 + Math.random() * 900000);
    const mockNames = ['Bianca De Leon', 'Rafael Cruz', 'Alyssa Mendoza', 'Juan Carlos'];
    const mockCustName = mockNames[Math.floor(Math.random() * mockNames.length)];
    const mockTable = Math.floor(Math.random() * 8) + 1;

    const testOrder: Order = {
      id: Date.now(),
      tracking_token: randomToken,
      table_id: mockTable,
      customer_name: mockCustName,
      order_type: 'dine-in',
      total_amount: 179.0,
      payment_method: 'online',
      payment_status: 'paid',
      order_status: 'preparing',
      items: [
        {
          id: 'test-item-' + Date.now(),
          menu_item_id: 201,
          item_name: 'Spanish Latte (Sub-oat)',
          quantity: 1,
          price: 179.0,
          customizations: {
            size: '22oz',
            milk_type: 'oat',
            add_ons: [{ id: 1, name: 'Extra expresso shot', price: 40 }],
            comments: 'Less ice please',
          },
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setOrders((prev) => [testOrder, ...prev]);

    const broadcastEvent: EchoBroadcastEvent = {
      id: 'echo-test-' + Date.now(),
      event: 'App\\Events\\OrderPlaced',
      channel: 'private-staff.orders',
      timestamp: new Date().toISOString(),
      payload: {
        order_id: testOrder.id,
        tracking_token: randomToken,
        customer_name: mockCustName,
        order_type: 'dine-in',
        table_id: mockTable,
        total_amount: 179.0,
        items_count: 1,
        payment_method: 'online',
        payment_status: 'paid',
        items: [{ name: 'Spanish Latte (Sub-oat)', quantity: 1, size: '22oz' }],
      },
    };

    setEchoEvents((prev) => [broadcastEvent, ...prev.slice(0, 49)]);
    setLatestBroadcast(broadcastEvent);

    if (soundEnabled) {
      playOrderChime();
    }
  };

  const resetToSeederData = () => {
    localStorage.removeItem('cp_menu_items');
    localStorage.removeItem('cp_addons');
    localStorage.removeItem('cp_bottlenecks');
    localStorage.removeItem('cp_orders');
    localStorage.removeItem('cp_inv_logs');
    localStorage.removeItem('cp_spatie_roles');
    setMenuItems(RAW_MENU_ITEMS);
    setAddOns(INITIAL_ADDONS);
    setBottlenecks(INITIAL_BOTTLENECK_UNITS);
    setRolesList(INITIAL_SPATIE_ROLES);
    setCart([]);
    setCustomerScreen(1);
  };

  return (
    <CafeContext.Provider
      value={{
        viewMode,
        setViewMode,
        navigateWithRoleCheck,
        customerScreen,
        setCustomerScreen,
        currentUserRole,
        setCurrentUserRole,
        rolesList,
        toggleRolePermission,
        hasPermission,
        hasRole,
        unauthorizedModal,
        closeUnauthorizedModal,
        echoConnected,
        echoEvents,
        latestBroadcast,
        clearLatestBroadcast,
        soundEnabled,
        setSoundEnabled,
        triggerTestEchoBroadcast,
        menuItems,
        categories,
        addOns,
        bottlenecks,
        tables,
        orders,
        staffUsers,
        inventoryLogs,
        customerName,
        orderType,
        selectedTableId,
        cart,
        activeTrackingToken,
        setActiveTrackingToken,
        setCustomerDetails,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        placeOrder,
        requestOrderCancellation,
        viewOrderTracker,
        approveCashPayment,
        updateOrderStatus,
        handleCancellation,
        addStaffUser,
        updateStaffUser,
        deleteStaffUser,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleMenuItemAvailability,
        restockUnit,
        restockMenuItem,
        resetToSeederData,
      }}
    >
      {children}
    </CafeContext.Provider>
  );
};

export const useCafe = () => {
  const context = useContext(CafeContext);
  if (!context) {
    throw new Error('useCafe must be used within a CafeProvider');
  }
  return context;
};
