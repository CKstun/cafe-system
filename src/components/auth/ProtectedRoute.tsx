import React from 'react';
import { useCafe } from '../../context/CafeContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  sessionType: 'staff' | 'admin';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
}) => {
  return <>{children}</>;
};