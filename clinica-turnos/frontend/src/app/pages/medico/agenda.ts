import { Component, inject, signal, computed, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

export interface TurnoMedico {
  id: number;
  pacienteNombre: string;
  pacienteDocumento: string;
  fechaHora: string;
  estado: 'ACTIVO' | 'ATENDIDO' | 'AUSENTE' | 'CANCELADO';
  valorConsulta: number;
}

@Component({
  selector: 'app-medico-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="agenda-container">
      <div class="header-card">
        <div class="header-top">
          <span class="badge-role">🩺 Portal Médico</span>
          <span class="badge-specialty">Clínica Médica General</span>
        </div>
        <h1>Agenda de Consultas</h1>
        <p class="subtitle">Bienvenido/a, {{ authService.userFullName() }}</p>
      </div>

      <div class="valor-card">
        <div class="valor-info">
          <h3>💰 Valor de Consulta Actual</h3>
          <p class="valor-desc">
            Arancel vigente registrado para tus consultas.
            <br>
            <strong class="highlight-rule">Regla del sistema:</strong>
            Las reservas ya tomadas conservan su valor congelado; las nuevas consultas aplican con el valor vigente fijado.
          </p>
        </div>
        <div class="valor-action">
          @if (!editandoValor()) {
            <div class="monto-actual">$ {{ valorConsultaActual().toLocaleString('es-AR') }}</div>
            <button class="btn btn-secondary" (click)="iniciarEdicionValor()">
              ✏️ Modificar Arancel
            </button>
          } @else {
            <div class="input-group">
              <span class="input-prefix">$</span>
              <input
                type="number"
                class="form-control"
                [(ngModel)]="nuevoValorInput"
                min="1000"
                step="500"
              />
            </div>
            <div class="button-group">
              <button class="btn btn-primary" (click)="guardarNuevoValor()">Guardar</button>
              <button class="btn btn-cancel" (click)="cancelarEdicionValor()">Cancelar</button>
            </div>
          }
        </div>
      </div>

      @if (mensajeFeedback()) {
        <div class="alert alert-success">
          {{ mensajeFeedback() }}
        </div>
      }

      <div class="table-card">
        <div class="table-header">
          <div class="table-title">
            <h2>📅 Turnos de la Agenda</h2>
            <span class="counter">{{ turnosFiltrados().length }} turno(s) en total</span>
          </div>

          <div class="filter-bar">
            <!-- Requisito Consigna: Consultar turnos dada una fecha -->
            <div class="filter-group">
              <label for="fechaAgenda">Fecha:</label>
              <input
                id="fechaAgenda"
                type="date"
                class="form-control-date"
                [(ngModel)]="filtroFecha"
                (ngModelChange)="onCambioFecha()"
              />
              @if (filtroFecha) {
                <button class="btn-clean-date" (click)="limpiarFecha()" title="Ver todas las fechas">
                  Ver todos
                </button>
              }
            </div>

            <!-- Filtrado por estado con reactividad inmediata -->
            <div class="filter-group">
              <label for="filtroEstado">Estado:</label>
              <select
                id="filtroEstado"
                [ngModel]="filtroEstado()"
                (ngModelChange)="filtroEstado.set($event)"
                class="form-select"
              >
                <option value="TODOS">Todos los estados</option>
                <option value="ACTIVO">Solo Activos (Pendientes)</option>
                <option value="ATENDIDO">Atendidos</option>
                <option value="AUSENTE">Ausentes</option>
                <option value="CANCELADO">Cancelados</option>
              </select>
            </div>
          </div>
        </div>

        <div class="table-responsive">
          <table class="turnos-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha y Hora</th>
                <th>Paciente</th>
                <th>DNI</th>
                <th>Arancel Congelado</th>
                <th>Estado</th>
                <th class="text-center">Acciones Clínicas</th>
              </tr>
            </thead>
            <tbody>
              @for (turno of turnosFiltrados(); track turno.id) {
                <tr [class.row-atendido]="turno.estado === 'ATENDIDO'" [class.row-cancelado]="turno.estado === 'CANCELADO'">
                  <td><strong>#{{ turno.id }}</strong></td>
                  <td>{{ formatearFechaHora(turno.fechaHora) }} hs</td>
                  <td class="paciente-name">{{ turno.pacienteNombre }}</td>
                  <td>{{ turno.pacienteDocumento }}</td>
                  <td>$ {{ turno.valorConsulta.toLocaleString('es-AR') }}</td>
                  <td>
                    <span class="status-badge" [ngClass]="'status-' + turno.estado.toLowerCase()">
                      {{ turno.estado }}
                    </span>
                  </td>
                  <td class="text-center">
                    @if (turno.estado === 'ACTIVO') {
                      <div class="action-buttons">
                        <button
                          class="btn-action btn-atendido"
                          title="Marcar como atendido"
                          (click)="cambiarEstado(turno.id, 'ATENDIDO')"
                        >
                          ✓ Atendido
                        </button>
                        <button
                          class="btn-action btn-ausente"
                          title="Marcar paciente ausente"
                          (click)="cambiarEstado(turno.id, 'AUSENTE')"
                        >
                          ✕ Ausente
                        </button>
                      </div>
                    } @else if (turno.estado === 'ATENDIDO') {
                      <span class="action-done text-success">✓ Consulta Realizada</span>
                    } @else if (turno.estado === 'AUSENTE') {
                      <span class="action-done text-danger">Inasistencia Registrada</span>
                    } @else {
                      <span class="action-done text-muted">Cancelado</span>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="empty-state">
                    No se encontraron turnos para la fecha o filtros seleccionados.
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
    .agenda-container {
      max-width: 1100px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    .header-card {
      background: #ffffff;
      padding: 1.5rem 2rem;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      margin-bottom: 1.5rem;
    }
    .header-top {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }
    .badge-role {
      font-size: 0.75rem;
      font-weight: 700;
      background: #eff6ff;
      color: #2563eb;
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      text-transform: uppercase;
    }
    .badge-specialty {
      font-size: 0.75rem;
      font-weight: 600;
      background: #f1f5f9;
      color: #475569;
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
    }
    h1 {
      margin: 0;
      font-size: 1.6rem;
      color: #0f172a;
    }
    .subtitle {
      margin: 0.35rem 0 0;
      color: #64748b;
      font-size: 0.95rem;
    }
    .valor-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.5rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }
    .valor-info h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
      color: #0f172a;
    }
    .valor-desc {
      margin: 0;
      font-size: 0.9rem;
      color: #64748b;
      line-height: 1.4;
    }
    .highlight-rule {
      color: #0284c7;
    }
    .valor-action {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.75rem;
      min-width: 220px;
    }
    .monto-actual {
      font-size: 1.8rem;
      font-weight: 800;
      color: #059669;
    }
    .input-group {
      display: flex;
      align-items: center;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      overflow: hidden;
      background: white;
    }
    .input-prefix {
      padding: 0.5rem 0.75rem;
      background: #f8fafc;
      color: #64748b;
      font-weight: 600;
      border-right: 1px solid #cbd5e1;
    }
    .form-control {
      border: none;
      padding: 0.5rem 0.75rem;
      font-size: 1rem;
      outline: none;
      width: 130px;
    }
    .button-group {
      display: flex;
      gap: 0.5rem;
    }
    .btn {
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    }
    .btn-primary { background: #0284c7; color: white; }
    .btn-primary:hover { background: #0369a1; }
    .btn-secondary { background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; }
    .btn-secondary:hover { background: #e2e8f0; }
    .btn-cancel { background: transparent; color: #64748b; }
    .btn-cancel:hover { color: #0f172a; }

    .alert {
      padding: 0.85rem 1.25rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
      font-weight: 500;
    }
    .alert-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }

    .table-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }
    .table-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .table-title h2 { margin: 0; font-size: 1.15rem; color: #0f172a; }
    .counter { font-size: 0.85rem; color: #64748b; margin-top: 0.2rem; display: block; }

    .filter-bar {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      flex-wrap: wrap;
    }
    .filter-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: #475569;
    }
    .form-control-date, .form-select {
      padding: 0.4rem 0.75rem;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      font-size: 0.85rem;
      outline: none;
      background: white;
    }
    .btn-clean-date {
      background: none;
      border: none;
      color: #0284c7;
      cursor: pointer;
      font-size: 0.85rem;
      text-decoration: underline;
      padding: 0;
    }

    .table-responsive { width: 100%; overflow-x: auto; }
    .turnos-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
    .turnos-table th { background: #f8fafc; padding: 0.85rem 1.25rem; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0; }
    .turnos-table td { padding: 0.95rem 1.25rem; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
    .turnos-table tr:hover { background: #f8fafc; }
    .row-atendido { background: #fcfdfc; }
    .row-cancelado { opacity: 0.6; }
    .paciente-name { font-weight: 600; color: #0f172a; }

    .status-badge {
      display: inline-block;
      padding: 0.2rem 0.55rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
    }
    .status-activo { background: #eff6ff; color: #1d4ed8; }
    .status-atendido { background: #dcfce7; color: #15803d; }
    .status-ausente { background: #fee2e2; color: #b91c1c; }
    .status-cancelado { background: #f1f5f9; color: #64748b; }

    .action-buttons { display: flex; gap: 0.4rem; justify-content: center; }
    .btn-action {
      padding: 0.35rem 0.65rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn-atendido { background: #16a34a; color: white; }
    .btn-atendido:hover { background: #15803d; }
    .btn-ausente { background: #dc2626; color: white; }
    .btn-ausente:hover { background: #b91c1c; }

    .action-done { font-size: 0.85rem; font-weight: 600; }
    .empty-state { text-align: center; color: #94a3b8; padding: 2rem !important; }
    .text-center { text-align: center; }
    .text-success { color: #15803d; }
    .text-danger { color: #b91c1c; }
    .text-muted { color: #64748b; }
  `]
})
export class MedicoAgendaComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly valorConsultaActual = signal(15000);
  readonly editandoValor = signal(false);
  nuevoValorInput = 15000;
  readonly mensajeFeedback = signal<string | null>(null);

  readonly turnos = signal<TurnoMedico[]>([]);
  filtroFecha = '';
  readonly filtroEstado = signal<string>('TODOS');

  readonly turnosFiltrados = computed(() => {
    const estado = this.filtroEstado();
    const lista = this.turnos();
    if (estado === 'TODOS') return lista;
    return lista.filter(t => t.estado === estado);
  });

  ngOnInit(): void {
    this.cargarDatosBackend();
  }

  onCambioFecha(): void {
    this.cargarAgenda();
  }

  limpiarFecha(): void {
    this.filtroFecha = '';
    this.cargarAgenda();
  }

  private cargarDatosBackend(): void {
    // 1. Cargar perfil seguro del médico y arancel vigente
    this.http.get<{ valorConsulta: number }>('/api/medicos/perfil').subscribe({
      next: (perfil) => {
        if (perfil && perfil.valorConsulta) {
          this.valorConsultaActual.set(Number(perfil.valorConsulta));
        }
      },
      error: () => {},
    });

    // 2. Cargar turnos de agenda
    this.cargarAgenda();
  }

  private cargarAgenda(): void {
    let params = new HttpParams();
    if (this.filtroFecha) {
      params = params.set('fecha', this.filtroFecha);
    }

    this.http.get<TurnoMedico[]>('/api/medicos/mi-agenda', { params }).subscribe({
      next: (turnosBackend) => {
        this.turnos.set(turnosBackend || []);
        this.cdr.markForCheck();
      },
      error: () => {
        this.turnos.set([]);
        this.cdr.markForCheck();
      },
    });
  }

  iniciarEdicionValor(): void {
    this.nuevoValorInput = this.valorConsultaActual();
    this.editandoValor.set(true);
  }

  guardarNuevoValor(): void {
    if (this.nuevoValorInput && this.nuevoValorInput >= 1000) {
      this.http.patch<{ valorConsulta: number }>('/api/medicos/valor-consulta', {
        valorConsulta: this.nuevoValorInput,
      }).subscribe({
        next: (resp) => {
          this.valorConsultaActual.set(Number(resp.valorConsulta || this.nuevoValorInput));
          this.editandoValor.set(false);
          this.mostrarFeedback(`✓ Arancel actualizado con éxito a $ ${this.nuevoValorInput.toLocaleString('es-AR')}.`);
        },
        error: (err) => {
          const msg = err.error?.message || 'Error al actualizar arancel';
          this.mostrarFeedback(`❌ ${msg}`);
        },
      });
    }
  }

  cancelarEdicionValor(): void {
    this.editandoValor.set(false);
  }

  cambiarEstado(turnoId: number, nuevoEstado: 'ATENDIDO' | 'AUSENTE'): void {
    this.http.patch<TurnoMedico>(`/api/medicos/turnos/${turnoId}/estado`, {
      nuevoEstado,
    }).subscribe({
      next: () => {
        this.turnos.update(turnosActuales =>
          turnosActuales.map(t => (t.id === turnoId ? { ...t, estado: nuevoEstado } : t))
        );
        const mensaje = nuevoEstado === 'ATENDIDO' 
          ? `✓ Turno #${turnoId} registrado como ATENDIDO.` 
          : `⚠️ Turno #${turnoId} registrado como AUSENTE.`;
        this.mostrarFeedback(mensaje);
        this.cdr.markForCheck();
      },
      error: (err) => {
        alert(err.error?.message || 'No se pudo actualizar el estado');
      },
    });
  }

  formatearFechaHora(fechaIso: string): string {
    if (!fechaIso) return '';
    const sinIso = fechaIso.replace('T', ' ');
    const [fecha, hora] = sinIso.split(' ');
    const [anio, mes, dia] = (fecha || '').split('-');
    const horaCorta = (hora || '').substring(0, 5);
    return `${dia}/${mes}/${anio} ${horaCorta}`;
  }

  private mostrarFeedback(msg: string): void {
    this.mensajeFeedback.set(msg);
    setTimeout(() => this.mensajeFeedback.set(null), 4000);
  }
}
