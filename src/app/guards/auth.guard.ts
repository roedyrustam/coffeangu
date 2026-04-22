import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const authService = inject(AuthService);

  // Crucial: Wait for initial redirect result to be handled
  // especially on mobile where getRedirectResult updates the auth state
  try {
    await authService.handleRedirectResult();
  } catch (e) {
    // Ignore error here, let the guard handle current user status
  }

  // Also wait for the standard Firebase initial auth state
  await auth.authStateReady();

  if (auth.currentUser) {
    return true;
  } else {
    console.warn('AuthGuard: Unauthorized access to', state.url);
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
};
