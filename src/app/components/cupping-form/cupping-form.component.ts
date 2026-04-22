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

@Component({
  selector: 'app-cupping-form',
  standalone: true,
  imports: [CommonModule, FormsModule, DynamicFlavorWheelComponent, CoffeeIdentityComponent, SensoryScoresComponent],
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
          <section class="form-section">
            <div class="section-title-row" style="margin-bottom: 25px;">
              <h3 class="section-title" style="margin-bottom:0">Sensory Fingerprint</h3>
              <button type="button" class="btn-wheel-open" (click)="showFlavorPicker = true">
                <span>Dynamic Wheel</span>
              </button>
            </div>
            
            <!-- Smart Suggestions -->
            <div class="smart-suggestions" *ngIf="suggestions().length > 0">
              <span class="suggestion-label">Suggested by Community:</span>
              <div class="suggestion-chips">
                <span *ngFor="let s of suggestions()" class="suggestion-chip" (click)="toggleFlavor(s)">
                  + {{ s }}
                </span>
              </div>
            </div>

            <div class="flavor-display">
              <div class="flavor-chips" *ngIf="session.flavorNotes.length > 0">
                 <div *ngFor="let note of session.flavorNotes" class="chip active" (click)="toggleFlavor(note)">
                    {{ note }} ✕
                 </div>
              </div>
              <div class="empty-flavor" *ngIf="session.flavorNotes.length === 0" (click)="showFlavorPicker = true">
                <p>Tap to interact with the Dynamic Flavor Wheel...</p>
              </div>
            </div>
          </section>

          <!-- COMMERCE & PROMOTION SECTION (Premium) -->
          <section class="form-section luxury-border" [class.locked]="!isPro()">
            <div class="section-title-row">
              <h3 class="section-title" style="margin-bottom:0">Commerce & Promotion</h3>
              <span class="premium-badge" *ngIf="!isPro()">🔒 PRO</span>
            </div>
            
            <p class="section-hint" *ngIf="!isPro()">Direct commerce links are available for verified roasteries and pro members.</p>
            
            <div class="input-group" [class.disabled-group]="!isPro()" (click)="!isPro() && goToPricing()">
              <label>Direct Purchase Link (URL)</label>
              <div class="premium-input-wrapper">
                <input [(ngModel)]="session.buyLink" 
                       name="buyLink" 
                       placeholder="e.g. https://yourshop.com/product/..." 
                       [disabled]="!isPro()"
                       [readonly]="!isPro()">
                <div class="lock-overlay" *ngIf="!isPro()">
                  <span>Upgrade to Unlock Shop Links</span>
                </div>
              </div>
            </div>
          </section>

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
    .guide-container { max-width: 800px; margin: 60px auto; padding: 0 30px; text-align: center; }
    .guide-card { padding: 50px; }
    .guide-desc { color: var(--text-dim); margin-bottom: 50px; line-height: 1.8; font-size: 1.1rem; max-width: 600px; margin-left: auto; margin-right: auto; }
    .guide-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; text-align: left; margin-bottom: 50px; }
    .guide-step { background: var(--surface-hover); padding: 30px; border-radius: var(--radius-md); display: flex; gap: 20px; align-items: center; border: 1px solid var(--glass-border); transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    .guide-step:hover { transform: translateY(-5px); border-color: var(--primary-color); background: rgba(189, 142, 98, 0.05); }
    .step-icon { font-size: 2rem; background: var(--surface-color); width: 65px; height: 65px; display: flex; align-items: center; justify-content: center; border-radius: 20px; box-shadow: 0 8px 20px rgba(0,0,0,0.3); flex-shrink: 0; border: 1px solid var(--glass-border); }
    .step-text h4 { background: var(--primary-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 6px; font-size: 1.1rem; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; }
    .step-text p { color: var(--text-main); font-size: 0.9rem; opacity: 0.8; }
    .btn-start { padding: 20px 30px; font-size: 1.15rem; border-radius: 100px; letter-spacing: 1px; box-shadow: 0 15px 35px var(--primary-glow); display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1.3; text-align: center; min-height: 80px; }
    @media (max-width: 640px) { .guide-grid { grid-template-columns: 1fr; } .guide-card { padding: 30px 20px; } }
    .form-container { max-width: 800px; margin: 0 auto; padding-bottom: 200px; }
    @media (max-width: 768px) { .form-container { padding-bottom: 400px; } }
    .form-header { margin-bottom: 30px; padding: 0; position: relative; border-radius: var(--radius-lg); overflow: hidden; min-height: 250px; display: flex; flex-direction: column; justify-content: flex-end; border: 1px solid var(--glass-border); box-shadow: 0 20px 80px rgba(0,0,0,0.6); }
    .header-visual { position: absolute; inset: 0; z-index: 0; }
    .header-image { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.6) contrast(1.1); }
    .header-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 0%, rgba(12, 12, 14, 0.5) 40%, var(--bg-color) 100%); }
    .header-content { position: relative; z-index: 1; padding: 40px; }
    .header-content h2 { font-size: 2.5rem; margin: 0; line-height: 1; text-shadow: 0 5px 20px rgba(0,0,0,0.5); }
    .header-sub { color: var(--primary-color); font-weight: 800; text-transform: uppercase; letter-spacing: 2px; font-size: 0.8rem; margin-top: 10px; }
    .form-sections-container { display: flex; flex-direction: column; gap: 30px; }
    .form-section { background: rgba(12, 12, 14, 0.4); padding: 40px; border-radius: var(--radius-lg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
    .section-title { font-size: 1.4rem; margin-bottom: 30px; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 12px; }
    .section-title::after { content: ''; flex: 1; height: 1px; background: var(--glass-border); }
    .section-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .btn-wheel-open { background: var(--surface-hover); border: 1px solid var(--primary-color); color: var(--primary-color); padding: 10px 24px; border-radius: 100px; font-size: 0.85rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: all 0.4s; text-transform: uppercase; letter-spacing: 1px; }
    .btn-wheel-open:hover { background: var(--primary-gradient); color: #0c0c0e; border-color: transparent; box-shadow: 0 8px 20px var(--primary-glow); }
    .flavor-display { background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: 30px; min-height: 120px; }
    .empty-flavor { height: 100%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-dim); font-style: italic; font-size: 1rem; gap: 15px; }
    .flavor-chips { display: flex; flex-wrap: wrap; gap: 15px; }
    .chip { background: var(--surface-hover); border: 1px solid var(--glass-border); color: var(--text-main); padding: 12px 24px; min-height: 48px; border-radius: 100px; cursor: pointer; font-size: 0.95rem; font-weight: 600; transition: all 0.4s; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    .chip.active { background: var(--primary-gradient); color: #0c0c0e; border-color: transparent; box-shadow: 0 10px 25px -5px var(--primary-glow); }
    .smart-suggestions { margin-bottom: 25px; }
    .suggestion-label { font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase; font-weight: 800; letter-spacing: 1.5px; margin-bottom: 15px; display: block; }
    .suggestion-chips { display: flex; gap: 12px; flex-wrap: wrap; }
    .suggestion-chip { background: rgba(255,255,255,0.03); border: 1px dashed var(--glass-border); color: var(--primary-color); padding: 8px 18px; border-radius: 100px; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    .suggestion-chip:hover { background: var(--primary-gradient); color: #0c0c0e; border: 1px solid transparent; transform: scale(1.05); box-shadow: 0 5px 15px var(--primary-glow); }
    .form-sticky-actions { position: fixed; bottom: 30px; left: 15px; right: 15px; max-width: 800px; margin: 0 auto; padding: 12px 20px; display: flex; align-items: center; gap: 15px; z-index: var(--z-sticky); border-radius: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.1); background: rgba(22, 22, 26, 0.85); backdrop-filter: blur(30px); }
    .footer-visibility { padding-right: 15px; border-right: 1px solid rgba(255,255,255,0.1); }
    .footer-toggle .label-text { font-size: 0.8rem !important; text-transform: uppercase; letter-spacing: 1px; }
    .footer-actions { display: flex; align-items: center; gap: 20px; }
    @media (max-width: 768px) { 
      .form-section { padding: 20px; } 
      .header-content { padding: 30px 20px; }
      .header-content h2 { font-size: 1.8rem; } 
      .form-sticky-actions { 
        bottom: 100px; 
        padding: 10px 15px; 
        gap: 10px;
        border-radius: 18px;
        left: 10px;
        right: 10px;
      } 
      .btn-submit { padding: 0 20px; font-size: 0.75rem; } 
      .footer-toggle .label-text { display: none; } 
      .footer-visibility { padding-right: 10px; } 
      .section-title { font-size: 1.1rem; margin-bottom: 20px; }
    }
    .w-full { width: 100%; height: 70px; font-size: 1.2rem; margin-top: 30px; border-radius: 100px; }
    .checkbox-container { display: flex; align-items: center; gap: 15px; cursor: pointer; user-select: none; font-weight: 700; color: #ffffff; padding: 10px 0; }
    .checkbox-container input { position: absolute; opacity: 0; cursor: pointer; }
    .checkmark { height: 28px; width: 28px; background-color: var(--surface-hover); border: 2px solid rgba(255,255,255,0.4); border-radius: 8px; position: relative; transition: all 0.3s; box-shadow: 0 0 15px rgba(0,0,0,0.5); }
    .checkmark:after { content: ""; position: absolute; display: none; left: 9px; top: 5px; width: 6px; height: 12px; border: solid #0c0c0e; border-width: 0 3px 3px 0; transform: rotate(45deg); }
    .checkbox-container input:checked ~ .checkmark { background-color: var(--primary-color); border-color: var(--primary-color); }
    .checkbox-container input:checked ~ .checkmark:after { display: block; }
    .luxury-border { border: 1px solid var(--glass-border); transition: all 0.3s; }
    .luxury-border.locked { background: rgba(189, 142, 98, 0.02); border-style: dashed; }
    .premium-badge { background: var(--primary-gradient); color: #0c0c0e; padding: 4px 10px; border-radius: 4px; font-size: 0.7rem; font-weight: 900; letter-spacing: 1px; }
    .section-hint { font-size: 0.85rem; color: var(--text-dim); margin: 15px 0 25px; line-height: 1.5; }
    .premium-input-wrapper { position: relative; }
    .disabled-group { cursor: pointer; opacity: 0.7; }
    .lock-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(2px); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--primary-color); font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; border: 1px solid rgba(189, 142, 98, 0.3); }
  `]
})
export class CuppingFormComponent implements OnInit {
  private translationService = inject(TranslationService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cuppingService = inject(CuppingService);
  private membershipService = inject(MembershipService);

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
        alert('Unauthorized: You can only edit your own sessions.');
        this.router.navigate(['/']);
        return;
      }
      this.session = { ...session };
      if (this.session.productImageUrl) {
        this.productImagePreview = this.session.productImageUrl;
      }
    } else {
      alert('Session not found');
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

    } catch (err) {
      console.error('OCR Error:', err);
      alert('Gagal mendeteksi teks. Pastikan gambar stiker jelas dan terang.');
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
    defectCupStates: [0, 0, 0, 0, 0],
    finalScore: 80,
    timestamp: null,
    isPublic: true,
    likesCount: 0
  };

  toggleFlavor(category: string) {
    const index = this.session.flavorNotes.indexOf(category);
    if (index > -1) {
      this.session.flavorNotes.splice(index, 1);
    } else {
      this.session.flavorNotes.push(category);
    }
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
    this.session.finalScore = sum - this.session.defects;
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
        alert('❌ Sesi login Anda telah habis. Silakan login ulang.');
      } else {
        alert('❌ Gagal menyimpan sesi cupping. Silakan coba lagi.');
      }
    } finally {
      this.loading = false;
    }
  }

  cancel() {
    this.router.navigate(['/profile']);
  }

  goToPricing() {
    if (confirm('Direct commerce links are a Pro feature. Would you like to view our upgrade plans?')) {
      this.router.navigate(['/pricing']);
    }
  }
}
