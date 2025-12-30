import { Component, OnInit, OnDestroy, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DonationService } from '../../../core/services/donation.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { AuthService } from '../../../core/services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as L from 'leaflet';

@Component({
  selector: 'app-donation-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './donation-detail.html',
  styleUrls: ['./donation-detail.scss']
})
export class DonationDetailComponent implements OnInit, OnDestroy {

  donation = signal<any>(null);
  loading = signal<boolean>(true);
  currentImageIndex = signal<number>(0);
  isOwner = signal<boolean>(false);
  currentUser = signal<any>(null);
  reserving = signal<boolean>(false);

  private map: L.Map | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private donationService: DonationService,
    private reservationService: ReservationService,
    private authService: AuthService
  ) {
    // Surveiller les changements de currentUser
    effect(() => {
      const user = this.authService.currentUser();
      this.currentUser.set(user);

      const donation = this.donation();

      console.log('👤 Current User:', user);
      console.log('🎁 Donation:', donation);

      // ✅ Vérifier que tout existe avant de comparer
      if (user?._id && donation?.donor?._id) {
        const isOwner = donation.donor._id.toString() === user._id.toString();
        console.log('🔒 Is Owner:', isOwner, {
          donorId: donation.donor._id,
          userId: user._id
        });
        this.isOwner.set(isOwner);
      } else {
        console.log('⚠️ Missing data:', {
          hasUser: !!user,
          hasUserId: !!user?._id,
          hasDonation: !!donation,
          hasDonor: !!donation?.donor,
          hasDonorId: !!donation?.donor?._id
        });
        this.isOwner.set(false);
      }
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadDonation(id);
  }

  loadDonation(id: string): void {
    this.loading.set(true);

    this.donationService.getDonationById(id).subscribe({
      next: (res) => {
        console.log('📦 Full Response:', res);
        
        // ✅ Gérer les deux formats de réponse possibles
        let donationData;
        
        if (res.data?.donation) {
          // Format: { data: { donation: {...} } }
          donationData = res.data.donation;
        } else if (res.data) {
          // Format: { data: {...} }
          donationData = res.data;
        } else {
          // Format direct
          donationData = res;
        }

        console.log('📦 Donation Data:', donationData);
        this.donation.set(donationData);
        this.loading.set(false);

        const user = this.currentUser();

        // ✅ Recalculer isOwner avec vérifications
        if (user?._id && donationData?.donor?._id) {
          const isOwner = donationData.donor._id.toString() === user._id.toString();
          console.log('🔍 Owner check:', {
            userId: user._id,
            donorId: donationData.donor._id,
            isOwner
          });
          this.isOwner.set(isOwner);
        } else {
          console.log('⚠️ Cannot check owner - missing data');
        }

        setTimeout(() => this.initMap(), 100);
      },
      error: (err) => {
        console.error('❌ Error loading donation:', err);
        this.loading.set(false);
      }
    });
  }

  initMap(): void {
    const donation = this.donation();
    if (!donation?.pickupLocation?.coordinates) {
      console.log('⚠️ No coordinates for map');
      return;
    }

    const [lng, lat] = donation.pickupLocation.coordinates;

    if (this.map) this.map.remove();

    this.map = L.map('map').setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Icône personnalisée
    const icon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    L.marker([lat, lng], { icon })
      .addTo(this.map)
      .bindPopup(`<b>${donation.title}</b><br>${donation.pickupLocation.address}`)
      .openPopup();
  }

  nextImage(): void {
    const images = this.donation()?.images || [];
    if (images.length === 0) return;
    this.currentImageIndex.set(
      (this.currentImageIndex() + 1) % images.length
    );
  }

  prevImage(): void {
    const images = this.donation()?.images || [];
    if (images.length === 0) return;
    this.currentImageIndex.set(
      (this.currentImageIndex() - 1 + images.length) % images.length
    );
  }

  goBack(): void {
    this.router.navigate(['/donations']);
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

  getStatusColor(status: string): string {
    return {
      available: 'primary',
      reserved: 'accent',
      completed: 'primary',
      expired: 'warn'
    }[status] || 'primary';
  }

  getStatusLabel(status: string): string {
    return {
      available: 'Disponible',
      reserved: 'Réservé',
      completed: 'Complété',
      expired: 'Expiré'
    }[status] || status;
  }

  isExpiringSoon(): boolean {
    const expiry = this.donation()?.expiryDate;
    if (!expiry) return false;
    const diff = (new Date(expiry).getTime() - Date.now()) / 3600000;
    return diff <= 24 && diff > 0;
  }

  canReserve(): boolean {
    const donation = this.donation();
    const hasUser = !!this.currentUser();
    const isAvailable = donation?.status === 'available';
    const notOwner = !this.isOwner();

    // Debug logs
    console.log('🎯 canReserve check:', {
      hasDonation: !!donation,
      hasUser,
      isAvailable,
      notOwner,
      status: donation?.status,
      isOwner: this.isOwner(),
      currentUser: this.currentUser(),
      result: donation && isAvailable && notOwner && hasUser
    });

    return donation && isAvailable && notOwner && hasUser;
  }

  reserveDonation(): void {
    const donation = this.donation();
    if (!donation || this.reserving()) return;

    if (!this.currentUser()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.reserving.set(true);

    console.log('📤 Creating reservation:', {
      donationId: donation._id,
      title: donation.title
    });

    this.reservationService.createReservation({
      donationId: donation._id,
      pickupDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      message: `Je suis intéressé par : ${donation.title}`
    }).subscribe({
      next: (response) => {
        console.log('✅ Reservation created:', response);
        alert('✅ Réservation réussie !');
        this.loadDonation(donation._id);
        this.reserving.set(false);
      },
      error: (error) => {
        console.error('❌ Reservation error:', error);
        alert('❌ ' + (error.error?.message || 'Erreur lors de la réservation'));
        this.reserving.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.map) this.map.remove();
  }
}