import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, Matches, Min } from 'class-validator';

export class ConsultarDisponibilidadDto {
  @ApiProperty({
    description: 'ID identificador del médico a consultar',
    example: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'El ID del médico debe ser un número entero' })
  @Min(1, { message: 'El ID del médico debe ser mayor a 0' })
  idMedico: number;

  @ApiProperty({
    description: 'Fecha a consultar en formato AAAA-MM-DD',
    example: '2026-11-10',
  })
  @IsNotEmpty({ message: 'La fecha es obligatoria' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha debe tener el formato AAAA-MM-DD',
  })
  fecha: string;
}

