const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  shiftName: {
    type: String,
    required: true,
  },
  shiftType: {
    type: String,
    enum: ['morning', 'evening', 'night', 'rotational', 'flexible'],
    required: true,
  },
  startTime: {
    type: String,
    required: true, // Format: "09:00"
  },
  endTime: {
    type: String,
    required: true, // Format: "17:00"
  },
  breakDuration: {
    type: Number, // in minutes
    default: 60,
  },
  workingDays: [{
    type: Number, // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  }],
  gracePeriod: {
    type: Number, // in minutes
    default: 15,
  },
  overtimeEnabled: {
    type: Boolean,
    default: false,
  },
  overtimeRate: {
    type: Number, // multiplier (e.g., 1.5 for 1.5x)
    default: 1.5,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  effectiveFrom: {
    type: Date,
    required: true,
  },
  effectiveTo: {
    type: Date,
  },
  notes: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
shiftSchema.index({ userId: 1, isActive: 1 });
shiftSchema.index({ shiftType: 1 });
shiftSchema.index({ effectiveFrom: -1 });

module.exports = mongoose.model('Shift', shiftSchema);