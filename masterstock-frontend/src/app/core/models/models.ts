export type UserRole = 'admin' | 'comprador';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  sku: string;
  category: string;
  brand?: string;
  specs?: Record<string, string>;
  images: string[];
  status: 'activo' | 'inactivo';
  // El admin recibe stock exacto
  stock?: number;
  disponible?: boolean;
}

export type OrderStatus = 'confirmado' | 'enviado' | 'entregado' | 'cancelado';
export type OrderResolution = 'reembolso' | 'reemplazo';

export interface OrderItem {
  product: Product | string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface ShippingAddress {
  department: string;
  city: string;
  address: string;
  phone: string;
  notes?: string;
}

export interface Order {
  _id: string;
  buyer: string;
  items: OrderItem[];
  // Opcionales: pedidos creados antes de agregar envios no los tienen en la BD
  subtotal?: number;
  shippingCost?: number;
  shippingAddress?: ShippingAddress;
  total: number;
  status: OrderStatus;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  resolution?: OrderResolution | null;
  resolutionNote?: string;
  resolvedAt?: string | null;
  createdAt: string;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface InventoryMovement {
  _id: string;
  product: { _id: string; name: string; sku: string };
  type: 'entrada' | 'salida';
  quantity: number;
  reason: string;
  user: { firstName: string; lastName: string };
  createdAt: string;
}
