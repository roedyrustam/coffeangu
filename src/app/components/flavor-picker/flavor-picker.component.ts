import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCA_FLAVOR_WHEEL, FlavorNode } from '../../models/flavor-wheel.data';

@Component({
  selector: 'app-flavor-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="picker-overlay animate-fade" (click)="close.emit()">
      <div class="picker-modal" (click)="$event.stopPropagation()">
        <header class="picker-header">
          <div class="header-main">
            <h2 class="brand-font">SCA Flavor Wheel</h2>
            <button class="btn-close" (click)="close.emit()">✕</button>
          </div>
          
          <nav class="breadcrumb">
            <span (click)="resetState()" class="crumb">Wheel</span>
            <span *ngFor="let node of path()" class="crumb active">
              <span class="chevron">›</span> {{ node.name }}
            </span>
          </nav>
        </header>

        <div class="picker-content custom-scrollbar">
          <!-- Level 0: Main Categories -->
          <div class="grid-layout" *ngIf="path().length === 0">
            <div *ngFor="let category of wheelData" 
                 class="flavor-card" 
                 [style.border-color]="category.color"
                 (click)="navigateTo(category)">
              <div class="card-bg" [style.background-color]="category.color"></div>
              <span class="card-name">{{ category.name }}</span>
              <span class="card-count" *ngIf="category.sub">{{ category.sub.length }} sub</span>
            </div>
          </div>

          <!-- Level 1+: Sub-categories or Descriptors -->
          <div class="grid-layout sub-grid" *ngIf="path().length > 0">
            <!-- Back Button -->
            <div class="flavor-card back-card" (click)="goBack()">
              <span class="icon">←</span>
              <span class="card-name">Back</span>
            </div>

            <div *ngFor="let node of currentNodes()" 
                 class="flavor-card" 
                 [class.selected]="isSelected(node.name)"
                 [style.border-color]="node.color"
                 (click)="handleNodeClick(node)">
              <div class="card-bg" [style.background-color]="node.color"></div>
              <span class="card-name">{{ node.name }}</span>
              <div class="selection-indicator" *ngIf="isSelected(node.name)">✓</div>
            </div>
          </div>
        </div>

        <footer class="picker-footer">
          <div class="selected-summary">
            <span class="summary-label">Selected:</span>
            <div class="mini-chips">
              <span *ngFor="let note of selectedNotes" class="mini-chip" (click)="toggleNote(note)">
                {{ note }} <span class="remove">✕</span>
              </span>
              <span *ngIf="selectedNotes.length === 0" class="placeholder">No flavors selected</span>
            </div>
          </div>
          <button class="btn-primary" (click)="close.emit()">Done</button>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .picker-overlay {
      position: fixed;
      inset: 0;
      background: rgba(10, 10, 10, 0.9);
      backdrop-filter: blur(15px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .picker-modal {
      background: var(--surface-color);
      width: 100%;
      max-width: 800px;
      height: 85vh;
      border-radius: 30px;
      border: 1px solid var(--glass-border);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 40px 100px -20px rgba(0,0,0,0.8);
    }
    .picker-header {
      padding: 30px;
      background: rgba(255,255,255,0.02);
      border-bottom: 1px solid var(--glass-border);
    }
    .header-main {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    .header-main h2 {
      font-size: 2rem;
      color: var(--primary-color);
      margin: 0;
    }
    .btn-close {
      background: var(--surface-hover);
      border: 1px solid var(--glass-border);
      color: var(--text-dim);
      width: 44px;
      height: 44px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      transition: all 0.3s;
    }
    .btn-close:hover {
      background: #e63946;
      color: white;
      border-color: #e63946;
    }
    .breadcrumb {
      display: flex;
      gap: 8px;
      font-size: 0.9rem;
      color: var(--text-dim);
    }
    .crumb {
      cursor: pointer;
      transition: color 0.2s;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .crumb:hover { color: var(--primary-color); }
    .crumb.active { color: var(--text-main); font-weight: 600; }
    .chevron { opacity: 0.5; }

    .picker-content {
      flex: 1;
      padding: 30px;
      overflow-y: auto;
    }
    .grid-layout {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 20px;
    }
    .flavor-card {
      position: relative;
      height: 120px;
      border-radius: 20px;
      background: var(--surface-hover);
      border: 2px solid transparent;
      cursor: pointer;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 15px;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .flavor-card:hover {
      transform: translateY(-5px);
    }
    .card-bg {
      position: absolute;
      inset: 0;
      opacity: 0.1;
      transition: opacity 0.3s;
    }
    .flavor-card:hover .card-bg {
      opacity: 0.2;
    }
    .card-name {
      position: relative;
      z-index: 2;
      font-weight: 700;
      text-align: center;
      font-size: 1rem;
      color: var(--text-main);
    }
    .card-count {
      position: absolute;
      bottom: 12px;
      right: 12px;
      font-size: 0.7rem;
      color: var(--text-dim);
      font-weight: 600;
      text-transform: uppercase;
    }
    .back-card {
      background: transparent;
      border: 2px dashed var(--glass-border);
      flex-direction: column;
      gap: 8px;
    }
    .back-card .icon { font-size: 1.5rem; color: var(--text-dim); }
    .flavor-card.selected {
      background: var(--surface-color);
      border-width: 3px;
    }
    .flavor-card.selected .card-bg {
      opacity: 0.4;
    }
    .selection-indicator {
      position: absolute;
      top: 10px;
      right: 10px;
      background: var(--primary-color);
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
    }

    .picker-footer {
      padding: 30px;
      background: rgba(255,255,255,0.03);
      border-top: 1px solid var(--glass-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 30px;
    }
    .selected-summary {
      flex: 1;
    }
    .summary-label {
      display: block;
      font-size: 0.75rem;
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 12px;
    }
    .mini-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .mini-chip {
      background: var(--surface-hover);
      border: 1px solid var(--glass-border);
      padding: 6px 12px;
      border-radius: 100px;
      font-size: 0.8rem;
      color: var(--primary-color);
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .mini-chip:hover { border-color: #e63946; color: #e63946; }
    .remove { font-size: 0.7rem; opacity: 0.5; }
    .placeholder { color: var(--text-dim); font-size: 0.9rem; font-style: italic; }
    
    .btn-primary {
      padding: 15px 40px;
      border-radius: 100px;
      height: 55px;
      font-weight: 700;
      box-shadow: 0 10px 20px -5px var(--primary-glow);
    }

    @media (max-width: 600px) {
      .picker-modal { height: 100vh; border-radius: 0; }
      .grid-layout { grid-template-columns: repeat(2, 1fr); }
      .picker-footer { flex-direction: column; align-items: stretch; gap: 20px; }
      .btn-primary { width: 100%; }
    }
  `]
})
export class FlavorPickerComponent {
  @Input() selectedNotes: string[] = [];
  @Output() notesChanged = new EventEmitter<string[]>();
  @Output() close = new EventEmitter<void>();

  wheelData = SCA_FLAVOR_WHEEL;
  path = signal<FlavorNode[]>([]);
  currentNodes = signal<FlavorNode[]>([]);

  navigateTo(node: FlavorNode) {
    if (node.sub) {
      const currentPath = this.path();
      this.path.set([...currentPath, node]);
      this.currentNodes.set(node.sub);
    } else {
      this.toggleNote(node.name);
    }
  }

  handleNodeClick(node: FlavorNode) {
    if (node.sub) {
      this.navigateTo(node);
    } else {
      this.toggleNote(node.name);
    }
  }

  goBack() {
    const currentPath = [...this.path()];
    currentPath.pop();
    this.path.set(currentPath);
    
    if (currentPath.length === 0) {
      this.currentNodes.set([]);
    } else {
      const parent = currentPath[currentPath.length - 1];
      this.currentNodes.set(parent.sub || []);
    }
  }

  resetState() {
    this.path.set([]);
    this.currentNodes.set([]);
  }

  toggleNote(note: string) {
    const index = this.selectedNotes.indexOf(note);
    if (index > -1) {
      this.selectedNotes.splice(index, 1);
    } else {
      this.selectedNotes.push(note);
    }
    this.notesChanged.emit([...this.selectedNotes]);
  }

  isSelected(note: string): boolean {
    return this.selectedNotes.includes(note);
  }
}
