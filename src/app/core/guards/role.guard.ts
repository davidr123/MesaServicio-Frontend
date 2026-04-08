import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthServices } from '../services/auth.service';
import { CanActivateFn, Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserRole } from '../models/ticket.model';

@Component({
  selector: 'app-role.guard',
  imports: [],
  template: `<p>roleguard works!</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleGuard {
  constructor(
    private authService: AuthServices,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const requiredRoles = route.data['roles'] as UserRole[];

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const currentUser = this.authService.getCurrentUserSnapshot();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return false;
    }

    const hasRole = requiredRoles.includes(currentUser.role);

    if (!hasRole) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  return inject(RoleGuard).canActivate(route, state);

 }
