import { effect, Injectable, signal } from '@angular/core';
import { Ticket, Priorite, Statut } from '../models/ticket.model';

const CLE_TICKETS = 'helpdesk.tickets';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private readonly _tickets = signal<Ticket[]>(this.chargerTickets());

  readonly tickets = this._tickets.asReadonly();

  constructor() {
    effect(() => {
      this.sauvegarderTickets(this._tickets());
    });
  }

  // --- création ---
  creer(donnees: {
    titre: string;
    description: string;
    priorite: Priorite;
    demandeur: string;
  }): void {
    const maintenant = new Date();
    const delaisHeures: Record<Priorite, number> = {
      basse: 7 * 24,
      moyenne: 3 * 24,
      haute: 24,
      critique: 4,
    };
    const echeance = new Date(
      maintenant.getTime() + delaisHeures[donnees.priorite] * 3600 * 1000
    );

    const nouveau: Ticket = {
      id: this.prochainId(),
      titre: donnees.titre,
      description: donnees.description,
      priorite: donnees.priorite,
      demandeur: donnees.demandeur,
      statut: 'ouvert',
      technicien: null,
      dateCreation: maintenant.toISOString(),
      echeance: echeance.toISOString(),
      historique: [
        {
          date: maintenant.toISOString(),
          auteur: donnees.demandeur,
          action: 'Création du ticket',
        },
      ],
    };

    this._tickets.update(liste => [...liste, nouveau]);
  }

  // --- obtention ---
  obtenir(id: number): Ticket | undefined {
    return this._tickets().find(t => t.id === id);
  }

  // --- affectation ---
  affecter(id: number, technicien: string, auteur: string): void {
    this._tickets.update(liste =>
      liste.map(t =>
        t.id === id
          ? {
              ...t,
              technicien,
              historique: [
                ...t.historique,
                {
                  date: new Date().toISOString(),
                  auteur,
                  action: `Affecté à ${technicien}`,
                },
              ],
            }
          : t
      )
    );
  }

  // --- changement de statut ---
  changerStatut(id: number, statut: Statut, auteur: string): void {
    this._tickets.update(liste =>
      liste.map(t =>
        t.id === id
          ? {
              ...t,
              statut,
              historique: [
                ...t.historique,
                {
                  date: new Date().toISOString(),
                  auteur,
                  action: `Statut changé en « ${statut} »`,
                },
              ],
            }
          : t
      )
    );
  }

  // --- modification (titre / description / priorité) ---
  modifier(
    id: number,
    donnees: {
      titre: string;
      description: string;
      priorite: Priorite;
    },
    auteur: string
  ): void {
    this._tickets.update(liste =>
      liste.map(t =>
        t.id === id
          ? {
              ...t,
              titre: donnees.titre,
              description: donnees.description,
              priorite: donnees.priorite,
              historique: [
                ...t.historique,
                {
                  date: new Date().toISOString(),
                  auteur,
                  action: 'Modification du ticket',
                },
              ],
            }
          : t
      )
    );
  }

  // --- est en retard ---
  estEnRetard(t: Ticket): boolean {
    return (
      t.statut !== 'clos' &&
      t.statut !== 'resolu' &&
      new Date(t.echeance).getTime() < Date.now()
    );
  }

  // --- suppression ---
  supprimer(id: number): void {
    this._tickets.update(liste => liste.filter(t => t.id !== id));
  }

  // --- utilitaire interne ---
  private prochainId(): number {
    const liste = this._tickets();
    return liste.length === 0 ? 1 : Math.max(...liste.map(t => t.id)) + 1;
  }

  private chargerTickets(): Ticket[] {
    try {
      const brut = localStorage.getItem(CLE_TICKETS);
      return brut ? (JSON.parse(brut) as Ticket[]) : [];
    } catch {
      return [];
    }
  }

  private sauvegarderTickets(liste: Ticket[]): void {
    try {
      localStorage.setItem(CLE_TICKETS, JSON.stringify(liste));
    } catch {
      /* ignore */
    }
  }
}