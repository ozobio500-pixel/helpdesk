# F01 — Authentification

## Objectif

Permettre l'inscription, la connexion et la déconnexion avec stockage sécurisé des mots de passe.

## Spécification

- **Entrées** : email (unique), nom, mot de passe (≥ 6 caractères).  
- **Stockage compte** : `localStorage` clé `helpdesk.comptes` — champs `motDePasseHash` uniquement.  
- **Hash** : SHA-256 sur `email:motDePasse` via Web Crypto API.  
- **Session** : `sessionStorage` clé `helpdesk.session` (nom, email, rôle, id).  
- **Compte seed** : `admin@helpdesk.fr` / `Admin123!` (administrateur), créé si aucun compte admin.  
- **Routes publiques** : `/connexion`, `/inscription` (redirection si déjà connecté).  
- **Routes protégées** : `authGuard` sur tickets et tableau de bord.

## Critères d'acceptation

- [ ] Impossible d'accéder à `/tickets` sans session  
- [ ] Mot de passe jamais visible en clair dans le stockage  
- [ ] Déconnexion efface la session  
