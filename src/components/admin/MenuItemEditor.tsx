import React from 'react';
import { EditMenuItemModal, EditMenuItemModalProps } from './EditMenuItemModal';

export const MenuItemEditor: React.FC<EditMenuItemModalProps> = (props) => {
  return <EditMenuItemModal {...props} />;
};

export default MenuItemEditor;
export { EditMenuItemModal };
