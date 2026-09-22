import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { CafeLogo } from '../common/CafeLogo';
import { OrderType } from '../../types/cafe';

/**
 * Welcome Component for Café Pepita.
 * 
 * Features:
 * - Dynamic button validation continuously tracking customer name and order type.
 * - Disabled state styling: `disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none`
 *   retaining the brand color `bg-[#4A2E19] text-white`.
 * - Dine-in order workflow simplification: table selection removed; all dine-in orders
 *   are picked up at the counter upon callout.
 */
export const Welcome: React.FC = () => {
  const {
    customerName,
    orderType,
    setCustomerDetails,
    setCustomerScreen,
    navigate,
  } = useCafe();

  const [nameInput, setNameInput] = useState(customerName);
  const [typeInput, setTypeInput] = useState<OrderType>(orderType || 'dine-in');

  const isFormValid = nameInput.trim().length > 0 && Boolean(typeInput);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setCustomerDetails(nameInput.trim(), typeInput, null);
    setCustomerScreen(3); // Advance to Menu Catalog
    navigate('/menu');
  };

  const handleGoWelcome = () => {
    setCustomerScreen(1);
    navigate('/welcome');
  };

  return (
    <div className="flex-1 min-h-[560px] flex flex-col justify-between px-6 py-8 bg-[#FDFBF7] text-[#2C1D11] select-none">
      <div>
        {/* Top Back Link */}
        <button
          type="button"
          onClick={handleGoWelcome}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#8C7A6B] hover:text-[#4A2E19] transition mb-4 cursor-pointer"
        >
          <span>‹</span>
          <span>Back</span>
        </button>

        {/* Circular White Sticker Badge with Soft Drop Shadow (Non-interactive branding) */}
        <div
          aria-hidden="true"
          className="w-44 h-44 sm:w-48 sm:h-48 mx-auto rounded-full bg-white shadow-[0_10px_25px_-5px_rgba(74,46,25,0.08)] border border-[#EADBCE]/80 flex items-center justify-center p-2.5 mb-5 pointer-events-none select-none"
        >
          <CafeLogo size={180} className="w-full h-full pointer-events-none" showBorder={false} />
        </div>

        {/* Heading & Subtitle */}
        <div className="text-center mb-6">
          <h2 className="font-serif font-bold text-2xl text-[#2C1D11]">Welcome to Café Pepita</h2>
          <p className="text-xs text-[#8C7A6B] mt-1 max-w-[280px] mx-auto leading-relaxed">
            Please enter your name and select your dining preference.
          </p>
        </div>

        {/* Form Controls */}
        <form onSubmit={handleContinue} className="max-w-sm mx-auto space-y-4">
          {/* YOUR NAME Field */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B] mb-1.5 text-left">
              YOUR NAME <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. Barbara"
              className="w-full px-4 py-3 bg-white border border-[#EADBCE] rounded-2xl text-xs text-[#2C1D11] placeholder-[#B5A597] focus:outline-none focus:ring-2 focus:ring-[#4A2E19] focus:border-transparent transition shadow-2xs"
            />
          </div>

          {/* ORDER TYPE Field */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B] mb-1.5 text-left">
              ORDER TYPE <span className="text-rose-600">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTypeInput('dine-in')}
                className={`py-3 px-2 rounded-2xl text-xs font-semibold transition text-center shadow-2xs cursor-pointer ${
                  typeInput === 'dine-in'
                    ? 'bg-[#4A2E19] text-white shadow-xs'
                    : 'bg-white text-[#2C1D11] border border-[#EADBCE] hover:bg-[#FDFBF7]'
                }`}
              >
                Dine-in
              </button>

              <button
                type="button"
                onClick={() => setTypeInput('take-out')}
                className={`py-3 px-2 rounded-2xl text-xs font-semibold transition text-center shadow-2xs cursor-pointer ${
                  typeInput === 'take-out'
                    ? 'bg-[#4A2E19] text-white shadow-xs'
                    : 'bg-white text-[#2C1D11] border border-[#EADBCE] hover:bg-[#FDFBF7]'
                }`}
              >
                Take-out
              </button>

              <button
                type="button"
                onClick={() => setTypeInput('delivery')}
                className={`py-3 px-2 rounded-2xl text-xs font-semibold transition text-center shadow-2xs cursor-pointer ${
                  typeInput === 'delivery'
                    ? 'bg-[#4A2E19] text-white shadow-xs'
                    : 'bg-white text-[#2C1D11] border border-[#EADBCE] hover:bg-[#FDFBF7]'
                }`}
              >
                Delivery
              </button>
            </div>
            <p className="text-[11px] text-[#8C7A6B] mt-1.5 text-center">
              {typeInput === 'dine-in' && 'Dine-in orders will be called for counter pickup.'}
              {typeInput === 'take-out' && 'Packaged for quick pickup at the barista counter.'}
              {typeInput === 'delivery' && 'Delivered to your home or office address.'}
            </p>
          </div>

          {/* View Menu Button (Unified CTA with dynamic validation & standard disabled styling) */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!isFormValid}
              className="w-full py-3.5 px-6 rounded-2xl text-sm font-bold shadow-md transition duration-200 active:scale-98 text-center bg-[#4A2E19] text-white hover:bg-[#382212] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
            >
              View Menu →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Welcome;
