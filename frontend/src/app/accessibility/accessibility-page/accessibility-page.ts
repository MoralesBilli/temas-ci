import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeName, ThemeService, THEME_OPTIONS } from '../../core/services/theme-service';
import { AccessibilityPreferencesService } from '../../core/services/accessibility-preferences.service';
import { FormsModule } from '@angular/forms';
import { VoiceReaderService } from '../../core/services/voice-reader.service';
import { AiNavigationService } from '../../core/services/ai-navigation.service';

export const ACCESSIBILITY_PANEL_HEADING_ID = 'accessibility-panel-heading';

@Component({
  selector: 'app-accessibility-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './accessibility-page.html',
  styleUrl: './accessibility-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccessibilityPage {
  protected readonly theme = inject(ThemeService);
  protected readonly accessibility = inject(AccessibilityPreferencesService);
  private readonly voiceReaderService = inject(VoiceReaderService);
  private readonly aiNavigationService = inject(AiNavigationService);
  protected readonly fontScaleMin = this.accessibility.minFontScale;
  protected readonly fontScaleMax = this.accessibility.maxFontScale;
  protected readonly fontScaleStep = this.accessibility.fontScaleStep;
  protected readonly fontScalePercent = computed(() => Math.round(this.accessibility.fontScale() * 100));
  protected readonly largeCursorEnabled = computed(() => this.accessibility.largeCursor());
  protected readonly voiceReaderEnabled = computed(() => this.accessibility.voiceReader());
  protected readonly aiNavigationEnabled = computed(() => this.accessibility.aiNavigation());
  protected readonly voiceReaderSupported = this.voiceReaderService.isSupported();
  protected readonly aiNavigationSupported = this.aiNavigationService.isSupported();
  protected readonly availableThemes = THEME_OPTIONS;
  protected readonly selectedTheme = computed(() => this.theme.theme());
  protected readonly headingId = ACCESSIBILITY_PANEL_HEADING_ID;

  protected onDyslexicToggle(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (!target) return;
    this.accessibility.setDyslexicFont(target.checked);
  }

  protected onLargeCursorToggle(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (!target) return;
    this.accessibility.setLargeCursor(target.checked);
  }

  protected onVoiceReaderToggle(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (!target || !this.voiceReaderSupported) {
      return;
    }
    this.accessibility.setVoiceReaderEnabled(target.checked);
  }

  protected onAiNavigationToggle(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (!target || !this.aiNavigationSupported) {
      return;
    }
    this.accessibility.setAiNavigationEnabled(target.checked);
  }

  protected onThemeSelect(themeName: ThemeName): void {
    this.theme.setTheme(themeName);
  }
}
