import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'groups',
    canActivate: [authGuard],
    loadComponent: () => import('./features/groups/group-list/group-list.component').then(m => m.GroupListComponent)
  },
  {
    path: 'groups/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/groups/group-detail/group-detail.component').then(m => m.GroupDetailComponent)
  },
  {
    path: 'groups/:groupId/polls/:pollId',
    canActivate: [authGuard],
    loadComponent: () => import('./features/polls/poll-detail/poll-detail.component').then(m => m.PollDetailComponent)
  },
  { path: '**', redirectTo: '/dashboard' }
];
