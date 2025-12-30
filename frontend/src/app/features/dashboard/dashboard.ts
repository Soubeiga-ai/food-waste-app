// src/app/features/dashboard/dashboard.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { DonationService } from '../../core/services/donation.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  
  currentUser = signal<any>(null);
  stats = signal<any>(null);
  recentDonations = signal<any[]>([]);
  recentReservations = signal<any[]>([]);
  loading = signal<boolean>(true);

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private donationService: DonationService
  ) {}

  ngOnInit(): void {
    this.currentUser.set(this.authService.currentUser());
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    const userId = this.currentUser()?._id;
    if (!userId) return;

    this.loading.set(true);

    // Charger les statistiques
    this.userService.getUserStats(userId).subscribe({
      next: (response) => {
        this.stats.set(response.data?.stats || response.stats || response.data);
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });

    // Charger les donations récentes
    this.donationService.getMyDonations().subscribe({
      next: (response) => {
        const donations = response.data?.donations || response.donations || [];
        this.recentDonations.set(donations.slice(0, 5));
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading donations:', error);
        this.loading.set(false);
      }
    });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      available: 'Disponible',
      reserved: 'Réservé',
      completed: 'Complété',
      cancelled: 'Annulé'
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      available: 'primary',
      reserved: 'accent',
      completed: 'warn',
      cancelled: ''
    };
    return colors[status] || '';
  }
}