import { Component, OnInit, inject, PLATFORM_ID, AfterViewInit, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { CuppingService } from '../../services/cupping.service';
import { TranslationService } from '../../services/translation.service';
import { CuppingSession } from '../../models/cupping.model';
import html2canvas from 'html2canvas';
import { Chart, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

@Component({
  selector: 'app-cupping-result',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="result-container animate-fade" *ngIf="session">
      <div class="glass-card result-card" id="result-card" [class.radiant-theme]="selectedTheme() === 'radiant'">
        <header class="result-header">
          <div class="badge">{{ session.type }}</div>
          <h1 class="brand-font">{{ session.beanName }}</h1>
          <p class="roastery">{{ session.roastery }}</p>
        </header>

        <section class="score-display">
          <div class="score-circle">
            <span class="label">{{ t('FINAL_SCORE') }}</span>
            <span class="value">{{ session.finalScore | number:'1.2-2' }}</span>
          </div>
          <div class="rating-label" [class.specialty]="session.finalScore >= 80" [class.specialty-pulse]="session.finalScore >= 80">
            {{ getRating(session.finalScore) }}
          </div>

          <div class="social-actions" *ngIf="session.id">
            <button class="social-btn like-btn" (click)="onLike()" [disabled]="hasLiked">
              <span class="icon">{{ hasLiked ? '❤️' : '🤍' }}</span>
              <span class="count">{{ session.likesCount || 0 }}</span>
            </button>
            <button class="social-btn save-btn" (click)="onSave()" [disabled]="hasSaved">
              <span class="icon">{{ hasSaved ? '🔖' : '🔖' }}</span>
              <span>{{ hasSaved ? 'Saved' : t('BTN_SAVE_LIST') }}</span>
            </button>
          </div>
        </section>

        <section class="metadata-grid">
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
            <span class="meta-value">{{ session.cupperName || 'Anonymous' }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Date</span>
            <span class="meta-value">{{ session.productionDate | date }}</span>
          </div>
        </section>

        <section class="chart-section">
           <div class="chart-wrapper">
              <canvas id="sensoryChart"></canvas>
           </div>
        </section>

        <section class="cva-result-section">
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
                     <div class="int-track"><div class="int-fill glow-perunggu" [style.width.%]="(session.intensities?.acidity || 0) * 10"></div></div>
                  </div>
                  <div class="int-bar-item">
                     <label>{{ t('BODY') }}</label>
                     <div class="int-track"><div class="int-fill glow-perunggu" [style.width.%]="(session.intensities?.body || 0) * 10"></div></div>
                  </div>
                  <div class="int-bar-item">
                     <label>{{ t('SWEETNESS') }}</label>
                     <div class="int-track"><div class="int-fill glow-perunggu" [style.width.%]="(session.intensities?.sweetness || 0) * 10"></div></div>
                  </div>
              </div>
           </div>
        </section>

        <section class="sensory-summary">
           <span class="section-label">{{ t('QUALITY_TITLE') }}</span>
           <div class="sensory-bars">
              <div class="bar-item" *ngFor="let item of sensoryItems">
                 <div class="bar-header">
                    <span>{{ item.label }}</span>
                    <span>{{ item.value }}</span>
                 </div>
                 <div class="bar-bg">
                    <div class="bar-fill" [style.width.%]="(item.value - 6) * 25"></div>
                 </div>
              </div>
           </div>
        </section>

        <footer class="actions">
          <div class="template-selector">
             <span>Template:</span>
             <button (click)="setTheme('obsidian')" [class.active]="selectedTheme() === 'obsidian'">Obsidian</button>
             <button (click)="setTheme('radiant')" [class.active]="selectedTheme() === 'radiant'">Radiant</button>
          </div>
          <div class="share-options" *ngIf="session.isPublic">
             <span class="share-hint">Sharing technical assessment to {{ t('NAV_COMMUNITY') }}</span>
          </div>
          <button class="btn-primary share-btn" (click)="share()">
            <span class="icon">Share Graphic</span>
          </button>
          <a routerLink="/" class="back-link">{{ t('NAV_HOME') }}</a>
        </footer>
      </div>
    </div>

    <div class="loading-state" *ngIf="!session && !error">
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
    }
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
      font-family: 'Playfair Display', serif;
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
      margin: 60px 0;
      background: rgba(0,0,0,0.2);
      padding: 40px;
      border-radius: var(--radius-lg);
      border: 1px solid var(--glass-border);
    }
    .chart-wrapper {
      position: relative;
      height: 400px;
      width: 100%;
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
      gap: 25px;
      margin-top: 60px;
    }
    .share-btn {
      height: 70px;
      font-size: 1.2rem;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
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
  `]
})
export class CuppingResultComponent implements OnInit, AfterViewInit {
  private route = inject(ActivatedRoute);
  private cuppingService = inject(CuppingService);
  private meta = inject(Meta);
  private title = inject(Title);
  private platformId = inject(PLATFORM_ID);
  private ts = inject(TranslationService);
  t = this.ts.t();
  
  session: CuppingSession | null = null;
  error = false;
  sensoryItems: any[] = [];
  generatingScreenshot = false;
  hasLiked = false;
  hasSaved = false;
  selectedTheme = signal<'obsidian' | 'radiant'>('obsidian');

  setTheme(theme: 'obsidian' | 'radiant') {
    this.selectedTheme.set(theme);
    // Re-initialize chart to match theme colors if needed (optional)
  }

  private getDeviceId() {
    if (isPlatformBrowser(this.platformId)) {
      let id = localStorage.getItem('device_id');
      if (!id) {
        id = Math.random().toString(36).substring(7);
        localStorage.setItem('device_id', id);
      }
      return id;
    }
    return 'ssr-bot';
  }

  async onLike() {
    if (!this.session?.id || this.hasLiked) return;
    try {
      await this.cuppingService.likeSession(this.session.id);
      this.hasLiked = true;
      if (this.session) this.session.likesCount = (this.session.likesCount || 0) + 1;
      localStorage.setItem(`liked_${this.session.id}`, 'true');
    } catch (e) {
      console.error(e);
    }
  }

  async onSave() {
    if (!this.session?.id || this.hasSaved) return;
    try {
      const deviceId = this.getDeviceId();
      await this.cuppingService.saveSession(this.session.id, deviceId);
      this.hasSaved = true;
      localStorage.setItem(`saved_${this.session.id}`, 'true');
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

  async loadSession(id: string) {
    try {
      const data = await this.cuppingService.getCuppingById(id);
      if (data) {
        this.session = data;
        this.prepareSensoryItems();
        this.updateMetaTags();
        if (isPlatformBrowser(this.platformId)) {
          this.hasLiked = localStorage.getItem(`liked_${id}`) === 'true';
          this.hasSaved = localStorage.getItem(`saved_${id}`) === 'true';
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
    const ctx = document.getElementById('sensoryChart') as HTMLCanvasElement;
    if (!ctx) return;

    const scores = this.session.scores;
    const labels = [
      'Aroma', 'Flavor', 'Aftertaste', 'Acidity', 
      'Body', 'Balance', 'Overall'
    ];
    const data = [
      scores.fragranceAroma, scores.flavor, scores.aftertaste, scores.acidity,
      scores.body, scores.balance, scores.overall
    ];

    new Chart(ctx, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Quality Score',
          data: data,
          fill: true,
          backgroundColor: 'rgba(189, 142, 98, 0.15)',
          borderColor: '#BD8E62',
          pointBackgroundColor: '#E5BC7D',
          pointBorderColor: '#0c0c0e',
          pointHoverBackgroundColor: '#0c0c0e',
          pointHoverBorderColor: '#E5BC7D',
          borderWidth: 4,
          tension: 0.2
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
              color: '#8e8e93',
              font: {
                size: 12,
                weight: 'bold',
                family: "'Outfit', sans-serif"
              }
            },
            ticks: {
              display: false,
              stepSize: 1
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  async checkAndGenerateScreenshot() {
    if (!this.session || this.session.shareImageUrl || this.generatingScreenshot) return;

    this.generatingScreenshot = true;
    try {
      const element = document.getElementById('result-card');
      if (!element) return;

      const canvas = await html2canvas(element, {
        backgroundColor: '#0c0c0e',
        scale: 2,
        useCORS: true,
        logging: false
      });

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (blob && this.session.id) {
        const url = await this.cuppingService.uploadShareImage(this.session.id, blob);
        await this.cuppingService.updateCupping(this.session.id, { shareImageUrl: url });
        this.session.shareImageUrl = url;
        this.updateMetaTags();
      }
    } catch (e) {
      console.error('Screenshot generation failed', e);
    } finally {
      this.generatingScreenshot = false;
    }
  }

  updateMetaTags() {
    if (!this.session) return;

    const pageTitle = `Cupping Result: ${this.session.beanName} - CaffeeScore`;
    const description = `Score: ${this.session.finalScore.toFixed(2)} | ${this.session.roastery} | ${this.session.type}`;
    
    this.title.setTitle(pageTitle);

    const tags = [
      { name: 'description', content: description },
      { property: 'og:title', content: pageTitle },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'article' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: pageTitle },
      { name: 'twitter:description', content: description }
    ];

    if (isPlatformBrowser(this.platformId)) {
       tags.push({ property: 'og:url', content: window.location.href });
    }

    if (this.session.shareImageUrl) {
      tags.push({ property: 'og:image', content: this.session.shareImageUrl });
      tags.push({ name: 'twitter:image', content: this.session.shareImageUrl });
    }

    (tags as any[]).forEach(tag => this.meta.updateTag(tag));
  }

  prepareSensoryItems() {
    if (!this.session) return;
    const scores = this.session.scores;
    this.sensoryItems = [
      { label: 'Aroma', value: scores.fragranceAroma },
      { label: 'Flavor', value: scores.flavor },
      { label: 'Aftertaste', value: scores.aftertaste },
      { label: 'Acidity', value: scores.acidity },
      { label: 'Body', value: scores.body },
      { label: 'Balance', value: scores.balance }
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
}
