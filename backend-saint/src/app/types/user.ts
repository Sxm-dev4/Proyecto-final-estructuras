import {Timestamp} from 'firebase-admin/firestore';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  address?: Address;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateUserDTO {
  email: string;
  displayName: string;
  phone?: string;
  address?: Address;
}

export interface UpdateUserDTO {
  displayName?: string;
  phone?: string;
  address?: Address;
}