import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
  Trash2,
  Edit2,
  TrendingDown,
  X,
  Filter,
  Layers,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { useCafe } from '../../context/CafeContext';
import { InventoryItem } from '../../types/cafe';

interface InventoryManagerProps {
  onOpenRecipeLinker?: (menuItemId?: number) => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({ onOpenRecipeLinker }) => {
  const {
    inventoryItems,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    restockInventoryItem,
    recipeRules,
    menuItems,
  } = useCafe();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low' | 'depleted' | 'healthy'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [restockModalItem, setRestockModalItem] = useState<InventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState<number>(100);
  const [restockNote, setRestockNote] = useState<string>('');

  // Form State for Add / Edit
  const [formData, setFormData] = useState<{
    name: string;
    stock_quantity: number;
    unit: string;
    low_stock_threshold: number;
    category: string;
    cost_per_unit?: number;
  }>({
    name: '',
    stock_quantity: 100,
    unit: 'pcs',
    low_stock_threshold: 30,
    category: 'packaging',
  });

  // Inline Quick Restock state per item
  const [inlineRestockValues, setInlineRestockValues] = useState<{ [id: string]: number }>({});

  // Summary Metrics
  const totalItems = inventoryItems.length;
  const depletedItems = useMemo(
    () => inventoryItems.filter((it) => it.stock_quantity <= 0),
    [inventoryItems]
  );
  const lowStockItems = useMemo(
    () => inventoryItems.filter((it) => it.stock_quantity > 0 && it.stock_quantity <= it.low_stock_threshold),
    [inventoryItems]
  );
  const healthyItems = useMemo(
    () => inventoryItems.filter((it) => it.stock_quantity > it.low_stock_threshold),
    [inventoryItems]
  );

  // Available Categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    inventoryItems.forEach((it) => {
      if (it.category) cats.add(it.category);
    });
    return Array.from(cats);
  }, [inventoryItems]);

  // Filtered List
  const filteredItems = useMemo(() => {
    return inventoryItems.filter((it) => {
      const matchesSearch = it.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (it.category && it.category.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const isDepleted = it.stock_quantity <= 0;
      const isLow = it.stock_quantity > 0 && it.stock_quantity <= it.low_stock_threshold;
      const isHealthy = it.stock_quantity > it.low_stock_threshold;

      let matchesStatus = true;
      if (statusFilter === 'depleted') matchesStatus = isDepleted;
      else if (statusFilter === 'low') matchesStatus = isLow;
      else if (statusFilter === 'healthy') matchesStatus = isHealthy;

      let matchesCat = true;
      if (categoryFilter !== 'all') {
        matchesCat = it.category === categoryFilter;
      }

      return matchesSearch && matchesStatus && matchesCat;
    });
  }, [inventoryItems, searchTerm, statusFilter, categoryFilter]);

  // Calculate Linked Recipes Count for each raw item
  const getLinkedRecipesCount = (itemId: number | string) => {
    return recipeRules.filter((r) => String(r.inventory_item_id) === String(itemId)).length;
  };

  // Open Create Form
  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      stock_quantity: 100,
      unit: 'pcs',
      low_stock_threshold: 30,
      category: 'packaging',
      cost_per_unit: undefined,
    });
    setIsAddModalOpen(true);
  };

  // Open Edit Form
  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      stock_quantity: item.stock_quantity,
      unit: item.unit,
      low_stock_threshold: item.low_stock_threshold,
      category: item.category || 'packaging',
      cost_per_unit: item.cost_per_unit,
    });
    setIsAddModalOpen(true);
  };

  // Submit Add / Edit
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingItem) {
      updateInventoryItem(editingItem.id, {
        name: formData.name.trim(),
        stock_quantity: Number(formData.stock_quantity),
        unit: formData.unit.trim(),
        low_stock_threshold: Number(formData.low_stock_threshold),
        category: formData.category,
        cost_per_unit: formData.cost_per_unit ? Number(formData.cost_per_unit) : undefined,
      });
    } else {
      addInventoryItem({
        name: formData.name.trim(),
        stock_quantity: Number(formData.stock_quantity),
        unit: formData.unit.trim(),
        low_stock_threshold: Number(formData.low_stock_threshold),
        category: formData.category,
        cost_per_unit: formData.cost_per_unit ? Number(formData.cost_per_unit) : undefined,
      });
    }
    setIsAddModalOpen(false);
  };

  // Quick Restock via Modal
  const handleOpenRestockModal = (item: InventoryItem) => {
    setRestockModalItem(item);
    setRestockQty(100);
    setRestockNote('New delivery batch shipment received');
  };

  const handleConfirmRestockModal = () => {
    if (!restockModalItem || restockQty <= 0) return;
    restockInventoryItem(restockModalItem.id, Number(restockQty), restockNote);
    setRestockModalItem(null);
  };

  // Inline Restock
  const handleInlineRestock = (item: InventoryItem) => {
    const qty = inlineRestockValues[String(item.id)] || 50;
    if (qty > 0) {
      restockInventoryItem(item.id, qty, `Quick inline restock +${qty} ${item.unit}`);
      // Clear inline input
      setInlineRestockValues((prev) => ({ ...prev, [String(item.id)]: 0 }));
    }
  };

  return (
    <div className="space-y-6" id="admin-inventory-manager">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#5C3D2E]/10 flex items-center justify-center text-[#5C3D2E]">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">
                Raw Inventory Management
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Track global stock levels, log restock entries, manage unit definitions, and monitor low-stock threshold alerts
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenRecipeLinker && (
            <button
              type="button"
              onClick={() => onOpenRecipeLinker()}
              className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-2xl flex items-center gap-2 transition cursor-pointer"
            >
              <Layers className="w-4 h-4 text-[#5C3D2E]" />
              Recipe / BOM Settings
            </button>
          )}

          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-[#5C3D2E] hover:bg-[#4A2F22] active:scale-95 text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Raw Item
          </button>
        </div>
      </div>

      {/* Critical Stock Alert Banner if depleted items exist */}
      {depletedItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-3xl flex items-start sm:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-900">
                Critical Bottleneck: {depletedItems.length} raw inventory item{depletedItems.length > 1 ? 's are' : ' is'} completely depleted (0 stock)!
              </h4>
              <p className="text-xs text-red-700 mt-0.5">
                Drink size variants linked to {depletedItems.map((d) => d.name).join(', ')} are automatically locked as &quot;Out of Stock&quot; for customer ordering.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStatusFilter('depleted')}
            className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shrink-0 transition"
          >
            View Depleted
          </button>
        </div>
      )}

      {/* Metric Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-3xl border transition cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-stone-900 text-white border-stone-900 shadow-md'
              : 'bg-white border-stone-200/80 hover:border-stone-400 text-stone-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${statusFilter === 'all' ? 'text-stone-300' : 'text-stone-500'}`}>
              Total Raw Items
            </span>
            <Package className={`w-4 h-4 ${statusFilter === 'all' ? 'text-stone-300' : 'text-stone-400'}`} />
          </div>
          <p className="text-2xl font-black mt-2">{totalItems}</p>
          <span className={`text-[11px] block mt-1 ${statusFilter === 'all' ? 'text-stone-400' : 'text-stone-400'}`}>
            Global packaging & units
          </span>
        </div>

        <div
          onClick={() => setStatusFilter('depleted')}
          className={`p-4 rounded-3xl border transition cursor-pointer ${
            statusFilter === 'depleted'
              ? 'bg-red-600 text-white border-red-600 shadow-md'
              : 'bg-white border-stone-200/80 hover:border-red-300 text-stone-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${statusFilter === 'depleted' ? 'text-red-100' : 'text-red-600'}`}>
              Out of Stock (0)
            </span>
            <AlertTriangle className={`w-4 h-4 ${statusFilter === 'depleted' ? 'text-white' : 'text-red-500'}`} />
          </div>
          <p className="text-2xl font-black mt-2 text-red-600">{depletedItems.length}</p>
          <span className="text-[11px] text-red-500 block mt-1">
            Blocks linked drink sales
          </span>
        </div>

        <div
          onClick={() => setStatusFilter('low')}
          className={`p-4 rounded-3xl border transition cursor-pointer ${
            statusFilter === 'low'
              ? 'bg-amber-500 text-white border-amber-500 shadow-md'
              : 'bg-white border-stone-200/80 hover:border-amber-300 text-stone-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${statusFilter === 'low' ? 'text-amber-100' : 'text-amber-600'}`}>
              Low Stock Warning
            </span>
            <TrendingDown className={`w-4 h-4 ${statusFilter === 'low' ? 'text-white' : 'text-amber-500'}`} />
          </div>
          <p className="text-2xl font-black mt-2 text-amber-600">{lowStockItems.length}</p>
          <span className="text-[11px] text-amber-500 block mt-1">
            ≤ Low stock threshold
          </span>
        </div>

        <div
          onClick={() => setStatusFilter('healthy')}
          className={`p-4 rounded-3xl border transition cursor-pointer ${
            statusFilter === 'healthy'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
              : 'bg-white border-stone-200/80 hover:border-emerald-300 text-stone-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${statusFilter === 'healthy' ? 'text-emerald-100' : 'text-emerald-600'}`}>
              Healthy Stock
            </span>
            <CheckCircle2 className={`w-4 h-4 ${statusFilter === 'healthy' ? 'text-white' : 'text-emerald-500'}`} />
          </div>
          <p className="text-2xl font-black mt-2 text-emerald-600">{healthyItems.length}</p>
          <span className="text-[11px] text-emerald-600 block mt-1">
            Sufficient reserve
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search raw items by name (e.g., '16oz Cups', 'Straws', 'Lids')..."
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 rounded-2xl text-xs text-stone-800 placeholder-stone-400 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter Chips */}
          <div className="flex items-center bg-stone-100 p-1 rounded-2xl">
            {(['all', 'depleted', 'low', 'healthy'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize ${
                  statusFilter === status
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-stone-400 ml-1" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-stone-50 text-xs font-semibold text-stone-700 border border-stone-200 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c} className="capitalize">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Inventory Items Table / Grid */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Inventory Catalog
            </span>
            <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-bold">
              {filteredItems.length}
            </span>
          </div>
          <span className="text-[11px] text-stone-400">
            Click &quot;+ Restock&quot; to log incoming deliveries
          </span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="py-16 text-center px-4">
            <Package className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-stone-700">No raw inventory items found</p>
            <p className="text-xs text-stone-400 mt-1">
              Try adjusting your search query or click &quot;Add Raw Item&quot; to create a new one.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50/75 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Item Name & Category</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Threshold</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4">Linked Recipes</th>
                  <th className="py-3 px-4 text-center">Quick Restock</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredItems.map((item) => {
                  const isDepleted = item.stock_quantity <= 0;
                  const isLow = item.stock_quantity > 0 && item.stock_quantity <= item.low_stock_threshold;
                  const linkedCount = getLinkedRecipesCount(item.id);
                  const inlineVal = inlineRestockValues[String(item.id)] || 50;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-stone-50/80 transition-colors ${
                        isDepleted ? 'bg-red-50/30' : isLow ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Name & Category */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-stone-900 text-sm">{item.name}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {item.category && (
                            <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-semibold capitalize">
                              {item.category}
                            </span>
                          )}
                          <span className="text-[10px] text-stone-400">Unit: {item.unit}</span>
                        </div>
                      </td>

                      {/* Current Stock */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-baseline gap-1">
                          <span
                            className={`text-base font-extrabold ${
                              isDepleted
                                ? 'text-red-600'
                                : isLow
                                ? 'text-amber-600'
                                : 'text-stone-900'
                            }`}
                          >
                            {item.stock_quantity}
                          </span>
                          <span className="text-xs text-stone-500 font-sans">{item.unit}</span>
                        </div>
                      </td>

                      {/* Threshold */}
                      <td className="py-3.5 px-4 text-stone-500 font-mono">
                        <span className="bg-stone-100 px-2 py-1 rounded-lg text-xs font-semibold text-stone-600">
                          {item.low_stock_threshold} {item.unit}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        {isDepleted ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-200">
                            <AlertTriangle className="w-3 h-3" />
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <TrendingDown className="w-3 h-3" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Healthy Stock
                          </span>
                        )}
                      </td>

                      {/* Linked Recipes */}
                      <td className="py-3.5 px-4">
                        {linkedCount > 0 ? (
                          <button
                            type="button"
                            onClick={() => onOpenRecipeLinker && onOpenRecipeLinker()}
                            className="inline-flex items-center gap-1 text-stone-600 hover:text-[#5C3D2E] font-semibold text-xs transition underline decoration-stone-300 hover:decoration-[#5C3D2E]"
                          >
                            <span>{linkedCount} variant{linkedCount > 1 ? 's' : ''}</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-stone-400 text-[11px]">Unlinked</span>
                        )}
                      </td>

                      {/* Quick Restock Action */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <input
                            type="number"
                            min="1"
                            value={inlineVal}
                            onChange={(e) =>
                              setInlineRestockValues((prev) => ({
                                ...prev,
                                [String(item.id)]: Math.max(1, Number(e.target.value)),
                              }))
                            }
                            className="w-16 px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-center font-mono text-xs focus:ring-1 focus:ring-[#5C3D2E]"
                            placeholder="Qty"
                          />
                          <button
                            type="button"
                            onClick={() => handleInlineRestock(item)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-lg transition flex items-center gap-1 shadow-2xs"
                            title={`Restock +${inlineVal} ${item.unit}`}
                          >
                            <Plus className="w-3 h-3" />
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenRestockModal(item)}
                            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition"
                            title="Detailed Restock Modal"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Edit / Delete Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition"
                            title="Edit raw item"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${item.name}"? Any attached BOM recipe rules will also be unlinked.`)) {
                                deleteInventoryItem(item.id);
                              }
                            }}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition"
                            title="Delete raw item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: ADD / EDIT RAW INVENTORY ITEM */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#5C3D2E]/10 text-[#5C3D2E] flex items-center justify-center font-bold">
                  <Package className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-stone-900 text-base">
                  {editingItem ? 'Edit Raw Inventory Item' : 'Add New Raw Inventory Item'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 mt-4">
              {/* Item Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. 16oz PET Cups, Paper Straws, 16oz Flat Lids"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]"
                >
                  <option value="packaging">Packaging (General)</option>
                  <option value="cups">Cups & Drinkware</option>
                  <option value="lids">Lids & Covers</option>
                  <option value="straws">Straws</option>
                  <option value="bags">Takeout Bags & Carriers</option>
                  <option value="containers">Food Boxes & Trays</option>
                  <option value="ingredients">Raw Ingredients (Syrups, Beans, Oat Milk)</option>
                </select>
              </div>

              {/* Current Stock Count & Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                    Current Stock <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                    Unit Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]"
                  >
                    <option value="pcs">pcs (pieces)</option>
                    <option value="ml">ml (milliliters)</option>
                    <option value="grams">grams</option>
                    <option value="liters">liters</option>
                    <option value="kg">kg (kilograms)</option>
                  </select>
                </div>
              </div>

              {/* Low Stock Threshold */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Low Stock Threshold <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.low_stock_threshold}
                    onChange={(e) => setFormData({ ...formData, low_stock_threshold: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-stone-400">
                    {formData.unit}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  Triggers &quot;Low Stock&quot; warning badge when quantity drops to or below this level.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-2xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#5C3D2E] hover:bg-[#4A2F22] text-white text-xs font-bold rounded-2xl shadow-xs transition"
                >
                  {editingItem ? 'Update Raw Item' : 'Save Inventory Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SHIPMENT RESTOCK MODAL */}
      {restockModalItem && (
        <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">
                    Restock {restockModalItem.name}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Current stock: {restockModalItem.stock_quantity} {restockModalItem.unit}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRestockModalItem(null)}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Units to Add (+ Restock)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={restockQty}
                    onChange={(e) => setRestockQty(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-base font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <span className="absolute right-3.5 top-3 text-xs font-bold text-stone-500">
                    {restockModalItem.unit}
                  </span>
                </div>
                <div className="flex gap-2 mt-2">
                  {[50, 100, 250, 500].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRestockQty(preset)}
                      className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-lg transition"
                    >
                      +{preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Shipment / Restock Notes
                </label>
                <input
                  type="text"
                  value={restockNote}
                  onChange={(e) => setRestockNote(e.target.value)}
                  placeholder="e.g. Delivery from Supplier packaging box #2"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Projected Result */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                <span className="text-emerald-800 font-medium">Projected new stock level:</span>
                <span className="font-mono font-extrabold text-emerald-900 text-sm">
                  {restockModalItem.stock_quantity + Number(restockQty)} {restockModalItem.unit}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setRestockModalItem(null)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-2xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRestockModal}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-xs transition"
                >
                  Confirm Shipment Restock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
