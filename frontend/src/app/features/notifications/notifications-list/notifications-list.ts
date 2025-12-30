import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // ⬅️ RouterLink RETIRÉ
import { NotificationService, Notification } from '../../../core/services/notification.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list'; 

@Component({
  selector: 'app-notifications-list',
  standalone: true,
  imports: [
    CommonModule,
    // RouterLink, ⬅️ RETIRÉ pour NG8113
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatMenuModule,
    MatBadgeModule,
    MatListModule, 
  ],
  templateUrl: './notifications-list.html',
  styleUrls: ['./notifications-list.scss']
})
export class NotificationsListComponent implements OnInit {
  
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  allNotifications = signal<Notification[]>([]);
  loading = signal<boolean>(true);
  filterOptions: Array<'all' | 'unread' | 'read'> = ['all', 'unread', 'read'];
  currentFilterIndex = signal<number>(0); 

  unreadCount = computed(() => this.allNotifications().filter(n => !n.isRead).length);
  readCount = computed(() => this.allNotifications().filter(n => n.isRead).length);

  filteredNotifications = computed(() => {
    const notifications = this.allNotifications();
    const filter = this.filterOptions[this.currentFilterIndex()];
    
    if (filter === 'unread') {
      return notifications.filter(n => !n.isRead);
    } else if (filter === 'read') {
      return notifications.filter(n => n.isRead);
    } else {
      return notifications;
    }
  });
  
  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading.set(true);
    
    this.notificationService.getNotifications().subscribe({
      next: (response) => {
        const notifications = response.data?.notifications || response.notifications || [];
        this.allNotifications.set(notifications);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('❌ Error loading notifications:', error);
        this.loading.set(false);
      }
    });
  }
  
  setFilterIndex(index: number): void {
    this.currentFilterIndex.set(index);
  }

  onNotificationClick(notification: Notification): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification._id).subscribe({
        next: () => {
          const index = this.allNotifications().findIndex(n => n._id === notification._id);
          if (index > -1) {
            const updatedList = [...this.allNotifications()];
            updatedList[index] = { ...updatedList[index], isRead: true };
            this.allNotifications.set(updatedList);
          }
        },
        error: (err) => console.error('Error marking as read:', err)
      });
    }

    if (notification.link) {
      this.router.navigate([notification.link]);
    }
  }

  markAllAsRead(): void {
    if (!confirm('Marquer toutes les notifications comme lues ?')) return;

    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        const updatedList = this.allNotifications().map(n => ({ ...n, isRead: true }));
        this.allNotifications.set(updatedList);
        alert('✅ Toutes les notifications ont été marquées comme lues');
      },
      error: (error) => {
        console.error('Error:', error);
        alert('❌ Erreur lors de l\'opération');
      }
    });
  }

  deleteNotification(notification: Notification, event: Event): void {
    event.stopPropagation();
    
    if (!confirm('Supprimer cette notification ?')) return;

    this.notificationService.deleteNotification(notification._id).subscribe({
      next: () => {
        this.allNotifications.update(list => list.filter(n => n._id !== notification._id));
        alert('✅ Notification supprimée');
      },
      error: (error) => {
        console.error('Error:', error);
        alert('❌ Erreur lors de la suppression');
      }
    });
  }

  deleteAll(): void {
    if (!confirm('Supprimer TOUTES les notifications ? Cette action est irréversible.')) return;

    this.notificationService.deleteAllNotifications().subscribe({
      next: () => {
        this.allNotifications.set([]);
        alert('✅ Toutes les notifications ont été supprimées');
      },
      error: (error) => {
        console.error('Error:', error);
        alert('❌ Erreur lors de la suppression');
      }
    });
  }

  getNotificationIcon(type: string): string {
    return this.notificationService.getNotificationIcon(type);
  }

  getNotificationColor(type: string): string {
    return this.notificationService.getNotificationColor(type);
  }

  formatDate(date: string): string {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    
    return notifDate.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: diffDays > 365 ? 'numeric' : undefined
    });
  }
}