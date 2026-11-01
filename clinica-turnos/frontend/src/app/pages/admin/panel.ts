import { Component, ChangeDetectorRef, inject, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ReservasService, MedicoOpcion, PacienteOpcion } from '../../core/services/reservas.service';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  standalone: true,
  imports: [FormsModule, DatePipe],
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
            reservas (cancelaciones permitidas hasta el momento exacto en que inicia la consulta),
            reservar turnos para cualquier paciente y modificar los valores de consulta de los médicos.
          </p>
        </div>
       
        <div class="reserva-admin">
          <h3>Reservar para paciente</h3>
          <label>Paciente</label>
          <select [(ngModel)]="pacienteSeleccionado" [disabled]="cargandoPacientes">
            <option [ngValue]="0" disabled>{{ cargandoPacientes ? 'Cargando pacientes...' : 'Seleccione un paciente' }}</option>
            @for (paciente of pacientes; track paciente.id) {
              <option [value]="paciente.id">
                {{ paciente.nombre }}
              </option>
            }
          </select>
          <label>Médico</label>
          <select [(ngModel)]="medicoSeleccionado" (ngModelChange)="cargarHorarios()" [disabled]="cargandoMedicos">
            <option [ngValue]="0" disabled>{{ cargandoMedicos ? 'Cargando médicos...' : 'Seleccione un médico' }}</option>
            @for (medico of medicos; track medico.id) {
              <option [value]="medico.id">
                {{ medico.nombre }} ($ {{ medico.valor }})
              </option>
            }
          </select>
          <label>Fecha</label>
          <input
           type="date"
           [(ngModel)]="fechaSeleccionada" (ngModelChange)="cargarHorarios()" [min]="fechaMinima" [max]="fechaMaxima">
          <label>Horario</label>
          <select [(ngModel)]="horarioSeleccionado" [disabled]="cargandoHorarios || horarios.length === 0">
            <option value="" disabled>{{ cargandoHorarios ? 'Consultando horarios...' : 'Seleccione un horario' }}</option>
            @for (horario of horarios; track horario) {
             <option [value]="horario">
              {{ horario }} hs
            </option>
            }
          </select>
          <button
            class="btn-reservar"
            (click)="reservarParaPaciente()">
            Reservar para paciente
          </button>
          </div>

          @if (mensaje) {
            <p class="mensaje-admin" role="status">
              {{ mensaje }}
            </p>
          }

          <h3 class="titulo-turnos">Todos los turnos</h3>

          <div class="filtros-admin">
            <span class="titulo-filtros">Filtros</span>

            <label>Estado</label>
            <select
              [(ngModel)]="filtroEstado"
              (ngModelChange)="mensajeCancelacion = ''">
              <option value="">Todos</option>
              <option value="ACTIVO">Activo</option>
              <option value="CANCELADO">Cancelado</option>
              <option value="ATENDIDO">Atendido</option>
              <option value="AUSENTE">Ausente</option>
            </select>

            <label>Médico</label>
            <select
              [(ngModel)]="filtroMedico"
              (ngModelChange)="mensajeCancelacion = ''">
              <option value="">Todos</option>
              @for (medico of medicos; track medico.id) {
                <option [value]="medico.id">{{ medico.nombre }}</option>
              }
            </select>

            <label>Fecha</label>
            <input
              type="date"
              [(ngModel)]="filtroFecha"
              (ngModelChange)="mensajeCancelacion = ''">
          </div>

          @if (mensajeCancelacion) {
            <p class="mensaje-admin" role="status">
              {{ mensajeCancelacion }}
            </p>
          } 

        <div class="turnos-admin">
          <table class="tabla-turnos">
            <thead>
              <tr>
                <th>ID</th>
                <th>Paciente</th>
                <th>Médico</th>
                <th>Fecha y Hora</th>
                <th>Estado</th>
                <th>Arancel Congelado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              @for (reserva of reservasFiltradas(); track reserva.id) {
                <tr>
                  <td><strong>#{{ reserva.id }}</strong></td>
                  <td>{{ obtenerNombrePaciente(reserva.id_paciente) }}</td>
                  <td>{{ obtenerNombreMedico(reserva.id_medico) }}</td>
                  <td>{{ reserva.fecha_hora | date:'dd/MM/yyyy HH:mm' }} hs</td>
                  <td>
                    <span
                      class="estado"
                      [class.estado-activo]="reserva.estado === 'ACTIVO'"
                      [class.estado-atendido]="reserva.estado === 'ATENDIDO'"
                      [class.estado-ausente]="reserva.estado === 'AUSENTE'"
                      [class.estado-cancelado]="reserva.estado === 'CANCELADO'">
                      {{ reserva.estado }}
                    </span>
                  </td>
                  <td>$ {{ reserva.valor_consulta.toLocaleString('es-AR') }}</td>
                  <td>
                    @if (puedeCancelar(reserva.fecha_hora, reserva.estado)) {
                      <button class="btn-cancelar" (click)="cancelarTurno(reserva.id)">Cancelar</button>
                    } @else if (reserva.estado === 'ACTIVO') {
                      <span class="plazo-vencido">Iniciado</span>
                    } @else {
                      -
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="empty-state">
                    No se encontraron turnos con los filtros seleccionados.
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
      max-width: 950px;
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
    .tabla-turnos {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    } 
    .tabla-turnos th {
      background: #dc2626;
      color: white;
      padding: 12px;
      text-align: left;
    }
    .tabla-turnos td {
      border: 1px solid #e2e8f0;
      padding: 12px;
      vertical-align: middle;
    }
    .tabla-turnos tr:nth-child(even) {
      background: #f8fafc;
    }
    .estado {
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: bold;
      display: inline-block;
      text-transform: uppercase;
    }
    .estado-activo {
      background: #dcfce7;
      color: #15803d;
    }
    .estado-atendido {
      background: #e0f2fe;
      color: #0369a1;
    }
    .estado-ausente {
      background: #fef3c7;
      color: #b45309;
    }
    .estado-cancelado {
      background: #fee2e2;
      color: #b91c1c;
    }
    .btn-cancelar {
      background: #dc2626;
      color: white;
      border: none;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .btn-cancelar:hover { background: #b91c1c; }
    .plazo-vencido {
      font-size: 0.8rem;
      color: #94a3b8;
      font-style: italic;
    }
    .reserva-admin {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
      margin-top: 2rem;
      margin-bottom: 2rem;
    }
    .reserva-admin input,
    .reserva-admin select {
      padding: 0.5rem;
      min-width: 160px;
    }
    .btn-reservar {
      align-self: flex-start;
      width: auto;
      padding: 0.8rem 1.5rem;
      border: none;
      border-radius: 8px;
      background: #dc2626;
      color: #fff;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-reservar:hover { background: #b91c1c; }
    .titulo-turnos {
      margin: 35px 0 15px;
      font-size: 20px;
      color: #0f172a;
    }
    .filtros-admin {
      display: flex;
      flex-direction: row;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
      margin: 0 0 15px;
    }
    .titulo-filtros {
      display: inline-block;
      margin: 0 15px 0 0;
      font-size: 17px;
      font-weight: bold;
      white-space: nowrap;
    }
    .filtros-admin label {
      margin: 0;
      white-space: nowrap;
    }
    .filtros-admin select,
    .filtros-admin input[type="date"] {
      box-sizing: border-box;
      height: 36px;
      padding: 4px 8px;
      margin: 0;
      font-size: 14px;
    }
    .mensaje-admin {
      margin: 12px 0 18px;
      color: #15803d;
      font-size: 15px;
      font-weight: 700;
    }
    .empty-state {
      text-align: center;
      color: #94a3b8;
      padding: 2rem !important;
    }
  `],
})
export class AdminPanelComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  protected readonly reservasService = inject(ReservasService);
  protected readonly reservas = this.reservasService.reservas;
  pacientes: PacienteOpcion[] = [];
  medicos: MedicoOpcion[] = [];
  horarios: string[] = [];
  medicoSeleccionado = 0;
  pacienteSeleccionado = 0;
  fechaSeleccionada = '';
  horarioSeleccionado = '';
  filtroEstado = '';
  filtroMedico = '';
  filtroFecha = '';
  mensaje = '';
  mensajeCancelacion = '';
  cargandoPacientes = true;
  cargandoMedicos = true;
  cargandoHorarios = false;
  private consultaHorarios = 0;
  private readonly cdr = inject(ChangeDetectorRef);

  private fechaLocal(dias = 0): string {
    const hoy = new Date(); hoy.setDate(hoy.getDate() + dias);
    return `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`;
  }
  get fechaMinima(): string { return this.fechaLocal(); }
  get fechaMaxima(): string { return this.fechaLocal(30); }

  ngOnInit(): void {
    this.reservasService.cargarReservas();

    this.reservasService.obtenerMedicos().subscribe({
      next: medicos => {
        this.medicos = medicos;
        this.cargandoMedicos = false;
        this.cdr.markForCheck();
      },
      error: e => {
        this.cargandoMedicos = false;
        this.mensaje = this.reservasService.mensajeError(e);
        this.cdr.markForCheck();
      }
    });

    this.reservasService.obtenerPacientes().subscribe({
      next: pacientes => {
        this.pacientes = pacientes;
        this.cargandoPacientes = false;
        this.cdr.markForCheck();
      },
      error: e => {
        this.cargandoPacientes = false;
        this.mensaje = this.reservasService.mensajeError(e);
        this.cdr.markForCheck();
      }
    });
  }

  cargarHorarios(): void {
    const consultaActual = ++this.consultaHorarios;

    this.horarios = [];
    this.horarioSeleccionado = '';
    this.cargandoHorarios = false;

    if (!this.medicoSeleccionado || !this.fechaSeleccionada) {
      return;
    }

    this.cargandoHorarios = true;

    this.reservasService.obtenerDisponibilidad(
      Number(this.medicoSeleccionado),
      this.fechaSeleccionada
    ).subscribe({
      next: horarios => {
        if (consultaActual !== this.consultaHorarios) return;

        this.horarios = horarios;
        this.cargandoHorarios = false;
        this.cdr.markForCheck();
      },

      error: e => {
        if (consultaActual !== this.consultaHorarios) return;

        this.cargandoHorarios = false;
        this.mensaje = this.reservasService.mensajeError(e);
        this.cdr.markForCheck();
      }
    });
  }

  reservasFiltradas() {
    return this.reservas().filter(r =>
      (!this.filtroEstado || r.estado === this.filtroEstado) &&
      (!this.filtroMedico || r.id_medico === Number(this.filtroMedico)) &&
      (!this.filtroFecha || r.fecha_hora.startsWith(this.filtroFecha))
    );
  }

  reservarParaPaciente(): void {
    this.mensajeCancelacion = '';
    if (!this.medicoSeleccionado || !this.pacienteSeleccionado || !this.fechaSeleccionada || !this.horarioSeleccionado) {
      this.mensaje = 'Seleccioná paciente, médico, fecha y horario'; return;
    }
    this.mensaje = '';
    this.reservasService.crearReserva(Number(this.medicoSeleccionado), `${this.fechaSeleccionada}T${this.horarioSeleccionado}:00`, Number(this.pacienteSeleccionado)).subscribe({
      next: () => {
        this.mensaje = 'Turno reservado correctamente';
        this.cargarHorarios();
      },
      error: e => this.mensaje = this.reservasService.mensajeError(e)
    });
  }

  puedeCancelar(fecha: string, estado: string): boolean {
    return estado === 'ACTIVO' && new Date(fecha).getTime() > Date.now();
  }

  cancelarTurno(id: number): void {
    if (!confirm('¿Querés cancelar este turno?')) return;

    this.mensaje = '';
    this.mensajeCancelacion = '';

    this.reservasService.cancelarReserva(id).subscribe({
      next: () => {
        this.mensajeCancelacion = 'Turno cancelado correctamente';
        this.cargarHorarios();
      },
      error: e => {
        this.mensajeCancelacion = this.reservasService.mensajeError(e);
      }
    });
  }

  obtenerNombrePaciente(id: number): string {
    return this.reservas().find(r => r.id_paciente === id)?.paciente_nombre ?? this.pacientes.find(p => p.id === id)?.nombre ?? `Paciente #${id}`;
  }

  obtenerNombreMedico(id: number): string {
    return this.medicos.find(m => m.id === id)?.nombre ?? `Médico #${id}`;
  }
}
