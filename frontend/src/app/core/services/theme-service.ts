import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';

type ThemeName = 'light' | 'dark';

interface ThemePreferences {
  readonly mode: ThemeName;
  readonly highContrast: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storageKey = 'app-theme-preferences';
  private readonly doc = inject(DOCUMENT);
  private readonly prefersDarkScheme = typeof globalThis.matchMedia === 'function' && globalThis.matchMedia('(prefers-color-scheme: dark)').matches;
  private readonly initialPreferences = this.loadInitialPreferences();

  readonly theme = signal<ThemeName>(this.initialPreferences.mode);
  readonly highContrast = signal<boolean>(this.initialPreferences.highContrast);
  readonly isDark = computed(() => this.theme() === 'dark');
  readonly effectiveTheme = computed(() => {
    if (!this.highContrast()) {
      return this.theme();
    }
    return this.isDark() ? 'contrast-dark' : 'contrast-light';
  });

  constructor() {
    effect(() => {
      const prefersHighContrast = this.highContrast();
      const targetTheme = this.effectiveTheme();
      this.doc.documentElement.setAttribute('data-theme', targetTheme);
      this.doc.documentElement.setAttribute('data-high-contrast', String(prefersHighContrast));
      this.persistPreferences({
        mode: this.theme(),
        highContrast: prefersHighContrast
      });
    });
  }

  toggleTheme(): void {
    this.theme.update(current => current === 'dark' ? 'light' : 'dark');
  }

  toggleHighContrast(): void {
    this.highContrast.update(current => !current);
  }

  setHighContrast(value: boolean): void {
    this.highContrast.set(value);
  }

  private loadInitialPreferences(): ThemePreferences {
    const stored = this.readStoredPreferences();
    if (stored) {
      return stored;
    }
    return {
      mode: this.prefersDarkScheme ? 'dark' : 'light',
      highContrast: false
    };
  }

  private persistPreferences(preferences: ThemePreferences): void {
    try {
      globalThis.localStorage?.setItem(this.storageKey, JSON.stringify(preferences));
    } catch {
      // ignore storage failures
    }
  }

  private readStoredPreferences(): ThemePreferences | null {
    try {
      const raw = globalThis.localStorage?.getItem(this.storageKey);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw);
      const mode = parsed?.mode === 'dark' || parsed?.mode === 'light' ? parsed.mode : null;
      const highContrast = typeof parsed?.highContrast === 'boolean' ? parsed.highContrast : false;
      if (!mode) {
        return null;
      }
      return { mode, highContrast };
    } catch {
      return null;
    }
  }
}
