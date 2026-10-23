
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { RolUsuario } from '../auth/enums/rol.enum.js';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface.js';

import { ReservasService } from './reservas.service.js';
import { CrearReservaDto } from './dto/crear-reserva.dto.js';
import { ConsultarReservasDto } from './dto/consultar-reservas.dto.js';
import { ReservaRespuestaDto } from './dto/reserva-respuesta.dto.js';

@ApiTags('Reservas')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.PACIENTE, RolUsuario.ADMINISTRADOR)
@Controller('reservas')
export class ReservasController {
  constructor(
    private readonly reservasService: ReservasService,
  ) {}

  @Get('disponibilidad')
  @ApiOperation({
    summary: 'Consultar horarios disponibles de un médico',
  })
  consultarDisponibilidad(
    @Query('idMedico', ParseIntPipe) idMedico: number,
    @Query('fecha') fecha: string,
  ) {
    return this.reservasService.consultarDisponibilidad(
      idMedico,
      fecha,
    );
  }

  @Post()
  @ApiOperation({
    summary: 'Crear una nueva reserva',
  })
  crearReserva(
    @Body() dto: CrearReservaDto,
    @CurrentUser() usuario: JwtPayload,
  ): Promise<ReservaRespuestaDto> {
    return this.reservasService.crearReserva(dto, usuario);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar reservas según el rol del usuario',
  })
  listarReservas(
    @Query() filtros: ConsultarReservasDto,
    @CurrentUser() usuario: JwtPayload,
  ): Promise<ReservaRespuestaDto[]> {
    return this.reservasService.listarReservas(filtros, usuario);
  }

  @Patch(':id/cancelar')
  @ApiOperation({
    summary: 'Cancelar una reserva',
  })
  cancelarReserva(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() usuario: JwtPayload,
  ): Promise<ReservaRespuestaDto> {
    return this.reservasService.cancelarReserva(id, usuario);
  }
}
