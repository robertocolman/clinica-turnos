import { ApiProperty } from '@nestjs/swagger';

export class MedicoResponseDto {
  @ApiProperty({ example: 1, description: 'ID del médico' })
  id: number;

  @ApiProperty({ example: 2, description: 'ID del usuario asociado' })
  usuarioId: number;

  @ApiProperty({ example: 45892, description: 'Número de matrícula profesional' })
  matricula: number;

  @ApiProperty({ example: 'Dr. Carlos Pérez', description: 'Nombre completo del profesional' })
  nombreCompleto: string;

  @ApiProperty({ example: 'Clínica Médica General', description: 'Especialidad médica' })
  especialidad: string;

  @ApiProperty({ example: 15000, description: 'Arancel vigente de la consulta' })
  valorConsulta: number;
}

export class MedicoPerfilResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 2 })
  usuarioId: number;

  @ApiProperty({ example: 45892 })
  matricula: number;

  @ApiProperty({ example: 'Clínica Médica General' })
  especialidad: string;

  @ApiProperty({ example: 15000 })
  valorConsulta: number;

  @ApiProperty({ example: 'Carlos' })
  nombres: string;

  @ApiProperty({ example: 'Pérez' })
  apellidos: string;

  @ApiProperty({ example: 'dr.perez@clinica.uner.edu.ar' })
  email: string;
}

export class TurnoAgendaResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 3 })
  pacienteId: number;

  @ApiProperty({ example: 'Lucía Martínez' })
  pacienteNombre: string;

  @ApiProperty({ example: '33333333' })
  pacienteDocumento: string;

  @ApiProperty({ example: 1 })
  medicoId: number;

  @ApiProperty({ example: '2026-11-10T09:00:00' })
  fechaHora: string;

  @ApiProperty({ example: 'ACTIVO' })
  estado: string;

  @ApiProperty({ example: 15000 })
  valorConsulta: number;
}
