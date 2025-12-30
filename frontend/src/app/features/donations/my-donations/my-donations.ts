// src/app/features/donations/my-donations/my-donations.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';

import { DonationService } from '../../../core/services/donation.service';
import { Donation } from '../../../models/donation.model';

@Component({
  selector: 'app-my-donations',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTabsModule
  ],
  templateUrl: './my-donations.html',
  styleUrls: ['./my-donations.scss']
})
export class MyDonationsComponent implements OnInit {
  donations = signal<Donation[]>([]);
  isLoading = signal(true);

  constructor(private donationService: DonationService) {}

  ngOnInit(): void {
    this.loadMyDonations();
  }

  loadMyDonations(): void {
    this.isLoading.set(true);

    this.donationService.getMyDonations().subscribe({
      next: (response) => {
        this.donations.set(response.data.donations || []);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.isLoading.set(false);
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      'available': 'Disponible',
      'reserved': 'Réservé',
      'completed': 'Complété',
      'expired': 'Expiré'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    return `badge-${status}`;
  }

  getFilteredDonations(status?: string): Donation[] {
    const all = this.donations();
    if (!status) return all;
    return all.filter(d => d.status === status);
  }
}