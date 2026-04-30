import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SensoryAiService } from '../../services/sensory-ai.service';
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
      <!-- DYNAMIC BACKGROUND ORBS -->
      <div class="bg-glow orb-1"></div>
      <div class="bg-glow orb-2"></div>

      <header class="hero immersive">
        <div class="hero-visual">
          <img src="/assets/hero-dashboard.png" alt="Hero" class="hero-image">
          <div class="hero-overlay"></div>
        </div>
        <div class="hero-content luminescent-border">
          <div class="greeting-row">
            <div class="user-meta">
              <span class="greeting-text animate-slide-right">{{ getGreeting() }}</span>
              <h1 class="brand-font animate-reveal">{{ auth.currentUser()?.displayName || 'Cupper' }}</h1>
            </div>
            <div class="mini-profile" [routerLink]="['/profile']">
               <img [src]="auth.currentUser()?.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=coffee'" alt="Profile">
               <div class="status-ring"></div>
            </div>
          </div>
          <p class="hero-sub">{{ t('HERO_SUBTITLE') }}</p>
          
          <div class="hero-actions">
            <button class="btn-primary-glow" routerLink="/cupping">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-7-7v14"/></svg>
              <span>New Session</span>
            </button>
          </div>
        </div>
      </header>

      <section class="stats-carousel scrollbar-hidden">
        <div class="glass-card stat-card hover-lift">
          <span class="stat-label">{{ t('STAT_TOTAL_SESSIONS') }}</span>
          <div class="stat-value counter-text">{{ userCuppings()?.length || 0 }}</div>
          <div class="stat-trend" *ngIf="userCuppings()?.length">+{{ userCuppings()?.length }} total</div>
        </div>
        <div class="glass-card stat-card hover-lift">
          <span class="stat-label">{{ t('STAT_AVG_SCORE') }}</span>
          <div class="stat-value counter-text">{{ calculateAvg() }}</div>
          <div class="stat-badge" [class.specialty]="+calculateAvg() >= 80">SCA GRADE</div>
        </div>
        <div class="glass-card stat-card specialty hover-lift">
          <span class="stat-label">Specialty Ratio</span>
          <div class="stat-value counter-text">{{ getSpecialtyCount() }}</div>
          <div class="stat-progress-bar"><div class="fill" [style.width]="getSpecialtyCount()"></div></div>
        </div>
      </section>

      <!-- AI INSIGHTS QUICK SECTION -->
      <section class="ai-insights-section" *ngIf="userCuppings()?.length">
        <div class="glass-card ai-insight-card luminescent-border premium-glow">
          <div class="ai-header">
            <div class="sparkle-container">
              <span class="ai-sparkle">✨</span>
            </div>
            <h3>AI Sensory Intelligence</h3>
          </div>
          <p class="ai-text">{{ getAiInsight() }}</p>
          <div class="ai-footer">
            <span>Powered by Sensory AI Engine v2.1</span>
          </div>
        </div>
      </section>

      <!-- GLOBAL FLAVOR HEATMAP -->
      <section class="heatmap-section">
        <div class="section-header">
          <h2 class="section-title">TRENDING FLAVORS</h2>
          <p class="section-sub">Global community sensory preferences</p>
        </div>
        <div class="heatmap-grid glass-card">
          <div class="heatmap-item" *ngFor="let note of heatmap()">
             <div class="note-info">
               <span class="note-name">#{{ note }}</span>
               <span class="note-percentage">{{ 90 - (heatmap().indexOf(note) * 8) }}%</span>
             </div>
             <div class="note-bar-bg">
               <div class="note-bar-fill" [style.width.%]="90 - (heatmap().indexOf(note) * 8)"></div>
             </div>
          </div>
        </div>
      </section>

      <section class="recent-sessions">
        <div class="section-header">
           <h2 class="section-title">GLOBAL DISCOVERY</h2>
           <p class="section-sub">Top rated sessions from fellow cuppers</p>
        </div>

        <div class="sessions-list">
          <div *ngFor="let session of cuppings(); let i = index" 
               class="glass-card session-item stagger-item" 
               [style.animation-delay]="i * 0.1 + 's'"
               [routerLink]="['/result', session.id]">
            <div class="session-image">
               <img [src]="session.productImageUrl || '/assets/default-coffee.png'" alt="Product Photo" loading="lazy">
               <div class="score-badge-floating" [class.specialty]="session.finalScore >= 80">
                 {{ session.finalScore | number:'1.1-1' }}
               </div>
            </div>
            <div class="session-main">
              <div class="session-info">
                <div class="tags">
                  <span class="tag type-tag">{{ session.type }}</span>
                  <span class="tag method-tag" *ngIf="session.brewMethod">{{ session.brewMethod }}</span>
                </div>
                <h3 class="line-clamp-2">{{ session.beanName }}</h3>
                <div class="metadata">
                   <span class="roastery">{{ session.roastery }}</span>
                   <span class="separator">•</span>
                   <span class="cupper">{{ session.cupperName || 'Anonymous' }}</span>
                </div>
              </div>
              
              <div class="session-performance">
                <div class="mini-sensory">
                   <div class="mini-bar" [style.height.%]="(session.scores.flavor - 1) / 8 * 100" [style.background]="getBarColor('flavor')" title="Flavor"></div>
                   <div class="mini-bar" [style.height.%]="(session.scores.acidity - 1) / 8 * 100" [style.background]="getBarColor('acidity')" title="Acidity"></div>
                   <div class="mini-bar" [style.height.%]="(session.scores.mouthfeel - 1) / 8 * 100" [style.background]="getBarColor('mouthfeel')" title="Mouthfeel"></div>
                </div>
                <div class="archetype-label" *ngIf="session.scores">
                  {{ getArchetype(session) }}
                </div>
              </div>
            </div>
            <div class="session-footer">
               <div class="social-summary" *ngIf="session.likesCount">
                 <span class="likes">❤️ {{ session.likesCount }}</span>
               </div>
               <span class="date">{{ session.timestamp?.toDate() | date:'MMM d' }}</span>
            </div>
          </div>
        </div>
      </section>
      
      <button class="fab-button premium-glow" routerLink="/cupping">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-7-7v14"/></svg>
      </button>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 40px;
      padding-bottom: 150px;
      position: relative;
    }
    
    /* DYNAMIC BG */
    .bg-glow {
      position: fixed;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(189, 142, 98, 0.05) 0%, transparent 70%);
      pointer-events: none;
      z-index: -1;
      filter: blur(80px);
    }
    .orb-1 { top: -100px; right: -100px; animation: floatOrb 20s infinite alternate linear; }
    .orb-2 { bottom: -200px; left: -100px; animation: floatOrb 25s infinite alternate-reverse linear; }
    @keyframes floatOrb {
      from { transform: translate(0, 0); }
      to { transform: translate(-100px, 100px); }
    }

    .hero {
      position: relative;
      border-radius: 40px;
      overflow: hidden;
      min-height: 550px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 80px;
      margin-bottom: 80px;
      border: 1px solid rgba(255,255,255,0.1);
      box-shadow: 0 50px 100px rgba(0,0,0,0.9);
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
      background: rgba(12, 12, 14, 0.5);
      backdrop-filter: blur(30px) saturate(180%);
      padding: 50px;
      border-radius: 32px;
      border: 1px solid rgba(255,255,255,0.1);
      width: 100%;
      position: relative;
      z-index: 1;
    }
    .hero h1 {
      font-size: 5.5rem;
      margin: 0;
      line-height: 1;
      letter-spacing: -4px;
      font-weight: 900;
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
    .hero-sub {
      color: var(--text-dim);
      font-size: 1.2rem;
      margin: 25px 0;
      max-width: 600px;
      line-height: 1.6;
    }
    .hero-actions { margin-top: 30px; }
    .btn-primary-glow {
      background: var(--primary-gradient);
      color: #0c0c0e;
      border: none;
      padding: 18px 32px;
      border-radius: 18px;
      font-weight: 800;
      font-size: 1rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.4s;
      box-shadow: 0 15px 30px var(--primary-glow);
    }
    .btn-primary-glow:hover { transform: translateY(-5px); box-shadow: 0 20px 45px var(--primary-glow); }

    .mini-profile { 
      position: relative;
      width: 64px;
      height: 64px;
      border-radius: 20px;
      overflow: visible;
      cursor: pointer;
    }
    .mini-profile img { width: 100%; height: 100%; object-fit: cover; border-radius: 20px; border: 2px solid var(--primary-color); }
    .status-ring {
      position: absolute;
      inset: -5px;
      border: 2px solid var(--primary-color);
      border-radius: 24px;
      opacity: 0.3;
      animation: pulse 2s infinite;
    }

    .stats-carousel {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 30px;
      margin-bottom: 100px;
    }
    .stat-card {
      padding: 40px;
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: all 0.4s;
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
    .stat-value { font-size: 4.5rem; margin: 10px 0; font-weight: 950; background: var(--primary-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .stat-trend, .stat-badge { font-size: 0.65rem; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; color: var(--success); }
    .stat-progress-bar { width: 100%; height: 4px; background: rgba(255,255,255,0.05); border-radius: 10px; margin-top: 15px; }
    .stat-progress-bar .fill { height: 100%; background: var(--primary-gradient); border-radius: 10px; }

    .ai-insight-card { 
      padding: 40px; 
      background: radial-gradient(circle at top right, rgba(212, 225, 87, 0.1), transparent);
      border-color: rgba(212, 225, 87, 0.3);
      margin-bottom: 80px;
    }
    .ai-header { display: flex; align-items: center; gap: 12px; margin-bottom: 15px; }
    .ai-header h3 { font-size: 1.2rem; color: var(--accent-neon); text-transform: uppercase; letter-spacing: 1px; }
    .ai-text { color: var(--text-main); font-size: 1.1rem; line-height: 1.6; }
    .ai-sparkle { font-size: 1.5rem; filter: drop-shadow(0 0 8px var(--accent-neon)); }
    .ai-footer { margin-top: 25px; font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px; }

    .heatmap-section { margin-bottom: 100px; }
    .heatmap-grid { display: grid; grid-template-columns: repeat(2, 1fr); padding: 40px; gap: 30px; }
    .heatmap-item { display: flex; flex-direction: column; gap: 10px; }
    .note-info { display: flex; justify-content: space-between; font-weight: 800; font-size: 0.85rem; }
    .note-name { color: var(--primary-color); }
    .note-percentage { color: var(--text-dim); }
    .note-bar-bg { flex: 1; height: 8px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden; }
    .note-bar-fill { height: 100%; background: var(--primary-gradient); border-radius: 10px; box-shadow: 0 0 15px var(--primary-glow); }

    .section-header { margin-bottom: 40px; }
    .section-title { font-size: 3rem; letter-spacing: -2px; font-weight: 900; }
    .section-sub { color: var(--text-dim); font-size: 1rem; margin-top: 8px; }
    
    .sessions-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 40px; }
    .session-item { border-radius: 32px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; display: flex; flex-direction: column; }
    .session-image { height: 260px; position: relative; overflow: hidden; }
    .session-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.8s; }
    .session-item:hover .session-image img { transform: scale(1.1); }
    .score-badge-floating {
      position: absolute;
      top: 20px;
      right: 20px;
      background: rgba(12, 12, 14, 0.85);
      backdrop-filter: blur(10px);
      padding: 10px 20px;
      border-radius: 100px;
      font-weight: 950;
      color: var(--primary-color);
      border: 1px solid var(--primary-color);
      font-size: 1.1rem;
    }
    .score-badge-floating.specialty { color: var(--accent-neon); border-color: var(--accent-neon); }
    .session-main { padding: 32px; flex: 1; display: flex; flex-direction: column; gap: 20px; }
    .tags { display: flex; gap: 8px; }
    .tag { font-size: 0.65rem; font-weight: 900; padding: 6px 14px; border-radius: 8px; text-transform: uppercase; letter-spacing: 1.5px; }
    .type-tag { background: rgba(189, 142, 98, 0.1); color: var(--primary-color); border: 1px solid rgba(189, 142, 98, 0.2); }
    .session-info h3 { font-size: 1.8rem; margin: 12px 0 8px; line-height: 1.1; font-weight: 800; }
    .metadata { color: var(--text-dim); font-size: 0.85rem; display: flex; align-items: center; gap: 10px; }
    .session-performance { background: rgba(0, 0, 0, 0.3); padding: 20px; border-radius: 20px; display: flex; align-items: center; justify-content: space-between; }
    .mini-sensory { display: flex; align-items: flex-end; gap: 4px; height: 32px; }
    .mini-bar { width: 8px; border-radius: 2px; opacity: 0.6; }
    .archetype-label { font-size: 0.7rem; font-weight: 900; text-transform: uppercase; color: var(--text-dim); letter-spacing: 1px; }

    .session-footer { padding: 20px 32px; background: rgba(255, 255, 255, 0.02); border-top: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--text-dim); }

    @media (max-width: 1100px) {
      .hero h1 { font-size: 4rem; }
      .sessions-list { grid-template-columns: 1fr; }
    }
    @media (max-width: 768px) {
      .hero { 
        padding: 30px 24px; 
        min-height: 400px; 
        border-radius: 28px; 
        margin-bottom: 30px; 
      }
      .hero-content { padding: 30px 20px; border-radius: 24px; }
      .hero h1 { font-size: 2.8rem; letter-spacing: -2px; }
      .hero-sub { font-size: 1rem; margin: 15px 0; }
      
      .dashboard-container { padding: 16px; }
      
      .stats-carousel { 
        display: flex; 
        overflow-x: auto; 
        gap: 16px; 
        margin: 0 -16px 60px -16px; 
        padding: 0 16px 15px 16px;
        scroll-snap-type: x mandatory;
        -webkit-overflow-scrolling: touch;
      }
      .stats-carousel::-webkit-scrollbar { display: none; }
      .stat-card { 
        flex: 0 0 85%; 
        scroll-snap-align: center; 
        padding: 30px 20px; 
        min-height: 180px;
        justify-content: center;
      }
      .stat-value { font-size: 3.5rem; }

      .heatmap-grid { grid-template-columns: 1fr; padding: 24px; gap: 20px; }
      .section-title { font-size: 2.2rem; }
      .ai-insight-card { padding: 24px; margin-bottom: 60px; }
      .session-main { padding: 20px; }
      .session-info h3 { font-size: 1.4rem; }
      .score-badge-floating { padding: 8px 16px; font-size: 0.95rem; }
    }
  `]
})
export class DashboardComponent {
  private cuppingService = inject(CuppingService);
  private ts = inject(TranslationService);
  private aiService = inject(SensoryAiService);
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
    if (avgScore >= 85) return "Palate Master: Your evaluation consistency suggests a highly refined sensory database. Focus on 'Process-Specific' nuances like Lactic fermentation artifacts to reach the next level.";
    if (avgScore >= 80) return "Specialty Enthusiast: You're consistently hitting the Q-Grade threshold. Try exploring the 'Balance' vs 'Overall' correlation to improve your scoring calibration.";
    
    return "Palate Builder: Focus on identifying primary flavor groups like 'Stone Fruit' vs 'Citrus' to strengthen your sensory foundation.";
  }

  getArchetype(session: CuppingSession) {
    return this.aiService.predictArchetype(session.scores);
  }

  async ngOnInit() {
    const trends = await this.cuppingService.getSmartSuggestions({});
    if (trends.length > 0) this.heatmap.set(trends);
  }
}
