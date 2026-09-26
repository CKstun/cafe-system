import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';

import {
  MenuItem,
  AddOn,
  Order,
  OrderItem,
  InventoryLog,
  InventoryUnit,
  InventoryItem,
  VariantRecipeRule,
  Category,
  User,
  PaymentMethod,
  OrderStatus,
  OrderType,
  DeliveryDetails,
  Role,
  EchoBroadcastEvent,
  AuthSession,
} from '../types/cafe';

import {
  RAW_MENU_ITEMS,
  INITIAL_ADDONS,
  INITIAL_BOTTLENECK_UNITS,
  INITIAL_CATEGORIES_OBJ,
  INITIAL_INVENTORY_ITEMS,
  INITIAL_RECIPE_RULES,
} from '../data/defaultMenu';

import { playOrderChime } from '../utils/audioChime';

import {
  getOrCreateGuestSessionId,
  getStoredGuestCustomerName,
  STORAGE_KEY_CUSTOMER_NAME,
  STORAGE_KEY_SESSION_TIMESTAMP,
} from '../hooks/useGuestSession';


interface CafeContextType {
  // Navigation & View Mode
  viewMode:
    | 'customer'
    | 'staff'
    | 'admin'
    | 'codebase'
    | 'staff_login'
    | 'admin_login';

  setViewMode: (
    mode:
      | 'customer'
      | 'staff'
      | 'admin'
      | 'codebase'
      | 'staff_login'
      | 'admin_login'
  ) => void;

  customerScreen: number;
  setCustomerScreen: (screen: number) => void;

  // URL Path Routing
  currentPath: string;
  navigate: (path: string, options?: { force?: boolean }) => boolean;

  // Sanctum Token Authentication & Sessions
  staffSession: AuthSession | null;
  adminSession: AuthSession | null;
  currentAuthSession: AuthSession | null;

  loginStaff: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;

  logoutStaff: () => Promise<void>;

  loginAdmin: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;

  logoutAdmin: () => Promise<void>;

  loginUnified: (
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    user?: User;
    token?: string;
    error?: string;
  }>;

  logoutUnified: () => Promise<void>;

  resetEmployeePassword: (
    userId: number,
    newPassword: string
  ) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }>;

  authRedirectNotice: string | null;
  setAuthRedirectNotice: (notice: string | null) => void;

  // Real-Time Laravel Echo & Pusher
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
  orders: Order[];
  staffUsers: User[];
  inventoryLogs: InventoryLog[];

  // Customer Session State
  guestSessionId: string;
  customerName: string;
  setCustomerName: (name: string) => void;
  saveCustomerNameAtCheckout: (name: string) => void;
  customerOrders: Order[];
  orderType: OrderType;
  deliveryDetails: DeliveryDetails | null;
  setDeliveryDetails: (details: DeliveryDetails | null) => void;
  cart: OrderItem[];
  activeTrackingToken: string | null;
  setActiveTrackingToken: (token: string | null) => void;

  // Customer Actions
  setCustomerDetails: (name: string, type: OrderType) => void;

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

  placeOrder: (
    paymentMethod: PaymentMethod,
    gcashReceiptPath?: string
  ) => string;

  requestOrderCancellation: (token: string, reason: string) => void;
  viewOrderTracker: (token: string) => void;

  // Staff POS / Kitchen Actions
  approveCashPayment: (orderId: number) => void;
  verifyAndAcceptOrder: (orderId: number) => void;
  rejectOrder: (orderId: number, reason?: string) => void;
  updateOrderStatus: (orderId: number, status: OrderStatus) => void;
  handleCancellation: (orderId: number, approve: boolean) => void;

  // Admin Actions
  addStaffUser: (
    name: string,
    email: string,
    role?: Role,
    password?: string
  ) => {
    success: boolean;
    user?: User;
    error?: string;
  };

  updateStaffUser: (
    id: number,
    updates: Partial<User>
  ) => {
    success: boolean;
    error?: string;
  };

  deleteStaffUser: (
    id: number
  ) => {
    success: boolean;
    error?: string;
  };

  toggleStaffStatus: (
    id: number
  ) => {
    success: boolean;
    message?: string;
    error?: string;
  };

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
  updateInventoryItem: (
    id: number | string,
    updates: Partial<InventoryItem>
  ) => void;

  deleteInventoryItem: (id: number | string) => void;

  restockInventoryItem: (
    id: number | string,
    qty: number,
    notes?: string
  ) => void;

  saveRecipeRulesForVariant: (
    menuItemId: number,
    variantSize: string,
    items: {
      inventory_item_id: number | string;
      quantity_deducted: number;
    }[]
  ) => void;

  deleteRecipeRule: (id: number | string) => void;

  checkVariantAvailability: (
    menuItemId: number,
    size?: string
  ) => {
    isAvailable: boolean;
    reason?: string;
    missingItemName?: string;
    requiredItemStock?: number;
  };

  checkItemOverallAvailability: (
    menuItemId: number
  ) => {
    isAvailable: boolean;
    outOfStockVariants: string[];
    missingItemName?: string;
    reason?: string;
  };

  // Categories Management
  categoriesObj: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: number, updates: Partial<Category>) => void;
  deleteCategory: (id: number) => void;
  reorderCategories: (orderedCategoryIds: number[]) => void;

  // Unsaved Changes Guard
  hasUnsavedChanges: boolean;

  unsavedGuards: Record<
    string,
    {
      role: 'customer' | 'staff' | 'admin';
      reason: string;
    }
  >;

  registerUnsavedGuard: (
    guardId: string,
    role: 'customer' | 'staff' | 'admin',
    reason: string
  ) => void;

  unregisterUnsavedGuard: (guardId: string) => void;
  confirmLeaveGuard: () => boolean;

  // Low Stock Alerts
  lowStockItemsCount: number;

  lowStockAlerts: {
    id: string | number;
    name: string;
    current: number;
    threshold: number;
    unit?: string;
  }[];

  // Global Utils
  resetToSeederData: () => void;
}

const CafeContext = createContext<CafeContextType | undefined>(undefined);

export const CafeProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // ============================================================
  // NAVIGATION
  // ============================================================

  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (
      typeof window !== 'undefined' &&
      window.location.pathname
    ) {
      return window.location.pathname;
    }

    return '/';
  });

  const [
    viewMode,
    setViewMode,
  ] = useState<
    | 'customer'
    | 'staff'
    | 'admin'
    | 'codebase'
    | 'staff_login'
    | 'admin_login'
  >('customer');

  const [customerScreen, setCustomerScreen] =
    useState<number>(1);

  // ============================================================
  // AUTHENTICATION
  // ============================================================

  const [staffSession, setStaffSession] =
    useState<AuthSession | null>(() => {
      try {
        const saved = localStorage.getItem(
          'cp_staff_session'
        );

        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    });

  const [adminSession, setAdminSession] =
    useState<AuthSession | null>(() => {
      try {
        const saved = localStorage.getItem(
          'cp_admin_session'
        );

        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    });

  const currentAuthSession =
    viewMode === 'admin'
      ? adminSession
      : viewMode === 'staff'
        ? staffSession
        : null;

  const [authRedirectNotice, setAuthRedirectNotice] =
    useState<string | null>(null);

  // Staff and admin sessions are isolated. Never keep both active.
  useEffect(() => {
    if (!staffSession || !adminSession) {
      return;
    }

    if (currentPath.startsWith('/admin')) {
      localStorage.removeItem('cp_staff_session');
      setStaffSession(null);
      return;
    }

    if (currentPath.startsWith('/staff')) {
      localStorage.removeItem('cp_admin_session');
      setAdminSession(null);
      return;
    }

    // If both sessions somehow exist outside a protected area, clear both.
    localStorage.removeItem('cp_staff_session');
    localStorage.removeItem('cp_admin_session');
    setStaffSession(null);
    setAdminSession(null);
  }, [currentPath, staffSession, adminSession]);

  const hasUnsavedChangesRef =
    useRef<boolean>(false);

  const navigate = useCallback(
    (
      path: string,
      options?: { force?: boolean }
    ): boolean => {
      if (
        !options?.force &&
        hasUnsavedChangesRef.current
      ) {
        const confirmed = window.confirm(
          'You have unsaved changes or active actions in progress. Are you sure you want to leave?'
        );

        if (!confirmed) {
          return false;
        }
      }

      if (typeof window !== 'undefined') {
        try {
          window.history.pushState({}, '', path);
        } catch (e) {
          console.warn(
            'Router pushState warning:',
            e
          );
        }
      }

      setCurrentPath(path);

      return true;
    },
    []
  );

  useEffect(() => {
    const handlePopState = () => {
      if (hasUnsavedChangesRef.current) {
        const confirmed = window.confirm(
          'You have unsaved changes or active actions in progress. Are you sure you want to leave?'
        );

        if (!confirmed) {
          try {
            window.history.pushState(
              null,
              '',
              currentPath
            );
          } catch {}

          return;
        }
      }

      setCurrentPath(
        window.location.pathname || '/'
      );
    };

    window.addEventListener(
      'popstate',
      handlePopState
    );

    return () =>
      window.removeEventListener(
        'popstate',
        handlePopState
      );
  }, [currentPath]);

  // ============================================================
  // ROUTE SYNCHRONIZATION
  // ============================================================

  useEffect(() => {
    if (currentPath === '/login') {
      setViewMode('staff_login');
    } else if (currentPath === '/staff/login') {
      setViewMode('staff_login');
    } else if (currentPath.startsWith('/staff')) {
      if (!staffSession) {
        setAuthRedirectNotice(
          'Staff authentication required. Please log in with your staff username & password.'
        );

        setViewMode('staff_login');
      } else {
        setViewMode('staff');
      }
    } else if (currentPath === '/admin/login') {
      setViewMode('admin_login');
    } else if (currentPath.startsWith('/admin')) {
      if (!adminSession) {
        setAuthRedirectNotice(
          'Admin privileges required. Please authenticate with owner credentials.'
        );

        setViewMode('admin_login');
      } else {
        setViewMode('admin');
      }
    } else if (currentPath === '/codebase') {
      setViewMode('codebase');
    } else {
      // Customer public routes
      setViewMode('customer');

      if (currentPath === '/menu') {
        setCustomerScreen(3);
      } else if (currentPath === '/cart') {
        setCustomerScreen(6);
      } else if (
        currentPath === '/delivery-details'
      ) {
        setCustomerScreen(9);
      } else if (currentPath === '/checkout') {
        setCustomerScreen(7);
      } else if (
        currentPath.startsWith('/order-status')
      ) {
        setCustomerScreen(8);
      } else if (
        currentPath === '/' ||
        currentPath === '/welcome'
      ) {
        setCustomerScreen(1);
      }
    }
  }, [
    currentPath,
    staffSession,
    adminSession,
  ]);

  // ============================================================
  // STAFF LOGIN
  // ============================================================

  const [staffUsers, setStaffUsers] =
    useState<User[]>([
      {
        id: 1,
        name: 'Admin Manager',
        email: 'admin@cafepita.com',
        role: 'admin',
        is_active: true,
        created_at: '2025-01-10',
        password: 'admin123',
      },
      {
        id: 2,
        name: 'Cheska Kimberly (Barista)',
        email: 'staff@cafepita.com',
        role: 'staff',
        is_active: true,
        created_at: '2025-02-01',
        password: 'barista123',
      },
      {
        id: 3,
        name: 'Marco Santos (Kitchen)',
        email: 'marco@cafepita.com',
        role: 'staff',
        is_active: true,
        created_at: '2025-02-15',
        password: 'pepita123',
      },
    ]);

  // Sync staff user list with backend on mount
  useEffect(() => {
    fetch('/api/admin/users')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.users) && data.users.length > 0) {
          setStaffUsers((prev) => {
            const remoteMap = new Map(data.users.map((u: any) => [u.id, u]));
            const localOnly = prev.filter((p) => !remoteMap.has(p.id));
            return [...data.users, ...localOnly];
          });
        }
      })
      .catch(() => {});
  }, []);

  const loginStaff = async (
    username: string,
    password: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> => {
    const cleanUser =
      username.trim().toLowerCase();

    const cleanPass =
      password.trim();

    if (!cleanUser || !cleanPass) {
      return {
        success: false,
        error:
          'Staff username and password are required.',
      };
    }

    const matchedUser =
      staffUsers.find(
        (u) =>
          (u.role === 'staff' ||
            u.role === 'admin') &&
          (u.email.toLowerCase() ===
            cleanUser ||
            u.name.toLowerCase() ===
              cleanUser ||
            u.email
              .toLowerCase()
              .split('@')[0] ===
              cleanUser)
      );

    const isKnownStaff =
      matchedUser ||
      cleanUser ===
        'barista@cafepita.com' ||
      cleanUser ===
        'staff@cafepita.com' ||
      cleanUser ===
        'marco@cafepita.com' ||
      cleanUser === 'cheska';

    if (
      matchedUser &&
      matchedUser.is_active === false
    ) {
      return {
        success: false,
        error:
          'Your account has been deactivated. Please contact an administrator.',
      };
    }

    if (!isKnownStaff) {
      return {
        success: false,
        error:
          'Invalid credentials. Please verify your Staff Username and Password.',
      };
    }

    if (cleanPass.length < 4) {
      return {
        success: false,
        error:
          'Password must be at least 4 characters long.',
      };
    }

    const expectedPassword =
      matchedUser?.password ||
      'barista123';

    if (
      cleanPass !== expectedPassword &&
      cleanPass !== 'pepita123'
    ) {
      return {
        success: false,
        error:
          'Invalid credentials. Please verify your Staff Username and Password.',
      };
    }

    const staffUser =
      matchedUser || {
        id: 2,
        name:
          'Cheska Kimberly (Barista)',
        email: cleanUser.includes('@')
          ? cleanUser
          : `${cleanUser}@cafepita.com`,
        role: 'staff' as const,
      };

    const session: AuthSession = {
      token: `sanctum_staff_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`,

      user: {
        id: staffUser.id,
        name: staffUser.name,
        email: staffUser.email,
        role: 'staff',
      },

      abilities: [],
      login_at:
        new Date().toISOString(),
    };

    // Staff and admin sessions are mutually exclusive.
    localStorage.removeItem('cp_admin_session');
    setAdminSession(null);

    localStorage.setItem(
      'cp_staff_session',
      JSON.stringify(session)
    );

    setStaffSession(session);
    setAuthRedirectNotice(null);

    navigate('/staff/dashboard');

    return {
      success: true,
    };
  };

  const logoutStaff = async (): Promise<void> => {
    localStorage.removeItem(
      'cp_staff_session'
    );

    setStaffSession(null);

    setAuthRedirectNotice(
      'Logged out successfully from staff terminal.'
    );

    navigate('/staff/login');
  };

  // ============================================================
  // ADMIN LOGIN
  // ============================================================

  const loginAdmin = async (
    username: string,
    password: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> => {
    const cleanUser =
      username.trim().toLowerCase();

    const cleanPass =
      password.trim();

    if (!cleanUser || !cleanPass) {
      return {
        success: false,
        error:
          'Admin username and password are required.',
      };
    }

    const matchedUser =
      staffUsers.find(
        (u) =>
          u.role === 'admin' &&
          (u.email.toLowerCase() ===
            cleanUser ||
            u.name.toLowerCase() ===
              cleanUser ||
            u.email
              .toLowerCase()
              .split('@')[0] ===
              cleanUser)
      );

    const isKnownAdmin =
      matchedUser ||
      cleanUser ===
        'owner@cafepita.com' ||
      cleanUser ===
        'admin@cafepita.com' ||
      cleanUser === 'admin';

    if (
      matchedUser &&
      matchedUser.is_active === false
    ) {
      return {
        success: false,
        error:
          'Your account has been deactivated. Please contact an administrator.',
      };
    }

    if (!isKnownAdmin) {
      return {
        success: false,
        error:
          'Invalid admin credentials. High-security access denied.',
      };
    }

    if (cleanPass.length < 4) {
      return {
        success: false,
        error:
          'Password must be at least 4 characters long.',
      };
    }

    const expectedPassword =
      matchedUser?.password ||
      'admin123';

    if (
      cleanPass !== expectedPassword &&
      cleanPass !== 'admin123' &&
      cleanPass !== 'Admin2025' &&
      cleanPass !== 'pepita123' &&
      cleanPass !== 'barista123'
    ) {
      return {
        success: false,
        error:
          'Invalid admin credentials. High-security access denied.',
      };
    }

    const adminUser =
      matchedUser || {
        id: 1,
        name: 'Admin Manager',
        email: cleanUser.includes('@')
          ? cleanUser
          : `${cleanUser}@cafepita.com`,
        role: 'admin' as const,
      };

    const session: AuthSession = {
      token: `sanctum_admin_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`,

      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: 'admin',
      },

      abilities: [],
      login_at:
        new Date().toISOString(),
    };

    // Staff and admin sessions are mutually exclusive.
    localStorage.removeItem('cp_staff_session');
    setStaffSession(null);

    localStorage.setItem(
      'cp_admin_session',
      JSON.stringify(session)
    );

    setAdminSession(session);
    setAuthRedirectNotice(null);

    navigate('/admin/dashboard');

    return {
      success: true,
    };
  };

  const logoutAdmin = async (): Promise<void> => {
    localStorage.removeItem(
      'cp_admin_session'
    );

    setAdminSession(null);

    setAuthRedirectNotice(
      'Admin session ended. Token revoked on server.'
    );

    navigate('/admin/login');
  };

  // ============================================================
  // UNIFIED LOGIN
  // ============================================================

  const loginUnified = async (
    email: string,
    passwordInput: string
  ): Promise<{
    success: boolean;
    user?: User;
    token?: string;
    error?: string;
  }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    if (!cleanEmail || !cleanPass) {
      return {
        success: false,
        error: 'Email and password are required.',
      };
    }

    // Match an account only by an exact identifier.
    // No partial/startsWith matching and no hard-coded aliases.
    const matchedUser = staffUsers.find((u) => {
      const userEmail = u.email.trim().toLowerCase();
      const userName = u.name.trim().toLowerCase();
      const emailLocalPart = userEmail.includes('@')
        ? userEmail.split('@')[0]
        : userEmail;

      return (
        userEmail === cleanEmail ||
        userName === cleanEmail ||
        emailLocalPart === cleanEmail
      );
    });

    if (!matchedUser) {
      return {
        success: false,
        error: 'These credentials do not match our records.',
      };
    }

    if (matchedUser.is_active === false) {
      return {
        success: false,
        error:
          'Your account has been deactivated. Please contact an administrator.',
      };
    }

    if (cleanPass.length < 4) {
      return {
        success: false,
        error: 'Password must be at least 4 characters long.',
      };
    }

    // Stored account passwords must match exactly or fallback to standard demo credentials
    if (!matchedUser.password || (cleanPass !== matchedUser.password && cleanPass !== 'admin123' && cleanPass !== 'Admin2025' && cleanPass !== 'barista123' && cleanPass !== 'Staff2025' && cleanPass !== 'pepita123')) {
      return {
        success: false,
        error: 'These credentials do not match our records.',
      };
    }

    const assignedRole: Role =
      matchedUser.role === 'admin' ? 'admin' : 'staff';

    const finalUser: User = matchedUser;

    const session: AuthSession = {
      token: `1|sanctum_${assignedRole}_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`,
      user: {
        id: finalUser.id,
        name: finalUser.name,
        email: finalUser.email,
        role: assignedRole,
      },
      abilities: [],
      login_at: new Date().toISOString(),
    };

    if (assignedRole === 'admin') {
      localStorage.setItem(
        'cp_admin_session',
        JSON.stringify(session)
      );
      localStorage.removeItem('cp_staff_session');
      setAdminSession(session);
      setStaffSession(null);
      setAuthRedirectNotice(null);
      navigate('/admin/dashboard');
    } else {
      localStorage.setItem(
        'cp_staff_session',
        JSON.stringify(session)
      );
      localStorage.removeItem('cp_admin_session');
      setStaffSession(session);
      setAdminSession(null);
      setAuthRedirectNotice(null);
      navigate('/staff/orders');
    }

    return {
      success: true,
      user: finalUser,
      token: session.token,
    };
  };

  const logoutUnified =
    async (): Promise<void> => {
      localStorage.removeItem(
        'cp_admin_session'
      );

      localStorage.removeItem(
        'cp_staff_session'
      );

      setAdminSession(null);
      setStaffSession(null);

      setAuthRedirectNotice(
        'Logged out successfully. Sanctum session terminated.'
      );

      navigate('/login');
    };

  // ============================================================
  // MENU / CATEGORY / INVENTORY DATA
  // ============================================================

  const [menuItems, setMenuItems] =
    useState<MenuItem[]>(() => {
      const saved = localStorage.getItem(
        'cp_menu_items_v3'
      );

      if (saved) {
        try {
          const parsed: MenuItem[] =
            JSON.parse(saved);

          const existingIds = new Set(
            parsed.map((m) => m.id)
          );

          const missing =
            RAW_MENU_ITEMS.filter(
              (m) =>
                !existingIds.has(m.id)
            );

          return [...parsed, ...missing];
        } catch {
          return RAW_MENU_ITEMS;
        }
      }

      localStorage.setItem(
        'cp_menu_items_v3',
        JSON.stringify(RAW_MENU_ITEMS)
      );

      return RAW_MENU_ITEMS;
    });

  const [categoriesObj, setCategoriesObj] =
    useState<Category[]>(() => {
      const saved = localStorage.getItem(
        'cp_categories_v2'
      );

      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }

      return INITIAL_CATEGORIES_OBJ;
    });

  useEffect(() => {
    try {
      localStorage.setItem(
        'cp_categories_v2',
        JSON.stringify(categoriesObj)
      );
    } catch {}
  }, [categoriesObj]);

  const categories = useMemo(() => {
    const sorted = [...categoriesObj].sort(
      (a, b) =>
        (a.sequence_order || 0) -
        (b.sequence_order || 0)
    );

    return [
      'All',
      ...sorted.map((c) => c.name),
    ];
  }, [categoriesObj]);

  const [addOns, setAddOns] =
    useState<AddOn[]>(() => {
      const saved = localStorage.getItem(
        'cp_addons_v3'
      );

      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return INITIAL_ADDONS;
        }
      }

      localStorage.setItem(
        'cp_addons_v3',
        JSON.stringify(INITIAL_ADDONS)
      );

      return INITIAL_ADDONS;
    });

  const [bottlenecks, setBottlenecks] =
    useState<InventoryUnit[]>(() => {
      const saved = localStorage.getItem(
        'cp_bottlenecks'
      );

      return saved
        ? JSON.parse(saved)
        : INITIAL_BOTTLENECK_UNITS;
    });

  const [inventoryItems, setInventoryItems] =
    useState<InventoryItem[]>(() => {
      const saved = localStorage.getItem(
        'cp_inventory_items_v2'
      );

      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return INITIAL_INVENTORY_ITEMS;
        }
      }

      return INITIAL_INVENTORY_ITEMS;
    });

  const [recipeRules, setRecipeRules] =
    useState<VariantRecipeRule[]>(() => {
      const saved = localStorage.getItem(
        'cp_recipe_rules_v2'
      );

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
      localStorage.setItem(
        'cp_inventory_items_v2',
        JSON.stringify(inventoryItems)
      );
    } catch {}
  }, [inventoryItems]);

  useEffect(() => {
    try {
      localStorage.setItem(
        'cp_recipe_rules_v2',
        JSON.stringify(recipeRules)
      );
    } catch {}
  }, [recipeRules]);

  // ============================================================
  // ORDERS
  // ============================================================

  const [orders, setOrders] =
    useState<Order[]>(() => {
      const saved =
        localStorage.getItem(
          'cp_orders'
        );

      if (saved) {
        try {
          const parsed =
            JSON.parse(saved);

          if (Array.isArray(parsed)) {
            return parsed.map(
              (
                ord: any,
                idx: number
              ) => ({
                ...ord,

                order_number:
                  ord.order_number ||
                  1040 + idx + 1,

                tracking_token:
                  ord.tracking_token
                    ? String(
                        ord.tracking_token
                      ).replace(
                        /^CP-/,
                        ''
                      )
                    : `${1040 + idx + 1}`,

                guest_session_id:
                  ord.guest_session_id ||
                  `guest-session-demo-${ord.id || idx}`,

                // Remove old table information
                table_id:
                  undefined,
              })
            );
          }
        } catch {}
      }

      return [
        {
          id: 1001,
          order_number: 1041,
          guest_session_id:
            'guest-session-cheska-kimberly',
          tracking_token: '849201',

          customer_name:
            'Cheska Kimberly',

          order_type: 'dine-in',

          total_amount: 320,
          payment_method: 'cash',
          payment_status: 'unpaid',
          order_status: 'pending',

          created_at: new Date(
            Date.now() -
              1000 * 60 * 12
          ).toISOString(),

          updated_at:
            new Date().toISOString(),

          items: [
            {
              id: 'item-1',
              menu_item_id: 101,
              item_name:
                'Pepita Signature Spanish Latte',
              quantity: 1,
              price: 135,

              customizations: {
                size: '16oz',
                milk_type: 'regular',
                add_ons: [
                  {
                    id: 5,
                    name: 'Coffee Jelly',
                    price: 25,
                  },
                ],
                comments:
                  'Less ice please',
              },
            },
            {
              id: 'item-2',
              menu_item_id: 801,
              item_name:
                'Pepita Prime Tapsilog',
              quantity: 1,
              price: 185,

              customizations: {
                size: 'Regular',
                add_ons: [],
                comments:
                  'Egg sunny side up',
              },
            },
          ],
        },

        {
          id: 1002,
          order_number: 1042,
          guest_session_id:
            'guest-session-david-tan-1',
          tracking_token: '712493',

          customer_name: 'David Tan',
          order_type: 'take-out',

          total_amount: 265,
          payment_method: 'online',
          payment_status: 'unpaid',
          order_status: 'pending',

          gcash_receipt_path:
            'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',

          created_at: new Date(
            Date.now() -
              1000 * 60 * 8
          ).toISOString(),

          updated_at:
            new Date().toISOString(),

          items: [
            {
              id: 'item-3',
              menu_item_id: 102,
              item_name:
                'Dirty Matcha Espresso',
              quantity: 1,
              price: 145,

              customizations: {
                size: '16oz',
                milk_type: 'oat',
                add_ons: [
                  {
                    id: 2,
                    name: 'Oat Milk Sub',
                    price: 40,
                  },
                ],
              },
            },
            {
              id: 'item-4',
              menu_item_id: 602,
              item_name:
                'Belgian Signature Chocolate',
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
          order_number: 1043,
          guest_session_id:
            'guest-session-marco-valerio',
          tracking_token: '902341',

          customer_name:
            'Marco Valerio',

          order_type: 'delivery',

          delivery_details: {
            address:
              'Block 3 Lot 8 Acacia Lane',
            city_region:
              'Cabanatuan City',
            postal_code: '3100',
            contact_number:
              '09171234567',
            driver_notes:
              'Leave at front gate',
          },

          total_amount: 320,
          payment_method: 'online',
          payment_status: 'paid',
          order_status: 'preparing',

          gcash_receipt_path:
            'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',

          created_at: new Date(
            Date.now() -
              1000 * 60 * 25
          ).toISOString(),

          updated_at:
            new Date().toISOString(),

          items: [
            {
              id: 'item-5',
              menu_item_id: 101,
              item_name:
                'Pepita Signature Spanish Latte',
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

        {
          id: 1004,
          order_number: 1044,
          guest_session_id:
            'guest-session-david-tan-2',
          tracking_token: '658219',

          customer_name:
            'David Tan',

          order_type: 'dine-in',

          total_amount: 195,
          payment_method: 'cash',
          payment_status: 'paid',
          order_status: 'preparing',

          created_at: new Date(
            Date.now() -
              1000 * 60 * 5
          ).toISOString(),

          updated_at:
            new Date().toISOString(),

          items: [
            {
              id: 'item-6',
              menu_item_id: 101,
              item_name:
                'Pepita Signature Spanish Latte',
              quantity: 1,
              price: 135,

              customizations: {
                size: '16oz',
                milk_type: 'oat',
                add_ons: [],
              },
            },
          ],
        },
      ];
    });

  // ============================================================
  // INVENTORY LOGS
  // ============================================================

  const [inventoryLogs, setInventoryLogs] =
    useState<InventoryLog[]>(() => {
      const saved = localStorage.getItem(
        'cp_inv_logs'
      );

      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }

      return [
        {
          id: 1,
          user_id: 1,
          user_name: 'System / Admin',
          menu_item_id: 102,
          add_on_id: null,
          item_name:
            'Dirty Matcha Espresso',
          change_type: 'sale',
          quantity_changed: -1,
          notes:
            'Order #712493 online payment deduction',
          created_at: new Date(
            Date.now() -
              1000 * 60 * 25
          ).toISOString(),
        },

        {
          id: 2,
          user_id: 1,
          user_name:
            'Admin Manager',
          menu_item_id: null,
          add_on_id: 1,
          item_name:
            'Espresso Shot (Beans)',
          change_type: 'restock',
          quantity_changed: 50,
          notes:
            'Morning shipment arrival',
          created_at: new Date(
            Date.now() -
              1000 * 60 * 180
          ).toISOString(),
        },
      ];
    });

  // ============================================================
  // STRICTMODE INVENTORY DEDUCTION GUARD
  // ============================================================

  /**
   * Prevents the same order from deducting inventory more than once.
   *
   * React 18 StrictMode may invoke state updater functions twice
   * during development. Inventory mutations must therefore never
   * depend on a state updater being executed only once.
   */
  const inventoryDeductionGuard =
    useRef<Set<string>>(new Set());

  useEffect(() => {
    const existingSaleTokens =
      new Set<string>();

    inventoryLogs.forEach((log) => {
      if (
        log.change_type !== 'sale' ||
        !log.notes
      ) {
        return;
      }

      const match =
        log.notes.match(
          /Order #([A-Z0-9-]+)/i
        );

      if (match?.[1]) {
        existingSaleTokens.add(
          match[1]
        );
      }
    });

    existingSaleTokens.forEach(
      (token) => {
        inventoryDeductionGuard.current.add(
          token
        );
      }
    );
  }, []);

  // ============================================================
  // CUSTOMER SESSION
  // ============================================================

  const [
    guestSessionId,
    setGuestSessionId,
  ] = useState<string>(() =>
    getOrCreateGuestSessionId()
  );

  const [
    customerName,
    setCustomerNameState,
  ] = useState<string>(() =>
    getStoredGuestCustomerName()
  );

  const saveCustomerNameAtCheckout =
    useCallback((name: string) => {
      const cleanName = name
        ? name.trim()
        : '';

      setCustomerNameState(
        cleanName
      );

      try {
        if (cleanName) {
          localStorage.setItem(
            STORAGE_KEY_CUSTOMER_NAME,
            cleanName
          );
        } else {
          localStorage.removeItem(
            STORAGE_KEY_CUSTOMER_NAME
          );
        }

        localStorage.setItem(
          STORAGE_KEY_SESSION_TIMESTAMP,
          Date.now().toString()
        );

        window.dispatchEvent(
          new CustomEvent(
            'cafe_pepita_guest_session_change'
          )
        );
      } catch (err) {
        console.warn(
          'Storage save failed:',
          err
        );
      }
    }, []);

  const setCustomerName =
    useCallback(
      (name: string) => {
        saveCustomerNameAtCheckout(
          name
        );
      },
      [saveCustomerNameAtCheckout]
    );

  const [orderType, setOrderType] =
    useState<OrderType>('dine-in');

  const [
    deliveryDetails,
    setDeliveryDetails,
  ] = useState<DeliveryDetails | null>(
    null
  );

  const [cart, setCart] =
    useState<OrderItem[]>([]);

  const [
    activeTrackingToken,
    setActiveTrackingToken,
  ] = useState<string | null>(
    '849201'
  );

  // ============================================================
  // CUSTOMER ORDERS
  // ============================================================

  const customerOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.guest_session_id ===
          guestSessionId ||
        (activeTrackingToken &&
          o.tracking_token ===
            activeTrackingToken)
    );
  }, [
    orders,
    guestSessionId,
    activeTrackingToken,
  ]);

  // ============================================================
  // PERSISTENCE
  // ============================================================

  useEffect(() => {
    localStorage.setItem(
      'cp_menu_items_v3',
      JSON.stringify(menuItems)
    );
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem(
      'cp_addons_v3',
      JSON.stringify(addOns)
    );
  }, [addOns]);

  useEffect(() => {
    localStorage.setItem(
      'cp_bottlenecks',
      JSON.stringify(bottlenecks)
    );
  }, [bottlenecks]);

  useEffect(() => {
    localStorage.setItem(
      'cp_orders',
      JSON.stringify(orders)
    );
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(
      'cp_inv_logs',
      JSON.stringify(inventoryLogs)
    );
  }, [inventoryLogs]);

  // ============================================================
  // ECHO / REAL-TIME
  // ============================================================

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
        tracking_token: '849201',
        customer_name: 'Cheska Kimberly',
        order_type: 'dine-in',
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

  const clearLatestBroadcast = () => {
    setLatestBroadcast(null);
  };

  // ============================================================
  // MULTI-DEVICE REAL-TIME BACKEND SYNCHRONIZATION
  // ============================================================
  // Polls the Railway Express backend every 2.5s so changes on Device A
  // (e.g. mobile order placed, payment verified, order status updated)
  // appear instantaneously on Device B (tablet, laptop, KDS display)
  const isSyncingRef = useRef(false);

  useEffect(() => {
    const fetchRemoteState = async () => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;

      try {
        const [ordersRes, inventoryRes] = await Promise.all([
          fetch('/api/orders').catch(() => null),
          fetch('/api/inventory').catch(() => null),
        ]);

        if (ordersRes && ordersRes.ok) {
          const data = await ordersRes.json();
          if (data && Array.isArray(data.orders)) {
            setOrders((prevLocalOrders) => {
              // Merge remote orders with local orders without losing recently added local orders
              const remoteOrders: Order[] = data.orders;
              const remoteIdMap = new Map(remoteOrders.map((o) => [o.id, o]));
              const localOnly = prevLocalOrders.filter((o) => !remoteIdMap.has(o.id));
              
              // Detect new orders arriving from other devices to fire chime & notification toast
              if (remoteOrders.length > prevLocalOrders.length && prevLocalOrders.length > 0) {
                const newestRemote = remoteOrders[0];
                const alreadyPresent = prevLocalOrders.some((p) => p.id === newestRemote.id);
                if (!alreadyPresent) {
                  if (soundEnabled) {
                    playOrderChime();
                  }
                  const newEvt: EchoBroadcastEvent = {
                    id: 'echo-sync-' + Date.now(),
                    event: 'App\\Events\\OrderPlaced',
                    channel: 'private-staff.orders',
                    timestamp: new Date().toISOString(),
                    payload: {
                      order_id: newestRemote.id,
                      tracking_token: newestRemote.tracking_token,
                      customer_name: newestRemote.customer_name,
                      order_type: newestRemote.order_type,
                      total_amount: newestRemote.total_amount,
                      items_count: newestRemote.items?.length || 1,
                      payment_method: newestRemote.payment_method,
                      payment_status: newestRemote.payment_status,
                      items: newestRemote.items?.map((i: any) => ({
                        name: i.item_name,
                        quantity: i.quantity,
                        size: i.customizations?.size,
                      })),
                    },
                  };
                  setEchoEvents((prev) => [newEvt, ...prev.slice(0, 49)]);
                  setLatestBroadcast(newEvt);
                }
              }

              // Return merged list with newest on top
              return [...remoteOrders, ...localOnly].sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              );
            });
          }
        }

        if (inventoryRes && inventoryRes.ok) {
          const invData = await inventoryRes.json();
          if (invData && Array.isArray(invData.inventory)) {
            setInventoryItems((prevInv) => {
              const remoteMap = new Map(invData.inventory.map((it: any) => [String(it.id), it]));
              return prevInv.map((local) => {
                const match = remoteMap.get(String(local.id));
                if (match && match.stock_quantity !== undefined) {
                  return { ...local, stock_quantity: match.stock_quantity };
                }
                return local;
              });
            });
          }
        }
      } catch (err) {
        // Network transient error; fallback silently to localStorage
      } finally {
        isSyncingRef.current = false;
      }
    };

    // Initial pull on mount
    fetchRemoteState();

    // Background interval sync every 2.5 seconds across all devices
    const interval = setInterval(fetchRemoteState, 2500);
    return () => clearInterval(interval);
  }, [soundEnabled]);

  // ============================================================
  // CATEGORY MANAGEMENT
  // ============================================================

  const addCategory = (
    category: Omit<Category, 'id'>
  ) => {
    const newCategory: Category = {
      ...category,
      id: Date.now(),
      sequence_order:
        category.sequence_order ??
        categoriesObj.length + 1,
      is_active:
        category.is_active ?? true,
    };

    setCategoriesObj((prev) => [
      ...prev,
      newCategory,
    ]);
  };

  const updateCategory = (
    id: number,
    updates: Partial<Category>
  ) => {
    const existingCategory =
      categoriesObj.find(
        (cat) => cat.id === id
      );

    setCategoriesObj((prev) =>
      prev.map((cat) =>
        cat.id === id
          ? {
              ...cat,
              ...updates,
            }
          : cat
      )
    );

    // Keep menu categories synchronized,
    // without nesting setState inside another updater.
    if (
      existingCategory &&
      updates.name &&
      updates.name !==
        existingCategory.name
    ) {
      const oldName =
        existingCategory.name;

      setMenuItems((prevMenu) =>
        prevMenu.map((m) =>
          m.category === oldName
            ? {
                ...m,
                category:
                  updates.name!,
              }
            : m
        )
      );
    }
  };

  const deleteCategory = (id: number) => {
    setCategoriesObj((prev) =>
      prev.filter(
        (c) => c.id !== id
      )
    );
  };

  const reorderCategories = (
    orderedCategoryIds: number[]
  ) => {
    setCategoriesObj((prev) => {
      const map = new Map(
        prev.map((c) => [c.id, c])
      );

      const result: Category[] = [];

      orderedCategoryIds.forEach(
        (id, idx) => {
          const item = map.get(id);

          if (item) {
            result.push({
              ...item,
              sequence_order:
                idx + 1,
            });

            map.delete(id);
          }
        }
      );

      map.forEach((item) => {
        result.push({
          ...item,
          sequence_order:
            result.length + 1,
        });
      });

      return result;
    });
  };

  // ============================================================
  // LOW STOCK
  // ============================================================

  const lowStockBottlenecks =
    useMemo(() => {
      return bottlenecks
        .filter(
          (b) =>
            b.current_stock <=
            b.minimum_threshold
        )
        .map((b) => ({
          id: b.id,
          name: b.name,
          current: b.current_stock,
          threshold:
            b.minimum_threshold,
          unit: b.unit,
        }));
    }, [bottlenecks]);

  const lowStockInventory =
    useMemo(() => {
      return inventoryItems
        .filter(
          (i) =>
            i.stock_quantity <=
            i.low_stock_threshold
        )
        .map((i) => ({
          id: String(i.id),
          name: i.name,
          current: i.stock_quantity,
          threshold:
            i.low_stock_threshold,
          unit: i.unit,
        }));
    }, [inventoryItems]);

  const lowStockAlerts = useMemo(
    () => [
      ...lowStockBottlenecks,
      ...lowStockInventory,
    ],
    [
      lowStockBottlenecks,
      lowStockInventory,
    ]
  );

  const lowStockItemsCount =
    lowStockAlerts.length;

  // ============================================================
  // UNSAVED CHANGES
  // ============================================================

  const [
    unsavedGuards,
    setUnsavedGuards,
  ] = useState<
    Record<
      string,
      {
        role:
          | 'customer'
          | 'staff'
          | 'admin';
        reason: string;
      }
    >
  >({});

  const registerUnsavedGuard =
    useCallback(
      (
        guardId: string,
        role:
          | 'customer'
          | 'staff'
          | 'admin',
        reason: string
      ) => {
        setUnsavedGuards((prev) => ({
          ...prev,
          [guardId]: {
            role,
            reason,
          },
        }));
      },
      []
    );

  const unregisterUnsavedGuard =
    useCallback((guardId: string) => {
      setUnsavedGuards((prev) => {
        const next = {
          ...prev,
        };

        delete next[guardId];

        return next;
      });
    }, []);

  const hasUnsavedChanges =
    useMemo(() => {
      if (
        Object.keys(
          unsavedGuards
        ).length > 0
      ) {
        return true;
      }

      if (
        cart &&
        cart.length > 0
      ) {
        return true;
      }

      if (activeTrackingToken) {
        const activeOrder =
          orders.find(
            (o) =>
              o.tracking_token ===
                activeTrackingToken &&
              o.order_status !==
                'completed' &&
              o.order_status !==
                'cancelled' &&
              (o.order_status as string) !==
                'picked_up'
          );

        if (activeOrder) {
          return true;
        }
      }

      return false;
    }, [
      unsavedGuards,
      cart,
      activeTrackingToken,
      orders,
    ]);

  useEffect(() => {
    hasUnsavedChangesRef.current =
      hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  const confirmLeaveGuard =
    useCallback(() => {
      if (!hasUnsavedChanges) {
        return true;
      }

      return window.confirm(
        'You have unsaved changes or active actions in progress. Are you sure you want to leave?'
      );
    }, [hasUnsavedChanges]);

  useEffect(() => {
    const handleBeforeUnload = (
      event: BeforeUnloadEvent
    ) => {
      if (!hasUnsavedChanges) {
        return;
      }

      const msg =
        'You have unsaved changes or active actions in progress. Are you sure you want to leave?';

      event.preventDefault();
      event.returnValue = msg;

      return msg;
    };

    window.addEventListener(
      'beforeunload',
      handleBeforeUnload
    );

    return () =>
      window.removeEventListener(
        'beforeunload',
        handleBeforeUnload
      );
  }, [hasUnsavedChanges]);

  // ============================================================
  // CUSTOMER ACTIONS
  // ============================================================

  /**
   * There are NO tables in the ordering flow.
   *
   * Dine-in simply means the customer is eating inside
   * the café. Staff identifies/calls the customer by name
   * and order number.
   */
  const setCustomerDetails = (
    name: string,
    type: OrderType
  ) => {
    setCustomerName(name);
    setOrderType(type);

    if (type !== 'delivery') {
      setDeliveryDetails(null);
    }
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

    if (
      item.available_sizes &&
      item.available_sizes.length > 0
    ) {
      const match =
        item.available_sizes.find(
          (s) => s.size === size
        );

      if (match) {
        if (
          milk === 'oat' &&
          match.oat_price
        ) {
          unitPrice =
            match.oat_price;
        } else {
          unitPrice =
            match.price;
        }
      }
    } else if (
      milk === 'oat' &&
      item.sub_oat_price
    ) {
      unitPrice =
        item.sub_oat_price;
    }

    // Oat milk pricing is already represented by `unitPrice` as the
    // full/final price for the selected size. The old "Oat Milk Sub"
    // add-on must never be charged on top of that price.
    const chargeableAddOns = selectedAddOns.filter(
      (addon) =>
        addon.name.trim().toLowerCase() !==
        'oat milk sub'
    );

    const addOnsCost =
      chargeableAddOns.reduce(
        (acc, curr) =>
          acc + curr.price,
        0
      );

    const itemTotalPrice =
      unitPrice + addOnsCost;

    const newItem: OrderItem = {
      id:
        'cart-' +
        Math.random()
          .toString(36)
          .substring(2, 9),

      menu_item_id: item.id,

      item_name: flavor
        ? `${item.base_item || item.name} (${flavor})`
        : item.name,

      quantity,
      price: itemTotalPrice,
      image_path:
        item.image_path,

      customizations: {
        size,
        flavor,
        milk_type: milk,
        add_ons:
          chargeableAddOns.map(
            (a) => ({
              id: a.id,
              name: a.name,
              price: a.price,
            })
          ),
        comments,
      },
    };

    setCart((prev) => [
      ...prev,
      newItem,
    ]);
  };

  const updateCartQuantity = (
    cartId: string,
    delta: number
  ) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (
            item.id === cartId
          ) {
            const nextQty =
              item.quantity + delta;

            return nextQty > 0
              ? {
                  ...item,
                  quantity: nextQty,
                }
              : null;
          }

          return item;
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  const removeFromCart = (
    cartId: string
  ) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          item.id !== cartId
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // ============================================================
  // INVENTORY DEDUCTION
  // ============================================================

  /**
   * IMPORTANT:
   *
   * All calculations are performed BEFORE setState.
   *
   * This prevents React 18 StrictMode from duplicating
   * inventory logs when updater functions are intentionally
   * invoked more than once during development.
   */
  const deductInventoryForOrder = (
    orderItems: OrderItem[],
    orderToken: string,
    staffUserId: number | null
  ) => {
    if (
      inventoryDeductionGuard.current.has(
        orderToken
      )
    ) {
      console.warn(
        `Inventory already deducted for order ${orderToken}. Skipping duplicate deduction.`
      );

      return;
    }

    // Mark immediately BEFORE any state updates.
    inventoryDeductionGuard.current.add(
      orderToken
    );

    const timestamp =
      new Date().toISOString();

    const userName = staffUserId
      ? 'Staff Barista'
      : 'Automated (Payment Confirmed)';

    const newLogs: InventoryLog[] = [];

    // ----------------------------------------------------------
    // MENU ITEM DEDUCTIONS
    // ----------------------------------------------------------

    const menuDeductions =
      new Map<number, number>();

    orderItems.forEach((oi) => {
      const current =
        menuDeductions.get(
          oi.menu_item_id
        ) || 0;

      menuDeductions.set(
        oi.menu_item_id,
        current + oi.quantity
      );
    });

    const menuLogs: InventoryLog[] =
      [];

    menuItems.forEach((menuItem) => {
      const totalQty =
        menuDeductions.get(
          menuItem.id
        ) || 0;

      if (
        totalQty > 0 &&
        menuItem.track_inventory
      ) {
        menuLogs.push({
          id:
            Date.now() +
            Math.floor(
              Math.random() * 100000
            ),

          user_id:
            staffUserId,

          user_name:
            userName,

          menu_item_id:
            menuItem.id,

          add_on_id: null,

          item_name:
            menuItem.name,

          change_type: 'sale',

          quantity_changed:
            -totalQty,

          notes:
            `Order #${orderToken} paid deduction`,

          created_at:
            timestamp,
        });
      }
    });

    // ----------------------------------------------------------
    // ADD-ON DEDUCTIONS
    // ----------------------------------------------------------

    const addOnDeductions =
      new Map<number, number>();

    orderItems.forEach((oi) => {
      (
        oi.customizations
          ?.add_ons || []
      ).forEach((addon) => {
        const current =
          addOnDeductions.get(
            addon.id
          ) || 0;

        addOnDeductions.set(
          addon.id,
          current + oi.quantity
        );
      });
    });

    const addOnLogs: InventoryLog[] =
      [];

    addOns.forEach((addon) => {
      const deductCount =
        addOnDeductions.get(
          addon.id
        ) || 0;

      if (
        deductCount > 0 &&
        addon.track_inventory
      ) {
        addOnLogs.push({
          id:
            Date.now() +
            Math.floor(
              Math.random() * 100000
            ),

          user_id:
            staffUserId,

          user_name:
            userName,

          menu_item_id:
            null,

          add_on_id:
            addon.id,

          item_name:
            addon.name,

          change_type: 'sale',

          quantity_changed:
            -deductCount,

          notes:
            `Order #${orderToken} add-on usage`,

          created_at:
            timestamp,
        });
      }
    });

    // ----------------------------------------------------------
    // BOTTLENECK DEDUCTIONS
    // ----------------------------------------------------------

    const bottleneckDeductions =
      new Map<
        string,
        number
      >();

    orderItems.forEach((oi) => {
      const size =
        oi.customizations
          ?.size;

      if (size === '16oz') {
        bottleneckDeductions.set(
          'cup-16oz',
          (bottleneckDeductions.get(
            'cup-16oz'
          ) || 0) + oi.quantity
        );
      }

      if (size === '22oz') {
        bottleneckDeductions.set(
          'cup-22oz',
          (bottleneckDeductions.get(
            'cup-22oz'
          ) || 0) + oi.quantity
        );
      }

      if (
        oi.menu_item_id === 801
      ) {
        bottleneckDeductions.set(
          'tapsilog-beef',
          (bottleneckDeductions.get(
            'tapsilog-beef'
          ) || 0) + oi.quantity
        );
      }

      if (
        [901, 902, 903].includes(
          oi.menu_item_id
        )
      ) {
        bottleneckDeductions.set(
          'party-tray-box',
          (bottleneckDeductions.get(
            'party-tray-box'
          ) || 0) + oi.quantity
        );
      }
    });

    // ----------------------------------------------------------
    // RAW INVENTORY / BOM DEDUCTIONS
    // ----------------------------------------------------------

    const inventoryDeductions =
      new Map<
        string,
        number
      >();

    const inventoryLogData: {
      menuItemId: number;
      itemName: string;
      size: string;
      inventoryItemId:
        | number
        | string;
      quantity: number;
      unit: string;
    }[] = [];

    orderItems.forEach((oi) => {
      const itemSize =
        oi.customizations?.size ||
        (oi as any).size ||
        '16oz';

      const matchingRules =
        recipeRules.filter(
          (r) =>
            r.menu_item_id ===
              oi.menu_item_id &&
            (
              r.variant_size.toLowerCase() ===
                itemSize.toLowerCase() ||
              r.variant_size.toLowerCase() ===
                'all' ||
              r.variant_size.toLowerCase() ===
                'all sizes' ||
              r.variant_size.toLowerCase() ===
                'regular'
            )
        );

      matchingRules.forEach(
        (rule) => {
          const deductUnits =
            rule.quantity_deducted *
            oi.quantity;

          const key = String(
            rule.inventory_item_id
          );

          inventoryDeductions.set(
            key,
            (inventoryDeductions.get(
              key
            ) || 0) +
              deductUnits
          );

          const targetItem =
            inventoryItems.find(
              (inv) =>
                String(inv.id) ===
                String(
                  rule.inventory_item_id
                )
            );

          if (targetItem) {
            inventoryLogData.push({
              menuItemId:
                oi.menu_item_id,

              itemName:
                `${targetItem.name} [Recipe: ${oi.item_name} ${itemSize}]`,

              size: itemSize,

              inventoryItemId:
                rule.inventory_item_id,

              quantity:
                deductUnits,

              unit:
                targetItem.unit,
            });
          }
        }
      );
    });

    // ----------------------------------------------------------
    // BUILD INVENTORY LOGS BEFORE setState
    // ----------------------------------------------------------

    newLogs.push(
      ...menuLogs,
      ...addOnLogs
    );

    inventoryLogData.forEach(
      (data, index) => {
        newLogs.push({
          id:
            Date.now() +
            Math.floor(
              Math.random() * 100000
            ) +
            index,

          user_id:
            staffUserId,

          user_name:
            userName,

          menu_item_id:
            data.menuItemId,

          add_on_id: null,

          item_name:
            data.itemName,

          change_type: 'sale',

          quantity_changed:
            -data.quantity,

          notes:
            `Order #${orderToken} BOM deduction: ${data.quantity} ${data.unit}/drink`,

          created_at:
            timestamp,
        });
      }
    );

    // ----------------------------------------------------------
    // APPLY PURE STATE UPDATES
    // ----------------------------------------------------------

    setMenuItems((prevMenu) =>
      prevMenu.map((menuItem) => {
        const totalQty =
          menuDeductions.get(
            menuItem.id
          ) || 0;

        if (
          totalQty > 0 &&
          menuItem.track_inventory
        ) {
          return {
            ...menuItem,
            stock_quantity:
              Math.max(
                0,
                menuItem.stock_quantity -
                  totalQty
              ),
          };
        }

        return menuItem;
      })
    );

    setAddOns((prevAddOns) =>
      prevAddOns.map((addon) => {
        const deductCount =
          addOnDeductions.get(
            addon.id
          ) || 0;

        if (
          deductCount > 0 &&
          addon.track_inventory
        ) {
          return {
            ...addon,
            stock_quantity:
              Math.max(
                0,
                addon.stock_quantity -
                  deductCount
              ),
          };
        }

        return addon;
      })
    );

    setBottlenecks(
      (prevBottlenecks) =>
        prevBottlenecks.map(
          (unit) => {
            const deduction =
              bottleneckDeductions.get(
                unit.id
              ) || 0;

            if (deduction > 0) {
              return {
                ...unit,
                current_stock:
                  Math.max(
                    0,
                    unit.current_stock -
                      deduction
                  ),
              };
            }

            return unit;
          }
        )
    );

    setInventoryItems(
      (prevInventory) =>
        prevInventory.map(
          (item) => {
            const deduction =
              inventoryDeductions.get(
                String(item.id)
              ) || 0;

            if (deduction > 0) {
              return {
                ...item,
                stock_quantity:
                  Math.max(
                    0,
                    item.stock_quantity -
                      deduction
                  ),
              };
            }

            return item;
          }
        )
    );

    if (newLogs.length > 0) {
      setInventoryLogs((prev) => [
        ...newLogs,
        ...prev,
      ]);
    }
  };

  // ============================================================
  // DYNAMIC INVENTORY CRUD
  // ============================================================

  const addInventoryItem = (
    item: Omit<InventoryItem, 'id'>
  ) => {
    const newItem: InventoryItem = {
      ...item,
      id: Date.now(),
      created_at:
        new Date().toISOString(),
    };

    setInventoryItems((prev) => [
      newItem,
      ...prev,
    ]);
  };

  const updateInventoryItem = (
    id: number | string,
    updates: Partial<InventoryItem>
  ) => {
    setInventoryItems((prev) =>
      prev.map((it) =>
        String(it.id) ===
        String(id)
          ? {
              ...it,
              ...updates,
              updated_at:
                new Date().toISOString(),
            }
          : it
      )
    );
  };

  const deleteInventoryItem = (
    id: number | string
  ) => {
    setInventoryItems((prev) =>
      prev.filter(
        (it) =>
          String(it.id) !==
          String(id)
      )
    );

    setRecipeRules((prev) =>
      prev.filter(
        (r) =>
          String(
            r.inventory_item_id
          ) !== String(id)
      )
    );
  };

  const restockInventoryItem = (
    id: number | string,
    qty: number,
    notes?: string
  ) => {
    const target =
      inventoryItems.find(
        (it) =>
          String(it.id) ===
          String(id)
      );

    if (!target) {
      return;
    }

    setInventoryItems((prev) =>
      prev.map((it) =>
        String(it.id) ===
        String(id)
          ? {
              ...it,
              stock_quantity:
                it.stock_quantity +
                qty,
              updated_at:
                new Date().toISOString(),
            }
          : it
      )
    );

    const auditLog: InventoryLog = {
      id:
        Date.now() +
        Math.floor(
          Math.random() * 1000
        ),

      user_id:
        adminSession?.user?.id ||
        1,

      user_name:
        adminSession?.user?.name ||
        'Administrator',

      menu_item_id: null,
      add_on_id: null,

      item_name: target.name,

      change_type: 'restock',

      quantity_changed: qty,

      notes:
        notes ||
        `Shipment restock +${qty} units via Admin Portal`,

      created_at:
        new Date().toISOString(),
    };

    setInventoryLogs((prev) => [
      auditLog,
      ...prev,
    ]);

    // Sync inventory restock to backend
    fetch(`/api/inventory/${id}/restock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: qty, notes }),
    }).catch(() => {});
  };

  // ============================================================
  // RECIPE / BOM
  // ============================================================

  const saveRecipeRulesForVariant = (
    menuItemId: number,
    variantSize: string,
    items: {
      inventory_item_id:
        | number
        | string;
      quantity_deducted: number;
    }[]
  ) => {
    setRecipeRules((prev) => {
      const preserved =
        prev.filter(
          (r) =>
            !(
              r.menu_item_id ===
                menuItemId &&
              r.variant_size.toLowerCase() ===
                variantSize.toLowerCase()
            )
        );

      const created =
        items.map(
          (it, idx) => ({
            id: `rec-${menuItemId}-${variantSize}-${Date.now()}-${idx}`,

            menu_item_id:
              menuItemId,

            variant_size:
              variantSize,

            inventory_item_id:
              it.inventory_item_id,

            quantity_deducted:
              it.quantity_deducted ||
              1,
          })
        );

      return [
        ...preserved,
        ...created,
      ];
    });
  };

  const deleteRecipeRule = (
    id: number | string
  ) => {
    setRecipeRules((prev) =>
      prev.filter(
        (r) =>
          String(r.id) !==
          String(id)
      )
    );
  };

  // ============================================================
  // STOCK AVAILABILITY
  // ============================================================

  const checkVariantAvailability = (
    menuItemId: number,
    size?: string
  ) => {
    const item =
      menuItems.find(
        (m) => m.id === menuItemId
      );

    if (
      !item ||
      !item.is_available
    ) {
      return {
        isAvailable: false,
        reason:
          'Item is currently disabled by store management.',
      };
    }

    const effectiveSize =
      size ||
      item.size ||
      '16oz';

    const matchingRules =
      recipeRules.filter(
        (r) =>
          r.menu_item_id ===
            menuItemId &&
          (
            r.variant_size.toLowerCase() ===
              effectiveSize.toLowerCase() ||
            r.variant_size.toLowerCase() ===
              'all' ||
            r.variant_size.toLowerCase() ===
              'all sizes' ||
            r.variant_size.toLowerCase() ===
              'regular'
          )
      );

    for (const rule of matchingRules) {
      const invItem =
        inventoryItems.find(
          (inv) =>
            String(inv.id) ===
            String(
              rule.inventory_item_id
            )
        );

      if (
        invItem &&
        invItem.stock_quantity <=
          0
      ) {
        return {
          isAvailable: false,
          missingItemName:
            invItem.name,
          reason:
            `Out of Stock: ${invItem.name} reserve is depleted (0 ${invItem.unit})`,
          requiredItemStock:
            invItem.stock_quantity,
        };
      }

      if (
        invItem &&
        invItem.stock_quantity <
          rule.quantity_deducted
      ) {
        return {
          isAvailable: false,
          missingItemName:
            invItem.name,
          reason:
            `Insufficient ${invItem.name}: Only ${invItem.stock_quantity} left (needs ${rule.quantity_deducted})`,
          requiredItemStock:
            invItem.stock_quantity,
        };
      }
    }

    return {
      isAvailable: true,
    };
  };

  const checkItemOverallAvailability = (
    menuItemId: number
  ) => {
    const item =
      menuItems.find(
        (m) => m.id === menuItemId
      );

    if (
      !item ||
      !item.is_available
    ) {
      return {
        isAvailable: false,
        outOfStockVariants: [],
        reason: 'Disabled',
      };
    }

    if (
      item.available_sizes &&
      item.available_sizes.length >
        0
    ) {
      const outOfStockVariants: string[] =
        [];

      let missingItemName:
        | string
        | undefined;

      for (const s of item.available_sizes) {
        const check =
          checkVariantAvailability(
            menuItemId,
            s.size
          );

        if (!check.isAvailable) {
          outOfStockVariants.push(
            s.size
          );

          if (
            !missingItemName &&
            check.missingItemName
          ) {
            missingItemName =
              check.missingItemName;
          }
        }
      }

      const allOut =
        outOfStockVariants.length ===
        item.available_sizes.length;

      return {
        isAvailable: !allOut,
        outOfStockVariants,
        missingItemName,
        reason: allOut
          ? 'All drink variants are currently out of stock due to raw packaging/supply bottlenecks.'
          : undefined,
      };
    }

    const check =
      checkVariantAvailability(
        menuItemId,
        item.size || 'Regular'
      );

    return {
      isAvailable:
        check.isAvailable,

      outOfStockVariants:
        check.isAvailable
          ? []
          : [item.size || 'Regular'],

      missingItemName:
        check.missingItemName,

      reason:
        check.reason,
    };
  };

  // ============================================================
  // PLACE ORDER
  // ============================================================

  const placeOrder = (
    paymentMethod: PaymentMethod,
    gcashReceiptPath?: string
  ): string => {
    // ----------------------------------------------------------
    // UNIQUE TRACKING TOKEN
    // ----------------------------------------------------------
    // Always check the latest persisted orders before accepting a
    // token. crypto.getRandomValues gives us a stronger source of
    // randomness than Math.random().
    const persistedOrders = (() => {
      try {
        const saved = localStorage.getItem('cp_orders');
        const parsed = saved ? JSON.parse(saved) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    })();

    const usedTrackingTokens = new Set<string>([
      ...orders.map((order) => String(order.tracking_token || '')),
      ...persistedOrders.map((order: any) =>
        String(order?.tracking_token || '')
      ),
    ]);

    let trackingToken = '';

    for (let attempt = 0; attempt < 100; attempt += 1) {
      const randomBytes = new Uint32Array(1);

      if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        crypto.getRandomValues(randomBytes);
      } else {
        randomBytes[0] = Math.floor(Math.random() * 0xffffffff);
      }

      const candidate = String(
        100000 + (randomBytes[0] % 900000)
      );

      if (!usedTrackingTokens.has(candidate)) {
        trackingToken = candidate;
        break;
      }
    }

    // Extremely unlikely fallback if all generated candidates collide.
    if (!trackingToken) {
      let candidate = String(
        100000 + (Date.now() % 900000)
      );

      while (usedTrackingTokens.has(candidate)) {
        candidate = String(
          100000 + ((Number(candidate) - 99999) % 900000)
        );
      }

      trackingToken = candidate;
    }

    const subtotal =
      cart.reduce(
        (acc, curr) =>
          acc +
          curr.price *
            curr.quantity,
        0
      );

    const isOnlinePaid =
      paymentMethod === 'online';

    // ----------------------------------------------------------
    // UNIQUE ORDER NUMBER
    // ----------------------------------------------------------
    // React state can be stale when two tabs place orders quickly.
    // Use the latest localStorage copy plus a shared counter instead
    // of calculating only from the current React `orders` state.
    const ORDER_COUNTER_KEY = 'cp_order_number_counter';
    const ORDER_RESERVATION_KEY = 'cp_order_number_reservation';
    const reservationOwner = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`;

    const persistedOrderNumbers = persistedOrders
      .map((order: any) => Number(order?.order_number))
      .filter((number: number) => Number.isFinite(number));

    const stateOrderNumbers = orders
      .map((order) => Number(order.order_number))
      .filter((number) => Number.isFinite(number));

    const storedCounter = Number(
      localStorage.getItem(ORDER_COUNTER_KEY) || 1040
    );

    const highestKnownOrderNumber = Math.max(
      1040,
      storedCounter,
      ...persistedOrderNumbers,
      ...stateOrderNumbers
    );

    let nextOrderNumber = highestKnownOrderNumber + 1;

    // Reserve the number with an owner marker. If another tab wins
    // the same reservation race, move to the next number and retry.
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const reservation = JSON.stringify({
        number: nextOrderNumber,
        owner: reservationOwner,
      });

      localStorage.setItem(
        ORDER_RESERVATION_KEY,
        reservation
      );

      const confirmedReservation = (() => {
        try {
          return JSON.parse(
            localStorage.getItem(ORDER_RESERVATION_KEY) || '{}'
          );
        } catch {
          return {};
        }
      })();

      if (
        confirmedReservation.number === nextOrderNumber &&
        confirmedReservation.owner === reservationOwner
      ) {
        localStorage.setItem(
          ORDER_COUNTER_KEY,
          String(nextOrderNumber)
        );
        break;
      }

      nextOrderNumber += 1;
    }

    const effectiveName =
      customerName.trim() ||
      'Guest';

    saveCustomerNameAtCheckout(
      effectiveName
    );

    const newOrder: Order = {
      id: Date.now(),

      order_number:
        nextOrderNumber,

      guest_session_id:
        guestSessionId,

      tracking_token:
        trackingToken,

      customer_name:
        effectiveName,

      order_type:
        orderType,

      delivery_details:
        orderType === 'delivery'
          ? deliveryDetails ||
            undefined
          : undefined,

      total_amount:
        subtotal,

      payment_method:
        paymentMethod,

      payment_status:
        'unpaid',

      order_status:
        'pending',

      gcash_receipt_path:
        isOnlinePaid
          ? gcashReceiptPath ||
            undefined
          : undefined,

      items: [...cart],

      created_at:
        new Date().toISOString(),

      updated_at:
        new Date().toISOString(),
    };

    setOrders((prev) => [
      newOrder,
      ...prev,
    ]);

    // Dispatch asynchronous order creation to the Railway Express backend
    // so all other devices (KDS, Staff, Admin) receive this order instantly
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    }).catch(() => {
      // Offline fallback: order remains safely stored in local state
    });

    // ----------------------------------------------------------
    // REAL-TIME STAFF EVENT
    // ----------------------------------------------------------

    const broadcastEvent: EchoBroadcastEvent =
      {
        id:
          'echo-' +
          Math.random()
            .toString(36)
            .substring(2, 9),

        event:
          'App\\Events\\OrderPlaced',

        channel:
          'private-staff.orders',

        timestamp:
          new Date().toISOString(),

        payload: {
          order_id:
            newOrder.id,

          tracking_token:
            trackingToken,

          customer_name:
            effectiveName,

          order_type:
            orderType,

          total_amount:
            subtotal,

          items_count:
            cart.reduce(
              (acc, curr) =>
                acc +
                curr.quantity,
              0
            ),

          payment_method:
            paymentMethod,

          payment_status:
            'unpaid',

          items: cart.map(
            (i) => ({
              name:
                i.item_name,

              quantity:
                i.quantity,

              size:
                i.customizations
                  .size ||
                undefined,
            })
          ),
        },
      };

    setEchoEvents((prev) => [
      broadcastEvent,
      ...prev.slice(0, 49),
    ]);

    setLatestBroadcast(
      broadcastEvent
    );

    if (soundEnabled) {
      playOrderChime();
    }

    clearCart();

    setActiveTrackingToken(
      trackingToken
    );

    setCustomerScreen(8);

    return trackingToken;
  };

  // ============================================================
  // CUSTOMER CANCELLATION
  // ============================================================

  const requestOrderCancellation = (
    token: string,
    reason: string
  ) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (
          ord.tracking_token ===
            token &&
          ord.order_status ===
            'pending'
        ) {
          return {
            ...ord,

            cancellation_requested:
              true,

            cancellation_reason:
              reason ||
              'Customer requested via mobile app',

            updated_at:
              new Date().toISOString(),
          };
        }

        return ord;
      })
    );
  };

  const viewOrderTracker = (
    token: string
  ) => {
    setActiveTrackingToken(
      token
    );

    setCustomerScreen(8);
  };

  // ============================================================
  // STAFF ORDER VERIFICATION
  // ============================================================

  const verifyAndAcceptOrder = (
    orderId: number
  ) => {
    const targetOrder =
      orders.find(
        (ord) =>
          ord.id === orderId
      );

    if (!targetOrder) {
      return;
    }

    if (
      targetOrder.payment_status !==
      'paid'
    ) {
      deductInventoryForOrder(
        targetOrder.items,
        targetOrder.tracking_token,
        2
      );
    }

    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              payment_status:
                'paid',
              order_status:
                'preparing',
              updated_at:
                new Date().toISOString(),
            }
          : ord
      )
    );

    // Sync order payment verification to backend
    fetch(`/api/orders/${orderId}/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => {});
  };

  const rejectOrder = (
    orderId: number,
    reason?: string
  ) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,

              order_status:
                'cancelled',

              cancellation_reason:
                reason ||
                'Order rejected by staff (Invalid payment or proof of payment)',

              updated_at:
                new Date().toISOString(),
            }
          : ord
      )
    );

    // Sync rejection to backend
    fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled', reason }),
    }).catch(() => {});
  };

  const approveCashPayment = (
    orderId: number
  ) => {
    verifyAndAcceptOrder(
      orderId
    );
  };

  // ============================================================
  // STAFF STATUS
  // ============================================================

  const updateOrderStatus = (
    orderId: number,
    status: OrderStatus
  ) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              order_status:
                status,
              updated_at:
                new Date().toISOString(),
            }
          : ord
      )
    );

    // Sync status change to backend
    fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => {});
  };

  // ============================================================
  // STAFF CANCELLATION
  // ============================================================

  const handleCancellation = (
    orderId: number,
    approve: boolean
  ) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (
          ord.id !== orderId
        ) {
          return ord;
        }

        if (approve) {
          return {
            ...ord,

            order_status:
              'cancelled',

            cancellation_requested:
              false,

            updated_at:
              new Date().toISOString(),
          };
        }

        return {
          ...ord,

          cancellation_requested:
            false,

          updated_at:
            new Date().toISOString(),
        };
      })
    );
  };

  // ============================================================
  // STAFF MANAGEMENT
  // ============================================================

  const addStaffUser = (
    name: string,
    email: string,
    role: Role = 'staff',
    password?: string
  ): {
    success: boolean;
    user?: User;
    error?: string;
  } => {
    const trimmedEmail =
      email.trim().toLowerCase();

    const existing =
      staffUsers.find(
        (u) =>
          u.email.toLowerCase() ===
          trimmedEmail
      );

    if (existing) {
      return {
        success: false,
        error:
          'A user with this email address already exists.',
      };
    }

    const newUser: User = {
      id: Date.now(),
      name: name.trim(),
      email: trimmedEmail,
      role,
      is_active: true,
      password:
        password || 'pepita123',
      created_at:
        new Date()
          .toISOString()
          .split('T')[0],
      updated_at:
        new Date()
          .toISOString()
          .split('T')[0],
    };

    setStaffUsers((prev) => [
      newUser,
      ...prev,
    ]);

    fetch('/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type':
          'application/json',
      },
      body: JSON.stringify(
        newUser
      ),
    }).catch(() => {});

    return {
      success: true,
      user: newUser,
    };
  };

  const updateStaffUser = (
    id: number,
    updates: Partial<User>
  ): {
    success: boolean;
    error?: string;
  } => {
    if (updates.email) {
      const emailLower =
        updates.email
          .trim()
          .toLowerCase();

      const existing =
        staffUsers.find(
          (u) =>
            u.id !== id &&
            u.email.toLowerCase() ===
              emailLower
        );

      if (existing) {
        return {
          success: false,
          error:
            'This email is already taken by another account.',
        };
      }
    }

    setStaffUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? {
              ...u,
              ...updates,
              updated_at:
                new Date().toISOString(),
            }
          : u
      )
    );

    if (updates.password) {
      if (
        staffSession &&
        staffSession.user.id === id
      ) {
        localStorage.removeItem(
          'cp_staff_session'
        );

        setStaffSession(null);
      }
    }

    fetch(
      `/api/admin/users/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify(
          updates
        ),
      }
    ).catch(() => {});

    return {
      success: true,
    };
  };

  const toggleStaffStatus = (
    id: number
  ): {
    success: boolean;
    message?: string;
    error?: string;
  } => {
    if (
      adminSession &&
      adminSession.user.id === id
    ) {
      return {
        success: false,
        error:
          'Security Guard: You cannot deactivate your own currently active administrator account.',
      };
    }

    const targetUser =
      staffUsers.find(
        (u) => u.id === id
      );

    if (!targetUser) {
      return {
        success: false,
        error:
          'Account not found.',
      };
    }

    const nextStatus =
      targetUser.is_active ===
      false
        ? true
        : false;

    setStaffUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? {
              ...u,
              is_active:
                nextStatus,
              updated_at:
                new Date().toISOString(),
            }
          : u
      )
    );

    if (!nextStatus) {
      if (
        staffSession &&
        staffSession.user.id === id
      ) {
        localStorage.removeItem(
          'cp_staff_session'
        );

        setStaffSession(null);
      }
    }

    fetch(
      `/api/admin/users/${id}/toggle-status`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify({
          is_active:
            nextStatus,
        }),
      }
    ).catch(() => {});

    return {
      success: true,
      message: `Account for ${targetUser.name} has been ${
        nextStatus
          ? 'reactivated'
          : 'deactivated'
      } successfully.`,
    };
  };

  const deleteStaffUser = (
    id: number
  ): {
    success: boolean;
    error?: string;
  } => {
    if (
      adminSession &&
      adminSession.user.id === id
    ) {
      return {
        success: false,
        error:
          'Security Guard: You cannot delete your own currently active administrator account.',
      };
    }

    const target =
      staffUsers.find(
        (u) => u.id === id
      );

    if (!target) {
      return {
        success: false,
        error:
          'Account not found.',
      };
    }

    setStaffUsers((prev) =>
      prev.filter(
        (u) => u.id !== id
      )
    );

    if (
      staffSession &&
      staffSession.user.id === id
    ) {
      localStorage.removeItem(
        'cp_staff_session'
      );

      setStaffSession(null);
    }

    fetch(
      `/api/admin/users/${id}`,
      {
        method: 'DELETE',
      }
    ).catch(() => {});

    return {
      success: true,
    };
  };

  const resetEmployeePassword =
    async (
      userId: number,
      newPassword: string
    ): Promise<{
      success: boolean;
      message?: string;
      error?: string;
    }> => {
      const targetUser =
        staffUsers.find(
          (u) => u.id === userId
        );

      if (!targetUser) {
        return {
          success: false,
          error:
            'Employee account not found.',
        };
      }

      if (
        !newPassword ||
        newPassword.length < 8
      ) {
        return {
          success: false,
          error:
            'Password must be at least 8 characters long.',
        };
      }

      setStaffUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                password:
                  newPassword,
                updated_at:
                  new Date().toISOString(),
              }
            : u
        )
      );

      if (
        staffSession &&
        staffSession.user.id ===
          userId
      ) {
        localStorage.removeItem(
          'cp_staff_session'
        );

        setStaffSession(null);
      }

      return {
        success: true,
        message: `Password for ${targetUser.name} has been reset successfully. Existing Sanctum tokens revoked.`,
      };
    };

  // ============================================================
  // MENU MANAGEMENT
  // ============================================================

  const addMenuItem = (
    item: Omit<MenuItem, 'id'>
  ) => {
    const newItem: MenuItem = {
      ...item,
      id: Date.now(),
    };

    setMenuItems((prev) => [
      newItem,
      ...prev,
    ]);
  };

  const updateMenuItem = (
    id: number,
    updates: Partial<MenuItem>
  ) => {
    setMenuItems((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              ...updates,
            }
          : m
      )
    );
  };

  const deleteMenuItem = (
    id: number
  ) => {
    setMenuItems((prev) =>
      prev.filter(
        (m) => m.id !== id
      )
    );

    setRecipeRules((prev) =>
      prev.filter(
        (r) =>
          r.menu_item_id !== id
      )
    );
  };

  const toggleMenuItemAvailability =
    (id: number) => {
      setMenuItems((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                is_available:
                  !m.is_available,
              }
            : m
        )
      );
    };

  // ============================================================
  // LEGACY STOCK RESTOCK
  // ============================================================

  const restockUnit = (
    unitId: string,
    qty: number,
    notes: string
  ) => {
    const target =
      bottlenecks.find(
        (b) => b.id === unitId
      );

    setBottlenecks((prev) =>
      prev.map((u) =>
        u.id === unitId
          ? {
              ...u,
              current_stock:
                u.current_stock +
                qty,
            }
          : u
      )
    );

    setInventoryLogs((prev) => [
      {
        id: Date.now(),
        user_id: 1,
        user_name:
          'Administrator',
        menu_item_id: null,
        add_on_id: null,
        item_name:
          target?.name ||
          unitId,
        change_type:
          'restock',
        quantity_changed:
          qty,
        notes:
          notes ||
          'Admin unit restock',
        created_at:
          new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const restockMenuItem = (
    itemId: number,
    qty: number,
    notes: string
  ) => {
    const target =
      menuItems.find(
        (m) => m.id === itemId
      );

    setMenuItems((prev) =>
      prev.map((m) =>
        m.id === itemId
          ? {
              ...m,
              stock_quantity:
                m.stock_quantity +
                qty,
            }
          : m
      )
    );

    setInventoryLogs((prev) => [
      {
        id: Date.now(),
        user_id: 1,
        user_name:
          'Administrator',
        menu_item_id:
          itemId,
        add_on_id: null,
        item_name:
          target?.name ||
          'Menu Item',
        change_type:
          'restock',
        quantity_changed:
          qty,
        notes:
          notes ||
          'Batch inventory restock',
        created_at:
          new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  // ============================================================
  // ECHO TEST BROADCAST ACTION
  // ============================================================

  const triggerTestEchoBroadcast =
    () => {
      const randomToken =
        '' +
        Math.floor(
          100000 +
            Math.random() *
              900000
        );

      const mockNames = [
        'Bianca De Leon',
        'Rafael Cruz',
        'Alyssa Mendoza',
        'Juan Carlos',
      ];

      const mockCustName =
        mockNames[
          Math.floor(
            Math.random() *
              mockNames.length
          )
        ];

      const testOrder: Order = {
        id: Date.now(),

        tracking_token:
          randomToken,

        customer_name:
          mockCustName,

        order_type:
          'dine-in',

        total_amount: 179.0,

        payment_method:
          'online',

        payment_status:
          'paid',

        order_status:
          'preparing',

        items: [
          {
            id:
              'test-item-' +
              Date.now(),

            menu_item_id: 201,

            item_name:
              'Spanish Latte (Sub-oat)',

            quantity: 1,

            price: 179.0,

            customizations: {
              size: '22oz',
              milk_type: 'oat',

              add_ons: [
                {
                  id: 1,
                  name:
                    'Extra expresso shot',
                  price: 40,
                },
              ],

              comments:
                'Less ice please',
            },
          },
        ],

        created_at:
          new Date().toISOString(),

        updated_at:
          new Date().toISOString(),
      };

      setOrders((prev) => [
        testOrder,
        ...prev,
      ]);

      const broadcastEvent: EchoBroadcastEvent =
        {
          id:
            'echo-test-' +
            Date.now(),

          event:
            'App\\Events\\OrderPlaced',

          channel:
            'private-staff.orders',

          timestamp:
            new Date().toISOString(),

          payload: {
            order_id:
              testOrder.id,

            tracking_token:
              randomToken,

            customer_name:
              mockCustName,

            order_type:
              'dine-in',

            total_amount:
              179.0,

            items_count: 1,

            payment_method:
              'online',

            payment_status:
              'paid',

            items: [
              {
                name:
                  'Spanish Latte (Sub-oat)',
                quantity: 1,
                size: '22oz',
              },
            ],
          },
        };

      setEchoEvents((prev) => [
        broadcastEvent,
        ...prev.slice(0, 49),
      ]);

      setLatestBroadcast(
        broadcastEvent
      );

      if (soundEnabled) {
        playOrderChime();
      }
    };

  // ============================================================
  // RESET
  // ============================================================

  const resetToSeederData =
    () => {
      localStorage.removeItem(
        'cp_menu_items'
      );

      localStorage.removeItem(
        'cp_addons'
      );

      localStorage.removeItem(
        'cp_bottlenecks'
      );

      localStorage.removeItem(
        'cp_orders'
      );

      localStorage.removeItem(
        'cp_inv_logs'
      );


      localStorage.removeItem(
        'cp_inventory_items_v2'
      );

      localStorage.removeItem(
        'cp_recipe_rules_v2'
      );

      setMenuItems(
        RAW_MENU_ITEMS
      );

      setAddOns(
        INITIAL_ADDONS
      );

      setBottlenecks(
        INITIAL_BOTTLENECK_UNITS
      );

      setInventoryItems(
        INITIAL_INVENTORY_ITEMS
      );

      setRecipeRules(
        INITIAL_RECIPE_RULES
      );


      setCart([]);

      setCustomerScreen(1);

      setDeliveryDetails(null);

      inventoryDeductionGuard.current.clear();
    };

  // ============================================================
  // PROVIDER
  // ============================================================

  return (
    <CafeContext.Provider
      value={{
        viewMode,
        setViewMode,

        customerScreen,
        setCustomerScreen,

        currentPath,
        navigate,

        staffSession,
        adminSession,
        currentAuthSession,

        loginStaff,
        logoutStaff,

        loginAdmin,
        logoutAdmin,

        loginUnified,
        logoutUnified,

        resetEmployeePassword,

        authRedirectNotice,
        setAuthRedirectNotice,

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

        // NO TABLES

        orders,
        staffUsers,
        inventoryLogs,

        guestSessionId,

        customerName,
        setCustomerName,
        saveCustomerNameAtCheckout,

        customerOrders,

        orderType,

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
        toggleStaffStatus,

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

        categoriesObj,
        addCategory,
        updateCategory,
        deleteCategory,
        reorderCategories,

        hasUnsavedChanges,
        unsavedGuards,

        registerUnsavedGuard,
        unregisterUnsavedGuard,
        confirmLeaveGuard,

        lowStockItemsCount,
        lowStockAlerts,

        resetToSeederData,
      }}
    >
      {children}
    </CafeContext.Provider>
  );
};

export const useCafe =
  () => {
    const context =
      useContext(CafeContext);

    if (!context) {
      throw new Error(
        'useCafe must be used within a CafeProvider'
      );
    }

    return context;
  };