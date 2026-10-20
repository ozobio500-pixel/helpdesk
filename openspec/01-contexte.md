# 1. Contexte

## Problème métier

Le service informatique reçoit des demandes d'assistance (pannes matérielles, accès réseau, logiciels, etc.). Sans outil centralisé, les demandes se perdent, les délais ne sont pas suivis et les techniciens ne savent pas quoi traiter en priorité.

## Objectif de l'application

Fournir une **application web Helpdesk** permettant de :

- enregistrer des tickets avec priorité et échéance automatique ;
- suivre le statut et l'affectation à un technicien ;
- consulter un **tableau de bord** (volumes, retards, non-affectés) ;
- **filtrer et exporter** la liste des tickets.

## Périmètre

- Frontend Angular (Material), données persistées côté navigateur (`localStorage`) pour la démo / déploiement Vercel sans backend dédié.
- Authentification locale avec mots de passe **hashés** (SHA-256, jamais en clair).

## Hors périmètre (v2)

- API REST distante, messagerie email, SLA contractuels multi-organisations.
