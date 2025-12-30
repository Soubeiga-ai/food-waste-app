// src/app/models/reservation.model.ts
import { Donation } from './donation.model';
import { User } from './user.model';

export interface Reservation {
  _id: string;
  donation: Donation;
  beneficiary: User;
  donor: User;
  status: ReservationStatus;
  pickupDate: string;
  message?: string;
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReservationStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface CreateReservationRequest {
  donationId: string;
  pickupDate: string;
  message?: string;
}

export interface CancelReservationRequest {
  reason?: string;
}