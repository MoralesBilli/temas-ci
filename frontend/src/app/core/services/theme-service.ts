import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';

export type ThemeName = 'light' | 'dark' | 'contrast-light' | 'contrast-dark' | 'color-blind-light' | 'color-blind-dark' | 'night';

export interface ThemeOption {
  readonly value: ThemeName;
  readonly label: string;
  readonly description: string;
  readonly tone: 'light' | 'dark';
}

interface ThemePreferences {
  readonly theme: ThemeName;
}

export const THEME_OPTIONS: ReadonlyArray<ThemeOption> = [
  {
    value: 'light',
    label: 'Claro',
    description: 'Paleta neutra para espacios luminosos.',
    tone: 'light'
  },
  {
    value: 'dark',
    label: 'Oscuro',
    description: 'Reduce el brillo en entornos con poca luz.',
    tone: 'dark'
  },
  {
    value: 'contrast-light',
    label: 'Claro alto contraste',
    description: 'Colores reforzados y contornos visibles.',
    tone: 'light'
  },
  {
    value: 'contrast-dark',
    label: 'Oscuro alto contraste',
    description: 'Contraste máximo con fondo oscuro.',
    tone: 'dark'
  },
  {
    value: 'color-blind-light',
    label: 'Daltonismo claro',
    description: 'Interfaz monocromática clara con negros y blancos.',
    tone: 'light'
  },
  {
    value: 'color-blind-dark',
    label: 'Daltonismo oscuro',
    description: 'Interfaz monocromática oscura con blancos definidos.',
    tone: 'dark'
  },
  {
    value: 'night',
    label: 'Luz nocturna',
    description: 'Matices cálidos que reducen la luz azul.',
    tone: 'dark'
  }
];

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storageKey = 'app-theme-preferences';
  private readonly doc = inject(DOCUMENT);
  private readonly prefersDarkScheme = typeof globalThis.matchMedia === 'function' && globalThis.matchMedia('(prefers-color-scheme: dark)').matches;
  private readonly initialPreferences = this.loadInitialPreferences();

  readonly theme = signal<ThemeName>(this.initialPreferences.theme);
  readonly isDark = computed(() => ['dark', 'contrast-dark', 'color-blind-dark', 'night'].includes(this.theme()));
  readonly isHighContrast = computed(() => this.theme().startsWith('contrast') || this.theme().startsWith('color-blind'));
  readonly isNightMode = computed(() => this.theme() === 'night');
  readonly themeOptions = THEME_OPTIONS;

  constructor() {
    effect(() => {
      const current = this.theme();
      const highContrast = this.isHighContrast();
      const nightMode = this.isNightMode();
      this.doc.documentElement.setAttribute('data-theme', current);
      this.doc.documentElement.setAttribute('data-high-contrast', String(highContrast));
      this.doc.documentElement.setAttribute('data-night-light', String(nightMode));
      this.persistPreferences({ theme: current });
    });
  }

  toggleTheme(): void {
    this.theme.update(current => current === 'dark' ? 'light' : 'dark');
  }

  setTheme(themeName: ThemeName): void {
    if (THEME_OPTIONS.some(option => option.value === themeName)) {
      this.theme.set(themeName);
    }
  }

  private loadInitialPreferences(): ThemePreferences {
    const stored = this.readStoredPreferences();
    if (stored) {
      return stored;
    }
    return {
      theme: this.prefersDarkScheme ? 'dark' : 'light'
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
      const storedTheme = parsed?.theme;
      if (this.isValidTheme(storedTheme)) {
        return { theme: storedTheme };
      }
      // legacy shape { mode, highContrast }
      const legacyMode = parsed?.mode === 'dark' || parsed?.mode === 'light' ? parsed.mode : null;
      const legacyContrast = typeof parsed?.highContrast === 'boolean' ? parsed.highContrast : false;
      if (legacyMode) {
        const converted: ThemeName = legacyContrast
          ? (legacyMode === 'dark' ? 'contrast-dark' : 'contrast-light')
          : legacyMode;
        return { theme: converted };
      }
      return null;
    } catch {
      return null;
    }
  }

  private isValidTheme(value: unknown): value is ThemeName {
    return typeof value === 'string' && THEME_OPTIONS.some(option => option.value === value);
  }
}
