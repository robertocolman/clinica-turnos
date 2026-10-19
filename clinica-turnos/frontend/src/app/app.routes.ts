import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { PacienteTurnosComponent } from './pages/paciente/turnos';
import { MedicoAgendaComponent } from './pages/medico/agenda';
import { AdminPanelComponent } from './pages/admin/panel';
import { NoAutorizadoComponent } from './pages/no-autorizado/no-autorizado';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { RolUsuario } from './core/models/user.model';

export const routes: Routes = [
  // Ruta publica de Login
  { path: 'login', component: LoginComponent },

  // Rutas protegidas para Pacientes (y Administradores)
  {
    path: 'paciente/turnos',
    component: PacienteTurnosComponent,
    canActivate: [authGuard, roleGuard([RolUsuario.PACIENTE, RolUsuario.ADMINISTRADOR])],
  },
  {
    path: 'paciente/reservar',
    component: PacienteTurnosComponent,
    canActivate: [authGuard, roleGuard([RolUsuario.PACIENTE, RolUsuario.ADMINISTRADOR])],
  },

  // Rutas protegidas para Medicos (y Administradores)
  {
    path: 'medico/agenda',
    component: MedicoAgendaComponent,
    canActivate: [authGuard, roleGuard([RolUsuario.MEDICO, RolUsuario.ADMINISTRADOR])],
  },

  // Rutas protegidas exclusivas para Administradores
  {
    path: 'admin/panel',
    component: AdminPanelComponent,
    canActivate: [authGuard, roleGuard([RolUsuario.ADMINISTRADOR])],
  },
  {
    path: 'admin/medicos',
    component: AdminPanelComponent,
    canActivate: [authGuard, roleGuard([RolUsuario.ADMINISTRADOR])],
  },

  // Acceso denegado
  { path: 'no-autorizado', component: NoAutorizadoComponent },

  // Redirecciones
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
