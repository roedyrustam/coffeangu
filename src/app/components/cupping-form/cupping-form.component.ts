import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CuppingService } from '../../services/cupping.service';
import { CuppingSession, SensoryScores } from '../../models/cupping.model';
import { DynamicFlavorWheelComponent } from '../flavor-wheel/flavor-wheel.component';
import { MembershipService } from '../../services/membership.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { CoffeeIdentityComponent } from './coffee-identity.component';
import { SensoryScoresComponent } from './sensory-scores.component';
import { ToastService } from '../../services/toast.service';
import { SensoryAiService } from '../../services/sensory-ai.service';

@Component({
  selector: 'app-cupping-form',
  standalone: true,
  imports: [CommonModule, FormsModule, DynamicFlavorWheelComponent, CoffeeIdentityComponent, SensoryScoresComponent],
  template: `
    <div class="guide-container animate-fade" *ngIf="showGuide">
      <div class="glass-card guide-card luminescent-border">
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
      <header class="form-header immersive">
        <div class="header-visual">
          <img src="/assets/hero-cupping.png" alt="Form Hero" class="header-image">
          <div class="header-overlay"></div>
        </div>
        <div class="header-content">
          <h2 class="brand-font">New Cupping Session</h2>
          <p class="header-sub">SCA Value Assessment Protocol</p>
        </div>
      </header>

      <form #cuppingForm="ngForm" (ngSubmit)="cuppingForm.valid && submit()" class="modern-form">
        <div class="form-sections-container">
          
          <app-coffee-identity 
            [session]="session"
            [isScanning]="isScanning"
            [scannerStatus]="scannerStatus"
            [imagePreview]="productImagePreview"
            (ocrSelected)="processImage($event)"
            (imageSelected)="onProductImageSelected($event)"
            (processChanged)="checkSuggestions()"
          ></app-coffee-identity>

          <app-sensory-scores
            [session]="session"
            (scoresChanged)="onScoreInput()"
          ></app-sensory-scores>

          <!-- NEW FLAVOR PICKER SECTION -->
          <fieldset class="form-section">
            <legend class="section-title">Sensory Fingerprint</legend>
            <div class="section-title-row" style="margin-bottom: 25px;">
              <p class="section-hint">Select flavor notes from the community or the Dynamic Wheel.</p>
              <button type="button" class="btn-wheel-open" (click)="showFlavorPicker = true" aria-label="Open Dynamic Flavor Wheel">
                <span>Dynamic Wheel</span>
              </button>
            </div>
            
            <!-- AI Sensory Predictions -->
            <div class="smart-suggestions ai-predictions" *ngIf="aiDescriptors().length > 0">
              <span class="suggestion-label"><span class="ai-sparkle">✨</span> AI Sensory Predictions:</span>
              <div class="suggestion-chips">
                <button type="button" *ngFor="let d of aiDescriptors()" class="suggestion-chip ai-chip" (click)="toggleFlavor(d, true)">
                  + {{ d }}
                </button>
              </div>
            </div>

            <!-- Smart Suggestions -->
            <div class="smart-suggestions" *ngIf="suggestions().length > 0" aria-live="polite">
              <span class="suggestion-label">Suggested by Community:</span>
              <div class="suggestion-chips">
                <button type="button" *ngFor="let s of suggestions()" class="suggestion-chip" (click)="toggleFlavor(s)" [aria-label]="'Add ' + s + ' note'">
                  + {{ s }}
                </button>
              </div>
            </div>

            <div class="flavor-display">
              <div class="flavor-chips" *ngIf="session.flavorNotes.length > 0">
                 <button type="button" *ngFor="let note of session.flavorNotes" class="chip active" (click)="toggleFlavor(note)" [aria-label]="'Remove ' + note + ' note'">
                    {{ note }} ✕
                 </button>
              </div>
              <button type="button" class="empty-flavor" *ngIf="session.flavorNotes.length === 0" (click)="showFlavorPicker = true">
                <p>Tap to interact with the Dynamic Flavor Wheel...</p>
              </button>
            </div>
          </fieldset>

          <!-- COMMERCE & PROMOTION SECTION (Premium) -->
          <fieldset class="form-section luxury-border" [class.locked]="!isPro()">
            <legend class="section-title">Commerce & Promotion</legend>
            <div class="section-title-row">
              <span class="premium-badge" *ngIf="!isPro()" aria-hidden="true">🔒 PRO</span>
            </div>
            
            <p class="section-hint" *ngIf="!isPro()">Direct commerce links are available for verified roasteries and pro members.</p>
            
            <div class="input-group" [class.disabled-group]="!isPro()" (click)="!isPro() && goToPricing()">
              <label for="buyLink">Direct Purchase Link (URL)</label>
              <div class="premium-input-wrapper">
                <input id="buyLink" 
                       [(ngModel)]="session.buyLink" 
                       name="buyLink" 
                       placeholder="e.g. https://yourshop.com/product/..." 
                       [disabled]="!isPro()"
                       [readonly]="!isPro()"
                       [attr.aria-disabled]="!isPro()">
                <div class="lock-overlay" *ngIf="!isPro()">
                  <span>Upgrade to Unlock Shop Links</span>
                </div>
              </div>
            </div>
          </fieldset>

        </div>

        <footer class="form-sticky-actions glass-card">
          <div class="footer-visibility">
            <label class="checkbox-container footer-toggle">
              <input type="checkbox" [(ngModel)]="session.isPublic" name="isPublic">
              <span class="checkmark"></span>
              <span class="label-text">Public</span>
            </label>
          </div>
          
          <div class="action-spacer"></div>

          <div class="footer-actions">
            <button type="button" class="btn-cancel" (click)="cancel()">{{ t('BTN_CANCEL') }}</button>
            <button type="submit" class="btn-primary btn-submit" [disabled]="loading || cuppingForm.invalid">
               <span>{{ loading ? 'Publishing...' : (cuppingForm.invalid ? 'Fill required fields' : t('BTN_SAVE')) }}</span>
            </button>
          </div>
        </footer>
      </form>
    </div>

    <app-flavor-wheel 
      *ngIf="showFlavorPicker" 
      [selectedNotes]="session.flavorNotes"
      (notesChanged)="session.flavorNotes = $event; updateTotal(); checkSuggestions(); triggerHaptic()"
      (close)="showFlavorPicker = false">
    </app-flavor-wheel>
  `,
  styles: [`
    .guide-container { 
      max-width: 900px; 
      margin: 40px auto; 
      padding: 20px; 
    }
    .guide-card { 
      padding: 60px; 
      background: linear-gradient(135deg, rgba(22, 22, 26, 0.9) 0%, rgba(12, 12, 14, 0.95) 100%);
    }
    .guide-desc { 
      color: var(--text-dim); 
      margin-bottom: 60px; 
      line-height: 1.8; 
      font-size: 1.1rem; 
      max-width: 600px;
    }
    .guide-grid { 
      display: grid; 
      grid-template-columns: repeat(2, 1fr); 
      gap: 32px; 
      margin-bottom: 60px; 
    }
    .guide-step { 
      background: rgba(255, 255, 255, 0.02); 
      padding: 32px; 
      border-radius: var(--radius-lg); 
      border: 1px solid var(--glass-border); 
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); 
    }
    .guide-step:hover { 
      background: rgba(189, 142, 98, 0.05); 
      border-color: var(--primary-color);
      transform: translateY(-8px);
    }
    .step-icon { 
      font-size: 2rem; 
      margin-bottom: 20px;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(189, 142, 98, 0.1);
      border-radius: 16px;
    }
    .step-text h4 { 
      color: var(--primary-color);
      margin-bottom: 8px; 
      font-size: 1.1rem; 
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .step-text p { 
      color: var(--text-dim); 
      font-size: 0.9rem; 
    }
    .btn-start { 
      height: 80px;
      font-size: 1.2rem;
      box-shadow: 0 20px 40px var(--primary-glow);
    }
    .form-container { 
      max-width: 900px; 
      margin: 0 auto; 
      padding: 40px 20px 200px; 
    }
    .form-header { 
      margin-bottom: 40px; 
      border-radius: var(--radius-lg); 
      overflow: hidden; 
      min-height: 300px; 
      display: flex; 
      flex-direction: column; 
      justify-content: flex-end; 
      padding: 60px;
      position: relative;
      border: 1px solid var(--glass-border);
    }
    .header-visual { position: absolute; inset: 0; z-index: 0; }
    .header-image { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.5); }
    .header-overlay { position: absolute; inset: 0; background: linear-gradient(to top, var(--bg-color) 0%, transparent 100%); }
    .header-content { position: relative; z-index: 1; }
    .header-content h2 { font-size: 3.5rem; letter-spacing: -2px; }
    .header-sub { 
      color: var(--primary-color); 
      font-weight: 800; 
      text-transform: uppercase; 
      letter-spacing: 3px; 
      font-size: 0.8rem; 
      margin-top: 12px; 
    }
    .form-sections-container { display: flex; flex-direction: column; gap: 40px; }
    .form-section { 
      background: var(--surface-color); 
      padding: 48px; 
      border-radius: var(--radius-lg); 
      border: 1px solid var(--glass-border); 
    }
    .section-title { 
      font-size: 1.6rem; 
      margin-bottom: 40px; 
      display: flex; 
      align-items: center; 
      gap: 16px; 
    }
    .section-title::after { content: ''; flex: 1; height: 1px; background: var(--glass-border); }
    .btn-wheel-open { 
      background: rgba(189, 142, 98, 0.1); 
      border: 1px solid var(--primary-color); 
      color: var(--primary-color); 
      padding: 12px 24px; 
      border-radius: 100px; 
      font-size: 0.8rem; 
      font-weight: 800; 
      cursor: pointer; 
      transition: all 0.4s; 
    }
    .btn-wheel-open:hover { background: var(--primary-gradient); color: #0c0c0e; }
    .flavor-display { 
      background: rgba(0,0,0,0.3); 
      border: 1px solid var(--glass-border); 
      border-radius: 20px; 
      padding: 40px; 
      min-height: 140px; 
    }
    .empty-flavor { 
      height: 100%; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      color: var(--text-dim); 
      font-style: italic; 
    }
    .flavor-chips { display: flex; flex-wrap: wrap; gap: 12px; }
    .chip { 
      background: rgba(255, 255, 255, 0.05); 
      border: 1px solid var(--glass-border); 
      color: var(--text-main); 
      padding: 12px 24px; 
      border-radius: 100px; 
      cursor: pointer; 
      font-size: 0.9rem; 
      font-weight: 700; 
      transition: all 0.3s; 
    }
    .chip.active { background: var(--primary-gradient); color: #0c0c0e; border-color: transparent; box-shadow: 0 10px 20px var(--primary-glow); }
    .smart-suggestions { margin-bottom: 32px; }
    .suggestion-label { font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase; font-weight: 800; letter-spacing: 2px; margin-bottom: 16px; display: block; }
    .suggestion-chips { display: flex; gap: 10px; flex-wrap: wrap; }
    .suggestion-chip { 
      background: rgba(255, 255, 255, 0.03); 
      border: 1px solid var(--glass-border); 
      color: var(--text-dim); 
      padding: 8px 16px; 
      border-radius: 100px; 
      font-size: 0.8rem; 
      cursor: pointer; 
      transition: all 0.3s; 
    }
    .suggestion-chip:hover { border-color: var(--primary-color); color: var(--primary-color); }
    .form-sticky-actions { 
      position: fixed; 
      bottom: 40px; 
      left: 40px; 
      right: 40px; 
      max-width: 900px; 
      margin: 0 auto; 
      padding: 20px 32px; 
      display: flex; 
      align-items: center; 
      justify-content: space-between;
      z-index: var(--z-sticky); 
      background: rgba(22, 22, 26, 0.8); 
      backdrop-filter: blur(40px); 
      border-radius: 28px; 
      border: 1px solid var(--glass-border);
      box-shadow: 0 30px 60px rgba(0,0,0,0.6);
    }
    .footer-actions { display: flex; align-items: center; gap: 24px; }
    .btn-cancel { 
      background: transparent; 
      border: none; 
      color: var(--text-dim); 
      font-weight: 800; 
      text-transform: uppercase; 
      letter-spacing: 1.5px; 
      font-size: 0.8rem;
      cursor: pointer;
    }
    @media (max-width: 768px) { 
      .guide-card { padding: 40px 24px; }
      .guide-grid { grid-template-columns: 1fr; }
      .form-section { padding: 32px 20px; } 
      .header-content h2 { font-size: 2.2rem; } 
      .header-header { padding: 30px 20px; min-height: 200px; }
      .form-sticky-actions { bottom: 100px; left: 15px; right: 15px; padding: 12px 16px; border-radius: 20px; width: auto; max-width: none; } 
      .btn-submit { flex: 1; }
      .footer-actions { width: 100%; justify-content: space-between; }
      .section-title { font-size: 1.3rem; margin-bottom: 25px; }
    }
    .ai-sparkle { color: var(--accent-neon); text-shadow: 0 0 10px var(--accent-neon); margin-right: 5px; }
    .ai-chip { border-color: rgba(212, 225, 87, 0.3) !important; color: var(--accent-neon) !important; background: rgba(212, 225, 87, 0.05) !important; }
    .ai-chip:hover { background: rgba(212, 225, 87, 0.1) !important; border-color: var(--accent-neon) !important; }
  `]
})
export class CuppingFormComponent implements OnInit {
  private translationService = inject(TranslationService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cuppingService = inject(CuppingService);
  private membershipService = inject(MembershipService);
  private toast = inject(ToastService);
  private aiService = inject(SensoryAiService);

  isPro = toSignal(this.membershipService.isPro$(), { initialValue: false });
  t = this.translationService.t();

  isEditMode = false;
  editId: string | null = null;

  showGuide = true;
  loading = false;
  isScanning = false;
  scannerStatus = '';
  showFlavorPicker = false;
  
  productImageFile: File | null = null;
  productImagePreview: string | null = null;
  suggestions = signal<string[]>([]);
  aiDescriptors = signal<string[]>([]);

  ngOnInit() {
    this.checkSuggestions();
    this.editId = this.route.snapshot.queryParamMap.get('edit');
    if (this.editId) {
      this.isEditMode = true;
      this.showGuide = false;
      this.loadSession();
    } else {
      const user = this.auth.currentUser();
      if (user?.displayName) {
        this.session.cupperName = user.displayName;
      }
    }
  }

  onScoreInput() {
    this.updateTotal();
    this.triggerHaptic();
    this.updateAiPredictions();
  }

  updateAiPredictions() {
    const profile = {
      acidity: this.session.scores.acidity,
      body: this.session.scores.mouthfeel,
      flavor: this.session.scores.flavor,
      sweetness: this.session.scores.sweetness,
      aftertaste: this.session.scores.aftertaste
    };
    const predictions = this.aiService.predictDescriptors(profile);
    this.aiDescriptors.set(predictions.filter(d => !this.session.flavorNotes.includes(d)));
  }

  triggerHaptic() {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }

  async checkSuggestions() {
    const filters = {
      postHarvest: this.session.postHarvest,
      type: this.session.type
    };
    const s = await this.cuppingService.getSmartSuggestions(filters);
    this.suggestions.set(s.filter(note => !this.session.flavorNotes.includes(note)));
  }

  async loadSession() {
    const session = await this.cuppingService.getCuppingById(this.editId!);
    if (session) {
      // Ownership check
      if (session.userId !== this.auth.getUserId()) {
        this.toast.error('Unauthorized: You can only edit your own sessions.');
        this.router.navigate(['/']);
        return;
      }
      this.session = { ...session };
      if (this.session.productImageUrl) {
        this.productImagePreview = this.session.productImageUrl;
      }
    } else {
      this.toast.error('Session not found');
      this.router.navigate(['/profile']);
    }
  }

  async processImage(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    this.isScanning = true;
    this.scannerStatus = 'Memuat Engine AI...';
    const file = input.files[0];

    try {
      const Tesseract = await import('tesseract.js');
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
      
      const lines = result.data.text.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 2);
      
      // IMPROVED LOGIC: Identify Roastery
      const roasteryKeywords = ['roastery', 'roasters', 'coffee', 'lab', 'kopi', 'sangrai'];
      for (const line of lines) {
         if (roasteryKeywords.some(kw => line.toLowerCase().includes(kw))) {
            this.session.roastery = line;
            break;
         }
      }

      // IMPROVED LOGIC: Bean Name (usually the first or second line, excluding the detected Roastery)
      if (lines.length > 0) {
        const potentialName = lines[0];
        if (potentialName !== this.session.roastery) {
           this.session.beanName = potentialName;
        } else if (lines.length > 1) {
           this.session.beanName = lines[1];
        }
      }

      // IMPROVED LOGIC: Process (More comprehensive)
      if (text.includes('wash') || text.includes('basah')) this.session.postHarvest = 'Wash';
      else if (text.includes('natural') || text.includes('dry') || text.includes('jemur') || text.includes('matahari')) this.session.postHarvest = 'Natural';
      else if (text.includes('honey')) this.session.postHarvest = 'Honey';
      else if (text.includes('anaerob') || text.includes('yeast') || text.includes('lactic')) this.session.postHarvest = 'Anaerobic';
      else if (text.includes('carbonic') || text.includes('maceration') || text.includes('experimental')) this.session.postHarvest = 'Other';

      // IMPROVED LOGIC: Type
      if (text.includes('arabica') || text.includes('ateng') || text.includes('sigarar')) this.session.type = 'Arabica';
      else if (text.includes('robusta')) this.session.type = 'Robusta';

      // IMPROVED LOGIC: Origin (Expanded)
      // IMPROVED LOGIC: Origin (Expanded)
      const origins = [
        'ethiopia', 'colombia', 'brazil', 'indonesia', 'kenya', 'rwanda', 
        'panama', 'costa rica', 'sumatra', 'jawa', 'gayo', 'toraja', 'aceh',
        'sidikalang', 'kintamani', 'temanggung', 'ciwidey', 'preanger', 'malabar',
        'bali', 'flores', 'papua', 'guatemala', 'honduras', 'vietnam', 'garut'
      ];
      for (const origin of origins) {
        if (text.includes(origin)) {
          this.session.origin = origin.charAt(0).toUpperCase() + origin.slice(1);
          break;
        }
      }

      // IMPROVED LOGIC: Roast Date (Regex)
      const dateRegex = /(\d{2}[\/\-]\d{2}[\/\-]\d{2,4})|(\d{4}[\/\-]\d{2}[\/\-]\d{2})/;
      const dateMatch = text.match(dateRegex);
      if (dateMatch) {
         try {
           const d = new Date(dateMatch[0]);
           if (!isNaN(d.getTime())) {
             this.session.productionDate = d.toISOString().split('T')[0];
           }
         } catch(e) {}
      }

      // EXPERIMENTAL LOGIC: Varietal
      if (text.includes('geisha') || text.includes('gesha')) this.session.notes = (this.session.notes || '') + ' [Varietal: Geisha]';
      if (text.includes('bourbon')) this.session.notes = (this.session.notes || '') + ' [Varietal: Bourbon]';
      if (text.includes('typica')) this.session.notes = (this.session.notes || '') + ' [Varietal: Typica]';

    } catch (err) {
      console.error('OCR Error:', err);
      this.toast.error('Gagal mendeteksi teks. Pastikan gambar stiker jelas.');
    } finally {
      this.isScanning = false;
      this.scannerStatus = '';
      input.value = '';
    }
  }

  onProductImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    this.productImageFile = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.productImagePreview = reader.result as string;
    };
    reader.readAsDataURL(this.productImageFile);
  }

  scoreKeys: (keyof SensoryScores)[] = [
    'fragranceAroma', 'flavor', 'aftertaste', 'acidity', 'sweetness', 'mouthfeel', 'balance', 'overall'
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
      mouthfeel: 5,
      sweetness: 5
    },
    flavorNotes: [],
    scores: {
      fragranceAroma: 7,
      flavor: 7,
      aftertaste: 7,
      acidity: 7,
      sweetness: 7,
      mouthfeel: 7,
      balance: 7,
      overall: 7
    },
    defects: 0,
    defectCupStates: [0, 0, 0, 0, 0],
    finalScore: 80,
    timestamp: null,
    isPublic: true,
    likesCount: 0
  };

  toggleFlavor(category: string, isAi = false) {
    if (isAi) this.session.isAiAssisted = true;
    const index = this.session.flavorNotes.indexOf(category);
    if (index > -1) {
      this.session.flavorNotes.splice(index, 1);
    } else {
      this.session.flavorNotes.push(category);
    }
    this.updateTotal(); // Ensure total is updated if logic depends on it
    this.checkSuggestions();
  }

  stepScore(key: keyof SensoryScores, delta: number) {
    const newVal = this.session.scores[key] + delta;
    if (newVal >= 6 && newVal <= 10) {
      this.session.scores[key] = newVal;
      this.updateTotal();
    }
  }

  updateTotal() {
    const sum = Object.values(this.session.scores).reduce((a, b: any) => a + b, 0);
    // CVA 2025 Normalization: (Sum / 72) * 100
    this.session.finalScore = ((sum - this.session.defects) / 72) * 100;
  }

  formatLabel(key: string) {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  async submit() {
    if (this.loading) return;
    this.loading = true;
    this.triggerHaptic();

    try {
      // Step 1: Image Processing (if any)
      if (this.productImageFile) {
        this.scannerStatus = 'Uploading Image...';
        const photoUrl = await this.cuppingService.uploadProductImage(this.productImageFile);
        this.session.productImageUrl = photoUrl;
      }

      // Step 2: Atomic Save with optimistic progress
      this.scannerStatus = 'Synchronizing with Vault...';
      if (this.isEditMode && this.editId) {
        await this.cuppingService.updateCupping(this.editId, this.session);
        this.router.navigate(['/result', this.editId]);
      } else {
        const docRef = await this.cuppingService.addCupping(this.session);
        // Navigate with a slight delay for better UX feel
        setTimeout(() => this.router.navigate(['/result', docRef.id]), 300);
      }
    } catch (err: any) {
      console.error('Error saving cupping:', err);
      if (err?.message?.includes('not authenticated')) {
        this.toast.error('Sesi login Anda telah habis. Silakan login ulang.');
      } else {
        this.toast.error('Gagal menyimpan sesi cupping.');
      }
    } finally {
      this.loading = false;
    }
  }

  cancel() {
    this.router.navigate(['/profile']);
  }

  goToPricing() {
    this.toast.info('Direct commerce links are a Pro feature.', 5000, {
      label: 'Upgrade',
      callback: () => this.router.navigate(['/pricing'])
    });
  }
}
