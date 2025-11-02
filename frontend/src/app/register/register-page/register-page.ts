
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RegisterService } from '../services/register-service';

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPage {
  private fb = new FormBuilder();

  form = this.fb.group({
    nombre: ['', [Validators.required]],
    apellidopa: ['', [Validators.required]],
    apellidoma: [''],
    telefono: ['', [Validators.pattern(/^\+?[0-9\s-]{7,20}$/)]],
    correo: ['', [Validators.email]],
    clave: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
  });

  loading = false;
  error: string | null = null;

  constructor(private svc: RegisterService) {}

  async submit() {
    if (this.form.invalid) return this.form.markAllAsTouched();
    const payload = this.form.value as any;

    this.loading = true; this.error = null;
    try {
      const res = await this.svc.register(payload);
      console.log('register', res);
    } catch (err: any) {
      this.error = err?.message ?? 'Error al registrar';
    } finally { this.loading = false; }
  }
}
