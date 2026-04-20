import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CuppingService } from '../../services/cupping.service';
import { CuppingSession, SensoryScores } from '../../models/cupping.model';
import { DynamicFlavorWheelComponent } from '../flavor-wheel/flavor-wheel.component';

@Component({
  selector: 'app-cupping-form',
  // ... template and styles truncated ...
  standalone: true,
  imports: [CommonModule, FormsModule, DynamicFlavorWheelComponent],
  template: `
    <div class="guide-container animate-fade" *ngIf="showGuide">
      <!-- ... existing guide template ... -->
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
          <section class="form-section">
            <h3 class="section-title">Coffee Identity</h3>
            <!-- OCR Section -->
            <div class="ocr-section animate-fade">
              <input type="file" #fileInput accept="image/*" capture="environment" style="display: none" (change)="processImage($event)">
              <button type="button" class="btn-secondary w-full" (click)="fileInput.click()" [disabled]="isScanning" style="margin-top: 0; margin-bottom: 25px; display: flex; justify-content: center; align-items: center; gap: 12px; padding: 14px; background: rgba(255,255,255,0.03); border: 1px dashed var(--glass-border); color: var(--primary-color);">
                <span style="font-size: 1.4rem;">📷</span>
                <span *ngIf="!isScanning" style="font-size: 0.95rem; font-weight: 500;">Pindai Stiker Kemasan (AI Autofill)</span>
                <span *ngIf="isScanning" style="font-size: 0.95rem; font-weight: 500;">{{ scannerStatus }}</span>
              </button>
            </div>

            <div class="basic-info" style="margin-top:0">
              <div class="input-group">
                <label>Bean Name <span class="required">*</span></label>
                <input [(ngModel)]="session.beanName" name="beanName" #beanName="ngModel" placeholder="e.g. Ethiopia Yirgacheffe" required>
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
              <!-- Product Photo -->
              <div class="photo-upload-section">
                <label class="photo-label">Product Image</label>
                <input type="file" #photoInput accept="image/*" style="display: none" (change)="onProductImageSelected($event)">
                <div class="photo-box" (click)="photoInput.click()" [class.has-image]="productImagePreview">
                  <img *ngIf="productImagePreview" [src]="productImagePreview" class="photo-preview" alt="Preview">
                  <div class="photo-placeholder" *ngIf="!productImagePreview">
                    <span class="icon">☕</span>
                    <span>Upload Product Photo</span>
                  </div>
                  <div class="photo-overlay" *ngIf="productImagePreview">Change Photo</div>
                </div>
              </div>
            </div>
          </section>

          <section class="form-section">
            <h3 class="section-title">Descriptive Intensity</h3>
            <div class="intensity-grid">
               <div class="intensity-item">
                  <div class="intensity-header">
                     <label>Acidity</label>
                     <span>{{ session.intensities!.acidity }}</span>
                  </div>
                  <input type="range" min="1" max="10" step="1" [(ngModel)]="session.intensities!.acidity" name="int-acidity">
               </div>
               <div class="intensity-item">
                  <div class="intensity-header">
                     <label>Body</label>
                     <span>{{ session.intensities!.body }}</span>
                  </div>
                  <input type="range" min="1" max="10" step="1" [(ngModel)]="session.intensities!.body" name="int-body">
               </div>
               <div class="intensity-item">
                  <div class="intensity-header">
                     <label>Sweetness</label>
                     <span>{{ session.intensities!.sweetness }}</span>
                  </div>
                  <input type="range" min="1" max="10" step="1" [(ngModel)]="session.intensities!.sweetness" name="int-sweetness">
               </div>
            </div>
          </section>

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

          <section class="form-section">
            <h3 class="section-title">Affective Quality Scores</h3>
            <div class="intensity-grid">
              <div class="score-card" *ngFor="let key of scoreKeys">
                <div class="score-header">
                  <label>{{ formatLabel(key) }}</label>
                  <span class="value">{{ session.scores[key] | number:'1.2-2' }}</span>
                </div>
                <div class="slider-row" style="display: flex; gap: 10px; align-items: center;">
                  <button type="button" class="btn-step" (click)="stepScore(key, -0.25)">-</button>
                  <input type="range" min="6" max="10" step="0.25" [(ngModel)]="session.scores[key]" [name]="key" (input)="onScoreInput()" style="flex:1">
                  <button type="button" class="btn-step" (click)="stepScore(key, 0.25)">+</button>
                </div>
              </div>
            </div>

            <div class="final-score-bar" [class.specialty]="session.finalScore >= 80" style="margin-top: 40px;">
              <div class="score-label">
                <span>Final Assessment</span>
                <small *ngIf="session.finalScore >= 80" style="font-weight: 900; letter-spacing: 1px;">SPECIALTY GRADE</small>
              </div>
              <span class="final-value">{{ session.finalScore | number:'1.2-2' }}</span>
            </div>
          </section>

          <!-- Visibility is now moved to the sticky footer for better accessibility -->

        </div> <!-- Close form-sections-container -->

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

    <!-- Dynamic Flavor Wheel Component -->
    <app-flavor-wheel 
      *ngIf="showFlavorPicker" 
      [selectedNotes]="session.flavorNotes"
      (notesChanged)="session.flavorNotes = $event; updateTotal(); checkSuggestions(); triggerHaptic()"
      (close)="showFlavorPicker = false">
    </app-flavor-wheel>
  `,
  styles: [`
    .guide-container {
      max-width: 800px;
      margin: 60px auto;
      padding: 0 30px;
      text-align: center;
    }
    .guide-card {
      padding: 50px;
    }
    .guide-desc {
      color: var(--text-dim);
      margin-bottom: 50px;
      line-height: 1.8;
      font-size: 1.1rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }
    .guide-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 25px;
      text-align: left;
      margin-bottom: 50px;
    }
    .guide-step {
      background: var(--surface-hover);
      padding: 30px;
      border-radius: var(--radius-md);
      display: flex;
      gap: 20px;
      align-items: center;
      border: 1px solid var(--glass-border);
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .guide-step:hover {
      transform: translateY(-5px);
      border-color: var(--primary-color);
      background: rgba(189, 142, 98, 0.05);
    }
    .step-icon {
      font-size: 2rem;
      background: var(--surface-color);
      width: 65px;
      height: 65px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 20px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.3);
      flex-shrink: 0;
      border: 1px solid var(--glass-border);
    }
    .step-text h4 {
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 6px;
      font-size: 1.1rem;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .step-text p {
      color: var(--text-main);
      font-size: 0.9rem;
      opacity: 0.8;
    }
    .btn-start {
      padding: 24px;
      font-size: 1.2rem;
      border-radius: 100px;
      letter-spacing: 2px;
      box-shadow: 0 15px 35px var(--primary-glow);
    }
    @media (max-width: 640px) {
      .guide-grid { grid-template-columns: 1fr; }
      .guide-card { padding: 30px 20px; }
    }
    .form-container {
      max-width: 800px;
      margin: 0 auto;
      padding-bottom: 200px;
    }
    @media (max-width: 768px) {
      .form-container { padding-bottom: 400px; }
    }
    .form-header {
      margin-bottom: 30px;
      padding: 0;
      position: relative;
      border-radius: var(--radius-lg);
      overflow: hidden;
      min-height: 250px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      border: 1px solid var(--glass-border);
      box-shadow: 0 20px 80px rgba(0,0,0,0.6);
    }
    .header-visual {
      position: absolute;
      inset: 0;
      z-index: 0;
    }
    .header-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: brightness(0.6) contrast(1.1);
    }
    .header-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, transparent 0%, rgba(12, 12, 14, 0.5) 40%, var(--bg-color) 100%);
    }
    .header-content {
      position: relative;
      z-index: 1;
      padding: 40px;
    }
    .header-content h2 { 
      font-size: 2.5rem; 
      margin: 0; 
      line-height: 1;
      text-shadow: 0 5px 20px rgba(0,0,0,0.5);
    }
    .header-sub {
      color: var(--primary-color);
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-size: 0.8rem;
      margin-top: 10px;
    }
    .form-sections-container {
      display: flex;
      flex-direction: column;
      gap: 30px;
    }
    .form-section {
      background: rgba(12, 12, 14, 0.4);
      padding: 40px;
      border-radius: var(--radius-lg);
      backdrop-filter: blur(20px);
      border: 1px solid var(--glass-border);
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    .section-title {
      font-size: 1.4rem;
      margin-bottom: 30px;
      font-weight: 800;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .section-title::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--glass-border);
    }
    .basic-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 30px;
      margin: 40px 0;
    }
    .input-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .input-group label {
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--text-dim);
      padding-left: 4px;
    }
    .section-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }
    .btn-wheel-open {
      background: var(--surface-hover);
      border: 1px solid var(--primary-color);
      color: var(--primary-color);
      padding: 10px 24px;
      border-radius: 100px;
      font-size: 0.85rem;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.4s;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .btn-wheel-open:hover {
      background: var(--primary-gradient);
      color: #0c0c0e;
      border-color: transparent;
      box-shadow: 0 8px 20px var(--primary-glow);
    }
    .range-info {
      font-size: 0.8rem;
      color: var(--text-dim);
      background: var(--surface-hover);
      padding: 6px 16px;
      border-radius: 100px;
      font-weight: 700;
      border: 1px solid var(--glass-border);
    }
    .flavor-display {
      background: rgba(0,0,0,0.2);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
      padding: 30px;
      min-height: 120px;
    }
    .empty-flavor {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-dim);
      font-style: italic;
      font-size: 1rem;
      gap: 15px;
    }
    .score-card {
      background: var(--surface-color);
      padding: 30px;
      border-radius: var(--radius-md);
      border: 1px solid var(--glass-border);
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    .score-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .score-header label {
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-size: 0.9rem;
      color: var(--text-main);
    }
    .score-header .value {
      font-size: 1.6rem;
      font-weight: 900;
      color: var(--primary-color);
      font-family: var(--font-brand);
    }
    .btn-step {
      background: var(--surface-hover);
      border: 1px solid var(--glass-border);
      color: var(--text-main);
      width: 50px;
      height: 50px;
      border-radius: 100px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .btn-step:hover {
      background: var(--primary-gradient);
      color: #0c0c0e;
      border-color: transparent;
      transform: scale(1.1);
    }
    .section-badge {
      display: inline-block;
      font-size: 0.8rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #0c0c0e;
      background: var(--primary-gradient);
      padding: 10px 24px;
      border-radius: 100px;
      margin: 0;
    }
    .cva-section {
      margin-top: 60px;
      padding-top: 40px;
      border-top: 1px solid var(--glass-border);
    }
    .intensity-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 30px;
    }
    .intensity-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      align-items: center;
    }
    .intensity-header label {
      font-weight: 700;
      color: var(--text-dim);
      text-transform: uppercase;
      font-size: 0.8rem;
      letter-spacing: 1px;
    }
    .intensity-header span {
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--primary-color);
    }
    .flavor-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
    }
    .chip {
      background: var(--surface-hover);
      border: 1px solid var(--glass-border);
      color: var(--text-main);
      padding: 12px 24px;
      min-height: 48px;
      border-radius: 100px;
      cursor: pointer;
      font-size: 0.95rem;
      font-weight: 600;
      transition: all 0.4s;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    .chip.active {
      background: var(--primary-gradient);
      color: #0c0c0e;
      border-color: transparent;
      box-shadow: 0 10px 25px -5px var(--primary-glow);
    }
    .scoring-section {
      background: var(--surface-color) !important;
      padding: 40px;
      border-radius: var(--radius-lg);
      border: 1px solid var(--glass-border);
      margin-top: 60px;
      position: relative;
    }
    .scoring-section::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: var(--radius-lg);
      padding: 1px;
      background: linear-gradient(135deg, rgba(189, 142, 98, 0.4), transparent);
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      pointer-events: none;
    }
    
    input[type=range] {
      -webkit-appearance: none;
      width: 100%;
      background: transparent;
      padding: 10px 0;
      border: none;
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 28px;
      width: 28px;
      border-radius: 50%;
      background: var(--primary-color);
      background-image: var(--primary-gradient);
      cursor: pointer;
      margin-top: -10px;
      box-shadow: 0 4px 12px rgba(189, 142, 98, 0.4);
      border: 3px solid var(--bg-color);
      transition: all 0.3s;
    }
    input[type=range]::-webkit-slider-runnable-track {
      width: 100%;
      height: 10px;
      cursor: pointer;
      background: var(--surface-hover);
      border-radius: 100px;
      border: 1px solid var(--glass-border);
    }
    input[type=range]:focus {
      outline: none;
    }
    input[type=range]:focus::-webkit-slider-thumb {
      box-shadow: 0 0 0 6px var(--primary-glow);
      transform: scale(1.1);
    }

    .smart-suggestions {
      margin-bottom: 25px;
    }
    .suggestion-label {
      font-size: 0.7rem;
      color: var(--text-dim);
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: 1.5px;
      margin-bottom: 15px;
      display: block;
    }
    .suggestion-chips {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .suggestion-chip {
      background: rgba(255,255,255,0.03);
      border: 1px dashed var(--glass-border);
      color: var(--primary-color);
      padding: 8px 18px;
      border-radius: 100px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .suggestion-chip:hover {
      background: var(--primary-gradient);
      color: #0c0c0e;
      border: 1px solid transparent;
      transform: scale(1.05);
      box-shadow: 0 5px 15px var(--primary-glow);
    }
    .final-score-bar {
      margin-top: 60px;
      background: var(--surface-color);
      padding: 30px 40px;
      border-radius: var(--radius-lg);
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1px solid var(--glass-border);
    }
    .form-sticky-actions {
      position: fixed;
      bottom: 30px;
      left: 15px;
      right: 15px;
      max-width: 800px;
      margin: 0 auto;
      padding: 12px 20px;
      display: flex;
      align-items: center;
      gap: 15px;
      z-index: 1000;
      border-radius: 24px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.6);
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(22, 22, 26, 0.85);
      backdrop-filter: blur(30px);
    }
    .footer-visibility {
      padding-right: 15px;
      border-right: 1px solid rgba(255,255,255,0.1);
    }
    .footer-toggle .label-text {
      font-size: 0.8rem !important;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .footer-actions {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    
    @media (max-width: 768px) {
      .form-section { padding: 25px; }
      .header-content h2 { font-size: 2rem; }
      .form-sticky-actions { 
        bottom: 110px;
        padding: 10px 15px;
        gap: 10px;
      }
      .btn-submit { padding: 0 25px; font-size: 0.8rem; }
      .footer-toggle .label-text { display: none; }
      .footer-visibility { padding-right: 10px; }
    }
    .final-score-bar.specialty {
      background: var(--primary-gradient) !important;
      color: #0c0c0e !important;
      border: none;
    }
    .final-score-bar.specialty .score-label span, 
    .final-score-bar.specialty .final-value {
      color: #0c0c0e !important;
    }
    .final-score-bar .score-label span {
      display: block;
      font-size: 1rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: var(--text-dim);
    }
    .final-score-bar .final-value {
      font-size: 4rem;
      font-weight: 950;
      font-family: var(--font-brand);
      color: var(--primary-color);
      line-height: 1;
    }
    .w-full {
      width: 100%;
      height: 70px;
      font-size: 1.2rem;
      margin-top: 30px;
      border-radius: 100px;
    }
    .range-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-dim);
      margin-top: 8px;
    }
    .form-options {
       margin: 40px 0;
       padding-bottom: 20px;
       border-bottom: 1px solid var(--glass-border);
    }
    .checkbox-container {
      display: flex;
      align-items: center;
      gap: 15px;
      cursor: pointer;
      user-select: none;
      font-weight: 700;
      color: #ffffff;
      padding: 10px 0;
    }
    .checkbox-container input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
    }
    .checkmark {
      height: 28px;
      width: 28px;
      background-color: var(--surface-hover);
      border: 2px solid rgba(255,255,255,0.4);
      border-radius: 8px;
      position: relative;
      transition: all 0.3s;
      box-shadow: 0 0 15px rgba(0,0,0,0.5);
    }
    .checkmark:after {
      content: "";
      position: absolute;
      display: none;
      left: 9px;
      top: 5px;
      width: 6px;
      height: 12px;
      border: solid #0c0c0e;
      border-width: 0 3px 3px 0;
      transform: rotate(45deg);
    }
    .checkbox-container input:checked ~ .checkmark {
      background-color: var(--primary-color);
      border-color: var(--primary-color);
    }
    .checkbox-container input:checked ~ .checkmark:after {
      display: block;
    }
    .label-text { font-size: 1rem; }

    .photo-upload-section {
      grid-column: 1 / -1;
      margin-top: 20px;
    }
    .photo-label {
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--text-dim);
      margin-bottom: 12px;
      display: block;
    }
    .photo-box {
      width: 100%;
      height: 200px;
      background: var(--surface-hover);
      border: 2px dashed var(--glass-border);
      border-radius: var(--radius-md);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      overflow: hidden;
      position: relative;
      transition: all 0.3s;
    }
    .photo-box:hover {
      border-color: var(--primary-color);
      background: rgba(189, 142, 98, 0.05);
    }
    .photo-box.has-image {
      border-style: solid;
      border-color: var(--glass-border);
    }
    .photo-preview {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .photo-placeholder {
      text-align: center;
      color: var(--text-dim);
    }
    .photo-placeholder .icon {
      font-size: 2.5rem;
      display: block;
      margin-bottom: 10px;
    }
    .photo-placeholder span:not(.icon) {
      font-weight: 700;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .photo-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s;
      color: white;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .photo-box:hover .photo-overlay {
      opacity: 1;
    }
  `]
})
export class CuppingFormComponent implements OnInit {
  private cuppingService = inject(CuppingService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private ts = inject(TranslationService);
  private auth = inject(AuthService);
  t = this.ts.t();

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
    finalScore: 80,
    timestamp: null
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
    this.loading = true;
    try {
      // Phase 1: Image Upload (if selected)
      if (this.productImageFile) {
        try {
          const photoUrl = await this.cuppingService.uploadProductImage(this.productImageFile);
          this.session.productImageUrl = photoUrl;
        } catch (uploadErr: any) {
          const msg = uploadErr?.message || '';
          if (msg.includes('NETWORK_ERROR')) {
            alert('⚠️ Gagal mengunggah gambar. Periksa koneksi internet Anda dan coba lagi.');
          } else if (msg.includes('PERMISSION_DENIED')) {
            alert('⚠️ Anda tidak memiliki izin untuk mengunggah gambar. Silakan login ulang.');
          } else {
            alert('⚠️ Gagal mengunggah gambar. Sesi akan disimpan tanpa foto.');
          }
          console.error('Image upload failed:', uploadErr);
          // Continue saving without the image
          this.session.productImageUrl = undefined;
        }
      }

      // Phase 2: Save or Update Session
      if (this.isEditMode && this.editId) {
        await this.cuppingService.updateCupping(this.editId, this.session);
        this.router.navigate(['/result', this.editId]);
      } else {
        const docRef = await this.cuppingService.addCupping(this.session);
        this.router.navigate(['/result', docRef.id]);
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
}
