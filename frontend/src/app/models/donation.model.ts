// src/app/models/donation.model.ts

export interface Donation {
  _id: string;
  donor: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    rating: {
      average: number;
      count: number;
    };
  };
  title: string;
  description: string;
  category: FoodCategory;
  quantity: number;
  unit: Unit;
  expiryDate: string;
  images: string[];
  pickupLocation: {
    address: string;
    coordinates: [number, number];
  };
  status: DonationStatus;
  reservedBy?: string;
  reservedAt?: string;
  completedAt?: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export type FoodCategory = 
  | 'fruits'
  | 'legumes'
  | 'pain'
  | 'produits_laitiers'
  | 'viande'
  | 'poisson'
  | 'plats_prepares'
  | 'patisseries'
  | 'conserves'
  | 'boissons'
  | 'autre';

export type Unit = 'kg' | 'g' | 'l' | 'piece' | 'portion' | 'paquet';

export type DonationStatus = 'available' | 'reserved' | 'completed' | 'expired' | 'cancelled';

export interface CreateDonationRequest {
  title: string;
  description: string;
  category: FoodCategory;
  quantity: number;
  unit: Unit;
  expiryDate: string;
  pickupLocation: {
    address: string;
    coordinates: [number, number];
  };
  images?: File[];
}

export interface DonationFilters {
  page?: number;
  limit?: number;
  category?: FoodCategory;
  status?: DonationStatus;
  search?: string;
  longitude?: number;
  latitude?: number;
  maxDistance?: number;
}

export interface PaginatedDonations {
  success: boolean;
  message: string;
  data: Donation[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}