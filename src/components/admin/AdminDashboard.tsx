import React, { useState, useMemo } from 'react';
import { useCafe } from '../../context/CafeContext';
import {
  ShieldCheck,
  TrendingUp,
  Users,
  Eye,
  EyeOff,
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
  Download,
  Filter,
} from 'lucide-react';
import { User as UserType, MenuItem, Role } from '../../types/cafe';
import { InventoryManager } from './InventoryManager';
import { RecipeManager } from './RecipeManager';
import { StaffManagement } from './StaffManagement';
import { AdminLayout } from './AdminLayout';
import { EditMenuItemModal } from './EditMenuItemModal';
import { MenuCatalogTable } from './MenuCatalogTable';
import { CategoryManager } from './CategoryManager';
import { useUnsavedChangesGuard } from '../../hooks/useUnsavedChangesGuard';

export const AdminDashboard: React.FC = () => {
  const {
    menuItems,
    bottlenecks,
    inventoryItems,
    recipeRules,
    checkItemOverallAvailability,
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
    logoutUnified,
    currentPath,
    navigate,
  } = useCafe();

  const [activeTab, setActiveTab] = useState<'analytics' | 'staff' | 'products' | 'categories' | 'inventory' | 'recipes'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('recipe')) return 'recipes';
      if (path.includes('inventory')) return 'inventory';
      if (path.includes('categories')) return 'categories';
      if (path.includes('products') || path.includes('menu')) return 'products';
      if (path.includes('staff')) return 'staff';
      if (path.includes('analytics') || path.includes('reports')) return 'analytics';
    }
    return 'analytics';
  });

  // Keep activeTab synchronized with currentPath
  React.useEffect(() => {
    if (currentPath.includes('recipe')) setActiveTab('recipes');
    else if (currentPath.includes('inventory')) setActiveTab('inventory');
    else if (currentPath.includes('categories')) setActiveTab('categories');
    else if (currentPath.includes('products') || currentPath.includes('menu')) setActiveTab('products');
    else if (currentPath.includes('staff')) setActiveTab('staff');
    else if (currentPath.includes('analytics') || currentPath.includes('reports')) setActiveTab('analytics');
  }, [currentPath]);

  const [recipeLinkerItemId, setRecipeLinkerItemId] = useState<number | undefined>(undefined);

  // Low stock counter for header/tab badge
  const lowOrDepletedRawCount = useMemo(() => {
    return inventoryItems.filter((it) => it.stock_quantity <= it.low_stock_threshold).length;
  }, [inventoryItems]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showInventoryLogs, setShowInventoryLogs] = useState(false);
  // Analytics Date Filter
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'custom' | 'all'>('all');
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Staff Form State
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<number | null>(null);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState<Role>('staff');

  // Product Form State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const editingProduct = menuItems.find((m) => m.id === editingProductId) || null;

  // Restock Modal State
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockTargetUnitId, setRestockTargetUnitId] = useState<string | null>(null);
  const [restockTargetItemId, setRestockTargetItemId] = useState<number | null>(null);
  const [restockQty, setRestockQty] = useState<number>(50);
  const [restockNotes, setRestockNotes] = useState<string>('Batch shipment restock');

  // Unsaved Changes Guard for staff and restock modals
  useUnsavedChangesGuard({
    when: showStaffModal,
    role: 'admin',
    reason: editingStaffId ? `Editing staff member #${editingStaffId}` : 'Creating new staff account',
  });

  useUnsavedChangesGuard({
    when: showRestockModal,
    role: 'admin',
    reason: 'Inventory restock modal in progress',
  });

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
      if (dateRange === 'custom') {
        const orderDateStr = order.created_at.split('T')[0];
        if (startDate && orderDateStr < startDate) return false;
        if (endDate && orderDateStr > endDate) return false;
        return true;
      }
      return true;
    });
  }, [orders, dateRange, startDate, endDate]);

  const customStartDate = startDate;
  const effectiveStart = useMemo(() => {
    if (dateRange === 'today') {
      return new Date().toISOString().split('T')[0];
    }
    if (dateRange === '7days') {
      return new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    }
    if (dateRange === '30days') {
      return new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    }
    return customStartDate || new Date().toISOString().split('T')[0];
  }, [dateRange, customStartDate]);

  const effectiveEnd = useMemo(() => {
    if (dateRange === 'custom') {
      return endDate || new Date().toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  }, [dateRange, endDate]);

  /**
   * Export Sales Report:
   * Triggers backend export endpoint `/api/admin/reports/export?start_date=...&end_date=...`
   * with seamless fallback CSV generation for offline/preview environments.
   */
  const handleExportReport = async () => {
    setIsExporting(true);
    setExportNotice(null);

    const exportUrl = `/api/admin/reports/export?start_date=${encodeURIComponent(
      effectiveStart
    )}&end_date=${encodeURIComponent(effectiveEnd)}`;

    try {
      // Attempt backend API call first
      const response = await fetch(exportUrl, {
        headers: {
          Accept: 'text/csv, application/json',
          Authorization: adminSession?.token ? `Bearer ${adminSession.token}` : '',
        },
      });

      if (response.ok && response.headers.get('content-type')?.includes('csv')) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `sales_report_${effectiveStart}_to_${effectiveEnd}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
        setExportNotice(`Exported report from API (${effectiveStart} to ${effectiveEnd})`);
        setIsExporting(false);
        return;
      }
    } catch {
      // Backend not running / standalone SPA mode
    }

    // Client-side CSV generation fallback conforming to the exact export endpoint schema
    try {
      const headers = [
        'Order ID',
        'Tracking Token',
        'Customer Name',
        'Order Type',
        'Payment Method',
        'Payment Status',
        'Order Status',
        'Total Amount (PHP)',
        'Items Summary',
        'Order Date',
      ];

      const rows = filteredOrders.map((o) => {
        const itemsSummary = o.items
          .map((i) => `${i.quantity}x ${i.item_name}`)
          .join('; ');
        return [
          o.id,
          `"${o.tracking_token}"`,
          `"${o.customer_name.replace(/"/g, '""')}"`,
          `"${o.order_type === 'dine-in' ? 'Dine-in (Counter Pickup)' : o.order_type}"`,
          `"${o.payment_method}"`,
          `"${o.payment_status}"`,
          `"${o.order_status}"`,
          o.total_amount.toFixed(2),
          `"${itemsSummary.replace(/"/g, '""')}"`,
          `"${new Date(o.created_at).toISOString()}"`,
        ];
      });

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `cafe_pepita_sales_${effectiveStart}_to_${effectiveEnd}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      setExportNotice(`Downloaded ${filteredOrders.length} orders (${effectiveStart} to ${effectiveEnd})`);
    } catch (err: any) {
      setExportNotice(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

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

  const handleOpenProductEdit = (item: MenuItem) => {
    setEditingProductId(item.id);
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
    <AdminLayout
      activeTab={activeTab}
      onTabChange={(tabId, path) => {
        setActiveTab(tabId as any);
        navigate(path);
      }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ========================================================================= */}
        {/* TAB 1: SALES REPORTS & ANALYTICS */}
        {/* ========================================================================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Filter & Export Bar */}
            <div className="bg-[#F4EFEB] p-4 rounded-2xl border border-[#E6DDD4] space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#5C4033] flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>Reporting Period:</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'today', label: 'Today' },
                      { id: '7days', label: 'Last 7 Days' },
                      { id: '30days', label: 'Last 30 Days' },
                      { id: 'custom', label: 'Custom Range' },
                      { id: 'all', label: 'All Time' },
                    ].map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setDateRange(d.id as any)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                          dateRange === d.id
                            ? 'bg-[#5C4033] text-[#FDFBF7] shadow-xs'
                            : 'bg-[#FDFBF7] text-[#736357] hover:bg-white border border-transparent hover:border-[#E6DDD4]'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Export Sales Report CTA Button */}
                <div className="flex items-center gap-2 self-start lg:self-auto">
                  <button
                    type="button"
                    id="export-sales-report-btn"
                    onClick={handleExportReport}
                    disabled={isExporting || filteredOrders.length === 0}
                    className="min-h-[38px] px-4 py-2 bg-[#4A2E19] hover:bg-[#3B2414] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-98"
                    title="Export sales report via GET /api/admin/reports/export"
                  >
                    <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
                    <span>{isExporting ? 'Exporting...' : 'Export Sales Report'}</span>
                  </button>
                </div>
              </div>

              {/* Custom Date Pickers (visible when 'custom' is active) */}
              {dateRange === 'custom' && (
                <div className="pt-3 border-t border-[#E6DDD4] flex flex-wrap items-center gap-3 text-xs">
                  <span className="font-semibold text-[#5C4033] flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" />
                    <span>Select Date Range:</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="text-stone-600 font-medium">From:</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="px-2.5 py-1.5 bg-white border border-[#D5C7BC] rounded-lg text-xs font-medium text-[#2B231F] focus:outline-none focus:ring-1 focus:ring-[#5C4033]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-stone-600 font-medium">To:</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="px-2.5 py-1.5 bg-white border border-[#D5C7BC] rounded-lg text-xs font-medium text-[#2B231F] focus:outline-none focus:ring-1 focus:ring-[#5C4033]"
                    />
                  </div>
                  <span className="text-[11px] text-[#8C7A6B]">
                    ({filteredOrders.length} orders matched)
                  </span>
                </div>
              )}

              {/* Feedback toast banner on export */}
              {exportNotice && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between animate-fadeIn">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{exportNotice}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setExportNotice(null)}
                    className="text-stone-400 hover:text-stone-600 text-xs px-1"
                  >
                    ✕
                  </button>
                </div>
              )}
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
        {/* TAB 2: STAFF ACCOUNT MANAGEMENT & SECURITY CONTROLS */}
        {/* ========================================================================= */}
        {activeTab === 'staff' && (
          <div className="mt-6">
            <StaffManagement />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PRODUCT MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'products' && (
          <div className="mt-6">
            <MenuCatalogTable
              onOpenEdit={(item) => {
                setEditingProductId(item.id);
                setShowProductModal(true);
              }}
              onOpenCreate={() => {
                setEditingProductId(null);
                setShowProductModal(true);
              }}
              onOpenCategories={() => {
                setActiveTab('categories');
                navigate('/admin/categories');
              }}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: CATEGORY CONTROLS & SEQUENCE ORDERING */}
        {/* ========================================================================= */}
        {activeTab === 'categories' && (
          <div className="mt-6">
            <CategoryManager />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: RAW INVENTORY MANAGEMENT & BOTTLENECK AUDIT LOGS */}
        {/* ========================================================================= */}
        {activeTab === 'inventory' && (
          <div className="mt-6 space-y-8">
            {/* Dynamic Self-Serve Inventory Manager Component */}
            <InventoryManager
              onOpenRecipeLinker={(menuItemId) => {
                if (menuItemId) setRecipeLinkerItemId(menuItemId);
                setActiveTab('recipes');
                navigate('/admin/recipes');
              }}
            />

            {/* Live Inventory Audit Logs (`inventory_logs`) */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#5C4033]" />
                    Live System Inventory Audit Logs
                  </h3>

                  <p className="text-xs text-stone-500 mt-0.5">
                    Immutable history of automated order deductions, manual restocks, and adjustments.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowInventoryLogs((prev) => !prev)}
                  className="shrink-0 min-h-[38px] px-3.5 py-2 bg-[#F4EFEB] hover:bg-[#E6DDD4] text-[#5C4033] rounded-xl text-xs font-bold transition flex items-center gap-2"
                >
                  {showInventoryLogs ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Hide Logs
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      View Logs
                    </>
                  )}
                </button>
              </div>

              {showInventoryLogs && (
                <div className="mt-5 rounded-2xl border border-stone-200/80 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-stone-50 border-b border-stone-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      Recent Activity
                    </span>

                    <span className="text-[10px] font-semibold text-stone-400">
                      Showing latest 15 logs
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-white border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
                          <th className="py-3 px-4 font-semibold">Timestamp</th>
                          <th className="py-3 px-4 font-semibold">User</th>
                          <th className="py-3 px-4 font-semibold">Item Affected</th>
                          <th className="py-3 px-4 font-semibold">Type</th>
                          <th className="py-3 px-4 font-semibold text-right">Change</th>
                          <th className="py-3 px-4 font-semibold">Notes</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-stone-100">
                        {inventoryLogs.slice(0, 15).map((log) => (
                          <tr
                            key={log.id}
                            className="hover:bg-stone-50/60"
                          >
                            <td className="py-3 px-4 text-stone-500 font-mono text-[11px]">
                              {new Date(log.created_at).toLocaleString()}
                            </td>

                            <td className="py-3 px-4 font-semibold text-stone-800">
                              {log.user_name || 'System'}
                            </td>

                            <td className="py-3 px-4 font-bold text-[#5C4033]">
                              {log.item_name}
                            </td>

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
                                log.quantity_changed < 0
                                  ? 'text-[#DC2626]'
                                  : 'text-emerald-700'
                              }`}
                            >
                              {log.quantity_changed > 0
                                ? `+${log.quantity_changed}`
                                : log.quantity_changed}
                            </td>

                            <td className="py-3 px-4 text-stone-600 italic text-[11px]">
                              {log.notes}
                            </td>
                          </tr>
                        ))}

                        {inventoryLogs.length === 0 && (
                          <tr>
                            <td
                              colSpan={6}
                              className="py-8 text-center text-stone-500"
                            >
                              No inventory audit logs recorded yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: DEDICATED RECIPE / BOM SETTINGS */}
        {/* ========================================================================= */}
        {activeTab === 'recipes' && (
          <div className="mt-6">
            <RecipeManager
              initialMenuItemId={recipeLinkerItemId}
              onNavigateToInventory={() => {
                setActiveTab('inventory');
                navigate('/admin/inventory');
              }}
            />
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

      {/* Unified Product Modal (Details, Variants, BOM, and Restock) */}
      <EditMenuItemModal
        isOpen={showProductModal}
        item={editingProduct}
        onClose={() => {
          setShowProductModal(false);
          setEditingProductId(null);
        }}
      />
    </AdminLayout>
  );
};
