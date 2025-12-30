// src/app/features/donations/donation-list/donation-list.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

import { DonationService } from '../../../core/services/donation.service';
import { Donation, FoodCategory } from '../../../models/donation.model';

@Component({
  selector: 'app-donation-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './donation-list.html',
  styleUrls: ['./donation-list.scss']
})
export class DonationListComponent implements OnInit {
  donations = signal<Donation[]>([]);
  isLoading = signal(true);
  
  // Pagination
  currentPage = 1;
  pageSize = 12;
  totalItems = 0;

  // Filtres
  searchText = '';
  selectedCategory: FoodCategory | '' = '';

  categories = [
    { value: '', label: 'Toutes les catégories' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'legumes', label: 'Légumes' },
    { value: 'pain', label: 'Pain' },
    { value: 'produits_laitiers', label: 'Produits laitiers' },
    { value: 'viande', label: 'Viande' },
    { value: 'poisson', label: 'Poisson' },
    { value: 'plats_prepares', label: 'Plats préparés' },
    { value: 'patisseries', label: 'Pâtisseries' },
    { value: 'conserves', label: 'Conserves' },
    { value: 'boissons', label: 'Boissons' },
    { value: 'autre', label: 'Autre' }
  ];

  constructor(private donationService: DonationService) {}

  ngOnInit(): void {
    this.loadDonations();
  }

  loadDonations(): void {
    this.isLoading.set(true);

    const filters: any = {
      page: this.currentPage,
      limit: this.pageSize,
      status: 'available'
    };

    if (this.searchText) {
      filters.search = this.searchText;
    }

    if (this.selectedCategory) {
      filters.category = this.selectedCategory;
    }

    this.donationService.getDonations(filters).subscribe({
      next: (response) => {
        this.donations.set(response.data);
        this.totalItems = response.pagination.totalItems;
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des donations:', error);
        this.isLoading.set(false);
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadDonations();
  }

  onCategoryChange(): void {
    this.currentPage = 1;
    this.loadDonations();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadDonations();
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

  getCategoryLabel(category: string): string {
    const cat = this.categories.find(c => c.value === category);
    return cat ? cat.label : category;
  }

  getTimeRemaining(expiryDate: string): string {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days} jour${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} heure${hours > 1 ? 's' : ''}`;
    } else {
      return 'Bientôt expiré';
    }
  }
}