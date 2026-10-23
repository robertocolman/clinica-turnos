
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoReserva } from '../../database/entities/turno.entity.js';

export class ReservaRespuestaDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 2 })
  medicoId: number;

  @ApiProperty({ example: 'Juan Pérez' })
  medicoNombre: string;

  @ApiProperty({ example: 3 })
  pacienteId: number;

  @ApiProperty({ example: 'María García' })
  pacienteNombre: string;

  @ApiProperty({
    description: 'Fecha y hora de la consulta',
    example: '2026-11-05T09:00:00',
  })
  fechaHora: string;

  @ApiProperty({
    enum: EstadoReserva,
    example: EstadoReserva.ACTIVO,
  })
  estado: EstadoReserva;

  @ApiProperty({
    description: 'Valor de la consulta al momento de reservar',
    example: 15000,
  })
  valorConsulta: number;

  @ApiProperty({
    description: 'Fecha de creación de la reserva',
    example: '2026-10-23T13:30:00.000Z',
  })
  creadoEn: string;

  @ApiPropertyOptional({
    description: 'Fecha de cancelación, si corresponde',
    nullable: true,
    example: null,
  })
  canceladoEn: string | null;
}
