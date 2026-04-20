import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CuppingService } from '../../services/cupping.service';
import { TranslationService } from '../../services/translation.service';
import { AuthService } from '../../services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, of } from 'rxjs';
import { CuppingSession } from '../../models/cupping.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-container animate-fade">
      <header class="hero immersive">
        <div class="hero-visual">
          <img src="/assets/hero-dashboard.png" alt="Hero" class="hero-image">
          <div class="hero-overlay"></div>
        </div>
        <div class="hero-content">
          <div class="greeting-row">
            <div class="user-meta">
              <span class="greeting-text">{{ getGreeting() }}</span>
              <h1 class="brand-font">{{ auth.currentUser()?.displayName || 'Cupper' }}</h1>
            </div>
            <div class="mini-profile" [routerLink]="['/profile']">
               <img [src]="auth.currentUser()?.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=coffee'" alt="Profile">
            </div>
          </div>
          <p class="hero-sub">{{ t('HERO_SUBTITLE') }}</p>
        </div>
      </header>

      <section class="stats-carousel scrollbar-hidden">
        <div class="glass-card stat-card">
          <span class="stat-label">{{ t('STAT_TOTAL_SESSIONS') }}</span>
          <div class="stat-value">{{ userCuppings()?.length || 0 }}</div>
        </div>
        <div class="glass-card stat-card">
          <span class="stat-label">{{ t('STAT_AVG_SCORE') }}</span>
          <div class="stat-value">{{ calculateAvg() }}</div>
        </div>
        <div class="glass-card stat-card specialty">
          <span class="stat-label">Specialty Ratio</span>
          <div class="stat-value">{{ getSpecialtyCount() }}</div>
        </div>
      </section>

      <section class="recent-sessions">
        <div class="section-header">
           <h2 class="section-title">TOP GLOBAL DISCOVERY</h2>
        </div>

        <div class="sessions-list">
          <div *ngFor="let session of cuppings()" class="glass-card session-item" [routerLink]="['/result', session.id]">
            <div class="session-image">
               <img [src]="session.productImageUrl || '/assets/default-coffee.png'" alt="Product Photo">
            </div>
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
                   <div class="mini-bar" [style.height.%]="(session.scores.flavor - 6) * 25" [style.background]="getBarColor(session.scores.flavor)" title="Flavor"></div>
                   <div class="mini-bar" [style.height.%]="(session.scores.acidity - 6) * 25" [style.background]="getBarColor(session.scores.acidity)" title="Acidity"></div>
                   <div class="mini-bar" [style.height.%]="(session.scores.body - 6) * 25" [style.background]="getBarColor(session.scores.body)" title="Body"></div>
                </div>
                <div class="session-score" [class.high-score]="session.finalScore >= 80" [class.specialty-pulse]="session.finalScore >= 85">
                  {{ session.finalScore | number:'1.1-1' }}
                </div>
              </div>
            </div>
            <div class="session-social" *ngIf="session.likesCount">
               <span class="likes">❤️ {{ session.likesCount }} users liked this results</span>
            </div>
            <div class="session-footer">
               <span class="harvest" *ngIf="session.postHarvest">Process: {{ session.postHarvest }}</span>
               <span class="date">{{ session.timestamp?.toDate() | date:'MMM d, y' }}</span>
            </div>
          </div>
        </div>
        </section>
        <button class="fab-button" routerLink="/cupping">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-7-7v14"/></svg>
        </button>
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
      border-radius: var(--radius-lg);
      overflow: hidden;
      min-height: 420px;
      display: flex;
      align-items: flex-end;
      padding: 60px;
      border: 1px solid var(--glass-border);
      box-shadow: 0 20px 80px rgba(0,0,0,0.6);
    }
    .hero-visual {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      z-index: 0;
    }
    .hero-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: brightness(0.7) contrast(1.1);
      transition: transform 10s linear;
    }
    .hero:hover .hero-image {
      transform: scale(1.1);
    }
    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, transparent 0%, rgba(12, 12, 14, 0.4) 40%, var(--bg-color) 100%);
    }
    .hero-content {
      position: relative;
      z-index: 1;
      width: 100%;
    }
    .greeting-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 25px;
    }
    .greeting-text {
      color: var(--primary-color);
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 3px;
      font-size: 0.9rem;
      text-shadow: 0 2px 10px rgba(0,0,0,0.5);
    }
    .mini-profile {
      width: 65px;
      height: 65px;
      border-radius: 20px;
      overflow: hidden;
      border: 2px solid var(--primary-color);
      box-shadow: 0 12px 30px rgba(189, 142, 98, 0.4);
      cursor: pointer;
      backdrop-filter: blur(10px);
    }
    .mini-profile img { width: 100%; height: 100%; object-fit: cover; }
    .hero h1 {
      font-size: 4.5rem;
      color: var(--text-main);
      margin-top: 5px;
      line-height: 0.9;
      text-shadow: 0 10px 30px rgba(0,0,0,0.8);
    }
    .hero-sub {
      color: var(--text-main);
      font-size: 1.1rem;
      letter-spacing: 4px;
      text-transform: uppercase;
      font-weight: 700;
      opacity: 0.8;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }
    .stats-carousel {
      display: flex;
      gap: 20px;
      margin-bottom: 60px;
      overflow-x: auto;
      padding-bottom: 10px;
      padding-right: 20px;
    }
    .stat-card {
      min-width: 200px;
      flex: 1;
      text-align: center;
      padding: 30px;
    }
    .stat-card.specialty {
      border-color: var(--accent-neon);
      background: linear-gradient(135deg, rgba(212, 225, 87, 0.05), transparent);
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
      font-family: var(--font-brand);
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
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    }
    .session-image {
      width: calc(100% + 60px);
      margin: -30px -30px 0 -30px;
      height: 180px;
      overflow: hidden;
      border-bottom: 1px solid var(--glass-border);
    }
    .session-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s;
    }
    .session-item:hover .session-image img {
      transform: scale(1.1);
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
      font-family: var(--font-brand);
      color: var(--primary-color);
    }
    .high-score {
      color: var(--accent-neon) !important;
      text-shadow: 0 0 20px rgba(212, 225, 87, 0.4);
    }
    .session-social {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--primary-color);
      background: rgba(189, 142, 98, 0.1);
      padding: 10px;
      border-radius: 12px;
      text-align: center;
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
  protected auth = inject(AuthService);
  
  cuppings = toSignal(this.cuppingService.getPublicCuppings({ 
    sortBy: 'finalScore', 
    order: 'desc', 
    limit: 6 
  }));

  userCuppings = toSignal(this.auth.user$.pipe(
    switchMap(user => user ? this.cuppingService.getUserCuppings(user.uid) : of([]))
  ));

  t = this.ts.t();

  getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  calculateAvg() {
    const list = this.userCuppings() as any[];
    if (!list || list.length === 0) return '0.0';
    const sum = list.reduce((acc: number, curr: any) => acc + curr.finalScore, 0);
    return (sum / list.length).toFixed(1);
  }

  getSpecialtyCount() {
    const list = this.userCuppings() as any[];
    if (!list || list.length === 0) return '0%';
    const count = list.filter(c => c.finalScore >= 80).length;
    return Math.round((count / list.length) * 100) + '%';
  }

  getBarColor(val: number) {
    if (val >= 8) return 'var(--accent-neon)';
    if (val >= 7) return 'var(--primary-color)';
    return 'var(--text-dim)';
  }
}
