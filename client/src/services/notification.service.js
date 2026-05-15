import api from './api';

const notificationService = {
  // Notification CRUD
  getNotifications: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
    if (filters.type) params.append('type', filters.type);
    if (filters.isRead !== undefined) params.append('isRead', filters.isRead);
    
    const response = await api.get(`/notifications?${params.toString()}`);
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread/count');
    return response.data;
  },

  // Push notification token management
  updatePushToken: async (fcmToken) => {
    const response = await api.post('/notifications/push-token', { fcmToken });
    return response.data;
  },
};

export default notificationService;