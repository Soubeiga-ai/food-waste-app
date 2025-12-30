// backend/src/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'new_reservation',      // Nouvelle réservation reçue
      'reservation_confirmed', // Réservation confirmée
      'reservation_completed', // Réservation complétée
      'reservation_cancelled', // Réservation annulée
      'donation_expiring',    // Donation va expirer
      'new_review'            // Nouvel avis reçu
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  link: {
    type: String // URL de redirection (ex: /reservations/123)
  },
  data: {
    type: mongoose.Schema.Types.Mixed // Données supplémentaires (donation, reservation, etc.)
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index composé pour optimiser les requêtes
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

// Méthode pour marquer comme lue
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Méthode statique pour créer une notification
notificationSchema.statics.createNotification = async function(data) {
  try {
    const notification = await this.create(data);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Méthode statique pour notifier une nouvelle réservation
notificationSchema.statics.notifyNewReservation = async function(reservation, donor) {
  return this.createNotification({
    recipient: donor._id,
    sender: reservation.beneficiary,
    type: 'new_reservation',
    title: '🔔 Nouvelle réservation',
    message: `${reservation.beneficiary.firstName} souhaite réserver votre don`,
    link: `/reservations/${reservation._id}`,
    data: {
      reservationId: reservation._id,
      donationId: reservation.donation._id
    }
  });
};

// Méthode statique pour notifier une confirmation
notificationSchema.statics.notifyReservationConfirmed = async function(reservation, beneficiary) {
  return this.createNotification({
    recipient: beneficiary._id,
    sender: reservation.donor,
    type: 'reservation_confirmed',
    title: '✅ Réservation confirmée',
    message: `${reservation.donor.firstName} a confirmé votre réservation`,
    link: `/reservations/${reservation._id}`,
    data: {
      reservationId: reservation._id,
      donationId: reservation.donation._id
    }
  });
};

// Méthode statique pour notifier une complétion
notificationSchema.statics.notifyReservationCompleted = async function(reservation, recipient) {
  return this.createNotification({
    recipient: recipient._id,
    sender: reservation.donor._id === recipient._id ? reservation.beneficiary : reservation.donor,
    type: 'reservation_completed',
    title: '✔️ Réservation complétée',
    message: 'La réservation a été marquée comme complétée',
    link: `/reservations/${reservation._id}`,
    data: {
      reservationId: reservation._id,
      donationId: reservation.donation._id
    }
  });
};

// Méthode statique pour notifier une annulation
notificationSchema.statics.notifyReservationCancelled = async function(reservation, recipient, cancelledBy) {
  return this.createNotification({
    recipient: recipient._id,
    sender: cancelledBy._id,
    type: 'reservation_cancelled',
    title: '❌ Réservation annulée',
    message: `${cancelledBy.firstName} a annulé la réservation`,
    link: `/reservations/${reservation._id}`,
    data: {
      reservationId: reservation._id,
      donationId: reservation.donation._id,
      reason: reservation.cancelReason
    }
  });
};

module.exports = mongoose.model('Notification', notificationSchema);