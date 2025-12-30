import { Component, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule
  ],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavbarComponent {

  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  isAuthenticated = signal<boolean>(false);
  currentUser = signal<any>(null);
  userName = signal<string>('');

  // 🔔 IMPORTANT : on expose DIRECTEMENT le signal du service
  unreadNotificationsCount = this.notificationService.unreadCount;

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();

      this.isAuthenticated.set(!!user);
      this.currentUser.set(user);

      if (user) {
        this.userName.set(`${user.firstName} ${user.lastName}`);
        // 🔄 déclenche un chargement initial (le service gère le refresh)
        this.notificationService.loadUnreadCount();
      } else {
        this.unreadNotificationsCount.set(0);
      }
    });
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  onLogout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.authService.logout();
      this.router.navigate(['/']);
    }
  }
}
