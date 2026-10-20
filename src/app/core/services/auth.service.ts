import { Injectable, computed, signal } from '@angular/core';
import {
  CompteUtilisateur,
  Role,
  UtilisateurConnecte,
} from '../models/user.model';

const CLE_COMPTES = 'helpdesk.comptes';
const CLE_SESSION = 'helpdesk.session';

const ADMIN_EMAIL = 'admin@helpdesk.fr';
const ADMIN_MOT_DE_PASSE = 'Admin123!';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _session = signal<UtilisateurConnecte | null>(this.chargerSession());

  readonly session = this._session.asReadonly();
  readonly estConnecte = computed(() => this._session() !== null);
  readonly estAdministrateur = computed(
    () => this._session()?.role === 'administrateur'
  );
  readonly utilisateur = computed(() => this._session());

  constructor() {
    void this.initialiserCompteAdmin();
  }

  async inscrire(
    email: string,
    nom: string,
    motDePasse: string,
    role: Role = 'demandeur'
  ): Promise<{ ok: true } | { ok: false; message: string }> {
    const mail = email.trim().toLowerCase();
    const displayName = nom.trim();
    if (!mail || !displayName || motDePasse.length < 6) {
      return { ok: false, message: 'Email, nom et mot de passe (6 car. min.) requis.' };
    }

    const comptes = this.chargerComptes();
    if (comptes.some(c => c.email === mail)) {
      return { ok: false, message: 'Un compte existe déjà avec cet email.' };
    }

    const hash = await this.hasherMotDePasse(mail, motDePasse);
    const nouveau: CompteUtilisateur = {
      id: crypto.randomUUID(),
      email: mail,
      nom: displayName,
      role,
      motDePasseHash: hash,
    };
    comptes.push(nouveau);
    this.sauvegarderComptes(comptes);
    this.connecterSession(this.versSession(nouveau));
    return { ok: true };
  }

  async connecter(
    email: string,
    motDePasse: string
  ): Promise<{ ok: true } | { ok: false; message: string }> {
    const mail = email.trim().toLowerCase();
    const compte = this.chargerComptes().find(c => c.email === mail);
    if (!compte) {
      return { ok: false, message: 'Email ou mot de passe incorrect.' };
    }
    const hash = await this.hasherMotDePasse(mail, motDePasse);
    if (hash !== compte.motDePasseHash) {
      return { ok: false, message: 'Email ou mot de passe incorrect.' };
    }
    this.connecterSession(this.versSession(compte));
    return { ok: true };
  }

  deconnecter(): void {
    this._session.set(null);
    sessionStorage.removeItem(CLE_SESSION);
  }

  private versSession(compte: CompteUtilisateur): UtilisateurConnecte {
    return {
      id: compte.id,
      email: compte.email,
      nom: compte.nom,
      role: compte.role,
    };
  }

  private connecterSession(session: UtilisateurConnecte): void {
    this._session.set(session);
    sessionStorage.setItem(CLE_SESSION, JSON.stringify(session));
  }

  private chargerSession(): UtilisateurConnecte | null {
    try {
      const brut = sessionStorage.getItem(CLE_SESSION);
      return brut ? (JSON.parse(brut) as UtilisateurConnecte) : null;
    } catch {
      return null;
    }
  }

  private chargerComptes(): CompteUtilisateur[] {
    try {
      const brut = localStorage.getItem(CLE_COMPTES);
      return brut ? (JSON.parse(brut) as CompteUtilisateur[]) : [];
    } catch {
      return [];
    }
  }

  private sauvegarderComptes(comptes: CompteUtilisateur[]): void {
    localStorage.setItem(CLE_COMPTES, JSON.stringify(comptes));
  }

  private async initialiserCompteAdmin(): Promise<void> {
    const comptes = this.chargerComptes();
    if (comptes.some(c => c.email === ADMIN_EMAIL)) return;

    const hash = await this.hasherMotDePasse(ADMIN_EMAIL, ADMIN_MOT_DE_PASSE);
    comptes.push({
      id: crypto.randomUUID(),
      email: ADMIN_EMAIL,
      nom: 'Administrateur',
      role: 'administrateur',
      motDePasseHash: hash,
    });
    this.sauvegarderComptes(comptes);
  }

  /** SHA-256(email + mot de passe) — pas de stockage en clair. */
  private async hasherMotDePasse(
    email: string,
    motDePasse: string
  ): Promise<string> {
    const data = new TextEncoder().encode(`${email}:${motDePasse}`);
    const buffer = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(buffer)]
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}
