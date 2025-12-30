// src/models/Donation.js
const mongoose = require('mongoose');
const { FOOD_CATEGORIES, UNITS, DONATION_STATUS } = require('../config/constants');

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Le donateur est requis']
  },
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true,
    minlength: [3, 'Le titre doit contenir au moins 3 caractères'],
    maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true,
    minlength: [10, 'La description doit contenir au moins 10 caractères'],
    maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères']
  },
  category: {
    type: String,
    required: [true, 'La catégorie est requise'],
    enum: Object.values(FOOD_CATEGORIES)
  },
  quantity: {
    type: Number,
    required: [true, 'La quantité est requise'],
    min: [0.1, 'La quantité doit être supérieure à 0']
  },
  unit: {
    type: String,
    required: [true, 'L\'unité est requise'],
    enum: Object.values(UNITS)
  },
  expiryDate: {
    type: Date,
    required: [true, 'La date de péremption est requise'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'La date de péremption doit être dans le futur'
    }
  },
  images: [{
    type: String // URL des images
  }],
  pickupLocation: {
    address: {
      type: String,
      required: [true, 'L\'adresse de retrait est requise'],
      trim: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Les coordonnées sont requises']
    }
  },
  status: {
    type: String,
    enum: Object.values(DONATION_STATUS),
    default: DONATION_STATUS.AVAILABLE
  },
  reservedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reservedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index pour recherches optimisées
donationSchema.index({ donor: 1 });
donationSchema.index({ status: 1 });
donationSchema.index({ category: 1 });
donationSchema.index({ expiryDate: 1 });

// Virtual pour vérifier si le don est expiré
donationSchema.virtual('isExpired').get(function() {
  return this.expiryDate < new Date();
});

// Méthode pour incrémenter les vues
donationSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Hook pre-save : Mettre à jour le statut si expiré
donationSchema.pre('save', function() {
  if (this.isExpired && this.status === DONATION_STATUS.AVAILABLE) {
    this.status = DONATION_STATUS.EXPIRED;
  }
});

// Méthode statique pour rechercher les dons à proximité
donationSchema.statics.findNearby = function(longitude, latitude, maxDistance = 10000) {
  return this.find({
    'pickupLocation.coordinates': {
      $geoWithin: {
        $centerSphere: [[longitude, latitude], maxDistance / 6378100] // Rayon en radians
      }
    },
    status: DONATION_STATUS.AVAILABLE,
    expiryDate: { $gt: new Date() }
  });
};

const Donation = mongoose.model('Donation', donationSchema);

module.exports = Donation;