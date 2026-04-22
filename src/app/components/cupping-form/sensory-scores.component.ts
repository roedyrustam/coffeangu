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
            <span [style.color]="getScoreColor(item.key + 'Int')">{{ session.intensities![item.key] }}</span>
          </div>
          <input type="range" min="1" max="10" step="1" [(ngModel)]="session.intensities![item.key]" [name]="'int-' + item.key">
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
            <input type="range" min="6" max="10" step="0.25" [(ngModel)]="session.scores[key]" [name]="key" (input)="onScoreInput()">
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
    .slider-row { display: flex; gap: 10px; align-items: center; }
    
    /* Dynamic Range Styling */
    input[type="range"] {
      accent-color: var(--accent-color, var(--primary-color));
      height: 6px;
      border-radius: 3px;
      background: rgba(255,255,255,0.05);
    }

    .btn-step {
      background: transparent;
      border: 1px solid var(--accent-color, var(--primary-color));
      color: var(--accent-color, var(--primary-color));
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-step:active { transform: scale(0.9); background: var(--accent-color); color: #000; }

    .value { font-weight: 800; font-family: var(--font-brand); font-size: 1.1rem; }

    .defects-calculator { margin-top: 30px; padding: 20px; background: rgba(255,69,58,0.05); border: 1px solid rgba(255,69,58,0.2); border-radius: var(--radius-md); }
    .cup-grid { display: flex; gap: 15px; margin: 15px 0; justify-content: space-between; }
    .cup-item { flex: 1; aspect-ratio: 1/1; border: 1px solid var(--glass-border); border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s; position: relative; }
    .cup-item.active { border-color: var(--danger); background: rgba(255,69,58,0.1); }
    .cup-icon { font-size: 1.5rem; }
    .cup-intensity { position: absolute; bottom: 5px; font-size: 0.6rem; font-weight: 800; text-transform: uppercase; color: var(--danger); }
    .defect-total { text-align: right; font-weight: 800; color: var(--danger); font-size: 0.9rem; }
    .final-score-bar {
      margin-top: 40px; background: var(--surface-color); padding: 30px 40px;
      border-radius: var(--radius-lg); display: flex; justify-content: space-between;
      align-items: center; border: 1px solid var(--glass-border);
    }
    .final-score-bar.specialty { background: var(--primary-gradient) !important; border: none; }
    .final-score-bar.specialty .score-label span, .final-score-bar.specialty .final-value { color: #0c0c0e !important; }
    .final-value { font-size: 4rem; font-weight: 950; font-family: var(--font-brand); color: var(--primary-color); line-height: 1; }
    .score-label small { font-weight: 900; letter-spacing: 1px; display: block; margin-top: 5px; }
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
