import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { EstadoReserva, Reserva } from '../models/reserva.model';

export interface MedicoOpcion { id: number; nombre: string; valor: number; }
export interface PacienteOpcion { id: number; nombre: string; }
interface MedicoApi { id: number; nombreCompleto: string; valorConsulta: number; }
interface PacienteApi { id: number; nombres: string; apellidos: string; }
interface ReservaApi {
  id: number; medicoId: number; pacienteId: number; fechaHora: string;
  estado: EstadoReserva; valorConsulta: number;
  medicoNombre: string; pacienteNombre: string;
}

@Injectable({ providedIn: 'root' })
export class ReservasService {
  private readonly http = inject(HttpClient);
  private readonly _reservas = signal<Reserva[]>([]);
  readonly reservas = this._reservas.asReadonly();

  private adaptar(r: ReservaApi): Reserva {
    return {
      id: r.id, id_medico: r.medicoId, id_paciente: r.pacienteId,
      fecha_hora: r.fechaHora, estado: r.estado, valor_consulta: r.valorConsulta,
      medico_nombre: r.medicoNombre, paciente_nombre: r.pacienteNombre
    };
  }

  cargarReservas(): void {
    this.http.get<ReservaApi[]>('/api/reservas').pipe(
      map(lista => lista.map(r => this.adaptar(r)))
    ).subscribe({
      next: lista => this._reservas.set(lista),
      error: err => console.error('Error al cargar reservas:', err)
    });
  }

  obtenerMedicos(): Observable<MedicoOpcion[]> {
    return this.http.get<MedicoApi[]>('/api/medicos').pipe(
      map(lista => lista.map(m => ({ id: m.id, nombre: m.nombreCompleto, valor: m.valorConsulta })))
    );
  }

  obtenerPacientes(): Observable<PacienteOpcion[]> {
    return this.http.get<PacienteApi[]>('/api/pacientes').pipe(
      map(lista => lista.map(p => ({ id: p.id, nombre: `${p.nombres} ${p.apellidos}` })))
    );
  }

  obtenerDisponibilidad(idMedico: number, fecha: string): Observable<string[]> {
    const params = new HttpParams().set('idMedico', idMedico).set('fecha', fecha);
    return this.http.get<string[]>('/api/reservas/disponibilidad', { params });
  }

  crearReserva(idMedico: number, fechaHora: string, idPaciente?: number): Observable<Reserva> {
    const body = { medicoId: idMedico, fechaHora, ...(idPaciente !== undefined ? { pacienteId: idPaciente } : {}) };
    return this.http.post<ReservaApi>('/api/reservas', body).pipe(
      map(r => this.adaptar(r)),
      tap(() => this.cargarReservas())
    );
  }

  cancelarReserva(id: number): Observable<Reserva> {
    return this.http.patch<ReservaApi>(`/api/reservas/${id}/cancelar`, {}).pipe(
      map(r => this.adaptar(r)),
      tap(() => this.cargarReservas())
    );
  }

  mensajeError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const mensaje = error.error?.message;
      if (Array.isArray(mensaje)) return mensaje.join('. ');
      if (typeof mensaje === 'string') return mensaje;
      if (error.status === 0) return 'No se pudo conectar con el backend.';
    }
    return 'Ocurrió un error. Intentá nuevamente.';
  }
}
