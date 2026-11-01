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

  @Column({ type: 'text', unique: true })
  documento: string;

  @Column({ type: 'text' })
  clave: string;

  @Column({ type: 'text' })
  nombres: string;

  @Column({ type: 'text' })
  apellidos: string;

  @Column({ type: 'text', unique: true })
  email: string;

  @Column({
    type: 'enum',
    enum: RolUsuario,
    enumName: 'roles_usuarios',
    default: RolUsuario.PACIENTE,
  })
  rol: RolUsuario;

  @Column({
    type: 'enum',
    enum: EstadoUsuario,
    enumName: 'estados_usuarios',
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
