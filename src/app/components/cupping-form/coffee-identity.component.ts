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
      
      <!-- OCR Section -->
      <div class="ocr-section animate-fade">
        <input type="file" #fileInput accept="image/*" capture="environment" style="display: none" (change)="onOCRSelected($event)">
        <button type="button" class="btn-secondary w-full ocr-btn" (click)="fileInput.click()" [disabled]="isScanning">
          <span class="icon">📷</span>
          <span *ngIf="!isScanning">Pindai Stiker Kemasan (AI Autofill)</span>
          <span *ngIf="isScanning">{{ scannerStatus }}</span>
        </button>
      </div>

      <div class="basic-info">
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
        
        <!-- Product Photo -->
        <div class="photo-upload-section">
          <label class="photo-label">Product Image</label>
          <input type="file" #photoInput accept="image/*" style="display: none" (change)="onImageSelected($event)">
          <div class="photo-box" (click)="photoInput.click()" [class.has-image]="imagePreview">
            <img *ngIf="imagePreview" [src]="imagePreview" class="photo-preview" alt="Preview">
            <div class="photo-placeholder" *ngIf="!imagePreview">
              <span class="icon">☕</span>
              <span>Upload Product Photo</span>
            </div>
            <div class="photo-overlay" *ngIf="imagePreview">Change Photo</div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .ocr-btn {
      margin-bottom: 25px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      padding: 14px;
      background: rgba(255,255,255,0.03);
      border: 1px dashed var(--glass-border);
      color: var(--primary-color);
      width: 100%;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all 0.3s;
    }
    .ocr-btn:hover:not(:disabled) {
      background: rgba(189, 142, 98, 0.05);
      border-color: var(--primary-color);
    }
    .photo-box {
      border: 1px dashed var(--glass-border);
      border-radius: var(--radius-md);
      aspect-ratio: 16/9;
      max-width: 360px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      overflow: hidden;
      position: relative;
      background: rgba(0,0,0,0.1);
      margin-top: 10px;
    }
    .photo-preview { width: 100%; height: 100%; object-fit: cover; }
    .photo-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--text-dim); }
    .photo-placeholder .icon { font-size: 1.5rem; }
    .photo-placeholder span { font-size: 0.8rem; font-weight: 600; }
    .photo-overlay {
      position: absolute; inset: 0; background: rgba(0,0,0,0.6);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: 0.3s;
    }
    .photo-box:hover .photo-overlay { opacity: 1; }
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
