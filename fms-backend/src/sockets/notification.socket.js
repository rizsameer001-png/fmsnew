const Notification = require('../models/Notification.model');
const logger = require('../utils/logger');

module.exports = (socket, io, onlineUsers) => {
  
  // Subscribe to notifications
  socket.on('subscribe_notifications', async (data) => {
    try {
      const userId = socket.user?.userId;
      
      // Join user's personal notification room
      socket.join(`notifications_${userId}`);
      
      // Get unread count and send to user
      const unreadCount = await Notification.countDocuments({
        userId,
        isRead: false
      });
      
      socket.emit('notification_subscribed', {
        success: true,
        unreadCount
      });
      
    } catch (error) {
      logger.error('Subscribe notifications error:', error);
    }
  });
  
  // Unsubscribe from notifications
  socket.on('unsubscribe_notifications', () => {
    const userId = socket.user?.userId;
    socket.leave(`notifications_${userId}`);
  });
  
  // Mark notification as read
  socket.on('mark_notification_read', async (data) => {
    try {
      const { notificationId } = data;
      const userId = socket.user?.userId;
      
      const notification = await Notification.findById(notificationId);
      if (!notification) {
        socket.emit('error', { message: 'Notification not found' });
        return;
      }
      
      if (notification.userId.toString() !== userId) {
        socket.emit('error', { message: 'Not authorized' });
        return;
      }
      
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();
      
      // Get updated unread count
      const unreadCount = await Notification.countDocuments({
        userId,
        isRead: false
      });
      
      socket.emit('notification_read', {
        notificationId,
        unreadCount
      });
      
      // Also emit to room for consistency
      io.to(`notifications_${userId}`).emit('notification_updated', {
        notificationId,
        isRead: true
      });
      
    } catch (error) {
      logger.error('Mark notification read error:', error);
    }
  });
  
  // Mark all notifications as read
  socket.on('mark_all_notifications_read', async () => {
    try {
      const userId = socket.user?.userId;
      
      await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );
      
      socket.emit('all_notifications_read', {
        success: true
      });
      
      io.to(`notifications_${userId}`).emit('notifications_cleared');
      
    } catch (error) {
      logger.error('Mark all notifications read error:', error);
    }
  });
  
  // Get notifications
  socket.on('get_notifications', async (data) => {
    try {
      const { page = 1, limit = 20, type } = data;
      const userId = socket.user?.userId;
      
      const query = { userId };
      if (type) query.type = type;
      
      const notifications = await Notification.find(query)
        .sort('-createdAt')
        .limit(limit)
        .skip((page - 1) * limit);
      
      const total = await Notification.countDocuments(query);
      const unreadCount = await Notification.countDocuments({ userId, isRead: false });
      
      socket.emit('notifications_list', {
        notifications,
        total,
        unreadCount,
        currentPage: page,
        totalPages: Math.ceil(total / limit)
      });
      
    } catch (error) {
      logger.error('Get notifications error:', error);
      socket.emit('error', { message: error.message });
    }
  });
  
  // Delete notification
  socket.on('delete_notification', async (data) => {
    try {
      const { notificationId } = data;
      const userId = socket.user?.userId;
      
      const notification = await Notification.findById(notificationId);
      if (!notification) return;
      
      if (notification.userId.toString() !== userId) {
        socket.emit('error', { message: 'Not authorized' });
        return;
      }
      
      await notification.deleteOne();
      
      // Get updated unread count
      const unreadCount = await Notification.countDocuments({ userId, isRead: false });
      
      socket.emit('notification_deleted', {
        notificationId,
        unreadCount
      });
      
      io.to(`notifications_${userId}`).emit('notification_removed', notificationId);
      
    } catch (error) {
      logger.error('Delete notification error:', error);
    }
  });
  
  // Send test notification (for development)
  socket.on('test_notification', async () => {
    const userId = socket.user?.userId;
    
    // Create test notification
    const notification = await Notification.create({
      userId,
      title: 'Test Notification',
      body: 'This is a test notification from the server',
      type: 'system',
      channels: ['inapp']
    });
    
    io.to(`notifications_${userId}`).emit('new_notification', notification);
  });
  
};

// Export function to send notification to user (called from other modules)
const sendNotificationToUser = (io, userId, notification) => {
  io.to(`notifications_${userId}`).emit('new_notification', notification);
};

// Export function to send notification to role
const sendNotificationToRole = (io, role, notification) => {
  io.to(`role_${role}`).emit('new_notification', notification);
};

module.exports = {
  sendNotificationToUser,
  sendNotificationToRole
};