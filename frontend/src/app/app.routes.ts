import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/donations',
    pathMatch: 'full'
  },

  // Liste des donations
  {
    path: 'donations',
    loadComponent: () =>
      import('./features/donations/donation-list/donation-list')
        .then(m => m.DonationListComponent)
  },

  // Création d'une donation (AVANT le :id pour éviter les conflits)
  {
    path: 'donations/create',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/donations/donation-create/donation-create')
        .then(m => m.DonationCreateComponent)
  },

  // Détails d'une donation (APRÈS create)
  {
    path: 'donations/:id',
    loadComponent: () =>
      import('./features/donations/donation-detail/donation-detail')
        .then(m => m.DonationDetailComponent)
  },

  // Mes donations
  {
    path: 'my-donations',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/donations/my-donations/my-donations')
        .then(m => m.MyDonationsComponent)
  },

  // Réservations
  {
    path: 'reservations',
    canActivate: [authGuard],
    loadChildren: () => 
      import('./features/reservations/reservations.routes')
        .then(m => m.reservationsRoutes)
  },

  // Notifications
  {
    path: 'notifications',
    canActivate: [authGuard],
    loadChildren: () => 
      import('./features/notifications/notifications.routes')
        .then(m => m.notificationsRoutes)
  },

  // ===== PROFIL (AJOUTÉ) =====
  {
    path: 'profile',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/profile/profile-view/profile-view')
            .then(m => m.ProfileViewComponent)
      },
      {
        path: 'edit',
        loadComponent: () =>
          import('./features/profile/profile-edit/profile-edit')
            .then(m => m.ProfileEditComponent)
      }
    ]
  },

  // Tableau de bord (AJOUTÉ)
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard')
        .then(m => m.DashboardComponent)
  },
  
  // Authentication
  {
    path: 'auth',
    canActivate: [noAuthGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register').then(m => m.RegisterComponent)
      }
    ]
  },

  // 404
  {
    path: '**',
    redirectTo: '/donations'
  }
];