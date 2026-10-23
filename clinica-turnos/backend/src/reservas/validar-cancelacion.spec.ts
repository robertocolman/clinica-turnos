
import { describe, it, expect } from 'vitest';
import { RolUsuario } from '../auth/enums/rol.enum.js';
import { validarPlazoCancelacion } from './validar-cancelacion.js';

describe('Validación de cancelaciones', () => {
  const turno = '2026-10-26T10:00:00';

  it('permite al paciente cancelar el día anterior', () => {
    const ahora = new Date('2026-10-25T15:00:00-03:00');

    expect(() =>
      validarPlazoCancelacion(
        turno,
        RolUsuario.PACIENTE,
        ahora,
      ),
    ).not.toThrow();
  });

  it('rechaza al paciente el mismo día', () => {
    const ahora = new Date('2026-10-26T08:00:00-03:00');

    expect(() =>
      validarPlazoCancelacion(
        turno,
        RolUsuario.PACIENTE,
        ahora,
      ),
    ).toThrow();
  });

  it('permite al administrador cancelar antes del turno', () => {
    const ahora = new Date('2026-10-26T09:30:00-03:00');

    expect(() =>
      validarPlazoCancelacion(
        turno,
        RolUsuario.ADMINISTRADOR,
        ahora,
      ),
    ).not.toThrow();
  });

  it('rechaza al administrador cuando comienza el turno', () => {
    const ahora = new Date('2026-10-26T10:00:00-03:00');

    expect(() =>
      validarPlazoCancelacion(
        turno,
        RolUsuario.ADMINISTRADOR,
        ahora,
      ),
    ).toThrow();
  });

  it('rechaza al administrador después del turno', () => {
    const ahora = new Date('2026-10-26T11:00:00-03:00');

    expect(() =>
      validarPlazoCancelacion(
        turno,
        RolUsuario.ADMINISTRADOR,
        ahora,
      ),
    ).toThrow();
  });
});
