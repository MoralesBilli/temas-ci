import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

interface SpeechRecognitionResultItem {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult extends ArrayLike<SpeechRecognitionResultItem> {
  readonly isFinal?: boolean;
}

interface SpeechRecognitionEvent extends Event {
  readonly results: ArrayLike<SpeechRecognitionResult>;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message?: string;
}

const NUMBER_WORD_MAP: Record<string, string> = {
  cero: '0',
  uno: '1', una: '1', un: '1',
  dos: '2',
  tres: '3',
  cuatro: '4',
  cinco: '5',
  seis: '6',
  siete: '7',
  ocho: '8',
  nueve: '9',
  diez: '10',
  once: '11',
  doce: '12',
  trece: '13',
  catorce: '14',
  quince: '15',
  punto: '.',
  coma: '.',
};

interface SpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives?: number;
  onaudiostart: (() => void) | null;
  onaudioend: (() => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onstart: (() => void) | null;
  abort(): void;
  start(): void;
  stop(): void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognition;

declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
    SpeechRecognition?: SpeechRecognitionConstructor;
  }
}

@Injectable({ providedIn: 'root' })
export class VoiceCommandService {
  private readonly doc = inject(DOCUMENT);
  private readonly recognition = this.createRecognition();
  private readonly listeningSignal = signal(false);
  private lastEditableTarget: HTMLElement | null = null;

  readonly listening = this.listeningSignal.asReadonly();

  isSupported(): boolean {
    return Boolean(this.recognition);
  }

  isListening(): boolean {
    return this.listening();
  }

  start(): void {
    if (!this.recognition || this.listening()) {
      this.log('No se puede iniciar reconocimiento: soportado?', Boolean(this.recognition), 'escuchando?', this.listening());
      return;
    }
    try {
      this.lastEditableTarget = this.captureEditableTarget();
      this.log('Iniciando reconocimiento de voz');
      this.recognition.start();
    } catch {
      // recognition.start() throws if called too quickly; ignore to avoid crashes
      this.log('SpeechRecognition.start lanzó una excepción (probablemente llamada repetida)');
    }
  }

  stop(): void {
    if (!this.recognition || !this.listening()) {
      this.log('Stop ignorado: no hay reconocimiento activo');
      return;
    }
    this.log('Deteniendo reconocimiento de voz');
    this.recognition.stop();
    this.lastEditableTarget = null;
  }

  private createRecognition(): SpeechRecognition | null {
    if (typeof globalThis === 'undefined') {
      return null;
    }
    const globalWindow = globalThis as typeof globalThis & Window;
    const ctor = globalWindow.SpeechRecognition ?? globalWindow.webkitSpeechRecognition;
    if (!ctor) {
      return null;
    }
    const recognition = new ctor();
    recognition.lang = 'es-MX';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      this.listeningSignal.set(true);
      this.log('Reconocimiento ON: escuchando');
    };
    recognition.onend = () => {
      this.listeningSignal.set(false);
      this.log('Reconocimiento OFF: dejó de escuchar');
      this.lastEditableTarget = null;
    };
    recognition.onerror = event => {
      this.listeningSignal.set(false);
      this.lastEditableTarget = null;
      const speechError = event as SpeechRecognitionErrorEvent;
      if (speechError.error === 'no-speech') {
        this.log('No se detectó voz. Verifica tu micrófono e intenta hablar de nuevo.');
      } else if (speechError.error === 'audio-capture') {
        this.log('No se pudo acceder al micrófono. Revisa los permisos del navegador.');
      } else {
        this.log('Error de reconocimiento', event);
      }
    };
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = this.extractTranscript(event);
      if (transcript) {
        this.log('Resultado detectado:', transcript);
        this.handleTranscript(transcript);
      }
      this.log('Evento de resultado procesado', transcript || '[vacío]');
      this.lastEditableTarget = null;
    };
    return recognition;
  }

  private extractTranscript(event: SpeechRecognitionEvent): string {
    const firstResult = event.results?.[0];
    const firstAlternative = firstResult?.[0];
    return (firstAlternative?.transcript ?? '').trim();
  }

  private handleTranscript(transcript: string): void {
    if (!transcript) {
      this.log('Transcripción vacía, se ignora');
      return;
    }
    this.log('Procesando transcripción:', transcript);
    if (this.insertIntoActiveField(transcript)) {
      this.log('Escritura completada en el campo activo');
      return;
    }
    const normalized = this.normalizeText(transcript);
    if (!normalized) {
      this.log('Transcripción no produce texto normalizado, se ignora');
      return;
    }
    this.log('Buscando elemento que coincida con:', normalized);
    if (this.focusFieldByLabel(normalized)) {
      this.log('Se enfocó un campo mediante su etiqueta');
      return;
    }
    this.triggerMatchingElement(normalized);
  }

  private insertIntoActiveField(text: string): boolean {
    const active = (this.lastEditableTarget ?? this.doc.activeElement) as Element | null;
    if (!active) {
      return false;
    }
    if (active instanceof HTMLInputElement && this.isTextualInput(active)) {
      const adapted = this.transformTextForField(active, text);
      this.fillInput(active, adapted);
      this.log('Insertando texto en input', active.name || active.id || active.type);
      this.lastEditableTarget = null;
      return true;
    }
    if (active instanceof HTMLTextAreaElement) {
      this.fillInput(active, text);
      this.log('Insertando texto en textarea', active.name || active.id);
      this.lastEditableTarget = null;
      return true;
    }
    if (active instanceof HTMLElement && active.isContentEditable) {
      active.textContent = text;
      active.dispatchEvent(new Event('input', { bubbles: true }));
      active.dispatchEvent(new Event('change', { bubbles: true }));
      active.blur();
      this.log('Insertando texto en elemento contenteditable');
      this.lastEditableTarget = null;
      return true;
    }
    return false;
  }

  private fillInput(element: HTMLInputElement | HTMLTextAreaElement, text: string): void {
    element.value = text;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.blur();
  }

  private isTextualInput(element: HTMLInputElement): boolean {
    const textualTypes = new Set(['text', 'search', 'email', 'url', 'tel', 'password', 'number']);
    return textualTypes.has(element.type) || !element.type;
  }

  private triggerMatchingElement(targetText: string): void {
    const selector = 'button, [role="button"], [role="link"], a[href], input[type="button"], input[type="submit"], input[type="reset"], [data-command]';
    const candidates = Array.from(this.doc.querySelectorAll<HTMLElement>(selector));
    const normalizedTarget = targetText;
    const match = candidates.find(element => {
      const label = this.normalizeText(this.resolveLabel(element));
      return !!label && (label === normalizedTarget || label.includes(normalizedTarget));
    });
    if (!match) {
      this.log('No se encontró elemento que coincida con', targetText);
      return;
    }
    this.log('Ejecutando click en elemento coincidente', match);
    match.focus({ preventScroll: false });
    setTimeout(() => match.click());
  }

  private resolveLabel(element: HTMLElement): string {
    const aria = element.getAttribute('aria-label');
    if (aria) {
      return aria;
    }
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      const ids = labelledBy.split(/\s+/).filter(Boolean);
      const label = ids
        .map(id => this.doc.getElementById(id)?.textContent ?? '')
        .join(' ');
      if (label) {
        return label;
      }
    }
    if (element instanceof HTMLInputElement) {
      const value = element.value ?? '';
      if (value) {
        return value;
      }
    }
    return element.textContent ?? '';
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private transformTextForField(element: HTMLInputElement, original: string): string {
    if (element.type === 'number' || element.getAttribute('inputmode') === 'numeric') {
      const normalized = this.normalizeText(original);
      const digits = this.convertNumberWords(normalized);
      if (digits !== null) {
        this.log('Transformando palabras a números', original, '=>', digits);
        return digits;
      }
    }
    return original;
  }

  private convertNumberWords(normalized: string): string | null {
    const tokens = normalized.split(' ').filter(Boolean);
    if (!tokens.length) {
      return null;
    }
    const converted: string[] = [];
    for (const token of tokens) {
      if (NUMBER_WORD_MAP[token]) {
        converted.push(NUMBER_WORD_MAP[token]);
        continue;
      }
      if (/^\d+$/.test(token)) {
        converted.push(token);
        continue;
      }
      return null;
    }
    return converted.join('');
  }

  private focusFieldByLabel(target: string): boolean {
    const labels = Array.from(this.doc.querySelectorAll<HTMLLabelElement>('label'));
    for (const label of labels) {
      const labelText = this.normalizeText(label.textContent ?? '');
      if (!labelText) {
        continue;
      }
      if (!(labelText === target || labelText.includes(target) || target.includes(labelText))) {
        continue;
      }
      const control = this.resolveControlFromLabel(label);
      if (!control) {
        continue;
      }
      control.focus({ preventScroll: false });
      this.lastEditableTarget = control instanceof HTMLElement ? control : null;
      return true;
    }
    return false;
  }

  private resolveControlFromLabel(label: HTMLLabelElement): HTMLElement | null {
    if (label.htmlFor) {
      const control = this.doc.getElementById(label.htmlFor);
      if (control instanceof HTMLElement) {
        return control;
      }
    }
    const owned = (label as HTMLLabelElement).control;
    if (owned instanceof HTMLElement) {
      return owned;
    }
    const embedded = label.querySelector<HTMLElement>('input, textarea, select, [contenteditable="true"]');
    return embedded ?? null;
  }

  private captureEditableTarget(): HTMLElement | null {
    const active = this.doc.activeElement;
    if (!active) {
      return null;
    }
    if (active instanceof HTMLInputElement && this.isTextualInput(active)) {
      return active;
    }
    if (active instanceof HTMLTextAreaElement) {
      return active;
    }
    if (active instanceof HTMLElement && active.isContentEditable) {
      return active;
    }
    return null;
  }

  private log(...args: unknown[]): void {
    console.log('[VoiceCommand]', ...args);
  }
}
