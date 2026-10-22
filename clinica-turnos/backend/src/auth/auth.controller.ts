import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { LoginResponseDto, UsuarioResponseDto } from './dto/login-response.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { Roles } from './decorators/roles.decorator.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { RolUsuario } from './enums/rol.enum.js';
import type { JwtPayload } from './interfaces/jwt-payload.interface.js';

@ApiTags('Autenticacion y Usuarios')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesion en el sistema',
    description:
      'Valida credenciales contra la base de datos, verifica que el usuario este en estado ACTIVO y retorna el token JWT.',
  })
  @ApiResponse({
    status: 200,
    description: 'Inicio de sesion exitoso. Retorna el token Bearer JWT y los datos del usuario.',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada invalidos (error de validacion en DTO).',
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales invalidas o usuario dado de baja.',
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Get('perfil')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obtener datos del usuario actualmente autenticado',
    description: 'Extrae la informacion contenida en el payload del token JWT.',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario obtenido correctamente.',
  })
  @ApiResponse({ status: 401, description: 'No autorizado / Token ausente o invalido.' })
  obtenerPerfil(@CurrentUser() usuario: JwtPayload) {
    return {
      mensaje: 'Perfil obtenido exitosamente mediante token JWT',
      usuario,
    };
  }

  @Get('verificar-roles/admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMINISTRADOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Ruta de prueba protegida exclusivamente para ADMINISTRADOR',
    description: 'Demuestra el funcionamiento de RolesGuard restringiendo el acceso.',
  })
  @ApiResponse({ status: 200, description: 'Acceso permitido a Administrador.' })
  @ApiResponse({ status: 403, description: 'Prohibido para roles que no sean Administrador.' })
  soloAdmin(@CurrentUser() usuario: JwtPayload) {
    return {
      mensaje: 'Acceso concedido al panel de administracion',
      usuario,
    };
  }

  @Get('verificar-roles/medico')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.MEDICO)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Ruta de prueba protegida exclusivamente para MEDICO',
    description: 'Demuestra el funcionamiento de RolesGuard restringiendo el acceso.',
  })
  @ApiResponse({ status: 200, description: 'Acceso permitido a Medico.' })
  @ApiResponse({ status: 403, description: 'Prohibido para roles que no sean Medico.' })
  soloMedico(@CurrentUser() usuario: JwtPayload) {
    return {
      mensaje: 'Acceso concedido a la agenda medica',
      usuario,
    };
  }

  @Get('usuarios-prueba')
  @ApiOperation({
    summary: 'Listar usuarios de prueba del mock',
    description:
      'Devuelve la lista de usuarios y roles configurados para probar el login (Solo en desarrollo).',
  })
  @ApiResponse({
    status: 200,
    description: 'Credenciales de prueba disponibles.',
  })
  async obtenerUsuariosPrueba() {
    return {
      mensaje: 'Usuarios de prueba para el inicio de sesion (desarrollo):',
      credencialesDisponibles: [
        { rol: 'ADMINISTRADOR', documento: '11111111', clave: 'admin123', estado: 'ACTIVO' },
        { rol: 'MEDICO', documento: '22222222', clave: 'medico123', estado: 'ACTIVO' },
        { rol: 'PACIENTE', documento: '33333333', clave: 'paciente123', estado: 'ACTIVO' },
        { rol: 'PACIENTE (BAJA)', documento: '44444444', clave: 'baja123', estado: 'BAJA (Rebota)' },
      ],
      usuarios: await this.authService.obtenerUsuariosMock(),
    };
  }
}
