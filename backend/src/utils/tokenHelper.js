// src/utils/tokenHelper.js
const jwt = require('jsonwebtoken');

/**
 * Génère un token JWT pour un utilisateur
 * @param {Object} user - L'objet utilisateur
 * @returns {string} - Le token JWT généré
 */
const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRE || '7d'
    }
  );
};

/**
 * Vérifie et décode un token JWT
 * @param {string} token - Le token à vérifier
 * @returns {Object} - Les données décodées du token
 * @throws {Error} - Si le token est invalide ou expiré
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expiré');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Token invalide');
    } else {
      throw new Error('Erreur de vérification du token');
    }
  }
};

/**
 * Extrait le token du header Authorization
 * @param {string} authHeader - Le header Authorization
 * @returns {string|null} - Le token extrait ou null
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Enlever "Bearer "
};

/**
 * Génère un token de réinitialisation de mot de passe
 * @param {Object} user - L'objet utilisateur
 * @returns {string} - Le token de réinitialisation
 */
const generateResetToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    type: 'reset'
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { 
      expiresIn: '1h' // Expire dans 1 heure
    }
  );
};

module.exports = {
  generateToken,
  verifyToken,
  extractTokenFromHeader,
  generateResetToken
};