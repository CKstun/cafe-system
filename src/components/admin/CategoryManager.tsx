import React, { useState } from 'react';
import { Category } from '../../types/cafe';
import { useCafe } from '../../context/CafeContext';
import { useUnsavedChangesGuard } from '../../hooks/useUnsavedChangesGuard';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Layers,
  AlertTriangle,
  Check,
  Search,
} from 'lucide-react';

export const CategoryManager: React.FC = () => {
  const {
    categoriesObj,
    addCategory,
    updateCategory,
    deleteCategory,
    menuItems,
  } = useCafe();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Create / Edit Category state
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [sequenceOrder, setSequenceOrder] = useState<number>(1);
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Guard active editing against accidental page refresh or navigation
  useUnsavedChangesGuard({
    when: showModal && isDirty,
    role: 'admin',
    reason: editingCategory
      ? `Editing category "${editingCategory.name}"`
      : 'Creating new menu category',
  });

  // Filtered & sorted categories
  const filteredCategories = categoriesObj.filter((cat) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      cat.name.toLowerCase().includes(q) ||
      (cat.description && cat.description.toLowerCase().includes(q))
    );
  });

  const sortedCategories = [...filteredCategories].sort(
    (a, b) => (a.sequence_order || 0) - (b.sequence_order || 0)
  );

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setSequenceOrder(categoriesObj.length + 1);
    setDescription('');
    setErrorMessage(null);
    setIsDirty(false);
    setShowModal(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSequenceOrder(cat.sequence_order || 1);
    setDescription(cat.description || '');
    setErrorMessage(null);
    setIsDirty(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (isDirty) {
      const confirm = window.confirm(
        'You have unsaved changes in progress. Are you sure you want to discard them?'
      );
      if (!confirm) return;
    }
    setShowModal(false);
    setIsDirty(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();

    if (!cleanName) {
      setErrorMessage('Category name cannot be empty.');
      return;
    }

    // Check duplicate name
    const exists = categoriesObj.some(
      (c) =>
        c.name.toLowerCase() === cleanName.toLowerCase() &&
        (!editingCategory || c.id !== editingCategory.id)
    );
    if (exists) {
      setErrorMessage(`A category named "${cleanName}" already exists.`);
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: cleanName,
        sequence_order: sequenceOrder,
        description: description.trim(),
      });
    } else {
      addCategory({
        name: cleanName,
        sequence_order: sequenceOrder,
        description: description.trim(),
        is_active: true,
      });
    }

    setIsDirty(false);
    setShowModal(false);
  };

  const handleDelete = (cat: Category) => {
    const itemCount = menuItems.filter((m) => m.category === cat.name).length;
    if (itemCount > 0) {
      const confirm = window.confirm(
        `Category "${cat.name}" has ${itemCount} associated menu item(s). Deleting it will leave these items uncategorized. Are you sure you want to proceed?`
      );
      if (!confirm) return;
    } else {
      const confirm = window.confirm(`Are you sure you want to delete category "${cat.name}"?`);
      if (!confirm) return;
    }

    deleteCategory(cat.id);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar & New Category Button Controls */}
      {/* Search Bar & New Category Button Header Bar */}
      <div className="flex items-center justify-between gap-4 mb-4">
        {/* Search Input - Expands to take available space */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#2C1D11]/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-9 pr-8 py-2 bg-white border border-[#2C1D11]/15 rounded-xl text-xs text-[#2C1D11] placeholder:text-[#2C1D11]/40 focus:outline-none focus:ring-2 focus:ring-[#4A2E19] transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[#2C1D11]/40 hover:text-[#2C1D11] rounded-full transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* New Category Button - Pushed to the right end */}
        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-[#4A2E19] hover:bg-[#382212] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Category CRUD Table */}
      <div className="bg-white rounded-3xl border border-[#2C1D11]/10 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#F4EFEB] border-b border-[#2C1D11]/10 text-[#4A2E19] uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-5 font-bold text-center w-20">Seq #</th>
                <th className="py-3.5 px-5 font-bold">Category Name</th>
                <th className="py-3.5 px-5 font-bold">Description</th>
                <th className="py-3.5 px-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2C1D11]/5">
              {sortedCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[#2C1D11]/50">
                    {searchQuery
                      ? `No categories matching "${searchQuery}".`
                      : 'No categories found. Click "New Category" to create one.'}
                  </td>
                </tr>
              ) : (
                sortedCategories.map((cat, idx) => (
                  <tr key={cat.id} className="hover:bg-[#FDFBF7] transition group">
                    {/* Sequence Rank */}
                    <td className="py-3.5 px-5 text-center font-mono font-bold text-[#4A2E19]">
                      <span className="inline-block px-2.5 py-0.5 rounded-lg bg-[#4A2E19]/10 text-[#4A2E19]">
                        #{cat.sequence_order || idx + 1}
                      </span>
                    </td>

                    {/* Category Name */}
                    <td className="py-3.5 px-5">
                      <span className="font-bold text-[#2C1D11]">{cat.name}</span>
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-5 text-[#2C1D11]/70 max-w-xs truncate">
                      {cat.description || <span className="italic text-[#2C1D11]/40">No description</span>}
                    </td>

                    {/* Action Controls: Edit & Delete */}
                    <td className="py-3.5 px-5 text-right whitespace-nowrap space-x-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 text-[#4A2E19] hover:bg-[#4A2E19]/10 rounded-lg transition cursor-pointer"
                        title="Edit Category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat)}
                        className="p-1.5 text-[#DC2626] hover:bg-red-50 rounded-lg transition cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div
            className="bg-[#FDFBF7] w-full max-w-md rounded-3xl p-6 border border-[#2C1D11]/15 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#2C1D11]/10">
              <h3 className="font-display text-lg font-bold text-[#2C1D11]">
                {editingCategory ? 'Update Category' : 'Create New Category'}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 text-[#2C1D11]/60 hover:text-[#2C1D11] rounded-full transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#4A2E19] mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="e.g. Espresso, Non-Coffee, Pastries"
                  className="w-full px-4 py-2.5 bg-[#F4EFEB] border border-[#2C1D11]/15 rounded-xl text-xs text-[#2C1D11] focus:outline-none focus:ring-2 focus:ring-[#4A2E19]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A2E19] mb-1">
                  Display Sequence Position (Rank)
                </label>
                <input
                  type="number"
                  min="1"
                  value={sequenceOrder}
                  onChange={(e) => {
                    setSequenceOrder(parseInt(e.target.value) || 1);
                    setIsDirty(true);
                  }}
                  className="w-full px-4 py-2.5 bg-[#F4EFEB] border border-[#2C1D11]/15 rounded-xl text-xs font-mono font-bold text-[#2C1D11] focus:outline-none focus:ring-2 focus:ring-[#4A2E19]"
                />
                <p className="text-[10px] text-[#2C1D11]/60 mt-1">
                  Lower numbers appear first on customer menu navigation tabs.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A2E19] mb-1">
                  Description / Menu Subtitle
                </label>
                <textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Short description of this category..."
                  rows={2}
                  className="w-full p-3 bg-[#F4EFEB] border border-[#2C1D11]/15 rounded-xl text-xs text-[#2C1D11] focus:outline-none focus:ring-2 focus:ring-[#4A2E19]"
                />
              </div>

              {errorMessage && (
                <div className="flex items-center gap-1.5 text-xs text-[#DC2626] bg-red-50 p-2.5 rounded-xl border border-red-200">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-2.5 bg-[#EFE8E1] text-[#4A2E19] font-bold text-xs rounded-xl hover:bg-[#E2D6C9] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#4A2E19] text-white font-bold text-xs rounded-xl shadow hover:bg-[#382212] transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingCategory ? 'Save Changes' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;