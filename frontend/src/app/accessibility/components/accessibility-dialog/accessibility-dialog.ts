import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { AccessibilityPage, ACCESSIBILITY_PANEL_HEADING_ID } from '../../accessibility-page/accessibility-page';

let uniqueDialogId = 0;
const createId = (prefix: string) => `${prefix}-${++uniqueDialogId}`;

@Component({
  selector: 'app-accessibility-dialog',
  standalone: true,
  imports: [CommonModule, AccessibilityPage],
  templateUrl: './accessibility-dialog.html',
  styleUrl: './accessibility-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccessibilityDialogComponent {
  private readonly dialogRef = inject(DialogRef<unknown>);
  protected readonly headingId = ACCESSIBILITY_PANEL_HEADING_ID;
  protected readonly descriptionId = createId('accessibility-panel-description');

  protected close(): void {
    this.dialogRef.close();
  }
}
