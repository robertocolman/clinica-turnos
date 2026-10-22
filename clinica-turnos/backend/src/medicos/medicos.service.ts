import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medico } from '../database/entities/medico.entity.js';
import { Turno, EstadoReserva } from '../database/entities/turno.entity.js';

export interface MedicoResponse {
  id: number;
  usuarioId: number;
  nombreCompleto: string;
  especialidad: string;
  valorConsulta: number;
}

export interface TurnoAgendaResponse {
  id: number;
  pacienteId: number;
  pacienteNombre: string;
  pacienteDocumento: string;
  medicoId: number;
  fechaHora: string;
  estado: EstadoReserva;
  valorConsulta: number;
}

@Injectable()
export class MedicosService {
  constructor(
    @InjectRepository(Medico)
    private readonly medicoRepository: Repository<Medico>,
    @InjectRepository(Turno)
    private readonly turnoRepository: Repository<Turno>,
  ) {}

  /**
   * Obtiene la lista de médicos clínicos disponibles para la reserva de turnos.
   */
  async obtenerTodos(): Promise<MedicoResponse[]> {
    const medicos = await this.medicoRepository.find({
      relations: { usuario: true },
    });

    return medicos.map((m) => ({
      id: m.id,
      usuarioId: m.usuarioId,
      nombreCompleto: m.usuario
        ? `Dr./Dra. ${m.usuario.nombres} ${m.usuario.apellidos}`
        : `Médico #${m.id}`,
      especialidad: m.especialidad,
      valorConsulta: Number(m.valorConsulta),
    }));
  }

  /**
   * Obtiene la información profesional del médico asociado a un usuario.
   */
  async obtenerPorUsuarioId(usuarioId: number): Promise<Medico> {
    const medico = await this.medicoRepository.findOne({
      where: { usuarioId },
      relations: { usuario: true },
    });

    if (!medico) {
      throw new NotFoundException(
        'No se encontró el perfil profesional del médico para este usuario',
      );
    }

    return medico;
  }

  /**
   * Obtiene la agenda de turnos asignados al médico logueado.
   */
  async obtenerMiAgenda(
    usuarioId: number,
    fechaFiltro?: string,
  ): Promise<TurnoAgendaResponse[]> {
    const medico = await this.obtenerPorUsuarioId(usuarioId);

    const queryBuilder = this.turnoRepository
      .createQueryBuilder('turno')
      .leftJoinAndSelect('turno.paciente', 'paciente')
      .where('turno.medico_id = :medicoId', { medicoId: medico.id });

    if (fechaFiltro) {
      queryBuilder.andWhere("TO_CHAR(turno.fecha_hora, 'YYYY-MM-DD') = :fecha", {
        fecha: fechaFiltro,
      });
    }

    queryBuilder.orderBy('turno.fecha_hora', 'ASC');

    const turnos = await queryBuilder.getMany();

    return turnos.map((t) => ({
      id: t.id,
      pacienteId: t.pacienteId,
      pacienteNombre: t.paciente
        ? `${t.paciente.nombres} ${t.paciente.apellidos}`
        : 'Paciente no especificado',
      pacienteDocumento: t.paciente ? t.paciente.documento : '-',
      medicoId: t.medicoId,
      fechaHora: t.fechaHora instanceof Date ? t.fechaHora.toISOString() : String(t.fechaHora),
      estado: t.estado,
      valorConsulta: Number(t.valorConsulta),
    }));
  }

  /**
   * REGLA DE NEGOCIO CRÍTICA (P4):
   * El médico actualiza su arancel profesional.
   * Los turnos previamente reservados conservan inalterado su valor congelado.
   */
  async actualizarValorConsulta(
    usuarioId: number,
    nuevoValor: number,
  ): Promise<MedicoResponse> {
    const medico = await this.obtenerPorUsuarioId(usuarioId);

    if (nuevoValor <= 0) {
      throw new BadRequestException('El valor de la consulta debe ser positivo');
    }

    medico.valorConsulta = nuevoValor;
    await this.medicoRepository.save(medico);

    return {
      id: medico.id,
      usuarioId: medico.usuarioId,
      nombreCompleto: medico.usuario
        ? `Dr./Dra. ${medico.usuario.nombres} ${medico.usuario.apellidos}`
        : `Médico #${medico.id}`,
      especialidad: medico.especialidad,
      valorConsulta: Number(medico.valorConsulta),
    };
  }

  /**
   * REGLA DE NEGOCIO (ADMINISTRADOR):
   * Permite al administrador actualizar el valor de consulta de cualquier médico.
   */
  async actualizarValorConsultaPorId(
    medicoId: number,
    nuevoValor: number,
  ): Promise<MedicoResponse> {
    const medico = await this.medicoRepository.findOne({
      where: { id: medicoId },
      relations: { usuario: true },
    });

    if (!medico) {
      throw new NotFoundException(`No se encontró el médico con ID ${medicoId}`);
    }

    if (nuevoValor <= 0) {
      throw new BadRequestException('El valor de la consulta debe ser positivo');
    }

    medico.valorConsulta = nuevoValor;
    await this.medicoRepository.save(medico);

    return {
      id: medico.id,
      usuarioId: medico.usuarioId,
      nombreCompleto: medico.usuario
        ? `Dr./Dra. ${medico.usuario.nombres} ${medico.usuario.apellidos}`
        : `Médico #${medico.id}`,
      especialidad: medico.especialidad,
      valorConsulta: Number(medico.valorConsulta),
    };
  }

  /**
   * Registra la atención o inasistencia del paciente en una consulta médica.
   */
  async cambiarEstadoTurno(
    turnoId: number,
    nuevoEstado: EstadoReserva,
    usuarioId: number,
  ): Promise<TurnoAgendaResponse> {
    const medico = await this.obtenerPorUsuarioId(usuarioId);
    const turno = await this.turnoRepository.findOne({
      where: { id: turnoId },
      relations: { paciente: true },
    });

    if (!turno) {
      throw new NotFoundException(`No se encontró el turno con ID ${turnoId}`);
    }

    if (turno.medicoId !== medico.id) {
      throw new ForbiddenException(
        'No tiene permisos para modificar la atención de turnos de otro médico',
      );
    }

    if (turno.estado === EstadoReserva.CANCELADO) {
      throw new BadRequestException('No se puede modificar el estado de un turno cancelado');
    }

    turno.estado = nuevoEstado;
    await this.turnoRepository.save(turno);

    return {
      id: turno.id,
      pacienteId: turno.pacienteId,
      pacienteNombre: turno.paciente
        ? `${turno.paciente.nombres} ${turno.paciente.apellidos}`
        : 'Paciente',
      pacienteDocumento: turno.paciente ? turno.paciente.documento : '-',
      medicoId: turno.medicoId,
      fechaHora: turno.fechaHora instanceof Date ? turno.fechaHora.toISOString() : String(turno.fechaHora),
      estado: turno.estado,
      valorConsulta: Number(turno.valorConsulta),
    };
  }
}
