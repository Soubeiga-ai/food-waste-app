# 🍎 Food Waste App - Liste des Fonctionnalités

## 📱 Vue d'ensemble du projet

**Application de lutte contre le gaspillage alimentaire** permettant de connecter les donateurs (particuliers, restaurants, commerces) avec des bénéficiaires pour le partage de nourriture avant qu'elle ne soit gaspillée.

---

## 👥 Types d'utilisateurs

### 1. Donateurs
Personnes ou organisations qui souhaitent donner des aliments

### 2. Bénéficiaires
Personnes ou associations qui recherchent des dons alimentaires

### 3. Les deux (Mixte)
Utilisateurs pouvant être à la fois donateurs et bénéficiaires

---

## 🎯 Fonctionnalités Principales

### 🔐 Module Authentification

#### ✅ Inscription
- Formulaire d'inscription avec validation
- Champs requis : prénom, nom, email, téléphone, mot de passe
- Choix du rôle (donateur/bénéficiaire/les deux)
- Saisie de l'adresse complète avec géolocalisation
- Hash sécurisé du mot de passe (bcrypt)
- Génération automatique d'un token JWT

#### ✅ Connexion
- Authentification par email et mot de passe
- Génération de token JWT valide 7 jours
- Stockage sécurisé du token côté client
- Redirection automatique selon le rôle

#### ✅ Déconnexion
- Suppression du token JWT
- Redirection vers la page d'accueil
- Nettoyage des données en cache

#### ✅ Gestion du profil
- Consultation du profil utilisateur
- Modification des informations personnelles
- Upload et modification de l'avatar
- Changement de mot de passe sécurisé
- Visualisation des statistiques personnelles

---

### 🎁 Module Donations

#### ✅ Créer une donation
- Formulaire de création avec validation
- Champs : titre, description, catégorie, quantité, unité
- Upload de photos (jusqu'à 5 images)
- Sélection de la date de péremption
- Géolocalisation du point de retrait
- Statut initial : "disponible"

#### ✅ Lister les donations
- Affichage en grille avec cartes
- Pagination (10 items par page)
- Filtres disponibles :
  - Par catégorie (fruits, légumes, pain, plats préparés, etc.)
  - Par statut (disponible, réservé, complété, expiré)
  - Par distance géographique (rayon de recherche)
  - Recherche textuelle (titre, description)
- Tri par date de création ou de péremption

#### ✅ Détail d'une donation
- Informations complètes de la donation
- Photos en galerie
- Localisation sur carte interactive (Leaflet)
- Informations du donateur (avec note moyenne)
- Bouton de réservation (si bénéficiaire)
- Actions de modification/suppression (si propriétaire)

#### ✅ Mes donations
- Liste des donations créées par l'utilisateur
- Onglets par statut :
  - Disponibles
  - Réservées
  - Complétées
  - Expirées
- Actions : modifier, supprimer, voir les réservations

#### ✅ Modifier une donation
- Formulaire pré-rempli
- Modification de tous les champs
- Upload/suppression de photos
- Validation avant enregistrement

#### ✅ Supprimer une donation
- Confirmation avant suppression
- Vérification qu'aucune réservation active n'existe
- Suppression en cascade des données liées

#### ✅ Statistiques des donations
- Nombre total de donations créées
- Nombre de donations complétées
- Nombre de kg/portions donnés
- Historique des donations

---

### 📅 Module Réservations

#### ✅ Créer une réservation
- Sélection de la date/heure de retrait
- Message optionnel au donateur
- Vérification de disponibilité
- Notification automatique au donateur
- Changement du statut de la donation

#### ✅ Mes réservations (Bénéficiaire)
- Liste des réservations effectuées
- Filtres par statut :
  - En attente de confirmation
  - Confirmées
  - Complétées
  - Annulées
- Détails de chaque réservation
- Actions : annuler, contacter le donateur

#### ✅ Réservations reçues (Donateur)
- Liste des réservations pour mes donations
- Notification des nouvelles réservations
- Actions :
  - Confirmer une réservation
  - Marquer comme complétée
  - Refuser/annuler
- Coordonnées du bénéficiaire

#### ✅ Confirmer une réservation
- Validation par le donateur
- Notification au bénéficiaire
- Mise à jour du statut

#### ✅ Compléter une réservation
- Confirmation de la remise du don
- Changement de statut de la donation
- Possibilité de laisser un avis

#### ✅ Annuler une réservation
- Annulation par le donateur ou bénéficiaire
- Raison de l'annulation (optionnelle)
- Notification à l'autre partie
- Libération de la donation

---

### ⭐ Module Avis et Évaluations

#### ✅ Créer un avis
- Note de 1 à 5 étoiles
- Commentaire textuel
- Lié à une réservation complétée
- Un seul avis par réservation
- Validation anti-spam

#### ✅ Consulter les avis
- Liste des avis reçus par un utilisateur
- Affichage de la note moyenne
- Nombre total d'avis
- Commentaires avec date et auteur

#### ✅ Modifier un avis
- Modification de la note
- Modification du commentaire
- Possible uniquement par l'auteur

#### ✅ Supprimer un avis
- Suppression possible par l'auteur
- Recalcul automatique de la note moyenne

---

### 👤 Module Utilisateurs

#### ✅ Profil public
- Informations générales (nom, photo)
- Note moyenne et nombre d'avis
- Liste des donations actives
- Statistiques publiques
- Liste des avis reçus

#### ✅ Statistiques utilisateur
- Nombre de donations créées/reçues
- Nombre de kg/portions partagés
- Taux de complétion des réservations
- Note moyenne globale
- Impact environnemental estimé

---

### 📍 Module Géolocalisation

#### ✅ Carte interactive
- Affichage des donations sur une carte (Leaflet)
- Marqueurs cliquables avec aperçu
- Recherche par rayon géographique
- Calcul de la distance utilisateur-donation
- Navigation vers le point de retrait

#### ✅ Filtrage géographique
- Recherche dans un rayon défini
- Tri par distance croissante
- Affichage de la distance sur chaque carte

---

### 🔔 Module Notifications

#### ✅ Notifications en temps réel
- Toast notifications (ngx-toastr)
- Types de notifications :
  - Nouvelle réservation reçue
  - Réservation confirmée
  - Réservation annulée
  - Réservation complétée
  - Nouvel avis reçu
  - Donation bientôt expirée

---

### 📊 Module Tableau de bord

#### ✅ Dashboard donateur
- Statistiques de donations
- Réservations en attente
- Graphiques d'activité
- Impact environnemental

#### ✅ Dashboard bénéficiaire
- Réservations actives
- Historique des dons reçus
- Statistiques personnelles
- Suggestions de donations à proximité

---

## 🛠️ Fonctionnalités Techniques

### ✅ Sécurité
- Authentification JWT
- Hash des mots de passe (bcrypt)
- Protection des routes (guards Angular)
- Validation des données (backend + frontend)
- Protection CORS
- Sanitization des inputs

### ✅ Performance
- Pagination des listes
- Lazy loading des images
- Compression des images uploadées
- Cache des données fréquentes
- Indexation MongoDB pour les recherches géographiques

### ✅ UX/UI
- Design responsive (mobile-first)
- Angular Material Design
- Animations et transitions fluides
- Feedback visuel immédiat
- Messages d'erreur clairs
- Loading indicators

### ✅ Validation
- Validation côté client (Angular Reactive Forms)
- Validation côté serveur (Express validators)
- Messages d'erreur personnalisés
- Vérification des formats (email, téléphone, dates)

---

## 📈 Fonctionnalités Bonus Implémentées

### ✅ Upload d'images
- Support multi-images (jusqu'à 5)
- Formats acceptés : JPEG, PNG, WebP
- Limite de taille : 5MB par image
- Prévisualisation avant upload
- Compression automatique

### ✅ Recherche avancée
- Recherche full-text
- Filtres combinables
- Recherche géographique
- Tri multiple

### ✅ Gestion automatique des statuts
- Passage automatique à "expiré" après la date
- Mise à jour automatique lors des réservations
- Vérification de cohérence

---

## 🔄 Workflows Principaux

### Workflow 1 : Création et don
1. Donateur crée un compte
2. Donateur publie une donation
3. Bénéficiaire recherche des dons
4. Bénéficiaire réserve un don
5. Donateur confirme la réservation
6. Rencontre physique
7. Donateur marque comme complété
8. Échange d'avis mutuels

### Workflow 2 : Annulation
1. Réservation créée
2. Une partie annule avec raison
3. Notification à l'autre partie
4. Donation redevient disponible
5. Historique conservé

---

## 📊 Métriques et Statistiques

### Métriques utilisateur
- Nombre de donations créées/reçues
- Taux de complétion
- Note moyenne
- Quantité totale partagée
- Impact CO2 économisé (estimé)

### Métriques système
- Nombre d'utilisateurs actifs
- Nombre de donations actives
- Taux de réservation
- Catégories les plus populaires
- Zones géographiques actives

---

## 🎨 Catégories de produits

- 🍎 Fruits
- 🥕 Légumes
- 🍞 Pain et viennoiseries
- 🍕 Plats préparés
- 🥛 Produits laitiers
- 🥩 Viandes et poissons
- 🥫 Conserves
- 🍪 Produits secs
- 🍰 Pâtisseries
- ☕ Boissons
- 🌾 Autres

---

## 📱 Compatibilité

- ✅ Responsive design (mobile, tablette, desktop)
- ✅ Navigateurs modernes (Chrome, Firefox, Safari, Edge)
- ✅ Progressive Web App ready
- ✅ Accessibilité WCAG 2.1 niveau AA

---

## 🔐 Rôles et Permissions

### Donateur peut :
- Créer, modifier, supprimer ses donations
- Voir toutes les donations
- Gérer les réservations sur ses donations
- Laisser des avis aux bénéficiaires

### Bénéficiaire peut :
- Voir toutes les donations
- Réserver des donations
- Gérer ses réservations
- Laisser des avis aux donateurs

### Utilisateur mixte peut :
- Toutes les permissions des deux rôles

---

## 📦 Technologies Utilisées

**Backend :**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT pour l'authentification
- Multer pour l'upload
- Bcrypt pour le hash

**Frontend :**
- Angular 19 (Standalone components)
- Angular Material
- Leaflet pour les cartes
- ngx-toastr pour les notifications
- RxJS pour la gestion d'état

---

## 🎯 Objectifs Atteints

✅ Réduction du gaspillage alimentaire
✅ Connexion donateurs-bénéficiaires
✅ Géolocalisation des dons
✅ Système de confiance (avis)
✅ Interface intuitive
✅ Sécurité des données
✅ Performance optimale
✅ Expérience utilisateur fluide