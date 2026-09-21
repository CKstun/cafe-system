import React, { useState, useMemo } from 'react';
import {
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
} from 'lucide-react';
import { useCafe } from '../../context/CafeContext';
import { MenuItem, InventoryItem } from '../../types/cafe';

interface RecipeLinkerProps {
  initialMenuItemId?: number;
  onClose?: () => void;
  onOpenInventory?: () => void;
}

interface LinkedItemRow {
  inventory_item_id: number | string;
  quantity_deducted: number;
}

export const RecipeLinker: React.FC<RecipeLinkerProps> = ({
  initialMenuItemId,
  onClose,
  onOpenInventory,
}) => {
  const {
    menuItems,
    inventoryItems,
    recipeRules,
    saveRecipeRulesForVariant,
    checkVariantAvailability,
  } = useCafe();

  // Selected Drink & Variant state
  const [searchDrink, setSearchDrink] = useState('');
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<number>(() => {
    if (initialMenuItemId) return initialMenuItemId;
    // Default to first drink that has sizes
    const drink = menuItems.find((m) => m.available_sizes && m.available_sizes.length > 0);
    return drink ? drink.id : menuItems[0]?.id || 201;
  });

  const selectedItem = useMemo(() => {
    return menuItems.find((m) => m.id === selectedMenuItemId) || menuItems[0];
  }, [menuItems, selectedMenuItemId]);

  // Sizes available for the selected drink
  const availableSizes = useMemo(() => {
    if (selectedItem?.available_sizes && selectedItem.available_sizes.length > 0) {
      return selectedItem.available_sizes.map((s) => s.size);
    }
    return [selectedItem?.size || 'Regular'];
  }, [selectedItem]);

  const [selectedSize, setSelectedSize] = useState<string>(() => availableSizes[0] || '16oz');

  // When selectedItem changes, ensure selectedSize is valid
  React.useEffect(() => {
    if (!availableSizes.includes(selectedSize)) {
      setSelectedSize(availableSizes[0] || '16oz');
    }
  }, [availableSizes, selectedSize]);

  // Current active draft recipe for (selectedMenuItemId, selectedSize)
  const existingRules = useMemo(() => {
    if (!selectedItem) return [];
    return recipeRules.filter(
      (r) =>
        r.menu_item_id === selectedMenuItemId &&
        r.variant_size.toLowerCase() === selectedSize.toLowerCase()
    );
  }, [recipeRules, selectedMenuItemId, selectedSize]);

  // Draft rows for editing
  const [draftRows, setDraftRows] = useState<LinkedItemRow[]>([]);
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  // Sync draftRows whenever selection or existing rules change
  React.useEffect(() => {
    setDraftRows(
      existingRules.map((r) => ({
        inventory_item_id: r.inventory_item_id,
        quantity_deducted: r.quantity_deducted,
      }))
    );
    setIsSavedRecently(false);
  }, [existingRules]);

  // Filtered Drinks for selector
  const filteredDrinks = useMemo(() => {
    return menuItems.filter((item) =>
      item.name.toLowerCase().includes(searchDrink.toLowerCase()) ||
      item.category.toLowerCase().includes(searchDrink.toLowerCase())
    );
  }, [menuItems, searchDrink]);

  // Add row
  const handleAddRow = () => {
    // Pick first inventory item not already in draftRows, or just the first item
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
    setIsSavedRecently(false);
  };

  // Update row
  const handleUpdateRow = (index: number, updates: Partial<LinkedItemRow>) => {
    setDraftRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
    setIsSavedRecently(false);
  };

  // Remove row
  const handleRemoveRow = (index: number) => {
    setDraftRows((prev) => prev.filter((_, i) => i !== index));
    setIsSavedRecently(false);
  };

  // Save recipe
  const handleSaveRecipe = () => {
    if (!selectedItem) return;
    saveRecipeRulesForVariant(selectedMenuItemId, selectedSize, draftRows);
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 3000);
  };

  // Preset Fills
  const applyPreset = (presetType: '16oz-cold' | '22oz-cold' | '12oz-hot' | 'meal-tray') => {
    if (presetType === '16oz-cold') {
      const cup = inventoryItems.find((it) => it.name.includes('16oz') && it.name.includes('Cup')) || inventoryItems[0];
      const lid = inventoryItems.find((it) => it.name.includes('16oz') && it.name.includes('Lid')) || inventoryItems[3];
      const straw = inventoryItems.find((it) => it.name.includes('Straw')) || inventoryItems[6];

      const rows: LinkedItemRow[] = [];
      if (cup) rows.push({ inventory_item_id: cup.id, quantity_deducted: 1 });
      if (lid) rows.push({ inventory_item_id: lid.id, quantity_deducted: 1 });
      if (straw) rows.push({ inventory_item_id: straw.id, quantity_deducted: 1 });
      setDraftRows(rows);
    } else if (presetType === '22oz-cold') {
      const cup = inventoryItems.find((it) => it.name.includes('22oz') && it.name.includes('Cup')) || inventoryItems[1];
      const lid = inventoryItems.find((it) => it.name.includes('22oz') && it.name.includes('Lid')) || inventoryItems[4];
      const straw = inventoryItems.find((it) => it.name.includes('Straw')) || inventoryItems[6];

      const rows: LinkedItemRow[] = [];
      if (cup) rows.push({ inventory_item_id: cup.id, quantity_deducted: 1 });
      if (lid) rows.push({ inventory_item_id: lid.id, quantity_deducted: 1 });
      if (straw) rows.push({ inventory_item_id: straw.id, quantity_deducted: 1 });
      setDraftRows(rows);
    } else if (presetType === '12oz-hot') {
      const cup = inventoryItems.find((it) => it.name.includes('12oz') && it.name.includes('Cup')) || inventoryItems[2];
      const lid = inventoryItems.find((it) => it.name.includes('12oz') && it.name.includes('Lid')) || inventoryItems[5];

      const rows: LinkedItemRow[] = [];
      if (cup) rows.push({ inventory_item_id: cup.id, quantity_deducted: 1 });
      if (lid) rows.push({ inventory_item_id: lid.id, quantity_deducted: 1 });
      setDraftRows(rows);
    } else if (presetType === 'meal-tray') {
      const box = inventoryItems.find((it) => it.name.includes('Tray') || it.name.includes('Clamshell')) || inventoryItems[10];
      const bag = inventoryItems.find((it) => it.name.includes('Bag')) || inventoryItems[8];

      const rows: LinkedItemRow[] = [];
      if (box) rows.push({ inventory_item_id: box.id, quantity_deducted: 1 });
      if (bag) rows.push({ inventory_item_id: bag.id, quantity_deducted: 1 });
      setDraftRows(rows);
    }
    setIsSavedRecently(false);
  };

  // Stock Forecaster: Calculate how many servings can be prepared
  const stockForecast = useMemo(() => {
    if (draftRows.length === 0) {
      return { maxServings: null, bottleneckItem: null };
    }

    let minServings = Infinity;
    let bottleneck: InventoryItem | null = null;

    draftRows.forEach((row) => {
      const invItem = inventoryItems.find((it) => String(it.id) === String(row.inventory_item_id));
      if (invItem && row.quantity_deducted > 0) {
        const servings = Math.floor(invItem.stock_quantity / row.quantity_deducted);
        if (servings < minServings) {
          minServings = servings;
          bottleneck = invItem;
        }
      }
    });

    return {
      maxServings: minServings === Infinity ? 0 : minServings,
      bottleneckItem: bottleneck as InventoryItem | null,
    };
  }, [draftRows, inventoryItems]);

  const availabilityCheck = checkVariantAvailability(selectedMenuItemId, selectedSize);

  return (
    <div className="space-y-6" id="admin-recipe-bom-linker">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#5C3D2E]/10 text-[#5C3D2E] flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              Dynamic Recipe & BOM (Bill of Materials) Mapping
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Link bottleneck raw inventory items (straws, cups, lids, bags) to specific drink & meal size variants
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenInventory && (
            <button
              type="button"
              onClick={onOpenInventory}
              className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-2xl flex items-center gap-2 transition"
            >
              <Package className="w-4 h-4 text-[#5C3D2E]" />
              Manage Raw Inventory
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-2xl transition"
            >
              Back
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Menu Items Selector (4 cols) */}
        <div className="lg:col-span-4 bg-white p-4 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col h-[650px]">
          <div className="pb-3 border-b border-stone-100">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-2">
              1. Select Drink / Menu Item
            </span>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchDrink}
                onChange={(e) => setSearchDrink(e.target.value)}
                placeholder="Search drinks & meals..."
                className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#5C3D2E]"
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-stone-100 mt-2 pr-1">
            {filteredDrinks.map((item) => {
              const isSelected = item.id === selectedMenuItemId;
              const hasSizes = item.available_sizes && item.available_sizes.length > 0;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedMenuItemId(item.id);
                  }}
                  className={`w-full text-left p-3 rounded-2xl transition flex items-center justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-[#5C3D2E] text-white shadow-xs'
                      : 'hover:bg-stone-50 text-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      <Coffee className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                        {item.name}
                      </p>
                      <p className={`text-[10px] mt-0.5 truncate ${isSelected ? 'text-white/80' : 'text-stone-400'}`}>
                        {item.category} • {hasSizes ? `${item.available_sizes!.length} sizes` : 'Single size'}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-stone-300'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Recipe / BOM Editor (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Selected Item Banner & Size Variant Tabs */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  Configuring Recipe For
                </span>
                <h3 className="text-lg font-bold text-stone-900 leading-tight mt-0.5">
                  {selectedItem?.name}
                </h3>
                <p className="text-xs text-stone-500">
                  Category: <span className="font-semibold text-stone-700">{selectedItem?.category}</span> • Base Price: ₱{selectedItem?.price.toFixed(2)}
                </p>
              </div>

              {/* Status Pill */}
              <div>
                {availabilityCheck.isAvailable ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Variant In Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-800 border border-red-200 rounded-full text-xs font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Out of Stock ({availabilityCheck.missingItemName || 'Depleted'})
                  </span>
                )}
              </div>
            </div>

            {/* Size Variant Selector Tabs */}
            <div className="mt-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                2. Select Size Variant to Map
              </label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((sz) => {
                  const isSzActive = selectedSize.toLowerCase() === sz.toLowerCase();
                  const szCheck = checkVariantAvailability(selectedMenuItemId, sz);

                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 border ${
                        isSzActive
                          ? 'bg-[#5C3D2E] text-white border-[#5C3D2E] shadow-xs'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      <span>{sz} Variant</span>
                      {!szCheck.isAvailable && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                          isSzActive ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700'
                        }`}>
                          Depleted
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* BOM Mapping Table */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
              <div>
                <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#5C3D2E]" />
                  Linked Bill of Materials (BOM) Requirements
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Every time a <span className="font-semibold text-stone-800">{selectedItem?.name} ({selectedSize})</span> is ordered, these raw units will be automatically deducted.
                </p>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-stone-400 font-semibold mr-1">Presets:</span>
                <button
                  type="button"
                  onClick={() => applyPreset('16oz-cold')}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-bold rounded-lg transition"
                >
                  16oz Cold
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('22oz-cold')}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-bold rounded-lg transition"
                >
                  22oz Cold
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('12oz-hot')}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-bold rounded-lg transition"
                >
                  12oz Hot
                </button>
              </div>
            </div>

            {/* Rows list */}
            {draftRows.length === 0 ? (
              <div className="py-10 text-center px-4 bg-stone-50 rounded-2xl border border-dashed border-stone-300">
                <Package className="w-8 h-8 text-stone-300 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-stone-700">No raw inventory items linked yet</p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Click &quot;+ Add Inventory Item&quot; below or choose a Quick Preset to attach cups, lids, straws, or bags.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {draftRows.map((row, idx) => {
                  const targetInv = inventoryItems.find((inv) => String(inv.id) === String(row.inventory_item_id));
                  const isOut = targetInv ? targetInv.stock_quantity <= 0 : false;
                  const isLow = targetInv ? targetInv.stock_quantity > 0 && targetInv.stock_quantity <= targetInv.low_stock_threshold : false;

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 transition ${
                        isOut
                          ? 'bg-red-50/50 border-red-200'
                          : isLow
                          ? 'bg-amber-50/40 border-amber-200'
                          : 'bg-stone-50/80 border-stone-200/80'
                      }`}
                    >
                      {/* Inventory Item Dropdown */}
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                          Raw Inventory Item #{idx + 1}
                        </label>
                        <select
                          value={row.inventory_item_id}
                          onChange={(e) => handleUpdateRow(idx, { inventory_item_id: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#5C3D2E]"
                        >
                          {inventoryItems.map((inv) => (
                            <option key={inv.id} value={inv.id}>
                              {inv.name} ({inv.stock_quantity} {inv.unit} in stock)
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity Deducted */}
                      <div className="w-full sm:w-36">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                          Qty Deducted / Sale
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            value={row.quantity_deducted}
                            onChange={(e) =>
                              handleUpdateRow(idx, {
                                quantity_deducted: Math.max(1, Number(e.target.value)),
                              })
                            }
                            className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-mono font-bold text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#5C3D2E]"
                          />
                          <span className="absolute right-3 top-2 text-xs text-stone-400 font-semibold">
                            {targetInv?.unit || 'unit'}
                          </span>
                        </div>
                      </div>

                      {/* Stock Reserve status */}
                      <div className="w-full sm:w-40 flex items-center gap-2">
                        <div>
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">
                            Available Reserve
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className={`text-xs font-bold font-mono ${
                                isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-stone-800'
                              }`}
                            >
                              {targetInv?.stock_quantity ?? 0} {targetInv?.unit}
                            </span>
                            {isOut && (
                              <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-md font-bold">
                                Out
                              </span>
                            )}
                            {isLow && !isOut && (
                              <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md font-bold">
                                Low
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <div className="flex items-center justify-end sm:pt-4">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(idx)}
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-white rounded-xl transition"
                          title="Remove requirement"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Requirement Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleAddRow}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-2xl flex items-center gap-2 transition cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#5C3D2E]" />
                + Add Inventory Item Requirement
              </button>
            </div>

            {/* Stock Forecaster Alert Box */}
            {stockForecast.maxServings !== null && (
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3 mt-4 ${
                  stockForecast.maxServings === 0
                    ? 'bg-red-50 border-red-200'
                    : stockForecast.maxServings < 20
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-stone-50 border-stone-200'
                }`}
              >
                <Info
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    stockForecast.maxServings === 0
                      ? 'text-red-600'
                      : stockForecast.maxServings < 20
                      ? 'text-amber-600'
                      : 'text-[#5C3D2E]'
                  }`}
                />
                <div className="text-xs">
                  <span className="font-bold text-stone-900 block">
                    Stock Forecaster & Capacity Analysis:
                  </span>
                  <p className="text-stone-600 mt-0.5">
                    Based on current inventory counts, you can prepare up to{' '}
                    <span className="font-bold text-stone-900 font-mono text-sm">
                      {stockForecast.maxServings}
                    </span>{' '}
                    servings of {selectedItem?.name} ({selectedSize}).
                    {stockForecast.bottleneckItem && (
                      <span className="block mt-1 font-medium text-stone-700">
                        Primary Bottleneck:{' '}
                        <strong className="text-stone-900">{stockForecast.bottleneckItem.name}</strong> (
                        {stockForecast.bottleneckItem.stock_quantity}{' '}
                        {stockForecast.bottleneckItem.unit} remaining).
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Save Action Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-100">
              <span className="text-xs text-stone-400">
                {isSavedRecently ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Recipe saved successfully!
                  </span>
                ) : (
                  'Unsaved recipe changes are kept in draft until saved.'
                )}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDraftRows(
                      existingRules.map((r) => ({
                        inventory_item_id: r.inventory_item_id,
                        quantity_deducted: r.quantity_deducted,
                      }))
                    );
                  }}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-bold rounded-2xl flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>

                <button
                  type="button"
                  onClick={handleSaveRecipe}
                  className="px-5 py-2.5 bg-[#5C3D2E] hover:bg-[#4A2F22] active:scale-95 text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Save Recipe for {selectedSize}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
