const mongoose = require('mongoose');

const approvalSchema = new mongoose.Schema({
  approvalNumber: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ['leave', 'overtime', 'complaint_closure', 'expense', 'purchase'],
    required: true,
  },
  requestedBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: String,
    role: String,
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  details: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    required: true,
  },
  currentLevel: {
    type: Number,
    default: 1,
  },
  approvals: [{
    level: Number,
    approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approverName: String,
    approverRole: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    comments: String,
    approvedAt: Date,
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'partially_approved'],
    default: 'pending',
  },
  finalComments: {
    type: String,
  },
  referenceId: {
    type: String,
  },
  referenceModel: {
    type: String,
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

// Generate approval number
approvalSchema.pre('save', async function(next) {
  if (!this.approvalNumber) {
    const count = await mongoose.model('Approval').countDocuments();
    this.approvalNumber = `APR/${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Indexes
approvalSchema.index({ approvalNumber: 1 });
approvalSchema.index({ 'requestedBy.userId': 1 });
approvalSchema.index({ status: 1 });
approvalSchema.index({ type: 1 });
approvalSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Approval', approvalSchema);