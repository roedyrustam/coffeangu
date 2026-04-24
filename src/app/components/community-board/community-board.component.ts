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
import { SeoService } from '../../services/seo.service';

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

      <!-- FEATURED CUPPERS -->
      <section class="featured-cuppers" *ngIf="topCuppers$ | async as cuppers">
        <div class="section-header">
           <h2 class="section-title">Global Experts</h2>
           <span class="count-tag">{{ cuppers.length }} Active Professionals</span>
        </div>
        <div class="cuppers-scroll">
          <div class="cupper-profile-card glass-card animate-fade" 
               *ngFor="let cupper of cuppers; let i = index"
               [style.animation-delay]="i * 0.1 + 's'"
               [routerLink]="['/u', cupper.username || cupper.uid]">
             <div class="cupper-avatar">
               <img *ngIf="cupper.photoURL" [src]="cupper.photoURL" [alt]="cupper.displayName">
               <span *ngIf="!cupper.photoURL">{{ cupper.displayName.charAt(0) }}</span>
             </div>
             <div class="cupper-meta">
               <span class="cupper-name">{{ cupper.displayName }}</span>
               <div class="cupper-level">
                 <span class="lvl">LVL {{ cupper.level }}</span>
                 <span class="stage">{{ cupper.avatarStage }}</span>
               </div>
             </div>
          </div>
        </div>
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
        <div class="cupping-card glass-card animate-fade" 
             *ngFor="let session of cuppings; let i = index" 
             [class]="getCardSize(session, i)"
             [style.animation-delay]="i * 0.05 + 's'"
             [routerLink]="['/result', session.id]">
          
          <div class="card-glow"></div>

          <div class="card-image">
            <img [src]="session.productImageUrl || '/assets/default-coffee.png'" alt="Product Photo">
          </div>
          
          <div class="card-header">
            <div class="bean-main">
              <h3>{{ session.beanName }}</h3>
              <div class="roastery-row">
                <span class="roastery">{{ session.roastery }}</span>
                <span class="verified-icon" *ngIf="session.isVerifiedRoastery" title="Verified Roastery">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="var(--primary-color)">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7L6.4 13l1.5-1.5 2.2 2.2 4.8-4.8 1.5 1.5-6.3 6.3z"/>
                  </svg>
                </span>
              </div>
            </div>
            <div class="score-display" [class.specialty]="session.finalScore >= 80" [class.specialty-pulse]="session.finalScore >= 85">
              <span class="num">{{ session.finalScore | number:'1.1-1' }}</span>
            </div>
          </div>

          <div class="session-performance">
            <div class="mini-sensory">
               <div class="mini-bar" [style.height.%]="(session.scores.flavor - 1) / 8 * 100" [style.background]="getBarColor(session.scores.flavor)" title="Flavor"></div>
               <div class="mini-bar" [style.height.%]="(session.scores.acidity - 1) / 8 * 100" [style.background]="getBarColor(session.scores.acidity)" title="Acidity"></div>
               <div class="mini-bar" [style.height.%]="(session.scores.mouthfeel - 1) / 8 * 100" [style.background]="getBarColor(session.scores.mouthfeel)" title="Mouthfeel"></div>
            </div>
          </div>

          <div class="sensory-strip">
            <div class="sensory-badge" title="Acidity">
              <span class="icon">🍋</span>
              <span>{{ session.intensities?.acidity || '-' }}</span>
            </div>
            <div class="sensory-badge" title="Mouthfeel">
              <span class="icon">🥃</span>
              <span>{{ session.intensities?.mouthfeel || session.intensities?.body || '-' }}</span>
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
            <div class="cupper-info" [routerLink]="['/u', session.userId]" (click)="$event.stopPropagation()">
              <div class="avatar-wrapper">
                <div class="mini-avatar">{{ (session.cupperName || 'A').charAt(0) }}</div>
                <div class="pro-dot" *ngIf="session.isPro" title="Pro Member"></div>
              </div>
              <span class="name">{{ session.cupperName || 'Anonymous Cupper' }}</span>
              <span class="pro-tag" *ngIf="session.isPro">PRO</span>
            </div>

            <!-- VISIT SHOP BUTTON (Premium Commerce) -->
            <button class="btn-shop" *ngIf="session.buyLink" (click)="$event.stopPropagation(); openUrl(session.buyLink)">
              <span class="icon">🛒</span>
              <span>Visit Shop</span>
            </button>

            <div class="social-stats">
              <div class="social-proof" *ngIf="session.likesCount">
                ❤️ {{ session.likesCount }} users liked this results
              </div>
              <div class="actions-row">
                <div class="stat-item save-btn" 
                     [class.saved]="hasSaved(session)"
                     (click)="$event.stopPropagation(); toggleSave(session)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" [attr.fill]="hasSaved(session) ? 'var(--primary-color)' : 'none'" [attr.stroke]="hasSaved(session) ? 'var(--primary-color)' : 'currentColor'" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path>
                  </svg>
                </div>
                <div class="stat-item like-btn" 
                     [class.liked]="hasLiked(session)" 
                     (click)="$event.stopPropagation(); toggleLike(session)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" [attr.fill]="hasLiked(session) ? 'var(--danger)' : 'none'" [attr.stroke]="hasLiked(session) ? 'var(--danger)' : 'currentColor'" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </footer>
        </div>

        <div class="empty-state glass-card" *ngIf="errorMessage" style="border-color: var(--danger); background: rgba(220,53,69,0.05);">
          <span class="icon">⚠️</span>
          <h4>Terjadi Kesalahan</h4>
          <p>{{ errorMessage }}</p>
          <button class="btn-primary" style="margin-top:20px" (click)="errorMessage = ''; refresh()">Coba Lagi</button>
        </div>

        <div class="empty-state glass-card" *ngIf="!errorMessage && cuppings.length === 0">
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
    .stat-pill .val { font-size: 2.2rem; font-weight: 900; color: var(--primary-color); font-family: var(--font-brand); }
    .stat-pill .lab { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--text-dim); letter-spacing: 1px; }
    .stat-pill.specialty { background: var(--primary-gradient); border: none; }
    .stat-pill.specialty .val, .stat-pill.specialty .lab { color: #0c0c0e; }

    /* FEATURED CUPPERS STYLE */
    .featured-cuppers { margin-bottom: 60px; }
    .section-header { display: flex; align-items: center; gap: 20px; margin-bottom: 25px; }
    .count-tag { font-size: 0.7rem; font-weight: 800; color: var(--primary-color); background: rgba(189, 142, 98, 0.1); padding: 4px 12px; border-radius: 6px; text-transform: uppercase; letter-spacing: 1px; }
    .cuppers-scroll { display: flex; gap: 15px; overflow-x: auto; padding-bottom: 20px; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; }
    .cuppers-scroll::-webkit-scrollbar { display: none; }
    .cupper-profile-card { flex: 0 0 220px; padding: 20px; display: flex; align-items: center; gap: 15px; cursor: pointer; transition: all 0.4s; scroll-snap-align: start; }
    .cupper-profile-card:hover { transform: translateY(-5px); border-color: var(--primary-color); background: var(--surface-hover); }
    .cupper-avatar { width: 50px; height: 50px; border-radius: 16px; background: var(--primary-gradient); display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid var(--glass-border); }
    .cupper-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .cupper-avatar span { font-weight: 900; color: #0c0c0e; font-size: 1.2rem; }
    .cupper-meta { display: flex; flex-direction: column; }
    .cupper-name { font-size: 0.95rem; font-weight: 800; color: var(--text-main); margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px; }
    .cupper-level { display: flex; gap: 8px; align-items: center; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
    .cupper-level .lvl { color: var(--primary-color); }
    .cupper-level .stage { color: var(--text-dim); opacity: 0.6; }

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
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 30px;
      grid-auto-flow: dense;
    }
    .cupping-card {
      padding: 30px; /* Increased padding */
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 15px;
      height: 100%;
      min-height: 400px;
      border-radius: var(--radius-lg);
      transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      background: rgba(20, 20, 23, 0.4);
    }
    
    /* BENTO SIZING */
    .size-wide { grid-column: span 2; }
    .size-tall { grid-row: span 2; }
    .size-large { grid-column: span 2; grid-row: span 2; }

    .size-wide .bean-main h3, .size-large .bean-main h3 { font-size: 2.2rem; }
    .size-tall .card-image { height: 320px; }
    .size-large .card-image { height: 380px; }
    .size-wide .card-image { height: 280px; }
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
      width: calc(100% + 60px); /* Adjusted for 30px padding */
      margin: -30px -30px 8px -30px;
      height: 180px;
      overflow: hidden;
      border-bottom: 1px solid var(--glass-border);
      position: relative;
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
    .bean-main h3 { 
      font-size: 1.5rem; 
      margin-bottom: 4px; 
      font-weight: 800;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.2;
      height: 3.6rem; /* Ensures consistent vertical space for 2 lines */
    }
    .roastery { 
      font-size: 0.75rem; 
      color: var(--text-dim); 
      text-transform: uppercase; 
      letter-spacing: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
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
    .score-display .num { font-size: 1.3rem; font-weight: 950; color: var(--text-main); font-family: var(--font-brand); }
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
    .cupper-info { display: flex; align-items: center; gap: 12px; cursor: pointer; transition: all 0.3s; padding: 5px 12px; border-radius: 10px; }
    .cupper-info:hover { background: rgba(189, 142, 98, 0.1); }
    .cupper-info:hover .name { color: var(--primary-color); }
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
    .avatar-wrapper { position: relative; }
    .pro-dot {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 12px;
      height: 12px;
      background: #00ff00;
      border: 2px solid var(--surface-color);
      border-radius: 50%;
      box-shadow: 0 0 5px rgba(0,255,0,0.5);
    }
    .cupper-info .name { font-size: 0.85rem; font-weight: 700; color: var(--text-main); }
    .pro-tag {
      font-size: 0.55rem;
      font-weight: 900;
      background: var(--primary-gradient);
      color: #0c0c0e;
      padding: 2px 6px;
      border-radius: 4px;
      letter-spacing: 0.5px;
      margin-left: 5px;
    }
    .roastery-row { display: flex; align-items: center; gap: 6px; }
    .verified-icon { display: flex; align-items: center; }

    .btn-shop {
      background: var(--primary-gradient);
      border: none;
      color: #0c0c0e;
      padding: 8px 16px;
      border-radius: 100px;
      font-size: 0.75rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      border: 1px solid rgba(255,255,255,0.2);
    }
    .btn-shop:hover {
      transform: scale(1.05) translateY(-2px);
      box-shadow: 0 5px 15px rgba(189, 142, 98, 0.4);
    }
    .btn-shop .icon { font-size: 1rem; }
    .social-stats { display: flex; flex-direction: column; gap: 12px; width: 100%; border-top: 1px solid var(--glass-border); padding-top: 20px; }
    .social-proof { font-size: 0.7rem; font-weight: 700; color: var(--primary-color); background: rgba(189, 142, 98, 0.05); padding: 8px; border-radius: 8px; text-align: center; width: 100%; }
    .actions-row { display: flex; justify-content: space-between; align-items: center; width: 100%; }
    .stat-item { display: flex; align-items: center; gap: 8px; font-weight: 800; color: var(--text-dim); transition: all 0.2s; }
    .like-btn { cursor: pointer; padding: 5px; border-radius: 8px; }
    .like-btn:hover { background: rgba(255, 69, 58, 0.1); color: var(--danger); }
    .like-btn.liked { color: var(--danger); }
    .like-btn svg { transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    .like-btn:active svg { transform: scale(1.4); }

    .save-btn { cursor: pointer; padding: 5px; border-radius: 8px; }
    .save-btn:hover { background: rgba(189, 142, 98, 0.1); }
    .save-btn.saved { color: var(--primary-color); }
    
    .session-performance {
      background: rgba(0,0,0,0.2);
      padding: 10px 15px;
      border-radius: 12px;
      border: 1px solid var(--glass-border);
    }
    .mini-sensory {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      height: 30px;
    }
    .mini-bar {
      width: 10px;
      border-radius: 3px 3px 0 0;
      opacity: 0.6;
      transition: all 0.4s;
    }
    .cupping-card:hover .mini-bar { opacity: 1; }
    
    .empty-state { text-align: center; padding: 100px; grid-column: 1 / -1; }
    .empty-icon { font-size: 4rem; margin-bottom: 20px; opacity: 0.3; }
    .empty-state h3 { font-size: 2rem; margin-bottom: 10px; }
    .empty-state p { color: var(--text-dim); margin-bottom: 30px; }

    @media (max-width: 1200px) {
      .feed-grid { grid-template-columns: 1fr 1fr; }
      .size-wide, .size-large { grid-column: span 1; }
      .size-tall, .size-large { grid-row: span 1; }
      .card-image { height: 180px !important; }
      .bean-main h3 { font-size: 1.5rem !important; }
    }
    @media (max-width: 900px) {
      .discovery-hero { flex-direction: column; padding: 60px; text-align: center; }
      .hero-content { margin-bottom: 40px; }
      .filters-row { flex-direction: column; gap: 25px; align-items: flex-start; }
    }
    @media (max-width: 768px) {
      .community-container { padding: 0 12px; }
      .feed-grid { 
        grid-template-columns: repeat(2, 1fr); 
        gap: 12px; 
        grid-auto-flow: dense;
      }
      .discovery-hero { padding: 30px; }
      .brand-font { font-size: 2rem; }
      
      .cupping-card { 
        min-height: auto; 
        padding: 15px; 
        gap: 8px;
        border-radius: var(--radius-md);
      }

      /* MOBILE SPANS */
      .size-wide, .size-large { grid-column: span 2; }
      .size-normal, .size-tall { grid-column: span 1; }
      .size-tall { grid-row: span 2; }

      .card-image { 
        width: calc(100% + 30px); 
        margin: -15px -15px 8px -15px; 
        height: 100px !important; 
      }
      .size-wide .card-image, .size-large .card-image { height: 160px !important; }
      .size-tall .card-image { height: 200px !important; }

      .bean-main h3 { 
        font-size: 0.95rem !important; 
        height: auto; 
        margin-bottom: 2px;
      }
      .size-wide .bean-main h3, .size-large .bean-main h3 { 
        font-size: 1.4rem !important; 
      }

      .roastery { font-size: 0.65rem; }
      .score-display { width: 35px; height: 35px; }
      .score-display .num { font-size: 0.8rem; }
      
      .sensory-strip { display: flex; transform: scale(0.85); transform-origin: left; margin: -5px 0; }
      .flavor-cloud { display: flex; flex-wrap: wrap; gap: 4px; }
      .flavor-tag { font-size: 0.6rem; padding: 2px 6px; }
      
      .card-footer { padding-top: 10px; }
      .social-stats { gap: 10px; font-size: 0.75rem; }
      .visit-btn { padding: 6px 12px; font-size: 0.75rem; }
    }
  `]
})
export class CommunityBoardComponent implements OnInit {
  private cuppingService = inject(CuppingService);
  private ts = inject(TranslationService);
  private seo = inject(SeoService);
  protected auth = inject(AuthService);
  t = this.ts.t();
  errorMessage = '';

  // Filter State
  searchQuery = '';
  activeProcess = signal<string>('all');
  sortBy: 'timestamp' | 'finalScore' | 'likesCount' = 'timestamp';
  processes = ['Wash', 'Natural', 'Honey', 'Anaerobic'];

  topCuppers$ = this.cuppingService.getPublicProfiles(12);

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
    this.updateSeo();
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
        this.errorMessage = err.message || 'Gagal memuat data. Periksa koneksi atau index database.';
        return of([]);
      })
    );
  }

  onSearchChange(val: string) {
    this.searchQuery = val;
    this.refresh(); 
  }

  refresh() {
    this.refreshTrigger.next();
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

  toggleSave(session: CuppingSession) {
    const userId = this.auth.getUserId();
    if (!userId || !session.id) return;
    
    const isSaved = this.hasSaved(session);
    this.cuppingService.toggleSave(session.id, userId, isSaved);
  }

  hasLiked(session: CuppingSession): boolean {
    const userId = this.auth.getUserId();
    if (!userId) return false;
    return !!session.likedBy?.includes(userId);
  }

  hasSaved(session: CuppingSession): boolean {
    const userId = this.auth.getUserId();
    if (!userId) return false;
    return !!session.savedBy?.includes(userId);
  }

  getBarColor(val: number) {
    if (!val) return 'var(--text-dim)';
    if (val >= 8) return 'var(--accent-neon)';
    if (val >= 7) return 'var(--primary-color)';
    return 'var(--text-dim)';
  }

  private updateSeo() {
    this.seo.updateMeta({
      title: 'Community Board - Discover Specialty Coffee',
      description: 'Explore the latest coffee evaluations from our global community of professionals and enthusiasts.',
      image: '/assets/og-image.png',
      type: 'website'
    });
  }

  openUrl(url: string) {
    if (url) {
      window.open(url, '_blank');
    }
  }

  getCardSize(session: CuppingSession, index: number): string {
    // Priority 1: High Score -> Large (2x2)
    if (session.finalScore >= 84) return 'size-large';
    
    // Priority 2: Verified Roastery or Mid-High Score -> Wide (2x1)
    if (session.isVerifiedRoastery || session.finalScore >= 82) return 'size-wide';

    // Priority 3: Tall variety
    if (index % 5 === 0) return 'size-tall';
    
    // Default: Normal
    return 'size-normal';
  }
}
