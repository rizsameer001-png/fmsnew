const { getIO } = require('../config/socketio');
const chatSocket = require('./chat.socket');
const notificationSocket = require('./notification.socket');
const locationSocket = require('./location.socket');
const complaintSocket = require('./complaint.socket');
const dashboardSocket = require('./dashboard.socket');
const logger = require('../utils/logger');

// Store online users
const onlineUsers = new Map();

const initSockets = (io) => {
  // Authentication middleware is already applied in config/socketio.js
  
  io.on('connection', (socket) => {
    const userId = socket.user?.userId;
    const userRole = socket.user?.role;
    
    if (userId) {
      onlineUsers.set(userId, {
        socketId: socket.id,
        role: userRole,
        connectedAt: new Date()
      });
      
      logger.info(`User connected: ${userId} (${userRole}) - Socket: ${socket.id}`);
      
      // Broadcast online status
      io.emit('user_status_change', {
        userId,
        status: 'online',
        role: userRole
      });
    }
    
    // Initialize individual socket modules
    chatSocket(socket, io, onlineUsers);
    notificationSocket(socket, io, onlineUsers);
    locationSocket(socket, io, onlineUsers);
    complaintSocket(socket, io, onlineUsers);
    dashboardSocket(socket, io, onlineUsers);
    
    // Handle disconnection
    socket.on('disconnect', () => {
      if (userId) {
        onlineUsers.delete(userId);
        logger.info(`User disconnected: ${userId} - Socket: ${socket.id}`);
        
        // Broadcast offline status
        io.emit('user_status_change', {
          userId,
          status: 'offline',
          role: userRole
        });
      }
    });
    
    // Handle ping for connection health check
    socket.on('ping', (callback) => {
      if (typeof callback === 'function') {
        callback({ pong: true, timestamp: new Date() });
      }
    });
    
    // Handle user typing status
    socket.on('typing', (data) => {
      const { chatId, isTyping } = data;
      socket.to(`chat_${chatId}`).emit('user_typing', {
        userId,
        userName: socket.user?.name,
        chatId,
        isTyping
      });
    });
  });
  
  return { onlineUsers };
};

// Helper function to get online users
const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};

// Helper function to check if user is online
const isUserOnline = (userId) => {
  return onlineUsers.has(userId);
};

// Helper function to get user socket
const getUserSocket = (userId) => {
  const user = onlineUsers.get(userId);
  return user ? user.socketId : null;
};

module.exports = {
  initSockets,
  getOnlineUsers,
  isUserOnline,
  getUserSocket
};