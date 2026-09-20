import React from 'react';
import { useCafe } from '../../context/CafeContext';
import { CafeLogo } from '../common/CafeLogo';

export const Screen1Splash: React.FC = () => {
  const { setCustomerScreen } = useCafe();

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[560px] px-6 py-12 text-center bg-[#F4ECE1] text-[#3B2215] relative select-none">
      {/* Center Brand Identity */}
      <div className="flex flex-col items-center max-w-xs w-full">
        {/* Circular White Sticker Badge with Soft Drop Shadow */}
        <div className="w-60 h-60 sm:w-64 sm:h-64 rounded-full bg-white shadow-[0_12px_30px_-6px_rgba(0,0,0,0.12)] flex items-center justify-center p-3 mb-8 transition-transform duration-300 hover:scale-[1.02]">
          <CafeLogo size={240} className="w-full h-full" showBorder={true} />
        </div>

        {/* Tracked-out Slogan: SIP THE MOMENT */}
        <p className="text-[11px] font-medium tracking-[0.25em] text-[#9C8270] uppercase mb-10">
          SIP THE MOMENT
        </p>

        {/* Start Ordering Button */}
        <button
          onClick={() => setCustomerScreen(2)}
          className="w-full max-w-[240px] py-3.5 px-6 bg-[#543929] hover:bg-[#432C1D] active:scale-98 text-white font-semibold rounded-2xl shadow-md transition duration-200 text-sm"
        >
          Start Ordering
        </button>
      </div>
    </div>
  );
};
