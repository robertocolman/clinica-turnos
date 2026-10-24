export enum EstadoReserva {
  ACTIVO = 'ACTIVO',
  ATENDIDO = 'ATENDIDO',
  AUSENTE = 'AUSENTE',
  CANCELADO = 'CANCELADO',
}

export interface Reserva {
  id: number;
  id_medico: number;
  id_paciente: number;
  fecha_hora: string;
  estado: EstadoReserva;
  valor_consulta: number;
  medico_nombre?: string;
  paciente_nombre?: string;
}