// const Chat = require('../models/Chat.model');
// const User = require('../models/User.model');
// const Notification = require('../models/Notification.model');
// const { getIO } = require('../config/socketio');
// //const logger = require('../utils/logger');
// // Replace with:
// const { logger } = require('../utils/logger');

// // @desc    Get all chats for current user
// // @route   GET /api/chats
// // @access  Private
// const getChats = async (req, res) => {
//   try {
//     const chats = await Chat.find({
//       participants: { $elemMatch: { userId: req.user._id } },
//       isActive: true
//     })
//       .populate('participants.userId', 'name email role profileImage')
//       .sort('-lastMessageAt');

//     // Add unread count for each chat
//     const chatsWithUnread = await Promise.all(chats.map(async (chat) => {
//       const unreadCount = chat.messages.filter(msg => 
//         !msg.isRead && 
//         msg.senderId.toString() !== req.user._id.toString()
//       ).length;
      
//       return {
//         ...chat.toObject(),
//         unreadCount
//       };
//     }));

//     res.json({ success: true, chats: chatsWithUnread });
//   } catch (error) {
//     logger.error('Get chats error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Get messages for a chat
// // @route   GET /api/chats/:chatId/messages
// // @access  Private
// const getMessages = async (req, res) => {
//   try {
//     const { chatId } = req.params;
//     const { page = 1, limit = 50 } = req.query;

//     const chat = await Chat.findById(chatId);
//     if (!chat) {
//       return res.status(404).json({ success: false, message: 'Chat not found' });
//     }

//     // Check if user is participant
//     const isParticipant = chat.participants.some(p => p.userId.toString() === req.user._id.toString());
//     if (!isParticipant) {
//       return res.status(403).json({ success: false, message: 'Unauthorized' });
//     }

//     const messages = chat.messages
//       .filter(msg => !msg.deletedFor?.includes(req.user._id))
//       .slice(-limit * page)
//       .slice(0, limit);

//     res.json({ success: true, messages: messages.reverse() });
//   } catch (error) {
//     logger.error('Get messages error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Send message
// // @route   POST /api/chats/send
// // @access  Private
// const sendMessage = async (req, res) => {
//   try {
//     const { receiverId, message, attachments, chatId } = req.body;
//     const io = getIO();

//     let chat;
    
//     if (chatId) {
//       chat = await Chat.findById(chatId);
//     } else {
//       // Find or create individual chat
//       chat = await Chat.findOne({
//         type: 'individual',
//         participants: { 
//           $all: [
//             { $elemMatch: { userId: req.user._id } },
//             { $elemMatch: { userId: receiverId } }
//           ]
//         }
//       });
//     }

//     if (!chat) {
//       // Create new chat
//       const participants = [
//         { userId: req.user._id, role: req.user.role, name: req.user.name },
//         { userId: receiverId, role: '', name: '' }
//       ];
      
//       // Get receiver details
//       const receiver = await User.findById(receiverId);
//       if (receiver) {
//         participants[1].role = receiver.role;
//         participants[1].name = receiver.name;
//       }

//       chat = await Chat.create({
//         participants,
//         type: 'individual',
//         messages: [],
//         lastMessageAt: new Date()
//       });
//     }

//     const newMessage = {
//       senderId: req.user._id,
//       message,
//       attachments: attachments || [],
//       createdAt: new Date()
//     };

//     chat.messages.push(newMessage);
//     chat.lastMessage = message;
//     chat.lastMessageAt = new Date();
//     await chat.save();

//     // Real-time delivery
//     io.to(`user_${receiverId}`).emit('new_message', {
//       chatId: chat._id,
//       message: newMessage,
//       sender: { id: req.user._id, name: req.user.name }
//     });

//     // Create notification for receiver
//     await Notification.create({
//       userId: receiverId,
//       title: `New message from ${req.user.name}`,
//       body: message.substring(0, 100),
//       type: 'system',
//       data: { chatId: chat._id }
//     });

//     res.status(201).json({ success: true, message: newMessage, chatId: chat._id });
//   } catch (error) {
//     logger.error('Send message error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Mark messages as read
// // @route   PUT /api/chats/:chatId/read
// // @access  Private
// const markAsRead = async (req, res) => {
//   try {
//     const { chatId } = req.params;
//     const chat = await Chat.findById(chatId);

//     if (!chat) {
//       return res.status(404).json({ success: false, message: 'Chat not found' });
//     }

//     chat.messages.forEach(msg => {
//       if (msg.senderId.toString() !== req.user._id.toString() && !msg.isRead) {
//         msg.isRead = true;
//         msg.readAt = new Date();
//       }
//     });

//     await chat.save();

//     res.json({ success: true });
//   } catch (error) {
//     logger.error('Mark as read error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Create group chat
// // @route   POST /api/chats/group
// // @access  Private
// const createGroupChat = async (req, res) => {
//   try {
//     const { groupName, participantIds } = req.body;

//     const participants = [
//       { userId: req.user._id, role: req.user.role, name: req.user.name }
//     ];

//     for (const id of participantIds) {
//       const user = await User.findById(id);
//       if (user) {
//         participants.push({
//           userId: user._id,
//           role: user.role,
//           name: user.name
//         });
//       }
//     }

//     const groupChat = await Chat.create({
//       participants,
//       type: 'group',
//       groupName,
//       groupAdmin: req.user._id,
//       messages: []
//     });

//     res.status(201).json({ success: true, chat: groupChat });
//   } catch (error) {
//     logger.error('Create group chat error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Add participant to group
// // @route   POST /api/chats/:chatId/participants
// // @access  Private
// const addParticipant = async (req, res) => {
//   try {
//     const { chatId } = req.params;
//     const { userId } = req.body;

//     const chat = await Chat.findById(chatId);
//     if (!chat) {
//       return res.status(404).json({ success: false, message: 'Chat not found' });
//     }

//     if (chat.groupAdmin.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ success: false, message: 'Only group admin can add participants' });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     chat.participants.push({
//       userId: user._id,
//       role: user.role,
//       name: user.name
//     });

//     await chat.save();

//     res.json({ success: true, chat });
//   } catch (error) {
//     logger.error('Add participant error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Remove participant from group
// // @route   DELETE /api/chats/:chatId/participants/:userId
// // @access  Private
// const removeParticipant = async (req, res) => {
//   try {
//     const { chatId, userId } = req.params;
//     const chat = await Chat.findById(chatId);

//     if (!chat) {
//       return res.status(404).json({ success: false, message: 'Chat not found' });
//     }

//     if (chat.groupAdmin.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ success: false, message: 'Only group admin can remove participants' });
//     }

//     chat.participants = chat.participants.filter(p => p.userId.toString() !== userId);
//     await chat.save();

//     res.json({ success: true, chat });
//   } catch (error) {
//     logger.error('Remove participant error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Get support chat for customer
// // @route   GET /api/chats/support
// // @access  Private/Customer
// const getSupportChat = async (req, res) => {
//   try {
//     // Find or create support chat
//     let supportChat = await Chat.findOne({
//       type: 'individual',
//       participants: { 
//         $elemMatch: { userId: req.user._id } 
//       }
//     }).populate('participants.userId', 'name email role');

//     if (!supportChat) {
//       // Find support agent (supervisor or manager)
//       const supportAgent = await User.findOne({ role: { $in: ['supervisor', 'manager'] }, isActive: true });
      
//       if (supportAgent) {
//         supportChat = await Chat.create({
//           participants: [
//             { userId: req.user._id, role: 'customer', name: req.user.name },
//             { userId: supportAgent._id, role: supportAgent.role, name: supportAgent.name }
//           ],
//           type: 'individual'
//         });
//       }
//     }

//     res.json({ success: true, chat: supportChat });
//   } catch (error) {
//     logger.error('Get support chat error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// module.exports = {
//   getChats,
//   getMessages,
//   sendMessage,
//   markAsRead,
//   createGroupChat,
//   addParticipant,
//   removeParticipant,
//   getSupportChat
// };



const Chat = require('../models/Chat.model');
const User = require('../models/User.model');
const Notification = require('../models/Notification.model');
const { getIO } = require('../config/socketio');
const { logger } = require('../utils/logger');

// @desc    Get all chats for current user
// @route   GET /api/chats
// @access  Private
const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: { $elemMatch: { userId: req.user._id } },
      isActive: true
    })
      .populate('participants.userId', 'name email role profileImage')
      .sort('-lastMessageAt');

    const chatsWithUnread = await Promise.all(chats.map(async (chat) => {
      const unreadCount = chat.messages.filter(msg => 
        !msg.isRead && 
        msg.senderId.toString() !== req.user._id.toString()
      ).length;
      
      return {
        ...chat.toObject(),
        unreadCount
      };
    }));

    res.json({ success: true, chats: chatsWithUnread });
  } catch (error) {
    logger.error('Get chats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get or create support chat for customer
// @route   GET /api/chats/support
// @access  Private/Customer
const getSupportChat = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Find existing support chat for this user
    let chat = await Chat.findOne({
      type: 'individual',
      participants: { $elemMatch: { userId: userId } }
    }).populate('participants.userId', 'name email role');
    
    if (!chat) {
      // Find a support agent (supervisor or manager)
      const supportAgent = await User.findOne({ 
        role: { $in: ['supervisor', 'manager'] }, 
        isActive: true 
      });
      
      if (!supportAgent) {
        return res.status(404).json({ 
          success: false, 
          message: 'No support agent available' 
        });
      }
      
      // Create new support chat
      chat = await Chat.create({
        participants: [
          { 
            userId: userId, 
            role: userRole, 
            name: req.user.name 
          },
          { 
            userId: supportAgent._id, 
            role: supportAgent.role, 
            name: supportAgent.name 
          }
        ],
        type: 'individual',
        messages: []
      });
      
      chat = await chat.populate('participants.userId', 'name email role');
    }
    
    res.json({ success: true, chat });
  } catch (error) {
    logger.error('Get support chat error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get messages for a chat
// @route   GET /api/chats/:chatId/messages
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    const isParticipant = chat.participants.some(p => p.userId.toString() === req.user._id.toString());
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const startIndex = Math.max(0, chat.messages.length - (page * limit));
    const endIndex = chat.messages.length - ((page - 1) * limit);
    const messages = chat.messages.slice(startIndex, endIndex).reverse();

    res.json({ success: true, messages });
  } catch (error) {
    logger.error('Get messages error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send message
// @route   POST /api/chats/send
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, message, attachments, chatId } = req.body;
    const io = getIO();

    let chat;
    
    if (chatId) {
      chat = await Chat.findById(chatId);
    } else {
      chat = await Chat.findOne({
        type: 'individual',
        participants: { 
          $all: [
            { $elemMatch: { userId: req.user._id } },
            { $elemMatch: { userId: receiverId } }
          ]
        }
      });
    }

    if (!chat) {
      const receiver = await User.findById(receiverId);
      chat = await Chat.create({
        participants: [
          { userId: req.user._id, role: req.user.role, name: req.user.name },
          { userId: receiverId, role: receiver.role, name: receiver.name }
        ],
        type: 'individual',
        messages: [],
        lastMessageAt: new Date()
      });
    }

    const newMessage = {
      senderId: req.user._id,
      message,
      attachments: attachments || [],
      createdAt: new Date(),
      isRead: false
    };

    chat.messages.push(newMessage);
    chat.lastMessage = message || (attachments?.length ? '📎 Attachment' : '');
    chat.lastMessageAt = new Date();
    await chat.save();

    const savedMessage = chat.messages[chat.messages.length - 1];

    io.to(`user_${receiverId}`).emit('new_message', {
      chatId: chat._id,
      message: savedMessage,
      sender: { id: req.user._id, name: req.user.name }
    });

    await Notification.create({
      userId: receiverId,
      title: `New message from ${req.user.name}`,
      body: message?.substring(0, 100) || 'New message',
      type: 'chat',
      referenceId: chat._id,
      referenceModel: 'Chat'
    });

    res.status(201).json({ success: true, message: savedMessage, chatId: chat._id });
  } catch (error) {
    logger.error('Send message error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chats/:chatId/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    let modified = false;
    chat.messages.forEach(msg => {
      if (msg.senderId.toString() !== req.user._id.toString() && !msg.isRead) {
        msg.isRead = true;
        msg.readAt = new Date();
        modified = true;
      }
    });

    if (modified) {
      await chat.save();
    }

    res.json({ success: true });
  } catch (error) {
    logger.error('Mark as read error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create group chat
// @route   POST /api/chats/group
// @access  Private
const createGroupChat = async (req, res) => {
  try {
    const { groupName, participantIds } = req.body;

    const participants = [
      { userId: req.user._id, role: req.user.role, name: req.user.name }
    ];

    for (const id of participantIds) {
      const user = await User.findById(id);
      if (user) {
        participants.push({
          userId: user._id,
          role: user.role,
          name: user.name
        });
      }
    }

    const groupChat = await Chat.create({
      participants,
      type: 'group',
      groupName,
      groupAdmin: req.user._id,
      messages: []
    });

    res.status(201).json({ success: true, chat: groupChat });
  } catch (error) {
    logger.error('Create group chat error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add participant to group
// @route   POST /api/chats/:chatId/participants
// @access  Private
const addParticipant = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    if (chat.groupAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only group admin can add participants' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    chat.participants.push({
      userId: user._id,
      role: user.role,
      name: user.name
    });

    await chat.save();

    res.json({ success: true, chat });
  } catch (error) {
    logger.error('Add participant error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove participant from group
// @route   DELETE /api/chats/:chatId/participants/:userId
// @access  Private
const removeParticipant = async (req, res) => {
  try {
    const { chatId, userId } = req.params;
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    if (chat.groupAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only group admin can remove participants' });
    }

    chat.participants = chat.participants.filter(p => p.userId.toString() !== userId);
    await chat.save();

    res.json({ success: true, chat });
  } catch (error) {
    logger.error('Remove participant error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getChats,
  getMessages,
  sendMessage,
  markAsRead,
  createGroupChat,
  addParticipant,
  removeParticipant,
  getSupportChat
};