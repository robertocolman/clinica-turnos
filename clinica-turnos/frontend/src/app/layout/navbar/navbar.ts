import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RolUsuario } from '../../core/models/user.model';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent {
  protected readonly authService = inject(AuthService);
  protected readonly RolUsuario = RolUsuario;

  onLogout(): void {
    this.authService.logout();
  }
}
