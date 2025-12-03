import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject } from '@angular/core';
import { AccessibilityPreferencesService } from './accessibility-preferences.service';

const INTERACTIVE_SELECTOR = 'button, a, [role="button"], [role="link"], [role="menuitem"], [role="option"], [role="tab"], [role="checkbox"], [role="switch"], [role="radio"], input, textarea, select';
const TEXT_SELECTOR = 'p, h1, h2, h3, h4, h5, h6, span, label, li, td, th, figcaption, blockquote, cite';

@Injectable({ providedIn: 'root' })
export class VoiceReaderService {
  private readonly doc = inject(DOCUMENT);
  private readonly preferences = inject(AccessibilityPreferencesService);
  private readonly speech = typeof globalThis !== 'undefined' && 'speechSynthesis' in globalThis
    ? globalThis.speechSynthesis
    : null;
  private readonly desiredVoiceLocales = ['es-mx', 'es-es', 'es-419', 'es'];
  private eventsBound = false;
  private voicesListenerBound = false;
  private currentSource: Element | null = null;
  private lastSpokenText = '';
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private preferredVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    effect(() => {
      const enabled = this.preferences.voiceReader();
      if (!this.speech) {
        if (enabled) {
          this.preferences.setVoiceReaderEnabled(false);
        }
        return;
      }
      this.ensureVoiceSelection();
      if (enabled) {
        this.bindEvents();
      } else {
        this.unbindEvents();
        this.cancelSpeech();
        this.currentSource = null;
        this.lastSpokenText = '';
      }
    });
  }

  isSupported(): boolean {
    return Boolean(this.speech);
  }

  isEnabled(): boolean {
    return this.preferences.voiceReader();
  }

  private ensureVoiceSelection(): void {
    if (!this.speech) {
      return;
    }
    if (this.preferredVoice) {
      return;
    }
    this.loadVoices();
    if (this.voicesListenerBound) {
      return;
    }
    if (typeof this.speech.addEventListener === 'function') {
      this.speech.addEventListener('voiceschanged', this.loadVoices);
    } else {
      this.speech.onvoiceschanged = this.loadVoices;
    }
    this.voicesListenerBound = true;
  }

  private readonly loadVoices = (): void => {
    if (!this.speech) {
      return;
    }
    const voices = this.speech.getVoices();
    if (!voices?.length) {
      return;
    }
    const normalized = voices.map(voice => ({ voice, lang: voice.lang?.toLowerCase() ?? '' }));
    const preferred = normalized.find(({ lang }) => this.desiredVoiceLocales.some(target => lang.startsWith(target)));
    this.preferredVoice = (preferred ?? normalized[0])?.voice ?? null;
  };

  private bindEvents(): void {
    if (this.eventsBound) {
      return;
    }
    this.doc.addEventListener('pointerover', this.pointerHandler, true);
    this.doc.addEventListener('focusin', this.focusHandler, true);
    this.eventsBound = true;
  }

  private unbindEvents(): void {
    if (!this.eventsBound) {
      return;
    }
    this.doc.removeEventListener('pointerover', this.pointerHandler, true);
    this.doc.removeEventListener('focusin', this.focusHandler, true);
    this.eventsBound = false;
  }

  private readonly pointerHandler = (event: Event): void => {
    if (!this.speech) {
      return;
    }
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const source = this.resolveSourceElement(target);
    if (!source) {
      return;
    }

    const overlapsCurrent = this.currentSource
      ? source === this.currentSource || this.currentSource.contains(source) || source.contains(this.currentSource)
      : false;

    const text = this.extractReadableText(source);
    if (!text) {
      return;
    }

    if (overlapsCurrent && text === this.lastSpokenText) {
      return;
    }

    this.startSpeech(text, source);
  };

  private readonly focusHandler = (event: Event): void => {
    if (!this.speech) {
      return;
    }
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const source = this.resolveSourceElement(target);
    if (!source) {
      return;
    }

    const text = this.extractReadableText(source);
    if (!text) {
      return;
    }

    if (source === this.currentSource && text === this.lastSpokenText) {
      return;
    }

    this.startSpeech(text, source);
  };

  private resolveSourceElement(element: Element): Element | null {
    const interactive = element.closest(INTERACTIVE_SELECTOR);
    if (interactive) {
      return interactive;
    }
    const textContainer = element.closest(TEXT_SELECTOR);
    if (textContainer) {
      return textContainer;
    }
    if (this.hasAriaLabel(element)) {
      return element;
    }
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
      return element;
    }
    return null;
  }

  private extractReadableText(element: Element): string {
    const aria = this.resolveAriaLabel(element);
    if (aria) {
      return aria;
    }

    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      const labelledValue = element.value?.trim();
      if (labelledValue) {
        return this.normalizeText(labelledValue);
      }
      const placeholder = element.placeholder?.trim();
      if (placeholder) {
        return this.normalizeText(placeholder);
      }
    }

    if (element instanceof HTMLSelectElement) {
      const selectedOptions = element.selectedOptions?.length
        ? Array.from(element.selectedOptions)
        : element.options?.length
          ? [element.options[element.selectedIndex >= 0 ? element.selectedIndex : 0]]
          : [];
      const selectionText = selectedOptions
        .map(opt => opt?.label?.trim() || opt?.text?.trim() || opt?.value?.trim() || '')
        .filter(Boolean)
        .join(', ');
      if (selectionText) {
        return this.normalizeText(selectionText);
      }
      const placeholder = element.getAttribute('placeholder')?.trim();
      if (placeholder) {
        return this.normalizeText(placeholder);
      }
    }

    if (element instanceof HTMLOptionElement) {
      const optionText = element.label?.trim() || element.textContent?.trim() || element.value?.trim() || '';
      return this.normalizeText(optionText);
    }

    const textContent = element.textContent ?? '';
    return this.normalizeText(textContent);
  }

  private resolveAriaLabel(element: Element): string | null {
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) {
      return this.normalizeText(ariaLabel);
    }
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    if (ariaLabelledBy) {
      const ids = ariaLabelledBy.split(/\s+/).filter(Boolean);
      const label = ids
        .map(id => this.doc.getElementById(id)?.textContent ?? '')
        .join(' ');
      const normalized = this.normalizeText(label);
      if (normalized) {
        return normalized;
      }
    }
    return null;
  }

  private normalizeText(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }

  private hasAriaLabel(element: Element): boolean {
    return element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby');
  }

  announce(text: string): void {
    if (!this.preferences.voiceReader()) {
      return;
    }
    const normalized = this.normalizeText(text);
    if (!normalized) {
      return;
    }
    this.startSpeech(normalized, null);
  }

  private startSpeech(text: string, source: Element | null): void {
    if (!this.speech || !text) {
      return;
    }
    if (text.length < 2) {
      return;
    }
    this.cancelSpeech();
    this.currentSource = source;
    this.lastSpokenText = text;
    const utterance = new SpeechSynthesisUtterance(text);
    if (this.preferredVoice) {
      utterance.voice = this.preferredVoice;
      utterance.lang = this.preferredVoice.lang;
    } else {
      utterance.lang = 'es-ES';
    }
    utterance.onend = () => {
      if (this.currentUtterance === utterance) {
        this.currentUtterance = null;
      }
    };
    utterance.onerror = () => {
      if (this.currentUtterance === utterance) {
        this.currentUtterance = null;
      }
    };
    this.currentUtterance = utterance;
    this.speech.speak(utterance);
  }

  private cancelSpeech(): void {
    if (!this.speech) {
      return;
    }
    if (this.currentUtterance) {
      this.currentUtterance.onend = null;
      this.currentUtterance.onerror = null;
      this.currentUtterance = null;
    }
    this.speech.cancel();
  }
}
