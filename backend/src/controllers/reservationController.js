// src/controllers/reservationController.js
const Reservation = require('../models/Reservation');
const Donation = require('../models/Donation');
const Notification = require('../models/Notification');
const { sendSuccess, sendError, handleError } = require('../utils/responseHelper');
const { SUCCESS_MESSAGES, ERROR_MESSAGES, DONATION_STATUS, RESERVATION_STATUS } = require('../config/constants');

/**
 * @desc    Créer une nouvelle réservation
 * @route   POST /api/reservations
 * @access  Private
 */
const createReservation = async (req, res) => {
  try {
    const { donationId, pickupDate, message } = req.body;

    // Vérifier que la donation existe
    const donation = await Donation.findById(donationId);

    if (!donation) {
      return sendError(res, 404, ERROR_MESSAGES.DONATION_NOT_FOUND);
    }

    // Vérifier que la donation est disponible
    if (donation.status !== DONATION_STATUS.AVAILABLE) {
      return sendError(res, 400, ERROR_MESSAGES.ALREADY_RESERVED);
    }

    // Vérifier que l'utilisateur n'est pas le donateur
    if (donation.donor.toString() === req.user._id.toString()) {
      return sendError(res, 400, 'Vous ne pouvez pas réserver votre propre don');
    }

    // Créer la réservation
    const reservation = await Reservation.create({
      donation: donationId,
      beneficiary: req.user._id,
      donor: donation.donor,
      pickupDate,
      message,
      status: RESERVATION_STATUS.PENDING
    });

    // Mettre à jour la donation
    donation.status = DONATION_STATUS.RESERVED;
    donation.reservedBy = req.user._id;
    donation.reservedAt = new Date();
    await donation.save();

    // Peupler les données
    await reservation.populate([
      { path: 'donation', select: 'title category quantity unit images' },
      { path: 'beneficiary', select: 'firstName lastName avatar phone' },
      { path: 'donor', select: 'firstName lastName avatar phone address' }
    ]);

    // Créer une notification pour le donateur
    await Notification.notifyNewReservation(reservation, donation.donor);

    sendSuccess(res, 201, SUCCESS_MESSAGES.RESERVATION_CREATED, { reservation });

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Obtenir les réservations de l'utilisateur connecté
 * @route   GET /api/reservations/my
 * @access  Private
 */
const getMyReservations = async (req, res) => {
  try {
    const { type = 'beneficiary' } = req.query; // 'beneficiary' ou 'donor'

    const filter = type === 'donor' 
      ? { donor: req.user._id }
      : { beneficiary: req.user._id };

    const reservations = await Reservation.find(filter)
      .populate('donation', 'title category quantity unit images expiryDate pickupLocation')
      .populate('beneficiary', 'firstName lastName avatar phone rating')
      .populate('donor', 'firstName lastName avatar phone address rating')
      .sort({ createdAt: -1 });

    sendSuccess(res, 200, 'Réservations récupérées avec succès', { 
      count: reservations.length,
      reservations 
    });

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Obtenir une réservation par ID
 * @route   GET /api/reservations/:id
 * @access  Private
 */
const getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('donation', 'title category quantity unit images expiryDate pickupLocation')
      .populate('beneficiary', 'firstName lastName avatar phone rating')
      .populate('donor', 'firstName lastName avatar phone address rating');

    if (!reservation) {
      return sendError(res, 404, ERROR_MESSAGES.RESERVATION_NOT_FOUND);
    }

    // Vérifier que l'utilisateur est impliqué dans la réservation
    const userId = req.user._id.toString();
    if (reservation.beneficiary._id.toString() !== userId && 
        reservation.donor._id.toString() !== userId) {
      return sendError(res, 403, ERROR_MESSAGES.UNAUTHORIZED);
    }

    sendSuccess(res, 200, 'Réservation récupérée avec succès', { reservation });

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Confirmer une réservation (par le donateur)
 * @route   PUT /api/reservations/:id/confirm
 * @access  Private
 */
const confirmReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return sendError(res, 404, ERROR_MESSAGES.RESERVATION_NOT_FOUND);
    }

    // Vérifier que l'utilisateur est le donateur
    if (reservation.donor.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Seul le donateur peut confirmer la réservation');
    }

    // Vérifier que la réservation est en attente
    if (reservation.status !== RESERVATION_STATUS.PENDING) {
      return sendError(res, 400, 'Cette réservation ne peut pas être confirmée');
    }

    // Confirmer la réservation
    await reservation.confirm();

    await reservation.populate([
      { path: 'donation', select: 'title category' },
      { path: 'beneficiary', select: 'firstName lastName avatar phone' }
    ]);

    // Notifier le bénéficiaire
    await Notification.notifyReservationConfirmed(reservation, reservation.beneficiary);

    sendSuccess(res, 200, 'Réservation confirmée avec succès', { reservation });

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Compléter une réservation
 * @route   PUT /api/reservations/:id/complete
 * @access  Private
 */
const completeReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return sendError(res, 404, ERROR_MESSAGES.RESERVATION_NOT_FOUND);
    }

    const userId = req.user._id.toString();

    // Vérifier que l'utilisateur est impliqué
    if (reservation.donor.toString() !== userId && 
        reservation.beneficiary.toString() !== userId) {
      return sendError(res, 403, ERROR_MESSAGES.UNAUTHORIZED);
    }

    // Vérifier que la réservation est confirmée
    if (reservation.status !== RESERVATION_STATUS.CONFIRMED) {
      return sendError(res, 400, 'Cette réservation ne peut pas être complétée');
    }

    // Compléter la réservation
    await reservation.complete();

    // Mettre à jour la donation
    await Donation.findByIdAndUpdate(reservation.donation, {
      status: DONATION_STATUS.COMPLETED,
      completedAt: new Date()
    });

    await reservation.populate([
      { path: 'donation', select: 'title category' },
      { path: 'beneficiary', select: 'firstName lastName' },
      { path: 'donor', select: 'firstName lastName' }
    ]);

    // Notifier l'autre partie
    const recipientId = userId === reservation.donor.toString() 
      ? reservation.beneficiary 
      : reservation.donor;
    await Notification.notifyReservationCompleted(reservation, recipientId);

    sendSuccess(res, 200, 'Réservation complétée avec succès', { reservation });

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Annuler une réservation
 * @route   PUT /api/reservations/:id/cancel
 * @access  Private
 */
const cancelReservation = async (req, res) => {
  try {
    const { reason } = req.body;
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return sendError(res, 404, ERROR_MESSAGES.RESERVATION_NOT_FOUND);
    }

    const userId = req.user._id.toString();

    // Vérifier que l'utilisateur est impliqué
    if (reservation.donor.toString() !== userId && 
        reservation.beneficiary.toString() !== userId) {
      return sendError(res, 403, ERROR_MESSAGES.UNAUTHORIZED);
    }

    // Vérifier que la réservation peut être annulée
    if (![RESERVATION_STATUS.PENDING, RESERVATION_STATUS.CONFIRMED].includes(reservation.status)) {
      return sendError(res, 400, 'Cette réservation ne peut pas être annulée');
    }

    // Annuler la réservation
    await reservation.cancel(reason);

    // Remettre la donation disponible
    await Donation.findByIdAndUpdate(reservation.donation, {
      status: DONATION_STATUS.AVAILABLE,
      reservedBy: null,
      reservedAt: null
    });

    // Notifier l'autre partie
    const recipientId = userId === reservation.donor.toString()
      ? reservation.beneficiary
      : reservation.donor;
    await Notification.notifyReservationCancelled(reservation, recipientId, req.user);

    sendSuccess(res, 200, 'Réservation annulée avec succès', { reservation });

  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  createReservation,
  getMyReservations,
  getReservationById,
  confirmReservation,
  completeReservation,
  cancelReservation
};