import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';


@Component({
  selector: 'app-admin-panel',
  template: `
    <div class="page-container">
      <div class="header-card">
        <div class="header-badge">👑 Panel de Administración</div>
        <h1>Control Central de la Clínica</h1>
        <p class="subtitle">Administrador: {{ authService.userFullName() }}</p>
      </div>

      <div class="content-card">
        <div class="info-banner">
          <h3>📌 Privilegios de Administrador</h3>
          <p>
            El rol de <strong>Administrador</strong> tiene acceso irrestricto al sistema para gestionar
            reservas (cancelaciones hasta el momento de inicio de la consulta) y modificar los valores de consulta de los médicos.
          </p>
        </div>

        <div class="rules-summary">
          <h4>Operaciones Permitidas:</h4>
          <ul>
            <li>Reservar turnos para cualquier paciente.</li>
            <li>Listar todos los turnos reservados en la clínica.</li>
            <li>Cancelar turnos <strong>hasta el momento en que inicia la consulta</strong>.</li>
            <li>Modificar el valor de la consulta de los médicos.</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 900px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    .header-card {
      background: #ffffff;
      padding: 1.5rem 2rem;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      margin-bottom: 1.5rem;
    }
    .header-badge {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      background: #fef2f2;
      color: #dc2626;
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
    }
    h1 {
      margin: 0;
      font-size: 1.5rem;
      color: #0f172a;
    }
    .subtitle {
      color: #64748b;
      margin-top: 0.25rem;
    }
    .content-card {
      background: #ffffff;
      padding: 2rem;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
    }
    .info-banner {
      background: #f8fafc;
      border-left: 4px solid #ef4444;
      padding: 1rem 1.25rem;
      border-radius: 0 8px 8px 0;
      margin-bottom: 1.5rem;
    }
    .info-banner h3 {
      margin: 0 0 0.5rem 0;
      color: #1e293b;
    }
    .info-banner p {
      margin: 0;
      color: #475569;
      font-size: 0.95rem;
    }
    .rules-summary h4 {
      color: #334155;
      margin-bottom: 0.5rem;
    }
    .rules-summary ul {
      color: #64748b;
      padding-left: 1.25rem;
      line-height: 1.6;
    }
  `],
})
export class AdminPanelComponent {
  protected readonly authService = inject(AuthService);
}
