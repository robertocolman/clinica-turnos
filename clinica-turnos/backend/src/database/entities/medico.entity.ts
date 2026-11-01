import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  type Relation,
} from 'typeorm';
import { Usuario } from './usuario.entity.js';
import { Turno } from './turno.entity.js';

@Entity('medicos')
export class Medico {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'id_usuario' })
  usuarioId: number;

  @OneToOne(() => Usuario, (usuario: Usuario) => usuario.medico, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Relation<Usuario>;

  @Column({ type: 'int', unique: true, default: 10000 })
  matricula: number;

  @Column({ type: 'text', default: 'Clínica Médica' })
  especialidad: string;

  @Column({
    name: 'valor_consulta',
    type: 'int',
    default: 15000,
  })
  valorConsulta: number;

  @OneToMany(() => Turno, (turno: Turno) => turno.medico)
  turnos: Relation<Turno[]>;
}
