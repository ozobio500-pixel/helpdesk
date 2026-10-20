import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'tickets', pathMatch: 'full' },
  {
    path: 'connexion',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login').then(m => m.Login),
  },
  {
    path: 'inscription',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register/register').then(m => m.Register),
  },
  {
    path: 'tickets',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/tickets/ticket-list/ticket-list').then(m => m.TicketList),
  },
  {
    path: 'tickets/nouveau',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/tickets/ticket-form/ticket-form').then(m => m.TicketForm),
  },
  {
    path: 'tickets/:id/modifier',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/tickets/ticket-form/ticket-form').then(m => m.TicketForm),
  },
  {
    path: 'tickets/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/tickets/ticket-detail/ticket-detail').then(m => m.TicketDetail),
  },
  {
    path: 'tableau-de-bord',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard').then(m => m.Dashboard),
  },
];
