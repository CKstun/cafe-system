import React from 'react';
import { Screen2Onboarding } from './Screen2Onboarding';

/**
 * Welcome Component for Café Pepita.
 * Features:
 * - Purely decorative, non-interactive logo with pointer-events-none
 * - Customer name, order type, and table selection form
 * - Explicit CTA "View Menu →" to proceed
 */
export const Welcome: React.FC = () => {
  return <Screen2Onboarding />;
};

export default Welcome;
