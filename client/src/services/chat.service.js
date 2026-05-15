import api from './api';

const chatService = {
  // Chat management
  getChats: async () => {
    const response = await api.get('/chats');
    return response.data;
  },

  getMessages: async (chatId, page = 1, limit = 50) => {
    const response = await api.get(`/chats/${chatId}/messages?page=${page}&limit=${limit}`);
    return response.data;
  },

  sendMessage: async (receiverId, message, attachments = [], chatId = null) => {
    const response = await api.post('/chats/send', {
      receiverId,
      message,
      attachments,
      chatId,
    });
    return response.data;
  },

  markAsRead: async (chatId) => {
    const response = await api.put(`/chats/${chatId}/read`);
    return response.data;
  },

  // Group chat
  createGroupChat: async (groupName, participantIds) => {
    const response = await api.post('/chats/group', { groupName, participantIds });
    return response.data;
  },

  addParticipant: async (chatId, userId) => {
    const response = await api.post(`/chats/${chatId}/participants`, { userId });
    return response.data;
  },

  removeParticipant: async (chatId, userId) => {
    const response = await api.delete(`/chats/${chatId}/participants/${userId}`);
    return response.data;
  },

  // Support chat
  getSupportChat: async () => {
    const response = await api.get('/chats/support');
    return response.data;
  },

  // Typing indicators
  sendTypingIndicator: async (chatId, isTyping) => {
    // This is typically handled via socket.io
    // Keeping for API reference
    return { success: true };
  },
};

export default chatService;