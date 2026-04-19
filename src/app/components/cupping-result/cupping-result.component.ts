import { Component, OnInit, inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { CuppingService } from '../../services/cupping.service';
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
      <div class="glass-card result-card" id="result-card">
        <header class="result-header">
          <div class="badge">{{ session.type }}</div>
          <h1 class="brand-font">{{ session.beanName }}</h1>
          <p class="roastery">{{ session.roastery }}</p>
        </header>

        <section class="score-display">
          <div class="score-circle">
            <span class="label">Final Score</span>
            <span class="value">{{ session.finalScore | number:'1.2-2' }}</span>
          </div>
          <div class="rating-label" [class.specialty]="session.finalScore >= 80">
            {{ getRating(session.finalScore) }}
          </div>
        </section>

        <section class="metadata-grid">
          <div class="meta-item">
            <span class="meta-label">Pasca Panen</span>
            <span class="meta-value">{{ session.postHarvest }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Metode Seduh</span>
            <span class="meta-value">{{ session.brewMethod }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Penguji</span>
            <span class="meta-value">{{ session.cupperName || 'Anonymous' }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Tanggal</span>
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
              <span class="section-label">Flavor Profile</span>
              <div class="result-chips">
                 <span class="result-chip" *ngFor="let note of session.flavorNotes">{{ note }}</span>
              </div>
           </div>

           <div class="intensity-viz">
              <span class="section-label">Intensity Profile</span>
              <div class="intensity-bars-row">
                 <div class="int-bar-item">
                    <label>Acidity</label>
                    <div class="int-track"><div class="int-fill" [style.width.%]="session.intensities.acidity * 10"></div></div>
                 </div>
                 <div class="int-bar-item">
                    <label>Body</label>
                    <div class="int-track"><div class="int-fill" [style.width.%]="session.intensities.body * 10"></div></div>
                 </div>
                 <div class="int-bar-item">
                    <label>Sweetness</label>
                    <div class="int-track"><div class="int-fill" [style.width.%]="session.intensities.sweetness * 10"></div></div>
                 </div>
              </div>
           </div>
        </section>

        <section class="sensory-summary">
           <span class="section-label">Affective Assessment (Quality)</span>
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
          <button class="btn-primary share-btn" (click)="share()">
            <span class="icon">Share Results</span>
          </button>
          <a routerLink="/" class="back-link">Back to Dashboard</a>
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
      margin: calc(var(--spacing-unit) * 5) auto;
      padding: 0 calc(var(--spacing-unit) * 3);
      padding-bottom: 120px;
    }
    .header {
      text-align: center;
      margin-bottom: calc(var(--spacing-unit) * 6);
    }
    .total-score-box {
      margin: calc(var(--spacing-unit) * 4) 0;
    }
    .total-score {
      font-size: 5rem;
      font-weight: 900;
      color: var(--primary-color);
      font-family: 'Playfair Display', serif;
      line-height: 1;
    }
    .score-label {
      text-transform: uppercase;
      letter-spacing: 4px;
      font-size: 0.8rem;
      color: var(--text-dim);
      font-weight: 700;
    }
    .chart-box {
      background: var(--surface-color);
      padding: calc(var(--spacing-unit) * 4);
      border-radius: var(--radius-lg);
      margin-bottom: calc(var(--spacing-unit) * 4);
      border: 1px solid var(--glass-border);
      height: 450px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05);
    }
    .cva-profiles {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: calc(var(--spacing-unit) * 3);
      margin-top: calc(var(--spacing-unit) * 4);
    }
    .intensity-card {
      background: var(--surface-color);
      padding: calc(var(--spacing-unit) * 3);
      border-radius: var(--radius-md);
      border: 1px solid var(--glass-border);
    }
    .intensity-card h4 {
      font-size: 0.8rem;
      text-transform: uppercase;
      color: var(--text-dim);
      margin-bottom: calc(var(--spacing-unit) * 1.5);
      letter-spacing: 1px;
    }
    .intensity-bar-track {
      height: 8px;
      background: var(--surface-hover);
      border-radius: 4px;
      overflow: hidden;
    }
    .intensity-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--primary-color), var(--secondary-accent));
      border-radius: 4px;
    }
    .notes-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: calc(var(--spacing-unit) * 3);
    }
    .note-chip {
      background: var(--surface-hover);
      color: var(--text-main);
      padding: 8px 18px;
      border-radius: 100px;
      font-size: 0.85rem;
      font-weight: 600;
      border: 1px solid var(--glass-border);
    }
    .share-overlay {
      position: fixed;
      inset: 0;
      background: rgba(18, 18, 18, 0.98);
      z-index: 2000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      backdrop-filter: blur(10px);
    }
    .share-preview-card {
      background: var(--surface-color);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: 0 30px 60px -12px rgba(0,0,0,0.5);
      border: 1px solid var(--glass-border);
      max-width: 500px;
      width: 100%;
    }
    .share-actions {
      margin-top: calc(var(--spacing-unit) * 5);
      display: flex;
      gap: calc(var(--spacing-unit) * 2);
    }
    .btn-premium {
      background: var(--primary-color);
      color: white;
      padding: 16px 32px;
      border-radius: 100px;
      font-weight: 700;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: all 0.3s;
      box-shadow: 0 15px 30px -5px var(--primary-glow);
    }
    .btn-premium:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px -8px var(--primary-glow);
    }
    .btn-outline {
      background: transparent;
      border: 2px solid var(--glass-border);
      color: var(--text-dim);
      padding: 16px 32px;
      border-radius: 100px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s;
    }
    .btn-outline:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }

    @media (max-width: 600px) {
      .total-score { font-size: 4rem; }
      .chart-box { height: 350px; }
    }
    .result-card {
      text-align: center;
      padding: 40px;
      position: relative;
      overflow: hidden;
    }
    .badge {
      display: inline-block;
      background: var(--primary-color);
      color: var(--bg-color);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.7rem;
      font-weight: 800;
      text-transform: uppercase;
      margin-bottom: 15px;
    }
    .roastery {
      color: var(--text-dim);
      font-size: 1.1rem;
      margin-top: 5px;
    }
    .score-display {
      margin: 40px 0;
    }
    .score-circle {
      width: 180px;
      height: 180px;
      margin: 0 auto;
      border: 4px solid var(--primary-color);
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      box-shadow: 0 0 40px var(--primary-glow);
    }
    .score-circle .label {
      font-size: 0.8rem;
      text-transform: uppercase;
      color: var(--text-dim);
    }
    .score-circle .value {
      font-size: 3.5rem;
      font-weight: 800;
      color: var(--primary-color);
      font-family: 'Playfair Display', serif;
    }
    .rating-label {
      margin-top: 15px;
      font-weight: 700;
      font-size: 1.2rem;
      color: var(--text-dim);
    }
    .rating-label.specialty {
      color: var(--success);
    }
    .metadata-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 40px 0;
      text-align: left;
    }
    .meta-label {
      display: block;
      font-size: 0.7rem;
      color: var(--text-dim);
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .meta-value {
      font-weight: 600;
      font-size: 1rem;
    }
    .section-label {
      display: block;
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--primary-color);
      margin-bottom: 15px;
    }
    .cva-result-section {
      margin: 40px 0;
      text-align: left;
      display: flex;
      flex-direction: column;
      gap: 30px;
    }
    .result-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .result-chip {
      background: rgba(255, 158, 12, 0.1);
      border: 1px solid rgba(255, 158, 12, 0.3);
      color: var(--primary-color);
      padding: 4px 12px;
      border-radius: 100px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .intensity-bars-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
    }
    .int-bar-item label {
      display: block;
      font-size: 0.7rem;
      color: var(--text-dim);
      margin-bottom: 8px;
    }
    .int-track {
      height: 4px;
      background: rgba(255,255,255,0.05);
      border-radius: 2px;
    }
    .int-fill {
      height: 100%;
      background: var(--primary-color);
      border-radius: 2px;
    }
    .chart-section {
      margin: 40px 0;
      background: rgba(255,255,255,0.02);
      padding: 20px;
      border-radius: 20px;
      border: 1px solid var(--glass-border);
    }
    .chart-wrapper {
      position: relative;
      height: 300px;
      width: 100%;
    }
    .sensory-summary {
      text-align: left;
      margin: 40px 0;
    }
    .sensory-bars {
      display: grid;
      gap: 15px;
    }
    .bar-header {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      margin-bottom: 6px;
    }
    .bar-bg {
      height: 4px;
      background: rgba(255,255,255,0.05);
      border-radius: 2px;
    }
    .bar-fill {
      height: 100%;
      background: var(--primary-color);
      box-shadow: 0 0 10px var(--primary-glow);
      border-radius: 2px;
      transition: width 1s ease-out;
    }
    .actions {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-top: 40px;
    }
    .share-btn {
      height: 55px;
      font-size: 1.1rem;
    }
    .back-link {
      color: var(--text-dim);
      text-decoration: none;
      font-size: 0.9rem;
    }
    .back-link:hover {
      color: var(--primary-color);
    }
    .loading-state, .error-state {
      text-align: center;
      margin-top: 100px;
    }
  `]
})
export class CuppingResultComponent implements OnInit, AfterViewInit {
  private route = inject(ActivatedRoute);
  private cuppingService = inject(CuppingService);
  private meta = inject(Meta);
  private title = inject(Title);
  private platformId = inject(PLATFORM_ID);
  
  session: CuppingSession | null = null;
  error = false;
  sensoryItems: any[] = [];
  generatingScreenshot = false;

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
          backgroundColor: 'rgba(243, 156, 18, 0.2)',
          borderColor: '#F39C12',
          pointBackgroundColor: '#F39C12',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#F39C12',
          borderWidth: 4,
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            suggestedMin: 6,
            suggestedMax: 10,
            pointLabels: {
              color: '#fcefee',
              font: {
                size: 13,
                weight: 'bold',
                family: "'Inter', sans-serif"
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
        backgroundColor: '#121212',
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
