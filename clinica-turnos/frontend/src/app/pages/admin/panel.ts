import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ReservasService, MedicoOpcion, PacienteOpcion } from '../../core/services/reservas.service';
import { FormsModule } from '@angular/forms';


@Component({
  standalone: true,
  imports: [FormsModule],
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
       
        <div class="reserva-admin">
          <h4>Reservar para paciente</h4>
          <label>Paciente</label>
          <select [(ngModel)]="pacienteSeleccionado">
            @for (paciente of pacientes; track paciente.id) {
              <option [value]="paciente.id">
                {{ paciente.nombre }}
              </option>
            }
          </select>
          <label>Médico</label>
          <select [(ngModel)]="medicoSeleccionado" (ngModelChange)="cargarHorarios()">
            @for (medico of medicos; track medico.id) {
              <option [value]="medico.id">
                {{ medico.nombre }}
              </option>
            }
          </select>
          <label>Fecha</label>
          <input
           type="date"
           [(ngModel)]="fechaSeleccionada" (ngModelChange)="cargarHorarios()" [min]="fechaMinima" [max]="fechaMaxima">
          <label>Horario</label>
          <select [(ngModel)]="horarioSeleccionado">
            @for (horario of horarios; track horario) {
             <option [value]="horario">
              {{ horario }}
            </option>
            }
          </select>
          <p>{{ mensaje }}</p>
          <button
            class="btn-reservar"
            (click)="reservarParaPaciente()">
            Reservar para paciente
          </button>
        </div>

        <div class="filtros-admin">
          <h4>Filtros</h4>
          <label>Estado</label>
          <select [(ngModel)]="filtroEstado">
            <option value="">Todos</option>
            <option value="ACTIVO">Activo</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
          <label>Médico</label>
          <select [(ngModel)]="filtroMedico">
            <option value="">Todos</option>
            @for (medico of medicos; track medico.id) { <option [value]="medico.id">{{ medico.nombre }}</option> }
          </select>
          <label>Fecha</label>
          <input
            type="date"
            [(ngModel)]="filtroFecha">
        </div>  

        <div class="turnos-admin">
          <h4>Todos los turnos</h4>
          <table class="tabla-turnos">
            <thead>
              <tr>
                <th>ID</th>
                <th>Paciente</th>
                <th>Médico</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Valor</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              @for (reserva of reservasFiltradas(); track reserva.id) {
                <tr>
                  <td>{{ reserva.id }}</td>
                  <td>{{ obtenerNombrePaciente(reserva.id_paciente) }}</td>
                  <td>{{ obtenerNombreMedico(reserva.id_medico) }}</td>
                  <td>{{ formatearFecha(reserva.fecha_hora) }}</td>
                  <td>
                    <span
                      class="estado"
                      [class.estado-activo]="reserva.estado === 'ACTIVO'"
                      [class.estado-cancelado]="reserva.estado === 'CANCELADO'">
                      {{ reserva.estado }}
                    </span>
                  </td>
                  <td>$ {{ reserva.valor_consulta }}</td>
                  <td>@if (puedeCancelar(reserva.fecha_hora, reserva.estado)) { <button (click)="cancelarTurno(reserva.id)">Cancelar</button> }</td>
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
    .filtros-admin {
      display: flex;
      gap: 1rem;
      align-items: end;
      flex-wrap: wrap;
      margin-top: 2rem;
      margin-bottom: 2rem;
}

    .filtros-admin select {
      padding: 0.5rem;
      margin-top: 0.5rem;
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

  private fechaLocal(dias = 0): string {
    const hoy = new Date(); hoy.setDate(hoy.getDate() + dias);
    return `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`;
  }
  get fechaMinima(): string { return this.fechaLocal(); }
  get fechaMaxima(): string { return this.fechaLocal(30); }

  ngOnInit(): void {
    this.reservasService.cargarReservas();
    this.reservasService.obtenerMedicos().subscribe({
      next: medicos => { this.medicos = medicos; this.medicoSeleccionado = medicos[0]?.id ?? 0; },
      error: e => this.mensaje = this.reservasService.mensajeError(e)
    });
    this.reservasService.obtenerPacientes().subscribe({
      next: pacientes => { this.pacientes = pacientes; this.pacienteSeleccionado = pacientes[0]?.id ?? 0; },
      error: e => this.mensaje = this.reservasService.mensajeError(e)
    });
  }

  cargarHorarios(): void {
    this.horarios = []; this.horarioSeleccionado = '';
    if (!this.medicoSeleccionado || !this.fechaSeleccionada) return;
    this.reservasService.obtenerDisponibilidad(Number(this.medicoSeleccionado), this.fechaSeleccionada).subscribe({
      next: horarios => { this.horarios = horarios; this.horarioSeleccionado = horarios[0] ?? ''; },
      error: e => this.mensaje = this.reservasService.mensajeError(e)
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
    if (!this.medicoSeleccionado || !this.pacienteSeleccionado || !this.fechaSeleccionada || !this.horarioSeleccionado) {
      this.mensaje = 'Seleccioná paciente, médico, fecha y horario'; return;
    }
    this.reservasService.crearReserva(Number(this.medicoSeleccionado), `${this.fechaSeleccionada}T${this.horarioSeleccionado}:00`, Number(this.pacienteSeleccionado)).subscribe({
      next: () => { this.mensaje = 'Turno reservado correctamente'; this.cargarHorarios(); },
      error: e => this.mensaje = this.reservasService.mensajeError(e)
    });
  }

  puedeCancelar(fecha: string, estado: string): boolean {
    return estado === 'ACTIVO' && new Date(fecha).getTime() > Date.now();
  }
  cancelarTurno(id: number): void {
    if (!confirm('¿Querés cancelar este turno?')) return;
    this.reservasService.cancelarReserva(id).subscribe({
      next: () => { this.mensaje = 'Turno cancelado correctamente'; this.cargarHorarios(); },
      error: e => this.mensaje = this.reservasService.mensajeError(e)
    });
  }
  obtenerNombrePaciente(id: number): string { return this.reservas().find(r => r.id_paciente === id)?.paciente_nombre ?? this.pacientes.find(p => p.id === id)?.nombre ?? `Paciente ${id}`; }
  obtenerNombreMedico(id: number): string { return this.medicos.find(m => m.id === id)?.nombre ?? `Médico ${id}`; }
  formatearFecha(fecha: string): string { return new Date(fecha).toLocaleString('es-AR'); }
}
