// src/app/core/services/auth.service.ts

import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';
import { User, RegisterRequest, LoginRequest, AuthResponse } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenKey = 'auth_token';

  // Signals
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromToken();
  }

  /** Vérifie si on est dans le navigateur (SSR safe) */
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  /** --- AUTH API --- */

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(response => {
        if (response.success) {
          this.handleAuthSuccess(response.data.token, response.data.user);
        }
      })
    );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(response => {
        if (response.success) {
          this.handleAuthSuccess(response.data.token, response.data.user);
        }
      })
    );
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.tokenKey);
    }
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/auth/login']);
  }

  getMe(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`).pipe(
      tap((response: any) => {
        if (response?.data?.user) {
          this.currentUser.set(response.data.user);
        }
      })
    );
  }

  /** --- TOKEN HANDLING --- */

  getToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);
      const expired = decoded.exp * 1000 < Date.now();
      return !expired;
    } catch {
      return false;
    }
  }

  getCurrentUserId(): string | null {
    const user = this.currentUser();
    return user ? user._id : null;
  }

  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user ? user.role === role : false;
  }
// Dans votre auth.service.ts, ajoutez ces méthodes :

// Recharger l'utilisateur actuel
loadCurrentUser(): void {
  const token = localStorage.getItem('token');
  if (!token) return;

  this.http.get(`${this.apiUrl}/me`).subscribe({
    next: (response: any) => {
      const userData = response.data?.user || response.user || response.data;
      this.currentUser.set(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    },
    error: (error) => {
      console.error('Error loading user:', error);
    }
  });
}

// Changer le mot de passe
updatePassword(data: { currentPassword: string; newPassword: string }): Observable<any> {
  return this.http.put(`${this.apiUrl}/update-password`, data);
}
  /** --- INTERNAL --- */

  private handleAuthSuccess(token: string, user: User): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.tokenKey, token);
    }
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
  }

  private loadUserFromToken(): void {
    if (!this.isBrowser()) return;

    if (this.isLoggedIn()) {
      this.isAuthenticated.set(true);
      this.getMe().subscribe();
    }
  }
}
