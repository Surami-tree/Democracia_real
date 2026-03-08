import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})

export class RegisterComponent {
  username = ''; email = ''; password = ''; displayName = '';
  error = ''; loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    if (!this.username || !this.email || !this.password) { this.error = 'Completa todos los campos'; return; }
    this.loading = true; this.error = '';
    this.authService.register({ username: this.username, email: this.email, password: this.password, displayName: this.displayName }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (e) => { this.error = e.error?.error || 'Error al registrarse'; this.loading = false; }
    });
  }
}
