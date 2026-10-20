// --- Types de base ---
export type Priorite = 'basse' | 'moyenne' | 'haute' | 'critique';

export type Statut = 'ouvert' | 'en_cours' | 'resolu' | 'clos';

// --- Entrée d'historique ---
export interface HistoriqueEntry {
  date: string;        // ISO string
  auteur: string;
  action: string;
}

// --- Ticket ---
export interface Ticket {
  id: number;
  titre: string;
  description: string;
  priorite: Priorite;
  statut: Statut;
  demandeur: string;
  technicien: string | null;
  dateCreation: string;   // ISO string
  echeance: string;       // ISO string
  historique: HistoriqueEntry[];
}