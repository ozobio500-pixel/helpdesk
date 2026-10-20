import {
  Component,
  computed,
  ElementRef,
  effect,
  inject,
  input,
  signal,
  ViewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TicketService } from '../../../core/services/ticket.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Priorite } from '../../../core/models/ticket.model';

const CLE_TITRES = 'tickets.titres';
const CLE_DEMANDEURS = 'tickets.demandeurs';

const normaliser = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

@Component({
  selector: 'app-ticket-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './ticket-form.html',
  styleUrl: './ticket-form.scss',
})
export class TicketForm {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(TicketService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly estAdmin = this.auth.estAdministrateur;

  // --- Mode édition : id optionnel depuis l'URL ---
  readonly id = input<string | undefined>(undefined);
  readonly estEdition = computed(() => !!this.id());

  @ViewChild('autoTitreTrigger')
  private autoTitreTrigger?: MatAutocompleteTrigger;

  @ViewChild('autoDemandeurTrigger')
  private autoDemandeurTrigger?: MatAutocompleteTrigger;

  @ViewChild('titreInput')
  private titreInput?: ElementRef<HTMLInputElement>;

  @ViewChild('demandeurInput')
  private demandeurInput?: ElementRef<HTMLInputElement>;

  readonly titres: string[] = [
    'Imprimante en panne',
    'Problème de connexion réseau',
    'Ordinateur qui ne démarre pas',
    'Ordinateur très lent',
    'Mot de passe oublié',
    'Compte bloqué',
    'Logiciel à installer',
    'Mise à jour à effectuer',
    'Messagerie inaccessible',
    'Écran défectueux',
    'Clavier ou souris défectueux',
    'Accès VPN impossible',
    'Wi-Fi indisponible',
    'Téléphone IP en panne',
    'Perte de données',
    'Virus ou message suspect',
    'Demande de nouveau matériel',
    'Accès à un dossier partagé refusé',
  ];

  readonly demandeurs: string[] = [
    'Yacouba',
    'Awa',
    'Koffi',
    'Mariam',
    'Ibrahim',
    'Fatou',
    'Adama',
    'Aïcha',
    'Kouadio',
    'Salif',
  ];

  private readonly titresPersistes = signal<string[]>(this.charger(CLE_TITRES));
  private readonly demandeursPersistes = signal<string[]>(this.charger(CLE_DEMANDEURS));

  readonly tousLesTitres = computed(() => [
    ...new Set([
      ...this.titres,
      ...this.titresPersistes(),
      ...this.service.tickets().map(t => t.titre),
    ]),
  ]);

  readonly tousLesDemandeurs = computed(() => [
    ...new Set([
      ...this.demandeurs,
      ...this.demandeursPersistes(),
      ...this.service.tickets().map(t => t.demandeur),
    ]),
  ]);

  private readonly titreSaisi = signal('');
  private readonly demandeurSaisi = signal('');

  readonly titresFiltres = computed(() => {
    const s = normaliser(this.titreSaisi());
    return this.tousLesTitres().filter(t => normaliser(t).includes(s));
  });

  readonly demandeursFiltres = computed(() => {
    const s = normaliser(this.demandeurSaisi());
    return this.tousLesDemandeurs().filter(d => normaliser(d).includes(s));
  });

  readonly priorites: { valeur: Priorite; libelle: string }[] = [
    { valeur: 'basse', libelle: 'Basse (7 jours)' },
    { valeur: 'moyenne', libelle: 'Moyenne (3 jours)' },
    { valeur: 'haute', libelle: 'Haute (24 h)' },
    { valeur: 'critique', libelle: 'Critique (4 h)' },
  ];

  readonly descriptions: string[] = [
    'Plus de connexion au réseau',
    'Le matériel ne s’allume plus',
    'Message d’erreur à l’écran',
    'Lenteurs importantes',
    'Accès refusé',
    'Demande d’installation ou de mise à jour',
    'Autre problème technique',
  ];

  readonly form = this.fb.nonNullable.group({
    titre: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', Validators.required],
    priorite: ['moyenne' as Priorite, Validators.required],
    demandeur: ['', [Validators.required, Validators.minLength(2)]],
  });

  constructor() {
    this.form.controls.titre.valueChanges.subscribe(v => this.titreSaisi.set(v ?? ''));
    this.form.controls.demandeur.valueChanges.subscribe(v => this.demandeurSaisi.set(v ?? ''));

    effect(() => this.sauvegarder(CLE_TITRES, this.titresPersistes()));
    effect(() => this.sauvegarder(CLE_DEMANDEURS, this.demandeursPersistes()));

    effect(() => {
      const idStr = this.id();
      const u = this.auth.utilisateur();

      if (!idStr && u && !this.auth.estAdministrateur()) {
        this.form.patchValue({ demandeur: u.nom });
        this.form.controls.demandeur.disable();
        return;
      }

      if (!idStr) return;

      const t = this.service.obtenir(Number(idStr));
      if (!t) return;

      if (!this.auth.estAdministrateur()) {
        const nom = normaliser(u?.nom ?? '');
        if (normaliser(t.demandeur) !== nom || t.statut !== 'ouvert') {
          void this.router.navigate(['/tickets', t.id]);
          return;
        }
      }

      this.form.patchValue({
        titre: t.titre,
        description: t.description,
        priorite: t.priorite,
        demandeur: t.demandeur,
      });
      this.form.controls.demandeur.disable();
    });
  }

  private auteur(): string {
    return this.auth.utilisateur()?.nom ?? 'Système';
  }

  ouvrirTitre(): void {
    if (this.form.controls.titre.disabled) return;
    this.titreInput?.nativeElement.focus();
    queueMicrotask(() => this.autoTitreTrigger?.openPanel());
  }

  ouvrirDemandeur(): void {
    if (this.form.controls.demandeur.disabled) return;
    this.demandeurInput?.nativeElement.focus();
    queueMicrotask(() => this.autoDemandeurTrigger?.openPanel());
  }

  ajouterTitre(valeur: string): void {
    const v = valeur.trim();
    if (!v) return;
    if (this.tousLesTitres().some(t => normaliser(t) === normaliser(v))) return;
    this.titresPersistes.update(liste => [...liste, v]);
  }

  ajouterDemandeur(valeur: string): void {
    const v = valeur.trim();
    if (!v) return;
    if (this.tousLesDemandeurs().some(d => normaliser(d) === normaliser(v))) return;
    this.demandeursPersistes.update(liste => [...liste, v]);
  }

  reinitialiserListes(): void {
    this.titresPersistes.set([]);
    this.demandeursPersistes.set([]);
  }

  envoyer(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Le formulaire contient des erreurs');
      return;
    }

    const v = this.form.getRawValue();
    const titre = v.titre.trim();
    const demandeur = v.demandeur.trim();

    if (this.estEdition()) {
      const idNum = Number(this.id());
      this.service.modifier(
        idNum,
        { titre, description: v.description, priorite: v.priorite },
        this.auteur()
      );
      this.toast.success('Ticket modifié');
      void this.router.navigate(['/tickets', idNum]);
    } else {
      this.ajouterTitre(titre);
      this.ajouterDemandeur(demandeur);
      this.service.creer({ ...v, titre, demandeur });
      this.toast.success('Ticket créé');
      void this.router.navigate(['/tickets']);
    }
  }

  private charger(cle: string): string[] {
    try {
      const brut = localStorage.getItem(cle);
      return brut ? (JSON.parse(brut) as string[]) : [];
    } catch {
      return [];
    }
  }

  private sauvegarder(cle: string, valeur: string[]): void {
    try {
      localStorage.setItem(cle, JSON.stringify(valeur));
    } catch {
      /* ignore */
    }
  }
}
