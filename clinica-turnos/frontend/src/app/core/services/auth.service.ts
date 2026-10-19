import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { Usuario, LoginCredentials, LoginResponse, RolUsuario } from '../models/user.model';

const TOKEN_KEY = 'clinica_access_token';
const USER_KEY = 'clinica_user_data';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  // Estado reactivo con Signals de Angular
  private readonly _currentUser = signal<Usuario | null>(this.getStoredUser());
  private readonly _token = signal<string | null>(this.getStoredToken());

  // Signals computadas publicas
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser() && !!this._token());
  readonly userRole = computed(() => this._currentUser()?.rol ?? null);
  readonly userFullName = computed(() => {
    const user = this._currentUser();
    return user ? `${user.nombres} ${user.apellidos}` : '';
  });

  /**
   * Inicia sesion contra el backend mediante la ruta relativa /api/auth/login.
   * El proxy de desarrollo redirige internamente a http://localhost:3000/api/auth/login.
   */
  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/login', credentials).pipe(
      tap((res) => {
        this.saveSession(res.accessToken, res.usuario);
      })
    );
  }

  /**
   * Cierra la sesion del usuario, elimina credenciales locales y redirige a /login.
   */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  /**
   * Obtiene el token JWT actual (util para el interceptor HTTP).
   */
  getToken(): string | null {
    return this._token();
  }

  /**
   * Verifica si el usuario actual posee uno de los roles permitidos.
   */
  hasRole(roles: RolUsuario | RolUsuario[]): boolean {
    const currentRole = this.userRole();
    if (!currentRole) return false;

    if (Array.isArray(roles)) {
      return roles.includes(currentRole);
    }
    return currentRole === roles;
  }

  /**
   * Redirige al usuario a su pantalla de inicio correspondiente segun su rol.
   */
  redirectByRole(): void {
    const role = this.userRole();
    switch (role) {
      case RolUsuario.MEDICO:
        this.router.navigate(['/medico/agenda']);
        break;
      case RolUsuario.PACIENTE:
        this.router.navigate(['/paciente/turnos']);
        break;
      case RolUsuario.ADMINISTRADOR:
        this.router.navigate(['/admin/panel']);
        break;
      default:
        this.router.navigate(['/login']);
        break;
    }
  }

  private saveSession(token: string, user: Usuario): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._token.set(token);
    this._currentUser.set(user);
  }

  private getStoredToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private getStoredUser(): Usuario | null {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? (JSON.parse(data) as Usuario) : null;
    } catch {
      return null;
    }
  }
}
