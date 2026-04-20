import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CuppingService } from '../../services/cupping.service';
import { TranslationService } from '../../services/translation.service';
import { AuthService } from '../../services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { CuppingSession } from '../../models/cupping.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-container animate-fade">
      <header class="hero">
        <h1 class="brand-font">{{ t('APP_TITLE') }}</h1>
        <p>{{ t('HERO_SUBTITLE') }}</p>
        <div class="actions">
          <button class="btn-primary" routerLink="/cupping">{{ t('BTN_NEW_SESSION') }}</button>
        </div>
      </header>

      <section class="stats-grid">
        <div class="glass-card stat-card">
          <span class="stat-label">{{ t('STAT_TOTAL_SESSIONS') }}</span>
          <div class="stat-value">{{ cuppings()?.length || 0 }}</div>
        </div>
        <div class="glass-card stat-card">
          <span class="stat-label">{{ t('STAT_AVG_SCORE') }}</span>
          <div class="stat-value">{{ calculateAvg() }}</div>
        </div>
      </section>

      <section class="recent-sessions">
        <div class="section-header">
           <h2 class="section-title">{{ t('RECENT_SCORES') }}</h2>
           <span class="count-badge">{{ cuppings()?.length || 0 }} {{ t('ENTRIES') }}</span>
        </div>

        <div class="sessions-list">
          <div *ngFor="let session of cuppings()" class="glass-card session-item" [routerLink]="['/result', session.id]">
            <div class="session-main">
              <div class="session-info">
                <div class="tags">
                  <span class="tag type-tag">{{ session.type }}</span>
                  <span class="tag method-tag" *ngIf="session.brewMethod">{{ session.brewMethod }}</span>
                </div>
                <h3>{{ session.beanName }}</h3>
                <div class="metadata">
                   <span class="roastery">{{ session.roastery }}</span>
                   <span class="separator">•</span>
                   <span class="cupper">by {{ session.cupperName || 'Anonymous' }}</span>
                </div>
              </div>
              
              <div class="session-performance">
                <div class="mini-sensory">
                   <div class="mini-bar" [style.height.%]="(session.scores.flavor - 6) * 25" title="Flavor"></div>
                   <div class="mini-bar" [style.height.%]="(session.scores.acidity - 6) * 25" title="Acidity"></div>
                   <div class="mini-bar" [style.height.%]="(session.scores.body - 6) * 25" title="Body"></div>
                </div>
                <div class="session-score" [class.high-score]="session.finalScore >= 85">
                  {{ session.finalScore | number:'1.2-2' }}
                </div>
              </div>
            </div>
            <div class="session-footer">
               <span class="harvest" *ngIf="session.postHarvest">Process: {{ session.postHarvest }}</span>
               <span class="date">{{ session.timestamp?.toDate() | date:'MMM d, y' }}</span>
            </div>
          </div>
        </div>

        <div class="empty-state" *ngIf="cuppings()?.length === 0">
           <p>No cupping sessions found. Start your first session!</p>
           <button class="btn-primary" routerLink="/cupping">Start Cupping</button>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 60px 40px;
      padding-bottom: 120px;
    }
    .hero {
      text-align: left;
      margin-bottom: 60px;
      position: relative;
    }
    .hero h1 {
      font-size: 5rem;
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0px;
      line-height: 1;
    }
    .hero p {
      color: var(--text-dim);
      font-size: 1.2rem;
      letter-spacing: 4px;
      text-transform: uppercase;
      font-weight: 500;
      margin-top: 10px;
    }
    .actions {
      margin-top: 40px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 30px;
      margin-bottom: 80px;
    }
    .stat-card {
      text-align: center;
      padding: 40px;
      background: var(--surface-color);
    }
    .stat-label {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 3px;
      color: var(--text-dim);
      font-weight: 700;
    }
    .stat-value {
      font-size: 4rem;
      font-weight: 900;
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-top: 10px;
      font-family: 'Playfair Display', serif;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
    }
    .section-title {
      font-size: 1.8rem;
      border-left: 6px solid var(--primary-color);
      padding-left: 20px;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -1px;
    }
    .count-badge {
      background: var(--surface-hover);
      padding: 10px 24px;
      border-radius: 100px;
      font-size: 0.8rem;
      color: var(--text-dim);
      font-weight: 700;
      border: 1px solid var(--glass-border);
    }
    .sessions-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 30px;
    }
    .session-item {
      background: var(--surface-color);
      border-radius: var(--radius-lg);
      padding: 30px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 25px;
      border: 1px solid var(--glass-border);
      transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .session-item:hover {
      border-color: rgba(189, 142, 98, 0.4);
      transform: translateY(-8px);
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    }
    .tag {
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      padding: 6px 14px;
      border-radius: 100px;
      font-weight: 800;
    }
    .type-tag {
      background: var(--primary-gradient);
      color: #0c0c0e;
    }
    .method-tag {
      background: var(--surface-hover);
      color: var(--text-dim);
      border: 1px solid var(--glass-border);
    }
    .session-info h3 {
      font-size: 1.6rem;
      margin-top: 15px;
      font-weight: 800;
      color: var(--text-main);
    }
    .metadata {
      margin-top: 8px;
      font-size: 0.9rem;
      color: var(--text-dim);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .session-performance {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      background: rgba(0,0,0,0.2);
      padding: 15px 20px;
      border-radius: var(--radius-md);
    }
    .mini-sensory {
      display: flex;
      align-items: flex-end;
      gap: 6px;
      height: 40px;
    }
    .mini-bar {
      width: 10px;
      background: var(--primary-color);
      border-radius: 3px 3px 0 0;
      opacity: 0.4;
      transition: all 0.5s;
    }
    .session-item:hover .mini-bar {
      opacity: 1;
      background: var(--primary-gradient);
    }
    .session-score {
      font-size: 2.2rem;
      font-weight: 900;
      font-family: 'Playfair Display', serif;
      color: var(--primary-color);
    }
    .high-score {
      color: var(--accent-neon);
      text-shadow: 0 0 20px rgba(212, 225, 87, 0.2);
    }
    .session-footer {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: var(--text-dim);
      padding-top: 15px;
      border-top: 1px solid var(--glass-border);
    }
    .empty-state {
      text-align: center;
      padding: 120px 20px;
    }

    @media (max-width: 600px) {
      .hero h1 { font-size: 3.5rem; }
      .dashboard-container { padding: 40px 20px; }
      .session-performance { padding: 15px; }
    }
  `]
})
export class DashboardComponent {
  private cuppingService = inject(CuppingService);
  private ts = inject(TranslationService);
  private auth = inject(AuthService);
  cuppings = toSignal(this.auth.user$.pipe(
    switchMap(user => this.cuppingService.getLatestCuppings(user?.uid))
  ));
  t = this.ts.t();

  calculateAvg() {
    const list = this.cuppings() as any[];
    if (!list || list.length === 0) return '0.00';
    const sum = list.reduce((acc: number, curr: any) => acc + curr.finalScore, 0);
    return (sum / list.length).toFixed(2);
  }
}
