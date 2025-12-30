import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const notificationsRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => 
      import('./notifications-list/notifications-list').then(m => m.NotificationsListComponent)
  }
];