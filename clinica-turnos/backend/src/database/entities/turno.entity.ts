import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  type Relation,
} from 'typeorm';
import { Usuario } from './usuario.entity.js';
import { Medico } from './medico.entity.js';

export enum EstadoReserva {
  ACTIVO = 'ACTIVO',
  ATENDIDO = 'ATENDIDO',
  AUSENTE = 'AUSENTE',
  CANCELADO = 'CANCELADO',
}

@Entity('reservas')
export class Turno {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'id_paciente' })
  pacienteId: number;

  @ManyToOne(() => Usuario, (usuario: Usuario) => usuario.turnosComoPaciente)
  @JoinColumn({ name: 'id_paciente' })
  paciente: Relation<Usuario>;

  @Column({ name: 'id_medico' })
  medicoId: number;

  @ManyToOne(() => Medico, (medico: Medico) => medico.turnos)
  @JoinColumn({ name: 'id_medico' })
  medico: Relation<Medico>;

  @Column({ name: 'fecha_hora', type: 'timestamp without time zone' })
  fechaHora: Date;

  @Column({
    type: 'enum',
    enum: EstadoReserva,
    enumName: 'estados_reservas',
    default: EstadoReserva.ACTIVO,
  })
  estado: EstadoReserva;

  /**
   * REGLA DE NEGOCIO CRITICA:
   * El valor queda congelado al momento exacto de la reserva (tipo entero en DER).
   */
  @Column({
    name: 'valor_consulta',
    type: 'int',
  })
  valorConsulta: number;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @Column({ name: 'cancelado_en', type: 'timestamp', nullable: true })
  canceladoEn?: Date;
}
