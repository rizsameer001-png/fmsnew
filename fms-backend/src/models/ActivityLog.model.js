const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
  },
  userRole: {
    type: String,
  },
  action: {
    type: String,
    required: true,
  },
  entityType: {
    type: String,
    enum: ['user', 'building', 'complaint', 'task', 'attendance', 'invoice', 'payment', 'service', 'report', 'setting', 'other'],
    required: true,
  },
  entityId: {
    type: String,
  },
  details: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  oldData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  newData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success',
  },
  errorMessage: {
    type: String,
  },
  duration: {
    type: Number, // in milliseconds
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: { expires: '90d' }, // Auto-delete after 90 days
  },
}, {
  timestamps: true,
});

// Indexes for efficient querying
activityLogSchema.index({ userId: 1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ entityType: 1 });
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ userRole: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);