export enum RolUsuario {
  MEDICO = 'MEDICO',
  PACIENTE = 'PACIENTE',
  ADMINISTRADOR = 'ADMINISTRADOR',
}

export enum EstadoUsuario {
  ACTIVO = 'ACTIVO',
  BAJA = 'BAJA',
}

export interface Usuario {
  id: number;
  documento: string;
  apellidos: string;
  nombres: string;
  email: string;
  estado: EstadoUsuario;
  rol: RolUsuario;
}

export interface LoginCredentials {
  documento: string;
  clave: string;
}

export interface LoginResponse {
  accessToken: string;
  usuario: Usuario;
}
