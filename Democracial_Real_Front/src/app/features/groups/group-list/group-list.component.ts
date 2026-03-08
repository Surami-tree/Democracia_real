import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GroupService } from '../../../core/services/group.service';
import { Group } from '../../../core/models/models';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container" style="padding-top:40px;padding-bottom:60px">
      <div class="page-header flex-between">
        <div>
          <h1>Grupos</h1>
          <p>Gestiona tus grupos y únete a nuevos</p>
        </div>
        <div style="display:flex;gap:10px">
          <button class="btn btn-secondary" (click)="showJoin=true">🔗 Unirse con código</button>
          <button class="btn btn-primary" (click)="showCreate=true">➕ Crear grupo</button>
        </div>
      </div>

      <!-- My groups -->
      <h2 style="font-size:18px;font-weight:700;margin-bottom:16px">Mis grupos</h2>
      @if (loading) { <div class="spinner"></div> }
      @else if (myGroups.length === 0) {
        <div class="empty-state" style="padding:40px 20px">
          <div class="empty-icon">👥</div>
          <h3>Sin grupos todavía</h3>
        </div>
      } @else {
        <div class="grid grid-2" style="margin-bottom:40px">
          @for (g of myGroups; track g.id) {
            <a [routerLink]="['/groups', g.id]" style="text-decoration:none">
              <div class="card" style="cursor:pointer">
                <div class="flex-between" style="margin-bottom:12px">
                  <h3 style="font-size:16px;font-weight:700">{{ g.name }}</h3>
                  <span class="badge" [class.badge-admin]="g.currentUserRole==='ADMIN'" [class.badge-member]="g.currentUserRole==='MEMBER'">
                    {{ g.currentUserRole==='ADMIN' ? 'Admin' : 'Miembro' }}
                  </span>
                </div>
                <p class="text-muted text-sm" style="margin-bottom:12px">{{ g.description || 'Sin descripción' }}</p>
                <div style="display:flex;gap:8px">
                  <span class="tag">{{ g.isPublic ? '🌐 Público' : '🔒 Privado' }}</span>
                  <span class="tag">👥 {{ g.memberCount }}</span>
                </div>
              </div>
            </a>
          }
        </div>
      }

      <!-- Public groups -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h2 style="font-size:18px;font-weight:700">Grupos públicos</h2>
      </div>
      @if (publicGroups.length === 0) {
        <p class="text-muted">No hay grupos públicos disponibles.</p>
      } @else {
        <div class="grid grid-2">
          @for (g of publicGroups; track g.id) {
            @if (!isMember(g.id)) {
              <div class="card">
                <div class="flex-between" style="margin-bottom:12px">
                  <h3 style="font-size:16px;font-weight:700">{{ g.name }}</h3>
                  <span class="tag">🌐 Público</span>
                </div>
                <p class="text-muted text-sm" style="margin-bottom:16px">{{ g.description || 'Sin descripción' }}</p>
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <span class="tag">👥 {{ g.memberCount }}</span>
                  <button class="btn btn-primary btn-sm" (click)="joinPublic(g.id)">Unirse</button>
                </div>
              </div>
            }
          }
        </div>
      }
    </div>

    <!-- Create group modal -->
    @if (showCreate) {
      <div class="modal-backdrop" (click)="showCreate=false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <span class="modal-title">Crear grupo</span>
            <button class="modal-close" (click)="showCreate=false">✕</button>
          </div>
          @if (createError) { <div class="alert alert-error mb-16">{{ createError }}</div> }
          <div style="display:flex;flex-direction:column;gap:16px">
            <div class="form-group">
              <label class="form-label">Nombre del grupo *</label>
              <input class="form-control" [(ngModel)]="newGroup.name" placeholder="Mi grupo de trabajo">
            </div>
            <div class="form-group">
              <label class="form-label">Descripción</label>
              <textarea class="form-control" [(ngModel)]="newGroup.description" placeholder="Opcional..."></textarea>
            </div>
            <div class="form-group" style="flex-direction:row;align-items:center;gap:10px">
              <input type="checkbox" id="isPublic" [(ngModel)]="newGroup.isPublic" style="width:18px;height:18px;accent-color:var(--accent)">
              <label for="isPublic" style="font-size:14px;cursor:pointer">Grupo público (visible para todos)</label>
            </div>
            <div style="display:flex;gap:10px;justify-content:flex-end">
              <button class="btn btn-secondary" (click)="showCreate=false">Cancelar</button>
              <button class="btn btn-primary" (click)="createGroup()" [disabled]="createLoading">
                {{ createLoading ? 'Creando...' : 'Crear grupo' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Join by code modal -->
    @if (showJoin) {
      <div class="modal-backdrop" (click)="showJoin=false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <span class="modal-title">Unirse con código</span>
            <button class="modal-close" (click)="showJoin=false">✕</button>
          </div>
          @if (joinError) { <div class="alert alert-error mb-16">{{ joinError }}</div> }
          @if (joinSuccess) { <div class="alert alert-success mb-16">{{ joinSuccess }}</div> }
          <div style="display:flex;flex-direction:column;gap:16px">
            <div class="form-group">
              <label class="form-label">Código de invitación</label>
              <input class="form-control font-mono" [(ngModel)]="inviteCode" placeholder="ABC12345" style="text-transform:uppercase" (keyup.enter)="joinByCode()">
            </div>
            <div style="display:flex;gap:10px;justify-content:flex-end">
              <button class="btn btn-secondary" (click)="showJoin=false">Cancelar</button>
              <button class="btn btn-primary" (click)="joinByCode()" [disabled]="joinLoading">
                {{ joinLoading ? 'Uniéndose...' : 'Unirse' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class GroupListComponent implements OnInit {
  myGroups: Group[] = [];
  publicGroups: Group[] = [];
  loading = true;
  showCreate = false;
  showJoin = false;
  newGroup = { name: '', description: '', isPublic: false };
  createError = ''; createLoading = false;
  inviteCode = ''; joinError = ''; joinSuccess = ''; joinLoading = false;

  constructor(private groupService: GroupService) {}

  ngOnInit() {
    this.loadGroups();
    this.groupService.getPublicGroups().subscribe(g => this.publicGroups = g);
  }

  loadGroups() {
    this.loading = true;
    this.groupService.getMyGroups().subscribe({
      next: g => { this.myGroups = g; this.loading = false; },
      error: () => this.loading = false
    });
  }

  isMember(groupId: number) { return this.myGroups.some(g => g.id === groupId); }

  createGroup() {
    if (!this.newGroup.name.trim()) { this.createError = 'El nombre es obligatorio'; return; }
    this.createLoading = true; this.createError = '';
    this.groupService.createGroup(this.newGroup).subscribe({
      next: (g) => {
        this.myGroups.unshift(g);
        this.showCreate = false;
        this.newGroup = { name: '', description: '', isPublic: false };
        this.createLoading = false;
      },
      error: (e) => { this.createError = e.error?.error || 'Error al crear'; this.createLoading = false; }
    });
  }

  joinByCode() {
    if (!this.inviteCode.trim()) return;
    this.joinLoading = true; this.joinError = ''; this.joinSuccess = '';
    this.groupService.joinByInviteCode(this.inviteCode.toUpperCase()).subscribe({
      next: (g) => {
        this.myGroups.unshift(g);
        this.joinSuccess = `✅ Te uniste a "${g.name}"`;
        this.inviteCode = '';
        this.joinLoading = false;
        setTimeout(() => this.showJoin = false, 1500);
      },
      error: (e) => { this.joinError = e.error?.error || 'Código inválido'; this.joinLoading = false; }
    });
  }

  joinPublic(id: number) {
    this.groupService.joinPublicGroup(id).subscribe({
      next: (g) => { this.myGroups.unshift(g); },
      error: () => {}
    });
  }
}
