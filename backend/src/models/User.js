// src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { USER_ROLES } = require('../config/constants');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true,
    minlength: [2, 'Le prénom doit contenir au moins 2 caractères']
  },
  lastName: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    minlength: [2, 'Le nom doit contenir au moins 2 caractères']
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
    select: false // Ne pas retourner le mot de passe par défaut
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[0-9+\s()-]+$/, 'Numéro de téléphone invalide']
  },
  role: {
    type: String,
    enum: Object.values(USER_ROLES),
    default: USER_ROLES.BOTH
  },
  address: {
    street: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    postalCode: {
      type: String,
      trim: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere' // Index géospatial pour les recherches par proximité
    }
  },
  avatar: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true // Ajoute automatiquement createdAt et updatedAt
});

// Index pour recherches rapides
userSchema.index({ email: 1 });
userSchema.index({ 'address.city': 1 });

// Hook pre-save : Hasher le mot de passe avant sauvegarde
userSchema.pre('save', async function() {
  // Si le mot de passe n'est pas modifié, passer
  if (!this.isModified('password')) {
    return;
  }

  // Hasher le mot de passe
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Erreur lors de la comparaison du mot de passe');
  }
};

// Méthode pour retourner l'utilisateur sans le mot de passe
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Méthode pour obtenir le nom complet
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

const User = mongoose.model('User', userSchema);

module.exports = User;