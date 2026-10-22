import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, Min } from 'class-validator';

export class ActualizarValorConsultaDto {
  @ApiProperty({
    description: 'Nuevo valor o tarifa de la consulta médica (en pesos argentinos)',
    example: 18000,
    minimum: 1000,
  })
  @IsNumber({}, { message: 'El valor de consulta debe ser un número válido' })
  @IsPositive({ message: 'El valor de consulta debe ser un monto positivo' })
  @Min(1000, { message: 'El valor mínimo permitido de consulta es $1.000' })
  valorConsulta: number;
}
