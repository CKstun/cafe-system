export type Role = 'customer' | 'staff' | 'admin';

export type Permission =
  | 'view-menu'
  | 'place-order'
  | 'view-order-tracker'
  | 'view-kds'
  | 'confirm-cash-payment'
  | 'update-order-status'
  | 'view-financial-analytics'
  | 'manage-menu-items'
  | 'manage-inventory-stock'
  | 'manage-staff-accounts'
  | 'manage-roles-permissions';

export interface SpatieRoleDefinition {
  id: number;
  name: Role;
  guard_name: 'web' | 'api';
  display_name: string;
  description: string;
  permissions: Permission[];
}

export interface EchoBroadcastEvent {
  id: string;
  event: string;
  channel: string;
  timestamp: string;
  payload: {
    order_id: number;
    tracking_token: string;
    customer_name: string;
    order_type: OrderType;
    table_id: number | null;
    total_amount: number;
    items_count: number;
    payment_method: PaymentMethod;
    payment_status: PaymentStatus;
    items: { name: string; quantity: number; size?: string }[];
  };
}

export type TableStatus = 'available' | 'occupied';

export type CupSize = '12oz' | '16oz' | '22oz' | 'Small' | 'Medium' | 'Large' | 'XL' | 'Regular' | 'Tray' | string | null;

export type MilkType = 'regular' | 'oat' | null;

export type PaymentMethod = 'cash' | 'online';

export type PaymentStatus = 'unpaid' | 'paid';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export type OrderType = 'dine-in' | 'take-out';

export type InventoryChangeType = 'sale' | 'restock' | 'wastage';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  created_at?: string;
  updated_at?: string;
}

export interface Table {
  id: number;
  table_number: number;
  status: TableStatus;
  capacity?: number;
}

export interface MenuItem {
  id: number;
  category: string;
  name: string;
  description: string;
  size: CupSize;
  milk_type: MilkType;
  price: number;
  image_path: string;
  stock_quantity: number;
  track_inventory: boolean;
  is_available: boolean;
  flavor?: string | null;
  base_item?: string;
  available_sizes?: { size: string; price: number; oat_price?: number }[];
  available_flavors?: string[];
  sub_oat_price?: number;
  has_sub_oat?: boolean;
  bottleneck_item_id?: string; // Links to container or inventory unit
}

export interface AddOn {
  id: number;
  name: string;
  price: number;
  stock_quantity: number;
  track_inventory: boolean;
}

export interface Customizations {
  size?: string;
  flavor?: string | null;
  milk_type?: 'regular' | 'oat';
  add_ons: { id: number; name: string; price: number }[];
  comments?: string;
}

export interface OrderItem {
  id: string;
  order_id?: number;
  menu_item_id: number;
  item_name: string;
  quantity: number;
  price: number;
  customizations: Customizations;
}

export interface Order {
  id: number;
  tracking_token: string;
  table_id: number | null;
  customer_name: string;
  order_type: OrderType;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  cancellation_requested?: boolean;
  cancellation_reason?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface InventoryLog {
  id: number;
  user_id: number | null;
  user_name?: string;
  menu_item_id: number | null;
  add_on_id: number | null;
  item_name: string;
  change_type: InventoryChangeType;
  quantity_changed: number;
  notes: string;
  created_at: string;
}

export interface InventoryUnit {
  id: string;
  name: string;
  category: 'containers' | 'ingredients' | 'food';
  unit: string;
  current_stock: number;
  minimum_threshold: number;
  cost_per_unit?: number;
}
