import { Timestamp } from 'firebase-admin/firestore';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  order?: number;        
  active?: boolean;    
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateCategoryDTO {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  order?: number;        
  active?: boolean;      
}

export interface UpdateCategoryDTO {
  name?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  order?: number;        
  active?: boolean;      
}