# Système de Gestion de Réservations Hôtelières

Ce projet est une API REST développée avec Node.js permettant de gérer les réservations, l'attribution des chambres, la facturation des services de restauration et le suivi de la comptabilité.

## Architecture

L'application suit une architecture en couches (Layered Architecture) pour assurer une séparation claire des responsabilités :

* **App / Routes** : Point d'entrée de l'application et définition des points de terminaison (endpoints) via Express.
* **Controllers** : Gestion de la logique de requête/réponse, extraction des paramètres et gestion des codes de statut HTTP.
* **Services** : Contient la logique métier (validation de disponibilité, calculs, règles spécifiques).
* **Repositories** : Couche d'accès aux données gérant les requêtes SQL vers la base de données.
* **Database** : Configuration et initialisation de la base de données SQLite.

## Technologies utilisées

* **Runtime** : Node.js
* **Framework Web** : Express.js
* **Base de données** : SQLite
* **Connecteur DB** : @databases/sqlite
* **Gestionnaire de paquets** : pnpm

## Installation

1.  Cloner le dépôt du projet.
2.  Installer les dépendances :
    ```bash
    pnpm install
    ```
3.  Lancer le serveur :
    ```bash
    node app.js
    ```
    Le serveur sera accessible sur `http://localhost:3000`.

## Fonctionnalités et API

L'ensemble des routes est préfixé par `/api`.

### Réservations
* **Créer une réservation** : `POST /api/reservations`
    * Corps de la requête : `{ "client_name": "Nom du client" }`
    * Définit automatiquement le statut à 'PAYÉ' avec un montant fixe si une chambre est disponible.
* **Attribuer une chambre** : `PATCH /api/reservations/:id/attribuer`
    * Assigne une chambre aléatoire à une réservation existante et passe le statut à 'OCCUPÉ'.

### Services et Maintenance
* **Ajouter un repas** : `POST /api/reservations/:id/restaurant`
    * Corps de la requête : `{ "montant": 50 }`
    * Incrémente le montant total de la facture du client.
* **Nettoyer une chambre** : `POST /api/chambres/:id/nettoyer`
    * Met à jour le stock de consommables (savons) en base de données.

### Administration
* **Dashboard comptable** : `GET /api/comptabilite/dashboard`
    * Retourne le chiffre d'affaires total et le nombre total de réservations enregistrées.

## Schéma de données

La base de données SQLite comporte deux tables principales :
* **reservations** : Stocke les informations clients, le statut (EN_ATTENTE, PAYÉ, OCCUPÉ), le numéro de chambre et le total de la facture.
* **stocks** : Gère les articles de maintenance (ex: quantité de savon disponible).