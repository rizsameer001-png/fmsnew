const Notification = require('../models/Notification.model');
const User = require('../models/User.model');
const { sendPushNotification } = require('../services/push.service');
const { getIO } = require('../config/socketio');
//const logger = require('../utils/logger');
// Replace with:
const { logger } = require('../utils/logger');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, isRead } = req.query;
    const query = { userId: req.user._id };

    if (type) query.type = type;
    if (isRead !== undefined) query.isRead = isRead === 'true';

    const notifications = await Notification.find(query)
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });

    res.json({
      success: true,
      notifications,
      unreadCount,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    logger.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({ success: true, notification });
  } catch (error) {
    logger.error('Mark as read error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    logger.error('Mark all as read error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await notification.deleteOne();

    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    logger.error('Delete notification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get unread count
// @route   GET /api/notifications/unread/count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user._id, isRead: false });
    res.json({ success: true, count });
  } catch (error) {
    logger.error('Get unread count error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update push token for user
// @route   POST /api/notifications/push-token
// @access  Private
const updatePushToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({ success: false, message: 'FCM token required' });
    }

    const user = await User.findById(req.user._id);
    
    if (!user.fcmTokens) {
      user.fcmTokens = [];
    }

    if (!user.fcmTokens.includes(fcmToken)) {
      user.fcmTokens.push(fcmToken);
      await user.save();
    }

    res.json({ success: true, message: 'Push token updated' });
  } catch (error) {
    logger.error('Update push token error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create and send notification (internal use)
const createNotification = async (userId, title, body, type, referenceId, referenceModel, channels = ['inapp']) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      body,
      type,
      referenceId,
      referenceModel,
      channels
    });

    // In-app notification via socket
    const io = getIO();
    io.to(`user_${userId}`).emit('new_notification', notification);

    // Push notification if enabled
    if (channels.includes('push')) {
      const user = await User.findById(userId);
      if (user?.fcmTokens?.length) {
        await sendPushNotification(user.fcmTokens, {
          title,
          body,
          data: { notificationId: notification._id, type, referenceId }
        });
      }
    }

    return notification;
  } catch (error) {
    logger.error('Create notification error:', error);
    return null;
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  updatePushToken,
  createNotification
};