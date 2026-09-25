import React from 'react';
import { Screen3MenuCatalog } from './Screen3MenuCatalog';
import { MenuItem } from '../../types/cafe';
import { Menu } from '../Menu';

interface MenuViewProps {
  onSelectItem?: (item: MenuItem) => void;
}

export const MenuView: React.FC<MenuViewProps> = ({ onSelectItem }) => {
  return <Screen3MenuCatalog onSelectItem={onSelectItem || (() => {})} />;
};

export { Menu };
export default MenuView;

