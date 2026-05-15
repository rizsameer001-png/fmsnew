const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    unique: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['cleaning', 'security', 'waste_management', 'plumbing', 'electrical', 'landscaping', 'catering', 'hospitality', 'reception', 'hvac'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: null,
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  gstRate: {
    type: Number,
    default: 18,
  },
  slaResponseTime: {
    type: Number,
    required: true,
  },
  slaResolutionTime: {
    type: Number,
    required: true,
  },
  requiredSkills: [{
    type: String,
  }],
  checklist: [{
    taskName: String,
    isRequired: { type: Boolean, default: true },
  }],
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

serviceSchema.index({ name: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ isActive: 1 });

module.exports = mongoose.model('Service', serviceSchema);