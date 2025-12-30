import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const reservationsRoutes: Routes = [
  {
    path: '',
    redirectTo: 'my-reservations',
    pathMatch: 'full'
  },
  {
    path: 'my-reservations',
    canActivate: [authGuard],
    loadComponent: () => 
      import('./my-reservations/my-reservations').then(m => m.MyReservationsComponent)
  },
  {
    path: 'received',
    canActivate: [authGuard],
    loadComponent: () => 
      import('./received-reservations/received-reservations').then(m => m.ReceivedReservationsComponent)
  },
  {
    path: ':id',
    canActivate: [authGuard],
    loadComponent: () => 
      import('./reservation-detail/reservation-detail').then(m => m.ReservationDetailComponent)
  }
];