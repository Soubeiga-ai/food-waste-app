// src/utils/responseHelper.js

/**
 * Envoie une réponse de succès
 * @param {Object} res - L'objet response d'Express
 * @param {number} statusCode - Le code de statut HTTP (défaut: 200)
 * @param {string} message - Le message de succès
 * @param {Object} data - Les données à retourner (optionnel)
 */
const sendSuccess = (res, statusCode = 200, message, data = null) => {
  const response = {
    success: true,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Envoie une réponse d'erreur
 * @param {Object} res - L'objet response d'Express
 * @param {number} statusCode - Le code de statut HTTP (défaut: 400)
 * @param {string} message - Le message d'erreur
 * @param {Array|Object} errors - Les erreurs détaillées (optionnel)
 */
const sendError = (res, statusCode = 400, message, errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors !== null) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Envoie une réponse avec pagination
 * @param {Object} res - L'objet response d'Express
 * @param {number} statusCode - Le code de statut HTTP
 * @param {string} message - Le message de succès
 * @param {Array} data - Les données paginées
 * @param {Object} pagination - Les informations de pagination
 */
const sendPaginated = (res, statusCode = 200, message, data, pagination) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination: {
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalItems: pagination.totalItems,
      itemsPerPage: pagination.itemsPerPage,
      hasNextPage: pagination.hasNextPage,
      hasPrevPage: pagination.hasPrevPage
    }
  });
};

/**
 * Gère les erreurs de validation Mongoose
 * @param {Object} error - L'erreur Mongoose
 * @returns {Array} - Un tableau d'erreurs formatées
 */
const formatValidationErrors = (error) => {
  const errors = [];

  if (error.name === 'ValidationError') {
    Object.keys(error.errors).forEach((key) => {
      errors.push({
        field: key,
        message: error.errors[key].message
      });
    });
  } else if (error.code === 11000) {
    // Erreur de duplication (ex: email déjà existant)
    const field = Object.keys(error.keyPattern)[0];
    errors.push({
      field,
      message: `Cette valeur de ${field} existe déjà`
    });
  } else {
    errors.push({
      message: error.message || 'Erreur de validation'
    });
  }

  return errors;
};

/**
 * Gère les erreurs globales de manière uniforme
 * @param {Object} res - L'objet response d'Express
 * @param {Object} error - L'objet erreur
 */
const handleError = (res, error) => {
  console.error('❌ Erreur:', error);

  // Erreur de validation Mongoose
  if (error.name === 'ValidationError' || error.code === 11000) {
    const errors = formatValidationErrors(error);
    return sendError(res, 400, 'Erreur de validation', errors);
  }

  // Erreur CastError (ID invalide)
  if (error.name === 'CastError') {
    return sendError(res, 400, 'ID invalide');
  }

  // Erreur JWT
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    return sendError(res, 401, error.message);
  }

  // Erreur personnalisée avec statusCode
  if (error.statusCode) {
    return sendError(res, error.statusCode, error.message);
  }

  // Erreur serveur par défaut
  return sendError(
    res,
    500,
    process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Erreur serveur interne'
  );
};

/**
 * Crée une classe d'erreur personnalisée
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  sendSuccess,
  sendError,
  sendPaginated,
  formatValidationErrors,
  handleError,
  AppError
};