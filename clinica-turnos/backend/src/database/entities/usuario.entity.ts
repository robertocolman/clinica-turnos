import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  type Relation,
} from 'typeorm';
import { RolUsuario } from '../../auth/enums/rol.enum.js';
import { EstadoUsuario } from '../../auth/enums/estado-usuario.enum.js';
import { Medico } from './medico.entity.js';
import { Turno } from './turno.entity.js';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 20 })
  documento: string;

  @Column({ length: 255 })
  clave: string;

  @Column({ length: 100 })
  nombres: string;

  @Column({ length: 100 })
  apellidos: string;

  @Column({ unique: true, length: 150 })
  email: string;

  @Column({
    type: 'enum',
    enum: RolUsuario,
    default: RolUsuario.PACIENTE,
  })
  rol: RolUsuario;

  @Column({
    type: 'enum',
    enum: EstadoUsuario,
    default: EstadoUsuario.ACTIVO,
  })
  estado: EstadoUsuario;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;

  @OneToOne(() => Medico, (medico: Medico) => medico.usuario)
  medico?: Relation<Medico>;

  @OneToMany(() => Turno, (turno: Turno) => turno.paciente)
  turnosComoPaciente: Relation<Turno[]>;
}
