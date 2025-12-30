// src/app/models/review.model.ts

export interface Review {
  _id: string;
  reviewer: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  reviewee: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  donation: {
    _id: string;
    title: string;
  };
  reservation: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  reservationId: string;
  rating: number;
  comment?: string;
}

export interface ReviewStats {
  total: number;
  average: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}