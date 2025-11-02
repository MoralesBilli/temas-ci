import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export type JwtResponse = { token?: string; jwt?: string; access_token?: string } & Record<string, unknown>;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'auth.jwt';
  private readonly apiUrl = environment.apiUrl;

  private readonly _token = signal<string | null>(this.loadToken());
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());

  constructor(private http: HttpClient) {}

  private loadToken(): string | null {
    try { return localStorage.getItem(this.storageKey); } catch { return null; }
  }

  private persistToken(token: string | null) {
    try {
      if (token) localStorage.setItem(this.storageKey, token);
      else localStorage.removeItem(this.storageKey);
    } catch { /* ignore */ }
  }

  setToken(token: string | null) {
    this._token.set(token);
    this.persistToken(token);
  }

  async login(params: { user: string | number; password: string }) {
    const url = `${this.apiUrl}/inicio_sesion`;
    const res = await this.http.post<JwtResponse>(url, params).toPromise();
    const token = res?.token || res?.jwt || res?.access_token;
    if (!token) throw new Error('No se recibió token');
    this.setToken(String(token));
    return res;
  }

  logout() {
    this.setToken(null);
  }
}
