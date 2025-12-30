// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Récupérer le token directement du localStorage
  const token = localStorage.getItem('auth_token');

  // Si un token existe, on l'ajoute au header
  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedRequest);
  }

  // Sinon, on envoie la requête telle quelle
  return next(req);
};