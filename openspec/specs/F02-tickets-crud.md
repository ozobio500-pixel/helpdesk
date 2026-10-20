# F02 — Gestion des tickets (CRUD)

## Modèle `Ticket`

- id, titre, description, priorite, statut, demandeur, technicien, dateCreation, echeance, historique[]

## Création

- Formulaire `/tickets/nouveau`  
- Priorités : basse, moyenne, haute, critique → échéance automatique  

## Lecture

- Liste `/tickets`, détail `/tickets/:id`  

## Modification

- `/tickets/:id/modifier` — titre, description, priorité ; demandeur figé  

## Suppression

- Admin uniquement, dialogue de confirmation  

## Persistance

- `localStorage` clé `helpdesk.tickets` — synchronisation via signal + `effect`  
