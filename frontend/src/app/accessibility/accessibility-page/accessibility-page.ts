import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutService } from '../../core/services/layout-service';
import { ThemeService } from '../../core/services/theme-service';
import { AccessibilityPreferencesService } from '../../core/services/accessibility-preferences.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-accessibility-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './accessibility-page.html',
  styleUrl: './accessibility-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccessibilityPage {
  private readonly layout = inject(LayoutService);
  protected readonly theme = inject(ThemeService);
  protected readonly accessibility = inject(AccessibilityPreferencesService);
  protected readonly fontScaleMin = this.accessibility.minFontScale;
  protected readonly fontScaleMax = this.accessibility.maxFontScale;
  protected readonly fontScaleStep = this.accessibility.fontScaleStep;
  protected readonly nextThemeLabel = computed(() => this.theme.isDark() ? 'tema claro' : 'tema oscuro');
  protected readonly fontScalePercent = computed(() => Math.round(this.accessibility.fontScale() * 100));
  protected readonly highContrastEnabled = computed(() => this.theme.highContrast());

  constructor() {
    this.layout.title.set('Accesibilidad');
  }

  protected toggleTheme(): void {
    this.theme.toggleTheme();
  }

  protected onDyslexicToggle(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (!target) return;
    this.accessibility.setDyslexicFont(target.checked);
  }

  protected onHighContrastToggle(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (!target) return;
    this.theme.setHighContrast(target.checked);
  }
}
