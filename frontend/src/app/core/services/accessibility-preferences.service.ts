import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';

type Preferences = Readonly<{
  fontScale: number;
  dyslexicFont: boolean;
}>;

const DEFAULT_PREFERENCES: Preferences = {
  fontScale: 1,
  dyslexicFont: false
};

@Injectable({ providedIn: 'root' })
export class AccessibilityPreferencesService {
  readonly minFontScale = 0.85;
  readonly maxFontScale = 1.3;
  readonly fontScaleStep = 0.05;

  private readonly storageKey = 'accessibility-preferences';
  private readonly doc = inject(DOCUMENT);
  private readonly initialPrefs = this.readPreferences();

  readonly fontScale = signal(this.initialPrefs.fontScale);
  readonly dyslexicFont = signal(this.initialPrefs.dyslexicFont);

  constructor() {
    effect(() => {
      const scale = this.fontScale();
      this.doc.documentElement.style.setProperty('--app-font-scale', scale.toFixed(2));
    });

    effect(() => {
      const dyslexic = this.dyslexicFont();
      const targetVar = dyslexic ? '--app-font-family-dyslexic' : '--app-font-family-base';
      this.doc.documentElement.style.setProperty('--app-font-family-current', `var(${targetVar})`);
      this.doc.documentElement.setAttribute('data-dyslexic-font', String(dyslexic));
    });

    effect(() => {
      this.persistPreferences({
        fontScale: this.fontScale(),
        dyslexicFont: this.dyslexicFont()
      });
    });
  }

  setFontScale(value: number): void {
    const clamped = this.clamp(value, this.minFontScale, this.maxFontScale);
    this.fontScale.set(Number(clamped.toFixed(2)));
  }

  setDyslexicFont(value: boolean): void {
    this.dyslexicFont.set(value);
  }

  toggleDyslexicFont(): void {
    this.dyslexicFont.update(current => !current);
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }

  private readPreferences(): Preferences {
    try {
      const raw = globalThis.localStorage?.getItem(this.storageKey);
      if (!raw) return DEFAULT_PREFERENCES;
      const parsed = JSON.parse(raw);
      const fontScale = typeof parsed?.fontScale === 'number' ? parsed.fontScale : DEFAULT_PREFERENCES.fontScale;
      const dyslexicFont = typeof parsed?.dyslexicFont === 'boolean' ? parsed.dyslexicFont : DEFAULT_PREFERENCES.dyslexicFont;
      return {
        fontScale: this.clamp(fontScale, this.minFontScale, this.maxFontScale),
        dyslexicFont
      };
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }

  private persistPreferences(preferences: Preferences): void {
    try {
      globalThis.localStorage?.setItem(this.storageKey, JSON.stringify(preferences));
    } catch {
      // Ignore persistence failures
    }
  }
}
