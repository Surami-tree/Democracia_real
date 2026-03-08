import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    @if (auth.isAuthenticated()) {
      <nav class="navbar">
        <div class="container navbar-inner">
          <a routerLink="/dashboard" class="navbar-brand">
            <span class="logo-dot"></span>
            VotApp
          </a>
          <div class="navbar-nav">
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">Dashboard</a>
            <a routerLink="/groups" routerLinkActive="active" class="nav-link">Grupos</a>
            <span class="text-muted text-sm" style="padding: 0 8px">
              {{ auth.currentUser()?.displayName }}
            </span>
            <button class="btn btn-secondary btn-sm" (click)="auth.logout()">Salir</button>
          </div>
        </div>
      </nav>
    }
    <router-outlet />
  `
})
export class AppComponent {
  constructor(public auth: AuthService) {}
}
