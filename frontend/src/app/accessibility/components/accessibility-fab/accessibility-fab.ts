import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { AccessibilityDialogComponent } from '../accessibility-dialog/accessibility-dialog';
import { ACCESSIBILITY_PANEL_HEADING_ID } from '../../accessibility-page/accessibility-page';
import { VoiceCommandService } from '../../../core/services/voice-command.service';

@Component({
  selector: 'app-accessibility-fab',
  standalone: true,
  imports: [CommonModule, DialogModule],
  templateUrl: './accessibility-fab.html',
  styleUrl: './accessibility-fab.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'contents'
  }
})
export class AccessibilityFabComponent {
  private readonly dialog = inject(Dialog);
  private readonly voiceCommands = inject(VoiceCommandService);
  protected readonly isOpen = signal(false);
  protected readonly isListening = this.voiceCommands.listening;
  protected readonly speechSupported = this.voiceCommands.isSupported();

  protected openPanel(): void {
    if (this.isOpen()) {
      return;
    }
    const dialogRef = this.dialog.open(AccessibilityDialogComponent, {
      panelClass: 'accessibility-dialog-panel',
      autoFocus: false,
      restoreFocus: true,
      ariaLabelledBy: ACCESSIBILITY_PANEL_HEADING_ID
    });
    this.isOpen.set(true);
    dialogRef.closed.subscribe(() => this.isOpen.set(false));
  }

  protected startVoiceInput(event: Event): void {
    if (!this.speechSupported) {
      return;
    }
    event.preventDefault();
    this.voiceCommands.start();
  }

  protected stopVoiceInput(): void {
    if (!this.speechSupported) {
      return;
    }
    this.voiceCommands.stop();
  }

  protected cancelVoiceInput(): void {
    this.stopVoiceInput();
  }
}
