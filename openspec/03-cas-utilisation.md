# 3. Cas d'utilisation

## UC-01 — S'inscrire

- **Acteur** : visiteur  
- **Précondition** : non connecté  
- **Scénario** : saisie nom, email, mot de passe → compte `demandeur` → connexion automatique  
- **Postcondition** : session ouverte  

## UC-02 — Se connecter / se déconnecter

- **Acteur** : utilisateur enregistré  
- **Scénario nominal** : email + mot de passe → session ; bouton déconnexion → fin de session  

## UC-03 — Créer un ticket

- **Acteur** : administrateur ou demandeur  
- **Données** : titre, description, priorité, demandeur  
- **Règle** : échéance calculée selon priorité (7 j / 3 j / 24 h / 4 h)  
- **Postcondition** : ticket statut `ouvert`, historique « Création »  

## UC-04 — Consulter et filtrer les tickets

- **Acteur** : connecté  
- **Filtres** : titre, demandeur, statut, priorité (recherche partielle sur texte)  
- **Tri** : colonnes cliquables  

## UC-05 — Traiter un ticket (admin)

- Affecter un technicien, changer le statut, supprimer avec confirmation  

## UC-06 — Tableau de bord

- Compteurs par statut, barres par priorité, listes tickets en retard / non affectés  

## UC-07 — Exporter CSV

- Export des tickets **actuellement filtrés** (UTF-8, séparateur `;`)  
