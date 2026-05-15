import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import notificationService from '../services/notification.service';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notificationsData, refetch } = useQuery({
    queryKey: ['notifications', user?._id],
    queryFn: () => notificationService.getNotifications(),
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch unread count
  const { data: unreadData, refetch: refetchUnread } = useQuery({
    queryKey: ['unreadCount', user?._id],
    queryFn: () => notificationService.getUnreadCount(),
    enabled: !!user,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['unreadCount']);
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['unreadCount']);
      toast.success('All notifications marked as read');
    },
  });

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['unreadCount']);
    },
  });

  // Update counts from fetched data
  useEffect(() => {
    if (notificationsData?.notifications) {
      setNotifications(notificationsData.notifications);
    }
    if (unreadData?.count !== undefined) {
      setUnreadCount(unreadData.count);
    }
  }, [notificationsData, unreadData]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewNotification = (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show toast for high priority notifications
      if (notification.priority === 'high' || notification.priority === 'urgent') {
        toast.error(notification.title, {
          duration: 8000,
          icon: '🔔',
        });
      } else {
        toast.success(notification.title);
      }
    };

    socket.on('new_notification', handleNewNotification);
    socket.on('notification_updated', () => {
      refetch();
      refetchUnread();
    });

    return () => {
      socket.off('new_notification', handleNewNotification);
      socket.off('notification_updated');
    };
  }, [socket, isConnected, refetch, refetchUnread]);

  // Mark notification as read
  const markAsRead = useCallback(async (id) => {
    await markAsReadMutation.mutateAsync(id);
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, [markAsReadMutation]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    await markAllAsReadMutation.mutateAsync();
  }, [markAllAsReadMutation]);

  // Delete notification
  const deleteNotification = useCallback(async (id) => {
    await deleteMutation.mutateAsync(id);
    const notification = notifications.find(n => n._id === id);
    if (notification && !notification.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, [deleteMutation, notifications]);

  // Toggle notifications panel
  const toggleNotifications = useCallback(() => {
    setShowNotifications(prev => !prev);
  }, []);

  // Get notifications by type
  const getNotificationsByType = useCallback((type) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  // Get unread count by type
  const getUnreadCountByType = useCallback((type) => {
    return notifications.filter(n => n.type === type && !n.isRead).length;
  }, [notifications]);

  const value = {
    notifications,
    unreadCount,
    showNotifications,
    setShowNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    toggleNotifications,
    getNotificationsByType,
    getUnreadCountByType,
    refetch,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export default NotificationProvider;