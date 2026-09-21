import React from 'react';
import { Screen3MenuCatalog } from './Screen3MenuCatalog';
import { MenuItem } from '../../types/cafe';

interface MenuViewProps {
  onSelectItem?: (item: MenuItem) => void;
}

export const MenuView: React.FC<MenuViewProps> = ({ onSelectItem }) => {
  return <Screen3MenuCatalog onSelectItem={onSelectItem || (() => {})} />;
};

export default MenuView;
