import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CuppingService } from '../../services/cupping.service';
import { AuthService } from '../../services/auth.service';
import { MembershipService, TierDetails } from '../../services/membership.service';
import { TranslationService } from '../../services/translation.service';
import { CuppingSession } from '../../models/cupping.model';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap, take, filter, tap } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { UserProfile } from '../../models/user-profile.model';
import { SensoryAvatarComponent } from '../sensory-avatar/sensory-avatar.component';
import { Chart, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SensoryAvatarComponent],
  template: `
    <div class="profile-container animate-fade" *ngIf="membership$ | async as tier">
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

      <header class="profile-header immersive glass-card">
        <div class="header-visual">
          <img src="/assets/hero-profile.png" alt="Profile Hero" class="header-image">
          <div class="header-overlay"></div>
        </div>
        <div class="header-content">
          <div class="user-info">
            <div class="avatar-large" (click)="avatarInput.click()" style="cursor: pointer; position: relative;">
              <img *ngIf="auth.currentUser()?.photoURL" [src]="auth.currentUser()?.photoURL" alt="Profile">
              <span *ngIf="!auth.currentUser()?.photoURL">{{ auth.currentUser()?.displayName?.charAt(0) || 'U' }}</span>
              <div class="avatar-overlay">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              </div>
              <input type="file" #avatarInput style="display: none" (change)="onAvatarSelected($event)" accept="image/*">
            </div>
            <div class="user-details">
              <h1 class="brand-font">{{ auth.currentUser()?.displayName }}</h1>
              <p class="email">{{ auth.currentUser()?.email }}</p>
              
              <app-sensory-avatar *ngIf="profile$ | async as profile" [profile]="profile"></app-sensory-avatar>
            </div>
          </div>

          <div class="membership-status">
            <div class="tier-pill" [style.border-color]="tier.color" [style.color]="tier.color">
               <span class="dot" [style.background]="tier.color"></span>
               {{ tier.name }}
            </div>
            <button class="upgrade-link" routerLink="/pricing" *ngIf="tier.id === 'classic'">
               Upgrade to Pro
            </button>
          </div>

          <div class="stats-area" *ngIf="stats$ | async as stats">
            <!-- Badges Section -->
            <div class="badges-section" *ngIf="profile$ | async as profile">
              <span class="section-label">Unlocked Achievements</span>
              <div class="badge-row">
                <div class="badge-item" *ngFor="let badge of profile.badges" [title]="badge.description">
                  <span class="badge-icon">{{ badge.icon }}</span>
                  <span class="badge-name">{{ badge.name }}</span>
                </div>
                <div class="badge-placeholder" *ngIf="profile.badges.length === 0">
                  Cup more coffee to unlock badges!
                </div>
              </div>
            </div>
            <div class="signature-section">
               <span class="section-label">Sensory Fingerprint</span>
               <div class="chart-container">
                  <canvas id="signatureChart"></canvas>
               </div>
            </div>
            <div class="numeric-stats">
              <div class="stat-card glass-card">
                <span class="val">{{ stats.total }}</span>
                <span class="lab">{{ t('TOTAL_SESSIONS') }}</span>
              </div>
              <div class="stat-card glass-card">
                <span class="val">{{ stats.avg.toFixed(1) }}</span>
                <span class="lab">{{ t('AVG_SCORE') }}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section class="feed-section">
        <!-- HISTORY VIEW -->
        <div class="history-view" *ngIf="activeTab() === 'history'">
          <div class="section-title-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px;">
            <h2 class="section-title" style="margin-bottom: 0;">{{ t('PERSONAL_HISTORY') }}</h2>
            <button [class.btn-secondary]="tier.id !== 'classic'" 
                    [class.btn-locked]="tier.id === 'classic'"
                    (click)="tier.id === 'classic' ? showUpgradeNotice() : downloadHistory()" 
                    *ngIf="(cuppings$ | async)?.length" 
                    style="padding: 8px 15px; font-size: 0.75rem; position: relative;">
               <span *ngIf="tier.id === 'classic'">🔒 </span>
               📥 Export CSV
            </button>
          </div>
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
          <div class="form-group" style="text-align: left; margin: 20px 0;">
            <label>{{ t('LABEL_NAME') }}</label>
            <input type="text" [(ngModel)]="newName" placeholder="Display Name">
          </div>
          <div class="form-group" style="text-align: left; margin: 20px 0;">
            <label>Username / Handle (@)</label>
            <input type="text" 
                   [(ngModel)]="newUsername" 
                   (ngModelChange)="checkUsername($event)"
                   placeholder="e.g. coffee_guru"
                   style="text-transform: lowercase;">
            <p class="input-hint" 
               [style.color]="usernameStatus() === 'available' ? 'var(--primary-color)' : 'var(--danger)'"
               *ngIf="usernameStatus()">
               {{ usernameStatus() === 'checking' ? 'Checking...' : 
                  usernameStatus() === 'available' ? '✓ Handle is available' : 
                  usernameStatus() === 'taken' ? '✗ Already taken' : '✗ Invalid handle' }}
            </p>
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

      <div class="profile-actions" style="margin-top: 80px; padding-top: 40px; border-top: 1px solid var(--glass-border); text-align: center;">
         <button class="btn-danger" (click)="logout()" style="padding: 18px 60px; font-size: 1rem; letter-spacing: 2px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 10px;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            {{ t('BTN_LOGOUT') }}
         </button>
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
      padding: 0;
      margin-bottom: 60px;
      position: relative;
      border-radius: var(--radius-lg);
      overflow: hidden;
      min-height: 380px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      border: 1px solid var(--glass-border);
      box-shadow: 0 20px 80px rgba(0,0,0,0.6);
    }
    .header-visual {
      position: absolute;
      inset: 0;
      z-index: 0;
    }
    .header-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: brightness(0.6) contrast(1.1);
    }
    .header-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, transparent 0%, rgba(12, 12, 14, 0.5) 40%, var(--bg-color) 100%);
    }
    .header-content {
      position: relative;
      z-index: 1;
      padding: 40px 60px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
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
    .avatar-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s;
      color: white;
    }
    .avatar-large:hover .avatar-overlay { opacity: 1; }
    
    .user-details h1 { font-size: 3.5rem; margin-bottom: 8px; line-height: 1; text-shadow: 0 5px 20px rgba(0,0,0,0.5); }
    .email { color: var(--text-main); font-size: 1.1rem; margin-bottom: 15px; opacity: 0.8; }
    .cupper-rank .rank-label {
      background: var(--primary-gradient);
      color: #0c0c0e;
      padding: 6px 18px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 2px;
      box-shadow: 0 5px 15px var(--primary-glow);
    }

    .stats-grid { display: flex; gap: 40px; align-items: center; }
    .signature-section { flex: 1; min-width: 250px; text-align: left; }
    .chart-container { height: 180px; width: 100%; position: relative; margin-top: 15px; }
    .section-label { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--primary-color); letter-spacing: 2px; }
    .numeric-stats { display: flex; flex-direction: column; gap: 15px; }
    .stat-card {
      background: rgba(12, 12, 14, 0.4);
      padding: 20px 30px;
      border-radius: 22px;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 140px;
      backdrop-filter: blur(10px);
    }
    .stat-card .val { font-size: 2.2rem; font-weight: 900; color: var(--primary-color); font-family: var(--font-brand); text-shadow: 0 5px 15px rgba(0,0,0,0.5); }
    .stat-card .lab { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-main); opacity: 0.6; letter-spacing: 1px; }

    .membership-status { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
    .tier-pill { display: flex; align-items: center; gap: 8px; padding: 6px 15px; border-radius: 100px; border: 1px solid var(--glass-border); font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
    .tier-pill .dot { width: 6px; height: 6px; border-radius: 50%; }
    .upgrade-link { background: transparent; border: none; color: var(--primary-color); font-size: 0.75rem; font-weight: 800; cursor: pointer; text-decoration: underline; text-underline-offset: 4px; }
    .upgrade-link:hover { color: var(--text-main); }

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
      font-family: var(--font-brand);
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
    .btn-locked { background: rgba(255,255,255,0.03); color: var(--text-dim); border: 1px solid var(--glass-border); cursor: not-allowed; }
    .btn-locked:hover { background: rgba(255,255,255,0.05); }

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

    .badges-section {
      margin-top: 30px;
      text-align: left;
    }
    .badge-row {
      display: flex;
      gap: 15px;
      margin-top: 15px;
      flex-wrap: wrap;
    }
    .badge-item {
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--glass-border);
      padding: 10px 15px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.3s;
    }
    .badge-item:hover {
      background: var(--surface-hover);
      transform: translateY(-3px);
    }
    .badge-icon { font-size: 1.2rem; }
    .badge-name { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: var(--primary-color); }
    .badge-placeholder { font-size: 0.8rem; color: var(--text-dim); font-style: italic; }

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
  private membershipService = inject(MembershipService);
  private ts = inject(TranslationService);
  private router = inject(Router);
  protected t = this.ts.t();
  
  membership$: Observable<TierDetails | null> = this.membershipService.getCurrentMembership();

  private refreshTrigger = new BehaviorSubject<void>(undefined);
  
  cuppings$!: Observable<CuppingSession[]>;
  savedCuppings$!: Observable<CuppingSession[]>;
  profile$!: Observable<UserProfile | null>;
  stats$!: Observable<{ total: number, avg: number, favoriteProcess: string, averages: any }>;
  sessionToDelete: CuppingSession | null = null;
  private chart: any;

  // New signals for Profile enhancement
  activeTab = signal<'history' | 'saved'>('history');
  showSettings = signal(false);
  updating = signal(false);
  newName = this.auth.currentUser()?.displayName || '';
  newUsername = '';
  usernameStatus = signal<'available' | 'taken' | 'invalid' | 'checking' | null>(null);
  private usernameDebounce: any;

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

    this.profile$ = this.auth.user$.pipe(
      filter(user => !!user),
      switchMap(user => this.cuppingService.getUserProfile(user!.uid)),
      tap(profile => {
        if (!profile && this.auth.currentUser()) {
           const user = this.auth.currentUser()!;
           this.cuppingService.ensureUserProfile(user.uid, user.displayName || 'User', user.photoURL || undefined);
        }
        if (profile && !this.newUsername) {
          this.newUsername = profile.username?.replace('@', '') || '';
        }
      })
    );

    this.stats$ = this.cuppings$.pipe(
      map(sessions => {
        if (sessions.length === 0) return { total: 0, avg: 0, favoriteProcess: '', averages: {} };
        
        const avg = sessions.reduce((acc, s) => acc + s.finalScore, 0) / sessions.length;
        
        // Find favorite process
        const processes = sessions.map(s => s.postHarvest);
        const favorite = processes.length > 0 ? [...processes].sort((a,b) =>
            processes.filter(v => v === a).length - processes.filter(v => v === b).length
        ).pop() || '' : '';

        // Sensory Averages
        const keys = ['fragranceAroma', 'flavor', 'aftertaste', 'acidity', 'body', 'balance', 'overall'];
        const averages: any = {};
        keys.forEach(k => {
          averages[k] = sessions.reduce((acc, s) => acc + s.scores[k as keyof typeof s.scores], 0) / sessions.length;
        });

        return { total: sessions.length, avg, favoriteProcess: favorite, averages };
      }),
      tap(stats => {
        if (stats.total > 0) {
          setTimeout(() => this.initSignatureChart(stats.averages), 0);
        }
      })
    );
  }

  initSignatureChart(averages: any) {
    const ctx = document.getElementById('signatureChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.chart) this.chart.destroy();

    const data = [
      averages.fragranceAroma, averages.flavor, averages.aftertaste,
      averages.acidity, averages.body, averages.balance, averages.overall
    ];

    this.chart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Aroma', 'Flavor', 'After', 'Acid', 'Body', 'Bal', 'Over'],
        datasets: [{
          data: data,
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
            pointLabels: {
              color: 'rgba(255,255,255,0.4)',
              font: { size: 9, weight: 'bold' }
            },
            ticks: { display: false }
          }
        },
        plugins: { legend: { display: false } }
      }
    });
  }

  async updateProfile() {
    const user = this.auth.currentUser();
    if (!user || !this.newName.trim()) return;
    
    this.updating.set(true);
    try {
      // Update Display Name in Auth
      if (this.newName !== user.displayName) {
        await this.auth.updateDisplayName(this.newName);
      }

      // Update Username in Firestore
      if (this.newUsername.trim()) {
        const clean = this.newUsername.toLowerCase().replace('@', '');
        await this.cuppingService.updateUsername(user.uid, clean);
      }

      this.showSettings.set(false);
      this.refreshTrigger.next();
    } catch (e: any) {
      alert(e.message || 'Failed to update profile');
    } finally {
      this.updating.set(false);
    }
  }

  checkUsername(val: string) {
    if (!val || val.length < 3) {
      this.usernameStatus.set('invalid');
      return;
    }

    const clean = val.toLowerCase().replace('@', '');
    if (!/^[a-z0-9_]+$/.test(clean)) {
      this.usernameStatus.set('invalid');
      return;
    }

    this.usernameStatus.set('checking');
    if (this.usernameDebounce) clearTimeout(this.usernameDebounce);
    
    this.usernameDebounce = setTimeout(async () => {
      const isAvailable = await this.cuppingService.isUsernameAvailable(clean);
      this.usernameStatus.set(isAvailable ? 'available' : 'taken');
    }, 500);
  }

  async onAvatarSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    this.updating.set(true);
    try {
      await this.auth.updateProfileImage(file);
    } catch (e) {
      alert('Failed to upload avatar');
    } finally {
      this.updating.set(false);
    }
  }

  downloadHistory() {
    this.cuppings$.pipe(take(1)).subscribe(sessions => {
      this.cuppingService.exportToCSV(sessions);
    });
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

  async logout() {
     await this.auth.logout();
     this.router.navigate(['/login']);
  }

  showUpgradeNotice() {
    if (confirm('🔒 Custom Export logic is only available for Pro members. Would you like to view our premium plans?')) {
      this.router.navigate(['/pricing']);
    }
  }
}
