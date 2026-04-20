import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Auth } from '@angular/fire/auth';

export const authGuard: CanActivateFn = async (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  // Wait for the initial authentication state to resolve
  await auth.authStateReady();

  if (auth.currentUser) {
    return true;
  } else {
    console.warn('AuthGuard: Unauthorized access to', state.url);
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
};
