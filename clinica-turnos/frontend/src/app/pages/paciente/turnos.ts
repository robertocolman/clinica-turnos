import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ReservasService } from '../../core/services/reservas.service';
import { MedicosService, Medico } from '../../core/services/medicos.service';


@Component({
  standalone: true,
  imports: [FormsModule, DatePipe],
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
            Desde esta pantalla usted podrá reservar nuevos turnos,
            consultar sus reservas vigentes y cancelar turnos con hasta
            24 horas de anticipación, sin excepciones.
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
            [(ngModel)]="medicoSeleccionado"
            (ngModelChange)="cargarHorarios()">
            [disabled]="cargandoMedicos || medicos.length === 0">

            @if (cargandoMedicos) {
              <option value="">Cargando médicos...</option>
            } @else if (medicos.length === 0) {
              <option value="">No hay médicos disponibles</option>
            }

            @for (medico of medicos; track medico.id) {
              <option [value]="medico.id">
                {{ medico.nombre }} - $ {{ medico.valor }}
              </option>
            }
          </select>

          <label>Fecha</label>
          <input
            type="date"
            [(ngModel)]="fechaSeleccionada"
            (ngModelChange)="cargarHorarios()"
            [min]="fechaMinima"
            [max]="fechaMaxima">

          <label>Horario</label>
          <select
            [(ngModel)]="horarioSeleccionado"
            [disabled]="cargandoHorarios || horarios.length === 0">

            @if (cargandoHorarios) {
              <option value="">Consultando horarios disponibles...</option>
            } @else {
              <option value="">Seleccione un horario</option>
            }

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
          <table class="tabla-turnos">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Valor</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              @for (reserva of reservas(); track reserva.id) {
                <tr>
                  <td>{{ reserva.id }}</td>
                  <td>{{ reserva.fecha_hora | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td>
                    <span
                      class="estado"
                      [class.estado-activo]="reserva.estado === 'ACTIVO'"
                      [class.estado-cancelado]="reserva.estado === 'CANCELADO'">
                      {{ reserva.estado }}
                    </span>
                  </td>

                  <td>$ {{ reserva.valor_consulta }}</td>
                  <td>
                    @if (reserva.estado === 'ACTIVO') {
                      <button
                        class="btn-cancelar"
                        (click)="cancelarTurno(reserva.id)">
                        Cancelar
                      </button>
                    } @else {
                      -
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
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
    
    .tabla-turnos {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }

    .tabla-turnos th {
      background: #2563eb;
      color: white;
      padding: 12px;
      text-align: left;
    }

    .tabla-turnos td {
      border: 1px solid #e2e8f0;
      padding: 12px;
    }

    .tabla-turnos tr:nth-child(even) {
      background: #f8fafc;
    }

    .estado {
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 0.85rem;
      font-weight: bold;
    }

    .estado-activo {
      background: #dcfce7;
      color: #15803d;
    }

    .estado-cancelado {
      background: #fee2e2;
      color: #b91c1c;
    }
  `],
})

export class PacienteTurnosComponent {
  protected readonly authService = inject(AuthService);
  protected readonly reservasService = inject(ReservasService);
  private readonly medicosService = inject(MedicosService);

  protected readonly reservas = this.reservasService.reservas;

  constructor() {
    this.reservasService.cargarReservas();

    this.medicosService.obtenerMedicos().subscribe({
      next: (medicos) => {
        this.medicos = medicos;
        this.cargandoMedicos = false;

        if (medicos.length > 0) {
          this.medicoSeleccionado = medicos[0].id;
        }
      },
      error: (error) => {
        this.cargandoMedicos = false;
        console.error('Error al cargar médicos:', error);
        alert('No se pudo cargar la lista de médicos');
      }
    });
  }

  medicos: Medico[] = [];
  cargandoMedicos = true;

  horarios: string[] = [];
  cargandoHorarios = false;
  mensajeHorarios = '';

  fechaMinima = new Date().toISOString().split('T')[0];

  fechaMaxima = new Date(
    Date.now() + (30 * 24 * 60 * 60 * 1000)
  ).toISOString().split('T')[0];  
 
  
  medicoSeleccionado = 0;
  fechaSeleccionada = '';
  horarioSeleccionado = '08:00';
  mensajeExito = '';
  
  cancelarTurno(id: number): void {
    if (!confirm('¿Estás segura de cancelar este turno?')) {
      return;
    }

    this.reservasService.cancelarReserva(id).subscribe({
      next: () => {
        this.mensajeExito = 'Turno cancelado correctamente';
        this.reservasService.cargarReservas();
      },
      error: (error) => {
        alert(error.error?.message || 'No se pudo cancelar el turno');
        console.error('Error al cancelar:', error);
      }
    });
  }

  cargarHorarios(): void {
    this.horarios = [];
    this.horarioSeleccionado = '';
    this.mensajeHorarios = '';

    if (!this.medicoSeleccionado || !this.fechaSeleccionada) {
      return;
    }

    this.cargandoHorarios = true;

    this.reservasService.obtenerDisponibilidad(
      Number(this.medicoSeleccionado),
      this.fechaSeleccionada
    ).subscribe({
      next: (horarios) => {
        this.horarios = horarios;
        this.horarioSeleccionado = horarios[0] ?? '';
        this.cargandoHorarios = false;

        if (horarios.length === 0) {
          this.mensajeHorarios = 'No hay horarios disponibles para esta fecha';
        }
      },
      error: (error) => {
        this.cargandoHorarios = false;
        this.mensajeHorarios = 'No se pudieron cargar los horarios';
        console.error('Error al consultar disponibilidad:', error);
      }
    });
  }
  reservarTurno(): void {

    const medico = this.medicos.find(
      m => m.id === Number(this.medicoSeleccionado)
    );

    if (!medico || !this.fechaSeleccionada || !this.horarioSeleccionado) {
      alert('Debe seleccionar un médico, una fecha y un horario disponible');
      return;
    }

    this.reservasService.crearReserva(
      medico.id,
      `${this.fechaSeleccionada}T${this.horarioSeleccionado}:00`
    ).subscribe({
      next: () => {
        this.mensajeExito = '✅ Turno reservado correctamente';
        this.medicoSeleccionado = this.medicos[0]?.id ?? 0;
        this.fechaSeleccionada = '';
        this.horarios = [];
        this.horarioSeleccionado = '';
        this.mensajeHorarios = '';
      },
      error: (error) => {
        this.mensajeExito = '';
        alert(error.error?.message || 'No se pudo reservar el turno');
        console.error('Error al reservar:', error);
      },  
    });
  }
}
