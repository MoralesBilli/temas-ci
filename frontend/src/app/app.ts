import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LayoutService } from './core/services/layout-service';
import { ToastContainer } from './core/components/toast-container/toast-container';
import { AuthService } from './core/services/auth-service';
import { ThemeService } from './core/services/theme-service';
import { AccessibilityPreferencesService } from './core/services/accessibility-preferences.service';

interface Link {
  readonly label: string;
  readonly link: string;
}

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, ToastContainer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly layoutService = inject(LayoutService);
  protected readonly auth = inject(AuthService);
  private readonly themeService = inject(ThemeService);
  private readonly accessibilityPreferences = inject(AccessibilityPreferencesService);
  protected readonly bottomNavigation = signal<Link[]>([
    { label: 'Alumnos', link: '/alumnos' },
    { label: 'Calidad', link: '/calidad' },
    { label: 'Accesibilidad', link: '/accesibilidad' },
    { label: 'Auditoría', link: '/audit-trail' },
    { label: 'Perfil', link: '/profile' }
  ]);

  constructor() {
    // Instantiate theme service eagerly so the preferred theme applies immediately.
    this.themeService.theme();
    // Ensure accessibility preferences take effect on bootstrap.
    this.accessibilityPreferences.fontScale();
    this.accessibilityPreferences.dyslexicFont();
  }
}
