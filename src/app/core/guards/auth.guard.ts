import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthServices } from '../services/auth.service';
import { CanActivateFn, Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Component({
  selector: 'app-auth.guard',
  imports: [],
  template: `<p>auth.guard works!</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthGuard {

    constructor(
    private authService: AuthServices,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = this.authService.getToken();

    if (token) {
      return true;
    }

    this.router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });

    return false;
  }
}

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  return inject(AuthGuard).canActivate(route, state);

}
