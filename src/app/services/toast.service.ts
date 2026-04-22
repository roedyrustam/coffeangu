import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    callback: () => void;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<Toast[]>([]);
  private counter = 0;

  show(message: string, type: ToastType = 'info', duration: number = 5000, action?: Toast['action']) {
    const id = ++this.counter;
    const toast: Toast = { id, message, type, duration, action };
    
    this.toasts.update(current => [...current, toast]);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }

    return id;
  }

  success(message: string, duration?: number) {
    return this.show(message, 'success', duration);
  }

  error(message: string, duration?: number) {
    return this.show(message, 'error', duration);
  }

  info(message: string, duration?: number) {
    return this.show(message, 'info', duration);
  }

  remove(id: number) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}
