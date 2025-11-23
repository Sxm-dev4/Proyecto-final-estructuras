import { Timestamp } from 'firebase-admin/firestore';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  basePrice: number;
  currency: string;
  images: string[];
  featured: boolean;
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  size: string;
  color: string;
  priceAdjustment: number;
  stock: number;
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateProductDTO {
  name: string;
  slug?: string;
  description: string;
  categoryId: string;
  basePrice: number;
  currency?: string;
  images?: string[];
  featured?: boolean;
  active?: boolean;
}

export interface UpdateProductDTO {
  name?: string;
  slug?: string;
  description?: string;
  categoryId?: string;
  basePrice?: number;
  currency?: string;
  images?: string[];
  featured?: boolean;
  active?: boolean;
}

export interface CreateVariantDTO {
  productId?: string;
  sku: string;
  size: string;
  color: string;
  priceAdjustment?: number;
  stock: number;
  active?: boolean;
}

export interface UpdateVariantDTO {
  sku?: string;
  size?: string;
  color?: string;
  priceAdjustment?: number;
  stock?: number;
  active?: boolean;
}