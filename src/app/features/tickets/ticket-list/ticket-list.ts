import { Component, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { TicketService } from '../../../core/services/ticket.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { Ticket, Priorite } from '../../../core/models/ticket.model';

const normaliser = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

type ColonneTri = 'titre' | 'priorite' | 'statut' | 'technicien' | 'echeance';
type Sens = 'asc' | 'desc';

const poidsPriorite: Record<Priorite, number> = {
  basse: 1,
  moyenne: 2,
  haute: 3,
  critique: 4,
};

const poidsStatut: Record<string, number> = {
  ouvert: 1,
  en_cours: 2,
  resolu: 3,
  clos: 4,
};

@Component({
  selector: 'app-ticket-list',
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
  ],
  templateUrl: './ticket-list.html',
  styleUrl: './ticket-list.scss',
})
export class TicketList {
  private readonly service = inject(TicketService);
  private readonly toast = inject(ToastService);
  readonly auth = inject(AuthService);

  readonly colonnes = ['titre', 'priorite', 'statut', 'technicien', 'echeance'];

  /** Tous les tickets (admin) ou uniquement ceux du demandeur connecté. */
  readonly ticketsVisibles = computed(() => {
    const all = this.service.tickets();
    if (this.auth.estAdministrateur()) {
      return all;
    }
    const nom = normaliser(this.auth.utilisateur()?.nom ?? '');
    return all.filter(t => normaliser(t.demandeur) === nom);
  });

  // --- Filtres ---
  readonly filtreTitre = signal('');
  readonly filtreDemandeur = signal('');
  readonly filtreStatut = signal('');
  readonly filtrePriorite = signal('');

  readonly statuts = [
    { valeur: 'ouvert', libelle: 'Ouvert' },
    { valeur: 'en_cours', libelle: 'En cours' },
    { valeur: 'resolu', libelle: 'Résolu' },
    { valeur: 'clos', libelle: 'Clos' },
  ];

  readonly priorites = [
    { valeur: 'critique', libelle: 'Critique' },
    { valeur: 'haute', libelle: 'Haute' },
    { valeur: 'moyenne', libelle: 'Moyenne' },
    { valeur: 'basse', libelle: 'Basse' },
  ];

  // --- Suggestions issues des tickets existants ---
  readonly titresDisponibles = computed(() =>
    [...new Set(this.ticketsVisibles().map(t => t.titre))].sort()
  );
  readonly demandeursDisponibles = computed(() =>
    [...new Set(this.ticketsVisibles().map(t => t.demandeur))].sort()
  );

  readonly titresFiltres = computed(() => {
    const s = normaliser(this.filtreTitre());
    return this.titresDisponibles().filter(t => normaliser(t).includes(s));
  });
  readonly demandeursFiltres = computed(() => {
    const s = normaliser(this.filtreDemandeur());
    return this.demandeursDisponibles().filter(d => normaliser(d).includes(s));
  });

  // --- Tri ---
  readonly triColonne = signal<ColonneTri | null>(null);
  readonly triSens = signal<Sens>('asc');

  trierPar(colonne: ColonneTri): void {
    if (this.triColonne() === colonne) {
      this.triSens.update(s => (s === 'asc' ? 'desc' : 'asc'));
    } else {
      this.triColonne.set(colonne);
      this.triSens.set('asc');
    }
  }

  // --- Filtrage + tri ---
  readonly filtres = computed(() => {
    const titre = normaliser(this.filtreTitre());
    const demandeur = normaliser(this.filtreDemandeur());
    const statut = this.filtreStatut();
    const priorite = this.filtrePriorite();

    const filtres = this.ticketsVisibles().filter(
      t =>
        (!titre || normaliser(t.titre).includes(titre)) &&
        (!demandeur || normaliser(t.demandeur).includes(demandeur)) &&
        (!statut || t.statut === statut) &&
        (!priorite || t.priorite === priorite)
    );

    const colonne = this.triColonne();
    if (!colonne) return filtres;

    const sens = this.triSens();
    const facteur = sens === 'asc' ? 1 : -1;

    return [...filtres].sort((a, b) => {
      let cmp = 0;
      switch (colonne) {
        case 'titre':
          cmp = normaliser(a.titre).localeCompare(normaliser(b.titre));
          break;
        case 'priorite':
          cmp = poidsPriorite[a.priorite] - poidsPriorite[b.priorite];
          break;
        case 'statut':
          cmp = (poidsStatut[a.statut] ?? 99) - (poidsStatut[b.statut] ?? 99);
          break;
        case 'technicien':
          cmp = normaliser(a.technicien ?? 'zzz').localeCompare(
            normaliser(b.technicien ?? 'zzz')
          );
          break;
        case 'echeance':
          cmp = new Date(a.echeance).getTime() - new Date(b.echeance).getTime();
          break;
      }
      return cmp * facteur;
    });
  });

  reinitialiser(): void {
    this.filtreTitre.set('');
    this.filtreDemandeur.set('');
    this.filtreStatut.set('');
    this.filtrePriorite.set('');
    this.toast.info('Filtres réinitialisés');
  }

  enRetard(t: Ticket): boolean {
    return this.service.estEnRetard(t);
  }

  estTriee(colonne: ColonneTri): boolean {
    return this.triColonne() === colonne;
  }

  // --- Export CSV ---
  exporterCsv(): void {
    const liste = this.filtres();
    if (liste.length === 0) {
      this.toast.error('Aucun ticket à exporter');
      return;
    }

    const entetes = [
      'ID',
      'Titre',
      'Description',
      'Priorité',
      'Statut',
      'Demandeur',
      'Technicien',
      'Créé le',
      'Échéance',
    ];

    const lignes = liste.map(t =>
      [
        t.id,
        t.titre,
        t.description,
        t.priorite,
        t.statut,
        t.demandeur,
        t.technicien ?? '',
        new Date(t.dateCreation).toLocaleString('fr-FR'),
        new Date(t.echeance).toLocaleString('fr-FR'),
      ]
        .map(v => this.echapperCsv(String(v)))
        .join(';')
    );

    const contenu = [entetes.join(';'), ...lignes].join('\r\n');

    // BOM UTF-8 pour qu'Excel affiche correctement les accents
    const blob = new Blob(['\uFEFF' + contenu], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const lien = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    lien.href = url;
    lien.download = `tickets-${date}.csv`;
    lien.click();
    URL.revokeObjectURL(url);

    this.toast.success(`${liste.length} ticket(s) exporté(s)`);
  }

  // Échappe les guillemets et les ; pour Excel
  private echapperCsv(valeur: string): string {
    if (valeur.includes(';') || valeur.includes('"') || valeur.includes('\n')) {
      return '"' + valeur.replace(/"/g, '""') + '"';
    }
    return valeur;
  }
}