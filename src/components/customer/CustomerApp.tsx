import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Screen1Splash } from './Screen1Splash';
import { Screen2Onboarding } from './Screen2Onboarding';
import { Screen3MenuCatalog } from './Screen3MenuCatalog';
import { Screen4ItemModal } from './Screen4ItemModal';
import { Screen6CartModal } from './Screen6CartModal';
import { ScreenDeliveryDetails } from './ScreenDeliveryDetails';
import { Screen7PaymentModal } from './Screen7PaymentModal';
import { Screen8LiveTracker } from './Screen8LiveTracker';
import { MenuItem } from '../../types/cafe';
import { useUnsavedChangesGuard } from '../../hooks/useUnsavedChangesGuard';

export const CustomerApp: React.FC = () => {
  const { customerScreen, setCustomerScreen, cart } = useCafe();
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);

  // Safeguard: Customer with unsubmitted cart items
  useUnsavedChangesGuard({
    when: cart.length > 0 && customerScreen !== 8,
    role: 'customer',
    reason: `You have ${cart.length} unsubmitted item${cart.length > 1 ? 's' : ''} in your cart`,
  });

  // Safeguard: Customer currently customizing an item
  useUnsavedChangesGuard({
    when: selectedMenuItem !== null || customerScreen === 4 || customerScreen === 5,
    role: 'customer',
    reason: 'Active beverage customization in progress',
  });

  const renderScreen = () => {
    switch (customerScreen) {
      case 1:
        return <Screen1Splash />;
      case 2:
        return <Screen2Onboarding />;
      case 3:
        return <Screen3MenuCatalog onSelectItem={(item) => setSelectedMenuItem(item)} />;
      case 4:
      case 5:
        // Screen 4/5 is the customization view; if no item is actively chosen, default to first menu item
        return (
          <div className="relative">
            <Screen3MenuCatalog onSelectItem={(item) => setSelectedMenuItem(item)} />
            <Screen4ItemModal
              item={selectedMenuItem}
              onClose={() => {
                setSelectedMenuItem(null);
                setCustomerScreen(3);
              }}
            />
          </div>
        );
      case 6:
        return <Screen6CartModal />;
      case 9:
        return <ScreenDeliveryDetails />;
      case 7:
        return <Screen7PaymentModal />;
      case 8:
        return <Screen8LiveTracker />;
      default:
        return <Screen3MenuCatalog onSelectItem={(item) => setSelectedMenuItem(item)} />;
    }
  };

  const isWideScreen = [3, 4, 5].includes(customerScreen);

  return (
    <div className="min-h-screen bg-[#F4ECE1] text-[#3B2215] flex flex-col items-center">
      {/* Clean, responsive application container */}
      <div className={`w-full min-h-screen flex flex-col bg-[#F4ECE1] sm:shadow-sm sm:border-x sm:border-[#EADBCE]/70 transition-all duration-300 ${
        isWideScreen ? 'max-w-7xl' : 'max-w-2xl sm:max-w-3xl'
      }`}>
        {renderScreen()}

        {/* Modal Overlay for Item Customization when active on screen 3 */}
        {customerScreen === 3 && selectedMenuItem && (
          <Screen4ItemModal
            item={selectedMenuItem}
            onClose={() => setSelectedMenuItem(null)}
          />
        )}
      </div>
    </div>
  );
};
