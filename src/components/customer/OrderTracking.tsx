import React from 'react';
import { Screen8LiveTracker } from './Screen8LiveTracker';

/**
 * OrderTracking Component for Café Pepita.
 * Features:
 * - Sticky fixed header (`sticky top-0 z-50 bg-[#FDFBF7]`)
 * - Back navigation arrow (<) to return to menu seamlessly without clearing session
 * - Real-time Livewire order status pipeline sync
 * - GCash Proof of Payment attachment display
 */
export const OrderTracking: React.FC = () => {
  return <Screen8LiveTracker />;
};

export default OrderTracking;
