// src/controllers/reviewController.js
const Review = require('../models/Review');
const Reservation = require('../models/Reservation');
const { sendSuccess, sendError, handleError } = require('../utils/responseHelper');
const { SUCCESS_MESSAGES, ERROR_MESSAGES, RESERVATION_STATUS } = require('../config/constants');

/**
 * @desc    Créer un avis
 * @route   POST /api/reviews
 * @access  Private
 */
const createReview = async (req, res) => {
  try {
    const { reservationId, rating, comment } = req.body;

    // Vérifier que la réservation existe
    const reservation = await Reservation.findById(reservationId)
      .populate('donation');

    if (!reservation) {
      return sendError(res, 404, ERROR_MESSAGES.RESERVATION_NOT_FOUND);
    }

    // Vérifier que la réservation est complétée
    if (reservation.status !== RESERVATION_STATUS.COMPLETED) {
      return sendError(res, 400, 'Vous ne pouvez laisser un avis que sur une réservation complétée');
    }

    const userId = req.user._id.toString();

    // Vérifier que l'utilisateur est impliqué dans la réservation
    if (reservation.donor.toString() !== userId && 
        reservation.beneficiary.toString() !== userId) {
      return sendError(res, 403, ERROR_MESSAGES.UNAUTHORIZED);
    }

    // Déterminer qui est évalué (l'autre partie)
    const revieweeId = reservation.donor.toString() === userId 
      ? reservation.beneficiary 
      : reservation.donor;

    // Vérifier qu'un avis n'existe pas déjà
    const existingReview = await Review.findOne({
      reviewer: userId,
      reservation: reservationId
    });

    if (existingReview) {
      return sendError(res, 400, 'Vous avez déjà laissé un avis pour cette réservation');
    }

    // Créer l'avis
    const review = await Review.create({
      reviewer: userId,
      reviewee: revieweeId,
      donation: reservation.donation._id,
      reservation: reservationId,
      rating,
      comment
    });

    await review.populate([
      { path: 'reviewer', select: 'firstName lastName avatar' },
      { path: 'reviewee', select: 'firstName lastName avatar' },
      { path: 'donation', select: 'title' }
    ]);

    sendSuccess(res, 201, SUCCESS_MESSAGES.REVIEW_CREATED, { review });

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Obtenir les avis d'un utilisateur
 * @route   GET /api/reviews/user/:userId
 * @access  Public
 */
const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'firstName lastName avatar')
      .populate('donation', 'title category')
      .sort({ createdAt: -1 });

    // Calculer les statistiques
    const stats = {
      total: reviews.length,
      average: reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0,
      distribution: {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length
      }
    };

    sendSuccess(res, 200, 'Avis récupérés avec succès', { 
      stats,
      reviews 
    });

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Obtenir un avis par ID
 * @route   GET /api/reviews/:id
 * @access  Public
 */
const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('reviewer', 'firstName lastName avatar')
      .populate('reviewee', 'firstName lastName avatar')
      .populate('donation', 'title category')
      .populate('reservation');

    if (!review) {
      return sendError(res, 404, 'Avis non trouvé');
    }

    sendSuccess(res, 200, 'Avis récupéré avec succès', { review });

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Mettre à jour un avis
 * @route   PUT /api/reviews/:id
 * @access  Private
 */
const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return sendError(res, 404, 'Avis non trouvé');
    }

    // Vérifier que l'utilisateur est l'auteur de l'avis
    if (review.reviewer.toString() !== req.user._id.toString()) {
      return sendError(res, 403, ERROR_MESSAGES.NOT_OWNER);
    }

    // Mettre à jour l'avis
    review.rating = rating || review.rating;
    review.comment = comment !== undefined ? comment : review.comment;
    await review.save();

    await review.populate([
      { path: 'reviewer', select: 'firstName lastName avatar' },
      { path: 'reviewee', select: 'firstName lastName avatar' },
      { path: 'donation', select: 'title' }
    ]);

    sendSuccess(res, 200, 'Avis mis à jour avec succès', { review });

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Supprimer un avis
 * @route   DELETE /api/reviews/:id
 * @access  Private
 */
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return sendError(res, 404, 'Avis non trouvé');
    }

    // Vérifier que l'utilisateur est l'auteur de l'avis
    if (review.reviewer.toString() !== req.user._id.toString()) {
      return sendError(res, 403, ERROR_MESSAGES.NOT_OWNER);
    }

    await review.deleteOne();

    sendSuccess(res, 200, 'Avis supprimé avec succès');

  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  createReview,
  getUserReviews,
  getReviewById,
  updateReview,
  deleteReview
};