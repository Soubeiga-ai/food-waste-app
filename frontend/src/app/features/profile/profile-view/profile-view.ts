import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './profile-view.html',
  styleUrls: ['./profile-view.scss']
})
export class ProfileViewComponent implements OnInit {
  
  user = signal<any>(null);
  stats = signal<any>(null);
  loading = signal<boolean>(true);
  currentUser = signal<any>(null);

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {
    effect(() => {
      const user = this.authService.currentUser();
      this.currentUser.set(user);
      
      if (user) {
        this.loadProfile();
      }
    });
  }

  ngOnInit(): void {
    const user = this.currentUser();
    if (user) {
      this.loadProfile();
    }
  }

  loadProfile(): void {
    const userId = this.currentUser()?._id;
    if (!userId) return;

    this.loading.set(true);

    // Charger le profil
    this.userService.getUserById(userId).subscribe({
      next: (response) => {
        console.log('👤 Profile loaded:', response);
        this.user.set(response.data?.user || response.user || response.data);
      },
      error: (error) => {
        console.error('❌ Error loading profile:', error);
      }
    });

    // Charger les statistiques
    this.userService.getUserStats(userId).subscribe({
      next: (response) => {
        console.log('📊 Stats loaded:', response);
        this.stats.set(response.data?.stats || response.stats || response.data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('❌ Error loading stats:', error);
        this.loading.set(false);
      }
    });
  }

  getRoleBadge(role: string): string {
    const badges: any = {
      donor: '🎁 Donateur',
      beneficiary: '🙏 Bénéficiaire',
      both: '🤝 Donateur & Bénéficiaire'
    };
    return badges[role] || role;
  }

  getRoleColor(role: string): string {
    const colors: any = {
      donor: 'primary',
      beneficiary: 'accent',
      both: 'warn'
    };
    return colors[role] || 'primary';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  getRatingStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '⭐'.repeat(fullStars);
    if (hasHalfStar) stars += '✨';
    return stars || '—';
  }
}