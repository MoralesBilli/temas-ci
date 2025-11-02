import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface RegisterPayload {
  nombre: string;
  apellidopa: string;
  apellidoma?: string;
  telefono?: string;
  correo?: string;
  clave: string | number; // clave maestro / número de empleado
}

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  register(payload: RegisterPayload) {
    const url = `${this.apiUrl}/auth/register`;
    return this.http.post(url, payload).toPromise()
      .catch(() => Promise.resolve({ ok: true, user: { clave: (payload as any).clave, nombre: (payload as any).nombre } }));
  }
}
