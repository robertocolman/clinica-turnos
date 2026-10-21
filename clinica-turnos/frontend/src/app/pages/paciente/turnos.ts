import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ReservasService } from '../../core/services/reservas.service';


@Component({
  imports: [FormsModule],
  selector: 'app-paciente-turnos',
  template: `
    <div class="page-container">
      <div class="header-card">
        <div class="header-badge">👤 Espacio del Paciente</div>
        <h1>Mis Turnos Reservados</h1>
        <p class="subtitle">Bienvenido/a, {{ authService.userFullName() }}</p>
      </div>

      <div class="content-card">
        <div class="info-banner">
          <h3>📌 Módulo de Reservas (Frontend)</h3>
          <p>
            Esta sección corresponde a <strong>Mar (P5)</strong> para la selección de médicos,
            reserva de turnos en horarios de 8 a 16 hs, cancelación (hasta el día anterior) y visualización de valores congelados.
          </p>
        </div>

        <div class="rules-summary">
          <h4>Reglas del Sistema aplicables:</h4>
          <ul>
            <li>Atención de <strong>8:00 a 16:00 hs</strong> (turnos de 1 hora fija).</li>
            <li>Cancelación de turnos permitida <strong>hasta el día anterior</strong> a la consulta.</li>
            <li>El valor de la consulta queda <strong>congelado</strong> al momento de la reserva.</li>
          </ul>
        </div>
        
        <div class="reserva-form">
          <h3>Reservar turno</h3>
          <label>Médico</label>
          <select
            [(ngModel)]="medicoSeleccionado">

            @for (medico of medicos; track medico.id) {
              <option [value]="medico.id">
                {{ medico.nombre }} - $ {{ medico.valor }}
              </option>
            }

          </select>

          <label>Fecha</label>

          <input
            type="date"
            [(ngModel)]="fechaSeleccionada">

          <label>Horario</label>

          <select
            [(ngModel)]="horarioSeleccionado">

            @for (horario of horarios; track horario) {
              <option [value]="horario">
                {{ horario }}
              </option>
            }

          </select>

          <button
            class="btn-reservar"
            (click)="reservarTurno()">

            Reservar turno

          </button>

        </div>

        <div class="turnos-section">
          <h4>Mis turnos</h4>

          @for (reserva of reservas(); track reserva.id) {
          <div class="turno-card">
            <p><strong>ID:</strong> {{ reserva.id }}</p>
            <p><strong>Fecha:</strong> {{ reserva.fecha_hora }}</p>
            <p><strong>Estado:</strong> {{ reserva.estado }}</p>
            <p><strong>Valor:</strong> $ {{ reserva.valor_consulta }}</p>
            
            @if (reserva.estado === 'ACTIVO') {
              <button
                class="btn-cancelar"
                (click)="cancelarTurno(reserva.id)">
                Cancelar turno
              </button>
            }
          </div>
          }
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
      background: #eff6ff;
      color: #2563eb;
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
      border-left: 4px solid #3b82f6;
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
    .turnos-section {
      margin-top: 2rem;
    }
    .turno-card {
      border: 1px solid #cbd5e1;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      background: #f8fafc;
    }
    .btn-cancelar {
      background: #dc2626;
      color: white;
      border: none;
      padding: 0.6rem 1rem;
      border-radius: 6px;
      cursor: pointer;
    }

    .btn-cancelar:hover {
      background: #b91c1c;
    }
    
    .reserva-form {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
      margin-top: 2rem;
      margin-bottom: 2rem;
    }

    .reserva-form input,
    .reserva-form select {
      padding: 0.5rem;
    }

    .btn-reservar {
      background: #2563eb;
      color: white;
      border: none;
      padding: 0.8rem;
      border-radius: 6px;
      cursor: pointer;
    }

    .btn-reservar:hover {
      background: #1d4ed8;
    }
  `],
})

export class PacienteTurnosComponent {
  protected readonly authService = inject(AuthService);
  protected readonly reservasService = inject(ReservasService);

  protected readonly reservas = this.reservasService.reservas;

  medicos = [
    { id: 1, nombre: 'Dr. Pérez', valor: 15000 },
    { id: 2, nombre: 'Dra. Gómez', valor: 18000 },
  ];

  horarios = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00'
  ];
  
  medicoSeleccionado = 1;
  fechaSeleccionada = '';
  horarioSeleccionado = '08:00';

  cancelarTurno(id: number): void {
  this.reservasService.cancelarReserva(id);
  }

  reservarTurno(): void {

    const medico = this.medicos.find(
      m => m.id === Number(this.medicoSeleccionado)
    );

    if (!medico || !this.fechaSeleccionada) {
      alert('Debe seleccionar una fecha');
      return;
    }

    this.reservasService.crearReserva(
      medico.id,
      2,
      `${this.fechaSeleccionada}T${this.horarioSeleccionado}:00`,
      medico.valor
    );
    this.medicoSeleccionado = 1;
    this.fechaSeleccionada = '';
    this.horarioSeleccionado = '08:00';
    }
}
