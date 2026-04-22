import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CuppingService } from '../../services/cupping.service';
import { TranslationService } from '../../services/translation.service';
import { CuppingSession } from '../../models/cupping.model';
import { Observable, of } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { UserProfile } from '../../models/user-profile.model';
import { SensoryAvatarComponent } from '../sensory-avatar/sensory-avatar.component';
import { SeoService } from '../../services/seo.service';
import { SocialShareComponent } from '../social-share/social-share.component';
import { Chart, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, SensoryAvatarComponent, SocialShareComponent],
  template: `
    <div class="profile-container animate-fade" *ngIf="profile$ | async as profile; else loading">
      <header class="profile-header immersive glass-card">
        <div class="header-visual">
          <img src="/assets/hero-profile.png" alt="Profile Hero" class="header-image">
          <div class="header-overlay"></div>
        </div>
        <div class="header-content">
          <div class="user-info">
            <div class="avatar-large">
              <img *ngIf="profile.photoURL" [src]="profile.photoURL" alt="Profile">
              <span *ngIf="!profile.photoURL">{{ (profile.displayName || 'U').charAt(0) }}</span>
            </div>
            <div class="user-details">
              <div class="badge-tag">Community Cupper</div>
              <h1 class="brand-font">{{ profile.displayName }}</h1>
              
              <!-- Sensory Avatar Integration -->
              <app-sensory-avatar [profile]="profile"></app-sensory-avatar>

              <div class="profile-share">
                <app-social-share [text]="'Check out ' + profile.displayName + \'\\\'s coffee sensory profile on CuppingNotes!\'"></app-social-share>
              </div>
            </div>
          </div>

          <div class="stats-area" *ngIf="stats$ | async as stats">
            <div class="signature-section">
               <span class="section-label">Sensory Fingerprint</span>
               <div class="chart-container">
                  <canvas id="publicSignatureChart"></canvas>
               </div>
            </div>
            <div class="numeric-stats">
              <div class="stat-card glass-card">
                <span class="val">{{ stats.total }}</span>
                <span class="lab">Public Sessions</span>
              </div>
              <div class="stat-card glass-card">
                <span class="val">{{ stats.avg.toFixed(1) }}</span>
                <span class="lab">Avg Score</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Badges Gallery -->
      <section class="badges-gallery" *ngIf="profile.badges.length > 0">
        <h2 class="section-title">Achievements</h2>
        <div class="badge-grid">
           <div class="badge-card glass-card" *ngFor="let badge of profile.badges">
              <span class="badge-icon">{{ badge.icon }}</span>
              <div class="badge-info">
                <span class="badge-name">{{ badge.name }}</span>
                <span class="badge-desc">{{ badge.description }}</span>
              </div>
           </div>
        </div>
      </section>

      <section class="feed-section">
        <h2 class="section-title">Shared Journey</h2>
        <div class="history-feed" *ngIf="cuppings$ | async as cuppings; else loadingFeed">
          <div class="history-card glass-card" *ngFor="let session of cuppings" [routerLink]="['/result', session.id]">
            <div class="card-left">
              <div class="bean-name">{{ session.beanName }}</div>
              <div class="roastery">{{ session.roastery }}</div>
              <div class="card-meta">
                <span class="process">{{ session.postHarvest }}</span>
                <span>•</span>
                <span class="date">{{ session.timestamp?.toDate() | date:'mediumDate' }}</span>
              </div>
            </div>
            <div class="card-right">
              <div class="score-badge" [class.specialty]="session.finalScore >= 80">
                {{ session.finalScore | number:'1.1-1' }}
              </div>
            </div>
          </div>
          <div class="empty-state glass-card" *ngIf="cuppings.length === 0">
             <div class="empty-icon">🍃</div>
             <p>This cupper hasn't shared any sessions with the community yet.</p>
          </div>
        </div>
      </section>
    </div>

    <ng-template #loading>
      <div class="full-loading">
        <div class="spinner"></div>
        <p>Fetching Sensory Data...</p>
      </div>
    </ng-template>

    <ng-template #loadingFeed>
      <div class="spinner"></div>
    </ng-template>
  `,
  styles: [`
    .profile-container { max-width: 1000px; margin: 40px auto; padding: 0 30px; padding-bottom: 200px; }
    .profile-header { padding: 0; margin-bottom: 60px; position: relative; border-radius: var(--radius-lg); overflow: hidden; min-height: 420px; display: flex; flex-direction: column; justify-content: flex-end; border: 1px solid var(--glass-border); box-shadow: 0 20px 80px rgba(0,0,0,0.6); }
    .header-visual { position: absolute; inset: 0; z-index: 0; }
    .header-image { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.5); }
    .header-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 0%, rgba(12, 12, 14, 0.7) 100%); }
    .header-content { position: relative; z-index: 1; padding: 50px 60px; display: flex; justify-content: space-between; align-items: center; width: 100%; }
    .user-info { display: flex; gap: 40px; align-items: center; }
    .badge-tag { background: var(--primary-gradient); color: #0c0c0e; padding: 4px 12px; border-radius: 6px; font-size: 0.65rem; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px; display: inline-block; }
    .avatar-large { width: 130px; height: 130px; border-radius: 44px; background: var(--primary-gradient); display: flex; align-items: center; justify-content: center; border: 3px solid var(--glass-border); box-shadow: 0 20px 50px rgba(0,0,0,0.6); overflow: hidden; }
    .avatar-large img { width: 100%; height: 100%; object-fit: cover; }
    .avatar-large span { font-size: 3.5rem; font-weight: 800; color: #0c0c0e; }
    .user-details h1 { font-size: 3.8rem; margin-bottom: 20px; line-height: 1; text-shadow: 0 10px 30px rgba(0,0,0,0.8); }
    .profile-share { margin-top: 20px; display: flex; justify-content: flex-start; }
    ::ng-deep .profile-share .share-links { margin: 0; gap: 10px; }
    ::ng-deep .profile-share .share-btn { width: 36px; height: 36px; }
    
    .stats-area { display: flex; gap: 50px; align-items: center; }
    .signature-section { width: 220px; text-align: left; }
    .chart-container { height: 160px; width: 100%; position: relative; margin-top: 15px; }
    .section-label { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--primary-color); letter-spacing: 2px; }
    .numeric-stats { display: flex; flex-direction: column; gap: 15px; }
    .stat-card { background: rgba(12, 12, 14, 0.5); padding: 22px 35px; border-radius: 24px; display: flex; flex-direction: column; align-items: center; min-width: 150px; backdrop-filter: blur(20px); border: 1px solid var(--glass-border); }
    .stat-card .val { font-size: 2.5rem; font-weight: 900; color: var(--primary-color); font-family: var(--font-brand); }
    .stat-card .lab { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: var(--text-dim); letter-spacing: 1px; }

    .badges-gallery { margin-bottom: 80px; }
    .badge-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .badge-card { padding: 25px; display: flex; align-items: center; gap: 20px; border: 1px solid var(--glass-border); transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    .badge-card:hover { transform: translateY(-8px); border-color: var(--primary-color); box-shadow: 0 15px 40px rgba(0,0,0,0.4); }
    .badge-icon { font-size: 2.2rem; filter: drop-shadow(0 5px 15px rgba(0,0,0,0.3)); }
    .badge-name { display: block; font-size: 0.9rem; font-weight: 800; color: var(--text-main); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
    .badge-desc { font-size: 0.75rem; color: var(--text-dim); line-height: 1.4; }

    .section-title { font-size: 2rem; margin-bottom: 40px; font-weight: 800; position: relative; }
    .section-title::after { content: ''; position: absolute; bottom: -12px; left: 0; width: 50px; height: 3px; background: var(--primary-color); }

    .history-feed { display: grid; gap: 20px; }
    .history-card { padding: 30px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.4s; border: 1px solid var(--glass-border); }
    .history-card:hover { transform: translateX(10px); border-color: var(--primary-color); }
    .bean-name { font-size: 1.5rem; font-weight: 800; color: var(--text-main); margin-bottom: 4px; }
    .history-card .roastery { font-size: 0.85rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; }
    .card-meta { display: flex; gap: 10px; font-size: 0.8rem; font-weight: 700; color: var(--primary-color); align-items: center; }
    .score-badge { background: var(--surface-hover); width: 75px; height: 75px; display: flex; align-items: center; justify-content: center; border-radius: 20px; font-size: 1.8rem; font-weight: 950; font-family: var(--font-brand); border: 1px solid var(--glass-border); }
    .score-badge.specialty { background: var(--primary-gradient); color: #0c0c0e; border: none; box-shadow: 0 10px 25px var(--primary-glow); }

    .full-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh; gap: 20px; color: var(--text-dim); letter-spacing: 2px; text-transform: uppercase; font-size: 0.8rem; font-weight: 800; }
    .spinner { width: 40px; height: 40px; border: 3px solid rgba(189, 142, 98, 0.1); border-top-color: var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 900px) {
      .header-content { flex-direction: column; text-align: center; gap: 50px; padding: 40px; }
      .user-info { flex-direction: column; gap: 25px; }
      .stats-area { width: 100%; justify-content: center; flex-wrap: wrap; }
      .user-details h1 { font-size: 3rem; }
    }
  `]
})
export class PublicProfileComponent implements OnInit {
  private cuppingService = inject(CuppingService);
  private route = inject(ActivatedRoute);
  private ts = inject(TranslationService);
  private seo = inject(SeoService);
  protected t = this.ts.t();

  profile$!: Observable<UserProfile | null>;
  cuppings$!: Observable<CuppingSession[]>;
  stats$!: Observable<{ total: number, avg: number, averages: any }>;
  private chart: any;

  ngOnInit() {
    // Resolve profile first to get the UID if handle is used
    this.profile$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (!id) return of(null);
        if (id.startsWith('@')) {
          return this.cuppingService.getProfileByHandle(id);
        }
        return this.cuppingService.getUserProfile(id);
      }),
      tap(profile => {
        if (profile) this.updateSeo(profile.displayName);
      })
    );

    this.cuppings$ = this.profile$.pipe(
      switchMap(profile => {
        return profile ? this.cuppingService.getPublicUserCuppings(profile.uid) : of([]);
      })
    );

    this.stats$ = this.cuppings$.pipe(
      map(sessions => {
        if (sessions.length === 0) return { total: 0, avg: 0, averages: {} };
        const avg = sessions.reduce((acc, s) => acc + s.finalScore, 0) / sessions.length;
        
        const keys = ['fragranceAroma', 'flavor', 'aftertaste', 'acidity', 'body', 'balance', 'overall'];
        const averages: any = {};
        keys.forEach(k => {
          averages[k] = sessions.reduce((acc, s) => acc + s.scores[k as keyof typeof s.scores], 0) / sessions.length;
        });

        return { total: sessions.length, avg, averages };
      }),
      tap((stats: any) => {
        if (stats.total > 0) {
          setTimeout(() => this.initSignatureChart(stats.averages), 0);
        }
      })
    );
  }

  initSignatureChart(averages: any) {
    const canvas = document.getElementById('publicSignatureChart') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.chart) this.chart.destroy();

    this.chart = new Chart(canvas, {
      type: 'radar',
      data: {
        labels: ['Aroma', 'Flavor', 'After', 'Acid', 'Body', 'Bal', 'Over'],
        datasets: [{
          data: [
            averages.fragranceAroma, averages.flavor, averages.aftertaste,
            averages.acidity, averages.body, averages.balance, averages.overall
          ],
          fill: true,
          backgroundColor: 'rgba(189, 142, 98, 0.15)',
          borderColor: '#BD8E62',
          pointBackgroundColor: '#E5BC7D',
          borderWidth: 2,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: 'rgba(255, 255, 255, 0.05)' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            suggestedMin: 6,
            suggestedMax: 10,
            pointLabels: { color: 'rgba(255,255,255,0.4)', font: { size: 9, weight: 'bold', family: "'Poppins', sans-serif" } },
            ticks: { display: false }
          }
        },
        plugins: { legend: { display: false } }
      }
    });
  }

  private updateSeo(name: string) {
    this.seo.updateMeta({
      title: `${name}'s Profile`,
      description: `Check out coffee evaluations and flavor notes from ${name} on CuppingNotes.`,
      type: 'profile'
    });
  }
}
