import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'cupping', loadComponent: () => import('./components/cupping-form/cupping-form.component').then(m => m.CuppingFormComponent), canActivate: [authGuard] },
  { path: 'community', loadComponent: () => import('./components/community-board/community-board.component').then(m => m.CommunityBoardComponent) },
  { path: 'result/:id', loadComponent: () => import('./components/cupping-result/cupping-result.component').then(m => m.CuppingResultComponent) },
  { path: 'results/:id', redirectTo: 'result/:id' },
  { path: 'profile', loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent), canActivate: [authGuard] },
  { path: 'analytics', loadComponent: () => import('./components/analytics/analytics.component').then(m => m.AnalyticsComponent), canActivate: [authGuard] },
  { path: 'pricing', loadComponent: () => import('./components/pricing/pricing.component').then(m => m.PricingComponent) },
  { path: 'u/:id', loadComponent: () => import('./components/public-profile/public-profile.component').then(m => m.PublicProfileComponent) },
  { path: 'tos', loadComponent: () => import('./components/legal/tos/tos.component').then(m => m.TosComponent) },
  { path: 'privacy', loadComponent: () => import('./components/legal/privacy/privacy.component').then(m => m.PrivacyComponent) },
  { path: 'contact', loadComponent: () => import('./components/legal/contact/contact.component').then(m => m.ContactComponent) },
  { path: '', loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent), pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];
