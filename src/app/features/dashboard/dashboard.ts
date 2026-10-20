import { Component, inject, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TicketService } from '../../core/services/ticket.service';
import { AuthService } from '../../core/services/auth.service';
import { Ticket } from '../../core/models/ticket.model';

const normaliser = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly service = inject(TicketService);
  private readonly auth = inject(AuthService);

  readonly tickets = computed(() => {
    const all = this.service.tickets();
    if (this.auth.estAdministrateur()) return all;
    const nom = normaliser(this.auth.utilisateur()?.nom ?? '');
    return all.filter(t => normaliser(t.demandeur) === nom);
  });

  // --- Compteurs par statut ---
  readonly total = computed(() => this.tickets().length);

  readonly nbOuverts = computed(
    () => this.tickets().filter(t => t.statut === 'ouvert').length
  );
  readonly nbEnCours = computed(
    () => this.tickets().filter(t => t.statut === 'en_cours').length
  );
  readonly nbResolus = computed(
    () => this.tickets().filter(t => t.statut === 'resolu').length
  );
  readonly nbClos = computed(
    () => this.tickets().filter(t => t.statut === 'clos').length
  );

  // --- Compteurs par priorité ---
  readonly nbCritiques = computed(
    () => this.tickets().filter(t => t.priorite === 'critique').length
  );
  readonly nbHautes = computed(
    () => this.tickets().filter(t => t.priorite === 'haute').length
  );
  readonly nbMoyennes = computed(
    () => this.tickets().filter(t => t.priorite === 'moyenne').length
  );
  readonly nbBasses = computed(
    () => this.tickets().filter(t => t.priorite === 'basse').length
  );

  // --- Tickets en retard ---
  readonly ticketsEnRetard = computed(() =>
    this.tickets().filter(t => this.service.estEnRetard(t))
  );

  // --- Tickets non affectés ---
  readonly ticketsNonAffectes = computed(() =>
    this.tickets().filter(t => !t.technicien)
  );

  enRetard(t: Ticket): boolean {
    return this.service.estEnRetard(t);
  }

  pourcentage(valeur: number): number {
    const total = this.total();
    return total === 0 ? 0 : Math.round((valeur / total) * 100);
  }
}