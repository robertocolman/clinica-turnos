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

@Entity('turnos')
export class Turno {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'paciente_id' })
  pacienteId: number;

  @ManyToOne(() => Usuario, (usuario: Usuario) => usuario.turnosComoPaciente)
  @JoinColumn({ name: 'paciente_id' })
  paciente: Relation<Usuario>;

  @Column({ name: 'medico_id' })
  medicoId: number;

  @ManyToOne(() => Medico, (medico: Medico) => medico.turnos)
  @JoinColumn({ name: 'medico_id' })
  medico: Relation<Medico>;

  @Column({ name: 'fecha_hora', type: 'timestamp without time zone' })
  fechaHora: Date;

  @Column({
    type: 'enum',
    enum: EstadoReserva,
    default: EstadoReserva.ACTIVO,
  })
  estado: EstadoReserva;

  /**
   * REGLA DE NEGOCIO CRITICA:
   * El valor queda congelado al momento exacto de la reserva.
   */
  @Column({
    name: 'valor_consulta',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  valorConsulta: number;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @Column({ name: 'cancelado_en', type: 'timestamp', nullable: true })
  canceladoEn?: Date;
}
