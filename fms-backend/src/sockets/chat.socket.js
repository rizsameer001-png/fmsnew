const Chat = require('../models/Chat.model');
const Notification = require('../models/Notification.model');
const User = require('../models/User.model');
const logger = require('../utils/logger');

module.exports = (socket, io, onlineUsers) => {
  
  // Join chat room
  socket.on('join_chat', async (data) => {
    try {
      const { chatId } = data;
      const userId = socket.user?.userId;
      
      // Verify user is participant in this chat
      const chat = await Chat.findById(chatId);
      if (!chat) {
        socket.emit('error', { message: 'Chat not found' });
        return;
      }
      
      const isParticipant = chat.participants.some(p => p.userId.toString() === userId);
      if (!isParticipant) {
        socket.emit('error', { message: 'Not authorized to join this chat' });
        return;
      }
      
      socket.join(`chat_${chatId}`);
      socket.emit('chat_joined', { chatId, success: true });
      
      // Mark previous messages as read
      await markChatMessagesAsRead(chatId, userId);
      
      // Notify others that user joined
      socket.to(`chat_${chatId}`).emit('user_joined_chat', {
        userId,
        userName: socket.user?.name,
        chatId
      });
      
    } catch (error) {
      logger.error('Join chat error:', error);
      socket.emit('error', { message: error.message });
    }
  });
  
  // Leave chat room
  socket.on('leave_chat', (data) => {
    const { chatId } = data;
    socket.leave(`chat_${chatId}`);
    socket.to(`chat_${chatId}`).emit('user_left_chat', {
      userId: socket.user?.userId,
      userName: socket.user?.name,
      chatId
    });
  });
  
  // Send message
  socket.on('send_message', async (data) => {
    try {
      const { chatId, message, attachments, replyTo } = data;
      const userId = socket.user?.userId;
      const userName = socket.user?.name;
      
      const chat = await Chat.findById(chatId);
      if (!chat) {
        socket.emit('error', { message: 'Chat not found' });
        return;
      }
      
      const isParticipant = chat.participants.some(p => p.userId.toString() === userId);
      if (!isParticipant) {
        socket.emit('error', { message: 'Not authorized to send message' });
        return;
      }
      
      const newMessage = {
        senderId: userId,
        message: message || '',
        attachments: attachments || [],
        replyTo: replyTo,
        createdAt: new Date(),
        isRead: false
      };
      
      chat.messages.push(newMessage);
      chat.lastMessage = message || (attachments?.length ? '📎 Attachment' : '');
      chat.lastMessageAt = new Date();
      await chat.save();
      
      const savedMessage = chat.messages[chat.messages.length - 1];
      
      // Emit to all participants in the chat room
      io.to(`chat_${chatId}`).emit('new_message', {
        chatId,
        message: savedMessage,
        sender: {
          id: userId,
          name: userName,
          role: socket.user?.role
        }
      });
      
      // Send notifications to offline participants
      for (const participant of chat.participants) {
        const participantId = participant.userId.toString();
        if (participantId !== userId && !onlineUsers.has(participantId)) {
          // Create notification for offline user
          await Notification.create({
            userId: participantId,
            title: `New message from ${userName}`,
            body: (message || 'New message').substring(0, 100),
            type: 'chat',
            referenceId: chatId,
            referenceModel: 'Chat',
            channels: ['push', 'email']
          });
        }
      }
      
    } catch (error) {
      logger.error('Send message error:', error);
      socket.emit('error', { message: error.message });
    }
  });
  
  // Mark messages as read
  socket.on('mark_read', async (data) => {
    try {
      const { chatId } = data;
      const userId = socket.user?.userId;
      
      await markChatMessagesAsRead(chatId, userId);
      
      // Notify others that messages were read
      socket.to(`chat_${chatId}`).emit('messages_read', {
        userId,
        chatId,
        readAt: new Date()
      });
      
    } catch (error) {
      logger.error('Mark read error:', error);
    }
  });
  
  // Delete message
  socket.on('delete_message', async (data) => {
    try {
      const { chatId, messageId } = data;
      const userId = socket.user?.userId;
      
      const chat = await Chat.findById(chatId);
      if (!chat) return;
      
      const messageIndex = chat.messages.findIndex(m => m._id.toString() === messageId);
      if (messageIndex === -1) return;
      
      const message = chat.messages[messageIndex];
      
      // Only sender can delete message
      if (message.senderId.toString() !== userId) {
        socket.emit('error', { message: 'Not authorized to delete this message' });
        return;
      }
      
      // Soft delete - mark as deleted
      if (!message.deletedFor) message.deletedFor = [];
      message.deletedFor.push(userId);
      message.message = '[Message deleted]';
      
      await chat.save();
      
      io.to(`chat_${chatId}`).emit('message_deleted', {
        chatId,
        messageId,
        deletedBy: userId
      });
      
    } catch (error) {
      logger.error('Delete message error:', error);
    }
  });
  
  // Edit message
  socket.on('edit_message', async (data) => {
    try {
      const { chatId, messageId, newMessage } = data;
      const userId = socket.user?.userId;
      
      const chat = await Chat.findById(chatId);
      if (!chat) return;
      
      const message = chat.messages.find(m => m._id.toString() === messageId);
      if (!message) return;
      
      if (message.senderId.toString() !== userId) {
        socket.emit('error', { message: 'Not authorized to edit this message' });
        return;
      }
      
      // Check if message is still editable (within 5 minutes)
      const messageAge = Date.now() - new Date(message.createdAt).getTime();
      if (messageAge > 5 * 60 * 1000) {
        socket.emit('error', { message: 'Message can only be edited within 5 minutes' });
        return;
      }
      
      message.message = newMessage;
      message.editedAt = new Date();
      await chat.save();
      
      io.to(`chat_${chatId}`).emit('message_edited', {
        chatId,
        messageId,
        newMessage,
        editedAt: message.editedAt
      });
      
    } catch (error) {
      logger.error('Edit message error:', error);
    }
  });
  
};

// Helper function to mark messages as read
async function markChatMessagesAsRead(chatId, userId) {
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return;
    
    let modified = false;
    chat.messages.forEach(msg => {
      if (msg.senderId.toString() !== userId && !msg.isRead) {
        msg.isRead = true;
        msg.readAt = new Date();
        modified = true;
      }
    });
    
    if (modified) {
      await chat.save();
    }
  } catch (error) {
    logger.error('Mark chat messages as read error:', error);
  }
}