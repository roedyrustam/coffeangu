import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlContainer, NgForm } from '@angular/forms';
import { CuppingSession } from '../../models/cupping.model';

@Component({
  selector: 'app-coffee-identity',
  standalone: true,
  imports: [CommonModule, FormsModule],
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
  template: `
    <section class="form-section">
      <h3 class="section-title">Coffee Identity</h3>

      <div class="identity-grid-layout">
        <!-- Main Form Fields -->
        <div class="fields-column">
          <div class="input-row">
            <div class="input-group">
              <label>Bean Name <span class="required">*</span></label>
              <input [(ngModel)]="session.beanName" name="beanName" placeholder="e.g. Ethiopia Yirgacheffe" required>
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
          </div>

          <div class="input-row">
            <div class="input-group">
              <label>Roastery <span class="required">*</span></label>
              <input [(ngModel)]="session.roastery" name="roastery" placeholder="e.g. Blue Bottle" required>
            </div>
            <div class="input-group">
              <label>Pasca Panen</label>
              <select [(ngModel)]="session.postHarvest" name="postHarvest" (change)="processChanged.emit(session.postHarvest)">
                <option value="Wash">Wash</option>
                <option value="Natural">Natural</option>
                <option value="Honey">Honey</option>
                <option value="Anaerobic">Anaerobic</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Media/AI Section -->
        <div class="media-column">
          <div class="photo-upload-container">
            <label class="photo-label">Product Visual</label>
            <input type="file" #photoInput accept="image/*" style="display: none" (change)="onImageSelected($event)">
            <div class="photo-box" (click)="photoInput.click()" [class.has-image]="imagePreview">
              <img *ngIf="imagePreview" [src]="imagePreview" class="photo-preview" alt="Preview">
              <div class="photo-placeholder" *ngIf="!imagePreview">
                <span class="icon">☕</span>
                <span>Upload Photo</span>
              </div>
              <div class="photo-overlay" *ngIf="imagePreview">Change</div>
            </div>
          </div>

          <div class="ai-assist-box">
             <input type="file" #fileInput accept="image/*" capture="environment" style="display: none" (change)="onOCRSelected($event)">
             <button type="button" class="ocr-btn-premium" (click)="fileInput.click()" [disabled]="isScanning">
                <div class="btn-content" *ngIf="!isScanning">
                  <span class="ai-icon">✨</span>
                  <div class="btn-text">
                    <strong>AI Smart Scan</strong>
                    <small>Autofill from bag</small>
                  </div>
                </div>
                <div class="scanning-loader" *ngIf="isScanning">
                   <div class="scan-line"></div>
                   <span>{{ scannerStatus }}</span>
                </div>
             </button>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .identity-grid-layout {
      display: grid;
      grid-template-columns: 1fr 280px;
      gap: 30px;
      margin-top: 20px;
    }
    
    .input-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .input-group label {
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      color: var(--text-dim);
      letter-spacing: 0.5px;
    }

    .input-group input, .input-group select {
      width: 100%;
    }

    @media (max-width: 768px) {
      .identity-grid-layout { 
        grid-template-columns: 1fr; 
        gap: 20px;
      }
      .input-row {
        grid-template-columns: 1fr;
        gap: 15px;
        margin-bottom: 15px;
      }
      .media-column { 
        order: -1; 
      }
      .photo-box {
        aspect-ratio: 16/9;
      }
    }
    
    .photo-upload-container { margin-bottom: 20px; }
    .photo-label { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--text-dim); margin-bottom: 10px; display: block; letter-spacing: 1px; }
    
    .photo-box {
      border: 1px solid var(--glass-border);
      background: rgba(255,255,255,0.03);
      border-radius: var(--radius-md);
      aspect-ratio: 16/10;
      width: 100%;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; overflow: hidden; position: relative;
      transition: all 0.3s;
    }
    .photo-box:hover { border-color: var(--primary-color); background: rgba(189, 142, 98, 0.05); }
    .photo-preview { width: 100%; height: 100%; object-fit: cover; }
    .photo-placeholder { text-align: center; color: var(--text-dim); opacity: 0.6; }
    .photo-placeholder .icon { font-size: 1.5rem; display: block; margin-bottom: 5px; }
    .photo-placeholder span { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
    
    .ai-assist-box { position: relative; }
    .ocr-btn-premium {
      width: 100%;
      background: var(--primary-gradient);
      border: none;
      border-radius: 12px;
      padding: 12px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      position: relative; overflow: hidden;
    }
    .ocr-btn-premium:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 10px 20px var(--primary-glow); }
    .ocr-btn-premium:active { transform: scale(0.95); }
    
    .btn-content { display: flex; align-items: center; gap: 12px; text-align: left; color: #0c0c0e; }
    .ai-icon { font-size: 1.4rem; }
    .btn-text strong { display: block; font-size: 0.85rem; font-weight: 900; line-height: 1.1; }
    .btn-text small { font-size: 0.65rem; font-weight: 700; opacity: 0.8; text-transform: uppercase; }

    .scanning-loader {
       display: flex; align-items: center; justify-content: center; gap: 10px; color: #0c0c0e; font-weight: 800; font-size: 0.8rem;
    }
    .scan-line {
      position: absolute; top: 0; left: 0; width: 100%; height: 2px;
      background: rgba(255,255,255,0.8); box-shadow: 0 0 15px #fff;
      animation: scan 1.5s ease-in-out infinite;
    }
    @keyframes scan { 0% { top: 0; } 50% { top: 100%; } 100% { top: 0; } }
  `]
})
export class CoffeeIdentityComponent {
  @Input() session!: CuppingSession;
  @Input() isScanning = false;
  @Input() scannerStatus = '';
  @Input() imagePreview: string | null = null;

  @Output() ocrSelected = new EventEmitter<Event>();
  @Output() imageSelected = new EventEmitter<Event>();
  @Output() processChanged = new EventEmitter<string>();

  onOCRSelected(event: Event) { this.ocrSelected.emit(event); }
  onImageSelected(event: Event) { this.imageSelected.emit(event); }
}
