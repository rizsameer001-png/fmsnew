const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintNumber: {
    type: String,
    required: true,
    unique: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  buildingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Building',
    required: true,
  },
  floorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Floor',
  },
  serviceType: {
    type: String,
    enum: ['cleaning', 'electrical', 'plumbing', 'security', 'waste', 'landscaping', 'catering', 'hvac', 'other'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected', 'escalated'],
    default: 'pending',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  images: [{
    type: String,
  }],
  documents: [{
    name: String,
    url: String,
  }],
  slaDeadline: {
    type: Date,
  },
  slaBreached: {
    type: Boolean,
    default: false,
  },
  resolution: {
    description: String,
    resolvedAt: Date,
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    images: [String],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  feedback: {
    type: String,
  },
  escalationLevel: {
    type: Number,
    default: 0,
  },
  escalationHistory: [{
    escalatedAt: { type: Date, default: Date.now },
    escalatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    fromRole: String,
    toRole: String,
  }],
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

// Generate complaint number before saving
complaintSchema.pre('save', async function(next) {
  if (!this.complaintNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await mongoose.model('Complaint').countDocuments();
    this.complaintNumber = `CMP/${year}${month}/${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Indexes
complaintSchema.index({ complaintNumber: 1 });
complaintSchema.index({ customerId: 1 });
complaintSchema.index({ assignedTo: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ priority: 1 });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ slaDeadline: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);