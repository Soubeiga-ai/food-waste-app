# 🍎 Food Waste API - Backend

API REST pour l'application de lutte contre le gaspillage alimentaire.

## 📋 Description

Cette API permet de gérer :
- ✅ Authentification des utilisateurs (inscription, connexion)
- ✅ Gestion des donations alimentaires
- ✅ Système de réservation
- ✅ Avis et évaluations
- ✅ Profils utilisateurs

## 🛠️ Technologies utilisées

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM MongoDB
- **JWT** - Authentification par tokens
- **Bcrypt** - Hachage des mots de passe
- **Multer** - Upload de fichiers

## 📦 Installation

### Prérequis
- Node.js (v14+)
- MongoDB (local ou Atlas)
- npm ou yarn

### Étapes d'installation

```bash
# 1. Cloner le projet
git clone <url-du-repo>
cd backend

# 2. Installer les dépendances
npm install

# 3. Créer le fichier .env
cp .env.example .env

# 4. Configurer les variables d'environnement
# Ouvrir .env et modifier les valeurs

# 5. Démarrer le serveur
npm run dev
```

## ⚙️ Configuration (.env)

```env
NODE_ENV=development
PORT=3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/food-waste-db

# JWT
JWT_SECRET=votre_cle_secrete_ultra_securisee
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=http://localhost:4200

# Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg,image/webp
```

## 🚀 Démarrage

```bash
# Mode développement (avec nodemon)
npm run dev

# Mode production
npm start
```

Le serveur démarre sur `http://localhost:3000`

## 📡 Endpoints API

### Authentification (`/api/auth`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/register` | Inscription | Non |
| POST | `/login` | Connexion | Non |
| GET | `/me` | Profil connecté | Oui |
| POST | `/logout` | Déconnexion | Oui |
| PUT | `/update-password` | Changer mot de passe | Oui |

### Utilisateurs (`/api/users`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/:id` | Profil utilisateur | Non |
| PUT | `/:id` | Modifier profil | Oui |
| PUT | `/:id/avatar` | Modifier avatar | Oui |
| GET | `/:id/donations` | Donations d'un user | Non |
| GET | `/:id/reviews` | Avis d'un user | Non |
| GET | `/:id/stats` | Statistiques | Non |

### Donations (`/api/donations`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/` | Liste avec filtres | Non |
| GET | `/my` | Mes donations | Oui |
| GET | `/:id` | Détail | Non |
| POST | `/` | Créer | Oui |
| PUT | `/:id` | Modifier | Oui |
| DELETE | `/:id` | Supprimer | Oui |

#### Filtres disponibles pour GET `/donations`
- `page` - Numéro de page (défaut: 1)
- `limit` - Nombre d'éléments par page (défaut: 10)
- `category` - Catégorie de produit
- `status` - Statut (available, reserved, completed, expired)
- `search` - Recherche textuelle
- `longitude` & `latitude` - Recherche géographique
- `maxDistance` - Distance maximale en mètres (défaut: 10000)

### Réservations (`/api/reservations`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/` | Créer | Oui |
| GET | `/my` | Mes réservations | Oui |
| GET | `/:id` | Détail | Oui |
| PUT | `/:id/confirm` | Confirmer | Oui |
| PUT | `/:id/complete` | Compléter | Oui |
| PUT | `/:id/cancel` | Annuler | Oui |

### Avis (`/api/reviews`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/` | Créer | Oui |
| GET | `/user/:userId` | Avis d'un user | Non |
| GET | `/:id` | Détail | Oui |
| PUT | `/:id` | Modifier | Oui |
| DELETE | `/:id` | Supprimer | Oui |

## 🧪 Tests

Utilisez le fichier `api-tests.rest` avec l'extension REST Client de VS Code.

```bash
# Ouvrir api-tests.rest dans VS Code
# Cliquer sur "Send Request" au-dessus de chaque requête
```

## 📁 Structure du projet

```
backend/
├── src/
│   ├── config/          # Configuration (DB, constantes)
│   ├── models/          # Modèles Mongoose
│   ├── controllers/     # Logique métier
│   ├── routes/          # Définition des routes
│   ├── middleware/      # Middlewares (auth, upload, validation)
│   ├── utils/           # Fonctions utilitaires
│   └── uploads/         # Fichiers uploadés
├── .env                 # Variables d'environnement
├── .gitignore
├── server.js            # Point d'entrée
├── package.json
└── README.md
```

## 🔐 Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification.

### Format du token dans les headers
```
Authorization: Bearer <votre_token_jwt>
```

### Obtenir un token
1. Inscription : `POST /api/auth/register`
2. Connexion : `POST /api/auth/login`
3. Le token est retourné dans la réponse
4. Utiliser ce token pour les routes protégées

## 📝 Modèles de données

### User
```javascript
{
  firstName, lastName, email, password,
  phone, role, address, avatar,
  rating: { average, count }
}
```

### Donation
```javascript
{
  donor, title, description, category,
  quantity, unit, expiryDate, images,
  pickupLocation: { address, coordinates },
  status, reservedBy, views
}
```

### Reservation
```javascript
{
  donation, beneficiary, donor,
  status, pickupDate, message,
  confirmedAt, completedAt
}
```

### Review
```javascript
{
  reviewer, reviewee, donation,
  reservation, rating, comment
}
```

## 🐛 Gestion des erreurs

Toutes les réponses suivent ce format :

**Succès :**
```json
{
  "success": true,
  "message": "Message de succès",
  "data": { ... }
}
```

**Erreur :**
```json
{
  "success": false,
  "message": "Message d'erreur",
  "errors": [ ... ]
}
```

## 👨‍💻 Auteur

**SOUBEIGA Bénéwendé Sosthène Franklin**

## 📄 Licence

ISC