import { Component, inject, signal } from '@angular/core';
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
        <div class="hero-content luminescent-border" style="padding: 40px; border-radius: var(--radius-lg); background: rgba(12,12,14,0.4); backdrop-filter: blur(20px);">
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

      <!-- AI INSIGHTS QUICK SECTION -->
      <section class="ai-insights-section animate-fade" *ngIf="userCuppings()?.length">
        <div class="glass-card ai-insight-card luminescent-border">
          <div class="ai-header">
            <span class="ai-sparkle">✨</span>
            <h3>AI Sensory Insights</h3>
          </div>
          <p class="ai-text">{{ getAiInsight() }}</p>
        </div>
      </section>

      <!-- GLOBAL FLAVOR HEATMAP -->
      <section class="heatmap-section animate-fade">
        <div class="section-header">
          <h2 class="section-title">GLOBAL FLAVOR TRENDS</h2>
        </div>
        <div class="heatmap-grid glass-card">
          <div class="heatmap-item" *ngFor="let note of heatmap()">
             <span class="note-name">#{{ note }}</span>
             <div class="note-bar-bg">
               <div class="note-bar-fill" [style.width.%]="80 - (heatmap().indexOf(note) * 10)"></div>
             </div>
          </div>
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
                   <div class="mini-bar" [style.height.%]="(session.scores.flavor - 1) / 8 * 100" [style.background]="getBarColor('flavor')" title="Flavor"></div>
                   <div class="mini-bar" [style.height.%]="(session.scores.acidity - 1) / 8 * 100" [style.background]="getBarColor('acidity')" title="Acidity"></div>
                   <div class="mini-bar" [style.height.%]="(session.scores.mouthfeel - 1) / 8 * 100" [style.background]="getBarColor('mouthfeel')" title="Mouthfeel"></div>
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
      max-width: 1400px;
      margin: 0 auto;
      padding: 40px;
      padding-bottom: 120px;
    }
    .hero {
      position: relative;
      border-radius: var(--radius-lg);
      overflow: hidden;
      min-height: 500px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 60px;
      margin-bottom: 60px;
      border: 1px solid var(--glass-border);
      box-shadow: 0 40px 100px rgba(0,0,0,0.8);
    }
    .hero-visual {
      position: absolute;
      inset: 0;
      z-index: 0;
    }
    .hero-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: brightness(0.6) contrast(1.2);
    }
    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, var(--bg-color) 0%, rgba(12, 12, 14, 0.4) 60%, transparent 100%);
    }
    .hero-content {
      position: relative;
      z-index: 1;
    }
    .greeting-text {
      color: var(--primary-color);
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 4px;
      font-size: 0.75rem;
      margin-bottom: 12px;
      display: block;
    }
    .hero h1 {
      font-size: 5rem;
      margin: 0;
      line-height: 1;
      letter-spacing: -3px;
    }
    .hero-sub {
      color: var(--text-dim);
      font-size: 1.1rem;
      margin-top: 20px;
      max-width: 500px;
    }
    .ai-insights-section { margin-bottom: 60px; }
    .ai-insight-card { padding: 32px; background: rgba(212, 225, 87, 0.05); border-color: rgba(212, 225, 87, 0.2); }
    .ai-header { display: flex; align-items: center; gap: 12px; margin-bottom: 15px; }
    .ai-header h3 { font-size: 1.2rem; color: var(--accent-neon); text-transform: uppercase; letter-spacing: 1px; }
    .ai-text { color: var(--text-main); font-size: 1.1rem; line-height: 1.6; }
    .ai-sparkle { font-size: 1.5rem; filter: drop-shadow(0 0 8px var(--accent-neon)); }

    .heatmap-section { margin-bottom: 80px; }
    .heatmap-grid { padding: 40px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
    .heatmap-item { display: flex; align-items: center; gap: 20px; }
    .note-name { flex: 0 0 120px; font-weight: 800; color: var(--primary-color); font-size: 0.9rem; }
    .note-bar-bg { flex: 1; height: 8px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden; }
    .note-bar-fill { height: 100%; background: var(--primary-gradient); border-radius: 10px; box-shadow: 0 0 15px var(--primary-glow); }
    .stats-carousel {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin-bottom: 80px;
    }
    .stat-card {
      padding: 40px;
      text-align: center;
      border-radius: var(--radius-lg);
    }
    .stat-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 3px;
      color: var(--text-dim);
      font-weight: 800;
      margin-bottom: 12px;
      display: block;
    }
    .stat-value {
      font-size: 4rem;
      font-weight: 900;
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      line-height: 1;
    }
    .section-header {
      margin-bottom: 40px;
    }
    .section-title {
      font-size: 2.5rem;
      letter-spacing: -1.5px;
    }
    .sessions-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 32px;
    }
    .session-item {
      padding: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .session-image {
      width: 100%;
      height: 240px;
      overflow: hidden;
      position: relative;
    }
    .session-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .session-item:hover .session-image img {
      transform: scale(1.1);
    }
    .session-main {
      padding: 32px;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .tag {
      font-size: 0.65rem;
      font-weight: 900;
      padding: 6px 14px;
      border-radius: 8px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }
    .type-tag {
      background: rgba(189, 142, 98, 0.1);
      color: var(--primary-color);
      border: 1px solid rgba(189, 142, 98, 0.2);
    }
    .session-info h3 {
      font-size: 1.8rem;
      margin: 12px 0 8px;
      line-height: 1.1;
    }
    .metadata {
      color: var(--text-dim);
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .session-performance {
      background: rgba(0, 0, 0, 0.3);
      padding: 20px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .mini-sensory {
      display: flex;
      align-items: flex-end;
      gap: 4px;
      height: 32px;
    }
    .mini-bar {
      width: 8px;
      border-radius: 2px;
      opacity: 0.3;
    }
    .session-score {
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--primary-color);
    }
    .high-score {
      color: var(--accent-neon);
    }
    .session-footer {
      padding: 20px 32px;
      background: rgba(255, 255, 255, 0.02);
      border-top: 1px solid var(--glass-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75rem;
      color: var(--text-dim);
    }
    @media (max-width: 1024px) {
      .stats-carousel { grid-template-columns: 1fr; }
      .hero h1 { font-size: 3.5rem; }
    }
    @media (max-width: 768px) {
      .dashboard-container { padding: 20px; }
      .hero { min-height: 400px; padding: 40px; }
      .sessions-list { grid-template-columns: 1fr; }
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

  heatmap = signal<string[]>(['Chocolate', 'Berry', 'Citrus', 'Caramel', 'Floral', 'Nutty', 'Stone Fruit', 'Spices']);

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

  getBarColor(attr: string) {
    const colors: any = { flavor: '#FFA000', acidity: '#40C4FF', mouthfeel: '#69F0AE' };
    return colors[attr] || 'var(--primary-color)';
  }

  getAiInsight() {
    const list = this.userCuppings() as any[];
    if (!list || list.length === 0) return 'Start your first cupping session to unlock AI sensory insights.';
    
    const avgScore = parseFloat(this.calculateAvg());
    if (avgScore >= 85) return "Your palate is exceptionally tuned for specialty coffee. Consider exploring complex Anaerobic processes to further challenge your sensory acuity.";
    if (avgScore >= 80) return "You're consistently identifying specialty grades. Try focusing more on 'Aftertaste' and 'Balance' to refine your scoring precision.";
    
    return "Great start! Focus on identifying basic flavor groups like 'Nutty' vs 'Fruity' to build your sensory foundation.";
  }

  async ngOnInit() {
    const trends = await this.cuppingService.getSmartSuggestions({});
    if (trends.length > 0) this.heatmap.set(trends);
  }
}
