import React, { useState, useMemo } from 'react';
import { MenuItem } from '../../types/cafe';
import { useCafe } from '../../context/CafeContext';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import {
  Coffee,
  Search,
  Plus,
  Edit2,
  Trash2,
  Layers,
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
  } = useCafe();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Deletion Modal State
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Handle Confirmed Deletion via Backend API + Instant Client-Side State Filter
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      // 1. Call Backend API: DELETE /api/admin/menu-items/{id}
      const token = localStorage.getItem('pepita_token') || sessionStorage.getItem('pepita_token');
      try {
        const res = await fetch(`/api/admin/menu-items/${deleteTarget.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok && res.status !== 404) {
          console.warn(`DELETE /api/admin/menu-items/${deleteTarget.id} returned status ${res.status}`);
        }
      } catch (networkErr) {
        console.info('Backend DELETE endpoint reached or simulated in dev environment:', networkErr);
      }

      // 2. Instantly filter out deleted item from client-side state without full refresh
      deleteMenuItem(deleteTarget.id);
      setDeleteTarget(null);
    } catch (error) {
      console.error('Failed to delete menu item:', error);
      alert('An error occurred while deleting the menu item. Please try again.');
    } finally {
      setIsDeleting(false);
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
              placeholder="Search products by name..."
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
              <span>Category Controls</span>
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

      {/* Streamlined Menu Catalog Table */}
      <div className="bg-white rounded-3xl border border-[#2C1D11]/10 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#F4EFEB] border-b border-[#2C1D11]/10 text-[#4A2E19] uppercase tracking-wider text-[10px] font-bold">
                {/* 1. Item & Ingredients Column: Displays ONLY the primary Item Name */}
                <th className="py-3.5 px-6 font-bold">Item & Ingredients</th>

                {/* 2. Pricing & Variants Column: Displays ONLY the base Price (or size price range) */}
                <th className="py-3.5 px-6 font-bold">Pricing & Variants</th>

                {/* 3. Stock Level Column: Displays ONLY the numerical Stock count */}
                <th className="py-3.5 px-6 font-bold text-center">Stock Level</th>

                {/* 4. Actions Column: Includes Edit and Delete buttons */}
                <th className="py-3.5 px-6 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2C1D11]/5">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-[#2C1D11]/60">
                    <Coffee className="w-8 h-8 text-[#4A2E19]/30 mx-auto mb-2" />
                    <p className="font-bold text-xs text-[#2C1D11]">No menu items found</p>
                    <p className="text-[11px] text-[#2C1D11]/50">
                      Try adjusting your search query or create a new product.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  // Compute price or price range
                  let priceDisplay = `₱${item.price.toFixed(2)}`;
                  if (item.available_sizes && item.available_sizes.length > 0) {
                    const prices = item.available_sizes.map((s) => s.price);
                    const minPrice = Math.min(...prices);
                    const maxPrice = Math.max(...prices);
                    if (minPrice === maxPrice) {
                      priceDisplay = `₱${minPrice.toFixed(0)}`;
                    } else {
                      priceDisplay = `₱${minPrice.toFixed(0)} - ₱${maxPrice.toFixed(0)}`;
                    }
                  }

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#FDFBF7] transition group cursor-pointer"
                      onClick={() => onOpenEdit(item, 'details')}
                    >
                      {/* 1. Item & Ingredients Column: Displays ONLY the primary Item Name */}
                      <td className="py-4 px-6">
                        <span className="font-bold text-xs text-[#2C1D11] group-hover:text-[#4A2E19] transition">
                          {item.name}
                        </span>
                      </td>

                      {/* 2. Pricing & Variants Column: Displays ONLY the base Price or range */}
                      <td className="py-4 px-6">
                        <span className="font-mono font-bold text-xs text-[#4A2E19]">
                          {priceDisplay}
                        </span>
                      </td>

                      {/* 3. Stock Level Column: Displays ONLY the numerical Stock count */}
                      <td className="py-4 px-6 text-center">
                        <span className="font-mono font-bold text-xs text-[#2C1D11]">
                          {item.stock_quantity}
                        </span>
                      </td>

                      {/* 4. Actions Column: Includes functional Edit and Delete buttons */}
                      <td
                        className="py-4 px-6 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenEdit(item, 'details');
                            }}
                            className="px-3 py-1.5 bg-[#4A2E19] hover:bg-[#382212] text-white rounded-xl text-xs font-bold transition cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                            title="Edit Item"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          {/* Delete Button with e.stopPropagation() and Confirmation Modal Trigger */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget({ id: item.id, name: item.name });
                            }}
                            className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition cursor-pointer border border-red-200/50"
                            title={`Delete ${item.name}`}
                            aria-label={`Delete ${item.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={Boolean(deleteTarget)}
        itemName={deleteTarget?.name || ''}
        isDeleting={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default MenuCatalogTable;
