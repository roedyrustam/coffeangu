import { Component, inject, OnInit, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CuppingService } from '../../services/cupping.service';
import { AuthService } from '../../services/auth.service';
import { MembershipService } from '../../services/membership.service';
import { CuppingSession } from '../../models/cupping.model';
import { Chart, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, Title, ArcElement, PieController } from 'chart.js';
import { map, take } from 'rxjs/operators';

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, Title, ArcElement, PieController);

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="analytics-container animate-fade">
      <header class="analytics-header immersive glass-card">
        <div class="header-content">
          <h2 class="brand-font">Pro Analytics Hub</h2>
          <p class="header-sub">Advanced Cupping Insights & Consistency Data</p>
        </div>
        <a routerLink="/profile" class="btn-back">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Profile
        </a>
      </header>

      <div class="analytics-grid" *ngIf="sessions().length > 0; else noData">
        <!-- RADAR COMPARISON -->
        <div class="chart-card glass-card span-2 animate-slide-up">
          <div class="card-header">
             <h3>Sensory Palate Calibration</h3>
             <small>Your average profile vs Global community average</small>
          </div>
          <div class="chart-wrapper">
             <canvas id="comparisonChart"></canvas>
          </div>
        </div>

        <!-- SCORE TREND -->
        <div class="chart-card glass-card animate-slide-up" style="animation-delay: 0.1s">
          <div class="card-header">
             <h3>Quality Scoring Trend</h3>
             <small>Final Score progression over time</small>
          </div>
          <div class="chart-wrapper">
             <canvas id="trendChart"></canvas>
          </div>
        </div>

        <!-- ORIGIN DIVERSITY -->
        <div class="chart-card glass-card animate-slide-up" style="animation-delay: 0.2s">
          <div class="card-header">
             <h3>Origin Portfolio</h3>
             <small>Global coffee diversity in your lab</small>
          </div>
          <div class="chart-wrapper pie">
             <canvas id="originChart"></canvas>
          </div>
        </div>
      </div>

      <ng-template #noData>
         <div class="empty-state glass-card">
            <div class="empty-icon">📊</div>
            <h3>Insufficient Data for Analytics</h3>
            <p>Complete at least 5 cupping sessions to unlock deep sensory insights.</p>
            <a routerLink="/cupping" class="btn-primary">Start Cupping</a>
         </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .analytics-container { max-width: 1200px; margin: 40px auto; padding: 0 30px; padding-bottom: 100px; }
    .analytics-header { display: flex; justify-content: space-between; align-items: center; padding: 40px; margin-bottom: 40px; position: relative; overflow: hidden; }
    .btn-back { display: flex; align-items: center; gap: 8px; color: var(--text-dim); text-decoration: none; font-weight: 600; font-size: 0.9rem; transition: all 0.3s; }
    .btn-back:hover { color: var(--primary-color); transform: translateX(-5px); }

    .analytics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; }
    .span-2 { grid-column: span 2; }

    .chart-card { padding: 30px; display: flex; flex-direction: column; gap: 25px; }
    .card-header h3 { font-size: 1.4rem; color: var(--primary-color); }
    .card-header small { color: var(--text-dim); font-size: 0.85rem; }

    .chart-wrapper { height: 350px; position: relative; }
    .chart-wrapper.pie { height: 280px; }

    .empty-state { text-align: center; padding: 100px; display: flex; flex-direction: column; align-items: center; gap: 20px; }
    .empty-icon { font-size: 4rem; opacity: 0.2; }

    @media (max-width: 900px) {
      .analytics-grid { grid-template-columns: 1fr; }
      .span-2 { grid-column: span 1; }
      .analytics-header { flex-direction: column; gap: 20px; text-align: center; }
    }
  `]
})
export class AnalyticsComponent implements OnInit {
  private cuppingService = inject(CuppingService);
  private auth = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  
  sessions = signal<CuppingSession[]>([]);
  charts: any[] = [];

  ngOnInit() {
    this.auth.user$.pipe(
      take(1),
      map(user => {
        if (user) {
          this.cuppingService.getUserCuppings(user.uid).subscribe(data => {
            this.sessions.set(data);
            if (isPlatformBrowser(this.platformId) && data.length >= 2) {
              setTimeout(() => this.initCharts(), 0);
            }
          });
        }
      })
    ).subscribe();
  }

  initCharts() {
    const data = this.sessions();
    if (data.length === 0) return;

    this.initComparisonChart(data);
    this.initTrendChart(data);
    this.initOriginChart(data);
  }

  initComparisonChart(sessions: CuppingSession[]) {
    const ctx = document.getElementById('comparisonChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Aggregate User Averages
    const keys = ['fragranceAroma', 'flavor', 'aftertaste', 'acidity', 'body', 'balance', 'overall'];
    const userAvg = keys.map(k => sessions.reduce((acc, s) => acc + s.scores[k as keyof typeof s.scores], 0) / sessions.length);
    
    // Mock Community Averages (In real app, would come from service)
    const communityAvg = [8.1, 8.2, 7.9, 8.0, 8.1, 7.8, 8.0];

    new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Aroma', 'Flavor', 'Aftertaste', 'Acidity', 'Body', 'Balance', 'Overall'],
        datasets: [
          {
            label: 'Your Average',
            data: userAvg,
            borderColor: '#BD8E62',
            backgroundColor: 'rgba(189, 142, 98, 0.2)',
            borderWidth: 3,
            pointBackgroundColor: '#BD8E62'
          },
          {
            label: 'Community Average',
            data: communityAvg,
            borderColor: 'rgba(255,255,255,0.2)',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderWidth: 2,
            borderDash: [5, 5]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: 'rgba(255,255,255,0.05)' },
            grid: { color: 'rgba(255,255,255,0.05)' },
            pointLabels: { color: '#8e8e93', font: { size: 11, weight: 'bold' } },
            suggestedMin: 6,
            suggestedMax: 10
          }
        },
        plugins: {
          legend: { position: 'bottom', labels: { color: '#8e8e93' } }
        }
      }
    });
  }

  initTrendChart(sessions: CuppingSession[]) {
    const ctx = document.getElementById('trendChart') as HTMLCanvasElement;
    if (!ctx) return;

    const sortedByDate = [...sessions].sort((a,b) => {
      const ta = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.productionDate);
      const tb = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.productionDate);
      return ta - tb;
    });

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: sortedByDate.map((_, i) => `S#${i+1}`),
        datasets: [{
          label: 'Final Score',
          data: sortedByDate.map(s => s.finalScore),
          borderColor: '#BD8E62',
          backgroundColor: 'transparent',
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: '#0c0c0e',
          pointBorderWidth: 2,
          pointBorderColor: '#BD8E62'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#8e8e93' },
            suggestedMin: 70
          },
          x: {
            grid: { display: false },
            ticks: { color: '#8e8e93' }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  initOriginChart(sessions: CuppingSession[]) {
    const ctx = document.getElementById('originChart') as HTMLCanvasElement;
    if (!ctx) return;

    const origins: Record<string, number> = {};
    sessions.forEach(s => {
       const o = s.origin || 'Unknown';
       origins[o] = (origins[o] || 0) + 1;
    });

    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(origins),
        datasets: [{
          data: Object.values(origins),
          backgroundColor: [
            '#BD8E62', '#8B5E3C', '#E5BC7D', '#5C3C24', '#D4A373'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { color: '#8e8e93', padding: 20 } }
        }
      }
    });
  }
}
