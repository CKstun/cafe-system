import React from 'react';
import { ScreenDeliveryDetails } from './ScreenDeliveryDetails';

/**
 * DeliveryDetails Component for Café Pepita.
 * Features:
 * - Strict Philippine mobile number validation (^09\d{9}$)
 * - Inline validation error feedback with AlertCircle icon
 * - Delivery address, city/region, postal code, and driver notes inputs
 */
export const DeliveryDetails: React.FC = () => {
  return <ScreenDeliveryDetails />;
};

export default DeliveryDetails;
