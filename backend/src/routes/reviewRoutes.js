// src/routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const {
  createReview,
  getUserReviews,
  getReviewById,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const {
  createReviewValidation,
  idValidation,
  validate
} = require('../middleware/validationMiddleware');

/**
 * @route   POST /api/reviews
 * @desc    Créer un avis
 * @access  Private
 */
router.post('/', protect, createReviewValidation, validate, createReview);

/**
 * @route   GET /api/reviews/user/:userId
 * @desc    Obtenir les avis d'un utilisateur
 * @access  Public
 */
router.get('/user/:userId', getUserReviews);

/**
 * @route   GET /api/reviews/:id
 * @desc    Obtenir un avis par ID
 * @access  Public
 */
router.get('/:id', idValidation, validate, getReviewById);

/**
 * @route   PUT /api/reviews/:id
 * @desc    Mettre à jour un avis
 * @access  Private
 */
router.put('/:id', protect, idValidation, validate, updateReview);

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Supprimer un avis
 * @access  Private
 */
router.delete('/:id', protect, idValidation, validate, deleteReview);

module.exports = router;