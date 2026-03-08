import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { GroupService } from '../../core/services/group.service';
import { Group } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container" style="padding-top:40px;padding-bottom:60px">
      <div class="page-header">
        <h1>Hola, {{ auth.currentUser()?.displayName }} 👋</h1>
        <p>Aquí tienes un resumen de tu actividad</p>
      </div>

      <!-- Stats -->
      <div class="grid grid-3" style="margin-bottom:40px">
        <div class="card" style="display:flex;align-items:center;gap:16px">
          <div style="width:48px;height:48px;background:rgba(108,99,255,0.15);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px">👥</div>
          <div>
            <div style="font-size:28px;font-weight:800;font-family:'Syne',sans-serif">{{ groups.length }}</div>
            <div class="text-muted text-sm">Grupos</div>
          </div>
        </div>
        <div class="card" style="display:flex;align-items:center;gap:16px">
          <div style="width:48px;height:48px;background:rgba(67,233,123,0.15);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px">🗳️</div>
          <div>
            <div style="font-size:28px;font-weight:800;font-family:'Syne',sans-serif">{{ adminGroups }}</div>
            <div class="text-muted text-sm">Grupos como admin</div>
          </div>
        </div>
        <div class="card" style="display:flex;align-items:center;gap:16px">
          <div style="width:48px;height:48px;background:rgba(255,101,132,0.15);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px">🔐</div>
          <div>
            <div style="font-size:28px;font-weight:800;font-family:'Syne',sans-serif">100%</div>
            <div class="text-muted text-sm">Votos anónimos</div>
          </div>
        </div>
      </div>

      <!-- Quick actions -->
      <div style="margin-bottom:32px">
        <h2 style="font-size:18px;font-weight:700;margin-bottom:16px">Acciones rápidas</h2>
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <a routerLink="/groups" class="btn btn-primary">➕ Crear grupo</a>
          <a routerLink="/groups" class="btn btn-secondary">🔍 Explorar grupos públicos</a>
        </div>
      </div>

      <!-- My groups -->
      <h2 style="font-size:18px;font-weight:700;margin-bottom:16px">Mis grupos</h2>
      @if (loading) { <div class="spinner"></div> }
      @else if (groups.length === 0) {
        <div class="empty-state">
          <div class="empty-icon">👥</div>
          <h3>Aún no perteneces a ningún grupo</h3>
          <p>Crea uno o únete con un código de invitación</p>
          <a routerLink="/groups" class="btn btn-primary" style="margin-top:20px">Ver grupos</a>
        </div>
      }
      @else {
        <div class="grid grid-3">
          @for (group of groups; track group.id) {
            <a [routerLink]="['/groups', group.id]" style="text-decoration:none">
              <div class="card" style="cursor:pointer">
                <div class="flex-between mb-16">
                  <div style="font-size:24px">{{ group.isPublic ? '🌐' : '🔒' }}</div>
                  <span class="badge" [class.badge-admin]="group.currentUserRole === 'ADMIN'" [class.badge-member]="group.currentUserRole === 'MEMBER'">
                    {{ group.currentUserRole === 'ADMIN' ? 'Admin' : 'Miembro' }}
                  </span>
                </div>
                <h3 style="font-size:16px;font-weight:700;margin-bottom:4px">{{ group.name }}</h3>
                <p class="text-muted text-sm" style="margin-bottom:12px">{{ group.description || 'Sin descripción' }}</p>
                <div class="tag">👥 {{ group.memberCount }} miembro{{ group.memberCount !== 1 ? 's' : '' }}</div>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  groups: Group[] = [];
  loading = true;

  get adminGroups() { return this.groups.filter(g => g.currentUserRole === 'ADMIN').length; }

  constructor(public auth: AuthService, private groupService: GroupService) {}

  ngOnInit() {
    this.groupService.getMyGroups().subscribe({
      next: (g) => { this.groups = g; this.loading = false; },
      error: () => this.loading = false
    });
  }
}
