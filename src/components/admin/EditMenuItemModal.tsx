import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MenuItem, InventoryItem } from '../../types/cafe';
import { useCafe } from '../../context/CafeContext';
import { useUnsavedChangesGuard } from '../../hooks/useUnsavedChangesGuard';
import {
  X,
  Upload,
  Image as ImageIcon,
  Trash2,
  Plus,
  Layers,
  Sparkles,
  AlertTriangle,
  Check,
  Coffee,
  CheckCircle2,
  Save,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export interface EditMenuItemModalProps {
  isOpen: boolean;
  item?: MenuItem | null;
  onClose: () => void;
  onSaveSuccess?: () => void;
  initialTab?: 'details' | 'variants' | 'bom';
}

interface VariantDraft {
  size: string;
  price: number;
  oat_price?: number;
}

interface BomRecipeDraftRow {
  variant_size: string;
  inventory_item_id: number | string;
  quantity_deducted: number;
}

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export const EditMenuItemModal: React.FC<EditMenuItemModalProps> = ({
  isOpen,
  item,
  onClose,
  onSaveSuccess,
  initialTab = 'details',
}) => {
  const {
    categoriesObj,
    inventoryItems,
    recipeRules,
    updateMenuItem,
    addMenuItem,
    saveRecipeRulesForVariant,
  } = useCafe();

  const isEditing = Boolean(item && item.id);

  // Active Tab: 'details' | 'variants' | 'bom'
  const [activeTab, setActiveTab] = useState<'details' | 'variants' | 'bom'>(initialTab);

  // Tab 1: Product Details State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [basePrice, setBasePrice] = useState<number>(100);
  const [directStockQty, setDirectStockQty] = useState<number>(50);
  const [description, setDescription] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [imagePath, setImagePath] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // Tab 2: Size Variants State
  const [variants, setVariants] = useState<VariantDraft[]>([]);
  const [newSizeName, setNewSizeName] = useState('');
  const [newSizePrice, setNewSizePrice] = useState<number>(120);
  // Full price charged when oat milk is selected — not a standalone add-on amount
  const [newSizeOatPrice, setNewSizeOatPrice] = useState<number>(160);

  // Tab 3: BOM Recipe Mapping State
  const [selectedBomSize, setSelectedBomSize] = useState<string>('16oz');
  const [bomRows, setBomRows] = useState<BomRecipeDraftRow[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Guard active editing against accidental page navigation
  useUnsavedChangesGuard({
    when: isOpen && isDirty,
    role: 'admin',
    reason: isEditing ? `Editing product "${item?.name}"` : 'Creating new menu item',
  });

  // Sort categories by sequence order
  const sortedCategories = useMemo(() => {
    return [...categoriesObj].sort((a, b) => (a.sequence_order || 0) - (b.sequence_order || 0));
  }, [categoriesObj]);

  // Synchronize state on open
  useEffect(() => {
    if (!isOpen) return;

    setActiveTab(initialTab);
    setImageError(null);
    setSubmitFeedback(null);

    if (item) {
      setName(item.name || '');
      setCategory(item.category || sortedCategories[0]?.name || 'Signature Blend');
      setBasePrice(item.price || 0);
      setDirectStockQty(item.stock_quantity ?? 50);
      setDescription(item.description || '');
      setIsAvailable(item.is_available ?? true);
      setImagePath(item.image_path || '');

      // Load variants
      if (item.available_sizes && item.available_sizes.length > 0) {
        setVariants(
          item.available_sizes.map((s) => ({
            size: s.size,
            price: s.price,
            // oat_price is a full price, not a bare add-on amount — fall back to the
            // regular price (i.e. no upcharge) rather than a disconnected flat number.
            oat_price: s.oat_price ?? s.price,
          }))
        );
        setSelectedBomSize(item.available_sizes[0].size);
      } else {
        const defaultSizes: VariantDraft[] = [
          { size: '16oz', price: item.price || 120, oat_price: (item.price || 120) + 40 },
          { size: '22oz', price: (item.price || 120) + 20, oat_price: (item.price || 120) + 20 + 40 },
        ];
        setVariants(defaultSizes);
        setSelectedBomSize('16oz');
      }

      // Load existing BOM rules for this item
      const existingRules = recipeRules.filter((r) => r.menu_item_id === item.id);
      setBomRows(
        existingRules.map((r) => ({
          variant_size: r.variant_size,
          inventory_item_id: r.inventory_item_id,
          quantity_deducted: r.quantity_deducted,
        }))
      );
    } else {
      // New Item defaults
      setName('');
      setCategory(sortedCategories[0]?.name || 'Signature Blend');
      setBasePrice(120);
      setDirectStockQty(50);
      setDescription('');
      setIsAvailable(true);
      setImagePath('');
      const defaultSizes: VariantDraft[] = [
        { size: '16oz', price: 120, oat_price: 160 },
        { size: '22oz', price: 140, oat_price: 180 },
      ];
      setVariants(defaultSizes);
      setSelectedBomSize('16oz');
      setBomRows([]);
    }

    setIsDirty(false);
  }, [isOpen, item, sortedCategories, recipeRules, initialTab]);

  // Raw inventory items linked to this product (across all sizes)
  const linkedRawItems = useMemo(() => {
    const ids = Array.from(new Set(bomRows.map((r) => String(r.inventory_item_id))));
    return inventoryItems.filter((inv) => ids.includes(String(inv.id)));
  }, [bomRows, inventoryItems]);

  // Available size labels list
  const variantSizeNames = variants.map((v) => v.size);

  // BOM rows filtered for the currently selected variant size
  const activeSizeBomRows = bomRows.filter(
    (row) => row.variant_size.toLowerCase() === selectedBomSize.toLowerCase()
  );

  if (!isOpen) return null;

  // Image upload handling
  const handleFileSelect = (file: File) => {
    setImageError(null);
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError('Only PNG, JPG, JPEG, or WEBP image formats are supported.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setImageError(`Image size (${sizeMb} MB) exceeds maximum allowed limit of 5.0 MB.`);
      return;
    }
    setImageFile(file);
    setIsDirty(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImagePath(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePath('');
    setImageFile(null);
    setImageError(null);
    setIsDirty(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Variant helpers
  const handleAddVariant = () => {
    const trimmed = newSizeName.trim();
    if (!trimmed) return;
    if (variants.some((v) => v.size.toLowerCase() === trimmed.toLowerCase())) {
      alert(`Variant size "${trimmed}" already exists.`);
      return;
    }
    const updated = [
      ...variants,
      {
        size: trimmed,
        price: Number(newSizePrice) || basePrice,
        oat_price: Number(newSizeOatPrice) || (Number(newSizePrice) || basePrice) + 40,
      },
    ];
    setVariants(updated);
    setNewSizeName('');
    setNewSizePrice(basePrice + 20);
    // Default the oat price field to a full price roughly ₱40 above the regular price,
    // not a standalone ₱40 — oat_price is the TOTAL charged when oat milk is selected.
    setNewSizeOatPrice(basePrice + 20 + 40);
    setIsDirty(true);
  };

  const handleRemoveVariant = (sizeToRemove: string) => {
    if (variants.length <= 1) {
      alert('A product must maintain at least one size variant.');
      return;
    }
    setVariants((prev) => prev.filter((v) => v.size !== sizeToRemove));
    setBomRows((prev) => prev.filter((r) => r.variant_size !== sizeToRemove));
    if (selectedBomSize === sizeToRemove) {
      setSelectedBomSize(variants.find((v) => v.size !== sizeToRemove)?.size || '16oz');
    }
    setIsDirty(true);
  };

  const handleUpdateVariantPrice = (sizeName: string, newPrice: number) => {
    setVariants((prev) =>
      prev.map((v) => (v.size === sizeName ? { ...v, price: newPrice } : v))
    );
    setIsDirty(true);
  };

  // oat_price is the FULL price charged when oat milk is selected for this size
  // (checkout uses it as a straight replacement, not an add-on) — must stay editable
  // per-row so admins aren't stuck with whatever default was set when the size was added.
  const handleUpdateVariantOatPrice = (sizeName: string, newOatPrice: number) => {
    setVariants((prev) =>
      prev.map((v) => (v.size === sizeName ? { ...v, oat_price: newOatPrice } : v))
    );
    setIsDirty(true);
  };

  // BOM helpers
  const handleAddBomRow = () => {
    const alreadyLinkedIds = activeSizeBomRows.map((r) => String(r.inventory_item_id));
    const availableRaw = inventoryItems.find((inv) => !alreadyLinkedIds.includes(String(inv.id)));
    const defaultRawId = availableRaw ? availableRaw.id : inventoryItems[0]?.id || 1;

    setBomRows((prev) => [
      ...prev,
      {
        variant_size: selectedBomSize,
        inventory_item_id: defaultRawId,
        quantity_deducted: 1,
      },
    ]);
    setIsDirty(true);
  };

  const handleUpdateBomRow = (indexInActive: number, updates: Partial<BomRecipeDraftRow>) => {
    // Find index in main bomRows array
    let matchCount = 0;
    const globalIndex = bomRows.findIndex((row) => {
      if (row.variant_size.toLowerCase() === selectedBomSize.toLowerCase()) {
        if (matchCount === indexInActive) return true;
        matchCount++;
      }
      return false;
    });

    if (globalIndex !== -1) {
      setBomRows((prev) => {
        const copy = [...prev];
        copy[globalIndex] = { ...copy[globalIndex], ...updates };
        return copy;
      });
      setIsDirty(true);
    }
  };

  const handleRemoveBomRow = (indexInActive: number) => {
    let matchCount = 0;
    const globalIndex = bomRows.findIndex((row) => {
      if (row.variant_size.toLowerCase() === selectedBomSize.toLowerCase()) {
        if (matchCount === indexInActive) return true;
        matchCount++;
      }
      return false;
    });

    if (globalIndex !== -1) {
      setBomRows((prev) => prev.filter((_, idx) => idx !== globalIndex));
      setIsDirty(true);
    }
  };

  // Master Transactional Save: Product Details + Variants + BOM Rules
  const handleMasterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Please provide a valid product name.');
      setActiveTab('details');
      return;
    }

    setIsSubmitting(true);
    setSubmitFeedback('Saving transactional configuration...');

    try {
      const targetId = item?.id || Date.now();

      // 1. Prepare Single Transactional Payload for PUT /api/admin/menu-items/{id}
      const transactionalPayload = {
        name: name.trim(),
        category,
        price: Number(basePrice),
        description: description.trim(),
        size: variants[0]?.size || '16oz',
        milk_type: item?.milk_type || 'regular',
        image_path: imagePath || '/images/default-coffee.jpg',
        stock_quantity: Number(directStockQty),
        is_available: isAvailable,
        track_inventory: true,
        available_sizes: variants,
        recipes: bomRows,
      };

      // 2. Dispatch simulated or real backend request
      if (isEditing) {
        // Attempt backend endpoint
        try {
          await fetch(`/api/admin/menu-items/${targetId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transactionalPayload),
          });
        } catch (err) {
          console.info('Backend call simulated in SPA context:', err);
        }

        // Apply transactional changes to local state
        updateMenuItem(targetId, {
          name: transactionalPayload.name,
          category: transactionalPayload.category,
          price: transactionalPayload.price,
          description: transactionalPayload.description,
          stock_quantity: transactionalPayload.stock_quantity,
          is_available: transactionalPayload.is_available,
          image_path: transactionalPayload.image_path,
          available_sizes: variants,
        });

        // Save BOM recipe rules per size variant
        for (const variant of variants) {
          const rulesForSize = bomRows
            .filter((r) => r.variant_size.toLowerCase() === variant.size.toLowerCase())
            .map((r) => ({
              inventory_item_id: r.inventory_item_id,
              quantity_deducted: r.quantity_deducted,
            }));
          saveRecipeRulesForVariant(targetId, variant.size, rulesForSize);
        }
      } else {
        // New item creation
        addMenuItem({
          name: transactionalPayload.name,
          category: transactionalPayload.category,
          price: transactionalPayload.price,
          description: transactionalPayload.description,
          size: transactionalPayload.size,
          milk_type: 'regular',
          image_path: transactionalPayload.image_path,
          stock_quantity: transactionalPayload.stock_quantity,
          track_inventory: true,
          is_available: transactionalPayload.is_available,
          available_sizes: variants,
        });

        // Save BOM rules
        for (const variant of variants) {
          const rulesForSize = bomRows
            .filter((r) => r.variant_size.toLowerCase() === variant.size.toLowerCase())
            .map((r) => ({
              inventory_item_id: r.inventory_item_id,
              quantity_deducted: r.quantity_deducted,
            }));
          saveRecipeRulesForVariant(targetId, variant.size, rulesForSize);
        }
      }

      setIsDirty(false);
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to save menu item configuration:', err);
      alert('An error occurred while saving. Please try again.');
    } finally {
      setIsSubmitting(false);
      setSubmitFeedback(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150 overflow-y-auto">
      <div
        className="bg-[#FDFBF7] w-full max-w-4xl rounded-3xl border border-[#2C1D11]/15 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header with Title and Tabs */}
        <div className="p-5 border-b border-[#2C1D11]/10 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#4A2E19]/10 text-[#4A2E19] flex items-center justify-center">
                <Coffee className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display text-base sm:text-lg font-bold text-[#2C1D11] leading-tight">
                  {isEditing ? `Edit Menu Product: ${item?.name}` : 'Create New Menu Product'}
                </h3>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[#2C1D11]/60 hover:text-[#2C1D11] hover:bg-[#4A2E19]/10 transition cursor-pointer"
              title="Close modal"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3 Integrated Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-5 py-2.5 bg-[#F4EFEB] border-b border-[#2C1D11]/10 overflow-x-auto no-scrollbar">
          {[
            { id: 'details', label: '1. Product Details', icon: Coffee },
            { id: 'variants', label: '2. Sizes & Pricing', icon: TrendingUp },
            { id: 'bom', label: '3. Recipe', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#4A2E19] text-white shadow-xs'
                    : 'bg-white text-[#2C1D11] hover:bg-[#EAE2D7] border border-[#2C1D11]/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Canvas */}
        <form onSubmit={handleMasterSubmit} className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* ========================================================================= */}
          {/* TAB 1: PRODUCT DETAILS                                                    */}
          {/* ========================================================================= */}
          {activeTab === 'details' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Left Column: Core Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2C1D11] mb-1">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setIsDirty(true);
                      }}
                      placeholder="e.g. Spanish Latte"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#2C1D11]/15 rounded-xl text-xs text-[#2C1D11] focus:outline-none focus:ring-2 focus:ring-[#4A2E19]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#2C1D11] mb-1">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => {
                          setCategory(e.target.value);
                          setIsDirty(true);
                        }}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#2C1D11]/15 rounded-xl text-xs text-[#2C1D11] focus:outline-none focus:ring-2 focus:ring-[#4A2E19]"
                      >
                        {sortedCategories.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2C1D11] mb-1">
                        Base Price (₱)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={basePrice}
                        onChange={(e) => {
                          setBasePrice(Number(e.target.value));
                          setIsDirty(true);
                        }}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#2C1D11]/15 rounded-xl text-xs font-mono font-bold text-[#4A2E19] focus:outline-none focus:ring-2 focus:ring-[#4A2E19]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#2C1D11] mb-1">
                        Stock Quantity
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={directStockQty}
                        onChange={(e) => {
                          setDirectStockQty(Number(e.target.value));
                          setIsDirty(true);
                        }}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#2C1D11]/15 rounded-xl text-xs font-mono font-bold text-[#2C1D11] focus:outline-none focus:ring-2 focus:ring-[#4A2E19]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2C1D11] mb-1">
                        Availability
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAvailable(!isAvailable);
                          setIsDirty(true);
                        }}
                        className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border ${
                          isAvailable
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-red-50 text-red-800 border-red-300'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-600' : 'bg-red-600'}`} />
                        <span>{isAvailable ? 'Active on Menu' : 'Disabled'}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2C1D11] mb-1">
                      Description & Flavor
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        setIsDirty(true);
                      }}
                      placeholder="Artisanal espresso blend layered with rich condensed milk and velvety steamed milk..."
                      className="w-full p-3 bg-white border border-[#2C1D11]/15 rounded-xl text-xs text-[#2C1D11] focus:outline-none focus:ring-2 focus:ring-[#4A2E19]"
                    />
                  </div>
                </div>

                {/* Right Column: Image Upload & Preview */}
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-[#2C1D11]">
                    Product Photo
                  </label>

                  <div className="bg-white border-2 border-dashed border-[#2C1D11]/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center relative group min-h-[220px]">
                    {imagePath ? (
                      <div className="w-full flex flex-col items-center gap-3">
                        <img
                          src={imagePath}
                          alt={name || 'Preview'}
                          className="w-36 h-36 object-cover rounded-2xl shadow-md border border-[#2C1D11]/15"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 bg-[#4A2E19] text-white text-xs font-bold rounded-xl hover:bg-[#382212] transition cursor-pointer"
                          >
                            Replace Image
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 text-xs font-bold rounded-xl hover:bg-red-100 transition cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4">
                        <div className="w-12 h-12 rounded-full bg-[#4A2E19]/10 text-[#4A2E19] flex items-center justify-center mb-2">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-[#2C1D11]">No product image uploaded</p>
                        <p className="text-[11px] text-[#2C1D11]/60 mt-1 max-w-xs">
                          PNG, JPG, or WEBP up to 5MB. Clear product imagery boosts customer conversion.
                        </p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-3 px-4 py-2 bg-[#4A2E19] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#382212] transition cursor-pointer flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Photo</span>
                        </button>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ALLOWED_IMAGE_TYPES.join(',')}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileSelect(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                  </div>

                  {imageError && (
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{imageError}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: SIZE VARIANTS & PRICING                                            */}
          {/* ========================================================================= */}
          {activeTab === 'variants' && (
            <div className="space-y-5">
              <div className="bg-white p-4 rounded-2xl border border-[#2C1D11]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-xs text-[#2C1D11]">Configured Size Variants</h4>
                  <p className="text-[11px] text-[#2C1D11]/60">
                    Define custom pricing per cup size. "Oat Milk Price" is the full price charged when oat milk is
                    selected for that size (not an add-on surcharge) — each variant can also link to distinct BOM raw
                    inventory rules.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="text"
                    value={newSizeName}
                    onChange={(e) => setNewSizeName(e.target.value)}
                    placeholder="Size (e.g. 24oz)"
                    className="w-28 px-3 py-1.5 bg-[#F4EFEB] border border-[#2C1D11]/15 rounded-xl text-xs font-bold"
                  />
                  <input
                    type="number"
                    value={newSizePrice}
                    onChange={(e) => setNewSizePrice(Number(e.target.value))}
                    placeholder="₱ Price"
                    title="Regular milk price for this size"
                    className="w-24 px-3 py-1.5 bg-[#F4EFEB] border border-[#2C1D11]/15 rounded-xl text-xs font-mono font-bold"
                  />
                  <input
                    type="number"
                    value={newSizeOatPrice}
                    onChange={(e) => setNewSizeOatPrice(Number(e.target.value))}
                    placeholder="₱ Oat Price"
                    title="Full price for this size when oat milk is selected"
                    className="w-28 px-3 py-1.5 bg-[#F4EFEB] border border-[#2C1D11]/15 rounded-xl text-xs font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="px-3 py-1.5 bg-[#4A2E19] text-white text-xs font-bold rounded-xl hover:bg-[#382212] transition cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Size</span>
                  </button>
                </div>
              </div>

              {/* Variants Table */}
              <div className="bg-white rounded-2xl border border-[#2C1D11]/10 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-[#F4EFEB] border-b border-[#2C1D11]/10 text-[#4A2E19] uppercase text-[10px] font-bold">
                      <th className="py-2.5 px-4">Size Name</th>
                      <th className="py-2.5 px-4">Regular Milk Price (₱)</th>
                      <th className="py-2.5 px-4">Oat Milk Price (₱)</th>
                      <th className="py-2.5 px-4 text-center">BOM Linked Items</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2C1D11]/5">
                    {variants.map((v) => {
                      const rulesCount = bomRows.filter(
                        (r) => r.variant_size.toLowerCase() === v.size.toLowerCase()
                      ).length;
                      return (
                        <tr key={v.size} className="hover:bg-[#FDFBF7]">
                          <td className="py-3 px-4 font-bold text-[#2C1D11]">
                            <span className="px-2.5 py-1 rounded-lg bg-[#4A2E19]/10 text-[#4A2E19] font-mono">
                              {v.size}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 font-mono">
                              <span className="text-[#4A2E19] font-bold">₱</span>
                              <input
                                type="number"
                                min="0"
                                value={v.price}
                                onChange={(e) => handleUpdateVariantPrice(v.size, Number(e.target.value))}
                                className="w-24 px-2.5 py-1 bg-[#F4EFEB] border border-[#2C1D11]/15 rounded-lg text-xs font-bold text-[#4A2E19]"
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 font-mono">
                              <span className="text-[#4A2E19] font-bold">₱</span>
                              <input
                                type="number"
                                min="0"
                                value={v.oat_price ?? v.price}
                                onChange={(e) => handleUpdateVariantOatPrice(v.size, Number(e.target.value))}
                                title="Full price charged when oat milk is selected for this size"
                                className="w-24 px-2.5 py-1 bg-[#F4EFEB] border border-[#2C1D11]/15 rounded-lg text-xs font-bold text-[#4A2E19]"
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EFE8E1] text-[#4A2E19]">
                              {rulesCount} raw ingredient{rulesCount !== 1 ? 's' : ''}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveVariant(v.size)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                              title="Remove size variant"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: BILL OF MATERIALS (BOM) & RECIPE MAPPING                           */}
          {/* ========================================================================= */}
          {activeTab === 'bom' && (
            <div className="space-y-5">
              {/* Variant Selector Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#2C1D11]/10">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#2C1D11]">Configure BOM for Size:</span>
                  <div className="flex items-center gap-1.5">
                    {variantSizeNames.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedBomSize(s)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          selectedBomSize.toLowerCase() === s.toLowerCase()
                            ? 'bg-[#4A2E19] text-white shadow-xs'
                            : 'bg-[#F4EFEB] text-[#2C1D11] hover:bg-[#E2D6C9]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddBomRow}
                  className="px-3 py-1.5 bg-[#4A2E19] text-white text-xs font-bold rounded-xl hover:bg-[#382212] transition cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Link Raw Item</span>
                </button>
              </div>

              {/* BOM Linked Rows Table */}
              <div className="bg-white rounded-2xl border border-[#2C1D11]/10 overflow-hidden">
                {activeSizeBomRows.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <Layers className="w-8 h-8 text-[#4A2E19]/40 mx-auto" />
                    <p className="text-xs font-bold text-[#2C1D11]">
                      No raw inventory items linked to size {selectedBomSize}
                    </p>
                    <p className="text-[11px] text-[#2C1D11]/60 max-w-sm mx-auto">
                      Link bottleneck items like {selectedBomSize} Cups, Matching Lids, Straws, or Coffee Beans so order deductions automatically deplete raw stock.
                    </p>
                    <button
                      type="button"
                      onClick={handleAddBomRow}
                      className="mt-2 px-3.5 py-2 bg-[#4A2E19] text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Link Bottleneck Item</span>
                    </button>
                  </div>
                ) : (
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-[#F4EFEB] border-b border-[#2C1D11]/10 text-[#4A2E19] uppercase text-[10px] font-bold">
                        <th className="py-2.5 px-4">Linked Raw Inventory Item</th>
                        <th className="py-2.5 px-4 text-center">Deduction Qty / Order</th>
                        <th className="py-2.5 px-4">Current Stock Level</th>
                        <th className="py-2.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2C1D11]/5">
                      {activeSizeBomRows.map((row, idx) => {
                        const rawItem = inventoryItems.find(
                          (inv) => String(inv.id) === String(row.inventory_item_id)
                        );
                        return (
                          <tr key={`${row.inventory_item_id}-${idx}`} className="hover:bg-[#FDFBF7]">
                            <td className="py-3 px-4">
                              <select
                                value={String(row.inventory_item_id)}
                                onChange={(e) =>
                                  handleUpdateBomRow(idx, { inventory_item_id: e.target.value })
                                }
                                className="w-full max-w-xs px-3 py-1.5 bg-[#F4EFEB] border border-[#2C1D11]/15 rounded-xl text-xs font-bold text-[#2C1D11]"
                              >
                                {inventoryItems.map((inv) => (
                                  <option key={inv.id} value={String(inv.id)}>
                                    {inv.name} ({inv.unit})
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="py-3 px-4 text-center">
                              <div className="inline-flex items-center gap-1 font-mono font-bold">
                                <input
                                  type="number"
                                  min="1"
                                  step="1"
                                  value={row.quantity_deducted}
                                  onChange={(e) =>
                                    handleUpdateBomRow(idx, {
                                      quantity_deducted: Math.max(1, Number(e.target.value)),
                                    })
                                  }
                                  className="w-16 px-2.5 py-1 bg-[#F4EFEB] border border-[#2C1D11]/15 rounded-lg text-xs text-center font-bold text-[#4A2E19]"
                                />
                                <span className="text-[11px] text-[#2C1D11]/60">
                                  {rawItem?.unit || 'units'}
                                </span>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              {rawItem ? (
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                      rawItem.stock_quantity <= rawItem.low_stock_threshold
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-emerald-100 text-emerald-800'
                                    }`}
                                  >
                                    {rawItem.stock_quantity} {rawItem.unit}
                                  </span>
                                  {rawItem.stock_quantity <= rawItem.low_stock_threshold && (
                                    <span className="text-[10px] text-red-600 font-bold">
                                      (Low Stock)
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400 italic">Not found</span>
                              )}
                            </td>

                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveBomRow(idx)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                title="Remove BOM mapping"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Modal Footer: Action Buttons */}
          <div className="pt-4 border-t border-[#2C1D11]/10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white -mx-5 -mb-5 p-5">
            <div className="text-xs text-[#2C1D11]/70">
              {submitFeedback ? (
                <span className="text-[#4A2E19] font-bold animate-pulse">{submitFeedback}</span>
              ) : isDirty ? (
                <span className="text-amber-700 font-medium">Unsaved configuration changes pending</span>
              ) : (
                <span>All parameters in sync</span>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-[#F4EFEB] hover:bg-[#EAE2D7] text-[#4A2E19] font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-[#4A2E19] hover:bg-[#382212] text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving...' : 'Save Configuration'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMenuItemModal;