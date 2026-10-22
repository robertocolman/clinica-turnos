import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto.js';
import { LoginResponseDto } from './dto/login-response.dto.js';
import { RolUsuario } from './enums/rol.enum.js';
import { EstadoUsuario } from './enums/estado-usuario.enum.js';
import { JwtPayload } from './interfaces/jwt-payload.interface.js';
import { Usuario } from '../database/entities/usuario.entity.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  /**
   * Autentica a un usuario consultando directamente la base de datos PostgreSQL mediante TypeORM.
   */
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { documento, clave } = loginDto;

    // 1. Busqueda del usuario en la base de datos PostgreSQL
    const usuario = await this.usuarioRepository.findOne({
      where: { documento },
    });

    if (!usuario) {
      throw new UnauthorizedException(
        'Credenciales inválidas (documento o clave incorrectos)',
      );
    }

    // 2. Validacion de estado: Solo usuarios en estado ACTIVO pueden iniciar sesion
    if (usuario.estado !== EstadoUsuario.ACTIVO) {
      throw new UnauthorizedException(
        'El usuario no se encuentra activo en el sistema. Estado actual: ' +
          usuario.estado,
      );
    }

    // 3. Comparacion segura de contraseña mediante bcrypt
    const claveValida = await bcrypt.compare(clave, usuario.clave);
    if (!claveValida) {
      throw new UnauthorizedException(
        'Credenciales inválidas (documento o clave incorrectos)',
      );
    }

    // 4. Generacion de payload para el JWT
    const payload: JwtPayload = {
      sub: usuario.id,
      documento: usuario.documento,
      email: usuario.email,
      rol: usuario.rol,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      usuario: {
        id: usuario.id,
        documento: usuario.documento,
        apellidos: usuario.apellidos,
        nombres: usuario.nombres,
        email: usuario.email,
        estado: usuario.estado,
        rol: usuario.rol,
      },
    };
  }

  /**
   * Metodo helper para listar usuarios (util para pruebas y documentacion)
   */
  async obtenerUsuarios() {
    return this.usuarioRepository.find({
      select: {
        id: true,
        documento: true,
        nombres: true,
        apellidos: true,
        email: true,
        rol: true,
        estado: true,
      },
    });
  }

  async obtenerUsuariosMock() {
    return this.obtenerUsuarios();
  }
}
