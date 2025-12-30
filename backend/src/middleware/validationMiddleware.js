// src/middleware/validationMiddleware.js
const { body, param, query, validationResult } = require('express-validator');
const { sendError } = require('../utils/responseHelper');

/**
 * Middleware pour vérifier les résultats de validation
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg
    }));

    return sendError(res, 400, 'Erreur de validation', formattedErrors);
  }

  next();
};

// Validations pour l'authentification
const registerValidation = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('Le prénom est requis')
    .isLength({ min: 2 }).withMessage('Le prénom doit contenir au moins 2 caractères'),
  
  body('lastName')
    .trim()
    .notEmpty().withMessage('Le nom est requis')
    .isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis')
    .isEmail().withMessage('Email invalide')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Le mot de passe est requis')
    .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9+\s()-]+$/).withMessage('Numéro de téléphone invalide'),
  
  body('role')
    .optional()
    .isIn(['donor', 'beneficiary', 'both']).withMessage('Rôle invalide')
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis')
    .isEmail().withMessage('Email invalide')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Le mot de passe est requis')
];

// Validations pour les donations
const createDonationValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Le titre est requis')
    .isLength({ min: 3, max: 100 }).withMessage('Le titre doit contenir entre 3 et 100 caractères'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('La description est requise')
    .isLength({ min: 10, max: 1000 }).withMessage('La description doit contenir entre 10 et 1000 caractères'),
  
  body('category')
    .notEmpty().withMessage('La catégorie est requise')
    .isIn(['fruits', 'legumes', 'pain', 'produits_laitiers', 'viande', 'poisson', 'plats_prepares', 'patisseries', 'conserves', 'boissons', 'autre'])
    .withMessage('Catégorie invalide'),
  
  body('quantity')
    .notEmpty().withMessage('La quantité est requise')
    .isFloat({ min: 0.1 }).withMessage('La quantité doit être supérieure à 0'),
  
  body('unit')
    .notEmpty().withMessage('L\'unité est requise')
    .isIn(['kg', 'g', 'l', 'piece', 'portion', 'paquet']).withMessage('Unité invalide'),
  
  body('expiryDate')
    .notEmpty().withMessage('La date de péremption est requise')
    .isISO8601().withMessage('Date invalide')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('La date de péremption doit être dans le futur');
      }
      return true;
    }),
  
  body('pickupLocation.address')
    .trim()
    .notEmpty().withMessage('L\'adresse de retrait est requise'),
  
  body('pickupLocation.coordinates')
    .isArray({ min: 2, max: 2 }).withMessage('Les coordonnées doivent être un tableau [longitude, latitude]')
    .custom((value) => {
      if (!Array.isArray(value) || value.length !== 2) {
        throw new Error('Les coordonnées doivent contenir longitude et latitude');
      }
      if (typeof value[0] !== 'number' || typeof value[1] !== 'number') {
        throw new Error('Les coordonnées doivent être des nombres');
      }
      return true;
    })
];

// Validations pour les réservations
const createReservationValidation = [
  body('donationId')
    .notEmpty().withMessage('L\'ID de la donation est requis')
    .isMongoId().withMessage('ID de donation invalide'),
  
  body('pickupDate')
    .notEmpty().withMessage('La date de retrait est requise')
    .isISO8601().withMessage('Date invalide')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('La date de retrait doit être dans le futur');
      }
      return true;
    }),
  
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Le message ne peut pas dépasser 500 caractères')
];

// Validations pour les avis
const createReviewValidation = [
  body('reservationId')
    .notEmpty().withMessage('L\'ID de la réservation est requis')
    .isMongoId().withMessage('ID de réservation invalide'),
  
  body('rating')
    .notEmpty().withMessage('La note est requise')
    .isInt({ min: 1, max: 5 }).withMessage('La note doit être entre 1 et 5'),
  
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Le commentaire ne peut pas dépasser 500 caractères')
];

// Validation des paramètres ID
const idValidation = [
  param('id')
    .isMongoId().withMessage('ID invalide')
];

// Validation des query de pagination
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Le numéro de page doit être un entier positif'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('La limite doit être entre 1 et 100')
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  createDonationValidation,
  createReservationValidation,
  createReviewValidation,
  idValidation,
  paginationValidation
};