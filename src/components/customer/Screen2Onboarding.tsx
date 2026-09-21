import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { CafeLogo } from '../common/CafeLogo';
import { OrderType } from '../../types/cafe';

export const Screen2Onboarding: React.FC = () => {
  const {
    customerName,
    orderType,
    setCustomerDetails,
    setCustomerScreen,
    navigate,
  } = useCafe();

  const [nameInput, setNameInput] = useState(customerName);
  const [typeInput, setTypeInput] = useState<OrderType>(orderType);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isFormValid = nameInput.trim().length > 0 && Boolean(typeInput);

  const handleContinue = () => {
    if (!isFormValid) {
      if (!nameInput.trim()) {
        setErrorMessage('Please enter your name to proceed.');
      } else if (!typeInput) {
        setErrorMessage('Please select Dine-in, Take-out, or Delivery.');
      }
      return;
    }

    setErrorMessage(null);
    setCustomerDetails(nameInput.trim(), typeInput, null);
    setCustomerScreen(3); // Advance to Menu Catalog
    navigate('/menu');
  };

  const handleGoWelcome = () => {
    setCustomerScreen(1);
    navigate('/welcome');
  };

  return (
    <div className="flex-1 min-h-[560px] flex flex-col justify-between px-6 py-8 bg-[#F4ECE1] text-[#3B2215] select-none">
      <div>
        {/* Top Back Link */}
        <button
          onClick={handleGoWelcome}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#7A6253] hover:text-[#5C3D2E] transition mb-4 cursor-pointer"
        >
          <span>‹</span>
          <span>Back</span>
        </button>

        {/* Circular White Sticker Badge with Soft Drop Shadow (Non-clickable & decorative branding) */}
        <div
          aria-hidden="true"
          className="w-48 h-48 sm:w-52 sm:h-52 mx-auto rounded-full bg-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] flex items-center justify-center p-2.5 mb-5 pointer-events-none select-none"
        >
          <CafeLogo size={200} className="w-full h-full pointer-events-none" showBorder={true} />
        </div>

        {/* Heading & Subtitle */}
        <div className="text-center mb-6">
          <h2 className="font-bold text-2xl text-[#3B2215]">Welcome!</h2>
          <p className="text-xs text-[#7A6253] mt-1 max-w-[260px] mx-auto leading-relaxed">
            Tell us your name so we know whose order is whose.
          </p>
        </div>

        {/* Form Controls */}
        <div className="max-w-sm mx-auto space-y-4">
          {/* YOUR NAME Field */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C7465] mb-1.5 text-left">
              YOUR NAME
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => {
                setNameInput(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="e.g. Barbara"
              className="w-full px-4 py-3.5 bg-[#EADBCE] rounded-2xl text-xs text-[#3B2215] placeholder-[#9C8E82] focus:outline-none focus:ring-2 focus:ring-[#5C3D2E] transition border-0"
            />
          </div>

          {/* ORDER TYPE Field */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C7465] mb-1.5 text-left">
              ORDER TYPE
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={() => setTypeInput('dine-in')}
                className={`py-3.5 px-2 sm:px-3 rounded-2xl text-xs font-semibold transition text-center shadow-xs cursor-pointer ${
                  typeInput === 'dine-in'
                    ? 'bg-[#5C3D2E] text-white shadow-sm'
                    : 'bg-white text-[#3B2215] border border-[#EADBCE] hover:bg-[#FAF6F0]'
                }`}
              >
                Dine-in
              </button>

              <button
                type="button"
                onClick={() => setTypeInput('take-out')}
                className={`py-3.5 px-2 sm:px-3 rounded-2xl text-xs font-semibold transition text-center shadow-xs cursor-pointer ${
                  typeInput === 'take-out'
                    ? 'bg-[#5C3D2E] text-white shadow-sm'
                    : 'bg-white text-[#3B2215] border border-[#EADBCE] hover:bg-[#FAF6F0]'
                }`}
              >
                Take-out
              </button>

              <button
                type="button"
                onClick={() => setTypeInput('delivery')}
                className={`py-3.5 px-2 sm:px-3 rounded-2xl text-xs font-semibold transition text-center shadow-xs cursor-pointer ${
                  typeInput === 'delivery'
                    ? 'bg-[#5C3D2E] text-white shadow-sm'
                    : 'bg-white text-[#3B2215] border border-[#EADBCE] hover:bg-[#FAF6F0]'
                }`}
              >
                Delivery
              </button>
            </div>
          </div>

          {/* Validation Feedback */}
          {errorMessage && (
            <p className="text-xs text-red-600 font-semibold text-center mt-2">
              {errorMessage}
            </p>
          )}

          {/* View Menu Button (Unified CTA Button) */}
          <div className="pt-2">
            <button
              onClick={handleContinue}
              className={`w-full py-3.5 px-6 rounded-2xl text-sm font-bold shadow-md transition duration-200 active:scale-98 text-center ${
                isFormValid
                  ? 'bg-[#5C3D2E] hover:bg-[#4A2F22] active:bg-[#3D261B] text-white cursor-pointer'
                  : 'bg-[#D4C1AD] text-white/90 cursor-not-allowed shadow-none'
              }`}
            >
              View Menu →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
