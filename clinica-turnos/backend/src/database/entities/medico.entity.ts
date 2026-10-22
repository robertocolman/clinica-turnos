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

  @Column({ name: 'usuario_id' })
  usuarioId: number;

  @OneToOne(() => Usuario, (usuario: Usuario) => usuario.medico, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Relation<Usuario>;

  @Column({ length: 100 })
  especialidad: string;

  @Column({
    name: 'valor_consulta',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 15000.0,
  })
  valorConsulta: number;

  @OneToMany(() => Turno, (turno: Turno) => turno.medico)
  turnos: Relation<Turno[]>;
}
