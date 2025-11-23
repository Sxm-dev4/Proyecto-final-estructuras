import { Timestamp } from 'firebase-admin/firestore';
import { Address } from './user';

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  variantId: string;
  productId: string;
  quantity: number;
  productName: string;
  size: string;
  color: string;
  priceAtPurchase: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  shippingAddress: Address;
  paymentMethod: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateOrderDTO {
  shippingAddress: Address;
  paymentMethod: string;
}

export interface UpdateOrderStatusDTO {
  status: OrderStatus;
}