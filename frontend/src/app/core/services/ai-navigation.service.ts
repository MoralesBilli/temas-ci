import { DestroyRef, Injectable, NgZone, effect, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { AccessibilityPreferencesService } from './accessibility-preferences.service';
import * as tmPose from '@teachablemachine/pose';
import '@tensorflow/tfjs';

const MODEL_BASE_PATH = 'models/gestures/';
const MODEL_URL = `${MODEL_BASE_PATH}model.json`;
const METADATA_URL = `${MODEL_BASE_PATH}metadata.json`;
const CURSOR_STEP_PX = 10;
const FRONT_HOLD_THRESHOLD_MS = 2000;

type Status = 'idle' | 'loading' | 'running' | 'error';

@Injectable({ providedIn: 'root' })
export class AiNavigationService {
  private readonly prefs = inject(AccessibilityPreferencesService);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly doc = inject(DOCUMENT);
  private pointerMoveListener: ((event: PointerEvent) => void) | null = null;

  private model: tmPose.CustomPoseNet | null = null;
  private modelPromise: Promise<tmPose.CustomPoseNet> | null = null;
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private rafId: number | null = null;
  private lastLabel: string | null = null;
  private frontHoldStart: number | null = null;

  private readonly listening = signal(false);
  readonly status = signal<Status>('idle');
  readonly prediction = signal<string | null>(null);
  readonly overlayVisible = this.listening.asReadonly();
  private readonly cursorXState = signal(0);
  private readonly cursorYState = signal(0);
  readonly cursorX = this.cursorXState.asReadonly();
  readonly cursorY = this.cursorYState.asReadonly();

  constructor() {
    effect(() => {
      const enabled = this.prefs.aiNavigation();
      if (enabled) {
        this.start();
      } else {
        this.stop();
      }
    });

    this.destroyRef.onDestroy(() => this.cleanup());
  }

  isSupported(): boolean {
    return typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia);
  }

  registerVideoElement(element: HTMLVideoElement | null): void {
    this.videoElement = element;
    if (element && this.stream) {
      this.attachStream(element);
    }
  }

  disableFromOverlay(): void {
    this.prefs.setAiNavigationEnabled(false);
  }

  private async start(): Promise<void> {
    if (!this.isSupported()) {
      console.warn('[AiNav] Navegación asistida no soportada en este dispositivo.');
      this.prefs.setAiNavigationEnabled(false);
      return;
    }
    if (this.listening()) {
      return;
    }
    this.status.set('loading');
    try {
      await this.ensureModel();
      await this.ensureStream();
      this.initializeCursorPosition();
      this.updateSystemCursor(true);
      this.enablePointerTracking();
      this.listening.set(true);
      this.status.set('running');
      this.zone.runOutsideAngular(() => this.loop());
    } catch (error) {
      console.error('[AiNav] No se pudo iniciar la navegación asistida', error);
      this.status.set('error');
      this.prefs.setAiNavigationEnabled(false);
      this.stop();
    }
  }

  private stop(): void {
    if (!this.listening()) {
      this.prediction.set(null);
      this.status.set('idle');
      this.updateSystemCursor(false);
      return;
    }
    this.listening.set(false);
    this.prediction.set(null);
    this.status.set('idle');
    this.lastLabel = null;
    this.frontHoldStart = null;
    this.updateSystemCursor(false);
    this.disablePointerTracking();
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
    this.disablePointerTracking();
  }

  private cleanup(): void {
    this.stop();
    this.model = null;
    this.modelPromise = null;
  }

  private async ensureModel(): Promise<void> {
    if (this.model) {
      return;
    }
    if (!this.modelPromise) {
      this.modelPromise = tmPose.load(MODEL_URL, METADATA_URL);
    }
    this.model = await this.modelPromise;
  }

  private async ensureStream(): Promise<void> {
    if (this.stream) {
      return;
    }
    const mediaDevices = navigator.mediaDevices;
    if (!mediaDevices?.getUserMedia) {
      throw new Error('getUserMedia no disponible');
    }
    this.stream = await mediaDevices.getUserMedia({
      video: {
        width: { ideal: 320 },
        height: { ideal: 240 },
        facingMode: 'user'
      },
      audio: false
    });
    if (this.videoElement) {
      this.attachStream(this.videoElement);
    }
  }

  private attachStream(video: HTMLVideoElement): void {
    video.srcObject = this.stream;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.onloadedmetadata = () => {
      video.play().catch(() => void 0);
    };
  }

  private loop = (): void => {
    if (!this.listening()) {
      return;
    }
    this.predictGesture()
      .catch(error => {
        console.error('[AiNav] Error al predecir gesto', error);
      })
      .finally(() => {
        this.rafId = requestAnimationFrame(this.loop);
      });
  };

  private async predictGesture(): Promise<void> {
    if (!this.model || !this.videoElement) {
      return;
    }
    if (this.videoElement.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) {
      return;
    }
    const { posenetOutput } = await this.model.estimatePose(this.videoElement);
    const predictions = await this.model.predict(posenetOutput);
    if (!predictions?.length) {
      this.prediction.set(null);
      this.lastLabel = null;
      this.frontHoldStart = null;
      return;
    }
    const best = predictions.reduce((prev, current) =>
      current.probability > prev.probability ? current : prev
    );
    if (best && best.probability >= 0.7) {
      const mirrored = this.mirrorLabel(best.className);
      this.prediction.set(mirrored);
      this.processGesture(mirrored);
      if (mirrored !== this.lastLabel) {
        console.log('[AiNav] Predicción:', mirrored, `${(best.probability * 100).toFixed(1)}%`);
        this.lastLabel = mirrored;
      }
    } else {
      this.prediction.set(null);
      this.lastLabel = null;
      this.frontHoldStart = null;
    }
  }

  private mirrorLabel(label: string): string {
    switch (label) {
      case 'left':
        return 'right';
      case 'right':
        return 'left';
      default:
        return label;
    }
  }

  private processGesture(label: string): void {
    switch (label) {
      case 'up':
        this.moveCursor(0, -CURSOR_STEP_PX);
        this.frontHoldStart = null;
        break;
      case 'down':
        this.moveCursor(0, CURSOR_STEP_PX);
        this.frontHoldStart = null;
        break;
      case 'left':
        this.moveCursor(-CURSOR_STEP_PX, 0);
        this.frontHoldStart = null;
        break;
      case 'right':
        this.moveCursor(CURSOR_STEP_PX, 0);
        this.frontHoldStart = null;
        break;
      case 'front':
        this.handleFrontHold();
        break;
      default:
        this.frontHoldStart = null;
    }
  }

  private moveCursor(dx: number, dy: number): void {
    if (typeof window === 'undefined') {
      return;
    }
    const maxX = Math.max(0, window.innerWidth - 4);
    const maxY = Math.max(0, window.innerHeight - 4);
    const nextX = Math.min(maxX, Math.max(0, this.cursorXState() + dx));
    const nextY = Math.min(maxY, Math.max(0, this.cursorYState() + dy));
    this.cursorXState.set(nextX);
    this.cursorYState.set(nextY);
  }

  private handleFrontHold(): void {
    const now = performance.now();
    if (!this.frontHoldStart) {
      this.frontHoldStart = now;
      return;
    }
    if (now - this.frontHoldStart >= FRONT_HOLD_THRESHOLD_MS) {
      this.frontHoldStart = now;
      this.triggerCursorAction();
    }
  }

  private triggerCursorAction(): void {
    const x = this.cursorXState();
    const y = this.cursorYState();
    const hit = this.doc.elementFromPoint(x, y);
    if (!(hit instanceof HTMLElement)) {
      return;
    }

    if (!hit) {
      return;
    }

    if (this.isFocusable(hit)) {
      this.zone.run(() => hit.focus({ preventScroll: false }));
      return;
    }

    this.zone.run(() => hit.click());
  }

  private isFocusable(element: HTMLElement): boolean {
    return (
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement ||
      element.isContentEditable
    );
  }

  private initializeCursorPosition(): void {
    if (typeof window === 'undefined') {
      return;
    }
    this.cursorXState.set(Math.round(window.innerWidth / 2));
    this.cursorYState.set(Math.round(window.innerHeight / 2));
    this.frontHoldStart = null;
  }

  private updateSystemCursor(hidden: boolean): void {
    const body = this.doc.body;
    if (!body) {
      return;
    }
    body.classList.toggle('ai-cursor-hidden', hidden);
  }

  private findClickableTarget(element: HTMLElement): HTMLElement | null {
    const selectable = element.closest<HTMLElement>(
      'button, a[href], [role="button"], [role="link"], [tabindex]:not([tabindex="-1"])'
    );
    if (selectable) {
      return selectable;
    }
    return element instanceof HTMLElement ? element : null;
  }

  private enablePointerTracking(): void {
    if (this.pointerMoveListener) {
      return;
    }
    this.pointerMoveListener = (event: PointerEvent) => {
      this.cursorXState.set(event.clientX);
      this.cursorYState.set(event.clientY);
    };
    this.doc.addEventListener('pointermove', this.pointerMoveListener, { passive: true });
  }

  private disablePointerTracking(): void {
    if (!this.pointerMoveListener) {
      return;
    }
    this.doc.removeEventListener('pointermove', this.pointerMoveListener);
    this.pointerMoveListener = null;
  }

  private dispatchClickSequence(target: HTMLElement, x: number, y: number): void {
    this.firePointerEvent(target, 'pointerdown', x, y);
    this.fireMouseEvent(target, 'mousedown', x, y);
    this.firePointerEvent(target, 'pointerup', x, y);
    this.fireMouseEvent(target, 'mouseup', x, y);
    this.fireMouseEvent(target, 'click', x, y);
  }

  private firePointerEvent(target: HTMLElement, type: string, x: number, y: number): void {
    if (typeof PointerEvent === 'undefined') {
      return;
    }
    const pointerEvent = new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
      pointerType: 'mouse',
      isPrimary: true,
    });
    target.dispatchEvent(pointerEvent);
  }

  private fireMouseEvent(target: HTMLElement, type: string, x: number, y: number): void {
    const mouseEvent = new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
      view: window,
    });
    target.dispatchEvent(mouseEvent);
  }

  private describeElement(element: HTMLElement | null): string {
    if (!element) {
      return 'null';
    }
    const id = element.id ? `#${element.id}` : '';
    const classList = element.classList.length ? `.${[...element.classList.values()].join('.')}` : '';
    return `<${element.tagName.toLowerCase()}${id}${classList}>`;
  }
}
