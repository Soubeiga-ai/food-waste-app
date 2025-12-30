// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
  getUserById,
  updateProfile,
  updateAvatar,
  getUserDonations,
  getUserReviews,
  getUserStats
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');
const { idValidation, validate } = require('../middleware/validationMiddleware');

/**
 * @route   GET /api/users/:id
 * @desc    Obtenir le profil d'un utilisateur par ID
 * @access  Public
 */
router.get('/:id', idValidation, validate, getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Mettre à jour le profil de l'utilisateur
 * @access  Private
 */
router.put('/:id', protect, idValidation, validate, updateProfile);

/**
 * @route   PUT /api/users/:id/avatar
 * @desc    Mettre à jour l'avatar de l'utilisateur
 * @access  Private
 */
router.put('/:id/avatar', protect, idValidation, validate, uploadSingle('avatar'), updateAvatar);

/**
 * @route   GET /api/users/:id/donations
 * @desc    Obtenir les donations d'un utilisateur
 * @access  Public
 */
router.get('/:id/donations', idValidation, validate, getUserDonations);

/**
 * @route   GET /api/users/:id/reviews
 * @desc    Obtenir les avis d'un utilisateur
 * @access  Public
 */
router.get('/:id/reviews', idValidation, validate, getUserReviews);

/**
 * @route   GET /api/users/:id/stats
 * @desc    Obtenir les statistiques d'un utilisateur
 * @access  Public
 */
router.get('/:id/stats', idValidation, validate, getUserStats);

module.exports = router;