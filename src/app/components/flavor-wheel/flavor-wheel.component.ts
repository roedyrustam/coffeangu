import { Component, Input, Output, EventEmitter, signal, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCA_FLAVOR_WHEEL, FlavorNode } from '../../models/flavor-wheel.data';

@Component({
  selector: 'app-flavor-wheel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="wheel-overlay animate-fade" (click)="close.emit()">
      <div class="wheel-container" (click)="$event.stopPropagation()" #container>
        <header class="wheel-header">
          <div class="header-main">
            <h2 class="brand-font">Dynamic Flavor Wheel</h2>
            <button class="btn-close" (click)="close.emit()">✕</button>
          </div>
          <nav class="breadcrumb">
            <span (click)="resetWheel()" class="crumb">Wheel</span>
            <span *ngFor="let node of path()" class="crumb active">
              <span class="chevron">›</span> {{ node.name }}
            </span>
          </nav>
        </header>

        <div class="wheel-viewport">
          <div class="wheel-svg-wrapper" 
               [style.transform]="'rotate(' + rotation() + 'deg) scale(' + zoomLevel() + ')'"
               (mousedown)="onMouseDown($event)"
               (touchstart)="onTouchStart($event)"
               #wheelWrapper>
            <svg viewBox="0 0 500 500" class="flavor-svg">
              <!-- Definitions for filters/glows -->
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <g transform="translate(250, 250)">
                <!-- Main Categories (Outer Ring) -->
                <g *ngFor="let cat of wheelData; let i = index">
                  <path [attr.d]="getArcPath(i, wheelData.length, 120, 240)"
                        [attr.fill]="cat.color"
                        [class.active]="path().includes(cat)"
                        (click)="selectCategory(cat, $event)"
                        class="wheel-sector" />
                  <text [attr.transform]="getTextTransform(i, wheelData.length, 180)"
                        class="sector-label">
                    {{ cat.name }}
                  </text>
                </g>

                <!-- Inner Ring: Children of active path -->
                <g *ngIf="currentNodes().length > 0">
                  <g *ngFor="let node of currentNodes(); let j = index">
                    <path [attr.d]="getArcPath(j, currentNodes().length, 0, 110)"
                          [attr.fill]="node.color"
                          [class.selected]="isSelected(node.name)"
                          (click)="handleNodeClick(node, $event)"
                          class="wheel-sector sub-sector" />
                    <text [attr.transform]="getTextTransform(j, currentNodes().length, 60)"
                          class="sector-label sub-label">
                      {{ node.name }}
                    </text>
                  </g>
                </g>
              </g>
            </svg>
          </div>

          <!-- Selection Indicator -->
          <div class="selection-indicator-ring"></div>
        </div>

        <footer class="wheel-footer">
          <div class="selected-list custom-scrollbar">
            <span *ngFor="let note of selectedNotes" class="note-chip" (click)="toggleNote(note, $event)">
              {{ note }} <span class="remove">✕</span>
            </span>
            <span *ngIf="selectedNotes.length === 0" class="placeholder">Select from the wheel...</span>
          </div>
          <button class="btn-confirm" (click)="close.emit()">Finish Sensory Log</button>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .wheel-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.92);
      backdrop-filter: blur(30px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .wheel-container {
      background: #0c0c0e;
      width: 100%;
      max-width: 800px;
      height: 90vh;
      border-radius: 40px;
      border: 1px solid var(--glass-border);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 50px 100px rgba(0,0,0,0.8);
      position: relative;
    }
    .wheel-header {
      padding: 30px 40px;
      text-align: center;
    }
    .header-main {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .header-main h2 {
      font-size: 2.2rem;
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0;
    }
    .wheel-instruction {
      color: var(--text-dim);
      font-size: 0.9rem;
      letter-spacing: 1px;
      text-transform: uppercase;
      font-weight: 700;
    }
    .btn-close {
      background: var(--surface-hover);
      border: 1px solid var(--glass-border);
      color: var(--text-dim);
      width: 44px;
      height: 44px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.2rem;
    }

    .wheel-viewport {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      touch-action: none;
    }
    .wheel-svg-wrapper {
      width: 90%;
      height: 90%;
      max-width: 600px;
      transition: transform 0.1s ease-out;
      cursor: grab;
    }
    .wheel-svg-wrapper:active { cursor: grabbing; }
    
    .flavor-svg {
      width: 100%;
      height: 100%;
    }
    .wheel-sector {
      stroke: rgba(0,0,0,0.3);
      stroke-width: 1px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      opacity: 0.8;
    }
    .wheel-sector:hover {
      opacity: 1;
      filter: url(#glow);
      transform: scale(1.02);
    }
    .wheel-sector.active {
      opacity: 1;
      stroke: white;
      stroke-width: 2px;
    }
    .wheel-sector.selected {
      stroke: var(--accent-neon);
      stroke-width: 3px;
    }
    
    .sector-label {
      fill: white;
      font-size: 10px;
      font-weight: 800;
      text-anchor: middle;
      pointer-events: none;
      text-transform: uppercase;
    }
    .sub-label { font-size: 8px; fill: rgba(255,255,255,0.9); }

    .wheel-footer {
      padding: 30px 40px;
      background: rgba(255,255,255,0.03);
      border-top: 1px solid var(--glass-border);
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .selected-list {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      max-height: 80px;
      overflow-y: auto;
    }
    .note-chip {
      background: var(--primary-gradient);
      color: #0c0c0e;
      padding: 8px 16px;
      border-radius: 100px;
      font-size: 0.85rem;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .btn-confirm {
      width: 100%;
      padding: 20px;
      background: var(--primary-gradient);
      border: none;
      border-radius: 100px;
      color: #0c0c0e;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 2px;
      cursor: pointer;
      font-size: 1rem;
    }
    
    @media (max-width: 640px) {
      .wheel-container { height: 100vh; border-radius: 0; }
      .header-main h2 { font-size: 1.6rem; }
    }
    .breadcrumb {
      display: flex;
      justify-content: center;
      gap: 10px;
      font-size: 0.8rem;
      color: var(--text-dim);
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .crumb { cursor: pointer; }
    .crumb.active { color: var(--primary-color); }
    .chevron { opacity: 0.5; }
  `]
})
export class DynamicFlavorWheelComponent implements AfterViewInit {
  @Input() selectedNotes: string[] = [];
  @Output() notesChanged = new EventEmitter<string[]>();
  @Output() close = new EventEmitter<void>();

  wheelData = SCA_FLAVOR_WHEEL;
  path = signal<FlavorNode[]>([]);
  currentNodes = signal<FlavorNode[]>([]);
  rotation = signal(0);
  zoomLevel = signal(1);

  @ViewChild('wheelWrapper') wheelWrapper!: ElementRef;
  
  private isDragging = false;
  private startAngle = 0;
  private startRotation = 0;
  private velocity = 0;
  private lastAngle = 0;
  private lastTime = 0;
  private rafId: number | null = null;
  private friction = 0.96; // Premium inertia damping

  ngAfterViewInit() {
    this.currentNodes.set([]);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('touchmove', this.onTouchMove, { passive: false });
    window.addEventListener('touchend', this.onMouseUp);
  }

  onMouseDown(event: MouseEvent) {
    this.stopInertia();
    this.isDragging = true;
    this.startAngle = this.getAngle(event.clientX, event.clientY);
    this.startRotation = this.rotation();
    this.lastAngle = this.startAngle;
    this.lastTime = performance.now();
  }

  onTouchStart(event: TouchEvent) {
    this.stopInertia();
    this.isDragging = true;
    const touch = event.touches[0];
    this.startAngle = this.getAngle(touch.clientX, touch.clientY);
    this.startRotation = this.rotation();
    this.lastAngle = this.startAngle;
    this.lastTime = performance.now();
  }

  private onMouseMove = (event: MouseEvent) => {
    if (!this.isDragging) return;
    this.handleMove(event.clientX, event.clientY);
  };

  private onTouchMove = (event: TouchEvent | any) => {
    if (!this.isDragging) return;
    const touch = event.touches[0];
    this.handleMove(touch.clientX, touch.clientY);
  };

  private handleMove(clientX: number, clientY: number) {
    const currentAngle = this.getAngle(clientX, clientY);
    const currentTime = performance.now();
    
    const deltaAngle = currentAngle - this.lastAngle;
    const deltaTime = currentTime - this.lastTime;
    
    if (deltaTime > 0) {
      this.velocity = (deltaAngle / deltaTime) * 16; // Normalizing velocity
    }

    const totalDelta = currentAngle - this.startAngle;
    this.rotation.set(this.startRotation + totalDelta);
    
    this.lastAngle = currentAngle;
    this.lastTime = currentTime;
  }

  private onMouseUp = () => {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.startInertia();
  };

  private startInertia() {
    const step = () => {
      if (Math.abs(this.velocity) < 0.1) {
        this.stopInertia();
        return;
      }
      
      this.rotation.update(r => r + this.velocity);
      this.velocity *= this.friction;
      this.rafId = requestAnimationFrame(step);
    };
    this.rafId = requestAnimationFrame(step);
  }

  private stopInertia() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.velocity = 0;
  }

  private getAngle(x: number, y: number): number {
    const rect = this.wheelWrapper.nativeElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    return Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
  }

  getArcPath(index: number, total: number, innerRadius: number, outerRadius: number): string {
    const angleStep = 360 / total;
    const startAngle = index * angleStep;
    const endAngle = (index + 1) * angleStep;
    
    // Slight gap between sectors
    const padding = 1;
    const s = startAngle + padding;
    const e = endAngle - padding;

    const x1 = outerRadius * Math.cos(this.toRad(s - 90));
    const y1 = outerRadius * Math.sin(this.toRad(s - 90));
    const x2 = outerRadius * Math.cos(this.toRad(e - 90));
    const y2 = outerRadius * Math.sin(this.toRad(e - 90));
    const x3 = innerRadius * Math.cos(this.toRad(e - 90));
    const y3 = innerRadius * Math.sin(this.toRad(e - 90));
    const x4 = innerRadius * Math.cos(this.toRad(s - 90));
    const y4 = innerRadius * Math.sin(this.toRad(s - 90));

    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 0 0 ${x4} ${y4} Z`;
  }

  getTextTransform(index: number, total: number, radius: number): string {
    const angle = (index + 0.5) * (360 / total) - 90;
    return `rotate(${angle}) translate(${radius}, 0) rotate(${-angle + 90})`;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  selectCategory(cat: FlavorNode, event: MouseEvent) {
    event.stopPropagation();
    if (this.path().includes(cat)) {
      this.resetWheel();
    } else {
      this.path.set([cat]);
      this.currentNodes.set(cat.sub || []);
      this.zoomLevel.set(1.2);
    }
  }

  handleNodeClick(node: FlavorNode, event: MouseEvent) {
    event.stopPropagation();
    if (node.sub) {
      this.path.set([...this.path(), node]);
      this.currentNodes.set(node.sub);
    } else {
      this.toggleNote(node.name, event);
    }
  }

  resetWheel() {
    this.path.set([]);
    this.currentNodes.set([]);
    this.zoomLevel.set(1);
    this.rotation.set(0);
  }

  toggleNote(note: string, event: MouseEvent) {
    event.stopPropagation();
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
