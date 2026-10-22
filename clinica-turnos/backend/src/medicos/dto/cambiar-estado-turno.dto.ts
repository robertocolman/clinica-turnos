import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { EstadoReserva } from '../../database/entities/turno.entity.js';

export class CambiarEstadoTurnoDto {
  @ApiProperty({
    description: 'Nuevo estado del turno (ATENDIDO o AUSENTE)',
    enum: [EstadoReserva.ATENDIDO, EstadoReserva.AUSENTE],
    example: EstadoReserva.ATENDIDO,
  })
  @IsNotEmpty({ message: 'El estado es requerido' })
  @IsEnum(EstadoReserva, {
    message: 'El estado debe ser ATENDIDO o AUSENTE',
  })
  nuevoEstado: EstadoReserva;
}
