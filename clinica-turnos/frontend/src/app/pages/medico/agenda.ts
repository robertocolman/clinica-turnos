import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';


@Component({
  selector: 'app-medico-agenda',
  template: `
    <div class="page-container">
      <div class="header-card">
        <div class="header-badge">🩺 Espacio del Médico</div>
        <h1>Agenda Diaria de Consultas</h1>
        <p class="subtitle">Dr./Dra. {{ authService.userFullName() }}</p>
      </div>

      <div class="content-card">
        <div class="info-banner">
          <h3>📌 Módulo de Médicos (API y Agenda)</h3>
          <p>
            Esta sección corresponde a <strong>Esteban (P4)</strong> para la consulta de turnos
            reservados por fecha y para marcar a cada paciente como <em>"Atendido"</em> o <em>"Ausente"</em>.
          </p>
        </div>

        <div class="rules-summary">
          <h4>Funcionalidades del Médico:</h4>
          <ul>
            <li>Visualizar lista de pacientes citados por fecha.</li>
            <li>Cambiar el estado del turno a <strong>ATENDIDO</strong> o <strong>AUSENTE</strong>.</li>
            <li>Horarios fijos de atención entre las <strong>8:00 y las 16:00 hs</strong>.</li>
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
      background: #f0fdf4;
      color: #16a34a;
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
      border-left: 4px solid #16a34a;
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
export class MedicoAgendaComponent {
  protected readonly authService = inject(AuthService);
}
