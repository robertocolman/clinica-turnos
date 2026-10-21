import { Injectable, signal } from '@angular/core';
import { EstadoReserva, Reserva } from '../models/reserva.model';

@Injectable({
  providedIn: 'root'
})
export class ReservasService {

  private readonly _reservas = signal<Reserva[]>([
    {
      id: 1,
      id_medico: 1,
      id_paciente: 2,
      fecha_hora: '2026-10-25T09:00:00',
      estado: EstadoReserva.ACTIVO,
      valor_consulta: 15000
    },
    {
      id: 2,
      id_medico: 1,
      id_paciente: 2,
      fecha_hora: '2026-10-28T10:00:00',
      estado: EstadoReserva.CANCELADO,
      valor_consulta: 15000
    }
  ]);

  readonly reservas = this._reservas.asReadonly();
  cancelarReserva(id: number): void {
    const reservasActualizadas = this._reservas().map(reserva =>
      reserva.id === id
        ? { ...reserva, estado: EstadoReserva.CANCELADO }
        : reserva
    );

    this._reservas.set(reservasActualizadas);
    }

  crearReserva(
    idMedico: number,
    idPaciente: number,
    fechaHora: string,
    valorConsulta: number
  ): void {

    const nuevaReserva: Reserva = {
      id: Date.now(),
      id_medico: idMedico,
      id_paciente: idPaciente,
      fecha_hora: fechaHora,
      estado: EstadoReserva.ACTIVO,
      valor_consulta: valorConsulta
    };

    this._reservas.set([
      ...this._reservas(),
      nuevaReserva
    ]);
  }
}