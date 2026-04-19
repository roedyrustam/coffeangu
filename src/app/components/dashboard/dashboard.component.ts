import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CuppingService } from '../../services/cupping.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-container animate-fade">
      <header class="hero">
        <h1 class="brand-font">CaffeeScore</h1>
        <p>Global Coffee Cupping Intelligence</p>
        <div class="actions">
          <button class="btn-primary" routerLink="/cupping">New Cupping Session</button>
        </div>
      </header>

      <section class="stats-grid">
        <div class="glass-card stat-card">
          <span class="stat-label">Total Sessions</span>
          <div class="stat-value">{{ cuppings()?.length || 0 }}</div>
        </div>
        <div class="glass-card stat-card">
          <span class="stat-label">Avg Global Score</span>
          <div class="stat-value">{{ calculateAvg() }}</div>
        </div>
      </section>

      <section class="recent-sessions">
        <div class="section-header">
           <h2 class="section-title">Recent Public Scores</h2>
           <span class="count-badge">{{ cuppings()?.length || 0 }} Entries</span>
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
      padding: calc(var(--spacing-unit) * 5) calc(var(--spacing-unit) * 3);
      padding-bottom: 100px;
    }
    .hero {
      text-align: left;
      margin-bottom: calc(var(--spacing-unit) * 8);
    }
    .hero h1 {
      font-size: calc(var(--h1-size) * 1.8);
      color: var(--primary-color);
      margin-bottom: var(--spacing-unit);
    }
    .hero p {
      color: var(--text-dim);
      font-size: 1.1rem;
      letter-spacing: 0.5px;
    }
    .actions {
      margin-top: calc(var(--spacing-unit) * 3);
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: calc(var(--spacing-unit) * 3);
      margin-bottom: calc(var(--spacing-unit) * 8);
    }
    .stat-card {
      text-align: center;
      padding: calc(var(--spacing-unit) * 4);
      background: var(--surface-color);
    }
    .stat-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--text-dim);
      font-weight: 600;
    }
    .stat-value {
      font-size: 3rem;
      font-weight: 800;
      color: var(--primary-color);
      margin-top: var(--spacing-unit);
      font-family: 'Playfair Display', serif;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: calc(var(--spacing-unit) * 4);
    }
    .section-title {
      font-size: var(--h2-size);
      border-left: 4px solid var(--primary-color);
      padding-left: calc(var(--spacing-unit) * 2);
      font-weight: 700;
      color: var(--text-main);
    }
    .count-badge {
      background: var(--surface-hover);
      padding: 6px 16px;
      border-radius: 100px;
      font-size: 0.75rem;
      color: var(--text-dim);
      font-weight: 600;
    }
    .sessions-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: calc(var(--spacing-unit) * 4);
    }
    .session-item {
      background: var(--surface-color);
      border-radius: var(--radius-lg);
      padding: calc(var(--spacing-unit) * 3);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: calc(var(--spacing-unit) * 2.5);
      border: 1px solid var(--glass-border);
      transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    }
    .session-item:hover {
      transform: translateY(-8px);
      border-color: var(--primary-color);
      box-shadow: 0 15px 45px -10px var(--primary-glow);
    }
    .tag {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 700;
    }
    .type-tag {
      background: var(--primary-color);
      color: white;
    }
    .method-tag {
      background: var(--surface-hover);
      color: var(--text-dim);
    }
    .session-performance {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }
    .mini-sensory {
      display: flex;
      align-items: flex-end;
      gap: 4px;
      height: 48px;
    }
    .mini-bar {
      width: 8px;
      background: var(--primary-color);
      border-radius: 2px 2px 0 0;
      opacity: 0.4;
      transition: all 0.3s;
    }
    .session-item:hover .mini-bar {
      opacity: 1;
    }
    .session-score {
      font-size: 2rem;
      font-weight: 800;
      font-family: 'Playfair Display', serif;
      color: var(--primary-color);
    }
    .high-score {
      color: var(--success);
    }
    .session-footer {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--text-dim);
      margin-top: calc(var(--spacing-unit) * 2);
    }
    .empty-state {
      text-align: center;
      padding: 80px 20px;
    }

    @media (max-width: 600px) {
      .hero h1 { font-size: 2.5rem; }
      .session-performance {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class DashboardComponent {
  private cuppingService = inject(CuppingService);
  cuppings = toSignal(this.cuppingService.getLatestCuppings());

  calculateAvg() {
    const list = this.cuppings();
    if (!list || list.length === 0) return '0.00';
    const sum = list.reduce((acc, curr) => acc + curr.finalScore, 0);
    return (sum / list.length).toFixed(2);
  }
}
