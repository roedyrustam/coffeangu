import { Component, OnInit, inject, PLATFORM_ID, AfterViewInit, signal, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { AuthService } from '../../services/auth.service';
import { CuppingService } from '../../services/cupping.service';
import { TranslationService } from '../../services/translation.service';
import { CuppingSession } from '../../models/cupping.model';
import html2canvas from 'html2canvas';
import { MembershipService } from '../../services/membership.service';
import { Chart, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { TeamService } from '../../services/team.service';
import { Team } from '../../models/team.model';
import { SeoService } from '../../services/seo.service';
import { SocialShareComponent } from '../social-share/social-share.component';
import { environment } from '../../../environments/environment';
import { OgService } from '../../services/og.service';
import { SensoryAiService } from '../../services/sensory-ai.service';

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

@Component({
  selector: 'app-cupping-result',
  standalone: true,
  imports: [CommonModule, RouterLink, SocialShareComponent],
  template: `
    <main class="result-container animate-fade" *ngIf="session" role="main">
      <article class="glass-card result-card" id="result-card" [class.radiant-theme]="selectedTheme() === 'radiant'">
        <header class="result-header">
          <div class="badge" aria-label="Coffee Type">{{ session.type }}</div>
          <h1 class="brand-font">{{ session.beanName }}</h1>
          <div class="roastery-row">
            <span class="roastery" aria-label="Roastery">{{ session.roastery }}</span>
            <span class="verified-icon-result" *ngIf="session.isVerifiedRoastery || team?.isVerified" title="Verified Roastery">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="var(--primary-color)" aria-hidden="true">
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7L6.4 13l1.5-1.5 2.2 2.2 4.8-4.8 1.5 1.5-6.3 6.3z"/>
              </svg>
            </span>
          </div>
        </header>

        <section class="product-visual" aria-label="Product Appearance">
           <img [src]="session.productImageUrl || '/assets/default-coffee.png'" alt="Visual representation of {{ session.beanName }}" class="product-photo">
        </section>

        <!-- AI ARCHETYPE SECTION -->
        <section class="ai-archetype-section animate-fade" *ngIf="archetype()">
           <div class="archetype-card luminescent-border">
              <span class="ai-sparkle-label">✨ AI Sensory Archetype</span>
              <h2 class="archetype-name">{{ archetype()?.name }}</h2>
              <p class="archetype-desc">{{ archetype()?.description }}</p>
           </div>
        </section>

        <section class="score-display" aria-label="Final Assessment Score">
          <div class="score-circle">
            <span class="label">{{ t('FINAL_SCORE') }}</span>
            <span class="value" aria-live="polite">{{ session.finalScore | number:'1.2-2' }}</span>
          </div>
          <div class="rating-label" [class.specialty]="session.finalScore >= 80" [class.specialty-pulse]="session.finalScore >= 85" role="status">
            {{ getRating(session.finalScore) }}
          </div>

          <div class="social-actions" *ngIf="session.id" role="group" aria-label="Social Interactions">
            <button class="social-btn like-btn" [class.active]="isLiked()" (click)="toggleLike()" [aria-label]="isLiked() ? 'Unlike' : 'Like'">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" [attr.fill]="isLiked() ? '#ff4757' : 'none'" [attr.stroke]="isLiked() ? '#ff4757' : 'currentColor'" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <span class="count">{{ session.likesCount || 0 }}</span>
            </button>
            <button class="social-btn save-btn" [class.active]="isSaved()" (click)="toggleSave()" [aria-label]="isSaved() ? 'Unsave' : 'Save to List'">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" [attr.fill]="isSaved() ? 'var(--primary-color)' : 'none'" [attr.stroke]="isSaved() ? 'var(--primary-color)' : 'currentColor'" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>{{ isSaved() ? 'Saved' : t('BTN_SAVE_LIST') }}</span>
            </button>
          </div>
        </section>

        <section class="metadata-grid" aria-label="Session Metadata">
          <div class="meta-item">
            <span class="meta-label">{{ t('POST_HARVEST') }}</span>
            <span class="meta-value">{{ session.postHarvest }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">{{ t('BREW_METHOD') }}</span>
            <span class="meta-value">{{ session.brewMethod }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">{{ t('CUPPER_NAME') }}</span>
            <div class="cupper-link-row">
              <span class="meta-value author-link" [routerLink]="['/u', session.userId]" aria-label="View Cupper Profile">{{ session.cupperName || 'Anonymous' }}</span>
              <span class="pro-tag-result" *ngIf="session.isPro" aria-hidden="true">PRO</span>
            </div>
          </div>
          <div class="meta-item">
            <span class="meta-label">Date</span>
            <span class="meta-value">{{ session.productionDate | date }}</span>
          </div>
        </section>

        <section class="chart-section luminescent-border animate-fade" aria-label="Sensory Radar Chart">
           <div class="chart-wrapper">
              <canvas id="sensoryChart"></canvas>
           </div>
           <div class="chart-glow-layer"></div>
        </section>

        <section class="cva-result-section" aria-label="Detailed Attributes">
           <div class="flavor-profile" *ngIf="session.flavorNotes && session.flavorNotes.length > 0">
              <span class="section-label">{{ t('FLAVOR_PROFILE') }}</span>
              <div class="result-chips">
                 <span class="result-chip" *ngFor="let note of session.flavorNotes">{{ note }}</span>
              </div>
           </div>

           <div class="intensity-viz">
              <span class="section-label">{{ t('INTENSITY_TITLE') }}</span>
              <div class="intensity-bars-row">
                  <div class="int-bar-item">
                     <label>{{ t('ACIDITY') }}</label>
                     <div class="int-track" role="progressbar" [attr.aria-valuenow]="session.intensities?.acidity" aria-valuemin="1" aria-valuemax="10"><div class="int-fill" [style.background]="getScoreColor('acidity')" [style.width.%]="(session.intensities?.acidity || 0) * 10"></div></div>
                  </div>
                  <div class="int-bar-item">
                     <label>{{ t('MOUTHFEEL') }}</label>
                     <div class="int-track" role="progressbar" [attr.aria-valuenow]="session.intensities?.mouthfeel" aria-valuemin="1" aria-valuemax="10"><div class="int-fill" [style.background]="getScoreColor('mouthfeel')" [style.width.%]="(session.intensities?.mouthfeel || session.intensities?.body || 0) * 10"></div></div>
                  </div>
                  <div class="int-bar-item">
                     <label>{{ t('SWEETNESS') }}</label>
                     <div class="int-track" role="progressbar" [attr.aria-valuenow]="session.intensities?.sweetness" aria-valuemin="1" aria-valuemax="10"><div class="int-fill" [style.background]="getScoreColor('sweetness')" [style.width.%]="(session.intensities?.sweetness || 0) * 10"></div></div>
                  </div>
              </div>
           </div>
        </section>

        <section class="sensory-summary" aria-label="Quality Breakdown">
           <span class="section-label">{{ t('QUALITY_TITLE') }}</span>
           <div class="sensory-bars">
              <div class="bar-item" *ngFor="let item of sensoryItems">
                 <div class="bar-header">
                    <span [style.color]="getScoreColor(item.key)">{{ item.label }}</span>
                    <span aria-live="polite">{{ item.value }}</span>
                 </div>
                 <div class="bar-bg" role="progressbar" [attr.aria-valuenow]="item.value" aria-valuemin="1" aria-valuemax="9">
                    <div class="bar-fill" [style.background]="getScoreColor(item.key)" [style.width.%]="(item.value - 1) / 8 * 100"></div>
                 </div>
              </div>
           </div>
        </section>

        <footer class="actions">
          <div class="next-steps-luxury">
            <button routerLink="/cupping" class="btn-primary start-new-btn">
              <span>Start New Session</span>
            </button>
            <div class="secondary-actions">
              <a routerLink="/" class="back-link">{{ t('NAV_HOME') }}</a>
              <button class="btn-outline" (click)="downloadImage()" [disabled]="generatingScreenshot">
                {{ generatingScreenshot ? 'Preparing...' : 'Download Image' }}
              </button>
            </div>
          </div>

          <div class="template-selector" *ngIf="membership$ | async as tier">
             <span>Theme:</span>
             <button (click)="setTheme('obsidian')" [class.active]="selectedTheme() === 'obsidian'" aria-label="Select Obsidian Theme">Obsidian</button>
             <button (click)="setTheme('radiant')" 
                     [class.active]="selectedTheme() === 'radiant'"
                     [class.locked-theme]="tier.id === 'classic'"
                     aria-label="Select Radiant Theme">
               <span *ngIf="tier.id === 'classic'" aria-hidden="true">🔒 </span>Radiant
             </button>
          </div>
          
          <div class="media-share-section" *ngIf="session.isPublic">
             <span class="section-label">Quick Share</span>
             <app-social-share [text]="'Check out my coffee cupping notes for ' + session.beanName + ' (' + session.finalScore.toFixed(2) + ' pts)!'"></app-social-share>
          </div>
          
          <div class="commerce-bridge-luxury animate-slide-up" *ngIf="getBuyUrl()">
             <a [href]="getBuyUrl()" target="_blank" class="btn-commerce-luxury" aria-label="Official Commerce Link">
                <div class="c-content">
                  <span class="c-label">Official Commerce</span>
                  <span class="c-action">Acquire This Coffee Bean 🛍️</span>
                </div>
                <div class="c-arrow">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
             </a>
             <p class="c-hint-luxury" *ngIf="session.isVerifiedRoastery || team?.isVerified">Directly from the Verified Roastery</p>
          </div>
        </footer>
      </article>
    </main>

    <div class="loading-state" *ngIf="!session && !error" role="status">
       <div class="spinner"></div>
       <p>Loading Cupping Result...</p>
    </div>

    <div class="error-state" *ngIf="error">
       <h2>Session Not Found</h2>
       <p>The cupping session you are looking for does not exist or has been removed.</p>
       <a routerLink="/" class="btn-primary">Return Home</a>
    </div>
  `,
  styles: [`
    .result-container {
      max-width: 900px;
      margin: 60px auto;
      padding: 0 30px;
      padding-bottom: 120px;
    }
    .result-card {
      text-align: center;
      padding: 60px;
      position: relative;
      box-shadow: 0 40px 100px rgba(0,0,0,0.25);
    }
    .media-share-section { margin-top: 40px; padding-top: 30px; border-top: 1px solid var(--glass-border); }
    .media-share-section .section-label { display: block; margin-bottom: 15px; }
    .badge {
      display: inline-block;
      background: var(--primary-gradient);
      color: #0c0c0e;
      padding: 6px 18px;
      border-radius: 100px;
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      margin-bottom: 20px;
    }
    .brand-font {
      font-size: 3.5rem;
      margin-bottom: 10px;
    }
    .roastery {
      color: var(--text-dim);
      font-size: 1.2rem;
      letter-spacing: 2px;
      text-transform: uppercase;
      font-weight: 500;
    }
    .product-visual {
      margin: 40px auto;
      max-width: 500px;
      border-radius: var(--radius-md);
      overflow: hidden;
      border: 1px solid var(--glass-border);
      box-shadow: 0 15px 40px rgba(0,0,0,0.4);
    }
    .product-photo {
      width: 100%;
      height: auto;
      display: block;
    }
    .score-display {
      margin: 60px 0;
    }
    .score-circle {
      width: 240px;
      height: 240px;
      margin: 0 auto;
      background: var(--primary-gradient);
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      box-shadow: 0 20px 60px var(--primary-glow);
    }
    .score-circle .label {
      font-size: 0.9rem;
      text-transform: uppercase;
      color: #0c0c0e;
      font-weight: 700;
      letter-spacing: 1px;
    }
    .score-circle .value {
      font-size: 5rem;
      font-weight: 950;
      color: #0c0c0e;
      font-family: var(--font-brand);
      line-height: 1;
    }
    .rating-label {
      margin-top: 25px;
      font-weight: 800;
      font-size: 1.4rem;
      color: var(--text-dim);
      letter-spacing: -0.5px;
    }
    .rating-label.specialty {
      color: var(--accent-neon);
      text-shadow: 0 0 20px rgba(212, 225, 87, 0.2);
    }
    .metadata-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 30px;
      margin: 60px 0;
      text-align: left;
      background: rgba(0,0,0,0.2);
      padding: 30px;
      border-radius: var(--radius-md);
      border: 1px solid var(--glass-border);
    }
    .meta-label {
      display: block;
      font-size: 0.8rem;
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 6px;
      font-weight: 700;
    }
    .meta-value {
      font-weight: 800;
      font-size: 1.1rem;
      color: var(--text-main);
    }
    .author-link { cursor: pointer; transition: all 0.3s; color: var(--primary-color); }
    .author-link:hover { text-decoration: underline; color: var(--text-main); }
    .section-label {
      display: block;
      font-size: 0.85rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 2px;
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 20px;
    }
    .cva-result-section {
      margin: 60px 0;
      text-align: left;
      display: flex;
      flex-direction: column;
      gap: 50px;
    }
    .result-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .result-chip {
      background: var(--surface-hover);
      border: 1px solid var(--glass-border);
      color: var(--primary-color);
      padding: 10px 20px;
      border-radius: 100px;
      font-size: 0.9rem;
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .intensity-bars-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 25px;
    }
    .int-bar-item label {
      display: block;
      font-size: 0.8rem;
      color: var(--text-dim);
      margin-bottom: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .int-track {
      height: 6px;
      background: var(--surface-hover);
      border-radius: 100px;
    }
    .int-fill {
      height: 100%;
      background: var(--primary-gradient);
      border-radius: 100px;
      box-shadow: 0 0 10px var(--primary-glow);
    }
    .chart-section {
      margin: 60px auto;
      background: transparent;
      padding: 20px;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      max-width: 600px;
    }
    .chart-wrapper {
      position: relative;
      height: 500px;
      width: 500px;
      max-width: 100%;
      z-index: 1;
      background: radial-gradient(circle at center, rgba(12, 12, 14, 0.8) 0%, rgba(22, 22, 26, 0.95) 70%, rgba(12, 12, 14, 1) 100%);
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      box-shadow: 
        0 40px 100px rgba(0, 0, 0, 0.8),
        inset 0 0 80px rgba(0, 0, 0, 0.6);
    }
    .chart-glow-layer {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, rgba(189, 142, 98, 0.05) 0%, transparent 70%);
      pointer-events: none;
      z-index: 0;
      border-radius: 50%;
    }
    .sensory-summary {
      text-align: left;
      margin: 60px 0;
      background: var(--surface-color);
      padding: 40px;
      border-radius: var(--radius-lg);
      border: 1px solid var(--glass-border);
    }
    .sensory-bars {
      display: grid;
      gap: 25px;
    }
    .bar-header {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
      font-weight: 700;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .bar-bg {
      height: 8px;
      background: var(--surface-hover);
      border-radius: 100px;
    }
    .bar-fill {
      height: 100%;
      background: var(--primary-gradient);
      box-shadow: 0 0 20px var(--primary-glow);
      border-radius: 100px;
      transition: width 1.5s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .actions {
      display: flex;
      flex-direction: column;
      gap: 30px;
      margin-top: 60px;
    }
    .next-steps-luxury {
      display: flex;
      flex-direction: column;
      gap: 20px;
      width: 100%;
    }
    .start-new-btn {
      height: 70px;
      font-size: 1.2rem;
      letter-spacing: 2px;
      text-transform: uppercase;
      width: 100%;
      box-shadow: 0 15px 40px var(--primary-glow);
    }
    .secondary-actions {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 25px;
    }
    .btn-outline {
      background: transparent;
      border: 1px solid var(--glass-border);
      color: var(--text-dim);
      padding: 10px 20px;
      border-radius: 12px;
      font-weight: 800;
      font-size: 0.8rem;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.3s;
    }
    .btn-outline:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }
    .back-link {
      color: var(--text-dim);
      text-decoration: none;
      font-weight: 800;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .back-link:hover { color: var(--primary-color); }
    .social-actions {
       margin-top: 30px;
       display: flex;
       justify-content: center;
       gap: 15px;
    }
    .social-btn {
       background: var(--surface-hover);
       border: 1px solid var(--glass-border);
       color: var(--text-main);
       padding: 10px 20px;
       border-radius: 100px;
       font-size: 0.9rem;
       font-weight: 700;
       cursor: pointer;
       display: flex;
       align-items: center;
       gap: 10px;
       transition: all 0.3s;
    }
    .social-btn:hover:not(:disabled) {
       background: rgba(255,255,255,0.05);
       transform: scale(1.05);
    }
    .social-btn:disabled {
       opacity: 0.6;
       cursor: default;
    }
    .like-btn.active {
       color: #ff4757;
       border-color: #ff4757;
    }
    .share-options {
       margin-bottom: 20px;
       text-align: center;
    }
    .share-hint {
       font-size: 0.8rem;
       color: var(--primary-color);
       font-weight: 800;
       text-transform: uppercase;
       letter-spacing: 1px;
    }
    .template-selector {
       display: flex;
       align-items: center;
       justify-content: center;
       gap: 15px;
       margin-bottom: 30px;
       font-size: 0.8rem;
       font-weight: 700;
       color: var(--text-dim);
       text-transform: uppercase;
       letter-spacing: 1px;
    }

    .roastery-row { display: flex; align-items: center; justify-content: center; gap: 10px; }
    .verified-icon-result { display: flex; align-items: center; filter: drop-shadow(0 0 5px rgba(189, 142, 98, 0.3)); }
    .cupper-link-row { display: flex; align-items: center; gap: 10px; }
    .pro-tag-result {
      font-size: 0.55rem;
      font-weight: 900;
      background: var(--primary-gradient);
      color: #0c0c0e;
      padding: 2px 6px;
      border-radius: 4px;
      letter-spacing: 0.5px;
    }

    .commerce-bridge-luxury {
      margin: 40px 0;
      width: 100%;
    }
    .btn-commerce-luxury {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--primary-gradient);
      padding: 24px 35px;
      border-radius: 24px;
      text-decoration: none;
      color: #0c0c0e;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      border: 1px solid rgba(255,255,255,0.2);
      box-shadow: 0 15px 40px rgba(189, 142, 98, 0.4);
    }
    .btn-commerce-luxury:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 25px 60px rgba(189, 142, 98, 0.6);
    }
    .c-content { text-align: left; }
    .c-label { 
      display: block; 
      font-size: 0.75rem; 
      font-weight: 800; 
      text-transform: uppercase; 
      letter-spacing: 2px; 
      margin-bottom: 4px;
      opacity: 0.8;
    }
    .c-action { font-size: 1.4rem; font-weight: 950; font-family: var(--font-brand); }
    .c-hint-luxury { 
      margin-top: 15px; 
      font-size: 0.8rem; 
      font-weight: 700; 
      color: var(--primary-color); 
      text-transform: uppercase; 
      letter-spacing: 1px;
    }
    .template-selector button {
       background: transparent;
       border: 1px solid var(--glass-border);
       color: var(--text-dim);
       padding: 5px 15px;
       border-radius: 6px;
       cursor: pointer;
       font-weight: 800;
       font-size: 0.7rem;
       transition: all 0.3s;
    }
    .template-selector button.active {
       background: var(--primary-color);
       color: #0c0c0e;
       border-color: transparent;
    }
    .loading-state, .error-state {
      text-align: center;
      margin-top: 150px;
    }

    /* Radiant Theme Overrides */
    .radiant-theme {
      background: #fdfdfd;
      color: #0c0c0e;
      border-color: #e5bc7d;
    }
    .radiant-theme .brand-font {
       background: linear-gradient(135deg, #8b5e34, #bd8e62);
       -webkit-background-clip: text;
       -webkit-text-fill-color: transparent;
    }
    .radiant-theme .roastery, .radiant-theme .meta-label, .radiant-theme .section-label {
       color: #634326;
    }
    .radiant-theme .meta-value {
       color: #0c0c0e;
    }
    .radiant-theme .metadata-grid, .radiant-theme .chart-section, .radiant-theme .sensory-summary {
       background: rgba(189, 142, 98, 0.05);
       border-color: rgba(189, 142, 98, 0.2);
    }
    .radiant-theme .score-circle {
       box-shadow: 0 20px 40px rgba(189, 142, 98, 0.4);
    }
    .radiant-theme .bar-bg, .radiant-theme .int-track {
       background: rgba(189, 142, 98, 0.15);
    }
    .radiant-theme .rating-label {
       color: #8b5e34;
    }

    .ai-archetype-section { margin-top: 40px; }
    .archetype-card { padding: 32px; background: rgba(189, 142, 98, 0.05); border-radius: 20px; border-color: rgba(189, 142, 98, 0.3); }
    .ai-sparkle-label { font-size: 0.75rem; font-weight: 800; color: var(--primary-color); text-transform: uppercase; letter-spacing: 2px; display: block; margin-bottom: 12px; }
    .archetype-name { font-size: 2.2rem; font-weight: 900; background: var(--primary-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px; }
    .archetype-desc { color: var(--text-dim); font-size: 1rem; line-height: 1.6; }

    .btn-download-image {
      margin-top: 20px;
      width: 100%;
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--glass-border);
      color: var(--text-main);
      padding: 14px;
      border-radius: 14px;
      font-weight: 800;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.3s;
    }
    .btn-download-image:hover:not(:disabled) {
      background: var(--surface-hover);
      border-color: var(--primary-color);
      transform: translateY(-2px);
    }
    .btn-download-image:disabled { opacity: 0.5; cursor: wait; }

    @media (max-width: 600px) {
      .chart-wrapper {
        height: 340px;
        width: 340px;
        padding: 25px;
      }
      .chart-section { margin: 30px auto; padding: 5px; }
    }

    @media (max-width: 768px) {
      .result-container { padding: 0 15px; margin: 30px auto; }
      .result-card { padding: 40px 20px; }
      .brand-font { font-size: 2.2rem; }
      .score-circle { width: 180px; height: 180px; }
      .score-circle .value { font-size: 3.5rem; }
      .metadata-grid { grid-template-columns: 1fr 1fr; gap: 20px; padding: 20px; }
      .chart-section { padding: 20px; }
      .chart-wrapper { height: 300px; }
      .btn-commerce-luxury { padding: 20px; border-radius: 18px; }
      .c-action { font-size: 1.1rem; }
    }

    @media (max-width: 480px) {
      .brand-font { font-size: 1.8rem; }
      .roastery { font-size: 1rem; }
      .metadata-grid { grid-template-columns: 1fr; }
      .sensory-summary { padding: 25px 15px; }
      .score-circle { width: 150px; height: 150px; }
      .score-circle .value { font-size: 3rem; }
    }
  `]
})
export class CuppingResultComponent implements OnInit, AfterViewInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private cuppingService = inject(CuppingService);
  private meta = inject(Meta);
  private teamService = inject(TeamService);
  private title = inject(Title);
  private platformId = inject(PLATFORM_ID);
  private ts = inject(TranslationService);
  t = this.ts.t();
  
  session: CuppingSession | null = null;
  team: Team | null = null;
  error = false;
  sensoryItems: any[] = [];
  generatingScreenshot = false;
  auth = inject(AuthService);
  private membershipService = inject(MembershipService);
  private seo = inject(SeoService);
  private router = inject(Router);
  membership$ = this.membershipService.getCurrentMembership();
  selectedTheme = signal<'obsidian' | 'radiant'>('obsidian');
  private ogService = inject(OgService);
  private aiService = inject(SensoryAiService);
  archetype = signal<{name: string, description: string} | null>(null);
  private sensoryChart: Chart | null = null;

  isLiked() {
    const userId = this.auth.getUserId();
    return !!this.session?.likedBy?.includes(userId || '');
  }

  isSaved() {
    const userId = this.auth.getUserId();
    return !!this.session?.savedBy?.includes(userId || '');
  }

  shareThreads() {
    if (!this.session) return;
    const url = `https://www.threads.net/intent/post?text=${encodeURIComponent('Check out my coffee cupping results for ' + this.session.beanName + '!')}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  }

  setTheme(theme: 'obsidian' | 'radiant') {
    if (theme === 'radiant') {
      this.membership$.subscribe(m => {
        if (m && m.id !== 'classic') {
          this.selectedTheme.set(theme);
        } else {
          if (confirm('🔒 Radiant Theme is a Pro feature. Upgrade to unlock?')) {
            this.router.navigate(['/pricing']);
          }
        }
      }).unsubscribe();
      return;
    }
    this.selectedTheme.set(theme);
  }

  async toggleLike() {
    const userId = this.auth.getUserId();
    if (!this.session?.id || !userId) return;
    try {
      const liked = this.isLiked();
      await this.cuppingService.toggleLike(this.session.id, userId, liked);
      // Optimistic update for immediate feedback
      if (this.session.likedBy) {
        if (liked) {
          this.session.likedBy = this.session.likedBy.filter(id => id !== userId);
          this.session.likesCount = (this.session.likesCount || 1) - 1;
        } else {
          this.session.likedBy.push(userId);
          this.session.likesCount = (this.session.likesCount || 0) + 1;
        }
      } else {
        this.session.likedBy = liked ? [] : [userId];
        this.session.likesCount = liked ? 0 : 1;
      }
    } catch (e) {
      console.error(e);
    }
  }

  async toggleSave() {
    const userId = this.auth.getUserId();
    if (!this.session?.id || !userId) return;
    try {
      const saved = this.isSaved();
      await this.cuppingService.toggleSave(this.session.id, userId, saved);
      // Optimistic update
      if (this.session.savedBy) {
        if (saved) {
          this.session.savedBy = this.session.savedBy.filter(id => id !== userId);
        } else {
          this.session.savedBy.push(userId);
        }
      } else {
        this.session.savedBy = saved ? [] : [userId];
      }
    } catch (e) {
      console.error(e);
    }
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSession(id);
    } else {
      this.error = true;
    }
  }

  updateArchetype() {
    if (!this.session) return;
    const arch = this.aiService.predictArchetype({
      acidity: this.session.scores.acidity,
      body: this.session.scores.mouthfeel,
      flavor: this.session.scores.flavor,
      sweetness: this.session.scores.sweetness
    });
    this.archetype.set(arch);
  }

  async loadSession(id: string) {
    try {
      const data = await this.cuppingService.getCuppingById(id);
      if (data) {
        // Enforce privacy: If not public, ensure logged-in user is the owner
        if (!data.isPublic) {
          const { take } = await import('rxjs/operators');
          const { firstValueFrom } = await import('rxjs');
          const user = await firstValueFrom(this.auth.user$.pipe(take(1)));
          
          if (!user || user.uid !== data.userId) {
            console.warn('Unauthorized access to private cupping session');
            this.router.navigate(['/login'], { queryParams: { returnUrl: `/result/${id}` } });
            return;
          }
        }
        
        this.session = data;
        this.updateArchetype();
        this.prepareSensoryItems();
        this.updateMetaTags();
        this.generateStructuredData(data);

        if (data.teamId) {
          this.teamService.getTeamById(data.teamId).subscribe(t => this.team = t);
        }
        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => this.initChart(), 0);
        }
      } else {
        this.error = true;
      }
    } catch (e) {
      console.error(e);
      this.error = true;
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId) && this.session) {
      this.initChart();
      // Small delay to ensure animations finish before capture
      setTimeout(() => this.checkAndGenerateScreenshot(), 2500);
    }
  }

  initChart() {
    if (!this.session) return;
    const canvas = document.getElementById('sensoryChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s = this.session.scores;
    // Map to the 5 core attributes shown in the requested image
    const labels = ['AROMA', 'FLAVOR', 'ACIDITY', 'BODY', 'AFTERTASTE'];
    const data = [
      s.fragranceAroma,
      s.flavor,
      s.acidity,
      s.mouthfeel,
      s.aftertaste
    ];

    const pointColors = [
      '#ff5252', // Aroma - Red
      '#ffab40', // Flavor - Orange
      '#40c4ff', // Acidity - Blue
      '#69f0ae', // Body - Green
      '#b388ff'  // Aftertaste - Purple
    ];

    if (this.sensoryChart) {
      this.sensoryChart.destroy();
    }

    this.sensoryChart = new Chart(canvas, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Sensory Profile',
          data: data,
          fill: true,
          backgroundColor: 'rgba(22, 22, 26, 0.6)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          borderWidth: 2,
          pointBackgroundColor: pointColors,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 12, // Larger for the "bubble" look
          pointHoverRadius: 15,
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: 30
        },
        scales: {
          r: {
            grid: {
              circular: true, // Key for the circular look
              color: 'rgba(255, 255, 255, 0.1)',
            },
            angleLines: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            suggestedMin: 0,
            suggestedMax: 10,
            ticks: {
              display: true,
              stepSize: 2,
              color: 'rgba(255, 255, 255, 0.3)',
              backdropColor: 'transparent',
              font: { size: 10 }
            },
            pointLabels: {
              color: 'rgba(255, 255, 255, 0.7)',
              font: {
                family: "'Outfit', sans-serif",
                size: 13,
                weight: 'bold'
              },
              padding: 15
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false } // We'll show values on points
        }
      },
      plugins: [{
        id: 'glowPoints',
        afterDraw: (chart) => {
          const { ctx } = chart;
          chart.data.datasets.forEach((dataset, datasetIndex) => {
            const meta = chart.getDatasetMeta(datasetIndex);
            meta.data.forEach((point: any, index: number) => {
              const val = dataset.data[index] as number;
              const color = pointColors[index];
              
              ctx.save();
              // Outer Glow
              ctx.shadowBlur = 20;
              ctx.shadowColor = color;
              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.arc(point.x, point.y, 11, 0, Math.PI * 2);
              ctx.fill();
              
              // White Inner Core
              ctx.shadowBlur = 0;
              ctx.fillStyle = '#fff';
              ctx.beginPath();
              ctx.arc(point.x, point.y, 9, 0, Math.PI * 2);
              ctx.fill();

              // Score Text
              ctx.fillStyle = '#0c0c0e';
              ctx.font = 'bold 10px Outfit';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(val.toFixed(1), point.x, point.y);
              ctx.restore();
            });
          });
        }
      }]
    });
  }

  async checkAndGenerateScreenshot() {
    if (!this.session || this.session.shareImageUrl || this.generatingScreenshot) return;

    this.generatingScreenshot = true;
    try {
      const url = await this.ogService.generateAndUpload('result-card', this.session.id!);
      if (url) {
        await this.cuppingService.updateCupping(this.session.id!, { shareImageUrl: url });
        this.session.shareImageUrl = url;
        this.updateMetaTags();
      }
    } catch (e) {
      console.error('Screenshot generation failed', e);
    } finally {
      this.generatingScreenshot = false;
    }
  }

  async downloadImage() {
    if (this.generatingScreenshot) return;
    
    this.generatingScreenshot = true;
    try {
      const element = document.getElementById('result-card');
      if (!element) return;

      const canvas = await html2canvas(element, {
        backgroundColor: this.selectedTheme() === 'radiant' ? '#fdfdfd' : '#0c0c0e',
        scale: 3, // Higher scale for download
        useCORS: true,
        logging: false,
        onclone: (doc) => {
          const actions = doc.querySelector('.actions');
          if (actions) (actions as HTMLElement).style.display = 'none';
        }
      });

      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = canvas.width;
      finalCanvas.height = canvas.height;
      const ctx = finalCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(canvas, 0, 0);
        
        // Add Watermark
        ctx.save();
        ctx.font = 'bold 80px "Outfit", sans-serif';
        ctx.fillStyle = 'rgba(189, 142, 98, 0.4)';
        ctx.textAlign = 'right';
        ctx.translate(finalCanvas.width - 100, finalCanvas.height - 100);
        ctx.rotate(-Math.PI / 12);
        ctx.fillText('VERIFIED SCA PROTOCOL', 0, 0);
        ctx.restore();

        // Add App Logo/Branding
        ctx.font = '60px "Outfit", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.textAlign = 'left';
        ctx.fillText('CuppingNotes v2.0', 100, finalCanvas.height - 100);
      }

      const link = document.createElement('a');
      link.download = `cupping-result-${this.session?.beanName.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = finalCanvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Download failed', e);
    } finally {
      this.generatingScreenshot = false;
    }
  }

  updateMetaTags() {
    if (!this.session) return;

    const description = `Score: ${this.session.finalScore.toFixed(2)} | ${this.session.roastery} | ${this.session.type}. Cupped by ${this.session.cupperName || 'Professional'}.`;
    
    // Facebook & Threads require absolute URLs for og:image
    const baseUrl = environment.siteUrl;
    let imageUrl = this.session.shareImageUrl || `${baseUrl}/assets/hero-og.png`;
    // Ensure absolute URL
    if (imageUrl.startsWith('/')) {
      imageUrl = `${baseUrl}${imageUrl}`;
    }
    const pageUrl = `${baseUrl}/result/${this.session.id}`;

    // GEO Coordinates Mapping (Heuristic)
    const originCoords: Record<string, { lat: number, lng: number }> = {
      'Ethiopia': { lat: 9.145, lng: 40.4896 },
      'Colombia': { lat: 4.5709, lng: -74.2973 },
      'Brazil': { lat: -14.235, lng: -51.9253 },
      'Indonesia': { lat: -0.7893, lng: 113.9213 },
      'Kenya': { lat: -1.2921, lng: 36.8219 },
      'Vietnam': { lat: 14.0583, lng: 108.2772 },
      'Panama': { lat: 8.538, lng: -80.7823 },
      'Sumatra': { lat: -0.5897, lng: 101.3431 },
      'Gayo': { lat: 4.6888, lng: 96.8521 },
      'Toraja': { lat: -2.9691, lng: 119.8978 }
    };

    const coords = originCoords[this.session.origin || ''] || undefined;

    this.seo.updateMeta({
      title: `${this.session.beanName} Evaluation`,
      description: description,
      image: imageUrl,
      url: pageUrl,
      type: 'article',
      author: this.session.cupperName,
      origin: this.session.origin,
      latitude: coords?.lat,
      longitude: coords?.lng
    });
  }

  generateStructuredData(data: CuppingSession) {
    const jsonLd = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": data.beanName,
      "image": [
        data.productImageUrl || data.shareImageUrl || `${environment.siteUrl}/assets/hero-og.png`
      ],
      "description": `Coffee evaluation for ${data.beanName} by ${data.roastery}. SCA Score: ${data.finalScore.toFixed(2)}`,
      "brand": {
        "@type": "Brand",
        "name": data.roastery
      },
      "review": {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": data.finalScore.toFixed(2),
          "bestRating": "100"
        },
        "author": {
          "@type": "Person",
          "name": data.cupperName || "CuppingNotes Professional"
        }
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": data.finalScore.toFixed(2),
        "reviewCount": "1"
      }
    };
    this.seo.addJsonLd(jsonLd);
  }

  getScoreColor(key: string): string {
    const colors: Record<string, string> = {
      fragranceAroma: '#FF5252', // Red (from image)
      flavor: '#FFA000',         // Amber/Orange (from image)
      aftertaste: '#E040FB',     // Purple (from image)
      acidity: '#40C4FF',        // Light Blue (from image)
      sweetness: '#FF4081',      // Pink
      mouthfeel: '#69F0AE',      // Vibrant Green (from image)
      balance: '#00E5FF',        // Cyan
      overall: '#FFD740',        // Gold/Bronze
      cleanCup: '#00E676',       // Green
      uniformity: '#1DE9B6'      // Teal
    };
    return colors[key] || '#FFD740';
  }

  prepareSensoryItems() {
    if (!this.session) return;
    const scores = this.session.scores;
    this.sensoryItems = [
      { label: 'Aroma', value: scores.fragranceAroma, key: 'fragranceAroma' },
      { label: 'Flavor', value: scores.flavor, key: 'flavor' },
      { label: 'Aftertaste', value: scores.aftertaste, key: 'aftertaste' },
      { label: 'Acidity', value: scores.acidity, key: 'acidity' },
      { label: 'Sweetness', value: scores.sweetness, key: 'sweetness' },
      { label: 'Body', value: scores.mouthfeel, key: 'mouthfeel' },
      { label: 'Balance', value: scores.balance, key: 'balance' },
      { label: 'Uniformity', value: scores.uniformity, key: 'uniformity' },
      { label: 'Clean Cup', value: scores.cleanCup, key: 'cleanCup' },
      { label: 'Overall', value: scores.overall, key: 'overall' }
    ];
  }

  getRating(score: number): string {
    if (score >= 90) return 'Outstanding (90+)';
    if (score >= 85) return 'Excellent (85-89)';
    if (score >= 80) return 'Very Good (80-84)';
    return 'Commercial / Below Specialty';
  }

  async share() {
    if (!this.session) return;

    const shareData = {
      title: 'Coffee Cupping Result: ' + this.session.beanName,
      text: `Just cupped ${this.session.beanName} from ${this.session.roastery}. Final Score: ${this.session.finalScore.toFixed(2)}/100. Cupped by ${this.session.cupperName || 'Anonymous'}.`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) {
        console.error('Share failed', e);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareData.text} Check it out here: ${shareData.url}`);
        alert('Results copied to clipboard!');
      } catch (e) {
        console.error('Clipboard failed', e);
      }
    }
  }

  getBuyUrl(): string | null {
    return this.session?.buyLink || this.team?.shopUrl || null;
  }

  ngOnDestroy() {
    this.seo.clearJsonLd();
    if (this.sensoryChart) {
      this.sensoryChart.destroy();
    }
  }
}
