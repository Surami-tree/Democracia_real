import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { PollService } from '../../../core/services/poll.service';
import { Poll, Voter } from '../../../core/models/models';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-poll-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe],
  template: `
    <div class="container" style="padding-top:40px;padding-bottom:60px;max-width:720px">
      @if (loading) { <div class="spinner"></div> }
      @else if (poll) {
        <!-- Back -->
        <div style="margin-bottom:24px">
          <a [routerLink]="['/groups', poll.groupId]" style="color:var(--text-muted);text-decoration:none;font-size:14px">← Volver al grupo</a>
        </div>

        <!-- Poll card -->
        <div class="card" style="margin-bottom:24px">
          <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap">
            <span class="badge" [class.badge-open]="poll.status==='OPEN'" [class.badge-closed]="poll.status==='CLOSED'">
              {{ poll.status === 'OPEN' ? 'Abierta' : 'Cerrada' }}
            </span>
            <span class="tag">{{ pollTypeLabel(poll.pollType) }}</span>
            <span class="tag">🗳️ {{ poll.totalVotes }} voto{{ poll.totalVotes !== 1 ? 's' : '' }}</span>
            @if (poll.hasVoted) { <span class="tag" style="color:var(--success)">✅ Ya votaste</span> }
          </div>

          <h1 style="font-size:22px;font-weight:800;margin-bottom:8px">{{ poll.question }}</h1>
          @if (poll.description) {
            <p class="text-muted" style="margin-bottom:16px">{{ poll.description }}</p>
          }

          <div style="display:flex;gap:16px;margin-bottom:24px" class="text-muted text-sm">
            <span>Por {{ poll.createdByUsername }}</span>
            <span>{{ poll.createdAt | date:'dd/MM/yyyy' }}</span>
            @if (poll.endsAt) { <span>Cierra: {{ poll.endsAt | date:'dd/MM/yyyy HH:mm' }}</span> }
          </div>

          <hr class="divider">

          <!-- Voting form -->
          @if (!poll.hasVoted && poll.status === 'OPEN') {
            <div>
              <p style="font-size:14px;font-weight:600;margin-bottom:16px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em">
                {{ poll.pollType === 'MULTIPLE_CHOICE' ? 'Selecciona una o más opciones' : 'Selecciona una opción' }}
              </p>
              <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:24px">
                @for (opt of poll.options; track opt.id) {
                  <label style="display:flex;align-items:center;gap:12px;padding:14px;background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);cursor:pointer;transition:all 0.15s"
                    [style.border-color]="isSelected(opt.id) ? 'var(--accent)' : ''"
                    [style.background]="isSelected(opt.id) ? 'rgba(108,99,255,0.1)' : ''">
                    @if (poll.pollType === 'MULTIPLE_CHOICE') {
                      <input type="checkbox" [checked]="isSelected(opt.id)" (change)="toggleOption(opt.id)" style="width:18px;height:18px;accent-color:var(--accent)">
                    } @else {
                      <input type="radio" name="poll_option" [value]="opt.id" [checked]="isSelected(opt.id)" (change)="selectOption(opt.id)" style="width:18px;height:18px;accent-color:var(--accent)">
                    }
                    <span style="font-weight:500">{{ opt.text }}</span>
                  </label>
                }
              </div>
              @if (voteError) { <div class="alert alert-error mb-16">{{ voteError }}</div> }
              <button class="btn btn-primary" (click)="castVote()" [disabled]="selectedOptions.length === 0 || voteLoading" style="padding:12px 28px">
                {{ voteLoading ? 'Enviando...' : '🗳️ Votar' }}
              </button>
            </div>
          }

          <!-- Results (show after voting or if poll is closed) -->
          @if (poll.hasVoted || poll.status === 'CLOSED') {
            <div>
              <p style="font-size:14px;font-weight:600;margin-bottom:16px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em">
                Resultados
              </p>
              <div style="display:flex;flex-direction:column;gap:14px">
                @for (opt of poll.options; track opt.id) {
                  <div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:6px">
                      <span style="font-weight:500">{{ opt.text }}</span>
                      <div style="display:flex;gap:12px">
                        <span class="text-muted text-sm">{{ opt.voteCount }} voto{{ opt.voteCount !== 1 ? 's' : '' }}</span>
                        <span style="font-weight:700;font-size:15px;min-width:42px;text-align:right">{{ opt.percentage }}%</span>
                      </div>
                    </div>
                    <div class="vote-bar-bg">
                      <div class="vote-bar-fill" [style.width]="opt.percentage + '%'"></div>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Anonymity notice -->
          <div style="margin-top:24px;padding:12px;background:rgba(108,99,255,0.08);border:1px solid rgba(108,99,255,0.2);border-radius:var(--radius)">
            <p style="font-size:13px;color:var(--text-muted)">
              🔐 <strong style="color:var(--text)">Votación anónima:</strong>
              Tu voto no está vinculado a tu identidad. Los administradores solo pueden ver que participaste, nunca qué elegiste.
            </p>
          </div>
        </div>

        <!-- Admin actions -->
        @if (isAdmin) {
          <div class="card" style="margin-bottom:24px">
            <h3 style="font-size:16px;font-weight:700;margin-bottom:16px">Panel de administrador</h3>

            @if (poll.status === 'OPEN') {
              <button class="btn btn-danger" (click)="closePoll()" style="margin-bottom:16px">🔒 Cerrar votación</button>
            }

            <div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
                <p style="font-size:14px;font-weight:600">Participantes ({{ poll.totalVotes }})</p>
                <button class="btn btn-secondary btn-sm" (click)="loadVoters()" [disabled]="votersLoading">
                  {{ showVoters ? 'Ocultar' : 'Ver quién votó' }}
                </button>
              </div>
              <p class="text-muted text-sm">Puedes ver quién ha participado, pero no qué votó cada persona.</p>

              @if (showVoters) {
                @if (votersLoading) { <div class="spinner" style="margin:16px auto"></div> }
                @else {
                  <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px">
                    @for (v of voters; track v.userId) {
                      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:var(--surface2);border-radius:var(--radius)">
                        <div>
                          <span style="font-weight:500">{{ v.displayName || v.username }}</span>
                          <span class="text-muted text-sm" style="margin-left:8px">&#64;{{ v.username }}</span>
                        </div>
                        <span class="text-muted text-sm">{{ v.votedAt | date:'dd/MM HH:mm' }}</span>
                      </div>
                    }
                  </div>
                }
              }
            </div>
          </div>
        }
      }
    </div>
  `
})
export class PollDetailComponent implements OnInit {
  poll: Poll | null = null;
  loading = true;
  selectedOptions: number[] = [];
  voteError = ''; voteLoading = false;
  voters: Voter[] = []; votersLoading = false; showVoters = false;
  isAdmin = false;

  constructor(
    private route: ActivatedRoute,
    private pollService: PollService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const pollId = Number(this.route.snapshot.paramMap.get('pollId'));
    this.pollService.getPoll(pollId).subscribe({
      next: p => {
        this.poll = p;
        this.loading = false;
        // Admin check done via group detail - we use a simple heuristic
        // (In production, pass role through route state or fetch group)
      },
      error: () => this.loading = false
    });

    // Check admin status from route state if available
    const state = history.state;
    if (state?.isAdmin) this.isAdmin = true;
    // Alternatively, always show admin section if user created the poll
    // This gets resolved when group is loaded
  }

  isSelected(id: number) { return this.selectedOptions.includes(id); }

  selectOption(id: number) { this.selectedOptions = [id]; }

  toggleOption(id: number) {
    const idx = this.selectedOptions.indexOf(id);
    if (idx > -1) this.selectedOptions.splice(idx, 1);
    else this.selectedOptions.push(id);
  }

  castVote() {
    if (this.selectedOptions.length === 0) return;
    this.voteLoading = true; this.voteError = '';
    this.pollService.vote(this.poll!.id, this.selectedOptions).subscribe({
      next: (p) => { this.poll = p; this.voteLoading = false; },
      error: (e) => { this.voteError = e.error?.error || 'Error al votar'; this.voteLoading = false; }
    });
  }

  closePoll() {
    if (!confirm('¿Cerrar esta votación?')) return;
    this.pollService.closePoll(this.poll!.id).subscribe({ next: p => this.poll = p });
  }

  loadVoters() {
    this.showVoters = !this.showVoters;
    if (this.showVoters && this.voters.length === 0) {
      this.votersLoading = true;
      this.pollService.getVoters(this.poll!.id).subscribe({
        next: v => { this.voters = v; this.votersLoading = false; },
        error: () => this.votersLoading = false
      });
    }
  }

  pollTypeLabel(type: string) {
    return type === 'SINGLE_CHOICE' ? '⚪ Opción única' : type === 'MULTIPLE_CHOICE' ? '☑️ Opción múltiple' : '✅ Sí/No';
  }
}
