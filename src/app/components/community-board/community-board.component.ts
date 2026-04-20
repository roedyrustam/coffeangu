import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CuppingService } from '../../services/cupping.service';
import { CuppingSession } from '../../models/cupping.model';
import { TranslationService } from '../../services/translation.service';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { map, switchMap, debounceTime, startWith, catchError } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-community-board',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="community-container animate-fade">
      <!-- HERO DASHBOARD SECTION -->
      <section class="discovery-hero glass-card">
        <div class="hero-content">
          <h1 class="brand-font">{{ t('DISCOVERY_TITLE') }}</h1>
          <p class="subtitle">{{ t('DISCOVERY_SUBTITLE') }}</p>
          
          <div class="community-stats" *ngIf="stats$ | async as stats">
            <div class="stat-pill">
              <span class="val">{{ stats.total }}</span>
              <span class="lab">Sessions</span>
            </div>
            <div class="stat-pill">
              <span class="val">{{ stats.avg.toFixed(1) }}</span>
              <span class="lab">Avg Score</span>
            </div>
            <div class="stat-pill specialty">
              <span class="val">{{ stats.specialty }}</span>
              <span class="lab">Q-Grades</span>
            </div>
          </div>
        </div>
        <div class="hero-visual"></div>
      </section>

      <!-- SEARCH & FILTER BAR -->
      <div class="discovery-controls">
        <div class="search-box glass-card">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input type="text" [placeholder]="t('SEARCH_PLACEHOLDER')" [(ngModel)]="searchQuery" (ngModelChange)="onSearchChange($event)">
        </div>

        <div class="filters-row">
          <div class="filter-group">
            <button class="filter-chip" [class.active]="activeProcess() === 'all'" (click)="setProcess('all')">
              {{ t('FILTER_ALL') }}
            </button>
            <button class="filter-chip" *ngFor="let p of processes" [class.active]="activeProcess() === p" (click)="setProcess(p)">
              {{ p }}
            </button>
          </div>

          <div class="sort-selector">
            <select [(ngModel)]="sortBy" (change)="onSortChange()">
              <option value="timestamp">{{ t('SORT_NEWEST') }}</option>
              <option value="finalScore">{{ t('SORT_TOP_RATED') }}</option>
              <option value="likesCount">Most Liked</option>
            </select>
          </div>
        </div>
      </div>

      <!-- DISCOVERY FEED -->
      <div class="feed-grid" *ngIf="filteredCuppings$ | async as cuppings; else loading">
        <div class="cupping-card glass-card animate-fade" *ngFor="let session of cuppings; let i = index" 
             [style.animation-delay]="i * 0.05 + 's'"
             [routerLink]="['/result', session.id]">
          
          <div class="card-glow"></div>

          <div class="card-image" *ngIf="session.productImageUrl">
            <img [src]="session.productImageUrl" alt="Product Photo">
          </div>
          
          <div class="card-header">
            <div class="bean-main">
              <h3>{{ session.beanName }}</h3>
              <p class="roastery">{{ session.roastery }}</p>
            </div>
            <div class="score-display" [class.specialty]="session.finalScore >= 80">
              <span class="num">{{ session.finalScore | number:'1.1-1' }}</span>
            </div>
          </div>

          <div class="sensory-strip">
            <div class="sensory-badge" title="Acidity">
              <span class="icon">🍋</span>
              <span>{{ session.intensities?.acidity || '-' }}</span>
            </div>
            <div class="sensory-badge" title="Body">
              <span class="icon">🥃</span>
              <span>{{ session.intensities?.body || '-' }}</span>
            </div>
            <div class="sensory-badge" title="Sweetness">
              <span class="icon">🍯</span>
              <span>{{ session.intensities?.sweetness || '-' }}</span>
            </div>
          </div>

          <div class="flavor-cloud">
            <span class="flavor-tag" *ngFor="let note of session.flavorNotes | slice:0:3">#{{ note }}</span>
            <span class="more-count" *ngIf="session.flavorNotes.length > 3">+{{ session.flavorNotes.length - 3 }}</span>
          </div>

          <footer class="card-footer">
            <div class="cupper-info">
              <div class="mini-avatar">{{ (session.cupperName || 'A').charAt(0) }}</div>
              <span class="name">{{ session.cupperName || 'Anonymous Cupper' }}</span>
            </div>
            <div class="social-stats">
              <div class="stat-item like-btn" 
                   [class.liked]="hasLiked(session)" 
                   (click)="$event.stopPropagation(); toggleLike(session)">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" [attr.fill]="hasLiked(session) ? 'var(--danger)' : 'none'" [attr.stroke]="hasLiked(session) ? 'var(--danger)' : 'currentColor'" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span>{{ session.likesCount || 0 }}</span>
              </div>
            </div>
          </footer>
        </div>

        <div class="empty-state glass-card" *ngIf="cuppings.length === 0">
           <div class="empty-icon">☕</div>
           <h3>No matching cuppings</h3>
           <p>Adjust your filters or be the first to share this profile!</p>
           <button routerLink="/cupping" class="btn-primary">Start New Session</button>
        </div>
      </div>

      <ng-template #loading>
        <div class="loading-state">
          <div class="spinner"></div>
          <p>{{ t('LOADING_COMMUNITY') }}</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .community-container {
      max-width: 1400px;
      margin: 40px auto;
      padding: 0 40px;
      padding-bottom: 150px;
    }
    
    /* HERO STYLES */
    .discovery-hero {
      padding: 80px;
      margin-bottom: 50px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-image: 
        radial-gradient(circle at 80% 20%, var(--primary-glow) 0%, transparent 40%),
        linear-gradient(to right, var(--surface-color), transparent);
      border-radius: var(--radius-lg);
    }
    .hero-content { max-width: 600px; }
    .brand-font { font-size: 4.5rem; margin-bottom: 20px; line-height: 1; }
    .subtitle { color: var(--text-dim); font-size: 1.25rem; font-weight: 500; margin-bottom: 40px; }
    
    .community-stats { display: flex; gap: 30px; }
    .stat-pill {
      background: var(--surface-hover);
      padding: 15px 30px;
      border-radius: 20px;
      border: 1px solid var(--glass-border);
      display: flex;
      flex-direction: column;
    }
    .stat-pill .val { font-size: 2.2rem; font-weight: 900; color: var(--primary-color); font-family: 'Playfair Display', serif; }
    .stat-pill .lab { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--text-dim); letter-spacing: 1px; }
    .stat-pill.specialty { background: var(--primary-gradient); border: none; }
    .stat-pill.specialty .val, .stat-pill.specialty .lab { color: #0c0c0e; }

    /* CONTROLS STYLES */
    .discovery-controls {
      display: flex;
      flex-direction: column;
      gap: 30px;
      margin-bottom: 60px;
    }
    .search-box {
      padding: 8px 30px;
      display: flex;
      align-items: center;
      gap: 20px;
      height: 75px;
      border-radius: 100px;
    }
    .search-box svg { color: var(--primary-color); }
    .search-box input {
      background: transparent;
      border: none;
      width: 100%;
      height: 100%;
      font-size: 1.2rem;
      font-weight: 600;
      color: var(--text-main);
    }
    .search-box input:focus { box-shadow: none; }

    .filters-row { display: flex; justify-content: space-between; align-items: center; }
    .filter-group { display: flex; gap: 12px; flex-wrap: wrap; }
    .filter-chip {
      background: var(--surface-hover);
      border: 1px solid var(--glass-border);
      color: var(--text-dim);
      padding: 10px 25px;
      border-radius: 100px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 700;
      transition: all 0.3s;
    }
    .filter-chip.active { background: var(--primary-color); color: #0c0c0e; border-color: transparent; }
    .filter-chip:hover:not(.active) { border-color: var(--primary-color); color: var(--text-main); }
    
    .sort-selector select {
      background: var(--surface-hover);
      border: 1px solid var(--glass-border);
      color: var(--text-main);
      padding: 10px 20px;
      border-radius: 100px;
      font-weight: 700;
      cursor: pointer;
    }

    /* GRID & CARD STYLES */
    .feed-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 40px;
    }
    .cupping-card {
      padding: 40px;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 25px;
      height: 100%;
    }
    .card-glow {
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle at center, var(--primary-glow) 0%, transparent 70%);
      opacity: 0;
      transition: opacity 0.5s;
      pointer-events: none;
    }
    .cupping-card:hover .card-glow { opacity: 0.5; }

    .card-image {
      width: calc(100% + 80px);
      margin: -40px -40px 20px -40px;
      height: 200px;
      overflow: hidden;
      border-bottom: 1px solid var(--glass-border);
    }
    .card-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .cupping-card:hover .card-image img {
      transform: scale(1.1);
    }
    
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; z-index: 1; }
    .bean-main h3 { font-size: 1.6rem; margin-bottom: 6px; font-weight: 800; }
    .roastery { font-size: 0.8rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 2px; }
    
    .score-display {
      background: var(--surface-hover);
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 15px;
      border: 1px solid var(--glass-border);
    }
    .score-display.specialty { background: var(--primary-gradient); border: none; }
    .score-display .num { font-size: 1.3rem; font-weight: 950; color: var(--text-main); font-family: 'Playfair Display', serif; }
    .score-display.specialty .num { color: #0c0c0e; }

    .sensory-strip { display: flex; gap: 15px; z-index: 1; }
    .sensory-badge {
      background: rgba(0,0,0,0.2);
      padding: 8px 15px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 800;
      font-size: 0.85rem;
      border: 1px solid var(--glass-border);
    }
    .sensory-badge .icon { font-size: 1.1rem; }

    .flavor-cloud { display: flex; flex-wrap: wrap; gap: 8px; z-index: 1; }
    .flavor-tag { font-size: 0.75rem; font-weight: 700; color: var(--primary-color); background: rgba(189, 142, 98, 0.1); padding: 5px 12px; border-radius: 8px; }
    .more-count { font-size: 0.75rem; font-weight: 800; color: var(--text-dim); }

    .card-footer {
      margin-top: auto;
      padding-top: 25px;
      border-top: 1px solid var(--glass-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 1;
    }
    .cupper-info { display: flex; align-items: center; gap: 12px; }
    .mini-avatar {
      width: 32px;
      height: 32px;
      background: var(--primary-color);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #0c0c0e;
      font-weight: 900;
      font-size: 0.8rem;
    }
    .cupper-info .name { font-size: 0.85rem; font-weight: 700; color: var(--text-main); }
    .stat-item { display: flex; align-items: center; gap: 8px; font-weight: 800; color: var(--text-dim); transition: all 0.2s; }
    .like-btn { cursor: pointer; padding: 5px 10px; border-radius: 8px; }
    .like-btn:hover { background: rgba(255, 69, 58, 0.1); color: var(--danger); }
    .like-btn.liked { color: var(--danger); }
    .like-btn svg { transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    .like-btn:active svg { transform: scale(1.4); }
    
    .empty-state { text-align: center; padding: 100px; grid-column: 1 / -1; }
    .empty-icon { font-size: 4rem; margin-bottom: 20px; opacity: 0.3; }
    .empty-state h3 { font-size: 2rem; margin-bottom: 10px; }
    .empty-state p { color: var(--text-dim); margin-bottom: 30px; }

    @media (max-width: 1024px) {
      .discovery-hero { flex-direction: column; padding: 60px; text-align: center; }
      .hero-content { margin-bottom: 40px; }
      .filters-row { flex-direction: column; gap: 25px; align-items: flex-start; }
    }
    @media (max-width: 640px) {
      .community-container { padding: 20px; }
      .brand-font { font-size: 3rem; }
      .feed-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class CommunityBoardComponent implements OnInit {
  private cuppingService = inject(CuppingService);
  private ts = inject(TranslationService);
  protected auth = inject(AuthService);
  t = this.ts.t();

  // Filter State
  searchQuery = '';
  activeProcess = signal<string>('all');
  sortBy: 'timestamp' | 'finalScore' | 'likesCount' = 'timestamp';
  processes = ['Wash', 'Natural', 'Honey', 'Anaerobic'];

  private refreshTrigger = new BehaviorSubject<void>(undefined);

  // Stats Signal
  stats$ = this.refreshTrigger.pipe(
    switchMap(() => this.cuppingService.getPublicCuppings({ limit: 100 })),
    map(cuppings => ({
      total: cuppings.length,
      avg: cuppings.reduce((acc, c) => acc + c.finalScore, 0) / (cuppings.length || 1),
      specialty: cuppings.filter(c => c.finalScore >= 80).length
    }))
  );

  // Main Data Stream
  filteredCuppings$!: Observable<CuppingSession[]>;

  ngOnInit() {
    this.filteredCuppings$ = combineLatest([
      this.refreshTrigger.pipe(
        switchMap(() => this.cuppingService.getPublicCuppings({ 
          sortBy: this.sortBy,
          process: this.activeProcess() === 'all' ? undefined : this.activeProcess()
        }))
      ),
      new BehaviorSubject<string>('').pipe(
        debounceTime(300),
        startWith('')
      ) // This would be the search input if done server-side, but we do it client-side for now
    ]).pipe(
      map(([cuppings, _]) => {
        if (!this.searchQuery) return cuppings;
        const q = this.searchQuery.toLowerCase();
        return cuppings.filter(c => 
          c.beanName.toLowerCase().includes(q) || 
          c.roastery.toLowerCase().includes(q)
        );
      }),
      catchError(err => {
        console.error('Discovery Feed Error:', err);
        return of([]);
      })
    );
  }

  onSearchChange(val: string) {
    this.searchQuery = val;
    this.refreshTrigger.next(); // Trigger re-filter
  }

  setProcess(process: string) {
    this.activeProcess.set(process);
    this.refreshTrigger.next();
  }

  onSortChange() {
    this.refreshTrigger.next();
  }

  toggleLike(session: CuppingSession) {
    const userId = this.auth.getUserId();
    if (!userId || !session.id) return;
    
    const isLiked = this.hasLiked(session);
    this.cuppingService.toggleLike(session.id, userId, isLiked);
  }

  hasLiked(session: CuppingSession): boolean {
    const userId = this.auth.getUserId();
    if (!userId) return false;
    return !!session.likedBy?.includes(userId);
  }
}
