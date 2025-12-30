// src/app/core/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  /**
   * Obtenir le profil d'un utilisateur par ID
   */
  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  /**
   * Mettre à jour le profil de l'utilisateur
   */
  updateProfile(id: string, data: Partial<User>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Mettre à jour l'avatar de l'utilisateur
   */
  updateAvatar(id: string, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/avatar`, formData);
  }

  /**
   * Obtenir les donations d'un utilisateur
   */
  getUserDonations(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/donations`);
  }

  /**
   * Obtenir les avis d'un utilisateur
   */
  getUserReviews(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/reviews`);
  }

  /**
   * Obtenir les statistiques d'un utilisateur
   */
  getUserStats(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/stats`);
  }
}