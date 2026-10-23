
import { ForbiddenException } from '@nestjs/common';
import { RolUsuario } from '../auth/enums/rol.enum.js';

/**
 * Comprueba si un usuario puede cancelar un turno
 * según su rol y la fecha de la consulta.
 */
export function validarPlazoCancelacion(
  fechaHoraLocal: string,
  rol: RolUsuario,
  ahora: Date = new Date(),
): void {
  // Obtener la fecha y hora actuales de Argentina.
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(ahora);

  const obtener = (tipo: string): string =>
    partes.find((parte) => parte.type === tipo)?.value ?? '';

  const fechaHoy =
    `${obtener('year')}-${obtener('month')}-${obtener('day')}`;

  const horaActual =
    `${obtener('hour')}:${obtener('minute')}:${obtener('second')}`;

  const fechaHoraActual = `${fechaHoy}T${horaActual}`;
  const fechaTurno = fechaHoraLocal.slice(0, 10);

  // Un paciente solo puede cancelar antes del día del turno.
  if (rol === RolUsuario.PACIENTE) {
    if (fechaTurno <= fechaHoy) {
      throw new ForbiddenException(
        'Los pacientes solo pueden cancelar hasta el día anterior a la consulta',
      );
    }
  }

  // Un administrador puede cancelar hasta el inicio del turno.
  if (rol === RolUsuario.ADMINISTRADOR) {
    if (fechaHoraLocal <= fechaHoraActual) {
      throw new ForbiddenException(
        'No se puede cancelar un turno que ya comenzó',
      );
    }
  }
}
