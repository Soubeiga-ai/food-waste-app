// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout,
  updatePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const {
  registerValidation,
  loginValidation,
  validate
} = require('../middleware/validationMiddleware');

/**
 * @route   POST /api/auth/register
 * @desc    Inscription d'un nouvel utilisateur
 * @access  Public
 */
router.post('/register', registerValidation, validate, register);

/**
 * @route   POST /api/auth/login
 * @desc    Connexion d'un utilisateur
 * @access  Public
 */
router.post('/login', loginValidation, validate, login);

/**
 * @route   GET /api/auth/me
 * @desc    Obtenir le profil de l'utilisateur connecté
 * @access  Private
 */
router.get('/me', protect, getMe);

/**
 * @route   POST /api/auth/logout
 * @desc    Déconnexion (côté client)
 * @access  Private
 */
router.post('/logout', protect, logout);

/**
 * @route   PUT /api/auth/update-password
 * @desc    Mettre à jour le mot de passe
 * @access  Private
 */
router.put('/update-password', protect, updatePassword);

module.exports = router;