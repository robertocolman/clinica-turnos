import { Component, inject, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

export interface MedicoItem {
  id: number;
  usuarioId: number;
  matricula: number;
  nombreCompleto: string;
  especialidad: string;
  valorConsulta: number;
}

@Component({
  selector: 'app-admin-medicos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="header-card">
        <div class="header-badge">👑 Gestión Administrativa</div>
        <h1>Valores de Consulta de Médicos</h1>
        <p class="subtitle">
          Administrador: {{ authService.userFullName() }} | Modificación de aranceles profesionales de la clínica
        </p>
      </div>

      <div class="content-card">
        <div class="info-banner">
          <h3>📌 Requisito de la Consigna (Rol Administrador)</h3>
          <p>
            Los Administradores pueden <strong>modificar el valor de la consulta de los médicos</strong>.
            Al actualizar el arancel de un profesional, las reservas previamente tomadas conservan su arancel congelado;
            el nuevo monto regirá exclusivamente para turnos que se reserven de ahora en adelante.
          </p>
        </div>

        @if (mensajeFeedback()) {
          <div class="alert alert-success" role="status">
            {{ mensajeFeedback() }}
          </div>
        }

        @if (mensajeError()) {
          <div class="alert alert-danger" role="alert">
            {{ mensajeError() }}
          </div>
        }

        <div class="table-responsive">
          <table class="medicos-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Médico Profesional</th>
                <th>Matrícula</th>
                <th>Especialidad</th>
                <th>Arancel Vigente</th>
                <th>Nuevo Arancel</th>
                <th class="text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              @for (m of medicos(); track m.id) {
                <tr>
                  <td><strong>#{{ m.id }}</strong></td>
                  <td class="medico-name">{{ m.nombreCompleto }}</td>
                  <td>{{ m.matricula }}</td>
                  <td><span class="badge-esp">{{ m.especialidad }}</span></td>
                  <td class="monto-vigente">$ {{ m.valorConsulta.toLocaleString('es-AR') }}</td>
                  <td>
                    <div class="input-monto">
                      <span class="prefix">$</span>
                      <input
                        type="number"
                        [(ngModel)]="valoresEditados[m.id]"
                        min="1000"
                        step="500"
                        class="form-control"
                      />
                    </div>
                  </td>
                  <td class="text-center">
                    <button
                      class="btn btn-primary"
                      (click)="guardarValor(m.id)"
                      [disabled]="cargandoId === m.id"
                    >
                      {{ cargandoId === m.id ? 'Guardando...' : 'Actualizar' }}
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="empty-state">
                    {{ cargando ? 'Cargando nómina de médicos...' : 'No hay médicos registrados.' }}
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
      max-width: 1000px;
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
      font-size: 1.6rem;
      color: #0f172a;
    }
    .subtitle {
      color: #64748b;
      margin: 0.35rem 0 0;
      font-size: 0.95rem;
    }
    .content-card {
      background: #ffffff;
      padding: 2rem;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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
      font-size: 1.05rem;
    }
    .info-banner p {
      margin: 0;
      color: #475569;
      font-size: 0.9rem;
      line-height: 1.5;
    }
    .alert {
      padding: 0.85rem 1.25rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
      font-weight: 500;
    }
    .alert-success {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
    }
    .alert-danger {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #b91c1c;
    }
    .table-responsive {
      width: 100%;
      overflow-x: auto;
    }
    .medicos-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.9rem;
    }
    .medicos-table th {
      background: #dc2626;
      color: white;
      padding: 0.85rem 1.25rem;
      font-weight: 600;
      border-bottom: 1px solid #b91c1c;
    }
    .medicos-table td {
      padding: 0.95rem 1.25rem;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
      vertical-align: middle;
    }
    .medicos-table tr:hover {
      background: #f8fafc;
    }
    .medico-name {
      font-weight: 600;
      color: #0f172a;
    }
    .badge-esp {
      background: #f1f5f9;
      color: #475569;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
    }
    .monto-vigente {
      font-weight: 700;
      color: #059669;
      font-size: 1rem;
    }
    .input-monto {
      display: inline-flex;
      align-items: center;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      overflow: hidden;
      background: white;
    }
    .prefix {
      padding: 0.4rem 0.6rem;
      background: #f8fafc;
      color: #64748b;
      font-weight: 600;
      border-right: 1px solid #cbd5e1;
    }
    .form-control {
      border: none;
      padding: 0.4rem 0.6rem;
      font-size: 0.9rem;
      outline: none;
      width: 110px;
    }
    .btn {
      padding: 0.45rem 1rem;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    }
    .btn-primary {
      background: #dc2626;
      color: white;
    }
    .btn-primary:hover:not(:disabled) {
      background: #b91c1c;
    }
    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .text-center {
      text-align: center;
    }
    .empty-state {
      text-align: center;
      color: #94a3b8;
      padding: 2rem !important;
    }
  `]
})
export class AdminMedicosComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly medicos = signal<MedicoItem[]>([]);
  valoresEditados: { [key: number]: number } = {};
  cargando = true;
  cargandoId: number | null = null;
  readonly mensajeFeedback = signal<string | null>(null);
  readonly mensajeError = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarMedicos();
  }

  cargarMedicos(): void {
    this.cargando = true;
    this.http.get<MedicoItem[]>('/api/medicos').subscribe({
      next: (data) => {
        this.medicos.set(data || []);
        for (const m of data) {
          this.valoresEditados[m.id] = m.valorConsulta;
        }
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.cargando = false;
        this.mensajeError.set(err.error?.message || 'Error al cargar médicos');
        this.cdr.markForCheck();
      },
    });
  }

  guardarValor(medicoId: number): void {
    const nuevoValor = this.valoresEditados[medicoId];
    if (!nuevoValor || nuevoValor < 1000) {
      alert('El arancel debe ser un monto igual o mayor a $1.000');
      return;
    }

    this.cargandoId = medicoId;
    this.mensajeFeedback.set(null);
    this.mensajeError.set(null);

    this.http.patch<MedicoItem>(`/api/medicos/${medicoId}/valor-consulta`, {
      valorConsulta: nuevoValor,
    }).subscribe({
      next: (actualizado) => {
        this.cargandoId = null;
        this.medicos.update((lista) =>
          lista.map((m) =>
            m.id === medicoId
              ? { ...m, valorConsulta: Number(actualizado.valorConsulta || nuevoValor) }
              : m
          )
        );
        this.mensajeFeedback.set(
          `✓ Arancel de ${actualizado.nombreCompleto || 'médico #' + medicoId} actualizado a $ ${nuevoValor.toLocaleString('es-AR')}.`
        );
        this.cdr.markForCheck();
        setTimeout(() => this.mensajeFeedback.set(null), 4000);
      },
      error: (err) => {
        this.cargandoId = null;
        this.mensajeError.set(err.error?.message || 'No se pudo actualizar el arancel');
        this.cdr.markForCheck();
      },
    });
  }
}
