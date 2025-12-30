import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const profileRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => 
      import('./profile-view/profile-view').then(m => m.ProfileViewComponent)
  },
  {
    path: 'edit',
    canActivate: [authGuard],
    loadComponent: () => 
      import('./profile-edit/profile-edit').then(m => m.ProfileEditComponent)
  }
];