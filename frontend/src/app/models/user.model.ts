// src/app/models/user.model.ts

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'donor' | 'beneficiary' | 'both' | 'admin';
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    coordinates?: [number, number];
  };
  avatar?: string;
  isActive: boolean;
  rating: {
    average: number;
    count: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'donor' | 'beneficiary' | 'both';
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    coordinates?: [number, number];
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}