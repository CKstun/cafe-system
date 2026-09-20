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
  };

  return (
    <div className="flex-1 min-h-[560px] flex flex-col justify-between px-6 py-8 bg-[#F4ECE1] text-[#3B2215] select-none">
      <div>
        {/* Top Back Link */}
        <button
          onClick={() => setCustomerScreen(1)}
          className="inline-flex items-center gap-1 text-xs font-medium text-[#7A6253] hover:text-[#543929] transition mb-4"
        >
          <span>‹</span>
          <span>Back</span>
        </button>

        {/* Circular White Sticker Badge with Soft Drop Shadow */}
        <div className="w-48 h-48 sm:w-52 sm:h-52 mx-auto rounded-full bg-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] flex items-center justify-center p-2.5 mb-5 transition-transform duration-300">
          <CafeLogo size={200} className="w-full h-full" showBorder={true} />
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
              className="w-full px-4 py-3.5 bg-[#EADBCE] rounded-2xl text-xs text-[#3B2215] placeholder-[#9C8E82] focus:outline-none focus:ring-2 focus:ring-[#543929] transition border-0"
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
                className={`py-3.5 px-2 sm:px-3 rounded-2xl text-xs font-semibold transition text-center shadow-xs ${
                  typeInput === 'dine-in'
                    ? 'bg-[#543929] text-white shadow-sm'
                    : 'bg-white text-[#3B2215] border border-[#EADBCE]'
                }`}
              >
                Dine-in
              </button>

              <button
                type="button"
                onClick={() => setTypeInput('take-out')}
                className={`py-3.5 px-2 sm:px-3 rounded-2xl text-xs font-semibold transition text-center shadow-xs ${
                  typeInput === 'take-out'
                    ? 'bg-[#543929] text-white shadow-sm'
                    : 'bg-white text-[#3B2215] border border-[#EADBCE]'
                }`}
              >
                Take-out
              </button>

              <button
                type="button"
                onClick={() => setTypeInput('delivery')}
                className={`py-3.5 px-2 sm:px-3 rounded-2xl text-xs font-semibold transition text-center shadow-xs ${
                  typeInput === 'delivery'
                    ? 'bg-[#543929] text-white shadow-sm'
                    : 'bg-white text-[#3B2215] border border-[#EADBCE]'
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

          {/* View Menu Button */}
          <div className="pt-2">
            <button
              onClick={handleContinue}
              className={`w-full py-4 rounded-2xl text-xs font-semibold shadow-xs transition duration-200 active:scale-98 ${
                isFormValid
                  ? 'bg-[#543929] hover:bg-[#432C1D] text-white cursor-pointer shadow-md'
                  : 'bg-[#D4C1AD] text-white/95 cursor-not-allowed'
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
