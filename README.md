# Helpdesk IT — Projet Angular (OpenSpec)

Application de gestion de tickets support informatique, réalisée dans le cadre du **Devoir 2 — OpenSpec avec Angular**.

## Fonctionnalités

- **Authentification** : inscription, connexion, déconnexion (mots de passe hashés SHA-256)
- **Rôles** : `administrateur` (gestion complète) et `demandeur` (ses tickets uniquement)
- **CRUD tickets** : création, détail, modification, suppression (admin)
- **Métier** : priorités, échéances SLA, statuts, affectation technicien, historique
- **Filtres + tri** sur la liste des tickets
- **Export CSV** (vue filtrée)
- **Tableau de bord** : compteurs, répartition priorités, alertes retard / non affectés
- **Toasts** de notification

## OpenSpec

La spécification fonctionnelle est dans le dossier [`openspec/`](./openspec/README.md).

## Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Administrateur | `admin@helpdesk.fr` | `Admin123!` |

Les nouveaux comptes via **Inscription** sont des **demandeurs**.

## Lancer en local

```bash
npm install
ng serve
```

Ouvrir `http://localhost:4200/` → redirection vers connexion si non authentifié.

## Build production

```bash
ng build
```

Sortie : `dist/helpdesk/browser/`

## Déploiement Vercel

1. Pousser le projet sur GitHub  
2. Importer le repo sur [vercel.com](https://vercel.com)  
3. Framework preset : **Angular** (ou build command `ng build`, output `dist/helpdesk/browser`)  
4. Le fichier `vercel.json` gère le routing SPA  

## Structure technique

- Angular 22, standalone components, signals  
- Angular Material  
- Persistance navigateur : `localStorage` (tickets, comptes), `sessionStorage` (session)

## Auteur

Projet helpdesk — remise devoir OpenSpec + Angular.
