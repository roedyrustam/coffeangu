import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlContainer, NgForm } from '@angular/forms';
import { CuppingSession } from '../../models/cupping.model';

@Component({
  selector: 'app-sensory-scores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
  template: `
    <section class="form-section">
      <h3 class="section-title">Descriptive Intensity</h3>
      <div class="intensity-grid">
        <div class="intensity-item" *ngFor="let item of intensityKeys" [style.--accent-color]="getScoreColor(item.key + 'Int')">
          <div class="intensity-header">
            <label>{{ item.label }}</label>
            <span class="intensity-value" [style.color]="getScoreColor(item.key + 'Int')">{{ session.intensities![item.key] }}</span>
          </div>
          <div class="slider-row">
            <button type="button" class="btn-step" (click)="stepIntensity(item.key, -1)">-</button>
            <div class="slider-container">
              <input type="range" min="1" max="10" step="1" [(ngModel)]="session.intensities![item.key]" [name]="'int-' + item.key"
                     [style.background]="'linear-gradient(to right, var(--accent-color) ' + ((session.intensities![item.key]-1)/9*100) + '%, rgba(255,255,255,0.05) ' + ((session.intensities![item.key]-1)/9*100) + '%)'">
              <div class="slider-labels">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
            <button type="button" class="btn-step" (click)="stepIntensity(item.key, 1)">+</button>
          </div>
        </div>
      </div>
    </section>

    <section class="form-section">
      <h3 class="section-title">Affective Quality Scores</h3>
      <div class="intensity-grid">
        <div class="score-card" *ngFor="let key of scoreKeys" [style.--accent-color]="getScoreColor(key)">
          <div class="score-header">
            <label>{{ formatLabel(key) }}</label>
            <span class="value" [style.color]="getScoreColor(key)">{{ session.scores[key] | number:'1.2-2' }}</span>
          </div>
          <div class="slider-row">
            <button type="button" class="btn-step" (click)="stepScore(key, -0.25)">-</button>
            <input type="range" min="6" max="10" step="0.25" [(ngModel)]="session.scores[key]" [name]="key" (input)="onScoreInput()"
                   [style.background]="'linear-gradient(to right, var(--accent-color) ' + ((session.scores[key]-6)/4*100) + '%, rgba(255,255,255,0.05) ' + ((session.scores[key]-6)/4*100) + '%)'">
            <button type="button" class="btn-step" (click)="stepScore(key, 0.25)">+</button>
          </div>
        </div>
      </div>

      <!-- SCA Defects Calculator -->
      <div class="defects-calculator">
        <label class="section-hint">SCA Defects (Deducted from Total)</label>
        <div class="cup-grid">
          <div *ngFor="let cup of [1,2,3,4,5]; let i = index" class="cup-item" 
               [class.active]="defectCups[i] > 0" (click)="toggleCup(i)">
            <span class="cup-icon">☕</span>
            <small>Cup {{ cup }}</small>
            <div class="cup-intensity" *ngIf="defectCups[i] > 0">
               {{ defectCups[i] === 2 ? 'Taint' : 'Fault' }}
            </div>
          </div>
        </div>
        <div class="defect-total">Total Deduction: -{{ session.defects }}</div>
      </div>

      <div class="final-score-bar" [class.specialty]="session.finalScore >= 80">
        <div class="score-label">
          <span>Final Assessment</span>
          <small *ngIf="session.finalScore >= 80">SPECIALTY GRADE</small>
        </div>
        <span class="final-value">{{ session.finalScore | number:'1.2-2' }}</span>
      </div>
    </section>
  `,
  styles: [`
    .intensity-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 25px;
    }
    @media (max-width: 640px) {
      .intensity-grid { grid-template-columns: 1fr; gap: 20px; }
    }

    .intensity-item {
      background: rgba(255,255,255,0.04);
      padding: 20px;
      border-radius: var(--radius-md);
      border: 1px solid var(--glass-border);
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
      transition: all 0.3s;
    }
    .intensity-item:hover { border-color: var(--accent-color); background: rgba(255,255,255,0.06); }

    .intensity-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .intensity-header label {
      font-size: 0.85rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-main);
    }
    .intensity-value { font-weight: 950; font-family: var(--font-brand); font-size: 1.4rem; }

    .score-card {
      background: rgba(255,255,255,0.04);
      padding: 20px;
      border-radius: var(--radius-md);
      border: 1px solid var(--glass-border);
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
      transition: all 0.3s;
    }
    .score-card:hover { border-color: var(--accent-color); background: rgba(255,255,255,0.06); }

    .score-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    .score-header label { font-size: 0.8rem; font-weight: 700; color: var(--text-dim); text-transform: uppercase; }

    .slider-row { display: flex; gap: 15px; align-items: center; }
    .slider-container { flex: 1; display: flex; flex-direction: column; gap: 4px; }
    .slider-labels { display: flex; justify-content: space-between; font-size: 0.6rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700; opacity: 0.6; }
    
    input[type="range"] {
      flex: 1;
      height: 8px;
      border-radius: 10px;
      cursor: pointer;
      -webkit-appearance: none;
      transition: all 0.2s ease;
      outline: none;
      border: 1px solid rgba(255,255,255,0.05);
    }

    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 20px;
      height: 20px;
      background: white;
      border: 3px solid var(--accent-color);
      border-radius: 50%;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    input[type="range"]::-webkit-slider-thumb:hover {
      transform: scale(1.2);
      box-shadow: 0 6px 15px rgba(0,0,0,0.15);
    }

    .btn-step {
      background: var(--surface-hover);
      border: 1px solid var(--glass-border);
      color: var(--text-main);
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-step:hover { border-color: var(--accent-color); color: var(--accent-color); }
    .btn-step:active { transform: scale(0.9); }

    .value { font-weight: 900; font-family: var(--font-brand); font-size: 1.3rem; }

    .defects-calculator { margin-top: 30px; padding: 25px; background: rgba(255,69,58,0.03); border: 1px solid rgba(255,69,58,0.1); border-radius: var(--radius-lg); }
    .cup-grid { display: flex; gap: 10px; margin: 20px 0; overflow-x: auto; padding-bottom: 10px; }
    .cup-item { flex: 0 0 70px; height: 85px; border: 1px solid var(--glass-border); border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s; position: relative; background: var(--surface-color); }
    .cup-item.active { border-color: var(--danger); background: rgba(255,69,58,0.1); transform: scale(1.05); }
    .cup-icon { font-size: 1.8rem; }
    .cup-intensity { position: absolute; bottom: 8px; font-size: 0.55rem; font-weight: 900; text-transform: uppercase; color: var(--danger); }
    .defect-total { text-align: right; font-weight: 900; color: var(--danger); font-size: 1rem; letter-spacing: 0.5px; }

    .final-score-bar {
      margin-top: 40px; background: var(--surface-color); padding: 30px 40px;
      border-radius: var(--radius-lg); display: flex; justify-content: space-between;
      align-items: center; border: 1px solid var(--glass-border);
      box-shadow: 0 15px 40px rgba(0,0,0,0.1);
    }
    .final-score-bar.specialty { background: var(--primary-gradient) !important; border: none; box-shadow: 0 20px 50px var(--primary-glow); }
    .final-score-bar.specialty .score-label span, .final-score-bar.specialty .final-value { color: #ffffff !important; }
    .final-value { font-size: 4.5rem; font-weight: 950; font-family: var(--font-brand); color: var(--primary-color); line-height: 1; letter-spacing: -2px; }
    .score-label span { font-size: 1.2rem; font-weight: 800; display: block; }
    .score-label small { font-weight: 900; letter-spacing: 2px; display: block; margin-top: 8px; opacity: 0.9; }

    @media (max-width: 480px) {
      .final-score-bar { padding: 25px; }
      .final-value { font-size: 3.5rem; }
      .score-label span { font-size: 1rem; }
    }
  `]
})
export class SensoryScoresComponent implements OnInit {
  @Input() session!: CuppingSession;
  @Output() scoresChanged = new EventEmitter<void>();

  intensityKeys: {label: string, key: 'acidity' | 'body' | 'sweetness'}[] = [
    { label: 'Acidity', key: 'acidity' },
    { label: 'Body', key: 'body' },
    { label: 'Sweetness', key: 'sweetness' }
  ];

  scoreKeys: (keyof CuppingSession['scores'])[] = [
    'fragranceAroma', 'flavor', 'aftertaste', 'acidity', 'body', 'balance', 
    'uniformity', 'cleanCup', 'sweetness', 'overall'
  ];

  defectCups: number[] = [0, 0, 0, 0, 0];

  ngOnInit() {
    if (this.session.defectCupStates) {
      this.defectCups = [...this.session.defectCupStates];
    }
  }

  toggleCup(index: number) {
    if (this.defectCups[index] === 0) this.defectCups[index] = 2;
    else if (this.defectCups[index] === 2) this.defectCups[index] = 4;
    else this.defectCups[index] = 0;
    
    this.session.defectCupStates = [...this.defectCups];
    this.session.defects = this.defectCups.reduce((a, b) => a + b, 0);
    this.onScoreInput();
  }

  stepIntensity(key: 'acidity' | 'body' | 'sweetness', step: number) {
    const newVal = Math.min(10, Math.max(1, (this.session.intensities![key] || 0) + step));
    this.session.intensities![key] = newVal;
    this.onScoreInput();
  }

  formatLabel(key: string): string {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
  }

  stepScore(key: keyof CuppingSession['scores'], step: number) {
    const newVal = Math.min(10, Math.max(6, (this.session.scores[key] || 0) + step));
    this.session.scores[key] = newVal;
    this.onScoreInput();
  }

  getScoreColor(key: string): string {
    const colors: Record<string, string> = {
      fragranceAroma: '#9b59b6', // Purple
      flavor: '#f1c40f',         // Gold
      aftertaste: '#ff6b6b',     // Salmon
      acidity: '#e67e22',        // Orange
      body: '#8e5a35',           // Brown
      balance: '#3498db',        // Blue
      uniformity: '#2ecc71',     // Green
      cleanCup: '#1abc9c',       // Teal
      sweetness: '#ff85a2',      // Pink
      overall: '#bd8e62',         // Bronze
      // Intensities
      acidityInt: '#e67e22',
      bodyInt: '#8e5a35',
      sweetnessInt: '#ff85a2'
    };
    return colors[key] || '#8e5a35';
  }

  onScoreInput() {
    this.scoresChanged.emit();
  }
}
