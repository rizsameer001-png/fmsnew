const mongoose = require('mongoose');

const slaPolicySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  serviceType: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    required: true,
  },
  responseTime: {
    type: Number, // in minutes
    required: true,
  },
  resolutionTime: {
    type: Number, // in minutes
    required: true,
  },
  escalationMatrix: [{
    level: Number,
    afterMinutes: Number,
    escalateTo: String, // role name
    notificationTemplate: String,
  }],
  workingHours: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '18:00' },
    workingDays: [{ type: Number }], // 0-6
    holidays: [Date],
  },
  penaltyAmount: {
    type: Number,
    default: 0,
  },
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

slaPolicySchema.index({ serviceType: 1, priority: 1 }, { unique: true });
slaPolicySchema.index({ isActive: 1 });

module.exports = mongoose.model('SLAPolicy', slaPolicySchema);