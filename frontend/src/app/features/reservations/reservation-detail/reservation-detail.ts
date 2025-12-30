import { Component, OnInit, OnDestroy, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReservationService } from '../../../core/services/reservation.service';
import { AuthService } from '../../../core/services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';
import * as L from 'leaflet';

@Component({
  selector: 'app-reservation-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatStepperModule
  ],
  templateUrl: './reservation-detail.html',
  styleUrls: ['./reservation-detail.scss']
})
export class ReservationDetailComponent implements OnInit, OnDestroy {
  
  reservation = signal<any>(null);
  loading = signal<boolean>(true);
  currentUser = signal<any>(null);
  isDonor = signal<boolean>(false);
  isBeneficiary = signal<boolean>(false);
  processing = signal<boolean>(false);
  
  private map: L.Map | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservationService: ReservationService,
    private authService: AuthService
  ) {
    effect(() => {
      const user = this.authService.currentUser();
      this.currentUser.set(user);

      const reservation = this.reservation();
      if (user && reservation) {
        this.isDonor.set(reservation.donor?._id === user._id);
        this.isBeneficiary.set(reservation.beneficiary?._id === user._id);
      }
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadReservation(id);
  }

  loadReservation(id: string): void {
    this.loading.set(true);
    
    this.reservationService.getReservationById(id).subscribe({
      next: (response) => {
        console.log('📋 Reservation loaded:', response);
        
        const reservationData = response.data?.reservation || response.reservation || response.data;
        this.reservation.set(reservationData);
        this.loading.set(false);

        const user = this.currentUser();
        if (user && reservationData) {
          this.isDonor.set(reservationData.donor?._id === user._id);
          this.isBeneficiary.set(reservationData.beneficiary?._id === user._id);
        }

        setTimeout(() => this.initMap(), 100);
      },
      error: (error) => {
        console.error('❌ Error loading reservation:', error);
        this.loading.set(false);
      }
    });
  }

  initMap(): void {
    const reservation = this.reservation();
    const coordinates = reservation?.donation?.pickupLocation?.coordinates;
    
    if (!coordinates) {
      console.log('⚠️ No coordinates for map');
      return;
    }

    const [lng, lat] = coordinates;

    if (this.map) this.map.remove();

    this.map = L.map('map').setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    const icon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    L.marker([lat, lng], { icon })
      .addTo(this.map)
      .bindPopup(`<b>Lieu de retrait</b><br>${reservation.donation.pickupLocation.address}`)
      .openPopup();
  }

  confirmReservation(): void {
    const reservation = this.reservation();
    if (!reservation || this.processing()) return;

    if (!confirm('Confirmer cette réservation ?')) return;

    this.processing.set(true);
    
    this.reservationService.confirmReservation(reservation._id).subscribe({
      next: (response) => {
        console.log('✅ Confirmed:', response);
        alert('✅ Réservation confirmée avec succès');
        this.loadReservation(reservation._id);
        this.processing.set(false);
      },
      error: (error) => {
        console.error('❌ Error:', error);
        alert('❌ ' + (error.error?.message || 'Erreur'));
        this.processing.set(false);
      }
    });
  }

  completeReservation(): void {
    const reservation = this.reservation();
    if (!reservation || this.processing()) return;

    if (!confirm('Marquer cette réservation comme complétée ?')) return;

    this.processing.set(true);
    
    this.reservationService.completeReservation(reservation._id).subscribe({
      next: (response) => {
        console.log('✅ Completed:', response);
        alert('✅ Réservation complétée avec succès');
        this.loadReservation(reservation._id);
        this.processing.set(false);
      },
      error: (error) => {
        console.error('❌ Error:', error);
        alert('❌ ' + (error.error?.message || 'Erreur'));
        this.processing.set(false);
      }
    });
  }

  cancelReservation(): void {
    const reservation = this.reservation();
    if (!reservation || this.processing()) return;

    const reason = prompt('Raison de l\'annulation (optionnel):');
    if (reason === null) return; // User cancelled

    this.processing.set(true);
    
    this.reservationService.cancelReservation(reservation._id, reason || undefined).subscribe({
      next: (response) => {
        console.log('✅ Cancelled:', response);
        alert('✅ Réservation annulée avec succès');
        this.loadReservation(reservation._id);
        this.processing.set(false);
      },
      error: (error) => {
        console.error('❌ Error:', error);
        alert('❌ ' + (error.error?.message || 'Erreur'));
        this.processing.set(false);
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

  canConfirm(): boolean {
    return this.isDonor() && this.reservation()?.status === 'pending';
  }

  canComplete(): boolean {
    const reservation = this.reservation();
    return (this.isDonor() || this.isBeneficiary()) && reservation?.status === 'confirmed';
  }

  canCancel(): boolean {
    const reservation = this.reservation();
    return (this.isDonor() || this.isBeneficiary()) && 
           (reservation?.status === 'pending' || reservation?.status === 'confirmed');
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

  goBack(): void {
    if (this.isDonor()) {
      this.router.navigate(['/reservations/received']);
    } else {
      this.router.navigate(['/reservations/my-reservations']);
    }
  }

  ngOnDestroy(): void {
    if (this.map) this.map.remove();
  }
}