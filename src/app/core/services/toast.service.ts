import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'info' | 'error';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  duree: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private prochainId = 1;

  success(message: string, duree = 3000): void {
    this.afficher('success', message, duree);
  }

  info(message: string, duree = 3000): void {
    this.afficher('info', message, duree);
  }

  error(message: string, duree = 4000): void {
    this.afficher('error', message, duree);
  }

  fermer(id: number): void {
    this._toasts.update(liste => liste.filter(t => t.id !== id));
  }

  private afficher(type: ToastType, message: string, duree: number): void {
    const toast: Toast = {
      id: this.prochainId++,
      type,
      message,
      duree,
    };
    this._toasts.update(liste => [...liste, toast]);

    if (duree > 0) {
      setTimeout(() => this.fermer(toast.id), duree);
    }
  }
}