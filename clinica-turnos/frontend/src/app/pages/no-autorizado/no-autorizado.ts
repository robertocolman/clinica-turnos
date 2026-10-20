import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-no-autorizado',

  template: `
    <div class="forbidden-container">
      <div class="forbidden-card">
        <div class="icon">🚫</div>
        <h1>403 - Acceso Restringido</h1>
        <p>Tu rol de usuario actual (<strong>{{ authService.userRole() || 'Sin sesión' }}</strong>) no tiene los permisos requeridos para ingresar a esta sección.</p>
        <button (click)="authService.redirectByRole()" class="btn-return">
          Ir a mi Panel Principal
        </button>
      </div>
    </div>
  `,
  styles: [`
    .forbidden-container {
      min-height: calc(100vh - 80px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .forbidden-card {
      background: #ffffff;
      padding: 2.5rem;
      border-radius: 12px;
      text-align: center;
      max-width: 480px;
      border: 1px solid #fee2e2;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .icon {
      font-size: 3rem;
      margin-bottom: 0.5rem;
    }
    h1 {
      font-size: 1.4rem;
      color: #991b1b;
      margin: 0 0 0.75rem 0;
    }
    p {
      color: #64748b;
      font-size: 0.95rem;
      line-height: 1.5;
      margin-bottom: 1.5rem;
    }
    .btn-return {
      background: #2563eb;
      color: #ffffff;
      border: none;
      padding: 0.65rem 1.25rem;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s ease;
    }
    .btn-return:hover {
      background: #1d4ed8;
    }
  `],
})
export class NoAutorizadoComponent {
  protected readonly authService = inject(AuthService);
}
