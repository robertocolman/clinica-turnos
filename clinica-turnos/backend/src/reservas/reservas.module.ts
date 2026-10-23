
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Usuario } from '../database/entities/usuario.entity.js';
import { Medico } from '../database/entities/medico.entity.js';
import { Turno } from '../database/entities/turno.entity.js';

import { ReservasController } from './reservas.controller.js';
import { PacientesController } from './pacientes.controller.js';
import { ReservasService } from './reservas.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Medico, Turno]),
  ],
  controllers: [
    ReservasController,
    PacientesController,
  ],
  providers: [
    ReservasService,
  ],
})
export class ReservasModule {}
