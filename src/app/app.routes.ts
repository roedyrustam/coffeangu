import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CuppingFormComponent } from './components/cupping-form/cupping-form.component';
import { CuppingResultComponent } from './components/cupping-result/cupping-result.component';
import { CommunityBoardComponent } from './components/community-board/community-board.component';
import { LoginComponent } from './components/auth/login/login.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'login', component: LoginComponent },
  { path: 'cupping', component: CuppingFormComponent, canActivate: [authGuard] },
  { path: 'community', component: CommunityBoardComponent },
  { path: 'result/:id', component: CuppingResultComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
