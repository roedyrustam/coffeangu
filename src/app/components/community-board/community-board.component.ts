import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CuppingService } from '../../services/cupping.service';
import { CuppingSession } from '../../models/cupping.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-community-board',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="community-container animate-fade">
      <header class="community-header">
        <h1 class="brand-font">Community Discovery</h1>
        <p class="subtitle">Exploring the global world of specialty coffee, one cup at a time.</p>
      </header>

      <div class="feed-grid" *ngIf="cuppings$ | async as cuppings; else loading">
        <div class="cupping-card glass-card" *ngFor="let session of cuppings" [routerLink]="['/result', session.id]">
          <div class="card-header">
            <div class="bean-info">
              <h3>{{ session.beanName }}</h3>
              <p>{{ session.roastery }}</p>
            </div>
            <div class="score-badge" [class.specialty]="session.finalScore >= 80">
              {{ session.finalScore | number:'1.1-1' }}
            </div>
          </div>

          <div class="card-meta">
            <span>{{ session.type }}</span>
            <span>•</span>
            <span>{{ session.postHarvest }}</span>
          </div>

          <div class="flavor-pills">
            <span class="flavor-pill" *ngFor="let note of session.flavorNotes | slice:0:3">{{ note }}</span>
            <span class="more" *ngIf="session.flavorNotes.length > 3">+{{ session.flavorNotes.length - 3 }}</span>
          </div>

          <footer class="card-footer">
            <div class="cupper">
              <span class="icon">👤</span>
              <span>{{ session.cupperName || 'Anonymous' }}</span>
            </div>
            <div class="stats">
              <div class="stat">
                <span class="icon">❤️</span>
                <span>{{ session.likesCount || 0 }}</span>
              </div>
            </div>
          </footer>
        </div>

        <div class="empty-state" *ngIf="cuppings.length === 0">
           <p>No public sessions found. Be the first to share your cupping!</p>
           <a routerLink="/new" class="btn-primary">Start Cupping</a>
        </div>
      </div>

      <ng-template #loading>
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Discovering coffee sessions...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .community-container {
      max-width: 1200px;
      margin: 60px auto;
      padding: 0 30px;
      padding-bottom: 120px;
    }
    .community-header {
      margin-bottom: 60px;
      text-align: center;
    }
    .brand-font {
      font-size: 3.5rem;
      margin-bottom: 15px;
    }
    .subtitle {
      color: var(--text-dim);
      font-size: 1.2rem;
      letter-spacing: 1px;
    }
    .feed-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 30px;
    }
    .cupping-card {
      padding: 30px;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      gap: 20px;
      border: 1px solid var(--glass-border);
    }
    .cupping-card:hover {
      transform: translateY(-10px);
      border-color: var(--primary-color);
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .bean-info h3 {
      font-size: 1.3rem;
      margin-bottom: 4px;
      color: var(--text-main);
    }
    .bean-info p {
      font-size: 0.9rem;
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .score-badge {
      background: var(--surface-hover);
      padding: 8px 12px;
      border-radius: 12px;
      font-weight: 900;
      font-size: 1.1rem;
      color: var(--text-dim);
      border: 1px solid var(--glass-border);
    }
    .score-badge.specialty {
      background: var(--primary-gradient);
      color: #0c0c0e;
      border-color: transparent;
      box-shadow: 0 4px 15px var(--primary-glow);
    }
    .card-meta {
      display: flex;
      gap: 10px;
      font-size: 0.85rem;
      color: var(--primary-color);
      font-weight: 700;
      text-transform: uppercase;
    }
    .flavor-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .flavor-pill {
      background: rgba(255,255,255,0.05);
      padding: 5px 12px;
      border-radius: 100px;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-dim);
      border: 1px solid var(--glass-border);
    }
    .card-footer {
      margin-top: auto;
      padding-top: 20px;
      border-top: 1px solid var(--glass-border);
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      color: var(--text-dim);
    }
    .cupper, .stat {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .stat .icon {
      color: #ff4757;
    }
    .loading-state {
       grid-column: 1 / -1;
       text-align: center;
       padding: 100px 0;
    }
    .empty-state {
       grid-column: 1 / -1;
       text-align: center;
       padding: 100px 0;
       border: 2px dashed var(--glass-border);
       border-radius: var(--radius-lg);
    }
    @media (max-width: 640px) {
      .feed-grid { grid-template-columns: 1fr; }
      .brand-font { font-size: 2.5rem; }
    }
  `]
})
export class CommunityBoardComponent implements OnInit {
  private cuppingService = inject(CuppingService);
  cuppings$!: Observable<CuppingSession[]>;

  ngOnInit() {
    this.cuppings$ = this.cuppingService.getPublicCuppings();
  }
}
