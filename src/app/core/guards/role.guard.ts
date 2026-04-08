import { inject } from '@angular/core';
import { AuthServices } from '../services/auth.service';
import { CanActivateFn, Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserRole } from '../models/ticket.model';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthServices);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as UserRole[];

  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  const currentUser = authService.getCurrentUserSnapshot();
  if (!currentUser) {
    router.navigate(['/login']);
    return false;
  }

  const hasRole = requiredRoles.includes(currentUser.role);

  if (!hasRole) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};

