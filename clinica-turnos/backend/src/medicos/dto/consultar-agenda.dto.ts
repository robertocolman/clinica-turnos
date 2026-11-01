import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Matches } from 'class-validator';

export class ConsultarAgendaDto {
  @ApiPropertyOptional({
    description: 'Filtrar agenda por fecha en formato YYYY-MM-DD',
    example: '2026-11-10',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha debe tener el formato YYYY-MM-DD',
  })
  fecha?: string;
}
