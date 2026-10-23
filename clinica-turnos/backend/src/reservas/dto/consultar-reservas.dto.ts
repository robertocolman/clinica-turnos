
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  Matches,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoReserva } from '../../database/entities/turno.entity.js';

export class ConsultarReservasDto {
  @ApiPropertyOptional({
    description: 'Fecha de las reservas (AAAA-MM-DD)',
    example: '2026-11-05',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha debe tener el formato AAAA-MM-DD',
  })
  @IsDateString({}, {
    message: 'La fecha debe ser válida',
  })
  fecha?: string;

  @ApiPropertyOptional({
    description: 'ID del médico',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID del médico debe ser un número entero' })
  @Min(1, { message: 'El ID del médico debe ser mayor a cero' })
  medicoId?: number;

  @ApiPropertyOptional({
    description: 'Estado de la reserva',
    enum: EstadoReserva,
  })
  @IsOptional()
  @IsEnum(EstadoReserva, {
    message: 'El estado de la reserva no es válido',
  })
  estado?: EstadoReserva;
}
