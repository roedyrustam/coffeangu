import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CuppingFormComponent } from './components/cupping-form/cupping-form.component';
import { CuppingResultComponent } from './components/cupping-result/cupping-result.component';
import { CommunityBoardComponent } from './components/community-board/community-board.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'cupping', component: CuppingFormComponent },
  { path: 'community', component: CommunityBoardComponent },
  { path: 'result/:id', component: CuppingResultComponent },
  { path: '**', redirectTo: '' }
];
