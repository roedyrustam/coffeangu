import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toastService.toasts()" 
           class="toast-item glass-card" 
           [class]="toast.type"
           (click)="toastService.remove(toast.id)">
        <div class="toast-icon">
          <ng-container [ngSwitch]="toast.type">
            <svg *ngSwitchCase="'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <svg *ngSwitchCase="'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            <svg *ngSwitchCase="'info'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            <svg *ngSwitchCase="'warning'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </ng-container>
        </div>
        <div class="toast-content">
          <p class="toast-message">{{ toast.message }}</p>
          <button *ngIf="toast.action" 
                  (click)="$event.stopPropagation(); toast.action.callback(); toastService.remove(toast.id)" 
                  class="toast-action-btn">
            {{ toast.action.label }}
          </button>
        </div>
        <button class="toast-close" (click)="$event.stopPropagation(); toastService.remove(toast.id)">×</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 110px;
      right: 25px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
      width: calc(100vw - 50px);
    }

    .toast-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 16px 20px;
      border-radius: 18px;
      border: 1px solid var(--glass-border);
      box-shadow: 0 15px 40px rgba(0,0,0,0.3);
      animation: toastSlideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }

    .toast-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: var(--primary-gradient);
    }

    .toast-item.success::before { background: #2ecc71; }
    .toast-item.error::before { background: #ff4757; }
    .toast-item.info::before { background: var(--primary-color); }
    .toast-item.warning::before { background: #f1c40f; }

    .toast-icon {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }

    .toast-icon svg { width: 100%; height: 100%; }
    .success .toast-icon { color: #2ecc71; }
    .error .toast-icon { color: #ff4757; }
    .info .toast-icon { color: var(--primary-color); }
    .warning .toast-icon { color: #f1c40f; }

    .toast-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .toast-message {
      margin: 0;
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--text-main);
      line-height: 1.4;
    }

    .toast-action-btn {
      align-self: flex-start;
      background: var(--primary-gradient);
      color: #0c0c0e;
      border: none;
      padding: 5px 15px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 900;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.3s;
    }

    .toast-action-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 5px 15px var(--primary-glow);
    }

    .toast-close {
      background: transparent;
      border: none;
      color: var(--text-dim);
      font-size: 1.5rem;
      line-height: 1;
      cursor: pointer;
      padding: 0;
      opacity: 0.5;
      transition: opacity 0.3s;
    }

    .toast-close:hover { opacity: 1; }

    @keyframes toastSlideIn {
      from { transform: translateX(100%) scale(0.8); opacity: 0; }
      to { transform: translateX(0) scale(1); opacity: 1; }
    }

    @media (max-width: 768px) {
      .toast-container { top: 20px; right: 25px; }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
