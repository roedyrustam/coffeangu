import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CuppingFormComponent } from './components/cupping-form/cupping-form.component';
import { CuppingResultComponent } from './components/cupping-result/cupping-result.component';
import { CommunityBoardComponent } from './components/community-board/community-board.component';
import { LoginComponent } from './components/auth/login/login.component';
import { ProfileComponent } from './components/profile/profile.component';
import { PublicProfileComponent } from './components/public-profile/public-profile.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'login', component: LoginComponent },
  { path: 'cupping', component: CuppingFormComponent, canActivate: [authGuard] },
  { path: 'community', component: CommunityBoardComponent },
  { path: 'result/:id', component: CuppingResultComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'pricing', loadComponent: () => import('./components/pricing/pricing.component').then(m => m.PricingComponent) },
  { path: 'u/:id', component: PublicProfileComponent },
  { path: '**', redirectTo: '' }
];
