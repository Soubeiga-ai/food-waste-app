import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CreateReservationRequest {
  donationId: string;  // ✅ Le backend attend "donationId"
  pickupDate?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = `${environment.apiUrl}/reservations`;

  constructor(private http: HttpClient) {}

  // Créer une réservation
  createReservation(data: CreateReservationRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data);
  }

  // Récupérer mes réservations
  getMyReservations(type: 'beneficiary' | 'donor' = 'beneficiary'): Observable<any> {
    return this.http.get(`${this.apiUrl}/my`, { 
      params: { type } 
    });
  }

  // Récupérer une réservation par ID
  getReservationById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Confirmer une réservation (par le donateur)
  confirmReservation(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/confirm`, {});
  }

  // Compléter une réservation
  completeReservation(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/complete`, {});
  }

  // Annuler une réservation
  cancelReservation(id: string, reason?: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/cancel`, { reason });
  }
}