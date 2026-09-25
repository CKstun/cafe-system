import React, { useState, useMemo } from 'react';
import { useCafe } from '../../context/CafeContext';
import { MenuItem, InventoryItem } from '../../types/cafe';
import {
  UtensilsCrossed,
  Layers,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Package,
  Sparkles,
  ArrowRight,
  Info,
  Search,
  Save,
  RotateCcw,
  Coffee,
  Check,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export interface LinkedItemRow {
  inventory_item_id: number | string;
  quantity_deducted: number;
}

export interface RecipeManagerProps {
  initialMenuItemId?: number;
  onNavigateToInventory?: () => void;
}

export const RecipeManager: React.FC<RecipeManagerProps> = ({
  initialMenuItemId,
  onNavigateToInventory,
}) => {
  const {
    menuItems,
    inventoryItems,
    recipeRules,
    saveRecipeRulesForVariant,
    navigate,
  } = useCafe();

  // Search & Filter Drinks
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Selected Drink State
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<number>(() => {
    if (initialMenuItemId && menuItems.some((m) => m.id === initialMenuItemId)) {
      return initialMenuItemId;
    }
    const firstDrink = menuItems.find((m) => m.available_sizes && m.available_sizes.length > 0);
    return firstDrink ? firstDrink.id : menuItems[0]?.id || 201;
  });

  const selectedItem = useMemo(() => {
    return menuItems.find((m) => m.id === selectedMenuItemId) || menuItems[0];
  }, [menuItems, selectedMenuItemId]);

  // Sizes available for the selected drink
  const availableSizes = useMemo(() => {
    if (selectedItem?.available_sizes && selectedItem.available_sizes.length > 0) {
      return selectedItem.available_sizes.map((s) => s.size);
    }
    return [selectedItem?.size || '16oz'];
  }, [selectedItem]);

  const [selectedSize, setSelectedSize] = useState<string>(() => availableSizes[0] || '16oz');

  // Sync selected size if drink selection changes
  React.useEffect(() => {
    if (!availableSizes.includes(selectedSize)) {
      setSelectedSize(availableSizes[0] || '16oz');
    }
  }, [availableSizes, selectedSize]);

  // Existing saved rules for the currently selected (menu_item_id, variant_size)
  const existingRules = useMemo(() => {
    if (!selectedItem) return [];
    return recipeRules.filter(
      (r) =>
        r.menu_item_id === selectedMenuItemId &&
        r.variant_size.toLowerCase() === selectedSize.toLowerCase()
    );
  }, [recipeRules, selectedMenuItemId, selectedSize]);

  // Draft rows for editing in the BOM workbench
  const [draftRows, setDraftRows] = useState<LinkedItemRow[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Populate draft rows whenever selection or saved rules change
  React.useEffect(() => {
    setDraftRows(
      existingRules.map((r) => ({
        inventory_item_id: r.inventory_item_id,
        quantity_deducted: r.quantity_deducted,
      }))
    );
    setSaveStatus('idle');
  }, [existingRules]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    menuItems.forEach((m) => {
      if (m.category) set.add(m.category);
    });
    return Array.from(set);
  }, [menuItems]);

  // Filtered menu items for the sidebar list
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [menuItems, searchQuery, selectedCategory]);

  // Add raw ingredient row
  const handleAddRow = () => {
    const unusedItem = inventoryItems.find(
      (inv) => !draftRows.some((row) => String(row.inventory_item_id) === String(inv.id))
    );
    const defaultId = unusedItem ? unusedItem.id : inventoryItems[0]?.id || 1;

    setDraftRows((prev) => [
      ...prev,
      {
        inventory_item_id: defaultId,
        quantity_deducted: 1,
      },
    ]);
    setSaveStatus('idle');
  };

  // Update a row
  const handleUpdateRow = (index: number, updates: Partial<LinkedItemRow>) => {
    setDraftRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
    setSaveStatus('idle');
  };

  // Remove a row
  const handleRemoveRow = (index: number) => {
    setDraftRows((prev) => prev.filter((_, i) => i !== index));
    setSaveStatus('idle');
  };

  // Save recipe
  const handleSaveRecipe = async () => {
    if (!selectedItem) return;
    setSaveStatus('saving');

    try {
      await saveRecipeRulesForVariant(selectedMenuItemId, selectedSize, draftRows);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('idle');
    }
  };

  // Preset Template Fillers
  const applyPreset = (presetType: 'iced-16oz' | 'iced-22oz' | 'hot-12oz' | 'clear') => {
    if (presetType === 'clear') {
      setDraftRows([]);
      setSaveStatus('idle');
      return;
    }

    const rows: LinkedItemRow[] = [];

    // Helper to find raw item by fuzzy name
    const findItem = (keywords: string[]) => {
      return inventoryItems.find((it) =>
        keywords.every((kw) => it.name.toLowerCase().includes(kw.toLowerCase()))
      );
    };

    if (presetType === 'iced-16oz') {
      const cup = findItem(['16oz', 'cup']) || findItem(['cup']);
      const lid = findItem(['dome', 'lid']) || findItem(['lid']);
      const straw = findItem(['straw']);
      if (cup) rows.push({ inventory_item_id: cup.id, quantity_deducted: 1 });
      if (lid) rows.push({ inventory_item_id: lid.id, quantity_deducted: 1 });
      if (straw) rows.push({ inventory_item_id: straw.id, quantity_deducted: 1 });
    } else if (presetType === 'iced-22oz') {
      const cup = findItem(['22oz', 'cup']) || findItem(['cup']);
      const lid = findItem(['dome', 'lid']) || findItem(['lid']);
      const straw = findItem(['straw']);
      if (cup) rows.push({ inventory_item_id: cup.id, quantity_deducted: 1 });
      if (lid) rows.push({ inventory_item_id: lid.id, quantity_deducted: 1 });
      if (straw) rows.push({ inventory_item_id: straw.id, quantity_deducted: 1 });
    } else if (presetType === 'hot-12oz') {
      const cup = findItem(['hot', 'cup']) || findItem(['cup']);
      const lid = findItem(['hot', 'lid']) || findItem(['lid']);
      if (cup) rows.push({ inventory_item_id: cup.id, quantity_deducted: 1 });
      if (lid) rows.push({ inventory_item_id: lid.id, quantity_deducted: 1 });
    }

    if (rows.length > 0) {
      setDraftRows(rows);
      setSaveStatus('idle');
    }
  };

  // Live calculation of availability for the selected variant based on draft rows
  const simulatedAvailability = useMemo(() => {
    if (draftRows.length === 0) {
      return {
        available: true,
        bottleneck: null as InventoryItem | null,
        maxServings: null as number | null,
        hasMissingRules: true,
      };
    }

    let minServings = Infinity;
    let limitingItem: InventoryItem | null = null;

    for (const row of draftRows) {
      const inv = inventoryItems.find((i) => String(i.id) === String(row.inventory_item_id));
      if (!inv) continue;

      if (row.quantity_deducted > 0) {
        const servings = Math.floor(inv.stock_quantity / row.quantity_deducted);
        if (servings < minServings) {
          minServings = servings;
          limitingItem = inv;
        }
      }
    }

    const available = minServings > 0;
    return {
      available,
      bottleneck: limitingItem,
      maxServings: minServings === Infinity ? null : minServings,
      hasMissingRules: false,
    };
  }, [draftRows, inventoryItems]);

  return (
    <div className="space-y-6" id="admin-recipe-bom-manager">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-3xl border border-[#2C1D11]/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#4A2E19]/10 flex items-center justify-center text-[#4A2E19]">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#2C1D11] tracking-tight">
                Recipe Settings
              </h2>
              <p className="text-xs text-[#4A2E19]/70 mt-0.5">
                Map raw packaging and ingredients (cups, lids, straws, syrups) to menu product size variants for automated deductions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (onNavigateToInventory) onNavigateToInventory();
              else navigate('/admin/inventory');
            }}
            className="px-4 py-2 bg-[#FDFBF7] hover:bg-[#4A2E19]/5 text-[#4A2E19] text-xs font-bold rounded-xl border border-[#2C1D11]/10 flex items-center gap-2 transition cursor-pointer"
          >
            <Package className="w-4 h-4 text-[#4A2E19]" />
            <span>Raw Inventory Tab</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout: Left Drink Selection, Right Recipe Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Drink Menu Catalog Picker (4 Cols)                          */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-[#2C1D11]/10 p-4 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#2C1D11]/10 pb-3">
            <h3 className="font-bold text-xs text-[#2C1D11] uppercase tracking-wider flex items-center gap-1.5">
              <Coffee className="w-4 h-4 text-[#4A2E19]" />
              Select Menu Drink
            </h3>
            <span className="text-[11px] font-mono text-[#4A2E19]/70 font-semibold">
              {filteredMenuItems.length} products
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#4A2E19]/60 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search drinks (e.g. Spanish Latte)..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FDFBF7] border border-[#2C1D11]/15 rounded-xl text-[#2B231F] placeholder:text-[#4A2E19]/40 focus:outline-none focus:ring-2 focus:ring-[#4A2E19]"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg shrink-0 transition cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#4A2E19] text-white'
                  : 'bg-[#FDFBF7] text-[#2C1D11] hover:bg-[#4A2E19]/10'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg shrink-0 capitalize transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#4A2E19] text-white'
                    : 'bg-[#FDFBF7] text-[#2C1D11] hover:bg-[#4A2E19]/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Drink List */}
          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredMenuItems.map((item) => {
              const isSelected = item.id === selectedMenuItemId;
              const hasSizes = item.available_sizes && item.available_sizes.length > 0;
              const mappedRulesCount = recipeRules.filter((r) => r.menu_item_id === item.id).length;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedMenuItemId(item.id)}
                  className={`w-full text-left p-3 rounded-2xl transition border flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-[#4A2E19] text-white border-[#4A2E19] shadow-sm'
                      : 'bg-[#FDFBF7] hover:bg-[#4A2E19]/5 text-[#2C1D11] border-[#2C1D11]/5'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-bold text-xs truncate leading-tight">{item.name}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px]">
                      <span className={isSelected ? 'text-amber-200' : 'text-[#4A2E19]/70'}>
                        {hasSizes ? `${item.available_sizes?.length} sizes` : '1 size'}
                      </span>
                      <span>·</span>
                      <span className={isSelected ? 'text-amber-100' : 'text-[#8C7A6B]'}>
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    {mappedRulesCount > 0 ? (
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-amber-300 text-stone-900' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        <Check className="w-2.5 h-2.5" />
                        {mappedRulesCount} Recipe
                      </span>
                    ) : (
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-stone-200/80 text-stone-600'
                        }`}
                      >
                        No Recipe
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Recipe Workbench for Selected Drink (8 Cols)            */}
        {/* ========================================================================= */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#2C1D11]/10 p-5 shadow-xs space-y-6">
          {/* Active Drink Info & Variant Size Selector */}
          <div className="border-b border-[#2C1D11]/10 pb-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#4A2E19] bg-[#4A2E19]/10 px-2 py-0.5 rounded-md">
                  Active Drink Configuration
                </span>
                <h3 className="text-lg font-bold text-[#2C1D11] mt-1">
                  {selectedItem?.name}
                </h3>
                <p className="text-xs text-[#8C7A6B]">
                  Category: <span className="font-semibold text-[#4A2E19] capitalize">{selectedItem?.category}</span> · Price: ₱{selectedItem?.price?.toFixed(2)}
                </p>
              </div>

              {/* Live Simulation Badge */}
              <div className="shrink-0 flex items-center gap-2">
                {simulatedAvailability.hasMissingRules ? (
                  <div className="px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-600 text-xs font-semibold flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-stone-500" />
                    <span>No recipe for this size</span>
                  </div>
                ) : simulatedAvailability.available ? (
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>In Stock ({simulatedAvailability.maxServings ?? '∞'} servings available)</span>
                  </div>
                ) : (
                  <div className="px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>Out of Stock (Bottleneck: {simulatedAvailability.bottleneck?.name || 'Depleted'})</span>
                  </div>
                )}
              </div>
            </div>

            {/* Variant Size Tabs */}
            <div className="pt-2">
              <label className="block text-[11px] font-bold text-[#2C1D11] uppercase tracking-wider mb-1.5">
                Target Product Variant (Size):
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {availableSizes.map((size) => {
                  const isCurrentSize = size.toLowerCase() === selectedSize.toLowerCase();
                  const sizeRules = recipeRules.filter(
                    (r) =>
                      r.menu_item_id === selectedMenuItemId &&
                      r.variant_size.toLowerCase() === size.toLowerCase()
                  );
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                        isCurrentSize
                          ? 'bg-[#4A2E19] text-white shadow-sm'
                          : 'bg-[#FDFBF7] hover:bg-[#4A2E19]/10 text-[#2C1D11] border border-[#2C1D11]/10'
                      }`}
                    >
                      <span>{size}</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                          isCurrentSize ? 'bg-amber-300 text-stone-900 font-bold' : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {sizeRules.length} items
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recipe Ingredients Mapping Table */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#2C1D11] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#4A2E19]" />
                  Mapped Raw Inventory Items ({draftRows.length})
                </h4>
                <p className="text-[11px] text-[#8C7A6B]">
                  Deducted automatically from global inventory stock whenever 1x {selectedItem?.name} ({selectedSize}) is sold.
                </p>
              </div>

              {/* Quick Preset Fillers 
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-[#4A2E19]/60 font-medium">Quick Template:</span>
                <button
                  type="button"
                  onClick={() => applyPreset('iced-16oz')}
                  className="px-2 py-1 bg-[#FDFBF7] hover:bg-[#4A2E19]/10 text-[#4A2E19] text-[10px] font-bold rounded-lg border border-[#2C1D11]/10 transition cursor-pointer"
                  title="Auto-fill 16oz Cold Cup + Dome Lid + Straw"
                >
                  16oz Iced
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('iced-22oz')}
                  className="px-2 py-1 bg-[#FDFBF7] hover:bg-[#4A2E19]/10 text-[#4A2E19] text-[10px] font-bold rounded-lg border border-[#2C1D11]/10 transition cursor-pointer"
                  title="Auto-fill 22oz Cold Cup + Dome Lid + Straw"
                >
                  22oz Iced
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('hot-12oz')}
                  className="px-2 py-1 bg-[#FDFBF7] hover:bg-[#4A2E19]/10 text-[#4A2E19] text-[10px] font-bold rounded-lg border border-[#2C1D11]/10 transition cursor-pointer"
                  title="Auto-fill 12oz Hot Cup + Hot Lid"
                >
                  Hot Drink
                </button>
                {draftRows.length > 0 && (
                  <button
                    type="button"
                    onClick={() => applyPreset('clear')}
                    className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold rounded-lg transition cursor-pointer"
                    title="Clear mapped rows"
                  >
                    Clear
                  </button>
                )}
              </div> */}
            </div>

            {/* Rows Table */}
            {draftRows.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-[#2C1D11]/15 rounded-2xl text-center bg-[#FDFBF7]/50 space-y-3">
                <Package className="w-8 h-8 text-[#4A2E19]/40 mx-auto" />
                <div className="max-w-md mx-auto">
                  <p className="text-xs font-bold text-[#2C1D11]">
                    No recipe ingredients mapped for {selectedItem?.name} ({selectedSize})
                  </p>
                  <p className="text-[11px] text-[#8C7A6B] mt-0.5">
                    Orders for this size variant will not deduct packaging or raw supplies until mapped.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="px-4 py-2 bg-[#4A2E19] hover:bg-[#3D2514] text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 transition cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Map First Raw Ingredient</span>
                </button>
              </div>
            ) : (
              <div className="border border-[#2C1D11]/10 rounded-2xl overflow-hidden bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FDFBF7] border-b border-[#2C1D11]/10 text-[#8C7A6B] uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3.5 font-bold">Raw Inventory Supply</th>
                      <th className="py-2.5 px-3.5 font-bold">Current Stock</th>
                      <th className="py-2.5 px-3.5 font-bold text-center">Deduction Qty</th>
                      <th className="py-2.5 px-3.5 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2C1D11]/5">
                    {draftRows.map((row, index) => {
                      const invItem = inventoryItems.find((i) => String(i.id) === String(row.inventory_item_id));
                      const isDepleted = invItem ? invItem.stock_quantity <= 0 : false;
                      const isLow = invItem ? invItem.stock_quantity <= invItem.low_stock_threshold : false;

                      return (
                        <tr key={index} className="hover:bg-[#FDFBF7]/50 transition-colors">
                          {/* Raw Item Selector */}
                          <td className="py-2.5 px-3.5">
                            <select
                              value={row.inventory_item_id}
                              onChange={(e) => handleUpdateRow(index, { inventory_item_id: e.target.value })}
                              className="w-full py-1.5 px-2 bg-[#FDFBF7] border border-[#2C1D11]/15 rounded-xl text-xs text-[#2B231F] font-medium focus:outline-none focus:ring-2 focus:ring-[#4A2E19]"
                            >
                              {inventoryItems.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name} ({item.stock_quantity} {item.unit} available)
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Live Current Stock */}
                          <td className="py-2.5 px-3.5">
                            {invItem ? (
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                                    isDepleted
                                      ? 'bg-red-500'
                                      : isLow
                                      ? 'bg-amber-500'
                                      : 'bg-emerald-500'
                                  }`}
                                />
                                <span className="font-mono font-bold text-xs text-[#2C1D11]">
                                  {invItem.stock_quantity} {invItem.unit}
                                </span>
                              </div>
                            ) : (
                              <span className="text-stone-400 italic">Unknown item</span>
                            )}
                          </td>

                          {/* Deduction Qty Input with Controls */}
                          <td className="py-2.5 px-3.5 text-center">
                            <div className="inline-flex items-center gap-1 bg-[#FDFBF7] border border-[#2C1D11]/15 rounded-xl p-0.5">
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateRow(index, {
                                    quantity_deducted: Math.max(1, row.quantity_deducted - 1),
                                  })
                                }
                                className="w-6 h-6 flex items-center justify-center text-xs text-[#4A2E19] hover:bg-[#4A2E19]/10 rounded-lg cursor-pointer"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min={1}
                                max={500}
                                value={row.quantity_deducted}
                                onChange={(e) =>
                                  handleUpdateRow(index, {
                                    quantity_deducted: Math.max(1, parseInt(e.target.value) || 1),
                                  })
                                }
                                className="w-12 text-center text-xs font-mono font-bold bg-transparent text-[#2C1D11] focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateRow(index, {
                                    quantity_deducted: row.quantity_deducted + 1,
                                  })
                                }
                                className="w-6 h-6 flex items-center justify-center text-xs text-[#4A2E19] hover:bg-[#4A2E19]/10 rounded-lg cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-[10px] text-[#8C7A6B] block mt-0.5">
                              {invItem?.unit || 'unit'} per order
                            </span>
                          </td>

                          {/* Delete Action */}
                          <td className="py-2.5 px-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(index)}
                              className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                              title="Remove raw ingredient from recipe"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Action Buttons: Add Item & Save BOM */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddRow}
                className="px-4 py-2.5 bg-[#FDFBF7] hover:bg-[#4A2E19]/10 text-[#4A2E19] text-xs font-bold rounded-xl border border-[#2C1D11]/15 inline-flex items-center gap-2 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Supply Item</span>
              </button>

              <button
                type="button"
                onClick={handleSaveRecipe}
                disabled={saveStatus === 'saving'}
                className={`px-6 py-2.5 text-xs font-bold rounded-xl inline-flex items-center gap-2 transition cursor-pointer shadow-xs ${
                  saveStatus === 'saved'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#4A2E19] hover:bg-[#3D2514] text-white active:scale-95'
                }`}
              >
                {saveStatus === 'saved' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>Recipe Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Recipe</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeManager;
