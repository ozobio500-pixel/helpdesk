# 2. Acteurs et rôles

| Acteur | Rôle technique | Description |
|--------|----------------|-------------|
| **Administrateur** | `administrateur` | Gère tous les tickets : affectation, statut, suppression, vue globale, export. |
| **Demandeur** | `demandeur` | Crée des tickets à son nom, consulte **uniquement ses** tickets, modifie tant que le statut est « ouvert ». |

## Matrice des droits (résumé)

| Action | Administrateur | Demandeur |
|--------|:--------------:|:---------:|
| Connexion / inscription / déconnexion | ✓ | ✓ |
| Créer un ticket | ✓ | ✓ (demandeur = son nom) |
| Voir tous les tickets | ✓ | ✗ (siens uniquement) |
| Modifier titre / description / priorité | ✓ | ✓ si ouvert et sien |
| Changer statut / affecter technicien | ✓ | ✗ |
| Supprimer un ticket | ✓ | ✗ |
| Tableau de bord | ✓ (global) | ✓ (ses tickets) |
| Filtres + tri + export CSV | ✓ | ✓ (sur sa vue) |
