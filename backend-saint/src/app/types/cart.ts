import { Timestamp } from 'firebase-admin/firestore';

export interface CartItem {
  variantId: string;
  productId: string;
  quantity: number;
  productName: string;
  size: string;
  color: string;
  price: number;
  imageUrl: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AddToCartDTO {
  variantId: string;
  quantity: number;
}

export interface UpdateCartItemDTO {
  variantId: string;
  quantity: number;
}