// src/controllers/userController.js
const User = require('../models/User');
const Donation = require('../models/Donation');
const Review = require('../models/Review');
const { sendSuccess, sendError, handleError } = require('../utils/responseHelper');
const { SUCCESS_MESSAGES, ERROR_MESSAGES } = require('../config/constants');

/**
 * @desc    Obtenir le profil d'un utilisateur par ID
 * @route   GET /api/users/:id
 * @access  Public
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return sendError(res, 404, ERROR_MESSAGES.USER_NOT_FOUND);
    }

    sendSuccess(res, 200, 'Profil récupéré avec succès', { user });

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Mettre à jour le profil de l'utilisateur connecté
 * @route   PUT /api/users/:id
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, address } = req.body;

    // Vérifier que l'utilisateur modifie son propre profil
    if (req.params.id !== req.user._id.toString()) {
      return sendError(res, 403, ERROR_MESSAGES.NOT_OWNER);
    }

    // Mettre à jour l'utilisateur
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        firstName,
        lastName,
        phone,
        address
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return sendError(res, 404, ERROR_MESSAGES.USER_NOT_FOUND);
    }

    sendSuccess(res, 200, SUCCESS_MESSAGES.PROFILE_UPDATED, { user });

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Mettre à jour l'avatar de l'utilisateur
 * @route   PUT /api/users/:id/avatar
 * @access  Private
 */
const updateAvatar = async (req, res) => {
  try {
    // Vérifier que l'utilisateur modifie son propre profil
    if (req.params.id !== req.user._id.toString()) {
      return sendError(res, 403, ERROR_MESSAGES.NOT_OWNER);
    }

    if (!req.file) {
      return sendError(res, 400, 'Aucune image fournie');
    }

    // Construire l'URL de l'avatar
    const avatarUrl = `/uploads/${req.file.filename}`;

    // Mettre à jour l'utilisateur
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { avatar: avatarUrl },
      { new: true }
    );

    if (!user) {
      return sendError(res, 404, ERROR_MESSAGES.USER_NOT_FOUND);
    }

    sendSuccess(res, 200, 'Avatar mis à jour avec succès', { 
      user,
      avatarUrl 
    });

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Obtenir les donations d'un utilisateur
 * @route   GET /api/users/:id/donations
 * @access  Public
 */
const getUserDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.params.id })
      .populate('donor', 'firstName lastName avatar rating')
      .sort({ createdAt: -1 });

    sendSuccess(res, 200, 'Donations récupérées avec succès', { 
      count: donations.length,
      donations 
    });

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Obtenir les avis d'un utilisateur
 * @route   GET /api/users/:id/reviews
 * @access  Public
 */
const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.id })
      .populate('reviewer', 'firstName lastName avatar')
      .populate('donation', 'title')
      .sort({ createdAt: -1 });

    sendSuccess(res, 200, 'Avis récupérés avec succès', { 
      count: reviews.length,
      reviews 
    });

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Obtenir les statistiques d'un utilisateur
 * @route   GET /api/users/:id/stats
 * @access  Public
 */
const getUserStats = async (req, res) => {
  try {
    const userId = req.params.id;

    // Compter les donations
    const totalDonations = await Donation.countDocuments({ donor: userId });
    const completedDonations = await Donation.countDocuments({ 
      donor: userId, 
      status: 'completed' 
    });

    // Récupérer les infos de l'utilisateur
    const user = await User.findById(userId);

    if (!user) {
      return sendError(res, 404, ERROR_MESSAGES.USER_NOT_FOUND);
    }

    sendSuccess(res, 200, 'Statistiques récupérées avec succès', {
      stats: {
        totalDonations,
        completedDonations,
        rating: user.rating,
        memberSince: user.createdAt
      }
    });

  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getUserById,
  updateProfile,
  updateAvatar,
  getUserDonations,
  getUserReviews,
  getUserStats
};