import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CuppingService } from '../../services/cupping.service';
import { AuthService } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';
import { CuppingSession } from '../../models/cupping.model';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap, take, filter } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="profile-container animate-fade">
      <!-- Tab Control -->
      <div class="tab-control">
        <button [class.active]="activeTab() === 'history'" (click)="activeTab.set('history')">
          {{ t('PERSONAL_HISTORY') }}
        </button>
        <button [class.active]="activeTab() === 'saved'" (click)="activeTab.set('saved')">
          {{ t('SAVED_SESSIONS') }}
        </button>
        <button class="settings-trigger" (click)="showSettings.set(true)">
          ⚙️ {{ t('BTN_SETTINGS') }}
        </button>
      </div>

      <header class="profile-header glass-card">
        <div class="user-info">
          <div class="avatar-large">
            <img *ngIf="auth.currentUser()?.photoURL" [src]="auth.currentUser()?.photoURL" alt="Profile">
            <span *ngIf="!auth.currentUser()?.photoURL">{{ auth.currentUser()?.displayName?.charAt(0) || 'U' }}</span>
          </div>
          <div class="user-details">
            <h1 class="brand-font">{{ auth.currentUser()?.displayName }}</h1>
            <p class="email">{{ auth.currentUser()?.email }}</p>
            <div class="cupper-rank" *ngIf="stats$ | async as stats">
              <span class="rank-label">{{ getRank(stats.total) }}</span>
            </div>
          </div>
        </div>

        <div class="stats-grid" *ngIf="stats$ | async as stats">
          <div class="stat-card">
            <span class="val">{{ stats.total }}</span>
            <span class="lab">{{ t('TOTAL_SESSIONS') }}</span>
          </div>
          <div class="stat-card">
            <span class="val">{{ stats.avg.toFixed(1) }}</span>
            <span class="lab">{{ t('AVG_SCORE') }}</span>
          </div>
        </div>
      </header>

      <section class="feed-section">
        <!-- HISTORY VIEW -->
        <div class="history-view" *ngIf="activeTab() === 'history'">
          <h2 class="section-title">{{ t('PERSONAL_HISTORY') }}</h2>
          <div class="history-feed" *ngIf="cuppings$ | async as cuppings; else loading">
            <div class="history-card glass-card" *ngFor="let session of cuppings">
              <div class="card-left" [routerLink]="['/result', session.id]">
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
                <div class="actions">
                  <button class="btn-icon edit" [routerLink]="['/cupping']" [queryParams]="{edit: session.id}" [title]="t('BTN_EDIT')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="btn-icon delete" (click)="confirmDelete(session)" [title]="t('BTN_DELETE')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                </div>
              </div>
            </div>
            <div class="empty-state glass-card" *ngIf="cuppings.length === 0">
               <div class="empty-icon">☕</div>
               <p>{{ t('EMPTY_HISTORY_DESC') }}</p>
               <button routerLink="/cupping" class="btn-primary">Start First Session</button>
            </div>
          </div>
        </div>

        <!-- SAVED VIEW -->
        <div class="saved-view" *ngIf="activeTab() === 'saved'">
          <h2 class="section-title">{{ t('SAVED_SESSIONS') }}</h2>
          <div class="history-feed" *ngIf="savedCuppings$ | async as saved; else loading">
            <div class="history-card glass-card" *ngFor="let session of saved">
              <div class="card-left" [routerLink]="['/result', session.id]">
                <div class="bean-name">{{ session.beanName }}</div>
                <div class="roastery">{{ session.roastery }}</div>
                <div class="card-meta">
                  <span class="tag specialty">{{ session.finalScore | number:'1.1-1' }}</span>
                  <span class="process">{{ session.postHarvest }}</span>
                  <span>by {{ session.cupperName || 'Anonymous' }}</span>
                </div>
              </div>
            </div>
            <div class="empty-state glass-card" *ngIf="saved.length === 0">
               <div class="empty-icon">🔖</div>
               <p>No saved sessions yet. Discover some in the Community!</p>
               <button routerLink="/community" class="btn-primary">Go to Community</button>
            </div>
          </div>
        </div>
      </section>

      <ng-template #loading>
        <div class="loading-state">
          <div class="spinner"></div>
        </div>
      </ng-template>

      <!-- SETTINGS MODAL -->
      <div class="modal-overlay" *ngIf="showSettings()">
        <div class="modal glass-card animate-scale">
          <h3>{{ t('BTN_SETTINGS') }}</h3>
          <div class="form-group" style="text-align: left; margin: 30px 0;">
            <label>{{ t('LABEL_NAME') }}</label>
            <input type="text" [(ngModel)]="newName" placeholder="Display Name">
          </div>
          <div class="modal-actions">
             <button class="btn-secondary" (click)="showSettings.set(false)" [disabled]="updating()">Cancel</button>
             <button class="btn-primary" (click)="updateProfile()" [disabled]="updating()">
               {{ updating() ? 'Updating...' : t('BTN_SAVE') }}
             </button>
          </div>
        </div>
      </div>

      <!-- DELETE MODAL -->
      <div class="modal-overlay" *ngIf="sessionToDelete">
        <div class="modal glass-card animate-scale">
          <h3>{{ t('CONFIRM_DELETE_TITLE') }}</h3>
          <p>{{ t('CONFIRM_DELETE_DESC') }}</p>
          <div class="modal-actions">
             <button class="btn-secondary" (click)="sessionToDelete = null">Cancel</button>
             <button class="btn-danger" (click)="performDelete()">{{ t('BTN_DELETE') }}</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 1000px;
      margin: 40px auto;
      padding: 0 30px;
      padding-bottom: 200px;
    }
    .tab-control {
      display: flex;
      gap: 15px;
      margin-bottom: 30px;
      align-items: center;
    }
    .tab-control button {
      background: transparent;
      border: 1px solid var(--glass-border);
      color: var(--text-dim);
      padding: 10px 25px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      cursor: pointer;
      transition: all 0.3s;
    }
    .tab-control button.active {
      background: var(--primary-color);
      color: #0c0c0e;
      border-color: transparent;
    }
    .settings-trigger { margin-left: auto; border-color: var(--glass-border); }
    .settings-trigger:hover { background: var(--surface-hover); color: var(--text-main); }

    .profile-header {
      padding: 60px;
      margin-bottom: 60px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-image: radial-gradient(circle at 100% 0%, var(--primary-glow) 0%, transparent 40%);
    }
    .user-info { display: flex; gap: 40px; align-items: center; }
    .avatar-large {
      width: 120px;
      height: 120px;
      border-radius: 40px;
      background: var(--primary-gradient);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid var(--glass-border);
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
      overflow: hidden;
    }
    .avatar-large img { width: 100%; height: 100%; object-fit: cover; }
    .avatar-large span { font-size: 3rem; font-weight: 800; color: #0c0c0e; }
    
    .user-details h1 { font-size: 3rem; margin-bottom: 8px; line-height: 1; }
    .email { color: var(--text-dim); font-size: 1.1rem; margin-bottom: 15px; }
    .cupper-rank .rank-label {
      background: var(--primary-color);
      color: #0c0c0e;
      padding: 4px 15px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .stats-grid { display: flex; gap: 20px; }
    .stat-card {
      background: var(--surface-hover);
      padding: 20px 30px;
      border-radius: 20px;
      border: 1px solid var(--glass-border);
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 140px;
    }
    .stat-card .val { font-size: 2rem; font-weight: 900; color: var(--primary-color); font-family: 'Playfair Display', serif; }
    .stat-card .lab { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-dim); }
    .stat-card.specialty { background: var(--primary-gradient); border: none; }
    .stat-card.specialty .val, .stat-card.specialty .lab { color: #0c0c0e; }

    .feed-section { margin-top: 50px; }
    .section-title { font-size: 2rem; margin-bottom: 40px; font-weight: 800; position: relative; display: inline-block; }
    .section-title::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 0;
      width: 60px;
      height: 3px;
      background: var(--primary-color);
    }

    .history-feed { display: grid; gap: 20px; }
    .history-card {
      padding: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.4s;
      border: 1px solid var(--glass-border);
    }
    .history-card:hover { transform: translateX(10px); border-color: var(--primary-color); }
    
    .card-left { cursor: pointer; flex-grow: 1; }
    .bean-name { font-size: 1.4rem; font-weight: 800; color: var(--text-main); margin-bottom: 4px; }
    .history-card .roastery { font-size: 0.9rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
    .tag.specialty { background: var(--primary-gradient); color: #0c0c0e; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; margin-right: 10px; font-weight: 800; }
    .card-meta { display: flex; gap: 10px; font-size: 0.8rem; font-weight: 700; color: var(--primary-color); align-items: center; }
    
    .card-right { display: flex; gap: 30px; align-items: center; }
    .score-badge {
      background: var(--surface-hover);
      width: 70px;
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 18px;
      font-size: 1.6rem;
      font-weight: 950;
      font-family: 'Playfair Display', serif;
      border: 1px solid var(--glass-border);
    }
    .score-badge.specialty { background: var(--primary-gradient); color: #0c0c0e; border: none; box-shadow: 0 8px 20px var(--primary-glow); }
    
    .actions { display: flex; flex-direction: column; gap: 12px; }
    .btn-icon {
      background: transparent;
      border: 1px solid var(--glass-border);
      color: var(--text-dim);
      padding: 8px;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
    }
    .btn-icon:hover.edit { color: var(--primary-color); border-color: var(--primary-color); }
    .btn-icon:hover.delete { color: var(--danger); border-color: var(--danger); }

    .empty-state { text-align: center; padding: 100px; }
    .empty-icon { font-size: 4rem; opacity: 0.2; margin-bottom: 20px; }
    .btn-primary { margin-top: 30px; padding: 15px 40px; border-radius: 100px; }

    /* MODAL */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.8);
      backdrop-filter: blur(10px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .modal {
      max-width: 500px;
      padding: 50px;
      text-align: center;
    }
    .modal h3 { font-size: 1.8rem; margin-bottom: 15px; }
    .modal p { color: var(--text-dim); margin-bottom: 40px; line-height: 1.6; }
    .modal-actions { display: flex; gap: 15px; justify-content: center; }
    .btn-danger { background: var(--danger); color: white; border: none; padding: 12px 30px; border-radius: 100px; font-weight: 700; cursor: pointer; }
    .btn-secondary { background: var(--surface-hover); color: var(--text-main); border: 1px solid var(--glass-border); padding: 12px 30px; border-radius: 100px; font-weight: 700; cursor: pointer; }

    @media (max-width: 900px) {
      .profile-header { flex-direction: column; text-align: center; padding: 40px; gap: 40px; }
      .user-info { flex-direction: column; gap: 20px; }
      .stats-grid { width: 100%; justify-content: center; }
    }
    @media (max-width: 640px) {
      .history-card { flex-direction: column; align-items: flex-start; gap: 25px; }
      .card-right { width: 100%; justify-content: space-between; }
      .actions { flex-direction: row; }
    }
  `]
})
export class ProfileComponent implements OnInit {
  protected auth = inject(AuthService);
  private cuppingService = inject(CuppingService);
  private ts = inject(TranslationService);
  private router = inject(Router);
  protected t = this.ts.t();

  private refreshTrigger = new BehaviorSubject<void>(undefined);
  
  cuppings$!: Observable<CuppingSession[]>;
  savedCuppings$!: Observable<CuppingSession[]>;
  stats$!: Observable<{ total: number, avg: number, favoriteProcess: string }>;
  sessionToDelete: CuppingSession | null = null;

  // New signals for Profile enhancement
  activeTab = signal<'history' | 'saved'>('history');
  showSettings = signal(false);
  updating = signal(false);
  newName = this.auth.currentUser()?.displayName || '';

  ngOnInit() {
    this.cuppings$ = this.auth.user$.pipe(
      filter(user => !!user),
      switchMap(user => this.refreshTrigger.pipe(
        switchMap(() => this.cuppingService.getUserCuppings(user!.uid))
      ))
    );

    this.savedCuppings$ = this.auth.user$.pipe(
      filter(user => !!user),
      switchMap(user => this.refreshTrigger.pipe(
        switchMap(() => this.cuppingService.getSavedCuppings(user!.uid))
      ))
    );

    this.stats$ = this.cuppings$.pipe(
      map(sessions => {
        if (sessions.length === 0) return { total: 0, avg: 0, favoriteProcess: '' };
        
        const avg = sessions.reduce((acc, s) => acc + s.finalScore, 0) / sessions.length;
        
        // Find favorite process
        const processes = sessions.map(s => s.postHarvest);
        const favorite = processes.length > 0 ? [...processes].sort((a,b) =>
            processes.filter(v => v === a).length - processes.filter(v => v === b).length
        ).pop() || '' : '';

        return { total: sessions.length, avg, favoriteProcess: favorite };
      })
    );
  }

  async updateProfile() {
    if (!this.newName.trim()) return;
    this.updating.set(true);
    try {
      await this.auth.updateDisplayName(this.newName);
      this.showSettings.set(false);
    } catch (e) {
      alert('Failed to update profile');
    } finally {
      this.updating.set(false);
    }
  }

  getRank(total: number): string {
    if (total >= 50) return 'Master Cupper';
    if (total >= 20) return 'Professional';
    if (total >= 5) return 'Advanced Cupper';
    return 'Novice Cupper';
  }

  confirmDelete(session: CuppingSession) {
    this.sessionToDelete = session;
  }

  async performDelete() {
    if (!this.sessionToDelete?.id) return;
    
    try {
      await this.cuppingService.deleteCupping(this.sessionToDelete.id);
      this.sessionToDelete = null;
      this.refreshTrigger.next();
    } catch (e) {
      console.error(e);
      alert('Failed to delete session.');
    }
  }
}
