import { Component, inject } from '@angular/core';
import * as Tesseract from 'tesseract.js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CuppingService } from '../../services/cupping.service';
import { CuppingSession, SensoryScores } from '../../models/cupping.model';

@Component({
  selector: 'app-cupping-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="guide-container animate-fade" *ngIf="showGuide">
      <div class="glass-card guide-card">
        <h2 class="brand-font" style="margin-bottom: 10px; color: var(--primary-color); font-size: 2.2rem;">SCA Cupping Protocol</h2>
        <p class="guide-desc">Pastikan panel dan instrumen telah disiapkan sesuai dengan standar resmi Specialty Coffee Association (SCA).</p>
        
        <div class="guide-grid">
          <div class="guide-step">
            <div class="step-icon">⚖️</div>
            <div class="step-text">
              <h4>Golden Ratio</h4>
              <p>8.25 gram kopi untuk 150 ml air</p>
            </div>
          </div>
          <div class="guide-step">
            <div class="step-icon">🌡️</div>
            <div class="step-text">
              <h4>Suhu Air Tepat</h4>
              <p>92.2 - 94.4°C (Sekitar 200°F)</p>
            </div>
          </div>
          <div class="guide-step">
            <div class="step-icon">⏱️</div>
            <div class="step-text">
              <h4>Waktu Infusi</h4>
              <p>Tunggu tepat 4 menit sebelum <i>Break</i></p>
            </div>
          </div>
          <div class="guide-step">
            <div class="step-icon">🫘</div>
            <div class="step-text">
              <h4>Roast & Grind</h4>
              <p>Light/Medium, giling max 15 menit sebelum seduh</p>
            </div>
          </div>
        </div>

        <button type="button" class="btn-primary w-full btn-start" (click)="showGuide = false">
          Saya Telah Siap, Mulai Sesi Cupping
        </button>
      </div>
    </div>

    <div class="form-container animate-fade" *ngIf="!showGuide">
      <div class="glass-card">
        <h2 class="brand-font">New Cupping Session</h2>
        
        <form #cuppingForm="ngForm" (ngSubmit)="cuppingForm.valid && submit()">
          <section class="basic-info">
            <div class="ocr-section animate-fade">
              <input type="file" #fileInput accept="image/*" capture="environment" style="display: none" (change)="processImage($event)">
              <button type="button" class="btn-secondary w-full" (click)="fileInput.click()" [disabled]="isScanning" style="margin-top: 0; margin-bottom: 25px; display: flex; justify-content: center; align-items: center; gap: 12px; padding: 14px; background: rgba(255,255,255,0.03); border: 1px dashed var(--glass-border); color: var(--primary-color);">
                <span style="font-size: 1.4rem;">📷</span>
                <span *ngIf="!isScanning" style="font-size: 0.95rem; font-weight: 500;">Pindai Stiker Kemasan (AI Autofill)</span>
                <span *ngIf="isScanning" style="font-size: 0.95rem; font-weight: 500;">{{ scannerStatus }}</span>
              </button>
            </div>
            <div class="input-group">
              <label>Bean Name <span class="required">*</span></label>
              <input [(ngModel)]="session.beanName" name="beanName" #beanName="ngModel" placeholder="e.g. Ethiopia Yirgacheffe" required>
              <span class="error-text" *ngIf="beanName.invalid && beanName.touched">Bean name is required</span>
            </div>
            <div class="input-group">
              <label>Type</label>
              <select [(ngModel)]="session.type" name="type">
                <option value="Arabica">Arabica</option>
                <option value="Robusta">Robusta</option>
                <option value="Liberica">Liberica</option>
                <option value="Excelsa">Excelsa</option>
              </select>
            </div>
            <div class="input-group">
              <label>Roastery <span class="required">*</span></label>
              <input [(ngModel)]="session.roastery" name="roastery" #roastery="ngModel" placeholder="e.g. Blue Bottle" required>
              <span class="error-text" *ngIf="roastery.invalid && roastery.touched">Roastery is required</span>
            </div>
            <div class="input-group">
              <label>Pasca Panen</label>
              <select [(ngModel)]="session.postHarvest" name="postHarvest">
                <option value="Wash">Wash</option>
                <option value="Natural">Natural</option>
                <option value="Honey">Honey</option>
                <option value="Anaerobic">Anaerobic</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="input-group">
              <label>Metode Seduh</label>
              <select [(ngModel)]="session.brewMethod" name="brewMethod">
                <option value="Cupping Protocol">Cupping Protocol</option>
                <option value="V60">V60</option>
                <option value="Aeropress">Aeropress</option>
                <option value="French Press">French Press</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="input-group">
              <label>Nama Penguji</label>
              <input [(ngModel)]="session.cupperName" name="cupperName" placeholder="e.g. John Doe">
            </div>
          </section>

          <section class="cva-section">
            <h2 class="section-badge">Descriptive Assessment (Intensity)</h2>
            <div class="intensity-grid">
               <div class="intensity-item">
                  <div class="intensity-header">
                     <label>Acidity Intensity</label>
                     <span>{{ session.intensities.acidity }}</span>
                  </div>
                  <input type="range" min="1" max="10" step="1" [(ngModel)]="session.intensities.acidity" name="int-acidity">
                  <div class="range-labels"><span>Low</span><span>High</span></div>
               </div>
               <div class="intensity-item">
                  <div class="intensity-header">
                     <label>Body Intensity</label>
                     <span>{{ session.intensities.body }}</span>
                  </div>
                  <input type="range" min="1" max="10" step="1" [(ngModel)]="session.intensities.body" name="int-body">
                  <div class="range-labels"><span>Low</span><span>High</span></div>
               </div>
               <div class="intensity-item">
                  <div class="intensity-header">
                     <label>Sweetness Intensity</label>
                     <span>{{ session.intensities.sweetness }}</span>
                  </div>
                  <input type="range" min="1" max="10" step="1" [(ngModel)]="session.intensities.sweetness" name="int-sweetness">
                  <div class="range-labels"><span>Low</span><span>High</span></div>
               </div>
            </div>
          </section>

          <section class="cva-section">
            <h2 class="section-badge">Flavor Profile (SCA Wheel)</h2>
            <div class="flavor-chips">
               <button type="button" 
                  *ngFor="let cat of flavorCategories" 
                  class="chip" 
                  [class.active]="isFlavorSelected(cat)"
                  (click)="toggleFlavor(cat)">
                  {{ cat }}
               </button>
            </div>
          </section>

          <section class="scoring-section">
            <div class="section-title-row">
              <h2 class="section-badge">Affective Assessment (Quality)</h2>
              <span class="range-info">6.0 - 10.0</span>
            </div>
            <div class="scores-grid">
              <div class="score-card" *ngFor="let key of scoreKeys">
                <div class="score-header">
                  <label>{{ formatLabel(key) }}</label>
                  <span class="value">{{ session.scores[key] | number:'1.2-2' }}</span>
                </div>
                <div class="slider-row">
                  <button type="button" class="btn-step" (click)="stepScore(key, -0.25)">-</button>
                  <input type="range" min="6" max="10" step="0.25" [(ngModel)]="session.scores[key]" [name]="key" (input)="updateTotal()">
                  <button type="button" class="btn-step" (click)="stepScore(key, 0.25)">+</button>
                </div>
              </div>
            </div>
          </section>

          <section class="defects-section">
             <div class="input-group">
                <label>Defects (Negative Points)</label>
                <div class="defect-input">
                  <input type="number" [(ngModel)]="session.defects" name="defects" (input)="updateTotal()" min="0" step="1">
                  <span class="defect-hint">Points to subtract from total</span>
                </div>
             </div>
          </section>

          <div class="final-score-bar" [class.specialty]="session.finalScore >= 80">
            <div class="score-label">
              <span>Total Cupping Score</span>
              <small *ngIf="session.finalScore >= 80">Specialty Grade</small>
            </div>
            <span class="final-value">{{ session.finalScore | number:'1.2-2' }}</span>
          </div>

          <button type="submit" class="btn-primary w-full" [disabled]="loading || cuppingForm.invalid">
            <span *ngIf="!loading">{{ cuppingForm.invalid ? 'Fill required fields' : 'Save & Publish Score' }}</span>
            <span *ngIf="loading">Publishing...</span>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .guide-container {
      max-width: 700px;
      margin: calc(var(--spacing-unit) * 8) auto;
      padding: 0 calc(var(--spacing-unit) * 3);
      text-align: center;
    }
    .guide-desc {
      color: var(--text-dim);
      margin-bottom: 40px;
      line-height: 1.6;
      font-size: 1.05rem;
    }
    .guide-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      text-align: left;
      margin-bottom: 40px;
    }
    .guide-step {
      background: var(--surface-hover);
      padding: 20px;
      border-radius: var(--radius-md);
      display: flex;
      gap: 15px;
      align-items: center;
      border: 1px solid var(--glass-border);
      transition: transform 0.3s;
    }
    .guide-step:hover {
      transform: translateY(-4px);
      border-color: var(--primary-color);
    }
    .step-icon {
      font-size: 1.8rem;
      background: var(--surface-color);
      width: 55px;
      height: 55px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 14px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.15);
      flex-shrink: 0;
    }
    .step-text h4 {
      color: var(--primary-color);
      margin-bottom: 4px;
      font-size: 0.95rem;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .step-text p {
      color: var(--text-main);
      font-size: 0.85rem;
      opacity: 0.9;
    }
    .btn-start {
      padding: 18px;
      font-size: 1.15rem;
      border-radius: 100px;
      letter-spacing: 1px;
      text-transform: uppercase;
      box-shadow: 0 10px 30px -10px var(--primary-glow);
    }
    @media (max-width: 600px) {
      .guide-grid { grid-template-columns: 1fr; }
    }
    .form-container {
      max-width: 800px;
      margin: calc(var(--spacing-unit) * 5) auto;
      padding: 0 calc(var(--spacing-unit) * 3);
    }
    .basic-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: calc(var(--spacing-unit) * 3);
      margin: calc(var(--spacing-unit) * 3) 0;
    }
    .input-group {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-unit);
    }
    .section-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: calc(var(--spacing-unit) * 3);
    }
    .range-info {
      font-size: 0.75rem;
      color: var(--text-dim);
      background: var(--surface-hover);
      padding: 4px 12px;
      border-radius: 6px;
      font-weight: 600;
    }
    .score-card {
      background: var(--surface-color);
      padding: calc(var(--spacing-unit) * 2.5);
      border-radius: var(--radius-md);
      border: 1px solid var(--glass-border);
      box-shadow: 0 4px 15px rgba(0,0,0,0.02);
    }
    .score-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-unit);
    }
    .btn-step {
      background: var(--surface-hover);
      border: 1px solid var(--glass-border);
      color: var(--text-main);
      width: 44px;
      height: 44px;
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .btn-step:hover {
      background: var(--primary-color);
      color: white;
      transform: scale(1.1);
    }
    .score-label small {
      font-size: 0.7rem;
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    input, select, textarea {
      background: var(--surface-color);
      border: 1px solid var(--glass-border);
      color: var(--text-main);
      padding: 14px;
      border-radius: 12px;
      font-size: 1rem;
    }
    input:focus {
      border-color: var(--primary-color);
      outline: none;
      box-shadow: 0 0 0 4px var(--primary-glow);
    }
    .section-badge {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: white;
      background: var(--primary-color);
      padding: 6px 18px;
      border-radius: 6px;
      margin-bottom: calc(var(--spacing-unit) * 4);
    }
    .cva-section {
      margin-top: calc(var(--spacing-unit) * 6);
      padding-top: calc(var(--spacing-unit) * 4);
      border-top: 1px solid var(--glass-border);
    }
    .intensity-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: calc(var(--spacing-unit) * 4);
    }
    .intensity-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: calc(var(--spacing-unit) * 2);
    }
    .flavor-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .chip {
      background: var(--surface-color);
      border: 1px solid var(--glass-border);
      color: var(--text-main);
      padding: 10px 20px;
      min-height: 44px;
      border-radius: 100px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    }
    .chip.active {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
      box-shadow: 0 8px 20px -5px var(--primary-glow);
    }
    .scoring-section {
      background: linear-gradient(135deg, var(--surface-hover), var(--surface-color)) !important;
      color: var(--text-main) !important;
      padding: calc(var(--spacing-unit) * 4);
      border-radius: var(--radius-lg);
      border: 1px solid var(--primary-glow);
    }
    .score-card {
      background: var(--surface-color);
      color: var(--text-main);
      padding: calc(var(--spacing-unit) * 2.5);
      border-radius: var(--radius-md);
      border: 1px solid var(--glass-border);
      box-shadow: 0 4px 15px rgba(0,0,0,0.02);
    }
    
    /* Custom Range Slider Styling */
    input[type=range] {
      -webkit-appearance: none;
      width: 100%;
      background: transparent;
      padding: 0;
      border: none;
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 20px;
      width: 20px;
      border-radius: 50%;
      background: var(--primary-color);
      cursor: pointer;
      margin-top: -6px;
      box-shadow: 0 2px 5px rgba(169, 50, 38, 0.4);
    }
    input[type=range]::-webkit-slider-runnable-track {
      width: 100%;
      height: 8px;
      cursor: pointer;
      background: var(--surface-hover);
      border-radius: 4px;
      border: 1px solid var(--glass-border);
    }
    input[type=range]:focus {
      outline: none;
      box-shadow: none;
    }
    input[type=range]:focus::-webkit-slider-thumb {
      box-shadow: 0 0 0 4px var(--primary-glow);
    }

    .specialty {
      background: linear-gradient(90deg, var(--primary-color), var(--success)) !important;
      color: white !important;
    }
    .specialty .final-value {
      color: white !important;
    }
    .w-full {
      width: 100%;
      height: 60px;
      font-size: 1.1rem;
      margin-top: 20px;
    }
    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      filter: grayscale(1);
    }
  `]
})
export class CuppingFormComponent {
  private cuppingService = inject(CuppingService);
  private router = inject(Router);

  showGuide = true;
  loading = false;
  isScanning = false;
  scannerStatus = '';

  async processImage(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    this.isScanning = true;
    this.scannerStatus = 'Memuat Engine AI...';
    const file = input.files[0];

    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            this.scannerStatus = `Memindai Label... ${Math.round(m.progress * 100)}%`;
          } else if (m.status.includes('loading')) {
            this.scannerStatus = 'Mempersiapkan Model Neural (Offline)';
          }
        }
      });
      
      const text = result.data.text.toLowerCase();
      this.scannerStatus = 'Sinkronisasi Data...';
      
      // Heuristic parsing
      const lines = result.data.text.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 2);
      
      if (lines.length > 0) {
        if (!this.session.beanName) {
           this.session.beanName = lines[0];
        }
      }

      if (text.includes('arabica')) this.session.type = 'Arabica';
      else if (text.includes('robusta')) this.session.type = 'Robusta';
      else if (text.includes('liberica')) this.session.type = 'Liberica';

      if (text.includes('wash') || text.includes('washed')) this.session.postHarvest = 'Wash';
      else if (text.includes('natural') || text.includes('dry')) this.session.postHarvest = 'Natural';
      else if (text.includes('honey')) this.session.postHarvest = 'Honey';
      else if (text.includes('anaerobic')) this.session.postHarvest = 'Anaerobic';
      
      const origins = ['ethiopia', 'colombia', 'brazil', 'indonesia', 'kenya', 'rwanda', 'panama', 'costa rica', 'sumatra', 'jawa', 'gayo'];
      for (const origin of origins) {
        if (text.includes(origin)) {
          this.session.origin = origin.charAt(0).toUpperCase() + origin.slice(1);
          break;
        }
      }

    } catch (err) {
      console.error('OCR Error:', err);
      alert('Gagal mendeteksi teks. Pastikan gambar stiker jelas dan terang.');
    } finally {
      this.isScanning = false;
      this.scannerStatus = '';
      input.value = '';
    }
  }

  scoreKeys: (keyof SensoryScores)[] = [
    'fragranceAroma', 'flavor', 'aftertaste', 'acidity', 
    'body', 'balance', 'uniformity', 'cleanCup', 'sweetness', 'overall'
  ];

  session: CuppingSession = {
    beanName: '',
    type: 'Arabica',
    roastery: '',
    productionDate: new Date().toISOString().split('T')[0],
    postHarvest: 'Wash',
    brewMethod: 'Cupping Protocol',
    cupperName: '',
    intensities: {
      acidity: 5,
      body: 5,
      sweetness: 5
    },
    flavorNotes: [],
    scores: {
      fragranceAroma: 8,
      flavor: 8,
      aftertaste: 8,
      acidity: 8,
      body: 8,
      balance: 8,
      uniformity: 10,
      cleanCup: 10,
      sweetness: 10,
      overall: 8
    },
    defects: 0,
    finalScore: 80,
    timestamp: null
  };

  flavorCategories = [
    'Floral', 'Fruity', 'Sour/Fermented', 'Green/Vegetative', 
    'Roasted', 'Spices', 'Nutty/Cocoa', 'Sweet', 'Other'
  ];

  toggleFlavor(category: string) {
    const index = this.session.flavorNotes.indexOf(category);
    if (index > -1) {
      this.session.flavorNotes.splice(index, 1);
    } else {
      this.session.flavorNotes.push(category);
    }
  }

  isFlavorSelected(category: string) {
    return this.session.flavorNotes.includes(category);
  }

  stepScore(key: keyof SensoryScores, delta: number) {
    const newVal = this.session.scores[key] + delta;
    if (newVal >= 6 && newVal <= 10) {
      this.session.scores[key] = newVal;
      this.updateTotal();
    }
  }

  updateTotal() {
    const sum = Object.values(this.session.scores).reduce((a, b) => a + b, 0);
    this.session.finalScore = sum - this.session.defects;
  }

  formatLabel(key: string) {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  async submit() {
    this.loading = true;
    try {
      const docRef = await this.cuppingService.addCupping(this.session);
      this.router.navigate(['/result', docRef.id]);
    } catch (e) {
      console.error(e);
      alert('Error saving cupping session');
    } finally {
      this.loading = false;
    }
  }
}
