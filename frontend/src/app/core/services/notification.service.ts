import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface Notification {
  _id: string;
  recipient: string;
  sender?: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  type: string;
  title: string;
  message: string;
  link?: string;
  data?: any;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private apiUrl = `${environment.apiUrl}/notifications`;

  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);

  // 🔔 SOURCE UNIQUE DE VÉRITÉ POUR LE BADGE
  unreadCount = signal<number>(0);

  constructor() {
    // Chargement initial
    this.loadUnreadCount();

    // Rafraîchissement automatique (polling)
    interval(30000).subscribe(() => {
      this.loadUnreadCount();
    });
  }

  /* ============================
     SNACKBAR (SUCCESS / ERROR / WARNING)
  ============================ */

  success(message: string, duration = 3000): void {
    this.snackBar.open(message, 'Fermer', {
      duration,
      panelClass: ['snackbar-success']
    });
  }

  error(message: string, duration = 5000): void {
    this.snackBar.open(message, 'Fermer', {
      duration,
      panelClass: ['snackbar-error']
    });
  }

  warning(message: string, duration = 4000): void {
    this.snackBar.open(message, 'Fermer', {
      duration,
      panelClass: ['snackbar-warning']
    });
  }

  /* ============================
     API
  ============================ */

  getNotifications(isRead?: boolean, page = 1, limit = 20): Observable<any> {
    const params: any = { page, limit };
    if (isRead !== undefined) params.isRead = isRead;

    return this.http.get(this.apiUrl, { params });
  }

  getUnreadCount(): Observable<any> {
    return this.http.get(`${this.apiUrl}/unread-count`).pipe(
      tap((response: any) => {
        // ✅ NORMALISATION DE LA RÉPONSE
        const count =
          response?.data?.count ??
          response?.count ??
          0;

        this.unreadCount.set(count);
      })
    );
  }

  loadUnreadCount(): void {
    this.getUnreadCount().subscribe({
      error: err => console.error('❌ Error loading unread count:', err)
    });
  }

  markAsRead(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => {
        this.unreadCount.update(count => Math.max(0, count - 1));
      })
    );
  }

  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => {
        this.unreadCount.set(0);
      })
    );
  }

  deleteNotification(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.unreadCount.update(count => Math.max(0, count - 1));
      })
    );
  }

  deleteAllNotifications(): Observable<any> {
    return this.http.delete(this.apiUrl).pipe(
      tap(() => {
        this.unreadCount.set(0);
      })
    );
  }

  /* ============================
     UI HELPERS
  ============================ */

  getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
      new_reservation: 'bookmark_add',
      reservation_confirmed: 'check_circle',
      reservation_completed: 'done_all',
      reservation_cancelled: 'cancel',
      donation_expiring: 'schedule',
      new_review: 'star'
    };
    return icons[type] ?? 'notifications';
  }

  getNotificationColor(type: string): string {
    const colors: Record<string, string> = {
      new_reservation: '#2196f3',
      reservation_confirmed: '#4caf50',
      reservation_completed: '#8bc34a',
      reservation_cancelled: '#f44336',
      donation_expiring: '#ff9800',
      new_review: '#ffc107'
    };
    return colors[type] ?? '#757575';
  }
}
