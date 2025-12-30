import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReservationService } from '../../../core/services/reservation.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-received-reservations',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatTabsModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatMenuModule
  ],
  templateUrl: './received-reservations.html',
  styleUrls: ['./received-reservations.scss']
})
export class ReceivedReservationsComponent implements OnInit {
  
  allReservations = signal<any[]>([]);
  filteredReservations = signal<any[]>([]);
  loading = signal<boolean>(true);
  selectedStatus = signal<string>('all');

  statuses = [
    { value: 'all', label: 'Toutes', count: 0 },
    { value: 'pending', label: 'En attente', count: 0 },
    { value: 'confirmed', label: 'Confirmées', count: 0 },
    { value: 'completed', label: 'Complétées', count: 0 },
    { value: 'cancelled', label: 'Annulées', count: 0 }
  ];

  constructor(private reservationService: ReservationService) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.loading.set(true);
    
    // Type 'donor' pour les réservations reçues par le donateur
    this.reservationService.getMyReservations('donor').subscribe({
      next: (response) => {
        console.log('📥 Received Reservations:', response);
        
        const reservations = response.data?.reservations || response.reservations || [];
        this.allReservations.set(reservations);
        this.updateCounts();
        this.filterByStatus('all');
        this.loading.set(false);
      },
      error: (error) => {
        console.error('❌ Error loading reservations:', error);
        this.loading.set(false);
      }
    });
  }

  updateCounts(): void {
    const reservations = this.allReservations();
    
    this.statuses[0].count = reservations.length;
    this.statuses[1].count = reservations.filter(r => r.status === 'pending').length;
    this.statuses[2].count = reservations.filter(r => r.status === 'confirmed').length;
    this.statuses[3].count = reservations.filter(r => r.status === 'completed').length;
    this.statuses[4].count = reservations.filter(r => r.status === 'cancelled').length;
  }

  filterByStatus(status: string): void {
    this.selectedStatus.set(status);
    
    if (status === 'all') {
      this.filteredReservations.set(this.allReservations());
    } else {
      this.filteredReservations.set(
        this.allReservations().filter(r => r.status === status)
      );
    }
  }

  confirmReservation(reservationId: string): void {
    if (!confirm('Confirmer cette réservation ?')) {
      return;
    }

    this.reservationService.confirmReservation(reservationId).subscribe({
      next: (response) => {
        console.log('✅ Reservation confirmed:', response);
        alert('✅ Réservation confirmée avec succès');
        this.loadReservations();
      },
      error: (error) => {
        console.error('❌ Error confirming:', error);
        alert('❌ ' + (error.error?.message || 'Erreur lors de la confirmation'));
      }
    });
  }

  completeReservation(reservationId: string): void {
    if (!confirm('Marquer cette réservation comme complétée ?')) {
      return;
    }

    this.reservationService.completeReservation(reservationId).subscribe({
      next: (response) => {
        console.log('✅ Reservation completed:', response);
        alert('✅ Réservation complétée avec succès');
        this.loadReservations();
      },
      error: (error) => {
        console.error('❌ Error completing:', error);
        alert('❌ ' + (error.error?.message || 'Erreur lors de la complétion'));
      }
    });
  }

  cancelReservation(reservationId: string): void {
    if (!confirm('Annuler cette réservation ?')) {
      return;
    }

    this.reservationService.cancelReservation(reservationId, 'Annulée par le donateur').subscribe({
      next: (response) => {
        console.log('✅ Reservation cancelled:', response);
        alert('✅ Réservation annulée avec succès');
        this.loadReservations();
      },
      error: (error) => {
        console.error('❌ Error cancelling:', error);
        alert('❌ ' + (error.error?.message || 'Erreur lors de l\'annulation'));
      }
    });
  }

  getStatusColor(status: string): string {
    const colors: any = {
      pending: 'accent',
      confirmed: 'primary',
      completed: 'primary',
      cancelled: 'warn'
    };
    return colors[status] || 'primary';
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      pending: '⏳ En attente',
      confirmed: '✅ Confirmée',
      completed: '✔️ Complétée',
      cancelled: '❌ Annulée'
    };
    return labels[status] || status;
  }

  getStatusIcon(status: string): string {
    const icons: any = {
      pending: 'schedule',
      confirmed: 'check_circle',
      completed: 'done_all',
      cancelled: 'cancel'
    };
    return icons[status] || 'help';
  }

  getCategoryIcon(category: string): string {
    const icons: any = {
      fruits: '🍎',
      legumes: '🥕',
      pain: '🍞',
      produits_laitiers: '🥛',
      viande: '🥩',
      poisson: '🐟',
      plats_prepares: '🍱',
      conserves: '🥫',
      boissons: '🥤',
      autre: '📦'
    };
    return icons[category] || '📦';
  }

  canConfirm(reservation: any): boolean {
    return reservation.status === 'pending';
  }

  canComplete(reservation: any): boolean {
    return reservation.status === 'confirmed';
  }

  canCancel(reservation: any): boolean {
    return reservation.status === 'pending' || reservation.status === 'confirmed';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}