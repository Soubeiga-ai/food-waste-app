// backend/src/controllers/notificationController.js
const Notification = require('../models/Notification');
const { sendSuccess, sendError, handleError } = require('../utils/responseHelper');

/**
 * @desc    Obtenir les notifications de l'utilisateur
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = async (req, res) => {
  try {
    const { isRead, limit = 20, page = 1 } = req.query;

    const filter = { recipient: req.user._id };
    
    if (isRead !== undefined) {
      filter.isRead = isRead === 'true';
    }

    const skip = (page - 1) * limit;

    const notifications = await Notification.find(filter)
      .populate('sender', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ 
      recipient: req.user._id, 
      isRead: false 
    });

    sendSuccess(res, 200, 'Notifications récupérées', {
      notifications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      unreadCount
    });

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Obtenir le nombre de notifications non lues
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    sendSuccess(res, 200, 'Nombre de notifications non lues', { count });

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Marquer une notification comme lue
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return sendError(res, 404, 'Notification introuvable');
    }

    await notification.markAsRead();

    sendSuccess(res, 200, 'Notification marquée comme lue', { notification });

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Marquer toutes les notifications comme lues
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
const markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    sendSuccess(res, 200, 'Toutes les notifications marquées comme lues', {
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Supprimer une notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return sendError(res, 404, 'Notification introuvable');
    }

    sendSuccess(res, 200, 'Notification supprimée');

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Supprimer toutes les notifications
 * @route   DELETE /api/notifications
 * @access  Private
 */
const deleteAllNotifications = async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      recipient: req.user._id
    });

    sendSuccess(res, 200, 'Toutes les notifications supprimées', {
      deletedCount: result.deletedCount
    });

  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
};