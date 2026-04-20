import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, filter } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    // Filter out initial initialization state if it emissions undefined
    // And actually, we'll use a small trick: wait until the auth state is definitive.
    // Firebase auth can sometimes emit null then the User.
    take(1),
    map(user => {
      if (user) {
        return true;
      } else {
        console.warn('AuthGuard: Unauthorized access to', state.url);
        router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
      }
    })
  );
};
