# 🍎 Food Waste App

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Angular](https://img.shields.io/badge/Angular-19-red.svg)](https://angular.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-brightgreen.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

> 🌍 Plateforme web de lutte contre le gaspillage alimentaire - Connecte donateurs et bénéficiaires pour réduire le gaspillage et aider les personnes dans le besoin.

---

## 📖 À Propos

Food Waste App est une application web complète permettant de :
- 🍞 **Donner** des aliments non consommés plutôt que de les jeter
- 🤝 **Recevoir** des dons alimentaires gratuitement
- 🗺️ **Géolocaliser** les donations à proximité
- ⭐ **Évaluer** les donateurs et bénéficiaires
- 🔔 **Notifier** en temps réel les nouvelles donations

---

## ✨ Fonctionnalités

### 🎯 Gestion des Donations
- Création de donations avec photos (jusqu'à 5)
- Catégorisation (fruits, légumes, produits laitiers, etc.)
- Indication des quantités et dates d'expiration
- Statuts : disponible, réservée, récupérée, expirée

### 📍 Géolocalisation
- Carte interactive avec Leaflet
- Recherche par rayon (1-50 km)
- Visualisation des donations à proximité

### 🔐 Authentification & Profils
- Inscription donateur ou bénéficiaire
- Profils détaillés avec statistiques
- Système d'avis et de notation (1-5 étoiles)

### 📬 Réservations
- Système de réservation en temps réel
- Gestion des demandes (accepter/refuser)
- Historique complet

### 🔔 Notifications
- Alertes pour nouvelles donations
- Notifications de réservation
- Rappels avant expiration

---

## 🛠️ Technologies

### Backend
- **Node.js** + **Express.js** - API REST
- **MongoDB** + **Mongoose** - Base de données
- **JWT** - Authentification sécurisée
- **Multer** - Upload de photos
- **bcrypt** - Hashage des mots de passe

### Frontend
- **Angular 19** - Framework moderne
- **Angular Material** - Design UI/UX
- **Leaflet** - Cartes interactives
- **RxJS** - Programmation réactive

---

## 📦 Installation

### Prérequis
- Node.js 18+
- MongoDB 6+
- npm ou yarn

### 1️⃣ Cloner le Repository
```bash
git clone https://github.com/Soubeiga-ai/food-waste-app.git
cd food-waste-app
```

### 2️⃣ Backend
```bash
cd backend
npm install
cp .env.example .env
# Éditez .env avec vos configurations
npm start
```

Le backend démarre sur `http://localhost:3000`

### 3️⃣ Frontend
```bash
cd frontend
npm install
npm start
```

Le frontend démarre sur `http://localhost:4200`

### 4️⃣ Données de Test
```bash
cd backend
node seed.js
```

**Comptes de test :**
- **Donateur** : `jean.dupont@test.com` / `password123`
- **Bénéficiaire** : `marie.kabore@test.com` / `password123`

---

## 📚 Documentation

- [📖 Guide des Fonctionnalités](backend/docs/FONCTIONNALITES.md)
- [🔌 Documentation API](backend/docs/API.md)
- [⚙️ Guide d'Installation](backend/docs/INSTALLATION.md)

---

## 🧪 Tests API

Utilisez le fichier `backend/api-tests.rest` avec l'extension REST Client de VS Code.

---

## 🌍 Variables d'Environnement

Créez un fichier `.env` dans le dossier `backend/` :
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/food-waste-db
JWT_SECRET=votre_cle_secrete_ultra_securisee
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:4200
MAX_FILE_SIZE=5242880
```

---

## 📸 Screenshots

*(À ajouter prochainement)*

---

## 🗂️ Structure du Projet
```
food-waste-app/
├── backend/                # API Node.js + Express
│   ├── src/
│   │   ├── config/        # Configuration (DB, constants)
│   │   ├── controllers/   # Logique métier
│   │   ├── middleware/    # Auth, validation, upload
│   │   ├── models/        # Modèles Mongoose
│   │   ├── routes/        # Routes API
│   │   ├── utils/         # Helpers
│   │   └── uploads/       # Photos uploadées
│   ├── docs/              # Documentation
│   ├── seed.js            # Données de test
│   └── server.js          # Point d'entrée
│
└── frontend/              # Application Angular
    ├── src/
    │   ├── app/
    │   │   ├── core/      # Services, guards, interceptors
    │   │   ├── features/  # Composants par fonctionnalité
    │   │   ├── models/    # Interfaces TypeScript
    │   │   └── shared/    # Composants partagés
    │   └── environments/  # Configuration
    └── angular.json
```

---

## 🚀 Déploiement

### Backend (Heroku, Railway, Render)
```bash
# Exemple avec Heroku
heroku create food-waste-api
git push heroku main
```

### Frontend (Vercel, Netlify)
```bash
# Build de production
cd frontend
npm run build
# Déployez le dossier dist/
```

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m '✨ Add AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

---

## 📄 License

Ce projet est sous licence ISC. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 👤 Auteur

**SOUBEIGA Bénéwendé Sosthène Franklin**

- GitHub: [@Soubeiga-ai](https://github.com/Soubeiga-ai)
- Email: bsf.soubeiga@gmail.com

---

## 🙏 Remerciements

- Communauté MongoDB
- Équipe Angular
- Tous les contributeurs Open Source

---

## 📊 Statistiques

![GitHub repo size](https://img.shields.io/github/repo-size/Soubeiga-ai/food-waste-app)
![GitHub last commit](https://img.shields.io/github/last-commit/Soubeiga-ai/food-waste-app)
![GitHub issues](https://img.shields.io/github/issues/Soubeiga-ai/food-waste-app)

---

⭐ **Si ce projet vous plaît, n'hésitez pas à lui donner une étoile !**
