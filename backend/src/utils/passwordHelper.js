// src/utils/passwordHelper.js
const bcrypt = require('bcryptjs');

/**
 * Hash un mot de passe
 * @param {string} password - Le mot de passe en clair
 * @returns {Promise<string>} - Le mot de passe hashé
 */
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error('Erreur lors du hachage du mot de passe');
  }
};

/**
 * Compare un mot de passe avec son hash
 * @param {string} password - Le mot de passe en clair
 * @param {string} hashedPassword - Le mot de passe hashé
 * @returns {Promise<boolean>} - True si les mots de passe correspondent
 */
const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error('Erreur lors de la comparaison du mot de passe');
  }
};

/**
 * Valide la force d'un mot de passe
 * @param {string} password - Le mot de passe à valider
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
const validatePasswordStrength = (password) => {
  const errors = [];
  
  if (!password || password.length < 6) {
    errors.push('Le mot de passe doit contenir au moins 6 caractères');
  }
  
  if (password && password.length > 50) {
    errors.push('Le mot de passe ne peut pas dépasser 50 caractères');
  }
  
  // Optionnel : Vérifier la complexité
  // if (!/[A-Z]/.test(password)) {
  //   errors.push('Le mot de passe doit contenir au moins une majuscule');
  // }
  
  // if (!/[a-z]/.test(password)) {
  //   errors.push('Le mot de passe doit contenir au moins une minuscule');
  // }
  
  // if (!/[0-9]/.test(password)) {
  //   errors.push('Le mot de passe doit contenir au moins un chiffre');
  // }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Génère un mot de passe aléatoire
 * @param {number} length - La longueur du mot de passe (défaut: 12)
 * @returns {string} - Le mot de passe généré
 */
const generateRandomPassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  return password;
};

module.exports = {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
  generateRandomPassword
};