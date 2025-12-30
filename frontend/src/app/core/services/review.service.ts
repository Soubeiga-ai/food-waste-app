// src/app/core/services/review.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Review, CreateReviewRequest } from '../../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  /**
   * Créer un avis
   */
  createReview(data: CreateReviewRequest): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  /**
   * Obtenir les avis d'un utilisateur
   */
  getUserReviews(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}`);
  }

  /**
   * Obtenir un avis par ID
   */
  getReviewById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  /**
   * Mettre à jour un avis
   */
  updateReview(id: string, data: Partial<CreateReviewRequest>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Supprimer un avis
   */
  deleteReview(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}