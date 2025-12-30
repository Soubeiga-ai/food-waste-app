// src/routes/reservationRoutes.js
const express = require('express');
const router = express.Router();
const {
  createReservation,
  getMyReservations,
  getReservationById,
  confirmReservation,
  completeReservation,
  cancelReservation
} = require('../controllers/reservationController');
const { protect } = require('../middleware/authMiddleware');
const {
  createReservationValidation,
  idValidation,
  validate
} = require('../middleware/validationMiddleware');

/**
 * @route   POST /api/reservations
 * @desc    Créer une nouvelle réservation
 * @access  Private
 */
router.post('/', protect, createReservationValidation, validate, createReservation);

/**
 * @route   GET /api/reservations/my
 * @desc    Obtenir les réservations de l'utilisateur connecté
 * @access  Private
 */
router.get('/my', protect, getMyReservations);

/**
 * @route   GET /api/reservations/:id
 * @desc    Obtenir une réservation par ID
 * @access  Private
 */
router.get('/:id', protect, idValidation, validate, getReservationById);

/**
 * @route   PUT /api/reservations/:id/confirm
 * @desc    Confirmer une réservation (par le donateur)
 * @access  Private
 */
router.put('/:id/confirm', protect, idValidation, validate, confirmReservation);

/**
 * @route   PUT /api/reservations/:id/complete
 * @desc    Compléter une réservation
 * @access  Private
 */
router.put('/:id/complete', protect, idValidation, validate, completeReservation);

/**
 * @route   PUT /api/reservations/:id/cancel
 * @desc    Annuler une réservation
 * @access  Private
 */
router.put('/:id/cancel', protect, idValidation, validate, cancelReservation);

module.exports = router;