// src/controllers/donationController.js
const Donation = require('../models/Donation');
const { 
  sendSuccess, 
  sendError, 
  sendPaginated, 
  handleError 
} = require('../utils/responseHelper');

const { 
  SUCCESS_MESSAGES, 
  ERROR_MESSAGES, 
  DONATION_STATUS 
} = require('../config/constants');

/**
 * @desc    Créer une nouvelle donation
 * @route   POST /api/donations
 * @access  Private
 */
const createDonation = async (req, res) => {
  try {
    console.log("📥 Body reçu :", req.body);

    const { 
      title, 
      description, 
      category, 
      quantity, 
      unit, 
      expiryDate, 
      pickupLocation 
    } = req.body;

    if (!pickupLocation || !pickupLocation.address || !pickupLocation.coordinates) {
      return sendError(res, 400, "pickupLocation est invalide");
    }

    console.log("📌 Coordonnées reçues :", pickupLocation.coordinates);

    // Création du don
    const donation = await Donation.create({
      donor: req.user._id,
      title,
      description,
      category,
      quantity,
      unit,
      expiryDate,
      images: [], // images désactivées pour le moment
      pickupLocation: {
        address: pickupLocation.address,
        coordinates: [
          Number(pickupLocation.coordinates[0]),
          Number(pickupLocation.coordinates[1])
        ]
      },
      status: DONATION_STATUS.AVAILABLE
    });

    await donation.populate('donor', 'firstName lastName avatar rating');

    return sendSuccess(res, 201, SUCCESS_MESSAGES.DONATION_CREATED, { donation });

  } catch (err) {
    console.error("❌ ERREUR CRÉATION DONATION :", err);

    // 🌍 Erreurs mongoose (validation)
    if (err.name === "ValidationError") {
      console.log("❌ Validation mongoose :", err.errors);

      return res.status(400).json({
        success: false,
        message: "Erreur de validation",
        details: err.errors
      });
    }

    return handleError(res, err);
  }
};

/**
 * @desc    Obtenir toutes les donations
 * @route   GET /api/donations
 * @access  Public
 */
const getDonations = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      status, 
      search 
    } = req.query;

    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    filter.expiryDate = { $gt: new Date() };

    const skip = (page - 1) * limit;

    const donations = await Donation.find(filter)
      .populate('donor', 'firstName lastName avatar rating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalItems = await Donation.countDocuments(filter);

    const pagination = {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
      itemsPerPage: parseInt(limit),
      hasNextPage: page < Math.ceil(totalItems / limit),
      hasPrevPage: page > 1
    };

    return sendPaginated(res, 200, "Donations récupérées", donations, pagination);

  } catch (err) {
    return handleError(res, err);
  }
};

/**
 * @desc    Obtenir une donation par ID
 * @route   GET /api/donations/:id
 * @access  Public
 */
const getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'firstName lastName avatar rating phone address')
      .populate('reservedBy', 'firstName lastName avatar');

    if (!donation) {
      return sendError(res, 404, ERROR_MESSAGES.DONATION_NOT_FOUND);
    }

    await donation.incrementViews();

    return sendSuccess(res, 200, "Donation récupérée", { donation });

  } catch (err) {
    return handleError(res, err);
  }
};

/**
 * @desc    Mettre à jour une donation
 * @route   PUT /api/donations/:id
 * @access  Private
 */
const updateDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return sendError(res, 404, ERROR_MESSAGES.DONATION_NOT_FOUND);
    }

    if (donation.donor.toString() !== req.user._id.toString()) {
      return sendError(res, 403, ERROR_MESSAGES.NOT_OWNER);
    }

    if (donation.status === DONATION_STATUS.RESERVED) {
      return sendError(res, 400, "Impossible de modifier une donation réservée");
    }

    const updated = await Donation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('donor', 'firstName lastName avatar rating');

    return sendSuccess(res, 200, SUCCESS_MESSAGES.DONATION_UPDATED, { donation: updated });

  } catch (err) {
    return handleError(res, err);
  }
};

/**
 * @desc    Supprimer une donation
 * @route   DELETE /api/donations/:id
 * @access  Private
 */
const deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return sendError(res, 404, ERROR_MESSAGES.DONATION_NOT_FOUND);
    }

    if (donation.donor.toString() !== req.user._id.toString()) {
      return sendError(res, 403, ERROR_MESSAGES.NOT_OWNER);
    }

    if ([DONATION_STATUS.RESERVED, DONATION_STATUS.COMPLETED].includes(donation.status)) {
      return sendError(res, 400, "Impossible de supprimer une donation réservée");
    }

    await donation.deleteOne();

    return sendSuccess(res, 200, SUCCESS_MESSAGES.DONATION_DELETED);

  } catch (err) {
    return handleError(res, err);
  }
};

/**
 * @desc    Donations de l'utilisateur connecté
 * @route   GET /api/donations/my
 * @access  Private
 */
const getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user._id })
      .populate('reservedBy', 'firstName lastName avatar')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, "Vos donations", { 
      count: donations.length,
      donations 
    });

  } catch (err) {
    return handleError(res, err);
  }
};

module.exports = {
  createDonation,
  getDonations,
  getDonationById,
  updateDonation,
  deleteDonation,
  getMyDonations
};
