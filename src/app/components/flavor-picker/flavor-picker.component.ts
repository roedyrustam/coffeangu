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
      background: rgba(0, 0, 0, 0.95);
      backdrop-filter: blur(20px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .picker-modal {
      background: var(--surface-color);
      width: 100%;
      max-width: 900px;
      height: 90vh;
      border-radius: var(--radius-lg);
      border: 1px solid var(--glass-border);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 40px 120px -20px rgba(0,0,0,0.9);
      position: relative;
    }
    .picker-modal::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: var(--radius-lg);
      padding: 1px;
      background: linear-gradient(135deg, rgba(189, 142, 98, 0.3), transparent);
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      pointer-events: none;
    }
    .picker-header {
      padding: 40px;
      background: rgba(0,0,0,0.2);
      border-bottom: 1px solid var(--glass-border);
    }
    .header-main {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .header-main h2 {
      font-size: 2.5rem;
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0;
    }
    .btn-close {
      background: var(--surface-hover);
      border: 1px solid var(--glass-border);
      color: var(--text-dim);
      width: 50px;
      height: 50px;
      border-radius: 100px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      transition: all 0.3s;
    }
    .btn-close:hover {
      background: var(--primary-gradient);
      color: #0c0c0e;
      border-color: transparent;
      transform: rotate(90deg);
    }
    .breadcrumb {
      display: flex;
      gap: 12px;
      font-size: 0.95rem;
      color: var(--text-dim);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .crumb {
      cursor: pointer;
      transition: color 0.3s;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .crumb:hover { color: var(--primary-color); }
    .crumb.active { color: var(--text-main); font-weight: 900; }
    .chevron { opacity: 0.5; font-size: 1.2rem; }

    .picker-content {
      flex: 1;
      padding: 40px;
      overflow-y: auto;
    }
    .grid-layout {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 25px;
    }
    .flavor-card {
      position: relative;
      height: 140px;
      border-radius: var(--radius-md);
      background: var(--surface-hover);
      border: 2px solid transparent;
      cursor: pointer;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .flavor-card:hover {
      transform: translateY(-8px);
    }
    .card-bg {
      position: absolute;
      inset: 0;
      opacity: 0.15;
      transition: opacity 0.4s;
    }
    .flavor-card:hover .card-bg {
      opacity: 0.3;
    }
    .card-name {
      position: relative;
      z-index: 2;
      font-weight: 800;
      text-align: center;
      font-size: 1.1rem;
      color: var(--text-main);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .card-count {
      position: absolute;
      bottom: 15px;
      right: 15px;
      font-size: 0.75rem;
      color: var(--text-dim);
      font-weight: 800;
      text-transform: uppercase;
    }
    .back-card {
      background: transparent;
      border: 2px dashed var(--glass-border);
      flex-direction: column;
      gap: 10px;
    }
    .back-card .icon { font-size: 2rem; color: var(--text-dim); }
    .flavor-card.selected {
      background: var(--surface-color);
      border-width: 3px;
    }
    .flavor-card.selected .card-bg {
      opacity: 0.5;
    }
    .selection-indicator {
      position: absolute;
      top: 15px;
      right: 15px;
      background: var(--primary-gradient);
      color: #0c0c0e;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      font-weight: 900;
      box-shadow: 0 4px 10px var(--primary-glow);
    }

    .picker-footer {
      padding: 40px;
      background: rgba(0,0,0,0.3);
      border-top: 1px solid var(--glass-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 40px;
    }
    .selected-summary {
      flex: 1;
    }
    .summary-label {
      display: block;
      font-size: 0.8rem;
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 15px;
      font-weight: 800;
    }
    .mini-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .mini-chip {
      background: var(--primary-gradient);
      padding: 8px 18px;
      border-radius: 100px;
      font-size: 0.85rem;
      color: #0c0c0e;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px var(--primary-glow);
      transition: all 0.3s;
    }
    .mini-chip:hover {
      transform: scale(1.05);
      background: var(--accent-neon);
    }
    .remove { font-size: 0.8rem; opacity: 0.7; }
    .placeholder { color: var(--text-dim); font-size: 1rem; font-style: italic; }
    
    .btn-primary {
      padding: 0 50px;
      border-radius: 100px;
      height: 60px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    @media (max-width: 640px) {
      .picker-modal { height: 100vh; border-radius: 0; }
      .grid-layout { grid-template-columns: repeat(2, 1fr); gap: 15px; }
      .picker-content { padding: 20px; }
      .picker-header { padding: 20px; }
      .picker-footer { flex-direction: column; align-items: stretch; gap: 25px; padding: 20px; }
      .header-main h2 { font-size: 1.8rem; }
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
