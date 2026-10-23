
import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';

import { Usuario } from '../database/entities/usuario.entity.js';
import { Medico } from '../database/entities/medico.entity.js';
import {
  Turno,
  EstadoReserva,
} from '../database/entities/turno.entity.js';

import { RolUsuario } from '../auth/enums/rol.enum.js';
import { EstadoUsuario } from '../auth/enums/estado-usuario.enum.js';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface.js';

import { CrearReservaDto } from './dto/crear-reserva.dto.js';
import { ConsultarReservasDto } from './dto/consultar-reservas.dto.js';
import { ReservaRespuestaDto } from './dto/reserva-respuesta.dto.js';
import { validarPlazoCancelacion } from './validar-cancelacion.js';

@Injectable()
export class ReservasService {
  constructor(
    @InjectRepository(Turno)
    private readonly turnosRepository: Repository<Turno>,

    @InjectRepository(Medico)
    private readonly medicosRepository: Repository<Medico>,

    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
  ) {}

  
  private validarFechaHora(fechaHora: string): Date {
    // Verificar que la fecha tenga el formato correcto.
    const formato = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;

    if (!formato.test(fechaHora)) {
      throw new BadRequestException(
        'La fecha debe tener el formato AAAA-MM-DDTHH:mm:ss',
      );
    }

    const [fecha, hora] = fechaHora.split('T');
    const [anio, mes, dia] = fecha.split('-').map(Number);
    const [horas, minutos, segundos] = hora.split(':').map(Number);

    // Comprobar que la fecha exista realmente.
    const fechaComprobacion = new Date(
      Date.UTC(anio, mes - 1, dia, horas, minutos, segundos),
    );

    if (
      fechaComprobacion.getUTCFullYear() !== anio ||
      fechaComprobacion.getUTCMonth() !== mes - 1 ||
      fechaComprobacion.getUTCDate() !== dia ||
      fechaComprobacion.getUTCHours() !== horas ||
      fechaComprobacion.getUTCMinutes() !== minutos ||
      fechaComprobacion.getUTCSeconds() !== segundos
    ) {
      throw new BadRequestException('La fecha ingresada no es válida');
    }

    // Los turnos comienzan en punto, entre las 8 y las 15.
    if (horas < 8 || horas > 15 || minutos !== 0 || segundos !== 0) {
      throw new BadRequestException(
        'Los turnos deben comenzar en punto, entre las 8:00 y las 15:00',
      );
    }

    // Interpretar el horario como hora argentina (UTC-3).
    const fechaTurno = new Date(`${fechaHora}-03:00`);
    const ahora = new Date();

    if (fechaTurno.getTime() <= ahora.getTime()) {
      throw new BadRequestException(
        'No se pueden reservar turnos en el pasado',
      );
    }

    
    // Obtener la fecha actual en Argentina.
    const hoyArgentina = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Argentina/Buenos_Aires',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(ahora);

    const obtener = (tipo: string): string =>
      hoyArgentina.find((parte) => parte.type === tipo)?.value ?? '';

    const hoy = new Date(
      Date.UTC(
        Number(obtener('year')),
        Number(obtener('month')) - 1,
        Number(obtener('day')),
      ),
    );

    // Comparar días calendario, sin considerar la hora.
    const diaReserva = new Date(Date.UTC(anio, mes - 1, dia));

    const diferenciaDias =
      (diaReserva.getTime() - hoy.getTime()) / 86400000;

    if (diferenciaDias > 30) {
      throw new BadRequestException(
        'No se pueden reservar turnos con más de 30 días de anticipación',
      );
    }

    return fechaTurno;
    
  }

  
  async consultarDisponibilidad(
    idMedico: number,
    fecha: string,
  ): Promise<string[]> {
    // Comprobar que la fecha tenga el formato correcto.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      throw new BadRequestException(
        'La fecha debe tener el formato AAAA-MM-DD',
      );
    }

    const [anio, mes, dia] = fecha.split('-').map(Number);
    const fechaValidada = new Date(Date.UTC(anio, mes - 1, dia));

    if (
      fechaValidada.getUTCFullYear() !== anio ||
      fechaValidada.getUTCMonth() !== mes - 1 ||
      fechaValidada.getUTCDate() !== dia
    ) {
      throw new BadRequestException('La fecha ingresada no es válida');
    }

    // Verificar que el médico exista.
    const medico = await this.medicosRepository.findOne({
      where: { id: idMedico },
    });

    if (!medico) {
      throw new NotFoundException('El médico no existe');
    }

    // Obtener la fecha y hora actuales en Argentina.
    const partes = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Argentina/Buenos_Aires',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date());

    const obtener = (tipo: string): string =>
      partes.find((parte) => parte.type === tipo)?.value ?? '';

    const hoy = `${obtener('year')}-${obtener('month')}-${obtener('day')}`;
    const horaActual = Number(obtener('hour'));

    // Comprobar el límite de 30 días.
    const fechaHoy = new Date(`${hoy}T00:00:00Z`);
    const diferenciaDias =
      (fechaValidada.getTime() - fechaHoy.getTime()) / 86400000;

    if (diferenciaDias < 0 || diferenciaDias > 30) {
      throw new BadRequestException(
        'La fecha debe estar dentro de los próximos 30 días',
      );
    }

    // Buscar los horarios ocupados del médico en esa fecha.
    const turnosOcupados = await this.turnosRepository
      .createQueryBuilder('turno')
      .select("TO_CHAR(turno.fechaHora, 'HH24:MI')", 'hora')
      .where('turno.medicoId = :idMedico', { idMedico })
      .andWhere('turno.fechaHora >= :inicio', {
        inicio: `${fecha} 00:00:00`,
      })
      .andWhere('turno.fechaHora < :fin', {
        fin: `${fecha} 23:59:59.999999`,
      })
      .andWhere('turno.estado != :cancelado', {
        cancelado: EstadoReserva.CANCELADO,
      })
      .getRawMany<{ hora: string }>();

    const ocupados = new Set(turnosOcupados.map((turno) => turno.hora));

    // Generar los horarios libres entre las 8 y las 15.
    const disponibles: string[] = [];

    for (let hora = 8; hora <= 15; hora++) {
      const horario = `${hora.toString().padStart(2, '0')}:00`;

      // Si es hoy, no ofrecer horarios que ya comenzaron.
      if (fecha === hoy && hora <= horaActual) {
        continue;
      }

      if (!ocupados.has(horario)) {
        disponibles.push(horario);
      }
    }

    return disponibles;
  }
  
  // Verificar que el médico exista
  private async verificarMedico(idMedico: number): Promise<Medico> {
    const medico = await this.medicosRepository.findOne({
      where: { id: idMedico },
      relations: { usuario: true },
    });

    if (!medico) {
      throw new NotFoundException('El médico seleccionado no existe');
    }

    return medico;
  }
  
  // Verificar que el paciente exista
  private async verificarPaciente(
    dto: CrearReservaDto,
    usuario: JwtPayload,
  ): Promise<Usuario> {
    let idPaciente: number;

    if (usuario.rol === RolUsuario.PACIENTE) {
      // El paciente solamente puede reservar para sí mismo.
      if (
        dto.pacienteId !== undefined &&
        dto.pacienteId !== usuario.sub
      ) {
        throw new ForbiddenException(
          'No podés reservar un turno para otro paciente',
        );
      }

      idPaciente = usuario.sub;
    } else if (usuario.rol === RolUsuario.ADMINISTRADOR) {
      // El administrador debe indicar para qué paciente reserva.
      if (dto.pacienteId === undefined) {
        throw new BadRequestException(
          'Debés indicar el ID del paciente',
        );
      }

      idPaciente = dto.pacienteId;
    } else {
      throw new ForbiddenException(
        'No tenés permisos para realizar reservas',
      );
    }

    const paciente = await this.usuariosRepository.findOne({
      where: { id: idPaciente },
    });

    if (!paciente) {
      throw new NotFoundException('El paciente no existe');
    }

    if (
      paciente.rol !== RolUsuario.PACIENTE ||
      paciente.estado !== EstadoUsuario.ACTIVO
    ) {
      throw new BadRequestException(
        'El usuario seleccionado no es un paciente activo',
      );
    }

    return paciente;
  }

  
  async crearReserva(
    dto: CrearReservaDto,
    usuario: JwtPayload,
  ): Promise<ReservaRespuestaDto> {
    // 1. Verificar el médico y el paciente.
    const medico = await this.verificarMedico(dto.medicoId);
    const paciente = await this.verificarPaciente(dto, usuario);

    // 2. Validar la fecha y el horario.
    this.validarFechaHora(dto.fechaHora);

    // 3. Comprobar que el horario no esté ocupado.
    const turnosOcupados = await this.turnosRepository
      .createQueryBuilder('turno')
      .where('turno.medicoId = :medicoId', {
        medicoId: medico.id,
      })
      .andWhere(
        'turno.fechaHora = CAST(:fechaLocal AS timestamp)',
        { fechaLocal: dto.fechaHora },
      )
      .andWhere('turno.estado != :cancelado', {
        cancelado: EstadoReserva.CANCELADO,
      })
      .getCount();

    if (turnosOcupados > 0) {
      throw new ConflictException(
        'El médico ya tiene un turno reservado en ese horario',
      );
    }

    // 4. Guardar el valor de la consulta al reservar.
    const valorConsulta = Number(medico.valorConsulta);

    // 5. Crear la reserva en PostgreSQL.
    let idReserva: number;

    try {
      const resultado = await this.turnosRepository
        .createQueryBuilder()
        .insert()
        .into(Turno)
        .values({
          medicoId: medico.id,
          pacienteId: paciente.id,
          fechaHora: () => 'CAST(:fechaLocal AS timestamp)',
          estado: EstadoReserva.ACTIVO,
          valorConsulta,
        })
        .setParameter('fechaLocal', dto.fechaHora)
        .returning('id')
        .execute();

      idReserva = Number(resultado.raw[0].id);
    } catch (error: unknown) {
      // El índice único también protege contra reservas simultáneas.
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === '23505'
      ) {
        throw new ConflictException(
          'El horario acaba de ser reservado por otro paciente',
        );
      }

      throw error;
    }

    // 6. Recuperar la reserva guardada.
    const reserva = await this.turnosRepository.findOneByOrFail({
      id: idReserva,
    });

    // 7. Devolver solamente los datos del DTO de respuesta.
    return {
      id: reserva.id,
      medicoId: medico.id,
      medicoNombre: `${medico.usuario.nombres} ${medico.usuario.apellidos}`,
      pacienteId: paciente.id,
      pacienteNombre: `${paciente.nombres} ${paciente.apellidos}`,
      fechaHora: dto.fechaHora,
      estado: reserva.estado,
      valorConsulta: Number(reserva.valorConsulta),
      creadoEn: reserva.creadoEn.toISOString(),
      canceladoEn: null,
    };
  }

  
  async listarReservas(
    filtros: ConsultarReservasDto,
    usuario: JwtPayload,
  ): Promise<ReservaRespuestaDto[]> {
    // Crear la consulta de reservas.
    const consulta = this.turnosRepository
      .createQueryBuilder('turno')
      .innerJoin('turno.medico', 'medico')
      .innerJoin('medico.usuario', 'usuarioMedico')
      .innerJoin('turno.paciente', 'paciente')
      .select('turno.id', 'id')
      .addSelect('turno.medicoId', 'medicoId')
      .addSelect('usuarioMedico.nombres', 'medicoNombres')
      .addSelect('usuarioMedico.apellidos', 'medicoApellidos')
      .addSelect('turno.pacienteId', 'pacienteId')
      .addSelect('paciente.nombres', 'pacienteNombres')
      .addSelect('paciente.apellidos', 'pacienteApellidos')
      .addSelect(
        "TO_CHAR(turno.fechaHora, 'YYYY-MM-DD\"T\"HH24:MI:SS')",
        'fechaHora',
      )
      .addSelect('turno.estado', 'estado')
      .addSelect('turno.valorConsulta', 'valorConsulta')
      .addSelect('turno.creadoEn', 'creadoEn')
      .addSelect('turno.canceladoEn', 'canceladoEn');

    // El paciente solo puede ver sus propias reservas.
    if (usuario.rol === RolUsuario.PACIENTE) {
      consulta.where('turno.pacienteId = :pacienteId', {
        pacienteId: usuario.sub,
      });
    } else if (usuario.rol !== RolUsuario.ADMINISTRADOR) {
      throw new ForbiddenException(
        'No tenés permisos para consultar reservas',
      );
    }

    // Aplicar los filtros opcionales.
    if (filtros.fecha) {
      consulta.andWhere(
        'CAST(turno.fechaHora AS date) = CAST(:fecha AS date)',
        { fecha: filtros.fecha },
      );
    }

    if (filtros.medicoId !== undefined) {
      consulta.andWhere('turno.medicoId = :medicoId', {
        medicoId: filtros.medicoId,
      });
    }

    if (filtros.estado) {
      consulta.andWhere('turno.estado = :estado', {
        estado: filtros.estado,
      });
    }

    // Ordenar los turnos por fecha y hora.
    consulta.orderBy('turno.fechaHora', 'ASC');

    const reservas = await consulta.getRawMany<{
      id: number;
      medicoId: number;
      medicoNombres: string;
      medicoApellidos: string;
      pacienteId: number;
      pacienteNombres: string;
      pacienteApellidos: string;
      fechaHora: string;
      estado: EstadoReserva;
      valorConsulta: string;
      creadoEn: Date;
      canceladoEn: Date | null;
    }>();

    // Convertir los resultados al DTO de respuesta.
    return reservas.map((reserva) => ({
      id: reserva.id,
      medicoId: reserva.medicoId,
      medicoNombre: `${reserva.medicoNombres} ${reserva.medicoApellidos}`,
      pacienteId: reserva.pacienteId,
      pacienteNombre: `${reserva.pacienteNombres} ${reserva.pacienteApellidos}`,
      fechaHora: reserva.fechaHora,
      estado: reserva.estado,
      valorConsulta: Number(reserva.valorConsulta),
      creadoEn: new Date(reserva.creadoEn).toISOString(),
      canceladoEn: reserva.canceladoEn
        ? new Date(reserva.canceladoEn).toISOString()
        : null,
    }));
  }

  
  async cancelarReserva(
    id: number,
    usuario: JwtPayload,
  ): Promise<ReservaRespuestaDto> {
    // 1. Buscar la reserva con los datos del médico y paciente.
    const reserva = await this.turnosRepository.findOne({
      where: { id },
      relations: {
        medico: { usuario: true },
        paciente: true,
      },
    });

    if (!reserva) {
      throw new NotFoundException('La reserva no existe');
    }

    // 2. Comprobar los permisos según el rol.
    if (usuario.rol === RolUsuario.PACIENTE) {
      if (reserva.pacienteId !== usuario.sub) {
        throw new ForbiddenException(
          'No podés cancelar una reserva de otro paciente',
        );
      }
    } else if (usuario.rol !== RolUsuario.ADMINISTRADOR) {
      throw new ForbiddenException(
        'No tenés permisos para cancelar reservas',
      );
    }

    // 3. Comprobar que la reserva siga activa.
    if (reserva.estado !== EstadoReserva.ACTIVO) {
      throw new ConflictException(
        'Solo se pueden cancelar reservas activas',
      );
    }

    // 4. Obtener la fecha local del turno desde PostgreSQL.
    const resultadoFecha = await this.turnosRepository
      .createQueryBuilder('turno')
      .select(
        `TO_CHAR(turno.fechaHora, 'YYYY-MM-DD"T"HH24:MI:SS')`,
        'fechaHora',
      )
      .where('turno.id = :id', { id })
      .getRawOne<{ fechaHora: string }>();

    if (!resultadoFecha) {
      throw new NotFoundException('La reserva no existe');
    }

    const fechaHoraLocal = resultadoFecha.fechaHora;

    // Validar el plazo según el rol del usuario.
    validarPlazoCancelacion(fechaHoraLocal, usuario.rol);


    // 7. Actualizar la reserva solo si sigue activa
    // y todavía está dentro del plazo de cancelación.
    const consultaActualizacion = this.turnosRepository
      .createQueryBuilder()
      .update(Turno)
      .set({
        estado: EstadoReserva.CANCELADO,
        canceladoEn: () => 'statement_timestamp()',
      })
      .where('id = :id', { id })
      .andWhere('estado = :activo', {
        activo: EstadoReserva.ACTIVO,
      });

    if (usuario.rol === RolUsuario.PACIENTE) {
      // El paciente solo cancela antes del día de la consulta.
      consultaActualizacion.andWhere(
        `fecha_hora::date >
         (statement_timestamp() AT TIME ZONE
         'America/Argentina/Buenos_Aires')::date`,
      );
    } else {
      // El administrador puede cancelar hasta el inicio.
      consultaActualizacion.andWhere(
        `fecha_hora >
         (statement_timestamp() AT TIME ZONE
         'America/Argentina/Buenos_Aires')`,
      );
    }

    const actualizacion = await consultaActualizacion.execute();


    if (actualizacion.affected !== 1) {
      throw new ConflictException(
        'La reserva ya fue modificada',
      );
    }

    // 8. Devolver el DTO con la reserva cancelada.
    return {
      id: reserva.id,
      medicoId: reserva.medicoId,
      medicoNombre: `${reserva.medico.usuario.nombres} ${reserva.medico.usuario.apellidos}`,
      pacienteId: reserva.pacienteId,
      pacienteNombre: `${reserva.paciente.nombres} ${reserva.paciente.apellidos}`,
      fechaHora: fechaHoraLocal,
      estado: EstadoReserva.CANCELADO,
      valorConsulta: Number(reserva.valorConsulta),
      creadoEn: reserva.creadoEn.toISOString(),
      canceladoEn: new Date().toISOString(),
    };
  }

}
