import { Injectable, inject, signal } from '@angular/core';
import { VoiceReaderService } from './voice-reader.service';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration?: number; // ms
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<Toast[]>([]);
  #id = 0;
  private readonly voiceReader = inject(VoiceReaderService);

  show(message: string, type: ToastType = 'info', duration = 3000) {
    const id = this.#id++;
    this.toasts.update(list => [...list, { id, message, type, duration }]);
    if (this.voiceReader.isEnabled()) {
      this.voiceReader.announce(this.buildSpokenMessage(message, type));
    }

    // auto-cerrar
    const timer = setTimeout(() => this.dismiss(id), duration);
    // (opcional) guarda el timer si quisieras pausar con hover
    return id;
  }

  dismiss(id: number) {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  clear() {
    this.toasts.set([]);
  }

  private buildSpokenMessage(message: string, type: ToastType): string {
    const labelMap: Record<ToastType, string> = {
      success: 'Éxito',
      error: 'Error',
      info: 'Aviso',
      warning: 'Alerta'
    };
    const prefix = labelMap[type] ?? 'Aviso';
    return `${prefix}: ${message}`;
  }
}
