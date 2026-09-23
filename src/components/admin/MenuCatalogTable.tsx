import React, { useState, useMemo } from 'react';
import { MenuItem } from '../../types/cafe';
import { useCafe } from '../../context/CafeContext';
import {
  Coffee,
  Search,
  Plus,
  Edit2,
  Trash2,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Filter,
} from 'lucide-react';

export interface MenuCatalogTableProps {
  onOpenEdit: (item: MenuItem, initialTab?: 'details' | 'variants' | 'bom' | 'restock') => void;
  onOpenCreate: () => void;
  onOpenCategories?: () => void;
}

export const MenuCatalogTable: React.FC<MenuCatalogTableProps> = ({
  onOpenEdit,
  onOpenCreate,
  onOpenCategories,
}) => {
  const {
    menuItems,
    categoriesObj,
    deleteMenuItem,
    toggleMenuItemAvailability,
    checkItemOverallAvailability,
    recipeRules,
  } = useCafe();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchQuery, selectedCategory]);

  const handleDelete = (item: MenuItem) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.name}" from the menu catalog? This will also remove any linked BOM recipe rules.`
    );
    if (confirmed) {
      deleteMenuItem(item.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-[#2C1D11]/10 shadow-xs">
        {/* Search & Category Filter */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-2xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2C1D11]/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name or keywords..."
              className="w-full pl-9.5 pr-4 py-2 bg-[#F4EFEB] border border-[#2C1D11]/15 rounded-xl text-xs text-[#2C1D11] focus:outline-none focus:ring-2 focus:ring-[#4A2E19]"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#4A2E19]/70" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-[#F4EFEB] border border-[#2C1D11]/15 rounded-xl text-xs font-bold text-[#2C1D11] focus:outline-none focus:ring-2 focus:ring-[#4A2E19]"
            >
              <option value="all">All Categories ({menuItems.length})</option>
              {categoriesObj.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenCategories && (
            <button
              type="button"
              onClick={onOpenCategories}
              className="px-3.5 py-2 bg-white text-[#4A2E19] border border-[#2C1D11]/15 text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 hover:bg-[#F4EFEB] cursor-pointer transition"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Categories</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenCreate}
            className="px-4 py-2 bg-[#4A2E19] hover:bg-[#382212] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Product</span>
          </button>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-3xl border border-[#2C1D11]/10 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#F4EFEB] border-b border-[#2C1D11]/10 text-[#4A2E19] uppercase tracking-wider text-[10px] font-bold">
                <th className="py-3.5 px-4">Item & Ingredients</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Pricing & Variants</th>
                <th className="py-3.5 px-4 text-center">Stock Level</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2C1D11]/5">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#2C1D11]/60">
                    <Coffee className="w-8 h-8 text-[#4A2E19]/30 mx-auto mb-2" />
                    <p className="font-bold text-xs text-[#2C1D11]">No menu items found</p>
                    <p className="text-[11px]">Try adjusting your search filter or add a new product.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const avail = checkItemOverallAvailability(item.id);
                  const linkedRules = recipeRules.filter((r) => r.menu_item_id === item.id);
                  const hasVariants = item.available_sizes && item.available_sizes.length > 0;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#FDFBF7] transition group cursor-pointer"
                      onClick={() => onOpenEdit(item, 'details')}
                    >
                      {/* Item Details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image_path || '/images/default-coffee.jpg'}
                            alt={item.name}
                            className="w-11 h-11 rounded-xl object-cover border border-[#2C1D11]/10 shrink-0 shadow-2xs"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-[#2C1D11] flex items-center gap-2">
                              <span className="truncate">{item.name}</span>
                              {!avail.isAvailable && (
                                <span className="text-[9px] bg-red-100 text-red-700 border border-red-200 px-1.5 py-0.5 rounded font-bold whitespace-nowrap">
                                  Bottleneck: {avail.missingItemName || 'Depleted'}
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-[#2C1D11]/60 line-clamp-1 mt-0.5">
                              {item.description || 'No description provided.'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <span className="bg-[#EFE8E1] text-[#4A2E19] text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                          {item.category}
                        </span>
                      </td>

                      {/* Price & Variants preview */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono">
                          <span className="font-bold text-xs text-[#4A2E19]">
                            ₱{item.price.toFixed(2)}
                          </span>
                          {hasVariants && (
                            <span className="text-[10px] text-[#2C1D11]/60 block">
                              {item.available_sizes!.length} size option{item.available_sizes!.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock Level */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`font-mono font-bold text-xs px-2 py-0.5 rounded-lg ${
                            item.stock_quantity <= 15
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-stone-100 text-[#2C1D11]'
                          }`}
                        >
                          {item.stock_quantity}
                        </span>
                        {linkedRules.length > 0 && (
                          <span className="block text-[10px] text-[#4A2E19]/70 mt-0.5">
                            {linkedRules.length} BOM rule{linkedRules.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </td>

                      {/* Active / Disabled Status Toggle */}
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => toggleMenuItemAvailability(item.id)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                            item.is_available
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                          title="Click to toggle customer availability"
                        >
                          {item.is_available ? 'Active' : 'Disabled'}
                        </button>
                      </td>

                      {/* Consolidated Actions */}
                      <td
                        className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Primary Unified Edit Item Button */}
                        <button
                          type="button"
                          onClick={() => onOpenEdit(item, 'details')}
                          className="px-3 py-1.5 bg-[#4A2E19] hover:bg-[#382212] text-white rounded-xl text-xs font-bold transition cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                          title="Open Unified Edit Modal (Details, Variants, BOM, and Restock)"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="p-1.5 text-[#DC2626] hover:bg-red-50 rounded-xl transition cursor-pointer"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MenuCatalogTable;
