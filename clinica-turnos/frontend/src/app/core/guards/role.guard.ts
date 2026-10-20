import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { RolUsuario } from '../models/user.model';

export const roleGuard = (allowedRoles: RolUsuario[]): CanActivateFn => {
  return (_route, _state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }

    if (authService.hasRole(allowedRoles)) {
      return true;
    }

    // Usuario autenticado pero sin permisos para esta seccion
    router.navigate(['/no-autorizado']);
    return false;
  };
};
