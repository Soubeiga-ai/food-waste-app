// src/models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'auteur de l\'avis est requis']
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'utilisateur évalué est requis']
  },
  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: [true, 'La donation est requise']
  },
  reservation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation',
    required: [true, 'La réservation est requise']
  },
  rating: {
    type: Number,
    required: [true, 'La note est requise'],
    min: [1, 'La note minimale est 1'],
    max: [5, 'La note maximale est 5']
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [500, 'Le commentaire ne peut pas dépasser 500 caractères']
  }
}, {
  timestamps: true
});

// Index pour recherches optimisées
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ reviewee: 1 });
reviewSchema.index({ donation: 1 });
reviewSchema.index({ reservation: 1 });

// Un utilisateur ne peut laisser qu'un seul avis par réservation
reviewSchema.index(
  { reviewer: 1, reservation: 1 },
  { unique: true }
);

// Hook post-save : Mettre à jour la note moyenne de l'utilisateur évalué
reviewSchema.post('save', async function() {
  try {
    const Review = this.constructor;
    const User = mongoose.model('User');

    // Calculer la note moyenne et le nombre d'avis
    const stats = await Review.aggregate([
      {
        $match: { reviewee: this.reviewee }
      },
      {
        $group: {
          _id: '$reviewee',
          averageRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      await User.findByIdAndUpdate(this.reviewee, {
        'rating.average': Math.round(stats[0].averageRating * 10) / 10,
        'rating.count': stats[0].count
      });
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la note:', error);
  }
});

// Hook post-remove : Mettre à jour la note moyenne après suppression
reviewSchema.post('remove', async function() {
  try {
    const Review = this.constructor;
    const User = mongoose.model('User');

    const stats = await Review.aggregate([
      {
        $match: { reviewee: this.reviewee }
      },
      {
        $group: {
          _id: '$reviewee',
          averageRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      await User.findByIdAndUpdate(this.reviewee, {
        'rating.average': Math.round(stats[0].averageRating * 10) / 10,
        'rating.count': stats[0].count
      });
    } else {
      await User.findByIdAndUpdate(this.reviewee, {
        'rating.average': 0,
        'rating.count': 0
      });
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la note:', error);
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;