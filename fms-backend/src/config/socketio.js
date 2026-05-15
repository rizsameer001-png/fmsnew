const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger');

let io;

const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`New client connected: ${socket.id} - User: ${socket.user?.userId}`);

    // Join user to their personal room
    if (socket.user) {
      socket.join(`user_${socket.user.userId}`);
      socket.join(`role_${socket.user.role}`);
      
      // Store online user
      io.onlineUsers = io.onlineUsers || new Map();
      io.onlineUsers.set(socket.user.userId, socket.id);
      
      // Broadcast online status
      io.emit('user_online', { userId: socket.user.userId, status: true });
    }

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
      if (socket.user && io.onlineUsers) {
        io.onlineUsers.delete(socket.user.userId);
        io.emit('user_offline', { userId: socket.user.userId, status: false });
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initSocket, getIO };