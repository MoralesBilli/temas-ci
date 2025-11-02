
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private fb = new FormBuilder();

  form = this.fb.group({
    clave: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
    password: ['', [Validators.required]],
  });

  loading = false as boolean;
  error: string | null = null;

  constructor(private svc: AuthService) {}

  async submit() {
    if (this.form.invalid) return this.form.markAllAsTouched();
    this.loading = true;
    this.error = null;
    try {
  const { clave, password } = this.form.value as any;
  const res = await this.svc.login({ user: clave, password });
  console.log('login result', res);
  // Redirect to home after login
  location.assign('/');
    } catch (err: any) {
      this.error = err?.message ?? 'Error al iniciar sesión';
    } finally {
      this.loading = false;
    }
  }
}
