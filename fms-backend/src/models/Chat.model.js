const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number,
  }],
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
  deletedFor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const chatSchema = new mongoose.Schema({
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: String,
    name: String,
  }],
  type: {
    type: String,
    enum: ['individual', 'group'],
    default: 'individual',
  },
  groupName: {
    type: String,
  },
  groupIcon: {
    type: String,
  },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  lastMessage: {
    type: String,
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
  messages: [messageSchema],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes
chatSchema.index({ participants: 1 });
chatSchema.index({ type: 1 });
chatSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);