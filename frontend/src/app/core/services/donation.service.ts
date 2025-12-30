// src/app/core/services/donation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Donation, 
  CreateDonationRequest, 
  DonationFilters, 
  PaginatedDonations,
  FoodCategory
} from '../../models/donation.model';

@Injectable({
  providedIn: 'root'
})
export class DonationService {
  private apiUrl = `${environment.apiUrl}/donations`;

  constructor(private http: HttpClient) {}

  getDonations(filters?: DonationFilters): Observable<PaginatedDonations> {
    let params = new HttpParams();

    if (filters) {
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.category) params = params.set('category', filters.category);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.search) params = params.set('search', filters.search);
      if (filters.longitude) params = params.set('longitude', filters.longitude.toString());
      if (filters.latitude) params = params.set('latitude', filters.latitude.toString());
      if (filters.maxDistance) params = params.set('maxDistance', filters.maxDistance.toString());
    }

    return this.http.get<PaginatedDonations>(this.apiUrl, { params });
  }

  getDonationById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getMyDonations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my`);
  }

  /** ⭐️ CORRECTED: send JSON, no FormData */
  createDonation(data: CreateDonationRequest): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateDonation(id: string, data: Partial<CreateDonationRequest>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteDonation(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  searchByCategory(category: FoodCategory, page = 1, limit = 10): Observable<PaginatedDonations> {
    return this.getDonations({ category, page, limit, status: 'available' });
  }

  searchByText(search: string, page = 1, limit = 10): Observable<PaginatedDonations> {
    return this.getDonations({ search, page, limit, status: 'available' });
  }

  getNearbyDonations(
    longitude: number, 
    latitude: number, 
    maxDistance = 10000,
    page = 1,
    limit = 10
  ): Observable<PaginatedDonations> 
  {
    return this.getDonations({ longitude, latitude, maxDistance, page, limit, status: 'available' });
  }
}
