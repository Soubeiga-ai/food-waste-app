// src/controllers/authController.js
const User = require('../models/User');
const { generateToken } = require('../utils/tokenHelper');
const { sendSuccess, sendError, handleError } = require('../utils/responseHelper');
const { SUCCESS_MESSAGES, ERROR_MESSAGES } = require('../config/constants');

/**
 * @desc    Inscription d'un nouvel utilisateur
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role, address } = req.body;

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 400, ERROR_MESSAGES.EMAIL_EXISTS);
    }

    // Créer l'utilisateur
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
      address
    });

    // Générer le token
    const token = generateToken(user);

    // Retourner la réponse
    sendSuccess(res, 201, SUCCESS_MESSAGES.REGISTER, {
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Connexion d'un utilisateur
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Récupérer l'utilisateur avec le mot de passe
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return sendError(res, 401, ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return sendError(res, 401, ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return sendError(res, 401, 'Compte désactivé');
    }

    // Générer le token
    const token = generateToken(user);

    // Retourner la réponse (sans le mot de passe)
    const userWithoutPassword = user.toJSON();

    sendSuccess(res, 200, SUCCESS_MESSAGES.LOGIN, {
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Obtenir le profil de l'utilisateur connecté
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    // L'utilisateur est déjà attaché par le middleware protect
    const user = await User.findById(req.user._id);

    sendSuccess(res, 200, 'Profil récupéré avec succès', { user });

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Déconnexion (côté client seulement, suppression du token)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res) => {
  try {
    // La déconnexion est gérée côté client en supprimant le token
    // Cette route peut servir à des opérations supplémentaires si nécessaire
    sendSuccess(res, 200, SUCCESS_MESSAGES.LOGOUT);

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Mettre à jour le mot de passe
 * @route   PUT /api/auth/update-password
 * @access  Private
 */
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Récupérer l'utilisateur avec le mot de passe
    const user = await User.findById(req.user._id).select('+password');

    // Vérifier le mot de passe actuel
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return sendError(res, 401, 'Mot de passe actuel incorrect');
    }

    // Mettre à jour le mot de passe
    user.password = newPassword;
    await user.save();

    sendSuccess(res, 200, 'Mot de passe mis à jour avec succès');

  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
  updatePassword
};