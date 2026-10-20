# 4. Exigences communes du devoir — traçabilité

| Exigence | Implémentation dans le projet |
|----------|------------------------------|
| Authentification (inscription, connexion, déconnexion, MDP sécurisé) | `AuthService`, pages `/connexion`, `/inscription`, hash SHA-256 |
| Gestion des rôles (2 profils, droits différents) | `administrateur` / `demandeur`, garde `authGuard`, UI conditionnelle |
| CRUD entités principales | Tickets : créer, lire, modifier, supprimer (`TicketService`) |
| Module métier spécifique | Cycle de vie ticket : priorité, échéance, statut, historique, affectation |
| Recherche et filtres | Liste tickets : autocomplete + selects, tri colonnes |
| Tableau de bord | `/tableau-de-bord` : KPI + graphiques barres |
| OpenSpec | Dossier `openspec/` (ce document) |
| Git + déploiement Vercel | Repo Git + `vercel.json` (SPA) |
