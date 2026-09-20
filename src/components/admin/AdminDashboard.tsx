import React, { useState, useMemo } from 'react';
import { useCafe } from '../../context/CafeContext';
import {
  ShieldCheck,
  TrendingUp,
  Users,
  Coffee,
  Package,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  Calendar,
  Layers,
  ArrowUpRight,
  Sparkles,
  KeyRound,
  LogOut,
  Menu,
  X,
  User,
} from 'lucide-react';
import { User as UserType, MenuItem, Role } from '../../types/cafe';
import { SpatieRolesTab } from './SpatieRolesTab';

export const AdminDashboard: React.FC = () => {
  const {
    menuItems,
    bottlenecks,
    staffUsers,
    orders,
    inventoryLogs,
    addStaffUser,
    updateStaffUser,
    deleteStaffUser,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleMenuItemAvailability,
    restockUnit,
    restockMenuItem,
    adminSession,
    logoutAdmin,
    currentPath,
    navigate,
  } = useCafe();

  const [activeTab, setActiveTab] = useState<'analytics' | 'staff' | 'roles' | 'products' | 'inventory'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('inventory')) return 'inventory';
      if (path.includes('products') || path.includes('categories')) return 'products';
      if (path.includes('staff')) return 'staff';
      if (path.includes('roles')) return 'roles';
      if (path.includes('analytics')) return 'analytics';
    }
    return 'analytics';
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Analytics Date Filter
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'all'>('all');

  // Staff Form State
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<number | null>(null);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState<Role>('staff');

  // Product Form State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('Signature Blend');
  const [productDesc, setProductDesc] = useState('');
  const [productPrice, setProductPrice] = useState<number>(130);
  const [productStock, setProductStock] = useState<number>(50);
  const [productSize, setProductSize] = useState<string>('16oz');

  // Restock Modal State
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockTargetUnitId, setRestockTargetUnitId] = useState<string | null>(null);
  const [restockTargetItemId, setRestockTargetItemId] = useState<number | null>(null);
  const [restockQty, setRestockQty] = useState<number>(50);
  const [restockNotes, setRestockNotes] = useState<string>('Batch shipment restock');

  // Calculate Low Stock Alerts
  const lowStockBottlenecks = bottlenecks.filter(
    (b) => b.current_stock <= b.minimum_threshold
  );
  const lowStockMenuItems = menuItems.filter(
    (m) => m.track_inventory && m.stock_quantity <= 15
  );

  // Sales Reports Calculations
  const filteredOrders = useMemo(() => {
    const now = Date.now();
    return orders.filter((order) => {
      if (order.order_status === 'cancelled') return false;
      const orderTime = new Date(order.created_at).getTime();

      if (dateRange === 'today') {
        return now - orderTime < 1000 * 60 * 60 * 24;
      }
      if (dateRange === '7days') {
        return now - orderTime < 1000 * 60 * 60 * 24 * 7;
      }
      if (dateRange === '30days') {
        return now - orderTime < 1000 * 60 * 60 * 24 * 30;
      }
      return true;
    });
  }, [orders, dateRange]);

  const totalRevenue = filteredOrders
    .filter((o) => o.payment_status === 'paid')
    .reduce((sum, o) => sum + o.total_amount, 0);

  const totalOrdersCount = filteredOrders.length;

  const totalUnitsSold = filteredOrders.reduce((sum, o) => {
    return sum + o.items.reduce((acc, it) => acc + it.quantity, 0);
  }, 0);

  const avgOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

  // Best Selling Items Calculation
  const bestSellers = useMemo(() => {
    const counts: Record<string, { name: string; qty: number; revenue: number }> = {};

    filteredOrders.forEach((o) => {
      o.items.forEach((it) => {
        if (!counts[it.item_name]) {
          counts[it.item_name] = { name: it.item_name, qty: 0, revenue: 0 };
        }
        counts[it.item_name].qty += it.quantity;
        counts[it.item_name].revenue += it.quantity * it.price;
      });
    });

    return Object.values(counts)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [filteredOrders]);

  // Handlers
  const handleSaveStaff = () => {
    if (!staffName || !staffEmail) return;
    if (editingStaffId) {
      updateStaffUser(editingStaffId, { name: staffName, email: staffEmail, role: staffRole });
    } else {
      addStaffUser(staffName, staffEmail, staffRole);
    }
    setShowStaffModal(false);
    setStaffName('');
    setStaffEmail('');
    setEditingStaffId(null);
  };

  const handleOpenStaffEdit = (staff: UserType) => {
    setEditingStaffId(staff.id);
    setStaffName(staff.name);
    setStaffEmail(staff.email);
    setStaffRole(staff.role);
    setShowStaffModal(true);
  };

  const handleSaveProduct = () => {
    if (!productName || !productPrice) return;
    if (editingProductId) {
      updateMenuItem(editingProductId, {
        name: productName,
        category: productCategory,
        description: productDesc,
        price: productPrice,
        stock_quantity: productStock,
        size: productSize as any,
      });
    } else {
      addMenuItem({
        name: productName,
        category: productCategory,
        description: productDesc,
        price: productPrice,
        stock_quantity: productStock,
        size: productSize as any,
        milk_type: 'regular',
        image_path: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600',
        track_inventory: true,
        is_available: true,
      });
    }
    setShowProductModal(false);
    setEditingProductId(null);
  };

  const handleOpenProductEdit = (item: MenuItem) => {
    setEditingProductId(item.id);
    setProductName(item.name);
    setProductCategory(item.category);
    setProductDesc(item.description);
    setProductPrice(item.price);
    setProductStock(item.stock_quantity);
    setProductSize(item.size || '16oz');
    setShowProductModal(true);
  };

  const handleExecuteRestock = () => {
    if (restockTargetUnitId) {
      restockUnit(restockTargetUnitId, restockQty, restockNotes);
    } else if (restockTargetItemId) {
      restockMenuItem(restockTargetItemId, restockQty, restockNotes);
    }
    setShowRestockModal(false);
    setRestockTargetUnitId(null);
    setRestockTargetItemId(null);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2B231F] pb-16">
      {/* Top Banner */}
      <div className="bg-[#F4EFEB] border-b border-[#E6DDD4] px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* iPad/Tablet Collapsible Menu Toggle */}
            <button
              type="button"
              id="admin-drawer-toggle"
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="lg:hidden min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-white border border-[#E6DDD4] text-[#5C4033] hover:bg-[#EFE8E1] transition-colors flex items-center justify-center cursor-pointer shadow-xs"
              aria-label="Toggle Navigation Drawer"
            >
              {isDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#5C4033] text-[#FDFBF7] flex items-center justify-center shadow-sm shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#FDFBF7]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-xl font-bold text-[#2B231F]">Administrator Control Panel</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#5C4033] text-[#FDFBF7] font-bold">
                  Owner Portal
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 font-mono font-bold border border-rose-300">
                  role:admin
                </span>
              </div>
              <p className="text-xs text-[#8C7A6B]">
                Staff credentials CRUD, product catalog, bottleneck inventory, and sales analytics.
              </p>
            </div>
          </div>

          {/* Top Actions: Low stock alert, Admin profile, Logout */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Low Stock Warning Indicator */}
            {(lowStockBottlenecks.length > 0 || lowStockMenuItems.length > 0) && (
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{lowStockBottlenecks.length + lowStockMenuItems.length} Alert</span>
              </div>
            )}

            {/* Admin identity */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white border border-[#E6DDD4] rounded-xl text-xs text-[#5C4033]">
              <User className="w-3.5 h-3.5 text-[#8C7A6B]" />
              <span className="font-semibold">{adminSession?.user.name || 'Store Owner'}</span>
            </div>

            {/* Prominent Admin Logout Button */}
            <button
              type="button"
              id="admin-logout-btn"
              onClick={() => logoutAdmin()}
              className="min-h-[44px] px-3.5 py-2 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-800 border border-rose-300 font-bold rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
              title="Revoke Sanctum token and return to Admin Login"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>Admin Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* iPad / Tablet Slide-out Drawer Overlay */}
      {isDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-[#FDFBF7] h-full shadow-2xl p-5 flex flex-col justify-between border-r border-[#E6DDD4] z-50 animate-in slide-in-from-left duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EFE8E1]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#5C4033]" />
                  <span className="font-bold text-sm text-[#2B231F]">Admin Navigation</span>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 text-stone-500 hover:text-stone-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1.5">
                {[
                  { id: 'analytics', label: 'Sales Reports & Analytics', icon: TrendingUp },
                  { id: 'staff', label: 'Staff Accounts CRUD', icon: Users },
                  { id: 'roles', label: 'Roles & Permissions (Spatie)', icon: KeyRound },
                  { id: 'products', label: 'Menu Catalog Management', icon: Coffee },
                  { id: 'inventory', label: 'Unit Bottlenecks & Logs', icon: Package },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        navigate(`/admin/${tab.id}`);
                        setIsDrawerOpen(false);
                      }}
                      className={`w-full min-h-[44px] flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors ${
                        isActive
                          ? 'bg-[#5C4033] text-[#FDFBF7] shadow-sm'
                          : 'bg-white hover:bg-[#EFE8E1] text-[#736357] border border-[#E6DDD4]/60'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-[#EFE8E1] space-y-2">
              <div className="text-[11px] text-[#8C7A6B]">
                Logged in as <strong className="text-[#2B231F]">{adminSession?.user.name || 'Admin'}</strong>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  logoutAdmin();
                }}
                className="w-full min-h-[44px] py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-rose-300"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Logout Session</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        {/* Navigation Tabs (Desktop / iPad Landscape) */}
        <div className="flex items-center gap-2 border-b border-[#EFE8E1] pb-3 overflow-x-auto no-scrollbar">
          {[
            { id: 'analytics', label: 'Sales Reports & Analytics', icon: TrendingUp },
            { id: 'staff', label: 'Staff Accounts CRUD', icon: Users },
            { id: 'roles', label: 'Roles & Permissions (Spatie)', icon: KeyRound },
            { id: 'products', label: 'Menu Catalog Management', icon: Coffee },
            { id: 'inventory', label: 'Unit Bottlenecks & Logs', icon: Package },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  navigate(`/admin/${tab.id}`);
                }}
                className={`min-h-[44px] flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-[#5C4033] text-[#FDFBF7] shadow-sm'
                    : 'bg-[#F4EFEB] text-[#736357] hover:bg-[#E6DDD4]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: SALES REPORTS & ANALYTICS */}
        {/* ========================================================================= */}
        {activeTab === 'analytics' && (
          <div className="mt-6 space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F4EFEB] p-3.5 rounded-2xl border border-[#E6DDD4]">
              <span className="text-xs font-bold text-[#5C4033] flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>Filter Reporting Period</span>
              </span>
              <div className="flex gap-1.5">
                {[
                  { id: 'today', label: 'Today' },
                  { id: '7days', label: 'Last 7 Days' },
                  { id: '30days', label: 'Last 30 Days' },
                  { id: 'all', label: 'All Time' },
                ].map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDateRange(d.id as any)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                      dateRange === d.id
                        ? 'bg-[#5C4033] text-[#FDFBF7]'
                        : 'bg-[#FDFBF7] text-[#736357] hover:bg-white'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#FDFBF7] p-5 rounded-3xl border border-[#EFE8E1] shadow-xs">
                <span className="text-xs text-[#8C7A6B]">Total Paid Revenue</span>
                <p className="font-display text-2xl font-bold text-[#5C4033] mt-1">
                  ₱{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[10px] text-emerald-700 font-semibold mt-1 inline-block">
                  Verified payments only
                </span>
              </div>

              <div className="bg-[#FDFBF7] p-5 rounded-3xl border border-[#EFE8E1] shadow-xs">
                <span className="text-xs text-[#8C7A6B]">Total Orders Placed</span>
                <p className="font-display text-2xl font-bold text-[#2B231F] mt-1">
                  {totalOrdersCount}
                </p>
                <span className="text-[10px] text-[#8C7A6B] mt-1 inline-block">
                  Dine-in & Take-out combined
                </span>
              </div>

              <div className="bg-[#FDFBF7] p-5 rounded-3xl border border-[#EFE8E1] shadow-xs">
                <span className="text-xs text-[#8C7A6B]">Total Units Sold</span>
                <p className="font-display text-2xl font-bold text-[#2B231F] mt-1">
                  {totalUnitsSold} pcs
                </p>
                <span className="text-[10px] text-[#8C7A6B] mt-1 inline-block">
                  Beverages, bowls & trays
                </span>
              </div>

              <div className="bg-[#FDFBF7] p-5 rounded-3xl border border-[#EFE8E1] shadow-xs">
                <span className="text-xs text-[#8C7A6B]">Average Order Value</span>
                <p className="font-display text-2xl font-bold text-[#5C4033] mt-1">
                  ₱{avgOrderValue.toFixed(2)}
                </p>
                <span className="text-[10px] text-[#8C7A6B] mt-1 inline-block">
                  Per customer check
                </span>
              </div>
            </div>

            {/* Best Selling Products Table */}
            <div className="bg-[#FDFBF7] p-6 rounded-3xl border border-[#EFE8E1] shadow-xs">
              <h3 className="font-display text-base font-bold text-[#2B231F] mb-4 flex items-center justify-between">
                <span>Top 5 Best-Selling Items</span>
                <Sparkles className="w-4 h-4 text-[#5C4033]" />
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[#EFE8E1] text-[#8C7A6B] uppercase tracking-wider text-[10px]">
                      <th className="pb-3 font-semibold">Rank</th>
                      <th className="pb-3 font-semibold">Product Name</th>
                      <th className="pb-3 font-semibold text-right">Units Sold</th>
                      <th className="pb-3 font-semibold text-right">Gross Sales</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4EFEB]">
                    {bestSellers.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#F4EFEB]/50">
                        <td className="py-3 font-bold text-[#5C4033]">#{idx + 1}</td>
                        <td className="py-3 font-bold text-[#2B231F]">{item.name}</td>
                        <td className="py-3 text-right font-mono font-bold text-[#2B231F]">
                          {item.qty}
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-[#5C4033]">
                          ₱{item.revenue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    {bestSellers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-[#8C7A6B]">
                          No sales data recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: STAFF ACCOUNT CRUD */}
        {/* ========================================================================= */}
        {activeTab === 'staff' && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-[#2B231F]">
                  Staff & Barista Accounts
                </h3>
                <p className="text-xs text-[#8C7A6B]">
                  Manage authorized users for POS order processing and status advancement.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingStaffId(null);
                  setStaffName('');
                  setStaffEmail('');
                  setStaffRole('staff');
                  setShowStaffModal(true);
                }}
                className="px-4 py-2 bg-[#5C4033] text-[#FDFBF7] text-xs font-bold rounded-full shadow-xs flex items-center gap-1.5 hover:bg-[#4A3328]"
              >
                <Plus className="w-4 h-4" />
                <span>Add Staff Member</span>
              </button>
            </div>

            <div className="bg-[#FDFBF7] rounded-3xl border border-[#EFE8E1] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-[#F4EFEB] border-b border-[#E6DDD4] text-[#8C7A6B] uppercase tracking-wider text-[10px]">
                      <th className="py-3.5 px-4 font-semibold">User Name</th>
                      <th className="py-3.5 px-4 font-semibold">Email Address</th>
                      <th className="py-3.5 px-4 font-semibold">Role</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4EFEB]">
                    {staffUsers.map((staff) => (
                      <tr key={staff.id} className="hover:bg-[#F4EFEB]/40">
                        <td className="py-3.5 px-4 font-bold text-[#2B231F]">{staff.name}</td>
                        <td className="py-3.5 px-4 text-[#736357] font-mono">{staff.email}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              staff.role === 'admin'
                                ? 'bg-purple-100 text-purple-900'
                                : 'bg-[#EFE8E1] text-[#5C4033]'
                            }`}
                          >
                            {staff.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenStaffEdit(staff)}
                            className="p-1.5 hover:bg-[#EFE8E1] text-[#5C4033] rounded-full transition"
                            title="Edit Staff Member"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {staff.role !== 'admin' && (
                            <button
                              onClick={() => deleteStaffUser(staff.id)}
                              className="p-1.5 hover:bg-red-50 text-[#DC2626] rounded-full transition"
                              title="Remove Staff Member"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: SPATIE ROLES & PERMISSIONS */}
        {/* ========================================================================= */}
        {activeTab === 'roles' && <SpatieRolesTab />}

        {/* ========================================================================= */}
        {/* TAB 3: PRODUCT MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'products' && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-[#2B231F]">
                  Menu Product Catalog
                </h3>
                <p className="text-xs text-[#8C7A6B]">
                  Modify active menu items, pricing, inventory flags, and availability toggles.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingProductId(null);
                  setProductName('');
                  setProductCategory('Signature Blend');
                  setProductDesc('');
                  setProductPrice(130);
                  setProductStock(50);
                  setShowProductModal(true);
                }}
                className="px-4 py-2 bg-[#5C4033] text-[#FDFBF7] text-xs font-bold rounded-full shadow-xs flex items-center gap-1.5 hover:bg-[#4A3328]"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Product</span>
              </button>
            </div>

            <div className="bg-[#FDFBF7] rounded-3xl border border-[#EFE8E1] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-[#F4EFEB] border-b border-[#E6DDD4] text-[#8C7A6B] uppercase tracking-wider text-[10px]">
                      <th className="py-3.5 px-4 font-semibold">Item</th>
                      <th className="py-3.5 px-4 font-semibold">Category</th>
                      <th className="py-3.5 px-4 font-semibold">Price</th>
                      <th className="py-3.5 px-4 font-semibold">Stock</th>
                      <th className="py-3.5 px-4 font-semibold">Available</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4EFEB]">
                    {menuItems.map((item) => (
                      <tr key={item.id} className="hover:bg-[#F4EFEB]/40">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image_path}
                              alt={item.name}
                              className="w-10 h-10 rounded-xl object-cover border border-[#E6DDD4]"
                            />
                            <div>
                              <p className="font-bold text-[#2B231F]">{item.name}</p>
                              <p className="text-[10px] text-[#8C7A6B] line-clamp-1">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="bg-[#EFE8E1] text-[#5C4033] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#5C4033]">
                          ₱{item.price.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`font-mono font-bold ${
                              item.stock_quantity <= 15 ? 'text-rose-600' : 'text-[#2B231F]'
                            }`}
                          >
                            {item.stock_quantity}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => toggleMenuItemAvailability(item.id)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition ${
                              item.is_available
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-[#DC2626]'
                            }`}
                          >
                            {item.is_available ? 'Active' : 'Disabled'}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1">
                          <button
                            onClick={() => {
                              setRestockTargetItemId(item.id);
                              setRestockTargetUnitId(null);
                              setRestockQty(50);
                              setShowRestockModal(true);
                            }}
                            className="p-1.5 hover:bg-[#EFE8E1] text-[#5C4033] rounded-full transition"
                            title="Restock Item"
                          >
                            <Package className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenProductEdit(item)}
                            className="p-1.5 hover:bg-[#EFE8E1] text-[#5C4033] rounded-full transition"
                            title="Edit Item"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteMenuItem(item.id)}
                            className="p-1.5 hover:bg-red-50 text-[#DC2626] rounded-full transition"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: UNIT BOTTLENECK INVENTORY & AUDIT LOGS */}
        {/* ========================================================================= */}
        {activeTab === 'inventory' && (
          <div className="mt-6 space-y-6">
            {/* Low Stock Warning Banner */}
            {lowStockBottlenecks.length > 0 && (
              <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-3xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-bold text-rose-900">
                    Low Stock Notification: Critical Packaging & Ingredient Bottlenecks
                  </h4>
                  <p className="text-rose-700 mt-0.5">
                    The following supplies have reached or fallen below safety thresholds. Restock immediately to prevent service disruptions:
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {lowStockBottlenecks.map((unit) => (
                      <span
                        key={unit.id}
                        className="bg-white border border-rose-300 text-rose-800 px-3 py-1 rounded-full font-bold text-[11px]"
                      >
                        {unit.name}: {unit.current_stock} {unit.unit} (Min: {unit.minimum_threshold})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Packaging & Bottlenecks Units Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-display text-base font-bold text-[#2B231F]">
                    Unit Bottleneck Inventory
                  </h3>
                  <p className="text-xs text-[#8C7A6B]">
                    Tracks container bottlenecks (16oz, 22oz cups) and ingredient reserves deducted atomically when orders are paid.
                  </p>
                </div>
              </div>

              <div className="bg-[#FDFBF7] rounded-3xl border border-[#EFE8E1] overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-[#F4EFEB] border-b border-[#E6DDD4] text-[#8C7A6B] uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4 font-semibold">Unit Name</th>
                      <th className="py-3 px-4 font-semibold">Category</th>
                      <th className="py-3 px-4 font-semibold">Current Stock</th>
                      <th className="py-3 px-4 font-semibold">Min Threshold</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Quick Restock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4EFEB]">
                    {bottlenecks.map((unit) => {
                      const isLow = unit.current_stock <= unit.minimum_threshold;
                      return (
                        <tr key={unit.id} className="hover:bg-[#F4EFEB]/40">
                          <td className="py-3.5 px-4 font-bold text-[#2B231F]">{unit.name}</td>
                          <td className="py-3.5 px-4">
                            <span className="bg-[#EFE8E1] text-[#5C4033] px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase">
                              {unit.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-sm">
                            <span className={isLow ? 'text-rose-600' : 'text-[#2B231F]'}>
                              {unit.current_stock}
                            </span>{' '}
                            <span className="text-xs font-normal text-[#8C7A6B]">{unit.unit}</span>
                          </td>
                          <td className="py-3.5 px-4 text-[#8C7A6B]">
                            {unit.minimum_threshold} {unit.unit}
                          </td>
                          <td className="py-3.5 px-4">
                            {isLow ? (
                              <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                Low Stock
                              </span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                In Stock
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => {
                                setRestockTargetUnitId(unit.id);
                                setRestockTargetItemId(null);
                                setRestockQty(50);
                                setShowRestockModal(true);
                              }}
                              className="px-3 py-1 bg-[#5C4033] text-[#FDFBF7] text-xs font-bold rounded-full hover:bg-[#4A3328]"
                            >
                              + Restock
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Inventory Audit Logs Table */}
            <div>
              <h3 className="font-display text-base font-bold text-[#2B231F] mb-3">
                Live Inventory Audit Logs (`inventory_logs`)
              </h3>
              <div className="bg-[#FDFBF7] rounded-3xl border border-[#EFE8E1] overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-[#F4EFEB] border-b border-[#E6DDD4] text-[#8C7A6B] uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4 font-semibold">Timestamp</th>
                      <th className="py-3 px-4 font-semibold">User</th>
                      <th className="py-3 px-4 font-semibold">Item Affected</th>
                      <th className="py-3 px-4 font-semibold">Type</th>
                      <th className="py-3 px-4 font-semibold text-right">Change</th>
                      <th className="py-3 px-4 font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4EFEB]">
                    {inventoryLogs.slice(0, 15).map((log) => (
                      <tr key={log.id} className="hover:bg-[#F4EFEB]/40">
                        <td className="py-3 px-4 text-[#8C7A6B] font-mono text-[11px]">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#2B231F]">
                          {log.user_name || 'System'}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#5C4033]">{log.item_name}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              log.change_type === 'sale'
                                ? 'bg-amber-100 text-amber-900'
                                : log.change_type === 'restock'
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'bg-red-100 text-[#DC2626]'
                            }`}
                          >
                            {log.change_type}
                          </span>
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-mono font-bold ${
                            log.quantity_changed < 0 ? 'text-[#DC2626]' : 'text-emerald-700'
                          }`}
                        >
                          {log.quantity_changed > 0 ? `+${log.quantity_changed}` : log.quantity_changed}
                        </td>
                        <td className="py-3 px-4 text-[#736357] italic text-[11px]">{log.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* Staff Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-5">
          <div className="bg-[#FDFBF7] w-full max-w-md rounded-3xl p-6 border border-[#EFE8E1] shadow-2xl">
            <h3 className="font-display text-lg font-bold text-[#2B231F]">
              {editingStaffId ? 'Edit Staff Profile' : 'Add New Staff Member'}
            </h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5C4033] mb-1">Full Name</label>
                <input
                  type="text"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="e.g. Maria Santos"
                  className="w-full min-h-[44px] px-4 py-2.5 bg-[#F4EFEB] border border-[#E6DDD4] rounded-xl text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-[#5C4033]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#5C4033] mb-1">Email Address</label>
                <input
                  type="email"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  placeholder="staff@cafepita.com"
                  className="w-full min-h-[44px] px-4 py-2.5 bg-[#F4EFEB] border border-[#E6DDD4] rounded-xl text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-[#5C4033]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#5C4033] mb-1">Role Permission</label>
                <select
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value as any)}
                  className="w-full min-h-[44px] px-4 py-2.5 bg-[#F4EFEB] border border-[#E6DDD4] rounded-xl text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-[#5C4033]"
                >
                  <option value="staff">Staff (Kitchen / Barista KDS)</option>
                  <option value="admin">Administrator (Full Access)</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setShowStaffModal(false)}
                className="flex-1 min-h-[44px] py-2.5 bg-[#EFE8E1] text-[#736357] font-bold text-xs rounded-xl hover:bg-[#E6DDD4] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStaff}
                className="flex-1 min-h-[44px] py-2.5 bg-[#5C4033] text-[#FDFBF7] font-bold text-xs rounded-xl shadow hover:bg-[#4A3328] transition"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {showRestockModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-5">
          <div className="bg-[#FDFBF7] w-full max-w-sm rounded-3xl p-6 border border-[#EFE8E1] shadow-2xl">
            <h3 className="font-display text-lg font-bold text-[#2B231F]">
              Restock Inventory
            </h3>
            <p className="text-xs text-[#8C7A6B] mt-1">
              Add verified incoming delivery batch to stock records.
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#5C4033] mb-1">Quantity to Add</label>
                <input
                  type="number"
                  value={restockQty}
                  onChange={(e) => setRestockQty(parseInt(e.target.value) || 0)}
                  className="w-full min-h-[44px] px-4 py-2.5 bg-[#F4EFEB] border border-[#E6DDD4] rounded-xl text-base sm:text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#5C4033]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#5C4033] mb-1">Audit Notes</label>
                <input
                  type="text"
                  value={restockNotes}
                  onChange={(e) => setRestockNotes(e.target.value)}
                  placeholder="e.g. Supplier Batch #4092"
                  className="w-full min-h-[44px] px-4 py-2.5 bg-[#F4EFEB] border border-[#E6DDD4] rounded-xl text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-[#5C4033]"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setShowRestockModal(false)}
                className="flex-1 min-h-[44px] py-2.5 bg-[#EFE8E1] text-[#736357] font-bold text-xs rounded-xl hover:bg-[#E6DDD4] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteRestock}
                className="flex-1 min-h-[44px] py-2.5 bg-[#5C4033] text-[#FDFBF7] font-bold text-xs rounded-xl shadow hover:bg-[#4A3328] transition"
              >
                Confirm Restock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-5">
          <div className="bg-[#FDFBF7] w-full max-w-md rounded-3xl p-6 border border-[#EFE8E1] shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-lg font-bold text-[#2B231F]">
              {editingProductId ? 'Edit Product' : 'Create New Product'}
            </h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#5C4033] mb-1">Name</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full min-h-[44px] px-4 py-2.5 bg-[#F4EFEB] border border-[#E6DDD4] rounded-xl text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-[#5C4033]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#5C4033] mb-1">Category</label>
                <select
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  className="w-full min-h-[44px] px-4 py-2.5 bg-[#F4EFEB] border border-[#E6DDD4] rounded-xl text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-[#5C4033]"
                >
                  <option value="Signature Blend">Signature Blend</option>
                  <option value="Classic Blend">Classic Blend</option>
                  <option value="Americano Series">Americano Series</option>
                  <option value="Hot Blend">Hot Blend</option>
                  <option value="Frappe">Frappe</option>
                  <option value="Non-Espresso">Non-Espresso</option>
                  <option value="Refreshers">Refreshers</option>
                  <option value="Kitchen Items">Kitchen Items</option>
                  <option value="Party Trays">Party Trays</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#5C4033] mb-1">Price (₱)</label>
                <input
                  type="number"
                  value={productPrice}
                  onChange={(e) => setProductPrice(parseFloat(e.target.value) || 0)}
                  className="w-full min-h-[44px] px-4 py-2.5 bg-[#F4EFEB] border border-[#E6DDD4] rounded-xl text-base sm:text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#5C4033]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#5C4033] mb-1">Stock Quantity</label>
                <input
                  type="number"
                  value={productStock}
                  onChange={(e) => setProductStock(parseInt(e.target.value) || 0)}
                  className="w-full min-h-[44px] px-4 py-2.5 bg-[#F4EFEB] border border-[#E6DDD4] rounded-xl text-base sm:text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#5C4033]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#5C4033] mb-1">Description</label>
                <textarea
                  value={productDesc}
                  onChange={(e) => setProductDesc(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-[#F4EFEB] border border-[#E6DDD4] rounded-xl text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-[#5C4033]"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setShowProductModal(false)}
                className="flex-1 min-h-[44px] py-2.5 bg-[#EFE8E1] text-[#736357] font-bold text-xs rounded-xl hover:bg-[#E6DDD4] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProduct}
                className="flex-1 min-h-[44px] py-2.5 bg-[#5C4033] text-[#FDFBF7] font-bold text-xs rounded-xl shadow hover:bg-[#4A3328] transition"
              >
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
