import React from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

export interface DeleteConfirmationModalProps {
  isOpen: boolean;
  itemName: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isDeleting?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  itemName,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-[#FDFBF7] w-full max-w-md rounded-3xl p-6 border border-[#2C1D11]/15 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2C1D11]/10">
          <div className="flex items-center gap-2 text-[#DC2626]">
            <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <h3 className="font-display text-base sm:text-lg font-bold text-[#2C1D11]">
              Delete Menu Item?
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 text-[#2C1D11]/60 hover:text-[#2C1D11] rounded-full transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-4 space-y-2">
          <p className="text-xs sm:text-sm text-[#2C1D11]/80 leading-relaxed">
            Are you sure you want to delete <span className="font-bold text-[#2C1D11] underline decoration-red-400">{itemName}</span>? This action cannot be undone.
          </p>
          <p className="text-[11px] text-[#2C1D11]/60">
            Deleting this product will remove it from the customer menu, clean up all linked size configurations, and detach any recipe rules.
          </p>
        </div>

        {/* Controls */}
        <div className="pt-3 border-t border-[#2C1D11]/10 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 bg-[#F4EFEB] hover:bg-[#EAE2D7] text-[#4A2E19] text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
          >
            {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Yes, Delete Item</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
