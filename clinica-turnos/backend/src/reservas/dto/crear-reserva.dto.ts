
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsISO8601,
  IsOptional,
  Min,
} from 'class-validator';

export class CrearReservaDto {
  @ApiProperty({
    description: 'ID del médico con quien se reserva el turno',
    example: 1,
  })
  @IsInt({ message: 'El ID del médico debe ser un número entero' })
  @Min(1, { message: 'El ID del médico debe ser mayor a cero' })
  medicoId: number;

  @ApiProperty({
    description: 'Fecha y hora del turno en horario local de la clínica',
    example: '2026-11-05T09:00:00',
  })
  @IsISO8601(
    { strict: true },
    { message: 'La fecha debe tener un formato ISO 8601 válido' },
  )
  fechaHora: string;

  @ApiPropertyOptional({
    description: 'ID del paciente. Solo lo indica el administrador.',
    example: 3,
  })
  @IsOptional()
  @IsInt({ message: 'El ID del paciente debe ser un número entero' })
  @Min(1, { message: 'El ID del paciente debe ser mayor a cero' })
  pacienteId?: number;
}
