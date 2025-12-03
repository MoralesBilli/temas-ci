import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { RegisterService } from '../services/register-service';
import { ToastService } from '../../core/services/toast-service';
import { LayoutService } from '../../core/services/layout-service';
import { VoiceReaderService } from '../../core/services/voice-reader.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPage {
  private fb = new FormBuilder();
  private readonly layout = inject(LayoutService);
  private readonly voiceReader = inject(VoiceReaderService);

  form = this.fb.group({
    nombre: ['', [Validators.required]],
    apellidopa: ['', [Validators.required]],
    apellidoma: ['', [Validators.required]],
    telefono: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s-]{7,20}$/)]],
    correo: ['', [Validators.required, Validators.email]],
    clave: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
  });

  loading = signal(false);
  error = signal<string | null>(null);
  private attemptedSubmit = false;
  private lastAnnouncedError: string | null = null;

  constructor(private svc: RegisterService, private toast: ToastService, private router: Router) {
    this.layout.title.set('Registro');
    this.form.statusChanges.pipe(takeUntilDestroyed()).subscribe(() => this.announceFirstError());
  }

  async submit() {
    if (this.form.invalid) {
      this.attemptedSubmit = true;
      this.form.markAllAsTouched();
      this.announceFirstError();
      return;
    }
    this.attemptedSubmit = false;
    this.lastAnnouncedError = null;
    const payload = this.form.value as any;

    this.loading.set(true); this.error.set(null);
    try {
      const res = await this.svc.register(payload);
      const msg = (res as any)?.message || (res as any)?.mensaje || 'Cuenta creada. Ahora puedes iniciar sesión';
      this.toast.show(msg, 'success', 4000);
      await this.router.navigateByUrl('/login');
    } catch (err: any) {
      const message = err?.error?.error || err?.error?.message || err?.message || 'Error al registrar';
      this.toast.show(message, 'error', 5000);
      this.error.set(null);
    } finally { this.loading.set(false); }
  }

  private announceFirstError(): void {
    const message = this.getFirstErrorMessage();
    if (!message) {
      if (this.form.valid) {
        this.lastAnnouncedError = null;
      }
      return;
    }
    if (message === this.lastAnnouncedError) {
      return;
    }
    this.lastAnnouncedError = message;
    this.voiceReader.announce(message);
  }

  private getFirstErrorMessage(): string | null {
    const nombre = this.form.get('nombre');
    if (nombre && nombre.invalid && (nombre.touched || this.attemptedSubmit)) {
      return 'El nombre es obligatorio.';
    }

    const apellidopa = this.form.get('apellidopa');
    if (apellidopa && apellidopa.invalid && (apellidopa.touched || this.attemptedSubmit)) {
      return 'El apellido paterno es obligatorio.';
    }

    const apellidoma = this.form.get('apellidoma');
    if (apellidoma && apellidoma.invalid && (apellidoma.touched || this.attemptedSubmit)) {
      return 'El apellido materno es obligatorio.';
    }

    const telefono = this.form.get('telefono');
    if (telefono && telefono.invalid && (telefono.touched || this.attemptedSubmit)) {
      if (telefono.hasError('required')) {
        return 'El teléfono es obligatorio.';
      }
      if (telefono.hasError('pattern')) {
        return 'El teléfono tiene un formato inválido.';
      }
    }

    const correo = this.form.get('correo');
    if (correo && correo.invalid && (correo.touched || this.attemptedSubmit)) {
      if (correo.hasError('required')) {
        return 'El correo es obligatorio.';
      }
      if (correo.hasError('email')) {
        return 'El correo no tiene un formato válido.';
      }
    }

    const clave = this.form.get('clave');
    if (clave && clave.invalid && (clave.touched || this.attemptedSubmit)) {
      if (clave.hasError('required')) {
        return 'La clave es obligatoria.';
      }
      if (clave.hasError('pattern')) {
        return 'La clave solo acepta números.';
      }
    }

    return null;
  }
}
