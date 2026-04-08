import { inject } from '@angular/core';
import { AuthServices } from '../services/auth.service';
import { CanActivateFn, Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthServices);
  const router = inject(Router);

  const token = authService.getToken();

  if (token) {
    return true;
  }

  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });

  return false;
};

