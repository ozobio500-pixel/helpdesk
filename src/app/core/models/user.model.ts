export type Role = 'administrateur' | 'demandeur';

/** Compte stocké (mot de passe = empreinte SHA-256, jamais en clair). */
export interface CompteUtilisateur {
  id: string;
  email: string;
  nom: string;
  role: Role;
  motDePasseHash: string;
}

/** Session active (sans hash). */
export interface UtilisateurConnecte {
  id: string;
  email: string;
  nom: string;
  role: Role;
}
