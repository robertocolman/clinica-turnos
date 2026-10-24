import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';


export interface Medico {
  id: number;
  nombre: string;
  valor: number;
}

interface MedicoApi {
  id: number;
  usuarioId: number;
  nombreCompleto: string;
  especialidad: string;
  valorConsulta: number;
}

@Injectable({
  providedIn: 'root'
})
export class MedicosService {
  private readonly http = inject(HttpClient);

  obtenerMedicos(): Observable<Medico[]> {
    return this.http.get<MedicoApi[]>('/api/medicos').pipe(
      map(medicos =>
        medicos.map(medico => ({
          id: medico.id,
          nombre: medico.nombreCompleto,
          valor: medico.valorConsulta
        }))
      )
    );
  }
}
