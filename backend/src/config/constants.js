// src/config/constants.js

// Rôles utilisateurs
const USER_ROLES = {
  DONOR: 'donor',
  BENEFICIARY: 'beneficiary',
  BOTH: 'both',
  ADMIN: 'admin'
};

// Catégories de produits alimentaires
const FOOD_CATEGORIES = {
  FRUITS: 'fruits',
  VEGETABLES: 'legumes',
  BREAD: 'pain',
  DAIRY: 'produits_laitiers',
  MEAT: 'viande',
  FISH: 'poisson',
  PREPARED_MEALS: 'plats_prepares',
  PASTRIES: 'patisseries',
  CANNED: 'conserves',
  BEVERAGES: 'boissons',
  OTHER: 'autre'
};

// Unités de mesure
const UNITS = {
  KG: 'kg',
  GRAM: 'g',
  LITER: 'l',
  PIECE: 'piece',
  PORTION: 'portion',
  PACK: 'paquet'
};

// Statuts des donations
const DONATION_STATUS = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
};

// Statuts des réservations
const RESERVATION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Messages de succès
const SUCCESS_MESSAGES = {
  REGISTER: 'Inscription réussie',
  LOGIN: 'Connexion réussie',
  LOGOUT: 'Déconnexion réussie',
  DONATION_CREATED: 'Don créé avec succès',
  DONATION_UPDATED: 'Don mis à jour avec succès',
  DONATION_DELETED: 'Don supprimé avec succès',
  RESERVATION_CREATED: 'Réservation créée avec succès',
  RESERVATION_UPDATED: 'Réservation mise à jour avec succès',
  PROFILE_UPDATED: 'Profil mis à jour avec succès',
  REVIEW_CREATED: 'Avis publié avec succès'
};

// Messages d'erreur
const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
  EMAIL_EXISTS: 'Cet email est déjà utilisé',
  USER_NOT_FOUND: 'Utilisateur non trouvé',
  UNAUTHORIZED: 'Non autorisé',
  TOKEN_INVALID: 'Token invalide ou expiré',
  DONATION_NOT_FOUND: 'Don non trouvé',
  RESERVATION_NOT_FOUND: 'Réservation non trouvée',
  ALREADY_RESERVED: 'Ce don est déjà réservé',
  NOT_OWNER: 'Vous n\'êtes pas le propriétaire de cette ressource',
  INVALID_INPUT: 'Données invalides',
  SERVER_ERROR: 'Erreur serveur'
};

module.exports = {
  USER_ROLES,
  FOOD_CATEGORIES,
  UNITS,
  DONATION_STATUS,
  RESERVATION_STATUS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES
};