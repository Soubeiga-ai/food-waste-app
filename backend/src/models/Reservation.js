// src/models/Reservation.js
const mongoose = require('mongoose');
const { RESERVATION_STATUS } = require('../config/constants');

const reservationSchema = new mongoose.Schema({
  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: [true, 'La donation est requise']
  },
  beneficiary: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Le bénéficiaire est requis']
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Le donateur est requis']
  },
  status: {
    type: String,
    enum: Object.values(RESERVATION_STATUS),
    default: RESERVATION_STATUS.PENDING
  },
  pickupDate: {
    type: Date,
    required: [true, 'La date de retrait est requise'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'La date de retrait doit être dans le futur'
    }
  },
  message: {
    type: String,
    trim: true,
    maxlength: [500, 'Le message ne peut pas dépasser 500 caractères']
  },
  confirmedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  cancellationReason: {
    type: String,
    trim: true,
    maxlength: [500, 'La raison d\'annulation ne peut pas dépasser 500 caractères']
  }
}, {
  timestamps: true
});

// Index pour recherches optimisées
reservationSchema.index({ donation: 1 });
reservationSchema.index({ beneficiary: 1 });
reservationSchema.index({ donor: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ pickupDate: 1 });

// Empêcher les réservations multiples pour une même donation
reservationSchema.index(
  { donation: 1, beneficiary: 1 },
  { 
    unique: true,
    partialFilterExpression: { 
      status: { $in: [RESERVATION_STATUS.PENDING, RESERVATION_STATUS.CONFIRMED] }
    }
  }
);

// Virtual pour vérifier si la réservation est active
reservationSchema.virtual('isActive').get(function() {
  return [RESERVATION_STATUS.PENDING, RESERVATION_STATUS.CONFIRMED].includes(this.status);
});

// Méthode pour confirmer une réservation
reservationSchema.methods.confirm = function() {
  this.status = RESERVATION_STATUS.CONFIRMED;
  this.confirmedAt = new Date();
  return this.save();
};

// Méthode pour compléter une réservation
reservationSchema.methods.complete = function() {
  this.status = RESERVATION_STATUS.COMPLETED;
  this.completedAt = new Date();
  return this.save();
};

// Méthode pour annuler une réservation
reservationSchema.methods.cancel = function(reason) {
  this.status = RESERVATION_STATUS.CANCELLED;
  this.cancelledAt = new Date();
  if (reason) {
    this.cancellationReason = reason;
  }
  return this.save();
};

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;