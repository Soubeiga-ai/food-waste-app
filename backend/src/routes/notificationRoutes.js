// backend/src/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/notifications
 * @desc    Obtenir toutes les notifications
 * @access  Private
 */
router.get('/', protect, getNotifications);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Obtenir le nombre de notifications non lues
 * @access  Private
 */
router.get('/unread-count', protect, getUnreadCount);

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Marquer toutes les notifications comme lues
 * @access  Private
 */
router.put('/read-all', protect, markAllAsRead);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Marquer une notification comme lue
 * @access  Private
 */
router.put('/:id/read', protect, markAsRead);

/**
 * @route   DELETE /api/notifications
 * @desc    Supprimer toutes les notifications
 * @access  Private
 */
router.delete('/', protect, deleteAllNotifications);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Supprimer une notification
 * @access  Private
 */
router.delete('/:id', protect, deleteNotification);

module.exports = router;