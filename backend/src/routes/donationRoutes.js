// src/routes/donationRoutes.js
const express = require('express');
const router = express.Router();
const {
  createDonation,
  getDonations,
  getDonationById,
  updateDonation,
  deleteDonation,
  getMyDonations
} = require('../controllers/donationController');
const { protect } = require('../middleware/authMiddleware');
// const { uploadMultiple } = require('../middleware/uploadMiddleware'); // COMMENTÉ
const {
  createDonationValidation,
  idValidation,
  paginationValidation,
  validate
} = require('../middleware/validationMiddleware');

/**
 * @route   GET /api/donations
 * @desc    Obtenir toutes les donations avec filtres
 * @access  Public
 */
router.get('/', paginationValidation, validate, getDonations);

/**
 * @route   GET /api/donations/my
 * @desc    Obtenir les donations de l'utilisateur connecté
 * @access  Private
 */
router.get('/my', protect, getMyDonations);

/**
 * @route   GET /api/donations/:id
 * @desc    Obtenir une donation par ID
 * @access  Public
 */
router.get('/:id', idValidation, validate, getDonationById);

/**
 * @route   POST /api/donations
 * @desc    Créer une nouvelle donation
 * @access  Private
 */
router.post(
  '/',
  protect,
  // uploadMultiple('images', 5), // COMMENTÉ - pas d'images pour l'instant
  createDonationValidation,
  validate,
  createDonation
);

/**
 * @route   PUT /api/donations/:id
 * @desc    Mettre à jour une donation
 * @access  Private
 */
router.put('/:id', protect, idValidation, validate, updateDonation);

/**
 * @route   DELETE /api/donations/:id
 * @desc    Supprimer une donation
 * @access  Private
 */
router.delete('/:id', protect, idValidation, validate, deleteDonation);

module.exports = router;