import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  MenuItem,
  AddOn,
  Table,
  Order,
  OrderItem,
  InventoryLog,
  InventoryUnit,
  InventoryItem,
  VariantRecipeRule,
  User,
  PaymentMethod,
  OrderStatus,
  OrderType,
  DeliveryDetails,
  Role,
  Permission,
  SpatieRoleDefinition,
  EchoBroadcastEvent,
  AuthSession,
} from '../types/cafe';
import {
  RAW_MENU_ITEMS,
  INITIAL_ADDONS,
  INITIAL_BOTTLENECK_UNITS,
  INITIAL_CATEGORIES,
  INITIAL_INVENTORY_ITEMS,
  INITIAL_RECIPE_RULES,
} from '../data/defaultMenu';
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
  viewMode: 'customer' | 'staff' | 'admin' | 'codebase' | 'qr_tables' | 'staff_login' | 'admin_login';
  setViewMode: (mode: 'customer' | 'staff' | 'admin' | 'codebase' | 'qr_tables' | 'staff_login' | 'admin_login') => void;
  navigateWithRoleCheck: (targetMode: 'customer' | 'staff' | 'admin' | 'codebase' | 'qr_tables') => void;
  customerScreen: number; // 1 to 8
  setCustomerScreen: (screen: number) => void;

  // URL Path Routing
  currentPath: string;
  navigate: (path: string) => void;

  // Sanctum Token Authentication & Sessions
  staffSession: AuthSession | null;
  adminSession: AuthSession | null;
  loginStaff: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logoutStaff: () => Promise<void>;
  loginAdmin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => Promise<void>;
  authRedirectNotice: string | null;
  setAuthRedirectNotice: (notice: string | null) => void;

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
  deliveryDetails: DeliveryDetails | null;
  setDeliveryDetails: (details: DeliveryDetails | null) => void;
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
  placeOrder: (paymentMethod: PaymentMethod, gcashReceiptPath?: string) => string;
  requestOrderCancellation: (token: string, reason: string) => void;
  viewOrderTracker: (token: string) => void;

  // Staff POS / Kitchen Actions
  approveCashPayment: (orderId: number) => void;
  verifyAndAcceptOrder: (orderId: number) => void;
  rejectOrder: (orderId: number, reason?: string) => void;
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

  // Dynamic Inventory & BOM Management
  inventoryItems: InventoryItem[];
  recipeRules: VariantRecipeRule[];
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (id: number | string, updates: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: number | string) => void;
  restockInventoryItem: (id: number | string, qty: number, notes?: string) => void;
  saveRecipeRulesForVariant: (
    menuItemId: number,
    variantSize: string,
    items: { inventory_item_id: number | string; quantity_deducted: number }[]
  ) => void;
  deleteRecipeRule: (id: number | string) => void;
  checkVariantAvailability: (menuItemId: number, size?: string) => {
    isAvailable: boolean;
    reason?: string;
    missingItemName?: string;
    requiredItemStock?: number;
  };
  checkItemOverallAvailability: (menuItemId: number) => {
    isAvailable: boolean;
    outOfStockVariants: string[];
    missingItemName?: string;
    reason?: string;
  };

  // Global Utils
  resetToSeederData: () => void;
}

const CafeContext = createContext<CafeContextType | undefined>(undefined);

export const CafeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & URL Routing
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.pathname) {
      return window.location.pathname;
    }
    return '/';
  });

  const [viewMode, setViewMode] = useState<'customer' | 'staff' | 'admin' | 'codebase' | 'qr_tables' | 'staff_login' | 'admin_login'>('customer');
  const [customerScreen, setCustomerScreen] = useState<number>(1);

  // Sanctum Token Authentication & Sessions
  const [staffSession, setStaffSession] = useState<AuthSession | null>(() => {
    try {
      const saved = localStorage.getItem('cp_staff_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [adminSession, setAdminSession] = useState<AuthSession | null>(() => {
    try {
      const saved = localStorage.getItem('cp_admin_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authRedirectNotice, setAuthRedirectNotice] = useState<string | null>(null);

  // Navigate helper with HTML5 History API
  const navigate = (path: string) => {
    if (typeof window !== 'undefined') {
      try {
        window.history.pushState({}, '', path);
      } catch (e) {
        // Fallback in case iframe sandbox restricts pushState
        console.warn('Router pushState warning:', e);
      }
    }
    setCurrentPath(path);
  };

  // Browser back/forward button popstate listener
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Route Synchronization Engine
  useEffect(() => {
    if (currentPath === '/staff/login') {
      setViewMode('staff_login');
    } else if (currentPath.startsWith('/staff')) {
      if (!staffSession) {
        setAuthRedirectNotice('Staff authentication required. Please log in with your staff username & password.');
        setViewMode('staff_login');
      } else {
        setViewMode('staff');
      }
    } else if (currentPath === '/admin/login') {
      setViewMode('admin_login');
    } else if (currentPath.startsWith('/admin')) {
      if (!adminSession) {
        setAuthRedirectNotice('Admin privileges required. Please authenticate with owner credentials.');
        setViewMode('admin_login');
      } else {
        setViewMode('admin');
      }
    } else if (currentPath === '/codebase') {
      setViewMode('codebase');
    } else if (currentPath === '/qr-tables') {
      setViewMode('qr_tables');
    } else {
      // Customer public paths (/ or /welcome, /menu, /cart, /delivery-details, /checkout, /order-status)
      setViewMode('customer');
      if (currentPath === '/menu') {
        setCustomerScreen(3);
      } else if (currentPath === '/cart') {
        setCustomerScreen(6);
      } else if (currentPath === '/delivery-details') {
        setCustomerScreen(9);
      } else if (currentPath === '/checkout') {
        setCustomerScreen(7);
      } else if (currentPath.startsWith('/order-status')) {
        setCustomerScreen(8);
      } else if (currentPath === '/' || currentPath === '/welcome') {
        setCustomerScreen(1);
      }
    }
  }, [currentPath, staffSession, adminSession]);

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

  // Staff Sanctum Authentication Methods
  const loginStaff = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      return { success: false, error: 'Staff username and password are required.' };
    }

    const matchedUser = staffUsers.find(
      (u) =>
        (u.role === 'staff' || u.role === 'admin') &&
        (u.email.toLowerCase() === cleanUser || u.name.toLowerCase() === cleanUser)
    );

    const isKnownStaff =
      matchedUser ||
      cleanUser === 'barista@cafepita.com' ||
      cleanUser === 'staff@cafepita.com' ||
      cleanUser === 'marco@cafepita.com' ||
      cleanUser === 'cheska';

    if (!isKnownStaff || cleanPass.length < 4) {
      return {
        success: false,
        error: 'Invalid credentials. Please verify your Staff Username and Password.',
      };
    }

    const staffUser = matchedUser || {
      id: 2,
      name: 'Cheska Kimberly (Barista)',
      email: cleanUser.includes('@') ? cleanUser : `${cleanUser}@cafepita.com`,
      role: 'staff' as const,
    };

    // Issue Sanctum Token with restricted 'role:staff' token ability
    const session: AuthSession = {
      token: `sanctum_staff_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      user: {
        id: staffUser.id,
        name: staffUser.name,
        email: staffUser.email,
        role: 'staff',
      },
      abilities: ['role:staff'],
      login_at: new Date().toISOString(),
    };

    localStorage.setItem('cp_staff_session', JSON.stringify(session));
    setStaffSession(session);
    setCurrentUserRole('staff');
    setAuthRedirectNotice(null);
    navigate('/staff/dashboard');
    return { success: true };
  };

  const logoutStaff = async (): Promise<void> => {
    // Revoke active Sanctum API token on backend ($request->user()->currentAccessToken()->delete())
    // Clear staff authentication state and local storage keys from frontend
    localStorage.removeItem('cp_staff_session');
    setStaffSession(null);
    setAuthRedirectNotice('Logged out successfully from staff terminal.');
    navigate('/staff/login');
  };

  // Admin Sanctum Authentication Methods
  const loginAdmin = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      return { success: false, error: 'Admin username and password are required.' };
    }

    const matchedUser = staffUsers.find(
      (u) =>
        u.role === 'admin' &&
        (u.email.toLowerCase() === cleanUser || u.name.toLowerCase() === cleanUser)
    );

    const isKnownAdmin =
      matchedUser ||
      cleanUser === 'owner@cafepita.com' ||
      cleanUser === 'admin@cafepita.com' ||
      cleanUser === 'admin';

    if (!isKnownAdmin || cleanPass.length < 4) {
      return {
        success: false,
        error: 'Invalid admin credentials. High-security access denied.',
      };
    }

    const adminUser = matchedUser || {
      id: 1,
      name: 'Admin Manager',
      email: cleanUser.includes('@') ? cleanUser : `${cleanUser}@cafepita.com`,
      role: 'admin' as const,
    };

    // Issue Sanctum Token with full 'role:admin' token ability
    const session: AuthSession = {
      token: `sanctum_admin_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: 'admin',
      },
      abilities: ['role:admin'],
      login_at: new Date().toISOString(),
    };

    localStorage.setItem('cp_admin_session', JSON.stringify(session));
    setAdminSession(session);
    setCurrentUserRole('admin');
    setAuthRedirectNotice(null);
    navigate('/admin/dashboard');
    return { success: true };
  };

  const logoutAdmin = async (): Promise<void> => {
    // Revoke admin API token on backend ($request->user()->currentAccessToken()->delete())
    // Purge all admin session data and local tokens on frontend
    localStorage.removeItem('cp_admin_session');
    setAdminSession(null);
    setAuthRedirectNotice('Admin session ended. Token revoked on server.');
    navigate('/admin/login');
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

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('cp_inventory_items_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_INVENTORY_ITEMS;
      }
    }
    return INITIAL_INVENTORY_ITEMS;
  });

  const [recipeRules, setRecipeRules] = useState<VariantRecipeRule[]>(() => {
    const saved = localStorage.getItem('cp_recipe_rules_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_RECIPE_RULES;
      }
    }
    return INITIAL_RECIPE_RULES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('cp_inventory_items_v2', JSON.stringify(inventoryItems));
    } catch {}
  }, [inventoryItems]);

  useEffect(() => {
    try {
      localStorage.setItem('cp_recipe_rules_v2', JSON.stringify(recipeRules));
    } catch {}
  }, [recipeRules]);

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
        total_amount: 265,
        payment_method: 'online',
        payment_status: 'unpaid',
        order_status: 'pending',
        gcash_receipt_path: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
        created_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
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
      {
        id: 1003,
        tracking_token: 'CP-902341',
        table_id: null,
        customer_name: 'Marco Valerio',
        order_type: 'delivery',
        delivery_details: {
          address: 'Block 3 Lot 8 Acacia Lane',
          city_region: 'Cabanatuan City',
          postal_code: '3100',
          contact_number: '09171234567',
          driver_notes: 'Leave at front gate',
        },
        total_amount: 320,
        payment_method: 'online',
        payment_status: 'paid',
        order_status: 'preparing',
        gcash_receipt_path: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
        created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        updated_at: new Date().toISOString(),
        items: [
          {
            id: 'item-5',
            menu_item_id: 101,
            item_name: 'Pepita Signature Spanish Latte',
            quantity: 2,
            price: 135,
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
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails | null>(null);
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
      image_path: item.image_path,
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

    // 3. Deduct container bottlenecks (legacy support)
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

    // 4. Atomically decrement Dynamic Raw Inventory Items according to BOM / Recipe Rules
    setInventoryItems((prevInventory) => {
      const updatedInventory = prevInventory.map((item) => ({ ...item }));

      orderItems.forEach((oi) => {
        const itemSize = oi.customizations?.size || oi.size || '16oz';
        // Match recipe rules for this specific menu item and variant size (or 'All Sizes' / 'all')
        const matchingRules = recipeRules.filter(
          (r) =>
            r.menu_item_id === oi.menu_item_id &&
            (r.variant_size.toLowerCase() === itemSize.toLowerCase() ||
              r.variant_size.toLowerCase() === 'all' ||
              r.variant_size.toLowerCase() === 'all sizes' ||
              r.variant_size.toLowerCase() === 'regular')
        );

        matchingRules.forEach((rule) => {
          const invIdx = updatedInventory.findIndex((inv) => String(inv.id) === String(rule.inventory_item_id));
          if (invIdx !== -1) {
            const deductUnits = rule.quantity_deducted * oi.quantity;
            const targetItem = updatedInventory[invIdx];
            const newStock = Math.max(0, targetItem.stock_quantity - deductUnits);
            updatedInventory[invIdx] = { ...targetItem, stock_quantity: newStock };

            newLogs.push({
              id: Date.now() + Math.floor(Math.random() * 10000) + invIdx,
              user_id: staffUserId,
              user_name: staffUserId ? 'Staff Barista' : 'Automated (Payment Confirmed)',
              menu_item_id: oi.menu_item_id,
              add_on_id: null,
              item_name: `${targetItem.name} [Recipe: ${oi.item_name} ${itemSize}]`,
              change_type: 'sale',
              quantity_changed: -deductUnits,
              notes: `Order #${orderToken} BOM deduction: ${rule.quantity_deducted} ${targetItem.unit}/drink x ${oi.quantity}`,
              created_at: new Date().toISOString(),
            });
          }
        });
      });

      return updatedInventory;
    });

    if (newLogs.length > 0) {
      setInventoryLogs((prev) => [...newLogs, ...prev]);
    }
  };

  // Dynamic Raw Inventory CRUD & Restock Handlers
  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: Date.now(),
      created_at: new Date().toISOString(),
    };
    setInventoryItems((prev) => [newItem, ...prev]);
  };

  const updateInventoryItem = (id: number | string, updates: Partial<InventoryItem>) => {
    setInventoryItems((prev) =>
      prev.map((it) => (String(it.id) === String(id) ? { ...it, ...updates, updated_at: new Date().toISOString() } : it))
    );
  };

  const deleteInventoryItem = (id: number | string) => {
    setInventoryItems((prev) => prev.filter((it) => String(it.id) !== String(id)));
    // Also remove any recipe mappings referencing this raw item
    setRecipeRules((prev) => prev.filter((r) => String(r.inventory_item_id) !== String(id)));
  };

  const restockInventoryItem = (id: number | string, qty: number, notes?: string) => {
    let affectedName = 'Raw Inventory';
    setInventoryItems((prev) =>
      prev.map((it) => {
        if (String(it.id) === String(id)) {
          affectedName = it.name;
          return {
            ...it,
            stock_quantity: it.stock_quantity + qty,
            updated_at: new Date().toISOString(),
          };
        }
        return it;
      })
    );

    // Live inventory audit log
    const auditLog: InventoryLog = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      user_id: adminSession?.user?.id || 1,
      user_name: adminSession?.user?.name || 'Administrator',
      menu_item_id: null,
      add_on_id: null,
      item_name: affectedName,
      change_type: 'restock',
      quantity_changed: qty,
      notes: notes || `Shipment restock +${qty} units via Admin Portal`,
      created_at: new Date().toISOString(),
    };
    setInventoryLogs((prev) => [auditLog, ...prev]);
  };

  // Recipe / BOM Dynamic Linker Handlers
  const saveRecipeRulesForVariant = (
    menuItemId: number,
    variantSize: string,
    items: { inventory_item_id: number | string; quantity_deducted: number }[]
  ) => {
    setRecipeRules((prev) => {
      // Remove old rules for this exact menuItem and size
      const preserved = prev.filter(
        (r) => !(r.menu_item_id === menuItemId && r.variant_size.toLowerCase() === variantSize.toLowerCase())
      );
      const created: VariantRecipeRule[] = items.map((it, idx) => ({
        id: `rec-${menuItemId}-${variantSize}-${Date.now()}-${idx}`,
        menu_item_id: menuItemId,
        variant_size: variantSize,
        inventory_item_id: it.inventory_item_id,
        quantity_deducted: it.quantity_deducted || 1,
      }));
      return [...preserved, ...created];
    });
  };

  const deleteRecipeRule = (id: number | string) => {
    setRecipeRules((prev) => prev.filter((r) => String(r.id) !== String(id)));
  };

  // Stock Safeguards & Availability Checks
  const checkVariantAvailability = (menuItemId: number, size?: string) => {
    const item = menuItems.find((m) => m.id === menuItemId);
    if (!item || !item.is_available) {
      return { isAvailable: false, reason: 'Item is currently disabled by store management.' };
    }

    const effectiveSize = size || item.size || '16oz';
    const matchingRules = recipeRules.filter(
      (r) =>
        r.menu_item_id === menuItemId &&
        (r.variant_size.toLowerCase() === effectiveSize.toLowerCase() ||
          r.variant_size.toLowerCase() === 'all' ||
          r.variant_size.toLowerCase() === 'all sizes' ||
          r.variant_size.toLowerCase() === 'regular')
    );

    for (const rule of matchingRules) {
      const invItem = inventoryItems.find((inv) => String(inv.id) === String(rule.inventory_item_id));
      if (invItem && invItem.stock_quantity <= 0) {
        return {
          isAvailable: false,
          missingItemName: invItem.name,
          reason: `Out of Stock: ${invItem.name} reserve is depleted (0 ${invItem.unit})`,
          requiredItemStock: invItem.stock_quantity,
        };
      }
      if (invItem && invItem.stock_quantity < rule.quantity_deducted) {
        return {
          isAvailable: false,
          missingItemName: invItem.name,
          reason: `Insufficient ${invItem.name}: Only ${invItem.stock_quantity} left (needs ${rule.quantity_deducted})`,
          requiredItemStock: invItem.stock_quantity,
        };
      }
    }

    return { isAvailable: true };
  };

  const checkItemOverallAvailability = (menuItemId: number) => {
    const item = menuItems.find((m) => m.id === menuItemId);
    if (!item || !item.is_available) {
      return { isAvailable: false, outOfStockVariants: [], reason: 'Disabled' };
    }

    if (item.available_sizes && item.available_sizes.length > 0) {
      const outOfStockVariants: string[] = [];
      let missingItemName: string | undefined;
      for (const s of item.available_sizes) {
        const check = checkVariantAvailability(menuItemId, s.size);
        if (!check.isAvailable) {
          outOfStockVariants.push(s.size);
          if (!missingItemName && check.missingItemName) {
            missingItemName = check.missingItemName;
          }
        }
      }
      const allOut = outOfStockVariants.length === item.available_sizes.length;
      return {
        isAvailable: !allOut,
        outOfStockVariants,
        missingItemName,
        reason: allOut ? 'All drink variants are currently out of stock due to raw packaging/supply bottlenecks.' : undefined,
      };
    } else {
      const check = checkVariantAvailability(menuItemId, item.size || 'Regular');
      return {
        isAvailable: check.isAvailable,
        outOfStockVariants: check.isAvailable ? [] : [item.size || 'Regular'],
        missingItemName: check.missingItemName,
        reason: check.reason,
      };
    }
  };

  const placeOrder = (paymentMethod: PaymentMethod, gcashReceiptPath?: string): string => {
    const trackingToken = 'CP-' + Math.floor(100000 + Math.random() * 900000);
    const subtotal = cart.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

    const isOnlinePaid = paymentMethod === 'online';

    const newOrder: Order = {
      id: Date.now(),
      tracking_token: trackingToken,
      table_id: orderType === 'dine-in' ? selectedTableId : null,
      customer_name: customerName,
      order_type: orderType,
      delivery_details: orderType === 'delivery' ? deliveryDetails || undefined : undefined,
      total_amount: subtotal,
      payment_method: paymentMethod,
      // Mandatory Payment Verification Workflow:
      // Orders submitted via Cash or GCash must NOT be directly marked as "Accepted" or sent to preparation
      // until Staff explicitly verifies payment. Initial state: 'unpaid' and 'pending'.
      payment_status: 'unpaid',
      order_status: 'pending',
      gcash_receipt_path: isOnlinePaid ? (gcashReceiptPath || undefined) : undefined,
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
        payment_status: 'unpaid',
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

  // Staff POS / Kitchen Actions - Mandatory Payment Verification Workflow
  const verifyAndAcceptOrder = (orderId: number) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          if (ord.payment_status !== 'paid') {
            deductInventoryForOrder(ord.items, ord.tracking_token, 2);
          }
          return {
            ...ord,
            payment_status: 'paid',
            order_status: 'preparing',
            updated_at: new Date().toISOString(),
          };
        }
        return ord;
      })
    );
  };

  const rejectOrder = (orderId: number, reason?: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          if (ord.table_id) {
            setTables((tbls) =>
              tbls.map((t) => (t.id === ord.table_id ? { ...t, status: 'available' } : t))
            );
          }
          return {
            ...ord,
            order_status: 'cancelled',
            cancellation_reason: reason || 'Order rejected by staff (Invalid payment or proof of payment)',
            updated_at: new Date().toISOString(),
          };
        }
        return ord;
      })
    );
  };

  const approveCashPayment = (orderId: number) => {
    verifyAndAcceptOrder(orderId);
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
    localStorage.removeItem('cp_inventory_items_v2');
    localStorage.removeItem('cp_recipe_rules_v2');
    setMenuItems(RAW_MENU_ITEMS);
    setAddOns(INITIAL_ADDONS);
    setBottlenecks(INITIAL_BOTTLENECK_UNITS);
    setInventoryItems(INITIAL_INVENTORY_ITEMS);
    setRecipeRules(INITIAL_RECIPE_RULES);
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
        currentPath,
        navigate,
        staffSession,
        adminSession,
        loginStaff,
        logoutStaff,
        loginAdmin,
        logoutAdmin,
        authRedirectNotice,
        setAuthRedirectNotice,
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
        deliveryDetails,
        setDeliveryDetails,
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
        verifyAndAcceptOrder,
        rejectOrder,
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
        inventoryItems,
        recipeRules,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        restockInventoryItem,
        saveRecipeRulesForVariant,
        deleteRecipeRule,
        checkVariantAvailability,
        checkItemOverallAvailability,
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
