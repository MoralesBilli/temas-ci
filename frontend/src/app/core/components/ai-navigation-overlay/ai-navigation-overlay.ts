import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import { AiNavigationService } from '../../services/ai-navigation.service';

@Component({
  selector: 'app-ai-navigation-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-navigation-overlay.html',
  styleUrl: './ai-navigation-overlay.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AiNavigationOverlayComponent implements OnDestroy {
  private readonly service = inject(AiNavigationService);
  protected readonly visible = this.service.overlayVisible;
  protected readonly prediction = this.service.prediction;
  protected readonly status = this.service.status;
  protected readonly cursorX = this.service.cursorX;
  protected readonly cursorY = this.service.cursorY;

  @ViewChild('aiVideo')
  set videoRef(ref: ElementRef<HTMLVideoElement> | undefined) {
    this.service.registerVideoElement(ref?.nativeElement ?? null);
  }

  protected disable(): void {
    this.service.disableFromOverlay();
  }

  ngOnDestroy(): void {
    this.service.registerVideoElement(null);
  }
}
