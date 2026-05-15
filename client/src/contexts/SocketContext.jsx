import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user, isAuthenticated } = useAuth();

  // Initialize socket connection
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    
    const newSocket = io(SOCKET_URL, {
      auth: { token: localStorage.getItem('token') },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    // User status events
    newSocket.on('user_online', (data) => {
      setOnlineUsers(prev => [...prev, data.userId]);
    });

    newSocket.on('user_offline', (data) => {
      setOnlineUsers(prev => prev.filter(id => id !== data.userId));
    });

    newSocket.on('user_status_change', (data) => {
      if (data.status === 'online') {
        setOnlineUsers(prev => [...prev, data.userId]);
      } else {
        setOnlineUsers(prev => prev.filter(id => id !== data.userId));
      }
    });

    // Notification events
    newSocket.on('new_notification', (notification) => {
      toast.success(notification.title);
    });

    newSocket.on('emergency_alert', (alert) => {
      toast.error(`🚨 EMERGENCY: ${alert.technician?.name} needs assistance!`, {
        duration: 10000,
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user]);

  // Emit events wrapper
  const emit = useCallback((event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    } else {
      console.warn(`Socket not connected, cannot emit ${event}`);
    }
  }, [socket, isConnected]);

  // Join room
  const joinRoom = useCallback((room) => {
    if (socket && isConnected) {
      socket.emit('join_room', { room });
    }
  }, [socket, isConnected]);

  // Leave room
  const leaveRoom = useCallback((room) => {
    if (socket && isConnected) {
      socket.emit('leave_room', { room });
    }
  }, [socket, isConnected]);

  // Send message
  const sendMessage = useCallback((chatId, message, attachments = []) => {
    if (socket && isConnected) {
      socket.emit('send_message', { chatId, message, attachments });
    }
  }, [socket, isConnected]);

  // Update location (for technicians)
  const updateLocation = useCallback((latitude, longitude, accuracy) => {
    if (socket && isConnected && user?.role === 'technician') {
      socket.emit('update_location', { latitude, longitude, accuracy });
    }
  }, [socket, isConnected, user]);

  // Mark notification as read
  const markNotificationRead = useCallback((notificationId) => {
    if (socket && isConnected) {
      socket.emit('mark_notification_read', { notificationId });
    }
  }, [socket, isConnected]);

  const value = {
    socket,
    isConnected,
    onlineUsers,
    emit,
    joinRoom,
    leaveRoom,
    sendMessage,
    updateLocation,
    markNotificationRead,
    isUserOnline: useCallback((userId) => onlineUsers.includes(userId), [onlineUsers]),
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export default SocketProvider;