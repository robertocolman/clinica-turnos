import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ReservasService } from '../../core/services/reservas.service';
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
          <select [(ngModel)]="medicoSeleccionado">
            @for (medico of medicos; track medico.id) {
              <option [value]="medico.id">
                {{ medico.nombre }}
              </option>
            }
          </select>
          <label>Fecha</label>
          <input
           type="date"
           [(ngModel)]="fechaSeleccionada">
          <label>Horario</label>
          <select [(ngModel)]="horarioSeleccionado">
            @for (horario of horarios; track horario) {
             <option [value]="horario">
              {{ horario }}
            </option>
            }
          </select>
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
            <option value="1">Dr. Pérez</option>
            <option value="2">Dra. Gómez</option>
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
              </tr>
            </thead>
            <tbody>
              @for (reserva of reservasFiltradas(); track reserva.id) {
                <tr>
                  <td>{{ reserva.id }}</td>
                  <td>{{ obtenerNombrePaciente(reserva.id_paciente) }}</td>
                  <td>{{ obtenerNombreMedico(reserva.id_medico) }}</td>
                  <td>{{ reserva.fecha_hora }}</td>
                  <td>
                    <span
                      class="estado"
                      [class.estado-activo]="reserva.estado === 'ACTIVO'"
                      [class.estado-cancelado]="reserva.estado === 'CANCELADO'">
                      {{ reserva.estado }}
                    </span>
                  </td>
                  <td>$ {{ reserva.valor_consulta }}</td>
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
export class AdminPanelComponent {
  protected readonly authService = inject(AuthService);
  protected readonly reservasService = inject(ReservasService);

  protected readonly reservas = this.reservasService.reservas;
  
  pacientes = [
    { id: 1, nombre: 'Juan Pérez' },
    { id: 2, nombre: 'Ana Gómez' },
    { id: 3, nombre: 'Carlos López' }
  ];
  medicos = [
    { id: 1, nombre: 'Dr. Pérez', valor: 15000 },
    { id: 2, nombre: 'Dra. Gómez', valor: 18000 }
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
  pacienteSeleccionado = 1;
  filtroEstado = '';
  filtroMedico = '';
  filtroFecha = '';

  reservasFiltradas() {
    let reservas = this.reservas();

    if (this.filtroEstado) {
      reservas = reservas.filter(
        r => r.estado === this.filtroEstado
      );
    }

    if (this.filtroMedico) {
      reservas = reservas.filter(
        r => r.id_medico === Number(this.filtroMedico)
      );
    }
    if (this.filtroFecha) {
      reservas = reservas.filter(
        r => r.fecha_hora.startsWith(this.filtroFecha)
      );
    }
    return reservas;
  }
  reservarParaPaciente(): void {
    const medico = this.medicos.find(
      m => m.id === Number(this.medicoSeleccionado)
    );

    if (!medico || !this.fechaSeleccionada) {
      return;
    }

    this.reservasService.crearReserva(
      medico.id,
      Number(this.pacienteSeleccionado),
      `${this.fechaSeleccionada}T${this.horarioSeleccionado}:00`,
      medico.valor
    );
  }
  obtenerNombrePaciente(id: number): string {
    const paciente = this.pacientes.find(
      p => p.id === id
    );

    return paciente?.nombre ?? `Paciente ${id}`;

  }

  obtenerNombreMedico(id: number): string {
    const medico = this.medicos.find(
      m => m.id === id
    );

    return medico?.nombre ?? `Médico ${id}`;
  }
  formatearFecha(fecha: string): string {
    const date = new Date(fecha);

    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
