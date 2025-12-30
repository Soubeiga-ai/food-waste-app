// src/middleware/authMiddleware.js
const { verifyToken, extractTokenFromHeader } = require('../utils/tokenHelper');
const { sendError } = require('../utils/responseHelper');
const User = require('../models/User');

/**
 * Middleware pour protéger les routes (vérifier l'authentification)
 */
const protect = async (req, res, next) => {
  try {
    // 1. Récupérer le token du header
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      return sendError(res, 401, 'Non autorisé. Token manquant.');
    }

    // 2. Vérifier le token
    const decoded = verifyToken(token);

    // 3. Récupérer l'utilisateur depuis la base de données
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return sendError(res, 401, 'Utilisateur non trouvé');
    }

    if (!user.isActive) {
      return sendError(res, 401, 'Compte désactivé');
    }

    // 4. Attacher l'utilisateur à la requête
    req.user = user;
    next();

  } catch (error) {
    if (error.message === 'Token expiré') {
      return sendError(res, 401, 'Session expirée. Veuillez vous reconnecter.');
    }
    return sendError(res, 401, 'Token invalide');
  }
};

/**
 * Middleware pour vérifier le rôle de l'utilisateur
 * @param  {...string} roles - Les rôles autorisés
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Non autorisé');
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Accès refusé. Rôle requis: ${roles.join(' ou ')}`
      );
    }

    next();
  };
};

/**
 * Middleware pour vérifier que l'utilisateur est le propriétaire de la ressource
 * @param {string} resourceField - Le champ contenant l'ID du propriétaire
 */
const checkOwnership = (resourceField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Non autorisé');
    }

    const resourceOwnerId = req[resourceField] || req.body[resourceField] || req.params[resourceField];

    if (!resourceOwnerId) {
      return sendError(res, 400, 'ID du propriétaire manquant');
    }

    if (resourceOwnerId.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Vous n\'êtes pas autorisé à modifier cette ressource');
    }

    next();
  };
};

/**
 * Middleware optionnel - Attache l'utilisateur si le token est présent
 * Sinon, continue sans erreur
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // En cas d'erreur, continuer sans utilisateur
    next();
  }
};

module.exports = {
  protect,
  authorize,
  checkOwnership,
  optionalAuth
};