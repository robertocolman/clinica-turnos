import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { MedicosService } from './medicos.service.js';
import { ActualizarValorConsultaDto } from './dto/actualizar-valor-consulta.dto.js';
import { CambiarEstadoTurnoDto } from './dto/cambiar-estado-turno.dto.js';

// Guards y decoradores de autenticación y roles de Nahuel (P2)
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { RolUsuario } from '../auth/enums/rol.enum.js';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface.js';

@ApiTags('Médicos')
@Controller('medicos')
export class MedicosController {
  constructor(private readonly medicosService: MedicosService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar médicos disponibles y valores de consulta',
    description: 'Consumido por el frontend de pacientes para reservar turnos.',
  })
  @ApiResponse({ status: 200, description: 'Listado obtenido con éxito.' })
  obtenerMedicos() {
    return this.medicosService.obtenerTodos();
  }

  @Get('mi-agenda')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.MEDICO)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Consultar la agenda de turnos del médico autenticado',
    description: 'Filtra opcionalmente por fecha en formato YYYY-MM-DD.',
  })
  @ApiQuery({
    name: 'fecha',
    required: false,
    example: '2026-10-25',
    description: 'Filtrar por fecha en formato YYYY-MM-DD',
  })
  @ApiResponse({ status: 200, description: 'Agenda de turnos obtenida exitosamente.' })
  obtenerMiAgenda(
    @CurrentUser() usuario: JwtPayload,
    @Query('fecha') fecha?: string,
  ) {
    return this.medicosService.obtenerMiAgenda(usuario.sub, fecha);
  }

  @Get('perfil')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.MEDICO)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener datos y valor de consulta del médico logueado' })
  obtenerPerfil(@CurrentUser() usuario: JwtPayload) {
    return this.medicosService.obtenerPorUsuarioId(usuario.sub);
  }

  @Patch('valor-consulta')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.MEDICO)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Actualizar honorario/valor de la consulta por el propio médico',
    description: 'Los turnos ya reservados conservan su valor congelado.',
  })
  @ApiResponse({ status: 200, description: 'Valor de consulta actualizado.' })
  actualizarValorConsulta(
    @CurrentUser() usuario: JwtPayload,
    @Body() dto: ActualizarValorConsultaDto,
  ) {
    return this.medicosService.actualizarValorConsulta(
      usuario.sub,
      dto.valorConsulta,
    );
  }

  @Patch(':id/valor-consulta')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMINISTRADOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Modificar el valor de la consulta de un médico (Rol Administrador)',
    description: 'Operación requerida en la consigna para el perfil Administrador.',
  })
  @ApiResponse({ status: 200, description: 'Valor de consulta actualizado por Administrador.' })
  actualizarValorConsultaAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarValorConsultaDto,
  ) {
    return this.medicosService.actualizarValorConsultaPorId(
      id,
      dto.valorConsulta,
    );
  }

  @Patch('turnos/:id/estado')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.MEDICO)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Registrar atención o inasistencia del paciente en un turno',
    description: 'Permite marcar el turno como ATENDIDO o AUSENTE.',
  })
  @ApiResponse({ status: 200, description: 'Estado del turno actualizado exitosamente.' })
  cambiarEstadoTurno(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CambiarEstadoTurnoDto,
    @CurrentUser() usuario: JwtPayload,
  ) {
    return this.medicosService.cambiarEstadoTurno(
      id,
      dto.nuevoEstado,
      usuario.sub,
    );
  }
}
