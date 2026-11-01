import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsIn } from 'class-validator';
import { EstadoReserva } from '../../database/entities/turno.entity.js';

export class CambiarEstadoTurnoDto {
  @ApiProperty({
    description: 'Nuevo estado del turno (ATENDIDO o AUSENTE)',
    enum: [EstadoReserva.ATENDIDO, EstadoReserva.AUSENTE],
    example: EstadoReserva.ATENDIDO,
  })
  @IsNotEmpty({ message: 'El estado es requerido' })
  @IsIn([EstadoReserva.ATENDIDO, EstadoReserva.AUSENTE], {
    message: 'El estado debe ser ATENDIDO o AUSENTE',
  })
  nuevoEstado: EstadoReserva;
}
