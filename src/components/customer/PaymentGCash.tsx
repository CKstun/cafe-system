import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PaymentGCashProps {
  subtotal: number;
  receiptFile: File | null;
  receiptPreview: string | null;
  onReceiptChange: (file: File | null, previewUrl: string | null) => void;
  uploadError: string | null;
  setUploadError: (err: string | null) => void;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export const PaymentGCash: React.FC<PaymentGCashProps> = ({
  subtotal,
  receiptFile,
  receiptPreview,
  onReceiptChange,
  uploadError,
  setUploadError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const processFile = (file: File) => {
    // Validate MIME type
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      setUploadError('Invalid file format. Please upload a .png, .jpg, .jpeg, or .webp image.');
      return;
    }

    // Validate File Size (<= 5MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setUploadError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 5MB.`);
      return;
    }

    setUploadError(null);

    // Read and create thumbnail preview
    const reader = new FileReader();
    reader.onload = () => {
      onReceiptChange(file, reader.result as string);
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file. Please try selecting again.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReceiptChange(null, null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReplace = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="mt-4 p-5 bg-[#F4EFEB] rounded-3xl border border-[#E6DDD4] shadow-xs text-center space-y-4 animate-in fade-in duration-200">
      {/* Header Info */}
      <div className="space-y-0.5">
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#5C4033]">
          Official Merchant QR
        </span>
        <p className="text-xs font-bold text-[#2B231F]">
          Scan to Pay ₱{subtotal.toFixed(2)}
        </p>
      </div>

      {/* Centered QR Code */}
      <div className="flex flex-col items-center justify-center w-full py-1">
        <div className="w-44 h-44 bg-white mx-auto border-2 border-[#5C4033]/20 rounded-2xl flex items-center justify-center p-2 shadow-sm">
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=GCASH-PAYMENT-CAFEPITA-ORDER"
            alt="Café Pepita GCash QR Code"
            className="w-full h-full object-contain rounded-lg"
          />
        </div>
        <p className="text-[10px] text-[#8C7A6B] mt-1.5">
          Account: <strong className="text-[#2B231F]">Café Pepita (0917-XXX-4567)</strong>
        </p>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        id="gcash-receipt-upload"
      />

      {/* Image Upload Dropzone Section */}
      <div className="text-left pt-1">
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5C4033]">
            Upload Proof of Payment <span className="text-red-600">*</span>
          </label>
          <span className="text-[10px] text-[#8C7A6B]">
            PNG, JPG, WEBP (Max 5MB)
          </span>
        </div>

        {/* State A: File Uploaded & Preview Available */}
        {receiptPreview ? (
          <div className="bg-[#FDFBF7] border-2 border-emerald-300 rounded-2xl p-3.5 shadow-2xs space-y-3">
            <div className="flex items-center gap-3">
              {/* Receipt Thumbnail */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-white border border-[#E6DDD4] shrink-0 shadow-2xs">
                <img
                  src={receiptPreview}
                  alt="Uploaded GCash Proof of Payment"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* File Info & Success Status */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold mb-0.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Proof of Payment Attached</span>
                </div>
                <p className="text-xs font-semibold text-[#2B231F] truncate">
                  {receiptFile ? receiptFile.name : 'gcash_payment_receipt.jpg'}
                </p>
                {receiptFile && (
                  <p className="text-[10px] text-[#8C7A6B]">
                    {(receiptFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                )}
              </div>
            </div>

            {/* Replace / Remove Action Buttons */}
            <div className="flex items-center gap-2 pt-1 border-t border-[#EFE8E1]">
              <button
                type="button"
                onClick={handleReplace}
                className="flex-1 py-2 px-3 bg-white hover:bg-[#F4EFEB] border border-[#E6DDD4] text-[#5C4033] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Replace Image</span>
              </button>

              <button
                type="button"
                onClick={handleRemove}
                className="py-2 px-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                title="Remove Receipt"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        ) : (
          /* State B: Empty Dropzone / File Picker */
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
              isDragging
                ? 'border-[#5C4033] bg-[#EAE2D8]'
                : uploadError
                ? 'border-red-400 bg-red-50/20 hover:border-red-500'
                : 'border-[#D9CDC1] bg-[#FDFBF7] hover:border-[#5C4033] hover:bg-[#FAF6F0]'
            }`}
          >
            <div className="w-11 h-11 rounded-full bg-[#F4EFEB] flex items-center justify-center text-[#5C4033] shadow-2xs">
              {isDragging ? (
                <ImageIcon className="w-5 h-5 animate-bounce" />
              ) : (
                <UploadCloud className="w-5 h-5" />
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-[#2B231F]">
                {isDragging ? 'Drop receipt screenshot here' : 'Click or Drag & Drop to Upload'}
              </p>
              <p className="text-[11px] text-[#8C7A6B] mt-0.5">
                Screenshot of your completed GCash payment receipt
              </p>
            </div>

            <span className="inline-block mt-1 px-3 py-1 bg-[#5C4033]/10 text-[#5C4033] font-bold text-[10px] rounded-full">
              Browse Files
            </span>
          </div>
        )}

        {/* Validation Error Message */}
        {uploadError && (
          <div className="flex items-center gap-1.5 text-xs text-red-600 font-semibold mt-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentGCash;
