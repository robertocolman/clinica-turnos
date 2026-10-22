import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicosController } from './medicos.controller.js';
import { MedicosService } from './medicos.service.js';
import { Medico } from '../database/entities/medico.entity.js';
import { Turno } from '../database/entities/turno.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Medico, Turno])],
  controllers: [MedicosController],
  providers: [MedicosService],
  exports: [MedicosService],
})
export class MedicosModule {}
