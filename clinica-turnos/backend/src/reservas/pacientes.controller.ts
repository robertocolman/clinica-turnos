
import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiProperty,
} from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Usuario } from '../database/entities/usuario.entity.js';
import { RolUsuario } from '../auth/enums/rol.enum.js';
import { EstadoUsuario } from '../auth/enums/estado-usuario.enum.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

class PacienteRespuestaDto {
  @ApiProperty({ example: 3 })
  id: number;

  @ApiProperty({ example: 'María' })
  nombres: string;

  @ApiProperty({ example: 'García' })
  apellidos: string;

  @ApiProperty({ example: '40123456' })
  documento: string;
}

@ApiTags('Pacientes')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADMINISTRADOR)
@Controller('pacientes')
export class PacientesController {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar pacientes activos',
  })
  async listarPacientes(): Promise<PacienteRespuestaDto[]> {
    const pacientes = await this.usuariosRepository.find({
      where: {
        rol: RolUsuario.PACIENTE,
        estado: EstadoUsuario.ACTIVO,
      },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        documento: true,
      },
      order: {
        apellidos: 'ASC',
        nombres: 'ASC',
      },
    });

    return pacientes.map((paciente) => ({
      id: paciente.id,
      nombres: paciente.nombres,
      apellidos: paciente.apellidos,
      documento: paciente.documento,
    }));
  }
}
