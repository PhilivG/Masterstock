import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

// URLs de auth donde un 401 es una respuesta normal (credenciales invalidas),
// no una sesion expirada: no deben disparar un logout automatico.
const AUTH_ENDPOINTS = [`${environment.apiUrl}/auth/login`, `${environment.apiUrl}/auth/register`];

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const hadToken = !!authService.getToken();
  const isAuthEndpoint = AUTH_ENDPOINTS.some((url) => req.url.startsWith(url));

  return next(req).pipe(
    catchError((error) => {
      if (error?.status === 401 && hadToken && !isAuthEndpoint) {
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
