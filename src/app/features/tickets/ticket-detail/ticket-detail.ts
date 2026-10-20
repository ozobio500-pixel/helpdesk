import { Component, inject, input, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { TicketService } from '../../../core/services/ticket.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Statut } from '../../../core/models/ticket.model';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';

const normaliser = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

@Component({
  selector: 'app-ticket-detail',
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './ticket-detail.html',
  styleUrl: './ticket-detail.scss',
})
export class TicketDetail {
  private readonly service = inject(TicketService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly id = input.required<string>();

  readonly estAdmin = this.auth.estAdministrateur;

  readonly ticket = computed(() => {
    const id = Number(this.id());
    const t = this.service.tickets().find(x => x.id === id);
    if (!t) return undefined;
    if (this.auth.estAdministrateur()) return t;
    const nom = normaliser(this.auth.utilisateur()?.nom ?? '');
    if (normaliser(t.demandeur) === nom) return t;
    return undefined;
  });

  readonly peutModifier = computed(() => {
    const t = this.ticket();
    if (!t) return false;
    if (this.auth.estAdministrateur()) return true;
    return t.statut === 'ouvert';
  });

  readonly techniciens: string[] = ['Moussa', 'Aminata', 'Serge', 'Nadège'];

  readonly statuts: { valeur: Statut; libelle: string }[] = [
    { valeur: 'ouvert', libelle: 'Ouvert' },
    { valeur: 'en_cours', libelle: 'En cours' },
    { valeur: 'resolu', libelle: 'Résolu' },
    { valeur: 'clos', libelle: 'Clos' },
  ];

  private auteur(): string {
    return this.auth.utilisateur()?.nom ?? 'Système';
  }

  enRetard(): boolean {
    const t = this.ticket();
    return t ? this.service.estEnRetard(t) : false;
  }

  affecter(technicien: string): void {
    const t = this.ticket();
    if (t) {
      this.service.affecter(t.id, technicien, this.auteur());
      this.toast.info(`Ticket affecté à ${technicien}`);
    }
  }

  changerStatut(statut: Statut): void {
    const t = this.ticket();
    if (t) {
      this.service.changerStatut(t.id, statut, this.auteur());
      this.toast.info(`Statut changé en « ${statut} »`);
    }
  }

  supprimer(): void {
    const t = this.ticket();
    if (!t) return;

    const ref = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        titre: 'Supprimer le ticket',
        message: `Veux-tu vraiment supprimer « ${t.titre} » ? Cette action est irréversible.`,
        libelleConfirmer: 'Supprimer',
        libelleAnnuler: 'Annuler',
      },
    });

    ref.afterClosed().subscribe((confirme: boolean) => {
      if (confirme) {
        this.service.supprimer(t.id);
        this.toast.success('Ticket supprimé');
        void this.router.navigate(['/tickets']);
      }
    });
  }
}
